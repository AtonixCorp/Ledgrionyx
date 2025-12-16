/**
 * Advanced AI Features Engine
 * Provides sophisticated AI capabilities: anomaly detection, pattern recognition,
 * trend analysis, and predictive analytics for financial modeling
 * 
 * @module advancedAIFeaturesEngine
 * @version 1.0.0
 */

import * as CalcEngine from '../calculation/calculationEngine';

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

/**
 * Detect anomalies in forecast results using statistical methods
 * @param {Array<number>} values - Array of forecast values
 * @param {Object} options - Detection options
 * @returns {Object} Anomaly detection results
 */
export const detectForecastAnomalies = (values, options = {}) => {
  if (!values || values.length < 3) {
    return { anomalies: [], confidence: 0, message: 'Insufficient data' };
  }

  const anomalies = [];
  const { threshold = 2.5, excludeEdges = true } = options;

  try {
    // Calculate mean and standard deviation
    const mean = CalcEngine.arraySum(values) / values.length;
    const variance = CalcEngine.arraySum(
      values.map(v => CalcEngine.power(CalcEngine.subtract(v, mean), 2))
    ) / values.length;
    const stdDev = CalcEngine.squareRoot(variance);

    // Check for outliers using z-score method
    const startIdx = excludeEdges ? 1 : 0;
    const endIdx = excludeEdges ? values.length - 1 : values.length;

    for (let i = startIdx; i < endIdx; i++) {
      const zScore = stdDev > 0 
        ? CalcEngine.divide(CalcEngine.subtract(values[i], mean), stdDev)
        : 0;

      if (CalcEngine.absoluteValue(zScore) > threshold) {
        anomalies.push({
          index: i,
          value: values[i],
          zScore: CalcEngine.round(zScore, 2),
          type: CalcEngine.greaterThan(zScore, 0) ? 'SPIKE' : 'DIP',
          severity: CalcEngine.absoluteValue(zScore) > 4 ? 'CRITICAL' : 'WARNING',
          confidence: CalcEngine.min(95, CalcEngine.round(
            CalcEngine.multiply(CalcEngine.absoluteValue(zScore) / threshold, 85),
            0
          ))
        });
      }
    }

    return {
      anomalies,
      mean: CalcEngine.round(mean, 2),
      stdDev: CalcEngine.round(stdDev, 2),
      count: anomalies.length,
      confidence: anomalies.length > 0 ? 85 : 95
    };
  } catch (error) {
    return {
      anomalies: [],
      error: error.message,
      confidence: 0
    };
  }
};

/**
 * Detect anomalies in valuation multiples
 * @param {Array<number>} multiples - Array of valuation multiples
 * @param {Object} benchmarks - Industry benchmarks
 * @returns {Object} Anomaly detection results
 */
export const detectValuationAnomalies = (multiples, benchmarks) => {
  if (!multiples || multiples.length === 0) {
    return { anomalies: [], confidence: 0 };
  }

  const anomalies = [];

  try {
    for (let i = 0; i < multiples.length; i++) {
      const multiple = multiples[i];
      const { min, max, median } = benchmarks || { min: 8, max: 15, median: 11 };

      if (CalcEngine.lessThan(multiple, min)) {
        anomalies.push({
          index: i,
          value: multiple,
          type: 'UNDERVALUED',
          vs_benchmark: CalcEngine.round(
            CalcEngine.subtract(multiple, median),
            2
          ),
          opportunity: 'POTENTIAL_ACQUISITION_TARGET',
          confidence: 80
        });
      } else if (CalcEngine.greaterThan(multiple, max)) {
        anomalies.push({
          index: i,
          value: multiple,
          type: 'OVERVALUED',
          vs_benchmark: CalcEngine.round(
            CalcEngine.subtract(multiple, median),
            2
          ),
          risk: 'VALUATION_CORRECTION',
          confidence: 80
        });
      }
    }

    return {
      anomalies,
      count: anomalies.length,
      confidence: 80
    };
  } catch (error) {
    return {
      anomalies: [],
      error: error.message,
      confidence: 0
    };
  }
};

// ============================================================================
// PATTERN RECOGNITION
// ============================================================================

