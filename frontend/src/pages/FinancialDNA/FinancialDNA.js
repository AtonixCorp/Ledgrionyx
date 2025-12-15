import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { financialDNAService } from '../../services/financialDNAService';
import { FaDna, FaBullseye, FaCreditCard, FaDice, FaUniversity, FaChartBar, FaBitcoin, FaFlask } from 'react-icons/fa';
import './FinancialDNA.css';

const FinancialDNA = () => {
  const { transactions, mockPortfolio } = useFinance();
  const [dnaProfile, setDnaProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const profile = financialDNAService.analyzeFinancialDNA(
        transactions,
        mockPortfolio,
        {}
      );
      setDnaProfile(profile);
      setLoading(false);
    }, 2000);
  }, [transactions, mockPortfolio]);

  if (loading) {
    return (
      <div className="financial-dna-page">
        <div className="loading-container">
          <div className="dna-loader">
            <div className="dna-helix"><FaDna /></div>
            <p>Analyzing your Financial DNA...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="financial-dna-page">
      <div className="page-header">
        <h1><FaDna /> Your Financial DNA Profile</h1>
        <p>A personalized analysis of your unique financial personality</p>
      </div>

      {/* Overall Profile Summary */}
      <div className="dna-hero-card">
        <div className="profile-badge">
          <div className="badge-icon"><FaBullseye /></div>
          <h2>{dnaProfile.overallProfile.type.replace(/-/g, ' ').toUpperCase()}</h2>
          <p>{dnaProfile.overallProfile.description}</p>
          <div className="overall-score">
            <span className="score-label">Overall Financial Health Score</span>
            <div className="score-circle">
              <span className="score-number">{dnaProfile.overallProfile.overallScore}</span>
              <span className="score-max">/100</span>
            </div>
          </div>
        </div>

        <div className="profile-highlights">
          <div className="highlight-section">
            <h3>💪 Your Strengths</h3>
            <ul>
              {dnaProfile.overallProfile.strengths.map((strength, index) => (
                <li key={index}>✓ {strength}</li>
              ))}
            </ul>
          </div>
          <div className="highlight-section">
            <h3>📈 Growth Areas</h3>
            <ul>
              {dnaProfile.overallProfile.growthAreas.map((area, index) => (
                <li key={index}>→ {area}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* DNA Traits Grid */}
      <div className="dna-traits-grid">
        {/* Spending Personality */}
        <div className="trait-card spending-card">
          <div className="trait-header">
            <span className="trait-icon"><FaCreditCard /></span>
            <h3>Spending Personality</h3>
          </div>
          <div className="trait-type">{dnaProfile.spendingPersonality.type.toUpperCase()}</div>
          <p className="trait-description">{dnaProfile.spendingPersonality.description}</p>
          
          <div className="trait-score">
            <div className="score-bar">
              <div 
                className="score-fill"
                style={{ width: `${dnaProfile.spendingPersonality.score}%` }}
              ></div>
            </div>
            <span>{dnaProfile.spendingPersonality.score}/100</span>
          </div>

          <div className="trait-details">
            <p><strong>Luxury Spending Ratio:</strong> {dnaProfile.spendingPersonality.luxuryRatio}%</p>
            <div className="top-categories">
              <strong>Top Spending Categories:</strong>
              {dnaProfile.spendingPersonality.topCategories.map((cat, index) => (
                <div key={index} className="category-item">
                  <span>{cat.category}</span>
                  <span>${cat.amount.toFixed(2)} ({cat.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Tolerance */}
        <div className="trait-card risk-card">
          <div className="trait-header">
            <span className="trait-icon"><FaDice /></span>
            <h3>Risk Tolerance</h3>
          </div>
          <div className="trait-type">{dnaProfile.riskTolerance.level.toUpperCase()}</div>
          <p className="trait-description">{dnaProfile.riskTolerance.description}</p>
          
          <div className="trait-score">
            <div className="score-bar">
              <div 
                className="score-fill risk"
                style={{ width: `${dnaProfile.riskTolerance.score}%` }}
              ></div>
            </div>
            <span>{dnaProfile.riskTolerance.score}/100</span>
          </div>

          <div className="trait-details">
            <p><strong>High-Risk Allocation:</strong> {dnaProfile.riskTolerance.highRiskPercentage}%</p>
            <div className="recommendation-box">
              <span>💡</span>
              <p>{dnaProfile.riskTolerance.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Savings Discipline */}
        <div className="trait-card savings-card">
          <div className="trait-header">
            <span className="trait-icon"><FaUniversity /></span>
            <h3>Savings Discipline</h3>
          </div>
          <div className="trait-type">{dnaProfile.savingsDiscipline.level.toUpperCase()}</div>
          <p className="trait-description">{dnaProfile.savingsDiscipline.description}</p>
          
          <div className="trait-score">
            <div className="score-bar">
              <div 
                className="score-fill savings"
                style={{ width: `${dnaProfile.savingsDiscipline.score}%` }}
              ></div>
            </div>
            <span>{dnaProfile.savingsDiscipline.score}/100</span>
          </div>

          <div className="trait-details">
            <p><strong>Savings Rate:</strong> {dnaProfile.savingsDiscipline.savingsRate}%</p>
            <p><strong>Monthly Savings:</strong> ${dnaProfile.savingsDiscipline.monthlySavings}</p>
            <div className="recommendation-box">
              <span>💡</span>
              <p>{dnaProfile.savingsDiscipline.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Investment Archetype */}
        <div className="trait-card archetype-card">
          <div className="trait-header">
            <span className="trait-icon"><FaChartBar /></span>
            <h3>Investment Archetype</h3>
          </div>
          <div className="trait-type">{dnaProfile.investmentArchetype.type.replace(/-/g, ' ').toUpperCase()}</div>
          <p className="trait-description">{dnaProfile.investmentArchetype.description}</p>
          
          <div className="archetype-traits">
            <strong>Your Investment Traits:</strong>
            <div className="traits-badges">
              {dnaProfile.investmentArchetype.traits.map((trait, index) => (
                <span key={index} className="trait-badge">{trait}</span>
              ))}
            </div>
          </div>

          <div className="trait-details">
            <strong>Asset Mix:</strong>
            <div className="asset-mix">
              {dnaProfile.investmentArchetype.assetMix.map((asset, index) => (
                <div key={index} className="asset-item">
                  <span>{asset.type}</span>
                  <div className="asset-bar">
                    <div 
                      className="asset-fill"
                      style={{ width: `${asset.percentage}%` }}
                    ></div>
                  </div>
                  <span>{asset.percentage}%</span>
                </div>
              ))}
            </div>
            <p><strong>Diversification:</strong> {dnaProfile.investmentArchetype.diversificationLevel.toUpperCase()}</p>
          </div>
        </div>

        {/* Crypto Comfort Level */}
        <div className="trait-card crypto-card">
          <div className="trait-header">
            <span className="trait-icon"><FaBitcoin /></span>
            <h3>Crypto Volatility Comfort</h3>
          </div>
          <div className="trait-type">{dnaProfile.cryptoComfort.level.toUpperCase()}</div>
          <p className="trait-description">{dnaProfile.cryptoComfort.description}</p>
          
          <div className="trait-score">
            <div className="score-bar">
              <div 
                className="score-fill crypto"
                style={{ width: `${dnaProfile.cryptoComfort.score}%` }}
              ></div>
            </div>
            <span>{dnaProfile.cryptoComfort.score}/100</span>
          </div>

          <div className="trait-details">
            <p><strong>Crypto Allocation:</strong> {dnaProfile.cryptoComfort.cryptoPercentage}%</p>
            {dnaProfile.cryptoComfort.topCryptoAssets.length > 0 && (
              <div className="crypto-assets">
                <strong>Top Crypto Holdings:</strong>
                {dnaProfile.cryptoComfort.topCryptoAssets.map((asset, index) => (
                  <div key={index} className="crypto-item">
                    <span>{asset.name}</span>
                    <span>${asset.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="recommendation-box">
              <span>💡</span>
              <p>{dnaProfile.cryptoComfort.recommendation}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dna-footer">
        <p><FaFlask /> Profile generated on {new Date(dnaProfile.generatedAt).toLocaleString()}</p>
        <p>Your Financial DNA updates dynamically as your behavior changes.</p>
      </div>
    </div>
  );
};

export default FinancialDNA;
