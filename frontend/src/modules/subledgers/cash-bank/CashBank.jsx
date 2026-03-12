import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../../components/ui';

const mockAccounts = [
  { account: 'Operating - Chase 4521', type: 'Checking', balance: '$142,300.00', lastReconciled: '2025-01-31', transactions: 48, status: 'Reconciled' },
  { account: 'Payroll - Chase 7832', type: 'Checking', balance: '$38,500.00', lastReconciled: '2025-01-31', transactions: 12, status: 'Reconciled' },
  { account: 'Savings - BofA 9901', type: 'Savings', balance: '$500,000.00', lastReconciled: '2025-01-15', transactions: 4, status: 'Pending' },
  { account: 'Money Market - Fidelity', type: 'Investment', balance: '$1,200,000.00', lastReconciled: '2025-01-31', transactions: 2, status: 'Reconciled' },
];

const STATUS_COLORS = { Reconciled: 'var(--color-success)', Pending: 'var(--color-warning)', Unreconciled: 'var(--color-error)' };

const columns = [
  { key: 'account', header: 'Account' },
  { key: 'type', header: 'Type' },
  { key: 'balance', header: 'Balance' },
  { key: 'lastReconciled', header: 'Last Reconciled' },
  { key: 'transactions', header: 'Transactions' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

export default function CashBank() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Cash & Bank"
        subtitle="Monitor bank accounts, cash positions, and reconciliation status"
        actions={
          <>
            <Button variant="secondary" size="small">Sync Transactions</Button>
            <Button variant="primary" size="small" onClick={() => setShowModal(true)}>Add Account
            </Button>
          </>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Cash Position</div>
          <div className="stat-value">$1,880,800.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Accounts Reconciled</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>3 / 4</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Unreconciled Txns</div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>4</div>
        </Card>
      </div>

      <Card title="Bank Accounts">
        <Table columns={columns} data={mockAccounts} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Bank Account" size="medium">
        <div className="form-grid">
          <Input label="Account Name" required />
          <Input label="Bank Name" required />
          <Input label="Account Number (last 4)" required />
          <Input label="Account Type" placeholder="Checking / Savings / Investment" />
          <Input label="Currency" placeholder="USD" />
          <Input label="GL Account Code" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Add Account</Button>
        </div>
      </Modal>
    </div>
  );
}
