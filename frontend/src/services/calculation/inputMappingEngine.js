/**
 * Input Mapping Engine
 *
 * Maps user inputs from UI forms to standardized model variables.
 * Transforms data formats, applies defaults, handles missing values,
 * and validates input quality before passing to calculation engine.
 *
 * ALL CALCULATIONS USE calculationEngine - NEVER do math directly
 * ALL VALIDATIONS USE validationService
 * ALL DATA TRANSFORMATION logged for audit trail
 *
 * Phase 2 Foundation: Input data pipeline
 * Phase 3 Dependencies: AI interpretation receives mapped inputs
 * Phase 5 Dependencies: Reports show input lineage
 *
 * Strict Rule: Every user input must be traced, validated, and logged
 */

import * as CalcEngine from './calculationEngine';
import * as ValidationService from './validationService';
import * as TaxLibrary from './countryTaxLibrary';
import * as ModelTemplates from './modelTemplates';

/**
 * Input Mapping Configuration
 * Defines how to transform user input to model input
 *
 * @typedef {Object} InputMapping
 * @property {string} fieldName - Name in model
 * @property {string} userInputName - Name in form data
 * @property {string} dataType - 'number', 'string', 'date', 'boolean'
 * @property {*} defaultValue - Value if user doesn't provide
 * @property {Function} transformer - Optional transformation function
 * @property {Object} constraints - Validation constraints
 */

/**
 * Map user form inputs to standardized model inputs
 * Transforms raw form data into validated, typed model variables
 *
 * @param {Object} rawUserInput - Raw data from UI form
 * @param {string} modelType - Type of model ('forecasting', 'valuation', etc.)
 * @param {Object} mappingConfig - Configuration for field mappings
 * @returns {Object|null} Mapped and validated inputs, or null if invalid
 *
 * @example
 * const mapped = mapUserInputToModel(
 *   { companyName: 'Atonix', revenue: '1000000' },
 *   'forecasting',
 *   mappingConfig
 * );
 */
export function mapUserInputToModel(rawUserInput, modelType, mappingConfig) {
  if (!rawUserInput || typeof rawUserInput !== 'object') {
    console.error('mapUserInputToModel: Raw user input object required');
    return null;
  }

  if (!ValidationService.isValidString(modelType)) {
    console.error('mapUserInputToModel: Valid model type required');
    return null;
  }

  // Get model template to understand expected inputs
  const template = ModelTemplates.getModelTemplate(modelType);
  if (!template) {
    console.error(`mapUserInputToModel: Unknown model type: ${modelType}`);
    return null;
  }

  const mappedData = {
    modelType,
    mappingTimestamp: new Date().toISOString(),
    mappedFields: {},
    warnings: [],
    errors: [],
    dataQualityScore: 100
  };

  // Process each expected input from template
  for (const inputSpec of template.inputs) {
    const fieldName = inputSpec.name;
    const rawValue = rawUserInput[fieldName];

    // Map and transform the value
    const mappedValue = transformInputValue(
      rawValue,
      fieldName,
      inputSpec,
      mappedData
    );

    if (mappedValue !== null && mappedValue !== undefined) {
      mappedData.mappedFields[fieldName] = mappedValue;
    }
  }

  // Calculate overall data quality score
  mappedData.dataQualityScore = calculateMappingQualityScore(mappedData);

  return mappedData;
}

/**
 * Transform a single input value according to spec
 * Handles type conversion, default values, range validation
 *
 * @param {*} rawValue - Raw value from user
 * @param {string} fieldName - Field name for logging
 * @param {Object} inputSpec - Input specification from template
 * @param {Object} mappingResult - Container for warnings/errors
 * @returns {*} Transformed value
 */
