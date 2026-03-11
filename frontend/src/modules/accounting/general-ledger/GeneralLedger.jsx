import React from 'react';
import { Button, Card, PageHeader, Table, Input } from '../../../components/ui';

const GeneralLedger = () => {
  const columns = [
    { key: 'date', label: 'Date', width: '12%' },
    { key: 'account', label: 'Account', width: '20%' },
    { key: 'description', label: 'Description', width: '30%' },
    { key: 'debit', label: 'Debit', width: '12%' },
    { key: 'credit', label: 'Credit', width: '12%' },
    { key: 'balance', label: 'Balance', width: '14%' },
  ];

  const data = [];

  return (
    <div className="gl-page">
      <PageHeader
        title="General Ledger"
        subtitle="View all posted transactions"
        actions={
          <>
            <Button variant="secondary">Filter</Button>
            <Button variant="secondary">Export</Button>
          </>
        }
      />

      <Card header="Ledger Filters">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Input placeholder="From Date" type="date" />
          <Input placeholder="To Date" type="date" />
          <Input placeholder="Account" />
        </div>
      </Card>

      <Card>
        {data.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7a8fa6', padding: '32px 0' }}>No transactions found
          </p>
        ) : (
          <Table columns={columns} data={data} />
        )}
      </Card>
    </div>
  );
};

export default GeneralLedger;
