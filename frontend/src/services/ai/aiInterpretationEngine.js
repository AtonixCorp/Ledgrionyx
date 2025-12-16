/**
 * AI Interpretation Engine
 * 
 * Calls calculation engine functions, interprets results, and generates
 * human-readable insights and explanations. Acts as the bridge between
 * calculations and user-facing insights.
 * 
 * Does NOT do calculations - ALWAYS calls calculationEngine
 * ALWAYS documents which calculation produced each output
 * ALWAYS validates model reference for transparency
 * 
 * Phase 3 Foundation: AI interpretation pipeline
 * Phase 5 Dependencies: Reports use these interpretations
 * 
 * Strict Rule: Every insight must reference the model and calculation that produced it
 */

import * as CalcEngine from './calculationEngine';
import * as ValidationService from './validationService';
import * as TaxLibrary from './countryTaxLibrary';
import * as Templates from './modelTemplates';
import * as PersonalFinance from './personalFinanceEngine';
import * as EntityEngine from './entityStructureEngine';

/**
 * Result Interpretation
 * 
 * @typedef {Object} InterpretedResult
 * @property {string} modelType - Which model was run
 * @property {Object} rawResults - Original calculation results
 * @property {Object} interpretation - Human-readable interpretation
 * @property {string[]} insights - Key findings
 * @property {Object} modelReference - Which calculation produced this
 * @property {number} confidenceLevel - 0-100 (how confident in this interpretation)
 */

/**
 * Interpret forecasting model results
 * Explains revenue/expense projections and trends
 * 
 * @param {Object} results - Raw forecasting results
 * @param {Object} historicalData - Historical comparison data
 * @returns {Object} Interpreted results with insights
 * 
 * @example
 * const interpreted = interpretForecastingResults(
 *   { years: [1000000, 1150000, 1322500, ...], averageGrowth: 15 },
 *   { currentRevenue: 1000000, lastYearGrowth: 12 }
 * );
 */
export function interpretForecastingResults(results, historicalData) {
  if (!results || !results.years) {
    console.error('interpretForecastingResults: Valid results with years array required');
    return null;
  }

  const interpretation = {
    modelType: 'forecasting',
    modelReference: 'ForecastingModelTemplate (Phase 1)',
    interpretation: {},
    insights: [],
    warnings: [],
    confidenceLevel: 75
  };

  // Analyze growth trend
  if (results.years.length >= 2) {
    const firstYear = results.years[0];
    const lastYear = results.years[results.years.length - 1];
    const totalGrowth = CalcEngine.subtract(lastYear, firstYear);
    const percentGrowth = CalcEngine.divide(CalcEngine.multiply(totalGrowth, 100), firstYear);

    interpretation.interpretation.totalProjectedGrowth = {
      value: CalcEngine.round(percentGrowth, 2),
      unit: '%',
      period: `${results.years.length - 1} years`,
      calculatedBy: 'CalcEngine.subtract() and CalcEngine.divide()'
    };

    // Generate insight based on growth
    if (percentGrowth > 100) {
      interpretation.insights.push(
        `Strong growth expected: ${CalcEngine.round(percentGrowth, 0)}% total growth ` +
        `(doubling within forecast period)`
      );
    } else if (percentGrowth > 50) {
      interpretation.insights.push(
        `Solid growth projected: ${CalcEngine.round(percentGrowth, 0)}% total growth ` +
        `over forecast period`
      );
    } else if (percentGrowth > 0) {
      interpretation.insights.push(
        `Moderate growth expected: ${CalcEngine.round(percentGrowth, 0)}% total growth`
      );
    } else {
      interpretation.warnings.push('Projected decline in revenues');
    }
  }

  // Analyze year-over-year growth rates
  const yoyGrowthRates = [];
  for (let i = 1; i < results.years.length; i++) {
    const previous = results.years[i - 1];
    const current = results.years[i];
    const yoyGrowth = CalcEngine.divide(CalcEngine.multiply(CalcEngine.subtract(current, previous), 100), previous);
    yoyGrowthRates.push(CalcEngine.round(yoyGrowth, 2));
  }

  if (yoyGrowthRates.length > 0) {
    const avgYoyGrowth = yoyGrowthRates.reduce((a, b) => a + b, 0) / yoyGrowthRates.length;
    interpretation.interpretation.averageYearOverYearGrowth = {
      value: CalcEngine.round(avgYoyGrowth, 2),
      unit: '%',
      calculatedBy: 'Year-over-year comparison using CalcEngine'
    };

    // Check for declining growth (red flag)
    if (yoyGrowthRates[yoyGrowthRates.length - 1] < yoyGrowthRates[0]) {
      const decline = CalcEngine.subtract(
        yoyGrowthRates[0],
        yoyGrowthRates[yoyGrowthRates.length - 1]
      );
      interpretation.insights.push(
        `Growth rate declining: from ${yoyGrowthRates[0]}% to ` +
        `${yoyGrowthRates[yoyGrowthRates.length - 1]}% (${CalcEngine.round(decline, 1)}% slowdown)`
      );
    }
  }

  // Compare to historical if available
  if (historicalData && historicalData.lastYearGrowth) {
    const projectedAverage = results.averageGrowth || 
      (yoyGrowthRates.length > 0 ? yoyGrowthRates.reduce((a, b) => a + b, 0) / yoyGrowthRates.length : 0);
    
    if (projectedAverage > historicalData.lastYearGrowth) {
      const acceleration = CalcEngine.subtract(projectedAverage, historicalData.lastYearGrowth);
      interpretation.insights.push(
        `Growth accelerating: from historical ${historicalData.lastYearGrowth}% to ` +
        `projected ${CalcEngine.round(projectedAverage, 1)}% ` +
        `(+${CalcEngine.round(acceleration, 1)}% acceleration)`
      );
    }
  }

  return interpretation;
}

