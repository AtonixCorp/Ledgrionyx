from django.contrib import admin
from .models import (
    Workspace, WorkspaceMember, WorkspaceGroup, WorkspaceGroupMember,
    WorkspaceMeeting, WorkspaceMeetingParticipant, WorkspaceCalendarEvent,
    WorkspaceFile, WorkspaceFolder, WorkspaceModule, WorkspaceSetting, WorkspaceLog,
)


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display  = ('name', 'owner', 'tier', 'status', 'created_at')
    list_filter   = ('tier', 'status')
    search_fields = ('name', 'owner__email')
    ordering      = ('-created_at',)


@admin.register(WorkspaceMember)
class WorkspaceMemberAdmin(admin.ModelAdmin):
    list_display  = ('user', 'workspace', 'role', 'created_at')
    list_filter   = ('role',)
    search_fields = ('user__email', 'workspace__name')


@admin.register(WorkspaceGroup)
class WorkspaceGroupAdmin(admin.ModelAdmin):
    list_display  = ('name', 'workspace', 'created_at')
    search_fields = ('name', 'workspace__name')


@admin.register(WorkspaceGroupMember)
class WorkspaceGroupMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'group')


@admin.register(WorkspaceMeeting)
class WorkspaceMeetingAdmin(admin.ModelAdmin):
    list_display  = ('title', 'workspace', 'start_at', 'end_at', 'created_by')
    list_filter   = ('workspace',)
    search_fields = ('title',)


@admin.register(WorkspaceMeetingParticipant)
class WorkspaceMeetingParticipantAdmin(admin.ModelAdmin):
    list_display = ('user', 'meeting', 'status')


@admin.register(WorkspaceCalendarEvent)
class WorkspaceCalendarEventAdmin(admin.ModelAdmin):
    list_display  = ('title', 'workspace', 'type', 'start_at', 'end_at')
    list_filter   = ('type',)
    search_fields = ('title',)


@admin.register(WorkspaceFolder)
class WorkspaceFolderAdmin(admin.ModelAdmin):
    list_display = ('name', 'workspace', 'parent')


@admin.register(WorkspaceFile)
class WorkspaceFileAdmin(admin.ModelAdmin):
    list_display  = ('name', 'workspace', 'folder', 'size', 'mime_type', 'uploaded_by', 'created_at')
    search_fields = ('name',)


@admin.register(WorkspaceModule)
class WorkspaceModuleAdmin(admin.ModelAdmin):
    list_display = ('module_key', 'workspace', 'enabled')
    list_filter  = ('enabled',)


@admin.register(WorkspaceSetting)
class WorkspaceSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'workspace')


@admin.register(WorkspaceLog)
class WorkspaceLogAdmin(admin.ModelAdmin):
    list_display  = ('action', 'actor', 'workspace', 'created_at')
    list_filter   = ('workspace',)
    search_fields = ('action',)
    ordering      = ('-created_at',)
