/**
 * Sensitivity Analysis Engine
 *
 * Analyzes how changes in key assumptions impact model outputs.
 * Enables what-if analysis, tornado diagrams, and driver identification.
 *
 * Features:
 * - Tornado diagram data generation
 * - Sensitivity tables and impact analysis
 * - Parameter variation scenarios
 * - Critical driver identification
 * - What-if analysis
 * - Break-even analysis
 *
 * Phase 4 Feature: Advanced sensitivity and what-if analysis
 * Complements Scenario Engine for comprehensive scenario planning
 *
 * @module sensitivityEngine
 * @version 1.0.0
 */

import * as CalcEngine from '../calculation/calculationEngine';

// ============================================================================
// TORNADO DIAGRAM GENERATION
// ============================================================================

/**
 * Generate tornado diagram data
 * Ranks key drivers by impact on output value
 *
 * @param {Object} baselineModel - Baseline model with current value
 * @param {Array<string>} parameterNames - Parameters to analyze
 * @param {number} variationPercent - % to vary each parameter (default: 20%)
 * @returns {Object} Tornado diagram data
 */
export function generateTornadoDiagramData(baselineModel, parameterNames = [], variationPercent = 0.20) {
  if (!baselineModel || !baselineModel.enterpriseValue) {
    return { error: 'Baseline model with enterprise value required', confidence: 0 };
  }

  try {
    const baselineValue = baselineModel.enterpriseValue;
    const baselineAssumptions = baselineModel.assumptions || {};
    const drivers = [];

    // Analyze each parameter
    for (const param of parameterNames) {
      const baseValue = baselineAssumptions[param];

      if (baseValue === undefined || baseValue === null) {
        continue;
      }

      // Calculate low scenario (reduced by variation %)
      const lowValue = CalcEngine.multiply(baseValue, CalcEngine.subtract(1, variationPercent));
      const lowOutput = calculateAdjustedValue(baselineValue, param, lowValue, baseValue);

      // Calculate high scenario (increased by variation %)
      const highValue = CalcEngine.multiply(baseValue, CalcEngine.add(1, variationPercent));
      const highOutput = calculateAdjustedValue(baselineValue, param, highValue, baseValue);

      // Calculate impact
      const downside = CalcEngine.subtract(baselineValue, lowOutput);
      const upside = CalcEngine.subtract(highOutput, baselineValue);
      const totalImpact = CalcEngine.add(downside, upside);

      drivers.push({
        parameter: param,
        baseValue: CalcEngine.round(baseValue, 4),
        lowValue: CalcEngine.round(lowValue, 4),
        highValue: CalcEngine.round(highValue, 4),
        downside: CalcEngine.round(downside, 0),
        upside: CalcEngine.round(upside, 0),
        totalImpact: CalcEngine.round(totalImpact, 0),
        impactPercent: CalcEngine.round(
          CalcEngine.divide(totalImpact, baselineValue) * 100,
          1
        ),
        low: CalcEngine.round(lowOutput, 0),
        high: CalcEngine.round(highOutput, 0),
        range: CalcEngine.round(CalcEngine.subtract(highOutput, lowOutput), 0)
      });
    }

    // Sort by total impact (descending)
    drivers.sort((a, b) => b.totalImpact - a.totalImpact);

    return {
      success: true,
      tornadoDiagram: {
        baselineValue: CalcEngine.round(baselineValue, 0),
        variationPercent: CalcEngine.round(variationPercent * 100, 0),
        drivers,
        topDrivers: drivers.slice(0, 5),
        totalDriversAnalyzed: drivers.length,
        highestImpactDriver: drivers.length > 0 ? drivers[0].parameter : null,
        highestImpact: drivers.length > 0 ? drivers[0].totalImpact : 0
      },
      confidence: 85
    };
  } catch (error) {
    return {
      error: error.message,
      success: false,
      confidence: 0
    };
  }
}

/**
 * Helper function to calculate adjusted value based on parameter change
 */
