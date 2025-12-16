/**
 * Insights Generator
 * 
 * Analyzes calculation results and generates human-readable, actionable insights.
 * Detects patterns, anomalies, opportunities, and risks.
 * 
 * ALWAYS references the model/calculation that produced each insight
 * ALWAYS validates insights against reasonable thresholds
 * ALWAYS explains the reasoning behind each insight
 * 
 * Phase 3 Extension: Human-readable findings from AI interpretation
 * Phase 5 Dependencies: Reports include these insights
 * 
 * Strict Rule: Every insight must be traceable to its source calculation
 */

import * as CalcEngine from '../calculation/calculationEngine';
import * as ValidationService from '../calculation/validationService';
import * as TaxLibrary from '../calculation/countryTaxLibrary';

/**
 * Insight Object
 * 
 * @typedef {Object} Insight
 * @property {string} category - Category of insight
 * @property {string} severity - 'INFO', 'WARNING', 'CRITICAL'
 * @property {string} title - Short insight title
 * @property {string} description - Detailed description
 * @property {string} calculation - Which calculation generated this
 * @property {Object} data - Supporting data/metrics
 * @property {string} recommendation - Suggested action (optional)
 * @property {number} confidence - 0-100 confidence level
 */

/**
 * Generate insights from forecast results
 * Analyzes growth trends, acceleration, deceleration
 * 
 * @param {Object} forecastResults - Forecast model results
 * @param {Object} assumptions - Assumptions used in forecast
 * @returns {Object[]} Array of insights
 */
export function generateForecastInsights(forecastResults, assumptions) {
  if (!forecastResults || !forecastResults.years) {
    console.error('generateForecastInsights: Valid forecast results required');
    return [];
  }

  const insights = [];
  const years = forecastResults.years;

  // INSIGHT 1: Growth acceleration/deceleration
  if (years.length >= 3) {
    const firstHalfAvg = years.slice(0, Math.floor(years.length / 2))
      .reduce((a, b) => a + b, 0) / Math.floor(years.length / 2);
    const secondHalfAvg = years.slice(Math.floor(years.length / 2))
      .reduce((a, b) => a + b, 0) / (years.length - Math.floor(years.length / 2));

    const acceleration = CalcEngine.subtract(secondHalfAvg, firstHalfAvg);
    const accelerationPct = CalcEngine.divide(CalcEngine.multiply(acceleration, 100), firstHalfAvg);

    if (Math.abs(accelerationPct) > 10) {
      insights.push({
        category: 'GROWTH_DYNAMICS',
        severity: accelerationPct > 0 ? 'INFO' : 'WARNING',
        title: accelerationPct > 0 ? 'Growth Acceleration' : 'Growth Deceleration',
        description: accelerationPct > 0
          ? `Growth is accelerating in later periods. Second half averaging ${CalcEngine.round(secondHalfAvg, 0)}`
          : `Growth is slowing in later periods. Decline of ${CalcEngine.round(Math.abs(accelerationPct), 0)}%`,
        calculation: 'Forecast model period-over-period analysis',
        data: {
          firstHalfAverage: CalcEngine.round(firstHalfAvg, 0),
          secondHalfAverage: CalcEngine.round(secondHalfAvg, 0),
          accelerationPercent: CalcEngine.round(accelerationPct, 1)
        },
        confidence: 75
      });
    }
  }

  // INSIGHT 2: Exponential growth anomaly
  const yoyGrowths = [];
  for (let i = 1; i < years.length; i++) {
    const yoy = CalcEngine.divide(
      CalcEngine.multiply(CalcEngine.subtract(years[i], years[i - 1]), 100),
      years[i - 1]
    );
    yoyGrowths.push(yoy);
  }

  if (yoyGrowths.some(g => g > 50)) {
    insights.push({
      category: 'GROWTH_ANOMALY',
      severity: 'WARNING',
      title: 'Unusual Growth Rate',
      description: `Some periods show extremely high growth (>50%). Verify assumptions for reasonableness.`,
      calculation: 'Year-over-year growth rate analysis',
      data: { peakGrowth: CalcEngine.round(Math.max(...yoyGrowths), 1) },
      recommendation: 'Review growth assumptions - they may be overly optimistic',
      confidence: 80
    });
  }

  // INSIGHT 3: Volatility analysis
  if (yoyGrowths.length > 0) {
    const avgGrowth = yoyGrowths.reduce((a, b) => a + b, 0) / yoyGrowths.length;
    const variance = yoyGrowths.reduce((sum, g) => sum + Math.pow(CalcEngine.subtract(g, avgGrowth), 2), 0) / yoyGrowths.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev > avgGrowth * 0.5) {
      insights.push({
        category: 'FORECAST_VOLATILITY',
        severity: 'INFO',
        title: 'High Growth Volatility',
        description: `Forecast shows high volatility (std dev: ${CalcEngine.round(stdDev, 1)}%). Outcomes uncertain.`,
        calculation: 'Statistical volatility analysis on projected growth',
        data: {
          averageGrowth: CalcEngine.round(avgGrowth, 1),
          standardDeviation: CalcEngine.round(stdDev, 1),
          coefficient: CalcEngine.round(CalcEngine.divide(stdDev, avgGrowth), 2)
        },
        recommendation: 'Consider scenario analysis to understand range of outcomes',
        confidence: 70
      });
    }
  }

  return insights;
}

