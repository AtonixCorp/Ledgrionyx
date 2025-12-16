# Atonix Capital - Financial Modeling Integration Guide

**Status:** Phase 1 Complete - Foundation Established  
**Last Updated:** December 16, 2025  
**Version:** 1.0 - Foundation Release

---

## Executive Summary

This guide documents the AI Financial Modeling Integration for Atonix Capital. It provides developers with strict, professional specifications for implementing financial models that:

- Use standardized calculations (no drift, no inconsistencies)
- Support all 6 model types (Forecasting, Valuation, Risk, Scenario, Consolidation, Personal Finance)
- Integrate AI as an interpreter, not a calculator
- Operate across 40+ countries with localized tax rules
- Produce audit-ready financial reports

---

## Phase 1 - Complete: Foundation Setup ✅

### 1.1 Unified Calculation Engine
**File:** `src/services/calculation/calculationEngine.js`

The mathematical heart of Atonix Capital.

**Key Principles:**
- All calculations use this engine
- Components NEVER do their own math
- Deterministic and reproducible
- Consistent rounding (2 decimals)

**Core Functions:**
```javascript
// Basic arithmetic (safe, prevents floating-point errors)
add(a, b, c, ...)        // Safe addition
subtract(a, b, c, ...)   // Safe subtraction
multiply(a, b, c, ...)   // Safe multiplication
divide(a, b)              // Safe division with error handling
round(value, decimals)    // Consistent rounding

// Percentage operations
calculatePercentage(value, percentage)           // % of value
calculatePercentageChange(oldValue, newValue)    // % change
applyPercentageIncrease(value, percentage)       // Value + %
applyPercentageDecrease(value, percentage)       // Value - %

// Time-based calculations
calculateMonthsBetween(startDate, endDate)
calculateYearsBetween(startDate, endDate)
addMonths(date, months)

// Compound growth & discounting
calculateCompoundGrowth(initialValue, growthRate, periods)
calculateDiscountedValue(futureValue, discountRate, periods)

// Aggregation
sum(array)          // Total
average(array)      // Mean
min(array)          // Minimum
max(array)          // Maximum
cumSum(array)       // Cumulative sum

// Ratios & metrics
calculateRatio(numerator, denominator)
calculateNetPosition(assets, liabilities)
calculateTaxRate(taxAmount, taxableIncome)

// Forecasting
linearForecast(historicalData, periods)
exponentialForecast(historicalData, growthRate, periods)

// Scenarios
generateScenarios(baseValue, variation%)
calculateSensitivity(baseValue, variable, sensitivity)

// Multi-currency
convertCurrency(amount, fromCurrency, toCurrency, rate)
convertMultipleCurrencies(amounts, fromCurrency, toCurrency, rates)

// Consolidation
consolidateEntities(entities, method)  // 'full' or 'proportional'

// Validation
validateInput(value, type, constraints)
validateCalculation(inputs, requiredFields)

// Formatting
formatCurrency(value, decimals)
formatPercentage(value, decimals)
createCalculationResult(value, metadata)
```

**Usage Example:**
```javascript
import * as CalcEngine from '../services/calculation/calculationEngine';

// Calculate tax exposure
const taxableIncome = 1000000;
const taxRate = 30;
const tax = CalcEngine.multiply(taxableIncome, taxRate / 100);
// Result: 300000

// Apply percentage increase
const currentRevenue = 500000;
const growthRate = 10;
const projectedRevenue = CalcEngine.applyPercentageIncrease(currentRevenue, growthRate);
// Result: 550000

// Forecast with compound growth
const forecast = CalcEngine.calculateCompoundGrowth(
  100000,  // Starting amount
  12,      // 12% growth rate per year
  5        // 5 years
);
// Result: 176234.17
```

---

### 1.2 Country Tax Rule Library
**File:** `src/services/calculation/countryTaxLibrary.js`

Comprehensive tax rules for 40+ countries.

**Supported Countries (by region):**
- **Africa West:** Nigeria, Ghana, Senegal, Benin, Togo, Liberia, Sierra Leone, Côte d'Ivoire
- **Africa East:** Kenya, Tanzania, Uganda, Ethiopia, Rwanda, Mozambique
- **Africa South:** South Africa, Botswana, Zimbabwe, Namibia, Malawi, Zambia
- **Africa Central:** Cameroon, Congo, Gabon
- **Europe:** UK, Germany, France, Netherlands, Belgium, Ireland, Portugal, Spain, Italy, Sweden, Switzerland, Luxembourg
- **North America:** USA, Canada
- **Asia Pacific:** Singapore, Hong Kong, India, Australia, UAE

