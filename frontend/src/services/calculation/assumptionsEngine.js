/**
 * Assumptions Engine
 * 
 * Manages default assumptions by country, model type, and scenario.
 * Allows user overrides, tracks assumption changes, generates assumption reports.
 * 
 * ALL CALCULATIONS USE calculationEngine - NEVER do math directly
 * ALL VALIDATIONS USE validationService
 * ALL ASSUMPTION CHANGES AUDITED for transparency
 * 
 * Phase 2 Foundation: Assumption management pipeline
 * Phase 3 Dependencies: AI uses assumptions in interpretation
 * Phase 5 Dependencies: Reports show all assumptions used
 * 
 * Strict Rule: Every assumption must be documented with source and confidence level
 */

import * as CalcEngine from './calculationEngine';
import * as ValidationService from './validationService';
import * as TaxLibrary from './countryTaxLibrary';

/**
 * Default Assumptions by Model Type
 * Baseline assumptions if user doesn't specify
 * 
 * @typedef {Object} AssumptionSet
 * @property {string} name - Descriptive name
 * @property {string} source - 'SYSTEM', 'USER', 'MARKET_DATA'
 * @property {number} confidenceLevel - 0-100 (how confident in assumption)
 * @property {Object} values - Actual assumption values
 */

const DEFAULT_ASSUMPTIONS = {
  forecasting: {
    forecastPeriods: {
      value: 5,
      source: 'SYSTEM',
      confidenceLevel: 80,
      description: 'Standard 5-year forecast period'
    },
    initialGrowthRate: {
      value: 10,
      source: 'SYSTEM',
      confidenceLevel: 60,
      description: 'Conservative 10% initial growth rate'
    },
    growthRateDecay: {
      value: 2,
      source: 'SYSTEM',
      confidenceLevel: 70,
      description: 'Growth rate decreases 2% per year (mean reversion)'
    },
    volatilityFactor: {
      value: 1.0,
      source: 'SYSTEM',
      confidenceLevel: 50,
      description: 'Standard volatility baseline'
    },
    inflationAssumption: {
      value: 3,
      source: 'SYSTEM',
      confidenceLevel: 60,
      description: 'Global average inflation assumption'
    }
  },

  valuation: {
    discountRate: {
      value: 10,
      source: 'SYSTEM',
      confidenceLevel: 70,
      description: 'Weighted average cost of capital (WACC) baseline'
    },
    terminalGrowthRate: {
      value: 2.5,
      source: 'SYSTEM',
      confidenceLevel: 75,
      description: 'Long-term sustainable growth rate (near GDP growth)'
    },
    riskPremium: {
      value: 5,
      source: 'SYSTEM',
      confidenceLevel: 65,
      description: 'Market risk premium for equity'
    },
    taxRate: {
      value: 25,
      source: 'SYSTEM',
      confidenceLevel: 70,
      description: 'Standard effective tax rate for valuation'
    },
    workingCapitalPercent: {
      value: 10,
      source: 'SYSTEM',
      confidenceLevel: 60,
      description: 'Working capital as % of revenue'
    }
  },

  risk: {
    riskMultiplier: {
      value: 1.0,
      source: 'SYSTEM',
      confidenceLevel: 70,
      description: 'Standard risk multiplier baseline'
    },
    concentrationThreshold: {
      value: 80,
      source: 'SYSTEM',
      confidenceLevel: 75,
      description: 'Percentage above which concentration is considered high risk'
    },
    heightenedRiskThreshold: {
      value: 60,
      source: 'SYSTEM',
      confidenceLevel: 70,
      description: 'Percentage above which risk increases'
    },
    minDiversification: {
      value: 5,
      source: 'SYSTEM',
      confidenceLevel: 65,
      description: 'Minimum number of entities for adequate diversification'
    },
    volatilityMultiplier: {
      value: 1.5,
      source: 'SYSTEM',
      confidenceLevel: 60,
      description: 'How much to increase volatility for high-risk jurisdictions'
    }
  },

  scenario: {
    baselineAdjustment: {
      value: 0,
      source: 'SYSTEM',
      confidenceLevel: 100,
      description: 'Baseline scenario (no adjustment)'
    },
    optimisticAdjustment: {
      value: 20,
      source: 'SYSTEM',
      confidenceLevel: 70,
      description: 'Optimistic scenario (+20% better than baseline)'
    },
    pessimisticAdjustment: {
      value: -30,
      source: 'SYSTEM',
      confidenceLevel: 70,
      description: 'Pessimistic scenario (-30% worse than baseline)'
    },
    conservativeAdjustment: {
      value: -15,
      source: 'SYSTEM',
      confidenceLevel: 75,
      description: 'Conservative scenario (-15% adjustment)'
    }
  },

  consolidation: {
    eliminations: {
      value: true,
      source: 'SYSTEM',
      confidenceLevel: 95,
      description: 'Always eliminate intercompany transactions'
    },
    minorityInterestMethod: {
      value: 'full_goodwill',
      source: 'SYSTEM',
      confidenceLevel: 85,
      description: 'Use full goodwill method for non-controlling interests'
    },
    exchangeRateMethod: {
      value: 'current_rate',
      source: 'SYSTEM',
      confidenceLevel: 90,
      description: 'Current rate method for currency conversion'
    },
    consolidationThreshold: {
      value: 20,
      source: 'SYSTEM',
      confidenceLevel: 80,
      description: 'Minimum ownership % to consolidate'
    }
  },

  personal_finance: {
    retirementYears: {
      value: 30,
      source: 'SYSTEM',
      confidenceLevel: 70,
      description: 'Standard retirement horizon'
    },
    investmentReturn: {
      value: 8,
      source: 'SYSTEM',
      confidenceLevel: 65,
      description: 'Expected long-term investment return'
    },
    inflationAssumption: {
      value: 3,
      source: 'SYSTEM',
      confidenceLevel: 70,
      description: 'Long-term inflation expectation'
    },
    lifeExpectancy: {
      value: 85,
      source: 'SYSTEM',
      confidenceLevel: 75,
      description: 'Planning life expectancy'
    },
    emergencyFundMonths: {
      value: 6,
      source: 'SYSTEM',
      confidenceLevel: 80,
      description: 'Months of expenses recommended in emergency fund'
    }
  }
};

