import React from 'react';
import { BedDouble, Users, Heart, ShieldAlert, Activity, TrendingUp, Clock, Plus, Zap } from 'lucide-react';

export default function DashboardOverview({ stats, activities, onNavigate, onSimulateAdmit, onSimulateVitals }) {
  const { totalBeds, occupied, vacant, maintenance, highPriority, occupancyRate, wardStats } = stats;

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
        {/* Ward Occupancy Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <Activity size={20} className="trend-up" />
              Ward Occupancy Analytics
            </h3>
            <span className="realtime-clock" style={{ fontSize: '0.8rem' }}>Live Stats</span>
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
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="500"
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

        {/* Sidebar Panel: Shortcuts & Activities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.15)' }}
              >
                <Plus size={20} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontSize: '0.8rem' }}>Simulate Emergency Admission</span>
              </button>

              <button 
                onClick={onSimulateVitals} 
                className="btn-action-shortcut"
                style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
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
