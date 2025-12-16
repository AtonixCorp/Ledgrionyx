/**
 * Recommendation Engine
 * 
 * Generates actionable financial recommendations based on analysis results.
 * Suggests optimizations for tax, growth, risk, cashflow, and wealth building.
 * 
 * ALWAYS references calculations that support the recommendation
 * ALWAYS provides specific, actionable steps
 * ALWAYS includes confidence level and expected impact
 * 
 * Phase 3 Extension: Actionable recommendations from insights
 * Phase 5 Dependencies: Reports include these recommendations
 * 
 * Strict Rule: Every recommendation must have calculation basis and realistic impact estimate
 */

import * as CalcEngine from '../calculation/calculationEngine';
import * as ValidationService from '../calculation/validationService';
import * as TaxLibrary from '../calculation/countryTaxLibrary';

/**
 * Recommendation Object
 * 
 * @typedef {Object} Recommendation
 * @property {string} id - Unique recommendation ID
 * @property {string} category - Category of recommendation
 * @property {string} priority - 'HIGH', 'MEDIUM', 'LOW'
 * @property {string} title - Short recommendation title
 * @property {string} description - Detailed description
 * @property {string[]} actionSteps - Specific steps to implement
 * @property {Object} expectedBenefit - Quantified benefit estimate
 * @property {string} calculation - Which analysis supports this
 * @property {number} implementationDifficulty - 1-10 (1=easy, 10=complex)
 * @property {number} timeToImplement - Months to implement
 * @property {number} confidence - 0-100 confidence level
 */

/**
 * Generate recommendations from forecast analysis
 * Suggests growth acceleration, market expansion, cost optimization
 * 
 * @param {Object} forecastResults - Forecast model results
 * @param {Object} assumptions - Assumptions used
 * @returns {Object[]} Array of recommendations
 */
export function generateForecastRecommendations(forecastResults, assumptions) {
  if (!forecastResults) {
    console.error('generateForecastRecommendations: Valid forecast results required');
    return [];
  }

  const recommendations = [];

  // REC 1: Growth acceleration opportunity
  if (forecastResults.years && forecastResults.years.length >= 3) {
    const years = forecastResults.years;
    const yoyGrowths = [];

    for (let i = 1; i < years.length; i++) {
      const yoy = CalcEngine.divide(
        CalcEngine.multiply(CalcEngine.subtract(years[i], years[i - 1]), 100),
        years[i - 1]
      );
      yoyGrowths.push(yoy);
    }

    const avgGrowth = yoyGrowths.reduce((a, b) => a + b, 0) / yoyGrowths.length;

    // If growth is decelerating
    if (yoyGrowths[yoyGrowths.length - 1] < yoyGrowths[0]) {
      const decline = CalcEngine.subtract(yoyGrowths[0], yoyGrowths[yoyGrowths.length - 1]);
      const impactOfRecovery = CalcEngine.multiply(years[years.length - 1], 0.1); // 10% impact if arrested

      recommendations.push({
        id: 'FORECAST-001',
        category: 'GROWTH_ACCELERATION',
        priority: 'HIGH',
        title: 'Arrest Growth Deceleration',
        description: `Growth is declining (${CalcEngine.round(decline, 1)}% slowdown over forecast period). ` +
          `Implement initiatives to maintain growth trajectory.`,
        actionSteps: [
          'Identify root causes of growth slowdown (market saturation, competition, operational)',
          'Develop market expansion strategy into new geographies or segments',
          'Invest in product innovation to create new revenue streams',
          'Review marketing and sales effectiveness for optimization',
          'Consider strategic partnerships or acquisitions for growth acceleration'
        ],
        expectedBenefit: {
          type: 'revenue_increase',
          value: CalcEngine.round(impactOfRecovery, 0),
          unit: 'currency',
          timeframe: 'years 3-5',
          description: `Reversing deceleration could add ${CalcEngine.round(impactOfRecovery, 0)} in final year revenue`
        },
        calculation: 'Forecast year-over-year growth rate analysis',
        implementationDifficulty: 7,
        timeToImplement: 12,
        confidence: 70
      });
    }
  }

  // REC 2: Conservative growth planning
  if (forecastResults.averageGrowth && forecastResults.averageGrowth > 50) {
    recommendations.push({
      id: 'FORECAST-002',
      category: 'RISK_MANAGEMENT',
      priority: 'MEDIUM',
      title: 'Stress-Test Aggressive Assumptions',
      description: `Forecast assumes very high growth (${forecastResults.averageGrowth}%). ` +
        `Verify achievability and plan contingencies for lower growth scenarios.`,
      actionSteps: [
        'Document detailed assumptions behind high growth rate',
        'Conduct market research to validate growth feasibility',
        'Develop contingency plans for 50%, 75%, and 100% of projected growth',
        'Identify critical success factors required to achieve projections',
        'Monitor leading indicators monthly against projections'
      ],
      expectedBenefit: {
        type: 'risk_reduction',
        value: 'Improved forecast reliability',
        description: 'Better prepared for actual outcomes, both upside and downside'
      },
      calculation: 'Forecast growth rate reasonableness check',
      implementationDifficulty: 5,
      timeToImplement: 2,
      confidence: 80
    });
  }

  return recommendations;
}

