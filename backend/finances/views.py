from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.shortcuts import render
from .models import (
    Expense, Income, Budget, ModelTemplate, FinancialModel, Scenario,
    SensitivityAnalysis, AIInsight, CustomKPI, KPICalculation, Report,
    Consolidation, ConsolidationEntity, TaxCalculation
)
from .serializers import (
    ExpenseSerializer, IncomeSerializer, BudgetSerializer,
    ModelTemplateSerializer, FinancialModelSerializer, FinancialModelCreateSerializer,
    ScenarioSerializer, SensitivityAnalysisSerializer, AIInsightSerializer,
    CustomKPISerializer, KPICalculationSerializer, ReportSerializer,
    ConsolidationSerializer, ConsolidationEntitySerializer, TaxCalculationSerializer
)
from rest_framework.decorators import api_view
from django.http import JsonResponse, Http404
import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'tax')
COUNTRIES_FILE = os.path.join(DATA_DIR, 'countries.json')


def _load_countries():
    try:
        with open(COUNTRIES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing expenses
    """
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

    def perform_create(self, serializer):
        """Update budget spent amount when creating expense"""
        expense = serializer.save()
        # Update budget if category matches
        try:
            budget = Budget.objects.get(category=expense.category)
            budget.spent += expense.amount
            budget.save()
        except Budget.DoesNotExist:
            pass

    def perform_destroy(self, instance):
        """Update budget spent amount when deleting expense"""
        # Update budget if category matches
        try:
            budget = Budget.objects.get(category=instance.category)
            budget.spent = max(0, budget.spent - instance.amount)
            budget.save()
        except Budget.DoesNotExist:
            pass
        instance.delete()

    @action(detail=False, methods=['get'])
    def total(self, request):
        """Get total expenses"""
        total = self.queryset.aggregate(Sum('amount'))['amount__sum'] or 0
        return Response({'total': total})

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get expenses grouped by category"""
        from django.db.models import Sum
        expenses_by_category = (
            self.queryset.values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        return Response(expenses_by_category)


class IncomeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing income
    """
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer

    @action(detail=False, methods=['get'])
    def total(self, request):
        """Get total income"""
        total = self.queryset.aggregate(Sum('amount'))['amount__sum'] or 0
        return Response({'total': total})


class BudgetViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing budgets
    """
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get budget summary"""
        budgets = self.queryset.all()
        total_limit = sum(b.limit for b in budgets)
        total_spent = sum(b.spent for b in budgets)
        return Response({
            'total_limit': total_limit,
            'total_spent': total_spent,
            'total_remaining': total_limit - total_spent,
            'count': budgets.count()
        })


@api_view(['GET'])
def list_countries(request):
    """Return list of tax countries from data file"""
    countries = _load_countries()
    return JsonResponse(countries, safe=False)


@api_view(['GET'])
def get_country(request, code):
    """Return single country by code (ISO alpha-2)"""
    countries = _load_countries()
    code_upper = code.upper()
    for c in countries:
        if c.get('code', '').upper() == code_upper:
            return JsonResponse(c, safe=False)
    raise Http404('Country not found')


def landing_page(request):
    """
    Landing page for the AI Financial Modeling Integration System Backend
    """
    context = {
        'title': 'AI Financial Modeling Integration System',
        'subtitle': 'Enterprise-Grade Financial Analysis Platform',
        'version': '1.0.0',
        'description': 'Complete backend API for advanced financial modeling, AI-driven insights, and enterprise compliance.',
        'features': [
            {
                'title': 'Financial Modeling Engine',
                'description': 'DCF, comparable companies, and merger analysis with 40+ country tax libraries',
                'icon': '💰',
                'endpoints': ['/api/models/', '/api/tax/countries/']
            },
            {
                'title': 'AI & Analytics',
                'description': 'Pattern recognition, anomaly detection, and predictive analytics',
                'icon': '🤖',
                'endpoints': ['/api/ai/insights/', '/api/analytics/']
            },
            {
                'title': 'Scenario Planning',
                'description': 'Best/base/worst case analysis with sensitivity testing',
                'icon': '🎯',
                'endpoints': ['/api/scenarios/', '/api/sensitivity/']
            },
            {
                'title': 'Enterprise Features',
                'description': 'Multi-tenant architecture, audit trails, and compliance',
                'icon': '🏢',
                'endpoints': ['/api/organizations/', '/api/audit-logs/']
            },
            {
                'title': 'Reporting & Export',
                'description': 'Professional reports with PDF/HTML/JSON export capabilities',
                'icon': '📊',
                'endpoints': ['/api/reports/', '/api/export/']
            },
            {
                'title': 'Tax & Compliance',
                'description': 'Multi-country tax calculations and regulatory compliance',
                'icon': '⚖️',
                'endpoints': ['/api/tax/', '/api/compliance/']
            }
        ],
        'api_stats': {
            'total_endpoints': 25,
            'supported_countries': 40,
            'calculation_engines': 6,
            'ai_models': 3
        },
        'quick_links': [
            {'name': 'API Documentation', 'url': '/api/docs/', 'icon': '📚'},
            {'name': 'Admin Panel', 'url': '/admin/', 'icon': '⚙️'},
            {'name': 'Health Check', 'url': '/api/health/', 'icon': '❤️'},
            {'name': 'Frontend App', 'url': 'http://localhost:3000', 'icon': '🌐'}
        ],
        'system_info': {
            'backend': 'Django REST Framework',
            'database': 'SQLite (Development)',
            'frontend': 'React 18',
            'deployment': 'Docker Ready'
        }
    }

    return render(request, 'landing_page.html', context)


# ============ FINANCIAL MODELING VIEWSETS ============

class ModelTemplateViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing financial model templates
    """
    queryset = ModelTemplate.objects.all()
    serializer_class = ModelTemplateSerializer

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get templates filtered by type"""
        template_type = request.query_params.get('type')
        if template_type:
            templates = self.queryset.filter(template_type=template_type, is_active=True)
        else:
            templates = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(templates, many=True)
        return Response(serializer.data)


class FinancialModelViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing financial models
    """
    queryset = FinancialModel.objects.all()
    serializer_class = FinancialModelSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return FinancialModelCreateSerializer
        return FinancialModelSerializer

    @action(detail=True, methods=['post'])
    def calculate(self, request, pk=None):
        """Trigger calculation for a financial model"""
        model = self.get_object()
        model.status = 'calculating'
        model.save()

        # TODO: Implement actual calculation logic based on model type
        # For now, just mark as completed
        model.status = 'completed'
        model.results = {'message': 'Calculation completed successfully'}
        model.save()

        serializer = self.get_serializer(model)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def scenarios(self, request, pk=None):
        """Get scenarios for a financial model"""
        model = self.get_object()
        scenarios = model.scenarios.all()
        serializer = ScenarioSerializer(scenarios, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def insights(self, request, pk=None):
        """Get AI insights for a financial model"""
        model = self.get_object()
        insights = model.ai_insights.all()
        serializer = AIInsightSerializer(insights, many=True)
        return Response(serializer.data)


class ScenarioViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing scenarios
    """
    queryset = Scenario.objects.all()
    serializer_class = ScenarioSerializer

    @action(detail=True, methods=['post'])
    def run_scenario(self, request, pk=None):
        """Run scenario analysis"""
        scenario = self.get_object()
        # TODO: Implement scenario calculation logic
        scenario.results = {'message': 'Scenario analysis completed'}
        scenario.save()
        serializer = self.get_serializer(scenario)
        return Response(serializer.data)


class SensitivityAnalysisViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing sensitivity analyses
    """
    queryset = SensitivityAnalysis.objects.all()
    serializer_class = SensitivityAnalysisSerializer

    @action(detail=True, methods=['post'])
    def run_analysis(self, request, pk=None):
        """Run sensitivity analysis"""
        analysis = self.get_object()
        # TODO: Implement sensitivity analysis logic
        analysis.results = {'message': 'Sensitivity analysis completed'}
        analysis.save()
        serializer = self.get_serializer(analysis)
        return Response(serializer.data)


class AIInsightViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing AI insights
    """
    queryset = AIInsight.objects.all()
    serializer_class = AIInsightSerializer

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread insights"""
        insights = self.queryset.filter(is_read=False)
        serializer = self.get_serializer(insights, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark insight as read"""
        insight = self.get_object()
        insight.is_read = True
        insight.save()
        serializer = self.get_serializer(insight)
        return Response(serializer.data)


class CustomKPIViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing custom KPIs
    """
    queryset = CustomKPI.objects.all()
    serializer_class = CustomKPISerializer

    @action(detail=True, methods=['get'])
    def calculations(self, request, pk=None):
        """Get KPI calculations"""
        kpi = self.get_object()
        calculations = kpi.calculations.all()
        serializer = KPICalculationSerializer(calculations, many=True)
        return Response(serializer.data)


class KPICalculationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing KPI calculations
    """
    queryset = KPICalculation.objects.all()
    serializer_class = KPICalculationSerializer


class ReportViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing reports
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """Generate report"""
        report = self.get_object()
        # TODO: Implement report generation logic
        report.content = {'message': 'Report generated successfully'}
        report.save()
        serializer = self.get_serializer(report)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download report file"""
        report = self.get_object()
        # TODO: Implement file download logic
        return Response({'message': 'Download functionality not implemented yet'})


class ConsolidationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing consolidations
    """
    queryset = Consolidation.objects.all()
    serializer_class = ConsolidationSerializer

    @action(detail=True, methods=['post'])
    def run_consolidation(self, request, pk=None):
        """Run consolidation process"""
        consolidation = self.get_object()
        consolidation.status = 'processing'
        consolidation.save()

        # TODO: Implement consolidation logic
        consolidation.status = 'completed'
        consolidation.consolidated_pnl = {'message': 'Consolidation completed'}
        consolidation.save()

        serializer = self.get_serializer(consolidation)
        return Response(serializer.data)


class ConsolidationEntityViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing consolidation entities
    """
    queryset = ConsolidationEntity.objects.all()
    serializer_class = ConsolidationEntitySerializer


class TaxCalculationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing tax calculations
    """
    queryset = TaxCalculation.objects.all()
    serializer_class = TaxCalculationSerializer

    @action(detail=False, methods=['post'])
    def calculate(self, request):
        """Calculate tax for given parameters"""
        # TODO: Implement tax calculation logic
        return Response({'message': 'Tax calculation completed'})
