import axios from 'axios';
import { formatErrorMessage, reportUiError } from '../utils/errorReporting';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 — attempt token refresh once, then redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const message = formatErrorMessage(error.response?.data, error.message || 'Request failed.');
    console.error('API request failed', {
      method: original?.method,
      url: original?.url,
      status,
      data: error.response?.data,
    });
    if (!original?.skipGlobalErrorHandler) {
      reportUiError({
        title: status === 401 ? 'Authentication failed' : 'API request failed',
        message,
        status,
        source: original?.url || 'api',
        severity: status && status < 500 ? 'warning' : 'error',
      });
    }
    if (status === 401 && !original._retried) {
      original._retried = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        if (refresh) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh });
          localStorage.setItem('token', data.access);
          localStorage.setItem('access_token', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        }
      } catch {
        console.error('Token refresh failed; redirecting to login');
        reportUiError({
          title: 'Session expired',
          message: 'Your session could not be refreshed. Please log in again.',
          severity: 'warning',
          source: 'auth',
          status: 401,
        });
        // Refresh failed — clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Expenses API
export const expensesAPI = {
  getAll: () => api.get('/expenses/'),
  getById: (id) => api.get(`/expenses/${id}/`),
  create: (data) => api.post('/expenses/', data),
  update: (id, data) => api.put(`/expenses/${id}/`, data),
  delete: (id) => api.delete(`/expenses/${id}/`),
  getTotal: () => api.get('/expenses/total/'),
  getByCategory: () => api.get('/expenses/by_category/'),
};

// Income API
export const incomeAPI = {
  getAll: () => api.get('/income/'),
  getById: (id) => api.get(`/income/${id}/`),
  create: (data) => api.post('/income/', data),
  update: (id, data) => api.put(`/income/${id}/`, data),
  delete: (id) => api.delete(`/income/${id}/`),
  getTotal: () => api.get('/income/total/'),
};

// Budgets API
export const budgetsAPI = {
  getAll: () => api.get('/budgets/'),
  getById: (id) => api.get(`/budgets/${id}/`),
  create: (data) => api.post('/budgets/', data),
  update: (id, data) => api.put(`/budgets/${id}/`, data),
  delete: (id) => api.delete(`/budgets/${id}/`),
  getSummary: () => api.get('/budgets/summary/'),
};

// Tax countries API
export const taxAPI = {
  list: () => api.get('/tax/countries/'),
  get: (code) => api.get(`/tax/countries/${code}/`),
};

// ============ FINANCIAL MODELING APIs ============

// Model Templates API
export const modelTemplatesAPI = {
  getAll: () => api.get('/model-templates/'),
  getById: (id) => api.get(`/model-templates/${id}/`),
  create: (data) => api.post('/model-templates/', data),
  update: (id, data) => api.put(`/model-templates/${id}/`, data),
  delete: (id) => api.delete(`/model-templates/${id}/`),
  getByType: (type) => api.get(`/model-templates/by_type/?type=${type}`),
};

// Financial Models API
export const financialModelsAPI = {
  getAll: () => api.get('/financial-models/'),
  getById: (id) => api.get(`/financial-models/${id}/`),
  create: (data) => api.post('/financial-models/', data),
  update: (id, data) => api.put(`/financial-models/${id}/`, data),
  delete: (id) => api.delete(`/financial-models/${id}/`),
  calculate: (id) => api.post(`/financial-models/${id}/calculate/`),
  getScenarios: (id) => api.get(`/financial-models/${id}/scenarios/`),
  getInsights: (id) => api.get(`/financial-models/${id}/insights/`),
};

// Scenarios API
export const scenariosAPI = {
  getAll: () => api.get('/scenarios/'),
  getById: (id) => api.get(`/scenarios/${id}/`),
  create: (data) => api.post('/scenarios/', data),
  update: (id, data) => api.put(`/scenarios/${id}/`, data),
  delete: (id) => api.delete(`/scenarios/${id}/`),
  runScenario: (id) => api.post(`/scenarios/${id}/run_scenario/`),
};

// Sensitivity Analysis API
export const sensitivityAnalysisAPI = {
  getAll: () => api.get('/sensitivity-analyses/'),
  getById: (id) => api.get(`/sensitivity-analyses/${id}/`),
  create: (data) => api.post('/sensitivity-analyses/', data),
  update: (id, data) => api.put(`/sensitivity-analyses/${id}/`, data),
  delete: (id) => api.delete(`/sensitivity-analyses/${id}/`),
  runAnalysis: (id) => api.post(`/sensitivity-analyses/${id}/run_analysis/`),
};

// AI Insights API
export const aiInsightsAPI = {
  getAll: () => api.get('/ai-insights/'),
  getById: (id) => api.get(`/ai-insights/${id}/`),
  create: (data) => api.post('/ai-insights/', data),
  update: (id, data) => api.put(`/ai-insights/${id}/`, data),
  delete: (id) => api.delete(`/ai-insights/${id}/`),
  getUnread: () => api.get('/ai-insights/unread/'),
  markRead: (id) => api.post(`/ai-insights/${id}/mark_read/`),
};

// Custom KPIs API
export const customKPIsAPI = {
  getAll: () => api.get('/custom-kpis/'),
  getById: (id) => api.get(`/custom-kpis/${id}/`),
  create: (data) => api.post('/custom-kpis/', data),
  update: (id, data) => api.put(`/custom-kpis/${id}/`, data),
  delete: (id) => api.delete(`/custom-kpis/${id}/`),
  getCalculations: (id) => api.get(`/custom-kpis/${id}/calculations/`),
};

// KPI Calculations API
export const kpiCalculationsAPI = {
  getAll: () => api.get('/kpi-calculations/'),
  getById: (id) => api.get(`/kpi-calculations/${id}/`),
  create: (data) => api.post('/kpi-calculations/', data),
  update: (id, data) => api.put(`/kpi-calculations/${id}/`, data),
  delete: (id) => api.delete(`/kpi-calculations/${id}/`),
};

// Reports API
export const reportsAPI = {
  getAll: () => api.get('/reports/'),
  getById: (id) => api.get(`/reports/${id}/`),
  create: (data) => api.post('/reports/', data),
  update: (id, data) => api.put(`/reports/${id}/`, data),
  delete: (id) => api.delete(`/reports/${id}/`),
  generate: (id) => api.post(`/reports/${id}/generate/`),
  download: (id) => api.get(`/reports/${id}/download/`),
};

// Consolidations API
export const consolidationsAPI = {
  getAll: () => api.get('/consolidations/'),
  getById: (id) => api.get(`/consolidations/${id}/`),
  create: (data) => api.post('/consolidations/', data),
  update: (id, data) => api.put(`/consolidations/${id}/`, data),
  delete: (id) => api.delete(`/consolidations/${id}/`),
  runConsolidation: (id) => api.post(`/consolidations/${id}/run_consolidation/`),
};

// Consolidation Entities API
export const consolidationEntitiesAPI = {
  getAll: () => api.get('/consolidation-entities/'),
  getById: (id) => api.get(`/consolidation-entities/${id}/`),
  create: (data) => api.post('/consolidation-entities/', data),
  update: (id, data) => api.put(`/consolidation-entities/${id}/`, data),
  delete: (id) => api.delete(`/consolidation-entities/${id}/`),
};

// Tax Calculations API
export const taxCalculationsAPI = {
  getAll: () => api.get('/tax-calculations/'),
  getById: (id) => api.get(`/tax-calculations/${id}/`),
  create: (data) => api.post('/tax-calculations/', data),
  update: (id, data) => api.put(`/tax-calculations/${id}/`, data),
  delete: (id) => api.delete(`/tax-calculations/${id}/`),
  calculate: (data) => api.post('/tax-calculations/calculate/', data),
};

// Compliance Deadlines API
export const complianceDeadlinesAPI = {
  getAll: () => api.get('/compliance-deadlines/'),
  getById: (id) => api.get(`/compliance-deadlines/${id}/`),
  create: (data) => api.post('/compliance-deadlines/', data),
  update: (id, data) => api.put(`/compliance-deadlines/${id}/`, data),
  delete: (id) => api.delete(`/compliance-deadlines/${id}/`),
  getUpcoming: (days = 30) => api.get(`/compliance-deadlines/upcoming/?days=${days}`),
};

// Cashflow Forecasts API
export const cashflowForecastsAPI = {
  getAll: () => api.get('/cashflow-forecasts/'),
  getById: (id) => api.get(`/cashflow-forecasts/${id}/`),
  create: (data) => api.post('/cashflow-forecasts/', data),
  update: (id, data) => api.put(`/cashflow-forecasts/${id}/`, data),
  delete: (id) => api.delete(`/cashflow-forecasts/${id}/`),
  generateForecast: (id) => api.post(`/cashflow-forecasts/${id}/generate_forecast/`),
};

// ============ ENTERPRISE APIs ============

// Organizations API
export const organizationsAPI = {
  getAll: () => api.get('/organizations/'),
  getById: (id) => api.get(`/organizations/${id}/`),
  create: (data) => api.post('/organizations/', data),
  update: (id, data) => api.put(`/organizations/${id}/`, data),
  delete: (id) => api.delete(`/organizations/${id}/`),
  getMyOrganizations: () => api.get('/organizations/my_organizations/'),
  getOverview: (id) => api.get(`/organizations/${id}/overview/`),
};

// Entities API
export const entitiesAPI = {
  getAll: () => api.get('/entities/'),
  getById: (id) => api.get(`/entities/${id}/`),
  create: (data) => api.post('/entities/', data),
  update: (id, data) => api.put(`/entities/${id}/`, data),
  delete: (id) => api.delete(`/entities/${id}/`),
  getDetail: (id) => api.get(`/entities/${id}/detail/`),
};

// Team Members API
export const teamMembersAPI = {
  getAll: () => api.get('/team-members/'),
  getById: (id) => api.get(`/team-members/${id}/`),
  create: (data) => api.post('/team-members/', data),
  update: (id, data) => api.put(`/team-members/${id}/`, data),
  delete: (id) => api.delete(`/team-members/${id}/`),
};

// Roles API
export const rolesAPI = {
  getAll: () => api.get('/roles/'),
  getById: (id) => api.get(`/roles/${id}/`),
  create: (data) => api.post('/roles/', data),
  update: (id, data) => api.put(`/roles/${id}/`, data),
  delete: (id) => api.delete(`/roles/${id}/`),
};

// Permissions API
export const permissionsAPI = {
  getAll: () => api.get('/permissions/'),
  getById: (id) => api.get(`/permissions/${id}/`),
};

// Audit Logs API
export const auditLogsAPI = {
  getAll: () => api.get('/audit-logs/'),
  getById: (id) => api.get(`/audit-logs/${id}/`),
};

// Tax Exposures API
export const taxExposuresAPI = {
  getAll: () => api.get('/tax-exposures/'),
  getById: (id) => api.get(`/tax-exposures/${id}/`),
  create: (data) => api.post('/tax-exposures/', data),
  update: (id, data) => api.put(`/tax-exposures/${id}/`, data),
  delete: (id) => api.delete(`/tax-exposures/${id}/`),
};

// ============ ACCOUNTING MODULE APIs ============

// Chart of Accounts API
export const chartOfAccountsAPI = {
  getAll: (params) => api.get('/chart-of-accounts/', { params }),
  getById: (id) => api.get(`/chart-of-accounts/${id}/`),
  create: (data) => api.post('/chart-of-accounts/', data),
  update: (id, data) => api.put(`/chart-of-accounts/${id}/`, data),
  delete: (id) => api.delete(`/chart-of-accounts/${id}/`),
};

// General Ledger API
export const generalLedgerAPI = {
  getAll: (params) => api.get('/general-ledger/', { params }),
  getById: (id) => api.get(`/general-ledger/${id}/`),
};

// Journal Entries API
export const journalEntriesAPI = {
  getAll: (params) => api.get('/journal-entries/', { params }),
  getById: (id) => api.get(`/journal-entries/${id}/`),
  create: (data) => api.post('/journal-entries/', data),
  update: (id, data) => api.put(`/journal-entries/${id}/`, data),
  delete: (id) => api.delete(`/journal-entries/${id}/`),
  approve: (id) => api.post(`/journal-entries/${id}/approve/`),
  reverse: (id) => api.post(`/journal-entries/${id}/reverse/`),
};

// Ledger Periods API
export const ledgerPeriodsAPI = {
  getAll: (params) => api.get('/ledger-periods/', { params }),
  getById: (id) => api.get(`/ledger-periods/${id}/`),
  create: (data) => api.post('/ledger-periods/', data),
  update: (id, data) => api.put(`/ledger-periods/${id}/`, data),
  close: (id) => api.post(`/ledger-periods/${id}/close/`),
};

// Recurring Journal Templates API
export const recurringJournalTemplatesAPI = {
  getAll: (params) => api.get('/recurring-journal-templates/', { params }),
  getById: (id) => api.get(`/recurring-journal-templates/${id}/`),
  create: (data) => api.post('/recurring-journal-templates/', data),
  update: (id, data) => api.put(`/recurring-journal-templates/${id}/`, data),
  delete: (id) => api.delete(`/recurring-journal-templates/${id}/`),
};

// ============ ACCOUNTS RECEIVABLE APIs ============

// Customers API
export const customersAPI = {
  getAll: (params) => api.get('/customers/', { params }),
  getById: (id) => api.get(`/customers/${id}/`),
  create: (data) => api.post('/customers/', data),
  update: (id, data) => api.put(`/customers/${id}/`, data),
  delete: (id) => api.delete(`/customers/${id}/`),
};

// Invoices API
export const invoicesAPI = {
  getAll: (params) => api.get('/invoices/', { params }),
  getById: (id) => api.get(`/invoices/${id}/`),
  create: (data) => api.post('/invoices/', data),
  update: (id, data) => api.put(`/invoices/${id}/`, data),
  delete: (id) => api.delete(`/invoices/${id}/`),
  post: (id) => api.post(`/invoices/${id}/post/`),
};

// Credit Notes API
export const creditNotesAPI = {
  getAll: (params) => api.get('/credit-notes/', { params }),
  getById: (id) => api.get(`/credit-notes/${id}/`),
  create: (data) => api.post('/credit-notes/', data),
  update: (id, data) => api.put(`/credit-notes/${id}/`, data),
  delete: (id) => api.delete(`/credit-notes/${id}/`),
};

// Payments API
export const paymentsAPI = {
  getAll: (params) => api.get('/payments/', { params }),
  getById: (id) => api.get(`/payments/${id}/`),
  create: (data) => api.post('/payments/', data),
  update: (id, data) => api.put(`/payments/${id}/`, data),
  delete: (id) => api.delete(`/payments/${id}/`),
};

// ============ ACCOUNTS PAYABLE APIs ============

// Vendors API
export const vendorsAPI = {
  getAll: (params) => api.get('/vendors/', { params }),
  getById: (id) => api.get(`/vendors/${id}/`),
  create: (data) => api.post('/vendors/', data),
  update: (id, data) => api.put(`/vendors/${id}/`, data),
  delete: (id) => api.delete(`/vendors/${id}/`),
};

// Purchase Orders API
export const purchaseOrdersAPI = {
  getAll: (params) => api.get('/purchase-orders/', { params }),
  getById: (id) => api.get(`/purchase-orders/${id}/`),
  create: (data) => api.post('/purchase-orders/', data),
  update: (id, data) => api.put(`/purchase-orders/${id}/`, data),
  delete: (id) => api.delete(`/purchase-orders/${id}/`),
};

// Bills API
export const billsAPI = {
  getAll: (params) => api.get('/bills/', { params }),
  getById: (id) => api.get(`/bills/${id}/`),
  create: (data) => api.post('/bills/', data),
  update: (id, data) => api.put(`/bills/${id}/`, data),
  delete: (id) => api.delete(`/bills/${id}/`),
};

// Bill Payments API
export const billPaymentsAPI = {
  getAll: (params) => api.get('/bill-payments/', { params }),
  getById: (id) => api.get(`/bill-payments/${id}/`),
  create: (data) => api.post('/bill-payments/', data),
  update: (id, data) => api.put(`/bill-payments/${id}/`, data),
  delete: (id) => api.delete(`/bill-payments/${id}/`),
};

// ============ INVENTORY APIs ============

// Inventory Items API
export const inventoryItemsAPI = {
  getAll: (params) => api.get('/inventory-items/', { params }),
  getById: (id) => api.get(`/inventory-items/${id}/`),
  create: (data) => api.post('/inventory-items/', data),
  update: (id, data) => api.put(`/inventory-items/${id}/`, data),
  delete: (id) => api.delete(`/inventory-items/${id}/`),
};

// Inventory Transactions API
export const inventoryTransactionsAPI = {
  getAll: (params) => api.get('/inventory-transactions/', { params }),
  getById: (id) => api.get(`/inventory-transactions/${id}/`),
  create: (data) => api.post('/inventory-transactions/', data),
  update: (id, data) => api.put(`/inventory-transactions/${id}/`, data),
  delete: (id) => api.delete(`/inventory-transactions/${id}/`),
};

// Inventory COGS API
export const inventoryCOGSAPI = {
  getAll: (params) => api.get('/inventory-cogs/', { params }),
  getById: (id) => api.get(`/inventory-cogs/${id}/`),
  create: (data) => api.post('/inventory-cogs/', data),
};

// ============ RECONCILIATION APIs ============

// Bank Reconciliations API
export const bankReconciliationsAPI = {
  getAll: (params) => api.get('/bank-reconciliations/', { params }),
  getById: (id) => api.get(`/bank-reconciliations/${id}/`),
  create: (data) => api.post('/bank-reconciliations/', data),
  update: (id, data) => api.put(`/bank-reconciliations/${id}/`, data),
  delete: (id) => api.delete(`/bank-reconciliations/${id}/`),
  reconcile: (id) => api.post(`/bank-reconciliations/${id}/reconcile/`),
};

// ============ REVENUE RECOGNITION APIs ============

// Deferred Revenues API
export const deferredRevenuesAPI = {
  getAll: (params) => api.get('/deferred-revenues/', { params }),
  getById: (id) => api.get(`/deferred-revenues/${id}/`),
  create: (data) => api.post('/deferred-revenues/', data),
  update: (id, data) => api.put(`/deferred-revenues/${id}/`, data),
  delete: (id) => api.delete(`/deferred-revenues/${id}/`),
};

// Revenue Recognition Schedules API
export const revenueRecognitionSchedulesAPI = {
  getAll: (params) => api.get('/revenue-recognition-schedules/', { params }),
  getById: (id) => api.get(`/revenue-recognition-schedules/${id}/`),
  create: (data) => api.post('/revenue-recognition-schedules/', data),
  recognize: (id) => api.post(`/revenue-recognition-schedules/${id}/recognize/`),
};

// ============ PERIOD CLOSE APIs ============

// Period Close Checklists API
export const periodCloseChecklistsAPI = {
  getAll: (params) => api.get('/period-close-checklists/', { params }),
  getById: (id) => api.get(`/period-close-checklists/${id}/`),
  create: (data) => api.post('/period-close-checklists/', data),
  update: (id, data) => api.put(`/period-close-checklists/${id}/`, data),
  delete: (id) => api.delete(`/period-close-checklists/${id}/`),
};

// Period Close Items API
export const periodCloseItemsAPI = {
  getAll: (params) => api.get('/period-close-items/', { params }),
  getById: (id) => api.get(`/period-close-items/${id}/`),
  create: (data) => api.post('/period-close-items/', data),
  update: (id, data) => api.put(`/period-close-items/${id}/`, data),
  delete: (id) => api.delete(`/period-close-items/${id}/`),
};

// ============ FX & MULTI-CURRENCY APIs ============

// Exchange Rates API
export const exchangeRatesAPI = {
  getAll: (params) => api.get('/exchange-rates/', { params }),
  getById: (id) => api.get(`/exchange-rates/${id}/`),
  create: (data) => api.post('/exchange-rates/', data),
  update: (id, data) => api.put(`/exchange-rates/${id}/`, data),
  delete: (id) => api.delete(`/exchange-rates/${id}/`),
};

// FX Gain/Loss API
export const fxGainLossAPI = {
  getAll: (params) => api.get('/fx-gainloss/', { params }),
  getById: (id) => api.get(`/fx-gainloss/${id}/`),
  create: (data) => api.post('/fx-gainloss/', data),
  update: (id, data) => api.put(`/fx-gainloss/${id}/`, data),
  delete: (id) => api.delete(`/fx-gainloss/${id}/`),
};

// ============ NOTIFICATIONS APIs ============

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications/', { params }),
  getUnread: () => api.get('/notifications/unread/'),
  getById: (id) => api.get(`/notifications/${id}/`),
  markRead: (id) => api.post(`/notifications/${id}/mark_read/`),
  delete: (id) => api.delete(`/notifications/${id}/`),
};

