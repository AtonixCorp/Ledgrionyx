from django.urls import path

from .views import (
    WorkspaceAIInteractionFeedbackView,
    WorkspaceAIInteractionListView,
    WorkspaceAIProfileView,
    WorkspaceAITaxTreatmentView,
)


def build_intelligence_patterns(workspace_pattern, name_suffix=''):
    return [
        path(f'workspaces/{workspace_pattern}/ai/profile', WorkspaceAIProfileView.as_view(), name=f'workspace-ai-profile{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/ai/tax-treatment', WorkspaceAITaxTreatmentView.as_view(), name=f'workspace-ai-tax-treatment{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/ai/interactions', WorkspaceAIInteractionListView.as_view(), name=f'workspace-ai-interactions{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/ai/interactions/<uuid:interaction_id>/feedback', WorkspaceAIInteractionFeedbackView.as_view(), name=f'workspace-ai-interaction-feedback{name_suffix}'),
    ]


urlpatterns = [
    *build_intelligence_patterns('<uuid:workspace_id>'),
    *build_intelligence_patterns('<int:workspace_id>', '-entity'),
]
