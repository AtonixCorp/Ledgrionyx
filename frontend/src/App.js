import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { EnterpriseProvider } from './context/EnterpriseContext';
import { FilterProvider } from './context/FilterContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
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
import EnterpriseDashboard from './pages/Enterprise/EnterpriseDashboard';
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
import AppDocumentVault from './modules/documents/DocumentVault';
import AppReceipts from './modules/documents/Receipts';
import AppClientDirectory from './modules/clients/ClientDirectory';
import AppClientPortal from './modules/clients/ClientPortal';
import AppAutomationRules from './modules/automation/AutomationRules';
import AppRecurringEntries from './modules/automation/RecurringEntries';
import AppAIInsights from './modules/automation/AIInsights';
import AppAPIKeys from './modules/integrations/APIKeys';
import AppIntegrationsList from './modules/integrations/IntegrationsList';
import AppFirmSettings from './modules/settings/FirmSettings';
import AppTeamPermissions from './modules/settings/TeamPermissions';
import AppSecurity from './modules/settings/Security';
import AppEntityManagement from './modules/settings/EntityManagement';
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

function App() {
  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <AuthProvider>
          <FinanceProvider>
            <EnterpriseProvider>
              <FilterProvider>
              <Router>
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

              {/* Redirect legacy personal routes to enterprise */}
              <Route path="/dashboard" element={<Navigate to="/app/overview/dashboard" replace />} />

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
                  <EntityDashboard />
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping" element={
                <ProtectedRoute>
                  <BookkeepingDashboard />
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/transactions" element={
                <ProtectedRoute>
                  <TransactionList />
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/categories" element={
                <ProtectedRoute>
                  <CategoryManager />
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/accounts" element={
                <ProtectedRoute>
                  <AccountManager />
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/reports" element={
                <ProtectedRoute>
                  <BookkeepingReports />
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/staff-hr" element={
                <ProtectedRoute>
                  <StaffHR />
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/cashflow-treasury" element={
                <ProtectedRoute>
                  <Layout><CashflowTreasuryDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/expenses" element={
                <ProtectedRoute>
                  <Layout><ExpensesManager /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/income" element={
                <ProtectedRoute>
                  <Layout><IncomeManager /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/budgets" element={
                <ProtectedRoute>
                  <Layout><BudgetsManager /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/chart-of-accounts" element={
                <ProtectedRoute>
                  <Layout><ChartOfAccounts /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/general-ledger" element={
                <ProtectedRoute>
                  <Layout><GeneralLedger /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/journal-entries" element={
                <ProtectedRoute>
                  <Layout><JournalEntries /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/accounts-receivable" element={
                <ProtectedRoute>
                  <Layout><ARModule /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/accounts-payable" element={
                <ProtectedRoute>
                  <Layout><APModule /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/inventory" element={
                <ProtectedRoute>
                  <Layout><Inventory /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bank-reconciliation" element={
                <ProtectedRoute>
                  <Layout><BankReconciliation /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/revenue-recognition" element={
                <ProtectedRoute>
                  <Layout><RevenueRecognition /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/period-close" element={
                <ProtectedRoute>
                  <Layout><LegacyPeriodClose /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/fx-accounting" element={
                <ProtectedRoute>
                  <Layout><FXModule /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/notifications" element={
                <ProtectedRoute>
                  <Layout><NotificationsCenter /></Layout>
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

              {/* Enterprise Multi-Branch Dashboard */}
              <Route path="/app/firm/enterprise-branches" element={
                <ProtectedRoute>
                  <Layout><EnterpriseDashboard /></Layout>
                </ProtectedRoute>
              } />

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
              <Route path="/app/overview/dashboard" element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
              <Route path="/app/overview/notifications" element={<ProtectedRoute><Layout><AppNotifications /></Layout></ProtectedRoute>} />
              <Route path="/app/overview/tasks" element={<ProtectedRoute><Layout><AppTasks /></Layout></ProtectedRoute>} />

              {/* Accounting */}
              <Route path="/app/accounting/chart-of-accounts" element={<ProtectedRoute><Layout><AppChartOfAccounts /></Layout></ProtectedRoute>} />
              <Route path="/app/accounting/general-ledger" element={<ProtectedRoute><Layout><AppGeneralLedger /></Layout></ProtectedRoute>} />
              <Route path="/app/accounting/journal-entries" element={<ProtectedRoute><Layout><AppJournalEntries /></Layout></ProtectedRoute>} />
              <Route path="/app/accounting/reconciliation" element={<ProtectedRoute><Layout><AppReconciliation /></Layout></ProtectedRoute>} />

              {/* Sub-Ledgers */}
              <Route path="/app/subledgers/accounts-receivable" element={<ProtectedRoute><Layout><AppAccountsReceivable /></Layout></ProtectedRoute>} />
              <Route path="/app/subledgers/accounts-payable" element={<ProtectedRoute><Layout><AppAccountsPayable /></Layout></ProtectedRoute>} />
              <Route path="/app/subledgers/cash-bank" element={<ProtectedRoute><Layout><AppCashBank /></Layout></ProtectedRoute>} />
              <Route path="/app/subledgers/fixed-assets" element={<ProtectedRoute><Layout><AppFixedAssets /></Layout></ProtectedRoute>} />
              <Route path="/app/subledgers/inventory" element={<ProtectedRoute><Layout><AppInventoryModule /></Layout></ProtectedRoute>} />
              <Route path="/app/subledgers/payroll" element={<ProtectedRoute><Layout><AppPayroll /></Layout></ProtectedRoute>} />
              <Route path="/app/subledgers/tax" element={<ProtectedRoute><Layout><AppTaxSubledger /></Layout></ProtectedRoute>} />

              {/* Billing */}
              <Route path="/app/billing/invoices" element={<ProtectedRoute><Layout><AppInvoices /></Layout></ProtectedRoute>} />
              <Route path="/app/billing/bills" element={<ProtectedRoute><Layout><AppBills /></Layout></ProtectedRoute>} />
              <Route path="/app/billing/customers" element={<ProtectedRoute><Layout><AppCustomers /></Layout></ProtectedRoute>} />
              <Route path="/app/billing/vendors" element={<ProtectedRoute><Layout><AppVendors /></Layout></ProtectedRoute>} />
              <Route path="/app/billing/payment-scheduling" element={<ProtectedRoute><Layout><AppPaymentScheduling /></Layout></ProtectedRoute>} />
              <Route path="/app/billing/collections" element={<ProtectedRoute><Layout><AppCollections /></Layout></ProtectedRoute>} />

              {/* Reporting */}
              <Route path="/app/reporting/statements" element={<ProtectedRoute><Layout><AppStatements /></Layout></ProtectedRoute>} />
              <Route path="/app/reporting/trial-balance" element={<ProtectedRoute><Layout><AppTrialBalance /></Layout></ProtectedRoute>} />
              <Route path="/app/reporting/analytics" element={<ProtectedRoute><Layout><AppAnalytics /></Layout></ProtectedRoute>} />
              <Route path="/app/reporting/risk-exposure" element={<ProtectedRoute><Layout><AppRiskExposure /></Layout></ProtectedRoute>} />

              {/* Budgeting */}
              <Route path="/app/budgeting/budgets" element={<ProtectedRoute><Layout><AppBudgets /></Layout></ProtectedRoute>} />
              <Route path="/app/budgeting/forecasts" element={<ProtectedRoute><Layout><AppForecasts /></Layout></ProtectedRoute>} />
              <Route path="/app/budgeting/variance-analysis" element={<ProtectedRoute><Layout><AppVarianceAnalysis /></Layout></ProtectedRoute>} />

              {/* Compliance */}
              <Route path="/app/compliance/tax-center" element={<ProtectedRoute><Layout><AppTaxCenter /></Layout></ProtectedRoute>} />
              <Route path="/app/compliance/audit-trail" element={<ProtectedRoute><Layout><AppAuditTrail /></Layout></ProtectedRoute>} />
              <Route path="/app/compliance/period-close" element={<ProtectedRoute><Layout><AppPeriodClose /></Layout></ProtectedRoute>} />

              {/* Documents */}
              <Route path="/app/documents/vault" element={<ProtectedRoute><Layout><AppDocumentVault /></Layout></ProtectedRoute>} />
              <Route path="/app/documents/receipts" element={<ProtectedRoute><Layout><AppReceipts /></Layout></ProtectedRoute>} />

              {/* Clients */}
              <Route path="/app/clients/directory" element={<ProtectedRoute><Layout><AppClientDirectory /></Layout></ProtectedRoute>} />
              <Route path="/app/clients/portal" element={<ProtectedRoute><Layout><AppClientPortal /></Layout></ProtectedRoute>} />

              {/* Automation */}
              <Route path="/app/automation/rules" element={<ProtectedRoute><Layout><AppAutomationRules /></Layout></ProtectedRoute>} />
              <Route path="/app/automation/recurring" element={<ProtectedRoute><Layout><AppRecurringEntries /></Layout></ProtectedRoute>} />
              <Route path="/app/automation/ai-insights" element={<ProtectedRoute><Layout><AppAIInsights /></Layout></ProtectedRoute>} />

              {/* Integrations */}
              <Route path="/app/integrations/api-keys" element={<ProtectedRoute><Layout><AppAPIKeys /></Layout></ProtectedRoute>} />
              <Route path="/app/integrations/list" element={<ProtectedRoute><Layout><AppIntegrationsList /></Layout></ProtectedRoute>} />

              {/* Settings */}
              <Route path="/app/settings/firm" element={<ProtectedRoute><Layout><AppFirmSettings /></Layout></ProtectedRoute>} />
              <Route path="/app/settings/team" element={<ProtectedRoute><Layout><AppTeamPermissions /></Layout></ProtectedRoute>} />
              <Route path="/app/settings/security" element={<ProtectedRoute><Layout><AppSecurity /></Layout></ProtectedRoute>} />
              <Route path="/app/settings/entities" element={<ProtectedRoute><AppEntityManagement /></ProtectedRoute>} />
              <Route path="/app/settings/branding" element={<ProtectedRoute><Layout><AppBranding /></Layout></ProtectedRoute>} />
              <Route path="/app/settings/subscription" element={<ProtectedRoute><Layout><AppSubscription /></Layout></ProtectedRoute>} />
              {/* Support */}
              <Route path="/app/support/help" element={<ProtectedRoute><Layout><AppHelpCenter /></Layout></ProtectedRoute>} />
              <Route path="/app/support/tickets" element={<ProtectedRoute><Layout><AppSupportTickets /></Layout></ProtectedRoute>} />
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
