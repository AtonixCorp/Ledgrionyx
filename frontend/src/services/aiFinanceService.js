// AI Financial Intelligence Service
// Provides mock AI predictions and insights

export const aiFinanceService = {
  // AI Cashflow Predictor
  predictCashflow: (transactions, currentBalance) => {
    const avgMonthlyExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 3;

    const avgMonthlyIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) / 3;

    const netMonthlyCashflow = avgMonthlyIncome - avgMonthlyExpenses;
    const monthsUntilEmpty = netMonthlyCashflow < 0
      ? Math.floor(currentBalance / Math.abs(netMonthlyCashflow))
      : Infinity;

    return {
      avgMonthlyExpenses,
      avgMonthlyIncome,
      netMonthlyCashflow,
      monthsUntilEmpty,
      prediction: monthsUntilEmpty === Infinity
        ? 'Your income exceeds expenses. Great job!'
        : monthsUntilEmpty > 6
        ? 'Your current savings can sustain you for ' + monthsUntilEmpty + ' months.'
        : monthsUntilEmpty > 3
        ? 'Warning: Only ' + monthsUntilEmpty + ' months of runway remaining.'
        : 'Critical: Only ' + monthsUntilEmpty + ' months left. Reduce spending immediately!',
      confidence: 85,
      recommendation: netMonthlyCashflow < 0
        ? 'Consider reducing expenses by $' + Math.abs(netMonthlyCashflow / 2).toFixed(2) + ' monthly.'
        : 'Maintain your current financial habits.',
      projectedBalance: currentBalance + (netMonthlyCashflow * 6)
    };
  },

  // AI Investment Risk Radar
  analyzeInvestmentRisk: (portfolio) => {
    const totalValue = portfolio.reduce((sum, asset) => sum + asset.value, 0);
    const volatileAssets = portfolio.filter(a => a.volatility === 'high');
    const volatilePercentage = (volatileAssets.reduce((sum, a) => sum + a.value, 0) / totalValue) * 100;

    const riskLevel = volatilePercentage > 60 ? 'critical'
      : volatilePercentage > 40 ? 'high'
      : volatilePercentage > 20 ? 'moderate'
      : 'low';

    return {
      riskLevel,
      volatilePercentage: volatilePercentage.toFixed(1),
      diversificationScore: Math.min(100, (portfolio.length * 20)),
      recommendation: riskLevel === 'critical'
        ? 'Portfolio is too risky. Consider moving ' + (volatilePercentage - 40).toFixed(0) + '% to stable assets.'
        : riskLevel === 'high'
        ? 'Risk is elevated. Consider rebalancing to reduce volatility.'
        : 'Risk level is appropriate for most investors.',
      suggestedRebalance: {
        stable: Math.max(0, 40 - (100 - volatilePercentage)),
        moderate: 40,
        aggressive: Math.min(volatilePercentage, 20)
      },
      confidence: 90
    };
  },

  // AI Fraud Pattern Detector
  detectFraudPatterns: (recentTransactions) => {
    const alerts = [];
    const today = new Date();

    // Check for unusual spending patterns
    const avgAmount = recentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / recentTransactions.length;
    const largeTransactions = recentTransactions.filter(t =>Math.abs(t.amount) > avgAmount * 3);

    if (largeTransactions.length > 0) {
      alerts.push({
        type: 'unusual_amount',
        severity: 'medium',
        message: 'Detected ' + largeTransactions.length + ' transactions significantly larger than your average.',
        transactions: largeTransactions.map(t => t.id),
        timestamp: today
      });
    }

    // Check for rapid succession transactions
    const last24h = recentTransactions.filter(t => {
      const txDate = new Date(t.date);
      return (today - txDate) < 24 * 60 * 60 * 1000;
    });

    if (last24h.length > 10) {
      alerts.push({
        type: 'rapid_transactions',
        severity: 'high',
        message: last24h.length + ' transactions in 24 hours. This is unusual for your account.',
        timestamp: today
      });
    }

    // Check for duplicate transactions
    const amounts = recentTransactions.map(t => t.amount);
    const duplicates = amounts.filter((item, index) => amounts.indexOf(item) !== index);

    if (duplicates.length > 2) {
      alerts.push({
        type: 'duplicate_amounts',
        severity: 'low',
        message: 'Multiple transactions with identical amounts detected.',
        timestamp: today
      });
    }

    return {
      alerts,
      fraudScore: alerts.length * 20,
      status: alerts.length === 0 ? 'secure'
        : alerts.some(a => a.severity === 'high') ? 'suspicious'
        : 'monitor',
      recommendation: alerts.length === 0
        ? 'No suspicious activity detected.'
        : 'Review flagged transactions and verify they are legitimate.',
      lastScanTime: today,
      confidence: 88
    };
  },

  // AI Tax Estimator
  estimateTaxes: (transactions, userProfile) => {
    const taxableIncome = transactions
      .filter(t => t.type === 'income' && !t.category?.includes('tax-exempt'))
      .reduce((sum, t) => sum + t.amount, 0);

    const deductibleExpenses = transactions
      .filter(t => t.type === 'expense' && (t.category === 'business' || t.category === 'charity'))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const capitalGains = transactions
      .filter(t => t.category === 'investment-gains')
      .reduce((sum, t) => sum + t.amount, 0);

    // Simplified progressive tax calculation
    const taxRate = userProfile?.country === 'US' ? 0.25 : 0.22;
    const capitalGainsTax = capitalGains * 0.15;
    const incomeTax = (taxableIncome - deductibleExpenses) * taxRate;
    const totalTaxEstimate = incomeTax + capitalGainsTax;

    return {
      taxableIncome,
      deductibleExpenses,
      capitalGains,
      estimatedTax: totalTaxEstimate,
      effectiveRate: ((totalTaxEstimate / taxableIncome) * 100).toFixed(2),
      breakdown: {
        incomeTax,
        capitalGainsTax,
        socialSecurity: taxableIncome * 0.062,
        medicare: taxableIncome * 0.0145
      },
      recommendations: [
        deductibleExpenses < taxableIncome * 0.1
          ? 'Consider tracking more deductible expenses to reduce tax burden.'
          : 'Good job tracking deductible expenses.',
        'Estimated quarterly tax: $' + (totalTaxEstimate / 4).toFixed(2),
        capitalGains > 0
          ? 'Consider tax-loss harvesting strategies to offset capital gains.'
          : null
      ].filter(Boolean),
      confidence: 82,
      lastCalculated: new Date()
    };
  }
};