/**
 * Country-specific assumption overrides
 * Adjusts default assumptions based on country economic conditions
 */
const COUNTRY_ASSUMPTION_OVERRIDES = {
  NG: {
    // Nigeria - higher risk
    discountRate: { value: 15, source: 'COUNTRY', description: 'Higher WACC due to country risk' },
    volatilityFactor: { value: 1.5, source: 'COUNTRY', description: 'Higher volatility in NG' },
    inflationAssumption: { value: 12, source: 'COUNTRY', description: 'Higher inflation in NG' }
  },
  KE: {
    // Kenya - moderate adjustments
    discountRate: { value: 12, source: 'COUNTRY', description: 'Moderate country risk premium' },
    volatilityFactor: { value: 1.2, source: 'COUNTRY', description: 'Moderate volatility' }
  },
  ZA: {
    // South Africa - developed market
    discountRate: { value: 10, source: 'COUNTRY', description: 'Developed market rates' },
    volatilityFactor: { value: 1.0, source: 'COUNTRY', description: 'Standard volatility' }
  },
  US: {
    // US - baseline developed market
    discountRate: { value: 9, source: 'COUNTRY', description: 'Low country risk' },
    volatilityFactor: { value: 0.9, source: 'COUNTRY', description: 'Lower volatility' }
  },
  GB: {
    // UK - developed market
    discountRate: { value: 8, source: 'COUNTRY', description: 'Developed market baseline' },
    volatilityFactor: { value: 0.9, source: 'COUNTRY', description: 'Lower volatility' }
  }
};

/**
 * Get default assumptions for a model type and country
 * Combines system defaults with country overrides
 * 
 * @param {string} modelType - Type of model
 * @param {string} country - Country code
 * @returns {Object|null} Combined assumptions or null if invalid
 * 
 * @example
 * const assumptions = getDefaultAssumptions('valuation', 'NG');
 * // Returns: { discountRate: 15, terminalGrowthRate: 2.5, ... }
 */
export function getDefaultAssumptions(modelType, country) {
  if (!ValidationService.isValidString(modelType)) {
    console.error('getDefaultAssumptions: Valid model type required');
    return null;
  }

  if (!DEFAULT_ASSUMPTIONS[modelType]) {
    console.error(`getDefaultAssumptions: Unknown model type: ${modelType}`);
    return null;
  }

  // Start with model-type defaults
  const combined = { ...DEFAULT_ASSUMPTIONS[modelType] };

  // Apply country overrides if country provided
  if (country && COUNTRY_ASSUMPTION_OVERRIDES[country]) {
    const countryOverrides = COUNTRY_ASSUMPTION_OVERRIDES[country];
    for (const [key, override] of Object.entries(countryOverrides)) {
      if (combined[key]) {
        combined[key] = { ...combined[key], ...override };
      }
    }
  }

  // Flatten to just values for easier use
  const flattened = {};
  for (const [key, assumption] of Object.entries(combined)) {
    flattened[key] = assumption.value;
  }

  return flattened;
}

/**
 * Get all assumption metadata (sources, confidence, descriptions)
 * Includes default assumptions with full details
 * 
 * @param {string} modelType - Type of model
 * @param {string} country - Country code
 * @returns {Object} Complete assumption metadata
 */