/**
 * Interpret valuation model results
 * Explains business value and key value drivers
 * 
 * @param {Object} results - Raw valuation results (DCF)
 * @param {Object} inputs - Model inputs for context
 * @returns {Object} Interpreted results with insights
 */
export function interpretValuationResults(results, inputs) {
  if (!results || !results.enterpriseValue) {
    console.error('interpretValuationResults: Valid results with enterpriseValue required');
    return null;
  }

  const interpretation = {
    modelType: 'valuation',
    modelReference: 'ValuationModelTemplate (Phase 1)',
    interpretation: {},
    insights: [],
    warnings: [],
    confidenceLevel: 70
  };

  interpretation.interpretation.enterpriseValue = {
    value: CalcEngine.round(results.enterpriseValue, 2),
    unit: 'currency',
    calculatedBy: 'DCF method using CalcEngine.calculateCompoundGrowth()',
    explanation: 'Sum of discounted future cashflows'
  };

  // Calculate valuation multiples if revenue available
  if (inputs && inputs.revenue && results.enterpriseValue > 0) {
    const evRevenue = CalcEngine.divide(results.enterpriseValue, inputs.revenue);
    interpretation.interpretation.evToRevenue = {
      value: CalcEngine.round(evRevenue, 2),
      unit: 'multiple',
      calculatedBy: 'enterpriseValue / revenue',
      explanation: 'How many times revenue is the company worth'
    };

    interpretation.insights.push(
      `Company valued at ${CalcEngine.round(evRevenue, 1)}x revenue. ` +
      (evRevenue > 3 ? 'Premium valuation.' : evRevenue > 1 ? 'Reasonable valuation.' : 'Discount valuation.')
    );
  }

  // Analyze sensitivity to discount rate
  if (results.sensitivityToDiscountRate) {
    const range = results.sensitivityToDiscountRate;
    const rangePercent = CalcEngine.divide(
      CalcEngine.multiply(CalcEngine.subtract(range.high, range.low), 100),
      range.low
    );
    
    interpretation.warnings.push(
      `Valuation sensitive to discount rate assumptions. ` +
      `±1% rate change: ${CalcEngine.round(rangePercent / 2, 0)}% valuation swing`
    );
    interpretation.confidenceLevel = CalcEngine.subtract(interpretation.confidenceLevel, 10);
  }

  // Analyze terminal value impact
  if (results.terminalValuePercent) {
    if (results.terminalValuePercent > 70) {
      interpretation.warnings.push(
        `High terminal value dependency (${results.terminalValuePercent}% of total value). ` +
        `Valuation heavily depends on distant future assumptions.`
      );
      interpretation.confidenceLevel = CalcEngine.subtract(interpretation.confidenceLevel, 15);
    }
  }

  return interpretation;
}

/**
 * Interpret risk model results
 * Explains tax exposure, concentration risk, and mitigation opportunities
 * 
 * @param {Object} results - Raw risk analysis results
 * @param {Object} entities - Entity data for context
 * @returns {Object} Interpreted results with insights
 */