**Tax Rules Included:**
```javascript
const taxRules = {
  NG: {
    name: 'Nigeria',
    corporateTax: { standardRate: 30, smallBusinessRate: 0 },
    personalIncomeTax: {
      bands: [
        { min: 0, max: 300000, rate: 1 },
        { min: 300000, max: 600000, rate: 3 },
        // ... more bands
      ]
    },
    vat: { standardRate: 7.5, ... },
    withholding: { interest: 10, dividends: 10, ... },
    filingRequirements: { ... },
    incentives: { ... },
    deadlines: { ... }
  }
  // ... 40+ more countries
};
```

**Usage Example:**
```javascript
import { getTaxRules, calculateTaxBand } from '../services/calculation/countryTaxLibrary';

// Get Nigeria tax rules
const nigeriaTaxRules = getTaxRules('NG');
console.log(nigeriaTaxRules.corporateTax.standardRate);  // 30%

// Calculate personal income tax
const income = 800000;
const tax = calculateTaxBand(income, nigeriaTaxRules.personalIncomeTax.bands);
// Result: Income tax amount based on progressive bands
```

**Tax Calculation Formulas:**
- **Corporate Tax:** Taxable Income × Corporate Tax Rate
- **Personal Tax:** Progressive bands applied per jurisdiction
- **VAT:** Value × VAT Rate (applied to eligible items)
- **Withholding:** Source amount × Withholding Rate
- **Tax Exposure:** Sum of all tax obligations across entities/countries

---

### 1.3 Financial Model Templates
**File:** `src/services/calculation/modelTemplates.js`

Standard templates for all 6 model types.

**Template Structure:**
Each template defines:
1. **Inputs** - What data is needed (required, types, defaults, constraints)
2. **Calculations** - What formulas to apply (with dependencies)
3. **Outputs** - What results to produce (with units and descriptions)
4. **Validation Rules** - Quality checks

**6 Model Templates:**

#### 1. Forecasting Model
Projects future financial outcomes using historical data and growth assumptions.
```javascript
Inputs:
  - historicalData: [prev 3-5 years]
  - growthRate: [% per period]
  - forecastPeriods: [number of periods]
  - seasonalityFactors: [monthly/quarterly adjustments]
  - marketConditions: [optimistic/neutral/pessimistic]

Outputs:
  - forecastedValues: [period-by-period]
  - totalForecastedRevenue: [sum]
  - CAGR: [compound annual growth rate]
  - Scenarios: {best, base, worst}
```

#### 2. Valuation Model
Determines business value using DCF method.
```javascript
Inputs:
  - projectedFreeCashFlow: [5-10 year forecast]
  - terminalValue: [post-forecast value]
  - discountRate: [WACC %]
  - terminalGrowthRate: [perpetual growth %]
  - sharesOutstanding: [number]

Outputs:
  - enterpriseValue
  - equityValue
  - pricePerShare
  - valuationRange: {conservative, base, optimistic}
```

#### 3. Risk Model
Measures tax exposure and country-specific risks.
```javascript
Inputs:
  - entities: [list with locations/financials]
  - taxableIncome: [by country]
  - countryRiskFactors: [0-100 scores]

Outputs:
  - taxExposureByCountry: [by jurisdiction]
  - totalTaxExposure
  - riskScores: [by country]
  - exposureConcentration: [top 3 countries %]
  - alerts: [risk warnings]
```

#### 4. Scenario & Sensitivity Model
Tests assumptions and generates what-if scenarios.
```javascript
Inputs:
  - baseModel: [base case results]
  - variableToTest: [which variable to analyze]
  - sensitivityRange: [±%]
  - scenarioDefinitions: [best/base/worst]

Outputs:
  - sensitivityTable: [2D input vs output]
  - scenarioComparison: {best, base, worst}
  - breakEvenAnalysis: [critical values]
  - visualizations: [tornado/spider charts]
```

#### 5. Consolidation Model
Consolidates multi-entity financials across countries.
```javascript
Inputs:
  - entities: [individual statements]
  - intercompanyTransactions: [for elimination]
  - exchangeRates: [conversion rates]
  - consolidationMethod: ['full' or 'proportional']

Outputs:
  - consolidatedBalanceSheet
  - consolidatedIncomeStatement
  - consolidatedCashFlow
  - minorityInterests
```

#### 6. Personal Finance Model
Plans personal cashflow, savings, and taxes.
```javascript
Inputs:
  - income: [monthly/annual sources]
  - expenses: [by category]
  - assets: [with values]
  - liabilities: [debts]
  - savingsGoal: [monthly target]
  - investmentHorizon: [years]

Outputs:
  - monthlyCashflowSummary
  - netWorth
  - savingsRate
  - taxObligation
  - projections: [5-10 year]
```

