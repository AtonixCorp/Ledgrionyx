// Financial DNA Profile Service
// Analyzes user behavior to create personalized financial personality profile

export const financialDNAService = {
  // Analyze user's complete financial DNA
  analyzeFinancialDNA: (transactions, portfolio, userProfile) => {
    const spendingPersonality = analyzeSpendingPersonality(transactions);
    const riskTolerance = analyzeRiskTolerance(portfolio);
    const savingsDiscipline = analyzeSavingsDiscipline(transactions);
    const investmentArchetype = analyzeInvestmentArchetype(portfolio);
    const cryptoComfort = analyzeCryptoComfort(portfolio);

    return {
      spendingPersonality,
      riskTolerance,
      savingsDiscipline,
      investmentArchetype,
      cryptoComfort,
      overallProfile: generateOverallProfile({
        spendingPersonality,
        riskTolerance,
        savingsDiscipline,
        investmentArchetype,
        cryptoComfort
      }),
      generatedAt: new Date()
    };
  }
};

// Helper: Analyze spending personality
function analyzeSpendingPersonality(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalSpent = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const categorySpending = {};
  expenses.forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + Math.abs(t.amount);
  });

  const luxuryCategories = ['entertainment', 'shopping', 'dining'];

  const luxurySpending = luxuryCategories.reduce((sum, cat) => sum + (categorySpending[cat] || 0), 0);

  const luxuryRatio = (luxurySpending / totalSpent) * 100;

  let personality = 'balanced';
  let description = 'You maintain a healthy balance between enjoying life and being responsible.';

  if (luxuryRatio > 40) {
    personality = 'indulgent';
    description = 'You enjoy treating yourself and prioritize experiences and quality of life.';
  } else if (luxuryRatio < 15) {
    personality = 'frugal';
    description = 'You are highly disciplined and prefer to save rather than spend on luxuries.';
  }

  return {
    type: personality,
    description,
    luxuryRatio: luxuryRatio.toFixed(1),
    topCategories: Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat, amount]) => ({ category: cat, amount, percentage: ((amount / totalSpent) * 100).toFixed(1) })),
    score: personality === 'balanced' ? 85 : personality === 'frugal' ? 95 : 70
  };
}

// Helper: Analyze risk tolerance
function analyzeRiskTolerance(portfolio) {
  const totalValue = portfolio.reduce((sum, asset) => sum + asset.value, 0);
  const highRiskValue = portfolio.filter(a => a.volatility === 'high').reduce((sum, a) => sum + a.value, 0);
  const highRiskPercentage = (highRiskValue / totalValue) * 100;

  let tolerance = 'moderate';
  let description = 'You accept moderate risk for reasonable returns.';
  let score = 60;

  if (highRiskPercentage > 50) {
    tolerance = 'aggressive';
    description = 'You embrace high risk for potential high rewards.';
    score = 85;
  } else if (highRiskPercentage < 15) {
    tolerance = 'conservative';
    description = 'You prioritize capital preservation over aggressive growth.';
    score = 40;
  }

  return {
    level: tolerance,
    description,
    score,
    highRiskPercentage: highRiskPercentage.toFixed(1),
    recommendation: tolerance === 'aggressive'
      ? 'Consider adding some stable assets for downside protection.'
      : tolerance === 'conservative'
      ? 'You might benefit from slightly more growth-oriented investments.'
      : 'Your risk profile is well-balanced.'
  };
}

// Helper: Analyze savings discipline
function analyzeSavingsDiscipline(transactions) {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const savingsRate = ((income - expenses) / income) * 100;

  let discipline = 'moderate';
  let description = 'You save a reasonable portion of your income.';
  let score = 60;

  if (savingsRate > 30) {
    discipline = 'excellent';
    description = 'You are an exceptional saver with strong financial discipline.';
    score = 95;
  } else if (savingsRate > 15) {
    discipline = 'good';
    description = 'You maintain healthy savings habits.';
    score = 75;
  } else if (savingsRate > 0) {
    discipline = 'developing';
    description = 'You save some money, but there is room for improvement.';
    score = 50;
  } else {
    discipline = 'needs-attention';
    description = 'Your expenses exceed income. Focus on budgeting.';
    score = 25;
  }

  return {
    level: discipline,
    description,
    score,
    savingsRate: savingsRate.toFixed(1),
    monthlySavings: ((income - expenses) / 3).toFixed(2),
    recommendation: savingsRate < 10
      ? 'Aim to save at least 10-15% of your income.'
      : savingsRate < 20
      ? 'Try to increase savings to 20% for better financial security.'
      : 'Excellent! Maintain or increase your savings rate.'
  };
}

