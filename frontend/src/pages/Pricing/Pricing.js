import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Personal',
      description: 'Perfect for individuals managing personal finances',
      price: {
        monthly: 9.99,
        annual: 99
      },
      features: [
        'Up to 5 accounts',
        'Basic budgeting tools',
        'Expense tracking',
        'Mobile app access',
        'Email support',
        'Basic reports',
        'Single currency support'
      ],
      popular: false,
      buttonText: 'Start Free Trial'
    },
    {
      name: 'Professional',
      description: 'Ideal for freelancers and small business owners',
      price: {
        monthly: 29.99,
        annual: 299
      },
      features: [
        'Up to 25 accounts',
        'Advanced budgeting',
        'Multi-currency support',
        'Tax optimization',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Custom categories'
      ],
      popular: true,
      buttonText: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      description: 'Complete solution for large businesses and corporations',
      price: {
        monthly: 99.99,
        annual: 999
      },
      features: [
        'Unlimited accounts',
        'Multi-entity management',
        'Global tax compliance',
        'Advanced financial modeling',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options',
        '24/7 phone support'
      ],
      popular: false,
      buttonText: 'Contact Sales'
    }
  ];

  const faqs = [
    {
      question: 'Can I change my plan at any time?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 14-day free trial for all plans. No credit card required to start your trial.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.'
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.'
    },
    {
      question: 'Do you offer discounts for non-profits?',
      answer: 'Yes, we offer special pricing for qualified non-profit organizations. Contact our sales team for details.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-grade encryption and security measures to protect your financial data.'
    }
  ];

  return (
    <div className="pricing-page">
      <Header />

      <section className="pricing-hero">
        <div className="hero-content">
          <h1>Simple, Transparent Pricing</h1>
          <p>Choose the perfect plan for your financial management needs.
            All plans include our core features with no hidden fees.
          </p>

          <div className="billing-toggle">
            <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={billingCycle === 'annual'}
                onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              />
              <span className="slider"></span>
            </label>
            <span className={billingCycle === 'annual' ? 'active' : ''}>Annual
              <span className="save-badge">Save 20%</span>
            </span>
          </div>
        </div>
      </section>

      <section className="pricing-plans">
        <div className="container">
          <div className="plans-grid">
            {plans.map((plan, index) => (
              <div key={index} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Most Popular</div>}

                <div className="plan-header">
                  <div className="plan-icon">
                    {plan.icon}
                  </div>
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                </div>

                <div className="plan-price">
                  <span className="currency">$</span>
                  <span className="amount">
                    {billingCycle === 'monthly' ? plan.price.monthly : Math.round(plan.price.annual / 12)}
                  </span>
                  <span className="period">/month</span>
                  {billingCycle === 'annual' && (
                    <div className="annual-price">Billed ${plan.price.annual} annually
                    </div>
                  )}
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>

                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.buttonText === 'Contact Sales' ? '/contact' : '/register'}
                  className={`plan-button ${plan.popular ? 'primary' : 'outline'}`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-features">
        <div className="container">
          <h2>All Plans Include</h2>
          <div className="features-grid">
            <div className="feature-item">

              <div>
                <h4>Bank-Grade Security</h4>
                <p>256-bit encryption and advanced security protocols</p>
              </div>
            </div>
            <div className="feature-item">

              <div>
                <h4>24/7 Support</h4>
                <p>Round-the-clock customer support for all users</p>
              </div>
            </div>
            <div className="feature-item">

              <div>
                <h4>Mobile Apps</h4>
                <p>Native iOS and Android apps for on-the-go access</p>
              </div>
            </div>
            <div className="feature-item">

              <div>
                <h4>Free Updates</h4>
                <p>Continuous updates and new features at no extra cost</p>
              </div>
            </div>
            <div className="feature-item">

              <div>
                <h4>Data Export</h4>
                <p>Export your data in multiple formats anytime</p>
              </div>
            </div>
            <div className="feature-item">

              <div>
                <h4>API Access</h4>
                <p>RESTful API for integrations (Professional+ plans)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-faq">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Start your 14-day free trial today. No credit card required.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-primary btn-large">Start Free Trial
            </Link>
            <Link to="/contact" className="btn-outline btn-large">Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;