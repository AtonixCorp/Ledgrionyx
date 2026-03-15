import React, { useState } from 'react';
import { PageHeader } from '../../components/ui';
import './AIAdvisor.css';

export default function AIAdvisor() {
  const [aiConversation, setAiConversation] = useState([
    {
      id: 1,
      type: 'ai',
      message:
        'Welcome to your AI Tax Advisor! I can help explain tax implications, suggest optimizations, and answer your tax-related questions. What would you like to know?',
      timestamp: '2025-01-16T10:00:00Z',
      suggestions: ['tax-saving-strategies', 'upcoming-deadlines', 'compliance-check'],
    },
  ]);
  const [aiQuery, setAiQuery] = useState('');

  const generateAiResponse = (query) => {
    if (query.toLowerCase().includes('deadline')) {
      return 'I can help you review upcoming compliance deadlines for the selected entity. Use the Monitoring section to see due dates and statuses, then tell me which jurisdiction/type you want to focus on.';
    }
    if (query.toLowerCase().includes('rate') || query.toLowerCase().includes('tax')) {
      return "Share the jurisdiction, tax year, and the income/transaction assumptions you want to use, and I'll walk through the calculation inputs and risks to double-check.";
    }
    return "I understand your question. Tell me the entity, jurisdiction, and tax year, and I'll help you interpret the data and next actions.";
  };

  const handleAiQuery = () => {
    if (!aiQuery.trim()) return;
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: aiQuery,
      timestamp: new Date().toISOString(),
    };
    setAiConversation((prev) => [...prev, userMessage]);
    const current = aiQuery;
    setAiQuery('');
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        message: generateAiResponse(current),
        timestamp: new Date().toISOString(),
        suggestions: ['follow-up-question', 'related-topic'],
      };
      setAiConversation((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  const handleNewConversation = () => setAiConversation([]);
  const handleScenarioAnalysis = () => console.log('Opening scenario analysis...');
  const handleViewHistory = () => console.log('Viewing conversation history...');
  const handleSuggestionClick = (suggestion) => {
    setAiQuery(suggestion);
    setTimeout(() => handleAiQuery(), 0);
  };
  const handleApplyOptimization = (type) => console.log('Applying optimization:', type);
  const handleLearnMore = (topic) => console.log('Learning more about:', topic);
  const handleRunAnalysis = (type) => console.log('Running analysis:', type);
  const handleSchedulePayments = () => console.log('Scheduling payments...');
  const handleAdjustWithholding = () => console.log('Adjusting withholding...');
  const handleAnalyzeScenario = (scenario) => console.log('Analyzing scenario:', scenario);
  const handleQuickQuestion = (question) => {
    const questions = {
      'qbi-eligibility':
        'Based on your business income of $132,230 and entity structure, you are eligible for the Qualified Business Income (QBI) deduction under Section 199A. This provides a 20% deduction on qualified business income up to $182,100 for single filers.',
      'capital-gains-rates':
        'Current US capital gains rates are: 0% for taxable income up to $47,025 (single), 15% for $47,026-$518,900, and 20% over $518,900. Long-term rates apply to assets held over 1 year.',
      'estimated-payments':
        "Quarterly estimated tax payments are due April 15, June 15, September 15, and January 15. You must pay at least 90% of your current year tax or 100% of last year's tax (110% if AGI > $150,000).",
      'foreign-income':
        'Foreign income is generally taxed by both the source country and the US. You can claim a foreign tax credit for taxes paid abroad, or deduct foreign taxes if you itemize. Consider the Foreign Earned Income Exclusion if you meet residency requirements.',
    };
    setAiQuery(questions[question] || '');
    setTimeout(() => handleAiQuery(), 0);
  };

  return (
    <div className="module-page">
      <PageHeader
        title="AI Advisor"
        subtitle="Intelligent guidance and tax optimization insights"
      />

      <div className="ai-advisor-page">
        {/* Action bar */}
        <div className="adv-header-actions">
          <button className="adv-btn adv-btn-secondary" onClick={handleNewConversation}>
            New Conversation
          </button>
          <button className="adv-btn adv-btn-secondary" onClick={handleScenarioAnalysis}>
            Scenario Analysis
          </button>
          <button className="adv-btn adv-btn-link" onClick={handleViewHistory}>
            Conversation History
          </button>
        </div>

        <div className="advisor-layout">
          {/* ── Chat panel ── */}
          <div className="advisor-chat">
            <div className="chat-header">
              <div className="chat-status">
                <span>AI Advisor Online</span>
                <span className="status-indicator active" />
              </div>
              <div className="chat-info">
                <span>Response time: ~2 seconds</span>
                <span>Knowledge updated: Jan 15, 2025</span>
              </div>
            </div>

            <div className="chat-messages">
              {aiConversation.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-avatar" />
                  <div className="message-content">
                    <p>{message.message}</p>
                    {message.suggestions && (
                      <div className="message-suggestions">
                        {message.suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            className="suggestion-btn"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion.replace(/-/g, ' ')}
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
                placeholder="Ask about tax implications, optimization strategies, or compliance questions…"
              />
              <button className="chat-send-btn" onClick={handleAiQuery}>
                ↑ Send
              </button>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="insights-panel">
            <h3>AI Insights &amp; Recommendations</h3>

            <div className="insights-grid">
              <div className="insight-card priority">
                <div className="insight-header">
                  <h4>✦ High-Impact Opportunity</h4>
                </div>
                <p>
                  Based on your Q4 income of $132,230, you qualify for the Qualified Business
                  Income (QBI) deduction. This could save you approximately $26,446 in taxes.
                </p>
                <div className="insight-actions">
                  <button className="btn-secondary" onClick={() => handleApplyOptimization('qbi')}>
                    Apply Deduction
                  </button>
                  <button className="btn-link" onClick={() => handleLearnMore('qbi')}>
                    Learn More
                  </button>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-header">
                  <h4>Tax Efficiency Analysis</h4>
                </div>
                <p>
                  Consider tax-loss harvesting in your investment portfolio to offset capital
                  gains and improve efficiency.
                </p>
                <div className="insight-actions">
                  <button className="btn-secondary" onClick={() => handleRunAnalysis('tax-loss-harvesting')}>
                    Run Analysis
                  </button>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-header">
                  <h4>Upcoming Tax Events</h4>
                </div>
                <p>
                  Estimated Q1 2025 liability: $45,230. Set up quarterly estimated payments to
                  avoid penalties.
                </p>
                <div className="insight-actions">
                  <button className="btn-secondary" onClick={handleSchedulePayments}>
                    Schedule Payments
                  </button>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-header">
                  <h4>Risk Mitigation</h4>
                </div>
                <p>
                  Increasing your withholding may cover potential tax increases from business
                  growth.
                </p>
                <div className="insight-actions">
                  <button className="btn-secondary" onClick={handleAdjustWithholding}>
                    Adjust Withholding
                  </button>
                </div>
              </div>
            </div>

            {/* What-If Scenarios */}
            <div className="scenario-analysis">
              <h4>What-If Scenarios</h4>
              <div className="scenarios-list">
                <div className="scenario-item">
                  <h5>If you sell $100K in appreciated stock:</h5>
                  <p>Estimated capital gains tax: $15,000 (15% rate)</p>
                  <button className="btn-link" onClick={() => handleAnalyzeScenario('stock-sale')}>
                    Analyze →
                  </button>
                </div>
                <div className="scenario-item">
                  <h5>If business revenue increases by 25%:</h5>
                  <p>Additional tax liability: $18,750 (estimated)</p>
                  <button className="btn-link" onClick={() => handleAnalyzeScenario('revenue-growth')}>
                    Analyze →
                  </button>
                </div>
                <div className="scenario-item">
                  <h5>If you relocate to a tax-friendly state:</h5>
                  <p>Potential savings: $12,400 annually</p>
                  <button className="btn-link" onClick={() => handleAnalyzeScenario('relocation')}>
                    Analyze →
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Questions */}
            <div className="quick-questions">
              <h4>Frequently Asked</h4>
              <div className="questions-list">
                <button className="question-btn" onClick={() => handleQuickQuestion('qbi-eligibility')}>
                  Am I eligible for the QBI deduction?
                </button>
                <button className="question-btn" onClick={() => handleQuickQuestion('capital-gains-rates')}>
                  What are current capital gains rates?
                </button>
                <button className="question-btn" onClick={() => handleQuickQuestion('estimated-payments')}>
                  When are estimated tax payments due?
                </button>
                <button className="question-btn" onClick={() => handleQuickQuestion('foreign-income')}>
                  How is foreign income taxed?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
