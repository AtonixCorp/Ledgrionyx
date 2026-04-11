import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { workspacesAPI } from '../../services/api';
import './WorkspaceSelector.css';

const WorkspaceSelector = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userLabel = user?.name || user?.email || '';
  const workspaceCount = workspaces.length;
  const pendingAccessCount = workspaces.filter((workspace) => workspace?.status === 'pending' || workspace?.invite_status === 'pending').length;

  useEffect(() => {
    let active = true;

    const loadWorkspaces = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await workspacesAPI.getMine();
        if (!active) return;
        const items = Array.isArray(response.data) ? response.data : response.data?.results || [];
        setWorkspaces(items);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.detail || 'Failed to load your workspaces.');
        setWorkspaces([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadWorkspaces();

    return () => {
      active = false;
    };
  }, []);

  const handleOpenWorkspace = (workspaceId) => {
    navigate(`/app/workspace/${workspaceId}/overview`);
  };

  return (
    <div className="ws-selector-page">
      <main className="ws-selector-shell">
        <section className="ws-selector-hero">
          <div className="ws-selector-copy">
            <p className="ws-selector-kicker">Workspace Selector</p>
            <h1>Choose a workspace</h1>
            <p className="ws-selector-subtitle">{userLabel ? `${userLabel}, ` : ''}open the workspace you want to work in.</p>

            <div className="ws-selector-summary" aria-label="Workspace summary">
              <span>{workspaceCount} {workspaceCount === 1 ? 'workspace' : 'workspaces'} available</span>
              <strong>{pendingAccessCount} {pendingAccessCount === 1 ? 'pending access request' : 'pending access requests'}</strong>
            </div>
          </div>
        </section>

        <div className="ws-selector-actions ws-selector-actions--top">
          <button className="ws-selector-create" onClick={() => navigate('/app/workspaces/create')}>
            Create Workspace
          </button>
          <button className="ws-selector-secondary" onClick={() => navigate('/app/console')}>
            Back to Console
          </button>
        </div>

        {loading ? (
          <div className="ws-selector-state">Loading workspaces…</div>
        ) : error ? (
          <div className="ws-selector-state ws-selector-state-error">{error}</div>
        ) : (
          <>
            {workspaces.length === 0 ? (
              <section className="ws-selector-empty">
                <div className="ws-selector-empty-copy">
                  <p className="ws-selector-kicker">No workspaces yet</p>
                  <h2>Create the first workspace</h2>
                  <p>Once a workspace exists, it will appear here for direct opening.</p>
                </div>
                <div className="ws-selector-summary ws-selector-summary--light" aria-label="Workspace summary">
                  <span>{workspaceCount} available</span>
                  <strong>{pendingAccessCount} pending access</strong>
                </div>
                <div className="ws-selector-empty-actions">
                  <button className="ws-selector-create" onClick={() => navigate('/app/workspaces/create')}>
                    Create Workspace
                  </button>
                  <button className="ws-selector-secondary" onClick={() => navigate('/app/console')}>
                    Back to Console
                  </button>
                </div>
              </section>
            ) : (
              <section className="ws-selector-grid" aria-label="My workspaces">
                {workspaces.map((workspace) => {
                  const countryOfIncorporation = workspace.country_of_incorporation || 'Not Set';
                  const profileLabel = workspace.business_type || workspace.linked_entity_industry || 'Business profile unavailable';

                  return (
                    <article key={workspace.id} className="ws-selector-card">
                      <div className="ws-selector-card-top">
                        <div className="ws-selector-card-head">
                          <h2>{workspace.name}</h2>
                          <p>{profileLabel}</p>
                        </div>
                        <span className="ws-selector-card-badge">
                          {workspace.component_count ?? 0} components
                        </span>
                      </div>

                      <div className="ws-selector-card-fields">
                        <div className="ws-selector-card-field">
                          <span>Business Type / Industry</span>
                          <strong>{workspace.business_type || workspace.linked_entity_industry || 'Not Set'}</strong>
                        </div>
                        <div className="ws-selector-card-field">
                          <span>Country of Incorporation</span>
                          <strong>{countryOfIncorporation}</strong>
                        </div>
                        <div className="ws-selector-card-field">
                          <span>Currency</span>
                          <strong>{workspace.currency || 'USD'}</strong>
                        </div>
                        <div className="ws-selector-card-field">
                          <span>Fiscal Year</span>
                          <strong>{workspace.fiscal_year || 'Not Set'}</strong>
                        </div>
                        <div className="ws-selector-card-field">
                          <span>Tax Regime</span>
                          <strong>{workspace.tax_regime || 'Not Set'}</strong>
                        </div>
                        <div className="ws-selector-card-field ws-selector-card-field--compact">
                          <span>Components</span>
                          <strong>{workspace.component_count ?? 0}</strong>
                        </div>
                      </div>

                      <button className="ws-selector-open" onClick={() => handleOpenWorkspace(workspace.id)}>
                        Open Workspace
                      </button>
                    </article>
                  );
                })}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default WorkspaceSelector;