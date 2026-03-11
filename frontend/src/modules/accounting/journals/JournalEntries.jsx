import React from 'react';
import { Button, Card, PageHeader, Input, Modal, Table } from '../../../components/ui';

const JournalEntries = () => {
  const [showModal, setShowModal] = React.useState(false);

  const columns = [
    { key: 'date', label: 'Date', width: '15%' },
    { key: 'reference', label: 'Reference', width: '15%' },
    { key: 'description', label: 'Description', width: '35%' },
    { key: 'amount', label: 'Amount', width: '15%' },
    { key: 'status', label: 'Status', width: '15%' },
    { key: 'posted', label: 'Posted', width: '10%' },
  ];

  const data = [];

  return (
    <div className="journals-page">
      <PageHeader
        title="Journal Entries"
        subtitle="Record and manage transactions"
        actions={
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
          >New Journal Entry
          </Button>
        }
      />

      <Card>
        {data.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7a8fa6', padding: '32px 0' }}>No journal entries yet
          </p>
        ) : (
          <Table columns={columns} data={data} />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Journal Entry"
        size="large"
      >
        <Input label="Date" type="date" required />
        <Input label="Reference" required />
        <Input label="Description" required />

        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
          <h3>Line Items</h3>
          <Card>
            <p style={{ color: '#7a8fa6' }}>Add accounts and amounts below</p>
          </Card>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Create Entry</Button>
        </div>
      </Modal>
    </div>
  );
};

export default JournalEntries;