export function getAssumptionMetadata(modelType, country) {
  if (!DEFAULT_ASSUMPTIONS[modelType]) {
    return null;
  }

  const combined = { ...DEFAULT_ASSUMPTIONS[modelType] };

  if (country && COUNTRY_ASSUMPTION_OVERRIDES[country]) {
    const countryOverrides = COUNTRY_ASSUMPTION_OVERRIDES[country];
    for (const [key, override] of Object.entries(countryOverrides)) {
      if (combined[key]) {
        combined[key] = { ...combined[key], ...override };
      }
    }
  }

  return combined;
}

/**
 * Create custom assumption set
 * For scenarios or user-specific overrides
 * 
 * @param {string} name - Descriptive name
 * @param {string} modelType - Base model type
 * @param {Object} overrides - Overridden assumptions
 * @returns {Object} Custom assumption set
 * 
 * @example
 * const custom = createCustomAssumptions('Aggressive Growth', 'forecasting', {
 *   initialGrowthRate: 20,
 *   volatilityFactor: 1.5
 * });
 */
export function createCustomAssumptions(name, modelType, overrides) {
  if (!ValidationService.isValidString(name) ||
      !ValidationService.isValidString(modelType)) {
    console.error('createCustomAssumptions: Valid name and model type required');
    return null;
  }

  if (!DEFAULT_ASSUMPTIONS[modelType]) {
    console.error(`createCustomAssumptions: Unknown model type: ${modelType}`);
    return null;
  }

  const custom = {
    name,
    modelType,
    createdAt: new Date().toISOString(),
    source: 'USER',
    confidenceLevel: 50, // User assumptions less confident than system
    baseAssumptions: { ...DEFAULT_ASSUMPTIONS[modelType] },
    overrides: {}
  };

  // Apply user overrides
  if (overrides && typeof overrides === 'object') {
    for (const [key, value] of Object.entries(overrides)) {
      if (DEFAULT_ASSUMPTIONS[modelType][key]) {
        custom.overrides[key] = {
          originalValue: DEFAULT_ASSUMPTIONS[modelType][key].value,
          newValue: value,
          changeReason: 'User override'
        };
      }
    }
  }

  return custom;
}

/**
 * Validate assumption values
 * Checks if assumptions are within reasonable ranges
 * 
 * @param {Object} assumptions - Assumptions to validate
 * @param {string} modelType - Model type for context
 * @returns {Object} Validation result
 * 
 * @example
 * const valid = validateAssumptions({
 *   discountRate: 15,
 *   terminalGrowthRate: 3
 * }, 'valuation');
 */
