/**
 * Scenario Analysis Engine
 *
 * Generates best-case, base-case, and worst-case scenarios for financial models.
 * Enables scenario comparison, probability analysis, and risk/reward assessment.
 *
 * Features:
 * - Generate multiple scenarios with different assumptions
 * - Compare scenarios side-by-side
 * - Calculate probability-weighted outcomes
 * - Analyze risk/reward tradeoffs
 * - Sensitivity to key drivers
 * - Scenario probability estimation
 *
 * Phase 4 Feature: Advanced scenario modeling and what-if analysis
 * Integrates with Phases 1-3 to extend analysis capabilities
 *
 * @module scenarioEngine
 * @version 1.0.0
 */

import * as CalcEngine from '../calculation/calculationEngine';

// ============================================================================
// SCENARIO GENERATION
// ============================================================================

/**
 * Generate best-case scenario
 * Optimistic assumptions: high growth, cost efficiency, market expansion
 *
 * @param {Object} baselineModel - Baseline model data
 * @param {Object} marketAssumptions - Market conditions
 * @returns {Object} Best-case scenario results
 */
export function generateBestCaseScenario(baselineModel, marketAssumptions = {}) {
  if (!baselineModel) {
    return { error: 'Baseline model required', confidence: 0 };
  }

  try {
    const {
      revenueGrowth = 0.12,
      operatingMargin = 0.25,
      capexPercent = 0.05,
      workingCapitalPercent = 0.10,
      discountRate = 0.08
    } = baselineModel.assumptions || {};

    // Optimistic adjustments
    const bestGrowth = CalcEngine.multiply(revenueGrowth, 1.35); // 35% higher growth
    const bestMargin = CalcEngine.multiply(operatingMargin, 1.25); // 25% margin expansion
    const bestCapex = CalcEngine.divide(capexPercent, 1.2); // 20% more efficient
    const bestWC = CalcEngine.divide(workingCapitalPercent, 1.15); // 15% more efficient
    const bestDiscount = CalcEngine.multiply(discountRate, 0.9); // Lower risk

    const scenario = {
      name: 'BEST CASE',
      description: 'Optimistic scenario with strong market conditions, operational excellence, and efficient execution',
      assumptions: {
        revenueGrowth: CalcEngine.round(bestGrowth, 4),
        operatingMargin: CalcEngine.round(bestMargin, 4),
        capexPercent: CalcEngine.round(bestCapex, 4),
        workingCapitalPercent: CalcEngine.round(bestWC, 4),
        discountRate: CalcEngine.round(bestDiscount, 4),
        adjustmentFactors: {
          growth: 1.35,
          margin: 1.25,
          capex: 0.83,
          workingCapital: 0.87,
          discount: 0.90
        }
      },
      drivers: {
        revenue: 'Strong market demand, successful market expansion',
        margin: 'Operational efficiency, scale benefits, pricing power',
        capex: 'Efficient capital deployment, technology optimization',
        workingCapital: 'Improved collections, inventory management',
        risk: 'Lower market and execution risk'
      },
      probability: 0.25,
      confidence: 80
    };

    // Calculate projected values
    if (baselineModel.forecast && Array.isArray(baselineModel.forecast)) {
      scenario.projectedRevenue = baselineModel.forecast.map(val =>CalcEngine.multiply(val, bestGrowth / (revenueGrowth || 0.1))
      );
      scenario.totalRevenue = CalcEngine.arraySum(scenario.projectedRevenue);
    }

    if (baselineModel.enterpriseValue) {
      scenario.enterpriseValue = CalcEngine.multiply(
        baselineModel.enterpriseValue,
        1.5 // Best case typically worth 50% more
      );
    }

    return {
      success: true,
      scenario,
      confidence: scenario.confidence
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
 * Generate base-case scenario
 * Conservative assumptions based on historical performance and market trends
 *
 * @param {Object} baselineModel - Baseline model data
 * @returns {Object} Base-case scenario results
 */
export function generateBaseCaseScenario(baselineModel) {
  if (!baselineModel) {
    return { error: 'Baseline model required', confidence: 0 };
  }

  try {
    const {
      revenueGrowth = 0.12,
      operatingMargin = 0.20,
      capexPercent = 0.06,
      workingCapitalPercent = 0.12,
      discountRate = 0.10
    } = baselineModel.assumptions || {};

    const scenario = {
      name: 'BASE CASE',
      description: 'Most likely scenario based on historical performance, current market conditions, and execution on strategy',
      assumptions: {
        revenueGrowth: CalcEngine.round(revenueGrowth, 4),
        operatingMargin: CalcEngine.round(operatingMargin, 4),
        capexPercent: CalcEngine.round(capexPercent, 4),
        workingCapitalPercent: CalcEngine.round(workingCapitalPercent, 4),
        discountRate: CalcEngine.round(discountRate, 4),
        adjustmentFactors: {
          growth: 1.0,
          margin: 1.0,
          capex: 1.0,
          workingCapital: 1.0,
          discount: 1.0
        }
      },
      drivers: {
        revenue: 'Expected market growth, planned initiatives execution',
        margin: 'Baseline operational efficiency',
        capex: 'Historical capex levels',
        workingCapital: 'Normal working capital cycles',
        risk: 'Normal market and execution risk'
      },
      probability: 0.50,
      confidence: 90
    };

    // Calculate projected values
    if (baselineModel.forecast && Array.isArray(baselineModel.forecast)) {
      scenario.projectedRevenue = baselineModel.forecast;
      scenario.totalRevenue = CalcEngine.arraySum(scenario.projectedRevenue);
    }

    if (baselineModel.enterpriseValue) {
      scenario.enterpriseValue = baselineModel.enterpriseValue;
    }

    return {
      success: true,
      scenario,
      confidence: scenario.confidence
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
 * Generate worst-case scenario
 * Conservative assumptions: market slowdown, operational challenges, competition
 *
 * @param {Object} baselineModel - Baseline model data
 * @returns {Object} Worst-case scenario results
 */
export function generateWorstCaseScenario(baselineModel) {
  if (!baselineModel) {
    return { error: 'Baseline model required', confidence: 0 };
  }

  try {
    const {
      revenueGrowth = 0.12,
      operatingMargin = 0.20,
      capexPercent = 0.06,
      workingCapitalPercent = 0.12,
      discountRate = 0.10
    } = baselineModel.assumptions || {};

    // Conservative adjustments
    const worstGrowth = CalcEngine.multiply(revenueGrowth, 0.65); // 35% lower growth
    const worstMargin = CalcEngine.multiply(operatingMargin, 0.75); // 25% margin compression
    const worstCapex = CalcEngine.multiply(capexPercent, 1.25); // 25% more capex needed
    const worstWC = CalcEngine.multiply(workingCapitalPercent, 1.20); // 20% more WC needed
    const worstDiscount = CalcEngine.multiply(discountRate, 1.25); // Higher risk

    const scenario = {
      name: 'WORST CASE',
      description: 'Conservative scenario with market slowdown, operational challenges, increased competition, and execution risks',
      assumptions: {
        revenueGrowth: CalcEngine.round(worstGrowth, 4),
        operatingMargin: CalcEngine.round(worstMargin, 4),
        capexPercent: CalcEngine.round(worstCapex, 4),
        workingCapitalPercent: CalcEngine.round(worstWC, 4),
        discountRate: CalcEngine.round(worstDiscount, 4),
        adjustmentFactors: {
          growth: 0.65,
          margin: 0.75,
          capex: 1.25,
          workingCapital: 1.20,
          discount: 1.25
        }
      },
      drivers: {
        revenue: 'Market slowdown, competitive pressure, slower adoption',
        margin: 'Pricing pressure, operational inefficiencies, cost inflation',
        capex: 'Higher capex requirements, technology refresh needed',
        workingCapital: 'Slower collections, inventory build, payment delays',
        risk: 'Higher market risk, execution risk, competitive threats'
      },
      probability: 0.25,
      confidence: 75
    };

    // Calculate projected values
    if (baselineModel.forecast && Array.isArray(baselineModel.forecast)) {
      scenario.projectedRevenue = baselineModel.forecast.map(val =>CalcEngine.multiply(val, worstGrowth / (revenueGrowth || 0.1))
      );
      scenario.totalRevenue = CalcEngine.arraySum(scenario.projectedRevenue);
    }

    if (baselineModel.enterpriseValue) {
      scenario.enterpriseValue = CalcEngine.multiply(
        baselineModel.enterpriseValue,
        0.6 // Worst case typically worth 40% less
      );
    }

    return {
      success: true,
      scenario,
      confidence: scenario.confidence
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
// SCENARIO COMPARISON & ANALYSIS
// ============================================================================

/**
 * Compare multiple scenarios
 * Provides side-by-side analysis with key metrics and divergence analysis
 *
 * @param {Object[]} scenarios - Array of scenario results
 * @param {Object} baselineMetrics - Baseline for comparison
 * @returns {Object} Scenario comparison analysis
 */
export function compareScenarios(scenarios = [], baselineMetrics = {}) {
  if (!scenarios || scenarios.length === 0) {
    return { error: 'At least one scenario required', confidence: 0 };
  }

  try {
    const comparison = {
      scenarioCount: scenarios.length,
      scenarios: [],
      divergence: {},
      rangeAnalysis: {},
      keyInsights: []
    };

    // Analyze each scenario
    for (const scen of scenarios) {
      const scenData = scen.scenario || scen;

      comparison.scenarios.push({
        name: scenData.name,
        probability: scenData.probability || 0,
        assumptions: scenData.assumptions,
        enterpriseValue: scenData.enterpriseValue,
        totalRevenue: scenData.totalRevenue,
        vs_baseline: scenData.enterpriseValue && baselineMetrics.enterpriseValue
          ? CalcEngine.round(
              CalcEngine.divide(
                CalcEngine.subtract(scenData.enterpriseValue, baselineMetrics.enterpriseValue),
                baselineMetrics.enterpriseValue
              ) * 100,
              1
            ) + '%'
          : 'N/A'
      });
    }

    // Calculate range analysis
    const values = comparison.scenarios
      .map(s => s.enterpriseValue)
      .filter(v => v !== undefined && v !== null);

    if (values.length > 0) {
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const avgValue = CalcEngine.arraySum(values) / values.length;

      comparison.rangeAnalysis = {
        minimum: CalcEngine.round(minValue, 0),
        maximum: CalcEngine.round(maxValue, 0),
        average: CalcEngine.round(avgValue, 0),
        range: CalcEngine.round(CalcEngine.subtract(maxValue, minValue), 0),
        rangePercent: CalcEngine.round(
          CalcEngine.divide(CalcEngine.subtract(maxValue, minValue), avgValue) * 100,
          1
        )
      };
    }

    // Generate insights
    if (comparison.scenarios.length >= 2) {
      const best = comparison.scenarios.sort((a, b) => b.enterpriseValue - a.enterpriseValue)[0];
      const worst = comparison.scenarios.sort((a, b) => a.enterpriseValue - b.enterpriseValue)[0];

      comparison.keyInsights = [
        {
          insight: `Valuation Range: ${comparison.rangeAnalysis.minimum} to ${comparison.rangeAnalysis.maximum}`,
          type: 'RANGE'
        },
        {
          insight: `Best Case: ${best.name} (${best.vs_baseline})`,
          type: 'UPSIDE'
        },
        {
          insight: `Worst Case: ${worst.name} (${worst.vs_baseline})`,
          type: 'DOWNSIDE'
        },
        {
          insight: `Upside/Downside Asymmetry: ${CalcEngine.round(
            CalcEngine.divide(
              Math.abs(parseFloat(best.vs_baseline)) -
              Math.abs(parseFloat(worst.vs_baseline)),
              Math.abs(parseFloat(worst.vs_baseline)) || 1
            ) * 100,
            1
          )}%`,
          type: 'ASYMMETRY'
        }
      ];
    }

    return {
      success: true,
      comparison,
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
 * Calculate probability-weighted scenario outcome
 * Combines scenarios based on probability to get expected value
 *
 * @param {Object[]} scenarios - Array of scenarios with probabilities
 * @returns {Object} Weighted outcome analysis
 */
export function calculateProbabilityWeightedOutcome(scenarios = []) {
  if (!scenarios || scenarios.length === 0) {
    return { error: 'Scenarios with probabilities required', confidence: 0 };
  }

  try {
    let weightedValue = 0;
    let totalProbability = 0;
    const outcomes = [];

    for (const scen of scenarios) {
      const scenData = scen.scenario || scen;
      const prob = scenData.probability || 0;
      const ev = scenData.enterpriseValue || 0;

      if (prob > 0 && ev > 0) {
        const contribution = CalcEngine.multiply(ev, prob);
        weightedValue = CalcEngine.add(weightedValue, contribution);
        totalProbability = CalcEngine.add(totalProbability, prob);

        outcomes.push({
          scenario: scenData.name,
          probability: CalcEngine.round(prob * 100, 1) + '%',
          value: CalcEngine.round(ev, 0),
          contribution: CalcEngine.round(contribution, 0),
          weight: CalcEngine.round(prob, 4)
        });
      }
    }

    // Normalize if probabilities don't sum to 1
    if (totalProbability > 0 && totalProbability !== 1) {
      weightedValue = CalcEngine.divide(weightedValue, totalProbability);
    }

    return {
      success: true,
      expectedValue: CalcEngine.round(weightedValue, 0),
      outcomes,
      totalProbability: CalcEngine.round(totalProbability, 4),
      confidence: totalProbability === 1 ? 90 : 75
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
 * Analyze upside and downside risk/reward
 * Calculates asymmetry and risk/reward ratios
 *
 * @param {Object[]} scenarios - Array of scenarios
 * @param {number} baselineValue - Baseline/midpoint value
 * @returns {Object} Risk/reward analysis
 */
export function analyzeRiskRewardAsymmetry(scenarios = [], baselineValue = 0) {
  if (!scenarios || scenarios.length === 0) {
    return { error: 'Scenarios required', confidence: 0 };
  }

  try {
    const values = scenarios
      .map(s => s.scenario?.enterpriseValue || s.enterpriseValue)
      .filter(v => v);

    const upsideScenarios = values.filter(v => v > baselineValue);
    const downsideScenarios = values.filter(v => v < baselineValue);

    const upside = upsideScenarios.length > 0
      ? (CalcEngine.arraySum(upsideScenarios) / upsideScenarios.length - baselineValue)
      : 0;

    const downside = downsideScenarios.length > 0
      ? (baselineValue - CalcEngine.arraySum(downsideScenarios) / downsideScenarios.length)
      : 0;

    const riskRewardRatio = downside > 0
      ? CalcEngine.divide(upside, downside)
      : 0;

    const asymmetry = upside + downside > 0
      ? CalcEngine.round(
          CalcEngine.divide(CalcEngine.subtract(upside, downside), CalcEngine.add(upside, downside)) * 100,
          1
        )
      : 0;

    return {
      success: true,
      upside: CalcEngine.round(upside, 0),
      downside: CalcEngine.round(downside, 0),
      riskRewardRatio: CalcEngine.round(riskRewardRatio, 2),
      asymmetry: asymmetry,
      assessment: riskRewardRatio > 1.5
        ? 'Favorable (More upside than downside)'
        : riskRewardRatio > 1.0
        ? 'Balanced'
        : 'Unfavorable (More downside than upside)',
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
// CUSTOM SCENARIO GENERATION
// ============================================================================

/**
 * Generate custom scenario with specified assumptions
 * Allows user-defined parameter overrides
 *
 * @param {Object} baselineModel - Baseline model
 * @param {Object} customAssumptions - Custom parameter overrides
 * @param {string} name - Scenario name
 * @returns {Object} Custom scenario
 */
export function generateCustomScenario(baselineModel, customAssumptions = {}, name = 'CUSTOM') {
  if (!baselineModel) {
    return { error: 'Baseline model required', confidence: 0 };
  }

  try {
    const baseAssumptions = baselineModel.assumptions || {};

    const scenario = {
      name,
      description: `Custom scenario with user-defined assumptions`,
      assumptions: {
        revenueGrowth: customAssumptions.revenueGrowth !== undefined
          ? customAssumptions.revenueGrowth
          : baseAssumptions.revenueGrowth || 0.12,
        operatingMargin: customAssumptions.operatingMargin !== undefined
          ? customAssumptions.operatingMargin
          : baseAssumptions.operatingMargin || 0.20,
        capexPercent: customAssumptions.capexPercent !== undefined
          ? customAssumptions.capexPercent
          : baseAssumptions.capexPercent || 0.06,
        workingCapitalPercent: customAssumptions.workingCapitalPercent !== undefined
          ? customAssumptions.workingCapitalPercent
          : baseAssumptions.workingCapitalPercent || 0.12,
        discountRate: customAssumptions.discountRate !== undefined
          ? customAssumptions.discountRate
          : baseAssumptions.discountRate || 0.10,
        customParameters: customAssumptions
      },
      probability: customAssumptions.probability || 0.25,
      confidence: 70,
      isCustom: true
    };

    // Calculate projected values
    if (baselineModel.forecast && Array.isArray(baselineModel.forecast)) {
      const growthMultiplier = scenario.assumptions.revenueGrowth / (baseAssumptions.revenueGrowth || 0.1);
      scenario.projectedRevenue = baselineModel.forecast.map(val =>CalcEngine.multiply(val, growthMultiplier)
      );
      scenario.totalRevenue = CalcEngine.arraySum(scenario.projectedRevenue);
    }

    if (baselineModel.enterpriseValue) {
      const marginAdjustment = scenario.assumptions.operatingMargin / (baseAssumptions.operatingMargin || 0.2);
      scenario.enterpriseValue = CalcEngine.multiply(
        baselineModel.enterpriseValue,
        marginAdjustment
      );
    }

    return {
      success: true,
      scenario,
      confidence: scenario.confidence
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
// SCENARIO STRESS TESTING
// ============================================================================

/**
 * Stress test a scenario by varying key parameters
 * Shows resilience to assumption changes
 *
 * @param {Object} scenario - Base scenario
 * @param {Object} stressParameters - Parameters to stress test
 * @returns {Object} Stress test results
 */
export function stressTestScenario(scenario, stressParameters = {}) {
  if (!scenario) {
    return { error: 'Scenario required', confidence: 0 };
  }

  try {
    const {
      growthShock = -0.25, // -25% shock
      marginShock = -0.20, // -20% shock
      capexShock = 0.30,    // +30% shock
      discountShock = 0.15   // +150 bps shock
    } = stressParameters;

    const baseAssumptions = scenario.assumptions || {};

    const stressedScenario = {
      name: scenario.name + ' (STRESSED)',
      description: `Stress-tested version of ${scenario.name}`,
      baseCase: baseAssumptions,
      stressedAssumptions: {
        revenueGrowth: CalcEngine.multiply(
          baseAssumptions.revenueGrowth || 0.12,
          CalcEngine.add(1, growthShock)
        ),
        operatingMargin: CalcEngine.multiply(
          baseAssumptions.operatingMargin || 0.20,
          CalcEngine.add(1, marginShock)
        ),
        capexPercent: CalcEngine.multiply(
          baseAssumptions.capexPercent || 0.06,
          CalcEngine.add(1, capexShock)
        ),
        discountRate: CalcEngine.add(
          baseAssumptions.discountRate || 0.10,
          discountShock / 100
        )
      },
      shocks: {
        growthShock: CalcEngine.round(growthShock * 100, 1),
        marginShock: CalcEngine.round(marginShock * 100, 1),
        capexShock: CalcEngine.round(capexShock * 100, 1),
        discountShock: CalcEngine.round(discountShock, 2) + ' bps'
      }
    };

    // Calculate impact on value
    if (scenario.enterpriseValue) {
      const marginImpact = marginShock; // Direct margin impact
      const growthImpact = growthShock * 0.5; // Growth affects value less directly
      const discountImpact = discountShock / 100 * -1; // Higher discount = lower value

      const totalImpact = CalcEngine.add(
        CalcEngine.add(marginImpact, growthImpact),
        discountImpact
      );

      stressedScenario.enterpriseValue = CalcEngine.multiply(
        scenario.enterpriseValue,
        CalcEngine.add(1, totalImpact)
      );

      stressedScenario.valueChange = {
        baseCase: scenario.enterpriseValue,
        stressed: stressedScenario.enterpriseValue,
        change: CalcEngine.round(
          CalcEngine.subtract(stressedScenario.enterpriseValue, scenario.enterpriseValue),
          0
        ),
        changePercent: CalcEngine.round(
          CalcEngine.divide(
            CalcEngine.subtract(stressedScenario.enterpriseValue, scenario.enterpriseValue),
            scenario.enterpriseValue
          ) * 100,
          1
        )
      };
    }

    return {
      success: true,
      stressedScenario,
      resilience: Math.abs(parseFloat(stressedScenario.valueChange?.changePercent) || 0) < 30
        ? 'HIGH'
        : Math.abs(parseFloat(stressedScenario.valueChange?.changePercent) || 0) < 50
        ? 'MODERATE'
        : 'LOW',
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
// SCENARIO SUMMARY & REPORTING
// ============================================================================

/**
 * Generate comprehensive scenario analysis report
 * Combines all scenario analyses into single report
 *
 * @param {Object} scenarioAnalysis - Complete scenario analysis data
 * @returns {Object} Formatted report
 */
export function generateScenarioReport(scenarioAnalysis) {
  if (!scenarioAnalysis) {
    return { error: 'Scenario analysis data required', confidence: 0 };
  }

  try {
    const {
      bestCase,
      baseCase,
      worstCase,
      comparison,
      probabilityWeighted,
      riskReward
    } = scenarioAnalysis;

    const report = {
      title: 'Scenario Analysis Report',
      generatedDate: new Date().toISOString(),
      sections: [
        {
          title: 'Executive Summary',
          content: generateScenarioSummary(scenarioAnalysis),
          insights: generateScenarioInsights(scenarioAnalysis)
        },
        {
          title: 'Scenario Descriptions',
          scenarios: [
            { ...bestCase?.scenario, type: 'UPSIDE' },
            { ...baseCase?.scenario, type: 'BASE' },
            { ...worstCase?.scenario, type: 'DOWNSIDE' }
          ].filter(s => s)
        },
        {
          title: 'Scenario Comparison',
          data: comparison?.comparison
        },
        {
          title: 'Probability-Weighted Analysis',
          data: probabilityWeighted
        },
        {
          title: 'Risk/Reward Assessment',
          data: riskReward
        }
      ],
      recommendation: generateScenarioRecommendation(scenarioAnalysis)
    };

    return {
      success: true,
      report,
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

const generateScenarioSummary = (analysis) => {
  const base = analysis.baseCase?.scenario;
  const best = analysis.bestCase?.scenario;
  const worst = analysis.worstCase?.scenario;

  return `Analysis of three scenarios provides a comprehensive view of potential outcomes. ` +
         `Base case projects ${base?.totalRevenue || 'X'} in total revenue with ` +
         `${(base?.assumptions?.operatingMargin * 100 || 'X')}% operating margin. ` +
         `Best case shows upside potential of ${CalcEngine.round((best?.enterpriseValue / base?.enterpriseValue - 1) * 100 || 0, 0)}%, ` +
         `while worst case indicates downside of ${CalcEngine.round((1 - worst?.enterpriseValue / base?.enterpriseValue) * 100 || 0, 0)}%.`;
};

const generateScenarioInsights = (analysis) => {
  const insights = [];

  if (analysis.probabilityWeighted?.expectedValue) {
    insights.push({
      title: 'Expected Value',
      value: analysis.probabilityWeighted.expectedValue,
      description: 'Probability-weighted outcome considering all scenarios'
    });
  }

  if (analysis.riskReward?.asymmetry) {
    insights.push({
      title: 'Asymmetry',
      value: analysis.riskReward.asymmetry + '%',
      description: analysis.riskReward.assessment
    });
  }

  return insights;
};

const generateScenarioRecommendation = (analysis) => {
  const riskReward = analysis.riskReward || {};

  if (riskReward.riskRewardRatio > 1.5) {
    return 'Favorable risk/reward profile supports strategic investment';
  } else if (riskReward.riskRewardRatio > 1.0) {
    return 'Balanced risk/reward profile suggests balanced approach';
  } else {
    return 'Unfavorable risk/reward profile suggests caution or additional risk mitigation';
  }
};

export default {
  generateBestCaseScenario,
  generateBaseCaseScenario,
  generateWorstCaseScenario,
  compareScenarios,
  calculateProbabilityWeightedOutcome,
  analyzeRiskRewardAsymmetry,
  generateCustomScenario,
  stressTestScenario,
  generateScenarioReport
};
