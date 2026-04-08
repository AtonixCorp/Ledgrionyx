from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date

from finances.models import Entity

from .models import (
    EquityExerciseRequest,
    EquityFundingRound,
    EquityGrant,
    EquityHolding,
    EquityPayrollTaxEvent,
    EquityReport,
    EquityShareCertificate,
    EquityShareClass,
    EquityShareholder,
    EquityTransaction,
    EquityValuation,
    EquityVestingEvent,
    WorkspaceEquityProfile,
)
from .serializers import (
    EquityExerciseRequestSerializer,
    EquityFundingRoundSerializer,
    EquityGrantSerializer,
    EquityHoldingSerializer,
    EquityPayrollTaxEventSerializer,
    EquityReportSerializer,
    EquityShareCertificateSerializer,
    EquityShareClassSerializer,
    EquityShareholderSerializer,
    EquityTransactionSerializer,
    EquityValuationSerializer,
    EquityVestingEventSerializer,
    WorkspaceEquityProfileSerializer,
)
from .services import (
    apply_acceleration,
    apply_termination,
    approve_exercise_request,
    calculate_grant_summary,
    complete_exercise_request,
    create_exercise_request,
    rebuild_vesting_schedule,
    reject_exercise_request,
)


class WorkspaceScopedViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    workspace_lookup_kwarg = 'workspace_id'

    def get_workspace(self):
        return get_object_or_404(Entity, pk=self.kwargs[self.workspace_lookup_kwarg])

    def get_queryset(self):
        return self.queryset.filter(workspace_id=self.kwargs[self.workspace_lookup_kwarg])

    def perform_create(self, serializer):
        serializer.save(workspace=self.get_workspace(), **self.get_create_kwargs())

    def get_create_kwargs(self):
        return {}

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['workspace'] = self.get_workspace()
        return context


class WorkspaceEquityProfileViewSet(WorkspaceScopedViewSet):
    serializer_class = WorkspaceEquityProfileSerializer
    queryset = WorkspaceEquityProfile.objects.select_related('workspace')


class EquityShareholderViewSet(WorkspaceScopedViewSet):
    serializer_class = EquityShareholderSerializer
    queryset = EquityShareholder.objects.select_related('workspace', 'created_by')

    def get_create_kwargs(self):
        return {'created_by': self.request.user}


class EquityShareClassViewSet(WorkspaceScopedViewSet):
    serializer_class = EquityShareClassSerializer
    queryset = EquityShareClass.objects.select_related('workspace')


class EquityHoldingViewSet(WorkspaceScopedViewSet):
    serializer_class = EquityHoldingSerializer
    queryset = EquityHolding.objects.select_related('workspace', 'shareholder', 'share_class')


class EquityFundingRoundViewSet(WorkspaceScopedViewSet):
    serializer_class = EquityFundingRoundSerializer
    queryset = EquityFundingRound.objects.select_related('workspace')


class EquityValuationViewSet(WorkspaceScopedViewSet):
    serializer_class = EquityValuationSerializer
    queryset = EquityValuation.objects.select_related('workspace')


class EquityTransactionViewSet(WorkspaceScopedViewSet):
    serializer_class = EquityTransactionSerializer
    queryset = EquityTransaction.objects.select_related('workspace', 'shareholder', 'share_class', 'created_by')

    def get_create_kwargs(self):
        return {'created_by': self.request.user}


class EquityReportViewSet(WorkspaceScopedViewSet):
    serializer_class = EquityReportSerializer
    queryset = EquityReport.objects.select_related('workspace', 'generated_by')

    def get_create_kwargs(self):
        return {'generated_by': self.request.user}


