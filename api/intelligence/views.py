from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from workspaces.services import PermissionService, WorkspaceService

from .models import AIInteraction
from .serializers import (
    AIInteractionFeedbackSerializer,
    AIInteractionSerializer,
    TaxTreatmentRequestSerializer,
    WorkspaceAIPrecedentSerializer,
    WorkspaceAIProfileSerializer,
)
from .services import AIOrchestrationService, WorkspaceIntelligenceService


def _resolve_workspace(request, workspace_id):
    workspace_pk = WorkspaceService.resolve_workspace_id(workspace_id)
    PermissionService.assert_member(workspace_pk, request.user)
    return WorkspaceService.get_workspace(workspace_pk, request.user)


class WorkspaceAIProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, workspace_id):
        workspace = _resolve_workspace(request, workspace_id)
        profile = WorkspaceIntelligenceService.get_or_create_profile(workspace)
        return Response(WorkspaceAIProfileSerializer(profile).data)

    def patch(self, request, workspace_id):
        workspace = _resolve_workspace(request, workspace_id)
        profile = WorkspaceIntelligenceService.get_or_create_profile(workspace)
        serializer = WorkspaceAIProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class WorkspaceAITaxTreatmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, workspace_id):
        workspace = _resolve_workspace(request, workspace_id)
        serializer = TaxTreatmentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response_payload = AIOrchestrationService.explain_tax_treatment(
            workspace=workspace,
            user=request.user,
            payload=serializer.validated_data,
        )
        return Response(response_payload)


class WorkspaceAIInteractionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, workspace_id):
        workspace = _resolve_workspace(request, workspace_id)
        queryset = AIInteraction.objects.filter(workspace=workspace).select_related('organization', 'entity', 'user')[:100]
        return Response(AIInteractionSerializer(queryset, many=True).data)


class WorkspaceAIInteractionFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, workspace_id, interaction_id):
        workspace = _resolve_workspace(request, workspace_id)
        serializer = AIInteractionFeedbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        interaction = get_object_or_404(AIInteraction, pk=interaction_id, workspace=workspace)
        precedent = AIOrchestrationService.capture_feedback(
            interaction=interaction,
            outcome=serializer.validated_data['outcome'],
            override_treatment=serializer.validated_data.get('override_treatment'),
            reason=serializer.validated_data.get('reason', ''),
        )
        return Response(WorkspaceAIPrecedentSerializer(precedent).data)