/**
 * Detect patterns in financial data
 * @param {Array<number>} values - Array of values
 * @param {string} modelType - Type of model
 * @returns {Object} Pattern recognition results
 */
export const recognizePatterns = (values, modelType = 'forecasting') => {
  if (!values || values.length < 3) {
    return { patterns: [], confidence: 0 };
  }

  const patterns = [];

  try {
    // Calculate growth rates
    const growthRates = [];
    for (let i = 1; i < values.length; i++) {
      const rate = CalcEngine.divide(
        CalcEngine.subtract(values[i], values[i - 1]),
        values[i - 1]
      );
      growthRates.push(rate);
    }

    // Pattern 1: Linear Growth
    if (isLinearGrowth(values)) {
      patterns.push({
        type: 'LINEAR_GROWTH',
        description: 'Consistent linear growth pattern detected',
        confidence: 85,
        implication: 'Predictable and stable, suitable for conservative forecasting'
      });
    }

    // Pattern 2: Exponential Growth
    if (isExponentialGrowth(growthRates)) {
      patterns.push({
        type: 'EXPONENTIAL_GROWTH',
        description: 'Accelerating growth pattern detected',
        confidence: 80,
        implication: 'Compound effects present, may not be sustainable long-term'
      });
    }

    // Pattern 3: Cyclical Pattern
    if (isCyclicalPattern(values)) {
      patterns.push({
        type: 'CYCLICAL',
        description: 'Cyclical/seasonal pattern detected',
        confidence: 75,
        implication: 'Regular peaks and troughs, adjust for seasonality'
      });
    }

    // Pattern 4: Trend Reversal
    if (isTrendReversal(growthRates)) {
      patterns.push({
        type: 'TREND_REVERSAL',
        description: 'Trend reversal point detected',
        confidence: 70,
        implication: 'Direction change likely, monitor closely for confirmation'
      });
    }

    // Pattern 5: Volatility Increase
    if (isVolatilityIncreasing(growthRates)) {
      patterns.push({
        type: 'INCREASING_VOLATILITY',
        description: 'Volatility is increasing over time',
        confidence: 80,
        implication: 'Risk is rising, forecast uncertainty increasing'
      });
    }

    return {
      patterns,
      count: patterns.length,
      confidence: patterns.length > 0 ? 78 : 0
    };
  } catch (error) {
    return {
      patterns: [],
      error: error.message,
      confidence: 0
    };
  }
};

// Helper functions for pattern recognition
const isLinearGrowth = (values) => {
  if (values.length < 4) return false;
  
  const diffs = [];
  for (let i = 1; i < values.length; i++) {
    diffs.push(CalcEngine.subtract(values[i], values[i - 1]));
  }
  
  const avgDiff = CalcEngine.arraySum(diffs) / diffs.length;
  const variance = CalcEngine.arraySum(
    diffs.map(d => CalcEngine.power(CalcEngine.subtract(d, avgDiff), 2))
  ) / diffs.length;
  
  return CalcEngine.lessThan(variance, CalcEngine.power(avgDiff, 2) * 0.1);
};

const isExponentialGrowth = (growthRates) => {
  if (growthRates.length < 3) return false;
  
  // Check if growth rates are increasing
  let increasing = true;
  for (let i = 1; i < growthRates.length; i++) {
    if (CalcEngine.lessThanOrEqual(growthRates[i], growthRates[i - 1])) {
      increasing = false;
      break;
    }
  }
  
  return increasing && CalcEngine.greaterThan(growthRates[growthRates.length - 1], 0.15);
};

const isCyclicalPattern = (values) => {
  if (values.length < 6) return false;
  
  // Look for repeating min-max patterns
  const peaks = [];
  const troughs = [];
  
  for (let i = 1; i < values.length - 1; i++) {
    if (CalcEngine.greaterThan(values[i], values[i - 1]) && 
        CalcEngine.greaterThan(values[i], values[i + 1])) {
      peaks.push(i);
    }
    if (CalcEngine.lessThan(values[i], values[i - 1]) && 
        CalcEngine.lessThan(values[i], values[i + 1])) {
      troughs.push(i);
    }
  }
  
  return peaks.length >= 2 && troughs.length >= 2;
};

