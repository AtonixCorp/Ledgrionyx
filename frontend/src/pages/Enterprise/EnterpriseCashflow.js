import React from 'react';
import CashflowTreasuryDashboard from './CashflowTreasuryDashboard';

const EnterpriseCashflow = () => {
  // This route used to show hardcoded demo data. We delegate to the
  // entity-scoped Cashflow & Treasury dashboard which reads from the backend.
  return <CashflowTreasuryDashboard />;
};

export default EnterpriseCashflow;