const calculateAdjustedValue = (baseValue, parameter, newValue, oldValue) => {
  if (oldValue === 0) return baseValue;

  const changeRatio = CalcEngine.divide(newValue, oldValue);

  // Different parameters have different impacts on valuation
  const impactMap = {
    revenueGrowth: 0.8,
    operatingMargin: 1.0,
    capexPercent: 0.3,
    workingCapitalPercent: 0.2,
    discountRate: -0.6,
    taxRate: 0.5,
    debtPercent: 0.1
  };

  const impact = impactMap[parameter] || 0.5;
  const adjustment = CalcEngine.multiply(
    baseValue,
    CalcEngine.multiply(
      CalcEngine.subtract(changeRatio, 1),
      impact
    )
  );

  return CalcEngine.add(baseValue, adjustment);
};

// ============================================================================
// SENSITIVITY TABLES
// ============================================================================

/**
 * Generate sensitivity table
 * Two-dimensional analysis showing output for combinations of two parameters
 *
 * @param {Object} baselineModel - Baseline model
 * @param {string} param1 - First parameter name
 * @param {string} param2 - Second parameter name
 * @param {Array<number>} param1Range - Range for param1 (e.g., [0.08, 0.10, 0.12, 0.14, 0.16])
 * @param {Array<number>} param2Range - Range for param2 (e.g., [0.15, 0.20, 0.25, 0.30, 0.35])
 * @returns {Object} Two-dimensional sensitivity table
 */
export function generateSensitivityTable(
  baselineModel,
  param1,
  param2,
  param1Range = [],
  param2Range = []
) {
  if (!baselineModel || !param1 || !param2) {
    return { error: 'Model and parameters required', confidence: 0 };
  }

  try {
    const baselineValue = baselineModel.enterpriseValue;
    const baseAssumptions = baselineModel.assumptions || {};

    // Use default ranges if not provided
    if (param1Range.length === 0) {
      const baseVal1 = baseAssumptions[param1] || 0.12;
      param1Range = [
        CalcEngine.multiply(baseVal1, 0.8),
        CalcEngine.multiply(baseVal1, 0.9),
        baseVal1,
        CalcEngine.multiply(baseVal1, 1.1),
        CalcEngine.multiply(baseVal1, 1.2)
      ];
    }

    if (param2Range.length === 0) {
      const baseVal2 = baseAssumptions[param2] || 0.20;
      param2Range = [
        CalcEngine.multiply(baseVal2, 0.8),
        CalcEngine.multiply(baseVal2, 0.9),
        baseVal2,
        CalcEngine.multiply(baseVal2, 1.1),
        CalcEngine.multiply(baseVal2, 1.2)
      ];
    }

    const table = {
      param1,
      param2,
      param1Range: param1Range.map(v =>CalcEngine.round(v, 4)),
      param2Range: param2Range.map(v =>CalcEngine.round(v, 4)),
      values: []
    };

    // Generate sensitivity values
    for (const p1 of param1Range) {
      const row = [];
      for (const p2 of param2Range) {
        const value = calculateAdjustedValueTwoParam(
          baselineValue,
          param1,
          p1,
          param2,
          p2,
          baseAssumptions
        );
        row.push(CalcEngine.round(value, 0));
      }
      table.values.push(row);
    }

    // Calculate statistics
    const allValues = table.values.flat();
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const avgValue = CalcEngine.arraySum(allValues) / allValues.length;

    return {
      success: true,
      sensitivityTable: table,
      statistics: {
        minimum: minValue,
        maximum: maxValue,
        average: CalcEngine.round(avgValue, 0),
        range: maxValue - minValue,
        baselineValue: CalcEngine.round(baselineValue, 0)
      },
      confidence: 80
    };
  } catch (error) {
    return {
      error: error.message,
      success: false,
      confidence: 0
    };
  }
}

/**
 * Helper for two-parameter sensitivity calculation
 */
