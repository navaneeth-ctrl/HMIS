import React, { useState } from 'react';
import { Search, User, Filter, AlertCircle, Sparkles } from 'lucide-react';

const ROW_LABELS = ['A', 'B', 'C', 'D', 'E']; // 5 rows
const COL_COUNT = 6; // 6 columns = 30 beds

export default function BedMonitoring({ wards, beds, onSelectBed }) {
  const [selectedWardId, setSelectedWardId] = useState(wards[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, vacant, occupied, maintenance

  // Filter beds based on active ward and selected filters
  const wardBeds = Object.values(beds).filter(b => b.wardId === selectedWardId);
  
  // Quick overview calculations for this ward
  const occupiedCount = wardBeds.filter(b => b.status === 'occupied').length;
  const vacantCount = wardBeds.filter(b => b.status === 'vacant').length;
  const maintenanceCount = wardBeds.filter(b => b.status === 'maintenance').length;

  // Search logic: check if search query matches patient name
  const isPatientMatchingSearch = (bed) => {
    if (!searchQuery.trim() || bed.status !== 'occupied' || !bed.patient) return false;
    return bed.patient.name.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Find if a search matching patient exists anywhere in other wards
  const searchResultsOtherWards = () => {
    if (!searchQuery.trim()) return [];
    return Object.values(beds).filter(bed => 
      bed.wardId !== selectedWardId &&
      bed.status === 'occupied' && 
      bed.patient &&
      bed.patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const otherMatches = searchResultsOtherWards();

  return (
    <div className="dashboard-content">
      <div className="bed-monitoring-layout">
        
        {/* Top filter & search controls */}
        <div className="filters-bar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search patients by name (e.g. Bruce)..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Search Helper Alert if patient is in another ward */}
        {otherMatches.length > 0 && (
          <div className="login-error-msg" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#a5b4fc', gap: '12px' }}>
            <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
            <span>
              Found matching patient in another ward:{' '}
              {otherMatches.map((bed, i) => (
                <button
                  key={bed.patient.id}
                  onClick={() => setSelectedWardId(bed.wardId)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    color: 'white',
                    marginLeft: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  {bed.patient.name} ({wards.find(w => w.id === bed.wardId)?.shortName} - Bed {bed.id})
                </button>
              ))}
            </span>
          </div>
        )}

        {/* Ward switcher tab buttons */}
        <div className="ward-tabs">
          {wards.map(ward => (
            <button
              key={ward.id}
              className={`ward-tab-btn ${selectedWardId === ward.id ? 'active' : ''}`}
              onClick={() => setSelectedWardId(ward.id)}
            >
              {ward.name}
            </button>
          ))}
        </div>

        {/* Ward Occupancy Overview Legend & Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className="legend-panel">
            <div className="legend-item">
              <span className="legend-color vacant" />
              <span>Vacant ({vacantCount})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color occupied" />
              <span>Occupied ({occupiedCount})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color maintenance" />
              <span>Maintenance ({maintenanceCount})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color selected" style={{ width: '18px', height: '18px', display: 'inline-block' }} />
              <span>Highlight / Pulse</span>
            </div>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Ward Stats: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{occupiedCount} occupied</span> / {vacantCount} vacant / {maintenanceCount} cleaning
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
                  {/* Row Letter Lbl */}
                  <span className="row-label">{row}</span>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Left Wing (Columns 1-3) */}
                    <div className="beds-row-group">
                      {[1, 2, 3].map(col => {
                        const bedId = `${row}${col}`;
                        const key = `${selectedWardId}-${bedId}`;
                        const bed = beds[key];
                        
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
    </div>
  );
}
