import React, { useEffect, useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import './EnterpriseEntities.css';
import { FaPlus, FaEdit, FaTrash, FaGlobe, FaBuilding, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const EnterpriseEntities = () => {
  const { 
    currentOrganization, 
    entities, 
    fetchEntities, 
    createEntity,
    hasPermission, 
    PERMISSIONS,
    loading,
    error 
  } = useEnterprise();

  const [showModal, setShowModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
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
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEntity(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasPermission(PERMISSIONS.CREATE_ENTITY)) {
      alert('You do not have permission to create entities');
      return;
    }

    try {
      await createEntity({
        ...formData,
        organization_id: currentOrganization.id,
      });
      alert('Entity created successfully!');
      handleCloseModal();
    } catch (err) {
      alert('Failed to create entity: ' + err.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'badge-active';
      case 'dormant': return 'badge-dormant';
      case 'wind_down': return 'badge-winddown';
      default: return 'badge-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FaCheckCircle className="status-icon active" />;
      case 'dormant': return <FaTimesCircle className="status-icon dormant" />;
      default: return null;
    }
  };

  return (
    <div className="entities-container">
      <div className="entities-header">
        <div>
          <h2 className="page-title">Entities & Countries</h2>
          <p className="page-subtitle">Manage your legal entities across jurisdictions</p>
        </div>
        {hasPermission(PERMISSIONS.CREATE_ENTITY) && (
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <FaPlus /> Add Entity
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Entity Hierarchy Visualization */}
      <section className="entity-hierarchy">
        <h3 className="section-title">Entity Hierarchy</h3>
        <div className="hierarchy-tree">
          {entities.length === 0 ? (
            <div className="empty-state">
              <FaBuilding size={48} className="empty-icon" />
              <p>No entities yet. Create your first entity to get started.</p>
            </div>
          ) : (
            entities
              .filter(e => !e.parent_entity) // Root entities only
              .map(entity => (
                <div key={entity.id} className="hierarchy-node">
                  <div className="node-content">
                    <FaBuilding className="node-icon" />
                    <div className="node-info">
                      <div className="node-name">{entity.name}</div>
                      <div className="node-meta">
                        {entity.country} • {entity.entity_type}
                      </div>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(entity.status)}`}>
                      {getStatusIcon(entity.status)} {entity.status}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      </section>

      {/* Entities Table */}
      <section className="entities-table-section">
        <h3 className="section-title">All Entities</h3>
        
        {loading ? (
          <div className="loading">Loading entities...</div>
        ) : entities.length === 0 ? (
          <div className="empty-state">
            <p>No entities found. Create your first entity to begin.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="entities-table">
              <thead>
                <tr>
                  <th>Entity Name</th>
                  <th>Country</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Currency</th>
                  <th>Filing Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entities.map(entity => (
                  <tr key={entity.id} className={`row-${entity.status}`}>
                    <td className="cell-entity">
                      <div className="entity-cell">
                        <FaBuilding className="entity-icon" />
                        <div>
                          <div className="entity-name">{entity.name}</div>
                          {entity.registration_number && (
                            <div className="entity-reg">{entity.registration_number}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="country-cell">
                        <FaGlobe className="country-icon" />
                        {entity.country}
                      </div>
                    </td>
                    <td>{entity.entity_type}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(entity.status)}`}>
                        {getStatusIcon(entity.status)} {entity.status}
                      </span>
                    </td>
                    <td className="cell-currency">{entity.local_currency}</td>
                    <td className="cell-date">
                      {entity.next_filing_date ? new Date(entity.next_filing_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="cell-actions">
                      {hasPermission(PERMISSIONS.EDIT_ENTITY) && (
                        <button 
                          className="btn-sm btn-edit" 
                          onClick={() => handleOpenModal(entity)}
                          title="Edit entity"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {hasPermission(PERMISSIONS.DELETE_ENTITY) && (
                        <button 
                          className="btn-sm btn-delete"
                          title="Delete entity"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this entity?')) {
                              // TODO: Implement delete
                            }
                          }}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Entity Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEntity ? 'Edit Entity' : 'Add New Entity'}</h3>
              <button className="btn-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <form className="entity-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Entity Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Acme Corp USA"
                  />
                </div>

                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., United States"
                  />
                </div>

                <div className="form-group">
                  <label>Entity Type *</label>
                  <select name="entity_type" value={formData.entity_type} onChange={handleInputChange}>
                    <option value="sole_proprietor">Sole Proprietor</option>
                    <option value="llc">LLC</option>
                    <option value="partnership">Partnership</option>
                    <option value="corporation">Corporation</option>
                    <option value="nonprofit">Nonprofit</option>
                    <option value="subsidiary">Subsidiary</option>
                    <option value="branch">Branch</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="active">Active</option>
                    <option value="dormant">Dormant</option>
                    <option value="wind_down">In Wind-down</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Registration Number</label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleInputChange}
                    placeholder="e.g., EIN or company registration"
                  />
                </div>

                <div className="form-group">
                  <label>Local Currency</label>
                  <input
                    type="text"
                    name="local_currency"
                    value={formData.local_currency}
                    onChange={handleInputChange}
                    maxLength="3"
                    placeholder="USD"
                  />
                </div>

                <div className="form-group">
                  <label>Main Bank</label>
                  <input
                    type="text"
                    name="main_bank"
                    value={formData.main_bank}
                    onChange={handleInputChange}
                    placeholder="e.g., Bank of America"
                  />
                </div>

                <div className="form-group">
                  <label>Fiscal Year End</label>
                  <input
                    type="date"
                    name="fiscal_year_end"
                    value={formData.fiscal_year_end}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Next Filing Date</label>
                  <input
                    type="date"
                    name="next_filing_date"
                    value={formData.next_filing_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingEntity ? 'Update Entity' : 'Create Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseEntities;
