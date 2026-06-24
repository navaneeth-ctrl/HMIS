import React, { useState } from 'react';
import { Search, IndianRupee, CreditCard, Plus, Printer, CheckCircle, AlertCircle, FileText, User, ArrowLeftRight, Trash2 } from 'lucide-react';

export default function BillingSystem({ beds, dischargedPatients, wards, onAddCharge, onRecordPayment }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Form states for adding custom charges
  const [showAddChargeForm, setShowAddChargeForm] = useState(false);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeCategory, setChargeCategory] = useState('Pharmacy');
  const [chargeCost, setChargeCost] = useState('');
  const [chargeQty, setChargeQty] = useState('1');

  // Form states for recording payments
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Collect all patients (active inpatients + discharged history)
  const activeInpatients = Object.values(beds)
    .filter(bed => bed.status === 'occupied' && bed.patient)
    .map(bed => ({
      ...bed.patient,
      status: 'admitted',
      wardId: bed.wardId,
      bedId: bed.id
    }));

  const allPatients = [...activeInpatients, ...dischargedPatients];

  // Search logic
  const filteredSuggestions = allPatients.filter(patient => {
    const query = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(query) ||
      patient.id.toLowerCase().includes(query)
    );
  });

  // Get currently selected patient details
  const selectedPatient = allPatients.find(p => p.id === selectedPatientId);

  const calculateInvoice = (patient) => {
    if (!patient) return null;

    // 1. Calculate stay duration
    let days = 1;
    if (patient.status === 'admitted') {
      const durationMs = Date.now() - new Date(patient.admittedAt).getTime();
      days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
    } else {
      // Discharged patient already has days computed or timestamp diff
      if (patient.billing.daysAdmitted) {
        days = patient.billing.daysAdmitted;
      } else {
        const durationMs = new Date(patient.dischargedAt).getTime() - new Date(patient.admittedAt).getTime();
        days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
      }
    }

    const baseRate = patient.billing.baseRate || 500;
    const roomCostTotal = baseRate * days;

    // 2. Gather itemized charges
    const itemizedCharges = [
      {
        id: 'room-stay',
        desc: `Room Stay: Bed ${patient.bedId} (${days} Day${days > 1 ? 's' : ''})`,
        category: 'Room/Stay',
        cost: baseRate,
        qty: days,
        total: roomCostTotal
      },
      ...patient.billing.charges.map(c => ({
        ...c,
        total: c.cost * c.qty
      }))
    ];

    // 3. Compute totals
    const subtotal = itemizedCharges.reduce((sum, item) => sum + item.total, 0);
    const tax = Math.round(subtotal * 0.05); // 5% CGST/SGST Hospital Tax
    const grandTotal = subtotal + tax;
    const amountPaid = patient.billing.amountPaid || 0;
    const balanceDue = grandTotal - amountPaid;

    return {
      days,
      roomCostTotal,
      itemizedCharges,
      subtotal,
      tax,
      grandTotal,
      amountPaid,
      balanceDue
    };
  };

  const invoice = calculateInvoice(selectedPatient);

  const handleAddChargeSubmit = (e) => {
    e.preventDefault();
    if (!chargeDesc || !chargeCost) return;

    onAddCharge(selectedPatient.id, {
      desc: chargeDesc,
      category: chargeCategory,
      cost: parseInt(chargeCost),
      qty: parseInt(chargeQty)
    });

    // Reset form
    setChargeDesc('');
    setChargeCost('');
    setChargeQty('1');
    setShowAddChargeForm(false);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentAmount || parseInt(paymentAmount) <= 0) return;

    onRecordPayment(selectedPatient.id, parseInt(paymentAmount));
    setPaymentAmount('');
    setShowPaymentForm(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-grid-2col" style={{ gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Left Column: Quick Lookup & Patient List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Patient Lookup Card */}
          <div className="dashboard-panel" style={{ flex: 'none' }}>
            <h3 className="panel-title">
              <Search size={18} style={{ color: 'var(--color-primary)' }} />
              Patient Lookup
            </h3>
            
            <div className="search-box" style={{ width: '100%', margin: '10px 0 0 0' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search patient by ID or name..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Quick pick side roster */}
          <div className="dashboard-panel" style={{ flex: 1, minHeight: '350px', maxHeight: '550px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              Hospital Admissions Roster
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {filteredSuggestions.length === 0 ? (
                <div style={{ padding: '20px 0', textAlignment: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  No patients found.
                </div>
              ) : (
                filteredSuggestions.map(p => {
                  const isActive = p.status === 'admitted';
                  const isSelected = selectedPatientId === p.id;
                  const wardLabel = wards.find(w => w.id === p.wardId)?.shortName || p.wardId;

                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className="sidebar-item"
                      style={{
                        padding: '10px 12px',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid transparent',
                        background: isSelected 
                          ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.02) 100%)' 
                          : 'rgba(0,0,0,0.015)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        width: '100%',
                        transform: 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span style={{ fontWeight: 650, color: 'var(--text-main)', fontSize: '0.88rem' }}>{p.name}</span>
                        <span className={`badge ${isActive ? 'status-vacant' : 'badge-low'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                          {isActive ? 'Active' : 'Archived'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        <span>Reg ID: <code>{p.id}</code></span>
                        <span>{wardLabel} ({p.bedId})</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Patient Bill Invoice */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedPatient && invoice ? (
            <div className="dashboard-panel animate-fade-in" id="printable-bill" style={{ background: '#ffffff', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
              
              {/* Invoice Patient Header Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.6rem' }}>🏥</span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>CareFlow Invoice</h2>
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '4px', display: 'flex', gap: '10px' }}>
                    <span>Hospital Bill ID: <code>INV-{selectedPatient.id}</code></span>
                    <span>•</span>
                    <span>Date: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${selectedPatient.status === 'admitted' ? 'status-occupied' : 'priority-low'}`} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                    {selectedPatient.status === 'admitted' ? 'ACTIVE INPATIENT' : 'DISCHARGED OUTPATIENT'}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                    Attending: <strong>{selectedPatient.doctor}</strong>
                  </div>
                </div>
              </div>

              {/* Patient particulars card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '10px', marginTop: '20px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 650 }}>Patient Details</span>
                  <strong style={{ fontSize: '0.9rem' }}>{selectedPatient.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedPatient.age} Y / {selectedPatient.gender}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 650 }}>Ward Location</span>
                  <strong style={{ fontSize: '0.9rem' }}>
                    {wards.find(w => w.id === selectedPatient.wardId)?.name || selectedPatient.wardId}
                  </strong>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bed Allocation: {selectedPatient.bedId}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 650 }}>Admission Timeline</span>
                  <strong style={{ fontSize: '0.85rem' }}>Admit: {new Date(selectedPatient.admittedAt).toLocaleDateString()}</strong>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {selectedPatient.status === 'admitted' 
                      ? `Days Admitted: ${invoice.days} Days` 
                      : `Discharge: ${new Date(selectedPatient.dischargedAt).toLocaleDateString()}`}
                  </span>
                </div>
              </div>

              {/* Itemized Table of Charges */}
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Itemized Hospital Ledger
                </h4>
                
                <div className="table-wrapper" style={{ background: '#ffffff', boxShadow: 'none' }}>
                  <table className="hmis-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ padding: '10px 12px' }}>Description</th>
                        <th style={{ padding: '10px 12px' }}>Category</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Rate (₹)</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.itemizedCharges.map((item) => (
                        <tr key={item.id}>
                          <td style={{ padding: '10px 12px', fontWeight: 550 }}>{item.desc}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span className="badge priority-low" style={{ fontSize: '0.68rem', padding: '2px 6px', background: '#f1f5f9', color: 'var(--text-muted)' }}>
                              {item.category}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>₹{item.cost}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.qty}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bill Add Charge and Record Payment Sub-options */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '24px', flexWrap: 'wrap' }}>
                
                {/* Left Area: Transactions modification (Add Charge or Record Payment) */}
                <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* Add Custom Charge Segment */}
                  {!showAddChargeForm && !showPaymentForm && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setShowAddChargeForm(true)}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
                      >
                        <Plus size={14} style={{ color: 'var(--color-primary)' }} />
                        Add Pharmacy/Lab Charge
                      </button>

                      <button
                        onClick={() => setShowPaymentForm(true)}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
                      >
                        <CreditCard size={14} />
                        Record Rupee Payment
                      </button>
                    </div>
                  )}

                  {/* Add Charge Form rendering */}
                  {showAddChargeForm && (
                    <form onSubmit={handleAddChargeSubmit} className="login-form animate-fade-in" style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <h5 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                        Add Medicine or Lab Charge
                      </h5>
                      <div className="vitals-grid" style={{ gap: '10px' }}>
                        <div className="form-group" style={{ gap: '4px' }}>
                          <label style={{ fontSize: '0.7rem' }}>Description</label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            placeholder="e.g. Paracetamol 650mg"
                            value={chargeDesc}
                            onChange={(e) => setChargeDesc(e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ gap: '4px' }}>
                          <label style={{ fontSize: '0.7rem' }}>Category</label>
                          <select
                            className="select-filter"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            value={chargeCategory}
                            onChange={(e) => setChargeCategory(e.target.value)}
                          >
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Diagnostics">Diagnostics/Lab</option>
                            <option value="Procedure">Procedure</option>
                            <option value="Consultation">Consultation</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="vitals-grid" style={{ gap: '10px', marginTop: '6px' }}>
                        <div className="form-group" style={{ gap: '4px' }}>
                          <label style={{ fontSize: '0.7rem' }}>Unit Cost (₹)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="5000"
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            placeholder="₹"
                            value={chargeCost}
                            onChange={(e) => setChargeCost(e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ gap: '4px' }}>
                          <label style={{ fontSize: '0.7rem' }}>Quantity</label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="10"
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            value={chargeQty}
                            onChange={(e) => setChargeQty(e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                        <button type="button" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setShowAddChargeForm(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem', width: 'auto' }}>
                          Add
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Record Payment Form rendering */}
                  {showPaymentForm && (
                    <form onSubmit={handlePaymentSubmit} className="login-form animate-fade-in" style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <h5 style={{ fontSize: '0.85rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                        Record Transaction Payment
                      </h5>
                      <div className="form-group" style={{ gap: '4px' }}>
                        <label style={{ fontSize: '0.7rem' }}>Payment Amount (₹)</label>
                        <div className="input-with-icon">
                          <span style={{ position: 'absolute', left: '10px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>₹</span>
                          <input
                            type="number"
                            required
                            min="1"
                            max={invoice.balanceDue > 0 ? invoice.balanceDue : 5000}
                            className="form-input"
                            style={{ padding: '6px 10px 6px 22px', fontSize: '0.8rem' }}
                            placeholder={`Maximum ₹${invoice.balanceDue > 0 ? invoice.balanceDue : 10000}`}
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                        <button type="button" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setShowPaymentForm(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem', width: 'auto', background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)', boxShadow: 'none' }}>
                          Submit Payment
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Right Area: Bill summary totals */}
                <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'flex-start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: 600 }}>₹{invoice.subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Service GST (5%):</span>
                    <span style={{ fontWeight: 600 }}>₹{invoice.tax}</span>
                  </div>
                  
                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 700 }}>
                    <span>Grand Total:</span>
                    <span>₹{invoice.grandTotal}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-success)' }}>
                    <span style={{ fontWeight: 550 }}>Amount Paid:</span>
                    <span style={{ fontWeight: 700 }}>₹{invoice.amountPaid}</span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Balance Due:</span>
                    {invoice.balanceDue <= 0 ? (
                      <span className="badge status-vacant" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', padding: '3px 8px' }}>
                        <CheckCircle size={12} />
                        Settled
                      </span>
                    ) : (
                      <span style={{ fontSize: '1.15rem', color: 'var(--color-danger)', fontWeight: 800 }}>
                        ₹{invoice.balanceDue}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Bill footer print options */}
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  <AlertCircle size={14} style={{ color: 'var(--color-primary)' }} />
                  <span>Maximum balance limit ceiling set at ₹10,000 for standard outpatient billing.</span>
                </div>
                <button
                  onClick={handlePrint}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Printer size={16} />
                  Print Receipt / PDF
                </button>
              </div>

            </div>
          ) : (
            <div className="dashboard-panel" style={{ flex: 1, minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-dim)' }}>
              <FileText size={48} style={{ strokeWidth: 1.2 }} />
              <h4 style={{ fontWeight: 650, color: 'var(--text-muted)' }}>Financial Invoicing Terminal</h4>
              <p style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: '300px' }}>
                Select a patient from the admissions roster on the left, or search using their Name or Patient ID to fetch, modify, or print billing invoices.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
