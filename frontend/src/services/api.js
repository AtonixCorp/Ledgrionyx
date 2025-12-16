import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;
