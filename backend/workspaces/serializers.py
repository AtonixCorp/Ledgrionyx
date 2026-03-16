"""
Workspace serializers.
Input serializers validate incoming payloads.
Output serializers render clean API responses.
"""
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Workspace, WorkspaceMember, WorkspaceGroup, WorkspaceGroupMember,
    WorkspaceMeeting, WorkspaceMeetingParticipant,
    WorkspaceCalendarEvent, WorkspaceFile, WorkspaceFolder,
    WorkspaceModule, WorkspaceSetting, WorkspaceLog,
)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


# ─────────────────────────────────────────────────────────────────────────────
# Workspace
# ─────────────────────────────────────────────────────────────────────────────

class WorkspaceSerializer(serializers.ModelSerializer):
    owner = UserBriefSerializer(read_only=True)

    class Meta:
        model  = Workspace
        fields = ('id', 'owner', 'name', 'description', 'tier', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')


class WorkspaceCreateSerializer(serializers.Serializer):
    name        = serializers.CharField(max_length=255)
    description = serializers.CharField(allow_blank=True, required=False, default='')
    tier        = serializers.ChoiceField(
        choices=['free', 'pro', 'enterprise'],
        required=False,
        default='free',
    )


class WorkspaceUpdateSerializer(serializers.Serializer):
    name        = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(allow_blank=True, required=False)


class TierUpdateSerializer(serializers.Serializer):
    tier = serializers.ChoiceField(choices=['free', 'pro', 'enterprise'])


class StatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['active', 'suspended', 'archived', 'deleted'])


# ─────────────────────────────────────────────────────────────────────────────
# Members
# ─────────────────────────────────────────────────────────────────────────────

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user = UserBriefSerializer(read_only=True)

    class Meta:
        model  = WorkspaceMember
        fields = ('id', 'user', 'role', 'created_at')
        read_only_fields = ('id', 'created_at')


class MemberAddSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    role    = serializers.ChoiceField(choices=['admin', 'member', 'viewer'])


class MemberRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=['admin', 'member', 'viewer'])


# ─────────────────────────────────────────────────────────────────────────────
# Groups
# ─────────────────────────────────────────────────────────────────────────────

class WorkspaceGroupMemberSerializer(serializers.ModelSerializer):
    user = UserBriefSerializer(read_only=True)

    class Meta:
        model  = WorkspaceGroupMember
        fields = ('id', 'user')


class WorkspaceGroupSerializer(serializers.ModelSerializer):
    members = WorkspaceGroupMemberSerializer(source='group_members', many=True, read_only=True)

    class Meta:
        model  = WorkspaceGroup
        fields = ('id', 'name', 'description', 'created_at', 'members')
        read_only_fields = ('id', 'created_at')


class GroupCreateSerializer(serializers.Serializer):
    name        = serializers.CharField(max_length=255)
    description = serializers.CharField(allow_blank=True, required=False, default='')


class GroupMemberSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()


# ─────────────────────────────────────────────────────────────────────────────
# Meetings
# ─────────────────────────────────────────────────────────────────────────────

class WorkspaceMeetingParticipantSerializer(serializers.ModelSerializer):
    user = UserBriefSerializer(read_only=True)

    class Meta:
        model  = WorkspaceMeetingParticipant
        fields = ('id', 'user', 'status')


class WorkspaceMeetingSerializer(serializers.ModelSerializer):
    created_by   = UserBriefSerializer(read_only=True)
    participants = WorkspaceMeetingParticipantSerializer(many=True, read_only=True)

    class Meta:
        model  = WorkspaceMeeting
        fields = ('id', 'title', 'description', 'start_at', 'end_at', 'created_by', 'participants', 'created_at')
        read_only_fields = ('id', 'created_by', 'created_at')


class MeetingCreateSerializer(serializers.Serializer):
    title       = serializers.CharField(max_length=255)
    description = serializers.CharField(allow_blank=True, required=False, default='')
    start_at    = serializers.DateTimeField()
    end_at      = serializers.DateTimeField()

    def validate(self, data):
        if data['end_at'] <= data['start_at']:
            raise serializers.ValidationError('end_at must be after start_at.')
        return data