// Notification Preferences API
export const notificationPreferencesAPI = {
  get: () => api.get('/notification-preferences/'),
  update: (data) => api.post('/notification-preferences/', data),
};

// ============ CLIENT MANAGEMENT APIs ============

// Clients API
export const clientsAPI = {
  getAll: (params) => api.get('/clients/', { params }),
  getById: (id) => api.get(`/clients/${id}/`),
  create: (data) => api.post('/clients/', data),
  update: (id, data) => api.put(`/clients/${id}/`, data),
  delete: (id) => api.delete(`/clients/${id}/`),
};

// Client Portals API
export const clientPortalsAPI = {
  getAll: () => api.get('/client-portals/'),
  getById: (id) => api.get(`/client-portals/${id}/`),
  create: (data) => api.post('/client-portals/', data),
  update: (id, data) => api.put(`/client-portals/${id}/`, data),
};

// Client Messages API
export const clientMessagesAPI = {
  getAll: (params) => api.get('/client-messages/', { params }),
  getById: (id) => api.get(`/client-messages/${id}/`),
  create: (data) => api.post('/client-messages/', data),
  update: (id, data) => api.put(`/client-messages/${id}/`, data),
};

// Client Documents API
export const clientDocumentsAPI = {
  getAll: (params) => api.get('/client-documents/', { params }),
  getById: (id) => api.get(`/client-documents/${id}/`),
  create: (data) => api.post('/client-documents/', data),
  update: (id, data) => api.put(`/client-documents/${id}/`, data),
  delete: (id) => api.delete(`/client-documents/${id}/`),
};

