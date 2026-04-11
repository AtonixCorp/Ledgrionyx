import React from 'react';
import { Link, Navigate } from 'react-router-dom';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';

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
          <div className="landing-shell landing-hero__grid">
            <div className="landing-hero__copy">
              <p className="landing-kicker">Equity, Finance, and Tax Infrastructure</p>
              <h1>Ledgrionyx is an institutional platform for ownership, finance, tax, and filing operations.</h1>
              <p className="landing-lead">
                It gives firms one controlled system for cap tables, financial records, compliance workflows,
                tax preparation, filing activity, and team approvals.
              </p>
              <div className="landing-actions">
                <Link to="/register" className="btn btn-primary btn-large">Open Account</Link>
                <Link to="/features" className="btn btn-outline btn-large">Review Modules</Link>
              </div>
            </div>

            <aside className="landing-summary card" aria-label="Platform summary">
              <div className="landing-summary__row">
                <span className="landing-label">Purpose</span>
                <span>Institutional operations for equity, finance, and tax teams.</span>
              </div>
              <div className="landing-summary__row">
                <span className="landing-label">Primary users</span>
                <span>Finance teams, controllers, tax staff, and administrators.</span>
              </div>
              <div className="landing-summary__row">
                <span className="landing-label">Core controls</span>
                <span>Ownership records, ledger activity, filing workflows, and approvals.</span>
              </div>
            </aside>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-shell">
            <p className="landing-kicker">Core Modules</p>
            <div className="landing-modules">
              {[
                { title: 'Equity', text: 'Cap table management, ownership records, vesting, grants, exercises, and approvals.' },
                { title: 'Finance', text: 'Ledgers, balances, transactions, reporting, and operating controls.' },
                { title: 'Tax', text: 'Tax preparation, filing support, compliance tracking, and jurisdiction handling.' },
                { title: 'Filings', text: 'Submission workflows, document control, and audit-ready records.' },
                { title: 'Team Management', text: 'Roles, permissions, review steps, and internal accountability.' },
              ].map((module) => (
                <article key={module.title} className="landing-module card">
                  <h2>{module.title}</h2>
                  <p>{module.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-section--bordered">
          <div className="landing-shell landing-grid-2">
            <div>
              <p className="landing-kicker">Operational Standard</p>
              <h2>Built for institutions that need clarity, control, and auditability.</h2>
            </div>
            <p className="landing-body">
              The platform is not a social product, a blog, or a marketplace. It is a professional system
              for managing financial structures, compliance obligations, and team execution in one place.
            </p>
          </div>
        </section>
      </main>

      <Footer />

    </div>
  );
};

export default Landing;
