/**
 * Personal Finance Engine
 *
 * Manages personal financial planning including cashflow analysis, tax optimization,
 * savings/investment models, retirement planning, and personal tax calculations.
 *
 * ALL CALCULATIONS USE calculationEngine - NEVER do math directly
 * ALL DATA VALIDATED using validationService
 *
 * Phase 1 Feature: Foundation for personal finance models
 * Phase 3 Dependencies: Used by AI interpretation layer
 * Phase 5 Dependencies: Used in personal finance reports
 *
 * Strict Rule: All personal tax calculations must comply with countryTaxLibrary rules
 */

import * as CalcEngine from './calculationEngine';
import * as ValidationService from './validationService';
import * as TaxLibrary from './countryTaxLibrary';

/**
 * Personal Financial Profile
 *
 * @typedef {Object} PersonalProfile
 * @property {string} profileId - Unique identifier
 * @property {string} name - Full name
 * @property {string} country - Resident country code
 * @property {string} taxFilingStatus - 'SINGLE', 'MARRIED_JOINT', 'MARRIED_SEPARATE', 'HEAD_OF_HOUSEHOLD'
 * @property {number} dependents - Number of dependents
 * @property {string} currency - Primary currency
 * @property {Object} income - Income sources
 * @property {Object} expenses - Expense categories
 * @property {Object} assets - Asset holdings
 * @property {Object} liabilities - Debts and obligations
 */

/**
 * Calculate net personal income after tax
 * Considers all income sources and applicable taxes
 *
 * @param {number} grossIncome - Total gross income for period
 * @param {string} country - Country code for tax rules
 * @param {string} taxFilingStatus - Tax filing status
 * @param {number} dependents - Number of dependents
 * @returns {Object} Income breakdown with taxes
 *
 * @example
 * const income = calculateNetIncome(500000, 'NG', 'SINGLE', 0);
 * // Returns: {
 * //   grossIncome: 500000,
 * //   taxableIncome: 450000,
 * //   incomeTax: 45000,
 * //   netIncome: 405000,
 * //   effectiveTaxRate: 9
 * // }
 */
export function calculateNetIncome(grossIncome, country, taxFilingStatus, dependents) {
  if (!ValidationService.isValidNumber(grossIncome) ||
      !ValidationService.isValidString(country)) {
    console.error('calculateNetIncome: Invalid inputs');
    return null;
  }

  // Get tax rules for country
  const taxRules = TaxLibrary.getTaxRules(country);
  if (!taxRules) {
    console.error(`calculateNetIncome: No tax rules found for ${country}`);
    return null;
  }

  // Calculate standard deduction/exemptions (simplified)
  const standardDeduction = 100000; // Example: varies by country
  const dependentDeduction = CalcEngine.multiply(dependents, 50000);
  const totalDeductions = CalcEngine.add(standardDeduction, dependentDeduction);

  // Calculate taxable income
  const taxableIncome = Math.max(0, CalcEngine.subtract(grossIncome, totalDeductions));

  // Calculate tax using tax bands
  let incomeTax = 0;
  if (taxRules.personalIncomeTax && taxRules.personalIncomeTax.bands) {
    incomeTax = calculateTaxFromBands(taxableIncome, taxRules.personalIncomeTax.bands);
  }

  const netIncome = CalcEngine.subtract(grossIncome, incomeTax);
  const effectiveTaxRate = grossIncome > 0
    ? CalcEngine.round(CalcEngine.divide(CalcEngine.multiply(incomeTax, 100), grossIncome), 2)
    : 0;

  return {
    grossIncome: CalcEngine.round(grossIncome, 2),
    standardDeduction: CalcEngine.round(standardDeduction, 2),
    dependentDeductions: CalcEngine.round(dependentDeduction, 2),
    totalDeductions: CalcEngine.round(totalDeductions, 2),
    taxableIncome: CalcEngine.round(taxableIncome, 2),
    incomeTax: CalcEngine.round(incomeTax, 2),
    netIncome: CalcEngine.round(netIncome, 2),
    effectiveTaxRate,
    country,
    taxFilingStatus,
    dependents
  };
}