function transformInputValue(rawValue, fieldName, inputSpec, mappingResult) {
  // Handle missing value - use default
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    if (inputSpec.required && !inputSpec.default) {
      mappingResult.errors.push(`Required field missing: ${fieldName}`);
      mappingResult.dataQualityScore = CalcEngine.subtract(mappingResult.dataQualityScore, 10);
      return null;
    }

    if (inputSpec.default !== undefined) {
      mappingResult.warnings.push(`Using default for ${fieldName}: ${inputSpec.default}`);
      mappingResult.dataQualityScore = CalcEngine.subtract(mappingResult.dataQualityScore, 5);
      return inputSpec.default;
    }

    return null;
  }

  // Transform based on expected type
  let transformedValue = rawValue;

  switch (inputSpec.type) {
    case 'number':
      transformedValue = parseFloat(rawValue);
      if (isNaN(transformedValue)) {
        mappingResult.errors.push(`Invalid number for ${fieldName}: ${rawValue}`);
        mappingResult.dataQualityScore = CalcEngine.subtract(mappingResult.dataQualityScore, 15);
        return null;
      }
      break;

    case 'integer':
      transformedValue = parseInt(rawValue, 10);
      if (isNaN(transformedValue)) {
        mappingResult.errors.push(`Invalid integer for ${fieldName}: ${rawValue}`);
        mappingResult.dataQualityScore = CalcEngine.subtract(mappingResult.dataQualityScore, 15);
        return null;
      }
      break;

    case 'date':
      transformedValue = new Date(rawValue).toISOString().split('T')[0];
      if (transformedValue === 'Invalid Date') {
        mappingResult.errors.push(`Invalid date for ${fieldName}: ${rawValue}`);
        mappingResult.dataQualityScore = CalcEngine.subtract(mappingResult.dataQualityScore, 15);
        return null;
      }
      break;

    case 'string':
      transformedValue = String(rawValue).trim();
      break;

    case 'boolean':
      transformedValue = rawValue === true || rawValue === 'true' || rawValue === 1;
      break;
  }

  // Validate constraints
  if (inputSpec.constraints) {
    const constraintResult = validateInputConstraints(transformedValue, inputSpec.constraints);
    if (!constraintResult.valid) {
      mappingResult.warnings.push(`${fieldName} constraint warning: ${constraintResult.message}`);
      mappingResult.dataQualityScore = CalcEngine.subtract(mappingResult.dataQualityScore, 3);
    }
  }

  return transformedValue;
}

/**
 * Validate input against constraints (min, max, pattern, etc.)
 *
 * @param {*} value - Value to validate
 * @param {Object} constraints - Constraint specifications
 * @returns {Object} Validation result
 */
