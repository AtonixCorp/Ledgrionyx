import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
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
  const ROLES = {
    ORG_OWNER: 'ORG_OWNER',
    CFO: 'CFO',
    FINANCE_ANALYST: 'FINANCE_ANALYST',
    VIEWER: 'VIEWER',
    EXTERNAL_ADVISOR: 'EXTERNAL_ADVISOR',
  };

  const PERMISSIONS = {
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
  };

  // Mock enterprise data for testing
  const mockOrganizations = [
    {
      id: 1,
      name: 'Atonix Capital',
      slug: 'atonix-capital',
      industry: 'Financial Services',
      country: 'Nigeria',
      headquarters: 'Lagos, Nigeria',
      founded_year: 2023,
      employees_count: 50,
      status: 'active'
    }
  ];

  const mockOrgOverview = {
    total_assets: 15000000,
    total_liabilities: 5000000,
    net_position: 10000000,
    total_tax_exposure: 2500000,
    active_jurisdictions: 12,
    active_entities: 5,
    pending_tax_returns: 2,
    missing_data_entities: 1,
    tax_exposure_by_country: {
      // Africa - West
      'Nigeria': 1500000,
      'Ghana': 450000,
      'Senegal': 280000,
      
      // Africa - East
      'Kenya': 700000,
      'Tanzania': 320000,
      'Uganda': 180000,
      
      // Africa - Southern
      'South Africa': 300000,
      'Botswana': 120000,
      
      // Europe
      'United Kingdom': 850000,
      'Germany': 620000,
      'Switzerland': 340000,
      
      // North America
      'United States': 1200000,
      'Canada': 480000,
      
      // Asia Pacific
      'Singapore': 550000,
      'Hong Kong': 420000,
      'India': 380000,
      'Australia': 290000,
      'United Arab Emirates': 180000,
    }
  };

  const mockEntities = [
    {
      id: 1,
      name: 'Atonix Capital Limited',
      type: 'Limited Company',
      country: 'Nigeria',
      status: 'Active',
      tax_id: 'TIN123456789',
      incorporation_date: '2023-01-15'
    },
    {
      id: 2,
      name: 'Atonix East Africa',
      type: 'Limited Company',
      country: 'Kenya',
      status: 'Active',
      tax_id: 'KE123456789',
      incorporation_date: '2023-06-20'
    },
    {
      id: 3,
      name: 'Atonix Southern Africa',
      type: 'Limited Company',
      country: 'South Africa',
      status: 'Active',
      tax_id: 'ZA123456789',
      incorporation_date: '2023-09-10'
    },
    {
      id: 4,
      name: 'Atonix Advisory',
      type: 'Partnership',
      country: 'Nigeria',
      status: 'Active',
      tax_id: 'TIN987654321',
      incorporation_date: '2023-03-01'
    },
    {
      id: 5,
      name: 'Atonix Investments',
      type: 'Trust',
      country: 'Nigeria',
      status: 'Pending',
      tax_id: 'TIN555555555',
      incorporation_date: '2024-01-01'
    }
  ];

  const mockTeamMembers = [
    {
      id: 1,
      user_name: 'Enterprise Admin',
      user_email: 'admin@atonixcapital.com',
      role_code: ROLES.ORG_OWNER,
      role_name: 'Organization Owner',
      status: 'active'
    },
    {
      id: 2,
      user_name: 'CFO',
      user_email: 'cfo@atonixcapital.com',
      role_code: ROLES.CFO,
      role_name: 'Chief Financial Officer',
      status: 'active'
    },
    {
      id: 3,
      user_name: 'Tax Analyst',
      user_email: 'analyst@atonixcapital.com',
      role_code: ROLES.FINANCE_ANALYST,
      role_name: 'Finance Analyst',
      status: 'active'
    }
  ];

  const mockTaxExposures = [
    { country: 'Nigeria', total_exposure: 1500000, entities: 2, rate: 30 },
    { country: 'Kenya', total_exposure: 700000, entities: 1, rate: 37.5 },
    { country: 'South Africa', total_exposure: 300000, entities: 1, rate: 28 }
  ];

  const mockComplianceDeadlines = [
    { id: 1, country: 'Nigeria', type: 'Corporate Tax Return', dueDate: '2025-04-15', status: 'upcoming', entity: 'Atonix Capital Limited' },
    { id: 2, country: 'Nigeria', type: 'Payroll Tax', dueDate: '2025-01-31', status: 'due_soon', entity: 'Atonix Capital Limited' },
    { id: 3, country: 'Kenya', type: 'VAT Return', dueDate: '2025-01-20', status: 'due_soon', entity: 'Atonix East Africa' },
    { id: 4, country: 'South Africa', type: 'Corporate Tax', dueDate: '2025-06-30', status: 'upcoming', entity: 'Atonix Southern Africa' },
    { id: 5, country: 'Nigeria', type: 'Annual Return', dueDate: '2025-03-31', status: 'upcoming', entity: 'Atonix Advisory' }
  ];

  /**
   * Initialize enterprise data for user
   */
  useEffect(() => {
    if (user && user.account_type === 'enterprise') {
      // Set default user role to ORG_OWNER for testing
      setCurrentUserRole(ROLES.ORG_OWNER);
      
      // Initialize with mock data
      setOrganizations(mockOrganizations);
      setCurrentOrganization(mockOrganizations[0]);
      setOrgOverview(mockOrgOverview);
      setEntities(mockEntities);
      setTeamMembers(mockTeamMembers);
      
      console.log('Enterprise user initialized:', user);
      console.log('Current user role set to:', ROLES.ORG_OWNER);
    }
  }, [user]);

  /**
   * Fetch organizations for current user
   */
  const fetchOrganizations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch('/api/organizations/my_organizations/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
        if (data.length > 0 && !currentOrganization) {
          setCurrentOrganization(data[0]);
        }
      }
    } catch (err) {
      setError('Failed to fetch organizations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, currentOrganization]);

  /**
   * Fetch organization overview/dashboard
   */
  const fetchOrgOverview = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const response = await fetch(`/api/organizations/${orgId}/overview/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrgOverview(data);
      } else {
        // Use mock data as fallback
        setOrgOverview(mockOrgOverview);
      }
    } catch (err) {
      console.error('Failed to fetch org overview, using mock data:', err);
      // Use mock data as fallback
      setOrgOverview(mockOrgOverview);
    }
  }, []);

  /**
   * Fetch entities for organization
   */
  const fetchEntities = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const response = await fetch(`/api/entities/?organization_id=${orgId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEntities(Array.isArray(data) ? data : data.results || []);
      } else {
        // Use mock data as fallback
        setEntities(mockEntities);
      }
    } catch (err) {
      console.error('Failed to fetch entities, using mock data:', err);
      // Use mock data as fallback
      setEntities(mockEntities);
    }
  }, []);

  /**
   * Fetch team members
   */
  const fetchTeamMembers = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const response = await fetch(`/api/team-members/?organization_id=${orgId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
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
        // Use mock data as fallback
        setTeamMembers(mockTeamMembers);
      }
    } catch (err) {
      console.error('Failed to fetch team members, using mock data:', err);
      // Use mock data as fallback
      setTeamMembers(mockTeamMembers);
    }
  }, [user]);

  /**
   * Fetch tax compliance data
   */
  const fetchTaxExposures = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const response = await fetch(`/api/tax-exposures/by_country/?organization_id=${orgId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTaxExposures(data);
      }
    } catch (err) {
      console.error('Failed to fetch tax exposures:', err);
    }
  }, []);

  /**
   * Fetch compliance deadlines
   */
  const fetchComplianceDeadlines = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const response = await fetch(`/api/compliance-deadlines/upcoming/?organization_id=${orgId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setComplianceDeadlines(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error('Failed to fetch compliance deadlines:', err);
    }
  }, []);

  /**
   * Fetch cashflow forecast
   */
  const fetchCashflowData = useCallback(async (orgId) => {
    if (!orgId) return;
    try {
      const response = await fetch(`/api/cashflow-forecasts/by_category/?organization_id=${orgId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCashflowData(Array.isArray(data) ? data : data.results || []);
      } else {
        // Use empty array as fallback for cashflow (pages handle their own mock data)
        setCashflowData([]);
      }
    } catch (err) {
      console.error('Failed to fetch cashflow data, using empty array:', err);
      // Use empty array as fallback for cashflow (pages handle their own mock data)
      setCashflowData([]);
    }
  }, []);

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
    // Fetch all data for new organization
    fetchOrgOverview(org.id);
    fetchEntities(org.id);
    fetchTeamMembers(org.id);
    fetchTaxExposures(org.id);
    fetchComplianceDeadlines(org.id);
    fetchCashflowData(org.id);
  }, [fetchOrgOverview, fetchEntities, fetchTeamMembers, fetchTaxExposures, fetchComplianceDeadlines, fetchCashflowData]);

  /**
   * Create new organization
   */
  const createOrganization = useCallback(async (orgData) => {
    try {
      const response = await fetch('/api/organizations/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
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
  }, [organizations, switchOrganization]);

  /**
   * Create new entity
   */
  const createEntity = useCallback(async (entityData) => {
    try {
      const response = await fetch('/api/entities/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entityData),
      });

      if (response.ok) {
        const newEntity = await response.json();
        setEntities([...entities, newEntity]);
        return newEntity;
      } else {
        throw new Error('Failed to create entity');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }, [entities]);

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
      const response = await fetch(`/api/expenses/?entity_id=${entityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity expenses:', err);
    }
    return [];
  }, []);

  /**
   * Fetch entity-specific income
   */
  const fetchEntityIncome = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(`/api/income/?entity_id=${entityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity income:', err);
    }
    return [];
  }, []);

  /**
   * Fetch entity-specific budgets
   */
  const fetchEntityBudgets = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(`/api/budgets/?entity_id=${entityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity budgets:', err);
    }
    return [];
  }, []);

  /**
   * Create entity-specific expense
   */
  const createEntityExpense = useCallback(async (entityId, expenseData) => {
    try {
      const response = await fetch('/api/expenses/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
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
  }, []);

  /**
   * Create entity-specific income
   */
  const createEntityIncome = useCallback(async (entityId, incomeData) => {
    try {
      const response = await fetch('/api/income/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
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
  }, []);

  /**
   * Create entity-specific budget
   */
  const createEntityBudget = useCallback(async (entityId, budgetData) => {
    try {
      const response = await fetch('/api/budgets/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
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
  }, []);

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
      const response = await fetch(`/api/bank-accounts/?entity=${entityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity bank accounts:', err);
    }
    return [];
  }, []);

  /**
   * Fetch entity wallets
   */
  const fetchEntityWallets = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(`/api/wallets/?entity=${entityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity wallets:', err);
    }
    return [];
  }, []);

  /**
   * Fetch entity compliance documents
   */
  const fetchEntityComplianceDocuments = useCallback(async (entityId) => {
    if (!entityId) return [];
    try {
      const response = await fetch(`/api/compliance-documents/?entity=${entityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : data.results || [];
      }
    } catch (err) {
      console.error('Failed to fetch entity compliance documents:', err);
    }
    return [];
  }, []);

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
      const response = await fetch('/api/compliance-documents/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
  }, []);

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
    hasPermission,
    hasRole,
    switchOrganization,
    createOrganization,
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
    createEntityDepartment,
    createEntityRole,
    createEntityStaff,
    createBankAccount,
    createWallet,
    createComplianceDocument,

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
