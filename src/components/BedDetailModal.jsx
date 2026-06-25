import React, { useState, useEffect } from 'react';
import { X, Heart, Thermometer, ShieldAlert, CheckCircle, Activity, UserPlus, LogOut, Check, Info, Settings, ArrowLeftRight, FileText, ClipboardList, PlusCircle, User } from 'lucide-react';

export default function BedDetailModal({ 
  bed, 
  wardName, 
  onClose, 
  onAdmit, 
  onDischarge, 
  onUpdateVitals, 
  onSetMaintenance, 
  onTransfer, 
  onAddClinicalLog,
  onToggleMedication,
  onAddMedication,
  beds, 
  wards 
}) {
  if (!bed) return null;

  // Tab state: 'vitals', 'logs', 'mar'
  const [activeTab, setActiveTab] = useState('vitals');

  // Form states for admission
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [ailment, setAilment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [priority, setPriority] = useState('medium');

  // Form states for vitals editing
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [heartRate, setHeartRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [spo2, setSpo2] = useState('');
  const [temperature, setTemperature] = useState('');

  // Form states for ward transfer
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferWardId, setTransferWardId] = useState(wards[0].id);
  const [transferBedId, setTransferBedId] = useState('');

  // Form states for clinical logs
  const [newLogNote, setNewLogNote] = useState('');
  const [logDoctor, setLogDoctor] = useState('');

  // Form states for MAR medications
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00 AM');
  const [nurseInitials, setNurseInitials] = useState('Nurse Ratched');

  // Get vacant beds in target transfer ward
  const vacantBedsInTargetWard = Object.values(beds).filter(
    b => b.wardId === transferWardId && b.status === 'vacant'
  );

  // Synchronize vitals states when bed is loaded
  useEffect(() => {
    if (bed.status === 'occupied' && bed.patient) {
      setHeartRate(bed.patient.vitals.heartRate);
      setBloodPressure(bed.patient.vitals.bloodPressure);
      setSpo2(bed.patient.vitals.spo2);
      setTemperature(bed.patient.vitals.temperature);
      setLogDoctor(bed.patient.doctor || '');
    }
    // Reset forms
    setPatientName('');
    setAge('');
    setGender('Male');
    setAilment('');
    setDoctor('');
    setPriority('medium');
    setIsEditingVitals(false);
    setIsTransferring(false);
    setNewLogNote('');
    setNewMedName('');
    setActiveTab('vitals');
  }, [bed]);

  // Reset transfer bed selection when ward changes
  useEffect(() => {
    if (vacantBedsInTargetWard.length > 0) {
      setTransferBedId(vacantBedsInTargetWard[0].id);
    } else {
      setTransferBedId('');
    }
  }, [transferWardId, bed]);

  const handleAdmitSubmit = (e) => {
    e.preventDefault();
    if (!patientName || !age || !ailment || !doctor) return;
    
    onAdmit(bed.wardId, bed.id, {
      name: patientName,
      age: parseInt(age),
      gender,
      ailment,
      doctor,
      priority
    });
    onClose();
  };

  const handleVitalsSubmit = (e) => {
    e.preventDefault();
    onUpdateVitals(bed.wardId, bed.id, {
      heartRate: parseInt(heartRate),
      bloodPressure,
      spo2: parseInt(spo2),
      temperature: parseFloat(temperature)
    });
    setIsEditingVitals(false);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferWardId || !transferBedId) return;
    onTransfer(bed.wardId, bed.id, transferWardId, transferBedId);
    onClose();
  };

  const handleAddLogSubmit = (e) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;
    onAddClinicalLog(bed.wardId, bed.id, newLogNote.trim(), logDoctor.trim());
    setNewLogNote('');
  };

  const handleAddMedSubmit = (e) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedTime) return;
    onAddMedication(bed.wardId, bed.id, newMedName.trim(), newMedTime);
    setNewMedName('');
  };

  const handleMarCheckboxChange = (marId, checked) => {
    onToggleMedication(bed.wardId, bed.id, marId, checked, nurseInitials);
  };

  // Determine vital status color code for occupied view
  const getVitalCardClass = (value, type) => {
    if (!bed.patient) return 'normal';
    const vHr = parseInt(heartRate) || bed.patient.vitals.heartRate;
    const vSp = parseInt(spo2) || bed.patient.vitals.spo2;
    const vTemp = parseFloat(temperature) || bed.patient.vitals.temperature;

    if (type === 'hr') {
      if (vHr < 50 || vHr > 120) return 'danger';
      if (vHr < 60 || vHr > 100) return 'warning';
    }
    if (type === 'spo2') {
      if (vSp < 90) return 'danger';
      if (vSp < 94) return 'warning';
    }
    if (type === 'temp') {
      if (vTemp > 102) return 'danger';
      if (vTemp > 99.5 || vTemp < 97.0) return 'warning';
    }
    return 'normal';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: activeTab !== 'vitals' && bed.status === 'occupied' ? '640px' : '580px' }}>
        
        {/* Header bar */}
        <div className="modal-header-bar">
          <h3>
            <Activity size={20} className="trend-neutral" />
            <span>{wardName} — Bed {bed.id}</span>
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* occupied tabs switcher */}
        {bed.status === 'occupied' && bed.patient && !isTransferring && (
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', margin: '16px 24px 0 24px', borderRadius: '8px' }}>
            <button
              onClick={() => setActiveTab('vitals')}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: activeTab === 'vitals' ? 'white' : 'transparent',
                color: activeTab === 'vitals' ? 'var(--color-primary)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: activeTab === 'vitals' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Heart size={14} />
              Vitals & Details
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: activeTab === 'logs' ? 'white' : 'transparent',
                color: activeTab === 'logs' ? 'var(--color-primary)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: activeTab === 'logs' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={14} />
              Clinical Logs (SOAP)
            </button>
            <button
              onClick={() => setActiveTab('mar')}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: activeTab === 'mar' ? 'white' : 'transparent',
                color: activeTab === 'mar' ? 'var(--color-primary)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: activeTab === 'mar' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <ClipboardList size={14} />
              Medication MAR
            </button>
          </div>
        )}

        {/* Dynamic Modal Body depending on Status */}
        <div className="modal-body" style={{ paddingTop: bed.status === 'occupied' && !isTransferring ? '12px' : '24px' }}>
          {bed.status === 'vacant' && (
            <form onSubmit={handleAdmitSubmit} className="login-form">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--color-success-bg)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '8px', fontSize: '0.8rem', color: '#047857' }}>
                <CheckCircle size={16} />
                <span>Bed is vacant. Complete the intake form to admit a patient.</span>
              </div>

              <div className="vitals-grid">
                <div className="form-group">
                  <label>Patient Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ paddingLeft: '14px' }}
                    placeholder="John Doe"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    className="form-input"
                    style={{ paddingLeft: '14px' }}
                    placeholder="35"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
              </div>

              <div className="vitals-grid">
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    className="select-filter"
                    style={{ width: '100%', padding: '12px' }}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Triage Priority</label>
                  <select
                    className="select-filter"
                    style={{ width: '100%', padding: '12px' }}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low (Standard)</option>
                    <option value="medium">Medium (Observed)</option>
                    <option value="high">High (Urgent ICU)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Diagnosis / Chief Complaint</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  placeholder="e.g. Chronic chest pain, high fever"
                  value={ailment}
                  onChange={(e) => setAilment(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Assigned Physician</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                  placeholder="Dr. Sarah Jenkins"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                />
              </div>

              <div className="modal-actions-bar" style={{ padding: '10px 0 0 0', borderTop: 'none' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    onSetMaintenance(bed.wardId, bed.id, true);
                    onClose();
                  }}
                  style={{ marginRight: 'auto', border: '1px solid var(--color-warning)', color: 'var(--color-warning)' }}
                >
                  🛠️ Set Maintenance
                </button>
                
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={16} />
                  Admit Patient
                </button>
              </div>
            </form>
          )}

          {bed.status === 'occupied' && bed.patient && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Transfer Form overlay inside Modal */}
              {isTransferring ? (
                <form onSubmit={handleTransferSubmit} className="login-form animate-fade-in" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                    <ArrowLeftRight size={18} />
                    Transfer Patient Bed Allocation
                  </h4>
                  
                  <div className="vitals-grid">
                    <div className="form-group">
                      <label>Select Destination Ward</label>
                      <select
                        className="select-filter"
                        style={{ width: '100%', padding: '10px' }}
                        value={transferWardId}
                        onChange={(e) => setTransferWardId(e.target.value)}
                      >
                        {wards.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Select Available Bed</label>
                      <select
                        className="select-filter"
                        style={{ width: '100%', padding: '10px' }}
                        value={transferBedId}
                        onChange={(e) => setTransferBedId(e.target.value)}
                        disabled={vacantBedsInTargetWard.length === 0}
                      >
                        {vacantBedsInTargetWard.map(b => (
                          <option key={b.id} value={b.id}>Bed {b.id}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {vacantBedsInTargetWard.length === 0 && (
                    <div className="login-error-msg" style={{ margin: '0' }}>
                      <AlertCircle size={16} />
                      <span>No vacant beds available in the selected ward.</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="button" className="btn-secondary" onClick={() => setIsTransferring(false)}>
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ width: 'auto' }}
                      disabled={!transferBedId}
                    >
                      Confirm Transfer
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* TAB 1: VITALS AND DETAILS */}
                  {activeTab === 'vitals' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
                      {/* Patient Badge summary */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                        <div>
                          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{bed.patient.name}</h2>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <span>Reg: {bed.patient.id}</span>
                            <span>•</span>
                            <span>{bed.patient.age} y/o {bed.patient.gender}</span>
                          </div>
                        </div>
                        <span className={`badge priority-${bed.patient.priority}`}>
                          {bed.patient.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>

                      {/* Diagnosis details */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Diagnosis</span>
                          <strong>{bed.patient.ailment}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Attending Physician</span>
                          <strong>{bed.patient.doctor}</strong>
                        </div>
                      </div>

                      {/* Live Vitals monitor */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Activity size={16} style={{ color: 'var(--color-danger)' }} />
                            Live Vitals Telemetry
                          </span>

                          <button
                            onClick={() => setIsEditingVitals(!isEditingVitals)}
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Settings size={12} />
                            {isEditingVitals ? 'View Vitals' : 'Modify Vitals'}
                          </button>
                        </div>

                        {!isEditingVitals ? (
                          <div className="vitals-grid">
                            <div className={`vital-card-item ${getVitalCardClass(null, 'hr')}`}>
                              <div className="vital-icon-box">
                                <Activity size={18} />
                              </div>
                              <div className="vital-info-text">
                                <span className="vital-label">Heart Rate</span>
                                <span className="vital-value">{bed.patient.vitals.heartRate} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>bpm</span></span>
                              </div>
                            </div>

                            <div className="vital-card-item normal">
                              <div className="vital-icon-box" style={{ color: 'var(--color-primary)', background: 'rgba(99, 102, 241, 0.15)' }}>
                                <Info size={18} />
                              </div>
                              <div className="vital-info-text">
                                <span className="vital-label">Blood Pressure</span>
                                <span className="vital-value">{bed.patient.vitals.bloodPressure} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>mmHg</span></span>
                              </div>
                            </div>

                            <div className={`vital-card-item ${getVitalCardClass(null, 'spo2')}`}>
                              <div className="vital-icon-box">
                                <Check size={18} />
                              </div>
                              <div className="vital-info-text">
                                <span className="vital-label">SpO2 Rate</span>
                                <span className="vital-value">{bed.patient.vitals.spo2}%</span>
                              </div>
                            </div>

                            <div className={`vital-card-item ${getVitalCardClass(null, 'temp')}`}>
                              <div className="vital-icon-box">
                                <Thermometer size={18} />
                              </div>
                              <div className="vital-info-text">
                                <span className="vital-label">Body Temp</span>
                                <span className="vital-value">{bed.patient.vitals.temperature}°F</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleVitalsSubmit} className="login-form animate-fade-in">
                            <div className="vitals-grid">
                              <div className="form-group">
                                <label>Heart Rate (BPM)</label>
                                <input
                                  type="number"
                                  required
                                  min="30"
                                  max="220"
                                  className="form-input"
                                  style={{ paddingLeft: '12px' }}
                                  value={heartRate}
                                  onChange={(e) => setHeartRate(e.target.value)}
                                />
                              </div>
                              <div className="form-group">
                                <label>Blood Pressure</label>
                                <input
                                  type="text"
                                  required
                                  pattern="\d{2,3}\/\d{2,3}"
                                  className="form-input"
                                  style={{ paddingLeft: '12px' }}
                                  placeholder="120/80"
                                  value={bloodPressure}
                                  onChange={(e) => setBloodPressure(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="vitals-grid">
                              <div className="form-group">
                                <label>SpO2 Level (%)</label>
                                <input
                                  type="number"
                                  required
                                  min="50"
                                  max="100"
                                  className="form-input"
                                  style={{ paddingLeft: '12px' }}
                                  value={spo2}
                                  onChange={(e) => setSpo2(e.target.value)}
                                />
                              </div>
                              <div className="form-group">
                                <label>Temperature (°F)</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  required
                                  min="90"
                                  max="110"
                                  className="form-input"
                                  style={{ paddingLeft: '12px' }}
                                  value={temperature}
                                  onChange={(e) => setTemperature(e.target.value)}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                              <button type="button" className="btn-secondary" onClick={() => setIsEditingVitals(false)}>
                                Cancel
                              </button>
                              <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                                Save Vital Measurements
                              </button>
                            </div>
                          </form>
                        )}
                      </div>

                      {/* Patient meta stats */}
                      <div style={{ padding: '12px', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Admission Timestamp: <strong>{new Date(bed.patient.admittedAt).toLocaleString()}</strong>
                      </div>

                      {/* Actions footer */}
                      <div className="modal-actions-bar" style={{ padding: '10px 0 0 0', borderTop: 'none' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setIsTransferring(true)}
                          style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--color-primary)', color: 'var(--color-primary)' }}
                        >
                          <ArrowLeftRight size={14} />
                          Transfer Bed
                        </button>
                        
                        <button type="button" className="btn-secondary" onClick={onClose}>
                          Close
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => {
                            onDischarge(bed.wardId, bed.id);
                            onClose();
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <LogOut size={16} />
                          Discharge Patient
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CLINICAL EHR SOAP LOGS */}
                  {activeTab === 'logs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 650, color: 'var(--text-main)' }}>Clinical Case Notes (SOAP)</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{bed.patient.clinicalLogs?.length || 0} entries</span>
                      </div>

                      {/* Logs Feed Container */}
                      <div style={{
                        maxHeight: '220px',
                        overflowY: 'auto',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '12px',
                        background: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        {(!bed.patient.clinicalLogs || bed.patient.clinicalLogs.length === 0) ? (
                          <div style={{ textAlignment: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>No clinical notes logged yet.</div>
                        ) : (
                          bed.patient.clinicalLogs.map(log => (
                            <div key={log.id} style={{
                              background: '#ffffff',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              padding: '10px',
                              fontSize: '0.82rem',
                              boxShadow: 'var(--shadow-sm)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '6px', fontWeight: 500 }}>
                                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{log.doctor}</span>
                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                              </div>
                              <div style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>{log.note}</div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Log Form */}
                      <form onSubmit={handleAddLogSubmit} className="login-form" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'end' }}>
                          <div className="form-group">
                            <label style={{ fontSize: '0.75rem' }}>Attending Doctor</label>
                            <input
                              type="text"
                              required
                              className="form-input"
                              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                              placeholder="Dr. Jenkins"
                              value={logDoctor}
                              onChange={(e) => setLogDoctor(e.target.value)}
                            />
                          </div>
                          <button type="submit" className="btn-primary" style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <PlusCircle size={14} />
                            Save Note
                          </button>
                        </div>

                        <div className="form-group" style={{ marginTop: '10px' }}>
                          <label style={{ fontSize: '0.75rem' }}>New Case Note Entry (SOAP)</label>
                          <textarea
                            required
                            className="form-input"
                            style={{ padding: '10px 12px', fontSize: '0.85rem', minHeight: '60px', fontFamily: 'inherit', resize: 'vertical' }}
                            placeholder="Describe patient status, vitals remarks, diagnostic results, or treatment modifications..."
                            value={newLogNote}
                            onChange={(e) => setNewLogNote(e.target.value)}
                          />
                        </div>
                      </form>
                    </div>
                  )}

                  {/* TAB 3: MEDICATION MAR SHEET */}
                  {activeTab === 'mar' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 650, color: 'var(--text-main)' }}>Medication Administration Record (MAR)</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Active Schedules</span>
                      </div>

                      {/* Nurse Duty Initials Stamp */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <User size={14} style={{ color: 'var(--color-primary)' }} />
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Duty Nurse Initials:</span>
                        <input
                          type="text"
                          value={nurseInitials}
                          onChange={(e) => setNurseInitials(e.target.value)}
                          style={{
                            background: 'white',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            outline: 'none',
                            width: '130px'
                          }}
                        />
                      </div>

                      {/* MAR checklist */}
                      <div style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#ffffff'
                      }}>
                        {(!bed.patient.mar || bed.patient.mar.length === 0) ? (
                          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>No medications scheduled.</div>
                        ) : (
                          bed.patient.mar.map(item => {
                            const isDone = item.status === 'administered';
                            return (
                              <div key={item.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                borderBottom: '1px solid var(--border-color)',
                                background: isDone ? 'rgba(16, 185, 129, 0.02)' : 'transparent',
                                transition: 'background 0.2s'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <input
                                    type="checkbox"
                                    checked={isDone}
                                    onChange={(e) => handleMarCheckboxChange(item.id, e.target.checked)}
                                    style={{
                                      width: '18px',
                                      height: '18px',
                                      cursor: 'pointer',
                                      accentColor: 'var(--color-success)'
                                    }}
                                  />
                                  <div>
                                    <strong style={{ fontSize: '0.85rem', color: isDone ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none' }}>
                                      {item.medName}
                                    </strong>
                                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                                      Scheduled Time: {item.time}
                                    </span>
                                  </div>
                                </div>

                                {isDone && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', background: 'var(--color-success-bg)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                                    ✓ Administered ({item.nurse})
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Add Med Form */}
                      <form onSubmit={handleAddMedSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', gap: '10px', alignItems: 'flex-end' }} className="login-form">
                        <div className="form-group" style={{ flex: '2', margin: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Schedule New Medication</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Insulin 10 units (SubQ)"
                            className="form-input"
                            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            value={newMedName}
                            onChange={(e) => setNewMedName(e.target.value)}
                          />
                        </div>

                        <div className="form-group" style={{ flex: '1', margin: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Scheduled Time</label>
                          <select
                            className="select-filter"
                            style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                            value={newMedTime}
                            onChange={(e) => setNewMedTime(e.target.value)}
                          >
                            <option value="06:00 AM">06:00 AM</option>
                            <option value="08:00 AM">08:00 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                            <option value="06:00 PM">06:00 PM</option>
                            <option value="08:00 PM">08:00 PM</option>
                            <option value="10:00 PM">10:00 PM</option>
                            <option value="12:00 AM">12:00 AM (Midnight)</option>
                          </select>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: 'auto', height: '36px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '0 16px' }}>
                          <PlusCircle size={14} />
                          Add Schedule
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          {bed.status === 'maintenance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '20px 0' }}>
              <span style={{ fontSize: '3rem' }}>🛠️</span>
              <h3 style={{ color: 'var(--color-warning)' }}>Bed Under Maintenance</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', maxWidth: '320px' }}>
                This bed is offline for routine sanitization, repairs, or inspections.
              </p>

              <div className="modal-actions-bar" style={{ padding: '10px 0 0 0', borderTop: 'none', width: '100%', justifyContent: 'center', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: 'auto', background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)', boxShadow: 'none' }}
                  onClick={() => {
                    onSetMaintenance(bed.wardId, bed.id, false);
                    onClose();
                  }}
                >
                  Release to Service (Vacant)
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
