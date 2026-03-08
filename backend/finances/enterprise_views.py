"""
Enterprise-specific viewsets and views
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q, Count
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
from collections import defaultdict
from decimal import Decimal

from django.utils import timezone

from .models import (
    Organization, Entity, TeamMember, Role, Permission, TaxExposure,
    TaxProfile, ComplianceDeadline, CashflowForecast, AuditLog, EntityDepartment,
    EntityRole, EntityStaff, BankAccount, Wallet, ComplianceDocument,
    BookkeepingCategory, BookkeepingAccount, Transaction, BookkeepingAuditLog,
    RecurringTransaction, TaskRequest, FixedAsset, AccrualEntry,
    # New models
    ChartOfAccounts, GeneralLedger, JournalEntry, RecurringJournalTemplate, LedgerPeriod,
    Customer, Invoice, InvoiceLineItem, CreditNote, Payment,
    Vendor, PurchaseOrder, Bill, BillPayment,
    InventoryItem, InventoryTransaction, InventoryCostOfGoodsSold,
    BankReconciliation,
    DeferredRevenue, RevenueRecognitionSchedule,
    PeriodCloseChecklist, PeriodCloseItem,
    ExchangeRate, FXGainLoss,
    Notification, NotificationPreference
)
from .serializers import (
    OrganizationSerializer, EntitySerializer, EntityDetailSerializer,
    TeamMemberSerializer, RoleSerializer, PermissionSerializer,
    TaxExposureSerializer, TaxProfileSerializer, ComplianceDeadlineSerializer,
    CashflowForecastSerializer, AuditLogSerializer, OrgOverviewSerializer,
    EntityDepartmentSerializer, EntityRoleSerializer, EntityStaffSerializer,
    BankAccountSerializer, WalletSerializer, ComplianceDocumentSerializer,
    BookkeepingCategorySerializer, BookkeepingAccountSerializer, TransactionSerializer, BookkeepingAuditLogSerializer,
    RecurringTransactionSerializer, TaskRequestSerializer,
    # New serializers
    ChartOfAccountsSerializer, GeneralLedgerSerializer, JournalEntrySerializer,
    RecurringJournalTemplateSerializer, LedgerPeriodSerializer,
    CustomerSerializer, InvoiceSerializer, InvoiceLineItemSerializer, CreditNoteSerializer, PaymentSerializer,
    VendorSerializer, PurchaseOrderSerializer, BillSerializer, BillPaymentSerializer,
    InventoryItemSerializer, InventoryTransactionSerializer, InventoryCostOfGoodsSoldSerializer,
    BankReconciliationSerializer,
    DeferredRevenueSerializer, RevenueRecognitionScheduleSerializer,
    PeriodCloseChecklistSerializer, PeriodCloseItemSerializer,
    ExchangeRateSerializer, FXGainLossSerializer,
    NotificationSerializer, NotificationPreferenceSerializer
)
from .permissions import PermissionChecker


class OrganizationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing organizations"""
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return organizations owned by user"""
        return Organization.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        """Create organization with current user as owner"""
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def my_organizations(self, request):
        """Get all organizations current user owns"""
        organizations = self.get_queryset()
        serializer = self.get_serializer(organizations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def overview(self, request, pk=None):
        """Get organization overview/dashboard data"""
        organization = self.get_object()
        
        # Gather data
        entities = organization.entities.filter(status='active')
        total_entities = entities.count()
        total_jurisdictions = entities.values('country').distinct().count()

        # Tax exposure
        tax_exposures = TaxExposure.objects.filter(entity__organization=organization)
        total_tax_exposure = tax_exposures.aggregate(
            total=Sum('estimated_amount')
        )['total'] or 0

        # Compliance
        pending_returns = ComplianceDeadline.objects.filter(
            entity__organization=organization,
            status__in=['upcoming', 'overdue']
        ).count()
        
        missing_data = entities.filter(registration_number='').count()

        # Tax by country
        tax_by_country = {}
        for exposure in tax_exposures:
            key = exposure.country
            if key not in tax_by_country:
                tax_by_country[key] = 0
            tax_by_country[key] += float(exposure.estimated_amount or 0)

        overview_data = {
            'total_assets': 0,
            'total_liabilities': 0,
            'net_position': 0,
            'total_cash_by_currency': {},
            'total_tax_exposure': float(total_tax_exposure),
            'active_jurisdictions': total_jurisdictions,
            'active_entities': total_entities,
            'pending_tax_returns': pending_returns,
            'missing_data_entities': missing_data,
            'tax_exposure_by_country': tax_by_country,
        }

        serializer = OrgOverviewSerializer(overview_data)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def risk_exposure(self, request, pk=None):
        """Risk & Exposure dashboard computed from real data.

        Returns a stable shape with zero/empty defaults when no data exists.
        """
        organization = self.get_object()

        exposures_qs = TaxExposure.objects.filter(entity__organization=organization)
        totals_by_country = list(
            exposures_qs.values('country')
            .annotate(total=Sum('estimated_amount'))
            .order_by('-total')
        )

        total_tax_exposure = Decimal('0')
        for row in totals_by_country:
            total_tax_exposure += (row.get('total') or Decimal('0'))

        # Compliance deadline counts (used for alerts + risk scores)
        deadline_counts = defaultdict(int)
        deadlines_qs = ComplianceDeadline.objects.filter(
            entity__organization=organization,
            status__in=['upcoming', 'due_soon', 'overdue'],
        )
        for row in (
            deadlines_qs.values('entity__country', 'status')
            .annotate(count=Count('id'))
        ):
            country = row.get('entity__country') or ''
            status = row.get('status') or ''
            if country and status:
                deadline_counts[(country, status)] += int(row.get('count') or 0)

        # Concentration risk: top 3 countries share
        top_rows = totals_by_country[:3]
        top_total = Decimal('0')
        for row in top_rows:
            top_total += (row.get('total') or Decimal('0'))

        if total_tax_exposure > 0:
            top3_percentage = int(round((top_total / total_tax_exposure) * 100))
        else:
            top3_percentage = 0

        largest_exposures = []
        for row in top_rows:
            amount = row.get('total') or Decimal('0')
            if total_tax_exposure > 0:
                pct = int(round((amount / total_tax_exposure) * 100))
            else:
                pct = 0
            largest_exposures.append({
                'country': row.get('country') or '',
                'percentage': pct,
                'amount': float(amount),
            })

        # Country risks list
        country_risks = []
        for row in totals_by_country:
            country = row.get('country') or ''
            exposure_amount = row.get('total') or Decimal('0')
            if not country:
                continue

            share_pct = float((exposure_amount / total_tax_exposure) * 100) if total_tax_exposure > 0 else 0.0
            overdue = deadline_counts.get((country, 'overdue'), 0)
            due_soon = deadline_counts.get((country, 'due_soon'), 0)
            upcoming = deadline_counts.get((country, 'upcoming'), 0)

            # Simple, explainable scoring: exposure share + compliance pressure.
            # Scale is 0-100; thresholds match the frontend legend.
            risk_score = int(round(min(100.0, (share_pct * 1.2) + (overdue * 20) + (due_soon * 12) + (upcoming * 6))))
            if risk_score < 20:
                status = 'low'
            elif risk_score < 30:
                status = 'medium'
            else:
                status = 'high'

            alerts = int(overdue + due_soon + upcoming)
            country_risks.append({
                'country': country,
                'exposure': float(exposure_amount),
                'risk_score': risk_score,
                'status': status,
                'alerts': alerts,
            })

        # Compliance alerts list (overdue + upcoming next 30 days)
        today = timezone.now().date()
        window_end = today + timedelta(days=30)
        alerts_qs = ComplianceDeadline.objects.filter(entity__organization=organization).exclude(status='completed')
        alerts_qs = alerts_qs.filter(Q(status='overdue') | Q(deadline_date__lte=window_end))
        alerts_qs = alerts_qs.filter(status__in=['upcoming', 'due_soon', 'overdue']).order_by('deadline_date')

        compliance_alerts = []
        for deadline in alerts_qs:
            if deadline.status == 'overdue':
                alert_type = 'Overdue Filing'
                severity = 'high'
            elif deadline.status == 'due_soon':
                alert_type = 'Filing Deadline'
                severity = 'medium'
            else:
                alert_type = 'Filing Deadline'
                severity = 'medium'

            compliance_alerts.append({
                'id': deadline.id,
                'country': getattr(deadline.entity, 'country', '') or '',
                'type': alert_type,
                'description': deadline.description or deadline.title,
                'severity': severity,
            })

        # FX exposure from bank accounts + wallets (by currency)
        balances_by_currency = defaultdict(Decimal)
        for acct in BankAccount.objects.filter(entity__organization=organization, is_active=True):
            currency = acct.currency or 'USD'
            balances_by_currency[currency] += (acct.balance or Decimal('0'))

        for wallet in Wallet.objects.filter(entity__organization=organization, is_active=True):
            currency = wallet.currency or 'USD'
            balances_by_currency[currency] += (wallet.balance or Decimal('0'))

        total_fx_exposure = Decimal('0')
        for amt in balances_by_currency.values():
            total_fx_exposure += (amt or Decimal('0'))

        fx_by_currency = []
        for currency, amount in sorted(balances_by_currency.items(), key=lambda kv: kv[1], reverse=True):
            if total_fx_exposure > 0:
                concentration = int(round((amount / total_fx_exposure) * 100))
            else:
                concentration = 0
            fx_by_currency.append({
                'currency': currency,
                'exposure': float(amount),
                'concentration': concentration,
            })

        dashboard = {
            'concentration_risk': {
                'top3_percentage': top3_percentage,
                'countries_with_exposure': len(totals_by_country),
                'largest_exposures': largest_exposures,
            },
            'country_risks': country_risks,
            'compliance_alerts': compliance_alerts,
            'fx_exposure': {
                'total_exposure': float(total_fx_exposure),
                'by_currency': fx_by_currency,
            },
        }

        return Response(dashboard)


class EntityViewSet(viewsets.ModelViewSet):
    """ViewSet for managing entities"""
    serializer_class = EntitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return entities for organizations owned by the user."""
        queryset = Entity.objects.filter(organization__owner=self.request.user)
        org_id = self.request.query_params.get('organization_id')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        return queryset

    def perform_create(self, serializer):
        """Create entity for organization"""
        from django.db import IntegrityError
        from rest_framework.exceptions import ValidationError
        
        org_id = self.request.data.get('organization_id')
        if not org_id:
            raise ValidationError({'organization_id': 'This field is required.'})
        
        # Get the organization owned by the current user
        organization = get_object_or_404(Organization, id=org_id, owner=self.request.user)
        
        try:
            entity = serializer.save(organization=organization)
            # Create default structure for the new entity
            entity.create_default_structure()

            # Create a default tax profile for the entity country
            TaxProfile.objects.get_or_create(
                entity=entity,
                country=entity.country,
                defaults={
                    'status': 'active',
                    'compliance_score': 0,
                    'tax_rules': {},
                    'auto_update': True,
                    'residency_status': 'detected',
                },
            )
        except IntegrityError as e:
            raise ValidationError({
                'detail': f"An entity with the name '{self.request.data.get('name')}' already exists in {self.request.data.get('country')} for this organization."
            })

    @action(detail=True, methods=['get'])
    def hierarchy(self, request, pk=None):
        """Get entity details"""
        entity = self.get_object()
        serializer = EntityDetailSerializer(entity)
        return Response(serializer.data)