// Document Requests API
export const documentRequestsAPI = {
  getAll: (params) => api.get('/document-requests/', { params }),
  getById: (id) => api.get(`/document-requests/${id}/`),
  create: (data) => api.post('/document-requests/', data),
  update: (id, data) => api.put(`/document-requests/${id}/`, data),
  delete: (id) => api.delete(`/document-requests/${id}/`),
};

// Approval Requests API
export const approvalRequestsAPI = {
  getAll: (params) => api.get('/approval-requests/', { params }),
  getById: (id) => api.get(`/approval-requests/${id}/`),
  create: (data) => api.post('/approval-requests/', data),
  update: (id, data) => api.put(`/approval-requests/${id}/`, data),
};

// Document Templates API
export const documentTemplatesAPI = {
  getAll: (params) => api.get('/document-templates/', { params }),
  getById: (id) => api.get(`/document-templates/${id}/`),
  create: (data) => api.post('/document-templates/', data),
  update: (id, data) => api.put(`/document-templates/${id}/`, data),
  delete: (id) => api.delete(`/document-templates/${id}/`),
};

// ============ LOAN MANAGEMENT APIs ============

// Loans API
export const loansAPI = {
  getAll: (params) => api.get('/loans/', { params }),
  getById: (id) => api.get(`/loans/${id}/`),
  create: (data) => api.post('/loans/', data),
  update: (id, data) => api.put(`/loans/${id}/`, data),
  delete: (id) => api.delete(`/loans/${id}/`),
};

