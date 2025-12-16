import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import EntityDashboard from './pages/Enterprise/EntityDashboard';
import EnterpriseTaxCompliance from './pages/Enterprise/EnterpriseTaxCompliance';
import EnterpriseCashflow from './pages/Enterprise/EnterpriseCashflow';
import EnterpriseRiskExposure from './pages/Enterprise/EnterpriseRiskExposure';
import EnterpriseReports from './pages/Enterprise/EnterpriseReports';
import EnterpriseTeam from './pages/Enterprise/EnterpriseTeam';
import EnterpriseSettings from './pages/EnterpriseSettings/EnterpriseSettings';
// Import the new pages
import Product from './pages/Product/Product';
import Features from './pages/Features/Features';
import Pricing from './pages/Pricing/Pricing';
import About from './pages/About/About';
import Support from './pages/Support/Support';
import HelpCenter from './pages/HelpCenter/HelpCenter';
import Contact from './pages/Contact/Contact';
import Privacy from './pages/Privacy/Privacy';
import './App.css';

// Component for account-type based routing
const AccountTypeRoute = ({ children, requiredType }) => {
  // Try to get user from multiple sources
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  let userAccountType = user?.account_type;

  // If no account type is set, default to 'personal' for backward compatibility
  const accountType = userAccountType || 'personal';

  // Debug logging
  console.log(`AccountTypeRoute - Required: ${requiredType}, User Account Type: ${accountType}, User:`, user);

  if (requiredType === 'personal' && accountType === 'enterprise') {
    return <Navigate to="/app/enterprise/org-overview" replace />;
  }

  if (requiredType === 'enterprise' && accountType === 'personal') {
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
              
              {/* Website Pages */}
              <Route path="/product" element={<Product />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/support" element={<Support />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />

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
                <AccountTypeRoute requiredType="personal">
                  <Layout><Expenses /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/income" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="personal">
                  <Layout><Income /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/budget" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="personal">
                  <Layout><Budget /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="personal">
                  <Layout><Analytics /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/ai-insights" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="personal">
                  <Layout><AIInsights /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/financial-dna" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="personal">
                  <Layout><FinancialDNA /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/security-vaults" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="personal">
                  <Layout><SecurityVaults /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/achievements" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="personal">
                  <Layout><Achievements /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/tax-calculator" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="personal">
                  <Layout><TaxCalculator /></Layout>
                </AccountTypeRoute>
              </ProtectedRoute>
            } />
            <Route path="/global-tax" element={<GlobalTax />} />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="personal">
                  <Layout><FinancialSettings /></Layout>
                </AccountTypeRoute>
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
            <Route path="/app/enterprise/entities/:entityId/dashboard" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="enterprise">
                  <Layout><EntityDashboard /></Layout>
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
            <Route path="/app/enterprise/settings" element={
              <ProtectedRoute>
                <AccountTypeRoute requiredType="enterprise">
                  <Layout><EnterpriseSettings /></Layout>
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
