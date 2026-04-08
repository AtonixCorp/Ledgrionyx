import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useEnterprise } from './EnterpriseContext';
import { equityAPI } from '../services/api';
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

export const EquityProvider = ({ children }) => {
  const { activeWorkspace } = useEnterprise();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [shareholders, setShareholders] = useState([]);
  const [shareClasses, setShareClasses] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [fundingRounds, setFundingRounds] = useState([]);
  const [valuations, setValuations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reports, setReports] = useState([]);
  const [grants, setGrants] = useState([]);
  const [vestingEvents, setVestingEvents] = useState([]);
  const [exerciseRequests, setExerciseRequests] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [payrollTaxEvents, setPayrollTaxEvents] = useState([]);
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
        shareholdersRes,
        shareClassesRes,
        holdingsRes,
        roundsRes,
        valuationsRes,
        transactionsRes,
        reportsRes,
        grantsRes,
        vestingEventsRes,
        exerciseRequestsRes,
        certificatesRes,
        payrollTaxEventsRes,
      ] = await Promise.all([
        equityAPI.profile.list(entityId),
        equityAPI.shareholders.list(entityId),
        equityAPI.shareClasses.list(entityId),
        equityAPI.holdings.list(entityId),
        equityAPI.fundingRounds.list(entityId),
        equityAPI.valuations.list(entityId),
        equityAPI.transactions.list(entityId),
        equityAPI.reports.list(entityId),
        equityAPI.grants.list(entityId),
        equityAPI.vestingEvents.list(entityId),
        equityAPI.exerciseRequests.list(entityId),
        equityAPI.certificates.list(entityId),
        equityAPI.payrollTaxEvents.list(entityId),
      ]);

      setProfile(asList(profileRes.data)[0] || null);
      setShareholders(asList(shareholdersRes.data));
      setShareClasses(asList(shareClassesRes.data));
      setHoldings(asList(holdingsRes.data));
      setFundingRounds(asList(roundsRes.data));
      setValuations(asList(valuationsRes.data));
      setTransactions(asList(transactionsRes.data));
      setReports(asList(reportsRes.data));
      setGrants(asList(grantsRes.data));
      setVestingEvents(asList(vestingEventsRes.data));
      setExerciseRequests(asList(exerciseRequestsRes.data));
      setCertificates(asList(certificatesRes.data));
      setPayrollTaxEvents(asList(payrollTaxEventsRes.data));
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
    shareholders,
    shareClasses,
    holdings,
    fundingRounds,
    valuations,
    transactions,
    reports,
    grants,
    vestingEvents,
    exerciseRequests,
    certificates,
    payrollTaxEvents,
    summary,
    saving,
    refreshEquity,
    createShareholder: (payload) => mutateResource('shareholders', 'create', payload),
    updateShareholder: (id, payload) => mutateResource('shareholders', 'update', payload, id),
    deleteShareholder: (id) => mutateResource('shareholders', 'delete', null, id),
    createShareClass: (payload) => mutateResource('shareClasses', 'create', payload),
    updateShareClass: (id, payload) => mutateResource('shareClasses', 'update', payload, id),
    deleteShareClass: (id) => mutateResource('shareClasses', 'delete', null, id),
    createValuation: (payload) => mutateResource('valuations', 'create', payload),
    updateValuation: (id, payload) => mutateResource('valuations', 'update', payload, id),
    deleteValuation: (id) => mutateResource('valuations', 'delete', null, id),
    createTransaction: (payload) => mutateResource('transactions', 'create', payload),
    updateTransaction: (id, payload) => mutateResource('transactions', 'update', payload, id),
    deleteTransaction: (id) => mutateResource('transactions', 'delete', null, id),
    createReport: (payload) => mutateResource('reports', 'create', payload),
    updateReport: (id, payload) => mutateResource('reports', 'update', payload, id),
    deleteReport: (id) => mutateResource('reports', 'delete', null, id),
    createGrant: (payload) => mutateResource('grants', 'create', payload),
    updateGrant: (id, payload) => mutateResource('grants', 'update', payload, id),
    deleteGrant: (id) => mutateResource('grants', 'delete', null, id),
    rebuildGrantSchedule: (id) => runResourceAction('grants', 'rebuildSchedule', id),
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