/**
 * Calculate tax from progressive tax bands
 * Applies marginal tax rates to appropriate income portions
 *
 * @param {number} taxableIncome - Taxable income amount
 * @param {Array} taxBands - Array of tax band objects with {min, max, rate}
 * @returns {number} Total tax calculated
 *
 * @example
 * const bands = [
 *   {min: 0, max: 100000, rate: 5},
 *   {min: 100000, max: 300000, rate: 10},
 *   {min: 300000, max: Infinity, rate: 15}
 * ];
 * const tax = calculateTaxFromBands(250000, bands);
 * // Returns: 25000 (5% on first 100k + 10% on next 150k)
 */
export function calculateTaxFromBands(taxableIncome, taxBands) {
  if (!ValidationService.isValidNumber(taxableIncome) || !Array.isArray(taxBands)) {
    console.error('calculateTaxFromBands: Invalid inputs');
    return 0;
  }

  let totalTax = 0;

  for (const band of taxBands) {
    if (taxableIncome <= band.min) {
      break; // Income doesn't reach this band
    }

    // Calculate income within this band
    const bandMin = band.min || 0;
    const bandMax = band.max || Infinity;
    const incomeInBand = Math.min(taxableIncome, bandMax) - bandMin;

    if (incomeInBand > 0) {
      const taxInBand = CalcEngine.multiply(incomeInBand, band.rate);
      totalTax = CalcEngine.add(totalTax, taxInBand);
    }
  }

  return CalcEngine.divide(totalTax, 100); // Convert percentage to actual tax
}

/**
 * Calculate personal cashflow statement
 * Projects income, expenses, and surplus/deficit over period
 *
 * @param {Object} incomeItems - Income sources (salary, investments, etc.)
 * @param {Object} expenseItems - Expense categories (rent, food, utilities, etc.)
 * @param {Object} investments - Savings/investment amounts
 * @returns {Object} Cashflow analysis with projections
 *
 * @example
 * const cashflow = calculatePersonalCashflow(
 *   { salary: 500000, investments: 50000 },
 *   { rent: 150000, utilities: 20000, food: 80000 },
 *   { savings: 100000 }
 * );
 */
export function calculatePersonalCashflow(incomeItems, expenseItems, investments) {
  if (!incomeItems || !expenseItems) {
    console.error('calculatePersonalCashflow: Income and expense items required');
    return null;
  }

  // Sum income sources
  let totalIncome = 0;
  const incomeBreakdown = {};
  for (const [source, amount] of Object.entries(incomeItems)) {
    if (ValidationService.isValidNumber(amount)) {
      totalIncome = CalcEngine.add(totalIncome, amount);
      incomeBreakdown[source] = CalcEngine.round(amount, 2);
    }
  }

  // Sum expenses
  let totalExpenses = 0;
  const expenseBreakdown = {};
  for (const [category, amount] of Object.entries(expenseItems)) {
    if (ValidationService.isValidNumber(amount)) {
      totalExpenses = CalcEngine.add(totalExpenses, amount);
      expenseBreakdown[category] = CalcEngine.round(amount, 2);
    }
  }

  // Calculate cashflow
  let totalInvestments = 0;
  if (investments) {
    for (const [type, amount] of Object.entries(investments)) {
      if (ValidationService.isValidNumber(amount)) {
        totalInvestments = CalcEngine.add(totalInvestments, amount);
      }
    }
  }

  const surplus = CalcEngine.subtract(
    CalcEngine.subtract(totalIncome, totalExpenses),
    totalInvestments
  );

  return {
    totalIncome: CalcEngine.round(totalIncome, 2),
    incomeBreakdown,
    totalExpenses: CalcEngine.round(totalExpenses, 2),
    expenseBreakdown,
    totalInvestments: CalcEngine.round(totalInvestments, 2),
    surplus: CalcEngine.round(surplus, 2),
    expenseRatio: totalIncome > 0
      ? CalcEngine.round(CalcEngine.divide(CalcEngine.multiply(totalExpenses, 100), totalIncome), 2)
      : 0,
    savingsRate: totalIncome > 0
      ? CalcEngine.round(CalcEngine.divide(CalcEngine.multiply(CalcEngine.add(totalInvestments, surplus), 100), totalIncome), 2)
      : 0
  };
}