**Template Usage:**
```javascript
import { getModelTemplate, validateInputsAgainstTemplate } from '../services/calculation/modelTemplates';

// Get template
const template = getModelTemplate('forecasting');

// Validate inputs
const inputs = {
  historicalRevenue: [100000, 120000, 144000],
  growthRate: 10,
  forecastPeriods: 12,
  marketConditions: 'neutral'
};

const validation = validateInputsAgainstTemplate(inputs, template);
if (!validation.valid) {
  console.log('Validation errors:', validation.errors);
}
```

---

## Key Terminology (Strict Definitions)

All developers must use these exact terms:

| Term | Definition | Example |
|------|-----------|---------|
| **Model Input** | Any variable used in calculations | Revenue growth rate, tax rate, historical data |
| **Model Output** | Any result produced by the engine | Forecasted revenue, tax liability, valuation |
| **Assumption** | Non-historical input (prediction, estimate) | "5% annual growth rate", "30% tax rate" |
| **Scenario** | A set of assumptions for testing | Best case (10% growth), worst case (−5% growth) |
| **Exposure** | Risk or obligation | Tax exposure, foreign exchange risk |
| **Entity** | A legal business unit | Subsidiary, branch, division |
| **Jurisdiction** | Country or tax region | Nigeria, UK, Singapore |
| **Consolidation** | Combining multiple entities | Merging 5 subsidiaries into group financials |
| **Forecast Horizon** | Number of periods projected | "12-month forecast", "5-year plan" |
| **Validation Rule** | A rule that checks correctness | "Revenue must be positive" |
| **AI Interpretation Layer** | AI that explains model outputs | AI that provides insights on tax exposure |
| **Deterministic** | Produces same result every time | 2 + 2 always = 4, not random |

---

## Phase 1 Summary - COMPLETE ✅

### Files Created:
1. ✅ `calculationEngine.js` - 1000+ lines, 50+ functions
2. ✅ `countryTaxLibrary.js` - 40+ countries with complete tax rules
3. ✅ `modelTemplates.js` - 6 model types with full specifications
4. ✅ `FINANCIAL_MODELS_GUIDE.md` - This documentation

### What's Ready:
- ✅ Stable calculation engine (no floating-point errors)
- ✅ Comprehensive country tax library
- ✅ Model templates for all 6 types
- ✅ Input validation framework
- ✅ Output standardization

### What's Next (Phases 2-6):

**Phase 2:** AI Input Mapping & Validation  
**Phase 3:** AI-to-Model Integration Layer  
**Phase 4:** Scenario & Sensitivity Engines  
**Phase 5:** Reporting Layer  
**Phase 6:** Enterprise Extensions

---

## Strict Rules for Developers

1. **Never do calculations in components**
   - ❌ Bad: `const tax = income * 0.3;`
   - ✅ Good: `const tax = CalcEngine.multiply(income, 0.3);`

2. **Always use the calculation engine**
   - All math must flow through `calculationEngine.js`
   - Prevents calculation drift
   - Ensures consistency

3. **Validate all inputs**
   - Check data types, ranges, and required fields
   - Use `validateInput()` from calc engine
   - Provide meaningful error messages

4. **Round consistently**
   - Always use `round(value, 2)` for currencies
   - Financial data must be precise to 2 decimals

5. **Document assumptions**
   - Every model must list its assumptions
   - Mark which assumptions are from users vs. defaults
   - Enable what-if analysis

6. **Test across countries**
   - Tax rules vary by jurisdiction
   - Test each model with 3+ country scenarios
   - Verify filing deadlines and compliance rules

7. **Reference the model in AI output**
   - AI insights must cite the underlying model
   - Example: "Based on DCF model with 10% WACC"
   - Make calculations transparent

---

## Next Steps

**For Developers:**
1. Review `calculationEngine.js` and understand the 50+ functions
2. Review `countryTaxLibrary.js` and the tax calculation approach
3. Review `modelTemplates.js` and the 6 model types
4. Follow Phase 2 roadmap when ready

**For Product:**
1. Start Phase 2 implementation
2. Build input mapping for forecasting models
3. Add UI components for model inputs

---

## Support & Questions

For questions on implementation:
1. Check this guide first
2. Review function comments in `calculationEngine.js`
3. Follow template patterns in `modelTemplates.js`
4. Reach out to the development team

---

**End of Phase 1 Documentation**  
**Next Phase:** Input Mapping & Validation  
**Expected Timeline:** Q1 2025