class TeamMemberViewSet(viewsets.ModelViewSet):
    """ViewSet for managing team members"""
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return team members for user's organizations"""
        return TeamMember.objects.filter(organization__owner=self.request.user)

    def perform_create(self, serializer):
        """Add team member"""
        org_id = self.request.data.get('organization_id')
        organization = get_object_or_404(Organization, id=org_id, owner=self.request.user)
        serializer.save(organization=organization)


class TaxExposureViewSet(viewsets.ModelViewSet):
    """ViewSet for tax exposure tracking"""
    serializer_class = TaxExposureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return tax exposures for user's organizations"""
        qs = TaxExposure.objects.filter(entity__organization__owner=self.request.user)
        entity_id = self.request.query_params.get('entity_id') or self.request.query_params.get('entity')
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs


class TaxProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for managing entity tax profiles"""
    serializer_class = TaxProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = TaxProfile.objects.filter(entity__organization__owner=self.request.user)
        entity_id = self.request.query_params.get('entity_id') or self.request.query_params.get('entity')
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs

    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity') or self.request.data.get('entity_id')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)

    @action(detail=False, methods=['get'])
    def by_country(self, request):
        """Get tax exposure grouped by country"""
        org_id = request.query_params.get('organization_id')
        if not org_id:
            return Response({'error': 'organization_id required'}, status=400)
            
        organization = get_object_or_404(Organization, id=org_id, owner=request.user)
        
        exposures = TaxExposure.objects.filter(entity__organization=organization)
        grouped = {}
        for exposure in exposures:
            country = exposure.country
            if country not in grouped:
                grouped[country] = {'total': 0, 'count': 0, 'entities': []}
            grouped[country]['total'] += float(exposure.estimated_amount or 0)
            grouped[country]['count'] += 1
            grouped[country]['entities'].append(exposure.entity.name)

        return Response(grouped)


class ComplianceDeadlineViewSet(viewsets.ModelViewSet):
    """ViewSet for compliance deadline tracking"""
    serializer_class = ComplianceDeadlineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return compliance deadlines for user's organizations"""
        qs = ComplianceDeadline.objects.filter(entity__organization__owner=self.request.user)
        entity_id = self.request.query_params.get('entity_id') or self.request.query_params.get('entity')
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming compliance deadlines (next 30 days)"""
        org_id = request.query_params.get('organization_id')
        if not org_id:
            return Response({'error': 'organization_id required'}, status=400)
            
        organization = get_object_or_404(Organization, id=org_id, owner=request.user)
        
        now = datetime.now().date()
        upcoming = ComplianceDeadline.objects.filter(
            entity__organization=organization,
            deadline_date__gte=now,
            deadline_date__lte=now + timedelta(days=30),
            status__in=['upcoming', 'overdue']
        ).order_by('deadline_date')

        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue compliance deadlines"""
        org_id = request.query_params.get('organization_id')
        if not org_id:
            return Response({'error': 'organization_id required'}, status=400)
            
        organization = get_object_or_404(Organization, id=org_id, owner=request.user)
        
        now = datetime.now().date()
        overdue = ComplianceDeadline.objects.filter(
            entity__organization=organization,
            deadline_date__lt=now,
            status__in=['upcoming', 'overdue']
        ).order_by('deadline_date')

        serializer = self.get_serializer(overdue, many=True)
        return Response(serializer.data)


