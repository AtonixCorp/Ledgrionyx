import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { EnterpriseProvider } from './context/EnterpriseContext';
import { FilterProvider } from './context/FilterContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import ProtectedRoute from './components/ProtectedRoute';
import WorkspaceRoute from './components/WorkspaceRoute';
import Layout from './components/Layout/Layout';
import EntityLayout from './components/EntityLayout/EntityLayout';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import GlobalTax from './pages/GlobalTax/GlobalTax';
import EnterpriseOrgOverview from './pages/Enterprise/EnterpriseOrgOverview';
import EnterpriseEntities from './pages/Enterprise/EnterpriseEntities';
import EntityDashboard from './pages/Enterprise/EntityDashboard';
import BookkeepingDashboard from './pages/Enterprise/Bookkeeping/BookkeepingDashboard';
import TransactionList from './pages/Enterprise/Bookkeeping/TransactionList';
import CategoryManager from './pages/Enterprise/Bookkeeping/CategoryManager';
import AccountManager from './pages/Enterprise/Bookkeeping/AccountManager';
import BookkeepingReports from './pages/Enterprise/Bookkeeping/BookkeepingReports';
import StaffHR from './pages/Enterprise/Bookkeeping/StaffHR';
import CashflowTreasuryDashboard from './pages/Enterprise/CashflowTreasuryDashboard';
import ExpensesManager from './pages/Enterprise/Management/ExpensesManager';
import IncomeManager from './pages/Enterprise/Management/IncomeManager';
import BudgetsManager from './pages/Enterprise/Management/BudgetsManager';
import EnterpriseTaxCompliance from './pages/Enterprise/EnterpriseTaxCompliance';
import EnterpriseCashflow from './pages/Enterprise/EnterpriseCashflow';
import EnterpriseRiskExposure from './pages/Enterprise/EnterpriseRiskExposure';
import EnterpriseReports from './pages/Enterprise/EnterpriseReports';
import EnterpriseTeam from './pages/Enterprise/EnterpriseTeam';
import EnterpriseSettings from './pages/EnterpriseSettings/EnterpriseSettings';
import FirmDashboard from './pages/Firm/FirmDashboard';
import WhiteLabel from './pages/Firm/WhiteLabel';
import Marketplace from './pages/Firm/Marketplace';
import APIIntegrations from './pages/Firm/APIIntegrations';
import ChartOfAccounts from './pages/Enterprise/Accounting/ChartOfAccounts';
import GeneralLedger from './pages/Enterprise/Accounting/GeneralLedger';
import JournalEntries from './pages/Enterprise/Accounting/JournalEntries';
import ARModule from './pages/Enterprise/Accounting/ARModule';
import APModule from './pages/Enterprise/Accounting/APModule';
import Inventory from './pages/Enterprise/Accounting/Inventory';
import BankReconciliation from './pages/Enterprise/Accounting/BankReconciliation';
import RevenueRecognition from './pages/Enterprise/Accounting/RevenueRecognition';
import LegacyPeriodClose from './pages/Enterprise/Accounting/PeriodClose';
import FXModule from './pages/Enterprise/Accounting/FXModule';
import NotificationsCenter from './pages/Enterprise/Accounting/NotificationsCenter';