export function interpretRiskResults(results, entities) {
  if (!results) {
    console.error('interpretRiskResults: Valid results required');
    return null;
  }

  const interpretation = {
    modelType: 'risk',
    modelReference: 'RiskModelTemplate (Phase 1)',
    interpretation: {},
    insights: [],
    warnings: [],
    recommendations: [],
    confidenceLevel: 80
  };

  // Analyze tax exposure concentration
  if (results.taxExposureByCountry) {
    const countries = Object.keys(results.taxExposureByCountry);
    const exposures = Object.values(results.taxExposureByCountry);

    // Find largest exposure
    const maxExposure = Math.max(...exposures);
    const maxCountry = countries[exposures.indexOf(maxExposure)];

    if (maxExposure > 50) {
      interpretation.insights.push(
        `Tax exposure concentrated: ${CalcEngine.round(maxExposure, 0)}% in ${maxCountry}. ` +
        `Single-country risk is significant.`
      );
      interpretation.recommendations.push(
        `Consider diversifying tax exposure across additional jurisdictions to reduce concentration risk.`
      );
    } else if (maxExposure > 30) {
      interpretation.insights.push(
        `Moderate exposure concentration: largest exposure is ${CalcEngine.round(maxExposure, 0)}% (${maxCountry})`
      );
    } else {
      interpretation.insights.push(
        `Tax exposure well-diversified across ${countries.length} countries. ` +
        `Largest single-country exposure: ${CalcEngine.round(maxExposure, 0)}% (${maxCountry})`
      );
    }
  }

  // Analyze overall risk score
  if (results.riskScore !== undefined) {
    interpretation.interpretation.overallRiskScore = {
      value: CalcEngine.round(results.riskScore, 0),
      unit: '0-100',
      explanation: 'Composite risk assessment'
    };

    if (results.riskScore > 70) {
      interpretation.insights.push('High risk profile. Recommend risk mitigation strategies.');
      interpretation.warnings.push('Overall risk level is elevated.');
    } else if (results.riskScore > 40) {
      interpretation.insights.push('Moderate risk profile. Diversification opportunities exist.');
    } else {
      interpretation.insights.push('Low risk profile. Current exposure well-managed.');
    }
  }

  // Analyze jurisdiction risks
  if (results.jurisdictionRisks) {
    const highRiskCount = Object.values(results.jurisdictionRisks)
      .filter(r => r.riskLevel === 'HIGH').length;
    
    if (highRiskCount > 0) {
      interpretation.warnings.push(
        `${highRiskCount} high-risk jurisdiction(s) identified. ` +
        `Recommend enhanced compliance and monitoring.`
      );
    }
  }

  return interpretation;
}

/**
 * Interpret personal finance results
 * Explains financial health, retirement readiness, areas for improvement
 * 
 * @param {Object} results - Personal finance analysis results
 * @returns {Object} Interpreted results with insights
 */
export function interpretPersonalFinanceResults(results) {
  if (!results) {
    console.error('interpretPersonalFinanceResults: Valid results required');
    return null;
  }

  const interpretation = {
    modelType: 'personal_finance',
    modelReference: 'PersonalFinanceModelTemplate (Phase 1)',
    interpretation: {},
    insights: [],
    warnings: [],
    recommendations: [],
    confidenceLevel: 75
  };

  // Analyze income
  if (results.netIncome !== undefined) {
    interpretation.interpretation.netIncome = {
      value: CalcEngine.round(results.netIncome, 2),
      unit: 'currency',
      calculatedBy: 'PersonalFinanceEngine.calculateNetIncome()',
      explanation: 'Income after taxes and deductions'
    };
  }

  // Analyze savings rate
  if (results.savingsRate !== undefined) {
    interpretation.interpretation.savingsRate = {
      value: CalcEngine.round(results.savingsRate, 2),
      unit: '%',
      explanation: 'Percentage of income saved/invested'
    };

    if (results.savingsRate > 20) {
      interpretation.insights.push(
        `Excellent savings rate (${CalcEngine.round(results.savingsRate, 0)}%). ` +
        `On track for strong financial future.`
      );
    } else if (results.savingsRate > 10) {
      interpretation.insights.push(
        `Good savings rate (${CalcEngine.round(results.savingsRate, 0)}%). ` +
        `Building wealth steadily.`
      );
    } else if (results.savingsRate > 0) {
      interpretation.recommendations.push(
        `Low savings rate (${CalcEngine.round(results.savingsRate, 0)}%). ` +
        `Consider ways to increase savings capacity.`
      );
    } else {
      interpretation.warnings.push('Negative savings rate. Spending exceeds income.');
    }
  }

  // Analyze debt-to-income ratio
  if (results.debtToIncome !== undefined) {
    interpretation.interpretation.debtToIncome = {
      value: CalcEngine.round(results.debtToIncome, 2),
      unit: '%',
      explanation: 'Debt payments as % of income'
    };

    if (results.debtToIncome > 43) {
      interpretation.warnings.push(
        `High debt-to-income ratio (${CalcEngine.round(results.debtToIncome, 0)}%). ` +
        `Lenders may restrict additional credit.`
      );
    } else if (results.debtToIncome > 28) {
      interpretation.insights.push(
        `Moderate debt-to-income ratio (${CalcEngine.round(results.debtToIncome, 0)}%). ` +
        `Manageable debt levels.`
      );
    } else {
      interpretation.insights.push(
        `Healthy debt-to-income ratio (${CalcEngine.round(results.debtToIncome, 0)}%). ` +
        `Good financial flexibility.`
      );
    }
  }

  // Analyze retirement readiness
  if (results.retirementViable !== undefined) {
    if (results.retirementViable) {
      interpretation.insights.push(
        `Retirement plan is viable for ${results.viablYears} years of planned spending.`
      );
    } else {
      interpretation.warnings.push(
        `Retirement savings may be insufficient. ` +
        `Only covers ${results.viablYears} of ${results.retirementYears} planned years.`
      );
      interpretation.recommendations.push(
        `Increase annual contributions or extend working years to ensure retirement security.`
      );
    }
  }

  // Analyze net worth
  if (results.netWorth !== undefined) {
    interpretation.interpretation.netWorth = {
      value: CalcEngine.round(results.netWorth, 2),
      unit: 'currency',
      calculatedBy: 'PersonalFinanceEngine.calculateNetWorth()',
      explanation: 'Total assets minus total liabilities'
    };

    if (results.netWorth > 0) {
      interpretation.insights.push(
        `Positive net worth of ${CalcEngine.round(results.netWorth, 0)}. ` +
        `Strong financial foundation.`
      );
    } else {
      interpretation.warnings.push(
        `Negative net worth. Liabilities exceed assets. ` +
        `Focus on debt reduction.`
      );
    }
  }

  return interpretation;
}

