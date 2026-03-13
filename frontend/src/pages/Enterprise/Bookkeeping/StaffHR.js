import React, { useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';

const StaffHR = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'people';
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    entity: 'all',
    country: 'all',
    department: 'all',
    status: 'all',
    contractType: 'all'
  });

  // Mock staff data
  const [staffMembers, setStaffMembers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      initials: 'SJ',
      role: 'Chief Financial Officer',
      department: 'Finance',
      entity: 'Atonix Capital LLC',
      country: 'United States',
      countryCode: 'US',
      status: 'active',
      contractType: 'full-time',
      email: 'sarah.j@atonix.com',
      phone: '+1 555-0101',
      startDate: '2022-01-15',
      salary: 185000,
      performance: 95,
      permissions: ['view', 'edit', 'approve', 'admin']
    },
    {
      id: 2,
      name: 'Michael Chen',
      initials: 'MC',
      role: 'Senior Tax Analyst',
      department: 'Tax & Compliance',
      entity: 'Atonix APAC Pte Ltd',
      country: 'Singapore',
      countryCode: 'SG',
      status: 'active',
      contractType: 'full-time',
      email: 'michael.c@atonix.com',
      phone: '+65 6234-5678',
      startDate: '2021-06-01',
      salary: 92000,
      performance: 88,
      permissions: ['view', 'edit']
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      initials: 'ER',
      role: 'Treasury Manager',
      department: 'Treasury',
      entity: 'Atonix Europe GmbH',
      country: 'Germany',
      countryCode: 'DE',
      status: 'active',
      contractType: 'full-time',
      email: 'emma.r@atonix.com',
      phone: '+49 30 1234-5678',
      startDate: '2023-03-20',
      salary: 78000,
      performance: 92,
      permissions: ['view', 'edit', 'approve']
    },
    {
      id: 4,
      name: 'James Wilson',
      initials: 'JW',
      role: 'Compliance Specialist',
      department: 'Compliance',
      entity: 'Atonix Capital LLC',
      country: 'United States',
      countryCode: 'US',
      status: 'contract-expiring',
      contractType: 'contract',
      email: 'james.w@atonix.com',
      phone: '+1 555-0202',
      startDate: '2024-01-10',
      contractEnd: '2025-03-31',
      salary: 65000,
      performance: 85,
      permissions: ['view']
    },
    {
      id: 5,
      name: 'Aisha Patel',
      initials: 'AP',
      role: 'Payroll Coordinator',
      department: 'HR & Payroll',
      entity: 'Atonix UK Ltd',
      country: 'United Kingdom',
      countryCode: 'GB',
      status: 'onboarding',
      contractType: 'full-time',
      email: 'aisha.p@atonix.com',
      phone: '+44 20 7123-4567',
      startDate: '2025-02-01',
      salary: 55000,
      performance: null,
      permissions: ['view']
    }
  ]);

  // Mock roles data
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access and control',
      riskLevel: 'high',
      assignedCount: 2,
      permissions: {
        people: ['view', 'edit', 'approve', 'admin'],
        finance: ['view', 'edit', 'approve', 'admin'],
        tax: ['view', 'edit', 'approve', 'admin'],
        treasury: ['view', 'edit', 'approve', 'admin'],
        reports: ['view', 'edit', 'approve', 'admin']
      }
    },
    {
      id: 2,
      name: 'Finance Manager',
      description: 'Manage financial operations and approvals',
      riskLevel: 'medium',
      assignedCount: 5,
      permissions: {
        people: ['view'],
        finance: ['view', 'edit', 'approve'],
        tax: ['view', 'edit'],
        treasury: ['view', 'edit', 'approve'],
        reports: ['view', 'edit']
      }
    },
    {
      id: 3,
      name: 'Analyst',
      description: 'View and analyze data, limited editing',
      riskLevel: 'low',
      assignedCount: 12,
      permissions: {
        people: ['view'],
        finance: ['view', 'edit'],
        tax: ['view', 'edit'],
        treasury: ['view'],
        reports: ['view', 'edit']
      }
    },
    {
      id: 4,
      name: 'Viewer',
      description: 'Read-only access to assigned modules',
      riskLevel: 'low',
      assignedCount: 8,
      permissions: {
        people: ['view'],
        finance: ['view'],
        tax: ['view'],
        treasury: ['view'],
        reports: ['view']
      }
    }
  ]);

  // Departments (derived initial list)
  const [departments, setDepartments] = useState([
    'Finance',
    'Tax & Compliance',
    'Treasury',
    'HR & Payroll'
  ]);

  // Modals / UI state
  const [showAddRole, setShowAddRole] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);

  const computeInitials = (name) => {
    if (!name) return 'U';
    return name.split('').map(n => n[0]).slice(0,2).join('').toUpperCase();
  };

  const addRole = (role) => {
    setRoles(prev => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map(r => r.id)) + 1 : 1,
        name: role.name,
        description: role.description,
        riskLevel: role.riskLevel || 'low',
        assignedCount: 0,
        permissions: role.permissions || {}
      }
    ]);
    setShowAddRole(false);
  };

  const addDepartment = (name) => {
    if (!name) return;
    setDepartments(prev => prev.includes(name) ? prev : [...prev, name]);
    setShowAddDepartment(false);
  };

  const addStaff = (staff) => {
    const newStaff = {
      id: Date.now(),
      name: staff.name,
      initials: computeInitials(staff.name),
      role: staff.role,
      department: staff.department,
      entity: staff.entity || 'Atonix Capital LLC',
      country: staff.country || 'United States',
      countryCode: staff.countryCode || 'US',
      status: staff.status || 'active',
      contractType: staff.contractType || 'full-time',
      email: staff.email || '',
      phone: staff.phone || '',
      startDate: staff.startDate || new Date().toISOString().split('T')[0],
      salary: staff.salary || 0,
      performance: staff.performance || null,
      permissions: staff.permissions || ['view']
    };

    setStaffMembers(prev => [newStaff, ...prev]);
    setShowAddStaff(false);
  };

  // Render People Directory
  const renderPeople = () => (
    <div className="hr-people-section">
      {/* Search and Filters */}
      <div className="people-controls">
        <div className="search-bar">

          <input
            type="text"
            placeholder="Search staff by name, role, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="onboarding">Onboarding</option>
            <option value="contract-expiring">Contract Expiring</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
          >
            <option value="all">All Departments</option>
            <option value="Finance">Finance</option>
            <option value="Tax & Compliance">Tax & Compliance</option>
            <option value="Treasury">Treasury</option>
            <option value="HR & Payroll">HR & Payroll</option>
          </select>

          <select
            value={filters.country}
            onChange={(e) => setFilters({...filters, country: e.target.value})}
          >
            <option value="all">All Countries</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="DE">Germany</option>
            <option value="SG">Singapore</option>
          </select>

          <button className="btn-primary" onClick={() => setShowAddStaff(true)}>
            Add Staff
          </button>
        </div>
      </div>

      {/* Staff Stats */}
      <div className="people-stats">
        <div className="stat-card">

          <div className="stat-content">
            <h3>{staffMembers.length}</h3>
            <p>Total Staff</p>
          </div>
        </div>
        <div className="stat-card active">

          <div className="stat-content">
            <h3>{staffMembers.filter(s => s.status === 'active').length}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card warning">

          <div className="stat-content">
            <h3>{staffMembers.filter(s => s.status === 'contract-expiring').length}</h3>
            <p>Expiring Soon</p>
          </div>
        </div>
        <div className="stat-card info">

          <div className="stat-content">
            <h3>{staffMembers.filter(s => s.status === 'onboarding').length}</h3>
            <p>Onboarding</p>
          </div>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="staff-grid">
        {staffMembers.map(staff => (
          <div key={staff.id} className={`staff-card ${staff.status}`}>
            <div className="staff-header">
              <div className="staff-avatar">{staff.initials}</div>
              <div className="staff-info">
                <h3>{staff.name}</h3>
                <p className="staff-role">{staff.role}</p>
                <p className="staff-department">{staff.department}</p>
              </div>
              <span className={`status-badge ${staff.status}`}>
                {staff.status === 'active' && 'Active'}
                {staff.status === 'onboarding' && 'Onboarding'}
                {staff.status === 'contract-expiring' && 'Expiring'}
                {staff.status === 'inactive' && 'Inactive'}
              </span>
            </div>

            <div className="staff-details">
              <div className="detail-row">
                 <span>{staff.entity}</span>
              </div>
              <div className="detail-row">
                 <span>{staff.country}</span>
              </div>
              <div className="detail-row">
                 <span>Since {new Date(staff.startDate).toLocaleDateString()}</span>
              </div>
              {staff.performance && (
                <div className="detail-row">
                   <span>Performance: {staff.performance}%</span>
                </div>
              )}
            </div>

            <div className="staff-actions">
              <button className="action-btn view">
                View
              </button>
              <button className="action-btn edit">
                Edit
              </button>
              <button className="action-btn permissions">
                Permissions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Roles & Permissions
  const renderRoles = () => (
    <div className="hr-roles-section">
      <div className="roles-header">
        <h2>Roles & Permissions</h2>
        <div style={{display:'flex', gap:8}}>
          <button className="btn-secondary" onClick={() => setShowAddDepartment(true)}>
            + Dept
          </button>
          <button className="btn-primary" onClick={() => setShowAddRole(true)}>
            Create Role
          </button>
        </div>
      </div>

      {/* Role Cards */}
      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.id} className={`role-card risk-${role.riskLevel}`}>
            <div className="role-header">
              <h3>{role.name}</h3>
              <span className={`risk-badge ${role.riskLevel}`}>
                {role.riskLevel} risk
              </span>
            </div>
            <p className="role-description">{role.description}</p>
            <div className="role-stats">
              <div className="stat">

                <span>{role.assignedCount} staff</span>
              </div>
            </div>
            <button className="btn-secondary">
              Manage Permissions
            </button>
          </div>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div className="permissions-matrix">
        <h3>Permission Matrix</h3>
        <div className="matrix-table">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>People</th>
                <th>Finance</th>
                <th>Tax</th>
                <th>Treasury</th>
                <th>Reports</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role.id}>
                  <td className="role-name">{role.name}</td>
                  {Object.keys(role.permissions).map(module => (
                    <td key={module}>
                      <div className="permission-badges">
                        {role.permissions[module].map(perm => (
                          <span key={perm} className={`perm-badge ${perm}`}>
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Contracts & Compliance
  const renderContracts = () => (
    <div className="hr-contracts-section">
      <div className="contracts-header">
        <h2>Contracts & Compliance</h2>
        <button className="btn-primary">
          New Contract
        </button>
      </div>

      {/* Contract Timeline */}
      <div className="contract-timeline">
        <h3>Contract Timeline</h3>
        <div className="timeline">
          {staffMembers.filter(s => s.status !== 'inactive').map(staff => (
            <div key={staff.id} className="timeline-item">
              <div className="timeline-marker">
                <div className={`marker-dot ${staff.status}`}></div>
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4>{staff.name}</h4>
                  <span className="timeline-date">
                    {new Date(staff.startDate).toLocaleDateString()}
                  </span>
                </div>
                <p>{staff.role} • {staff.country}</p>
                {staff.contractEnd && (
                  <div className="expiry-warning">

                    <span>Expires: {new Date(staff.contractEnd).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="timeline-actions">
                  <button className="btn-link">View Contract</button>
                  <button className="btn-link">Compliance Check</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Dashboard */}
      <div className="compliance-dashboard">
        <h3>Compliance Status</h3>
        <div className="compliance-grid">
          <div className="compliance-card complete">

            <h4>Work Permits</h4>
            <p>4/5 complete</p>
          </div>
          <div className="compliance-card warning">

            <h4>Background Checks</h4>
            <p>1 pending</p>
          </div>
          <div className="compliance-card complete">

            <h4>Tax Forms</h4>
            <p>All submitted</p>
          </div>
          <div className="compliance-card complete">

            <h4>Data Protection</h4>
            <p>Fully compliant</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Performance & Payroll
  const renderPerformance = () => (
    <div className="hr-performance-section">
      <div className="performance-header">
        <h2>Performance & Payroll Intelligence</h2>
        <button className="btn-primary">
          Export Report
        </button>
      </div>

      {/* Performance Dashboard */}
      <div className="performance-dashboard">
        <h3>Performance Overview</h3>
        <div className="performance-grid">
          {staffMembers.filter(s => s.performance).map(staff => (
            <div key={staff.id} className="performance-card">
              <div className="perf-header">
                <div className="perf-avatar">{staff.initials}</div>
                <div className="perf-info">
                  <h4>{staff.name}</h4>
                  <p>{staff.role}</p>
                </div>
              </div>

              <div className="perf-score">
                <div className="score-circle">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path
                      className="circle-bg"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="circle"
                      strokeDasharray={`${staff.performance}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" className="percentage">{staff.performance}%</text>
                  </svg>
                </div>
              </div>

              <div className="perf-insights">
                <div className="insight-item">
                   <span>Top Performer</span>
                </div>
                <div className="insight-item">
                   <span>Goals: 12/15</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payroll Intelligence */}
      <div className="payroll-intelligence">
        <h3>Payroll Intelligence</h3>
        <div className="payroll-table">
          <table>
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Country</th>
                <th>Base Salary</th>
                <th>Bonuses</th>
                <th>Deductions</th>
                <th>Tax</th>
                <th>Net Pay</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.filter(s => s.salary).map(staff => {
                const bonus = staff.performance > 90 ? staff.salary * 0.1 : 0;
                const deductions = staff.salary * 0.07;
                const tax = (staff.salary + bonus - deductions) * 0.25;
                const netPay = staff.salary + bonus - deductions - tax;

                return (
                  <tr key={staff.id}>
                    <td>
                      <div className="staff-cell">
                        <div className="staff-mini-avatar">{staff.initials}</div>
                        <span>{staff.name}</span>
                      </div>
                    </td>
                    <td>{staff.country}</td>
                    <td>${staff.salary.toLocaleString()}</td>
                    <td className="positive">${bonus.toLocaleString()}</td>
                    <td className="negative">-${deductions.toLocaleString()}</td>
                    <td className="negative">-${tax.toLocaleString()}</td>
                    <td className="net-pay">${netPay.toLocaleString()}</td>
                    <td>
                      <button className="btn-link">
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className="ai-insights">
        <div className="insight-card">

          <h4>AI Payroll Validator</h4>
          <p>All calculations verified against country-specific tax rules</p>
          <span className="insight-status success">Validated</span>
        </div>
        <div className="insight-card">

          <h4>Performance Alert</h4>
          <p>2 staff members showing signs of burnout risk</p>
          <button className="btn-link">Review</button>
        </div>
        <div className="insight-card">

          <h4>Top Performers</h4>
          <p>3 staff members exceeding all KPIs this quarter</p>
          <button className="btn-link">Recognition Program</button>
        </div>
      </div>
    </div>
  );

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'people': return renderPeople();
      case 'roles': return renderRoles();
      case 'contracts': return renderContracts();
      case 'performance': return renderPerformance();
      default: return renderPeople();
    }
  };

  /* Modals: Add Role / Department / Staff */
  const RoleModal = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [riskLevel, setRiskLevel] = useState('low');

    const handleSubmit = () => {
      onSubmit({ name, description, riskLevel, permissions: {} });
    };

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>Create Role</h3>
            <button className="btn-link" onClick={onClose}>Close</button>
          </div>
          <div className="modal-body">
            <div className="form-row">
              <label>Role Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Risk Level</label>
              <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-primary" onClick={handleSubmit}>Create Role</button>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  const DepartmentModal = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>Add Department</h3>
            <button className="btn-link" onClick={onClose}>Close</button>
          </div>
          <div className="modal-body">
            <div className="form-row">
              <label>Department Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-primary" onClick={() => onSubmit(name)}>Add</button>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  const StaffModal = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [roleVal, setRoleVal] = useState(roles[0]?.name || '');
    const [departmentVal, setDepartmentVal] = useState(departments[0] || '');
    const [salary, setSalary] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = () => {
      onSubmit({ name, email, role: roleVal, department: departmentVal, salary: Number(salary), startDate });
    };

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>Add Staff Member</h3>
            <button className="btn-link" onClick={onClose}>Close</button>
          </div>
          <div className="modal-body">
            <div className="form-row">
              <label>Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Role</label>
              <select value={roleVal} onChange={(e) => setRoleVal(e.target.value)}>
                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Department</label>
              <select value={departmentVal} onChange={(e) => setDepartmentVal(e.target.value)}>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Salary</label>
              <input value={salary} onChange={(e) => setSalary(e.target.value)} type="number" />
            </div>
            <div className="form-row">
              <label>Start Date</label>
              <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" />
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-primary" onClick={handleSubmit}>Add Staff</button>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="staff-hr-module">
      {/* Page Header */}
      <div className="page-header-hr">
        <div className="header-content-hr">
          <h1>Staff & HR Management</h1>
          <p>Comprehensive people, contracts, and performance management</p>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="section-navigation-hr">
        <button
          className={`nav-btn ${activeSection === 'people' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'people' })}
        >
          People Directory
        </button>
        <button
          className={`nav-btn ${activeSection === 'roles' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'roles' })}
        >
          Roles & Permissions
        </button>
        <button
          className={`nav-btn ${activeSection === 'contracts' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'contracts' })}
        >
          Contracts & Compliance
        </button>
        <button
          className={`nav-btn ${activeSection === 'performance' ? 'active' : ''}`}
          onClick={() => setSearchParams({ section: 'performance' })}
        >
          Performance & Payroll
        </button>
      </div>

      {/* Main Content */}
      <div className="hr-content">
        {renderContent()}
        {showAddRole && (
          <RoleModal onClose={() => setShowAddRole(false)} onSubmit={addRole} />
        )}
        {showAddDepartment && (
          <DepartmentModal onClose={() => setShowAddDepartment(false)} onSubmit={addDepartment} />
        )}
        {showAddStaff && (
          <StaffModal onClose={() => setShowAddStaff(false)} onSubmit={addStaff} />
        )}
      </div>
    </div>
  );
};

export default StaffHR;