class CashflowForecastViewSet(viewsets.ModelViewSet):
    """ViewSet for cashflow forecasting"""
    serializer_class = CashflowForecastSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return cashflow forecasts for user's organizations"""
        return CashflowForecast.objects.filter(entity__organization__owner=self.request.user)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get cashflow grouped by category for current month"""
        org_id = request.query_params.get('organization_id')
        if not org_id:
            return Response({'error': 'organization_id required'}, status=400)
            
        organization = get_object_or_404(Organization, id=org_id, owner=request.user)
        
        now = datetime.now()
        current_month = now.replace(day=1)

        forecasts = CashflowForecast.objects.filter(
            entity__organization=organization,
            month=current_month
        )
        grouped = forecasts.values('category').annotate(
            total_forecasted=Sum('forecasted_amount'),
            total_actual=Sum('actual_amount')
        ).order_by('category')

        return Response(list(grouped))


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing available roles"""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing available permissions"""
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing audit logs"""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return audit logs for user's organizations"""
        return AuditLog.objects.filter(organization__owner=self.request.user)


# ============ Entity-Specific ViewSets ============

class EntityDepartmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing entity departments"""
    serializer_class = EntityDepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return departments for user's entities"""
        return EntityDepartment.objects.filter(entity__organization__owner=self.request.user)

    def perform_create(self, serializer):
        """Create department for entity"""
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


class EntityRoleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing entity roles"""
    serializer_class = EntityRoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return roles for user's entities"""
        return EntityRole.objects.filter(entity__organization__owner=self.request.user)

    def perform_create(self, serializer):
        """Create role for entity"""
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


class EntityStaffViewSet(viewsets.ModelViewSet):
    """ViewSet for managing entity staff"""
    serializer_class = EntityStaffSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return staff for user's entities"""
        return EntityStaff.objects.filter(entity__organization__owner=self.request.user)

    def perform_create(self, serializer):
        """Create staff member for entity"""
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


class BankAccountViewSet(viewsets.ModelViewSet):
    """ViewSet for managing bank accounts"""
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return bank accounts for user's entities"""
        return BankAccount.objects.filter(entity__organization__owner=self.request.user)

    def perform_create(self, serializer):
        """Create bank account for entity"""
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


class WalletViewSet(viewsets.ModelViewSet):
    """ViewSet for managing wallets"""
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return wallets for user's entities"""
        return Wallet.objects.filter(entity__organization__owner=self.request.user)

    def perform_create(self, serializer):
        """Create wallet for entity"""
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


class ComplianceDocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing compliance documents"""
    serializer_class = ComplianceDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return compliance documents for user's entities"""
        qs = ComplianceDocument.objects.filter(entity__organization__owner=self.request.user)
        entity_id = self.request.query_params.get('entity_id') or self.request.query_params.get('entity')
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs

    def perform_create(self, serializer):
        """Create compliance document for entity"""
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get documents expiring soon"""
        entity_id = request.query_params.get('entity_id')
        if not entity_id:
            return Response({'error': 'entity_id required'}, status=400)
            
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=request.user)
        
        documents = ComplianceDocument.objects.filter(
            entity=entity,
            expiry_date__isnull=False
        ).exclude(status='expired')
        
        expiring_soon = [doc for doc in documents if doc.is_expiring_soon]
        serializer = self.get_serializer(expiring_soon, many=True)
        return Response(serializer.data)


# ============================================================================
# BOOKKEEPING VIEWSETS
# ============================================================================

class BookkeepingCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for bookkeeping categories"""
    serializer_class = BookkeepingCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return categories for specific entity"""
        entity_id = self.request.query_params.get('entity_id')
        qs = BookkeepingCategory.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    @action(detail=False, methods=['post'])
    def create_defaults(self, request):
        """Create default categories for an entity"""
        entity_id = request.data.get('entity_id')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=request.user)
        
        # Default income categories
        income_categories = [
            'Sales Revenue', 'Service Fees', 'Retainers', 'Investment Income',
            'Loan Repayments', 'Miscellaneous Income'
        ]
        
        # Default expense categories
        expense_categories = [
            'Staff Salaries', 'Contractor Payments', 'Rent', 'Utilities',
            'Car/Vehicle Expenses', 'Shipments & Logistics', 'Software Subscriptions',
            'Taxes', 'Insurance', 'Legal Fees', 'Marketing', 'Asset Purchases'
        ]
        
        created_categories = []
        
        for name in income_categories:
            cat, created = BookkeepingCategory.objects.get_or_create(
                entity=entity,
                name=name,
                type='income',
                defaults={'is_default': True}
            )
            if created:
                created_categories.append(cat)
        
        for name in expense_categories:
            cat, created = BookkeepingCategory.objects.get_or_create(
                entity=entity,
                name=name,
                type='expense',
                defaults={'is_default': True}
            )
            if created:
                created_categories.append(cat)
        
        serializer = self.get_serializer(created_categories, many=True)
        return Response({'created': len(created_categories), 'categories': serializer.data})


class BookkeepingAccountViewSet(viewsets.ModelViewSet):
    """ViewSet for bookkeeping accounts"""
    serializer_class = BookkeepingAccountSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return accounts for specific entity"""
        entity_id = self.request.query_params.get('entity_id')
        qs = BookkeepingAccount.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs


