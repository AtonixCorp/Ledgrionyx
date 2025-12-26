"""
Enterprise-specific viewsets and views
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta

from .models import (
    Organization, Entity, TeamMember, Role, Permission, TaxExposure,
    ComplianceDeadline, CashflowForecast, AuditLog, EntityDepartment,
    EntityRole, EntityStaff, BankAccount, Wallet, ComplianceDocument,
    BookkeepingCategory, BookkeepingAccount, Transaction, BookkeepingAuditLog,
    RecurringTransaction, TaskRequest, FixedAsset, AccrualEntry
)
from .serializers import (
    OrganizationSerializer, EntitySerializer, EntityDetailSerializer,
    TeamMemberSerializer, RoleSerializer, PermissionSerializer,
    TaxExposureSerializer, ComplianceDeadlineSerializer,
    CashflowForecastSerializer, AuditLogSerializer, OrgOverviewSerializer,
    EntityDepartmentSerializer, EntityRoleSerializer, EntityStaffSerializer,
    BankAccountSerializer, WalletSerializer, ComplianceDocumentSerializer,
    BookkeepingCategorySerializer, BookkeepingAccountSerializer, TransactionSerializer, BookkeepingAuditLogSerializer,
    RecurringTransactionSerializer, TaskRequestSerializer
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


class EntityViewSet(viewsets.ModelViewSet):
    """ViewSet for managing entities"""
    serializer_class = EntitySerializer
    permission_classes = []  # Temporarily disabled for mock auth frontend

    def get_queryset(self):
        """Return entities for all organizations (temporarily for testing)"""
        return Entity.objects.all()  # FIXME: Should filter by user
        # return Entity.objects.filter(organization__owner=self.request.user)

    def perform_create(self, serializer):
        """Create entity for organization"""
        from django.db import IntegrityError
        from rest_framework.exceptions import ValidationError
        
        org_id = self.request.data.get('organization_id')
        organization = get_object_or_404(Organization, id=org_id)  # Removed owner check for mock auth
        
        try:
            entity = serializer.save(organization=organization)
            # Create default structure for the new entity
            entity.create_default_structure()
        except IntegrityError:
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
        return TaxExposure.objects.filter(entity__organization__owner=self.request.user)

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
        return ComplianceDeadline.objects.filter(entity__organization__owner=self.request.user)

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
        return ComplianceDocument.objects.filter(entity__organization__owner=self.request.user)

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
    permission_classes = []  # Temporarily disabled for mock auth
    
    def get_queryset(self):
        """Return categories for specific entity"""
        entity_id = self.request.query_params.get('entity_id')
        if entity_id:
            return BookkeepingCategory.objects.filter(entity_id=entity_id)
        return BookkeepingCategory.objects.all()
    
    @action(detail=False, methods=['post'])
    def create_defaults(self, request):
        """Create default categories for an entity"""
        entity_id = request.data.get('entity_id')
        entity = get_object_or_404(Entity, id=entity_id)
        
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
    permission_classes = []  # Temporarily disabled for mock auth
    
    def get_queryset(self):
        """Return accounts for specific entity"""
        entity_id = self.request.query_params.get('entity_id')
        if entity_id:
            return BookkeepingAccount.objects.filter(entity_id=entity_id)
        return BookkeepingAccount.objects.all()


class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for transactions with calculations"""
    serializer_class = TransactionSerializer
    permission_classes = []  # Temporarily disabled for mock auth
    
    def get_queryset(self):
        """Return transactions for specific entity with filters"""
        entity_id = self.request.query_params.get('entity_id')
        queryset = Transaction.objects.all()
        
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
        transaction = serializer.save(created_by=self.request.user if hasattr(self.request, 'user') and self.request.user.is_authenticated else None)
        
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
    permission_classes = []  # Temporarily disabled for mock auth
    
    def get_queryset(self):
        """Return audit logs for specific entity"""
        entity_id = self.request.query_params.get('entity_id')
        if entity_id:
            return BookkeepingAuditLog.objects.filter(entity_id=entity_id)
        return BookkeepingAuditLog.objects.all()


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
        
        try:
            entity = Entity.objects.get(pk=entity_id)
        except Entity.DoesNotExist:
            return Response({'error': 'Entity not found'}, status=404)
        
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
        
        try:
            entity = Entity.objects.get(pk=entity_id)
        except Entity.DoesNotExist:
            return Response({'error': 'Entity not found'}, status=404)
        
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
        
        try:
            entity = Entity.objects.get(pk=entity_id)
        except Entity.DoesNotExist:
            return Response({'error': 'Entity not found'}, status=404)
        
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
    permission_classes = []  # Temporarily disabled for mock auth

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get comprehensive cashflow and treasury dashboard data"""
        entity_id = request.query_params.get('entity_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        currency = request.query_params.get('currency', 'USD')

        if not entity_id:
            return Response({'error': 'entity_id required'}, status=400)

        # Mock data - in production, this would aggregate from multiple sources
        dashboard_data = {
            'kpis': {
                'cashOnHand': 2456789.45,
                'netCashflow': 156789.23,
                'liquidityRatio': 1.45,
                'burnRate': -45678.90,
                'runway': 54  # days
            },
            'cashflowTimeline': {
                'monthly': [
                    {'month': 'Jan', 'inflows': 450000, 'outflows': 380000, 'forecast': 420000},
                    {'month': 'Feb', 'inflows': 480000, 'outflows': 395000, 'forecast': 435000},
                    {'month': 'Mar', 'inflows': 520000, 'outflows': 410000, 'forecast': 450000},
                    {'month': 'Apr', 'inflows': 495000, 'outflows': 425000, 'forecast': 465000},
                    {'month': 'May', 'inflows': 535000, 'outflows': 440000, 'forecast': 480000},
                    {'month': 'Jun', 'inflows': 510000, 'outflows': 455000, 'forecast': 495000}
                ]
            },
            'bankAccounts': [
                {
                    'id': 1,
                    'name': 'Main Operating Account',
                    'bank': 'Chase',
                    'balance': 1250000.00,
                    'currency': 'USD',
                    'type': 'operational'
                },
                {
                    'id': 2,
                    'name': 'Reserve Account',
                    'bank': 'Wells Fargo',
                    'balance': 850000.00,
                    'currency': 'USD',
                    'type': 'reserve'
                },
                {
                    'id': 3,
                    'name': 'Investment Account',
                    'bank': 'Goldman Sachs',
                    'balance': 356789.45,
                    'currency': 'USD',
                    'type': 'investment'
                }
            ],
            'accountsPayable': {
                'upcoming': [
                    {
                        'id': 1,
                        'vendor': 'Microsoft',
                        'amount': 45000.00,
                        'dueDate': '2025-01-15',
                        'status': 'pending',
                        'risk': 'low'
                    },
                    {
                        'id': 2,
                        'vendor': 'AWS',
                        'amount': 28500.00,
                        'dueDate': '2025-01-18',
                        'status': 'pending',
                        'risk': 'medium'
                    }
                ],
                'overdue': [
                    {
                        'id': 3,
                        'vendor': 'Consulting LLC',
                        'amount': 75000.00,
                        'dueDate': '2024-12-28',
                        'status': 'overdue',
                        'risk': 'high'
                    }
                ]
            },
            'accountsReceivable': {
                'expected': [
                    {
                        'id': 1,
                        'customer': 'Tech Corp',
                        'amount': 125000.00,
                        'dueDate': '2025-01-10',
                        'status': 'pending',
                        'reliability': 'high'
                    },
                    {
                        'id': 2,
                        'customer': 'Startup Inc',
                        'amount': 87500.00,
                        'dueDate': '2025-01-15',
                        'status': 'pending',
                        'reliability': 'medium'
                    }
                ],
                'aging': {
                    'current': 245000.00,
                    '1-30': 156000.00,
                    '31-60': 89000.00,
                    '61-90': 45000.00,
                    '90+': 23000.00
                }
            },
            'insights': [
                {
                    'type': 'warning',
                    'message': 'Cash runway decreased by 12% this month',
                    'impact': 'high'
                },
                {
                    'type': 'info',
                    'message': 'AI detected seasonal cashflow pattern - Q4 typically 15% higher',
                    'impact': 'medium'
                },
                {
                    'type': 'success',
                    'message': 'Payment optimization saved $12,500 in fees',
                    'impact': 'low'
                }
            ],
            'alerts': [
                {
                    'type': 'critical',
                    'message': 'Liquidity ratio below 1.2 threshold',
                    'priority': 'high'
                },
                {
                    'type': 'warning',
                    'message': 'Large transaction pending approval: $250,000',
                    'priority': 'medium'
                },
                {
                    'type': 'info',
                    'message': 'FX exposure increased 8% this week',
                    'priority': 'low'
                }
            ]
        }

        return Response(dashboard_data)

    @action(detail=False, methods=['post'])
    def transfer(self, request):
        """Execute internal transfer between accounts"""
        # Mock implementation - in production, this would integrate with banking APIs
        return Response({'status': 'success', 'message': 'Transfer initiated'})

    @action(detail=False, methods=['post'])
    def fx_conversion(self, request):
        """Execute FX conversion"""
        # Mock implementation
        return Response({'status': 'success', 'message': 'FX conversion executed'})

    @action(detail=False, methods=['post'])
    def investment_allocation(self, request):
        """Allocate funds to investment"""
        # Mock implementation
        return Response({'status': 'success', 'message': 'Investment allocation completed'})


# ============================================================================
# WORKFLOW & TASK QUEUE VIEWSETS
# ============================================================================


class RecurringTransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing recurring bookkeeping transactions."""

    serializer_class = RecurringTransactionSerializer
    permission_classes = []  # Temporarily disabled for mock auth

    def get_queryset(self):
        entity_id = self.request.query_params.get('entity_id')
        qs = RecurringTransaction.objects.all()
        if entity_id:
            qs = qs.filter(entity_id=entity_id)
        return qs

    def perform_create(self, serializer):
        user = getattr(self.request, 'user', None)
        if user and user.is_authenticated:
            serializer.save(created_by=user)
        else:
            serializer.save()

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
        for rt in RecurringTransaction.objects.all():
            if rt.is_due(as_of):
                tx = rt.create_transaction(run_date=as_of)
                if tx is not None:
                    created.append(tx.id)

        return Response({'created_transaction_ids': created, 'count': len(created), 'as_of_date': as_of.isoformat()})


class TaskRequestViewSet(viewsets.ModelViewSet):
    """Queue-based task management for digital workflows."""

    serializer_class = TaskRequestSerializer
    permission_classes = []  # Temporarily disabled for mock auth

    def get_queryset(self):
        qs = TaskRequest.objects.all()
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
        user = getattr(self.request, 'user', None)
        if user and user.is_authenticated:
            serializer.save(created_by=user)
        else:
            serializer.save()

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

        start_date = payload.get('start_date')
        end_date = payload.get('end_date')

        qs = Transaction.objects.filter(entity_id=entity_id)
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
