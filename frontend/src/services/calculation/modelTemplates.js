/**
 * Financial Model Templates
 *
 * Standard templates for all 6 model types:
 * 1. Forecasting Models
 * 2. Valuation Models
 * 3. Risk Models
 * 4. Scenario & Sensitivity Models
 * 5. Consolidation Models
 * 6. Personal Finance Models
 *
 * Each template defines:
 * - Input structure (what data is needed)
 * - Calculation logic (what formulas to use)
 * - Output structure (what results to produce)
 * - Validation rules
 */

// ============================================================================
// 1. FORECASTING MODEL TEMPLATE
// ============================================================================

export const ForecastingModelTemplate = {
  name: 'Revenue Forecast Model',
  type: 'forecasting',
  description: 'Predicts future revenue based on historical data and growth assumptions',

  inputs: {
    historicalRevenue: {
      type: 'array',
      description: 'Historical revenue data (last 3-5 years)',
      required: true,
      example: [100000, 120000, 144000, 172800]
    },
    growthRate: {
      type: 'percentage',
      description: 'Expected growth rate per period',
      required: true,
      default: 10,
      min: -50,
      max: 100
    },
    forecastPeriods: {
      type: 'number',
      description: 'Number of periods to forecast',
      required: true,
      default: 12,
      min: 1,
      max: 60
    },
    seasonalityFactors: {
      type: 'array',
      description: 'Monthly/quarterly seasonality adjustments',
      required: false,
      example: [0.8, 0.9, 1.0, 1.2, 1.1, 1.0]
    },
    marketConditions: {
      type: 'string',
      description: 'Current market conditions (optimistic, neutral, pessimistic)',
      required: true,
      enum: ['optimistic', 'neutral', 'pessimistic']
    }
  },

  calculations: {
    trend: {
      formula: 'Linear or exponential trend from historical data',
      depends: ['historicalRevenue']
    },
    baselineForecast: {
      formula: 'Apply growth rate to last historical value',
      depends: ['historicalRevenue', 'growthRate', 'forecastPeriods']
    },
    seasonallyAdjustedForecast: {
      formula: 'Multiply baseline by seasonality factors',
      depends: ['baselineForecast', 'seasonalityFactors']
    },
    marketAdjustedForecast: {
      formula: 'Apply market condition multipliers',
      depends: ['seasonallyAdjustedForecast', 'marketConditions']
    }
  },

  outputs: {
    forecastedValues: {
      type: 'array',
      description: 'Period-by-period forecasted revenue',
      unit: 'currency'
    },
    totalForecastedRevenue: {
      type: 'number',
      description: 'Sum of all forecasted periods',
      unit: 'currency'
    },
    averageGrowthRate: {
      type: 'percentage',
      description: 'Compound annual growth rate (CAGR)',
      unit: '%'
    },
    confidence: {
      type: 'percentage',
      description: 'Forecast confidence level based on data quality',
      unit: '%'
    },
    scenarios: {
      type: 'object',
      description: 'Best case, base case, worst case scenarios',
      children: {
        best: { type: 'array' },
        base: { type: 'array' },
        worst: { type: 'array' }
      }
    }
  },

  validationRules: [
    'historicalRevenue must have at least 3 data points',
    'growthRate must be between -50% and 100%',
    'forecastPeriods must be positive',
    'Sum of historical revenue must be positive'
  ]
};

// ============================================================================
// 2. VALUATION MODEL TEMPLATE
// ============================================================================

