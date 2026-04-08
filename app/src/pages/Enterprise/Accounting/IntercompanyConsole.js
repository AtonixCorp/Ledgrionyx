import React from 'react';
import { useParams } from 'react-router-dom';
import IntercompanyConsoleModule from '../../../modules/accounting/IntercompanyConsole';

export default function IntercompanyConsole() {
  const { entityId } = useParams();

  return (
    <IntercompanyConsoleModule
      entityIdOverride={entityId}
      showEntitySelector={false}
    />
  );
}
