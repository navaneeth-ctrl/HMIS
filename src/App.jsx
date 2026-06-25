import React, { useState, useEffect } from 'react';
import { useHMISData } from './hooks/useHMISData';
import AdminLogin from './components/AdminLogin';
import DashboardOverview from './components/DashboardOverview';
import BedMonitoring from './components/BedMonitoring';
import BedDetailModal from './components/BedDetailModal';
import PatientRegistry from './components/PatientRegistry';
import WardManagement from './components/WardManagement';
import BillingSystem from './components/BillingSystem';
import DoctorsManagement from './components/DoctorsManagement';
import { 
  Activity, 
  LayoutDashboard, 
  BedDouble, 
  Users, 
  LogOut, 
  Clock, 
  Bell, 
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  Info,
  CheckCircle,
  X,
  Hospital,
  IndianRupee,
  ShieldAlert,
  Volume2,
  Send,
  Check
} from 'lucide-react';

// Random mock data lists for the Emergency Admissions simulator
const SIM_NAMES = [
  'Tony Stark', 'Thor Odinson', 'Natasha Romanoff', 'Clint Barton', 
  'Barry Allen', 'Hal Jordan', 'Clark Kent', 'Lois Lane', 'Selina Kyle',
  'Luke Skywalker', 'Leia Organa', 'Han Solo', 'Anakin Skywalker'
];
const SIM_AILMENTS = [
  'Acute Chest Pain', 'Severe Breathing Difficulty', 'Trauma - Motor Accident', 
  'Suspected Stroke', 'Hypertensive Emergency', 'High Grade Fever with Rigors'
];
const SIM_DOCTORS = [
  'Dr. Sarah Jenkins', 'Dr. Stephen Strange', 'Dr. Alfred Penny', 
  'Dr. Otto Octavius', 'Dr. David Tennant', 'Dr. Helen Cho'
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('hmis_logged_in') === 'true';
  });
  
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, beds, patients, wards, billing
  const [selectedBedKey, setSelectedBedKey] = useState(null);
  const [selectedBillingPatientId, setSelectedBillingPatientId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [timeString, setTimeString] = useState('');
  
  // Alarms center drawer visibility
  const [showAlarmsDrawer, setShowAlarmsDrawer] = useState(false);
  const [customPagerMessage, setCustomPagerMessage] = useState('');
  const [pagingAlarmId, setPagingAlarmId] = useState(null);

  // HMIS Data Hook
  const hmis = useHMISData();
  const statistics = hmis.getStatistics();

  // Handle Real-Time Clock
  useEffect(() => {
    const updateTime = () => {
      const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      };
      setTimeString(new Date().toLocaleDateString('en-US', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync login status
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('hmis_logged_in', 'true');
    addToast('Admin Login Successful', 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('hmis_logged_in', 'false');
  };

  // Toast System
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Intake / Discharge hooks wrapped with Toast feedback
  const handleAdmit = (wardId, bedId, patientData) => {
    hmis.admitPatient(wardId, bedId, patientData);
    addToast(`Patient ${patientData.name} admitted successfully to Bed ${bedId}.`, 'success');
  };

  const handleDischarge = (wardId, bedId) => {
    const key = `${wardId}-${bedId}`;
    const name = hmis.beds[key]?.patient?.name || 'Patient';
    hmis.dischargePatient(wardId, bedId);
    addToast(`Patient ${name} discharged from Bed ${bedId}. Bill archived.`, 'info');
  };

  const handleUpdateVitals = (wardId, bedId, vitals) => {
    hmis.updateVitals(wardId, bedId, vitals);
    
    // Check vital safety
    const hr = parseInt(vitals.heartRate);
    const spo2 = parseInt(vitals.spo2);
    const temp = parseFloat(vitals.temperature);
    let alertType = 'success';
    let message = `Vitals updated for Bed ${bedId}.`;

    if (hr < 50 || hr > 120 || spo2 < 90 || temp > 102) {
      alertType = 'danger';
      message = `CRITICAL TELEMETRY ALERT: Bed ${bedId} vitals entered danger limits! Alarm logged in desk.`;
    } else if (hr < 60 || hr > 100 || spo2 < 94 || temp > 99.5) {
      alertType = 'warning';
      message = `Warning: Bed ${bedId} vitals showing abnormal thresholds. Alarm logged.`;
    }

    addToast(message, alertType);
  };

  const handleSetMaintenance = (wardId, bedId, isMaint) => {
    hmis.setBedMaintenance(wardId, bedId, isMaint);
    const msg = isMaint ? `Bed ${bedId} placed under maintenance.` : `Bed ${bedId} released and ready for occupancy.`;
    addToast(msg, isMaint ? 'warning' : 'success');
  };

  // Patient Ward Transfer Coordinator
  const handleTransferPatient = (fromWardId, fromBedId, toWardId, toBedId) => {
    const fromKey = `${fromWardId}-${fromBedId}`;
    const patientName = hmis.beds[fromKey]?.patient?.name || 'Patient';
    
    const success = hmis.transferPatient(fromWardId, fromBedId, toWardId, toBedId);
    if (success) {
      const fromShort = hmis.wards.find(w => w.id === fromWardId)?.shortName || fromWardId;
      const toShort = hmis.wards.find(w => w.id === toWardId)?.shortName || toWardId;
      addToast(`Patient ${patientName} successfully transferred to ${toShort} Bed ${toBedId}.`, 'success');
    } else {
      addToast('Transfer Failed: Selection bed is occupied or offline.', 'danger');
    }
  };

  // Locator Callback from Directory/Alerts
  const handleLocatePatientBed = (wardId, bedId) => {
    setCurrentView('beds');
    setSelectedBedKey(`${wardId}-${bedId}`);
  };

  // Quick jump from Patient Registry to their Billing invoice
  const handleViewPatientBill = (patientId) => {
    setSelectedBillingPatientId(patientId);
    setCurrentView('billing');
  };

  // Simulator: Emergency Admission
  const handleSimulateAdmit = () => {
    const vacantBeds = Object.values(hmis.beds).filter(b => b.status === 'vacant');
    if (vacantBeds.length === 0) {
      addToast('Simulation Error: All beds are currently occupied!', 'danger');
      return;
    }

    const targetBed = vacantBeds[Math.floor(Math.random() * vacantBeds.length)];
    const randomName = SIM_NAMES[Math.floor(Math.random() * SIM_NAMES.length)];
    const randomAilment = SIM_AILMENTS[Math.floor(Math.random() * SIM_AILMENTS.length)];
    const randomDoctor = SIM_DOCTORS[Math.floor(Math.random() * SIM_DOCTORS.length)];
    const randomAge = Math.floor(18 + Math.random() * 70);
    const randomPriority = Math.random() > 0.6 ? 'high' : (Math.random() > 0.3 ? 'medium' : 'low');

    handleAdmit(targetBed.wardId, targetBed.id, {
      name: randomName,
      age: randomAge,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      ailment: randomAilment,
      doctor: randomDoctor,
      priority: randomPriority
    });
  };

  // Simulator: Random Vitals Shift (warning / danger)
  const handleSimulateVitalsShift = () => {
    const occupiedBeds = Object.values(hmis.beds).filter(b => b.status === 'occupied' && b.patient);
    if (occupiedBeds.length === 0) {
      addToast('Simulation Error: No active patients to shift vitals!', 'warning');
      return;
    }

    const targetBed = occupiedBeds[Math.floor(Math.random() * occupiedBeds.length)];
    const criticalType = Math.random() > 0.4 ? 'danger' : 'warning';
    
    let badVitals = {};
    if (criticalType === 'danger') {
      badVitals = {
        heartRate: Math.random() > 0.5 ? 134 : 45,
        bloodPressure: Math.random() > 0.5 ? '165/110' : '85/50',
        spo2: Math.floor(82 + Math.random() * 7), // critical hypoxia
        temperature: parseFloat((102.5 + Math.random() * 2).toFixed(1))
      };
    } else {
      badVitals = {
        heartRate: 104,
        bloodPressure: '135/88',
        spo2: 93,
        temperature: 99.8
      };
    }

    handleUpdateVitals(targetBed.wardId, targetBed.id, badVitals);
  };

  const handlePageSubmit = (alarm) => {
    if (!customPagerMessage.trim()) return;
    const docName = hmis.staff[alarm.wardId]?.doctor || 'Duty Physician';
    hmis.pageStaff(alarm.wardId, docName, customPagerMessage.trim());
    addToast(`Pager alert dispatched to ${docName}`, 'success');
    setCustomPagerMessage('');
    setPagingAlarmId(null);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const selectedBed = selectedBedKey ? hmis.beds[selectedBedKey] : null;
  const selectedBedWardName = selectedBed 
    ? hmis.wards.find(w => w.id === selectedBed.wardId)?.name 
    : '';

  const activeAlarms = hmis.alarms.filter(a => !a.resolved);
  const resolvedAlarms = hmis.alarms.filter(a => a.resolved);

  return (
    <div className="hmis-container">
      {/* Sidebar Layout */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">
            <Activity size={24} style={{ color: 'var(--color-primary)' }} />
            CareFlow HMIS
          </div>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button 
            className={`sidebar-item ${currentView === 'wards' ? 'active' : ''}`}
            onClick={() => setCurrentView('wards')}
          >
            <Hospital size={18} />
            <span>Ward Management</span>
          </button>
          
          <button 
            className={`sidebar-item ${currentView === 'beds' ? 'active' : ''}`}
            onClick={() => setCurrentView('beds')}
          >
            <BedDouble size={18} />
            <span>Bed Monitoring</span>
          </button>
          
          <button 
            className={`sidebar-item ${currentView === 'patients' ? 'active' : ''}`}
            onClick={() => setCurrentView('patients')}
          >
            <Users size={18} />
            <span>Patient Registry</span>
          </button>

          <button 
            className={`sidebar-item ${currentView === 'doctors' ? 'active' : ''}`}
            onClick={() => setCurrentView('doctors')}
          >
            <Users size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Doctors & Portal</span>
          </button>

          <button 
            className={`sidebar-item ${currentView === 'billing' ? 'active' : ''}`}
            onClick={() => setCurrentView('billing')}
          >
            <IndianRupee size={18} />
            <span>Billing Ledger</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">AD</div>
            <div className="user-info">
              <span className="user-name">Clinical Admin</span>
              <span className="user-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} style={{ color: 'var(--color-success)' }} />
                Authorized
              </span>
            </div>
          </div>
          
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Page Viewport */}
      <main className="main-viewport">
        {/* Navigation Top Header */}
        <header className="top-header">
          <div className="header-title-area">
            <h2 style={{ textTransform: 'capitalize' }}>
              {currentView === 'dashboard' ? 'Overview Dashboard' : currentView === 'beds' ? 'Bed Allocation Map' : currentView === 'patients' ? 'Inpatient Directory' : currentView === 'wards' ? 'Ward Coordinator' : currentView === 'doctors' ? 'Doctors & Workspace' : 'Patient Billing Ledger'}
            </h2>
          </div>

          <div className="header-actions">
            <div className="realtime-clock" title="Hospital Standard Time">
              <Clock size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
              {timeString || 'Loading clock...'}
            </div>

            <button 
              className="notification-bell-btn" 
              title={`${activeAlarms.length} active telemetry alerts`}
              onClick={() => setShowAlarmsDrawer(true)}
              style={{ position: 'relative' }}
            >
              <Bell size={18} />
              {activeAlarms.length > 0 && <span className="bell-badge" style={{ background: 'var(--color-danger)', border: '2px solid white' }} />}
            </button>
          </div>
        </header>

        {/* View Router */}
        {currentView === 'dashboard' && (
          <DashboardOverview 
            stats={statistics} 
            activities={hmis.activities}
            onNavigate={setCurrentView}
            onSimulateAdmit={handleSimulateAdmit}
            onSimulateVitals={handleSimulateVitalsShift}
          />
        )}

        {currentView === 'beds' && (
          <BedMonitoring 
            wards={hmis.wards} 
            beds={hmis.beds} 
            onSelectBed={(wardId, bedId) => setSelectedBedKey(`${wardId}-${bedId}`)}
          />
        )}

        {currentView === 'patients' && (
          <PatientRegistry 
            beds={hmis.beds} 
            wards={hmis.wards}
            onLocatePatientBed={handleLocatePatientBed}
            onDischargePatient={hmis.dischargePatient}
            onViewBill={handleViewPatientBill}
          />
        )}

        {currentView === 'wards' && (
          <WardManagement 
            wards={hmis.wards}
            beds={hmis.beds}
            staff={hmis.staff}
            onAssignStaff={hmis.assignStaffToWard}
            onBulkStatusChange={hmis.bulkSetWardBedStatus}
          />
        )}

        {currentView === 'billing' && (
          <BillingSystem
            beds={hmis.beds}
            dischargedPatients={hmis.dischargedPatients}
            wards={hmis.wards}
            onAddCharge={hmis.addBillingCharge}
            onRecordPayment={hmis.recordPatientPayment}
            initialPatientId={selectedBillingPatientId}
            onInitialPatientConsumed={() => setSelectedBillingPatientId(null)}
            onSettleCharge={hmis.settleBillingCharge}
          />
        )}

        {currentView === 'doctors' && (
          <DoctorsManagement
            beds={hmis.beds}
            doctors={hmis.doctors}
            doctorAlerts={hmis.doctorAlerts}
            registerDoctor={hmis.registerDoctor}
            clearDoctorAlert={hmis.clearDoctorAlert}
            onAddCharge={hmis.addBillingCharge}
            wards={hmis.wards}
          />
        )}

        {/* Floating Bed Detail modal drawer */}
        {selectedBedKey && (
          <BedDetailModal 
            bed={selectedBed}
            wardName={selectedBedWardName}
            onClose={() => setSelectedBedKey(null)}
            onAdmit={handleAdmit}
            onDischarge={handleDischarge}
            onUpdateVitals={handleUpdateVitals}
            onSetMaintenance={handleSetMaintenance}
            onTransfer={handleTransferPatient}
            onAddClinicalLog={hmis.addClinicalLog}
            onToggleMedication={hmis.toggleMedicationAdministered}
            onAddMedication={hmis.addPatientMedication}
            beds={hmis.beds}
            wards={hmis.wards}
            doctors={hmis.doctors}
          />
        )}

        {/* Central Telemetry Alarm Desk Drawer */}
        {showAlarmsDrawer && (
          <div className="alarms-drawer-overlay" onClick={() => setShowAlarmsDrawer(false)}>
            <div className="alarms-drawer" onClick={(e) => e.stopPropagation()}>
              
              <div className="alarms-drawer-header">
                <div>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
                    <ShieldAlert size={20} style={{ color: 'var(--color-danger)' }} />
                    Telemetry Alarm Desk
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Monitor clinical threshold alerts ({activeAlarms.length} active)
                  </span>
                </div>
                <button 
                  onClick={() => setShowAlarmsDrawer(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="alarms-drawer-content">
                {hmis.alarms.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                    <CheckCircle size={32} style={{ color: 'var(--color-success)', marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.85rem' }}>No clinical alerts active in the system.</p>
                  </div>
                ) : (
                  <>
                    {/* Active Alarm Section */}
                    {activeAlarms.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-danger)', letterSpacing: '0.05em', marginBottom: '10px', fontWeight: 700 }}>
                          🚨 Active Alarms ({activeAlarms.length})
                        </h4>
                        
                        <div style={{ display: 'flex', flexParagraph: 'column', flexDirection: 'column', gap: '12px' }}>
                          {activeAlarms.map(alarm => (
                            <div key={alarm.id} className={`alarm-card-item ${alarm.severity}`}>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{alarm.patientName}</strong>
                                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {alarm.wardName} • Bed {alarm.bedId}
                                  </span>
                                </div>
                                <span className={`badge priority-${alarm.severity === 'danger' ? 'high' : 'medium'}`} style={{ fontSize: '0.65rem' }}>
                                  {alarm.severity.toUpperCase()}
                                </span>
                              </div>

                              <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                                {alarm.message}
                              </p>

                              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                                Triggered: {new Date(alarm.timestamp).toLocaleTimeString()}
                              </span>

                              {pagingAlarmId === alarm.id ? (
                                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '6px' }} className="animate-fade-in">
                                  <label style={{ fontSize: '0.7rem', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Custom Pager Message</label>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <input
                                      type="text"
                                      placeholder="e.g. Critical Vitals, request emergency check"
                                      value={customPagerMessage}
                                      onChange={(e) => setCustomPagerMessage(e.target.value)}
                                      style={{
                                        flex: 1,
                                        padding: '4px 8px',
                                        fontSize: '0.75rem',
                                        borderRadius: '4px',
                                        border: '1px solid var(--border-color)',
                                        outline: 'none'
                                      }}
                                    />
                                    <button 
                                      onClick={() => handlePageSubmit(alarm)}
                                      className="btn-primary" 
                                      style={{ width: 'auto', padding: '0 8px', height: '28px' }}
                                    >
                                      <Send size={12} />
                                    </button>
                                  </div>
                                </div>
                              ) : null}

                              <div className="alarm-card-actions">
                                <button
                                  onClick={() => {
                                    handleLocatePatientBed(alarm.wardId, alarm.bedId);
                                    setShowAlarmsDrawer(false);
                                  }}
                                  className="btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                >
                                  🔍 Inspect Bed
                                </button>
                                <button
                                  onClick={() => setPagingAlarmId(pagingAlarmId === alarm.id ? null : alarm.id)}
                                  className="btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Volume2 size={12} />
                                  Page Doctor
                                </button>
                                <button
                                  onClick={() => hmis.resolveAlarm(alarm.id)}
                                  className="btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto', background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)', boxShadow: 'none' }}
                                >
                                  Resolve
                                </button>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resolved History Section */}
                    {resolvedAlarms.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em', marginBottom: '10px', fontWeight: 700 }}>
                          ✓ Resolved Log ({resolvedAlarms.length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {resolvedAlarms.slice(0, 5).map(alarm => (
                            <div key={alarm.id} className="alarm-card-item resolved" style={{ padding: '10px 14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <strong>{alarm.patientName} (Bed {alarm.bedId})</strong>
                                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Cleared</span>
                              </div>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                                {alarm.message}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Bottom Right Floating Toasts Container */}
        <div className="toast-container">
          {toasts.map(toast => {
            let icon = <Info size={16} />;
            let cssClass = '';
            
            if (toast.type === 'success') {
              icon = <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />;
              cssClass = 'success';
            } else if (toast.type === 'warning') {
              icon = <AlertOctagon size={16} style={{ color: 'var(--color-warning)' }} />;
              cssClass = 'warning';
            } else if (toast.type === 'danger') {
              icon = <AlertOctagon size={16} style={{ color: 'var(--color-danger)' }} />;
              cssClass = 'danger';
            }

            return (
              <div key={toast.id} className={`toast-message ${cssClass}`}>
                {icon}
                <div style={{ flex: 1, paddingRight: '10px' }}>{toast.message}</div>
                <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
