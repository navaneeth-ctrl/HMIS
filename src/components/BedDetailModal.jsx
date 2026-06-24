import React, { useState, useEffect } from 'react';
import { X, Heart, Thermometer, ShieldAlert, CheckCircle, Activity, UserPlus, LogOut, Check, Info, Settings, ArrowLeftRight } from 'lucide-react';

export default function BedDetailModal({ bed, wardName, onClose, onAdmit, onDischarge, onUpdateVitals, onSetMaintenance, onTransfer, beds, wards }) {
  if (!bed) return null;

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
  }, [bed]);

  // Reset transfer bed selection when ward changes
  useEffect(() => {
    if (vacantBedsInTargetWard.length > 0) {
      setTransferBedId(vacantBedsInTargetWard[0].id);
    } else {
      setTransferBedId('');
    }
  }, [transferWardId, bed]); // trigger when ward changes or modal updates

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
      <div className="modal-content-panel" onClick={(e) => e.stopPropagation()}>
        
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

        {/* Dynamic Modal Body depending on Status */}
        <div className="modal-body">
          {bed.status === 'vacant' && (
            <form onSubmit={handleAdmitSubmit} className="login-form">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--color-success-bg)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '8px', fontSize: '0.8rem', color: '#047857' }}>
                <CheckCircle size={16} />
                <span>Bed is currently vacant. Please complete the intake form to admit a patient.</span>
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
                  {/* Patient Badge summary */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{bed.patient.name}</h2>
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
                        Live Vitals Monitoring
                      </span>

                      <button
                        onClick={() => setIsEditingVitals(!isEditingVitals)}
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Settings size={12} />
                        {isEditingVitals ? 'View Vitals' : 'Update Vitals'}
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
                </>
              )}

            </div>
          )}

          {bed.status === 'maintenance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '20px 0' }}>
              <span style={{ fontSize: '3rem' }}>🛠️</span>
              <h3 style={{ color: 'var(--color-warning)' }}>Bed Under Maintenance</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', maxWidth: '320px' }}>
                This bed is currently offline for routine disinfection, general repairs, or system checkups.
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
