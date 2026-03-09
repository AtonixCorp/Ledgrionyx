import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FaGlobe,
  FaCalculator,
  FaFileAlt,
  FaShieldAlt,
  FaRobot,
  FaLock,
  FaSync,
  FaFileExport,
  FaDownload,
  FaUpload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaArrowRight,
  FaCog,
  FaBell,
  FaSearch,
  FaEye,
  FaPlay,
  FaRedo,
  FaPlus,
  FaFolder,
  FaChevronRight,
  FaFileInvoice,
  FaLightbulb,
  FaChartBar,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPercent,
  FaClock,
  FaBuilding,
  FaDatabase,
  FaLink,
  FaTimes,
  FaStar,
  FaShare
} from 'react-icons/fa';
import { useEnterprise } from '../../context/EnterpriseContext';

const EnterpriseTaxCompliance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'overview';

  const {
    entities,
    fetchEntityTaxProfiles,
    createTaxProfile,
    fetchEntityComplianceDocuments,
    createComplianceDocument,
    fetchEntityComplianceDeadlines,
    fetchEntityTaxCalculations,
    calculateTax,
  } = useEnterprise();

  const [selectedEntityId, setSelectedEntityId] = useState('');
  const selectedEntity = useMemo(() => {
    if (!selectedEntityId) return null;
    return entities.find((e) => String(e.id) === String(selectedEntityId)) || null;
  }, [entities, selectedEntityId]);

  const [taxProfiles, setTaxProfiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [complianceDeadlines, setComplianceDeadlines] = useState([]);
  const [taxCalculations, setTaxCalculations] = useState([]);
  const [dataError, setDataError] = useState(null);

  // Enhanced state management
  const [isLoading, setIsLoading] = useState(false);
  const [, setSelectedCountry] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [reconciliationStatus, setReconciliationStatus] = useState('idle');
  const [taxCalculationMode, setTaxCalculationMode] = useState('automatic');
  const [alertFilter, setAlertFilter] = useState('all');
  const [vaultView, setVaultView] = useState('folders');
  const [showVaultUpload, setShowVaultUpload] = useState(false);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [documentFilters, setDocumentFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });

  const [uploadForm, setUploadForm] = useState({
    document_type: 'tax_certificate',
    title: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
    notes: '',
  });

  const [taxCalcForm, setTaxCalcForm] = useState({
    tax_year: new Date().getFullYear(),
    calculation_type: 'corporate',
    jurisdiction: '',
    taxable_income: '',
    tax_rate: '',
  });

  useEffect(() => {
    if (!selectedEntity) return;
    setTaxCalcForm((prev) => ({
      ...prev,
      jurisdiction: prev.jurisdiction || selectedEntity.country || '',
    }));
  }, [selectedEntity]);

  useEffect(() => {
    if (selectedEntityId) return;
    if (!entities || entities.length === 0) return;
    setSelectedEntityId(String(entities[0].id));
  }, [entities, selectedEntityId]);

  useEffect(() => {
    const load = async () => {
      if (!selectedEntityId) return;
      setDataError(null);
      try {
        const [profiles, docs, deadlines, calcs] = await Promise.all([
          fetchEntityTaxProfiles(selectedEntityId),
          fetchEntityComplianceDocuments(selectedEntityId),
          fetchEntityComplianceDeadlines(selectedEntityId),
          fetchEntityTaxCalculations(selectedEntityId),
        ]);

        const uiProfiles = (profiles || []).map((p) => ({
          id: p.id,
          country: p.country,
          status: p.status,
          lastUpdated: p.updated_at || p.created_at,
          entities: 1,
          taxRules: {
            ...(p.tax_rules || {}),
            lastRuleUpdate: p.last_rule_update || null,
            autoUpdate: p.auto_update !== false,
          },
          residencyStatus: p.residency_status || 'detected',
          complianceScore: Number.isFinite(p.compliance_score) ? p.compliance_score : 0,
        }));

        const uiDocuments = (docs || []).map((d) => {
          const typeMap = {
            license: 'form',
            registration: 'form',
            tax_certificate: 'form',
            insurance: 'report',
            permit: 'form',
            contract: 'audit',
            certificate: 'form',
            other: 'report',
          };
          const statusMap = {
            active: 'ready',
            renewed: 'ready',
            expiring_soon: 'ready',
            expired: 'failed',
          };

          return {
            id: d.id,
            name: d.title,
            type: typeMap[d.document_type] || 'report',
            status: statusMap[d.status] || 'ready',
            size: d.file_path ? '—' : '-',
            date: d.created_at || d.issue_date,
            autoGenerated: false,
            raw: d,
          };
        });

        setTaxProfiles(uiProfiles);
        setDocuments(uiDocuments);
        setComplianceDeadlines(deadlines || []);
        setTaxCalculations(calcs || []);
      } catch (err) {
        console.error(err);
        setDataError(err?.message || 'Failed to load Tax & Compliance data');
        setTaxProfiles([]);
        setDocuments([]);
        setComplianceDeadlines([]);
        setTaxCalculations([]);
      }
    };

    load();
  }, [
    selectedEntityId,
    fetchEntityTaxProfiles,
    fetchEntityComplianceDocuments,
    fetchEntityComplianceDeadlines,
    fetchEntityTaxCalculations,
  ]);

  const complianceAlerts = useMemo(() => {
    const now = new Date();
    return (complianceDeadlines || []).map((d) => {
      const deadlineDate = d.deadline_date ? new Date(d.deadline_date) : null;
      const daysLeft = deadlineDate ? Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

      let severity = 'low';
      if (d.status === 'overdue') severity = 'high';
      else if (daysLeft !== null && daysLeft <= 7) severity = 'high';
      else if (daysLeft !== null && daysLeft <= 30) severity = 'medium';

      return {
        id: d.id,
        type: 'deadline',
        message: d.title,
        severity,
        date: d.deadline_date,
        autoGenerated: false,
        actions: ['view', 'set-reminder'],
        raw: d,
      };
    });
  }, [complianceDeadlines]);

  const calculations = useMemo(() => {
    const empty = {
      incomeTax: { amount: 0, breakdown: { salary: 0, business: 0 }, lastCalculated: null },
      capitalGains: { amount: 0, breakdown: { stocks: 0, crypto: 0 }, lastCalculated: null },
      dividends: { amount: 0, breakdown: { qualified: 0, ordinary: 0 }, lastCalculated: null },
      withholding: { amount: 0, breakdown: { federal: 0, state: 0 }, lastCalculated: null },
      vat: { amount: 0, breakdown: { sales: 0, imports: 0 }, lastCalculated: null },
      quarterlyProjection: { amount: 0, confidence: 0, lastProjected: null },
    };

    if (!Array.isArray(taxCalculations) || taxCalculations.length === 0) return empty;

    const sorted = [...taxCalculations].sort((a, b) => {
      const ad = new Date(a.created_at || 0).getTime();
      const bd = new Date(b.created_at || 0).getTime();
      return bd - ad;
    });

    const latestCorporate = sorted.find((c) => c.calculation_type === 'corporate') || null;
    const latestVat = sorted.find((c) => c.calculation_type === 'vat') || null;

    return {
      ...empty,
      incomeTax: latestCorporate
        ? {
            amount: Number(latestCorporate.calculated_tax || 0),
            breakdown: { salary: 0, business: Number(latestCorporate.taxable_income || 0) },
            lastCalculated: latestCorporate.created_at || null,
          }
        : empty.incomeTax,
      vat: latestVat
        ? {
            amount: Number(latestVat.calculated_tax || 0),
            breakdown: { sales: Number(latestVat.taxable_income || 0), imports: 0 },
            lastCalculated: latestVat.created_at || null,
          }
        : empty.vat,
    };
  }, [taxCalculations]);

  const overallComplianceScore = useMemo(() => {
    if (!Array.isArray(taxProfiles) || taxProfiles.length === 0) return 0;
    const avg = taxProfiles.reduce((sum, p) => sum + (Number.isFinite(p.complianceScore) ? p.complianceScore : 0), 0) / taxProfiles.length;
    return Math.max(0, Math.min(100, Math.round(avg)));
  }, [taxProfiles]);

  const overallComplianceLabel = useMemo(() => {
    if (overallComplianceScore >= 90) return { label: 'Excellent', className: 'excellent' };
    if (overallComplianceScore >= 75) return { label: 'Good', className: 'good' };
    if (overallComplianceScore >= 50) return { label: 'Fair', className: 'fair' };
    return { label: 'Needs Attention', className: 'warning' };
  }, [overallComplianceScore]);

  const recentActivityItems = useMemo(() => {
    const items = [];
    const latestProfile = Array.isArray(taxProfiles) && taxProfiles.length
      ? [...taxProfiles].sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0))[0]
      : null;
    if (latestProfile?.lastUpdated) {
      items.push({
        key: `profile-${latestProfile.id}`,
        kind: 'info',
        message: `Tax profile updated for ${latestProfile.country}`,
        when: latestProfile.lastUpdated,
        action: 'View',
      });
    }

    const latestCalc = Array.isArray(taxCalculations) && taxCalculations.length
      ? [...taxCalculations].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0]
      : null;
    if (latestCalc?.created_at) {
      items.push({
        key: `calc-${latestCalc.id}`,
        kind: 'success',
        message: `Tax calculation saved (${latestCalc.calculation_type} - ${latestCalc.jurisdiction})`,
        when: latestCalc.created_at,
        action: 'View',
      });
    }

    const latestDoc = Array.isArray(documents) && documents.length
      ? [...documents].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0]
      : null;
    if (latestDoc?.date) {
      items.push({
        key: `doc-${latestDoc.id}`,
        kind: 'success',
        message: `Compliance document updated (${latestDoc.name})`,
        when: latestDoc.date,
        action: 'View',
      });
    }

    return items.slice(0, 4);
  }, [taxProfiles, taxCalculations, documents]);

  const upcomingDeadlines = useMemo(() => {
    const list = Array.isArray(complianceDeadlines) ? [...complianceDeadlines] : [];
    list.sort((a, b) => new Date(a.deadline_date || 0) - new Date(b.deadline_date || 0));
    return list.slice(0, 5);
  }, [complianceDeadlines]);

  // Available countries for tax profiles
  const availableCountries = [
    { code: 'US', name: 'United States', flag: '🇺🇸', taxTypes: ['federal', 'state'], autoDetectable: true },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', taxTypes: ['corporation'], autoDetectable: true },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', taxTypes: ['federal', 'provincial'], autoDetectable: true },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', taxTypes: ['corporate'], autoDetectable: false },
    { code: 'FR', name: 'France', flag: '🇫🇷', taxTypes: ['corporate'], autoDetectable: false },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', taxTypes: ['corporate'], autoDetectable: true },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', taxTypes: ['corporate'], autoDetectable: false },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', taxTypes: ['corporate'], autoDetectable: false },
  ];

  // AI Advisor conversation history
  const [aiConversation, setAiConversation] = useState([
    {
      id: 1,
      type: 'ai',
      message: 'Welcome to your AI Tax Advisor! I can help explain tax implications, suggest optimizations, and answer your tax-related questions. What would you like to know?',
      timestamp: '2025-01-16T10:00:00Z',
      suggestions: ['tax-saving-strategies', 'upcoming-deadlines', 'compliance-check']
    }
  ]);

  const handleCountrySelect = async (countryCode) => {
    setSelectedCountry(countryCode);
    setShowCountrySelector(false);

    if (!selectedEntityId) return;

    const selected = availableCountries.find((c) => c.code === countryCode);
    const countryName = selected?.name || countryCode;

    try {
      await createTaxProfile({
        entity: selectedEntityId,
        country: countryName,
        status: 'active',
        tax_rules: {},
        auto_update: true,
        residency_status: 'detected',
      });
      const refreshed = await fetchEntityTaxProfiles(selectedEntityId);
      const uiProfiles = (refreshed || []).map((p) => ({
        id: p.id,
        country: p.country,
        status: p.status,
        lastUpdated: p.updated_at || p.created_at,
        entities: 1,
        taxRules: {
          ...(p.tax_rules || {}),
          lastRuleUpdate: p.last_rule_update || null,
          autoUpdate: p.auto_update !== false,
        },
        residencyStatus: p.residency_status || 'detected',
        complianceScore: Number.isFinite(p.compliance_score) ? p.compliance_score : 0,
      }));
      setTaxProfiles(uiProfiles);
    } catch (err) {
      console.error(err);
      setDataError(err?.message || 'Failed to add tax profile');
    }
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: aiQuery,
      timestamp: new Date().toISOString()
    };

    setAiConversation(prev => [...prev, userMessage]);
    setAiQuery('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        message: generateAiResponse(aiQuery),
        timestamp: new Date().toISOString(),
        suggestions: ['follow-up-question', 'related-topic']
      };
      setAiConversation(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const generateAiResponse = (query) => {
    // Simple response generation - in real implementation, this would call an AI service
    if (query.toLowerCase().includes('deadline')) {
      return "I can help you review upcoming compliance deadlines for the selected entity. Use the Monitoring section to see due dates and statuses, then tell me which jurisdiction/type you want to focus on.";
    }
    if (query.toLowerCase().includes('rate') || query.toLowerCase().includes('tax')) {
      return "Share the jurisdiction, tax year, and the income/transaction assumptions you want to use, and I’ll walk through the calculation inputs and risks to double-check.";
    }
    return "I understand your question. Tell me the entity, jurisdiction, and tax year, and I’ll help you interpret the data and next actions.";
  };

  // Document handlers
  const handleGenerateReport = () => {
    // Simulate generating a comprehensive report
    console.log('Generating comprehensive report...');
  };

  const handleBulkGenerate = () => {
    // Simulate bulk generation
    console.log('Starting bulk document generation...');
  };

  const handleDownloadDocument = (docId) => {
    // Simulate download
    console.log('Downloading document:', docId);
  };

  const handleShareDocument = (docId) => {
    // Simulate sharing
    console.log('Sharing document:', docId);
  };

  const handleRegenerateDocument = (docId) => {
    // Simulate regeneration
    console.log('Regenerating document:', docId);
  };

  const handleUploadComplianceDocument = async () => {
    if (!selectedEntityId) return;

    if (!uploadForm.title || !uploadForm.issuing_authority || !uploadForm.issue_date || !uploadForm.expiry_date) {
      setDataError('Please fill Title, Issuing Authority, Issue Date, and Expiry Date');
      return;
    }

    try {
      await createComplianceDocument({
        entity: selectedEntityId,
        document_type: uploadForm.document_type,
        title: uploadForm.title,
        issuing_authority: uploadForm.issuing_authority,
        issue_date: uploadForm.issue_date,
        expiry_date: uploadForm.expiry_date,
        notes: uploadForm.notes,
      });

      const refreshed = await fetchEntityComplianceDocuments(selectedEntityId);
      const typeMap = {
        license: 'form',
        registration: 'form',
        tax_certificate: 'form',
        insurance: 'report',
        permit: 'form',
        contract: 'audit',
        certificate: 'form',
        other: 'report',
      };
      const statusMap = {
        active: 'ready',
        renewed: 'ready',
        expiring_soon: 'ready',
        expired: 'failed',
      };

      setDocuments(
        (refreshed || []).map((d) => ({
          id: d.id,
          name: d.title,
          type: typeMap[d.document_type] || 'report',
          status: statusMap[d.status] || 'ready',
          size: d.file_path ? '—' : '-',
          date: d.created_at || d.issue_date,
          autoGenerated: false,
          raw: d,
        }))
      );

      setShowUploadModal(false);
      setShowVaultUpload(false);
      setUploadForm({
        document_type: 'tax_certificate',
        title: '',
        issuing_authority: '',
        issue_date: '',
        expiry_date: '',
        notes: '',
      });
    } catch (err) {
      console.error(err);
      setDataError(err?.message || 'Failed to upload document');
    }
  };

  const handleRunTaxCalculation = async () => {
    if (!selectedEntityId) return;

    if (!taxCalcForm.tax_year || !taxCalcForm.calculation_type || !taxCalcForm.jurisdiction) {
      setDataError('Please fill Tax Year, Type, and Jurisdiction');
      return;
    }

    setIsLoading(true);
    setDataError(null);
    try {
      const result = await calculateTax({
        entity: selectedEntityId,
        tax_year: taxCalcForm.tax_year,
        calculation_type: taxCalcForm.calculation_type,
        jurisdiction: taxCalcForm.jurisdiction,
        taxable_income: taxCalcForm.taxable_income || 0,
        tax_rate: taxCalcForm.tax_rate || 0,
        deductions: {},
        credits: {},
      });

      const refreshed = await fetchEntityTaxCalculations(selectedEntityId);
      setTaxCalculations(refreshed || []);

      return result;
    } catch (err) {
      console.error(err);
      setDataError(err?.message || 'Tax calculation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTemplate = (templateType) => {
    // Simulate template generation
    console.log('Generating template:', templateType);
  };

  // Monitoring handlers
  const handleRunComplianceCheck = () => {
    // Simulate running compliance check
    console.log('Running full compliance check...');
  };

  const handleConfigureAlerts = () => {
    // Simulate configuring alerts
    console.log('Opening alert configuration...');
  };

  const handleAlertAction = (alertId, action) => {
    // Simulate alert action
    console.log('Alert action:', alertId, action);
  };

  const handleViewAlert = (alertId) => {
    // Simulate viewing alert details
    console.log('Viewing alert:', alertId);
  };

  const handleResolveAlert = (alertId) => {
    // Simulate resolving alert
    console.log('Resolving alert:', alertId);
  };

  const handleDismissAlert = (alertId) => {
    // Simulate dismissing alert
    console.log('Dismissing alert:', alertId);
  };

  // AI Advisor handlers
  const handleNewConversation = () => {
    setAiConversation([]);
    console.log('Starting new conversation...');
  };

  const handleScenarioAnalysis = () => {
    console.log('Opening scenario analysis...');
  };

  const handleViewHistory = () => {
    console.log('Viewing conversation history...');
  };

  const handleSuggestionClick = (suggestion) => {
    setAiQuery(suggestion);
    handleAiQuery();
  };

  const handleApplyOptimization = (optimizationType) => {
    console.log('Applying optimization:', optimizationType);
  };

  const handleLearnMore = (topic) => {
    console.log('Learning more about:', topic);
  };

  const handleRunAnalysis = (analysisType) => {
    console.log('Running analysis:', analysisType);
  };

  const handleSchedulePayments = () => {
    console.log('Scheduling payments...');
  };

  const handleAdjustWithholding = () => {
    console.log('Adjusting withholding...');
  };

  const handleAnalyzeScenario = (scenario) => {
    console.log('Analyzing scenario:', scenario);
  };

  const handleQuickQuestion = (question) => {
    const questions = {
      'qbi-eligibility': 'Based on your business income of $132,230 and entity structure, you are eligible for the Qualified Business Income (QBI) deduction under Section 199A. This provides a 20% deduction on qualified business income up to $182,100 for single filers.',
      'capital-gains-rates': 'Current US capital gains rates are: 0% for taxable income up to $47,025 (single), 15% for $47,026-$518,900, and 20% over $518,900. Long-term rates apply to assets held over 1 year.',
      'estimated-payments': 'Quarterly estimated tax payments are due April 15, June 15, September 15, and January 15. You must pay at least 90% of your current year tax or 100% of last year\'s tax (110% if AGI > $150,000).',
      'foreign-income': 'Foreign income is generally taxed by both the source country and the US. You can claim a foreign tax credit for taxes paid abroad, or deduct foreign taxes if you itemize. Consider the Foreign Earned Income Exclusion if you meet residency requirements.'
    };
    setAiQuery(questions[question]);
    handleAiQuery();
  };

  // Vault handlers
  const handleCreateFolder = () => {
    console.log('Creating new folder...');
  };

  const handleVaultSettings = () => {
    console.log('Opening vault settings...');
  };

  const handleOpenFolder = (folderId) => {
    console.log('Opening folder:', folderId);
  };

  const handleViewDocument = (docId) => {
    console.log('Viewing document:', docId);
  };

  const handleExportDocument = (docId) => {
    console.log('Exporting document:', docId);
  };

  const handleRunReconciliation = () => {
    setReconciliationStatus('running');
    console.log('Running reconciliation...');
    // Simulate reconciliation process
    setTimeout(() => setReconciliationStatus('idle'), 3000);
  };

  const handleReconciliationSettings = () => {
    console.log('Opening reconciliation settings...');
  };

  const handleReviewAction = (action) => {
    console.log('Review action:', action);
  };

  const handleViewTransaction = (transactionId) => {
    console.log('Viewing transaction:', transactionId);
  };

  const handleDownloadReport = (reportType) => {
    console.log('Downloading report:', reportType);
  };

  const renderOverview = () => (
    <div className="compliance-overview">
      {/* Quick Stats */}
      <div className="overview-stats">
        <div className="stat-card">
          <div className="stat-icon"><FaGlobe /></div>
          <div className="stat-content">
            <h3>{taxProfiles.filter(p => p.status === 'active').length}</h3>
            <p>Active Countries</p>
            <span className="stat-trend neutral">Based on entity profiles</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaCalculator /></div>
          <div className="stat-content">
            <h3>${calculations.quarterlyProjection.amount.toLocaleString()}</h3>
            <p>Quarterly Tax Projection</p>
            <span className="stat-trend neutral">No projection model yet</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaBell /></div>
          <div className="stat-content">
            <h3>{complianceAlerts.filter(a => a.severity === 'high').length}</h3>
            <p>Critical Alerts</p>
            <span className="stat-trend neutral">Derived from deadlines</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaFileAlt /></div>
          <div className="stat-content">
            <h3>{documents.filter(d => d.status === 'ready').length}</h3>
            <p>Ready Documents</p>
            <span className="stat-trend neutral">From compliance vault</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => setSearchParams({ section: 'calculator' })}>
          <FaCalculator /> Run Tax Calculation
        </button>
        <button className="quick-action-btn secondary" onClick={() => setSearchParams({ section: 'monitoring' })}>
          <FaBell /> Check Compliance
        </button>
        <button className="quick-action-btn secondary" onClick={() => setSearchParams({ section: 'filing' })}>
          <FaFileExport /> Generate Reports
        </button>
        <button className="quick-action-btn secondary" onClick={() => setSearchParams({ section: 'advisor' })}>
          <FaRobot /> Ask AI Advisor
        </button>
      </div>

      {/* Compliance Health Dashboard */}
      <div className="compliance-health">
        <div className="health-header">
          <h3>Compliance Health Score</h3>
          <div className="health-score">
            <div className="score-circle">
              <span className="score-number">{overallComplianceScore}</span>
              <span className="score-label">/100</span>
            </div>
            <div className="score-details">
              <span className={`score-status ${overallComplianceLabel.className}`}>{overallComplianceLabel.label}</span>
              <span className="score-change">Calculated from profiles</span>
            </div>
          </div>
        </div>

        <div className="health-metrics">
          <div className="metric-item">
            <div className="metric-label">Tax Profiles</div>
            <div className="metric-bar">
              <div className="metric-fill" style={{width: `${taxProfiles.length ? Math.min(100, overallComplianceScore) : 0}%`}}></div>
            </div>
            <span className="metric-value">{overallComplianceScore}%</span>
          </div>
          <div className="metric-item">
            <div className="metric-label">Documents</div>
            <div className="metric-bar">
              <div className="metric-fill" style={{width: `${documents.length ? 100 : 0}%`}}></div>
            </div>
            <span className="metric-value">{documents.length}</span>
          </div>
          <div className="metric-item">
            <div className="metric-label">Upcoming Deadlines</div>
            <div className="metric-bar">
              <div className="metric-fill" style={{width: `${upcomingDeadlines.length ? 100 : 0}%`}}></div>
            </div>
            <span className="metric-value">{upcomingDeadlines.length}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3><FaClock /> Recent Activity</h3>
        <div className="activity-list">
          {recentActivityItems.length === 0 ? (
            <div className="activity-item">
              <div className="activity-icon info"><FaInfoCircle /></div>
              <div className="activity-content">
                <p>No activity yet for this entity</p>
                <span>Create a tax profile, upload a document, or run a calculation</span>
              </div>
            </div>
          ) : (
            recentActivityItems.map((item) => (
              <div key={item.key} className="activity-item">
                <div className={`activity-icon ${item.kind}`}>{item.kind === 'success' ? <FaCheckCircle /> : <FaInfoCircle />}</div>
                <div className="activity-content">
                  <p>{item.message}</p>
                  <span>{item.when ? new Date(item.when).toLocaleString() : ''}</span>
                </div>
                <button className="btn-link">{item.action}</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="upcoming-deadlines">
        <h3><FaCalendarAlt /> Upcoming Deadlines</h3>
        <div className="deadlines-list">
          {upcomingDeadlines.length === 0 ? (
            <div className="deadline-item normal">
              <div className="deadline-info">
                <h4>No deadlines yet</h4>
                <p>Create compliance deadlines for the selected entity</p>
              </div>
              <div className="deadline-status">
                <span className="status-badge normal">Empty</span>
              </div>
            </div>
          ) : (
            upcomingDeadlines.map((d) => (
              <div key={d.id} className={`deadline-item ${d.status === 'overdue' || d.status === 'due_soon' ? 'urgent' : 'normal'}`}>
                <div className="deadline-info">
                  <h4>{d.title}</h4>
                  <p>{d.deadline_type}</p>
                  <span className="deadline-date">Due: {d.deadline_date ? new Date(d.deadline_date).toLocaleDateString() : '—'}</span>
                </div>
                <div className="deadline-status">
                  <span className={`status-badge ${d.status === 'overdue' || d.status === 'due_soon' ? 'urgent' : 'normal'}`}>{d.status}</span>
                </div>
                <div className="deadline-actions">
                  <button className="btn-secondary">View</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderTaxProfiles = () => (
    <div className="tax-profiles-section">
      <div className="section-header">
        <h2><FaGlobe /> Multi-Country Tax Profiles</h2>
        <p>Auto-configured tax rules for global operations</p>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowCountrySelector(true)}
          >
            <FaPlus /> Add Country
          </button>
          <button className="btn-link">
            <FaRedo /> Update All Rules
          </button>
        </div>
      </div>

      {/* Country Selector Modal */}
      {showCountrySelector && (
        <div className="modal-overlay" onClick={() => setShowCountrySelector(false)}>
          <div className="modal-content country-selector" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Country for Tax Profile</h3>
              <button className="close-btn" onClick={() => setShowCountrySelector(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="country-grid">
              {availableCountries.map(country => (
                <div 
                  key={country.code}
                  className="country-option"
                  onClick={() => handleCountrySelect(country.code)}
                >
                  <div className="country-flag">{country.flag}</div>
                  <div className="country-info">
                    <h4>{country.name}</h4>
                    <div className="country-details">
                      <span className="tax-types">
                        {country.taxTypes.join(', ')}
                      </span>
                      {country.autoDetectable && (
                        <span className="auto-detect-badge">Auto-detectable</span>
                      )}
                    </div>
                  </div>
                  <FaArrowRight className="select-arrow" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="profiles-grid">
        {taxProfiles.map(profile => (
          <div key={profile.id} className="profile-card">
            <div className="profile-header">
              <div className="country-flag">
                {availableCountries.find(c => c.code === profile.country)?.flag || profile.country}
              </div>
              <div className={`status-badge ${profile.status}`}>
                {profile.status}
              </div>
              <div className="compliance-score">
                <FaStar className="score-icon" />
                <span>{profile.complianceScore}%</span>
              </div>
            </div>
            <div className="profile-content">
              <h3>{availableCountries.find(c => c.code === profile.country)?.name || profile.country} Tax Profile</h3>
              
              <div className="profile-stats">
                <div className="stat">
                  <span className="label">Entities:</span>
                  <span className="value">{profile.entities}</span>
                </div>
                <div className="stat">
                  <span className="label">Last Updated:</span>
                  <span className="value">{new Date(profile.lastUpdated).toLocaleDateString()}</span>
                </div>
                <div className="stat">
                  <span className="label">Residency:</span>
                  <span className={`value ${profile.residencyStatus}`}>
                    {profile.residencyStatus}
                  </span>
                </div>
              </div>

              {/* Tax Rules Preview */}
              <div className="tax-rules-preview">
                <h4>Current Tax Rules</h4>
                <div className="rules-list">
                  {profile.country === 'US' && (
                    <>
                      <div className="rule-item">
                        <span>Federal Rate:</span>
                        <span>{profile.taxRules.federalRate}%</span>
                      </div>
                      <div className="rule-item">
                        <span>State Rates:</span>
                        <span>CA: {profile.taxRules.stateRates.CA}%, NY: {profile.taxRules.stateRates.NY}%</span>
                      </div>
                    </>
                  )}
                  {profile.country === 'UK' && (
                    <div className="rule-item">
                      <span>Corporation Tax:</span>
                      <span>{profile.taxRules.corporationTax}%</span>
                    </div>
                  )}
                  {profile.country === 'CA' && (
                    <>
                      <div className="rule-item">
                        <span>Federal Rate:</span>
                        <span>{profile.taxRules.federalRate}%</span>
                      </div>
                      <div className="rule-item">
                        <span>Provincial Rates:</span>
                        <span>ON: {profile.taxRules.provincialRates.ON}%, BC: {profile.taxRules.provincialRates.BC}%</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="rule-update-info">
                  <FaClock className="update-icon" />
                  <span>Last rule update: {new Date(profile.taxRules.lastRuleUpdate).toLocaleDateString()}</span>
                  {profile.taxRules.autoUpdate && (
                    <span className="auto-update-badge">Auto-updating</span>
                  )}
                </div>
              </div>
            </div>
            <div className="profile-actions">
              <button className="btn-secondary">Configure</button>
              <button className="btn-link">View Rules</button>
              <button className="btn-link">Edit Profile</button>
            </div>
          </div>
        ))}
      </div>

      <div className="auto-update-notice">
        <FaCog className="notice-icon spinning" />
        <div className="notice-content">
          <h4>Automatic Updates Active</h4>
          <p>Tax rules are automatically updated when changes are detected in supported jurisdictions. Last global update: January 10, 2025</p>
          <div className="update-stats">
            <span>247 jurisdictions monitored</span>
            <span>12 rule changes this month</span>
            <span>99.9% uptime</span>
          </div>
        </div>
      </div>

      {/* Residency Detection Section */}
      <div className="residency-detection">
        <h3><FaMapMarkerAlt /> Residency Status Detection</h3>
        <p>Automatically detect and confirm tax residency status across jurisdictions</p>
        <div className="detection-controls">
          <button className="btn-primary">
            <FaSearch /> Run Detection Scan
          </button>
          <button className="btn-secondary">
            <FaEye /> Review Detected Status
          </button>
        </div>
        <div className="detection-results">
          <div className="result-item">
            <FaCheckCircle className="result-icon success" />
            <span>US Residency: Confirmed (based on entity registrations)</span>
          </div>
          <div className="result-item">
            <FaCheckCircle className="result-icon success" />
            <span>UK Residency: Confirmed (based on permanent establishment)</span>
          </div>
          <div className="result-item">
            <FaClock className="result-icon pending" />
            <span>CA Residency: Pending verification (awaiting additional documentation)</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTaxCalculator = () => (
    <div className="tax-calculator-section">
      <div className="section-header">
        <h2><FaCalculator /> Auto Tax Calculation Engine</h2>
        <p>Real-time tax calculations across all income types and jurisdictions</p>
        <div className="header-actions">
          <div className="calculation-mode">
            <label>Calculation Mode:</label>
            <select 
              value={taxCalculationMode} 
              onChange={(e) => setTaxCalculationMode(e.target.value)}
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual Review</option>
              <option value="simulation">Simulation</option>
            </select>
          </div>
          <button className="btn-primary" onClick={handleRunTaxCalculation} disabled={!selectedEntityId || isLoading}>
            <FaPlay /> Run Calculation
          </button>
        </div>
      </div>

      <div className="tax-calc-form">
        <div className="tax-calc-field">
          <label>Tax Year</label>
          <input
            type="number"
            value={taxCalcForm.tax_year}
            onChange={(e) => setTaxCalcForm({ ...taxCalcForm, tax_year: e.target.value })}
            min="2000"
            max="2100"
          />
        </div>
        <div className="tax-calc-field">
          <label>Type</label>
          <select
            value={taxCalcForm.calculation_type}
            onChange={(e) => setTaxCalcForm({ ...taxCalcForm, calculation_type: e.target.value })}
          >
            <option value="corporate">Corporate Tax</option>
            <option value="vat">VAT / Sales Tax</option>
            <option value="withholding">Withholding Tax</option>
            <option value="property">Property Tax</option>
            <option value="personal">Personal Income Tax</option>
          </select>
        </div>
        <div className="tax-calc-field">
          <label>Jurisdiction</label>
          <input
            type="text"
            value={taxCalcForm.jurisdiction}
            onChange={(e) => setTaxCalcForm({ ...taxCalcForm, jurisdiction: e.target.value })}
            placeholder="e.g. Nigeria"
          />
        </div>
        <div className="tax-calc-field">
          <label>Taxable Income</label>
          <input
            type="number"
            value={taxCalcForm.taxable_income}
            onChange={(e) => setTaxCalcForm({ ...taxCalcForm, taxable_income: e.target.value })}
            placeholder="0"
            min="0"
          />
        </div>
        <div className="tax-calc-field">
          <label>Tax Rate (%)</label>
          <input
            type="number"
            value={taxCalcForm.tax_rate}
            onChange={(e) => setTaxCalcForm({ ...taxCalcForm, tax_rate: e.target.value })}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Calculation Status */}
      <div className="calculation-status">
        <div className="status-indicator">
          <FaSync className={`status-icon ${isLoading ? 'spinning' : ''}`} />
          <span>
            Last calculated:{' '}
            {calculations.incomeTax.lastCalculated
              ? new Date(calculations.incomeTax.lastCalculated).toLocaleString()
              : '—'}
          </span>
        </div>
        <div className="calculation-confidence">
          <span>Confidence: —</span>
          <div className="confidence-bar">
            <div className="confidence-fill" style={{width: '0%'}}></div>
          </div>
        </div>
      </div>

      <div className="calculator-grid">
        {/* Income Tax Card */}
        <div className="calculation-card income-tax">
          <div className="calc-header">
            <h3>Income Tax</h3>
            <span className="calc-amount">${calculations.incomeTax.amount.toLocaleString()}</span>
          </div>
          <div className="calc-breakdown">
            <h4>Breakdown by Source</h4>
            <div className="breakdown-items">
              <div className="breakdown-item">
                <span>Salary Income:</span>
                <span>${calculations.incomeTax.breakdown.salary.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span>Business Income:</span>
                <span>${calculations.incomeTax.breakdown.business.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="calc-details">
            <p>Calculated across 3 jurisdictions using latest tax rules</p>
            <div className="calc-meta">
              <span>Last updated: {new Date(calculations.incomeTax.lastCalculated).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Capital Gains Tax Card */}
        <div className="calculation-card capital-gains">
          <div className="calc-header">
            <h3>Capital Gains Tax</h3>
            <span className="calc-amount">${calculations.capitalGains.amount.toLocaleString()}</span>
          </div>
          <div className="calc-breakdown">
            <h4>Breakdown by Asset Type</h4>
            <div className="breakdown-items">
              <div className="breakdown-item">
                <span>Stocks:</span>
                <span>${calculations.capitalGains.breakdown.stocks.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span>Cryptocurrency:</span>
                <span>${calculations.capitalGains.breakdown.crypto.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="calc-details">
            <p>Short-term and long-term gains calculated separately</p>
            <div className="calc-meta">
              <span>12 taxable events detected this quarter</span>
            </div>
          </div>
        </div>

        {/* Dividends Tax Card */}
        <div className="calculation-card dividends">
          <div className="calc-header">
            <h3>Dividends Tax</h3>
            <span className="calc-amount">${calculations.dividends.amount.toLocaleString()}</span>
          </div>
          <div className="calc-breakdown">
            <h4>Breakdown by Type</h4>
            <div className="breakdown-items">
              <div className="breakdown-item">
                <span>Qualified:</span>
                <span>${calculations.dividends.breakdown.qualified.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span>Ordinary:</span>
                <span>${calculations.dividends.breakdown.ordinary.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="calc-details">
            <p>Qualified dividends taxed at capital gains rates</p>
            <div className="calc-meta">
              <span>8 dividend payments processed</span>
            </div>
          </div>
        </div>

        {/* Withholding Tax Card */}
        <div className="calculation-card withholding">
          <div className="calc-header">
            <h3>Withholding Tax</h3>
            <span className="calc-amount">${calculations.withholding.amount.toLocaleString()}</span>
          </div>
          <div className="calc-breakdown">
            <h4>Breakdown by Jurisdiction</h4>
            <div className="breakdown-items">
              <div className="breakdown-item">
                <span>Federal:</span>
                <span>${calculations.withholding.breakdown.federal.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span>State:</span>
                <span>${calculations.withholding.breakdown.state.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="calc-details">
            <p>Automatically calculated from payroll data</p>
            <div className="calc-meta">
              <span>Monthly withholding optimized</span>
            </div>
          </div>
        </div>

        {/* VAT/Sales Tax Card */}
        <div className="calculation-card vat">
          <div className="calc-header">
            <h3>VAT/Sales Tax</h3>
            <span className="calc-amount">${calculations.vat.amount.toLocaleString()}</span>
          </div>
          <div className="calc-breakdown">
            <h4>Breakdown by Type</h4>
            <div className="breakdown-items">
              <div className="breakdown-item">
                <span>Sales Tax:</span>
                <span>${calculations.vat.breakdown.sales.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span>Import VAT:</span>
                <span>${calculations.vat.breakdown.imports.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="calc-details">
            <p>Multi-jurisdiction VAT calculations</p>
            <div className="calc-meta">
              <span>23 transactions processed</span>
            </div>
          </div>
        </div>

        {/* Quarterly Projection Card */}
        <div className="calculation-card projection">
          <div className="calc-header">
            <h3>Quarterly Projection</h3>
            <span className="calc-amount">${calculations.quarterlyProjection.amount.toLocaleString()}</span>
          </div>
          <div className="calc-confidence">
            <div className="confidence-meter">
              <span>Projection Confidence: {calculations.quarterlyProjection.confidence}%</span>
              <div className="confidence-bar">
                <div className="confidence-fill" style={{width: `${calculations.quarterlyProjection.confidence}%`}}></div>
              </div>
            </div>
          </div>
          <div className="calc-details">
            <p>AI-powered projections based on historical data and trends</p>
            <div className="calc-meta">
              <span>Updated: {new Date(calculations.quarterlyProjection.lastProjected).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Taxable Events Detection */}
      <div className="taxable-events">
        <h3><FaBell /> Recent Taxable Events Detected</h3>
        <div className="events-list">
          <div className="event-item">
            <div className="event-icon">
              <FaMoneyBillWave />
            </div>
            <div className="event-content">
              <h4>Stock Sale - AAPL (500 shares)</h4>
              <p>Capital gain of $12,450 detected and automatically calculated</p>
              <span className="event-date">Jan 15, 2025</span>
            </div>
            <div className="event-status">
              <span className="status-badge processed">Calculated</span>
            </div>
          </div>

          <div className="event-item">
            <div className="event-icon">
              <FaPercent />
            </div>
            <div className="event-content">
              <h4>Dividend Payment - MSFT</h4>
              <p>Qualified dividend of $890 received and taxed at 15%</p>
              <span className="event-date">Jan 12, 2025</span>
            </div>
            <div className="event-status">
              <span className="status-badge processed">Calculated</span>
            </div>
          </div>

          <div className="event-item">
            <div className="event-icon">
              <FaBuilding />
            </div>
            <div className="event-content">
              <h4>Business Income - Consulting</h4>
              <p>$25,000 business income classified and QBI deduction applied</p>
              <span className="event-date">Jan 10, 2025</span>
            </div>
            <div className="event-status">
              <span className="status-badge processed">Calculated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Income Classification */}
      <div className="income-classification">
        <h3><FaChartBar /> Auto Income Classification</h3>
        <p>Transactions automatically classified by income type</p>
        <div className="classification-stats">
          <div className="classification-item">
            <div className="classification-icon">💼</div>
            <div className="classification-info">
              <h4>Business Income</h4>
              <p>$132,230 classified (89% accuracy)</p>
            </div>
          </div>

          <div className="classification-item">
            <div className="classification-icon">📈</div>
            <div className="classification-info">
              <h4>Investment Income</h4>
              <p>$45,670 classified (94% accuracy)</p>
            </div>
          </div>

          <div className="classification-item">
            <div className="classification-icon">₿</div>
            <div className="classification-info">
              <h4>Crypto Transactions</h4>
              <p>$28,450 classified (96% accuracy)</p>
            </div>
          </div>

          <div className="classification-item">
            <div className="classification-icon">🏠</div>
            <div className="classification-info">
              <h4>Real Estate</h4>
              <p>$67,890 classified (91% accuracy)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Controls */}
      <div className="calculation-controls">
        <h3>Calculation Controls</h3>
        <div className="controls-grid">
          <button className="control-btn">
            <FaRedo /> Recalculate All
          </button>
          <button className="control-btn">
            <FaFileExport /> Export Calculations
          </button>
          <button className="control-btn">
            <FaEye /> Review Assumptions
          </button>
          <button className="control-btn">
            <FaCog /> Adjust Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="documents-section">
      <div className="section-header">
        <h2><FaFileAlt /> Compliance Document Generator</h2>
        <p>Auto-generated tax summaries and compliance reports</p>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowUploadModal(true)}>
            <FaUpload /> Upload Document
          </button>
          <button className="btn-primary" onClick={() => handleGenerateReport()}>
            <FaPlus /> Generate Report
          </button>
          <button className="btn-link" onClick={() => handleBulkGenerate()}>
            <FaSync /> Auto-Generate All
          </button>
        </div>
      </div>

      {/* Document Filters */}
      <div className="document-filters">
        <div className="filter-group">
          <label>Type:</label>
          <select
            value={documentFilters.type}
            onChange={(e) => setDocumentFilters({...documentFilters, type: e.target.value})}
          >
            <option value="all">All Types</option>
            <option value="summary">Tax Summary</option>
            <option value="report">Compliance Report</option>
            <option value="audit">Audit Trail</option>
            <option value="form">Tax Forms</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={documentFilters.status}
            onChange={(e) => setDocumentFilters({...documentFilters, status: e.target.value})}
          >
            <option value="all">All Status</option>
            <option value="ready">Ready</option>
            <option value="generating">Generating</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Period:</label>
          <select
            value={documentFilters.dateRange}
            onChange={(e) => setDocumentFilters({...documentFilters, dateRange: e.target.value})}
          >
            <option value="all">All Time</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="this-year">This Year</option>
          </select>
        </div>
      </div>

      <div className="documents-grid">
        {documents
          .filter(doc => {
            if (documentFilters.type !== 'all' && doc.type !== documentFilters.type) return false;
            if (documentFilters.status !== 'all' && doc.status !== documentFilters.status) return false;
            return true;
          })
          .map(doc => (
          <div key={doc.id} className="document-card">
            <div className="doc-icon">
              {doc.type === 'summary' && <FaFileAlt />}
              {doc.type === 'report' && <FaFileInvoice />}
              {doc.type === 'audit' && <FaDatabase />}
              {doc.type === 'form' && <FaFileExport />}
            </div>
            <div className="doc-content">
              <h4>{doc.name}</h4>
              <div className="doc-meta">
                <span className="doc-type">{doc.type}</span>
                <span className="doc-size">{doc.size}</span>
                <span className="doc-date">{new Date(doc.date).toLocaleDateString()}</span>
              </div>
              {doc.autoGenerated && (
                <div className="auto-generated-badge">
                  <FaRobot /> Auto-generated
                </div>
              )}
            </div>
            <div className="doc-status">
              <span className={`status-badge ${doc.status}`}>
                {doc.status === 'generating' && <FaSync className="spinning" />}
                {doc.status}
              </span>
            </div>
            <div className="doc-actions">
              {doc.status === 'ready' ? (
                <>
                  <button className="btn-link" onClick={() => handleDownloadDocument(doc.id)}>
                    <FaDownload /> Download
                  </button>
                  <button className="btn-link" onClick={() => handleShareDocument(doc.id)}>
                    <FaShare /> Share
                  </button>
                </>
              ) : doc.status === 'generating' ? (
                <button className="btn-link" disabled>
                  <FaSync className="spinning" /> Generating...
                </button>
              ) : (
                <button className="btn-link" onClick={() => handleRegenerateDocument(doc.id)}>
                  <FaRedo /> Retry
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Auto-Generation Schedule */}
      <div className="auto-generation-schedule">
        <h3><FaClock /> Auto-Generation Schedule</h3>
        <div className="schedule-grid">
          <div className="schedule-item">
            <div className="schedule-info">
              <h4>Monthly Tax Summary</h4>
              <p>Generated on the 1st of each month</p>
            </div>
            <div className="schedule-status">
              <span className="status-badge active">Active</span>
              <span className="next-run">Next: Feb 1, 2025</span>
            </div>
          </div>
          <div className="schedule-item">
            <div className="schedule-info">
              <h4>Quarterly Compliance Report</h4>
              <p>Generated at quarter-end</p>
            </div>
            <div className="schedule-status">
              <span className="status-badge active">Active</span>
              <span className="next-run">Next: Mar 31, 2025</span>
            </div>
          </div>
          <div className="schedule-item">
            <div className="schedule-info">
              <h4>Annual Audit Trail</h4>
              <p>Generated annually for tax season</p>
            </div>
            <div className="schedule-status">
              <span className="status-badge active">Active</span>
              <span className="next-run">Next: Dec 31, 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Templates */}
      <div className="document-templates">
        <h3>Available Templates</h3>
        <div className="templates-grid">
          <div className="template-card">
            <div className="template-icon"><FaFileAlt /></div>
            <h4>Tax Summary Report</h4>
            <p>Comprehensive quarterly tax summary with breakdowns</p>
            <div className="template-meta">
              <span>Auto-fills from transaction data</span>
              <span>PDF & Excel formats</span>
            </div>
            <button className="btn-secondary" onClick={() => handleGenerateTemplate('tax-summary')}>
              <FaPlay /> Generate Now
            </button>
          </div>
          <div className="template-card">
            <div className="template-icon"><FaShieldAlt /></div>
            <h4>Compliance Checklist</h4>
            <p>Check all filing requirements and deadlines</p>
            <div className="template-meta">
              <span>Jurisdiction-specific</span>
              <span>Interactive checklist</span>
            </div>
            <button className="btn-secondary" onClick={() => handleGenerateTemplate('compliance-checklist')}>
              <FaPlay /> Generate Now
            </button>
          </div>
          <div className="template-card">
            <div className="template-icon"><FaDatabase /></div>
            <h4>Audit Trail Report</h4>
            <p>Complete transaction history with classifications</p>
            <div className="template-meta">
              <span>Immutable record</span>
              <span>Export to accounting software</span>
            </div>
            <button className="btn-secondary" onClick={() => handleGenerateTemplate('audit-trail')}>
              <FaPlay /> Generate Now
            </button>
          </div>
          <div className="template-card">
            <div className="template-icon"><FaFileInvoice /></div>
            <h4>Tax Authority Forms</h4>
            <p>Pre-filled forms ready for submission</p>
            <div className="template-meta">
              <span>Auto-populated</span>
              <span>Multiple jurisdictions</span>
            </div>
            <button className="btn-secondary" onClick={() => handleGenerateTemplate('tax-forms')}>
              <FaPlay /> Generate Now
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content upload-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Compliance Document</h3>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Document Type</label>
                <select
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                >
                  <option value="tax_return">Tax Return</option>
                  <option value="tax_certificate">Tax Certificate</option>
                  <option value="license">License</option>
                  <option value="registration">Registration</option>
                  <option value="permit">Permit</option>
                  <option value="insurance">Insurance</option>
                  <option value="contract">Contract</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-field">
                <label>Title</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g. VAT Registration Certificate"
                />
              </div>
              <div className="form-field">
                <label>Issuing Authority</label>
                <input
                  type="text"
                  value={uploadForm.issuing_authority}
                  onChange={(e) => setUploadForm({ ...uploadForm, issuing_authority: e.target.value })}
                  placeholder="e.g. FIRS"
                />
              </div>
              <div className="form-field">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={uploadForm.issue_date}
                  onChange={(e) => setUploadForm({ ...uploadForm, issue_date: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={uploadForm.expiry_date}
                  onChange={(e) => setUploadForm({ ...uploadForm, expiry_date: e.target.value })}
                />
              </div>
              <div className="form-field full">
                <label>Notes</label>
                <textarea
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                  placeholder="Optional notes"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleUploadComplianceDocument} disabled={!selectedEntityId || isLoading}>
                Save Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMonitoring = () => (
    <div className="monitoring-section">
      <div className="section-header">
        <h2><FaShieldAlt /> Real-Time Compliance Monitoring</h2>
        <p>Automated detection of compliance risks and deadlines</p>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => handleRunComplianceCheck()}>
            <FaPlay /> Run Full Check
          </button>
          <button className="btn-secondary" onClick={() => handleConfigureAlerts()}>
            <FaCog /> Configure Alerts
          </button>
          <div className="monitoring-status">
            <FaSync className="status-icon spinning" />
            <span>Monitoring Active</span>
          </div>
        </div>
      </div>

      {/* Real-time Status Dashboard */}
      <div className="monitoring-dashboard">
        <div className="status-overview">
          <div className="status-card">
            <div className="status-icon">
              <FaCheckCircle className="success" />
            </div>
            <div className="status-info">
              <h3>System Health</h3>
              <p>All monitoring systems operational</p>
              <span className="status-badge operational">Operational</span>
            </div>
          </div>
          <div className="status-card">
            <div className="status-icon">
              <FaClock />
            </div>
            <div className="status-info">
              <h3>Last Scan</h3>
              <p>Completed 2 minutes ago</p>
              <span className="status-badge recent">Recent</span>
            </div>
          </div>
          <div className="status-card">
            <div className="status-icon">
              <FaBell />
            </div>
            <div className="status-info">
              <h3>Active Alerts</h3>
              <p>{complianceAlerts.filter(a => a.severity === 'high').length} critical, {complianceAlerts.filter(a => a.severity === 'medium').length} medium</p>
              <span className="status-badge alerts">Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts Panel */}
      <div className="alerts-panel">
        <div className="alerts-header">
          <h3>Active Alerts ({complianceAlerts.length})</h3>
          <div className="alert-filters">
            <button className="filter-btn active" onClick={() => setAlertFilter('all')}>All ({complianceAlerts.length})</button>
            <button className="filter-btn" onClick={() => setAlertFilter('high')}>Critical ({complianceAlerts.filter(a => a.severity === 'high').length})</button>
            <button className="filter-btn" onClick={() => setAlertFilter('medium')}>Medium ({complianceAlerts.filter(a => a.severity === 'medium').length})</button>
            <button className="filter-btn" onClick={() => setAlertFilter('low')}>Low ({complianceAlerts.filter(a => a.severity === 'low').length})</button>
          </div>
        </div>

        <div className="alerts-list">
          {complianceAlerts
            .filter(alert => alertFilter === 'all' || alert.severity === alertFilter)
            .map(alert => (
            <div key={alert.id} className={`alert-item ${alert.severity}`}>
              <div className="alert-icon">
                {alert.severity === 'high' ? <FaExclamationTriangle /> :
                 alert.severity === 'medium' ? <FaInfoCircle /> : <FaBell />}
              </div>
              <div className="alert-content">
                <h4>{alert.message}</h4>
                <div className="alert-meta">
                  <span className="alert-date">{new Date(alert.date).toLocaleDateString()}</span>
                  {alert.autoGenerated && (
                    <span className="auto-badge">
                      <FaRobot /> Auto-detected
                    </span>
                  )}
                </div>
                {alert.actions && (
                  <div className="alert-actions">
                    {alert.actions.map(action => (
                      <button key={action} className="action-btn" onClick={() => handleAlertAction(alert.id, action)}>
                        {action.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="alert-controls">
                <button className="btn-link" onClick={() => handleViewAlert(alert.id)}>View Details</button>
                <button className="btn-link" onClick={() => handleResolveAlert(alert.id)}>Resolve</button>
                <button className="btn-link" onClick={() => handleDismissAlert(alert.id)}>Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automated Monitoring Features */}
      <div className="monitoring-features">
        <h3><FaEye /> Automated Monitoring</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaCalculator />
            </div>
            <h4>Taxable Event Detection</h4>
            <p>Automatically detects stock sales, dividends, business income, and other taxable events</p>
            <div className="feature-status">
              <span className="status-badge active">Active</span>
              <span className="status-detail">247 events detected this month</span>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaCalendarAlt />
            </div>
            <h4>Deadline Tracking</h4>
            <p>Monitors filing deadlines across all jurisdictions with automatic reminders</p>
            <div className="feature-status">
              <span className="status-badge active">Active</span>
              <span className="status-detail">12 upcoming deadlines</span>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaExclamationTriangle />
            </div>
            <h4>Risk Assessment</h4>
            <p>Continuous evaluation of compliance risk based on transactions and behavior</p>
            <div className="feature-status">
              <span className="status-badge low-risk">Low Risk</span>
              <span className="status-detail">94% compliance score</span>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaSync />
            </div>
            <h4>Rule Updates</h4>
            <p>Automatically updates tax rules and thresholds when changes are detected</p>
            <div className="feature-status">
              <span className="status-badge active">Active</span>
              <span className="status-detail">Last update: Jan 10, 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Timeline */}
      <div className="compliance-timeline">
        <h3><FaClock /> Compliance Timeline</h3>
        <div className="timeline">
          <div className="timeline-item completed">
            <div className="timeline-marker">
              <FaCheckCircle />
            </div>
            <div className="timeline-content">
              <h4>Q4 2024 Tax Return Filed</h4>
              <p>US Federal Form 1120 submitted successfully</p>
              <span className="timeline-date">Jan 15, 2025</span>
            </div>
          </div>

          <div className="timeline-item upcoming">
            <div className="timeline-marker">
              <FaClock />
            </div>
            <div className="timeline-content">
              <h4>UK VAT Return Due</h4>
              <p>Q4 VAT return submission deadline</p>
              <span className="timeline-date">Feb 28, 2025</span>
            </div>
          </div>

          <div className="timeline-item upcoming">
            <div className="timeline-marker">
              <FaCalendarAlt />
            </div>
            <div className="timeline-content">
              <h4>Annual Tax Planning Review</h4>
              <p>Comprehensive tax strategy review</p>
              <span className="timeline-date">Mar 15, 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvisor = () => (
    <div className="advisor-section">
      <div className="section-header">
        <h2><FaRobot /> AI Tax Advisor</h2>
        <p>Intelligent guidance and tax optimization insights</p>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => handleNewConversation()}>
            <FaPlus /> New Conversation
          </button>
          <button className="btn-secondary" onClick={() => handleScenarioAnalysis()}>
            <FaChartBar /> Scenario Analysis
          </button>
          <button className="btn-link" onClick={() => handleViewHistory()}>
            <FaClock /> Conversation History
          </button>
        </div>
      </div>

      <div className="advisor-layout">
        {/* AI Chat Interface */}
        <div className="advisor-chat">
          <div className="chat-header">
            <div className="chat-status">
              <FaRobot className="status-icon" />
              <span>AI Advisor Online</span>
              <span className="status-indicator active"></span>
            </div>
            <div className="chat-info">
              <span>Response time: ~2 seconds</span>
              <span>Knowledge updated: Jan 15, 2025</span>
            </div>
          </div>

          <div className="chat-messages">
            {aiConversation.map(message => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'ai' ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  <p>{message.message}</p>
                  {message.suggestions && (
                    <div className="message-suggestions">
                      {message.suggestions.map(suggestion => (
                        <button
                          key={suggestion}
                          className="suggestion-btn"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion.replace('-', ' ')}
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
              placeholder="Ask about tax implications, optimization strategies, or compliance questions..."
            />
            <button className="btn-primary" onClick={handleAiQuery}>
              <FaArrowRight />
            </button>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="insights-panel">
          <h3><FaLightbulb /> AI Insights & Recommendations</h3>

          <div className="insights-grid">
            <div className="insight-card priority">
              <div className="insight-header">
                <FaStar className="priority-icon" />
                <h4>High-Impact Opportunity</h4>
              </div>
              <p>Based on your Q4 income of $132,230, you qualify for the Qualified Business Income (QBI) deduction. This could save you approximately $26,446 in taxes.</p>
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
                <FaCalculator />
                <h4>Tax Efficiency Analysis</h4>
              </div>
              <p>Your current asset allocation could be optimized. Consider tax-loss harvesting in your investment portfolio to offset capital gains.</p>
              <div className="insight-actions">
                <button className="btn-secondary" onClick={() => handleRunAnalysis('tax-loss-harvesting')}>
                  Run Analysis
                </button>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-header">
                <FaCalendarAlt />
                <h4>Upcoming Tax Events</h4>
              </div>
              <p>Your estimated Q1 2025 tax liability is $45,230. Consider quarterly estimated payments to avoid penalties.</p>
              <div className="insight-actions">
                <button className="btn-secondary" onClick={() => handleSchedulePayments()}>
                  Schedule Payments
                </button>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-header">
                <FaShieldAlt />
                <h4>Risk Mitigation</h4>
              </div>
              <p>Consider increasing your withholding to cover potential tax increases from business growth.</p>
              <div className="insight-actions">
                <button className="btn-secondary" onClick={() => handleAdjustWithholding()}>
                  Adjust Withholding
                </button>
              </div>
            </div>
          </div>

          {/* Scenario Analysis */}
          <div className="scenario-analysis">
            <h4><FaChartBar /> What-If Scenarios</h4>
            <div className="scenarios-list">
              <div className="scenario-item">
                <h5>If you sell $100K in appreciated stock:</h5>
                <p>Estimated capital gains tax: $15,000 (15% rate)</p>
                <button className="btn-link" onClick={() => handleAnalyzeScenario('stock-sale')}>
                  Analyze
                </button>
              </div>

              <div className="scenario-item">
                <h5>If business revenue increases by 25%:</h5>
                <p>Additional tax liability: $18,750 (estimated)</p>
                <button className="btn-link" onClick={() => handleAnalyzeScenario('revenue-growth')}>
                  Analyze
                </button>
              </div>

              <div className="scenario-item">
                <h5>If you relocate to a tax-friendly state:</h5>
                <p>Potential savings: $12,400 annually</p>
                <button className="btn-link" onClick={() => handleAnalyzeScenario('relocation')}>
                  Analyze
                </button>
              </div>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="quick-questions">
            <h4>Frequently Asked</h4>
            <div className="questions-list">
              <button className="question-btn" onClick={() => handleQuickQuestion('qbi-eligibility')}>
                Am I eligible for QBI deduction?
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
  );

  const renderVault = () => (
    <div className="vault-section">
      <div className="section-header">
        <h2><FaLock /> Compliance Vault</h2>
        <p>Secure, encrypted storage for all tax and compliance documents</p>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowVaultUpload(true)}>
            <FaUpload /> Upload Document
          </button>
          <button className="btn-secondary" onClick={() => handleCreateFolder()}>
            <FaPlus /> New Folder
          </button>
          <button className="btn-link" onClick={() => handleVaultSettings()}>
            <FaCog /> Settings
          </button>
        </div>
      </div>

      {/* Vault Security Status */}
      <div className="vault-security">
        <div className="security-status">
          <div className="security-indicator">
            <FaShieldAlt className="security-icon" />
            <span>Bank-grade encryption active</span>
          </div>
          <div className="security-details">
            <span>256-bit AES encryption</span>
            <span>Zero-knowledge architecture</span>
            <span>SOC 2 Type II compliant</span>
          </div>
        </div>
        <div className="vault-stats">
          <div className="stat-item">
            <span className="stat-number">247</span>
            <span className="stat-label">Documents</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">12.4 GB</span>
            <span className="stat-label">Storage Used</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">47.6 GB</span>
            <span className="stat-label">Available</span>
          </div>
        </div>
      </div>

      {/* Document Organization */}
      <div className="vault-organization">
        <div className="organization-tabs">
          <button className={`org-tab ${vaultView === 'folders' ? 'active' : ''}`} onClick={() => setVaultView('folders')}>
            <FaFolder /> Folders
          </button>
          <button className={`org-tab ${vaultView === 'recent' ? 'active' : ''}`} onClick={() => setVaultView('recent')}>
            <FaClock /> Recent
          </button>
          <button className={`org-tab ${vaultView === 'shared' ? 'active' : ''}`} onClick={() => setVaultView('shared')}>
            <FaShare /> Shared
          </button>
          <button className={`org-tab ${vaultView === 'expiring' ? 'active' : ''}`} onClick={() => setVaultView('expiring')}>
            <FaExclamationTriangle /> Expiring
          </button>
        </div>

        {vaultView === 'folders' && (
          <div className="vault-folders">
            <div className="folder-grid">
              <div className="folder-card" onClick={() => handleOpenFolder('tax-returns')}>
                <div className="folder-icon">📋</div>
                <div className="folder-info">
                  <h4>Tax Returns</h4>
                  <p>45 documents • 2.3 GB</p>
                  <span className="folder-date">Updated 2 days ago</span>
                </div>
                <FaChevronRight className="folder-arrow" />
              </div>

              <div className="folder-card" onClick={() => handleOpenFolder('invoices')}>
                <div className="folder-icon">🧾</div>
                <div className="folder-info">
                  <h4>Invoices & Receipts</h4>
                  <p>89 documents • 4.1 GB</p>
                  <span className="folder-date">Updated today</span>
                </div>
                <FaChevronRight className="folder-arrow" />
              </div>

              <div className="folder-card" onClick={() => handleOpenFolder('financials')}>
                <div className="folder-icon">📊</div>
                <div className="folder-info">
                  <h4>Financial Statements</h4>
                  <p>23 documents • 1.8 GB</p>
                  <span className="folder-date">Updated 1 week ago</span>
                </div>
                <FaChevronRight className="folder-arrow" />
              </div>

              <div className="folder-card" onClick={() => handleOpenFolder('compliance')}>
                <div className="folder-icon">🔒</div>
                <div className="folder-info">
                  <h4>Compliance Reports</h4>
                  <p>67 documents • 3.2 GB</p>
                  <span className="folder-date">Updated 3 days ago</span>
                </div>
                <FaChevronRight className="folder-arrow" />
              </div>

              <div className="folder-card" onClick={() => handleOpenFolder('audit')}>
                <div className="folder-icon">📈</div>
                <div className="folder-info">
                  <h4>Audit Trails</h4>
                  <p>23 documents • 890 MB</p>
                  <span className="folder-date">Updated yesterday</span>
                </div>
                <FaChevronRight className="folder-arrow" />
              </div>

              <div className="folder-card" onClick={() => handleOpenFolder('legal')}>
                <div className="folder-icon">⚖️</div>
                <div className="folder-info">
                  <h4>Legal Documents</h4>
                  <p>12 documents • 456 MB</p>
                  <span className="folder-date">Updated 2 weeks ago</span>
                </div>
                <FaChevronRight className="folder-arrow" />
              </div>
            </div>
          </div>
        )}

        {vaultView === 'recent' && (
          <div className="recent-documents">
            <div className="documents-list">
              <div className="document-item">
                <div className="doc-icon"><FaFileAlt /></div>
                <div className="doc-info">
                  <h4>Q4 2024 Tax Summary.pdf</h4>
                  <p>Auto-generated • 2.3 MB</p>
                  <span className="doc-date">Uploaded 2 hours ago</span>
                </div>
                <div className="doc-actions">
                  <button className="btn-link" onClick={() => handleDownloadDocument('q4-summary')}>
                    <FaDownload />
                  </button>
                  <button className="btn-link" onClick={() => handleShareDocument('q4-summary')}>
                    <FaShare />
                  </button>
                </div>
              </div>

              <div className="document-item">
                <div className="doc-icon"><FaFileInvoice /></div>
                <div className="doc-info">
                  <h4>Office Supplies Invoice - Jan 2025.pdf</h4>
                  <p>Auto-categorized • 1.2 MB</p>
                  <span className="doc-date">Uploaded 4 hours ago</span>
                </div>
                <div className="doc-actions">
                  <button className="btn-link" onClick={() => handleDownloadDocument('office-invoice')}>
                    <FaDownload />
                  </button>
                  <button className="btn-link" onClick={() => handleViewDocument('office-invoice')}>
                    <FaEye />
                  </button>
                </div>
              </div>

              <div className="document-item">
                <div className="doc-icon"><FaDatabase /></div>
                <div className="doc-info">
                  <h4>Compliance Audit Trail.xlsx</h4>
                  <p>Auto-generated • 5.6 MB</p>
                  <span className="doc-date">Uploaded yesterday</span>
                </div>
                <div className="doc-actions">
                  <button className="btn-link" onClick={() => handleDownloadDocument('audit-trail')}>
                    <FaDownload />
                  </button>
                  <button className="btn-link" onClick={() => handleExportDocument('audit-trail')}>
                    <FaFileExport />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auto-Processing Features */}
      <div className="auto-processing">
        <div className="processing-header">
          <FaSync className="processing-icon spinning" />
          <div className="processing-info">
            <h4>AI-Powered Auto-Processing</h4>
            <p>Documents are automatically scanned, categorized, and linked to transactions</p>
          </div>
        </div>

        <div className="processing-features">
          <div className="feature-item">
            <FaRobot className="feature-icon" />
            <div className="feature-info">
              <h5>Smart Categorization</h5>
              <p>AI automatically categorizes documents and extracts key data</p>
              <span className="feature-stat">96% accuracy</span>
            </div>
          </div>

          <div className="feature-item">
            <FaLink className="feature-icon" />
            <div className="feature-info">
              <h5>Transaction Linking</h5>
              <p>Automatically links receipts and invoices to financial transactions</p>
              <span className="feature-stat">89% match rate</span>
            </div>
          </div>

          <div className="feature-item">
            <FaSearch className="feature-icon" />
            <div className="feature-info">
              <h5>OCR & Data Extraction</h5>
              <p>Extracts text and data from scanned documents and images</p>
              <span className="feature-stat">94% success rate</span>
            </div>
          </div>

          <div className="feature-item">
            <FaShieldAlt className="feature-icon" />
            <div className="feature-info">
              <h5>Compliance Verification</h5>
              <p>Validates documents against regulatory requirements</p>
              <span className="feature-stat">99% compliance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Recovery */}
      <div className="backup-recovery">
        <h3><FaDatabase /> Backup & Recovery</h3>
        <div className="backup-status">
          <div className="backup-item">
            <div className="backup-info">
              <h4>Automated Backups</h4>
              <p>Daily encrypted backups to multiple geographic locations</p>
            </div>
            <div className="backup-status-indicator">
              <span className="status-badge active">Active</span>
              <span className="last-backup">Last: 4 hours ago</span>
            </div>
          </div>

          <div className="backup-item">
            <div className="backup-info">
              <h4>Version Control</h4>
              <p>Keep unlimited versions of all documents</p>
            </div>
            <div className="backup-status-indicator">
              <span className="status-badge active">Enabled</span>
              <span className="version-count">1,247 versions stored</span>
            </div>
          </div>

          <div className="backup-item">
            <div className="backup-info">
              <h4>Disaster Recovery</h4>
              <p>99.999% uptime with instant failover capabilities</p>
            </div>
            <div className="backup-status-indicator">
              <span className="status-badge operational">Operational</span>
              <span className="recovery-time">RTO: 15 minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showVaultUpload && (
        <div className="modal-overlay" onClick={() => setShowVaultUpload(false)}>
          <div className="modal-content vault-upload-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add to Compliance Vault</h3>
              <button className="close-btn" onClick={() => setShowVaultUpload(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Document Type</label>
                <select
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                >
                  <option value="tax_return">Tax Return</option>
                  <option value="tax_certificate">Tax Certificate</option>
                  <option value="license">License</option>
                  <option value="registration">Registration</option>
                  <option value="permit">Permit</option>
                  <option value="insurance">Insurance</option>
                  <option value="contract">Contract</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-field">
                <label>Title</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g. Annual CIT Filing Receipt"
                />
              </div>
              <div className="form-field">
                <label>Issuing Authority</label>
                <input
                  type="text"
                  value={uploadForm.issuing_authority}
                  onChange={(e) => setUploadForm({ ...uploadForm, issuing_authority: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={uploadForm.issue_date}
                  onChange={(e) => setUploadForm({ ...uploadForm, issue_date: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={uploadForm.expiry_date}
                  onChange={(e) => setUploadForm({ ...uploadForm, expiry_date: e.target.value })}
                />
              </div>
              <div className="form-field full">
                <label>Notes</label>
                <textarea
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                  placeholder="Optional notes"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowVaultUpload(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleUploadComplianceDocument} disabled={!selectedEntityId || isLoading}>
                Save to Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReconciliation = () => (
    <div className="reconciliation-section">
      <div className="section-header">
        <h2><FaSync /> Auto-Reconciliation Engine</h2>
        <p>Automated matching, validation, and reconciliation of financial data</p>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => handleRunReconciliation()}>
            <FaPlay /> Run Reconciliation
          </button>
          <button className="btn-secondary" onClick={() => handleReconciliationSettings()}>
            <FaCog /> Settings
          </button>
          <div className="reconciliation-status">
            <FaSync className={`status-icon ${reconciliationStatus === 'running' ? 'spinning' : ''}`} />
            <span>{reconciliationStatus === 'running' ? 'Running...' : 'Ready'}</span>
          </div>
        </div>
      </div>

      {/* Reconciliation Dashboard */}
      <div className="reconciliation-dashboard">
        <div className="reconciliation-stats">
          <div className="stat-card success">
            <div className="stat-icon"><FaCheckCircle /></div>
            <div className="stat-content">
              <h3>98.7%</h3>
              <p>Auto-Matched</p>
              <span className="stat-detail">12,456 transactions</span>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon"><FaExclamationTriangle /></div>
            <div className="stat-content">
              <h3>1.2%</h3>
              <p>Manual Review</p>
              <span className="stat-detail">147 transactions</span>
            </div>
          </div>
          <div className="stat-card error">
            <div className="stat-icon"><FaTimes /></div>
            <div className="stat-content">
              <h3>0.1%</h3>
              <p>Exceptions</p>
              <span className="stat-detail">15 transactions</span>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon"><FaClock /></div>
            <div className="stat-content">
              <h3>2.3s</h3>
              <p>Avg. Processing Time</p>
              <span className="stat-detail">Per transaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reconciliation Process Visualization */}
      <div className="reconciliation-process">
        <h3>Automated Reconciliation Pipeline</h3>
        <div className="process-steps">
          <div className="step completed">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Data Import & Normalization</h4>
              <p>Import transactions from banks, accounting software, and manual entries</p>
              <span className="step-status">✓ Completed</span>
            </div>
          </div>

          <div className="step completed">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Duplicate Detection</h4>
              <p>AI-powered detection of duplicate transactions across all sources</p>
              <span className="step-status">✓ 23 duplicates found & merged</span>
            </div>
          </div>

          <div className="step completed">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Auto-Categorization</h4>
              <p>Machine learning categorizes transactions based on historical patterns</p>
              <span className="step-status">✓ 94% accuracy rate</span>
            </div>
          </div>

          <div className="step active">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Rule-Based Matching</h4>
              <p>Apply custom reconciliation rules and matching algorithms</p>
              <span className="step-status">⟳ Processing...</span>
            </div>
          </div>

          <div className="step pending">
            <div className="step-number">5</div>
            <div className="step-content">
              <h4>Exception Handling</h4>
              <p>Flag transactions requiring manual review or intervention</p>
              <span className="step-status">○ Pending</span>
            </div>
          </div>

          <div className="step pending">
            <div className="step-number">6</div>
            <div className="step-content">
              <h4>Report Generation</h4>
              <p>Generate reconciliation reports and audit trails</p>
              <span className="step-status">○ Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reconciliation Rules */}
      <div className="reconciliation-rules">
        <h3><FaCog /> Active Reconciliation Rules</h3>
        <div className="rules-grid">
          <div className="rule-card">
            <div className="rule-header">
              <h4>Amount Matching</h4>
              <span className="rule-status active">Active</span>
            </div>
            <p>Match transactions within $0.01 tolerance</p>
            <div className="rule-stats">
              <span>Matched: 8,945</span>
              <span>Success Rate: 97%</span>
            </div>
          </div>

          <div className="rule-card">
            <div className="rule-header">
              <h4>Date Matching</h4>
              <span className="rule-status active">Active</span>
            </div>
            <p>Match transactions within 3 business days</p>
            <div className="rule-stats">
              <span>Matched: 7,123</span>
              <span>Success Rate: 89%</span>
            </div>
          </div>

          <div className="rule-card">
            <div className="rule-header">
              <h4>Payee Matching</h4>
              <span className="rule-status active">Active</span>
            </div>
            <p>Fuzzy matching of payee names and descriptions</p>
            <div className="rule-stats">
              <span>Matched: 6,789</span>
              <span>Success Rate: 92%</span>
            </div>
          </div>

          <div className="rule-card">
            <div className="rule-header">
              <h4>Reference Number Matching</h4>
              <span className="rule-status active">Active</span>
            </div>
            <p>Exact matching of invoice numbers, check numbers, etc.</p>
            <div className="rule-stats">
              <span>Matched: 4,567</span>
              <span>Success Rate: 99%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Review Queue */}
      <div className="manual-review">
        <h3><FaEye /> Manual Review Queue</h3>
        <div className="review-queue">
          <div className="queue-header">
            <span>15 transactions need review</span>
            <div className="queue-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">High Priority</button>
              <button className="filter-btn">Duplicates</button>
              <button className="filter-btn">Unmatched</button>
            </div>
          </div>

          <div className="review-items">
            <div className="review-item high-priority">
              <div className="review-content">
                <div className="transaction-info">
                  <h4>$2,450.00 - Office Depot</h4>
                  <p>Possible duplicate transaction detected</p>
                  <span className="transaction-date">Jan 15, 2025</span>
                </div>
                <div className="review-suggestions">
                  <button className="suggestion-btn" onClick={() => handleReviewAction('merge')}>
                    Merge Transactions
                  </button>
                  <button className="suggestion-btn" onClick={() => handleReviewAction('keep-both')}>
                    Keep Both
                  </button>
                  <button className="suggestion-btn" onClick={() => handleReviewAction('flag')}>
                    Flag for Audit
                  </button>
                </div>
              </div>
              <div className="review-actions">
                <button className="btn-link" onClick={() => handleViewTransaction('office-depot')}>
                  View Details
                </button>
              </div>
            </div>

            <div className="review-item medium-priority">
              <div className="review-content">
                <div className="transaction-info">
                  <h4>$89.99 - Amazon Web Services</h4>
                  <p>Category mismatch - suggested: Technology vs Office Supplies</p>
                  <span className="transaction-date">Jan 14, 2025</span>
                </div>
                <div className="review-suggestions">
                  <button className="suggestion-btn" onClick={() => handleReviewAction('accept-suggestion')}>
                    Accept Technology
                  </button>
                  <button className="suggestion-btn" onClick={() => handleReviewAction('keep-office')}>
                    Keep Office Supplies
                  </button>
                </div>
              </div>
              <div className="review-actions">
                <button className="btn-link" onClick={() => handleViewTransaction('aws')}>
                  View Details
                </button>
              </div>
            </div>

            <div className="review-item low-priority">
              <div className="review-content">
                <div className="transaction-info">
                  <h4>$15.67 - Starbucks</h4>
                  <p>Unmatched transaction - no corresponding bank record</p>
                  <span className="transaction-date">Jan 13, 2025</span>
                </div>
                <div className="review-suggestions">
                  <button className="suggestion-btn" onClick={() => handleReviewAction('add-bank-record')}>
                    Add Bank Record
                  </button>
                  <button className="suggestion-btn" onClick={() => handleReviewAction('remove-transaction')}>
                    Remove Transaction
                  </button>
                </div>
              </div>
              <div className="review-actions">
                <button className="btn-link" onClick={() => handleViewTransaction('starbucks')}>
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reconciliation Reports */}
      <div className="reconciliation-reports">
        <h3><FaFileAlt /> Reconciliation Reports</h3>
        <div className="reports-grid">
          <div className="report-card">
            <div className="report-icon"><FaFileAlt /></div>
            <div className="report-info">
              <h4>Daily Reconciliation Report</h4>
              <p>Automated daily reconciliation summary</p>
              <span className="report-date">Generated today at 6:00 AM</span>
            </div>
            <div className="report-actions">
              <button className="btn-link" onClick={() => handleDownloadReport('daily')}>
                <FaDownload /> Download
              </button>
            </div>
          </div>

          <div className="report-card">
            <div className="report-icon"><FaFileInvoice /></div>
            <div className="report-info">
              <h4>Monthly Reconciliation Audit</h4>
              <p>Comprehensive monthly audit trail</p>
              <span className="report-date">Generated Jan 1, 2025</span>
            </div>
            <div className="report-actions">
              <button className="btn-link" onClick={() => handleDownloadReport('monthly')}>
                <FaDownload /> Download
              </button>
            </div>
          </div>

          <div className="report-card">
            <div className="report-icon"><FaDatabase /></div>
            <div className="report-info">
              <h4>Exception Report</h4>
              <p>All transactions requiring manual review</p>
              <span className="report-date">Updated in real-time</span>
            </div>
            <div className="report-actions">
              <button className="btn-link" onClick={() => handleDownloadReport('exceptions')}>
                <FaDownload /> Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFiling = () => (
    <div className="filing-section">
      <div className="section-header">
        <h2><FaFileExport /> Filing & Submission Assistance</h2>
        <p>Guided tax filing and form preparation</p>
      </div>

      <div className="filing-dashboard">
        <div className="upcoming-filings">
          <h3>Upcoming Filings</h3>
          <div className="filings-list">
            <div className="filing-item">
              <div className="filing-info">
                <h4>US Form 1120</h4>
                <p>Corporate Income Tax Return</p>
                <span className="filing-due">Due: April 15, 2025</span>
              </div>
              <div className="filing-status">
                <span className="status-badge ready">Ready to File</span>
              </div>
              <div className="filing-actions">
                <button className="btn-secondary">Prepare</button>
                <button className="btn-primary">File Now</button>
              </div>
            </div>

            <div className="filing-item">
              <div className="filing-info">
                <h4>UK CT600</h4>
                <p>Corporation Tax Return</p>
                <span className="filing-due">Due: December 31, 2025</span>
              </div>
              <div className="filing-status">
                <span className="status-badge in-progress">In Progress</span>
              </div>
              <div className="filing-actions">
                <button className="btn-secondary">Continue</button>
              </div>
            </div>
          </div>
        </div>

        <div className="filing-assistance">
          <h3>Filing Assistance</h3>
          <div className="assistance-grid">
            <div className="assistance-card">
              <h4>Form Pre-filling</h4>
              <p>Auto-populate forms with your data</p>
              <button className="btn-link">Learn More</button>
            </div>
            <div className="assistance-card">
              <h4>Step-by-Step Guidance</h4>
              <p>Guided filing process with explanations</p>
              <button className="btn-link">Start Guide</button>
            </div>
            <div className="assistance-card">
              <h4>Export for Accountant</h4>
              <p>Prepare data packages for your tax professional</p>
              <button className="btn-link">Export</button>
            </div>
          </div>
        </div>

        <div className="filing-history">
          <h3>Recent Filings</h3>
          <div className="history-list">
            <div className="history-item">
              <div className="history-info">
                <h4>Q3 2024 Tax Return</h4>
                <p>Filed successfully on October 15, 2024</p>
              </div>
              <div className="history-status">
                <span className="status-badge accepted">Accepted</span>
              </div>
              <button className="btn-link">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'profiles': return renderTaxProfiles();
      case 'calculator': return renderTaxCalculator();
      case 'documents': return renderDocuments();
      case 'monitoring': return renderMonitoring();
      case 'advisor': return renderAdvisor();
      case 'vault': return renderVault();
      case 'reconciliation': return renderReconciliation();
      case 'filing': return renderFiling();
      default: return renderOverview();
    }
  };

  return (
    <div className="enterprise-tax-compliance">
      {/* Page Header */}
      <div className="page-header-tax">
        <div className="header-content-tax">
          <h1>Tax & Compliance</h1>
          <p>Automated Global Tax Management</p>
        </div>
        <div className="header-actions">
          <select
            className="entity-selector"
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            disabled={!entities || entities.length === 0}
          >
            {(!entities || entities.length === 0) ? (
              <option value="">No entities</option>
            ) : (
              entities.map((ent) => (
                <option key={ent.id} value={String(ent.id)}>
                  {ent.name} ({ent.country})
                </option>
              ))
            )}
          </select>
          {dataError ? <span className="status-badge warning">{dataError}</span> : null}
        </div>
      </div>

      {/* Section Navigation Header */}
      <div className="section-navigation">
        <button
          className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'overview' })}
        >
          <FaChartBar /> Overview
        </button>
        <button
          className={`nav-btn ${activeSection === 'profiles' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'profiles' })}
        >
          <FaGlobe /> Tax Profiles
        </button>
        <button
          className={`nav-btn ${activeSection === 'calculator' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'calculator' })}
        >
          <FaCalculator /> Tax Calculator
        </button>
        <button
          className={`nav-btn ${activeSection === 'documents' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'documents' })}
        >
          <FaFileAlt /> Documents
        </button>
        <button
          className={`nav-btn ${activeSection === 'monitoring' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'monitoring' })}
        >
          <FaBell /> Monitoring
        </button>
        <button
          className={`nav-btn ${activeSection === 'advisor' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'advisor' })}
        >
          <FaRobot /> AI Advisor
        </button>
        <button
          className={`nav-btn ${activeSection === 'vault' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'vault' })}
        >
          <FaLock /> Compliance Vault
        </button>
        <button
          className={`nav-btn ${activeSection === 'reconciliation' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'reconciliation' })}
        >
          <FaSync /> Reconciliation
        </button>
        <button
          className={`nav-btn ${activeSection === 'filing' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'filing' })}
        >
          <FaFileInvoice /> Filing Assistant
        </button>
      </div>

      {/* Main Content */}
      <div className="compliance-main">
        {/* Content Area */}
        <div className="compliance-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseTaxCompliance;