// Loan Payments API
export const loanPaymentsAPI = {
  getAll: (params) => api.get('/loan-payments/', { params }),
  getById: (id) => api.get(`/loan-payments/${id}/`),
  create: (data) => api.post('/loan-payments/', data),
  update: (id, data) => api.put(`/loan-payments/${id}/`, data),
};

// ============ COMPLIANCE & KYC/AML APIs ============

// KYC Profiles API
export const kycProfilesAPI = {
  getAll: (params) => api.get('/kyc-profiles/', { params }),
  getById: (id) => api.get(`/kyc-profiles/${id}/`),
  create: (data) => api.post('/kyc-profiles/', data),
  update: (id, data) => api.put(`/kyc-profiles/${id}/`, data),
  delete: (id) => api.delete(`/kyc-profiles/${id}/`),
};

// AML Transactions API
export const amlTransactionsAPI = {
  getAll: (params) => api.get('/aml-transactions/', { params }),
  getById: (id) => api.get(`/aml-transactions/${id}/`),
  create: (data) => api.post('/aml-transactions/', data),
  update: (id, data) => api.put(`/aml-transactions/${id}/`, data),
};

// ============ BILLING & FIRM MANAGEMENT APIs ============

// Firm Services API
export const firmServicesAPI = {
  getAll: (params) => api.get('/firm-services/', { params }),
  getById: (id) => api.get(`/firm-services/${id}/`),
  create: (data) => api.post('/firm-services/', data),
  update: (id, data) => api.put(`/firm-services/${id}/`, data),
  delete: (id) => api.delete(`/firm-services/${id}/`),
};