const calculateAdjustedValueTwoParam = (baseValue, p1Name, p1Value, p2Name, p2Value, baseAssumptions) => {
  const baseP1 = baseAssumptions[p1Name] || p1Value;
  const baseP2 = baseAssumptions[p2Name] || p2Value;

  const ratio1 = CalcEngine.divide(p1Value, baseP1);
  const ratio2 = CalcEngine.divide(p2Value, baseP2);

  const impactMap = {
    revenueGrowth: 0.8,
    operatingMargin: 1.0,
    capexPercent: 0.3,
    workingCapitalPercent: 0.2,
    discountRate: -0.6,
    taxRate: 0.5
  };

  const impact1 = impactMap[p1Name] || 0.5;
  const impact2 = impactMap[p2Name] || 0.5;

  const adjustment1 = CalcEngine.multiply(baseValue, CalcEngine.multiply(CalcEngine.subtract(ratio1, 1), impact1));
  const adjustment2 = CalcEngine.multiply(baseValue, CalcEngine.multiply(CalcEngine.subtract(ratio2, 1), impact2));

  return CalcEngine.add(
    CalcEngine.add(baseValue, adjustment1),
    adjustment2
  );
};

// ============================================================================
// CRITICAL DRIVER ANALYSIS
// ============================================================================

/**
 * Identify critical value drivers
 * Ranks parameters by their impact on final valuation
 *
 * @param {Object} baselineModel - Baseline model
 * @param {Object} options - Analysis options
 * @returns {Object} Critical driver analysis
 */
export function identifyCriticalDrivers(baselineModel, options = {}) {
  if (!baselineModel) {
    return { error: 'Baseline model required', confidence: 0 };
  }

  try {
    const { variationPercent = 0.25, threshold = 0.05 } = options;
    const baselineValue = baselineModel.enterpriseValue || 1;
    const assumptions = baselineModel.assumptions || {};

    const drivers = [];

    // Analyze standard parameters
    const standardParams = [
      'revenueGrowth',
      'operatingMargin',
      'capexPercent',
      'workingCapitalPercent',
      'discountRate',
      'taxRate',
      'debtPercent'
    ];

    for (const param of standardParams) {
      const baseValue = assumptions[param];
      if (baseValue === undefined || baseValue === null) continue;

      const variationAmount = CalcEngine.multiply(baseValue, variationPercent);
      const lowValue = CalcEngine.subtract(baseValue, variationAmount);
      const highValue = CalcEngine.add(baseValue, variationAmount);

      const lowOutput = calculateAdjustedValue(baselineValue, param, lowValue, baseValue);
      const highOutput = calculateAdjustedValue(baselineValue, param, highValue, baseValue);

      const elasticity = CalcEngine.divide(
        CalcEngine.divide(CalcEngine.subtract(highOutput, lowOutput), baselineValue),
        CalcEngine.divide(CalcEngine.subtract(highValue, lowValue), baseValue)
      );

      const impact = CalcEngine.absoluteValue(elasticity);

      drivers.push({
        parameter: param,
        impact,
        elasticity: CalcEngine.round(elasticity, 2),
        classification: impact > 1.5 ? 'CRITICAL' : impact > 0.8 ? 'IMPORTANT' : 'NORMAL',
        rangeImpact: {
          low: CalcEngine.round(lowOutput, 0),
          base: CalcEngine.round(baselineValue, 0),
          high: CalcEngine.round(highOutput, 0)
        }
      });
    }

    // Filter by threshold and sort
    const criticalDrivers = drivers
      .filter(d => d.impact > threshold)
      .sort((a, b) => b.impact - a.impact);

    return {
      success: true,
      criticalDrivers: {
        analysis: criticalDrivers,
        topDrivers: criticalDrivers.slice(0, 5),
        criticalCount: criticalDrivers.filter(d => d.classification === 'CRITICAL').length,
        importantCount: criticalDrivers.filter(d => d.classification === 'IMPORTANT').length
      },
      confidence: 80
    };
  } catch (error) {
    return {
      error: error.message,
      success: false,
      confidence: 0
    };
  }
}

// ============================================================================
// BREAK-EVEN ANALYSIS
// ============================================================================

/**
 * Calculate break-even point for a parameter
 * Finds value where output equals target (e.g., zero value, target return)
 *
 * @param {Object} baselineModel - Baseline model
 * @param {string} parameter - Parameter to solve for
 * @param {number} targetValue - Target output value
 * @returns {Object} Break-even analysis
 */
