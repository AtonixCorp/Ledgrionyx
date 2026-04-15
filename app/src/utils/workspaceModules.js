export const WORKSPACE_MODE_LABELS = {
  accounting: 'Accounting',
  equity: 'Equity Management',
  combined: 'Accounting + Equity',
  standalone: 'Standalone',
};

export const ACCOUNTING_MODULE_KEYS = [
  'overview',
  'members',
  'groups',
  'meetings',
  'calendar',
  'files',
  'permissions',
  'settings',
  'email',
  'marketing',
];

export const EQUITY_MODULE_KEYS = [
  'equity_registry',
  'equity_cap_table',
  'equity_vesting',
  'equity_exercises',
  'equity_valuation',
  'equity_transactions',
  'equity_governance',
];

export const WORKSPACE_PACKAGE_OPTIONS = [
  {
    id: 'accounting',
    title: 'Accounting Organization',
    description: 'General ledger, payables, receivables, treasury, compliance, and reporting.',
    modules: ACCOUNTING_MODULE_KEYS,
  },
  {
    id: 'equity',
    title: 'Equity Management Organization',
    description: 'Ownership registry, cap table engine, valuations, transactions, and governance.',
    modules: EQUITY_MODULE_KEYS,
  },
  {
    id: 'combined',
    title: 'Combined Financial Operating System',
    description: 'Accounting and equity management under one organization with shared compliance context.',
    modules: [...ACCOUNTING_MODULE_KEYS, ...EQUITY_MODULE_KEYS],
  },
  {
    id: 'standalone',
    title: 'Standalone Organization',
    description: 'An isolated organization shell where you can enable only the modules you need.',
    modules: [],
  },
];

export const getWorkspaceModules = (workspace) => {
  if (!workspace) return [];
  if (Array.isArray(workspace.enabled_modules) && workspace.enabled_modules.length > 0) {
    return workspace.enabled_modules;
  }

  switch (workspace.workspace_mode) {
    case 'equity':
      return EQUITY_MODULE_KEYS;
    case 'combined':
      return [...ACCOUNTING_MODULE_KEYS, ...EQUITY_MODULE_KEYS];
    case 'standalone':
      return [];
    case 'accounting':
    default:
      return ACCOUNTING_MODULE_KEYS;
  }
};

export const hasEquityModule = (workspace) => getWorkspaceModules(workspace).some((key) => key.startsWith('equity_'));

export const hasAccountingModule = (workspace) => getWorkspaceModules(workspace).some((key) => ACCOUNTING_MODULE_KEYS.includes(key));

export const getWorkspaceLandingPath = (workspace) => {
  if (!workspace?.id) return '/app/console';
  if (hasEquityModule(workspace) && !hasAccountingModule(workspace)) {
    return `/app/equity/${workspace.id}/registry`;
  }
  return `/app/workspace/${workspace.id}/overview`;
};