/**
 * Generate recommendations from valuation analysis
 * Suggests value creation, margin improvement, capital allocation
 * 
 * @param {Object} valuationResults - Valuation model results
 * @param {Object} inputs - Valuation inputs
 * @returns {Object[]} Array of recommendations
 */
export function generateValuationRecommendations(valuationResults, inputs) {
  if (!valuationResults) {
    console.error('generateValuationRecommendations: Valid valuation results required');
    return [];
  }

  const recommendations = [];

  // REC 1: Margin improvement opportunity
  if (inputs && inputs.ebitdaMargin !== undefined && inputs.ebitdaMargin < 20) {
    const currentMargin = inputs.ebitdaMargin;
    const targetMargin = 25; // Industry benchmark
    const marginGap = CalcEngine.subtract(targetMargin, currentMargin);
    const revenue = inputs.revenue || 100000000; // Default 100M
    const potentialValue = CalcEngine.multiply(revenue, marginGap);
    const potentialValueImpact = CalcEngine.divide(potentialValue, 100); // As % value increase

    recommendations.push({
      id: 'VALUATION-001',
      category: 'MARGIN_OPTIMIZATION',
      priority: 'HIGH',
      title: 'Improve EBITDA Margin',
      description: `Current EBITDA margin ${currentMargin}% is below industry standard ${targetMargin}%. ` +
        `Closing this gap could significantly increase enterprise value.`,
      actionSteps: [
        'Analyze cost structure against industry benchmarks',
        'Identify operational inefficiencies and automation opportunities',
        'Review pricing strategy - pricing power often underdeveloped',
        'Consolidate vendor relationships to improve procurement costs',
        'Optimize staffing and workforce productivity',
        'Eliminate low-margin products/services'
      ],
      expectedBenefit: {
        type: 'value_creation',
        value: CalcEngine.round(potentialValueImpact, 0),
        unit: '%',
        timeframe: '18-24 months',
        description: `${marginGap}% margin improvement = ${CalcEngine.round(potentialValueImpact, 0)}% enterprise value increase`
      },
      calculation: 'EBITDA margin comparison and value impact calculation',
      implementationDifficulty: 8,
      timeToImplement: 18,
      confidence: 75
    });
  }

  // REC 2: Working capital optimization
  if (inputs && inputs.workingCapitalPercent && inputs.workingCapitalPercent > 15) {
    const wcPercent = inputs.workingCapitalPercent;
    const excessWC = CalcEngine.multiply(inputs.revenue, CalcEngine.divide(CalcEngine.subtract(wcPercent, 10), 100));

    recommendations.push({
      id: 'VALUATION-002',
      category: 'WORKING_CAPITAL',
      priority: 'MEDIUM',
      title: 'Reduce Working Capital Needs',
      description: `Working capital at ${wcPercent}% of revenue is elevated. Optimization can free up cash.`,
      actionSteps: [
        'Reduce days sales outstanding (DSO) - improve collections',
        'Increase days payable outstanding (DPO) - negotiate better terms',
        'Optimize inventory levels - reduce carrying costs',
        'Implement supply chain improvements',
        'Review contract terms with major customers/suppliers'
      ],
      expectedBenefit: {
        type: 'cash_release',
        value: CalcEngine.round(excessWC, 0),
        unit: 'currency',
        timeframe: '6-12 months',
        description: `Reducing WC to 10% of revenue releases ${CalcEngine.round(excessWC, 0)} in cash`
      },
      calculation: 'Working capital percentage analysis',
      implementationDifficulty: 6,
      timeToImplement: 9,
      confidence: 80
    });
  }

  // REC 3: Capital structure optimization
  if (inputs && inputs.debtToEquity !== undefined && inputs.debtToEquity < 0.5) {
    recommendations.push({
      id: 'VALUATION-003',
      category: 'CAPITAL_STRUCTURE',
      priority: 'LOW',
      title: 'Optimize Capital Structure',
      description: `Current debt-to-equity ratio is conservative. May be under-leveraged.`,
      actionSteps: [
        'Analyze target capital structure for industry',
        'Evaluate cost of debt vs. cost of equity',
        'Consider tax benefits of debt financing',
        'Review debt covenants and refinancing options',
        'Model impact of increased leverage on financial ratios'
      ],
      expectedBenefit: {
        type: 'cost_of_capital_reduction',
        value: '1-2%',
        unit: '%',
        description: 'Reducing WACC through optimal capital structure'
      },
      calculation: 'Capital structure and WACC analysis',
      implementationDifficulty: 7,
      timeToImplement: 3,
      confidence: 65
    });
  }

  return recommendations;
}