export function calculateBreakEvenPoint(baselineModel, parameter, targetValue = 0) {
  if (!baselineModel) {
    return { error: 'Baseline model required', confidence: 0 };
  }

  try {
    const baselineValue = baselineModel.enterpriseValue || 1;
    const assumptions = baselineModel.assumptions || {};
    const baseParamValue = assumptions[parameter];

    if (baseParamValue === undefined) {
      return {
        error: `Parameter '${parameter}' not found in model`,
        confidence: 0
      };
    }

    // Iteratively find break-even (Newton's method approximation)
    let testValue = baseParamValue;
    let currentOutput = baselineValue;
    let iterations = 0;
    const maxIterations = 20;

    while (Math.abs(currentOutput - targetValue) > 100 && iterations < maxIterations) {
      const testOutput = calculateAdjustedValue(baselineValue, parameter, testValue, baseParamValue);
      const deltaOutput = CalcEngine.subtract(testOutput, currentOutput);
      const deltaValue = CalcEngine.divide(deltaOutput, 10); // Step size

      if (Math.abs(deltaOutput) < 1000) {
        // Close enough
        currentOutput = testOutput;
        break;
      }

      const direction = CalcEngine.greaterThan(currentOutput, targetValue) ? -1 : 1;
      testValue = CalcEngine.add(testValue, CalcEngine.multiply(deltaValue, direction));

      iterations++;
    }

    const breakEvenFound = Math.abs(currentOutput - targetValue) < 500;

    return {
      success: breakEvenFound,
      breakEven: {
        parameter,
        baseValue: CalcEngine.round(baseParamValue, 4),
        breakEvenValue: CalcEngine.round(testValue, 4),
        targetValue: CalcEngine.round(targetValue, 0),
        achievedValue: CalcEngine.round(currentOutput, 0),
        change: CalcEngine.round(CalcEngine.subtract(testValue, baseParamValue), 4),
        changePercent: CalcEngine.round(
          CalcEngine.divide(
            CalcEngine.subtract(testValue, baseParamValue),
            baseParamValue
          ) * 100,
          2
        ) + '%',
        iterations
      },
      confidence: breakEvenFound ? 85 : 50
    };
  } catch (error) {
    return {
      error: error.message,
      success: false,
      confidence: 0
    };
  }
}

// ============================================================================
// WHAT-IF ANALYSIS
// ============================================================================

/**
 * Perform what-if analysis
 * Applies custom assumptions and calculates impact
 *
 * @param {Object} baselineModel - Baseline model
 * @param {Array<Object>} scenarios - Array of what-if scenarios
 * @returns {Object} What-if analysis results
 */
export function performWhatIfAnalysis(baselineModel, scenarios = []) {
  if (!baselineModel) {
    return { error: 'Baseline model required', confidence: 0 };
  }

  try {
    const baselineValue = baselineModel.enterpriseValue || 1;
    const results = [];

    for (const scenario of scenarios) {
      const { name, assumptions: customAssumptions } = scenario;

      // Calculate value with custom assumptions
      let value = baselineValue;
      let adjustments = {};

      for (const [param, customValue] of Object.entries(customAssumptions || {})) {
        const baseValue = baselineModel.assumptions?.[param] || 0;
        const adjustedValue = calculateAdjustedValue(value, param, customValue, baseValue);
        adjustments[param] = {
          base: CalcEngine.round(baseValue, 4),
          custom: CalcEngine.round(customValue, 4),
          impact: CalcEngine.round(CalcEngine.subtract(adjustedValue, value), 0)
        };
        value = adjustedValue;
      }

      results.push({
        scenario: name || 'Unnamed',
        baselineValue: CalcEngine.round(baselineValue, 0),
        whatIfValue: CalcEngine.round(value, 0),
        change: CalcEngine.round(CalcEngine.subtract(value, baselineValue), 0),
        changePercent: CalcEngine.round(
          CalcEngine.divide(
            CalcEngine.subtract(value, baselineValue),
            baselineValue
          ) * 100,
          1
        ) + '%',
        adjustments
      });
    }

    return {
      success: true,
      whatIfResults: results,
      bestCase: results.length > 0 ? results.reduce((a, b) => a.whatIfValue > b.whatIfValue ? a : b) : null,
      worstCase: results.length > 0 ? results.reduce((a, b) => a.whatIfValue < b.whatIfValue ? a : b) : null,
      confidence: 75
    };
  } catch (error) {
    return {
      error: error.message,
      success: false,
      confidence: 0
    };
  }
}

