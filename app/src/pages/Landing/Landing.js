import React from 'react';
import { Link, Navigate } from 'react-router-dom';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';

const systemSteps = [
  {
    step: '01',
    title: 'Model the structure',
    text: 'Map entities, ownership relationships, and operating jurisdictions into one coordinated control environment.',
  },
  {
    step: '02',
    title: 'Run governed workflows',
    text: 'Move accounting, approvals, filings, and team responsibilities through clear, reviewable stages.',
  },
  {
    step: '03',
    title: 'Stay inspection-ready',
    text: 'Surface decisions, deadlines, and supporting evidence in a form that withstands scrutiny.',
  },
];

const operatingPrinciples = [
  'Separate entity records, approvals, and responsibilities without losing enterprise visibility.',
  'Give controllers, tax leads, and administrators one source of operational truth.',
  'Keep execution structured enough for audits, board reviews, and regulated reporting cycles.',
  'Reduce handoffs by keeping ownership, accounting, and tax execution inside one governed system.',
];

const operationalPillars = [
  {
    title: 'Governance records',
    text: 'Maintain ownership records, approvals, permissions, and board-ready evidence in one controlled environment.',
  },
  {
    title: 'Operational books',
    text: 'Keep ledger activity, reconciliations, close processes, and reporting structures aligned across entities.',
  },
  {
    title: 'Compliance execution',
    text: 'Track obligations, filing calendars, supporting evidence, and review checkpoints without losing traceability.',
  },
];

const heroDomains = ['Equity', 'Finance', 'Tax', 'Governance', 'Compliance'];

const Landing = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="landing-page landing-page--loading">
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app/console" replace />;
  }

  return (
    <div className="landing-page">
      <Header />

      <main className="landing-main">
        <section className="landing-hero" aria-label="Ledgrionyx overview">
          <div className="landing-shell landing-hero__layout">
            <div className="landing-hero__copy">
              <p className="landing-kicker">Institutional Equity, Finance, and Tax Operations</p>
              <h1>One operating system for ownership, finance, tax, and governed execution.</h1>
              <p className="landing-lead">
                Ledgrionyx gives firms a calmer operating model for entity records, accounting control,
                compliance execution, and reviewable approvals across the whole organization.
              </p>

              <div className="landing-actions">
                <Link to="/register" className="landing-button landing-button--primary">Open Account</Link>
                <Link to="/features" className="landing-button landing-button--secondary">Review Modules</Link>
              </div>
            </div>

            <aside className="landing-hero__frame" aria-label="Platform operating frame">
              <div className="landing-hero__frame-bar" />
              <p className="landing-hero__frame-title">Operating Domains</p>
              <div className="landing-hero__domain-list">
                {heroDomains.map((domain) => (
                  <span key={domain}>{domain}</span>
                ))}
              </div>
              <div className="landing-hero__frame-copy">
                <p>Structured records</p>
                <p>Governed workflows</p>
                <p>Inspection-ready evidence</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="landing-section landing-section--system">
          <div className="landing-shell">
            <div className="landing-section-heading">
              <p className="landing-kicker">Three-Step System</p>
              <h2 className="landing-section-title">The homepage should explain the system in one calm sequence.</h2>
            </div>

            <div className="landing-system-grid">
              {systemSteps.map((lane) => (
                <article key={lane.step} className="landing-system-card">
                  <span className="landing-system-card__step">{lane.step}</span>
                  <h3>{lane.title}</h3>
                  <p>{lane.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-shell landing-philosophy">
            <div>
              <p className="landing-kicker">Operational Philosophy</p>
              <h2 className="landing-section-title">A cleaner architecture for operational finance and governance.</h2>
            </div>
            <ul className="landing-principles">
              {operatingPrinciples.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="landing-section landing-section--pillars">
          <div className="landing-shell">
            <div className="landing-section-heading">
              <p className="landing-kicker">Operational Pillars</p>
              <h2 className="landing-section-title">Three controlled layers for the work that matters.</h2>
            </div>

            <div className="landing-pillars-grid">
              {operationalPillars.map((pillar) => (
                <article key={pillar.title} className="landing-pillar-card">
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