const isTrendReversal = (growthRates) => {
  if (growthRates.length < 3) return false;
  
  const lastThree = growthRates.slice(-3);
  const signChanged = (lastThree[0] > 0 && lastThree[2] < 0) ||
                      (lastThree[0] < 0 && lastThree[2] > 0);
  
  return signChanged;
};

const isVolatilityIncreasing = (growthRates) => {
  if (growthRates.length < 6) return false;
  
  const firstHalf = growthRates.slice(0, CalcEngine.divide(growthRates.length, 2));
  const secondHalf = growthRates.slice(CalcEngine.divide(growthRates.length, 2));
  
  const var1 = calculateVariance(firstHalf);
  const var2 = calculateVariance(secondHalf);
  
  return CalcEngine.greaterThan(var2, CalcEngine.multiply(var1, 1.5));
};

const calculateVariance = (values) => {
  if (values.length === 0) return 0;
  const mean = CalcEngine.arraySum(values) / values.length;
  return CalcEngine.arraySum(
    values.map(v => CalcEngine.power(CalcEngine.subtract(v, mean), 2))
  ) / values.length;
};

// ============================================================================
// TREND ANALYSIS
// ============================================================================

/**
 * Analyze trends in financial data
 * @param {Array<number>} values - Array of values
 * @param {number} periods - Number of periods for trend calculation
 * @returns {Object} Trend analysis results
 */
export const analyzeTrends = (values, periods = 3) => {
  if (!values || values.length < periods + 1) {
    return { trend: null, confidence: 0 };
  }

  try {
    const recentValues = values.slice(-periods);
    const historicalValues = values.slice(0, values.length - periods);
    
    const recentAvg = CalcEngine.arraySum(recentValues) / recentValues.length;
    const historicalAvg = CalcEngine.arraySum(historicalValues) / historicalValues.length;
    
    const trendChange = CalcEngine.divide(
      CalcEngine.subtract(recentAvg, historicalAvg),
      historicalAvg
    );

    let direction = 'STABLE';
    let strength = 'NEUTRAL';
    let confidence = 50;

    if (CalcEngine.greaterThan(trendChange, 0.1)) {
      direction = 'UPWARD';
      strength = CalcEngine.greaterThan(trendChange, 0.25) ? 'STRONG' : 'MODERATE';
      confidence = 80;
    } else if (CalcEngine.lessThan(trendChange, -0.1)) {
      direction = 'DOWNWARD';
      strength = CalcEngine.lessThan(trendChange, -0.25) ? 'STRONG' : 'MODERATE';
      confidence = 80;
    }

    return {
      trend: {
        direction,
        strength,
        changePercent: CalcEngine.round(CalcEngine.multiply(trendChange, 100), 2),
        recentAvg: CalcEngine.round(recentAvg, 2),
        historicalAvg: CalcEngine.round(historicalAvg, 2)
      },
      confidence
    };
  } catch (error) {
    return {
      trend: null,
      error: error.message,
      confidence: 0
    };
  }
};

/**
 * Calculate trend momentum
 * @param {Array<number>} values - Array of values
 * @returns {Object} Momentum analysis
 */
export const calculateMomentum = (values) => {
  if (!values || values.length < 2) {
    return { momentum: 0, direction: 'NEUTRAL', confidence: 0 };
  }

  try {
    const recent = values[values.length - 1];
    const previous = values[values.length - 2];
    const momentum = CalcEngine.divide(
      CalcEngine.subtract(recent, previous),
      previous
    );

    let direction = 'NEUTRAL';
    if (CalcEngine.greaterThan(momentum, 0.05)) {
      direction = 'POSITIVE';
    } else if (CalcEngine.lessThan(momentum, -0.05)) {
      direction = 'NEGATIVE';
    }

    return {
      momentum: CalcEngine.round(momentum, 4),
      direction,
      percentChange: CalcEngine.round(CalcEngine.multiply(momentum, 100), 2),
      confidence: 75
    };
  } catch (error) {
    return {
      momentum: 0,
      direction: 'ERROR',
      error: error.message,
      confidence: 0
    };
  }
};

