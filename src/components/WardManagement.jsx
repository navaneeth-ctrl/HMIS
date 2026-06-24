import React, { useState } from 'react';
import { Users, Activity, ShieldCheck, Heart, User, Check, Edit2, AlertCircle, Command } from 'lucide-react';

export default function WardManagement({ wards, beds, staff, onAssignStaff, onBulkStatusChange }) {
  const [editingWardId, setEditingWardId] = useState(null);
  const [editNurse, setEditNurse] = useState('');
  const [editDoctor, setEditDoctor] = useState('');

  // Calculate stress level based on occupancy percentage
  const getLoadStatus = (rate) => {
    if (rate >= 90) return { label: '🚨 Capacity Alert', class: 'priority-high' };
    if (rate >= 70) return { label: '⚠️ Heavy Load', class: 'priority-medium' };
    if (rate >= 30) return { label: '⚡ Active Load', class: 'priority-low' };
    return { label: '🟢 Stable', class: 'status-vacant' };
  };

  const handleEditClick = (wardId, currentStaff) => {
    setEditingWardId(wardId);
    setEditNurse(currentStaff.nurse || '');
    setEditDoctor(currentStaff.doctor || '');
  };

  const handleSaveClick = (wardId) => {
    if (editNurse.trim()) {
      onAssignStaff(wardId, 'nurse', editNurse.trim());
    }
    if (editDoctor.trim()) {
      onAssignStaff(wardId, 'doctor', editDoctor.trim());
    }
    setEditingWardId(null);
  };

  return (
    <div className="dashboard-content">
      <div className="filters-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Command size={18} style={{ color: 'var(--color-primary)' }} />
          <span>Monitor ward loads, update clinical staffing rosters, and launch bulk sanitation actions.</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {wards.map(ward => {
          // Gather stats for this ward
          const wardBeds = Object.values(beds).filter(b => b.wardId === ward.id);
          const total = wardBeds.length;
          const occupied = wardBeds.filter(b => b.status === 'occupied').length;
          const vacant = wardBeds.filter(b => b.status === 'vacant').length;
          const maintenance = wardBeds.filter(b => b.status === 'maintenance').length;
          const highPriority = wardBeds.filter(b => b.status === 'occupied' && b.patient?.priority === 'high').length;
          
          const occupancyRate = Math.round((occupied / total) * 100);
          const loadStatus = getLoadStatus(occupancyRate);
          const wardStaff = staff[ward.id] || { doctor: 'Not Assigned', nurse: 'Not Assigned' };
          const isEditing = editingWardId === ward.id;

          return (
            <div className="dashboard-panel" key={ward.id} style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '20px' }}>
              
              {/* Ward Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{ward.name}</h3>
                  <span className={`badge ${loadStatus.class}`} style={{ marginTop: '6px' }}>
                    {loadStatus.label}
                  </span>
                </div>
                <span className="realtime-clock" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                  {ward.shortName}
                </span>
              </div>

              {/* Occupancy Progress Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 500 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Occupancy Rate</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{occupancyRate}%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  <div 
                    style={{ 
                      width: `${occupancyRate}%`, 
                      background: occupancyRate > 90 ? 'var(--color-danger)' : (occupancyRate > 70 ? 'var(--color-warning)' : 'var(--color-primary)'),
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>
              </div>

              {/* Beds summary counts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center', background: '#f8fafc', padding: '12px 6px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Total</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{total}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Occupied</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-danger)' }}>{occupied}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Vacant</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-success)' }}>{vacant}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Maint.</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-warning)' }}>{maintenance}</strong>
                </div>
              </div>

              {/* Critical Alert Counter */}
              {highPriority > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--color-danger-bg)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '6px', color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <AlertCircle size={14} />
                  <span>{highPriority} Critical Patient{highPriority > 1 ? 's' : ''} Admitted</span>
                </div>
              )}

              {/* Staff Assignments Box */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Clinical Staff Roster</h4>
                  
                  {!isEditing ? (
                    <button
                      onClick={() => handleEditClick(ward.id, wardStaff)}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit2 size={10} />
                      Modify
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSaveClick(ward.id)}
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)', boxShadow: 'none' }}
                    >
                      <Check size={10} />
                      Save
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Chief Doctor:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{wardStaff.doctor}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>On-Duty Nurse:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{wardStaff.nurse}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="animate-fade-in">
                    <div className="form-group" style={{ gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem' }}>Chief Doctor</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        value={editDoctor}
                        onChange={(e) => setEditDoctor(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem' }}>On-Duty Nurse</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        value={editNurse}
                        onChange={(e) => setEditNurse(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bulk Commands */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  disabled={vacant === 0}
                  onClick={() => onBulkStatusChange(ward.id, 'vacant', 'maintenance')}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '8px', color: vacant > 0 ? 'var(--color-warning)' : 'var(--text-dim)', borderColor: vacant > 0 ? 'var(--color-warning)' : 'var(--border-color)', opacity: vacant > 0 ? 1 : 0.5 }}
                >
                  🛠️ Disinfect Vacant ({vacant})
                </button>
                <button
                  disabled={maintenance === 0}
                  onClick={() => onBulkStatusChange(ward.id, 'maintenance', 'vacant')}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '8px', color: maintenance > 0 ? 'var(--color-success)' : 'var(--text-dim)', borderColor: maintenance > 0 ? 'var(--color-success)' : 'var(--border-color)', opacity: maintenance > 0 ? 1 : 0.5 }}
                >
                  🟢 Release Maint. ({maintenance})
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