// ============================================================================
// SENSITIVITY REPORT GENERATION
// ============================================================================

/**
 * Generate comprehensive sensitivity analysis report
 * Combines tornado, tables, critical drivers, and what-if analysis
 *
 * @param {Object} sensitivityData - Complete sensitivity analysis data
 * @returns {Object} Formatted sensitivity report
 */
export function generateSensitivityReport(sensitivityData) {
  if (!sensitivityData) {
    return { error: 'Sensitivity data required', confidence: 0 };
  }

  try {
    const {
      tornadoDiagram,
      sensitivityTable,
      criticalDrivers,
      whatIfResults
    } = sensitivityData;

    const report = {
      title: 'Sensitivity Analysis Report',
      generatedDate: new Date().toISOString(),
      sections: [
        {
          title: 'Executive Summary',
          content: generateSensitivitySummary(sensitivityData),
          keyFindings: generateSensitivityFindings(sensitivityData)
        },
        {
          title: 'Tornado Diagram',
          description: 'Ranking of key value drivers by impact',
          data: tornadoDiagram?.tornadoDiagram?.topDrivers || []
        },
        {
          title: 'Critical Value Drivers',
          description: 'Parameters with highest impact on valuation',
          data: criticalDrivers?.criticalDrivers?.topDrivers || []
        },
        {
          title: 'Sensitivity Table',
          description: 'Two-dimensional parameter analysis',
          data: sensitivityTable?.sensitivityTable
        },
        {
          title: 'What-If Scenarios',
          description: 'Custom scenario analysis results',
          data: whatIfResults?.whatIfResults || []
        }
      ],
      recommendations: generateSensitivityRecommendations(sensitivityData)
    };

    return {
      success: true,
      report,
      confidence: 80
    };
  } catch (error) {
    return {
      error: error.message,
      success: false,
      confidence: 0
    };
  }
}

const generateSensitivitySummary = (data) => {
  const tornado = data.tornadoDiagram?.tornadoDiagram;
  const critical = data.criticalDrivers?.criticalDrivers;

  let summary = 'Sensitivity analysis reveals ';

  if (tornado?.highestImpactDriver) {
    summary += `that ${tornado.highestImpactDriver} is the key value driver, `;
    summary += `with a potential impact of ${tornado.highestImpact} on enterprise value. `;
  }

  if (critical?.criticalCount) {
    summary += `${critical.criticalCount} parameters are classified as critical drivers. `;
  }

  summary += 'Management should focus on managing these key drivers to optimize valuation.';

  return summary;
};

const generateSensitivityFindings = (data) => {
  const findings = [];

  if (data.tornadoDiagram?.tornadoDiagram?.topDrivers) {
    findings.push({
      title: 'Top Value Driver',
      value: data.tornadoDiagram.tornadoDiagram.topDrivers[0]?.parameter,
      impact: data.tornadoDiagram.tornadoDiagram.topDrivers[0]?.totalImpact
    });
  }

  if (data.sensitivityTable?.statistics) {
    findings.push({
      title: 'Valuation Range',
      value: `${data.sensitivityTable.statistics.minimum} to ${data.sensitivityTable.statistics.maximum}`,
      span: data.sensitivityTable.statistics.range
    });
  }

  return findings;
};

const generateSensitivityRecommendations = (data) => {
  const recommendations = [];

  const tornado = data.tornadoDiagram?.tornadoDiagram;
  if (tornado?.highestImpactDriver) {
    recommendations.push({
      priority: 'HIGH',
      recommendation: `Focus on ${tornado.highestImpactDriver} management and forecasting accuracy`,
      rationale: 'This parameter has the highest impact on valuation'
    });
  }

  recommendations.push({
    priority: 'MEDIUM',
    recommendation: 'Implement quarterly sensitivity reviews',
    rationale: 'Track how key driver impacts evolve over time'
  });

  return recommendations;
};

export default {
  generateTornadoDiagramData,
  generateSensitivityTable,
  identifyCriticalDrivers,
  calculateBreakEvenPoint,
  performWhatIfAnalysis,
  generateSensitivityReport
};
