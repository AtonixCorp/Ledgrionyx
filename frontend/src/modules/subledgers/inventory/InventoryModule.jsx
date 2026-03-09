import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../../components/ui';
import { FaBoxes, FaPlus, FaDownload } from 'react-icons/fa';

const mockInventory = [
  { sku: 'SKU-001', name: 'Enterprise License - Annual', category: 'Software', qty: 142, unitCost: '$4,800.00', totalValue: '$681,600.00', reorderLevel: 10, status: 'In Stock' },
  { sku: 'SKU-002', name: 'Hardware Module A', category: 'Hardware', qty: 8, unitCost: '$1,250.00', totalValue: '$10,000.00', reorderLevel: 15, status: 'Low Stock' },
  { sku: 'SKU-003', name: 'Consulting Hours Bundle', category: 'Services', qty: 0, unitCost: '$200.00', totalValue: '$0.00', reorderLevel: 5, status: 'Out of Stock' },
];

const STATUS_COLORS = { 'In Stock': '#27ae60', 'Low Stock': '#f39c12', 'Out of Stock': '#e74c3c' };

const columns = [
  { key: 'sku', header: 'SKU' },
  { key: 'name', header: 'Item Name' },
  { key: 'category', header: 'Category' },
  { key: 'qty', header: 'Quantity' },
  { key: 'unitCost', header: 'Unit Cost' },
  { key: 'totalValue', header: 'Total Value' },
  { key: 'reorderLevel', header: 'Reorder Level' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

export default function InventoryModule() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Inventory"
        subtitle="Track inventory levels, valuations, and reorder points"
        icon={<FaBoxes />}
        actions={
          <>
            <Button variant="secondary" size="small" icon={<FaDownload />}>Valuation Report</Button>
            <Button variant="primary" size="small" icon={<FaPlus />} onClick={() => setShowModal(true)}>
              Add Item
            </Button>
          </>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Inventory Value</div>
          <div className="stat-value">$691,600.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">SKUs Tracked</div>
          <div className="stat-value">3</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Low / Out of Stock</div>
          <div className="stat-value" style={{ color: '#e74c3c' }}>2</div>
        </Card>
      </div>

      <Card title="Inventory Register">
        <Table columns={columns} data={mockInventory} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Inventory Item" size="medium">
        <div className="form-grid">
          <Input label="Item Name" required />
          <Input label="SKU / Code" required />
          <Input label="Category" />
          <Input label="Unit Cost" type="number" required />
          <Input label="Opening Quantity" type="number" />
          <Input label="Reorder Level" type="number" />
          <Input label="Valuation Method" placeholder="FIFO / LIFO / Average Cost" />
          <Input label="GL Account" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Add Item</Button>
        </div>
      </Modal>
    </div>
  );
}