export const ValuationModelTemplate = {
  name: 'Discounted Cash Flow (DCF) Valuation Model',
  type: 'valuation',
  description: 'Determines business value using DCF method',

  inputs: {
    projectedFreeCashFlow: {
      type: 'array',
      description: 'FCF for forecast period (usually 5-10 years)',
      required: true
    },
    terminalValue: {
      type: 'number',
      description: 'Value after forecast period',
      required: true
    },
    discountRate: {
      type: 'percentage',
      description: 'Weighted average cost of capital (WACC)',
      required: true,
      default: 10
    },
    terminalGrowthRate: {
      type: 'percentage',
      description: 'Perpetual growth rate after forecast period',
      required: true,
      default: 2.5,
      max: 4
    },
    sharesOutstanding: {
      type: 'number',
      description: 'Number of shares outstanding',
      required: true
    }
  },

  calculations: {
    discountedCashFlows: {
      formula: 'PV = FV / (1 + r)^n for each year',
      depends: ['projectedFreeCashFlow', 'discountRate']
    },
    discountedTerminalValue: {
      formula: 'PV of terminal value using perpetuity formula',
      depends: ['terminalValue', 'discountRate', 'terminalGrowthRate']
    },
    enterpriseValue: {
      formula: 'Sum of discounted FCF + discounted terminal value',
      depends: ['discountedCashFlows', 'discountedTerminalValue']
    },
    equityValue: {
      formula: 'Enterprise Value - Net Debt',
      depends: ['enterpriseValue']
    },
    pricePerShare: {
      formula: 'Equity Value / Shares Outstanding',
      depends: ['equityValue', 'sharesOutstanding']
    }
  },

  outputs: {
    enterpriseValue: {
      type: 'number',
      unit: 'currency'
    },
    equityValue: {
      type: 'number',
      unit: 'currency'
    },
    pricePerShare: {
      type: 'number',
      unit: 'currency'
    },
    valuationRange: {
      type: 'object',
      children: {
        conservative: { type: 'number' },
        base: { type: 'number' },
        optimistic: { type: 'number' }
      }
    }
  }
};

// ============================================================================
// 3. RISK MODEL TEMPLATE
// ============================================================================

export const RiskModelTemplate = {
  name: 'Country Risk & Tax Exposure Model',
  type: 'risk',
  description: 'Measures tax exposure and country-specific risks',

  inputs: {
    entities: {
      type: 'array',
      description: 'List of business entities with locations and financials',
      required: true
    },
    taxableIncome: {
      type: 'object',
      description: 'Income by country/jurisdiction',
      required: true
    },
    countryRiskFactors: {
      type: 'object',
      description: 'Political, regulatory, and economic risk scores (0-100)',
      required: true
    }
  },

  calculations: {
    taxExposureByCountry: {
      formula: 'Taxable Income * Corporate Tax Rate for each country',
      depends: ['taxableIncome', 'taxRates']
    },
    totalTaxExposure: {
      formula: 'Sum of tax exposure across all countries',
      depends: ['taxExposureByCountry']
    },
    riskScore: {
      formula: 'Weighted average of country risk factors',
      depends: ['countryRiskFactors']
    },
    exposureConcentration: {
      formula: 'Herfindahl index of exposure by country',
      depends: ['taxExposureByCountry']
    }
  },

  outputs: {
    taxExposureByCountry: {
      type: 'object',
      description: 'Tax liability by jurisdiction',
      unit: 'currency'
    },
    totalTaxExposure: {
      type: 'number',
      unit: 'currency'
    },
    riskScores: {
      type: 'object',
      description: 'Risk level by country (low/medium/high)'
    },
    exposureConcentration: {
      type: 'percentage',
      description: 'Percentage of exposure in top 3 countries'
    },
    alerts: {
      type: 'array',
      description: 'Risk alerts and recommendations'
    }
  }
};

// ============================================================================
// 4. SCENARIO & SENSITIVITY MODEL TEMPLATE
// ============================================================================