/**
 * Generate recommendations from risk analysis
 * Suggests diversification, risk mitigation, compliance improvements
 * 
 * @param {Object} riskResults - Risk model results
 * @param {string} country - Primary operating country
 * @returns {Object[]} Array of recommendations
 */
export function generateRiskRecommendations(riskResults, country) {
  if (!riskResults) {
    console.error('generateRiskRecommendations: Valid risk results required');
    return [];
  }

  const recommendations = [];

  // REC 1: Geographic diversification
  if (riskResults.taxExposureByCountry) {
    const exposures = Object.entries(riskResults.taxExposureByCountry);
    const maxExposure = Math.max(...exposures.map(e => e[1]));

    if (maxExposure > 50) {
      recommendations.push({
        id: 'RISK-001',
        category: 'GEOGRAPHIC_DIVERSIFICATION',
        priority: maxExposure > 70 ? 'HIGH' : 'MEDIUM',
        title: 'Diversify Geographic Exposure',
        description: `Tax exposure concentrated in single jurisdiction (${CalcEngine.round(maxExposure, 0)}%). ` +
          `Diversification reduces country-specific risk.`,
        actionSteps: [
          'Identify 2-3 complementary markets for expansion',
          'Evaluate tax regimes in target countries',
          'Assess regulatory environment and business climate',
          'Develop market entry strategy',
          'Consider partnerships or acquisitions in new markets',
          'Phase expansion over 24-36 months'
        ],
        expectedBenefit: {
          type: 'risk_reduction',
          value: CalcEngine.round(CalcEngine.subtract(maxExposure, 40), 0),
          unit: '%',
          description: `Reducing top concentration from ${CalcEngine.round(maxExposure, 0)}% to ~40%`
        },
        calculation: 'Risk model concentration analysis',
        implementationDifficulty: 9,
        timeToImplement: 24,
        confidence: maxExposure > 70 ? 85 : 75
      });
    }
  }

  // REC 2: Tax optimization
  if (riskResults.jurisdictionRisks) {
    const highRisks = Object.entries(riskResults.jurisdictionRisks)
      .filter(([, risk]) => risk.riskLevel === 'HIGH');

    if (highRisks.length > 0) {
      recommendations.push({
        id: 'RISK-002',
        category: 'TAX_OPTIMIZATION',
        priority: 'HIGH',
        title: 'Tax Optimization Strategy',
        description: `Operating in ${highRisks.length} high-risk jurisdiction(s). Optimization can reduce tax burden.`,
        actionSteps: [
          'Conduct comprehensive tax review with specialists',
          'Evaluate transfer pricing optimization',
          'Consider beneficial ownership restructuring',
          'Explore tax incentives and special regimes available',
          'Review intercompany financing arrangements',
          'Plan for income timing and recognition strategies'
        ],
        expectedBenefit: {
          type: 'tax_reduction',
          value: '10-20%',
          unit: '%',
          description: 'Typical tax savings from optimization strategies'
        },
        calculation: 'Risk model tax exposure analysis',
        implementationDifficulty: 8,
        timeToImplement: 6,
        confidence: 70
      });
    }
  }

  // REC 3: Compliance enhancement
  recommendations.push({
    id: 'RISK-003',
    category: 'COMPLIANCE',
    priority: 'MEDIUM',
    title: 'Strengthen Compliance Framework',
    description: `Formalize tax compliance and documentation to reduce audit risk.`,
    actionSteps: [
      'Document all tax positions and supporting analysis',
      'Implement transfer pricing documentation',
      'Establish compliance calendar with key deadlines',
      'Create tax control framework and internal review process',
      'Maintain contemporaneous records of all major decisions',
      'Conduct periodic compliance audits'
    ],
    expectedBenefit: {
      type: 'risk_reduction',
      value: 'Audit/penalty risk reduction',
      description: 'Strong documentation reduces likelihood of audit adjustment'
    },
    calculation: 'Risk model jurisdiction risk assessment',
    implementationDifficulty: 5,
    timeToImplement: 3,
    confidence: 90
  });

  return recommendations;
}

