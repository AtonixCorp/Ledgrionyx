import React, { createContext, useState, useContext, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';

const EnterpriseContext = createContext();

export const useEnterprise = () => {
  const context = useContext(EnterpriseContext);
  if (!context) {
    throw new Error('useEnterprise must be used within EnterpriseProvider');
  }
  return context;
};

export const EnterpriseProvider = ({ children }) => {
  const { user } = useAuth();
  const dashboardCacheRef = useRef(new Map());
  const dashboardInflightRef = useRef(new Map());
  const organizationPrefetchRef = useRef(new Map());

  const DASHBOARD_CACHE_TTL_MS = 60 * 1000;
  const ORG_PREFETCH_THROTTLE_MS = 15 * 1000;

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '');

  const apiUrl = useCallback(
    (path) => {
      if (!path) return API_BASE_URL;
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    },
    [API_BASE_URL]
  );

  const buildAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Organization state
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Entities
  const [entities, setEntities] = useState([]);
  const [selectedEntities, setSelectedEntities] = useState([]);

  // Team
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Permissions
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);

  // Dashboard data
  const [orgOverview, setOrgOverview] = useState(null);
  const [taxExposures, setTaxExposures] = useState([]);
  const [complianceDeadlines, setComplianceDeadlines] = useState([]);
  const [cashflowData, setCashflowData] = useState([]);

  // Constants for role hierarchy
  const ROLES = useMemo(() => ({
    ORG_OWNER: 'ORG_OWNER',
    CFO: 'CFO',
    FINANCE_ANALYST: 'FINANCE_ANALYST',
    VIEWER: 'VIEWER',
    EXTERNAL_ADVISOR: 'EXTERNAL_ADVISOR',
  }), []);

  const PERMISSIONS = useMemo(() => ({
    // Org
    VIEW_ORG_OVERVIEW: 'view_org_overview',
    MANAGE_ORG_SETTINGS: 'manage_org_settings',
    MANAGE_BILLING: 'manage_billing',

    // Entity
    VIEW_ENTITIES: 'view_entities',
    CREATE_ENTITY: 'create_entity',
    EDIT_ENTITY: 'edit_entity',
    DELETE_ENTITY: 'delete_entity',

    // Tax
    VIEW_TAX_COMPLIANCE: 'view_tax_compliance',
    EDIT_TAX_COMPLIANCE: 'edit_tax_compliance',
    EXPORT_TAX_REPORTS: 'export_tax_reports',

    // Cashflow
    VIEW_CASHFLOW: 'view_cashflow',
    EDIT_CASHFLOW: 'edit_cashflow',

    // Risk
    VIEW_RISK_EXPOSURE: 'view_risk_exposure',
    EDIT_RISK_EXPOSURE: 'edit_risk_exposure',

    // Reports
    VIEW_REPORTS: 'view_reports',
    GENERATE_REPORTS: 'generate_reports',
    EXPORT_REPORTS: 'export_reports',

    // Team
    VIEW_TEAM: 'view_team',
    MANAGE_TEAM: 'manage_team',
    ASSIGN_ROLES: 'assign_roles',
  }), []);

  /**
   * Initialize enterprise data for user
   */
  useEffect(() => {
    if (user && user.account_type === 'enterprise') {
      setCurrentUserRole(ROLES.ORG_OWNER);
      setRoles(Object.values(ROLES));
      setPermissions(Object.values(PERMISSIONS));
    }
  }, [user, ROLES, PERMISSIONS]);

  /**
   * Fetch organizations for current user
   */
  const fetchOrganizations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/organizations/my_organizations/'), {
        headers: {
          ...buildAuthHeaders(),
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
        if (data.length > 0 && !currentOrganization) {
          setCurrentOrganization(data[0]);
        }
      } else {
        setOrganizations([]);
      }
    } catch (err) {
      setError('Failed to fetch organizations');
      console.error(err);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [user, currentOrganization, apiUrl, buildAuthHeaders]);

  useEffect(() => {
    if (!user || user.account_type !== 'enterprise') return;
    fetchOrganizations();
  }, [user, fetchOrganizations]);

  /**
   * Fetch organization overview/dashboard
   */
  const fetchOrgOverview = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const response = await fetch(apiUrl(`/api/organizations/${orgId}/overview/`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setOrgOverview(data);
      } else {
        setOrgOverview(null);
      }
    } catch (err) {
      console.error('Failed to fetch org overview:', err);
      setOrgOverview(null);
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch entities for organization
   */
  const fetchEntities = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const response = await fetch(apiUrl(`/api/entities/?organization_id=${orgId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setEntities(Array.isArray(data) ? data : data.results || []);
      } else {
        setEntities([]);
      }
    } catch (err) {
      console.error('Failed to fetch entities:', err);
      setEntities([]);
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch team members
   */
  const fetchTeamMembers = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const response = await fetch(apiUrl(`/api/team-members/?organization_id=${orgId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(Array.isArray(data) ? data : data.results || []);

        // Find current user's role
        const currentMember = (Array.isArray(data) ? data : data.results || []).find(
          m => m.user_email === user?.email
        );
        if (currentMember) {
          setCurrentUserRole(currentMember.role_code);
        }
      } else {
        setTeamMembers([]);
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
      setTeamMembers([]);
    }
  }, [apiUrl, buildAuthHeaders, user]);

  /**
   * Fetch tax compliance data
   */
  const fetchTaxExposures = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const response = await fetch(apiUrl(`/api/tax-exposures/by_country/?organization_id=${orgId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setTaxExposures(data);
      } else {
        setTaxExposures([]);
      }
    } catch (err) {
      console.error('Failed to fetch tax exposures:', err);
      setTaxExposures([]);
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch compliance deadlines
   */
  const fetchComplianceDeadlines = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const response = await fetch(apiUrl(`/api/compliance-deadlines/upcoming/?organization_id=${orgId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setComplianceDeadlines(Array.isArray(data) ? data : data.results || []);
      } else {
        setComplianceDeadlines([]);
      }
    } catch (err) {
      console.error('Failed to fetch compliance deadlines:', err);
      setComplianceDeadlines([]);
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch cashflow forecast
   */
  const fetchCashflowData = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const response = await fetch(apiUrl(`/api/cashflow-forecasts/by_category/?organization_id=${orgId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCashflowData(Array.isArray(data) ? data : data.results || []);
      } else {
        // Use empty array as fallback for cashflow (pages handle their own empty state)
        setCashflowData([]);
      }
    } catch (err) {
      console.error('Failed to fetch cashflow data, using empty array:', err);
      // Use empty array as fallback for cashflow (pages handle their own empty state)
      setCashflowData([]);
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch risk & exposure dashboard data for an organization
   */
  const fetchRiskExposureDashboard = useCallback(async (orgId) => {
    if (!orgId) return null;
    try {
      const response = await fetch(apiUrl(`/api/organizations/${orgId}/risk_exposure/`), {
        headers: buildAuthHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (err) {
      console.error('Failed to fetch risk exposure dashboard:', err);
      return null;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch consolidated accounting dashboard for organization with in-memory cache.
   */
  const fetchOrganizationAccountingDashboard = useCallback(async (orgId, options = {}) => {
    if (!orgId) return null;

    const { forceRefresh = false } = options;
    const cacheKey = String(orgId);
    const now = Date.now();
    const cached = dashboardCacheRef.current.get(cacheKey);

    if (!forceRefresh && cached && now - cached.timestamp < DASHBOARD_CACHE_TTL_MS) {
      return cached.data;
    }

    if (!forceRefresh && dashboardInflightRef.current.has(cacheKey)) {
      return dashboardInflightRef.current.get(cacheKey);
    }

    const requestPromise = fetch(apiUrl(`/api/organizations/${orgId}/accounting_dashboard/`), {
      headers: buildAuthHeaders(),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch organization accounting dashboard');
        }

        const data = await response.json();
        dashboardCacheRef.current.set(cacheKey, {
          timestamp: Date.now(),
          data,
        });
        return data;
      })
      .finally(() => {
        dashboardInflightRef.current.delete(cacheKey);
      });

    dashboardInflightRef.current.set(cacheKey, requestPromise);
    return requestPromise;
  }, [apiUrl, buildAuthHeaders, DASHBOARD_CACHE_TTL_MS]);

  /**
   * Check if current user has permission
   */
  const hasPermission = useCallback((permissionCode) => {
    // For now, use role-based simple check
    // In production, you'd validate against the permissions array from API
    const rolePermissionMap = {
      ORG_OWNER: Object.values(PERMISSIONS),
      CFO: Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.MANAGE_BILLING),
      FINANCE_ANALYST: [
        PERMISSIONS.VIEW_ORG_OVERVIEW,
        PERMISSIONS.VIEW_ENTITIES,
        PERMISSIONS.CREATE_ENTITY,
        PERMISSIONS.EDIT_ENTITY,
        PERMISSIONS.VIEW_TAX_COMPLIANCE,
        PERMISSIONS.EDIT_TAX_COMPLIANCE,
        PERMISSIONS.VIEW_CASHFLOW,
        PERMISSIONS.EDIT_CASHFLOW,
        PERMISSIONS.VIEW_RISK_EXPOSURE,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.GENERATE_REPORTS,
      ],
      VIEWER: [
        PERMISSIONS.VIEW_ORG_OVERVIEW,
        PERMISSIONS.VIEW_ENTITIES,
        PERMISSIONS.VIEW_TAX_COMPLIANCE,
        PERMISSIONS.VIEW_CASHFLOW,
        PERMISSIONS.VIEW_RISK_EXPOSURE,
        PERMISSIONS.VIEW_REPORTS,
      ],
      EXTERNAL_ADVISOR: [
        PERMISSIONS.VIEW_TAX_COMPLIANCE,
        PERMISSIONS.VIEW_REPORTS,
      ],
    };

    const userPermissions = rolePermissionMap[currentUserRole] || [];
    return userPermissions.includes(permissionCode);
  }, [currentUserRole, PERMISSIONS]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((roleCode) => {
    return currentUserRole === roleCode;
  }, [currentUserRole]);

  /**
   * Switch to different organization
   */
  const switchOrganization = useCallback((org) => {
    setCurrentOrganization(org);
    const cacheKey = String(org.id);
    const now = Date.now();
    const lastPrefetchAt = organizationPrefetchRef.current.get(cacheKey) || 0;

    if (now - lastPrefetchAt < ORG_PREFETCH_THROTTLE_MS) {
      return;
    }

    organizationPrefetchRef.current.set(cacheKey, now);

    fetchOrgOverview(org.id);
    fetchEntities(org.id);
    fetchTeamMembers(org.id);
    fetchTaxExposures(org.id);
    fetchComplianceDeadlines(org.id);
    fetchCashflowData(org.id);
    fetchOrganizationAccountingDashboard(org.id).catch(() => null);
  }, [fetchOrgOverview, fetchEntities, fetchTeamMembers, fetchTaxExposures, fetchComplianceDeadlines, fetchCashflowData, fetchOrganizationAccountingDashboard, ORG_PREFETCH_THROTTLE_MS]);

  /**
   * Create new organization
   */
  const createOrganization = useCallback(async (orgData) => {
    try {
      const response = await fetch(apiUrl('/api/organizations/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(orgData),
      });

      if (response.ok) {
        const newOrg = await response.json();
        setOrganizations([...organizations, newOrg]);
        switchOrganization(newOrg);
        return newOrg;
      } else {
        throw new Error('Failed to create organization');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, [apiUrl, buildAuthHeaders, organizations, switchOrganization]);

  /**
   * Update organization settings
   */
  const updateOrganization = useCallback(async (orgId, updates) => {
    if (!orgId) throw new Error('Organization id is required');
    try {
      const response = await fetch(apiUrl(`/api/organizations/${orgId}/`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(updates || {}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to update organization');
      }

      const updatedOrg = await response.json();
      setOrganizations(prev => prev.map(o => (o.id === updatedOrg.id ? updatedOrg : o)));
      setCurrentOrganization(prev => (prev && prev.id === updatedOrg.id ? updatedOrg : prev));
      return updatedOrg;
    } catch (err) {
      setError(err.message);
      console.error(err);
      throw err;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Create new entity
   */
  const createEntity = useCallback(async (entityData) => {
    try {
      const response = await fetch(apiUrl('/api/entities/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(entityData),
      });

      if (response.ok) {
        const newEntity = await response.json();
        console.log('Entity created successfully:', newEntity);
        // Refresh authoritative list from server to avoid local-state drift
        try {
          if (entityData.organization_id) {
            await fetchEntities(entityData.organization_id);
          } else {
            setEntities(prev => [...prev, newEntity]);
          }
        } catch (err) {
          // fallback to local update
          setEntities(prev => [...prev, newEntity]);
        }

        return newEntity;
      } else {
        // Try to parse error response
        let errorMessage = 'Failed to create entity';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        console.error('Entity creation failed:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      setError(err.message);
      console.error('Entity creation error:', err);
      throw err; // Re-throw so the component can handle it
    }
  }, [apiUrl, buildAuthHeaders, fetchEntities]);

  /**
   * Add team member
   */
  const addTeamMember = useCallback(async (memberData) => {
    try {
      const response = await fetch('/api/team-members/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      if (response.ok) {
        const newMember = await response.json();
        setTeamMembers([...teamMembers, newMember]);
        return newMember;
      } else {
        throw new Error('Failed to add team member');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, [teamMembers]);

  /**
   * Entity-specific financial operations
   */

  /**
   * Fetch entity-specific expenses
   */
  const fetchEntityExpenses = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(apiUrl(`/api/expenses/?entity_id=${entityId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity expenses:', err);
    }
    return [];
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch entity-specific income
   */
  const fetchEntityIncome = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(apiUrl(`/api/income/?entity_id=${entityId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity income:', err);
    }
    return [];
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch entity-specific budgets
   */
  const fetchEntityBudgets = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(apiUrl(`/api/budgets/?entity_id=${entityId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity budgets:', err);
    }
    return [];
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Create entity-specific expense
   */
  const createEntityExpense = useCallback(async (entityId, expenseData) => {
    try {
      const response = await fetch(apiUrl('/api/expenses/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify({ ...expenseData, entity_id: entityId }),
      });

      if (response.ok) {
        const newExpense = await response.json();
        return newExpense;
      } else {
        throw new Error('Failed to create entity expense');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Create entity-specific income
   */
  const createEntityIncome = useCallback(async (entityId, incomeData) => {
    try {
      const response = await fetch(apiUrl('/api/income/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify({ ...incomeData, entity_id: entityId }),
      });

      if (response.ok) {
        const newIncome = await response.json();
        return newIncome;
      } else {
        throw new Error('Failed to create entity income');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Create entity-specific budget
   */
  const createEntityBudget = useCallback(async (entityId, budgetData) => {
    try {
      const response = await fetch(apiUrl('/api/budgets/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify({ ...budgetData, entity_id: entityId }),
      });

      if (response.ok) {
        const newBudget = await response.json();
        return newBudget;
      } else {
        throw new Error('Failed to create entity budget');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, [apiUrl, buildAuthHeaders]);

  // ============ Entity-Specific API Functions ============

  /**
   * Fetch entity departments
   */
  const fetchEntityDepartments = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(`/api/entity-departments/?entity=${entityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity departments:', err);
    }
    return [];
  }, []);

  /**
   * Fetch entity roles
   */
  const fetchEntityRoles = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(`/api/entity-roles/?entity=${entityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity roles:', err);
    }
    return [];
  }, []);

  /**
   * Fetch entity staff
   */
  const fetchEntityStaff = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(`/api/entity-staff/?entity=${entityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity staff:', err);
    }
    return [];
  }, []);

  /**
   * Fetch entity bank accounts
   */
  const fetchEntityBankAccounts = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(apiUrl(`/api/bank-accounts/?entity=${entityId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity bank accounts:', err);
    }
    return [];
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch entity wallets
   */
  const fetchEntityWallets = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(apiUrl(`/api/wallets/?entity=${entityId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity wallets:', err);
    }
    return [];
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch entity compliance documents
   */
  const fetchEntityComplianceDocuments = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(apiUrl(`/api/compliance-documents/?entity_id=${entityId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity compliance documents:', err);
    }
    return [];
  }, [apiUrl, buildAuthHeaders]);

  // ==========================================================================
  // TAX & COMPLIANCE (ENTITY-SCOPED)
  // ==========================================================================

  const fetchEntityTaxProfiles = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(apiUrl(`/api/tax-profiles/?entity_id=${entityId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity tax profiles:', err);
    }
    return [];
  }, [apiUrl, buildAuthHeaders]);

  const createTaxProfile = useCallback(async (profileData) => {
    try {
      const response = await fetch(apiUrl('/api/tax-profiles/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        return await response.json();
      }

      let details = 'Failed to create tax profile';
      try {
        const data = await response.json();
        details = data?.detail || JSON.stringify(data);
      } catch {
        // ignore
      }
      throw new Error(details);
    } catch (err) {
      setError(err.message);
      console.error(err);
      throw err;
    }
  }, [apiUrl, buildAuthHeaders]);

  const fetchEntityTaxExposures = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(apiUrl(`/api/tax-exposures/?entity_id=${entityId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity tax exposures:', err);
    }
    return [];
  }, [apiUrl, buildAuthHeaders]);

  const fetchEntityComplianceDeadlines = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(apiUrl(`/api/compliance-deadlines/?entity_id=${entityId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity compliance deadlines:', err);
    }
    return [];
  }, [apiUrl, buildAuthHeaders]);

  const createComplianceDeadline = useCallback(async (deadlineData) => {
    try {
      const response = await fetch(apiUrl('/api/compliance-deadlines/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(deadlineData),
      });
      if (response.ok) {
        return await response.json();
      }
      let details = 'Failed to create compliance deadline';
      try {
        const data = await response.json();
        details = data?.detail || JSON.stringify(data);
      } catch {
        // ignore
      }
      throw new Error(details);
    } catch (err) {
      setError(err.message);
      console.error(err);
      throw err;
    }
  }, [apiUrl, buildAuthHeaders]);

  const fetchEntityTaxCalculations = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(apiUrl(`/api/tax-calculations/?entity_id=${entityId}`), {
        headers: buildAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity tax calculations:', err);
    }
    return [];
  }, [apiUrl, buildAuthHeaders]);

  const calculateTax = useCallback(async (calculationPayload) => {
    try {
      const response = await fetch(apiUrl('/api/tax-calculations/calculate/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(calculationPayload),
      });

      if (response.ok) {
        return await response.json();
      }

      let details = 'Tax calculation failed';
      try {
        const data = await response.json();
        details = data?.detail || JSON.stringify(data);
      } catch {
        // ignore
      }
      throw new Error(details);
    } catch (err) {
      setError(err.message);
      console.error(err);
      throw err;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Create entity department
   */
  const createEntityDepartment = useCallback(async (departmentData) => {
    try {
      const response = await fetch('/api/entity-departments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(departmentData),
      });

      if (response.ok) {
        const newDepartment = await response.json();
        return newDepartment;
      } else {
        throw new Error('Failed to create entity department');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, []);

  /**
   * Create entity role
   */
  const createEntityRole = useCallback(async (roleData) => {
    try {
      const response = await fetch('/api/entity-roles/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(roleData),
      });

      if (response.ok) {
        const newRole = await response.json();
        return newRole;
      } else {
        throw new Error('Failed to create entity role');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, []);

  /**
   * Create entity staff
   */
  const createEntityStaff = useCallback(async (staffData) => {
    try {
      const response = await fetch('/api/entity-staff/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(staffData),
      });

      if (response.ok) {
        const newStaff = await response.json();
        return newStaff;
      } else {
        throw new Error('Failed to create entity staff');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, []);

  /**
   * Create bank account
   */
  const createBankAccount = useCallback(async (accountData) => {
    try {
      const response = await fetch('/api/bank-accounts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(accountData),
      });

      if (response.ok) {
        const newAccount = await response.json();
        return newAccount;
      } else {
        throw new Error('Failed to create bank account');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, []);

  /**
   * Create wallet
   */
  const createWallet = useCallback(async (walletData) => {
    try {
      const response = await fetch('/api/wallets/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(walletData),
      });

      if (response.ok) {
        const newWallet = await response.json();
        return newWallet;
      } else {
        throw new Error('Failed to create wallet');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, []);

  /**
   * Create compliance document
   */
  const createComplianceDocument = useCallback(async (documentData) => {
    try {
      const response = await fetch(apiUrl('/api/compliance-documents/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(documentData),
      });

      if (response.ok) {
        const newDocument = await response.json();
        return newDocument;
      } else {
        throw new Error('Failed to create compliance document');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, [apiUrl, buildAuthHeaders]);

  // ============================================================================
  // BOOKKEEPING FUNCTIONS
  // ============================================================================

  /**
   * Fetch bookkeeping categories for entity
   */
  const fetchBookkeepingCategories = useCallback(async (entityId) => {
    try {
      const response = await fetch(apiUrl(`/api/bookkeeping-categories/?entity_id=${entityId}`), {
        headers: buildAuthHeaders(),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      return [];
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Create default bookkeeping categories for entity
   */
  const createDefaultCategories = useCallback(async (entityId) => {
    try {
      const response = await fetch(apiUrl('/api/bookkeeping-categories/create_defaults/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify({ entity_id: entityId }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to create default categories');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Create custom category
   */
  const createBookkeepingCategory = useCallback(async (categoryData) => {
    try {
      const response = await fetch(apiUrl('/api/bookkeeping-categories/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create category');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      throw err;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch bookkeeping accounts for entity
   */
  const fetchBookkeepingAccounts = useCallback(async (entityId) => {
    try {
      const response = await fetch(apiUrl(`/api/bookkeeping-accounts/?entity_id=${entityId}`), {
        headers: buildAuthHeaders(),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch accounts');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      return [];
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Create bookkeeping account
   */
  const createBookkeepingAccount = useCallback(async (accountData) => {
    try {
      const response = await fetch(apiUrl('/api/bookkeeping-accounts/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(accountData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create account');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      throw err;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch transactions for entity with filters
   */
  const fetchTransactions = useCallback(async (entityId, filters = {}) => {
    try {
      const params = new URLSearchParams({ entity_id: entityId, ...filters });
      const response = await fetch(apiUrl(`/api/transactions/?${params}`), {
        headers: buildAuthHeaders(),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      return [];
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Create transaction
   */
  const createTransaction = useCallback(async (transactionData) => {
    try {
      const response = await fetch(apiUrl('/api/transactions/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create transaction');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      throw err;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Update transaction
   */
  const updateTransaction = useCallback(async (transactionId, transactionData) => {
    try {
      const response = await fetch(apiUrl(`/api/transactions/${transactionId}/`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update transaction');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      throw err;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Delete transaction
   */
  const deleteTransaction = useCallback(async (transactionId) => {
    try {
      const response = await fetch(apiUrl(`/api/transactions/${transactionId}/`), {
        method: 'DELETE',
        headers: buildAuthHeaders(),
      });

      if (response.ok) {
        return true;
      } else {
        throw new Error('Failed to delete transaction');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      throw err;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch bookkeeping summary for entity
   */
  const fetchBookkeepingSummary = useCallback(async (entityId, filters = {}) => {
    try {
      const params = new URLSearchParams({ entity_id: entityId, ...filters });
      const response = await fetch(apiUrl(`/api/transactions/summary/?${params}`), {
        headers: buildAuthHeaders(),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch summary');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      return null;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch cashflow treasury dashboard data
   */
  const fetchCashflowTreasuryDashboard = useCallback(async (entityId, filters = {}) => {
    try {
      const params = new URLSearchParams({ entity_id: entityId, ...filters });
      const response = await fetch(apiUrl(`/api/cashflow-treasury/dashboard/?${params}`), {
        headers: buildAuthHeaders(),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch cashflow treasury data');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      return null;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Execute internal transfer
   */
  const executeInternalTransfer = useCallback(async (transferData) => {
    try {
      const response = await fetch(apiUrl('/api/cashflow-treasury/transfer/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(transferData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to execute transfer');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      return null;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Execute FX conversion
   */
  const executeFXConversion = useCallback(async (conversionData) => {
    try {
      const response = await fetch(apiUrl('/api/cashflow-treasury/fx_conversion/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(conversionData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to execute FX conversion');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      return null;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Execute investment allocation
   */
  const executeInvestmentAllocation = useCallback(async (allocationData) => {
    try {
      const response = await fetch(apiUrl('/api/cashflow-treasury/investment_allocation/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeaders(),
        },
        body: JSON.stringify(allocationData),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to execute investment allocation');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      return null;
    }
  }, [apiUrl, buildAuthHeaders]);

  /**
   * Fetch audit logs for entity
   */
  const fetchBookkeepingAuditLogs = useCallback(async (entityId) => {
    try {
      const response = await fetch(apiUrl(`/api/bookkeeping-audit-logs/?entity_id=${entityId}`), {
        headers: buildAuthHeaders(),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch audit logs');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      return null;
    }
  }, [apiUrl, buildAuthHeaders]);

  const value = {
    // State
    organizations,
    currentOrganization,
    entities,
    selectedEntities,
    teamMembers,
    currentUserRole,
    permissions,
    roles,
    orgOverview,
    taxExposures,
    complianceDeadlines,
    cashflowData,
    loading,
    error,

    // Constants
    ROLES,
    PERMISSIONS,

    // Methods
    fetchOrganizations,
    fetchOrgOverview,
    fetchEntities,
    fetchTeamMembers,
    fetchTaxExposures,
    fetchComplianceDeadlines,
    fetchCashflowData,
    fetchOrganizationAccountingDashboard,
    fetchRiskExposureDashboard,
    hasPermission,
    hasRole,
    switchOrganization,
    createOrganization,
    updateOrganization,
    createEntity,
    addTeamMember,

    // Entity-specific financial methods
    fetchEntityExpenses,
    fetchEntityIncome,
    fetchEntityBudgets,
    createEntityExpense,
    createEntityIncome,
    createEntityBudget,

    // Entity-specific management methods
    fetchEntityDepartments,
    fetchEntityRoles,
    fetchEntityStaff,
    fetchEntityBankAccounts,
    fetchEntityWallets,
    fetchEntityComplianceDocuments,
    fetchEntityTaxProfiles,
    createTaxProfile,
    fetchEntityTaxExposures,
    fetchEntityComplianceDeadlines,
    createComplianceDeadline,
    fetchEntityTaxCalculations,
    calculateTax,
    createEntityDepartment,
    createEntityRole,
    createEntityStaff,
    createBankAccount,
    createWallet,
    createComplianceDocument,

    // Bookkeeping functions
    fetchBookkeepingCategories,
    createDefaultCategories,
    createBookkeepingCategory,
    fetchBookkeepingAccounts,
    createBookkeepingAccount,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchBookkeepingSummary,
    fetchBookkeepingAuditLogs,
    fetchCashflowTreasuryDashboard,
    executeInternalTransfer,
    executeFXConversion,
    executeInvestmentAllocation,

    // Setters
    setCurrentOrganization,
    setSelectedEntities,
    setError,
  };

  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  );
};

export default EnterpriseContext;