export function validateAssumptions(assumptions, modelType) {
  if (!assumptions || !ValidationService.isValidString(modelType)) {
    console.error('validateAssumptions: Valid assumptions and model type required');
    return { valid: false, errors: ['Invalid inputs'] };
  }

  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Validate by assumption type
  for (const [key, value] of Object.entries(assumptions)) {
    // Common validations
    if (key.includes('Rate') || key.includes('Return')) {
      // Rates should be -100 to +500
      if (!ValidationService.isValidNumber(value) || value < -100 || value > 500) {
        result.errors.push(`${key}: ${value} is outside reasonable range (-100 to +500)`);
      }
    }

    if (key.includes('Percentage') || key.includes('Ratio')) {
      // Percentages should be 0-100
      if (!ValidationService.isValidNumber(value) || value < 0 || value > 100) {
        result.errors.push(`${key}: ${value}% is outside 0-100% range`);
      }
    }

    // Model-specific validations
    if (modelType === 'valuation') {
      if (key === 'discountRate' && value < 0) {
        result.errors.push('Discount rate cannot be negative');
      }
      if (key === 'terminalGrowthRate' && value > 10) {
        result.warnings.push('Terminal growth rate > 10% is unusually high');
      }
    }

    if (modelType === 'forecasting') {
      if (key === 'forecastPeriods' && (value < 1 || value > 20)) {
        result.warnings.push('Forecast periods should typically be 1-20 years');
      }
    }
  }

  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Compare assumption sets
 * Shows differences between baseline and alternative assumptions
 * 
 * @param {Object} baselineAssumptions - Baseline for comparison
 * @param {Object} alternativeAssumptions - Alternative to compare
 * @returns {Object} Comparison results
 * 
 * @example
 * const comparison = compareAssumptions(
 *   { discountRate: 10, growthRate: 5 },
 *   { discountRate: 12, growthRate: 6 }
 * );
 */
export function compareAssumptions(baselineAssumptions, alternativeAssumptions) {
  if (!baselineAssumptions || !alternativeAssumptions) {
    console.error('compareAssumptions: Both assumption sets required');
    return null;
  }

  const comparison = {
    timestamp: new Date().toISOString(),
    baselineLabel: 'Baseline',
    alternativeLabel: 'Alternative',
    differences: {},
    summary: {
      totalAssumptions: 0,
      matching: 0,
      different: 0
    }
  };

  const allKeys = new Set([
    ...Object.keys(baselineAssumptions),
    ...Object.keys(alternativeAssumptions)
  ]);

  for (const key of allKeys) {
    comparison.summary.totalAssumptions++;
    const baseline = baselineAssumptions[key];
    const alternative = alternativeAssumptions[key];

    if (baseline === alternative) {
      comparison.summary.matching++;
    } else {
      comparison.summary.different++;
      const change = ValidationService.isValidNumber(baseline) && ValidationService.isValidNumber(alternative)
        ? CalcEngine.subtract(alternative, baseline)
        : 'N/A';

      const changePercent = ValidationService.isValidNumber(baseline) && ValidationService.isValidNumber(alternative) && baseline !== 0
        ? CalcEngine.round(CalcEngine.divide(CalcEngine.multiply(change, 100), baseline), 2)
        : 'N/A';

      comparison.differences[key] = {
        baseline,
        alternative,
        absoluteChange: change,
        percentChange: changePercent
      };
    }
  }

  return comparison;
}

/**
 * Apply assumption changes and track impact
 * Shows how changing an assumption affects model outputs
 * 
 * @param {Object} baselineResults - Results with baseline assumptions
 * @param {Object} newAssumptions - New assumptions to apply
 * @param {Function} recalculateFunction - Function to recalculate with new assumptions
 * @returns {Object} Sensitivity analysis results
 */
export function analyzeAssumptionImpact(baselineResults, newAssumptions, recalculateFunction) {
  if (!baselineResults || !newAssumptions || typeof recalculateFunction !== 'function') {
    console.error('analyzeAssumptionImpact: All parameters required');
    return null;
  }

  const impact = {
    timestamp: new Date().toISOString(),
    baselineResults,
    newResults: recalculateFunction(newAssumptions),
    impactAnalysis: {}
  };

  // Compare key outputs if they exist
  for (const [key, value] of Object.entries(baselineResults)) {
    if (ValidationService.isValidNumber(value) && ValidationService.isValidNumber(impact.newResults[key])) {
      const change = CalcEngine.subtract(impact.newResults[key], value);
      const changePercent = value !== 0 
        ? CalcEngine.round(CalcEngine.divide(CalcEngine.multiply(change, 100), value), 2)
        : 0;

      impact.impactAnalysis[key] = {
        baseline: value,
        new: impact.newResults[key],
        absoluteChange: CalcEngine.round(change, 2),
        percentChange: changePercent
      };
    }
  }

  return impact;
}

/**
 * Generate assumptions report
 * Documents all assumptions used in analysis with sources and confidence
 * 
 * @param {Object} assumptions - Assumptions used
 * @param {Object} metadata - Metadata about assumptions
 * @param {string} modelType - Type of model
 * @returns {string} Formatted report
 * 
 * @example
 * const report = generateAssumptionsReport(assumptions, metadata, 'valuation');
 */
export function generateAssumptionsReport(assumptions, metadata, modelType) {
  if (!assumptions) {
    return 'No assumptions provided';
  }

  let report = '=== ASSUMPTIONS REPORT ===\n\n';
  report += `Model Type: ${modelType || 'Unknown'}\n`;
  report += `Report Date: ${new Date().toISOString()}\n\n`;

  report += '--- ASSUMPTIONS ---\n';
  for (const [key, value] of Object.entries(assumptions)) {
    const meta = metadata && metadata[key];
    report += `\n${key}: ${value}`;
    
    if (meta) {
      report += `\n  Source: ${meta.source}`;
      report += `\n  Confidence: ${meta.confidenceLevel}%`;
      if (meta.description) {
        report += `\n  Description: ${meta.description}`;
      }
    }
    report += '\n';
  }

  // Summary statistics
  if (metadata) {
    const sources = new Set(Object.values(metadata).map(m => m.source));
    const avgConfidence = Math.round(
      Object.values(metadata).reduce((sum, m) => sum + (m.confidenceLevel || 0), 0) / 
      Object.keys(metadata).length
    );

    report += '\n--- SUMMARY ---\n';
    report += `Total Assumptions: ${Object.keys(assumptions).length}\n`;
    report += `Assumption Sources: ${Array.from(sources).join(', ')}\n`;
    report += `Average Confidence Level: ${avgConfidence}%\n`;
  }

  return report;
}

export default {
  getDefaultAssumptions,
  getAssumptionMetadata,
  createCustomAssumptions,
  validateAssumptions,
  compareAssumptions,
  analyzeAssumptionImpact,
  generateAssumptionsReport,
  DEFAULT_ASSUMPTIONS,
  COUNTRY_ASSUMPTION_OVERRIDES
};