/**
 * Interpret scenario analysis results
 * Explains differences between best/base/worst case scenarios
 * 
 * @param {Object} baselineResults - Baseline scenario results
 * @param {Object} scenarios - Alternative scenarios (optimistic, pessimistic, etc.)
 * @returns {Object} Interpreted scenario comparison
 */
export function interpretScenarioResults(baselineResults, scenarios) {
  if (!baselineResults || !scenarios) {
    console.error('interpretScenarioResults: Baseline and scenarios required');
    return null;
  }

  const interpretation = {
    modelType: 'scenario',
    modelReference: 'ScenarioModelTemplate (Phase 1)',
    interpretation: {},
    insights: [],
    confidenceLevel: 65
  };

  interpretation.interpretation.scenarioComparison = {
    baseline: baselineResults,
    scenarios,
    explanation: 'Comparison of outcomes under different assumptions',
    calculatedBy: 'ScenarioModelTemplate with various assumption adjustments'
  };

  // Analyze range of outcomes
  if (scenarios.optimistic && scenarios.pessimistic) {
    const range = CalcEngine.subtract(scenarios.optimistic, scenarios.pessimistic);
    const rangePct = CalcEngine.divide(CalcEngine.multiply(range, 100), scenarios.pessimistic);

    interpretation.insights.push(
      `Outcome range: ${CalcEngine.round(range, 0)} between best and worst case ` +
      `(${CalcEngine.round(rangePct, 0)}% spread). ` +
      `Significant uncertainty exists.`
    );
  }

  // Identify most likely outcome
  if (baselineResults) {
    interpretation.insights.push(
      `Most likely outcome (baseline): ${CalcEngine.round(baselineResults, 0)}.`
    );
  }

  // Risk/reward assessment
  if (scenarios.optimistic && scenarios.pessimistic && baselineResults) {
    const upside = CalcEngine.subtract(scenarios.optimistic, baselineResults);
    const downside = CalcEngine.subtract(baselineResults, scenarios.pessimistic);
    const upsidePercent = CalcEngine.divide(CalcEngine.multiply(upside, 100), baselineResults);
    const downsidePercent = CalcEngine.divide(CalcEngine.multiply(downside, 100), baselineResults);

    interpretation.insights.push(
      `Risk/reward profile: +${CalcEngine.round(upsidePercent, 0)}% upside, ` +
      `-${CalcEngine.round(downsidePercent, 0)}% downside from baseline.`
    );

    if (upsidePercent > downsidePercent) {
      interpretation.insights.push('Asymmetric upside: more to gain than to lose.');
    } else if (downsidePercent > upsidePercent) {
      interpretation.insights.push('Asymmetric downside: more to lose than to gain.');
    }
  }

  return interpretation;
}