/**
 * Calculate retirement savings projection
 * Projects growth of retirement savings with contributions and returns
 *
 * @param {number} currentSavings - Current retirement savings
 * @param {number} annualContribution - Annual contribution amount
 * @param {number} annualReturn - Expected annual return percentage
 * @param {number} yearsToRetirement - Years until retirement
 * @param {number} retirementYears - Years in retirement
 * @param {number} annualSpending - Annual spending in retirement
 * @returns {Object} Retirement analysis
 *
 * @example
 * const retirement = calculateRetirementProjection(
 *   1000000,      // Current savings
 *   200000,       // Annual contribution
 *   8,            // 8% annual return
 *   20,           // 20 years to retirement
 *   30,           // 30 years in retirement
 *   500000        // $500k annual spending
 * );
 */
export function calculateRetirementProjection(
  currentSavings,
  annualContribution,
  annualReturn,
  yearsToRetirement,
  retirementYears,
  annualSpending
) {
  if (!ValidationService.isValidNumber(currentSavings) ||
      !ValidationService.isValidNumber(annualContribution) ||
      !ValidationService.isValidNumber(annualReturn) ||
      !ValidationService.isValidNumber(yearsToRetirement)) {
    console.error('calculateRetirementProjection: Invalid inputs');
    return null;
  }

  // Project accumulation phase
  let savingsAtRetirement = currentSavings;
  const accumulationPhase = [];

  for (let year = 1; year <= yearsToRetirement; year++) {
    // Apply return on existing balance
    const returns = CalcEngine.multiply(savingsAtRetirement, annualReturn);
    const returnsAmount = CalcEngine.divide(returns, 100);

    // Add contribution
    savingsAtRetirement = CalcEngine.add(savingsAtRetirement, returnsAmount);
    savingsAtRetirement = CalcEngine.add(savingsAtRetirement, annualContribution);

    accumulationPhase.push({
      year,
      endingBalance: CalcEngine.round(savingsAtRetirement, 2)
    });
  }

  // Project retirement spending phase
  let balanceDuringRetirement = savingsAtRetirement;
  const retirementPhase = [];
  let viablYears = retirementYears;

  for (let year = 1; year <= retirementYears; year++) {
    // Check if sufficient balance exists
    if (balanceDuringRetirement < annualSpending) {
      viablYears = year - 1;
      break;
    }

    // Withdraw spending and apply return on remainder
    balanceDuringRetirement = CalcEngine.subtract(balanceDuringRetirement, annualSpending);
    const returns = CalcEngine.multiply(balanceDuringRetirement, annualReturn);
    const returnsAmount = CalcEngine.divide(returns, 100);
    balanceDuringRetirement = CalcEngine.add(balanceDuringRetirement, returnsAmount);

    retirementPhase.push({
      year,
      withdrawal: CalcEngine.round(annualSpending, 2),
      endingBalance: CalcEngine.round(balanceDuringRetirement, 2)
    });
  }

  const retirementViable = viablYears >= retirementYears;

  return {
    currentSavings: CalcEngine.round(currentSavings, 2),
    annualContribution: CalcEngine.round(annualContribution, 2),
    annualReturn,
    yearsToRetirement,
    savingsAtRetirement: CalcEngine.round(savingsAtRetirement, 2),
    accumulationPhase,
    retirementYears,
    annualSpending: CalcEngine.round(annualSpending, 2),
    balanceAtEndOfRetirement: CalcEngine.round(balanceDuringRetirement, 2),
    retirementPhase,
    retirementViable,
    viablYears,
    analysis: {
      message: retirementViable
        ? `Retirement plan is viable for ${viablYears} years`
        : `Retirement savings depleted after ${viablYears} years of planned ${retirementYears} years`,
      recommendation: retirementViable
        ? 'Savings are sufficient for retirement period'
        : 'Increase savings or reduce spending expectations'
    }
  };
}

