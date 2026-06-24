import { useState, useEffect } from 'react';

const WARDS = [
  { id: 'icu', name: 'Intensive Care Unit (ICU)', shortName: 'ICU' },
  { id: 'gen_a', name: 'General Ward A', shortName: 'Gen A' },
  { id: 'gen_b', name: 'General Ward B', shortName: 'Gen B' },
  { id: 'peds', name: 'Pediatric Ward', shortName: 'Peds' },
  { id: 'er', name: 'Emergency Room (ER)', shortName: 'ER' }
];

const INITIAL_ACTIVITIES = [
  { id: 'act-1', text: 'Patient Clara Oswald admitted to ICU Bed B3', time: '10 mins ago', type: 'admission' },
  { id: 'act-2', text: 'Bed C5 in ICU placed under Maintenance (Routine sanitization)', time: '25 mins ago', type: 'maintenance' },
  { id: 'act-3', text: 'Patient Bruce Wayne vitals updated in Gen A Bed A2', time: '1 hour ago', type: 'update' },
  { id: 'act-4', text: 'Patient Diana Prince discharged from ER Bed E2', time: '2 hours ago', type: 'discharge' },
  { id: 'act-5', text: 'Patient Peter Parker admitted to Gen A Bed D1', time: '3 hours ago', type: 'admission' }
];

const DEFAULT_STAFF = {
  icu: { doctor: 'Dr. Sarah Jenkins', nurse: 'Nurse Ratched' },
  gen_a: { doctor: 'Dr. Alfred Penny', nurse: 'Nurse Joy' },
  gen_b: { doctor: 'Dr. Stephen Strange', nurse: 'Nurse Nightingale' },
  peds: { doctor: 'Dr. Helen Cho', nurse: 'Nurse Abby' },
  er: { doctor: 'Dr. Peggy Carter', nurse: 'Nurse Clara' }
};

const WARD_RATES = {
  icu: 1500,
  er: 1000,
  gen_a: 500,
  gen_b: 500,
  peds: 600
};

const ROW_LABELS = ['A', 'B', 'C', 'D', 'E']; // 5 rows
const COL_COUNT = 6; // 6 columns = 30 beds per ward

