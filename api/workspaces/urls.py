"""
Workspace URL patterns.
All routes are scoped under /workspaces/{workspace_id}/...
"""
from django.urls import path

from .views import (
    WorkspaceCalendarEventDetailView,
    WorkspaceCalendarEventListView,
     WorkspaceDepartmentDetailView,
     WorkspaceDepartmentListView,
     WorkspaceDepartmentMemberView,
    WorkspaceFileDetailView,
    WorkspaceFileListView,
    WorkspaceFolderListView,
    WorkspaceListCreateView,
    WorkspaceDetailView,
    WorkspaceLogView,
    WorkspaceMeetingDetailView,
    WorkspaceMeetingListView,
    WorkspaceMemberDetailView,
    WorkspaceMemberListView,
    WorkspaceModuleView,
    WorkspaceMyPermissionsView,
    WorkspaceSettingsView,
    WorkspaceStatusView,
    WorkspaceTierView,
)

def build_workspace_patterns(workspace_pattern, name_suffix=''):
    return [
        path(f'workspaces/{workspace_pattern}', WorkspaceDetailView.as_view(), name=f'workspace-detail{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/tier', WorkspaceTierView.as_view(), name=f'workspace-tier{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/status', WorkspaceStatusView.as_view(), name=f'workspace-status{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/members', WorkspaceMemberListView.as_view(), name=f'workspace-members{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/members/<int:user_id>', WorkspaceMemberDetailView.as_view(), name=f'workspace-member-detail{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/groups', WorkspaceDepartmentListView.as_view(), name=f'workspace-groups{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/groups/<uuid:group_id>', WorkspaceDepartmentDetailView.as_view(), name=f'workspace-group-detail{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/groups/<uuid:group_id>/members', WorkspaceDepartmentMemberView.as_view(), name=f'workspace-group-members{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/groups/<uuid:group_id>/members/<int:user_id>', WorkspaceDepartmentMemberView.as_view(), name=f'workspace-group-member-detail{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/departments', WorkspaceDepartmentListView.as_view(), name=f'workspace-departments{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/departments/<uuid:group_id>', WorkspaceDepartmentDetailView.as_view(), name=f'workspace-department-detail{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/departments/<uuid:group_id>/members', WorkspaceDepartmentMemberView.as_view(), name=f'workspace-department-members{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/departments/<uuid:group_id>/members/<int:user_id>', WorkspaceDepartmentMemberView.as_view(), name=f'workspace-department-member-detail{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/meetings', WorkspaceMeetingListView.as_view(), name=f'workspace-meetings{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/meetings/<uuid:meeting_id>', WorkspaceMeetingDetailView.as_view(), name=f'workspace-meeting-detail{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/calendar/events', WorkspaceCalendarEventListView.as_view(), name=f'workspace-calendar-events{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/calendar/events/<uuid:event_id>', WorkspaceCalendarEventDetailView.as_view(), name=f'workspace-calendar-event-detail{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/files', WorkspaceFileListView.as_view(), name=f'workspace-files{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/files/<uuid:file_id>', WorkspaceFileDetailView.as_view(), name=f'workspace-file-detail{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/folders', WorkspaceFolderListView.as_view(), name=f'workspace-folders{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/modules', WorkspaceModuleView.as_view(), name=f'workspace-modules{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/settings', WorkspaceSettingsView.as_view(), name=f'workspace-settings{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/logs', WorkspaceLogView.as_view(), name=f'workspace-logs{name_suffix}'),
        path(f'workspaces/{workspace_pattern}/permissions/me', WorkspaceMyPermissionsView.as_view(), name=f'workspace-permissions-me{name_suffix}'),
    ]


urlpatterns = [
    path('workspaces', WorkspaceListCreateView.as_view(), name='workspace-list'),
    *build_workspace_patterns('<uuid:workspace_id>'),
    *build_workspace_patterns('<int:workspace_id>', '-entity'),
]
