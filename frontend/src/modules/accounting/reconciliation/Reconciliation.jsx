import React from 'react';
import { Button, Card, PageHeader, Table } from '../../../components/ui';

const Reconciliation = () => {
  const columns = [
    { key: 'account', label: 'Account', width: '25%' },
    { key: 'balance', label: 'Balance', width: '20%' },
    { key: 'reconciled', label: 'Reconciled', width: '15%' },
    { key: 'variance', label: 'Variance', width: '15%' },
    { key: 'status', label: 'Status', width: '15%' },
    { key: 'last_update', label: 'Last Update', width: '10%' },
  ];

  const data = [];

  return (
    <div className="reconciliation-page">
      <PageHeader
        title="Reconciliation"
        subtitle="Bank and account matching"
        actions={
          <>
            <Button variant="secondary">Sync Banks</Button>
            <Button variant="primary">Start Reconciliation</Button>
          </>
        }
      />

      <Card header="Account Status">
        {data.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7a8fa6', padding: '32px 0' }}>No accounts to reconcile yet
          </p>
        ) : (
          <Table columns={columns} data={data} />
        )}
      </Card>
    </div>
  );
};

export default Reconciliation;
