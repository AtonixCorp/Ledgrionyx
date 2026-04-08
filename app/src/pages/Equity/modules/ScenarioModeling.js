import React, { useMemo, useState } from 'react';
import { useEquity } from '../../../context/EquityContext';
import '../components/EquityModuleScreen.css';
import '../components/EquityCrudModuleScreen.css';

const roundFormDefaults = {
  name: '',
  share_class: '',
  instrument_type: 'equity',
  announced_at: '',
  pre_money_valuation: '0',
  amount_raised: '0',
  price_per_share: '0',
  option_pool_top_up: '0',
  apply_pro_rata: true,
  notes: '',
};

const scenarioFormDefaults = {
  name: 'Scenario Round',
  share_class: '',
  investor_name: 'New Investor',
  pre_money_valuation: '20000000',
  amount_raised: '5000000',
  price_per_share: '',
  option_pool_top_up: '0',
  apply_pro_rata: true,
  include_anti_dilution: true,
  exit_values: '25000000,50000000,100000000',
};

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(Number(value || 0));
const formatMoney = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value || 0));
const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;

const ScenarioModeling = () => {
  const {
    loading,
    error,
    saving,
    shareClasses,
    fundingRounds,
    optionPoolReserves,
    reports,
    scenarioApprovals,
    scenarioOverview,
    scenarioAnalysis,
    createFundingRound,
    updateFundingRound,
    deleteFundingRound,
    analyzeScenario,
    commitScenario,
    requestScenarioApproval,
    boardApproveScenario,
    legalApproveScenario,
    rejectScenarioApproval,
    saveScenarioReport,
    exportScenarioPdf,
  } = useEquity();

  const [roundForm, setRoundForm] = useState(roundFormDefaults);
  const [roundEditingId, setRoundEditingId] = useState(null);
  const [scenarioForm, setScenarioForm] = useState(scenarioFormDefaults);
  const [reportingPeriod, setReportingPeriod] = useState('Scenario Modeling');
  const [actionMessage, setActionMessage] = useState('');
  const [comparisonLeftId, setComparisonLeftId] = useState('');
  const [comparisonRightId, setComparisonRightId] = useState('');

  const metrics = useMemo(() => {
    const financing = scenarioAnalysis?.financing;
    return [
      {
        label: 'Fully Diluted Base',
        value: formatNumber(scenarioOverview?.cap_table?.fully_diluted_shares || 0),
        note: 'Current fully diluted shares before the modeled round.',
      },
      {
        label: 'Latest Scenario New Shares',
        value: formatNumber(financing?.new_money_shares || 0),
        note: 'Primary shares issued in the last scenario run.',
      },
      {
        label: 'Scenario Post-Money',
        value: formatMoney(financing?.post_money_valuation || 0),
        note: 'Pre-money plus new capital for the latest run.',
      },
      {
        label: 'Stored Rounds',
        value: formatNumber(fundingRounds.length),
        note: 'Saved financing rounds tied to real share classes.',
      },
    ];
  }, [fundingRounds.length, scenarioAnalysis, scenarioOverview]);

  const scenarioReports = useMemo(
    () => reports.filter((report) => report.report_type === 'scenario_model' || report.payload?.analysis),
    [reports],
  );

  const leftReport = scenarioReports.find((report) => report.id === comparisonLeftId) || null;
  const rightReport = scenarioReports.find((report) => report.id === comparisonRightId) || null;

  const comparisonRows = useMemo(() => {
    if (!leftReport || !rightReport) {
      return [];
    }
    const leftTable = leftReport.payload?.analysis?.post_cap_table || [];
    const rightTable = rightReport.payload?.analysis?.post_cap_table || [];
    const index = new Map();
    leftTable.forEach((row) => index.set(`${row.holder_name}|${row.share_class_name}`, { left: row, right: null }));
    rightTable.forEach((row) => {
      const key = `${row.holder_name}|${row.share_class_name}`;
      const entry = index.get(key) || { left: null, right: null };
      entry.right = row;
      index.set(key, entry);
    });
    return [...index.entries()].map(([key, value]) => {
      const [holderName, shareClassName] = key.split('|');
      const leftShares = Number(value.left?.shares || 0);
      const rightShares = Number(value.right?.shares || 0);
      const leftOwnership = Number(value.left?.ownership_percent || 0);
      const rightOwnership = Number(value.right?.ownership_percent || 0);
      return {
        holderName,
        shareClassName,
        leftShares,
        rightShares,
        deltaShares: rightShares - leftShares,
        leftOwnership,
        rightOwnership,
        deltaOwnership: rightOwnership - leftOwnership,
      };
    }).sort((left, right) => Math.abs(right.deltaShares) - Math.abs(left.deltaShares));
  }, [leftReport, rightReport]);

  const waterfallComparisonRows = useMemo(() => {
    if (!leftReport || !rightReport) {
      return [];
    }
    const leftWaterfalls = leftReport.payload?.analysis?.waterfalls || [];
    const rightWaterfalls = rightReport.payload?.analysis?.waterfalls || [];
    const index = new Map();
    leftWaterfalls.forEach((waterfall) => {
      (waterfall.class_distributions || []).forEach((row) => {
        index.set(`${waterfall.exit_value}|${row.share_class_name}`, { left: row, right: null, exitValue: waterfall.exit_value, shareClassName: row.share_class_name });
      });
    });
    rightWaterfalls.forEach((waterfall) => {
      (waterfall.class_distributions || []).forEach((row) => {
        const key = `${waterfall.exit_value}|${row.share_class_name}`;
        const entry = index.get(key) || { left: null, right: null, exitValue: waterfall.exit_value, shareClassName: row.share_class_name };
        entry.right = row;
        index.set(key, entry);
      });
    });
    return [...index.values()].map((entry) => {
      const leftTotal = Number(entry.left?.total_paid || 0);
      const rightTotal = Number(entry.right?.total_paid || 0);
      return {
        exitValue: entry.exitValue,
        shareClassName: entry.shareClassName,
        leftTotal,
        rightTotal,
        deltaTotal: rightTotal - leftTotal,
      };
    }).sort((left, right) => Number(left.exitValue) - Number(right.exitValue) || Math.abs(right.deltaTotal) - Math.abs(left.deltaTotal));
  }, [leftReport, rightReport]);

  const holderWaterfallComparisonRows = useMemo(() => {
    if (!leftReport || !rightReport) {
      return [];
    }
    const leftWaterfalls = leftReport.payload?.analysis?.waterfalls || [];
    const rightWaterfalls = rightReport.payload?.analysis?.waterfalls || [];
    const index = new Map();
    leftWaterfalls.forEach((waterfall) => {
      (waterfall.holder_distributions || []).forEach((row) => {
        index.set(`${waterfall.exit_value}|${row.holder_name}|${row.share_class_name}`, { left: row, right: null, exitValue: waterfall.exit_value, holderName: row.holder_name, shareClassName: row.share_class_name });
      });
    });
    rightWaterfalls.forEach((waterfall) => {
      (waterfall.holder_distributions || []).forEach((row) => {
        const key = `${waterfall.exit_value}|${row.holder_name}|${row.share_class_name}`;
        const entry = index.get(key) || { left: null, right: null, exitValue: waterfall.exit_value, holderName: row.holder_name, shareClassName: row.share_class_name };
        entry.right = row;
        index.set(key, entry);
      });
    });
    return [...index.values()].map((entry) => {
      const leftPayout = Number(entry.left?.payout || 0);
      const rightPayout = Number(entry.right?.payout || 0);
      return {
        exitValue: entry.exitValue,
        holderName: entry.holderName,
        shareClassName: entry.shareClassName,
        leftPayout,
        rightPayout,
        deltaPayout: rightPayout - leftPayout,
      };
    }).sort((left, right) => Number(left.exitValue) - Number(right.exitValue) || Math.abs(right.deltaPayout) - Math.abs(left.deltaPayout));
  }, [leftReport, rightReport]);

  const handleRoundSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...roundForm,
      pre_money_valuation: Number(roundForm.pre_money_valuation || 0),
      amount_raised: Number(roundForm.amount_raised || 0),
      price_per_share: Number(roundForm.price_per_share || 0),
      option_pool_top_up: Number(roundForm.option_pool_top_up || 0),
    };
    if (!payload.share_class) {
      delete payload.share_class;
    }
    if (roundEditingId) {
      await updateFundingRound(roundEditingId, payload);
    } else {
      await createFundingRound(payload);
    }
    setRoundForm(roundFormDefaults);
    setRoundEditingId(null);
  };

  const handleScenarioSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...scenarioForm,
      pre_money_valuation: Number(scenarioForm.pre_money_valuation || 0),
      amount_raised: Number(scenarioForm.amount_raised || 0),
      option_pool_top_up: Number(scenarioForm.option_pool_top_up || 0),
      exit_values: scenarioForm.exit_values
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => Number(item)),
    };
    if (!payload.price_per_share) {
      delete payload.price_per_share;
    } else {
      payload.price_per_share = Number(payload.price_per_share);
    }
    if (!payload.share_class) {
      delete payload.share_class;
    }
    await analyzeScenario(payload);
    setActionMessage('Scenario analysis refreshed.');
  };

  const buildScenarioPayload = () => {
    const payload = {
      ...scenarioForm,
      pre_money_valuation: Number(scenarioForm.pre_money_valuation || 0),
      amount_raised: Number(scenarioForm.amount_raised || 0),
      option_pool_top_up: Number(scenarioForm.option_pool_top_up || 0),
      apply_pro_rata: Boolean(scenarioForm.apply_pro_rata),
      include_anti_dilution: Boolean(scenarioForm.include_anti_dilution),
      exit_values: scenarioForm.exit_values
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => Number(item)),
    };
    if (!payload.price_per_share) {
      delete payload.price_per_share;
    } else {
      payload.price_per_share = Number(payload.price_per_share);
    }
    if (!payload.share_class) {
      delete payload.share_class;
    }
    return payload;
  };

  const handleCommitScenario = async () => {
    const approved = scenarioApprovals.find((item) => item.status === 'approved' && item.title === `${scenarioForm.name} Approval`);
    if (!approved) {
      setActionMessage('Request and approve the scenario before committing it.');
      return;
    }
    const result = await commitScenario({ approval_id: approved.id });
    setActionMessage(`Committed ${result.funding_round_name} into the live cap table.`);
  };

  const handleCommitApprovedRequest = async (approvalId) => {
    const result = await commitScenario({ approval_id: approvalId });
    setActionMessage(`Committed ${result.funding_round_name} into the live cap table.`);
  };

  const handleRequestApproval = async () => {
    const approval = await requestScenarioApproval({
      title: `${scenarioForm.name} Approval`,
      reporting_period: reportingPeriod,
      scenario: buildScenarioPayload(),
    });
    setActionMessage(`Approval request ${approval.title} created.`);
  };

  const handleSaveReport = async () => {
    const report = await saveScenarioReport({
      title: `${scenarioForm.name} Board Summary`,
      reporting_period: reportingPeriod,
      scenario: buildScenarioPayload(),
    });
    setActionMessage(`Saved scenario report ${report.title}.`);
  };

  const handleExportPdf = async () => {
    const title = `${scenarioForm.name} Board Summary`;
    await exportScenarioPdf({
      title,
      reporting_period: reportingPeriod,
      scenario: buildScenarioPayload(),
    }, `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    setActionMessage('Scenario PDF exported.');
  };

  const startRoundEdit = (round) => {
    setRoundEditingId(round.id);
    setRoundForm({
      name: round.name || '',
      share_class: round.share_class || '',
      instrument_type: round.instrument_type || 'equity',
      announced_at: round.announced_at || '',
      pre_money_valuation: String(round.pre_money_valuation ?? 0),
      amount_raised: String(round.amount_raised ?? 0),
      price_per_share: String(round.price_per_share ?? 0),
      option_pool_top_up: String(round.option_pool_top_up ?? 0),
      apply_pro_rata: Boolean(round.apply_pro_rata),
      notes: round.notes || '',
    });
  };

  return (
    <section className="eq-screen">
      <div className="eq-screen-hero">
        <div>
          <h2>Dilution Waterfall & Scenario Modeling</h2>
          <p>Model pre-money and post-money financing, pro-rata take-up, anti-dilution resets, liquidation preferences, and exit waterfalls from the live cap table.</p>
        </div>
        <div className="eq-screen-banner">
          The scenario engine uses the same share classes, holdings, grants, and stored round terms that power the rest of the equity workspace.
        </div>
      </div>

      <div className="eq-metric-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="eq-metric-card">
            <span className="eq-metric-label">{metric.label}</span>
            <strong className="eq-metric-value">{metric.value}</strong>
            <span className="eq-metric-note">{metric.note}</span>
          </article>
        ))}
      </div>

      {error && <div className="eq-error-banner">{error}</div>}
      {actionMessage && <div className="eq-status-chip success" style={{ marginBottom: '1rem' }}>{actionMessage}</div>}

      <div className="eq-crud-layout">
        <aside className="eq-data-card eq-form-card">
          <div className="eq-data-card-head">
            <h3>{roundEditingId ? 'Edit Funding Round' : 'Record Funding Round'}</h3>
            {roundEditingId && <button type="button" className="eq-inline-btn secondary" onClick={() => { setRoundEditingId(null); setRoundForm(roundFormDefaults); }}>Cancel edit</button>}
          </div>
          <p className="eq-form-copy">Persist round terms so the modeled issuance class, option pool top-up, and pro-rata settings become part of the operating cap table history.</p>
          <form className="eq-form-grid" onSubmit={handleRoundSubmit}>
            <label className="eq-form-field">
              <span className="eq-form-label">Round name</span>
              <input className="eq-form-input" value={roundForm.name} onChange={(event) => setRoundForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Issued class</span>
              <select className="eq-form-select" value={roundForm.share_class} onChange={(event) => setRoundForm((current) => ({ ...current, share_class: event.target.value }))}>
                <option value="">Select class</option>
                {shareClasses.map((shareClass) => <option key={shareClass.id} value={shareClass.id}>{shareClass.name}</option>)}
              </select>
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Instrument</span>
              <select className="eq-form-select" value={roundForm.instrument_type} onChange={(event) => setRoundForm((current) => ({ ...current, instrument_type: event.target.value }))}>
                <option value="equity">Equity</option>
                <option value="safe">SAFE</option>
                <option value="convertible_note">Convertible Note</option>
                <option value="warrant">Warrant</option>
                <option value="option">Option</option>
              </select>
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Announcement date</span>
              <input className="eq-form-input" type="date" value={roundForm.announced_at} onChange={(event) => setRoundForm((current) => ({ ...current, announced_at: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Pre-money</span>
              <input className="eq-form-input" type="number" min="0" step="0.01" value={roundForm.pre_money_valuation} onChange={(event) => setRoundForm((current) => ({ ...current, pre_money_valuation: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Raise amount</span>
              <input className="eq-form-input" type="number" min="0" step="0.01" value={roundForm.amount_raised} onChange={(event) => setRoundForm((current) => ({ ...current, amount_raised: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Price / share</span>
              <input className="eq-form-input" type="number" min="0" step="0.0001" value={roundForm.price_per_share} onChange={(event) => setRoundForm((current) => ({ ...current, price_per_share: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Option pool top-up</span>
              <input className="eq-form-input" type="number" min="0" step="1" value={roundForm.option_pool_top_up} onChange={(event) => setRoundForm((current) => ({ ...current, option_pool_top_up: event.target.value }))} />
            </label>
            <label className="eq-form-checkbox full">
              <input type="checkbox" checked={roundForm.apply_pro_rata} onChange={(event) => setRoundForm((current) => ({ ...current, apply_pro_rata: event.target.checked }))} />
              <span>Allow pro-rata participation in this round</span>
            </label>
            <label className="eq-form-field full">
              <span className="eq-form-label">Notes</span>
              <textarea className="eq-form-textarea" rows="3" value={roundForm.notes} onChange={(event) => setRoundForm((current) => ({ ...current, notes: event.target.value }))} />
            </label>
            <div className="eq-form-actions">
              <button type="submit" className="eq-inline-btn primary" disabled={saving}>{saving ? 'Saving…' : roundEditingId ? 'Save round' : 'Create round'}</button>
            </div>
          </form>
        </aside>

        <div className="eq-data-card">
          <div className="eq-data-card-head">
            <h3>Recorded Rounds</h3>
            {loading && <span className="eq-status-chip">Syncing</span>}
          </div>
          <div className="eq-table-wrap">
            <table className="eq-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Class</th>
                  <th>Pre-money</th>
                  <th>Raise</th>
                  <th>Post-money</th>
                  <th>New Shares</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fundingRounds.map((round) => (
                  <tr key={round.id}>
                    <td>{round.name}</td>
                    <td>{round.share_class_name || '—'}</td>
                    <td>{formatMoney(round.pre_money_valuation)}</td>
                    <td>{formatMoney(round.amount_raised)}</td>
                    <td>{formatMoney(round.post_money_valuation)}</td>
                    <td>{formatNumber(round.new_shares_issued)}</td>
                    <td>
                      <div className="eq-table-actions">
                        <button type="button" className="eq-inline-btn" onClick={() => startRoundEdit(round)}>Edit</button>
                        <button type="button" className="eq-inline-btn danger" onClick={() => deleteFundingRound(round.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="eq-crud-layout">
        <aside className="eq-data-card eq-form-card">
          <div className="eq-data-card-head">
            <h3>Run Financing Scenario</h3>
          </div>
          <p className="eq-form-copy">Model a hypothetical round against the live cap table. Example: raise $5M at $20M pre, include pro-rata, then inspect anti-dilution and liquidation waterfalls.</p>
          <form className="eq-form-grid" onSubmit={handleScenarioSubmit}>
            <label className="eq-form-field">
              <span className="eq-form-label">Scenario name</span>
              <input className="eq-form-input" value={scenarioForm.name} onChange={(event) => setScenarioForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Issued class</span>
              <select className="eq-form-select" value={scenarioForm.share_class} onChange={(event) => setScenarioForm((current) => ({ ...current, share_class: event.target.value }))}>
                <option value="">Temporary scenario security</option>
                {shareClasses.map((shareClass) => <option key={shareClass.id} value={shareClass.id}>{shareClass.name}</option>)}
              </select>
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Lead investor</span>
              <input className="eq-form-input" value={scenarioForm.investor_name} onChange={(event) => setScenarioForm((current) => ({ ...current, investor_name: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Pre-money</span>
              <input className="eq-form-input" type="number" min="0" step="0.01" value={scenarioForm.pre_money_valuation} onChange={(event) => setScenarioForm((current) => ({ ...current, pre_money_valuation: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Raise amount</span>
              <input className="eq-form-input" type="number" min="0" step="0.01" value={scenarioForm.amount_raised} onChange={(event) => setScenarioForm((current) => ({ ...current, amount_raised: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Price / share</span>
              <input className="eq-form-input" type="number" min="0" step="0.0001" placeholder={scenarioOverview?.defaults?.latest_valuation_price_per_share || 'Auto-derived'} value={scenarioForm.price_per_share} onChange={(event) => setScenarioForm((current) => ({ ...current, price_per_share: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Option pool top-up</span>
              <input className="eq-form-input" type="number" min="0" step="1" value={scenarioForm.option_pool_top_up} onChange={(event) => setScenarioForm((current) => ({ ...current, option_pool_top_up: event.target.value }))} />
            </label>
            <label className="eq-form-field full">
              <span className="eq-form-label">Exit values</span>
              <input className="eq-form-input" value={scenarioForm.exit_values} onChange={(event) => setScenarioForm((current) => ({ ...current, exit_values: event.target.value }))} />
            </label>
            <label className="eq-form-field full">
              <span className="eq-form-label">Reporting period</span>
              <input className="eq-form-input" value={reportingPeriod} onChange={(event) => setReportingPeriod(event.target.value)} />
            </label>
            <label className="eq-form-checkbox full">
              <input type="checkbox" checked={scenarioForm.apply_pro_rata} onChange={(event) => setScenarioForm((current) => ({ ...current, apply_pro_rata: event.target.checked }))} />
              <span>Allocate pro-rata rights to eligible holders</span>
            </label>
            <label className="eq-form-checkbox full">
              <input type="checkbox" checked={scenarioForm.include_anti_dilution} onChange={(event) => setScenarioForm((current) => ({ ...current, include_anti_dilution: event.target.checked }))} />
              <span>Apply anti-dilution resets for impacted preferred classes</span>
            </label>
            <div className="eq-form-actions">
              <button type="submit" className="eq-inline-btn primary" disabled={saving}>{saving ? 'Modeling…' : 'Run scenario'}</button>
              <button type="button" className="eq-inline-btn" disabled={saving} onClick={handleRequestApproval}>Request approval</button>
              <button type="button" className="eq-inline-btn" disabled={saving} onClick={handleCommitScenario}>Commit approved</button>
              <button type="button" className="eq-inline-btn" disabled={saving} onClick={handleSaveReport}>Save report</button>
              <button type="button" className="eq-inline-btn" disabled={saving} onClick={handleExportPdf}>Export PDF</button>
            </div>
          </form>
        </aside>

        <div className="eq-data-card">
          <div className="eq-data-card-head">
            <h3>Scenario Output</h3>
          </div>
          {!scenarioAnalysis ? (
            <div className="eq-empty-state">
              <h4>No scenario run yet</h4>
              <p>Launch a financing scenario to compare pre- and post-round ownership, anti-dilution effects, and liquidation distributions.</p>
            </div>
          ) : (
            <div className="eq-empty-state" style={{ textAlign: 'left' }}>
              <h4>{scenarioAnalysis.financing.security.name}</h4>
              <p>Price per share: {formatMoney(scenarioAnalysis.financing.price_per_share)} · New shares: {formatNumber(scenarioAnalysis.financing.new_money_shares)} · Pro-rata: {formatNumber(scenarioAnalysis.financing.pro_rata_shares)}</p>
              <p>Pre-money: {formatMoney(scenarioAnalysis.financing.pre_money_valuation)} · Post-money: {formatMoney(scenarioAnalysis.financing.post_money_valuation)} · Option pool top-up: {formatNumber(scenarioAnalysis.financing.option_pool_top_up)}</p>
              {scenarioAnalysis.financing.anti_dilution_adjustments.length > 0 && (
                <>
                  <h4 style={{ marginTop: '1rem' }}>Anti-Dilution Adjustments</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    {scenarioAnalysis.financing.anti_dilution_adjustments.map((item) => (
                      <li key={item.share_class_id}>{item.share_class_name}: {item.old_conversion_price} → {item.new_conversion_price} adding {formatNumber(item.incremental_shares)} shares</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {scenarioAnalysis && (
        <>
          <div className="eq-crud-layout">
            <div className="eq-data-card">
              <div className="eq-data-card-head">
                <h3>Approval Queue</h3>
              </div>
              <div className="eq-table-wrap">
                <table className="eq-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Board</th>
                      <th>Legal</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarioApprovals.map((approval) => (
                      <tr key={approval.id}>
                        <td>{approval.title}</td>
                        <td>{approval.board_status}</td>
                        <td>{approval.legal_status}</td>
                        <td>{approval.status}</td>
                        <td>
                          <div className="eq-table-actions">
                            <button type="button" className="eq-inline-btn" disabled={!approval.can_board_approve} onClick={() => boardApproveScenario(approval.id, {})}>Board approve</button>
                            <button type="button" className="eq-inline-btn" disabled={!approval.can_legal_approve} onClick={() => legalApproveScenario(approval.id, {})}>Legal approve</button>
                            {approval.status === 'approved' && <button type="button" className="eq-inline-btn" onClick={() => handleCommitApprovedRequest(approval.id)}>Commit</button>}
                            <button type="button" className="eq-inline-btn danger" disabled={!approval.can_board_approve && !approval.can_legal_approve} onClick={() => rejectScenarioApproval(approval.id, { reviewer_type: approval.can_legal_approve ? 'legal' : 'board', comments: 'Rejected from scenario console.' })}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="eq-data-card">
              <div className="eq-data-card-head">
                <h3>Option Pool Reserves</h3>
              </div>
              <div className="eq-table-wrap">
                <table className="eq-table">
                  <thead>
                    <tr>
                      <th>Share Class</th>
                      <th>Reserved</th>
                      <th>Allocated</th>
                      <th>Available</th>
                      <th>Round</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionPoolReserves.map((reserve) => (
                      <tr key={reserve.id}>
                        <td>{reserve.share_class_name}</td>
                        <td>{formatNumber(reserve.reserved_shares)}</td>
                        <td>{formatNumber(reserve.allocated_shares)}</td>
                        <td>{formatNumber(reserve.available_shares)}</td>
                        <td>{reserve.funding_round_name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="eq-crud-layout">
            <div className="eq-data-card">
              <div className="eq-data-card-head">
                <h3>Pre-Round Cap Table</h3>
              </div>
              <div className="eq-table-wrap">
                <table className="eq-table">
                  <thead>
                    <tr>
                      <th>Holder</th>
                      <th>Class</th>
                      <th>Shares</th>
                      <th>Ownership</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarioAnalysis.pre_cap_table.map((row) => (
                      <tr key={`${row.holder_id}-${row.share_class_id}`}>
                        <td>{row.holder_name}</td>
                        <td>{row.share_class_name}</td>
                        <td>{formatNumber(row.shares)}</td>
                        <td>{formatPercent(row.ownership_percent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="eq-data-card">
              <div className="eq-data-card-head">
                <h3>Post-Round Cap Table</h3>
              </div>
              <div className="eq-table-wrap">
                <table className="eq-table">
                  <thead>
                    <tr>
                      <th>Holder</th>
                      <th>Class</th>
                      <th>Post Shares</th>
                      <th>Ownership</th>
                      <th>New Money</th>
                      <th>Anti-Dilution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarioAnalysis.post_cap_table.map((row) => (
                      <tr key={`${row.holder_id}-${row.share_class_id}-post`}>
                        <td>{row.holder_name}</td>
                        <td>{row.share_class_name}</td>
                        <td>{formatNumber(row.shares)}</td>
                        <td>{formatPercent(row.ownership_percent)}</td>
                        <td>{formatNumber(row.new_money_shares)}</td>
                        <td>{formatNumber(row.anti_dilution_shares)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="eq-data-card">
            <div className="eq-data-card-head">
              <h3>Liquidation Waterfalls</h3>
            </div>
            <div className="eq-metric-grid">
              {scenarioAnalysis.waterfalls.map((waterfall) => (
                <article key={waterfall.exit_value} className="eq-metric-card" style={{ alignItems: 'stretch' }}>
                  <span className="eq-metric-label">Exit Value</span>
                  <strong className="eq-metric-value">{formatMoney(waterfall.exit_value)}</strong>
                  <span className="eq-metric-note">Remaining undistributed: {formatMoney(waterfall.remaining_exit)}</span>
                  <div className="eq-table-wrap" style={{ marginTop: '1rem' }}>
                    <table className="eq-table">
                      <thead>
                        <tr>
                          <th>Class</th>
                          <th>Preference</th>
                          <th>Residual</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {waterfall.class_distributions.map((row) => (
                          <tr key={`${waterfall.exit_value}-${row.share_class_id}`}>
                            <td>{row.share_class_name}</td>
                            <td>{formatMoney(row.preference_paid)}</td>
                            <td>{formatMoney(row.residual_paid)}</td>
                            <td>{formatMoney(row.total_paid)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="eq-data-card">
            <div className="eq-data-card-head">
              <h3>Compare Saved Scenarios</h3>
            </div>
            <div className="eq-form-grid" style={{ marginBottom: '1rem' }}>
              <label className="eq-form-field">
                <span className="eq-form-label">Left scenario</span>
                <select className="eq-form-select" value={comparisonLeftId} onChange={(event) => setComparisonLeftId(event.target.value)}>
                  <option value="">Select report</option>
                  {scenarioReports.map((report) => <option key={report.id} value={report.id}>{report.title}</option>)}
                </select>
              </label>
              <label className="eq-form-field">
                <span className="eq-form-label">Right scenario</span>
                <select className="eq-form-select" value={comparisonRightId} onChange={(event) => setComparisonRightId(event.target.value)}>
                  <option value="">Select report</option>
                  {scenarioReports.map((report) => <option key={report.id} value={report.id}>{report.title}</option>)}
                </select>
              </label>
            </div>
            {!leftReport || !rightReport ? (
              <div className="eq-empty-state">
                <h4>Select two saved scenario reports</h4>
                <p>Comparison mode uses saved scenario reports so dilution and waterfall deltas remain reproducible.</p>
              </div>
            ) : (
              <div className="eq-table-wrap">
                <table className="eq-table">
                  <thead>
                    <tr>
                      <th>Holder</th>
                      <th>Class</th>
                      <th>{leftReport.title}</th>
                      <th>{rightReport.title}</th>
                      <th>Share Delta</th>
                      <th>Ownership Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={`${row.holderName}-${row.shareClassName}`}>
                        <td>{row.holderName}</td>
                        <td>{row.shareClassName}</td>
                        <td>{formatNumber(row.leftShares)} / {formatPercent(row.leftOwnership)}</td>
                        <td>{formatNumber(row.rightShares)} / {formatPercent(row.rightOwnership)}</td>
                        <td>{formatNumber(row.deltaShares)}</td>
                        <td>{formatPercent(row.deltaOwnership)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {leftReport && rightReport && (
              <div className="eq-table-wrap" style={{ marginTop: '1rem' }}>
                <table className="eq-table">
                  <thead>
                    <tr>
                      <th>Exit Value</th>
                      <th>Share Class</th>
                      <th>{leftReport.title}</th>
                      <th>{rightReport.title}</th>
                      <th>Waterfall Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waterfallComparisonRows.map((row) => (
                      <tr key={`${row.exitValue}-${row.shareClassName}`}>
                        <td>{formatMoney(row.exitValue)}</td>
                        <td>{row.shareClassName}</td>
                        <td>{formatMoney(row.leftTotal)}</td>
                        <td>{formatMoney(row.rightTotal)}</td>
                        <td>{formatMoney(row.deltaTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {leftReport && rightReport && (
              <div className="eq-table-wrap" style={{ marginTop: '1rem' }}>
                <table className="eq-table">
                  <thead>
                    <tr>
                      <th>Exit Value</th>
                      <th>Holder</th>
                      <th>Class</th>
                      <th>{leftReport.title}</th>
                      <th>{rightReport.title}</th>
                      <th>Holder Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holderWaterfallComparisonRows.map((row) => (
                      <tr key={`${row.exitValue}-${row.holderName}-${row.shareClassName}`}>
                        <td>{formatMoney(row.exitValue)}</td>
                        <td>{row.holderName}</td>
                        <td>{row.shareClassName}</td>
                        <td>{formatMoney(row.leftPayout)}</td>
                        <td>{formatMoney(row.rightPayout)}</td>
                        <td>{formatMoney(row.deltaPayout)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default ScenarioModeling;