// Client Invoices API
export const clientInvoicesAPI = {
  getAll: (params) => api.get('/client-invoices/', { params }),
  getById: (id) => api.get(`/client-invoices/${id}/`),
  create: (data) => api.post('/client-invoices/', data),
  update: (id, data) => api.put(`/client-invoices/${id}/`, data),
  delete: (id) => api.delete(`/client-invoices/${id}/`),
};

// Client Invoice Line Items API
export const clientInvoiceLineItemsAPI = {
  getAll: (params) => api.get('/client-invoice-line-items/', { params }),
  getById: (id) => api.get(`/client-invoice-line-items/${id}/`),
  create: (data) => api.post('/client-invoice-line-items/', data),
  update: (id, data) => api.put(`/client-invoice-line-items/${id}/`, data),
  delete: (id) => api.delete(`/client-invoice-line-items/${id}/`),
};

// Client Subscriptions API
export const clientSubscriptionsAPI = {
  getAll: (params) => api.get('/client-subscriptions/', { params }),
  getById: (id) => api.get(`/client-subscriptions/${id}/`),
  create: (data) => api.post('/client-subscriptions/', data),
  update: (id, data) => api.put(`/client-subscriptions/${id}/`, data),
  delete: (id) => api.delete(`/client-subscriptions/${id}/`),
};