class MeetingUpdateSerializer(serializers.Serializer):
    title       = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    start_at    = serializers.DateTimeField(required=False)
    end_at      = serializers.DateTimeField(required=False)


# ─────────────────────────────────────────────────────────────────────────────
# Calendar
# ─────────────────────────────────────────────────────────────────────────────

class WorkspaceCalendarEventSerializer(serializers.ModelSerializer):
    created_by = UserBriefSerializer(read_only=True)

    class Meta:
        model  = WorkspaceCalendarEvent
        fields = ('id', 'title', 'description', 'start_at', 'end_at', 'type', 'created_by', 'created_at')
        read_only_fields = ('id', 'created_by', 'created_at')


class CalendarEventCreateSerializer(serializers.Serializer):
    title       = serializers.CharField(max_length=255)
    description = serializers.CharField(allow_blank=True, required=False, default='')
    start_at    = serializers.DateTimeField()
    end_at      = serializers.DateTimeField()
    type        = serializers.ChoiceField(choices=['meeting', 'reminder', 'task', 'custom'], required=False, default='custom')

    def validate(self, data):
        if data['end_at'] <= data['start_at']:
            raise serializers.ValidationError('end_at must be after start_at.')
        return data


class CalendarEventUpdateSerializer(serializers.Serializer):
    title       = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    start_at    = serializers.DateTimeField(required=False)
    end_at      = serializers.DateTimeField(required=False)
    type        = serializers.ChoiceField(choices=['meeting', 'reminder', 'task', 'custom'], required=False)


# ─────────────────────────────────────────────────────────────────────────────
# Files & Folders
# ─────────────────────────────────────────────────────────────────────────────

class WorkspaceFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model  = WorkspaceFolder
        fields = ('id', 'name', 'parent')
        read_only_fields = ('id',)


class WorkspaceFileSerializer(serializers.ModelSerializer):
    uploaded_by = UserBriefSerializer(read_only=True)

    class Meta:
        model  = WorkspaceFile
        fields = ('id', 'name', 'path', 'size', 'mime_type', 'folder', 'uploaded_by', 'created_at')
        read_only_fields = ('id', 'path', 'uploaded_by', 'created_at')


class FolderCreateSerializer(serializers.Serializer):
    name      = serializers.CharField(max_length=255)
    parent_id = serializers.UUIDField(required=False, allow_null=True)


class FileUploadSerializer(serializers.Serializer):
    name      = serializers.CharField(max_length=255)
    size      = serializers.IntegerField(min_value=0)
    mime_type = serializers.CharField(max_length=127, required=False, default='')
    folder_id = serializers.UUIDField(required=False, allow_null=True)


# ─────────────────────────────────────────────────────────────────────────────
# Modules
# ─────────────────────────────────────────────────────────────────────────────

class WorkspaceModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = WorkspaceModule
        fields = ('id', 'module_key', 'enabled')
        read_only_fields = ('id',)


class ModulesUpdateSerializer(serializers.Serializer):
    """
    Payload: { "module_key": true/false, ... }
    Accepts any key; unknown module keys will be created on-the-fly.
    """
    def to_internal_value(self, data):
        if not isinstance(data, dict):
            raise serializers.ValidationError('Expected a JSON object.')
        for key, value in data.items():
            if not isinstance(value, bool):
                raise serializers.ValidationError(f'Value for "{key}" must be a boolean.')
        return data


# ─────────────────────────────────────────────────────────────────────────────
# Settings
# ─────────────────────────────────────────────────────────────────────────────

class WorkspaceSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = WorkspaceSetting
        fields = ('id', 'key', 'value')
        read_only_fields = ('id',)


# ─────────────────────────────────────────────────────────────────────────────
# Logs
# ─────────────────────────────────────────────────────────────────────────────

class WorkspaceLogSerializer(serializers.ModelSerializer):
    actor = UserBriefSerializer(read_only=True)

    class Meta:
        model  = WorkspaceLog
        fields = ('id', 'actor', 'action', 'metadata', 'created_at')
        read_only_fields = ('id', 'actor', 'action', 'metadata', 'created_at')