// Helper to generate seed patient data with billing details (Rupees, under 10k)
const getSeedPatients = () => ({
  'icu-B3': {
    id: 'P-5021',
    name: 'Clara Oswald',
    age: 28,
    gender: 'Female',
    ailment: 'Acute Asthma Attack',
    doctor: 'Dr. David Tennant',
    priority: 'high',
    admittedAt: new Date(Date.now() - 600000).toISOString(), // 10m ago
    vitals: { heartRate: 94, bloodPressure: '115/78', spo2: 91, temperature: 98.4, status: 'warning' },
    billing: {
      baseRate: 1500,
      amountPaid: 2000,
      charges: [
        { id: 'chg-consult', desc: 'Attending Physician Consultation', category: 'Consultation', cost: 500, qty: 1 },
        { id: 'chg-oxy', desc: 'Oxygen Inhalation Therapy', category: 'Treatment', cost: 450, qty: 1 },
        { id: 'chg-neb', desc: 'Nebulization Treatment', category: 'Treatment', cost: 250, qty: 1 },
        { id: 'chg-med1', desc: 'Salbutamol Inhaler & Spacer', category: 'Pharmacy', cost: 350, qty: 1 }
      ]
    }
  },
  'icu-A1': {
    id: 'P-5022',
    name: 'Arthur Pendragon',
    age: 45,
    gender: 'Male',
    ailment: 'Congestive Heart Failure',
    doctor: 'Dr. Sarah Jenkins',
    priority: 'high',
    admittedAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h ago
    vitals: { heartRate: 112, bloodPressure: '142/95', spo2: 93, temperature: 99.1, status: 'danger' },
    billing: {
      baseRate: 1500,
      amountPaid: 3500,
      charges: [
        { id: 'chg-consult', desc: 'Attending Physician Consultation', category: 'Consultation', cost: 500, qty: 1 },
        { id: 'chg-ecg', desc: 'Electrocardiogram (ECG)', category: 'Diagnostics', stroke: 'Test', cost: 450, qty: 1 },
        { id: 'chg-echo', desc: 'Transthoracic Echocardiogram', category: 'Diagnostics', cost: 1200, qty: 1 },
        { id: 'chg-med1', desc: 'Diuretics & Vasodilators IV', category: 'Pharmacy', cost: 650, qty: 1 }
      ]
    }
  },
  'gen_a-A2': {
    id: 'P-3011',
    name: 'Bruce Wayne',
    age: 38,
    gender: 'Male',
    ailment: 'Rib Fractures & Contusions',
    doctor: 'Dr. Alfred Penny',
    priority: 'medium',
    admittedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24h ago
    vitals: { heartRate: 68, bloodPressure: '118/75', spo2: 99, temperature: 98.2, status: 'normal' },
    billing: {
      baseRate: 500,
      amountPaid: 1500,
      charges: [
        { id: 'chg-consult', desc: 'Attending Physician Consultation', category: 'Consultation', cost: 500, qty: 1 },
        { id: 'chg-xray', desc: 'Chest X-Ray (PA View)', category: 'Diagnostics', cost: 600, qty: 1 },
        { id: 'chg-wrap', desc: 'Rib Splinting & Compression Bandage', category: 'Procedure', cost: 400, qty: 1 },
        { id: 'chg-med1', desc: 'Analgesics & NSAIDs (Oral)', category: 'Pharmacy', cost: 250, qty: 1 }
      ]
    }
  },
  'gen_a-D1': {
    id: 'P-3012',
    name: 'Peter Parker',
    age: 19,
    gender: 'Male',
    ailment: 'Severe Dehydration',
    doctor: 'Dr. Otto Octavius',
    priority: 'low',
    admittedAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3h ago
    vitals: { heartRate: 75, bloodPressure: '120/80', spo2: 98, temperature: 98.8, status: 'normal' },
    billing: {
      baseRate: 500,
      amountPaid: 1000,
      charges: [
        { id: 'chg-consult', desc: 'Attending Physician Consultation', category: 'Consultation', cost: 500, qty: 1 },
        { id: 'chg-cbc', desc: 'Complete Blood Count (CBC)', category: 'Diagnostics', cost: 250, qty: 1 },
        { id: 'chg-iv', desc: 'IV Normal Saline Infusion (2L)', category: 'Treatment', cost: 400, qty: 1 },
        { id: 'chg-med1', desc: 'Multivitamin Infusions', category: 'Pharmacy', cost: 180, qty: 1 }
      ]
    }
  },
  'gen_b-B2': {
    id: 'P-4015',
    name: 'Wanda Maximoff',
    age: 31,
    gender: 'Female',
    ailment: 'Post-operative Recovery',
    doctor: 'Dr. Stephen Strange',
    priority: 'medium',
    admittedAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8h ago
    vitals: { heartRate: 82, bloodPressure: '125/82', spo2: 97, temperature: 98.6, status: 'normal' },
    billing: {
      baseRate: 500,
      amountPaid: 2000,
      charges: [
        { id: 'chg-consult', desc: 'Attending Physician Consultation', category: 'Consultation', cost: 500, qty: 1 },
        { id: 'chg-dress', desc: 'Surgical Wound Dressing & Care', category: 'Procedure', cost: 450, qty: 1 },
        { id: 'chg-med1', desc: 'Broad-Spectrum Antibiotics (Oral)', category: 'Pharmacy', cost: 350, qty: 1 },
        { id: 'chg-med2', desc: 'Post-op Pain Management Plan', category: 'Pharmacy', cost: 200, qty: 1 }
      ]
    }
  },
  'peds-C3': {
    id: 'P-8004',
    name: 'Tony Stark Jr.',
    age: 8,
    gender: 'Male',
    ailment: 'Mild Bronchitis',
    doctor: 'Dr. Helen Cho',
    priority: 'low',
    admittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    vitals: { heartRate: 88, bloodPressure: '110/70', spo2: 96, temperature: 99.5, status: 'normal' },
    billing: {
      baseRate: 600,
      amountPaid: 1000,
      charges: [
        { id: 'chg-consult', desc: 'Attending Pediatric Consultation', category: 'Consultation', cost: 500, qty: 1 },
        { id: 'chg-neb', desc: 'Pediatric Nebulization Session', category: 'Treatment', cost: 250, qty: 1 },
        { id: 'chg-med1', desc: 'Cough Suppressants & Syrups', category: 'Pharmacy', cost: 220, qty: 1 }
      ]
    }
  },
  'er-A4': {
    id: 'P-1090',
    name: 'Steve Rogers',
    age: 95,
    gender: 'Male',
    ailment: 'Concussion & Exhaustion',
    doctor: 'Dr. Peggy Carter',
    priority: 'high',
    admittedAt: new Date(Date.now() - 1800000).toISOString(), // 30m ago
    vitals: { heartRate: 58, bloodPressure: '135/85', spo2: 95, temperature: 97.9, status: 'warning' },
    billing: {
      baseRate: 1000,
      amountPaid: 1500,
      charges: [
        { id: 'chg-consult', desc: 'Attending Physician Consultation', category: 'Consultation', cost: 500, qty: 1 },
        { id: 'chg-ct', desc: 'Brain CT Scan (Non-Contrast)', category: 'Diagnostics', cost: 1500, qty: 1 },
        { id: 'chg-med1', desc: 'Osmotic Diuretics IV', category: 'Pharmacy', cost: 380, qty: 1 }
      ]
    }
  }
});

