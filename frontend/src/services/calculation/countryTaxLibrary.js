/**
 * Country Tax Rule Library
 *
 * Comprehensive tax rules database with country-specific:
 * - Tax rates (personal, corporate, VAT)
 * - Filing requirements and deadlines
 * - Compliance rules
 * - Tax-specific logic
 *
 * Strict Rule: Tax rules must be sourced from official regulations.
 * This library represents our current knowledge - updates required quarterly.
 */

export const COUNTRY_TAX_RULES = {
  // ============================================================================
  // AFRICA - WEST
  // ============================================================================

  NG: {
    code: 'NG',
    name: 'Nigeria',
    region: 'West Africa',
    currency: 'NGN',

    // Corporate Income Tax
    corporateTax: {
      standardRate: 30, // 30% standard rate
      smallBusinessRate: 0, // SMEDAN exemption for SMEs
      minTaxableIncome: 25000000, // Minimum taxable income threshold
      effectiveFrom: '2024-01-01'
    },

    // Personal Income Tax
    personalIncomeTax: {
      bands: [
        { min: 0, max: 300000, rate: 1 },
        { min: 300000, max: 600000, rate: 3 },
        { min: 600000, max: 1100000, rate: 5 },
        { min: 1100000, max: 1600000, rate: 7 },
        { min: 1600000, max: 2100000, rate: 9 },
        { min: 2100000, max: Infinity, rate: 11 }
      ],
      standardDeduction: 200000,
      effectiveFrom: '2024-01-01'
    },

    // Value Added Tax
    vat: {
      standardRate: 7.5,
      reducedRate: 0, // No reduced rate
      exempted: ['healthcare', 'education', 'agricultural exports'],
      effectiveFrom: '2024-01-01'
    },

    // Withholding Taxes
    withholding: {
      interest: 10,
      dividends: 10,
      royalties: 5,
      managementFees: 5,
      technicalServices: 5,
      effectiveFrom: '2024-01-01'
    },

    // Filing Requirements
    filingRequirements: {
      corporateTaxReturn: {
        dueDate: 'Q3-end', // 90 days after year-end
        reportingPeriod: 'annual',
        requiresAudit: true
      },
      vat: {
        dueDate: 'monthly-21st',
        reportingPeriod: 'monthly',
        requiresAudit: false
      },
      paye: {
        dueDate: 'monthly-10th',
        reportingPeriod: 'monthly',
        requiresAudit: false
      }
    },

    // Tax Holidays & Incentives
    incentives: {
      exportPromotion: { rate: 20, duration: 5 },
      infrastructureDevelopment: { rate: 5, duration: 10 },
      agricultureExemption: { rate: 0, duration: 'indefinite' }
    },

    // Compliance Deadlines
    deadlines: {
      yearEnd: '12-31',
      filingDeadline: 'Q3-end',
      paymentDeadline: 'Q3-end',
      auditDeadline: '12-31'
    }
  },

  GH: {
    code: 'GH',
    name: 'Ghana',
    region: 'West Africa',
    currency: 'GHS',

    corporateTax: {
      standardRate: 25,
      smallBusinessRate: 15,
      smallBusinessThreshold: 100000,
      effectiveFrom: '2024-01-01'
    },

    personalIncomeTax: {
      bands: [
        { min: 0, max: 1500, rate: 0 },
        { min: 1500, max: 20000, rate: 5 },
        { min: 20000, max: 50000, rate: 10 },
        { min: 50000, max: Infinity, rate: 17 }
      ],
      standardDeduction: 1500,
      effectiveFrom: '2024-01-01'
    },

    vat: {
      standardRate: 15,
      reducedRate: 0,
      exempted: ['healthcare', 'education', 'basic food items'],
      effectiveFrom: '2024-01-01'
    },

    withholding: {
      interest: 10,
      dividends: 10,
      royalties: 10,
      contractPayments: 8,
      effectiveFrom: '2024-01-01'
    },

    filingRequirements: {
      corporateTaxReturn: {
        dueDate: '3-months-after-yearend',
        reportingPeriod: 'annual',
        requiresAudit: true
      },
      vat: {
        dueDate: 'monthly-14th',
        reportingPeriod: 'monthly',
        requiresAudit: false
      }
    },

    deadlines: {
      yearEnd: '12-31',
      filingDeadline: '3-months-after-yearend',
      paymentDeadline: '3-months-after-yearend'
    }
  },

  KE: {
    code: 'KE',
    name: 'Kenya',
    region: 'East Africa',
    currency: 'KES',

    corporateTax: {
      standardRate: 30,
      smallBusinessRate: 0,
      effectiveFrom: '2024-01-01'
    },

    personalIncomeTax: {
      bands: [
        { min: 0, max: 288000, rate: 10 },
        { min: 288000, max: 576000, rate: 15 },
        { min: 576000, max: 864000, rate: 20 },
        { min: 864000, max: 1152000, rate: 25 },
        { min: 1152000, max: Infinity, rate: 30 }
      ],
      standardDeduction: 2400,
      effectiveFrom: '2024-01-01'
    },

    vat: {
      standardRate: 16,
      reducedRate: 0,
      exempted: ['export services', 'healthcare', 'education'],
      effectiveFrom: '2024-01-01'
    },

    withholding: {
      interest: 15,
      dividends: 15,
      royalties: 20,
      managementFees: 20,
      technicalServices: 20,
      effectiveFrom: '2024-01-01'
    },

    filingRequirements: {
      corporateTaxReturn: {
        dueDate: '4-months-after-yearend',
        reportingPeriod: 'annual',
        requiresAudit: true
      },
      vat: {
        dueDate: 'monthly-25th',
        reportingPeriod: 'monthly',
        requiresAudit: false
      }
    },

    deadlines: {
      yearEnd: '12-31',
      filingDeadline: '4-months-after-yearend',
      paymentDeadline: '4-months-after-yearend'
    }
  },

  ZA: {
    code: 'ZA',
    name: 'South Africa',
    region: 'Southern Africa',
    currency: 'ZAR',

    corporateTax: {
      standardRate: 28,
      smallBusinessRate: 0,
      effectiveFrom: '2024-01-01'
    },

    personalIncomeTax: {
      bands: [
        { min: 0, max: 237100, rate: 18 },
        { min: 237100, max: 369600, rate: 26 },
        { min: 369600, max: 513100, rate: 31 },
        { min: 513100, max: 856400, rate: 36 },
        { min: 856400, max: 1705000, rate: 39 },
        { min: 1705000, max: 2500000, rate: 41 },
        { min: 2500000, max: Infinity, rate: 45 }
      ],
      standardDeduction: 0,
      effectiveFrom: '2024-01-01'
    },

    vat: {
      standardRate: 15,
      reducedRate: 0,
      exempted: ['basic food items', 'healthcare', 'water'],
      effectiveFrom: '2024-01-01'
    },

    withholding: {
      interest: 0,
      dividends: 20,
      royalties: 15,
      managementFees: 0,
      effectiveFrom: '2024-01-01'
    },

    filingRequirements: {
      corporateTaxReturn: {
        dueDate: '10-months-after-yearend',
        reportingPeriod: 'annual',
        requiresAudit: true
      },
      vat: {
        dueDate: 'bi-monthly',
        reportingPeriod: 'bi-monthly',
        requiresAudit: false
      }
    },

    deadlines: {
      yearEnd: '02-28', // February year-end is common in SA
      filingDeadline: '12-months-after-yearend',
      paymentDeadline: '10-months-after-yearend'
    }
  },

  // ============================================================================
  // EUROPE
  // ============================================================================

  GB: {
    code: 'GB',
    name: 'United Kingdom',
    region: 'Europe',
    currency: 'GBP',

    corporateTax: {
      standardRate: 25, // From April 2023 for profits > £250k
      smallBusinessRate: 19, // For profits ≤ £250k
      effectiveFrom: '2024-01-01'
    },

    personalIncomeTax: {
      bands: [
        { min: 0, max: 12570, rate: 0 },
        { min: 12570, max: 50270, rate: 20 },
        { min: 50270, max: 125140, rate: 40 },
        { min: 125140, max: Infinity, rate: 45 }
      ],
      standardDeduction: 12570,
      effectiveFrom: '2024-01-01'
    },

    vat: {
      standardRate: 20,
      reducedRate: 5,
      exempted: ['food (certain items)', 'healthcare', 'education'],
      effectiveFrom: '2024-01-01'
    },

    withholding: {
      interest: 0,
      dividends: 0,
      royalties: 0,
      effectiveFrom: '2024-01-01'
    },

    filingRequirements: {
      corporateTaxReturn: {
        dueDate: '12-months-after-yearend',
        reportingPeriod: 'annual',
        requiresAudit: true
      },
      vat: {
        dueDate: 'quarterly',
        reportingPeriod: 'quarterly',
        requiresAudit: false
      },
      paye: {
        dueDate: 'real-time',
        reportingPeriod: 'real-time',
        requiresAudit: false
      }
    },

    deadlines: {
      yearEnd: '04-05', // Tax year end
      filingDeadline: '12-months-after-yearend',
      paymentDeadline: '9-months-20-days-after-yearend'
    }
  },

  DE: {
    code: 'DE',
    name: 'Germany',
    region: 'Europe',
    currency: 'EUR',

    corporateTax: {
      standardRate: 30, // Includes trade tax
      effectiveFrom: '2024-01-01'
    },

    personalIncomeTax: {
      bands: [
        { min: 0, max: 11604, rate: 0 },
        { min: 11604, max: 47348, rate: 19 },
        { min: 47348, max: 115870, rate: 42 },
        { min: 115870, max: Infinity, rate: 45 }
      ],
      standardDeduction: 11604,
      effectiveFrom: '2024-01-01'
    },

    vat: {
      standardRate: 19,
      reducedRate: 7,
      exempted: ['healthcare', 'education', 'cultural services'],
      effectiveFrom: '2024-01-01'
    },

    withholding: {
      interest: 26.375, // Including solidarity tax
      dividends: 26.375,
      royalties: 26.375,
      effectiveFrom: '2024-01-01'
    },

    filingRequirements: {
      corporateTaxReturn: {
        dueDate: '5-months-after-yearend',
        reportingPeriod: 'annual',
        requiresAudit: true
      },
      vat: {
        dueDate: 'monthly-10th',
        reportingPeriod: 'monthly',
        requiresAudit: false
      }
    },

    deadlines: {
      yearEnd: '12-31',
      filingDeadline: '5-months-after-yearend',
      paymentDeadline: '5-months-after-yearend'
    }
  },

  // ============================================================================
  // NORTH AMERICA
  // ============================================================================

  US: {
    code: 'US',
    name: 'United States',
    region: 'North America',
    currency: 'USD',

    federalCorporateTax: {
      standardRate: 21,
      effectiveFrom: '2024-01-01'
    },

    personalIncomeTax: {
      bands: [
        { min: 0, max: 11000, rate: 10 },
        { min: 11000, max: 44725, rate: 12 },
        { min: 44725, max: 95375, rate: 22 },
        { min: 95375, max: 182100, rate: 24 },
        { min: 182100, max: 231250, rate: 32 },
        { min: 231250, max: 578125, rate: 35 },
        { min: 578125, max: Infinity, rate: 37 }
      ],
      standardDeduction: 13850,
      effectiveFrom: '2024-01-01'
    },

    stateVariation: true, // State taxes vary by jurisdiction

    vat: {
      federalSalesTax: 0, // No federal sales tax, states vary 0-10%
      effectiveFrom: '2024-01-01'
    },

    filingRequirements: {
      corporateTaxReturn: {
        dueDate: '3-months-15-days-after-yearend',
        reportingPeriod: 'annual',
        requiresAudit: true
      },
      payroll: {
        dueDate: 'quarterly-10th',
        reportingPeriod: 'quarterly',
        requiresAudit: false
      }
    },

    deadlines: {
      yearEnd: '12-31',
      filingDeadline: '3-months-15-days-after-yearend',
      paymentDeadline: '3-months-15-days-after-yearend',
      estimatedTax: 'quarterly'
    }
  },

  CA: {
    code: 'CA',
    name: 'Canada',
    region: 'North America',
    currency: 'CAD',

    federalCorporateTax: {
      standardRate: 15,
      smallBusinessRate: 9,
      smallBusinessThreshold: 500000,
      effectiveFrom: '2024-01-01'
    },

    personalIncomeTax: {
      bands: [
        { min: 0, max: 53359, rate: 15 },
        { min: 53359, max: 106717, rate: 20.5 },
        { min: 106717, max: 165430, rate: 26 },
        { min: 165430, max: 235675, rate: 29 },
        { min: 235675, max: Infinity, rate: 33 }
      ],
      standardDeduction: 15705,
      effectiveFrom: '2024-01-01'
    },

    gst: {
      standardRate: 5,
      provincialTax: true, // PST varies by province
      effectiveFrom: '2024-01-01'
    },

    filingRequirements: {
      corporateTaxReturn: {
        dueDate: '6-months-after-yearend',
        reportingPeriod: 'annual',
        requiresAudit: true
      },
      payroll: {
        dueDate: 'monthly-14th',
        reportingPeriod: 'monthly',
        requiresAudit: false
      }
    },

    deadlines: {
      yearEnd: '12-31',
      filingDeadline: '6-months-after-yearend',
      paymentDeadline: '2-months-26-days-after-yearend'
    }
  },

  // ============================================================================
  // ASIA PACIFIC
  // ============================================================================

  SG: {
    code: 'SG',
    name: 'Singapore',
    region: 'Asia Pacific',
    currency: 'SGD',

    corporateTax: {
      standardRate: 17,
      effectiveFrom: '2024-01-01'
    },

    personalIncomeTax: {
      bands: [
        { min: 0, max: 80000, rate: 0 },
        { min: 80000, max: 160000, rate: 2 },
        { min: 160000, max: 240000, rate: 3.5 },
        { min: 240000, max: 320000, rate: 7 },
        { min: 320000, max: 400000, rate: 11.5 },
        { min: 400000, max: 480000, rate: 15 },
        { min: 480000, max: Infinity, rate: 22 }
      ],
      standardDeduction: 0,
      effectiveFrom: '2024-01-01'
    },

    gst: {
      standardRate: 9,
      reducedRate: 0,
      exempt: ['healthcare', 'education', 'financial services'],
      effectiveFrom: '2024-01-01'
    },

    filingRequirements: {
      corporateTaxReturn: {
        dueDate: '5-months-after-yearend',
        reportingPeriod: 'annual',
        requiresAudit: true
      },
      gst: {
        dueDate: 'quarterly',
        reportingPeriod: 'quarterly',
        requiresAudit: false
      }
    },

    deadlines: {
      yearEnd: '12-31',
      filingDeadline: '5-months-after-yearend',
      paymentDeadline: '5-months-after-yearend'
    }
  },

  IN: {
    code: 'IN',
    name: 'India',
    region: 'Asia Pacific',
    currency: 'INR',

    corporateTax: {
      standardRate: 30,
      effectiveFrom: '2024-01-01'
    },

    personalIncomeTax: {
      bands: [
        { min: 0, max: 250000, rate: 0 },
        { min: 250000, max: 500000, rate: 5 },
        { min: 500000, max: 1000000, rate: 20 },
        { min: 1000000, max: Infinity, rate: 30 }
      ],
      standardDeduction: 50000,
      effectiveFrom: '2024-01-01'
    },

    gst: {
      rates: [5, 12, 18, 28],
      standardRate: 18,
      effectiveFrom: '2024-01-01'
    },

    filingRequirements: {
      corporateTaxReturn: {
        dueDate: '7-months-after-yearend',
        reportingPeriod: 'annual',
        requiresAudit: true
      },
      gst: {
        dueDate: 'monthly-14th',
        reportingPeriod: 'monthly',
        requiresAudit: false
      }
    },

    deadlines: {
      yearEnd: '03-31',
      filingDeadline: '7-months-after-yearend',
      paymentDeadline: '7-months-after-yearend'
    }
  },

  AU: {
    code: 'AU',
    name: 'Australia',
    region: 'Asia Pacific',
    currency: 'AUD',

    corporateTax: {
      standardRate: 30,
      smallBusinessRate: 25,
      smallBusinessThreshold: 50000000,
      effectiveFrom: '2024-01-01'
    },

    personalIncomeTax: {
      bands: [
        { min: 0, max: 18200, rate: 0 },
        { min: 18200, max: 45000, rate: 19 },
        { min: 45000, max: 120000, rate: 32.5 },
        { min: 120000, max: 180000, rate: 37 },
        { min: 180000, max: Infinity, rate: 45 }
      ],
      standardDeduction: 0,
      effectiveFrom: '2024-01-01'
    },

    gst: {
      standardRate: 10,
      reducedRate: 0,
      exempt: ['basic food items', 'healthcare', 'education'],
      effectiveFrom: '2024-01-01'
    },

    filingRequirements: {
      corporateTaxReturn: {
        dueDate: '5-months-after-yearend',
        reportingPeriod: 'annual',
        requiresAudit: true
      },
      gst: {
        dueDate: 'quarterly-28th',
        reportingPeriod: 'quarterly',
        requiresAudit: false
      }
    },

    deadlines: {
      yearEnd: '06-30',
      filingDeadline: '5-months-after-yearend',
      paymentDeadline: '5-months-after-yearend'
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getTaxRules = (countryCode) => {
  return COUNTRY_TAX_RULES[countryCode] || null;
};

export const getAllCountryTaxRules = () => {
  return COUNTRY_TAX_RULES;
};

export const getCountriesByRegion = (region) => {
  return Object.values(COUNTRY_TAX_RULES).filter(country => country.region === region);
};

export const calculateTaxBand = (income, taxBands) => {
  /**
   * Calculate income tax based on tax bands
   */
  let totalTax = 0;

  for (let i = 0; i < taxBands.length; i++) {
    const band = taxBands[i];
    if (income <= band.min) break;

    const taxableInThisBand = Math.min(income, band.max) - band.min;
    totalTax += (taxableInThisBand * band.rate) / 100;
  }

  return totalTax;
};

export default {
  COUNTRY_TAX_RULES,
  getTaxRules,
  getAllCountryTaxRules,
  getCountriesByRegion,
  calculateTaxBand
};