/**
 * Calculate investment portfolio allocation
 * Analyzes portfolio composition and asset allocation percentages
 *
 * @param {Object} holdings - Investment holdings by type
 * @returns {Object} Portfolio analysis
 *
 * @example
 * const portfolio = calculatePortfolioAllocation({
 *   stocks: 300000,
 *   bonds: 150000,
 *   cash: 50000
 * });
 */
export function calculatePortfolioAllocation(holdings) {
  if (!holdings || typeof holdings !== 'object') {
    console.error('calculatePortfolioAllocation: Holdings object required');
    return null;
  }

  let totalValue = 0;
  const allocation = {};

  // Calculate total portfolio value
  for (const [asset, value] of Object.entries(holdings)) {
    if (ValidationService.isValidNumber(value) && value > 0) {
      totalValue = CalcEngine.add(totalValue, value);
    }
  }

  if (totalValue === 0) {
    console.error('calculatePortfolioAllocation: No holdings found');
    return null;
  }

  // Calculate allocation percentages
  for (const [asset, value] of Object.entries(holdings)) {
    if (ValidationService.isValidNumber(value) && value > 0) {
      const percentage = CalcEngine.divide(CalcEngine.multiply(value, 100), totalValue);
      allocation[asset] = {
        value: CalcEngine.round(value, 2),
        percentage: CalcEngine.round(percentage, 2)
      };
    }
  }

  return {
    totalPortfolioValue: CalcEngine.round(totalValue, 2),
    allocation,
    diversified: Object.keys(allocation).length >= 3,
    recommendation: Object.keys(allocation).length < 3
      ? 'Consider diversifying across more asset classes'
      : 'Portfolio is adequately diversified'
  };
}

/**
 * Calculate debt-to-income ratio
 * Important metric for financial health assessment
 *
 * @param {number} monthlyDebtPayments - Total monthly debt payments
 * @param {number} monthlyGrossIncome - Gross monthly income
 * @returns {number} Debt-to-income ratio as percentage
 *
 * @example
 * const dti = calculateDebtToIncomeRatio(5000, 25000);
 * // Returns: 20 (meaning 20% of income goes to debt service)
 */
export function calculateDebtToIncomeRatio(monthlyDebtPayments, monthlyGrossIncome) {
  if (!ValidationService.isValidNumber(monthlyDebtPayments) ||
      !ValidationService.isValidNumber(monthlyGrossIncome)) {
    console.error('calculateDebtToIncomeRatio: Invalid inputs');
    return 0;
  }

  if (monthlyGrossIncome === 0) {
    console.error('calculateDebtToIncomeRatio: Monthly income cannot be zero');
    return 0;
  }

  const ratio = CalcEngine.divide(CalcEngine.multiply(monthlyDebtPayments, 100), monthlyGrossIncome);
  return CalcEngine.round(ratio, 2);
}

/**
 * Calculate loan payment (PMT formula)
 * Calculates monthly payment for fixed-rate loan
 *
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate percentage
 * @param {number} months - Number of months
 * @returns {number} Monthly payment amount
 *
 * @example
 * const payment = calculateLoanPayment(500000, 8, 360);
 * // Returns: monthly payment for 500k loan at 8% over 30 years
 */
export function calculateLoanPayment(principal, annualRate, months) {
  if (!ValidationService.isValidNumber(principal) ||
      !ValidationService.isValidNumber(annualRate) ||
      !ValidationService.isValidNumber(months)) {
    console.error('calculateLoanPayment: Invalid inputs');
    return 0;
  }

  if (months === 0) {
    console.error('calculateLoanPayment: Months must be greater than zero');
    return 0;
  }

  // Convert annual rate to monthly
  const monthlyRate = CalcEngine.divide(annualRate, 12);
  const monthlyRateDecimal = CalcEngine.divide(monthlyRate, 100);

  // PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
  if (monthlyRateDecimal === 0) {
    // No interest - simple division
    return CalcEngine.divide(principal, months);
  }

  const numerator = CalcEngine.multiply(
    principal,
    CalcEngine.multiply(monthlyRateDecimal, Math.pow(1 + monthlyRateDecimal, months))
  );
  const denominator = CalcEngine.subtract(Math.pow(1 + monthlyRateDecimal, months), 1);

  return CalcEngine.round(CalcEngine.divide(numerator, denominator), 2);
}