/**
 * Generate insights from valuation results
 * Analyzes valuation multiples, value drivers, sensitivity
 * 
 * @param {Object} valuationResults - Valuation model results
 * @param {Object} inputs - Valuation inputs
 * @returns {Object[]} Array of insights
 */
export function generateValuationInsights(valuationResults, inputs) {
  if (!valuationResults) {
    console.error('generateValuationInsights: Valid valuation results required');
    return [];
  }

  const insights = [];

  // INSIGHT 1: Valuation multiple analysis
  if (inputs && inputs.revenue && valuationResults.enterpriseValue) {
    const evRevenue = CalcEngine.divide(valuationResults.enterpriseValue, inputs.revenue);

    let severity = 'INFO';
    let assessment = '';
    
    if (evRevenue > 10) {
      severity = 'WARNING';
      assessment = 'Premium valuation - company trading at significant multiple';
    } else if (evRevenue > 5) {
      assessment = 'Above-average valuation';
    } else if (evRevenue > 2) {
      assessment = 'Fair valuation at reasonable multiple';
    } else {
      severity = 'INFO';
      assessment = 'Discounted valuation - below-market multiple';
    }

    insights.push({
      category: 'VALUATION_MULTIPLE',
      severity,
      title: 'EV/Revenue Multiple',
      description: `Company valued at ${CalcEngine.round(evRevenue, 1)}x revenue. ${assessment}`,
      calculation: 'Valuation model EV/Revenue ratio',
      data: {
        enterpriseValue: CalcEngine.round(valuationResults.enterpriseValue, 0),
        revenue: CalcEngine.round(inputs.revenue, 0),
        multiple: CalcEngine.round(evRevenue, 2)
      },
      confidence: 75
    });
  }

  // INSIGHT 2: Terminal value dependency
  if (valuationResults.terminalValuePercent !== undefined) {
    const tvPercent = valuationResults.terminalValuePercent;

    if (tvPercent > 75) {
      insights.push({
        category: 'VALUATION_RISK',
        severity: 'CRITICAL',
        title: 'High Terminal Value Dependency',
        description: `${tvPercent}% of value comes from terminal period. Valuation highly sensitive to long-term assumptions.`,
        calculation: 'Valuation breakdown analysis',
        data: { terminalValuePercent: tvPercent },
        recommendation: 'Reduce reliance on terminal value or increase explicit forecast period',
        confidence: 85
      });
    } else if (tvPercent > 60) {
      insights.push({
        category: 'VALUATION_RISK',
        severity: 'WARNING',
        title: 'Significant Terminal Value Component',
        description: `${tvPercent}% of value from terminal period. Long-term assumptions are critical.`,
        calculation: 'Valuation breakdown analysis',
        data: { terminalValuePercent: tvPercent },
        confidence: 80
      });
    }
  }

  // INSIGHT 3: Discount rate impact
  if (valuationResults.sensitivityToDiscountRate) {
    const range = valuationResults.sensitivityToDiscountRate;
    const variation = CalcEngine.divide(
      CalcEngine.multiply(CalcEngine.subtract(range.high, range.low), 100),
      range.low
    );

    if (variation > 50) {
      insights.push({
        category: 'DISCOUNT_RATE_SENSITIVITY',
        severity: 'WARNING',
        title: 'High Discount Rate Sensitivity',
        description: `Valuation highly sensitive to discount rate. ±1% change = ${CalcEngine.round(variation / 2, 0)}% valuation swing`,
        calculation: 'Sensitivity analysis on discount rate',
        data: { variation: CalcEngine.round(variation / 2, 0) },
        recommendation: 'Carefully justify discount rate assumptions',
        confidence: 80
      });
    }
  }

  return insights;
}

