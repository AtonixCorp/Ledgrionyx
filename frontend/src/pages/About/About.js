import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaShieldAlt, FaGlobe, FaCheckCircle, FaBolt, FaEye,
  FaBalanceScale, FaUsersCog, FaServer, FaBuilding, FaNetworkWired,
  FaBrain, FaChartLine, FaFileAlt, FaStore, FaArrowRight, FaCogs,
  FaLayerGroup, FaExchangeAlt
} from 'react-icons/fa';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <Header />

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-hero-bg" />
        <div className="container">
          <div className="about-hero-inner">
            <p className="about-eyebrow">The Financial Operating System</p>
            <h1>ATC Capital</h1>
            <p className="about-hero-sub">
              Not an accounting tool. Not a bookkeeping app. Not a reporting dashboard.<br />
              A unified Financial Operating System built for accounting firms, businesses,
              and financial institutions.
            </p>
            <div className="about-hero-cta">
              <Link to="/register" className="btn-primary btn-large">
                Get Started <FaArrowRight style={{ marginLeft: '0.5rem', fontSize: '0.85em' }} />
              </Link>
              <Link to="/features" className="btn-outline-hero btn-large">
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="about-problem-section">
        <div className="container">
          <div className="about-section-header">
            <p className="about-eyebrow-dark">The Industry Problem</p>
            <h2>Why Financial Operations Are Broken</h2>
            <p className="about-section-sub">
              Across industries, accounting firms and businesses face the same challenges — and they cost
              firms their time, accuracy, clients, and growth.
            </p>
          </div>
          <div className="problem-grid">
            {[
              'Too many disconnected tools',
              'Manual processes that waste time',
              'Outdated systems that slow operations',
              'No real-time financial visibility',
              'Poor collaboration between accountants and clients',
              'Compliance burdens that grow every year',
              'Banking systems that don\'t integrate with accounting',
              'Reporting that is slow, inconsistent, or incomplete',
            ].map((p) => (
              <div className="problem-row" key={p}>
                <span className="problem-x">✕</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div className="problem-resolve-banner">
            ATC Capital exists to eliminate every one of these problems — permanently.
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="about-solution-section">
        <div className="container">
          <div className="solution-split">
            <div className="solution-text">
              <p className="about-eyebrow-purple">The Solution</p>
              <h2>One Platform. All Financial Operations. Fully Connected.</h2>
              <p>
                ATC Capital is a unified financial-operations environment — a single platform where
                accounting firms and businesses manage everything: financial data, accounting workflows,
                client relationships, documents, compliance, reporting, automation, and banking integrations.
              </p>
              <p className="solution-manifesto">
                Everything in one place.<br />
                Everything connected.<br />
                Everything real-time.
              </p>
              <p>This is the new standard for financial operations.</p>
            </div>
            <div className="solution-cards">
              {[
                { icon: <FaLayerGroup />, label: 'Financial Data' },
                { icon: <FaCogs />, label: 'Accounting Workflows' },
                { icon: <FaUsersCog />, label: 'Client Relationships' },
                { icon: <FaFileAlt />, label: 'Document Management' },
                { icon: <FaBalanceScale />, label: 'Compliance' },
                { icon: <FaChartLine />, label: 'Reporting' },
                { icon: <FaBolt />, label: 'Automation' },
                { icon: <FaExchangeAlt />, label: 'Banking Integration' },
              ].map((c) => (
                <div className="solution-chip" key={c.label}>
                  <span className="solution-chip-icon">{c.icon}</span>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE PILLARS ── */}
      <section className="about-pillars-section">
        <div className="container">
          <div className="about-section-header">
            <p className="about-eyebrow-dark">Core Architecture</p>
            <h2>Nine Foundational Pillars</h2>
            <p className="about-section-sub">
              Every decision, every feature, every line of code is anchored to these principles.
              They define ATC Capital's identity and guide everything we build.
            </p>
          </div>
          <div className="about-pillars-grid">
            {[
              { n: '01', icon: <FaShieldAlt />, title: 'Institutional-Grade Security', desc: 'Every component designed with enterprise-level protection at its core. No exceptions.' },
              { n: '02', icon: <FaServer />, title: 'Multi-Tenant Architecture', desc: 'Each accounting firm receives its own fully isolated, secure, and independent environment.' },
              { n: '03', icon: <FaBuilding />, title: 'Multi-Entity Support', desc: 'Manage multiple businesses under one umbrella without switching accounts or dashboards.' },
              { n: '04', icon: <FaGlobe />, title: 'Multi-Currency Engine', desc: 'Global operations require global currency support. Built in, not bolted on.' },
              { n: '05', icon: <FaNetworkWired />, title: 'API-Driven Integrations', desc: 'Seamless, secure connections to banks, payment processors, and financial data providers.' },
              { n: '06', icon: <FaBolt />, title: 'Automation-Powered Workflows', desc: 'Every manual, repetitive task replaced with intelligent, rule-based automation.' },
              { n: '07', icon: <FaEye />, title: 'Real-Time Financial Visibility', desc: 'Balances, transactions, and insights that update the moment they change.' },
              { n: '08', icon: <FaBalanceScale />, title: 'Compliance-Aware Infrastructure', desc: 'KYC, KYB, AML, and immutable audit trails embedded at the platform core.' },
              { n: '09', icon: <FaUsersCog />, title: 'Client Collaboration Tools', desc: 'Portals, messaging, approvals, and document sharing — unified in one seamless flow.' },
            ].map((p) => (
              <div className="about-pillar-card" key={p.n}>
                <div className="about-pillar-num">{p.n}</div>
                <div className="about-pillar-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USER EXPERIENCE ── */}
      <section className="about-ux-section">
        <div className="container">
          <div className="ux-split">
            <div className="ux-text">
              <p className="about-eyebrow-purple">The User Experience</p>
              <h2>What ATC Capital Feels Like</h2>
              <p>
                When a user logs into ATC Capital, they must feel empowered, in control, supported,
                efficient, confident, and secure. Every screen, every button, every workflow reflects this.
              </p>
              <div className="ux-qualities">
                {[
                  'A modern financial command center',
                  'A professional, clean, elegant interface',
                  'A system built for serious work',
                  'A platform that respects the user\'s time',
                ].map((q) => (
                  <div className="ux-quality" key={q}>
                    <FaCheckCircle className="ux-check" />
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="ux-feelings">
              <p className="ux-feelings-title">When you use ATC Capital, you feel:</p>
              {['Empowered', 'In Control', 'Supported', 'Efficient', 'Confident', 'Secure'].map((f) => (
                <div className="ux-feeling-chip" key={f}>{f}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BRAND IDENTITY ── */}
      <section className="about-brand-section">
        <div className="container">
          <div className="about-section-header">
            <p className="about-eyebrow-dark">Brand Identity</p>
            <h2>Built on Seven Commitments</h2>
          </div>
          <div className="brand-values-row">
            {['Precision', 'Security', 'Automation', 'Clarity', 'Professionalism', 'Scalability', 'Trust'].map((v) => (
              <div className="brand-value-tile" key={v}>{v}</div>
            ))}
          </div>
          <div className="brand-voice-grid">
            <div className="brand-voice-card">
              <h3>Brand Voice</h3>
              <ul>
                {['Confident', 'Clear', 'Professional', 'Modern', 'Authoritative', 'Vision-driven'].map((b) => (
                  <li key={b}><FaCheckCircle /> {b}</li>
                ))}
              </ul>
            </div>
            <div className="brand-promise-card">
              <h3>Brand Promise</h3>
              <blockquote>
                "ATC Capital gives accounting firms the power, speed, and intelligence they need to
                operate at the highest level."
              </blockquote>
            </div>
            <div className="brand-taglines-card">
              <h3>Brand Taglines</h3>
              <ul>
                {[
                  'The Financial Operating System for Modern Accounting Firms.',
                  'Where Accounting Meets Automation.',
                  'Real-Time Finance. Real-Time Control.',
                  'Built for Firms That Refuse to Fall Behind.',
                  'Your Entire Financial World. Unified.',
                ].map((t) => (
                  <li key={t}><span className="tagline-dash">—</span> {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUTURE VISION ── */}
      <section className="about-future-section">
        <div className="container">
          <div className="future-inner">
            <p className="about-eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>Long-Term Vision</p>
            <h2>The Future of ATC Capital</h2>
            <p className="future-sub">
              ATC Capital is not just a platform — it is a movement. A transformation.
              A new standard for how the world manages financial operations.
            </p>
            <div className="future-grid">
              {[
                { icon: <FaGlobe />, label: 'Global Banking Integrations' },
                { icon: <FaBrain />, label: 'AI-Driven Financial Forecasting' },
                { icon: <FaBalanceScale />, label: 'Automated Compliance Engines' },
                { icon: <FaFileAlt />, label: 'Full Tax Automation' },
                { icon: <FaChartLine />, label: 'Enterprise-Grade Analytics' },
                { icon: <FaNetworkWired />, label: 'Cross-Border Financial Intelligence' },
                { icon: <FaStore />, label: 'Global Marketplace of Financial Tools' },
              ].map((f) => (
                <div className="future-item" key={f.label}>
                  <div className="future-icon">{f.icon}</div>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
            <p className="future-closing">
              ATC Capital will become the platform that powers the world's financial operations.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta-section">
        <div className="container">
          <div className="about-cta-inner">
            <h2>
              This is ATC Capital.<br />
              <span>The future of financial operations begins here.</span>
            </h2>
            <p>
              Built for the future. Built for firms that demand excellence. Built for businesses
              that want clarity. Built for financial institutions that require precision.
            </p>
            <div className="about-cta-buttons">
              <Link to="/register" className="btn-primary btn-large">
                Get Started Today <FaArrowRight style={{ marginLeft: '0.5rem', fontSize: '0.85em' }} />
              </Link>
              <Link to="/contact" className="btn-outline btn-large">
                Talk to Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
