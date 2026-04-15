import React from 'react';
import { Link, Navigate } from 'react-router-dom';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';

const platformMetrics = [
  {
    value: '01',
    label: 'Unified control layer',
    detail: 'Equity, accounting, tax, and filings operate inside one governed system.',
  },
  {
    value: '24/7',
    label: 'Operational readiness',
    detail: 'Leaders and operators can review posture, deadlines, and approvals in real time.',
  },
  {
    value: '100%',
    label: 'Audit traceability',
    detail: 'Decision points, workflow evidence, and entity records remain reviewable by design.',
  },
];

const moduleClusters = [
  {
    title: 'Ownership Infrastructure',
    eyebrow: 'Equity',
    text: 'Cap tables, grants, vesting schedules, exercises, approvals, and governance reporting remain connected to the same operating context.',
  },
  {
    title: 'Financial Control System',
    eyebrow: 'Finance',
    text: 'Entity operations, ledger activity, accounting workflows, treasury posture, and reporting structures stay aligned across teams.',
  },
  {
    title: 'Jurisdictional Compliance',
    eyebrow: 'Tax',
    text: 'Registrations, deadlines, compliance calendars, and supporting records stay visible across the operating estate.',
  },
  {
    title: 'Submission and Review',
    eyebrow: 'Filings',
    text: 'Approvals, document control, evidence capture, and filing execution follow a structured path with accountability.',
  },
];

const operatingPrinciples = [
  'Separate entity records, approvals, and responsibilities without losing enterprise visibility.',
  'Give controllers, tax leads, and administrators one source of operational truth.',
  'Keep execution structured enough for audits, board reviews, and regulated reporting cycles.',
];

const executionLanes = [
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
              <h1>One operating surface for ownership records, accounting control, tax compliance, and filing execution.</h1>
              <p className="landing-lead">
                Ledgrionyx is built for firms that need disciplined structure across entities, teams, approvals,
                and reporting obligations. It replaces fragmented workflow handoffs with one coherent control layer.
              </p>

              <div className="landing-actions">
                <Link to="/register" className="landing-button landing-button--primary">Open Account</Link>
                <Link to="/features" className="landing-button landing-button--secondary">Review Modules</Link>
              </div>

              <div className="landing-hero__trustband" aria-label="Operational trust indicators">
                <span>Entity governance</span>
                <span>Approval discipline</span>
                <span>Filing readiness</span>
              </div>
            </div>

            <aside className="landing-board" aria-label="Platform operating board">
              <div className="landing-board__panel landing-board__panel--primary">
                <div className="landing-board__heading">
                  <span className="landing-board__eyebrow">Operating Board</span>
                  <strong>Executive control posture</strong>
                </div>

                <div className="landing-board__snapshot">
                  <div>
                    <span className="landing-board__label">Coverage</span>
                    <strong>Equity + Finance + Tax</strong>
                  </div>
                  <div>
                    <span className="landing-board__label">Execution Mode</span>
                    <strong>Structured and accountable</strong>
                  </div>
                </div>

                <div className="landing-board__timeline">
                  <div className="landing-board__timeline-item is-active">
                    <span className="landing-board__dot" />
                    <div>
                      <p>Governance records</p>
                      <small>Ownership, approvals, permissions</small>
                    </div>
                  </div>
                  <div className="landing-board__timeline-item">
                    <span className="landing-board__dot" />
                    <div>
                      <p>Operational books</p>
                      <small>Ledger activity, controls, reporting</small>
                    </div>
                  </div>
                  <div className="landing-board__timeline-item">
                    <span className="landing-board__dot" />
                    <div>
                      <p>Compliance execution</p>
                      <small>Tax obligations, filings, evidence</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="landing-board__panel landing-board__panel--metrics">
                {platformMetrics.map((metric) => (
                  <article key={metric.label} className="landing-metric-card">
                    <span className="landing-metric-card__value">{metric.value}</span>
                    <h2>{metric.label}</h2>
                    <p>{metric.detail}</p>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="landing-strip" aria-label="Strategic summary">
          <div className="landing-shell landing-strip__grid">
            <div>
              <p className="landing-kicker">Why It Matters</p>
              <h2 className="landing-section-title">Built for firms that need structure before they need scale.</h2>
            </div>
            <ul className="landing-principles">
              {operatingPrinciples.map((principle) => (
                <li key={principle}>{principle}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-shell">
            <div className="landing-section-heading">
              <div>
                <p className="landing-kicker">Core Modules</p>
                <h2 className="landing-section-title">A cleaner architecture for operational finance and governance.</h2>
              </div>
              <p className="landing-body">
                Each module is organized around institutional work rather than feature sprawl. Teams can operate
                within their function while leadership retains a consolidated operational view.
              </p>
            </div>

            <div className="landing-modules">
              {moduleClusters.map((module) => (
                <article key={module.title} className="landing-module-card">
                  <span className="landing-module-card__eyebrow">{module.eyebrow}</span>
                  <h3>{module.title}</h3>
                  <p>{module.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-section--tint">
          <div className="landing-shell">
            <div className="landing-section-heading">
              <div>
                <p className="landing-kicker">Execution Model</p>
                <h2 className="landing-section-title">A homepage should explain the system. The system should explain the work.</h2>
              </div>
            </div>

            <div className="landing-execution-grid">
              {executionLanes.map((lane) => (
                <article key={lane.step} className="landing-execution-card">
                  <span className="landing-execution-card__step">{lane.step}</span>
                  <h3>{lane.title}</h3>
                  <p>{lane.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-shell landing-governance">
            <div className="landing-governance__copy">
              <p className="landing-kicker">Operational Standard</p>
              <h2 className="landing-section-title">Clarity, control, and auditability are treated as product structure, not afterthoughts.</h2>
              <p className="landing-body">
                Ledgrionyx is not positioned like a social app or generic marketplace. It is a professional system
                for firms that need deliberate process around ownership, accounting, tax, and institutional execution.
              </p>
            </div>

            <div className="landing-governance__grid">
              <article className="landing-governance-card">
                <span className="landing-governance-card__label">For leadership</span>
                <p>See entity posture, review points, and operating exposure without waiting for fragmented updates.</p>
              </article>
              <article className="landing-governance-card">
                <span className="landing-governance-card__label">For operators</span>
                <p>Execute approvals, maintain records, and move filings forward inside a disciplined workflow.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-cta-section">
          <div className="landing-shell">
            <div className="landing-cta-card">
              <div>
                <p className="landing-kicker">Start With Structure</p>
                <h2 className="landing-section-title">Bring ownership, finance, and tax execution into one operating environment.</h2>
              </div>
              <div className="landing-actions landing-actions--cta">
                <Link to="/register" className="landing-button landing-button--primary">Open Account</Link>
                <Link to="/deployment" className="landing-button landing-button--secondary">Review Deployment</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
