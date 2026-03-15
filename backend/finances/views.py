from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.exceptions import ValidationError
from django.db.models import Q, Sum
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.utils import timezone
from .models import (
    Expense, Income, Budget, ModelTemplate, FinancialModel, Scenario,
    SensitivityAnalysis, AIInsight, CustomKPI, KPICalculation, Report,
    Consolidation, ConsolidationEntity, TaxCalculation, Entity, Organization, TeamMember
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
import csv
from io import BytesIO
from decimal import Decimal

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'tax')
COUNTRIES_FILE = os.path.join(DATA_DIR, 'countries.json')


def _load_countries():
    try:
        with open(COUNTRIES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def _accessible_organizations_queryset(user):
    return Organization.objects.filter(
        Q(owner=user) | Q(team_members__user=user, team_members__is_active=True)
    ).distinct()


def _accessible_entities_queryset(user, organization=None):
    base_qs = Entity.objects.filter(organization__in=_accessible_organizations_queryset(user)).distinct()
    if organization is not None:
        base_qs = base_qs.filter(organization=organization)

    membership_qs = TeamMember.objects.filter(user=user, is_active=True)
    if organization is not None:
        membership_qs = membership_qs.filter(organization=organization)

    scoped_entity_ids = list(
        membership_qs.filter(scoped_entities__isnull=False).values_list('scoped_entities__id', flat=True).distinct()
    )
    owner_org_ids = set(Organization.objects.filter(owner=user).values_list('id', flat=True))

    if not scoped_entity_ids:
        return base_qs

    return base_qs.filter(Q(organization_id__in=owner_org_ids) | Q(id__in=scoped_entity_ids)).distinct()


def _get_accessible_entity_or_404(user, entity_id, organization=None):
    return get_object_or_404(_accessible_entities_queryset(user, organization), id=entity_id)


def _filter_queryset_by_entity_scope(queryset, user, entity_relation='entity'):
    relation_prefix = f'{entity_relation}__'
    filters = {f'{relation_prefix}in': _accessible_entities_queryset(user)}
    return queryset.filter(**filters).distinct()


def _accessible_financial_models_queryset(user):
    return FinancialModel.objects.filter(
        Q(user=user) | Q(organization__in=_accessible_organizations_queryset(user))
    ).distinct()


def _accessible_consolidations_queryset(user):
    accessible_orgs = _accessible_organizations_queryset(user)
    qs = Consolidation.objects.filter(organization__in=accessible_orgs).distinct()
    memberships = TeamMember.objects.filter(user=user, is_active=True).prefetch_related('scoped_entities')
    restricted_org_ids = [membership.organization_id for membership in memberships if membership.scoped_entities.exists()]

    if not restricted_org_ids:
        return qs

    accessible_entity_ids = _accessible_entities_queryset(user).values_list('id', flat=True)
    inaccessible_entities = Entity.objects.filter(organization_id__in=restricted_org_ids).exclude(id__in=accessible_entity_ids)

    unrestricted_qs = qs.exclude(organization_id__in=restricted_org_ids)
    restricted_qs = qs.filter(organization_id__in=restricted_org_ids).exclude(entities__entity__in=inaccessible_entities)
    return (unrestricted_qs | restricted_qs).distinct()


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing expenses
    """
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        """Filter expenses by entity if entity_id is provided"""
        queryset = Expense.objects.all()
        entity_id = self.request.query_params.get('entity_id')
        if entity_id:
            queryset = _filter_queryset_by_entity_scope(queryset, self.request.user).filter(entity_id=entity_id)
        else:
            # If no entity specified, return user's personal expenses
            queryset = queryset.filter(user=self.request.user, entity__isnull=True)
        return queryset

    def perform_create(self, serializer):
        """Create expense and associate with entity or user"""
        entity_id = self.request.data.get('entity_id')
        if entity_id:
            # Associate with entity
            entity = _get_accessible_entity_or_404(self.request.user, entity_id)
            expense = serializer.save(entity=entity)
        else:
            # Associate with user (personal expense)
            expense = serializer.save(user=self.request.user)
        
        # Update budget if category matches (entity-specific or personal)
        try:
            budget_filter = {'category': expense.category}
            if expense.entity:
                budget_filter['entity'] = expense.entity
            else:
                budget_filter['user'] = expense.user
                budget_filter['entity__isnull'] = True
            
            budget = Budget.objects.get(**budget_filter)
            budget.spent += expense.amount
            budget.save()
        except Budget.DoesNotExist:
            pass

    def perform_destroy(self, instance):
        """Update budget spent amount when deleting expense"""
        # Update budget if category matches
        try:
            budget_filter = {'category': instance.category}
            if instance.entity:
                budget_filter['entity'] = instance.entity
            else:
                budget_filter['user'] = instance.user
                budget_filter['entity__isnull'] = True

            budget = Budget.objects.get(**budget_filter)
            budget.spent = max(0, budget.spent - instance.amount)
            budget.save()
        except Budget.DoesNotExist:
            pass
        instance.delete()

    @action(detail=False, methods=['get'])
    def total(self, request):
        """Get total expenses"""
        total = self.get_queryset().aggregate(Sum('amount'))['amount__sum'] or 0
        return Response({'total': total})

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get expenses grouped by category"""
        expenses_by_category = (
            self.get_queryset().values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        return Response(expenses_by_category)


class IncomeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing income
    """
    serializer_class = IncomeSerializer

    def get_queryset(self):
        """Filter income by entity if entity_id is provided"""
        queryset = Income.objects.all()
        entity_id = self.request.query_params.get('entity_id')
        if entity_id:
            queryset = _filter_queryset_by_entity_scope(queryset, self.request.user).filter(entity_id=entity_id)
        else:
            # If no entity specified, return user's personal income
            queryset = queryset.filter(user=self.request.user, entity__isnull=True)
        return queryset

    def perform_create(self, serializer):
        """Create income and associate with entity or user"""
        entity_id = self.request.data.get('entity_id')
        if entity_id:
            # Associate with entity
            entity = _get_accessible_entity_or_404(self.request.user, entity_id)
            serializer.save(entity=entity)
        else:
            # Associate with user (personal income)
            serializer.save(user=self.request.user)


class BudgetViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing budgets
    """
    serializer_class = BudgetSerializer

    def get_queryset(self):
        """Filter budgets by entity if entity_id is provided"""
        queryset = Budget.objects.all()
        entity_id = self.request.query_params.get('entity_id')
        if entity_id:
            queryset = _filter_queryset_by_entity_scope(queryset, self.request.user).filter(entity_id=entity_id)
        else:
            # If no entity specified, return user's personal budgets
            queryset = queryset.filter(user=self.request.user, entity__isnull=True)
        return queryset

    def perform_create(self, serializer):
        """Create budget and associate with entity or user"""
        entity_id = self.request.data.get('entity_id')
        if entity_id:
            # Associate with entity
            entity = _get_accessible_entity_or_404(self.request.user, entity_id)
            serializer.save(entity=entity)
        else:
            # Associate with user (personal budget)
            serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get budget summary"""
        budgets = self.get_queryset()
        total_limit = sum(b.limit for b in budgets)
        total_spent = sum(b.spent for b in budgets)
        return Response({
            'total_limit': total_limit,
            'total_spent': total_spent,
            'total_remaining': total_limit - total_spent,
            'count': budgets.count()
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def list_countries(request):
    """Return list of tax countries from data file"""
    countries = _load_countries()
    return JsonResponse(countries, safe=False)


@api_view(['GET'])
@permission_classes([AllowAny])
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

    def get_queryset(self):
        return _accessible_financial_models_queryset(self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return FinancialModelCreateSerializer
        return FinancialModelSerializer

    def perform_create(self, serializer):
        organization = None
        organization_id = self.request.data.get('organization')
        if organization_id:
            organization = get_object_or_404(_accessible_organizations_queryset(self.request.user), id=organization_id)
        serializer.save(user=self.request.user, organization=organization)

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

    def get_queryset(self):
        return Scenario.objects.filter(financial_model__in=_accessible_financial_models_queryset(self.request.user)).distinct()

    def perform_create(self, serializer):
        financial_model = get_object_or_404(_accessible_financial_models_queryset(self.request.user), id=self.request.data.get('financial_model'))
        serializer.save(financial_model=financial_model)

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

    def get_queryset(self):
        return SensitivityAnalysis.objects.filter(financial_model__in=_accessible_financial_models_queryset(self.request.user)).distinct()

    def perform_create(self, serializer):
        financial_model = get_object_or_404(_accessible_financial_models_queryset(self.request.user), id=self.request.data.get('financial_model'))
        serializer.save(financial_model=financial_model)

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

    def get_queryset(self):
        return AIInsight.objects.filter(financial_model__in=_accessible_financial_models_queryset(self.request.user)).distinct()

    def perform_create(self, serializer):
        financial_model = get_object_or_404(_accessible_financial_models_queryset(self.request.user), id=self.request.data.get('financial_model'))
        serializer.save(financial_model=financial_model)

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread insights"""
        insights = self.get_queryset().filter(is_read=False)
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

    def get_queryset(self):
        return CustomKPI.objects.filter(organization__in=_accessible_organizations_queryset(self.request.user)).distinct()

    def perform_create(self, serializer):
        organization = get_object_or_404(_accessible_organizations_queryset(self.request.user), id=self.request.data.get('organization'))
        serializer.save(organization=organization)

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

    def get_queryset(self):
        accessible_models = _accessible_financial_models_queryset(self.request.user)
        return KPICalculation.objects.filter(
            financial_model__in=accessible_models,
            kpi__organization__in=_accessible_organizations_queryset(self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        accessible_models = _accessible_financial_models_queryset(self.request.user)
        financial_model = get_object_or_404(accessible_models, id=self.request.data.get('financial_model'))
        kpi = get_object_or_404(CustomKPI.objects.filter(organization__in=_accessible_organizations_queryset(self.request.user)), id=self.request.data.get('kpi'))
        serializer.save(financial_model=financial_model, kpi=kpi)


class ReportViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing reports
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def get_queryset(self):
        return Report.objects.filter(financial_model__in=_accessible_financial_models_queryset(self.request.user)).distinct()

    def perform_create(self, serializer):
        financial_model = get_object_or_404(_accessible_financial_models_queryset(self.request.user), id=self.request.data.get('financial_model'))
        serializer.save(financial_model=financial_model, generated_by=self.request.user)

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """Generate a structured report payload from the financial model.

        This populates the Report.content, summary and recommendations fields
        based on the associated FinancialModel's stored results and metrics.
        """
        report = self.get_object()
        financial_model = report.financial_model

        metrics = {
            'enterprise_value': financial_model.enterprise_value,
            'equity_value': financial_model.equity_value,
            'irr': financial_model.irr,
            'moic': financial_model.moic,
        }

        content = {
            'model_name': financial_model.name,
            'model_type': financial_model.model_type,
            'status': financial_model.status,
            'metrics': {k: (str(v) if v is not None else None) for k, v in metrics.items()},
            'results': financial_model.results or {},
            'generated_at': timezone.now().isoformat(),
        }

        # Very simple narrative summary and recommendations
        irr = financial_model.irr or 0
        if irr and irr >= 0.20:
            recommendation = 'Strong return profile; consider prioritizing this opportunity.'
        elif irr and irr >= 0.10:
            recommendation = 'Attractive return; proceed with standard risk review.'
        elif irr and irr > 0:
            recommendation = 'Modest return; ensure strategic fit before proceeding.'
        else:
            recommendation = 'Return profile is weak or unavailable; investigate drivers before proceeding.'

        report.content = content
        report.summary = f"Automated summary for model '{financial_model.name}' with IRR {metrics['irr']} and enterprise value {metrics['enterprise_value']}."
        report.recommendations = {
            'primary': recommendation,
            'notes': ['This narrative is auto-generated from stored model metrics.'],
        }
        report.generated_by = request.user if getattr(request, 'user', None) and request.user.is_authenticated else None
        report.save()

        serializer = self.get_serializer(report)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download the report in the requested export format.

        Currently supports JSON and CSV responses generated on the fly.
        """
        report = self.get_object()

        # Ensure content exists
        if not report.content:
            return Response({'error': 'Report has no generated content. Please call the generate action first.'}, status=400)

        export_format = (report.export_format or 'json').lower()

        if export_format == 'json':
            return Response(report.content)

        if export_format in ('csv', 'xlsx'):
            # Basic CSV export that can be opened in Excel
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="report_{report.id}.csv"'

            writer = csv.writer(response)
            writer.writerow(['Title', 'Model Name', 'Model Type', 'IRR', 'MOIC', 'Enterprise Value', 'Equity Value'])

            content = report.content or {}
            metrics = content.get('metrics', {})
            writer.writerow([
                report.title,
                content.get('model_name'),
                content.get('model_type'),
                metrics.get('irr'),
                metrics.get('moic'),
                metrics.get('enterprise_value'),
                metrics.get('equity_value'),
            ])

            return response

        if export_format == 'pdf':
            # Simple PDF export using reportlab
            try:
                from reportlab.lib.pagesizes import A4
                from reportlab.pdfgen import canvas
            except ImportError:
                return Response({'error': 'PDF export is not available (reportlab not installed).'}, status=500)

            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            y = height - 50
            p.setFont("Helvetica-Bold", 14)
            p.drawString(50, y, report.title)
            y -= 25

            content = report.content or {}
            metrics = content.get('metrics', {})
            model_name = content.get('model_name', '')
            model_type = content.get('model_type', '')

            p.setFont("Helvetica", 11)
            lines = [
                f"Model: {model_name} ({model_type})",
                f"IRR: {metrics.get('irr')}",
                f"MOIC: {metrics.get('moic')}",
                f"Enterprise Value: {metrics.get('enterprise_value')}",
                f"Equity Value: {metrics.get('equity_value')}",
                "",
                "Summary:",
                report.summary or "(no summary)",
            ]

            for line in lines:
                if y < 50:
                    p.showPage()
                    y = height - 50
                    p.setFont("Helvetica", 11)
                p.drawString(50, y, str(line))
                y -= 18

            p.showPage()
            p.save()

            buffer.seek(0)
            pdf_response = HttpResponse(buffer, content_type='application/pdf')
            pdf_response['Content-Disposition'] = f'attachment; filename="report_{report.id}.pdf"'
            return pdf_response

        # Fallback for unsupported formats
        return Response({'error': f'Export format "{export_format}" is not supported yet.'}, status=400)


class ConsolidationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing consolidations
    """
    queryset = Consolidation.objects.all()
    serializer_class = ConsolidationSerializer

    def get_queryset(self):
        return _accessible_consolidations_queryset(self.request.user)

    def perform_create(self, serializer):
        organization = get_object_or_404(_accessible_organizations_queryset(self.request.user), id=self.request.data.get('organization'))
        serializer.save(organization=organization)

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

    def get_queryset(self):
        return ConsolidationEntity.objects.filter(
            consolidation__in=_accessible_consolidations_queryset(self.request.user),
            entity__in=_accessible_entities_queryset(self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        consolidation = get_object_or_404(_accessible_consolidations_queryset(self.request.user), id=self.request.data.get('consolidation'))
        entity = _get_accessible_entity_or_404(self.request.user, self.request.data.get('entity'))
        if consolidation.organization_id != entity.organization_id:
            raise ValidationError({'entity': 'Consolidation and entity must belong to the same organization.'})
        serializer.save(consolidation=consolidation, entity=entity)


class TaxCalculationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing tax calculations
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TaxCalculationSerializer

    def get_queryset(self):
        qs = _filter_queryset_by_entity_scope(TaxCalculation.objects.all(), self.request.user)
        entity_id = self.request.query_params.get('entity_id') or self.request.query_params.get('entity')
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs

    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity') or self.request.data.get('entity_id')
        entity = _get_accessible_entity_or_404(self.request.user, entity_id)
        serializer.save(entity=entity)

    @action(detail=False, methods=['post'])
    def calculate(self, request):
        """Calculate tax for given parameters"""
        entity_id = request.data.get('entity') or request.data.get('entity_id')
        entity = _get_accessible_entity_or_404(request.user, entity_id)

        tax_year = int(request.data.get('tax_year'))
        calculation_type = request.data.get('calculation_type')
        jurisdiction = request.data.get('jurisdiction')

        taxable_income = Decimal(str(request.data.get('taxable_income', '0')))
        raw_rate = Decimal(str(request.data.get('tax_rate', '0')))
        rate = raw_rate / Decimal('100') if raw_rate > 1 else raw_rate

        deductions = request.data.get('deductions') or {}
        credits = request.data.get('credits') or {}

        def _sum_numeric(d):
            total = Decimal('0')
            if isinstance(d, dict):
                for v in d.values():
                    try:
                        total += Decimal(str(v))
                    except Exception:
                        continue
            return total

        deductions_total = _sum_numeric(deductions)
        credits_total = _sum_numeric(credits)

        adjusted_income = taxable_income - deductions_total
        if adjusted_income < 0:
            adjusted_income = Decimal('0')

        calculated_tax = (adjusted_income * rate) - credits_total
        if calculated_tax < 0:
            calculated_tax = Decimal('0')

        effective_rate = Decimal('0')
        if taxable_income > 0:
            effective_rate = calculated_tax / taxable_income

        breakdown = {
            'taxable_income': str(taxable_income),
            'deductions_total': str(deductions_total),
            'credits_total': str(credits_total),
            'adjusted_income': str(adjusted_income),
            'rate_used': str(rate),
        }

        obj, _created = TaxCalculation.objects.update_or_create(
            entity=entity,
            tax_year=tax_year,
            calculation_type=calculation_type,
            jurisdiction=jurisdiction,
            defaults={
                'taxable_income': taxable_income,
                'tax_rate': rate,
                'deductions': deductions,
                'credits': credits,
                'calculated_tax': calculated_tax,
                'effective_rate': effective_rate,
                'breakdown': breakdown,
            },
        )

        return Response(self.get_serializer(obj).data)
