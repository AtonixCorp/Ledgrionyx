import React from 'react';
import { Button, Card, PageHeader, Table } from '../../components/ui';

const Tasks = () => {
  const columns = [
    { key: 'title', label: 'Task', width: '40%' },
    { key: 'status', label: 'Status', width: '20%' },
    { key: 'due_date', label: 'Due Date', width: '20%' },
    { key: 'priority', label: 'Priority', width: '20%' },
  ];

  const data = [];

  return (
    <div className="tasks-page">
      <PageHeader
        title="Tasks"
        subtitle="Manage your accounting tasks"
        actions={<Button variant="primary">Add Task</Button>}
      />

      <Card>
        {data.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7a8fa6', padding: '32px 0' }}>No tasks yet
          </p>
        ) : (
          <Table columns={columns} data={data} />
        )}
      </Card>
    </div>
  );
};

export default Tasks;