/**
 * Generate recommendations from personal finance analysis
 * Suggests debt reduction, savings increase, investment strategies
 * 
 * @param {Object} financeResults - Personal finance results
 * @returns {Object[]} Array of recommendations
 */
export function generatePersonalFinanceRecommendations(financeResults) {
  if (!financeResults) {
    console.error('generatePersonalFinanceRecommendations: Valid results required');
    return [];
  }

  const recommendations = [];

  // REC 1: Increase savings rate
  if (financeResults.savingsRate !== undefined && financeResults.savingsRate < 20) {
    const currentRate = financeResults.savingsRate;
    const targetRate = 20;
    const rateGap = CalcEngine.subtract(targetRate, currentRate);
    const income = financeResults.totalIncome || 0;
    const additionalSavings = CalcEngine.multiply(income, rateGap);
    const additionalSavingsAnnual = CalcEngine.divide(additionalSavings, 100);

    recommendations.push({
      id: 'PERSONAL-001',
      category: 'SAVINGS_IMPROVEMENT',
      priority: currentRate < 5 ? 'HIGH' : 'MEDIUM',
      title: 'Increase Savings Rate',
      description: `Current savings rate ${CalcEngine.round(currentRate, 1)}% is below recommended 20%. ` +
        `Higher savings accelerates wealth building.`,
      actionSteps: [
        'Review expense categories and identify discretionary spending',
        'Set specific savings targets (e.g., $500/month)',
        'Automate savings transfers on payday',
        'Reduce high-interest debt before investing',
        'Find small expenses to cut ($10-30/week adds up)',
        'Consider increasing income through side projects'
      ],
      expectedBenefit: {
        type: 'wealth_acceleration',
        value: CalcEngine.round(additionalSavingsAnnual, 0),
        unit: 'currency',
        timeframe: 'annually',
        description: `Increasing to 20% savings rate = ${CalcEngine.round(additionalSavingsAnnual, 0)}/year additional wealth building`
      },
      calculation: 'Personal finance savings rate analysis',
      implementationDifficulty: 4,
      timeToImplement: 1,
      confidence: 85
    });
  }

  // REC 2: Reduce debt-to-income ratio
  if (financeResults.debtToIncome !== undefined && financeResults.debtToIncome > 28) {
    const currentDTI = financeResults.debtToIncome;
    const targetDTI = 20;
    const dtiGap = CalcEngine.subtract(currentDTI, targetDTI);

    recommendations.push({
      id: 'PERSONAL-002',
      category: 'DEBT_REDUCTION',
      priority: currentDTI > 43 ? 'HIGH' : 'MEDIUM',
      title: 'Reduce Debt-to-Income Ratio',
      description: `DTI of ${CalcEngine.round(currentDTI, 1)}% limits financial flexibility. ` +
        `Reducing to ~20% improves financial resilience.`,
      actionSteps: [
        'List all debts with interest rates and minimum payments',
        'Use debt avalanche method (highest rate first) or debt snowball method (smallest balance first)',
        'Increase debt payments by redirecting savings or windfalls',
        'Consider consolidating high-interest debt',
        'Refinance if rates have dropped since original loan',
        'Avoid taking on new debt during payoff period'
      ],
      expectedBenefit: {
        type: 'financial_flexibility',
        value: CalcEngine.round(dtiGap, 1),
        unit: '%',
        description: `Reducing DTI by ${CalcEngine.round(dtiGap, 1)}% improves borrowing capacity and reduces financial stress`
      },
      calculation: 'Personal finance debt-to-income analysis',
      implementationDifficulty: 7,
      timeToImplement: 12,
      confidence: 80
    });
  }

  // REC 3: Retirement plan adequacy
  if (financeResults.retirementViable === false) {
    const shortfall = CalcEngine.subtract(
      financeResults.retirementYears,
      financeResults.viablYears
    );

    recommendations.push({
      id: 'PERSONAL-003',
      category: 'RETIREMENT_PLANNING',
      priority: 'HIGH',
      title: 'Address Retirement Shortfall',
      description: `Current savings plan covers only ${financeResults.viablYears} of ` +
        `${financeResults.retirementYears} planned retirement years. ` +
        `Shortfall of ${CalcEngine.round(shortfall, 0)} years.`,
      actionSteps: [
        'Increase annual retirement contributions (target: 15-20% of income)',
        'Extend working years by 1-2 years to build additional savings',
        'Reduce planned retirement spending expectations',
        'Review investment allocation to maximize returns (age-appropriate)',
        'Consider part-time work during early retirement years',
        'Re-evaluate plan annually as income and savings grow'
      ],
      expectedBenefit: {
        type: 'retirement_security',
        value: 'Retirement security achieved',
        description: 'Implementing recommendations ensures sufficient retirement funds'
      },
      calculation: 'Retirement projection analysis',
      implementationDifficulty: 6,
      timeToImplement: 0,
      confidence: 80
    });
  }

  return recommendations;
}