class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for transactions with calculations"""
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return transactions for specific entity with filters"""
        entity_id = self.request.query_params.get('entity_id')
        queryset = Transaction.objects.filter(entity__organization__owner=self.request.user)
        
        if entity_id:
            queryset = queryset.filter(entity_id=entity_id)
        
        # Filters
        transaction_type = self.request.query_params.get('type')
        if transaction_type:
            queryset = queryset.filter(type=transaction_type)
        
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        account_id = self.request.query_params.get('account_id')
        if account_id:
            queryset = queryset.filter(account_id=account_id)
        
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset
    
    def perform_create(self, serializer):
        """Create transaction and log action"""
        transaction = serializer.save(created_by=self.request.user)
        
        # Log action
        BookkeepingAuditLog.objects.create(
            entity=transaction.entity,
            action='create_transaction',
            user=transaction.created_by,
            new_value={
                'id': transaction.id,
                'type': transaction.type,
                'amount': str(transaction.amount),
                'description': transaction.description
            }
        )
    
    def perform_update(self, serializer):
        """Update transaction and log action"""
        old_transaction = self.get_object()
        old_value = {
            'amount': str(old_transaction.amount),
            'type': old_transaction.type,
            'category': old_transaction.category.name,
            'account': old_transaction.account.name
        }
        
        transaction = serializer.save()
        
        # Log action
        BookkeepingAuditLog.objects.create(
            entity=transaction.entity,
            action='edit_transaction',
            user=self.request.user if hasattr(self.request, 'user') and self.request.user.is_authenticated else None,
            old_value=old_value,
            new_value={
                'amount': str(transaction.amount),
                'type': transaction.type,
                'category': transaction.category.name,
                'account': transaction.account.name
            }
        )
    
    def perform_destroy(self, instance):
        """Delete transaction and log action"""
        BookkeepingAuditLog.objects.create(
            entity=instance.entity,
            action='delete_transaction',
            user=self.request.user if hasattr(self.request, 'user') and self.request.user.is_authenticated else None,
            old_value={
                'id': instance.id,
                'type': instance.type,
                'amount': str(instance.amount),
                'description': instance.description
            }
        )
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get financial summary for entity"""
        from django.db.models import Sum, Count
        from datetime import datetime, timedelta
        
        entity_id = request.query_params.get('entity_id')
        if not entity_id:
            return Response({'error': 'entity_id required'}, status=400)
        
        # Date filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = Transaction.objects.filter(entity_id=entity_id)
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Calculate totals
        income_total = queryset.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0
        expense_total = queryset.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0
        
        # Payroll total (staff salaries)
        payroll_total = queryset.filter(
            type='expense',
            category__name__icontains='salary'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Category breakdown
        category_breakdown = queryset.values(
            'category__name', 'category__type'
        ).annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')[:10]
        
        # Monthly trend (last 6 months)
        six_months_ago = datetime.now().date() - timedelta(days=180)
        monthly_data = queryset.filter(date__gte=six_months_ago).extra(
            select={'month': "strftime('%%Y-%%m', date)"}
        ).values('month', 'type').annotate(
            total=Sum('amount')
        ).order_by('month')
        
        return Response({
            'total_income': float(income_total),
            'total_expense': float(expense_total),
            'net_profit': float(income_total - expense_total),
            'payroll_total': float(payroll_total),
            'transaction_count': queryset.count(),
            'category_breakdown': list(category_breakdown),
            'monthly_trend': list(monthly_data)
        })

    @action(detail=False, methods=['get'])
    def anomalies(self, request):
        """Detect basic anomalies in transaction amounts for an entity.

        Flags transactions whose absolute amount is far from the mean
        (simple z-score over the entity's transactions in a period).

        Query params:
        - entity_id (required)
        - lookback_days (optional, default 180)
        - z_threshold (optional, default 3.0)
        """
        from math import sqrt

        entity_id = request.query_params.get('entity_id')
        if not entity_id:
            return Response({'error': 'entity_id required'}, status=400)

        lookback_days = int(request.query_params.get('lookback_days', 180))
        z_threshold = float(request.query_params.get('z_threshold', 3.0))

        from datetime import datetime, timedelta
        cutoff = datetime.now().date() - timedelta(days=lookback_days)

        qs = Transaction.objects.filter(entity_id=entity_id, date__gte=cutoff)
        amounts = [abs(float(t.amount)) for t in qs]

        if len(amounts) < 5:
            return Response({'message': 'Not enough data to perform anomaly detection.', 'count': len(amounts)})

        mean = sum(amounts) / len(amounts)
        variance = sum((x - mean) ** 2 for x in amounts) / len(amounts)
        std = sqrt(variance) if variance > 0 else 0

        if std == 0:
            return Response({'message': 'No variability detected; all amounts are similar.', 'count': len(amounts)})

        flagged = []
        for t in qs:
            amt = abs(float(t.amount))
            z = (amt - mean) / std
            if abs(z) >= z_threshold:
                flagged.append({
                    'id': t.id,
                    'date': t.date,
                    'amount': float(t.amount),
                    'type': t.type,
                    'category': t.category.name,
                    'account': t.account.name,
                    'z_score': round(z, 2),
                    'reason': 'Amount is an outlier compared to recent history.'
                })

        return Response({
            'entity_id': int(entity_id),
            'lookback_days': lookback_days,
            'mean_amount': round(mean, 2),
            'std_amount': round(std, 2),
            'threshold': z_threshold,
            'flagged_count': len(flagged),
            'flagged_transactions': flagged,
        })

    @action(detail=False, methods=['post'])
    def import_external(self, request):
        """Bulk-import transactions from external sources (e.g. bank feeds).

        Expects a JSON payload of the form:

        {
          "transactions": [
            {"entity": 1, "account": 2, "type": "income", ...},
            ...
          ]
        }

        Each item is validated using the normal TransactionSerializer,
        including duplicate detection, and created if valid.
        """
        transactions_data = request.data.get('transactions')
        if not isinstance(transactions_data, list):
            return Response({'error': 'transactions must be a list'}, status=400)

        created_ids = []
        errors = []

        for index, item in enumerate(transactions_data):
            serializer = self.get_serializer(data=item)
            serializer.context['request'] = request
            if serializer.is_valid():
                transaction = serializer.save(
                    created_by=request.user if hasattr(request, 'user') and getattr(request.user, 'is_authenticated', False) else None
                )
                created_ids.append(transaction.id)
            else:
                errors.append({'index': index, 'errors': serializer.errors})

        status_code = 201 if created_ids else 400
        return Response({'created_ids': created_ids, 'errors': errors}, status=status_code)


class BookkeepingAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for bookkeeping audit logs (read-only)"""
    serializer_class = BookkeepingAuditLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return audit logs for specific entity"""
        entity_id = self.request.query_params.get('entity_id')
        qs = BookkeepingAuditLog.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs


class FinancialStatementsViewSet(viewsets.ViewSet):
    """ViewSet for generating Balance Sheet, Income Statement, and Cash Flow Statement"""

    @action(detail=False, methods=['get'])
    def balance_sheet(self, request):
        """Generate balance sheet for an entity as of a specific date"""
        entity_id = request.query_params.get('entity_id')
        as_of_date = request.query_params.get('as_of_date')
        
        if not entity_id:
            return Response({'error': 'entity_id required'}, status=400)
        
        from datetime import datetime
        if as_of_date:
            try:
                as_of = datetime.strptime(as_of_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid date format (use YYYY-MM-DD)'}, status=400)
        else:
            as_of = datetime.now().date()
        
        entity = get_object_or_404(Entity, pk=entity_id, organization__owner=request.user)
        
        # Get all transactions up to the as_of date
        transactions = Transaction.objects.filter(entity=entity, date__lte=as_of)
        
        # Calculate assets (bank accounts + wallets + receivables)
        current_assets = {}
        for account in entity.bookkeeping_accounts.filter(type__in=['bank', 'cash']):
            txns = transactions.filter(account=account)
            balance = account.balance
            current_assets[account.name] = float(balance)
        
        total_current_assets = sum(current_assets.values())
        
        # Fixed assets (at book value)
        fixed_assets = {}
        for asset in entity.fixed_assets.filter(is_active=True):
            book_val = float(asset.cost - asset.accumulated_depreciation)
            fixed_assets[asset.name] = book_val
        
        total_fixed_assets = sum(fixed_assets.values())
        total_assets = total_current_assets + total_fixed_assets
        
        # Liabilities (placeholder: could extend to track payables)
        total_liabilities = 0
        
        # Equity (Assets - Liabilities)
        total_equity = total_assets - total_liabilities
        
        return Response({
            'entity_id': int(entity_id),
            'as_of_date': str(as_of),
            'assets': {
                'current_assets': current_assets,
                'total_current_assets': total_current_assets,
                'fixed_assets': fixed_assets,
                'total_fixed_assets': total_fixed_assets,
                'total_assets': total_assets,
            },
            'liabilities': {
                'total_liabilities': total_liabilities,
            },
            'equity': {
                'total_equity': total_equity,
            },
            'check': f"Assets ({total_assets}) = Liabilities ({total_liabilities}) + Equity ({total_equity})"
        })

    @action(detail=False, methods=['get'])
    def income_statement(self, request):
        """Generate income statement (P&L) for a period"""
        entity_id = request.query_params.get('entity_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not entity_id:
            return Response({'error': 'entity_id required'}, status=400)
        
        from datetime import datetime, timedelta
        if end_date:
            try:
                end = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid end_date format (use YYYY-MM-DD)'}, status=400)
        else:
            end = datetime.now().date()
        
        if start_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid start_date format (use YYYY-MM-DD)'}, status=400)
        else:
            start = end - timedelta(days=365)
        
        entity = get_object_or_404(Entity, pk=entity_id, organization__owner=request.user)
        
        # Get all transactions in the period
        txns = Transaction.objects.filter(entity=entity, date__gte=start, date__lte=end)
        
        # Revenue (Income)
        from django.db.models import Sum
        revenue = txns.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0
        
        # Expenses
        expenses = txns.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0
        
        # Add depreciation expense (for the period)
        months = (end.year - start.year) * 12 + (end.month - start.month) + 1
        depreciation_expense = 0
        for asset in entity.fixed_assets.filter(is_active=True):
            annual_deprec = asset.calculate_depreciation()
            depreciation_expense += float(annual_deprec) * (months / 12.0)
        
        # Add accrual expenses for the period
        accrual_expenses = entity.accrual_entries.filter(
            accrual_type='expense',
            accrual_date__gte=start,
            accrual_date__lte=end
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Accrual revenue
        accrual_revenue = entity.accrual_entries.filter(
            accrual_type='revenue',
            accrual_date__gte=start,
            accrual_date__lte=end
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        total_revenue = float(revenue) + float(accrual_revenue)
        total_expenses = float(expenses) + depreciation_expense + float(accrual_expenses)
        net_income = total_revenue - total_expenses
        
        return Response({
            'entity_id': int(entity_id),
            'period': f"{start} to {end}",
            'revenue': {
                'operating_revenue': float(revenue),
                'accrual_revenue': float(accrual_revenue),
                'total_revenue': total_revenue,
            },
            'expenses': {
                'operating_expenses': float(expenses),
                'depreciation_expense': round(depreciation_expense, 2),
                'accrual_expenses': float(accrual_expenses),
                'total_expenses': total_expenses,
            },
            'net_income': round(net_income, 2),
        })

    @action(detail=False, methods=['get'])
    def cash_flow_statement(self, request):
        """Generate cash flow statement (simplified: only transaction-based)"""
        entity_id = request.query_params.get('entity_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not entity_id:
            return Response({'error': 'entity_id required'}, status=400)
        
        from datetime import datetime, timedelta
        if end_date:
            try:
                end = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid end_date format (use YYYY-MM-DD)'}, status=400)
        else:
            end = datetime.now().date()
        
        if start_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid start_date format (use YYYY-MM-DD)'}, status=400)
        else:
            start = end - timedelta(days=365)
        
        entity = get_object_or_404(Entity, pk=entity_id, organization__owner=request.user)
        
        # Get all transactions in the period
        from django.db.models import Sum
        txns = Transaction.objects.filter(entity=entity, date__gte=start, date__lte=end)
        
        # Operating activities (net income simplified from transactions)
        net_cash_from_operations = txns.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0
        net_cash_from_operations -= (txns.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0)
        
        # Investing activities (fixed asset purchases, simplified)
        investing_outflows = 0
        for asset in entity.fixed_assets.filter(purchase_date__gte=start, purchase_date__lte=end):
            investing_outflows += float(asset.cost)
        
        # Financing activities (not yet implemented; placeholder)
        net_cash_from_financing = 0
        
        net_change_in_cash = float(net_cash_from_operations) - investing_outflows + net_cash_from_financing
        
        return Response({
            'entity_id': int(entity_id),
            'period': f"{start} to {end}",
            'operating_activities': {
                'net_cash_from_operations': round(float(net_cash_from_operations), 2),
            },
            'investing_activities': {
                'fixed_asset_purchases': -investing_outflows,
                'net_cash_from_investing': -investing_outflows,
            },
            'financing_activities': {
                'net_cash_from_financing': net_cash_from_financing,
            },
            'net_change_in_cash': round(net_change_in_cash, 2),
        })


class CashflowTreasuryViewSet(viewsets.ViewSet):
    """ViewSet for cashflow and treasury data"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get comprehensive cashflow and treasury dashboard data"""
        entity_id = request.query_params.get('entity_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        currency = request.query_params.get('currency', 'USD')

        if not entity_id:
            return Response({'error': 'entity_id required'}, status=400)

        entity = get_object_or_404(Entity, id=entity_id, organization__owner=request.user)

        from datetime import date
        from django.db.models import Sum
        from django.db.models.functions import TruncMonth

        def _parse_date(value):
            if not value:
                return None
            try:
                return date.fromisoformat(value)
            except ValueError:
                return None

        start = _parse_date(start_date)
        end = _parse_date(end_date)
        today = date.today()

        if end is None:
            end = today
        if start is None:
            start = (end.replace(day=1) - timedelta(days=180)).replace(day=1)

        bank_accounts = BankAccount.objects.filter(entity=entity)
        wallets = Wallet.objects.filter(entity=entity)

        cash_on_hand = float(bank_accounts.aggregate(total=Sum('balance'))['total'] or 0) + float(
            wallets.aggregate(total=Sum('balance'))['total'] or 0
        )

        txns = Transaction.objects.filter(entity=entity, date__gte=start, date__lte=end)
        inflows = float(txns.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0)
        outflows = float(txns.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0)
        net_cashflow = inflows - outflows

        monthly_rows = (
            txns.annotate(month=TruncMonth('date'))
            .values('month', 'type')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )
        monthly_map = {}
        for row in monthly_rows:
            month_key = row['month'].strftime('%b') if row.get('month') else ''
            if month_key not in monthly_map:
                monthly_map[month_key] = {'month': month_key, 'inflows': 0.0, 'outflows': 0.0, 'forecast': 0.0}
            if row['type'] == 'income':
                monthly_map[month_key]['inflows'] = float(row['total'] or 0)
            elif row['type'] == 'expense':
                monthly_map[month_key]['outflows'] = float(row['total'] or 0)

        monthly = list(monthly_map.values())
        months_count = max(1, len(monthly))
        burn_rate = net_cashflow / months_count
        runway_days = 0
        if burn_rate < 0:
            runway_days = int((cash_on_hand / abs(burn_rate)) * 30) if abs(burn_rate) > 0 else 0

        return Response({
            'kpis': {
                'cashOnHand': round(cash_on_hand, 2),
                'netCashflow': round(net_cashflow, 2),
                'liquidityRatio': 0,
                'burnRate': round(burn_rate, 2),
                'runway': runway_days,
            },
            'cashflowTimeline': {
                'monthly': monthly,
            },
            'bankAccounts': [
                {
                    'id': a.id,
                    'name': a.name,
                    'bank': getattr(a, 'bank_name', None) or getattr(a, 'bank', None),
                    'balance': float(a.balance or 0),
                    'currency': getattr(a, 'currency', currency),
                    'type': getattr(a, 'type', None),
                }
                for a in bank_accounts
            ],
            'accountsPayable': {'upcoming': [], 'overdue': []},
            'accountsReceivable': {'expected': [], 'aging': {}},
            'insights': [],
            'alerts': [],
        })

    @action(detail=False, methods=['post'])
    def transfer(self, request):
        """Execute internal transfer between accounts"""
        return Response({'detail': 'Not implemented.'}, status=501)

    @action(detail=False, methods=['post'])
    def fx_conversion(self, request):
        """Execute FX conversion"""
        return Response({'detail': 'Not implemented.'}, status=501)

    @action(detail=False, methods=['post'])
    def investment_allocation(self, request):
        """Allocate funds to investment"""
        return Response({'detail': 'Not implemented.'}, status=501)


# ============================================================================
# WORKFLOW & TASK QUEUE VIEWSETS
# ============================================================================


class RecurringTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing recurring bookkeeping transactions."""

    serializer_class = RecurringTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        entity_id = self.request.query_params.get('entity_id')
        qs = RecurringTransaction.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs

    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity') or self.request.data.get('entity_id')
        if entity_id:
            entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
            serializer.save(created_by=self.request.user, entity=entity)
        else:
            serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['post'])
    def run_due(self, request):
        """Generate transactions for all due recurring templates as of today."""
        from datetime import date

        as_of_str = request.data.get('as_of_date')
        if as_of_str:
            try:
                as_of = date.fromisoformat(as_of_str)
            except ValueError:
                return Response({'error': 'Invalid as_of_date, expected YYYY-MM-DD'}, status=400)
        else:
            as_of = date.today()

        created = []
        for rt in RecurringTransaction.objects.filter(entity__organization__owner=request.user):
            if rt.is_due(as_of):
                tx = rt.create_transaction(run_date=as_of)
                if tx is not None:
                    created.append(tx.id)

        return Response({'created_transaction_ids': created, 'count': len(created), 'as_of_date': as_of.isoformat()})


class TaskRequestViewSet(viewsets.ModelViewSet):
    """Queue-based task management for digital workflows."""

    serializer_class = TaskRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = TaskRequest.objects.filter(organization__owner=self.request.user)
        org_id = self.request.query_params.get('organization_id')
        entity_id = self.request.query_params.get('entity_id')
        status_filter = self.request.query_params.get('status')

        if org_id:
            qs = qs.filter(organization_id=org_id)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        org_id = self.request.data.get('organization') or self.request.data.get('organization_id')
        entity_id = self.request.data.get('entity') or self.request.data.get('entity_id')

        organization = None
        entity = None

        if entity_id:
            entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
            organization = entity.organization

        if org_id:
            organization = get_object_or_404(Organization, id=org_id, owner=self.request.user)

        serializer.save(created_by=self.request.user, organization=organization, entity=entity)

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Process a queued task synchronously.

        In production this would be delegated to a background worker (Celery,
        etc.). Here we execute lightweight logic inline and update status.
        """

        task = self.get_object()
        if task.status not in ['queued', 'failed']:
            return Response({'detail': f'Task is already {task.status}.'}, status=400)

        task.mark_processing()

        try:
            if task.task_type == 'generate_statement':
                result = self._generate_statement(task)
            else:
                result = {
                    'message': 'Task recorded. Detailed processing to be implemented.',
                    'task_type': task.task_type,
                }

            task.mark_completed(result=result)
        except Exception as exc:  # pragma: no cover - defensive
            task.mark_failed(error_message=str(exc))
            return Response({'detail': 'Task processing failed', 'error': str(exc)}, status=500)

        serializer = self.get_serializer(task)
        return Response(serializer.data)

    def _generate_statement(self, task):
        """Build a simple income statement from bookkeeping transactions."""
        from django.db.models import Sum

        payload = task.payload or {}
        entity_id = payload.get('entity_id') or (task.entity_id if task.entity_id else None)
        if not entity_id:
            return {'error': 'entity_id is required in payload to generate a statement.'}

        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)

        start_date = payload.get('start_date')
        end_date = payload.get('end_date')

        qs = Transaction.objects.filter(entity=entity)
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)

        income_total = qs.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0
        expense_total = qs.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0

        by_category = list(
            qs.values('category__name', 'type')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )

        return {
            'entity_id': entity_id,
            'start_date': start_date,
            'end_date': end_date,
            'total_income': float(income_total),
            'total_expense': float(expense_total),
            'net_profit': float(income_total - expense_total),
            'by_category': by_category,
        }


