import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEnterprise } from '../../../context/EnterpriseContext';
import './WorkspaceModules.css';

const Tick = () => <span className="wsm-perm-check">+</span>;
const Cross = () => <span className="wsm-perm-cross">-</span>;

const WorkspacePermissions = () => {
  const { workspaceId } = useParams();
  const { fetchWorkspacePermissionSummary, getWorkspacePermissionSummary } = useEnterprise();

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspacePermissionSummary(workspaceId).catch(() => null);
    }
  }, [fetchWorkspacePermissionSummary, workspaceId]);

  const summary = getWorkspacePermissionSummary(workspaceId);

  if (!summary) {
    return (
      <div className="wsm-page">
        <div className="wsm-page-header">
          <div>
            <h1 className="wsm-page-title">Permissions</h1>
            <p className="wsm-page-sub">Loading accounting permission profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wsm-page">
      <div className="wsm-page-header">
      <div>
        <h1 className="wsm-page-title">Permissions</h1>
        <p className="wsm-page-sub">Accounting-driven access derived from organization role, entity role, workspace membership, and department inheritance.</p>
      </div>
      </div>

      <div className="wsm-perm-matrix">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Read</th>
              <th>Write</th>
              <th>Manage</th>
              <th>Decide</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary.categories || {}).map(([key, value]) => (
              <tr key={key}>
                <td>{key.replaceAll('_', ' ')}</td>
                <td>{value.read ? <Tick /> : <Cross />}</td>
                <td>{value.write ? <Tick /> : <Cross />}</td>
                <td>{value.manage ? <Tick /> : <Cross />}</td>
                <td>{value.decide ? <Tick /> : <Cross />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="wsm-perm-grid">
        <section className="wsm-perm-card">
          <h3>Workspace Sections</h3>
          <div className="wsm-perm-list">
            {Object.entries(summary.workspace_sections || {}).map(([key, allowed]) => (
              <div key={key} className="wsm-perm-list-row">
                <span>{key.replaceAll('_', ' ')}</span>
                <span>{allowed ? <Tick /> : <Cross />}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="wsm-perm-card">
          <h3>Equity Sections</h3>
          <div className="wsm-perm-list">
            {Object.entries(summary.equity_sections || {}).map(([key, allowed]) => (
              <div key={key} className="wsm-perm-list-row">
                <span>{key.replaceAll('-', ' ')}</span>
                <span>{allowed ? <Tick /> : <Cross />}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="wsm-perm-card">
          <h3>Dashboards</h3>
          <div className="wsm-perm-list">
            {Object.entries(summary.dashboards || {}).map(([key, allowed]) => (
              <div key={key} className="wsm-perm-list-row">
                <span>{key.replaceAll('_', ' ')}</span>
                <span>{allowed ? <Tick /> : <Cross />}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="wsm-perm-card">
          <h3>Visible Departments</h3>
          <div className="wsm-perm-list">
            {(summary.visible_departments || []).length > 0 ? (
              (summary.visible_departments || []).map((department) => (
                <div key={department.id} className="wsm-perm-department-row">
                  <strong>{department.name}</strong>
                  <span>{department.cost_center || 'Scoped access'}</span>
                </div>
              ))
            ) : (
              <div className="wsm-perm-list-row">
                <span>No department scope assigned</span>
                <span><Cross /></span>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="wsm-permission-note" style={{ marginTop: 20 }}>
        <strong>Context:</strong> Organization role: {summary.context?.organization_role_name || 'None'} | Entity role: {summary.context?.entity_role_name || 'None'} | Workspace role: {summary.workspace_role}
      </div>
    </div>
  );
};

export default WorkspacePermissions;
