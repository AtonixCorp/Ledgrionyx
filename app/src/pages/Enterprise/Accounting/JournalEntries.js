import React from 'react';
import { useParams } from 'react-router-dom';
import JournalEntriesModule from '../../../modules/accounting/journals/JournalEntries';

export default function JournalEntries() {
  const { entityId } = useParams();

  return (
    <JournalEntriesModule
      entityIdOverride={entityId}
      basePathOverride={`/enterprise/entity/${entityId}/journal-entries`}
      showEntitySelector={false}
    />
  );
}