// ============================================================================
// PREDICTIVE ANALYTICS
// ============================================================================

/**
 * Predict future values using linear regression
 * @param {Array<number>} values - Historical values
 * @param {number} periods - Number of periods to forecast
 * @returns {Object} Prediction results
 */
export const predictWithLinearRegression = (values, periods = 3) => {
  if (!values || values.length < 2) {
    return { predictions: [], confidence: 0 };
  }

  try {
    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i + 1);
    const yValues = values;

    // Calculate slope and intercept
    const xMean = CalcEngine.arraySum(xValues) / n;
    const yMean = CalcEngine.arraySum(yValues) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = CalcEngine.subtract(xValues[i], xMean);
      const yDiff = CalcEngine.subtract(yValues[i], yMean);
      numerator = CalcEngine.add(numerator, CalcEngine.multiply(xDiff, yDiff));
      denominator = CalcEngine.add(denominator, CalcEngine.power(xDiff, 2));
    }

    const slope = CalcEngine.divide(numerator, denominator);
    const intercept = CalcEngine.subtract(yMean, CalcEngine.multiply(slope, xMean));

    // Generate predictions
    const predictions = [];
    for (let i = 1; i <= periods; i++) {
      const x = CalcEngine.add(n, i);
      const predictedValue = CalcEngine.add(
        intercept,
        CalcEngine.multiply(slope, x)
      );

      predictions.push({
        period: i,
        predictedValue: CalcEngine.round(predictedValue, 2),
        trend: slope > 0 ? 'INCREASING' : 'DECREASING'
      });
    }

    // Calculate R-squared for confidence
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < n; i++) {
      const predicted = CalcEngine.add(
        intercept,
        CalcEngine.multiply(slope, xValues[i])
      );
      ssRes = CalcEngine.add(ssRes, CalcEngine.power(CalcEngine.subtract(yValues[i], predicted), 2));
      ssTot = CalcEngine.add(ssTot, CalcEngine.power(CalcEngine.subtract(yValues[i], yMean), 2));
    }

    const rSquared = ssTot > 0 ? CalcEngine.subtract(1, CalcEngine.divide(ssRes, ssTot)) : 0;
    const confidence = CalcEngine.multiply(rSquared, 100);

    return {
      predictions,
      slope: CalcEngine.round(slope, 4),
      intercept: CalcEngine.round(intercept, 2),
      rSquared: CalcEngine.round(rSquared, 4),
      confidence: CalcEngine.min(95, CalcEngine.max(50, CalcEngine.round(confidence, 0)))
    };
  } catch (error) {
    return {
      predictions: [],
      error: error.message,
      confidence: 0
    };
  }
};

/**
 * Predict financial health score
 * @param {Object} financialMetrics - Financial metrics
 * @returns {Object} Health prediction
 */