/**
 * Generate insights from risk analysis
 * Identifies concentration risk, jurisdictional risks, mitigation opportunities
 * 
 * @param {Object} riskResults - Risk model results
 * @returns {Object[]} Array of insights
 */
export function generateRiskInsights(riskResults) {
  if (!riskResults) {
    console.error('generateRiskInsights: Valid risk results required');
    return [];
  }

  const insights = [];

  // INSIGHT 1: Tax exposure concentration
  if (riskResults.taxExposureByCountry) {
    const exposures = Object.entries(riskResults.taxExposureByCountry);
    const maxExposure = Math.max(...exposures.map(e => e[1]));
    const [maxCountry] = exposures.find(e => e[1] === maxExposure) || ['Unknown', maxExposure];

    if (maxExposure > 70) {
      insights.push({
        category: 'CONCENTRATION_RISK',
        severity: 'CRITICAL',
        title: 'Severe Tax Exposure Concentration',
        description: `${CalcEngine.round(maxExposure, 0)}% of tax exposure in single country (${maxCountry}). Extreme concentration risk.`,
        calculation: 'Risk model country concentration analysis',
        data: { topCountry: maxCountry, concentration: CalcEngine.round(maxExposure, 1) },
        recommendation: 'Urgently diversify tax exposure across additional jurisdictions',
        confidence: 90
      });
    } else if (maxExposure > 50) {
      insights.push({
        category: 'CONCENTRATION_RISK',
        severity: 'WARNING',
        title: 'High Tax Exposure Concentration',
        description: `${CalcEngine.round(maxExposure, 0)}% of tax exposure concentrated in ${maxCountry}. Consider diversification.`,
        calculation: 'Risk model country concentration analysis',
        data: { topCountry: maxCountry, concentration: CalcEngine.round(maxExposure, 1) },
        recommendation: 'Evaluate opportunities to diversify into lower-risk jurisdictions',
        confidence: 85
      });
    }
  }

  // INSIGHT 2: High-risk jurisdictions
  if (riskResults.jurisdictionRisks) {
    const highRisks = Object.entries(riskResults.jurisdictionRisks)
      .filter(([, risk]) => risk.riskLevel === 'HIGH');

    if (highRisks.length > 0) {
      insights.push({
        category: 'JURISDICTIONAL_RISK',
        severity: highRisks.length > 2 ? 'CRITICAL' : 'WARNING',
        title: `${highRisks.length} High-Risk Jurisdictions`,
        description: `Operating in ${highRisks.length} high-risk location(s). Enhanced compliance required.`,
        calculation: 'Risk model jurisdiction classification',
        data: { highRiskJurisdictions: highRisks.map(e => e[0]) },
        recommendation: 'Implement enhanced due diligence and compliance monitoring',
        confidence: 85
      });
    }
  }

  // INSIGHT 3: Overall risk score
  if (riskResults.riskScore !== undefined) {
    const score = riskResults.riskScore;

    let severity = 'INFO';
    let assessment = '';

    if (score > 70) {
      severity = 'CRITICAL';
      assessment = 'Extremely high risk profile. Immediate mitigation required.';
    } else if (score > 50) {
      severity = 'WARNING';
      assessment = 'Elevated risk profile. Mitigation strategies recommended.';
    } else if (score > 30) {
      assessment = 'Moderate risk profile. Some diversification opportunities exist.';
    } else {
      assessment = 'Low risk profile. Current risk management is effective.';
    }

    insights.push({
      category: 'OVERALL_RISK_PROFILE',
      severity,
      title: 'Overall Risk Assessment',
      description: `Risk Score: ${CalcEngine.round(score, 0)}/100. ${assessment}`,
      calculation: 'Comprehensive risk model analysis',
      data: { riskScore: CalcEngine.round(score, 0) },
      confidence: 80
    });
  }

  return insights;
}

