import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <span>Atonix Capital</span>
            </div>
            <p className="footer-tagline">Atonix Capital envisions a world where financial power is no longer constrained by geography,
              institutions, or legacy systems. We are building a platform that empowers individuals and
              enterprises with sovereign financial intelligence.
            </p>
            <div className="footer-social">
              <a href="https://twitter.com/atonixcapital" target="_blank" rel="noopener noreferrer" className="social-icon">

              </a>
              <a href="https://facebook.com/atonixcapital" target="_blank" rel="noopener noreferrer" className="social-icon">

              </a>
              <a href="https://linkedin.com/company/atonixcapital" target="_blank" rel="noopener noreferrer" className="social-icon">

              </a>
              <a href="https://github.com/atonixcapital" target="_blank" rel="noopener noreferrer" className="social-icon">

              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Product</h4>
            <div className="footer-links">
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/product">Platform</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4>Resources</h4>
            <div className="footer-links">
              <Link to="/help-center">Help Center</Link>
              <a href="/v1/docs" target="_blank" rel="noreferrer">API Docs</a>
              <Link to="/support">Support</Link>
              <Link to="/about">About Us</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <div className="footer-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/global-tax">Global Tax</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Atonix Capital. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy</Link>
            <span className="separator">•</span>
            <Link to="/contact">Terms</Link>
            <span className="separator">•</span>
            <Link to="/global-tax">Tax Information</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