/**
 * Calculate net worth
 * Total assets minus total liabilities
 *
 * @param {Object} assets - Asset values by category
 * @param {Object} liabilities - Liability values by category
 * @returns {Object} Net worth analysis
 *
 * @example
 * const netWorth = calculateNetWorth(
 *   { home: 2000000, investments: 500000, cash: 100000 },
 *   { mortgage: 1500000, loans: 50000 }
 * );
 */
export function calculateNetWorth(assets, liabilities) {
  if (!assets || !liabilities) {
    console.error('calculateNetWorth: Assets and liabilities required');
    return null;
  }

  let totalAssets = 0;
  const assetBreakdown = {};
  for (const [category, value] of Object.entries(assets)) {
    if (ValidationService.isValidNumber(value) && value > 0) {
      totalAssets = CalcEngine.add(totalAssets, value);
      assetBreakdown[category] = CalcEngine.round(value, 2);
    }
  }

  let totalLiabilities = 0;
  const liabilityBreakdown = {};
  for (const [category, value] of Object.entries(liabilities)) {
    if (ValidationService.isValidNumber(value) && value > 0) {
      totalLiabilities = CalcEngine.add(totalLiabilities, value);
      liabilityBreakdown[category] = CalcEngine.round(value, 2);
    }
  }

  const netWorth = CalcEngine.subtract(totalAssets, totalLiabilities);

  return {
    totalAssets: CalcEngine.round(totalAssets, 2),
    assetBreakdown,
    totalLiabilities: CalcEngine.round(totalLiabilities, 2),
    liabilityBreakdown,
    netWorth: CalcEngine.round(netWorth, 2),
    assetToLiabilityRatio: totalLiabilities > 0
      ? CalcEngine.round(CalcEngine.divide(totalAssets, totalLiabilities), 2)
      : 0,
    financialHealth: netWorth > 0 ? 'Positive' : 'Negative'
  };
}

/**
 * Generate personal finance report
 * Comprehensive summary of income, expenses, investments, and financial health
 *
 * @param {Object} profile - Personal financial profile
 * @returns {string} Formatted report
 */
export function generatePersonalFinanceReport(profile) {
  if (!profile) {
    return 'No profile data provided';
  }

  let report = '=== PERSONAL FINANCE REPORT ===\n\n';
  report += `Name: ${profile.name || 'Unknown'}\n`;
  report += `Report Date: ${new Date().toISOString()}\n\n`;

  if (profile.income) {
    report += '--- INCOME ---\n';
    for (const [source, amount] of Object.entries(profile.income)) {
      report += `${source}: ${amount}\n`;
    }
    report += '\n';
  }

  if (profile.expenses) {
    report += '--- EXPENSES ---\n';
    for (const [category, amount] of Object.entries(profile.expenses)) {
      report += `${category}: ${amount}\n`;
    }
    report += '\n';
  }

  if (profile.assets) {
    report += '--- ASSETS ---\n';
    for (const [category, amount] of Object.entries(profile.assets)) {
      report += `${category}: ${amount}\n`;
    }
    report += '\n';
  }

  if (profile.liabilities) {
    report += '--- LIABILITIES ---\n';
    for (const [category, amount] of Object.entries(profile.liabilities)) {
      report += `${category}: ${amount}\n`;
    }
  }

  return report;
}

export default {
  calculateNetIncome,
  calculateTaxFromBands,
  calculatePersonalCashflow,
  calculateRetirementProjection,
  calculatePortfolioAllocation,
  calculateDebtToIncomeRatio,
  calculateLoanPayment,
  calculateNetWorth,
  generatePersonalFinanceReport
};