/**
 * Prioritize recommendations by impact and feasibility
 * 
 * @param {Object[]} recommendations - All recommendations
 * @returns {Object[]} Ranked recommendations
 */
export function prioritizeRecommendations(recommendations) {
  if (!Array.isArray(recommendations)) {
    console.error('prioritizeRecommendations: Array required');
    return [];
  }

  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const difficultyOrder = (d) => d; // Lower difficulty = easier = higher priority

  return recommendations.sort((a, b) => {
    // Primary sort: priority
    const priorityDiff = (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
    if (priorityDiff !== 0) return priorityDiff;

    // Secondary sort: implementation difficulty (easier first)
    const diffDiff = (a.implementationDifficulty || 5) - (b.implementationDifficulty || 5);
    if (diffDiff !== 0) return diffDiff;

    // Tertiary sort: confidence (higher confidence first)
    return (b.confidence || 0) - (a.confidence || 0);
  });
}

/**
 * Format recommendations for user display
 * 
 * @param {Object[]} recommendations - Recommendations to format
 * @returns {string} Formatted text
 */
export function formatRecommendationsForDisplay(recommendations) {
  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    return 'No recommendations available';
  }

  let output = '=== RECOMMENDATIONS ===\n\n';

  for (let i = 0; i < recommendations.length; i++) {
    const rec = recommendations[i];
    output += `${i + 1}. [${rec.priority}] ${rec.title}\n`;
    output += `   ${rec.description}\n\n`;

    if (rec.actionSteps && rec.actionSteps.length > 0) {
      output += `   ACTION STEPS:\n`;
      for (const step of rec.actionSteps.slice(0, 3)) {
        output += `   • ${step}\n`;
      }
      if (rec.actionSteps.length > 3) {
        output += `   • ... and ${rec.actionSteps.length - 3} more steps\n`;
      }
    }

    if (rec.expectedBenefit) {
      output += `\n   EXPECTED BENEFIT: ${rec.expectedBenefit.value} ${rec.expectedBenefit.unit}\n`;
    }

    output += `   Difficulty: ${rec.implementationDifficulty}/10 | Timeline: ${rec.timeToImplement} months\n\n`;
  }

  return output;
}

export default {
  generateForecastRecommendations,
  generateValuationRecommendations,
  generateRiskRecommendations,
  generatePersonalFinanceRecommendations,
  prioritizeRecommendations,
  formatRecommendationsForDisplay,
  generateIndustrySpecificRecommendations,
  generateRiskBasedRecommendations,
  applyConfidenceWeighting,
  rankRecommendationsByFeasibility,
  calculateRecommendationImpactScore,
  aggregateRecommendations
};

// ============================================================================
// EXTENDED RECOMMENDATION ENGINE - SOPHISTICATED FEATURES
// ============================================================================

