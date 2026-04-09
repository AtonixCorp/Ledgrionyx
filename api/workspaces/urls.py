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

WS = '<uuid:workspace_id>'

urlpatterns = [
    # ── Workspace CRUD ──────────────────────────────────────────────────────
    path('workspaces',                          WorkspaceListCreateView.as_view(),        name='workspace-list'),
    path(f'workspaces/{WS}',                   WorkspaceDetailView.as_view(),             name='workspace-detail'),
    path(f'workspaces/{WS}/tier',              WorkspaceTierView.as_view(),               name='workspace-tier'),
    path(f'workspaces/{WS}/status',            WorkspaceStatusView.as_view(),             name='workspace-status'),

    # ── Members ─────────────────────────────────────────────────────────────
    path(f'workspaces/{WS}/members',           WorkspaceMemberListView.as_view(),         name='workspace-members'),
    path(f'workspaces/{WS}/members/<int:user_id>', WorkspaceMemberDetailView.as_view(),   name='workspace-member-detail'),

    # ── Groups / Departments ───────────────────────────────────────────────
    path(f'workspaces/{WS}/groups',            WorkspaceDepartmentListView.as_view(),      name='workspace-groups'),
    path(f'workspaces/{WS}/groups/<uuid:group_id>', WorkspaceDepartmentDetailView.as_view(), name='workspace-group-detail'),
    path(f'workspaces/{WS}/groups/<uuid:group_id>/members',
         WorkspaceDepartmentMemberView.as_view(),                                           name='workspace-group-members'),
    path(f'workspaces/{WS}/groups/<uuid:group_id>/members/<int:user_id>',
         WorkspaceDepartmentMemberView.as_view(),                                           name='workspace-group-member-detail'),
    path(f'workspaces/{WS}/departments',       WorkspaceDepartmentListView.as_view(),      name='workspace-departments'),
    path(f'workspaces/{WS}/departments/<uuid:group_id>', WorkspaceDepartmentDetailView.as_view(), name='workspace-department-detail'),
    path(f'workspaces/{WS}/departments/<uuid:group_id>/members',
         WorkspaceDepartmentMemberView.as_view(),                                           name='workspace-department-members'),
    path(f'workspaces/{WS}/departments/<uuid:group_id>/members/<int:user_id>',
         WorkspaceDepartmentMemberView.as_view(),                                           name='workspace-department-member-detail'),

    # ── Meetings ────────────────────────────────────────────────────────────
    path(f'workspaces/{WS}/meetings',          WorkspaceMeetingListView.as_view(),        name='workspace-meetings'),
    path(f'workspaces/{WS}/meetings/<uuid:meeting_id>', WorkspaceMeetingDetailView.as_view(), name='workspace-meeting-detail'),

    # ── Calendar ────────────────────────────────────────────────────────────
    path(f'workspaces/{WS}/calendar/events',   WorkspaceCalendarEventListView.as_view(),  name='workspace-calendar-events'),
    path(f'workspaces/{WS}/calendar/events/<uuid:event_id>',
         WorkspaceCalendarEventDetailView.as_view(),                                       name='workspace-calendar-event-detail'),

    # ── Files ───────────────────────────────────────────────────────────────
    path(f'workspaces/{WS}/files',             WorkspaceFileListView.as_view(),           name='workspace-files'),
    path(f'workspaces/{WS}/files/<uuid:file_id>', WorkspaceFileDetailView.as_view(),      name='workspace-file-detail'),

    # ── Folders ─────────────────────────────────────────────────────────────
    path(f'workspaces/{WS}/folders',           WorkspaceFolderListView.as_view(),         name='workspace-folders'),

    # ── Modules ─────────────────────────────────────────────────────────────
    path(f'workspaces/{WS}/modules',           WorkspaceModuleView.as_view(),             name='workspace-modules'),

    # ── Settings ────────────────────────────────────────────────────────────
    path(f'workspaces/{WS}/settings',          WorkspaceSettingsView.as_view(),           name='workspace-settings'),

    # ── Logs ────────────────────────────────────────────────────────────────
    path(f'workspaces/{WS}/logs',              WorkspaceLogView.as_view(),                name='workspace-logs'),

    # ── Permissions ─────────────────────────────────────────────────────────
    path(f'workspaces/{WS}/permissions/me',    WorkspaceMyPermissionsView.as_view(),      name='workspace-permissions-me'),
]
