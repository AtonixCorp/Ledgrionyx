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
    EntityRole, EntityStaff, BankAccount, Wallet, ComplianceDocument
)
from .serializers import (
    OrganizationSerializer, EntitySerializer, EntityDetailSerializer,
    TeamMemberSerializer, RoleSerializer, PermissionSerializer,
    TaxExposureSerializer, ComplianceDeadlineSerializer,
    CashflowForecastSerializer, AuditLogSerializer, OrgOverviewSerializer,
    EntityDepartmentSerializer, EntityRoleSerializer, EntityStaffSerializer,
    BankAccountSerializer, WalletSerializer, ComplianceDocumentSerializer
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