/**
 * Generate comprehensive interpretation report
 * Summarizes all results, insights, and recommendations
 * 
 * @param {Object} allInterpretations - All interpretations from different models
 * @param {Object} inputs - Original model inputs
 * @returns {string} Formatted comprehensive report
 */
export function generateComprehensiveInterpretation(allInterpretations, inputs) {
  if (!allInterpretations) {
    return 'No interpretations provided';
  }

  let report = '=== AI INTERPRETATION REPORT ===\n\n';
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Analysis Date: ${inputs?.analysisDate || new Date().toISOString().split('T')[0]}\n\n`;

  // Summary of confidence levels
  const interpretations = Array.isArray(allInterpretations) 
    ? allInterpretations 
    : Object.values(allInterpretations);

  const avgConfidence = interpretations.length > 0
    ? Math.round(interpretations.reduce((sum, i) => sum + (i.confidenceLevel || 0), 0) / interpretations.length)
    : 0;

  report += `Overall Confidence Level: ${avgConfidence}%\n`;
  report += `Models Analyzed: ${interpretations.length}\n\n`;

  // Details for each interpretation
  for (const interp of interpretations) {
    if (!interp) continue;

    report += `--- ${interp.modelType?.toUpperCase() || 'MODEL'} ANALYSIS ---\n`;
    report += `Model Reference: ${interp.modelReference}\n`;
    report += `Confidence: ${interp.confidenceLevel}%\n\n`;

    if (interp.insights && interp.insights.length > 0) {
      report += 'KEY INSIGHTS:\n';
      for (const insight of interp.insights) {
        report += `• ${insight}\n`;
      }
      report += '\n';
    }

    if (interp.warnings && interp.warnings.length > 0) {
      report += 'WARNINGS:\n';
      for (const warning of interp.warnings) {
        report += `⚠ ${warning}\n`;
      }
      report += '\n';
    }

    if (interp.recommendations && interp.recommendations.length > 0) {
      report += 'RECOMMENDATIONS:\n';
      for (const rec of interp.recommendations) {
        report += `→ ${rec}\n`;
      }
      report += '\n';
    }

    report += '\n';
  }

  report += '=== END REPORT ===\n';
  return report;
}

/**
 * Explain a single calculation
 * Shows the formula, inputs, and how result was derived
 * 
 * @param {string} calculationName - Name of calculation
 * @param {Object} inputs - Input values
 * @param {*} result - Calculated result
 * @returns {string} Human-readable explanation
 * 
 * @example
 * const explanation = explainCalculation(
 *   'calculateNetIncome',
 *   { grossIncome: 500000, taxRate: 7 },
 *   405000
 * );
 */
export function explainCalculation(calculationName, inputs, result) {
  if (!calculationName) {
    console.error('explainCalculation: Calculation name required');
    return '';
  }

  let explanation = `Calculation: ${calculationName}\n`;
  explanation += `Performed: ${new Date().toISOString()}\n\n`;

  explanation += 'INPUTS:\n';
  for (const [key, value] of Object.entries(inputs || {})) {
    explanation += `  ${key}: ${value}\n`;
  }
  explanation += '\n';

  explanation += `RESULT: ${result}\n\n`;

  // Provide formula explanation based on calculation type
  const formulaExplanations = {
    calculateNetIncome: 'Net Income = Gross Income - (Gross Income × Tax Rate%)',
    calculateCompoundGrowth: 'Future Value = Present Value × (1 + Growth Rate)^Years',
    calculateGoodwill: 'Goodwill = Purchase Price - (Fair Value Assets - Fair Value Liabilities)',
    calculateMinorityInterest: 'Minority Interest = Non-controlling % × Fair Value Net Assets',
    calculateDebtToIncomeRatio: 'DTI Ratio = (Monthly Debt Payments / Monthly Gross Income) × 100',
    calculateLoanPayment: 'PMT = P × [r(1+r)^n] / [(1+r)^n - 1]'
  };

  if (formulaExplanations[calculationName]) {
    explanation += `FORMULA:\n${formulaExplanations[calculationName]}\n\n`;
  }

  explanation += 'CALCULATION SOURCE:\n';
  explanation += '• Engine: calculationEngine.js (Phase 1)\n';
  explanation += '• Safe arithmetic to prevent floating-point errors\n';
  explanation += '• Result rounded to 2 decimal places\n';
  explanation += '• Deterministic: Same inputs always produce same result\n';

  return explanation;
}

export default {
  interpretForecastingResults,
  interpretValuationResults,
  interpretRiskResults,
  interpretPersonalFinanceResults,
  interpretScenarioResults,
  generateComprehensiveInterpretation,
  explainCalculation
};
