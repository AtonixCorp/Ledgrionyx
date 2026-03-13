import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnterprise } from '../../context/EnterpriseContext';
import { countries, getBanksByCountryCode } from '../../utils/countries';

const EnterpriseEntities = () => {
  const navigate = useNavigate();
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

  // shared input style
  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB',
    borderRadius: 7, fontSize: 13, color: '#111827', outline: 'none',
    background: '#fff', boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block' };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1300, margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#003B73', margin: 0 }}>Entities & Countries</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: '6px 0 0' }}>Manage your legal entities across jurisdictions</p>
        </div>
        {hasPermission(PERMISSIONS.CREATE_ENTITY) && (
          <button
            onClick={() => handleOpenModal()}
            style={{
              background: '#003B73', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#004f99'}
            onMouseOut={e => e.currentTarget.style.background = '#003B73'}
          >
            + Add Entity
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            background: '#fff', borderRadius: 10, padding: '18px 22px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${k.accent}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Entity Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', fontSize: 14 }}>Loading entities…</div>
      ) : entities.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 12, padding: '60px 32px', textAlign: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)', color: '#9CA3AF',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No entities yet</div>
          <div style={{ fontSize: 13 }}>Create your first entity to get started.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18, marginBottom: 36 }}>
          {entities.map(entity => {
            const st = getStatusStyle(entity.status);
            return (
              <div
                key={entity.id}
                onClick={() => navigate(`/app/enterprise/entities/${entity.id}/dashboard`)}
                style={{
                  background: '#fff', borderRadius: 12, padding: '22px 24px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)', cursor: 'pointer',
                  border: '1px solid #E5E7EB', transition: 'all 0.18s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,59,115,0.13)';
                  e.currentTarget.style.borderColor = '#003B73';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: '#EFF6FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0, fontWeight: 700, color: '#003B73',
                  }}>E</div>
                  <span style={{
                    background: st.bg, color: st.color, borderRadius: 20,
                    padding: '3px 10px', fontSize: 11, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                    {entity.status}
                  </span>
                </div>

                {/* Entity name */}
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{entity.name}</div>
                {entity.registration_number && (
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>Reg: {entity.registration_number}</div>
                )}

                {/* Meta row */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {[
                    entity.country,
                    entity.entity_type?.replace(/_/g, ' '),
                    entity.local_currency,
                  ].filter(Boolean).map((tag, i) => (
                    <span key={i} style={{
                      background: '#F3F4F6', color: '#374151', borderRadius: 6,
                      padding: '3px 9px', fontSize: 11, fontWeight: 500, textTransform: 'capitalize',
                    }}>{tag}</span>
                  ))}
                </div>

                {/* Filing date */}
                {entity.next_filing_date && (
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>
                    Next filing: <strong style={{ color: '#374151' }}>{new Date(entity.next_filing_date).toLocaleDateString()}</strong>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/app/enterprise/entities/${entity.id}/dashboard`)}
                    style={{
                      flex: 1, background: '#003B73', color: '#fff', border: 'none',
                      borderRadius: 7, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#004f99'}
                    onMouseOut={e => e.currentTarget.style.background = '#003B73'}
                  >Open Dashboard</button>
                  {hasPermission(PERMISSIONS.EDIT_ENTITY) && (
                    <button
                      onClick={() => handleOpenModal(entity)}
                      style={{
                        background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB',
                        borderRadius: 7, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#E5E7EB'}
                      onMouseOut={e => e.currentTarget.style.background = '#F3F4F6'}
                    >Edit</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All Entities Table */}
      {entities.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>All Entities</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Entity Name', 'Country', 'Type', 'Status', 'Currency', 'Filing Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entities.map((entity, i) => {
                  const st = getStatusStyle(entity.status);
                  return (
                    <tr
                      key={entity.id}
                      style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 1 ? '#FAFAFA' : '#fff', cursor: 'pointer' }}
                      onClick={() => navigate(`/app/enterprise/entities/${entity.id}/dashboard`)}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{entity.name}</div>
                        {entity.registration_number && (
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{entity.registration_number}</div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>{entity.country}</td>
                      <td style={{ padding: '12px 16px', color: '#374151', textTransform: 'capitalize' }}>{entity.entity_type?.replace(/_/g, ' ')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: st.bg, color: st.color, borderRadius: 20,
                          padding: '3px 10px', fontSize: 11, fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                          {entity.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>{entity.local_currency}</td>
                      <td style={{ padding: '12px 16px', color: '#6B7280' }}>
                        {entity.next_filing_date ? new Date(entity.next_filing_date).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => navigate(`/app/enterprise/entities/${entity.id}/dashboard`)}
                            style={{
                              background: '#003B73', color: '#fff', border: 'none',
                              borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            }}
                          >View</button>
                          {hasPermission(PERMISSIONS.EDIT_ENTITY) && (
                            <button
                              onClick={() => handleOpenModal(entity)}
                              style={{
                                background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB',
                                borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              }}
                            >Edit</button>
                          )}
                          {hasPermission(PERMISSIONS.DELETE_ENTITY) && (
                            <button
                              onClick={() => { if (window.confirm('Delete this entity?')) {} }}
                              style={{
                                background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA',
                                borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              }}
                            >Delete</button>
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
        <div
          onClick={handleCloseModal}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 14, width: '100%', maxWidth: 640,
              maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            {/* Modal header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '20px 24px', borderBottom: '1px solid #E5E7EB',
            }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>
                {editingEntity ? 'Edit Entity' : 'Add New Entity'}
              </h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none', border: 'none', fontSize: 22, color: '#9CA3AF',
                  cursor: 'pointer', lineHeight: 1, padding: 0,
                }}
              >×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Entity Name *</label>
                  <input style={inputStyle} type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., Acme Corp USA" />
                </div>

                <div>
                  <label style={labelStyle}>Country *</label>
                  <select style={inputStyle} name="country" value={formData.country} onChange={handleInputChange} required>
                    <option value="">Select a country</option>
                    {countries.map(country => (
                      <option key={country.code} value={country.name}>{country.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Entity Type *</label>
                  <select style={inputStyle} name="entity_type" value={formData.entity_type} onChange={handleInputChange}>
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
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="active">Active</option>
                    <option value="dormant">Dormant</option>
                    <option value="wind_down">In Wind-down</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Registration Number</label>
                  <input style={inputStyle} type="text" name="registration_number" value={formData.registration_number} onChange={handleInputChange} placeholder="e.g., EIN or company reg" />
                </div>

                <div>
                  <label style={labelStyle}>Local Currency</label>
                  <input style={{ ...inputStyle, background: '#F9FAFB', color: '#6B7280' }} type="text" name="local_currency" value={formData.local_currency} readOnly />
                </div>

                <div>
                  <label style={labelStyle}>Main Bank</label>
                  <select style={inputStyle} name="main_bank" value={formData.main_bank} onChange={handleInputChange}>
                    <option value="">Select a bank</option>
                    {availableBanks.map((bank, idx) => (
                      <option key={idx} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Fiscal Year End</label>
                  <input style={inputStyle} type="date" name="fiscal_year_end" value={formData.fiscal_year_end} onChange={handleInputChange} />
                </div>

                <div>
                  <label style={labelStyle}>Next Filing Date</label>
                  <input style={inputStyle} type="date" name="next_filing_date" value={formData.next_filing_date} onChange={handleInputChange} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid #E5E7EB' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB',
                    borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >Cancel</button>
                <button
                  type="submit"
                  style={{
                    background: '#003B73', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '9px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#004f99'}
                  onMouseOut={e => e.currentTarget.style.background = '#003B73'}
                >
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