// ============ WHITE-LABELING APIs ============

// White Label Branding API
export const whiteLabelBrandingAPI = {
  getAll: () => api.get('/white-label-branding/'),
  getById: (id) => api.get(`/white-label-branding/${id}/`),
  create: (data) => api.post('/white-label-branding/', data),
  update: (id, data) => api.put(`/white-label-branding/${id}/`, data),
};

// ============ EMBEDDED BANKING & PAYMENTS APIs ============

// Banking Integrations API
export const bankingIntegrationsAPI = {
  getAll: (params) => api.get('/banking-integrations/', { params }),
  getById: (id) => api.get(`/banking-integrations/${id}/`),
  create: (data) => api.post('/banking-integrations/', data),
  update: (id, data) => api.put(`/banking-integrations/${id}/`, data),
  delete: (id) => api.delete(`/banking-integrations/${id}/`),
};

// Banking Transactions API
export const bankingTransactionsAPI = {
  getAll: (params) => api.get('/banking-transactions/', { params }),
  getById: (id) => api.get(`/banking-transactions/${id}/`),
};

// Embedded Payments API
export const embeddedPaymentsAPI = {
  getAll: (params) => api.get('/embedded-payments/', { params }),
  getById: (id) => api.get(`/embedded-payments/${id}/`),
  create: (data) => api.post('/embedded-payments/', data),
  update: (id, data) => api.put(`/embedded-payments/${id}/`, data),
};