/**
 * Generate industry-specific recommendations
 * Tailors suggestions based on industry vertical and business model
 * 
 * @param {Object} analysisResults - Complete analysis results
 * @param {string} industry - Industry classification
 * @param {string} businessModel - Business model type (B2B, B2C, SaaS, etc.)
 * @returns {Object[]} Industry-specific recommendations
 */
export function generateIndustrySpecificRecommendations(analysisResults, industry, businessModel) {
  const recommendations = [];

  try {
    if (!industry || !businessModel) {
      return recommendations;
    }

    const industryConfigs = {
      'SaaS': {
        keyMetrics: ['CAC', 'LTV', 'MRR', 'Churn'],
        benchmarks: { growth: 0.25, margin: 0.70, churn: 0.05 },
        recommendations: [
          {
            title: 'Optimize Customer Acquisition Cost (CAC) Payback Period',
            description: 'Reduce CAC payback time to <12 months for sustainable growth',
            actionSteps: [
              'Analyze acquisition channel efficiency by CAC and LTV',
              'Consolidate spending to highest ROI channels',
              'Implement account-based marketing for enterprise segment',
              'Set CAC payback metric target of 9-12 months'
            ],
            impactArea: 'Customer Economics',
            confidence: 85
          },
          {
            title: 'Reduce Customer Churn Through Retention Programs',
            description: 'Lower churn rate to extend customer lifetime value',
            actionSteps: [
              'Implement onboarding training program',
              'Create customer success team for high-value accounts',
              'Build feature adoption dashboard',
              'Execute proactive renewal campaigns 90 days before expiry'
            ],
            impactArea: 'Retention',
            confidence: 80
          }
        ]
      },
      'Retail': {
        keyMetrics: ['Inventory Turnover', 'Gross Margin', 'Traffic', 'Conversion'],
        benchmarks: { growth: 0.08, margin: 0.25, turnover: 6 },
        recommendations: [
          {
            title: 'Optimize Inventory Mix for Margin',
            description: 'Shift mix toward higher-margin SKUs',
            actionSteps: [
              'Analyze sales by margin tier',
              'Increase shelf space for top 20% margin products',
              'Implement price optimization for clearance items',
              'Train staff on high-margin product recommendations'
            ],
            impactArea: 'Profitability',
            confidence: 82
          },
          {
            title: 'Increase Store Productivity',
            description: 'Maximize sales per square foot',
            actionSteps: [
              'Analyze sales productivity by location',
              'Reformat underperforming zones',
              'Implement labor scheduling optimization',
              'Increase promotional activity in high-traffic windows'
            ],
            impactArea: 'Operations',
            confidence: 78
          }
        ]
      },
      'Manufacturing': {
        keyMetrics: ['Capacity Utilization', 'Throughput', 'Quality', 'Lead Time'],
        benchmarks: { growth: 0.06, margin: 0.12, utilization: 0.75 },
        recommendations: [
          {
            title: 'Increase Production Efficiency',
            description: 'Optimize manufacturing processes for higher throughput',
            actionSteps: [
              'Implement lean manufacturing practices',
              'Conduct value stream mapping',
              'Identify and eliminate bottlenecks',
              'Establish KPI dashboard for shop floor'
            ],
            impactArea: 'Operations',
            confidence: 80
          }
        ]
      }
    };

    const config = industryConfigs[industry] || industryConfigs['Retail'];

    // Add industry-specific recommendations
    for (const rec of config.recommendations) {
      recommendations.push({
        ...rec,
        industry,
        businessModel,
        priority: rec.confidence > 80 ? 'HIGH' : 'MEDIUM',
        implementationDifficulty: 6,
        timeToImplement: 3,
        calculation: 'Industry-specific analysis'
      });
    }

    return recommendations;
  } catch (error) {
    console.error('Error generating industry recommendations:', error);
    return [];
  }
}

/**
 * Generate risk-based recommendations
 * Prioritizes recommendations by risk exposure and mitigation impact
 * 
 * @param {Object} riskAnalysis - Risk assessment results
 * @param {Array<Object>} existingRecommendations - Current recommendations
 * @returns {Object[]} Risk-prioritized recommendations
 */
