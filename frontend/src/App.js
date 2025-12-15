import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
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
import FinancialSettings from './pages/FinancialSettings/FinancialSettings';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
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
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><FinancialSettings /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </FinanceProvider>
    </AuthProvider>
  );
}

export default App;
