import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../../components/ui';
import { FaUsersCog, FaPlus, FaDownload } from 'react-icons/fa';

const mockPayroll = [
  { id: 'EMP-001', name: 'Sarah Johnson', role: 'CFO', department: 'Finance', gross: '$18,333.33', deductions: '$4,200.00', net: '$14,133.33', period: 'Jan 2025', status: 'Processed' },
  { id: 'EMP-002', name: 'Michael Chen', role: 'Senior Accountant', department: 'Finance', gross: '$9,166.67', deductions: '$2,100.00', net: '$7,066.67', period: 'Jan 2025', status: 'Processed' },
  { id: 'EMP-003', name: 'Lisa Rodriguez', role: 'Operations Manager', department: 'Operations', gross: '$10,833.33', deductions: '$2,500.00', net: '$8,333.33', period: 'Jan 2025', status: 'Pending' },
];

const STATUS_COLORS = { Processed: '#27ae60', Pending: '#f39c12', Rejected: '#e74c3c' };

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Employee' },
  { key: 'role', header: 'Role' },
  { key: 'department', header: 'Department' },
  { key: 'period', header: 'Period' },
  { key: 'gross', header: 'Gross Pay' },
  { key: 'deductions', header: 'Deductions' },
  { key: 'net', header: 'Net Pay' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

export default function Payroll() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Payroll Subledger"
        subtitle="Track payroll expenses, deductions, and employee compensation records"
        icon={<FaUsersCog />}
        actions={
          <>
            <Button variant="secondary" size="small" icon={<FaDownload />}>Export Payroll</Button>
            <Button variant="primary" size="small" icon={<FaPlus />} onClick={() => setShowModal(true)}>
              Add Employee
            </Button>
          </>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Gross (MTD)</div>
          <div className="stat-value">$38,333.33</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Total Deductions</div>
          <div className="stat-value" style={{ color: '#e74c3c' }}>$8,800.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Total Net Pay</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>$29,533.33</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Employees</div>
          <div className="stat-value">3</div>
        </Card>
      </div>

      <Card title="Payroll Records — January 2025">
        <Table columns={columns} data={mockPayroll} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Employee" size="medium">
        <div className="form-grid">
          <Input label="Full Name" required />
          <Input label="Employee ID" required />
          <Input label="Role / Title" required />
          <Input label="Department" />
          <Input label="Annual Salary" type="number" required />
          <Input label="Pay Frequency" placeholder="Monthly / Bi-weekly / Weekly" />
          <Input label="Tax Withholding %" type="number" />
          <Input label="Start Date" type="date" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Add Employee</Button>
        </div>
      </Modal>
    </div>
  );
}