export const ScenarioModelTemplate = {
  name: 'Scenario & Sensitivity Analysis Model',
  type: 'scenario',
  description: 'Tests assumptions and generates what-if scenarios',

  inputs: {
    baseModel: {
      type: 'object',
      description: 'Base case model results',
      required: true
    },
    variableToTest: {
      type: 'string',
      description: 'Which variable to analyze (revenue, costs, tax rate, etc)',
      required: true
    },
    sensitivityRange: {
      type: 'percentage',
      description: 'Range to test (e.g., ±20%)',
      required: true,
      default: 20
    },
    scenarioDefinitions: {
      type: 'object',
      description: 'Custom scenario definitions (best, base, worst)',
      required: false
    }
  },

  calculations: {
    sensitivityAnalysis: {
      formula: 'Calculate output for multiple input values',
      depends: ['baseModel', 'variableToTest', 'sensitivityRange']
    },
    scenarioResults: {
      formula: 'Run model for best, base, worst assumptions',
      depends: ['baseModel', 'scenarioDefinitions']
    },
    breakEvenPoints: {
      formula: 'Find input values where output = 0',
      depends: ['sensitivityAnalysis']
    }
  },

  outputs: {
    sensitivityTable: {
      type: 'array',
      description: '2D table of inputs vs outputs'
    },
    scenarioComparison: {
      type: 'object',
      description: 'Side-by-side comparison of scenarios',
      children: {
        best: { type: 'number' },
        base: { type: 'number' },
        worst: { type: 'number' }
      }
    },
    breakEvenAnalysis: {
      type: 'array',
      description: 'Critical values and breakeven points'
    },
    visualizations: {
      type: 'object',
      description: 'Tornado charts, spider charts, etc.',
      children: {
        tornadoChart: { type: 'object' },
        spiderChart: { type: 'object' }
      }
    }
  }
};

// ============================================================================
// 5. CONSOLIDATION MODEL TEMPLATE
// ============================================================================

export const ConsolidationModelTemplate = {
  name: 'Multi-Entity Consolidation Model',
  type: 'consolidation',
  description: 'Consolidates financials from multiple entities across countries',

  inputs: {
    entities: {
      type: 'array',
      description: 'Individual entity financial statements',
      required: true
    },
    intercompanyTransactions: {
      type: 'array',
      description: 'Transactions between entities (for elimination)',
      required: false
    },
    exchangeRates: {
      type: 'object',
      description: 'Currency exchange rates on consolidation date',
      required: true
    },
    consolidationMethod: {
      type: 'string',
      description: 'Full consolidation or proportional',
      required: true,
      enum: ['full', 'proportional', 'equity']
    }
  },

  calculations: {
    convertedStatements: {
      formula: 'Convert all entities to reporting currency',
      depends: ['entities', 'exchangeRates']
    },
    eliminatedTransactions: {
      formula: 'Remove intercompany transactions',
      depends: ['convertedStatements', 'intercompanyTransactions']
    },
    consolidatedStatement: {
      formula: 'Aggregate according to consolidation method',
      depends: ['eliminatedTransactions', 'consolidationMethod']
    },
    goodwillAndIntangibles: {
      formula: 'Calculate goodwill from acquisitions',
      depends: ['entities']
    }
  },

  outputs: {
    consolidatedBalanceSheet: {
      type: 'object',
      description: 'Group balance sheet'
    },
    consolidatedIncomeStatement: {
      type: 'object',
      description: 'Group income statement'
    },
    consolidatedCashFlow: {
      type: 'object',
      description: 'Group cash flow statement'
    },
    minorityInterests: {
      type: 'number',
      unit: 'currency',
      description: 'Minority shareholder interests'
    }
  }
};

// ============================================================================
// 6. PERSONAL FINANCE MODEL TEMPLATE
// ============================================================================