function validateInputConstraints(value, constraints) {
  if (!constraints) {
    return { valid: true };
  }

  // Check minimum value
  if (constraints.min !== undefined && value < constraints.min) {
    return {
      valid: false,
      message: `Value ${value} below minimum ${constraints.min}`
    };
  }

  // Check maximum value
  if (constraints.max !== undefined && value > constraints.max) {
    return {
      valid: false,
      message: `Value ${value} exceeds maximum ${constraints.max}`
    };
  }

  // Check pattern (regex)
  if (constraints.pattern && !constraints.pattern.test(String(value))) {
    return {
      valid: false,
      message: `Value ${value} does not match required pattern`
    };
  }

  // Check allowed values
  if (constraints.allowedValues && !constraints.allowedValues.includes(value)) {
    return {
      valid: false,
      message: `Value ${value} not in allowed values: ${constraints.allowedValues.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Apply default assumptions based on model type and country
 * Fills in assumed values for missing/unspecified inputs
 *
 * @param {Object} mappedInputs - Currently mapped inputs
 * @param {string} modelType - Type of model
 * @param {string} country - Country code for country-specific assumptions
 * @returns {Object} Inputs with assumptions applied
 *
 * @example
 * const withAssumptions = applyDefaultAssumptions(
 *   mappedInputs,
 *   'forecasting',
 *   'NG'
 * );
 */
export function applyDefaultAssumptions(mappedInputs, modelType, country) {
  if (!mappedInputs || !ValidationService.isValidString(modelType)) {
    console.error('applyDefaultAssumptions: Valid inputs and model type required');
    return null;
  }

  const assumptions = {
    source: 'default',
    modelType,
    country,
    appliedAt: new Date().toISOString(),
    assumedFields: {}
  };

  // Country-specific economic assumptions
  const countryAssumptions = getCountryAssumptions(country);

  // Model-type specific defaults
  const modelAssumptions = getModelTypeAssumptions(modelType);

  // Merge all assumptions
  const allAssumptions = { ...countryAssumptions, ...modelAssumptions };

  // Apply to mapped inputs where values missing
  for (const [field, value] of Object.entries(allAssumptions)) {
    if (!mappedInputs.mappedFields[field]) {
      mappedInputs.mappedFields[field] = value;
      assumptions.assumedFields[field] = value;
    }
  }

  return assumptions;
}

/**
 * Get country-specific economic assumptions
 *
 * @param {string} country - Country code
 * @returns {Object} Country assumptions
 */
function getCountryAssumptions(country) {
  const taxRules = TaxLibrary.getTaxRules(country);

  return {
    inflationRate: 5, // Default 5% inflation
    exchangeRateVolatility: 8, // Default 8% volatility
    corporateTaxRate: taxRules?.corporateTax?.standardRate || 30,
    personalTaxRate: 15, // Simplified default
    gdpGrowthRate: 3 // Default 3% growth
  };
}

/**
 * Get model-type specific assumptions
 *
 * @param {string} modelType - Type of model
 * @returns {Object} Model-specific assumptions
 */
function getModelTypeAssumptions(modelType) {
  const assumptions = {
    forecasting: {
      forecastPeriods: 5,
      growthRate: 10,
      volatilityFactor: 1.0
    },
    valuation: {
      discountRate: 10,
      terminalGrowthRate: 2.5,
      riskPremium: 5
    },
    risk: {
      riskMultiplier: 1.0,
      concentrationThreshold: 80,
      heightenedRiskThreshold: 60
    },
    scenario: {
      scenarios: ['base', 'optimistic', 'pessimistic'],
      adjustmentFactor: 0.25
    },
    consolidation: {
      eliminations: true,
      minorityInterestMethod: 'full_goodwill'
    },
    personal_finance: {
      retirementYears: 30,
      investmentReturn: 8,
      inflationAssumption: 3
    }
  };

  return assumptions[modelType] || {};
}

/**
 * Normalize input values to standard ranges/units
 * Converts various input formats to standardized values
 *
 * @param {Object} mappedInputs - Mapped input data
 * @returns {Object} Normalized inputs
 *
 * @example
 * // Convert "5%" to 5, "1000k" to 1000000, etc.
 * const normalized = normalizeInputValues(mappedInputs);
 */
export function normalizeInputValues(mappedInputs) {
  if (!mappedInputs || !mappedInputs.mappedFields) {
    console.error('normalizeInputValues: Valid mapped inputs required');
    return null;
  }

  const normalized = {
    ...mappedInputs,
    normalizedAt: new Date().toISOString(),
    normalizations: {}
  };

  for (const [field, value] of Object.entries(mappedInputs.mappedFields)) {
    if (typeof value === 'string') {
      // Handle percentage strings: "15%" → 15
      if (value.includes('%')) {
        normalized.mappedFields[field] = parseFloat(value);
        normalized.normalizations[field] = 'Converted percentage string to number';
      }

      // Handle thousands: "1000k" → 1000000, "1.5M" → 1500000
      if (value.match(/k|K|m|M|b|B/i)) {
        let multiplier = 1;
        if (value.match(/k|K/)) multiplier = 1000;
        if (value.match(/m|M/)) multiplier = 1000000;
        if (value.match(/b|B/)) multiplier = 1000000000;

        const numericPart = parseFloat(value);
        normalized.mappedFields[field] = CalcEngine.multiply(numericPart, multiplier);
        normalized.normalizations[field] = `Converted scaled notation (${value}) to ${normalized.mappedFields[field]}`;
      }
    }
  }

  return normalized;
}

/**
 * Perform comprehensive input validation
 * Checks for completeness, consistency, accuracy, timeliness
 *
 * @param {Object} mappedInputs - Mapped inputs to validate
 * @param {string} modelType - Model type for validation rules
 * @returns {Object} Comprehensive validation report
 *
 * @example
 * const validation = validateInputQuality(mappedInputs, 'forecasting');
 * // Returns: {
 * //   complete: true,
 * //   consistent: true,
 * //   accurate: true,
 * //   qualityScore: 95,
 * //   issues: [],
 * //   recommendations: []
 * // }
 */
export function validateInputQuality(mappedInputs, modelType) {
  if (!mappedInputs || !ValidationService.isValidString(modelType)) {
    console.error('validateInputQuality: Valid inputs and model type required');
    return null;
  }

  const validation = {
    modelType,
    validatedAt: new Date().toISOString(),
    checks: {
      completeness: checkCompleteness(mappedInputs, modelType),
      consistency: checkConsistency(mappedInputs),
      accuracy: checkAccuracy(mappedInputs),
      timeliness: checkTimeliness(mappedInputs)
    },
    issues: [],
    recommendations: []
  };

  // Compile all issues from checks
  for (const [check, result] of Object.entries(validation.checks)) {
    if (!result.valid) {
      validation.issues.push(`${check}: ${result.issues.join(', ')}`);
    }
    if (result.recommendations) {
      validation.recommendations.push(...result.recommendations);
    }
  }

  // Calculate overall quality score
  validation.qualityScore = calculateQualityScore(validation.checks);
  validation.overallValid = validation.qualityScore >= 70; // 70% threshold

  return validation;
}

/**
 * Check input completeness
 * Are all required fields present?
 *
 * @param {Object} mappedInputs - Inputs to check
 * @param {string} modelType - Model type
 * @returns {Object} Completeness check result
 */
function checkCompleteness(mappedInputs, modelType) {
  const template = ModelTemplates.getModelTemplate(modelType);
  const requiredFields = template.inputs.filter(i => i.required).map(i => i.name);

  const result = {
    valid: true,
    issues: [],
    recommendations: [],
    fieldsChecked: requiredFields.length,
    fieldsProvided: 0
  };

  for (const field of requiredFields) {
    if (mappedInputs.mappedFields[field]) {
      result.fieldsProvided++;
    } else {
      result.valid = false;
      result.issues.push(`Missing required field: ${field}`);
    }
  }

  const completeness = CalcEngine.divide(CalcEngine.multiply(result.fieldsProvided, 100), result.fieldsChecked);
  result.completenessScore = CalcEngine.round(completeness, 0);

  if (result.completenessScore < 100) {
    result.recommendations.push('Provide missing required fields for accurate modeling');
  }

  return result;
}

/**
 * Check input consistency
 * Do values make logical sense together?
 *
 * @param {Object} mappedInputs - Inputs to check
 * @returns {Object} Consistency check result
 */
function checkConsistency(mappedInputs) {
  const result = {
    valid: true,
    issues: [],
    recommendations: []
  };

  const fields = mappedInputs.mappedFields;

  // Check: if revenue exists, it should be positive
  if (fields.revenue !== undefined && fields.revenue < 0) {
    result.valid = false;
    result.issues.push('Revenue cannot be negative');
  }

  // Check: if forecast periods exist, expenses shouldn't exceed revenue
  if (fields.revenue && fields.expenses && fields.expenses > fields.revenue) {
    result.recommendations.push('Expenses exceed revenue - verify data accuracy');
  }

  // Check: start date shouldn't be after end date
  if (fields.startDate && fields.endDate) {
    if (new Date(fields.startDate) > new Date(fields.endDate)) {
      result.valid = false;
      result.issues.push('Start date cannot be after end date');
    }
  }

  // Check: if historical data provided, should not have gaps
  if (fields.historicalData && Array.isArray(fields.historicalData)) {
    if (fields.historicalData.length < 3) {
      result.recommendations.push('Less than 3 historical data points - forecasts may be less reliable');
    }
  }

  return result;
}

/**
 * Check input accuracy
 * Are values realistic and within expected ranges?
 *
 * @param {Object} mappedInputs - Inputs to check
 * @returns {Object} Accuracy check result
 */
function checkAccuracy(mappedInputs) {
  const result = {
    valid: true,
    issues: [],
    recommendations: []
  };

  const fields = mappedInputs.mappedFields;

  // Check: tax rate should be 0-100%
  if (fields.taxRate !== undefined) {
    if (fields.taxRate < 0 || fields.taxRate > 100) {
      result.valid = false;
      result.issues.push(`Tax rate ${fields.taxRate}% is outside 0-100% range`);
    }
  }

  // Check: growth rate should be reasonable (-100% to +1000%)
  if (fields.growthRate !== undefined) {
    if (fields.growthRate < -100 || fields.growthRate > 1000) {
      result.recommendations.push(`Growth rate ${fields.growthRate}% seems extreme - verify accuracy`);
    }
  }

  // Check: discount rate should be positive but reasonable (typically 5-20%)
  if (fields.discountRate !== undefined) {
    if (fields.discountRate < 0) {
      result.valid = false;
      result.issues.push('Discount rate cannot be negative');
    }
    if (fields.discountRate > 50) {
      result.recommendations.push(`Discount rate ${fields.discountRate}% is unusually high`);
    }
  }

  return result;
}

/**
 * Check input timeliness
 * Is data current and appropriately dated?
 *
 * @param {Object} mappedInputs - Inputs to check
 * @returns {Object} Timeliness check result
 */
function checkTimeliness(mappedInputs) {
  const result = {
    valid: true,
    issues: [],
    recommendations: []
  };

  const mappingTimestamp = new Date(mappedInputs.mappingTimestamp);
  const daysSinceMapped = Math.floor((new Date() - mappingTimestamp) / (1000 * 60 * 60 * 24));

  if (daysSinceMapped > 30) {
    result.recommendations.push(`Data mapped ${daysSinceMapped} days ago - consider updating`);
  }

  if (mappedInputs.mappedFields.dataDate) {
    const dataDate = new Date(mappedInputs.mappedFields.dataDate);
    const daysSinceData = Math.floor((new Date() - dataDate) / (1000 * 60 * 60 * 24));

    if (daysSinceData > 90) {
      result.recommendations.push(`Data is ${daysSinceData} days old - consider updating for current analysis`);
    }
  }

  return result;
}

/**
 * Calculate overall data quality score from checks
 *
 * @param {Object} checks - Results from all validation checks
 * @returns {number} Quality score 0-100
 */
function calculateQualityScore(checks) {
  let totalScore = 0;
  let checkCount = 0;

  for (const [check, result] of Object.entries(checks)) {
    if (result.completenessScore !== undefined) {
      totalScore = CalcEngine.add(totalScore, result.completenessScore);
    } else if (result.valid) {
      totalScore = CalcEngine.add(totalScore, 100);
    } else {
      totalScore = CalcEngine.add(totalScore, 50);
    }
    checkCount++;
  }

  return CalcEngine.round(CalcEngine.divide(totalScore, checkCount), 0);
}

/**
 * Calculate overall mapping quality score
 * Based on errors, warnings, and data completeness
 *
 * @param {Object} mappingResult - Result from mapping process
 * @returns {number} Quality score 0-100
 */
function calculateMappingQualityScore(mappingResult) {
  let score = 100;

  // Deduct for errors
  if (mappingResult.errors && mappingResult.errors.length > 0) {
    score = CalcEngine.subtract(score, CalcEngine.multiply(mappingResult.errors.length, 10));
  }

  // Deduct for warnings
  if (mappingResult.warnings && mappingResult.warnings.length > 0) {
    score = CalcEngine.subtract(score, CalcEngine.multiply(mappingResult.warnings.length, 2));
  }

  // Ensure score stays 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate input mapping report
 * Shows input transformation, assumptions applied, quality metrics
 *
 * @param {Object} mappedInputs - Mapped input data
 * @param {Object} validation - Validation results
 * @returns {string} Formatted report
 */
export function generateInputMappingReport(mappedInputs, validation) {
  if (!mappedInputs) {
    return 'No input mapping data provided';
  }

  let report = '=== INPUT MAPPING REPORT ===\n\n';
  report += `Model Type: ${mappedInputs.modelType}\n`;
  report += `Mapping Date: ${mappedInputs.mappingTimestamp}\n`;
  report += `Data Quality Score: ${mappedInputs.dataQualityScore}%\n\n`;

  report += '--- MAPPED INPUTS ---\n';
  for (const [field, value] of Object.entries(mappedInputs.mappedFields)) {
    report += `${field}: ${value}\n`;
  }

  if (mappedInputs.warnings && mappedInputs.warnings.length > 0) {
    report += '\n--- WARNINGS ---\n';
    for (const warning of mappedInputs.warnings) {
      report += `• ${warning}\n`;
    }
  }

  if (mappedInputs.errors && mappedInputs.errors.length > 0) {
    report += '\n--- ERRORS ---\n';
    for (const error of mappedInputs.errors) {
      report += `• ${error}\n`;
    }
  }

  if (validation) {
    report += '\n--- VALIDATION RESULTS ---\n';
    report += `Overall Quality: ${validation.qualityScore}%\n`;
    report += `Valid for Processing: ${validation.overallValid ? 'YES' : 'NO'}\n`;
    if (validation.recommendations.length > 0) {
      report += '\nRecommendations:\n';
      for (const rec of validation.recommendations) {
        report += `• ${rec}\n`;
      }
    }
  }

  return report;
}

export default {
  mapUserInputToModel,
  applyDefaultAssumptions,
  normalizeInputValues,
  validateInputQuality,
  generateInputMappingReport
};
