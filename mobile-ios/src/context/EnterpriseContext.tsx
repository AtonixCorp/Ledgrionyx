import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AuditEvent, ComplianceDeadline, Entity, Organization, OrgOverview, PlatformTask } from '../types/api';
import * as enterpriseService from '../services/enterprise';
import { getStoredOrganization, setStoredOrganization } from '../services/storage';
import { useAuth } from './AuthContext';

type EnterpriseContextValue = {
    organizations: Organization[];
    currentOrganization: Organization | null;
    orgOverview: OrgOverview | null;
    entities: Entity[];
    tasks: PlatformTask[];
    auditEvents: AuditEvent[];
    complianceDeadlines: ComplianceDeadline[];
    bootstrapping: boolean;
    refreshOrganizations: () => Promise<void>;
    selectOrganization: (org: Organization) => Promise<void>;
    refreshCurrentOrganizationData: () => Promise<void>;
    refreshConsoleData: () => Promise<void>;
    startTask: (taskId: number) => Promise<void>;
    completeTask: (taskId: number) => Promise<void>;
};

const EnterpriseContext = createContext<EnterpriseContextValue | null>(null);

export function EnterpriseProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
    const [orgOverview, setOrgOverview] = useState<OrgOverview | null>(null);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [tasks, setTasks] = useState<PlatformTask[]>([]);
    const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
    const [complianceDeadlines, setComplianceDeadlines] = useState<ComplianceDeadline[]>([]);
    const [bootstrapping, setBootstrapping] = useState(true);

    const refreshConsoleData = async () => {
        if (!user?.id) {
            setTasks([]);
            setAuditEvents([]);
            setComplianceDeadlines([]);
            return;
        }

        const [nextTasks, nextAuditEvents, nextDeadlines] = await Promise.all([
            enterpriseService.getPlatformTasks(user.id, 'open'),
            enterpriseService.getPlatformAuditEvents(user.id),
            enterpriseService.getComplianceDeadlines(30),
        ]);

        setTasks(nextTasks);
        setAuditEvents(nextAuditEvents);
        setComplianceDeadlines(nextDeadlines);
    };

    const refreshCurrentOrganizationData = async () => {
        if (!currentOrganization?.id) {
            setOrgOverview(null);
            setEntities([]);
            return;
        }

        const [overview, orgEntities] = await Promise.all([
            enterpriseService.getOrganizationOverview(currentOrganization.id),
            enterpriseService.getOrganizationEntities(currentOrganization.id),
        ]);
        setOrgOverview(overview);
        setEntities(orgEntities);
    };

    const refreshOrganizations = async () => {
        const orgs = await enterpriseService.getMyOrganizations();
        setOrganizations(orgs);
        if (!orgs.length) {
            setCurrentOrganization(null);
            setOrgOverview(null);
            setEntities([]);
            return;
        }

        const stored = await getStoredOrganization();
        const resolved = orgs.find((org) => org.id === stored?.id) || orgs[0];
        setCurrentOrganization(resolved);
        await setStoredOrganization(resolved);
    };

    useEffect(() => {
        let mounted = true;
        if (!isAuthenticated) {
            setOrganizations([]);
            setCurrentOrganization(null);
            setOrgOverview(null);
            setEntities([]);
            setTasks([]);
            setAuditEvents([]);
            setComplianceDeadlines([]);
            setBootstrapping(false);
            return;
        }

        (async () => {
            try {
                await Promise.all([refreshOrganizations(), refreshConsoleData()]);
            } finally {
                if (mounted) {
                    setBootstrapping(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        if (!currentOrganization?.id) {
            return;
        }

        refreshCurrentOrganizationData().catch(() => {
            setOrgOverview(null);
            setEntities([]);
        });
    }, [currentOrganization?.id]);

    const value = useMemo<EnterpriseContextValue>(() => ({
        organizations,
        currentOrganization,
        orgOverview,
        entities,
        tasks,
        auditEvents,
        complianceDeadlines,
        bootstrapping,
        refreshOrganizations,
        selectOrganization: async (org: Organization) => {
            setCurrentOrganization(org);
            await setStoredOrganization(org);
        },
        refreshCurrentOrganizationData,
        refreshConsoleData,
        startTask: async (taskId: number) => {
            await enterpriseService.startPlatformTask(taskId);
            await refreshConsoleData();
        },
        completeTask: async (taskId: number) => {
            await enterpriseService.completePlatformTask(taskId);
            await refreshConsoleData();
        },
    }), [auditEvents, bootstrapping, complianceDeadlines, currentOrganization, entities, orgOverview, organizations, tasks, user?.id]);

    return <EnterpriseContext.Provider value={value}>{children}</EnterpriseContext.Provider>;
}

export function useEnterprise() {
    const context = useContext(EnterpriseContext);
    if (!context) {
        throw new Error('useEnterprise must be used within EnterpriseProvider');
    }
    return context;
}