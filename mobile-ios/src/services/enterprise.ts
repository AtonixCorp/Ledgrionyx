import type { AuditEvent, ComplianceDeadline, Entity, Organization, OrgOverview, PlatformTask } from '../types/api';
import { api } from './api';

function normalizeCollection<T>(payload: any): T[] {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (Array.isArray(payload?.results)) {
        return payload.results;
    }
    return [];
}

export async function getMyOrganizations(): Promise<Organization[]> {
    const response = await api.get('/organizations/my_organizations/');
    return Array.isArray(response.data) ? response.data : response.data?.results || [];
}

export async function getOrganizationOverview(orgId: number): Promise<OrgOverview | null> {
    const response = await api.get(`/organizations/${orgId}/overview/`);
    return response.data || null;
}

export async function getOrganizationEntities(orgId: number): Promise<Entity[]> {
    const response = await api.get(`/entities/?organization_id=${orgId}`);
    return Array.isArray(response.data) ? response.data : response.data?.results || [];
}

export async function getPlatformTasks(userId?: number, state = 'open'): Promise<PlatformTask[]> {
    const response = await api.get('/platform-tasks/', {
        params: {
            assignee_id: userId,
            state: state === 'all' ? undefined : state,
        },
    });
    return normalizeCollection<PlatformTask>(response.data);
}

export async function getPlatformAuditEvents(userId?: number): Promise<AuditEvent[]> {
    const response = await api.get('/platform-audit-events/', {
        params: {
            actor_id: userId,
        },
    });
    return normalizeCollection<AuditEvent>(response.data);
}

export async function getComplianceDeadlines(days = 30): Promise<ComplianceDeadline[]> {
    const response = await api.get(`/compliance-deadlines/upcoming/?days=${days}`);
    return normalizeCollection<ComplianceDeadline>(response.data);
}

export async function startPlatformTask(taskId: number) {
    return api.post(`/platform-tasks/${taskId}/start/`);
}

export async function completePlatformTask(taskId: number) {
    return api.post(`/platform-tasks/${taskId}/complete/`, {});
}