// ============ WORKFLOW AUTOMATION APIs ============

// Automation Workflows API
export const automationWorkflowsAPI = {
  getAll: (params) => api.get('/automation-workflows/', { params }),
  getById: (id) => api.get(`/automation-workflows/${id}/`),
  create: (data) => api.post('/automation-workflows/', data),
  update: (id, data) => api.put(`/automation-workflows/${id}/`, data),
  delete: (id) => api.delete(`/automation-workflows/${id}/`),
};

// Automation Executions API
export const automationExecutionsAPI = {
  getAll: (params) => api.get('/automation-executions/', { params }),
  getById: (id) => api.get(`/automation-executions/${id}/`),
};

// ============ FIRM DASHBOARD & BUSINESS INTELLIGENCE APIs ============

// Firm Metrics API
export const firmMetricsAPI = {
  getAll: (params) => api.get('/firm-metrics/', { params }),
  getById: (id) => api.get(`/firm-metrics/${id}/`),
};

// Client Marketplace Integrations API
export const clientMarketplaceIntegrationsAPI = {
  getAll: (params) => api.get('/client-marketplace-integrations/', { params }),
  getById: (id) => api.get(`/client-marketplace-integrations/${id}/`),
  create: (data) => api.post('/client-marketplace-integrations/', data),
  update: (id, data) => api.put(`/client-marketplace-integrations/${id}/`, data),
  delete: (id) => api.delete(`/client-marketplace-integrations/${id}/`),
};