// Helper: Analyze investment archetype
function analyzeInvestmentArchetype(portfolio) {
  const assetTypes = {};
  portfolio.forEach(asset => {
    assetTypes[asset.type] = (assetTypes[asset.type] || 0) + 1;
  });

  const hasCrypto = portfolio.some(a => a.type === 'crypto');
  const hasStocks = portfolio.some(a => a.type === 'stock');
  const hasBonds = portfolio.some(a => a.type === 'bond');

  let archetype = 'explorer';
  let description = 'You are diversifying across multiple asset classes.';
  let traits = ['Curious', 'Adaptive', 'Open-minded'];

  if (hasCrypto && !hasStocks && !hasBonds) {
    archetype = 'crypto-pioneer';
    description = 'You are heavily focused on cryptocurrency and emerging digital assets.';
    traits = ['Innovative', 'Risk-taking', 'Tech-savvy'];
  } else if (hasStocks && hasBonds && !hasCrypto) {
    archetype = 'traditional-investor';
    description = 'You prefer established markets and proven investment vehicles.';
    traits = ['Prudent', 'Patient', 'Analytical'];
  } else if (portfolio.length > 10) {
    archetype = 'maximalist-diversifier';
    description = 'You spread investments across many assets to minimize risk.';
    traits = ['Strategic', 'Risk-averse', 'Methodical'];
  }

  return {
    type: archetype,
    description,
    traits,
    assetMix: Object.entries(assetTypes).map(([type, count]) => ({
      type,
      count,
      percentage: ((count / portfolio.length) * 100).toFixed(1)
    })),
    diversificationLevel: portfolio.length > 10 ? 'high' : portfolio.length > 5 ? 'moderate' : 'low'
  };
}

// Helper: Analyze crypto volatility comfort
function analyzeCryptoComfort(portfolio) {
  const cryptoAssets = portfolio.filter(a => a.type === 'crypto');
  const totalValue = portfolio.reduce((sum, asset) => sum + asset.value, 0);
  const cryptoValue = cryptoAssets.reduce((sum, asset) => sum + asset.value, 0);
  const cryptoPercentage = (cryptoValue / totalValue) * 100;

  let comfort = 'moderate';
  let description = 'You hold a balanced amount of crypto assets.';
  let score = 50;

  if (cryptoPercentage > 50) {
    comfort = 'very-high';
    description = 'You are highly comfortable with crypto volatility.';
    score = 90;
  } else if (cryptoPercentage > 25) {
    comfort = 'high';
    description = 'You are comfortable holding significant crypto positions.';
    score = 70;
  } else if (cryptoPercentage > 10) {
    comfort = 'moderate';
    description = 'You allocate a reasonable portion to crypto.';
    score = 50;
  } else if (cryptoPercentage > 0) {
    comfort = 'low';
    description = 'You are cautious with crypto exposure.';
    score = 30;
  } else {
    comfort = 'none';
    description = 'You currently avoid cryptocurrency investments.';
    score = 0;
  }

  return {
    level: comfort,
    description,
    score,
    cryptoPercentage: cryptoPercentage.toFixed(1),
    topCryptoAssets: cryptoAssets.slice(0, 3).map(a => ({ name: a.name, value: a.value })),
    recommendation: comfort === 'very-high'
      ? 'Consider diversifying into stable assets to reduce portfolio volatility.'
      : comfort === 'none'
      ? 'Consider allocating 5-10% to crypto for diversification.'
      : 'Your crypto allocation seems appropriate.'
  };
}

// Generate overall profile summary
function generateOverallProfile(profiles) {
  const scores = [
    profiles.spendingPersonality.score,
    profiles.riskTolerance.score,
    profiles.savingsDiscipline.score
  ];
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  let summary = 'balanced-achiever';
  let description = 'You demonstrate balanced financial behaviors across multiple dimensions.';

  if (avgScore > 80) {
    summary = 'financial-master';
    description = 'You exhibit exceptional financial discipline and intelligence.';
  } else if (avgScore > 60) {
    summary = 'growing-investor';
    description = 'You are building strong financial habits and making smart decisions.';
  } else if (avgScore < 50) {
    summary = 'emerging-learner';
    description = 'You are developing your financial skills and building better habits.';
  }

  return {
    type: summary,
    description,
    overallScore: avgScore.toFixed(0),
    strengths: getStrengths(profiles),
    growthAreas: getGrowthAreas(profiles)
  };
}

function getStrengths(profiles) {
  const strengths = [];
  if (profiles.savingsDiscipline.score > 75) strengths.push('Strong savings discipline');
  if (profiles.riskTolerance.score > 70) strengths.push('Comfortable with investment risk');
  if (profiles.spendingPersonality.score > 80) strengths.push('Balanced spending habits');
  if (profiles.cryptoComfort.score > 60) strengths.push('Embraces emerging technologies');
  return strengths.length > 0 ? strengths : ['Building financial foundation'];
}

function getGrowthAreas(profiles) {
  const areas = [];
  if (profiles.savingsDiscipline.score < 50) areas.push('Increase savings rate');
  if (profiles.riskTolerance.score < 40) areas.push('Consider moderate growth investments');
  if (profiles.spendingPersonality.score < 60) areas.push('Review discretionary spending');
  if (profiles.investmentArchetype.diversificationLevel === 'low') areas.push('Diversify portfolio');
  return areas.length > 0 ? areas : ['Maintain current financial practices'];
}
