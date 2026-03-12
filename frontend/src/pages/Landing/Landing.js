import React from 'react';
import { Link } from 'react-router-dom';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <Header />

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="atc-hero" aria-label="Hero">
        <div className="atc-hero-inner">

          {/* Left — Text content */}
          <div className="atc-hero-text">
            <h1 className="atc-hero-headline">
              Accounting Built for<br />Global Confidence
            </h1>
            <p className="atc-hero-sub">
              AtcCapital delivers secure accounts, global transfers, and
              institution-grade financial tools designed for individuals
              and businesses worldwide.
            </p>
            <div className="atc-hero-actions">
              <Link to="/register" className="atc-hero-btn-primary">
                Open Your Account
              </Link>
              <Link to="/features" className="atc-hero-btn-secondary">
                Explore Products
              </Link>
            </div>
          </div>

          {/* Right — Institutional product card */}
          <div className="atc-hero-card-wrap">
            <div className="atc-product-card" role="presentation">
              <div className="atc-card-header">
                <span className="atc-card-label">Account Overview</span>
                <span className="atc-card-live">
                  <span className="atc-live-dot" aria-hidden="true" />
                  Live
                </span>
              </div>

              <div className="atc-card-balance">$2,847,392.00</div>
              <div className="atc-card-currency">USD · Multi-Currency Ready</div>

              <div className="atc-card-divider" />

              <div className="atc-card-metrics">
                <div className="atc-card-metric">
                  <span className="atc-metric-label">Inflow (30d)</span>
                  <span className="atc-metric-value atc-metric-up">+$184,720</span>
                </div>
                <div className="atc-card-metric">
                  <span className="atc-metric-label">Outflow (30d)</span>
                  <span className="atc-metric-value atc-metric-down">−$62,410</span>
                </div>
                <div className="atc-card-metric">
                  <span className="atc-metric-label">Entities</span>
                  <span className="atc-metric-value">12</span>
                </div>
              </div>

              <div className="atc-card-divider" />

              <div className="atc-card-activity">
                <span className="atc-activity-label">Recent Activity</span>
                {[
                  { desc: 'Wire Transfer — HSBC London',     amount: '−$12,000', time: '2m ago',  up: false },
                  { desc: 'Invoice Settlement — Acme Corp',  amount: '+$45,200', time: '1h ago',  up: true  },
                  { desc: 'FX Conversion — EUR/USD',         amount: '+$8,340',  time: '3h ago',  up: true  },
                ].map((tx, i) => (
                  <div className="atc-activity-row" key={i}>
                    <div>
                      <div className="atc-activity-desc">{tx.desc}</div>
                      <div className="atc-activity-time">{tx.time}</div>
                    </div>
                    <span className={`atc-activity-amount ${tx.up ? 'atc-metric-up' : 'atc-metric-down'}`}>
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION DIVIDER ────────────────────────────────────────── */}
      <div className="atc-section-divider" />

      {/* ── THREE-CARD FEATURE ROW ─────────────────────────────────── */}
      <section className="atc-feature-section" aria-label="Choose a product">
        <div className="atc-feature-inner">
          <h2 className="atc-feature-title">Choose What's Right for You</h2>
          <div className="atc-feature-cards">

            {/* Card 1 — Personal Banking */}
            <div className="atc-feature-card">
              <div className="atc-feature-icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="11" r="5" stroke="var(--color-cyan)" strokeWidth="2"/>
                  <path d="M6 27c0-5.523 4.477-10 10-10s10 4.477 10 10"
                        stroke="var(--color-cyan)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="atc-feature-card-title">AtcCapital Personal Banking</h3>
              <p className="atc-feature-card-desc">
                Open your everyday account with full access to global transfers,
                savings tools, and real-time financial visibility.
              </p>
              <Link to="/register" className="atc-feature-card-cta">Get Started →</Link>
            </div>

            {/* Card 2 — Business Banking */}
            <div className="atc-feature-card">
              <div className="atc-feature-icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="10" width="24" height="18" stroke="var(--color-cyan)" strokeWidth="2"/>
                  <path d="M11 10V6h10v4" stroke="var(--color-cyan)" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 18h2M18 18h2M12 23h2M18 23h2"
                        stroke="var(--color-cyan)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="atc-feature-card-title">AtcCapital Business Banking</h3>
              <p className="atc-feature-card-desc">
                Power your business with secure banking tools, multi-entity management,
                and institution-grade compliance infrastructure.
              </p>
              <Link to="/features" className="atc-feature-card-cta">Explore Business →</Link>
            </div>

            {/* Card 3 — Global Transfers */}
            <div className="atc-feature-card">
              <div className="atc-feature-icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="11" stroke="var(--color-cyan)" strokeWidth="2"/>
                  <path d="M5 16h22M16 5c-2.5 3-4 6.5-4 11s1.5 8 4 11M16 5c2.5 3 4 6.5 4 11s-1.5 8-4 11"
                        stroke="var(--color-cyan)" strokeWidth="2"/>
                  <path d="M20 12l3 4-3 4" stroke="var(--color-cyan)" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="atc-feature-card-title">AtcCapital Global Transfers</h3>
              <p className="atc-feature-card-desc">
                Send money across borders with confidence. Multi-currency, low cost,
                and real-time settlement to over 150 countries.
              </p>
              <Link to="/global-tax" className="atc-feature-card-cta">Transfer Now →</Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION DIVIDER ────────────────────────────────────────── */}
      <div className="atc-section-divider" />

      {/*  PROBLEM STRIP  */}
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

      {/*  IDENTITY / PILLARS  */}
      <section className="pillars-section">
        <div className="pillars-container">
          <div className="section-header">
            <p className="section-eyebrow">Core Architecture</p>
            <h2 className="section-title">Nine Pillars of a Financial Operating System</h2>
            <p className="section-subtitle">Every decision, every feature, every line of code is anchored to these foundational principles.
            </p>
          </div>
          <div className="pillars-grid">
            {[
              { title: 'Institutional-Grade Security', desc: 'Every component is designed with enterprise-level protection at its core.' },
              { title: 'Multi-Tenant Architecture', desc: 'Each accounting firm receives its own fully isolated, secure environment.' },
              { title: 'Multi-Entity Support', desc: 'Manage multiple businesses under one unified umbrella without switching.' },
              { title: 'Multi-Currency Engine', desc: 'Global operations demand global currency support — fully built in.' },
              { title: 'API-Driven Integrations', desc: 'Seamless connections to banks, payment processors, and financial data providers.' },
              { title: 'Automation-Powered Workflows', desc: 'Replace every manual, repetitive task with intelligent, rule-based automation.' },
              { title: 'Real-Time Financial Visibility', desc: 'Balances, transactions, and insights that update the moment they change.' },
              { title: 'Compliance-Aware Infrastructure', desc: 'KYC, KYB, AML, and immutable audit trails are embedded at the platform level.' },
              { title: 'Client Collaboration Tools', desc: 'Portals, messaging, approvals, and document sharing — unified in one flow.' },
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

      {/*  FEATURE BLUEPRINT  */}
      <section className="blueprint-section">
        <div className="blueprint-container">
          <div className="section-header">
            <p className="section-eyebrow">Full Feature Blueprint</p>
            <h2 className="section-title">Everything Under One Roof</h2>
            <p className="section-subtitle">Seven interconnected modules that replace dozens of fragmented tools.
            </p>
          </div>
          <div className="blueprint-grid">
            <div className="blueprint-card bp-accent-1">
              <div className="bp-icon"></div>
              <h3>Core Accounting Engine</h3>
              <ul>
                <li>Multi-entity General Ledger</li>
                <li>Chart of Accounts Templates</li>
                <li>AI-Powered Automated Bookkeeping</li>
                <li>Real-Time Bank Reconciliation</li>
                <li>Balance Sheet · P&amp;L · Cash Flow</li>
                <li>Immutable Audit Trail</li>
              </ul>
            </div>
            <div className="blueprint-card bp-accent-2">
              <div className="bp-icon"></div>
              <h3>Banking + Accounting Integration</h3>
              <ul>
                <li>Real-Time Banking Dashboard</li>
                <li>Embedded Bill Pay &amp; Payroll</li>
                <li>Loan Management &amp; Repayment Tracking</li>
                <li>AML + KYC/KYB Compliance Monitoring</li>
                <li>Secure API Bank Connections</li>
                <li>Risk Scoring Engine</li>
              </ul>
            </div>
            <div className="blueprint-card bp-accent-3">
              <div className="bp-icon"></div>
              <h3>Client Management System</h3>
              <ul>
                <li>Full CRM with Financial History</li>
                <li>Secure Client Portal &amp; Messaging</li>
                <li>Task Management &amp; Deadlines</li>
                <li>Document Upload &amp; Version Control</li>
                <li>Digital Approvals Workflow</li>
                <li>Multi-Client Oversight Dashboard</li>
              </ul>
            </div>
            <div className="blueprint-card bp-accent-4">
              <div className="bp-icon"></div>
              <h3>Automation Engine</h3>
              <ul>
                <li>Month-End &amp; Year-End Close Automation</li>
                <li>Payroll Cycle &amp; Tax Reminder Workflows</li>
                <li>AI Cash Flow Predictions</li>
                <li>Expense Analysis &amp; Risk Alerts</li>
                <li>Auto-Generated Financial Reports</li>
                <li>KPI Dashboards on Demand</li>
              </ul>
            </div>
            <div className="blueprint-card bp-accent-5">
              <div className="bp-icon"></div>
              <h3>Compliance &amp; Security</h3>
              <ul>
                <li>KYC / KYB Identity Verification</li>
                <li>AML Transaction Monitoring</li>
                <li>Suspicious Activity Alerting</li>
                <li>Regulatory Report Generation</li>
                <li>Role-Based Access Control (RBAC)</li>
                <li>Admin · Accountant · Client · Auditor Roles</li>
              </ul>
            </div>
            <div className="blueprint-card bp-accent-6">
              <div className="bp-icon"></div>
              <h3>Firm Operations Suite</h3>
              <ul>
                <li>Billing &amp; Subscription Management</li>
                <li>Firm-Wide Staff &amp; Workload Dashboard</li>
                <li>White-Label: Custom Domain &amp; Brand</li>
                <li>Marketplace: Add-Ons &amp; Partner Services</li>
                <li>Multi-Branch &amp; Multi-Region Support</li>
                <li>Enterprise Analytics Suite</li>
              </ul>
            </div>
            <div className="blueprint-card bp-accent-7">
              <div className="bp-icon"></div>
              <h3>Platform Infrastructure</h3>
              <ul>
                <li>Multi-Tenant Isolated Environments</li>
                <li>Bank &amp; Payroll API Integrations</li>
                <li>Tax Authority Connections</li>
                <li>Mobile App: Approvals &amp; Alerts</li>
                <li> 99.9% SLA Uptime Guarantee</li>
                <li>Enterprise SSO &amp; Audit Compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/*  VISION STATEMENT  */}
      <section className="vision-section">
        <div className="vision-container">
          <div className="section-header">
            <p className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Platform Vision</p>
            <h2 className="section-title" style={{ color: 'var(--color-white)' }}>
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

                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="vision-closing">ATC Capital replaces dozens of disconnected tools with a single, unified Financial Operating System.
          </div>
        </div>
      </section>

      {/*  BRAND PILLARS  */}
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

      {/*  FUTURE ROADMAP  */}
      <section className="roadmap-section">
        <div className="roadmap-container">
          <div className="section-header">
            <p className="section-eyebrow">Long-Term Vision</p>
            <h2 className="section-title">The Future of ATC Capital</h2>
            <p className="section-subtitle">ATC Capital is not just a platform — it is a movement. A transformation. A new standard.
            </p>
          </div>
          <div className="roadmap-grid">
            {[
              { item: 'Global Banking Integrations' },
              { item: 'AI-Driven Financial Forecasting' },
              { item: 'Automated Compliance Engines' },
              { item: 'Full Tax Automation' },
              { item: 'Enterprise-Grade Analytics' },
              { item: 'Cross-Border Financial Intelligence' },
              { item: 'Global Marketplace of Financial Tools' },
            ].map((r) => (
              <div className="roadmap-item" key={r.item}>
                <div className="roadmap-icon">{r.icon}</div>
                <span>{r.item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  CTA  */}
      <section className="cta-section">
        <div className="cta-content">
          <p className="cta-eyebrow">The Future of Financial Operations</p>
          <h2>Built for Firms That Refuse to Fall Behind.</h2>
          <p>ATC Capital is built for firms that demand excellence, businesses that want clarity,
            and institutions that require precision. Your entire financial world — unified.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-primary btn-large">Get Started Today
            </Link>
            <Link to="/features" className="btn-outline-white btn-large">Explore the Platform
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
