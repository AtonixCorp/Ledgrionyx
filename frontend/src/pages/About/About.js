import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaGlobe, FaShieldAlt, FaRocket, FaHandshake, FaAward } from 'react-icons/fa';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <Header />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <h1>About Atonix Capital</h1>
            <p>Empowering financial freedom through innovative technology and expert guidance</p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                At Atonix Capital, we believe that everyone deserves access to sophisticated financial tools
                and expert guidance. Our mission is to democratize wealth management by combining cutting-edge
                technology with personalized financial advice, making professional-grade financial services
                accessible to individuals and businesses worldwide.
              </p>
              <p>
                We are committed to transparency, security, and innovation, ensuring that our clients can
                confidently navigate their financial journey with tools that adapt to their unique needs
                and goals.
              </p>
            </div>
            <div className="mission-stats">
              <div className="stat-item">
                <div className="stat-number">500K+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">$2.5B+</div>
                <div className="stat-label">Assets Managed</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">207</div>
                <div className="stat-label">Countries Served</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <FaShieldAlt />
              </div>
              <h3>Security First</h3>
              <p>
                Your financial data and assets are protected by bank-level security measures,
                including end-to-end encryption and multi-factor authentication.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaRocket />
              </div>
              <h3>Innovation</h3>
              <p>
                We continuously push the boundaries of financial technology, integrating AI,
                machine learning, and advanced analytics to provide superior insights.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaHandshake />
              </div>
              <h3>Trust & Transparency</h3>
              <p>
                We believe in complete transparency with no hidden fees, clear pricing,
                and honest communication about your financial health.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaGlobe />
              </div>
              <h3>Global Reach</h3>
              <p>
                Our platform supports international markets and currencies, enabling
                you to manage global investments from anywhere in the world.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaUsers />
              </div>
              <h3>Personalized Service</h3>
              <p>
                Every client receives tailored advice and tools based on their unique
                financial situation, goals, and risk tolerance.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaAward />
              </div>
              <h3>Excellence</h3>
              <p>
                We strive for excellence in everything we do, from our technology
                to our customer service, ensuring the best possible experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                Founded in 2020, Atonix Capital emerged from a simple observation: traditional financial
                services were inaccessible to most people. Our founders, a team of financial experts and
                technology innovators, recognized that the financial industry was ripe for disruption.
              </p>
              <p>
                What started as a small team with a big vision has grown into a global platform serving
                hundreds of thousands of users across 207 countries. We've built a comprehensive suite
                of financial tools that combines the expertise of seasoned financial advisors with the
                power of modern technology.
              </p>
              <p>
                Today, Atonix Capital continues to lead the way in democratizing access to sophisticated
                financial services, making professional-grade tools available to everyone, everywhere.
              </p>
            </div>
            <div className="story-image">
              <div className="image-placeholder">
                <FaGlobe size={64} />
                <span>Global Impact</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Leadership Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">
                <FaUsers />
              </div>
              <h3>Sarah Chen</h3>
              <p className="member-role">CEO & Co-Founder</p>
              <p className="member-bio">
                Former VP at Goldman Sachs with 15+ years in financial technology
                and investment management.
              </p>
            </div>
            <div className="team-member">
              <div className="member-avatar">
                <FaUsers />
              </div>
              <h3>Michael Rodriguez</h3>
              <p className="member-role">CTO & Co-Founder</p>
              <p className="member-bio">
                Technology leader with expertise in fintech, AI, and secure
                financial systems architecture.
              </p>
            </div>
            <div className="team-member">
              <div className="member-avatar">
                <FaUsers />
              </div>
              <h3>Dr. Emily Watson</h3>
              <p className="member-role">Chief Investment Officer</p>
              <p className="member-bio">
                PhD in Finance with 20+ years experience in portfolio management
                and quantitative analysis.
              </p>
            </div>
            <div className="team-member">
              <div className="member-avatar">
                <FaUsers />
              </div>
              <h3>David Kim</h3>
              <p className="member-role">Head of Global Operations</p>
              <p className="member-bio">
                International business expert specializing in regulatory compliance
                and global market expansion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Join the Atonix Capital Community</h2>
          <p>Start your journey towards financial freedom today</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-primary btn-large">Get Started Free</Link>
            <Link to="/contact" className="btn-outline btn-large">Contact Us</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;