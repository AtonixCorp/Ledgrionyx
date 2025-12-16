import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { EnterpriseProvider } from './context/EnterpriseContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Expenses from './pages/Expenses/Expenses';
import Income from './pages/Income/Income';
import Budget from './pages/Budget/Budget';
import Analytics from './pages/Analytics/Analytics';
import AIInsights from './pages/AIInsights/AIInsights';
import FinancialDNA from './pages/FinancialDNA/FinancialDNA';
import SecurityVaults from './pages/SecurityVaults/SecurityVaults';
import Achievements from './pages/Achievements/Achievements';
import TaxCalculator from './pages/TaxCalculator/TaxCalculator';
import GlobalTax from './pages/GlobalTax/GlobalTax';
import FinancialSettings from './pages/FinancialSettings/FinancialSettings';
import EnterpriseOrgOverview from './pages/Enterprise/EnterpriseOrgOverview';
import EnterpriseEntities from './pages/Enterprise/EnterpriseEntities';
import EnterpriseTaxCompliance from './pages/Enterprise/EnterpriseTaxCompliance';
import EnterpriseCashflow from './pages/Enterprise/EnterpriseCashflow';
import EnterpriseRiskExposure from './pages/Enterprise/EnterpriseRiskExposure';
import EnterpriseReports from './pages/Enterprise/EnterpriseReports';
import EnterpriseTeam from './pages/Enterprise/EnterpriseTeam';
import './App.css';

// Component for account-type based routing
const AccountTypeRoute = ({ children, requiredType }) => {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userAccountType = user?.account_type;

  if (requiredType === 'personal' && userAccountType === 'enterprise') {
    return <Navigate to="/app/enterprise/org-overview" replace />;
  }

  if (requiredType === 'enterprise' && userAccountType === 'personal') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <EnterpriseProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="personal">
                  <Layout><Dashboard /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute>
                <Layout><Expenses /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/income" element={
              <ProtectedRoute>
                <Layout><Income /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/budget" element={
              <ProtectedRoute>
                <Layout><Budget /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout><Analytics /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/ai-insights" element={
              <ProtectedRoute>
                <Layout><AIInsights /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/financial-dna" element={
              <ProtectedRoute>
                <Layout><FinancialDNA /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/security-vaults" element={
              <ProtectedRoute>
                <Layout><SecurityVaults /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/achievements" element={
              <ProtectedRoute>
                <Layout><Achievements /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/tax-calculator" element={
              <ProtectedRoute>
                <Layout><TaxCalculator /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/global-tax" element={<GlobalTax />} />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><FinancialSettings /></Layout>
              </ProtectedRoute>
            } />

            {/* Enterprise Routes */}
            <Route path="/app/enterprise/org-overview" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="enterprise">
                  <Layout><EnterpriseOrgOverview /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/app/enterprise/entities" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="enterprise">
                  <Layout><EnterpriseEntities /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/app/enterprise/tax-compliance" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="enterprise">
                  <Layout><EnterpriseTaxCompliance /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/app/enterprise/cashflow" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="enterprise">
                  <Layout><EnterpriseCashflow /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/app/enterprise/risk-exposure" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="enterprise">
                  <Layout><EnterpriseRiskExposure /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/app/enterprise/reports" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="enterprise">
                  <Layout><EnterpriseReports /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/app/enterprise/team" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="enterprise">
                  <Layout><EnterpriseTeam /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </EnterpriseProvider>
    </FinanceProvider>
  </AuthProvider>
  );
}

export default App;
