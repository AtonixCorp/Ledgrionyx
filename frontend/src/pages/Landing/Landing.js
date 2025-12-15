import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-nav-content">
          <h1 className="landing-logo">💰 Atonix Capital</h1>
          <div className="landing-nav-links">
            <Link to="/login" className="btn-outline">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Manage Your Finances<br />
            <span className="hero-highlight">Smarter & Easier</span>
          </h1>
          <p className="hero-description">
            A next-generation financial platform built to redefine how individuals, businesses, 
            and institutions interact with money. Experience sovereign-grade security, AI-powered 
            intelligence, and borderless multi-asset management.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary btn-large">
              Start Free Trial
            </Link>
            <Link to="/login" className="btn-outline btn-large">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-card card-1">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h4>Dashboard</h4>
              <p>Real-time overview</p>
            </div>
          </div>
          <div className="hero-card card-2">
            <div className="card-icon">💸</div>
            <div className="card-content">
              <h4>Expenses</h4>
              <p>Track spending</p>
            </div>
          </div>
          <div className="hero-card card-3">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h4>Budgets</h4>
              <p>Set limits</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <h2 className="section-title">About Atonix Capital</h2>
          <div className="about-intro">
            <p className="about-lead">
              Atonix Capital is a next-generation financial platform built to redefine how individuals, 
              businesses, and nations interact with money. Designed at the intersection of sovereign 
              infrastructure, intelligent finance, and multi-asset innovation, Atonix Capital empowers 
              users with tools that transcend traditional banking.
            </p>
          </div>
          
          <div className="mission-statement">
            <h3>Our Mission</h3>
            <p>
              To provide individuals and institutions with complete control over their financial future — 
              securely, intelligently, and without borders.
            </p>
          </div>

          <div className="about-content">
            <p>
              Atonix Capital integrates modern fintech, AI-driven insights, and advanced security 
              architecture to create a financial ecosystem that is fast, transparent, and globally 
              accessible. Whether managing personal wealth, operating a business, or investing across 
              multiple asset classes, users experience a platform engineered for clarity, precision, 
              and sustained growth.
            </p>
          </div>
        </div>
      </section>

      <section className="differentiators-section">
        <h2 className="section-title">What Makes Atonix Capital Different</h2>
        <p className="section-subtitle">
          Atonix Capital is not just a wallet or banking app — it is a sovereign financial engine.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>AI-Powered Intelligence</h3>
            <p>Advanced algorithms that predict, analyze, and guide your financial decisions in real-time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Multi-Asset Support</h3>
            <p>Seamlessly manage fiat, crypto, stablecoins, and tokenized assets in one unified platform</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Sovereign-Grade Security</h3>
            <p>Military-grade protection with geo-locks, time-locks, and multi-signature authorization</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3>Smart Investment Vaults</h3>
            <p>Diversified, automated wealth growth through intelligent portfolio management</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>Business-Ready Tools</h3>
            <p>Professional-grade invoicing, payroll automation, and corporate finance management</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Borderless Network</h3>
            <p>Global payment infrastructure built for speed, reliability, and zero-friction transactions</p>
          </div>
        </div>
        <div className="core-principles">
          <p>
            Every feature is designed to deliver freedom, transparency, and control — 
            the fundamental pillars of true financial sovereignty.
          </p>
        </div>
      </section>

      <section className="vision-section">
        <div className="vision-container">
          <h2 className="section-title">Our Vision</h2>
          <p className="vision-intro">
            Atonix Capital envisions a world where financial power is no longer constrained by 
            geography, institutions, or legacy systems. We are building a platform that empowers:
          </p>
          <div className="vision-grid">
            <div className="vision-card">
              <div className="vision-icon">👤</div>
              <h3>Individuals</h3>
              <p>Seeking financial stability, growth, and independence</p>
            </div>
            <div className="vision-card">
              <div className="vision-icon">🏢</div>
              <h3>Businesses</h3>
              <p>Requiring secure, scalable financial operations and infrastructure</p>
            </div>
            <div className="vision-card">
              <div className="vision-icon">🌍</div>
              <h3>Nations & Communities</h3>
              <p>Striving for digital independence and economic sovereignty</p>
            </div>
            <div className="vision-card">
              <div className="vision-icon">🚀</div>
              <h3>Innovators</h3>
              <p>Exploring the convergence of finance, AI, and emerging technologies</p>
            </div>
          </div>
          <div className="vision-statement">
            <p>
              We believe the future of finance belongs to those who can adapt, innovate, and build 
              with purpose — and Atonix Capital stands at the forefront of that transformation.
            </p>
          </div>
        </div>
      </section>

      <section className="promise-section">
        <div className="promise-container">
          <h2 className="section-title">Our Promise</h2>
          <p className="promise-intro">
            To every user, partner, and stakeholder, Atonix Capital delivers:
          </p>
          <div className="promise-grid">
            <div className="promise-card">
              <div className="promise-icon">🛡️</div>
              <h3>Security Without Compromise</h3>
              <p>Your assets and data protected by institutional-grade security protocols</p>
            </div>
            <div className="promise-card">
              <div className="promise-icon">⚙️</div>
              <h3>Innovation Without Complexity</h3>
              <p>Cutting-edge technology made intuitive and accessible for everyone</p>
            </div>
            <div className="promise-card">
              <div className="promise-icon">🌍</div>
              <h3>Growth Without Borders</h3>
              <p>Expand your wealth globally without geographical or regulatory limitations</p>
            </div>
            <div className="promise-card">
              <div className="promise-icon">🔍</div>
              <h3>Transparency Without Exception</h3>
              <p>Complete visibility into your finances, transactions, and platform operations</p>
            </div>
          </div>
          <div className="closing-statement">
            <h3>More Than a Platform</h3>
            <p>
              Atonix Capital is more than a financial platform — it is a movement toward a smarter, 
              stronger, and more sovereign financial world. Join us in reshaping the future of finance.
            </p>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Comprehensive Financial Management</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Visual Dashboard</h3>
            <p>Complete financial overview with interactive charts and real-time analytics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💸</div>
            <h3>Expense Tracking</h3>
            <p>Intelligent expense categorization and tracking across all accounts</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💵</div>
            <h3>Income Management</h3>
            <p>Monitor multiple income streams from diverse sources and asset classes</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Budget Planning</h3>
            <p>Dynamic budget allocation with smart alerts and optimization suggestions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📉</div>
            <h3>Advanced Analytics</h3>
            <p>Deep insights into spending patterns, trends, and financial health metrics</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Bank-Grade Security</h3>
            <p>End-to-end encryption with multi-layer security architecture</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Experience Financial Sovereignty?</h2>
          <p>Join the movement toward smarter, more secure, and borderless financial management</p>
          <Link to="/register" className="btn-primary btn-large">
            Start Your Journey
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h3>💰 Atonix Capital</h3>
            <p>Sovereign Financial Intelligence</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#about">About</a>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <a href="#help">Help Center</a>
              <a href="#contact">Contact</a>
              <a href="#privacy">Privacy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Atonix Capital. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
