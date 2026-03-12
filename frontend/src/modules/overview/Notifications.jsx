import React from 'react';
import { Button, Card, PageHeader } from '../../components/ui';

const Notifications = () => {
  return (
    <div className="notifications-page">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with important events"
      />

      <Card>
        <p style={{ textAlign: 'center', color: 'var(--color-silver-dark)', padding: '32px 0' }}>No notifications at this time
        </p>
      </Card>
    </div>
  );
};

export default Notifications;