// ============ ENTITY HR APIs ============

// Entity Departments API
export const entityDepartmentsAPI = {
  getAll: (params) => api.get('/entity-departments/', { params }),
  getById: (id) => api.get(`/entity-departments/${id}/`),
  create: (data) => api.post('/entity-departments/', data),
  update: (id, data) => api.put(`/entity-departments/${id}/`, data),
  delete: (id) => api.delete(`/entity-departments/${id}/`),
};

// Entity Roles API
export const entityRolesAPI = {
  getAll: (params) => api.get('/entity-roles/', { params }),
  getById: (id) => api.get(`/entity-roles/${id}/`),
  create: (data) => api.post('/entity-roles/', data),
  update: (id, data) => api.put(`/entity-roles/${id}/`, data),
  delete: (id) => api.delete(`/entity-roles/${id}/`),
};

// Entity Staff API
export const entityStaffAPI = {
  getAll: (params) => api.get('/entity-staff/', { params }),
  getById: (id) => api.get(`/entity-staff/${id}/`),
  create: (data) => api.post('/entity-staff/', data),
  update: (id, data) => api.put(`/entity-staff/${id}/`, data),
  delete: (id) => api.delete(`/entity-staff/${id}/`),
};

// Task Requests API
export const taskRequestsAPI = {
  getAll: (params) => api.get('/task-requests/', { params }),
  getById: (id) => api.get(`/task-requests/${id}/`),
  create: (data) => api.post('/task-requests/', data),
  update: (id, data) => api.put(`/task-requests/${id}/`, data),
  delete: (id) => api.delete(`/task-requests/${id}/`),
};

// Bank Accounts API
export const bankAccountsAPI = {
  getAll: (params) => api.get('/bank-accounts/', { params }),
  getById: (id) => api.get(`/bank-accounts/${id}/`),
  create: (data) => api.post('/bank-accounts/', data),
  update: (id, data) => api.put(`/bank-accounts/${id}/`, data),
  delete: (id) => api.delete(`/bank-accounts/${id}/`),
};

// Recurring Transactions API
export const recurringTransactionsAPI = {
  getAll: (params) => api.get('/recurring-transactions/', { params }),
  getById: (id) => api.get(`/recurring-transactions/${id}/`),
  create: (data) => api.post('/recurring-transactions/', data),
  update: (id, data) => api.put(`/recurring-transactions/${id}/`, data),
  delete: (id) => api.delete(`/recurring-transactions/${id}/`),
};

// Financial Statements API
export const financialStatementsAPI = {
  getAll: (params) => api.get('/financial-statements/', { params }),
  incomeStatement: (params) => api.get('/financial-statements/income_statement/', { params }),
  balanceSheet: (params) => api.get('/financial-statements/balance_sheet/', { params }),
  cashFlow: (params) => api.get('/financial-statements/cash_flow_statement/', { params }),
};

// Tax Profiles API
export const taxProfilesAPI = {
  getAll: (params) => api.get('/tax-profiles/', { params }),
  getById: (id) => api.get(`/tax-profiles/${id}/`),
  create: (data) => api.post('/tax-profiles/', data),
  update: (id, data) => api.put(`/tax-profiles/${id}/`, data),
  delete: (id) => api.delete(`/tax-profiles/${id}/`),
};

export default api;