//  New module pages
import AppDashboard from './modules/overview/Dashboard';
import AppNotifications from './modules/overview/Notifications';
import AppTasks from './modules/overview/Tasks';
import AppChartOfAccounts from './modules/accounting/coa/ChartOfAccounts';
import AppGeneralLedger from './modules/accounting/general-ledger/GeneralLedger';
import AppJournalEntries from './modules/accounting/journals/JournalEntries';
import AppReconciliation from './modules/accounting/reconciliation/Reconciliation';
import AppAccountsReceivable from './modules/subledgers/ar/AccountsReceivable';
import AppAccountsPayable from './modules/subledgers/ap/AccountsPayable';
import AppCashBank from './modules/subledgers/cash-bank/CashBank';
import AppFixedAssets from './modules/subledgers/fixed-assets/FixedAssets';
import AppInventoryModule from './modules/subledgers/inventory/InventoryModule';
import AppPayroll from './modules/subledgers/payroll/Payroll';
import AppTaxSubledger from './modules/subledgers/tax/TaxSubledger';
import AppInvoices from './modules/billing/Invoices';
import AppBills from './modules/billing/Bills';
import AppCustomers from './modules/billing/Customers';
import AppVendors from './modules/billing/Vendors';
import AppPaymentScheduling from './modules/billing/PaymentScheduling';
import AppCollections from './modules/billing/Collections';
import AppStatements from './modules/reporting/Statements';
import AppTrialBalance from './modules/reporting/TrialBalance';
import AppAnalytics from './modules/reporting/Analytics';
import AppRiskExposure from './modules/reporting/RiskExposure';
import AppBudgets from './modules/budgeting/Budgets';
import AppForecasts from './modules/budgeting/Forecasts';
import AppVarianceAnalysis from './modules/budgeting/VarianceAnalysis';
import AppTaxCenter from './modules/compliance/TaxCenter';
import AppAuditTrail from './modules/compliance/AuditTrail';
import AppPeriodClose from './modules/compliance/PeriodClose';
import AppTaxCalculator from './modules/compliance/TaxCalculator';
import AppTaxMonitoring from './modules/compliance/TaxMonitoring';
import AppFilingAssistant from './modules/compliance/FilingAssistant';
import AppDocumentVault from './modules/documents/DocumentVault';
import AppReceipts from './modules/documents/Receipts';
import AppClientDirectory from './modules/clients/ClientDirectory';
import AppClientPortal from './modules/clients/ClientPortal';
import AppAutomationRules from './modules/automation/AutomationRules';
import AppRecurringEntries from './modules/automation/RecurringEntries';
import AppAIInsights from './modules/automation/AIInsights';
import AppAIAdvisor from './modules/automation/AIAdvisor';
import AppAPIKeys from './modules/integrations/APIKeys';
import AppIntegrationsList from './modules/integrations/IntegrationsList';
import AppFirmSettings from './modules/settings/FirmSettings';
import AppTeamPermissions from './modules/settings/TeamPermissions';
import AppSecurity from './modules/settings/Security';
import AppBranding from './modules/settings/Branding';
import AppSubscription from './modules/settings/Subscription';
import AppHelpCenter from './modules/support/HelpCenter';
import AppSupportTickets from './modules/support/SupportTickets';
import Product from './pages/Product/Product';
import Features from './pages/Features/Features';
import Pricing from './pages/Pricing/Pricing';
import About from './pages/About/About';
import Support from './pages/Support/Support';
import HelpCenter from './pages/HelpCenter/HelpCenter';
import Contact from './pages/Contact/Contact';
import Privacy from './pages/Privacy/Privacy';
import CLIDocs from './pages/CLIDocs/CLIDocs';
import GlobalErrorCenter from './components/GlobalErrorCenter';
import GlobalConsole from './pages/GlobalConsole/GlobalConsole';
import CreateWorkspace from './pages/Workspace/CreateWorkspace';