# ============================================================================
# NEW FINANCIAL ACCOUNTING SYSTEM VIEWSETS (COA, GL, AR, AP, etc.)
# ============================================================================

class ChartOfAccountsViewSet(viewsets.ModelViewSet):
    """ViewSet for Chart of Accounts management"""
    serializer_class = ChartOfAccountsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return COA for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = ChartOfAccounts.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


class GeneralLedgerViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing General Ledger"""
    serializer_class = GeneralLedgerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return GL entries for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = GeneralLedger.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs


class JournalEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for Journal Entries (double-entry bookkeeping)"""
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return journal entries for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = JournalEntry.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity, created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a journal entry"""
        journal_entry = self.get_object()
        journal_entry.status = 'posted'
        journal_entry.approved_by = request.user
        journal_entry.approved_at = timezone.now()
        journal_entry.save()
        
        serializer = self.get_serializer(journal_entry)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reverse(self, request, pk=None):
        """Create a reversal journal entry"""
        original_entry = self.get_object()
        
        reversal = JournalEntry.objects.create(
            entity=original_entry.entity,
            entry_type='reversal',
            reference_number=f"{original_entry.reference_number}-REV",
            description=f"Reversal of {original_entry.reference_number}",
            posting_date=timezone.now().date(),
            status='draft',
            created_by=request.user,
            original_entry=original_entry
        )
        
        original_entry.reversing_entry = reversal
        original_entry.save()
        
        serializer = self.get_serializer(reversal)
        return Response(serializer.data)


class RecurringJournalTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for Recurring Journal Entry Templates"""
    serializer_class = RecurringJournalTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return templates for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = RecurringJournalTemplate.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity, created_by=self.request.user)