const getSeedMaintenance = () => ({
  'icu-C5': true,
  'gen_b-E6': true
});

// Seed data creation helper
const createInitialState = () => {
  const seedPatients = getSeedPatients();
  const seedMaintenance = getSeedMaintenance();
  const bedState = {};

  WARDS.forEach(ward => {
    ROW_LABELS.forEach(row => {
      for (let col = 1; col <= COL_COUNT; col++) {
        const bedId = `${row}${col}`;
        const key = `${ward.id}-${bedId}`;
        
        let status = 'vacant';
        let patient = null;

        if (seedPatients[key]) {
          status = 'occupied';
          patient = seedPatients[key];
        } else if (seedMaintenance[key]) {
          status = 'maintenance';
        }

        bedState[key] = {
          id: bedId,
          wardId: ward.id,
          status,
          patient
        };
      }
    });
  });

  return bedState;
};

// Seed historical discharged patient database (Rupees, under 10k)
const getSeedDischargedPatients = () => [
  {
    id: 'P-1002',
    name: 'Diana Prince',
    age: 30,
    gender: 'Female',
    ailment: 'Severe Migraine Cluster',
    doctor: 'Dr. Peggy Carter',
    priority: 'low',
    admittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    dischargedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'discharged',
    wardId: 'er',
    bedId: 'E2',
    billing: {
      baseRate: 1000,
      amountPaid: 3000,
      charges: [
        { id: 'chg-consult', desc: 'Attending Physician Consultation', category: 'Consultation', cost: 500, qty: 1 },
        { id: 'chg-iv', desc: 'Analgesic IV Infusions', category: 'Pharmacy', cost: 350, qty: 1 },
        { id: 'chg-cbc', desc: 'Complete Blood Count', category: 'Diagnostics', cost: 250, qty: 1 }
      ]
    }
  },
  {
    id: 'P-1009',
    name: 'Bucky Barnes',
    age: 94,
    gender: 'Male',
    ailment: 'Minor Cuts & Lacerations',
    doctor: 'Dr. Sarah Jenkins',
    priority: 'medium',
    admittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    dischargedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'discharged',
    wardId: 'icu',
    bedId: 'D4',
    billing: {
      baseRate: 1500,
      amountPaid: 2550,
      charges: [
        { id: 'chg-consult', desc: 'Attending Physician Consultation', category: 'Consultation', cost: 500, qty: 1 },
        { id: 'chg-sut', desc: 'Wound Suturing & Local Anesthetic', category: 'Procedure', cost: 800, qty: 1 },
        { id: 'chg-ant', desc: 'Tetanus Shot & Antibiotics Pack', category: 'Pharmacy', cost: 220, qty: 1 }
      ]
    }
  }
];

