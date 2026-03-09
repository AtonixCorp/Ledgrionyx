import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaChartBar, FaGlobe, FaShieldAlt,
  FaCheckCircle, FaBuilding, FaNetworkWired,
  FaChartArea, FaBrain,
  FaExchangeAlt, FaFileAlt, FaUsersCog, FaBolt, FaEye,
  FaBalanceScale, FaStore, FaMobileAlt, FaServer, FaArrowRight
} from 'react-icons/fa';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const Landing = () => {
  return (
    <div className="landing-page">
      <Header />

      <section className="hero-section">
        {/* ── HERO ── */}
        <div className="hero-content">
          <div className="hero-eyebrow">The Financial Operating System</div>
          <h1 className="hero-title">
            One Platform.<br />
            <span className="hero-highlight">Every Financial Operation.</span>
          </h1>
          <p className="hero-description">
            ATC Capital is not an accounting tool. It is not a bookkeeping app. It is a unified
            Financial Operating System — built to transform how accounting firms, businesses, and
            financial institutions manage data, automate workflows, and integrate modern banking.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary btn-large">
              Request Access <FaArrowRight className="btn-icon" />
            </Link>
            <Link to="/login" className="btn-outline btn-large">
              Sign In
            </Link>
          </div>
          <div className="hero-tagline-row">
            <span className="hero-tag"><FaCheckCircle /> Real-Time Finance</span>
            <span className="hero-tag"><FaCheckCircle /> Multi-Tenant Architecture</span>
            <span className="hero-tag"><FaCheckCircle /> API-Driven Banking</span>
          </div>
        </div>
        <div className="hero-image">
          <Link to="/dashboard" className="hero-card card-1" style={{ textDecoration: 'none' }}>
            <div className="card-icon"><FaChartBar /></div>
            <div className="card-content">
              <h4>Live Dashboard</h4>
              <p>Real-time financial command center</p>
            </div>
          </Link>
          <Link to="/expenses" className="hero-card card-2" style={{ textDecoration: 'none' }}>
            <div className="card-icon"><FaExchangeAlt /></div>
            <div className="card-content">
              <h4>Bank Reconciliation</h4>
              <p>Auto-match, auto-post</p>
            </div>
          </Link>
          <Link to="/budget" className="hero-card card-3" style={{ textDecoration: 'none' }}>
            <div className="card-icon"><FaBalanceScale /></div>
            <div className="card-content">
              <h4>General Ledger</h4>
              <p>Multi-entity double-entry</p>
            </div>
          </Link>
          <Link to="/global-tax" className="hero-card card-4" style={{ textDecoration: 'none' }}>
            <div className="card-icon"><FaGlobe /></div>
            <div className="card-content">
              <h4>Global Compliance</h4>
              <p>KYC · KYB · AML</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── PROBLEM STRIP ── */}
      <section className="problem-strip">
        <div className="problem-strip-inner">
          <p className="problem-label">The Industry Problem</p>
          <div className="problem-items">
            {[
              'Disconnected Tools',
              'Manual Processes',
              'Zero Real-Time Visibility',
              'Poor Client Collaboration',
              'Ever-Growing Compliance Burden',
              'Banking That Doesn\'t Integrate',
            ].map((item) => (
              <span key={item} className="problem-item">{item}</span>
            ))}
          </div>
          <p className="problem-resolve">ATC Capital eliminates every one of these — permanently.</p>
        </div>
      </section>

      {/* ── IDENTITY / PILLARS ── */}
      <section className="pillars-section">
        <div className="pillars-container">
          <div className="section-header">
            <p className="section-eyebrow">Core Architecture</p>
            <h2 className="section-title">Nine Pillars of a Financial Operating System</h2>
            <p className="section-subtitle">
              Every decision, every feature, every line of code is anchored to these foundational principles.
            </p>
          </div>
          <div className="pillars-grid">
            {[
              { icon: <FaShieldAlt />, title: 'Institutional-Grade Security', desc: 'Every component is designed with enterprise-level protection at its core.' },
              { icon: <FaServer />, title: 'Multi-Tenant Architecture', desc: 'Each accounting firm receives its own fully isolated, secure environment.' },
              { icon: <FaBuilding />, title: 'Multi-Entity Support', desc: 'Manage multiple businesses under one unified umbrella without switching.' },
              { icon: <FaGlobe />, title: 'Multi-Currency Engine', desc: 'Global operations demand global currency support — fully built in.' },
              { icon: <FaNetworkWired />, title: 'API-Driven Integrations', desc: 'Seamless connections to banks, payment processors, and financial data providers.' },
              { icon: <FaBolt />, title: 'Automation-Powered Workflows', desc: 'Replace every manual, repetitive task with intelligent, rule-based automation.' },
              { icon: <FaEye />, title: 'Real-Time Financial Visibility', desc: 'Balances, transactions, and insights that update the moment they change.' },
              { icon: <FaBalanceScale />, title: 'Compliance-Aware Infrastructure', desc: 'KYC, KYB, AML, and immutable audit trails are embedded at the platform level.' },
              { icon: <FaUsersCog />, title: 'Client Collaboration Tools', desc: 'Portals, messaging, approvals, and document sharing — unified in one flow.' },
            ].map((pillar, i) => (
              <div className="pillar-card" key={i}>
                <div className="pillar-number">0{i + 1}</div>
                <div className="pillar-icon">{pillar.icon}</div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE BLUEPRINT ── */}
      <section className="blueprint-section">
        <div className="blueprint-container">
          <div className="section-header">
            <p className="section-eyebrow">Full Feature Blueprint</p>
            <h2 className="section-title">Everything Under One Roof</h2>
            <p className="section-subtitle">
              Seven interconnected modules that replace dozens of fragmented tools.
            </p>
          </div>
          <div className="blueprint-grid">
            <div className="blueprint-card bp-accent-1">
              <div className="bp-icon"><FaChartBar /></div>
              <h3>Core Accounting Engine</h3>
              <ul>
                <li><FaCheckCircle /> Multi-entity General Ledger</li>
                <li><FaCheckCircle /> Chart of Accounts Templates</li>
                <li><FaCheckCircle /> AI-Powered Automated Bookkeeping</li>
                <li><FaCheckCircle /> Real-Time Bank Reconciliation</li>
                <li><FaCheckCircle /> Balance Sheet · P&amp;L · Cash Flow</li>
                <li><FaCheckCircle /> Immutable Audit Trail</li>
              </ul>
            </div>
            <div className="blueprint-card bp-accent-2">
              <div className="bp-icon"><FaExchangeAlt /></div>
              <h3>Banking + Accounting Integration</h3>
              <ul>
                <li><FaCheckCircle /> Real-Time Banking Dashboard</li>
                <li><FaCheckCircle /> Embedded Bill Pay &amp; Payroll</li>
                <li><FaCheckCircle /> Loan Management &amp; Repayment Tracking</li>
                <li><FaCheckCircle /> AML + KYC/KYB Compliance Monitoring</li>
                <li><FaCheckCircle /> Secure API Bank Connections</li>
                <li><FaCheckCircle /> Risk Scoring Engine</li>
              </ul>
            </div>
            <div className="blueprint-card bp-accent-3">
              <div className="bp-icon"><FaUsersCog /></div>
              <h3>Client Management System</h3>
              <ul>
                <li><FaCheckCircle /> Full CRM with Financial History</li>
                <li><FaCheckCircle /> Secure Client Portal &amp; Messaging</li>
                <li><FaCheckCircle /> Task Management &amp; Deadlines</li>
                <li><FaCheckCircle /> Document Upload &amp; Version Control</li>
                <li><FaCheckCircle /> Digital Approvals Workflow</li>
                <li><FaCheckCircle /> Multi-Client Oversight Dashboard</li>
              </ul>
            </div>
            <div className="blueprint-card bp-accent-4">
              <div className="bp-icon"><FaBolt /></div>
              <h3>Automation Engine</h3>
              <ul>
                <li><FaCheckCircle /> Month-End &amp; Year-End Close Automation</li>
                <li><FaCheckCircle /> Payroll Cycle &amp; Tax Reminder Workflows</li>
                <li><FaCheckCircle /> AI Cash Flow Predictions</li>
                <li><FaCheckCircle /> Expense Analysis &amp; Risk Alerts</li>
                <li><FaCheckCircle /> Auto-Generated Financial Reports</li>
                <li><FaCheckCircle /> KPI Dashboards on Demand</li>
              </ul>
            </div>
            <div className="blueprint-card bp-accent-5">
              <div className="bp-icon"><FaShieldAlt /></div>
              <h3>Compliance &amp; Security</h3>
              <ul>
                <li><FaCheckCircle /> KYC / KYB Identity Verification</li>
                <li><FaCheckCircle /> AML Transaction Monitoring</li>
                <li><FaCheckCircle /> Suspicious Activity Alerting</li>
                <li><FaCheckCircle /> Regulatory Report Generation</li>
                <li><FaCheckCircle /> Role-Based Access Control (RBAC)</li>
                <li><FaCheckCircle /> Admin · Accountant · Client · Auditor Roles</li>
              </ul>
            </div>
            <div className="blueprint-card bp-accent-6">
              <div className="bp-icon"><FaBuilding /></div>
              <h3>Firm Operations Suite</h3>
              <ul>
                <li><FaCheckCircle /> Billing &amp; Subscription Management</li>
                <li><FaCheckCircle /> Firm-Wide Staff &amp; Workload Dashboard</li>
                <li><FaCheckCircle /> White-Label: Custom Domain &amp; Brand</li>
                <li><FaCheckCircle /> Marketplace: Add-Ons &amp; Partner Services</li>
                <li><FaCheckCircle /> Multi-Branch &amp; Multi-Region Support</li>
                <li><FaCheckCircle /> Enterprise Analytics Suite</li>
              </ul>
            </div>
            <div className="blueprint-card bp-accent-7">
              <div className="bp-icon"><FaMobileAlt /></div>
              <h3>Platform Infrastructure</h3>
              <ul>
                <li><FaCheckCircle /> Multi-Tenant Isolated Environments</li>
                <li><FaCheckCircle /> Bank &amp; Payroll API Integrations</li>
                <li><FaCheckCircle /> Tax Authority Connections</li>
                <li><FaCheckCircle /> Mobile App: Approvals &amp; Alerts</li>
                <li><FaCheckCircle /> 99.9% SLA Uptime Guarantee</li>
                <li><FaCheckCircle /> Enterprise SSO &amp; Audit Compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION STATEMENT ── */}
      <section className="vision-section">
        <div className="vision-container">
          <div className="section-header">
            <p className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Platform Vision</p>
            <h2 className="section-title" style={{ color: '#fff' }}>
              "One Platform. All Financial Operations. Fully Connected."
            </h2>
          </div>
          <div className="vision-unified-list">
            {[
              'One Login', 'One Dashboard', 'One Financial Engine',
              'One Reporting System', 'One Automation Layer', 'One Compliance Framework',
              'One Client Portal', 'One Integration Hub',
            ].map((item) => (
              <div className="vision-unified-item" key={item}>
                <FaCheckCircle className="vision-check" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="vision-closing">
            ATC Capital replaces dozens of disconnected tools with a single, unified Financial Operating System.
          </div>
        </div>
      </section>

      {/* ── BRAND PILLARS ── */}
      <section className="brand-pillars-section">
        <div className="section-header">
          <p className="section-eyebrow">Brand Identity</p>
          <h2 className="section-title">Built on Seven Commitments</h2>
        </div>
        <div className="brand-pillars-row">
          {['Precision', 'Security', 'Automation', 'Clarity', 'Professionalism', 'Scalability', 'Trust'].map(
            (p) => (
              <div className="brand-pillar-chip" key={p}>{p}</div>
            )
          )}
        </div>
        <div className="brand-promise-block">
          <blockquote>
            "ATC Capital gives accounting firms the power, speed, and intelligence they need to
            operate at the highest level."
          </blockquote>
        </div>
      </section>

      {/* ── FUTURE ROADMAP ── */}
      <section className="roadmap-section">
        <div className="roadmap-container">
          <div className="section-header">
            <p className="section-eyebrow">Long-Term Vision</p>
            <h2 className="section-title">The Future of ATC Capital</h2>
            <p className="section-subtitle">
              ATC Capital is not just a platform — it is a movement. A transformation. A new standard.
            </p>
          </div>
          <div className="roadmap-grid">
            {[
              { icon: <FaGlobe />, item: 'Global Banking Integrations' },
              { icon: <FaBrain />, item: 'AI-Driven Financial Forecasting' },
              { icon: <FaBalanceScale />, item: 'Automated Compliance Engines' },
              { icon: <FaFileAlt />, item: 'Full Tax Automation' },
              { icon: <FaChartArea />, item: 'Enterprise-Grade Analytics' },
              { icon: <FaNetworkWired />, item: 'Cross-Border Financial Intelligence' },
              { icon: <FaStore />, item: 'Global Marketplace of Financial Tools' },
            ].map((r) => (
              <div className="roadmap-item" key={r.item}>
                <div className="roadmap-icon">{r.icon}</div>
                <span>{r.item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-content">
          <p className="cta-eyebrow">The Future of Financial Operations</p>
          <h2>Built for Firms That Refuse to Fall Behind.</h2>
          <p>
            ATC Capital is built for firms that demand excellence, businesses that want clarity,
            and institutions that require precision. Your entire financial world — unified.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-primary btn-large">
              Get Started Today <FaArrowRight className="btn-icon" />
            </Link>
            <Link to="/features" className="btn-outline-white btn-large">
              Explore the Platform
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
