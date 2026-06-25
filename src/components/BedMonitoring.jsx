import React, { useState } from 'react';
import { Search, User, Filter, AlertCircle, ArrowLeft, Hospital, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

const ROW_LABELS = ['A', 'B', 'C', 'D', 'E']; // 5 rows
const COL_COUNT = 6; // 6 columns = 30 beds per ward

export default function BedMonitoring({ wards, beds, onSelectBed }) {
  const [selectedWardId, setSelectedWardId] = useState(null); // null means showing wards overview list
  const [wardSearchQuery, setWardSearchQuery] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, vacant, occupied, maintenance

  // Calculate overall hospital stats
  const totalBeds = Object.keys(beds).length;
  const globalOccupied = Object.values(beds).filter(b => b.status === 'occupied').length;
  const globalVacant = Object.values(beds).filter(b => b.status === 'vacant').length;
  const globalMaint = Object.values(beds).filter(b => b.status === 'maintenance').length;
  const globalOccupancyRate = Math.round((globalOccupied / totalBeds) * 100) || 0;

  // Search logic for patients globally
  const getGlobalPatientMatches = () => {
    if (!patientSearchQuery.trim()) return [];
    return Object.values(beds).filter(bed => 
      bed.status === 'occupied' &&
      bed.patient &&
      bed.patient.name.toLowerCase().includes(patientSearchQuery.toLowerCase())
    );
  };

  const patientMatches = getGlobalPatientMatches();

  // Filter wards by name
  const filteredWards = wards.filter(ward => 
    ward.name.toLowerCase().includes(wardSearchQuery.toLowerCase()) ||
    ward.shortName.toLowerCase().includes(wardSearchQuery.toLowerCase())
  );

  // If a ward is selected, gather its specific state
  const activeWard = wards.find(w => w.id === selectedWardId);
  const wardBeds = selectedWardId 
    ? Object.values(beds).filter(b => b.wardId === selectedWardId) 
    : [];

  const wardOccupied = wardBeds.filter(b => b.status === 'occupied').length;
  const wardVacant = wardBeds.filter(b => b.status === 'vacant').length;
  const wardMaint = wardBeds.filter(b => b.status === 'maintenance').length;

  const handlePatientMatchClick = (bed) => {
    setSelectedWardId(bed.wardId);
    setPatientSearchQuery('');
    // Let it highlight or select
    onSelectBed(bed.wardId, bed.id);
  };

  // Helper to check patient match for individual ward bed
  const isPatientMatchingSearch = (bed) => {
    if (!patientSearchQuery.trim() || bed.status !== 'occupied' || !bed.patient) return false;
    return bed.patient.name.toLowerCase().includes(patientSearchQuery.toLowerCase());
  };

  return (
    <div className="dashboard-content">
      {selectedWardId === null ? (
        /* ================= 60 WARDS OVERVIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Global Hospital Stats Widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
              <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', color: 'var(--color-primary)' }}>
                <Hospital size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Total Wards</span>
                <strong style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>{wards.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>({totalBeds} Beds)</span></strong>
              </div>
            </div>

            <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
              <div style={{ padding: '12px', background: 'var(--color-danger-bg)', borderRadius: '10px', color: 'var(--color-danger)' }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Occupied Beds</span>
                <strong style={{ fontSize: '1.4rem', color: 'var(--color-danger)' }}>{globalOccupied} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>({globalOccupancyRate}% Occupied)</span></strong>
              </div>
            </div>

            <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
              <div style={{ padding: '12px', background: 'var(--color-success-bg)', borderRadius: '10px', color: 'var(--color-success)' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Available Beds</span>
                <strong style={{ fontSize: '1.4rem', color: 'var(--color-success)' }}>{globalVacant}</strong>
              </div>
            </div>

            <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
              <div style={{ padding: '12px', background: 'var(--color-warning-bg)', borderRadius: '10px', color: 'var(--color-warning)' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>Under Sanitization</span>
                <strong style={{ fontSize: '1.4rem', color: 'var(--color-warning)' }}>{globalMaint}</strong>
              </div>
            </div>
          </div>

          {/* Search Controls */}
          <div className="filters-bar" style={{ gap: '20px' }}>
            <div className="search-box" style={{ flex: '1' }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Filter 60 Wards by name (e.g. ICU, Cardiology)..."
                className="search-input"
                value={wardSearchQuery}
                onChange={(e) => setWardSearchQuery(e.target.value)}
              />
            </div>

            <div className="search-box" style={{ flex: '1' }}>
              <User size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search Patient Name hospital-wide..."
                className="search-input"
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Patient Search Results Drawer */}
          {patientSearchQuery.trim() !== '' && (
            <div className="dashboard-panel" style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.03)' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🔍 Patient Search Results ({patientMatches.length})
              </h4>
              {patientMatches.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No patients matching "{patientSearchQuery}" found.</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {patientMatches.map(bed => {
                    const ward = wards.find(w => w.id === bed.wardId);
                    return (
                      <button
                        key={`${bed.wardId}-${bed.id}`}
                        onClick={() => handlePatientMatchClick(bed)}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          textAlign: 'left',
                          transition: 'all 0.2s'
                        }}
                        className="btn-secondary"
                      >
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: bed.patient.vitals.status === 'danger' ? 'var(--color-danger)' : bed.patient.vitals.status === 'warning' ? 'var(--color-warning)' : 'var(--color-success)' }} />
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-main)' }}>{bed.patient.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {ward?.name} • Bed {bed.id}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 60 Wards Cards Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', 
            gap: '20px' 
          }}>
            {filteredWards.map(ward => {
              const currentWardBeds = Object.values(beds).filter(b => b.wardId === ward.id);
              const occupied = currentWardBeds.filter(b => b.status === 'occupied').length;
              const vacant = currentWardBeds.filter(b => b.status === 'vacant').length;
              const maint = currentWardBeds.filter(b => b.status === 'maintenance').length;
              const total = currentWardBeds.length;
              const rate = Math.round((occupied / total) * 100) || 0;

              // Check load level
              const isHighLoad = rate >= 80;

              return (
                <div 
                  key={ward.id}
                  className="dashboard-panel"
                  onClick={() => setSelectedWardId(ward.id)}
                  style={{ 
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '16px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    borderColor: isHighLoad ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-color)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {isHighLoad && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      right: '12px', 
                      fontSize: '0.7rem', 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      color: 'var(--color-danger)', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      High Occupancy
                    </div>
                  )}

                  {/* Card Header */}
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, paddingRight: isHighLoad ? '80px' : '0' }}>
                      {ward.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                      Code: {ward.shortName}
                    </span>
                  </div>

                  {/* Ward Occupancy Progress bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Occupancy Rate</span>
                      <strong style={{ color: rate >= 80 ? 'var(--color-danger)' : 'var(--text-main)' }}>{rate}%</strong>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${rate}%`, 
                          height: '100%', 
                          background: rate >= 80 ? 'var(--color-danger)' : rate >= 50 ? 'var(--color-warning)' : 'var(--color-success)',
                          borderRadius: '3px'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Dot Grid Visual Matrix Representing 30 Beds */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(10, 1fr)',
                    gap: '4px',
                    padding: '8px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)'
                  }}>
                    {currentWardBeds.map(bed => {
                      const color = bed.status === 'occupied' 
                        ? 'var(--color-danger)' 
                        : bed.status === 'maintenance' 
                        ? 'var(--color-warning)' 
                        : 'var(--color-success)';
                      
                      return (
                        <div 
                          key={bed.id}
                          style={{
                            aspectRatio: '1',
                            borderRadius: '50%',
                            background: color,
                            width: '100%',
                            maxHeight: '12px',
                            minHeight: '8px',
                            opacity: 0.8
                          }}
                          title={`Bed ${bed.id}: ${bed.status}`}
                        />
                      );
                    })}
                  </div>

                  {/* Ward Footnote Stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    <span>🛏️ Occupied: <strong>{occupied}</strong></span>
                    <span>🟢 Vacant: <strong>{vacant}</strong></span>
                    <span>🛠️ Maint: <strong>{maint}</strong></span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* ================= INDIVIDUAL BOOK MY SHOW GRID VIEW ================= */
        <div className="bed-monitoring-layout">
          
          {/* Back Navigation Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setSelectedWardId(null)}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
            >
              <ArrowLeft size={16} />
              Back to Wards Overview
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {activeWard?.name}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Visual Bed Map Allocation Ledger ({activeWard?.shortName})
              </span>
            </div>
          </div>

          {/* Filters Bar & Quick Search in Ward */}
          <div className="filters-bar">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search patient in this ward..."
                className="search-input"
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Filter size={18} style={{ color: 'var(--text-muted)' }} />
              <select
                className="select-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Bed Statuses</option>
                <option value="vacant">Vacant Beds Only</option>
                <option value="occupied">Occupied Beds Only</option>
                <option value="maintenance">Maintenance Beds Only</option>
              </select>
            </div>
          </div>

          {/* Ward Occupancy Overview Legend & Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div className="legend-panel">
              <div className="legend-item">
                <span className="legend-color vacant" />
                <span>Vacant ({wardVacant})</span>
              </div>
              <div className="legend-item">
                <span className="legend-color occupied" />
                <span>Occupied ({wardOccupied})</span>
              </div>
              <div className="legend-item">
                <span className="legend-color maintenance" />
                <span>Maintenance ({wardMaint})</span>
              </div>
              <div className="legend-item">
                <span className="legend-color selected" style={{ width: '18px', height: '18px', display: 'inline-block' }} />
                <span>Highlight / Pulse</span>
              </div>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Ward Stats: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{wardOccupied} occupied</span> / {wardVacant} vacant / {wardMaint} cleaning
            </div>
          </div>

          {/* BookMyShow Style Grid Mapping */}
          <div className="bed-grid-map-container">
            <div className="nurse-station-bar">
              👩‍⚕️ Central Nurse Station / Ward Corridor Entry 👨‍⚕️
            </div>

            <div className="beds-layout-grid">
              {ROW_LABELS.map(row => {
                return (
                  <div className="beds-row" key={row}>
                    {/* Row Letter Label */}
                    <span className="row-label">{row}</span>

                    <div style={{ display: 'flex', gap: '20px' }}>
                      {/* Left Wing (Columns 1-3) */}
                      <div className="beds-row-group">
                        {[1, 2, 3].map(col => {
                          const bedId = `${row}${col}`;
                          const key = `${selectedWardId}-${bedId}`;
                          const bed = beds[key];
                          
                          if (!bed) return null;

                          // Apply filters
                          const matchesFilter = statusFilter === 'all' || bed.status === statusFilter;
                          const isMatch = isPatientMatchingSearch(bed);
                          
                          return (
                            <div
                              key={bedId}
                              style={{ opacity: matchesFilter ? 1 : 0.2, pointerEvents: matchesFilter ? 'auto' : 'none' }}
                              className={`bed-box ${bed.status} ${isMatch ? 'search-highlight-pulse' : ''}`}
                              onClick={() => onSelectBed(selectedWardId, bedId)}
                            >
                              <span className="bed-number-text">{bedId}</span>
                              <span className="bed-icon-badge">
                                {bed.status === 'occupied' ? '🛏️' : bed.status === 'maintenance' ? '🛠️' : '🟢'}
                              </span>

                              {/* Custom interactive tooltip */}
                              <div className="bed-tooltip">
                                {bed.status === 'occupied' ? (
                                  <div style={{ textAlign: 'left' }}>
                                    <strong>{bed.patient.name}</strong> ({bed.patient.age}y/o {bed.patient.gender})
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '2px' }}>
                                      Diag: {bed.patient.ailment}
                                    </div>
                                    <div style={{ color: 'var(--color-primary)', fontSize: '0.7rem', fontWeight: 600 }}>
                                      Vitals: {bed.patient.vitals.heartRate} bpm / {bed.patient.vitals.spo2}% SpO2
                                    </div>
                                  </div>
                                ) : bed.status === 'maintenance' ? (
                                  <span>Sanitization & Main.</span>
                                ) : (
                                  <span>Bed Vacant (Click to admit)</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Central Corridor Pathway Aisle Spacer */}
                      <div className="corridor-spacer">
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.05em', transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                          AISLE
                        </span>
                      </div>

                      {/* Right Wing (Columns 4-6) */}
                      <div className="beds-row-group">
                        {[4, 5, 6].map(col => {
                          const bedId = `${row}${col}`;
                          const key = `${selectedWardId}-${bedId}`;
                          const bed = beds[key];

                          if (!bed) return null;

                          // Apply filters
                          const matchesFilter = statusFilter === 'all' || bed.status === statusFilter;
                          const isMatch = isPatientMatchingSearch(bed);

                          return (
                            <div
                              key={bedId}
                              style={{ opacity: matchesFilter ? 1 : 0.2, pointerEvents: matchesFilter ? 'auto' : 'none' }}
                              className={`bed-box ${bed.status} ${isMatch ? 'search-highlight-pulse' : ''}`}
                              onClick={() => onSelectBed(selectedWardId, bedId)}
                            >
                              <span className="bed-number-text">{bedId}</span>
                              <span className="bed-icon-badge">
                                {bed.status === 'occupied' ? '🛏️' : bed.status === 'maintenance' ? '🛠️' : '🟢'}
                              </span>

                              {/* Custom interactive tooltip */}
                              <div className="bed-tooltip">
                                {bed.status === 'occupied' ? (
                                  <div style={{ textAlign: 'left' }}>
                                    <strong>{bed.patient.name}</strong> ({bed.patient.age}y/o {bed.patient.gender})
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '2px' }}>
                                      Diag: {bed.patient.ailment}
                                    </div>
                                    <div style={{ color: 'var(--color-primary)', fontSize: '0.7rem', fontWeight: 600 }}>
                                      Vitals: {bed.patient.vitals.heartRate} bpm / {bed.patient.vitals.spo2}% SpO2
                                    </div>
                                  </div>
                                ) : bed.status === 'maintenance' ? (
                                  <span>Sanitization & Main.</span>
                                ) : (
                                  <span>Bed Vacant (Click to admit)</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Help Box */}
          <div className="dashboard-panel" style={{ padding: '16px 24px', flex: 'none', background: 'rgba(255,255,255,0.01)', borderColor: 'var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span>
                <strong>Tip:</strong> Hover over any bed to quickly review patient stats or status details. Click on any bed to perform patient intake admissions, execute discharge logs, update real-time vital metrics, or request maintenance orders.
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