class EquityGrantViewSet(WorkspaceScopedViewSet):
    serializer_class = EquityGrantSerializer
    queryset = EquityGrant.objects.select_related('workspace', 'shareholder', 'employee', 'share_class', 'created_by')

    def get_create_kwargs(self):
        return {'created_by': self.request.user}

    def perform_create(self, serializer):
        grant = serializer.save(workspace=self.get_workspace(), created_by=self.request.user)
        rebuild_vesting_schedule(grant)

    def perform_update(self, serializer):
        grant = serializer.save()
        rebuild_vesting_schedule(grant)

    @action(detail=True, methods=['get'])
    def summary(self, request, workspace_id=None, pk=None):
        grant = self.get_object()
        return Response(calculate_grant_summary(grant))

    @action(detail=True, methods=['post'])
    def rebuild_schedule(self, request, workspace_id=None, pk=None):
        grant = self.get_object()
        events = rebuild_vesting_schedule(grant)
        return Response(EquityVestingEventSerializer(events, many=True).data)

    @action(detail=True, methods=['post'])
    def terminate(self, request, workspace_id=None, pk=None):
        grant = self.get_object()
        termination_date = parse_date(request.data.get('termination_date') or '')
        if not termination_date:
            return Response({'termination_date': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)
        grant = apply_termination(grant, termination_date)
        return Response(self.get_serializer(grant).data)

    @action(detail=True, methods=['post'])
    def trigger_single(self, request, workspace_id=None, pk=None):
        grant = self.get_object()
        trigger_date = parse_date(request.data.get('trigger_date') or request.data.get('event_date') or '')
        if not trigger_date:
            return Response({'trigger_date': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)
        event = apply_acceleration(grant, 'single-trigger', trigger_date)
        return Response(EquityVestingEventSerializer(event).data if event else {'detail': 'No acceleration units available.'})

    @action(detail=True, methods=['post'])
    def trigger_double(self, request, workspace_id=None, pk=None):
        grant = self.get_object()
        trigger_date = parse_date(request.data.get('trigger_date') or request.data.get('event_date') or '')
        if not trigger_date:
            return Response({'trigger_date': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)
        event = apply_acceleration(grant, 'double-trigger', trigger_date)
        return Response(EquityVestingEventSerializer(event).data if event else {'detail': 'No acceleration units available.'})


class EquityVestingEventViewSet(WorkspaceScopedViewSet):
    serializer_class = EquityVestingEventSerializer
    queryset = EquityVestingEvent.objects.select_related('workspace', 'grant')


class EquityExerciseRequestViewSet(WorkspaceScopedViewSet):
    serializer_class = EquityExerciseRequestSerializer
    queryset = EquityExerciseRequest.objects.select_related(
        'workspace', 'grant', 'shareholder', 'tax_calculation', 'journal_entry', 'created_by'
    ).prefetch_related('approvals')

    def perform_create(self, serializer):
        grant = get_object_or_404(EquityGrant, pk=self.request.data.get('grant'), workspace=self.get_workspace())
        try:
            exercise_request = create_exercise_request(
                grant=grant,
                requested_units=int(self.request.data.get('requested_units') or 0),
                payment_method=self.request.data.get('payment_method') or 'bank_transfer',
                created_by=self.request.user,
                notes=self.request.data.get('notes', ''),
            )
        except ValueError as exc:
            raise ValidationError({'detail': str(exc)}) from exc
        serializer.instance = exercise_request

    @action(detail=True, methods=['post'])
    def approve(self, request, workspace_id=None, pk=None):
        exercise_request = self.get_object()
        try:
            updated = approve_exercise_request(exercise_request, request.user, request.data.get('comments', ''))
        except ValueError as exc:
            raise ValidationError({'detail': str(exc)}) from exc
        return Response(self.get_serializer(updated).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, workspace_id=None, pk=None):
        exercise_request = self.get_object()
        try:
            updated = reject_exercise_request(exercise_request, request.user, request.data.get('comments', ''))
        except ValueError as exc:
            raise ValidationError({'detail': str(exc)}) from exc
        return Response(self.get_serializer(updated).data)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, workspace_id=None, pk=None):
        exercise_request = self.get_object()
        exercise_request.payment_status = request.data.get('payment_status') or 'paid'
        exercise_request.save(update_fields=['payment_status', 'updated_at'])
        return Response(self.get_serializer(exercise_request).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, workspace_id=None, pk=None):
        exercise_request = self.get_object()
        try:
            updated = complete_exercise_request(exercise_request, request.user)
        except ValueError as exc:
            raise ValidationError({'detail': str(exc)}) from exc
        return Response(self.get_serializer(updated).data)


class EquityShareCertificateViewSet(WorkspaceScopedViewSet):
    serializer_class = EquityShareCertificateSerializer
    queryset = EquityShareCertificate.objects.select_related('workspace', 'exercise_request', 'grant', 'issued_to', 'share_class', 'issued_by')


class EquityPayrollTaxEventViewSet(WorkspaceScopedViewSet):
    serializer_class = EquityPayrollTaxEventSerializer
    queryset = EquityPayrollTaxEvent.objects.select_related(
        'workspace', 'grant', 'exercise_request', 'staff', 'source_account', 'destination_account'
    )
