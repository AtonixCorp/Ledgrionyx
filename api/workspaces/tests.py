from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import WorkspaceMember
from .services import WorkspaceService


class WorkspaceGroupAndMeetingAPITests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username='workspace-owner',
            email='workspace-owner@example.com',
            password='password123',
        )
        self.member = User.objects.create_user(
            username='workspace-member',
            email='workspace-member@example.com',
            password='password123',
        )
        self.workspace = WorkspaceService.create_workspace(
            self.owner,
            {'name': 'Workspace Ops', 'description': 'Testing workspace lifecycle'},
        )
        WorkspaceMember.objects.create(workspace=self.workspace, user=self.member, role='member')
        self.client.force_authenticate(self.owner)

    def test_group_can_be_created_updated_and_deleted(self):
        create_response = self.client.post(
            f'/api/v1/workspaces/{self.workspace.id}/groups',
            {'name': 'Board Group', 'description': 'Initial review group'},
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        group_id = create_response.data['id']

        update_response = self.client.patch(
            f'/api/v1/workspaces/{self.workspace.id}/groups/{group_id}',
            {'name': 'Board Review Group', 'description': 'Updated review group'},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['name'], 'Board Review Group')

        delete_response = self.client.delete(f'/api/v1/workspaces/{self.workspace.id}/groups/{group_id}')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_meeting_can_be_created_updated_and_cancelled(self):
        start_at = timezone.now() + timedelta(days=2)
        end_at = start_at + timedelta(hours=1)
        create_response = self.client.post(
            f'/api/v1/workspaces/{self.workspace.id}/meetings',
            {
                'title': 'Quarterly Review',
                'description': 'Review capital plan',
                'start_at': start_at.isoformat(),
                'end_at': end_at.isoformat(),
            },
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        meeting_id = create_response.data['id']

        update_response = self.client.patch(
            f'/api/v1/workspaces/{self.workspace.id}/meetings/{meeting_id}',
            {'title': 'Quarterly Finance Review'},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['title'], 'Quarterly Finance Review')

        delete_response = self.client.delete(f'/api/v1/workspaces/{self.workspace.id}/meetings/{meeting_id}')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)