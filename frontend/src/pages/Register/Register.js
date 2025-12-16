import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { countries } from '../../utils/countries';
import AccountTypeSelector from '../../components/AccountTypeSelector';
import AtonixLogo from '../../components/Logo/AtonixLogo';
import './Register.css';

const Register = () => {
  const [step, setStep] = useState(1); // 1: email → 2: account type → 3: details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [country, setCountry] = useState('US');
  const [phone, setPhone] = useState('');
  const [accountType, setAccountType] = useState(null);
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const selectedCountry = countries.find(c => c.code === country);

  // Detect account type based on email domain
  const detectAccountType = (emailAddress) => {
    const personalDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'protonmail.com', 'icloud.com'];
    const domain = emailAddress.split('@')[1]?.toLowerCase();
    return personalDomains.includes(domain) ? 'personal' : 'enterprise';
  };

  // Step 1: Email validation
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    // Auto-detect account type and move to confirmation step
    const detectedType = detectAccountType(email);
    setAccountType(detectedType);
    setStep(2);
  };

  // Step 2: Account type confirmation
  const handleAccountTypeSelect = (type) => {
    setAccountType(type);
    setStep(3);
  };

  // Step 3: Details submission
  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !password || !confirmPassword || !country || !phone) {
      setError('Please fill in all fields');
      return;
    }

    if (accountType === 'enterprise' && !orgName) {
      setError('Please enter your organization name');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (phone.length < 6) {
      setError('Please enter a valid phone number');
      return;
    }

    const result = register(name, email, password, country, phone, accountType);
    if (result.success) {
      // Redirect based on account type
      if (accountType === 'enterprise') {
        navigate('/app/enterprise/org-overview');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  // Step 1: Email Entry
  if (step === 1) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/" className="auth-logo-link">
              <AtonixLogo size="small" />
              <span>Atonix Capital</span>
            </Link>
          </div>

          <div className="auth-card">
            <div className="step-indicator">
              <div className="step-dot active"></div>
              <div className="step-dot"></div>
              <div className="step-dot"></div>
            </div>

            <h1>Create Account</h1>
            <p className="auth-subtitle">Step 1 of 3 - Enter your email</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleEmailSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  autoFocus
                />
                <p className="email-hint">
                  💡 We'll detect if you're using a personal or business email
                </p>
              </div>

              <button type="submit" className="btn-primary btn-full">
                Continue →
              </button>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Account Type Selection (Full Page)
  if (step === 2) {
    return (
      <div className="auth-page account-type-page">
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <AtonixLogo size="small" />
            <span>Atonix Capital</span>
          </Link>
        </div>

        <div className="account-type-full-container">
          <div className="account-type-header">
            <h1>Choose Your Account Type</h1>
            <p className="account-type-email">Email: <strong>{email}</strong></p>
            <p className="account-type-detected">We detected your email as <strong>{accountType === 'enterprise' ? '🏢 Business/Enterprise' : '👤 Personal'}</strong></p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="account-type-selector-wrapper-full">
            <AccountTypeSelector onSelect={handleAccountTypeSelect} />
          </div>

          <div className="account-type-navigation">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => {
                setStep(1);
                setError('');
              }}
            >
              ← Back to email
            </button>
            
            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Details Entry
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <AtonixLogo size="small" />
            <span>Atonix Capital</span>
          </Link>
        </div>

        <div className="auth-card">
          <div className="step-indicator">
            <div className="step-dot completed"></div>
            <div className="step-dot completed"></div>
            <div className="step-dot active"></div>
          </div>

          <h1>Complete Your Profile</h1>
          <p className="auth-subtitle">
            Step 3 of 3 - {accountType === 'enterprise' ? '🏢 Business Account' : '👤 Personal Account'}
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleDetailsSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                autoFocus
              />
            </div>

            {accountType === 'enterprise' && (
              <div className="form-group">
                <label htmlFor="orgName">Organization Name</label>
                <input
                  type="text"
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="country-select"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.dialCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="phone-input-wrapper">
                <div className="phone-prefix">
                  <span className="country-flag">{selectedCountry?.flag}</span>
                  <span className="dial-code">{selectedCountry?.dialCode}</span>
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456789"
                  autoComplete="tel"
                  className="phone-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary btn-full">
              Create Account →
            </button>
          </form>

          <button 
            type="button" 
            className="btn-link"
            onClick={() => {
              setStep(2);
              setError('');
            }}
          >
            ← Back to account type
          </button>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>

          <div className="demo-notice">
            <p>💡 <strong>Demo Mode:</strong> Select any country and enter any phone number</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