export function generateRiskBasedRecommendations(riskAnalysis, existingRecommendations = []) {
  const riskRecommendations = [];

  try {
    if (!riskAnalysis) {
      return riskRecommendations;
    }

    const {
      concentrationRisks = [],
      jurisdictionalRisks = [],
      operationalRisks = [],
      overallRiskScore = 0
    } = riskAnalysis;

    // Concentration Risk Mitigation
    for (const risk of concentrationRisks) {
      if (risk.concentration > 0.6) {
        riskRecommendations.push({
          id: 'risk-' + Math.random().toString(36).substr(2, 9),
          title: `Reduce ${risk.category} Concentration from ${Math.round(risk.concentration * 100)}%`,
          description: `Current concentration of ${Math.round(risk.concentration * 100)}% exceeds safe levels. Diversify to reduce risk exposure.`,
          category: 'Risk Mitigation',
          priority: 'HIGH',
          actionSteps: [
            `Identify 2-3 new ${risk.category} targets for expansion`,
            `Develop market entry strategy for each target`,
            `Allocate resources to reduce primary concentration to 40-50%`,
            `Establish quarterly monitoring of concentration metrics`
          ],
          expectedBenefit: {
            type: 'Risk Reduction',
            value: Math.round((risk.concentration - 0.35) * 100),
            unit: 'percentage point reduction',
            basis: `Reduce concentration from ${Math.round(risk.concentration * 100)}% to 35%`
          },
          riskMitigation: {
            riskReduced: risk.category,
            impactReduction: Math.round((1 - 0.35 / risk.concentration) * 100),
            newRiskLevel: 'Moderate'
          },
          implementationDifficulty: 7,
          timeToImplement: 12,
          confidence: 80,
          calculation: 'Concentration risk analysis'
        });
      }
    }

    // Jurisdictional Risk Mitigation
    for (const risk of jurisdictionalRisks) {
      if (risk.riskScore > 65) {
        riskRecommendations.push({
          id: 'risk-' + Math.random().toString(36).substr(2, 9),
          title: `Mitigate ${risk.jurisdiction} Risk (Score: ${risk.riskScore})`,
          description: `High risk in ${risk.jurisdiction} jurisdiction. Implement mitigation strategies.`,
          category: 'Jurisdictional Risk',
          priority: risk.riskScore > 80 ? 'HIGH' : 'MEDIUM',
          actionSteps: [
            `Review current ${risk.jurisdiction} regulatory requirements`,
            `Implement compliance framework for key regulations`,
            `Establish local advisory board or partner`,
            `Set up escrow or performance bonds as needed`
          ],
          expectedBenefit: {
            type: 'Risk Mitigation',
            value: Math.round(risk.riskScore * 0.4),
            unit: 'points',
            basis: `Reduce jurisdictional risk score from ${risk.riskScore} to ~${Math.round(risk.riskScore * 0.6)}`
          },
          implementationDifficulty: 6,
          timeToImplement: 6,
          confidence: 75,
          calculation: 'Jurisdictional risk assessment'
        });
      }
    }

    // Sort by risk impact
    return riskRecommendations.sort((a, b) => {
      const priorityScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityScore[b.priority] - priorityScore[a.priority];
    });
  } catch (error) {
    console.error('Error generating risk recommendations:', error);
    return [];
  }
}

/**
 * Apply confidence weighting to recommendations
 * Scales recommendations based on confidence levels
 * 
 * @param {Object[]} recommendations - Array of recommendations
 * @returns {Object[]} Confidence-weighted recommendations
 */
export function applyConfidenceWeighting(recommendations) {
  return recommendations.map(rec => {
    const confidence = rec.confidence || 70;
    const weight = confidence / 100;

    return {
      ...rec,
      confidenceWeighting: {
        baseConfidence: confidence,
        weight: Math.round(weight * 100),
        adjustedPriority: weight > 0.8 ? rec.priority : 
                         weight > 0.6 ? (rec.priority === 'HIGH' ? 'MEDIUM' : 'LOW') :
                         'LOW',
        trustLevel: weight > 0.85 ? 'Very High' : 
                   weight > 0.7 ? 'High' :
                   weight > 0.5 ? 'Moderate' : 'Low'
      }
    };
  });
}

/**
 * Rank recommendations by feasibility
 * Considers implementation difficulty, timeline, and resource requirements
 * 
 * @param {Object[]} recommendations - Array of recommendations
 * @param {Object} constraints - Implementation constraints
 * @returns {Object[]} Feasibility-ranked recommendations
 */