export const predictFinancialHealth = (financialMetrics) => {
  if (!financialMetrics) {
    return { healthScore: 0, outlook: 'UNKNOWN', factors: [] };
  }

  const {
    profitMargin = 0,
    debtToEquity = 0,
    currentRatio = 0,
    growthRate = 0,
    roa = 0
  } = financialMetrics;

  let score = 0;
  const factors = [];

  try {
    // Profitability factor (0-25 points)
    if (CalcEngine.greaterThan(profitMargin, 0.15)) {
      score = CalcEngine.add(score, 25);
      factors.push({ factor: 'Profitability', contribution: 25, status: 'EXCELLENT' });
    } else if (CalcEngine.greaterThan(profitMargin, 0.1)) {
      score = CalcEngine.add(score, 20);
      factors.push({ factor: 'Profitability', contribution: 20, status: 'GOOD' });
    } else if (CalcEngine.greaterThan(profitMargin, 0.05)) {
      score = CalcEngine.add(score, 12);
      factors.push({ factor: 'Profitability', contribution: 12, status: 'FAIR' });
    } else {
      factors.push({ factor: 'Profitability', contribution: 0, status: 'POOR' });
    }

    // Leverage factor (0-25 points)
    if (CalcEngine.lessThan(debtToEquity, 0.5)) {
      score = CalcEngine.add(score, 25);
      factors.push({ factor: 'Leverage', contribution: 25, status: 'EXCELLENT' });
    } else if (CalcEngine.lessThan(debtToEquity, 1.0)) {
      score = CalcEngine.add(score, 18);
      factors.push({ factor: 'Leverage', contribution: 18, status: 'GOOD' });
    } else if (CalcEngine.lessThan(debtToEquity, 2.0)) {
      score = CalcEngine.add(score, 10);
      factors.push({ factor: 'Leverage', contribution: 10, status: 'FAIR' });
    } else {
      factors.push({ factor: 'Leverage', contribution: 0, status: 'POOR' });
    }

    // Liquidity factor (0-25 points)
    if (CalcEngine.greaterThan(currentRatio, 2.0)) {
      score = CalcEngine.add(score, 25);
      factors.push({ factor: 'Liquidity', contribution: 25, status: 'EXCELLENT' });
    } else if (CalcEngine.greaterThan(currentRatio, 1.5)) {
      score = CalcEngine.add(score, 20);
      factors.push({ factor: 'Liquidity', contribution: 20, status: 'GOOD' });
    } else if (CalcEngine.greaterThan(currentRatio, 1.0)) {
      score = CalcEngine.add(score, 12);
      factors.push({ factor: 'Liquidity', contribution: 12, status: 'FAIR' });
    } else {
      factors.push({ factor: 'Liquidity', contribution: 0, status: 'POOR' });
    }

    // Growth factor (0-25 points)
    if (CalcEngine.greaterThan(growthRate, 0.2)) {
      score = CalcEngine.add(score, 25);
      factors.push({ factor: 'Growth', contribution: 25, status: 'EXCELLENT' });
    } else if (CalcEngine.greaterThan(growthRate, 0.1)) {
      score = CalcEngine.add(score, 20);
      factors.push({ factor: 'Growth', contribution: 20, status: 'GOOD' });
    } else if (CalcEngine.greaterThan(growthRate, 0)) {
      score = CalcEngine.add(score, 12);
      factors.push({ factor: 'Growth', contribution: 12, status: 'FAIR' });
    } else {
      factors.push({ factor: 'Growth', contribution: 0, status: 'POOR' });
    }

    let outlook = 'DETERIORATING';
    if (score > 85) {
      outlook = 'EXCELLENT';
    } else if (score > 70) {
      outlook = 'GOOD';
    } else if (score > 50) {
      outlook = 'FAIR';
    } else if (score > 30) {
      outlook = 'CONCERNING';
    }

    return {
      healthScore: CalcEngine.round(score, 0),
      outlook,
      factors,
      confidence: 80
    };
  } catch (error) {
    return {
      healthScore: 0,
      outlook: 'ERROR',
      error: error.message,
      factors: [],
      confidence: 0
    };
  }
};

// ============================================================================
// RISK PREDICTION
// ============================================================================

/**
 * Predict future risk levels based on current trends
 * @param {Object} riskMetrics - Current risk metrics
 * @param {Array<number>} historicalValues - Historical data for trend analysis
 * @returns {Object} Risk prediction
 */
