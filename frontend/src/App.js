import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { EnterpriseProvider } from './context/EnterpriseContext';
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
import PeriodClose from './pages/Enterprise/Accounting/PeriodClose';
import FXModule from './pages/Enterprise/Accounting/FXModule';
import NotificationsCenter from './pages/Enterprise/Accounting/NotificationsCenter';
import Product from './pages/Product/Product';
import Features from './pages/Features/Features';
import Pricing from './pages/Pricing/Pricing';
import About from './pages/About/About';
import Support from './pages/Support/Support';
import HelpCenter from './pages/HelpCenter/HelpCenter';
import Contact from './pages/Contact/Contact';
import Privacy from './pages/Privacy/Privacy';
import './App.css';

function App() {
  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <AuthProvider>
          <FinanceProvider>
            <EnterpriseProvider>
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
              <Route path="/dashboard" element={<Navigate to="/app/enterprise/org-overview" replace />} />

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
                  <Layout><EntityDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping" element={
                <ProtectedRoute>
                  <Layout><BookkeepingDashboard /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/transactions" element={
                <ProtectedRoute>
                  <Layout><TransactionList /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/categories" element={
                <ProtectedRoute>
                  <Layout><CategoryManager /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/accounts" element={
                <ProtectedRoute>
                  <Layout><AccountManager /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/reports" element={
                <ProtectedRoute>
                  <Layout><BookkeepingReports /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/enterprise/entity/:entityId/bookkeeping/staff-hr" element={
                <ProtectedRoute>
                  <Layout><StaffHR /></Layout>
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
                  <Layout><PeriodClose /></Layout>
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
            </Routes>
              </Router>
          </EnterpriseProvider>
        </FinanceProvider>
      </AuthProvider>
    </LanguageProvider>
    </AccessibilityProvider>
  );
}

export default App;