export function rankRecommendationsByFeasibility(recommendations, constraints = {}) {
  const {
    maxImplementationMonths = 24,
    resourceLevel = 'medium', // low, medium, high
    preferQuickWins = true
  } = constraints;

  const scored = recommendations.map(rec => {
    let feasibilityScore = 100;

    // Deduct for timeline
    if (rec.timeToImplement > maxImplementationMonths) {
      feasibilityScore -= (rec.timeToImplement - maxImplementationMonths) * 2;
    }

    // Deduct for difficulty vs resources
    const difficultyThresholds = {
      low: 3,
      medium: 6,
      high: 10
    };
    const threshold = difficultyThresholds[resourceLevel];
    if (rec.implementationDifficulty > threshold) {
      feasibilityScore -= (rec.implementationDifficulty - threshold) * 1.5;
    }

    // Bonus for quick wins
    if (preferQuickWins && rec.timeToImplement <= 3) {
      feasibilityScore += 15;
    }

    return {
      ...rec,
      feasibilityScore: Math.max(0, Math.min(100, Math.round(feasibilityScore))),
      feasibilityRating: feasibilityScore > 75 ? 'HIGH' :
                        feasibilityScore > 50 ? 'MEDIUM' : 'LOW',
      quickWin: rec.timeToImplement <= 3
    };
  });

  // Sort by feasibility score descending
  return scored.sort((a, b) => b.feasibilityScore - a.feasibilityScore);
}

/**
 * Calculate impact score for each recommendation
 * Combines priority, benefit, and feasibility into single score
 * 
 * @param {Object[]} recommendations - Array of recommendations
 * @returns {Object[]} Recommendations with impact scores
 */
export function calculateRecommendationImpactScore(recommendations) {
  const priorityWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  const benefitMapping = {
    'Financial': 30,
    'Risk Reduction': 25,
    'Operational': 20,
    'Strategic': 25
  };

  return recommendations.map(rec => {
    const priorityScore = (priorityWeights[rec.priority] || 1) * 20;
    const benefitScore = (benefitMapping[rec.expectedBenefit?.type] || 15) * 
                        (rec.expectedBenefit?.value || 50) / 100;
    const confidenceScore = (rec.confidence || 70);
    const feasibilityBonus = (rec.feasibilityScore || 70) / 2;

    const impactScore = Math.round(
      (priorityScore * 0.3) +
      (benefitScore * 0.3) +
      (confidenceScore * 0.25) +
      (feasibilityBonus * 0.15)
    );

    return {
      ...rec,
      impactScore: Math.min(100, Math.max(0, impactScore)),
      impactRating: impactScore > 80 ? 'CRITICAL' :
                   impactScore > 65 ? 'HIGH' :
                   impactScore > 50 ? 'MEDIUM' : 'LOW'
    };
  });
}

/**
 * Aggregate recommendations from multiple analysis sources
 * Deduplicates and combines related recommendations
 * 
 * @param {Object[]} allRecommendations - All recommendations from various engines
 * @returns {Object[]} Aggregated and deduplicated recommendations
 */
export function aggregateRecommendations(allRecommendations = []) {
  try {
    const aggregated = new Map();

    for (const rec of allRecommendations) {
      const key = rec.title.toLowerCase().replace(/\s+/g, '_');
      
      if (aggregated.has(key)) {
        const existing = aggregated.get(key);
        existing.count = (existing.count || 1) + 1;
        existing.confidence = Math.max(existing.confidence, rec.confidence || 70);
        existing.priority = existing.priority === 'HIGH' ? 'HIGH' : rec.priority;
        existing.sources = existing.sources || [];
        if (rec.category) {
          existing.sources.push(rec.category);
        }
      } else {
        aggregated.set(key, {
          ...rec,
          count: 1,
          sources: rec.category ? [rec.category] : []
        });
      }
    }

    // Convert map to array and sort by priority and impact
    return Array.from(aggregated.values())
      .sort((a, b) => {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        const priorityDiff = (priorityOrder[a.priority] || 2) - 
                            (priorityOrder[b.priority] || 2);
        return priorityDiff !== 0 ? priorityDiff : (b.confidence || 70) - (a.confidence || 70);
      });
  } catch (error) {
    console.error('Error aggregating recommendations:', error);
    return allRecommendations;
  }
}
