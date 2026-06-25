import React, { useState } from 'react';
import { Search, MapPin, Trash2, ShieldAlert, Activity, User, IndianRupee } from 'lucide-react';

export default function PatientRegistry({ beds, wards, onLocatePatientBed, onDischargePatient, onViewBill }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Gather all occupied beds (active patients)
  const activePatients = Object.values(beds)
    .filter(bed => bed.status === 'occupied' && bed.patient)
    .map(bed => ({
      bedId: bed.id,
      wardId: bed.wardId,
      ...bed.patient
    }));

  // Filtering logic
  const filteredPatients = activePatients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.ailment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWard = wardFilter === 'all' || patient.wardId === wardFilter;
    const matchesPriority = priorityFilter === 'all' || patient.priority === priorityFilter;

    return matchesSearch && matchesWard && matchesPriority;
  });

  return (
    <div className="dashboard-content">
      {/* Filters Area */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, ID, physician or complaint..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="select-filter"
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
        >
          <option value="all">All Wards</option>
          {wards.map(w => (
            <option key={w.id} value={w.id}>{w.shortName}</option>
          ))}
        </select>

        <select
          className="select-filter"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </div>

      {/* Patient Directory Table */}
      <div className="table-wrapper">
        <table className="hmis-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Full Name</th>
              <th>Age & Sex</th>
              <th>Ward Location</th>
              <th>Chief Complaint</th>
              <th>Attending Doctor</th>
              <th>Triage Level</th>
              <th>Vitals Alert</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>
                  No active patients found matching current criteria.
                </td>
              </tr>
            ) : (
              filteredPatients.map(patient => {
                const wardName = wards.find(w => w.id === patient.wardId)?.shortName || patient.wardId;
                
                // Determine vital risk level
                let vitalClass = 'priority-low';
                let vitalText = 'Normal';
                if (patient.vitals.status === 'danger') {
                  vitalClass = 'priority-high';
                  vitalText = 'Critical';
                } else if (patient.vitals.status === 'warning') {
                  vitalClass = 'priority-medium';
                  vitalText = 'Warning';
                }

                return (
                  <tr key={patient.id} className="animate-fade-in">
                    <td>
                      <code style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{patient.id}</code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>
                          {patient.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{patient.name}</span>
                      </div>
                    </td>
                    <td>{patient.age} yrs / {patient.gender}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        📍 {wardName} (Bed {patient.bedId})
                      </span>
                    </td>
                    <td>{patient.ailment}</td>
                    <td>{patient.doctor}</td>
                    <td>
                      <span className={`badge priority-${patient.priority}`}>
                        {patient.priority.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${vitalClass}`}>
                        {vitalText}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => onLocatePatientBed(patient.wardId, patient.bedId)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Locate bed mapping"
                        >
                          <MapPin size={14} />
                          Locate
                        </button>

                        <button
                          onClick={() => onViewBill && onViewBill(patient.id)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                          title="View billing invoice"
                        >
                          <IndianRupee size={14} />
                          Bill
                        </button>
                        
                        <button
                          onClick={() => {
                            if (window.confirm(`Discharge patient ${patient.name}?`)) {
                              onDischargePatient(patient.wardId, patient.bedId);
                            }
                          }}
                          className="btn-danger"
                          style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Discharge patient"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Showing <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{filteredPatients.length}</span> of {activePatients.length} admitted patients.
      </div>
    </div>
  );
}
