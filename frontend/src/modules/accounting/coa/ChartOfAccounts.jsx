import React from 'react';
import { Button, Card, PageHeader, Input, Modal, Table } from '../../../components/ui';

const ChartOfAccounts = () => {
  const [showModal, setShowModal] = React.useState(false);

  const columns = [
    { key: 'code', label: 'Account Code', width: '20%' },
    { key: 'name', label: 'Account Name', width: '35%' },
    { key: 'type', label: 'Type', width: '15%' },
    { key: 'balance', label: 'Balance', width: '15%' },
    { key: 'status', label: 'Status', width: '15%' },
  ];

  const data = [];

  return (
    <div className="coa-page">
      <PageHeader
        title="Chart of Accounts"
        subtitle="Manage your account structure"
        actions={
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
          >New Account
          </Button>
        }
      />

      <Card>
        {data.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-silver-dark)', padding: '32px 0' }}>No accounts yet. Create your first account to get started.
          </p>
        ) : (
          <Table columns={columns} data={data} />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Account"
        size="large"
      >
        <Input label="Account Code" required />
        <Input label="Account Name" required />
        <Input label="Account Type" required />

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Create Account</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ChartOfAccounts;
