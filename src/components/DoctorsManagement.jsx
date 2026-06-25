import React, { useState } from 'react';
import { Users, UserPlus, ShieldAlert, Award, FileText, ClipboardList, PlusCircle, CheckCircle, Bell, ArrowRight, User } from 'lucide-react';

export default function DoctorsManagement({
  beds,
  doctors,
  doctorAlerts,
  registerDoctor,
  clearDoctorAlert,
  onAddCharge,
  wards
}) {
  const [activeSubTab, setActiveSubTab] = useState('roster'); // roster, portal
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  
  // Registration Form State
  const [docName, setDocName] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('General Medicine');

  // Prescription Form State
  const [prescribingPatientId, setPrescribingPatientId] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Diagnostics');
  const [serviceCost, setServiceCost] = useState('');

  // Find selected doctor
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  // Compute patients for each doctor dynamically
  const getActivePatientsForDoctor = (doctorName) => {
    return Object.values(beds)
      .filter(bed => bed.status === 'occupied' && bed.patient && bed.patient.doctor === doctorName)
      .map(bed => ({
        ...bed.patient,
        bedId: bed.id,
        wardId: bed.wardId,
        wardName: wards.find(w => w.id === bed.wardId)?.shortName || bed.wardId
      }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!docName.trim() || !docSpecialization.trim()) return;
    registerDoctor(docName.trim(), docSpecialization.trim());
    setDocName('');
    setDocSpecialization('General Medicine');
  };

  const handlePrescriptionSubmit = (e) => {
    e.preventDefault();
    if (!prescribingPatientId || !serviceName.trim() || !serviceCost) return;

    onAddCharge(prescribingPatientId, {
      desc: serviceName.trim(),
      category: serviceCategory,
      cost: parseInt(serviceCost),
      qty: 1,
      prescribedBy: selectedDoctorId,
      status: 'pending'
    });

    setServiceName('');
    setServiceCost('');
    setPrescribingPatientId(null);
  };

  const activePatients = selectedDoctor ? getActivePatientsForDoctor(selectedDoctor.name) : [];
  const currentDoctorAlerts = doctorAlerts.filter(alert => alert.doctorId === selectedDoctorId);

  return (
    <div className="dashboard-content">
      {/* Sub Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '20px' }}>
        <button
          onClick={() => setActiveSubTab('roster')}
          style={{
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'roster' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeSubTab === 'roster' ? 'var(--color-primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={18} />
          Doctors Roster & Register
        </button>
        <button
          onClick={() => {
            setActiveSubTab('portal');
            if (!selectedDoctorId && doctors.length > 0) {
              setSelectedDoctorId(doctors[0].id);
            }
          }}
          style={{
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'portal' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeSubTab === 'portal' ? 'var(--color-primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Award size={18} />
          Doctor Workspace Portal
        </button>
      </div>

      {activeSubTab === 'roster' && (
        <div className="dashboard-grid-2col" style={{ gridTemplateColumns: '1.8fr 1.2fr', gap: '24px' }}>
          {/* Roster List */}
          <div className="dashboard-panel">
            <h3 className="panel-title">
              <Users size={20} style={{ color: 'var(--color-primary)' }} />
              Registered Medical Practitioners
            </h3>
            
            <div className="table-wrapper" style={{ marginTop: '16px' }}>
              <table className="hmis-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Department / Specialty</th>
                    <th style={{ textAlign: 'center' }}>Active Patients</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doc => {
                    const patientsCount = getActivePatientsForDoctor(doc.name).length;
                    return (
                      <tr key={doc.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
                              DR
                            </div>
                            <span style={{ fontWeight: 650 }}>{doc.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge priority-low" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>
                            {doc.specialization}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          {patientsCount > 0 ? (
                            <span style={{ color: 'var(--color-danger)' }}>{patientsCount}</span>
                          ) : (
                            <span style={{ color: 'var(--text-dim)' }}>0</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setSelectedDoctorId(doc.id);
                              setActiveSubTab('portal');
                            }}
                            className="btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            Open Portal <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registration Form */}
          <div className="dashboard-panel">
            <h3 className="panel-title">
              <UserPlus size={20} style={{ color: 'var(--color-success)' }} />
              Register New Doctor
            </h3>
            
            <form onSubmit={handleRegisterSubmit} className="login-form" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Doctor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Conan"
                  className="form-input"
                  style={{ paddingLeft: '12px' }}
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Department / Specialty ("watsort")</label>
                <select
                  className="select-filter"
                  style={{ width: '100%', padding: '12px' }}
                  value={docSpecialization}
                  onChange={(e) => setDocSpecialization(e.target.value)}
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Intensive Care">Intensive Care</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Emergency Room">Emergency Room</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Maternity">Maternity</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)', boxShadow: 'none' }}>
                <UserPlus size={16} />
                Register Practitioner
              </button>
            </form>
          </div>
        </div>
      )}

      {activeSubTab === 'portal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Doctor Selector */}
          <div className="dashboard-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontWeight: 650, color: 'var(--text-muted)' }}>Select Doctor Profile:</span>
              <select
                className="select-filter"
                style={{ padding: '8px 16px', fontSize: '0.9rem', fontWeight: 600 }}
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                ))}
              </select>
            </div>

            {selectedDoctor && (
              <span className="badge status-occupied" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                Current Practitioner: {selectedDoctor.name} ({selectedDoctor.specialization})
              </span>
            )}
          </div>

          {selectedDoctor && (
            <div className="dashboard-grid-2col" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              
              {/* Doctor Patients List */}
              <div className="dashboard-panel">
                <h3 className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={18} style={{ color: 'var(--color-primary)' }} />
                    Patients Designated to Me
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{activePatients.length} Active Patients</span>
                </h3>

                {activePatients.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    <CheckCircle size={36} style={{ color: 'var(--color-success)', marginBottom: '12px', opacity: 0.6 }} />
                    No active inpatients are currently designated to you.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    {activePatients.map(patient => {
                      const charges = patient.billing?.charges || [];
                      const doctorCharges = charges.filter(c => c.prescribedBy === selectedDoctorId);

                      return (
                        <div key={patient.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {/* Header info */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{patient.name}</h4>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {patient.age} yrs / {patient.gender} • Diagnosis: <strong>{patient.ailment}</strong>
                              </span>
                            </div>
                            <span className="badge status-occupied" style={{ height: 'fit-content', fontSize: '0.72rem' }}>
                              📍 {patient.wardName} - Bed {patient.bedId}
                            </span>
                          </div>

                          {/* Telemetry quick view */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                            <div>HR: <strong style={{ color: patient.vitals.status === 'danger' ? 'var(--color-danger)' : 'var(--text-main)' }}>{patient.vitals.heartRate} bpm</strong></div>
                            <div>BP: <strong>{patient.vitals.bloodPressure}</strong></div>
                            <div>SpO2: <strong style={{ color: patient.vitals.status === 'danger' ? 'var(--color-danger)' : 'var(--text-main)' }}>{patient.vitals.spo2}%</strong></div>
                            <div>Temp: <strong>{patient.vitals.temperature}°F</strong></div>
                          </div>

                          {/* Prescribed tests checklist / Billing status */}
                          {doctorCharges.length > 0 && (
                            <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '10px' }}>
                              <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Ordered Services & Payments</span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {doctorCharges.map(charge => (
                                  <div key={charge.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', padding: '4px 0', borderBottom: '1px dotted var(--border-color)' }}>
                                    <span>{charge.desc} (₹{charge.cost})</span>
                                    {charge.status === 'paid' ? (
                                      <span style={{ color: 'var(--color-success)', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                        ✓ Paid / Settle
                                      </span>
                                    ) : (
                                      <span style={{ color: 'var(--color-warning)', fontWeight: 650 }}>
                                        Pending Payment
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div>
                            {prescribingPatientId === patient.id ? (
                              <form onSubmit={handlePrescriptionSubmit} style={{ marginTop: '10px', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-primary-bg)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <h5 style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-primary)' }}>Prescribe Service / Procedure</h5>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. Chest X-Ray, Blood Test, Knee MRI"
                                    className="form-input"
                                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                    value={serviceName}
                                    onChange={(e) => setServiceName(e.target.value)}
                                  />
                                  <input
                                    type="number"
                                    required
                                    placeholder="Cost (₹)"
                                    className="form-input"
                                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                    value={serviceCost}
                                    onChange={(e) => setServiceCost(e.target.value)}
                                  />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <select
                                    className="select-filter"
                                    style={{ padding: '4px 8px', fontSize: '0.8rem', flex: 1 }}
                                    value={serviceCategory}
                                    onChange={(e) => setServiceCategory(e.target.value)}
                                  >
                                    <option value="Diagnostics">Diagnostics / Lab</option>
                                    <option value="Procedure">Procedure</option>
                                    <option value="Pharmacy">Pharmacy</option>
                                    <option value="Consultation">Consultation</option>
                                  </select>
                                  <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '4px 12px', fontSize: '0.8rem' }}>
                                    Confirm Order
                                  </button>
                                  <button type="button" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setPrescribingPatientId(null)}>
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <button
                                onClick={() => setPrescribingPatientId(patient.id)}
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                              >
                                <PlusCircle size={14} />
                                Prescribe / Order Service
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Doctor Alerts Desk */}
              <div className="dashboard-panel" style={{ alignSelf: 'flex-start' }}>
                <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={18} style={{ color: 'var(--color-danger)' }} />
                  Workspace Alerts Desk
                </h3>

                {currentDoctorAlerts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                    No pending alerts. You will be notified here when patients settle billing for your ordered prescriptions.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                    {currentDoctorAlerts.map(alert => (
                      <div key={alert.id} style={{ background: 'var(--color-success-bg)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#047857' }}>
                          <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ fontWeight: 600, lineHeight: '1.4' }}>{alert.message}</span>
                        </div>
                        <button
                          onClick={() => clearDoctorAlert(alert.id)}
                          className="btn-primary"
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            width: 'fit-content',
                            background: 'var(--color-success)',
                            boxShadow: 'none',
                            alignSelf: 'flex-end',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircle size={12} />
                          Acknowledge & Proceed
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