export const PersonalFinanceModelTemplate = {
  name: 'Personal Cashflow & Tax Model',
  type: 'personal',
  description: 'Plans personal cashflow, savings, and tax obligations',

  inputs: {
    income: {
      type: 'array',
      description: 'Monthly/annual income sources',
      required: true
    },
    expenses: {
      type: 'array',
      description: 'Monthly/annual expenses by category',
      required: true
    },
    assets: {
      type: 'array',
      description: 'Current assets and their values',
      required: true
    },
    liabilities: {
      type: 'array',
      description: 'Current debts and obligations',
      required: true
    },
    savingsGoal: {
      type: 'number',
      description: 'Monthly savings target',
      required: false
    },
    investmentHorizon: {
      type: 'number',
      description: 'Investment period in years',
      required: false
    }
  },

  calculations: {
    monthlyNetCashflow: {
      formula: 'Total Income - Total Expenses',
      depends: ['income', 'expenses']
    },
    netWorth: {
      formula: 'Total Assets - Total Liabilities',
      depends: ['assets', 'liabilities']
    },
    savingsRate: {
      formula: '(Net Cashflow / Total Income) * 100',
      depends: ['monthlyNetCashflow', 'income']
    },
    taxObligation: {
      formula: 'Calculate based on income and tax jurisdiction',
      depends: ['income']
    },
    projectedNetWorth: {
      formula: 'Project net worth based on savings and investment returns',
      depends: ['netWorth', 'monthlyNetCashflow', 'investmentHorizon']
    }
  },

  outputs: {
    monthlyCashflowSummary: {
      type: 'object',
      children: {
        totalIncome: { type: 'number' },
        totalExpenses: { type: 'number' },
        netCashflow: { type: 'number' }
      }
    },
    netWorth: {
      type: 'number',
      unit: 'currency'
    },
    savingsRate: {
      type: 'percentage'
    },
    taxObligation: {
      type: 'number',
      unit: 'currency'
    },
    projections: {
      type: 'object',
      description: '5-10 year projections',
      children: {
        projectedNetWorth: { type: 'array' },
        savingsProjection: { type: 'array' }
      }
    }
  }
};

// ============================================================================
// TEMPLATE REGISTRY & HELPER FUNCTIONS
// ============================================================================

export const MODEL_TEMPLATES = {
  forecasting: ForecastingModelTemplate,
  valuation: ValuationModelTemplate,
  risk: RiskModelTemplate,
  scenario: ScenarioModelTemplate,
  consolidation: ConsolidationModelTemplate,
  personal: PersonalFinanceModelTemplate
};

export const getModelTemplate = (modelType) => {
  return MODEL_TEMPLATES[modelType] || null;
};

export const getAllModelTemplates = () => {
  return MODEL_TEMPLATES;
};

export const validateInputsAgainstTemplate = (inputs, template) => {
  /**
   * Validate user inputs against template requirements
   */
  const errors = [];
  const warnings = [];

  Object.entries(template.inputs).forEach(([fieldName, fieldSpec]) => {
    if (fieldSpec.required && !(fieldName in inputs)) {
      errors.push(`Missing required field: ${fieldName}`);
    }

    if (fieldName in inputs) {
      const value = inputs[fieldName];

      // Type validation
      if (typeof value !== fieldSpec.type && fieldSpec.type !== 'any') {
        errors.push(`Field ${fieldName} must be of type ${fieldSpec.type}`);
      }

      // Enum validation
      if (fieldSpec.enum && !fieldSpec.enum.includes(value)) {
        errors.push(`Field ${fieldName} must be one of: ${fieldSpec.enum.join(', ')}`);
      }

      // Range validation
      if (typeof value === 'number') {
        if (fieldSpec.min !== undefined && value < fieldSpec.min) {
          errors.push(`Field ${fieldName} must be >= ${fieldSpec.min}`);
        }
        if (fieldSpec.max !== undefined && value > fieldSpec.max) {
          errors.push(`Field ${fieldName} must be <= ${fieldSpec.max}`);
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

export default {
  ForecastingModelTemplate,
  ValuationModelTemplate,
  RiskModelTemplate,
  ScenarioModelTemplate,
  ConsolidationModelTemplate,
  PersonalFinanceModelTemplate,
  MODEL_TEMPLATES,
  getModelTemplate,
  getAllModelTemplates,
  validateInputsAgainstTemplate
};
