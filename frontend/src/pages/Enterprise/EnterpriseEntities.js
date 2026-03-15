import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnterprise } from '../../context/EnterpriseContext';
import { countries, getBanksByCountryCode } from '../../utils/countries';
import './EnterpriseActionPages.css';
import '../../styles/EntityPages.css';

const EnterpriseEntities = () => {
  const navigate = useNavigate();
  const {
    currentOrganization,
    entities,
    fetchEntities,
    createEntity,
    deleteEntity,
    hasPermission,
    PERMISSIONS,
    loading,
    error
  } = useEnterprise();

  const [showModal, setShowModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [deletingEntityId, setDeletingEntityId] = useState(null);
  const [availableBanks, setAvailableBanks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    entity_type: 'corporation',
    status: 'active',
    registration_number: '',
    local_currency: 'USD',
    main_bank: '',
    fiscal_year_end: '',
    next_filing_date: '',
  });

  useEffect(() => {
    if (currentOrganization) {
      fetchEntities(currentOrganization.id);
    }
  }, [currentOrganization, fetchEntities]);

  if (!hasPermission(PERMISSIONS.VIEW_ENTITIES)) {
    return <div className="permission-denied">You don't have permission to view entities.</div>;
  }

  const handleOpenModal = (entity = null) => {
    if (entity) {
      setFormData(entity);
      setEditingEntity(entity.id);
      // Set available banks for existing entity
      const banks = getBanksByCountryCode(entity.country);
      setAvailableBanks(banks);
    } else {
      setFormData({
        name: '',
        country: '',
        entity_type: 'corporation',
        status: 'active',
        registration_number: '',
        local_currency: 'USD',
        main_bank: '',
        fiscal_year_end: '',
        next_filing_date: '',
      });
      setEditingEntity(null);
      setAvailableBanks([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEntity(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Auto-populate currency and banks when country is selected
    if (name === 'country' && value) {
      const selectedCountry = countries.find(country => country.name === value);
      if (selectedCountry) {
        // Extract currency code from currency object
        const currencyCode = selectedCountry.currency?.code || selectedCountry.currency || 'USD';
        const banks = selectedCountry.banks || [];

        console.log('Selected country:', selectedCountry.name, 'Currency:', currencyCode);

        setFormData(prev => ({
          ...prev,
          [name]: value,
          local_currency: currencyCode,
          main_bank: '' // Reset bank selection
        }));
        setAvailableBanks(banks);
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentOrganization) {
      alert('No organization selected. Please ensure an organization is loaded.');
      console.error('currentOrganization is null/undefined:', currentOrganization);
      return;
    }

    if (!hasPermission(PERMISSIONS.CREATE_ENTITY)) {
      alert('You do not have permission to create entities');
      return;
    }

    try {
      // Map extended UI entity types to backend-supported choices
      const typeMapping = {
        public_company: 'corporation',
        public: 'corporation',
        holding_company: 'subsidiary',
        spv: 'other',
        trust: 'other',
        foundation: 'nonprofit',
        representative_office: 'branch',
        government_entity: 'other',
        joint_venture: 'partnership',
        sole_trader: 'sole_proprietor',
        llp: 'partnership',
      };

      const payload = {
        ...formData,
        entity_type: typeMapping[formData.entity_type] || formData.entity_type,
        organization_id: currentOrganization.id,
      };

      console.log('Creating entity with payload:', payload);
      await createEntity(payload);
      alert('Entity created successfully!');
      handleCloseModal();
      // Refresh entities list
      if (currentOrganization) {
        await fetchEntities(currentOrganization.id);
      }
    } catch (err) {
      console.error('Entity creation error:', err);
      alert('Failed to create entity: ' + err.message);
    }
  };

  const handleDeleteEntity = async (entity) => {
    if (!currentOrganization || !entity?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${entity.name}? This will permanently remove the entity and its related records.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingEntityId(entity.id);
      await deleteEntity(entity.id, currentOrganization.id);
    } catch (err) {
      alert(`Failed to delete entity: ${err.message}`);
    } finally {
      setDeletingEntityId(null);
    }
  };

  const statusColors = {
    active:    { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
    dormant:   { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    wind_down: { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  };

  const getStatusStyle = (status) => statusColors[status] || { bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' };

  const kpis = [
    { label: 'Total Entities', value: entities.length, accent: '#003B73' },
    { label: 'Active', value: entities.filter(e => e.status === 'active').length, accent: '#10B981' },
    { label: 'Countries', value: new Set(entities.map(e => e.country)).size, accent: '#6366F1' },
    { label: 'Currencies', value: new Set(entities.map(e => e.local_currency)).size, accent: '#F59E0B' },
  ];

  // shared input style — kept for legacy inline refs (replaced by CSS below)
  const inputStyle = undefined; // no longer used
  const labelStyle = undefined; // no longer used

  return (
    <div className="enterprise-action-page entities-page" style={{ maxWidth: 1300, margin: '0 auto' }}>

      <section className="action-page-hero">
        <div className="action-page-copy">
          <span className="action-page-kicker">Quick Action Destination</span>
          <h1 className="action-page-title">Entities</h1>
          <p className="action-page-subtitle">Create, monitor, and drill into the legal entities that power your consolidated overview.</p>
          {hasPermission(PERMISSIONS.CREATE_ENTITY) && (
            <div className="action-page-actions">
              <button
                onClick={() => handleOpenModal()}
                style={{ background: '#ffffff', color: '#0f172a', border: 'none', borderRadius: 999, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Add Entity
              </button>
            </div>
          )}
        </div>
        <div className="action-page-badge">{currentOrganization?.name || 'Organization'}</div>
      </section>

      <section className="action-page-stats">
        {kpis.slice(0, 3).map((kpi) => (
          <div key={kpi.label} className="action-page-stat">
            <span className="action-page-stat-label">{kpi.label}</span>
            <span className="action-page-stat-value">{kpi.value}</span>
            <span className="action-page-stat-caption">Entity footprint across jurisdictions</span>
          </div>
        ))}
      </section>

      {error && (
        <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1 }}>
            {error.includes('organizations')
              ? 'Could not load your organization. Please refresh the page or log in again.'
              : error}
          </span>
          <button className="btn-danger btn-sm" onClick={() => window.location.reload()}>Refresh</button>
        </div>
      )}

      {/* Entity Cards Grid */}
      {loading ? (
        <div className="loading">Loading entities…</div>
      ) : entities.length === 0 ? (
        <div className="entity-empty-state">
          <div className="entity-empty-title">No entities yet</div>
          <div className="entity-empty-text">Create your first entity to get started.</div>
        </div>
      ) : (
        <div className="entity-cards-grid">
          {entities.map(entity => {
            const st = getStatusStyle(entity.status);
            return (
              <div
                key={entity.id}
                className="entity-card"
                onClick={() => navigate(`/app/enterprise/entities/${entity.id}/dashboard`)}
              >
                <div className="entity-card-top">
                  <div className="entity-card-avatar">
                    {entity.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="badge" style={{ background: st.bg, color: st.color, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                    {entity.status}
                  </span>
                </div>

                <div className="entity-card-name">{entity.name}</div>
                {entity.registration_number && (
                  <div className="entity-card-reg">Reg: {entity.registration_number}</div>
                )}

                <div className="entity-tag-row">
                  {[entity.country, entity.entity_type?.replace(/_/g, ' '), entity.local_currency].filter(Boolean).map((tag, i) => (
                    <span key={i} className="entity-tag">{tag}</span>
                  ))}
                </div>

                {entity.next_filing_date && (
                  <div className="entity-filing-date">
                    Next filing: <strong>{new Date(entity.next_filing_date).toLocaleDateString()}</strong>
                  </div>
                )}

                <div className="entity-card-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/app/enterprise/entities/${entity.id}/dashboard`)}
                  >Open Dashboard</button>
                  {hasPermission(PERMISSIONS.EDIT_ENTITY) && (
                    <button className="btn-secondary btn-sm" onClick={() => handleOpenModal(entity)}>Edit</button>
                  )}
                  {hasPermission(PERMISSIONS.DELETE_ENTITY) && (
                    <button
                      className="btn-danger btn-sm"
                      disabled={deletingEntityId === entity.id}
                      onClick={() => handleDeleteEntity(entity)}
                    >
                      {deletingEntityId === entity.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All Entities Table */}
      {entities.length > 0 && (
        <div className="entity-table-section">
          <div className="entity-table-header">
            <h3 className="entity-table-title">All Entities</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  {['Entity Name', 'Country', 'Type', 'Status', 'Currency', 'Filing Date', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entities.map(entity => {
                  const st = getStatusStyle(entity.status);
                  return (
                    <tr
                      key={entity.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/app/enterprise/entities/${entity.id}/dashboard`)}
                    >
                      <td>
                        <div style={{ fontWeight: 600 }}>{entity.name}</div>
                        {entity.registration_number && <div style={{ fontSize: 11, color: '#9CA3AF' }}>{entity.registration_number}</div>}
                      </td>
                      <td className="table-row-muted">{entity.country}</td>
                      <td className="table-row-muted" style={{ textTransform: 'capitalize' }}>{entity.entity_type?.replace(/_/g, ' ')}</td>
                      <td>
                        <span className="badge" style={{ background: st.bg, color: st.color, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                          {entity.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{entity.local_currency}</td>
                      <td className="table-row-muted">{entity.next_filing_date ? new Date(entity.next_filing_date).toLocaleDateString() : '—'}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-view btn-sm" onClick={() => navigate(`/app/enterprise/entities/${entity.id}/dashboard`)}>View</button>
                          {hasPermission(PERMISSIONS.EDIT_ENTITY) && (
                            <button className="btn-secondary btn-sm" onClick={() => handleOpenModal(entity)}>Edit</button>
                          )}
                          {hasPermission(PERMISSIONS.DELETE_ENTITY) && (
                            <button
                              className="btn-danger btn-sm"
                              disabled={deletingEntityId === entity.id}
                              onClick={() => handleDeleteEntity(entity)}
                            >
                              {deletingEntityId === entity.id ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="entity-modal-overlay" onClick={handleCloseModal}>
          <div className="entity-modal" onClick={e => e.stopPropagation()}>

            <div className="entity-modal-header">
              <h3 className="entity-modal-title">{editingEntity ? 'Edit Entity' : 'Add New Entity'}</h3>
              <button className="entity-modal-close" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="entity-modal-body">
                <div className="entity-form-grid">

                  <div className="form-full">
                    <label className="entity-form-label">Entity Name *</label>
                    <input className="entity-form-input" type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., Acme Corp USA" />
                  </div>

                  <div>
                    <label className="entity-form-label">Country *</label>
                    <select className="entity-form-input" name="country" value={formData.country} onChange={handleInputChange} required>
                      <option value="">Select a country</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.name}>{country.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="entity-form-label">Entity Type *</label>
                    <select className="entity-form-input" name="entity_type" value={formData.entity_type} onChange={handleInputChange}>
                      <option value="sole_proprietor">Sole Proprietor</option>
                      <option value="sole_trader">Sole Trader</option>
                      <option value="llc">LLC</option>
                      <option value="llp">LLP</option>
                      <option value="partnership">Partnership</option>
                      <option value="corporation">Corporation</option>
                      <option value="public_company">Public Company</option>
                      <option value="holding_company">Holding Company</option>
                      <option value="spv">SPV / Special Purpose Vehicle</option>
                      <option value="trust">Trust</option>
                      <option value="foundation">Foundation</option>
                      <option value="nonprofit">Nonprofit</option>
                      <option value="subsidiary">Subsidiary</option>
                      <option value="branch">Branch</option>
                      <option value="representative_office">Representative Office</option>
                      <option value="government_entity">Government / Public Sector</option>
                      <option value="joint_venture">Joint Venture</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="entity-form-label">Status</label>
                    <select className="entity-form-input" name="status" value={formData.status} onChange={handleInputChange}>
                      <option value="active">Active</option>
                      <option value="dormant">Dormant</option>
                      <option value="wind_down">In Wind-down</option>
                    </select>
                  </div>

                  <div>
                    <label className="entity-form-label">Registration Number</label>
                    <input className="entity-form-input" type="text" name="registration_number" value={formData.registration_number} onChange={handleInputChange} placeholder="e.g., EIN or company reg" />
                  </div>

                  <div>
                    <label className="entity-form-label">Local Currency</label>
                    <input className="entity-form-input" type="text" name="local_currency" value={formData.local_currency} readOnly />
                  </div>

                  <div>
                    <label className="entity-form-label">Main Bank</label>
                    <select className="entity-form-input" name="main_bank" value={formData.main_bank} onChange={handleInputChange}>
                      <option value="">Select a bank</option>
                      {availableBanks.map((bank, idx) => (
                        <option key={idx} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="entity-form-label">Fiscal Year End</label>
                    <input className="entity-form-input" type="date" name="fiscal_year_end" value={formData.fiscal_year_end} onChange={handleInputChange} />
                  </div>

                  <div>
                    <label className="entity-form-label">Next Filing Date</label>
                    <input className="entity-form-input" type="date" name="next_filing_date" value={formData.next_filing_date} onChange={handleInputChange} />
                  </div>

                </div>
              </div>

              <div className="entity-modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-primary">{editingEntity ? 'Update Entity' : 'Create Entity'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseEntities;