class LedgerPeriodViewSet(viewsets.ModelViewSet):
    """ViewSet for managing accounting periods"""
    serializer_class = LedgerPeriodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return periods for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = LedgerPeriod.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close an accounting period"""
        period = self.get_object()
        period.status = 'closed'
        period.closed_at = timezone.now()
        period.closed_by = request.user
        period.save()
        
        serializer = self.get_serializer(period)
        return Response(serializer.data)


# ============================================================================
# ACCOUNTS RECEIVABLE (AR) VIEWSETS
# ============================================================================

class CustomerViewSet(viewsets.ModelViewSet):
    """ViewSet for customer management"""
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return customers for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = Customer.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


class InvoiceViewSet(viewsets.ModelViewSet):
    """ViewSet for invoicing"""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return invoices for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = Invoice.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity, created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def post(self, request, pk=None):
        """Post an invoice"""
        invoice = self.get_object()
        invoice.status = 'posted'
        invoice.save()
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)


class CreditNoteViewSet(viewsets.ModelViewSet):
    """ViewSet for credit notes"""
    serializer_class = CreditNoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return credit notes for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = CreditNote.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity, created_by=self.request.user)


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for customer payments"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return payments for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = Payment.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        instance = serializer.save(entity=entity)
        
        # Update invoice paid amount
        instance.invoice.paid_amount += instance.amount
        instance.invoice.outstanding_amount = instance.invoice.total_amount - instance.invoice.paid_amount
        if instance.invoice.outstanding_amount <= 0:
            instance.invoice.status = 'paid'
        else:
            instance.invoice.status = 'partially_paid'
        instance.invoice.save()


# ============================================================================
# ACCOUNTS PAYABLE (AP) VIEWSETS
# ============================================================================

class VendorViewSet(viewsets.ModelViewSet):
    """ViewSet for vendor management"""
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return vendors for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = Vendor.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for purchase orders"""
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return purchase orders for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = PurchaseOrder.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity, created_by=self.request.user)


