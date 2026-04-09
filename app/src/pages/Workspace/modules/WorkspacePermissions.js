import React from 'react';
import './WorkspaceModules.css';

const ROLES = ['Owner', 'Admin', 'Member', 'Viewer'];

const PERMISSIONS = [
  { action: 'View workspace',          owner: true,  admin: true,  member: true,  viewer: true  },
  { action: 'Invite members',          owner: true,  admin: true,  member: false, viewer: false },
  { action: 'Remove members',          owner: true,  admin: true,  member: false, viewer: false },
  { action: 'Change member roles',     owner: true,  admin: false, member: false, viewer: false },
  { action: 'Create departments',      owner: true,  admin: true,  member: false, viewer: false },
  { action: 'Manage department membership', owner: true, admin: true, member: false, viewer: false },
  { action: 'Schedule meetings',       owner: true,  admin: true,  member: true,  viewer: false },
  { action: 'Create calendar events',  owner: true,  admin: true,  member: true,  viewer: false },
  { action: 'Upload files',            owner: true,  admin: true,  member: true,  viewer: false },
  { action: 'Delete files',            owner: true,  admin: true,  member: false, viewer: false },
  { action: 'Access Email module',     owner: true,  admin: true,  member: true,  viewer: false },
  { action: 'Access Marketing module', owner: true,  admin: true,  member: true,  viewer: false },
  { action: 'Edit workspace settings', owner: true,  admin: true,  member: false, viewer: false },
  { action: 'Archive workspace',       owner: true,  admin: false, member: false, viewer: false },
  { action: 'Delete workspace',        owner: true,  admin: false, member: false, viewer: false },
];

const Tick = () => <span className="wsm-perm-check">+</span>;
const Cross = () => <span className="wsm-perm-cross">—</span>;

const WorkspacePermissions = () => (
  <div className="wsm-page">
    <div className="wsm-page-header">
      <div>
        <h1 className="wsm-page-title">Permissions</h1>
        <p className="wsm-page-sub">Role-based access control matrix for this workspace.</p>
      </div>
    </div>

    <div className="wsm-perm-matrix">
      <table>
        <thead>
          <tr>
            <th>Permission</th>
            {ROLES.map(r => <th key={r}>{r}</th>)}
          </tr>
        </thead>
        <tbody>
          {PERMISSIONS.map(p => (
            <tr key={p.action}>
              <td>{p.action}</td>
              <td>{p.owner  ? <Tick /> : <Cross />}</td>
              <td>{p.admin  ? <Tick /> : <Cross />}</td>
              <td>{p.member ? <Tick /> : <Cross />}</td>
              <td>{p.viewer ? <Tick /> : <Cross />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="wsm-permission-note" style={{ marginTop: 20 }}>
      <strong>Note:</strong> Permissions are inherited; a higher role always has at least the permissions of lower roles. Owners cannot be removed by Admins.
    </div>
  </div>
);

export default WorkspacePermissions;
