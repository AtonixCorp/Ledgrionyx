import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useEnterprise } from './EnterpriseContext';
import { entityStaffAPI, equityAPI } from '../services/api';
import { hasEquityModule } from '../utils/workspaceModules';

const EquityContext = createContext(null);

const asList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.results)) {
    return payload.results;
  }
  return [];
};

const triggerBlobDownload = (blob, filename) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export const EquityProvider = ({ children }) => {
  const { activeWorkspace } = useEnterprise();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [scenarioApprovalPolicy, setScenarioApprovalPolicy] = useState(null);
  const [reviewerCandidates, setReviewerCandidates] = useState([]);
  const [shareholders, setShareholders] = useState([]);
  const [shareClasses, setShareClasses] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [optionPoolReserves, setOptionPoolReserves] = useState([]);
  const [fundingRounds, setFundingRounds] = useState([]);
  const [valuations, setValuations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reports, setReports] = useState([]);
  const [grants, setGrants] = useState([]);
  const [vestingEvents, setVestingEvents] = useState([]);
  const [exerciseRequests, setExerciseRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [payrollTaxEvents, setPayrollTaxEvents] = useState([]);
  const [adapterConfigs, setAdapterConfigs] = useState([]);
  const [adapterPresets, setAdapterPresets] = useState({ payroll: [], payment: [] });
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [scenarioApprovals, setScenarioApprovals] = useState([]);
  const [scenarioApprovalInbox, setScenarioApprovalInbox] = useState({ pending: [], overdue: [], summary: {} });
  const [scenarioOverview, setScenarioOverview] = useState(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState(null);
  const [selfService, setSelfService] = useState({
    employee: null,
    grants: [],
    vestingEvents: [],
    exerciseRequests: [],
    certificates: [],
    deliveryLogs: [],
  });
  const [saving, setSaving] = useState(false);

  const workspaceId = activeWorkspace?.id;
  const equityEnabled = hasEquityModule(activeWorkspace);

  const refreshEquity = useCallback(async (entityId = workspaceId) => {
    if (!entityId || !equityEnabled) return;

    setLoading(true);
    setError(null);
    try {
      const [
        profileRes,
        approvalPolicyRes,
        reviewerCandidatesRes,
        shareholdersRes,
        shareClassesRes,
        holdingsRes,
        optionPoolReservesRes,
        roundsRes,
        valuationsRes,
        transactionsRes,
        reportsRes,
        grantsRes,
        vestingEventsRes,
        exerciseRequestsRes,
        certificatesRes,
        payrollTaxEventsRes,
        adapterConfigsRes,
        adapterPresetsRes,
        deliveryLogsRes,
        scenarioApprovalsRes,
        scenarioApprovalInboxRes,
        scenarioOverviewRes,
        selfServiceRes,
      ] = await Promise.all([
        equityAPI.profile.list(entityId),
        equityAPI.scenarioApprovalPolicy.list(entityId),
        entityStaffAPI.getAll({ entity: entityId }),
        equityAPI.shareholders.list(entityId),
        equityAPI.shareClasses.list(entityId),
        equityAPI.holdings.list(entityId),
        equityAPI.optionPoolReserves.list(entityId),
        equityAPI.fundingRounds.list(entityId),
        equityAPI.valuations.list(entityId),
        equityAPI.transactions.list(entityId),
        equityAPI.reports.list(entityId),
        equityAPI.grants.list(entityId),
        equityAPI.vestingEvents.list(entityId),
        equityAPI.exerciseRequests.list(entityId),
        equityAPI.certificates.list(entityId),
        equityAPI.payrollTaxEvents.list(entityId),
        equityAPI.adapterConfigs.list(entityId),
        equityAPI.adapterConfigs.presets(entityId),
        equityAPI.deliveryLogs.list(entityId),
        equityAPI.scenarioApprovals.list(entityId),
        equityAPI.scenarioApprovals.inbox(entityId),
        equityAPI.scenarios.overview(entityId),
        equityAPI.selfService.dashboard(entityId),
      ]);

      setProfile(asList(profileRes.data)[0] || null);
      setScenarioApprovalPolicy(asList(approvalPolicyRes.data)[0] || null);
      setReviewerCandidates(asList(reviewerCandidatesRes.data).filter((item) => String(item.entity) === String(entityId)));
      setShareholders(asList(shareholdersRes.data));
      setShareClasses(asList(shareClassesRes.data));
      setHoldings(asList(holdingsRes.data));
      setOptionPoolReserves(asList(optionPoolReservesRes.data));
      setFundingRounds(asList(roundsRes.data));
      setValuations(asList(valuationsRes.data));
      setTransactions(asList(transactionsRes.data));
      setReports(asList(reportsRes.data));
      setGrants(asList(grantsRes.data));
      setVestingEvents(asList(vestingEventsRes.data));
      setExerciseRequests(asList(exerciseRequestsRes.data));
      setCertificates(asList(certificatesRes.data));
      setPayrollTaxEvents(asList(payrollTaxEventsRes.data));
      setAdapterConfigs(asList(adapterConfigsRes.data));
      setAdapterPresets(adapterPresetsRes.data || { payroll: [], payment: [] });
      setDeliveryLogs(asList(deliveryLogsRes.data));
      setScenarioApprovals(asList(scenarioApprovalsRes.data));
      setScenarioApprovalInbox({
        pending: asList(scenarioApprovalInboxRes.data?.pending),
        overdue: asList(scenarioApprovalInboxRes.data?.overdue),
        summary: scenarioApprovalInboxRes.data?.summary || {},
      });
      setScenarioOverview(scenarioOverviewRes.data || null);
      setSelfService({
        employee: selfServiceRes.data?.employee || null,
        grants: asList(selfServiceRes.data?.grants),
        vestingEvents: asList(selfServiceRes.data?.vesting_events),
        exerciseRequests: asList(selfServiceRes.data?.exercise_requests),
        certificates: asList(selfServiceRes.data?.certificates),
        deliveryLogs: asList(selfServiceRes.data?.delivery_logs),
      });
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load equity data.');
    } finally {
      setLoading(false);
    }
  }, [equityEnabled, workspaceId]);

  const mutateResource = useCallback(async (resourceKey, method, payload, id) => {
    if (!workspaceId) {
      throw new Error('No active workspace is selected.');
    }

    const resourceApi = equityAPI[resourceKey];
    if (!resourceApi || typeof resourceApi[method] !== 'function') {
      throw new Error(`Unsupported equity resource action: ${resourceKey}.${method}`);
    }

    setSaving(true);
    setError(null);
    try {
      if (method === 'create') {
        await resourceApi.create(workspaceId, payload);
      } else if (method === 'update') {
        await resourceApi.update(workspaceId, id, payload);
      } else if (method === 'delete') {
        await resourceApi.delete(workspaceId, id);
      }
      await refreshEquity(workspaceId);
    } catch (err) {
      const details = err?.response?.data;
      const message = details?.detail || JSON.stringify(details) || err.message || 'Equity mutation failed.';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [refreshEquity, workspaceId]);

  const runResourceAction = useCallback(async (resourceKey, actionName, id, payload = {}) => {
    if (!workspaceId) {
      throw new Error('No active workspace is selected.');
    }

    const resourceApi = equityAPI[resourceKey];
    if (!resourceApi || typeof resourceApi[actionName] !== 'function') {
      throw new Error(`Unsupported equity action: ${resourceKey}.${actionName}`);
    }

    setSaving(true);
    setError(null);
    try {
      const response = await resourceApi[actionName](workspaceId, id, payload);
      await refreshEquity(workspaceId);
      return response?.data;
    } catch (err) {
      const details = err?.response?.data;
      const message = details?.detail || JSON.stringify(details) || err.message || 'Equity action failed.';
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [refreshEquity, workspaceId]);

  useEffect(() => {
    refreshEquity();
  }, [refreshEquity]);

  const summary = useMemo(() => ({
    totalShareholders: asList(shareholders).length,
    totalShareClasses: asList(shareClasses).length,
    totalHoldings: asList(holdings).reduce((total, holding) => total + Number(holding.quantity || 0), 0),
    totalRaised: asList(fundingRounds).reduce((total, round) => total + Number(round.amount_raised || 0), 0),
    latestEquityValue: asList(valuations)[0]?.equity_value || 0,
    pendingTransactions: asList(transactions).filter((item) => item.approval_status === 'pending').length,
    readyReports: asList(reports).filter((item) => item.status === 'ready').length,
    totalGrants: asList(grants).length,
    activeExercises: asList(exerciseRequests).filter((item) => ['requested', 'finance_review', 'legal_review', 'approved'].includes(item.status)).length,
    certificatesIssued: asList(certificates).filter((item) => item.status === 'issued').length,
  }), [certificates, exerciseRequests, fundingRounds, grants, holdings, reports, shareholders, shareClasses, transactions, valuations]);

  const value = {
    loading,
    error,
    workspaceId,
    equityEnabled,
    profile,
    scenarioApprovalPolicy,
    reviewerCandidates,
    shareholders,
    shareClasses,
    holdings,
    optionPoolReserves,
    fundingRounds,
    valuations,
    transactions,
    reports,
    grants,
    vestingEvents,
    exerciseRequests,
    certificates,
    payrollTaxEvents,
    adapterConfigs,
    adapterPresets,
    deliveryLogs,
    scenarioApprovals,
    scenarioApprovalInbox,
    scenarioOverview,
    scenarioAnalysis,
    selfService,
    summary,
    saving,
    refreshEquity,
    createShareholder: (payload) => mutateResource('shareholders', 'create', payload),
    updateShareholder: (id, payload) => mutateResource('shareholders', 'update', payload, id),
    deleteShareholder: (id) => mutateResource('shareholders', 'delete', null, id),
    createShareClass: (payload) => mutateResource('shareClasses', 'create', payload),
    updateShareClass: (id, payload) => mutateResource('shareClasses', 'update', payload, id),
    deleteShareClass: (id) => mutateResource('shareClasses', 'delete', null, id),
    createHolding: (payload) => mutateResource('holdings', 'create', payload),
    updateHolding: (id, payload) => mutateResource('holdings', 'update', payload, id),
    deleteHolding: (id) => mutateResource('holdings', 'delete', null, id),
    createOptionPoolReserve: (payload) => mutateResource('optionPoolReserves', 'create', payload),
    updateOptionPoolReserve: (id, payload) => mutateResource('optionPoolReserves', 'update', payload, id),
    deleteOptionPoolReserve: (id) => mutateResource('optionPoolReserves', 'delete', null, id),
    createFundingRound: (payload) => mutateResource('fundingRounds', 'create', payload),
    updateFundingRound: (id, payload) => mutateResource('fundingRounds', 'update', payload, id),
    deleteFundingRound: (id) => mutateResource('fundingRounds', 'delete', null, id),
    analyzeScenario: async (payload) => {
      if (!workspaceId) {
        throw new Error('No active workspace is selected.');
      }
      setSaving(true);
      setError(null);
      try {
        const response = await equityAPI.scenarios.analyze(workspaceId, payload);
        setScenarioAnalysis(response?.data || null);
        return response?.data;
      } catch (err) {
        const details = err?.response?.data;
        const message = details?.detail || JSON.stringify(details) || err.message || 'Scenario analysis failed.';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    commitScenario: async (payload) => {
      if (!workspaceId) {
        throw new Error('No active workspace is selected.');
      }
      setSaving(true);
      setError(null);
      try {
        const response = await equityAPI.scenarios.commit(workspaceId, payload);
        await refreshEquity(workspaceId);
        return response?.data;
      } catch (err) {
        const details = err?.response?.data;
        const message = details?.detail || JSON.stringify(details) || err.message || 'Scenario commit failed.';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    requestScenarioApproval: async (payload) => {
      if (!workspaceId) {
        throw new Error('No active workspace is selected.');
      }
      setSaving(true);
      setError(null);
      try {
        const response = await equityAPI.scenarios.requestApproval(workspaceId, payload);
        await refreshEquity(workspaceId);
        return response?.data;
      } catch (err) {
        const details = err?.response?.data;
        const message = details?.detail || JSON.stringify(details) || err.message || 'Scenario approval request failed.';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    updateScenarioApprovalPolicy: (id, payload) => mutateResource('scenarioApprovalPolicy', 'update', payload, id),
    runScenarioApprovalSlaSweep: async () => {
      if (!workspaceId) {
        throw new Error('No active workspace is selected.');
      }
      setSaving(true);
      setError(null);
      try {
        const response = await equityAPI.scenarioApprovals.runSlaSweep(workspaceId);
        await refreshEquity(workspaceId);
        return response?.data;
      } catch (err) {
        const details = err?.response?.data;
        const message = details?.detail || JSON.stringify(details) || err.message || 'Scenario SLA sweep failed.';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    boardApproveScenario: (id, payload = {}) => runResourceAction('scenarioApprovals', 'boardApprove', id, payload),
    legalApproveScenario: (id, payload = {}) => runResourceAction('scenarioApprovals', 'legalApprove', id, payload),
    rejectScenarioApproval: (id, payload = {}) => runResourceAction('scenarioApprovals', 'reject', id, payload),
    saveScenarioReport: async (payload) => {
      if (!workspaceId) {
        throw new Error('No active workspace is selected.');
      }
      setSaving(true);
      setError(null);
      try {
        const response = await equityAPI.scenarios.saveReport(workspaceId, payload);
        await refreshEquity(workspaceId);
        return response?.data;
      } catch (err) {
        const details = err?.response?.data;
        const message = details?.detail || JSON.stringify(details) || err.message || 'Scenario report save failed.';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    exportScenarioPdf: async (payload, filename = 'scenario-report.pdf') => {
      const response = await equityAPI.scenarios.exportPdf(workspaceId, payload);
      triggerBlobDownload(response.data, filename);
    },
    createValuation: (payload) => mutateResource('valuations', 'create', payload),
    updateValuation: (id, payload) => mutateResource('valuations', 'update', payload, id),
    deleteValuation: (id) => mutateResource('valuations', 'delete', null, id),
    createTransaction: (payload) => mutateResource('transactions', 'create', payload),
    updateTransaction: (id, payload) => mutateResource('transactions', 'update', payload, id),
    deleteTransaction: (id) => mutateResource('transactions', 'delete', null, id),
    createReport: (payload) => mutateResource('reports', 'create', payload),
    updateReport: (id, payload) => mutateResource('reports', 'update', payload, id),
    deleteReport: (id) => mutateResource('reports', 'delete', null, id),
    downloadReportPdf: async (id, filename = 'scenario-report.pdf') => {
      const response = await equityAPI.reports.downloadPdf(workspaceId, id);
      triggerBlobDownload(response.data, filename);
    },
    createGrant: (payload) => mutateResource('grants', 'create', payload),
    updateGrant: (id, payload) => mutateResource('grants', 'update', payload, id),
    deleteGrant: (id) => mutateResource('grants', 'delete', null, id),
    rebuildGrantSchedule: (id) => runResourceAction('grants', 'rebuildSchedule', id),
    regenerateGrantPackage: (id) => runResourceAction('grants', 'regeneratePackage', id),
    downloadGrantPackage: async (id, filename = 'grant-package.pdf') => {
      const response = await equityAPI.grants.downloadPackage(workspaceId, id);
      triggerBlobDownload(response.data, filename);
    },
    terminateGrant: (id, payload) => runResourceAction('grants', 'terminate', id, payload),
    triggerSingleAcceleration: (id, payload) => runResourceAction('grants', 'triggerSingle', id, payload),
    triggerDoubleAcceleration: (id, payload) => runResourceAction('grants', 'triggerDouble', id, payload),
    createExerciseRequest: (payload) => mutateResource('exerciseRequests', 'create', payload),
    updateExerciseRequest: (id, payload) => mutateResource('exerciseRequests', 'update', payload, id),
    deleteExerciseRequest: (id) => mutateResource('exerciseRequests', 'delete', null, id),
    approveExerciseRequest: (id, payload) => runResourceAction('exerciseRequests', 'approve', id, payload),
    rejectExerciseRequest: (id, payload) => runResourceAction('exerciseRequests', 'reject', id, payload),
    markExerciseRequestPaid: (id, payload) => runResourceAction('exerciseRequests', 'markPaid', id, payload),
    completeExerciseRequest: (id) => runResourceAction('exerciseRequests', 'complete', id),
    syncExercisePayment: (id) => runResourceAction('exerciseRequests', 'syncPayment', id),
    downloadCertificatePdf: async (id, filename = 'certificate.pdf') => {
      const response = await equityAPI.certificates.downloadPdf(workspaceId, id);
      triggerBlobDownload(response.data, filename);
    },
    regenerateCertificatePdf: (id) => runResourceAction('certificates', 'regeneratePdf', id),
    createAdapterConfig: (payload) => mutateResource('adapterConfigs', 'create', payload),
    updateAdapterConfig: (id, payload) => mutateResource('adapterConfigs', 'update', payload, id),
    deleteAdapterConfig: (id) => mutateResource('adapterConfigs', 'delete', null, id),
    testAdapterConnection: (id) => runResourceAction('adapterConfigs', 'testConnection', id),
    syncPayrollTaxEvent: (id) => runResourceAction('payrollTaxEvents', 'sync', id),
    runVestingSweep: async () => {
      const response = await equityAPI.selfService.runVestingSweep(workspaceId);
      await refreshEquity(workspaceId);
      return response.data;
    },
    downloadDeliveryDocument: async (id, filename = 'equity-document.pdf') => {
      const response = await equityAPI.deliveryLogs.downloadDocument(workspaceId, id);
      triggerBlobDownload(response.data, filename);
    },
    submitSelfServiceExercise: async (payload) => {
      if (!workspaceId) {
        throw new Error('No active workspace is selected.');
      }
      setSaving(true);
      setError(null);
      try {
        const response = await equityAPI.selfService.submitExercise(workspaceId, payload);
        await refreshEquity(workspaceId);
        return response?.data;
      } catch (err) {
        const details = err?.response?.data;
        const message = details?.detail || JSON.stringify(details) || err.message || 'Exercise request failed.';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
  };

  return <EquityContext.Provider value={value}>{children}</EquityContext.Provider>;
};

export const useEquity = () => {
  const context = useContext(EquityContext);
  if (!context) {
    throw new Error('useEquity must be used within an EquityProvider');
  }
  return context;
};
