import React from 'react';
import { BedDouble, Users, Heart, ShieldAlert, Activity, TrendingUp, Clock, Plus, Zap, BarChart3, LineChart, PieChart } from 'lucide-react';

export default function DashboardOverview({ stats, activities, onNavigate, onSimulateAdmit, onSimulateVitals }) {
  const { totalBeds, occupied, vacant, maintenance, highPriority, mediumPriority, lowPriority, occupancyRate, wardStats } = stats;

  // MATH FOR THE TRIAGE DONUT CHART
  const totalAdmitted = occupied || 0;
  const pHigh = highPriority || 0;
  const pMedium = mediumPriority || 0;
  const pLow = lowPriority || 0;

  const pctHigh = totalAdmitted > 0 ? (pHigh / totalAdmitted) * 100 : 0;
  const pctMedium = totalAdmitted > 0 ? (pMedium / totalAdmitted) * 100 : 0;
  const pctLow = totalAdmitted > 0 ? (pLow / totalAdmitted) * 100 : 0;

  const r = 50;
  const circ = 2 * Math.PI * r; // ~314.159

  const dashHigh = (pctHigh / 100) * circ;
  const dashMedium = (pctMedium / 100) * circ;
  const dashLow = (pctLow / 100) * circ;

  const offsetHigh = 0;
  const offsetMedium = -dashHigh;
  const offsetLow = -(dashHigh + dashMedium);

  // MATH FOR THE ADMITTANCE WEEKLY TREND CHART
  // Seed admissions per day, mapping Sunday dynamically to reflect live patient count variations!
  const trendValues = [8, 13, 9, 18, 14, 21, Math.max(occupied + 5, 12)];
  const trendDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendMax = 30;
  const trendHeight = 150;
  const trendBaseline = 180;
  const trendStartX = 45;
  const trendWidthOffset = 430 / 6;

  const trendPoints = trendValues.map((val, idx) => {
    const x = trendStartX + idx * trendWidthOffset;
    const y = trendBaseline - (val / trendMax) * trendHeight;
    return { x, y, val, day: trendDays[idx] };
  });

  const linePath = trendPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${trendPoints[trendPoints.length - 1].x} ${trendBaseline} L ${trendPoints[0].x} ${trendBaseline} Z`;

  return (
    <div className="dashboard-content">
      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Bed Occupancy</span>
            <span className="metric-value">{occupancyRate}%</span>
            <div className="metric-trend">
              <TrendingUp size={14} className="trend-up" />
              <span className="trend-up">{occupied} of {totalBeds} Beds Occupied</span>
            </div>
          </div>
          <div className="metric-icon-box primary">
            <BedDouble size={26} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Active Patients</span>
            <span className="metric-value">{occupied}</span>
            <div className="metric-trend">
              <Users size={14} className="trend-neutral" />
              <span className="trend-neutral">Currently Admitted</span>
            </div>
          </div>
          <div className="metric-icon-box success">
            <Users size={26} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Critical Alerts</span>
            <span className="metric-value">{highPriority}</span>
            <div className="metric-trend">
              <ShieldAlert size={14} className="trend-down" />
              <span className="trend-down">High Priority Patients</span>
            </div>
          </div>
          <div className="metric-icon-box danger">
            <ShieldAlert size={26} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-label">Vacant Beds</span>
            <span className="metric-value">{vacant}</span>
            <div className="metric-trend">
              <Activity size={14} className="trend-up" />
              <span className="trend-up">{maintenance} In Maintenance</span>
            </div>
          </div>
          <div className="metric-icon-box warning">
            <Heart size={26} />
          </div>
        </div>
      </div>

      {/* Grid Layout for charts & activity logs */}
      <div className="dashboard-grid-2col">
        
        {/* Left Column: Analytical Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Ward Occupancy Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <BarChart3 size={20} style={{ color: 'var(--color-primary)' }} />
                Ward Capacity Occupancy Rates
              </h3>
              <span className="realtime-clock" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Live Bar Map</span>
            </div>

            <div className="chart-container">
              <svg className="occupancy-chart-svg" viewBox="0 0 500 220" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border-color)" strokeWidth="0.8" />
                <line x1="40" y1="65" x2="480" y2="65" stroke="var(--border-color)" strokeWidth="0.8" />
                <line x1="40" y1="110" x2="480" y2="110" stroke="var(--border-color)" strokeWidth="0.8" />
                <line x1="40" y1="155" x2="480" y2="155" stroke="var(--border-color)" strokeWidth="0.8" />
                <line x1="40" y1="180" x2="480" y2="180" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />

                {/* Y-Axis labels */}
                <text x="15" y="24" fill="#64748b" fontSize="10" textAnchor="middle">100%</text>
                <text x="15" y="69" fill="#64748b" fontSize="10" textAnchor="middle">75%</text>
                <text x="15" y="114" fill="#64748b" fontSize="10" textAnchor="middle">50%</text>
                <text x="15" y="159" fill="#64748b" fontSize="10" textAnchor="middle">25%</text>
                <text x="15" y="184" fill="#64748b" fontSize="10" textAnchor="middle">0%</text>

                {/* Draw Bars dynamically */}
                {wardStats.map((ward, idx) => {
                  const xOffset = 60 + idx * 85;
                  const barWidth = 40;
                  const maxHeight = 160;
                  const barHeight = Math.max((ward.occupancyRate / 100) * maxHeight, 6); // min height to show bar
                  const yOffset = 180 - barHeight;

                  // Color based on occupancy level
                  let barColor = 'url(#indigoGradient)';
                  if (ward.occupancyRate > 75) barColor = 'url(#roseGradient)';
                  else if (ward.occupancyRate > 50) barColor = 'url(#amberGradient)';
                  else if (ward.occupancyRate > 0) barColor = 'url(#emeraldGradient)';

                  return (
                    <g key={ward.id}>
                      <rect
                        x={xOffset}
                        y={180 - maxHeight}
                        width={barWidth}
                        height={maxHeight}
                        fill="rgba(0, 0, 0, 0.015)"
                        rx="4"
                      />
                      <rect
                        className="chart-bar"
                        x={xOffset}
                        y={yOffset}
                        width={barWidth}
                        height={barHeight}
                        fill={barColor}
                        rx="4"
                      />
                      <text
                        x={xOffset + barWidth / 2}
                        y={yOffset - 8}
                        fill="var(--text-main)"
                        fontSize="10.5"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {ward.occupancyRate}%
                      </text>
                      <text
                        x={xOffset + barWidth / 2}
                        y="198"
                        fill="#475569"
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {ward.shortName}
                      </text>
                      <text
                        x={xOffset + barWidth / 2}
                        y="212"
                        fill="#64748b"
                        fontSize="9.5"
                        textAnchor="middle"
                      >
                        ({ward.occupied}/{ward.total})
                      </text>
                    </g>
                  );
                })}

                {/* Gradients */}
                <defs>
                  <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Admittance Weekly Trend Line Chart */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <LineChart size={20} style={{ color: 'var(--color-secondary)' }} />
                Admittance Flow Trend (Weekly)
              </h3>
              <span className="realtime-clock" style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>Area Trend</span>
            </div>

            <div className="chart-container" style={{ height: '220px' }}>
              <svg className="occupancy-chart-svg" viewBox="0 0 500 220" preserveAspectRatio="none">
                {/* Defs for Line area gradient */}
                <defs>
                  <linearGradient id="areaTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="45" y1="30" x2="475" y2="30" stroke="var(--border-color)" strokeWidth="0.8" />
                <line x1="45" y1="80" x2="475" y2="80" stroke="var(--border-color)" strokeWidth="0.8" />
                <line x1="45" y1="130" x2="475" y2="130" stroke="var(--border-color)" strokeWidth="0.8" />
                <line x1="45" y1="180" x2="475" y2="180" stroke="rgba(0,0,0,0.15)" strokeWidth="1.2" />

                {/* Y-Axis Labels */}
                <text x="20" y="34" fill="#64748b" fontSize="10" textAnchor="middle">30</text>
                <text x="20" y="84" fill="#64748b" fontSize="10" textAnchor="middle">20</text>
                <text x="20" y="134" fill="#64748b" fontSize="10" textAnchor="middle">10</text>
                <text x="20" y="184" fill="#64748b" fontSize="10" textAnchor="middle">0</text>

                {/* Shaded Area */}
                <path d={areaPath} fill="url(#areaTrendGradient)" />

                {/* Main Trend Line */}
                <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth="3.5" strokeLinecap="round" />

                {/* Interactive circles and labels */}
                {trendPoints.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="5.5"
                      fill="#ffffff"
                      stroke="#8b5cf6"
                      strokeWidth="3.5"
                      style={{ cursor: 'pointer' }}
                    />
                    <text
                      x={p.x}
                      y={p.y - 12}
                      fill="var(--text-main)"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {p.val}
                    </text>
                    <text
                      x={p.x}
                      y="198"
                      fill="#475569"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {p.day}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

        </div>

        {/* Right Column: Donut Breakdown, Shortcuts & Activities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Triage Priority Donut Chart */}
          <div className="dashboard-panel">
            <h3 className="panel-title">
              <PieChart size={20} style={{ color: 'var(--color-success)' }} />
              Admitted Patient Triage Priority
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', padding: '10px 0' }}>
              {/* SVG Circular Donut Chart */}
              <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                <svg width="100%" height="100%" viewBox="0 0 120 120">
                  {totalAdmitted === 0 ? (
                    <circle
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke="#e2e8f0"
                      strokeWidth="14"
                    />
                  ) : (
                    <>
                      {/* Low Priority segment (indigo) */}
                      {dashLow > 0 && (
                        <circle
                          cx="60"
                          cy="60"
                          r={r}
                          fill="transparent"
                          stroke="var(--color-primary)"
                          strokeWidth="14"
                          strokeDasharray={`${dashLow} ${circ - dashLow}`}
                          strokeDashoffset={offsetLow}
                          transform="rotate(-90 60 60)"
                          style={{ transition: 'stroke-dasharray 0.4s ease' }}
                        />
                      )}
                      {/* Medium Priority segment (amber) */}
                      {dashMedium > 0 && (
                        <circle
                          cx="60"
                          cy="60"
                          r={r}
                          fill="transparent"
                          stroke="var(--color-warning)"
                          strokeWidth="14"
                          strokeDasharray={`${dashMedium} ${circ - dashMedium}`}
                          strokeDashoffset={offsetMedium}
                          transform="rotate(-90 60 60)"
                          style={{ transition: 'stroke-dasharray 0.4s ease' }}
                        />
                      )}
                      {/* High Priority segment (rose) */}
                      {dashHigh > 0 && (
                        <circle
                          cx="60"
                          cy="60"
                          r={r}
                          fill="transparent"
                          stroke="var(--color-danger)"
                          strokeWidth="14"
                          strokeDasharray={`${dashHigh} ${circ - dashHigh}`}
                          strokeDashoffset={offsetHigh}
                          transform="rotate(-90 60 60)"
                          style={{ transition: 'stroke-dasharray 0.4s ease' }}
                        />
                      )}
                    </>
                  )}
                  {/* Central Text Hole */}
                  <circle cx="60" cy="60" r={r - 7} fill="var(--bg-card)" />
                  <text x="60" y="58" textAnchor="middle" fill="var(--text-main)" fontSize="15" fontWeight="bold" fontFamily="var(--font-title)">
                    {totalAdmitted}
                  </text>
                  <text x="60" y="72" textAnchor="middle" fill="var(--text-dim)" fontSize="8.5" fontWeight="600" textTransform="uppercase" letterSpacing="0.05em">
                    Cases
                  </text>
                </svg>
              </div>

              {/* Legends list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
                    High Priority:
                  </span>
                  <strong style={{ color: 'var(--text-main)' }}>{pHigh}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
                    Medium:
                  </span>
                  <strong style={{ color: 'var(--text-main)' }}>{pMedium}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                    Low (Normal):
                  </span>
                  <strong style={{ color: 'var(--text-main)' }}>{pLow}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="dashboard-panel" style={{ flex: 'none' }}>
            <h3 className="panel-title">
              <Zap size={20} className="trend-neutral" />
              Quick Shortcuts & Simulator
            </h3>
            
            <div className="quick-actions-grid">
              <button 
                onClick={() => onNavigate('beds')} 
                className="btn-action-shortcut"
              >
                <BedDouble size={20} />
                <span>Bed Monitoring</span>
              </button>
              
              <button 
                onClick={() => onNavigate('patients')} 
                className="btn-action-shortcut"
              >
                <Users size={20} />
                <span>Patient Directory</span>
              </button>

              <button 
                onClick={onSimulateAdmit} 
                className="btn-action-shortcut"
                style={{ background: 'rgba(16, 185, 129, 0.04)', borderColor: 'rgba(16, 185, 129, 0.12)' }}
              >
                <Plus size={20} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontSize: '0.8rem' }}>Simulate Emergency Admission</span>
              </button>

              <button 
                onClick={onSimulateVitals} 
                className="btn-action-shortcut"
                style={{ background: 'rgba(239, 68, 68, 0.04)', borderColor: 'rgba(239, 68, 68, 0.12)' }}
              >
                <Activity size={20} style={{ color: 'var(--color-danger)' }} />
                <span style={{ fontSize: '0.8rem' }}>Simulate Vital Alarm Shifts</span>
              </button>
            </div>
          </div>

          {/* Activity Log Panel */}
          <div className="dashboard-panel" style={{ flex: 1, overflowY: 'auto' }}>
            <div className="panel-header">
              <h3 className="panel-title">
                <Clock size={20} />
                Activity Log
              </h3>
            </div>

            <div className="activity-list">
              {activities.length === 0 ? (
                <div style={{ padding: '20px', textAlignment: 'center', color: 'var(--text-dim)' }}>
                  No activities logged yet.
                </div>
              ) : (
                activities.map(act => {
                  let dotColor = 'var(--color-primary)';
                  if (act.type === 'admission') dotColor = 'var(--color-success)';
                  else if (act.type === 'discharge') dotColor = 'var(--color-danger)';
                  else if (act.type === 'maintenance') dotColor = 'var(--color-warning)';
                  else if (act.type === 'update') dotColor = 'var(--color-info)';

                  return (
                    <div className="activity-item" key={act.id}>
                      <span className="activity-icon-bullet" style={{ backgroundColor: dotColor }} />
                      <div className="activity-details">
                        <span className="activity-text">{act.text}</span>
                        <span className="activity-meta">{act.time}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