export const useHMISData = () => {
  const [beds, setBeds] = useState(() => {
    const saved = localStorage.getItem('hmis_beds');
    return saved ? JSON.parse(saved) : createInitialState();
  });

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('hmis_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('hmis_staff');
    return saved ? JSON.parse(saved) : DEFAULT_STAFF;
  });

  const [dischargedPatients, setDischargedPatients] = useState(() => {
    const saved = localStorage.getItem('hmis_discharged');
    return saved ? JSON.parse(saved) : getSeedDischargedPatients();
  });

  useEffect(() => {
    localStorage.setItem('hmis_beds', JSON.stringify(beds));
  }, [beds]);

  useEffect(() => {
    localStorage.setItem('hmis_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('hmis_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('hmis_discharged', JSON.stringify(dischargedPatients));
  }, [dischargedPatients]);

  const addActivity = (text, type = 'info') => {
    const newActivity = {
      id: `act-${Date.now()}`,
      text,
      time: 'Just now',
      type
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
  };

  const admitPatient = (wardId, bedId, patientData) => {
    const key = `${wardId}-${bedId}`;
    const newPatient = {
      id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      ...patientData,
      admittedAt: new Date().toISOString(),
      vitals: patientData.vitals || {
        heartRate: Math.floor(70 + Math.random() * 20),
        bloodPressure: '120/80',
        spo2: Math.floor(95 + Math.random() * 5),
        temperature: parseFloat((97.8 + Math.random() * 1.5).toFixed(1)),
        status: 'normal'
      },
      billing: {
        baseRate: WARD_RATES[wardId] || 500,
        amountPaid: 0,
        charges: [
          { id: 'chg-consult', desc: 'Attending Physician Consultation', category: 'Consultation', cost: 500, qty: 1 }
        ]
      }
    };

    setBeds(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: 'occupied',
        patient: newPatient
      }
    }));

    const wardName = WARDS.find(w => w.id === wardId)?.shortName || wardId;
    addActivity(`Patient ${patientData.name} admitted to ${wardName} Bed ${bedId}`, 'admission');
  };

  const dischargePatient = (wardId, bedId) => {
    const key = `${wardId}-${bedId}`;
    const bed = beds[key];
    if (!bed || !bed.patient) return;

    const patient = bed.patient;

    // Calculate final billing stay days
    const durationMs = Date.now() - new Date(patient.admittedAt).getTime();
    const days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

    const finalizedPatient = {
      ...patient,
      dischargedAt: new Date().toISOString(),
      status: 'discharged',
      wardId,
      bedId,
      billing: {
        ...patient.billing,
        daysAdmitted: days
      }
    };

    // Move to discharged database
    setDischargedPatients(prev => [finalizedPatient, ...prev]);

    setBeds(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: 'vacant',
        patient: null
      }
    }));

    const wardName = WARDS.find(w => w.id === wardId)?.shortName || wardId;
    addActivity(`Patient ${patient.name} discharged from ${wardName} Bed ${bedId}. Bill archived.`, 'discharge');
  };

  const updateVitals = (wardId, bedId, updatedVitals) => {
    const key = `${wardId}-${bedId}`;
    const currentPatient = beds[key]?.patient;
    if (!currentPatient) return;

    // Calculate vital status
    let status = 'normal';
    const hr = parseInt(updatedVitals.heartRate);
    const spo2 = parseInt(updatedVitals.spo2);
    const temp = parseFloat(updatedVitals.temperature);

    if (hr < 50 || hr > 120 || spo2 < 90 || temp > 102) {
      status = 'danger';
    } else if (hr < 60 || hr > 100 || spo2 < 94 || temp > 99.5) {
      status = 'warning';
    }

    const nextVitals = { ...updatedVitals, status };

    setBeds(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        patient: {
          ...currentPatient,
          vitals: nextVitals
        }
      }
    }));

    const statusMsg = status !== 'normal' ? ` (Vitals Status: ${status.toUpperCase()})` : '';
    addActivity(`Vitals updated for ${currentPatient.name} in Bed ${bedId}${statusMsg}`, 'update');
  };

  const setBedMaintenance = (wardId, bedId, isMaintenance) => {
    const key = `${wardId}-${bedId}`;
    
    setBeds(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: isMaintenance ? 'maintenance' : 'vacant'
      }
    }));

    const actionText = isMaintenance ? 'placed under maintenance' : 'released to vacant';
    addActivity(`Bed ${bedId} in ${wardId.toUpperCase()} ${actionText}`, 'maintenance');
  };

  // Transfer patient from one bed to another (inter-ward transfers)
  const transferPatient = (fromWardId, fromBedId, toWardId, toBedId) => {
    const fromKey = `${fromWardId}-${fromBedId}`;
    const toKey = `${toWardId}-${toBedId}`;

    const patient = beds[fromKey]?.patient;
    if (!patient) return false;

    setBeds(prev => ({
      ...prev,
      [fromKey]: {
        ...prev[fromKey],
        status: 'vacant',
        patient: null
      },
      [toKey]: {
        ...prev[toKey],
        status: 'occupied',
        patient: {
          ...patient,
          // Update base rate for new ward bed
          billing: {
            ...patient.billing,
            baseRate: WARD_RATES[toWardId] || patient.billing.baseRate
          },
          // Update assigned physician if transferring to a ward with different staff
          doctor: staff[toWardId]?.doctor || patient.doctor
        }
      }
    }));

    const fromWardName = WARDS.find(w => w.id === fromWardId)?.shortName || fromWardId;
    const toWardName = WARDS.find(w => w.id === toWardId)?.shortName || toWardId;

    addActivity(
      `Transferred patient ${patient.name} from ${fromWardName}-${fromBedId} to ${toWardName}-${toBedId}`,
      'update'
    );

    return true;
  };

  // Assign staff (Nurse / Doctor) to a specific ward
  const assignStaffToWard = (wardId, role, staffName) => {
    setStaff(prev => ({
      ...prev,
      [wardId]: {
        ...prev[wardId],
        [role]: staffName
      }
    }));

    const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);
    addActivity(`Re-assigned ${roleTitle} in ${wardId.toUpperCase()} ward to ${staffName}`, 'update');
  };

  // Bulk set bed status (e.g. disinfect all vacant beds to maintenance)
  const bulkSetWardBedStatus = (wardId, currentStatus, newStatus) => {
    setBeds(prev => {
      const nextBeds = { ...prev };
      let updatedCount = 0;

      Object.keys(nextBeds).forEach(key => {
        const bed = nextBeds[key];
        if (bed.wardId === wardId && bed.status === currentStatus) {
          nextBeds[key] = {
            ...bed,
            status: newStatus
          };
          updatedCount++;
        }
      });

      if (updatedCount > 0) {
        const wardName = WARDS.find(w => w.id === wardId)?.shortName || wardId;
        const msg = newStatus === 'maintenance'
          ? `Disinfected ward: placed ${updatedCount} vacant beds under maintenance in ${wardName}`
          : `Released ${updatedCount} sanitization beds in ${wardName}`;
        addActivity(msg, 'maintenance');
      }

      return nextBeds;
    });
  };

  // Add a billing charge item to an active inpatient or archived outpatient
  const addBillingCharge = (patientId, chargeItem) => {
    let foundActive = false;
    
    // 1. Search active beds
    setBeds(prev => {
      const nextBeds = { ...prev };
      Object.keys(nextBeds).forEach(key => {
        const bed = nextBeds[key];
        if (bed.status === 'occupied' && bed.patient && bed.patient.id === patientId) {
          nextBeds[key] = {
            ...bed,
            patient: {
              ...bed.patient,
              billing: {
                ...bed.patient.billing,
                charges: [
                  ...bed.patient.billing.charges,
                  { id: `chg-${Date.now()}`, ...chargeItem }
                ]
              }
            }
          };
          foundActive = true;
        }
      });
      return nextBeds;
    });

    // 2. Search discharged archives if not active
    if (!foundActive) {
      setDischargedPatients(prev => {
        return prev.map(p => {
          if (p.id === patientId) {
            return {
              ...p,
              billing: {
                ...p.billing,
                charges: [
                  ...p.billing.charges,
                  { id: `chg-${Date.now()}`, ...chargeItem }
                ]
              }
            };
          }
          return p;
        });
      });
    }

    addActivity(`Charge item "${chargeItem.desc}" (₹${chargeItem.cost}) appended to Patient ${patientId}`, 'update');
  };

  // Record payment transactions for a patient bill
  const recordPatientPayment = (patientId, amount) => {
    let foundActive = false;

    // 1. Check active beds
    setBeds(prev => {
      const nextBeds = { ...prev };
      Object.keys(nextBeds).forEach(key => {
        const bed = nextBeds[key];
        if (bed.status === 'occupied' && bed.patient && bed.patient.id === patientId) {
          nextBeds[key] = {
            ...bed,
            patient: {
              ...bed.patient,
              billing: {
                ...bed.patient.billing,
                amountPaid: bed.patient.billing.amountPaid + amount
              }
            }
          };
          foundActive = true;
        }
      });
      return nextBeds;
    });

    // 2. Check discharged archives
    if (!foundActive) {
      setDischargedPatients(prev => {
        return prev.map(p => {
          if (p.id === patientId) {
            return {
              ...p,
              billing: {
                ...p.billing,
                amountPaid: p.billing.amountPaid + amount
              }
            };
          }
          return p;
        });
      });
    }

    addActivity(`Transaction recorded: Patient ${patientId} paid ₹${amount}`, 'update');
  };

  // Compute live statistics for the hospital
  const getStatistics = () => {
    const totalBeds = Object.keys(beds).length;
    let occupied = 0;
    let vacant = 0;
    let maintenance = 0;
    let highPriority = 0;
    let mediumPriority = 0;
    let lowPriority = 0;

    Object.values(beds).forEach(bed => {
      if (bed.status === 'occupied') {
        occupied++;
        if (bed.patient?.priority === 'high') {
          highPriority++;
        } else if (bed.patient?.priority === 'medium') {
          mediumPriority++;
        } else if (bed.patient?.priority === 'low') {
          lowPriority++;
        }
      } else if (bed.status === 'vacant') {
        vacant++;
      } else if (bed.status === 'maintenance') {
        maintenance++;
      }
    });

    const wardStats = WARDS.map(ward => {
      const wardBeds = Object.values(beds).filter(b => b.wardId === ward.id);
      const wTotal = wardBeds.length;
      const wOccupied = wardBeds.filter(b => b.status === 'occupied').length;
      const wMaintenance = wardBeds.filter(b => b.status === 'maintenance').length;
      
      return {
        id: ward.id,
        name: ward.name,
        shortName: ward.shortName,
        total: wTotal,
        occupied: wOccupied,
        maintenance: wMaintenance,
        vacant: wTotal - wOccupied - wMaintenance,
        occupancyRate: Math.round((wOccupied / wTotal) * 100)
      };
    });

    return {
      totalBeds,
      occupied,
      vacant,
      maintenance,
      highPriority,
      mediumPriority,
      lowPriority,
      occupancyRate: Math.round((occupied / totalBeds) * 100),
      wardStats
    };
  };

  return {
    wards: WARDS,
    beds,
    activities,
    staff,
    dischargedPatients,
    admitPatient,
    dischargePatient,
    updateVitals,
    setBedMaintenance,
    transferPatient,
    assignStaffToWard,
    bulkSetWardBedStatus,
    addBillingCharge,
    recordPatientPayment,
    getStatistics
  };
};