/**
 * Generate insights from personal finance analysis
 * Identifies financial health status, improvement areas, opportunities
 * 
 * @param {Object} financeResults - Personal finance results
 * @returns {Object[]} Array of insights
 */
export function generatePersonalFinanceInsights(financeResults) {
  if (!financeResults) {
    console.error('generatePersonalFinanceInsights: Valid finance results required');
    return [];
  }

  const insights = [];

  // INSIGHT 1: Savings rate
  if (financeResults.savingsRate !== undefined) {
    const rate = financeResults.savingsRate;

    let assessment = '';
    let severity = 'INFO';

    if (rate > 30) {
      assessment = 'Exceptional savings rate. Excellent financial discipline.';
    } else if (rate > 20) {
      assessment = 'Excellent savings rate. On track for strong wealth building.';
    } else if (rate > 10) {
      assessment = 'Good savings rate. Building wealth steadily.';
    } else if (rate > 0) {
      severity = 'WARNING';
      assessment = 'Low savings rate. Limited wealth accumulation potential.';
    } else {
      severity = 'CRITICAL';
      assessment = 'Negative savings rate. Living beyond means.';
    }

    insights.push({
      category: 'SAVINGS_HEALTH',
      severity,
      title: 'Savings Rate Assessment',
      description: `Savings rate: ${CalcEngine.round(rate, 1)}%. ${assessment}`,
      calculation: 'Personal finance savings rate calculation',
      data: { savingsRate: CalcEngine.round(rate, 1) },
      confidence: 85
    });
  }

  // INSIGHT 2: Debt-to-income ratio
  if (financeResults.debtToIncome !== undefined) {
    const dti = financeResults.debtToIncome;

    let severity = 'INFO';
    let assessment = '';

    if (dti > 50) {
      severity = 'CRITICAL';
      assessment = 'Debt payments exceed 50% of income. Severe financial stress.';
    } else if (dti > 43) {
      severity = 'WARNING';
      assessment = 'DTI above 43%. Limited borrowing capacity.';
    } else if (dti > 28) {
      assessment = 'DTI in acceptable range. Good financial flexibility.';
    } else {
      assessment = 'Excellent DTI. Strong financial health.';
    }

    insights.push({
      category: 'DEBT_HEALTH',
      severity,
      title: 'Debt-to-Income Ratio',
      description: `DTI: ${CalcEngine.round(dti, 1)}%. ${assessment}`,
      calculation: 'Debt-to-income ratio analysis',
      data: { debtToIncome: CalcEngine.round(dti, 1) },
      confidence: 85
    });
  }

  // INSIGHT 3: Retirement readiness
  if (financeResults.retirementViable !== undefined) {
    insights.push({
      category: 'RETIREMENT_READINESS',
      severity: financeResults.retirementViable ? 'INFO' : 'CRITICAL',
      title: financeResults.retirementViable ? 'Retirement Plan Viable' : 'Retirement Plan At Risk',
      description: financeResults.retirementViable
        ? `Retirement savings sufficient for ${financeResults.viablYears} years.`
        : `Savings may cover only ${financeResults.viablYears} of ${financeResults.retirementYears} planned years.`,
      calculation: 'Retirement projection analysis',
      data: {
        viable: financeResults.retirementViable,
        viableYears: financeResults.viablYears,
        plannedYears: financeResults.retirementYears
      },
      recommendation: financeResults.retirementViable
        ? 'Continue current savings trajectory'
        : 'Increase contributions or extend working years',
      confidence: 75
    });
  }

  // INSIGHT 4: Net worth trajectory
  if (financeResults.netWorth !== undefined) {
    const netWorth = financeResults.netWorth;

    let severity = 'INFO';
    let assessment = '';

    if (netWorth > 1000000) {
      assessment = 'Strong net worth position. Excellent financial foundation.';
    } else if (netWorth > 0) {
      assessment = 'Positive net worth. Building financial strength.';
    } else {
      severity = 'WARNING';
      assessment = 'Negative net worth. Focus on debt reduction.';
    }

    insights.push({
      category: 'NET_WORTH',
      severity,
      title: 'Net Worth Assessment',
      description: `Net Worth: ${CalcEngine.round(netWorth, 0)}. ${assessment}`,
      calculation: 'Net worth calculation (assets - liabilities)',
      data: { netWorth: CalcEngine.round(netWorth, 0) },
      confidence: 90
    });
  }

  return insights;
}