class BillViewSet(viewsets.ModelViewSet):
    """ViewSet for supplier bills"""
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return bills for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = Bill.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity, created_by=self.request.user)


class BillPaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for bill payments"""
    serializer_class = BillPaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return bill payments for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = BillPayment.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        instance = serializer.save(entity=entity)
        
        # Update bill paid amount
        instance.bill.paid_amount += instance.amount
        instance.bill.outstanding_amount = instance.bill.total_amount - instance.bill.paid_amount
        if instance.bill.outstanding_amount <= 0:
            instance.bill.status = 'paid'
        else:
            instance.bill.status = 'partially_paid'
        instance.bill.save()


# ============================================================================
# INVENTORY VIEWSETS
# ============================================================================

class InventoryItemViewSet(viewsets.ModelViewSet):
    """ViewSet for inventory item management"""
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return inventory items for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = InventoryItem.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


class InventoryTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for inventory transactions"""
    serializer_class = InventoryTransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return inventory transactions for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = InventoryTransaction.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        instance = serializer.save(entity=entity, created_by=self.request.user)
        
        # Update inventory quantity
        item = instance.inventory_item
        item.quantity_on_hand = instance.quantity_after
        item.save()


class InventoryCOGSViewSet(viewsets.ModelViewSet):
    """ViewSet for COGS calculations"""
    serializer_class = InventoryCostOfGoodsSoldSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return COGS for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = InventoryCostOfGoodsSold.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