function App() {
  const renderModuleCrudRoutes = (basePath, Component) => [
    <Route key={`${basePath}-index`} path={basePath} element={<WorkspaceRoute><Layout><Component /></Layout></WorkspaceRoute>} />,
    <Route key={`${basePath}-list`} path={`${basePath}/list`} element={<WorkspaceRoute><Layout><Component /></Layout></WorkspaceRoute>} />,
    <Route key={`${basePath}-create`} path={`${basePath}/create`} element={<WorkspaceRoute><Layout><Component /></Layout></WorkspaceRoute>} />,
    <Route key={`${basePath}-edit`} path={`${basePath}/edit/:id`} element={<WorkspaceRoute><Layout><Component /></Layout></WorkspaceRoute>} />,
    <Route key={`${basePath}-view`} path={`${basePath}/view/:id`} element={<WorkspaceRoute><Layout><Component /></Layout></WorkspaceRoute>} />,
  ];

  const renderModulePageRoutes = (basePath, Component) => [
    <Route key={`${basePath}-index`} path={basePath} element={<WorkspaceRoute><Layout><Component /></Layout></WorkspaceRoute>} />,
    <Route key={`${basePath}-list`} path={`${basePath}/list`} element={<WorkspaceRoute><Layout><Component /></Layout></WorkspaceRoute>} />,
  ];

  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <AuthProvider>
          <FinanceProvider>
            <EnterpriseProvider>
              <FilterProvider>
              <Router>
            <GlobalErrorCenter />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Website Pages */}
              <Route path="/product" element={<Product />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/support" element={<Support />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/global-tax" element={<GlobalTax />} />
              <Route path="/v1/docs" element={<CLIDocs />} />

              {/* Redirect legacy personal routes to enterprise */}
              <Route path="/dashboard" element={<Navigate to="/app/console" replace />} />

              {/* Global Console — no sidebar */}
              <Route path="/app/console" element={<ProtectedRoute><GlobalConsole /></ProtectedRoute>} />
              <Route path="/app/workspaces/create" element={<ProtectedRoute><CreateWorkspace /></ProtectedRoute>} />

              {/* Enterprise Routes */}
              <Route path="/app/enterprise/org-overview" element={
                <ProtectedRoute>
                  <Layout><EnterpriseOrgOverview /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/app/enterprise/entities" element={
                <ProtectedRoute>
                  <Layout><EnterpriseEntities /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/app/enterprise/entities/:entityId/dashboard" element={
                <ProtectedRoute>
                  <EntityLayout><EntityDashboard /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping" element={
                <ProtectedRoute>
                  <EntityLayout><BookkeepingDashboard /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/transactions" element={
                <ProtectedRoute>
                  <EntityLayout><TransactionList /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/categories" element={
                <ProtectedRoute>
                  <EntityLayout><CategoryManager /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/accounts" element={
                <ProtectedRoute>
                  <EntityLayout><AccountManager /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/reports" element={
                <ProtectedRoute>
                  <EntityLayout><BookkeepingReports /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/staff-hr" element={
                <ProtectedRoute>
                  <EntityLayout><StaffHR /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/cashflow-treasury" element={
                <ProtectedRoute>
                  <EntityLayout><CashflowTreasuryDashboard /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/expenses" element={
                <ProtectedRoute>
                  <EntityLayout><ExpensesManager /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/income" element={
                <ProtectedRoute>
                  <EntityLayout><IncomeManager /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/budgets" element={
                <ProtectedRoute>
                  <EntityLayout><BudgetsManager /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/chart-of-accounts" element={
                <ProtectedRoute>
                  <EntityLayout><ChartOfAccounts /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/general-ledger" element={
                <ProtectedRoute>
                  <EntityLayout><GeneralLedger /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/journal-entries" element={
                <ProtectedRoute>
                  <EntityLayout><JournalEntries /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/accounts-receivable" element={
                <ProtectedRoute>
                  <EntityLayout><ARModule /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/accounts-payable" element={
                <ProtectedRoute>
                  <EntityLayout><APModule /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/inventory" element={
                <ProtectedRoute>
                  <EntityLayout><Inventory /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bank-reconciliation" element={
                <ProtectedRoute>
                  <EntityLayout><BankReconciliation /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/revenue-recognition" element={
                <ProtectedRoute>
                  <EntityLayout><RevenueRecognition /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/period-close" element={
                <ProtectedRoute>
                  <EntityLayout><LegacyPeriodClose /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/fx-accounting" element={
                <ProtectedRoute>
                  <EntityLayout><FXModule /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/notifications" element={
                <ProtectedRoute>
                  <EntityLayout><NotificationsCenter /></EntityLayout>
                </ProtectedRoute>
              } />
              <Route path="/app/enterprise/tax-compliance" element={
                <ProtectedRoute>
                  <Layout><EnterpriseTaxCompliance /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/app/enterprise/cashflow" element={
                <ProtectedRoute>
                  <Layout><EnterpriseCashflow /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/app/enterprise/risk-exposure" element={
                <ProtectedRoute>
                  <Layout><EnterpriseRiskExposure /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/app/enterprise/reports" element={
                <ProtectedRoute>
                  <Layout><EnterpriseReports /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/app/enterprise/team" element={
                <ProtectedRoute>
                  <Layout><EnterpriseTeam /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/app/enterprise/settings" element={
                <ProtectedRoute>
                  <Layout><EnterpriseSettings /></Layout>
                </ProtectedRoute>
              } />

              {/* Legacy Group Overview route */}
              <Route path="/app/firm/enterprise-branches" element={<Navigate to="/app/enterprise/org-overview" replace />} />

              {/* Firm Management Routes */}
              <Route path="/app/firm/dashboard" element={
                <ProtectedRoute>
                  <Layout><FirmDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/app/firm/white-label" element={
                <ProtectedRoute>
                  <Layout><WhiteLabel /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/app/firm/marketplace" element={
                <ProtectedRoute>
                  <Layout><Marketplace /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/app/firm/integrations" element={
                <ProtectedRoute>
                  <Layout><APIIntegrations /></Layout>
                </ProtectedRoute>
              } />

              {/*  New Module Routes  */}
              {/* Overview */}
              {renderModulePageRoutes('/app/overview/dashboard', AppDashboard)}
              {renderModulePageRoutes('/app/overview/notifications', AppNotifications)}
              {renderModuleCrudRoutes('/app/overview/tasks', AppTasks)}

              {/* Accounting */}
              {renderModuleCrudRoutes('/app/accounting/chart-of-accounts', AppChartOfAccounts)}
              {renderModulePageRoutes('/app/accounting/general-ledger', AppGeneralLedger)}
              {renderModuleCrudRoutes('/app/accounting/journal-entries', AppJournalEntries)}
              {renderModuleCrudRoutes('/app/accounting/reconciliation', AppReconciliation)}

              {/* Sub-Ledgers */}
              {renderModuleCrudRoutes('/app/subledgers/accounts-receivable', AppAccountsReceivable)}
              {renderModuleCrudRoutes('/app/subledgers/accounts-payable', AppAccountsPayable)}
              {renderModuleCrudRoutes('/app/subledgers/cash-bank', AppCashBank)}
              {renderModuleCrudRoutes('/app/subledgers/fixed-assets', AppFixedAssets)}
              {renderModuleCrudRoutes('/app/subledgers/inventory', AppInventoryModule)}
              {renderModuleCrudRoutes('/app/subledgers/payroll', AppPayroll)}
              {renderModuleCrudRoutes('/app/subledgers/tax', AppTaxSubledger)}

              {/* Billing */}
              {renderModuleCrudRoutes('/app/billing/invoices', AppInvoices)}
              {renderModuleCrudRoutes('/app/billing/bills', AppBills)}
              {renderModuleCrudRoutes('/app/billing/customers', AppCustomers)}
              {renderModuleCrudRoutes('/app/billing/vendors', AppVendors)}
              {renderModulePageRoutes('/app/billing/payment-scheduling', AppPaymentScheduling)}
              {renderModulePageRoutes('/app/billing/collections', AppCollections)}

              {/* Reporting */}
              {renderModulePageRoutes('/app/reporting/statements', AppStatements)}
              {renderModulePageRoutes('/app/reporting/trial-balance', AppTrialBalance)}
              {renderModulePageRoutes('/app/reporting/analytics', AppAnalytics)}
              {renderModulePageRoutes('/app/reporting/risk-exposure', AppRiskExposure)}

              {/* Budgeting */}
              {renderModulePageRoutes('/app/budgeting/budgets', AppBudgets)}
              {renderModulePageRoutes('/app/budgeting/forecasts', AppForecasts)}
              {renderModulePageRoutes('/app/budgeting/variance-analysis', AppVarianceAnalysis)}

              {/* Compliance */}
              {renderModuleCrudRoutes('/app/compliance/tax-center', AppTaxCenter)}
              {renderModuleCrudRoutes('/app/compliance/audit-trail', AppAuditTrail)}
              {renderModuleCrudRoutes('/app/compliance/period-close', AppPeriodClose)}
              {renderModulePageRoutes('/app/compliance/tax-calculator', AppTaxCalculator)}
              {renderModulePageRoutes('/app/compliance/monitoring', AppTaxMonitoring)}
              {renderModulePageRoutes('/app/compliance/filing', AppFilingAssistant)}

              {/* Documents */}
              {renderModulePageRoutes('/app/documents/vault', AppDocumentVault)}
              {renderModulePageRoutes('/app/documents/receipts', AppReceipts)}

              {/* Clients */}
              {renderModulePageRoutes('/app/clients/directory', AppClientDirectory)}
              {renderModulePageRoutes('/app/clients/portal', AppClientPortal)}

              {/* Automation */}
              {renderModulePageRoutes('/app/automation/rules', AppAutomationRules)}
              {renderModulePageRoutes('/app/automation/recurring', AppRecurringEntries)}
              {renderModulePageRoutes('/app/automation/ai-insights', AppAIInsights)}
              {renderModulePageRoutes('/app/automation/ai-advisor', AppAIAdvisor)}

              {/* Integrations */}
              {renderModulePageRoutes('/app/integrations/api-keys', AppAPIKeys)}
              {renderModulePageRoutes('/app/integrations/list', AppIntegrationsList)}

              {/* Settings */}
              {renderModulePageRoutes('/app/settings/firm', AppFirmSettings)}
              {renderModulePageRoutes('/app/settings/team', AppTeamPermissions)}
              {renderModulePageRoutes('/app/settings/security', AppSecurity)}
              <Route path="/app/settings/entities" element={<Navigate to="/app/enterprise/entities" replace />} />
              {renderModulePageRoutes('/app/settings/branding', AppBranding)}
              {renderModulePageRoutes('/app/settings/subscription', AppSubscription)}
              {/* Support */}
              {renderModulePageRoutes('/app/support/help', AppHelpCenter)}
              {renderModulePageRoutes('/app/support/tickets', AppSupportTickets)}
            </Routes>
              </Router>
              </FilterProvider>
          </EnterpriseProvider>
        </FinanceProvider>
      </AuthProvider>
    </LanguageProvider>
    </AccessibilityProvider>
  );
}

export default App;