/**
 * Prioritize insights by severity and impact
 * Sorts insights for user consumption
 * 
 * @param {Object[]} insights - All insights to prioritize
 * @returns {Object[]} Sorted insights by priority
 */
export function prioritizeInsights(insights) {
  if (!Array.isArray(insights)) {
    console.error('prioritizeInsights: Array of insights required');
    return [];
  }

  const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };

  return insights.sort((a, b) => {
    const severityDiff = (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
    if (severityDiff !== 0) return severityDiff;

    // Secondary sort by confidence (higher confidence first)
    return (b.confidence || 0) - (a.confidence || 0);
  });
}

/**
 * Format insights for user display
 * Creates human-readable insight summaries
 * 
 * @param {Object[]} insights - Insights to format
 * @returns {string} Formatted insights text
 */
export function formatInsightsForDisplay(insights) {
  if (!Array.isArray(insights) || insights.length === 0) {
    return 'No insights generated';
  }

  let output = '';

  const critical = insights.filter(i => i.severity === 'CRITICAL');
  const warnings = insights.filter(i => i.severity === 'WARNING');
  const info = insights.filter(i => i.severity === 'INFO');

  if (critical.length > 0) {
    output += '🔴 CRITICAL FINDINGS:\n';
    for (const insight of critical) {
      output += `• ${insight.title}: ${insight.description}\n`;
      if (insight.recommendation) {
        output += `  → Action: ${insight.recommendation}\n`;
      }
    }
    output += '\n';
  }

  if (warnings.length > 0) {
    output += '🟡 WARNINGS:\n';
    for (const insight of warnings) {
      output += `• ${insight.title}: ${insight.description}\n`;
    }
    output += '\n';
  }

  if (info.length > 0) {
    output += '🔵 KEY FINDINGS:\n';
    for (const insight of info) {
      output += `• ${insight.title}: ${insight.description}\n`;
    }
  }

  return output;
}

export default {
  generateForecastInsights,
  generateValuationInsights,
  generateRiskInsights,
  generatePersonalFinanceInsights,
  prioritizeInsights,
  formatInsightsForDisplay
};