# ============================================================================
# RECONCILIATION VIEWSETS
# ============================================================================

class BankReconciliationViewSet(viewsets.ModelViewSet):
    """ViewSet for bank reconciliation"""
    serializer_class = BankReconciliationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return bank reconciliations for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = BankReconciliation.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)
    
    @action(detail=True, methods=['post'])
    def reconcile(self, request, pk=None):
        """Mark reconciliation as complete"""
        reconciliation = self.get_object()
        reconciliation.status = 'reconciled'
        reconciliation.reconciled_by = request.user
        reconciliation.reconciled_at = timezone.now()
        reconciliation.variance = abs(reconciliation.bank_statement_balance - reconciliation.book_balance)
        reconciliation.save()
        
        serializer = self.get_serializer(reconciliation)
        return Response(serializer.data)


# ============================================================================
# REVENUE RECOGNITION & DEFERRED REVENUE VIEWSETS
# ============================================================================

class DeferredRevenueViewSet(viewsets.ModelViewSet):
    """ViewSet for deferred revenue management"""
    serializer_class = DeferredRevenueSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return deferred revenues for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = DeferredRevenue.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


class RevenueRecognitionScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for revenue recognition schedules"""
    serializer_class = RevenueRecognitionScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return revenue recognition schedules"""
        return RevenueRecognitionSchedule.objects.filter(
            deferred_revenue__entity__organization__owner=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def recognize(self, request, pk=None):
        """Recognize revenue for this schedule period"""
        schedule = self.get_object()
        schedule.is_recognized = True
        schedule.recognized_date = timezone.now()
        schedule.save()
        
        # Update deferred revenue
        deferred = schedule.deferred_revenue
        deferred.recognized_amount += schedule.amount_to_recognize
        deferred.remaining_amount = deferred.total_amount - deferred.recognized_amount
        if deferred.remaining_amount <= 0:
            deferred.status = 'recognized'
        else:
            deferred.status = 'recognizing'
        deferred.save()
        
        serializer = self.get_serializer(schedule)
        return Response(serializer.data)


# ============================================================================
# PERIOD CLOSE VIEWSETS
# ============================================================================

class PeriodCloseChecklistViewSet(viewsets.ModelViewSet):
    """ViewSet for period close checklists"""
    serializer_class = PeriodCloseChecklistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return close checklists for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = PeriodCloseChecklist.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


class PeriodCloseItemViewSet(viewsets.ModelViewSet):
    """ViewSet for period close items"""
    serializer_class = PeriodCloseItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return close items for user's entities"""
        return PeriodCloseItem.objects.filter(
            checklist__entity__organization__owner=self.request.user
        )


# ============================================================================
# FX & MULTI-CURRENCY VIEWSETS
# ============================================================================

class ExchangeRateViewSet(viewsets.ModelViewSet):
    """ViewSet for exchange rates"""
    serializer_class = ExchangeRateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return exchange rates"""
        return ExchangeRate.objects.all().order_by('-rate_date')


class FXGainLossViewSet(viewsets.ModelViewSet):
    """ViewSet for FX gains/losses"""
    serializer_class = FXGainLossSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return FX gains/losses for user's entities"""
        entity_id = self.request.query_params.get('entity_id')
        qs = FXGainLoss.objects.filter(entity__organization__owner=self.request.user)
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs
    
    def perform_create(self, serializer):
        entity_id = self.request.data.get('entity')
        entity = get_object_or_404(Entity, id=entity_id, organization__owner=self.request.user)
        serializer.save(entity=entity)


# ============================================================================
# NOTIFICATION VIEWSETS
# ============================================================================

class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for user notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return notifications for current user"""
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        notifications = Notification.objects.filter(
            user=request.user,
            status='unread'
        ).order_by('-sent_at')
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.status = 'read'
        notification.read_at = timezone.now()
        notification.save()
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)


class NotificationPreferenceViewSet(viewsets.ViewSet):
    """ViewSet for notification preferences"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationPreferenceSerializer
    
    def list(self, request):
        """Get user's notification preferences"""
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = self.serializer_class(prefs)
        return Response(serializer.data)
    
    def update(self, request, pk=None):
        """Update notification preferences"""
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = self.serializer_class(prefs, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