export const predictRiskEscalation = (riskMetrics, historicalValues = []) => {
  const {
    currentRiskScore = 0,
    volatility = 0,
    concentration = 0,
    changeRate = 0
  } = riskMetrics;

  try {
    let escalationProbability = 0;
    const factors = [];

    // Factor 1: Current risk level
    if (CalcEngine.greaterThan(currentRiskScore, 70)) {
      escalationProbability = CalcEngine.add(escalationProbability, 25);
      factors.push({
        factor: 'High Current Risk',
        contribution: 25,
        description: 'Already elevated risk levels'
      });
    }

    // Factor 2: Volatility trend
    if (CalcEngine.greaterThan(volatility, 0.3)) {
      escalationProbability = CalcEngine.add(escalationProbability, 20);
      factors.push({
        factor: 'High Volatility',
        contribution: 20,
        description: 'Elevated market volatility'
      });
    }

    // Factor 3: Concentration risk
    if (CalcEngine.greaterThan(concentration, 0.5)) {
      escalationProbability = CalcEngine.add(escalationProbability, 20);
      factors.push({
        factor: 'Concentration Risk',
        contribution: 20,
        description: 'Heavy concentration in single risk factor'
      });
    }

    // Factor 4: Rate of change
    if (CalcEngine.greaterThan(CalcEngine.absoluteValue(changeRate), 0.15)) {
      escalationProbability = CalcEngine.add(escalationProbability, 15);
      factors.push({
        factor: 'Rapid Changes',
        contribution: 15,
        description: 'Risk metrics changing rapidly'
      });
    }

    // Cap escalation probability at 95%
    escalationProbability = CalcEngine.min(95, escalationProbability);

    const escalationLevel = escalationProbability > 70 ? 'HIGH' :
                           escalationProbability > 50 ? 'MODERATE' :
                           escalationProbability > 30 ? 'LOW' : 'MINIMAL';

    return {
      escalationProbability: CalcEngine.round(escalationProbability, 0),
      escalationLevel,
      factors,
      recommendations: generateRiskMitigationRecommendations(escalationLevel),
      confidence: 75
    };
  } catch (error) {
    return {
      escalationProbability: 0,
      escalationLevel: 'ERROR',
      error: error.message,
      factors: [],
      confidence: 0
    };
  }
};

const generateRiskMitigationRecommendations = (escalationLevel) => {
  const recommendations = {
    HIGH: [
      'Implement immediate hedging strategies',
      'Reduce exposure to volatile assets',
      'Increase cash reserves',
      'Review and strengthen risk controls',
      'Consider insurance or derivatives for protection'
    ],
    MODERATE: [
      'Monitor risk indicators closely',
      'Consider partial hedging of key exposures',
      'Review diversification strategy',
      'Prepare contingency plans'
    ],
    LOW: [
      'Maintain current risk management approach',
      'Continue regular monitoring',
      'Annual risk review sufficient'
    ],
    MINIMAL: [
      'Standard monitoring protocols sufficient',
      'Risk level well-controlled'
    ]
  };

  return recommendations[escalationLevel] || recommendations.LOW;
};

// ============================================================================
// COMPOSITE AI ANALYSIS
// ============================================================================

/**
 * Generate comprehensive AI analysis combining multiple features
 * @param {Object} modelData - Complete model data
 * @returns {Object} Comprehensive AI analysis
 */
export const generateComprehensiveAIAnalysis = (modelData) => {
  if (!modelData) {
    return { analysis: null, confidence: 0 };
  }

  try {
    const {
      values = [],
      modelType = 'forecasting',
      riskMetrics = {},
      financialMetrics = {}
    } = modelData;

    const analysis = {
      anomalies: detectForecastAnomalies(values),
      patterns: recognizePatterns(values, modelType),
      trends: analyzeTrends(values),
      momentum: calculateMomentum(values),
      predictions: predictWithLinearRegression(values),
      healthPrediction: predictFinancialHealth(financialMetrics),
      riskPrediction: predictRiskEscalation(riskMetrics, values),
      timestamp: new Date().toISOString()
    };

    const avgConfidence = CalcEngine.divide(
      CalcEngine.add(
        analysis.anomalies.confidence || 0,
        analysis.patterns.confidence || 0,
        analysis.trends.confidence || 0,
        analysis.momentum.confidence || 0,
        analysis.predictions.confidence || 0,
        analysis.healthPrediction.confidence || 0,
        analysis.riskPrediction.confidence || 0
      ),
      7
    );

    return {
      analysis,
      overallConfidence: CalcEngine.round(avgConfidence, 0),
      aiInsights: {
        count: [
          analysis.anomalies.count || 0,
          analysis.patterns.count || 0
        ].reduce((a, b) => a + b, 0),
        criticalItems: (analysis.anomalies.anomalies || []).filter(
          a => a.severity === 'CRITICAL'
        ).length
      }
    };
  } catch (error) {
    return {
      analysis: null,
      error: error.message,
      confidence: 0
    };
  }
};

export default {
  detectForecastAnomalies,
  detectValuationAnomalies,
  recognizePatterns,
  analyzeTrends,
  calculateMomentum,
  predictWithLinearRegression,
  predictFinancialHealth,
  predictRiskEscalation,
  generateComprehensiveAIAnalysis
};
