import React from 'react';
import { ShieldAlert, Activity, Cpu, PauseCircle, PlayCircle, RefreshCw } from 'lucide-react';

export default function Header({ systemState, isPaused, onTogglePause, onReset, onOpenModal }) {
  return (
    <header className="glass-panel" style={{ padding: '16px 24px', marginBottom: '20px' }}>
      <div className="header-wrapper">
        
        {/* Brand Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ef4444, #991b1b)',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
          }}>
            <ShieldAlert size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>
              ARES <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>v1.0 MVP</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Autonomous Response & Emergency Coordination System
            </p>
          </div>
        </div>

        {/* Live Metrics Group */}
        <div className="header-metrics-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--accent-blue)" />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AGENTIC ENGINE</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-blue)' }}>5 ACTIVE AGENTS</div>
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color={systemState === 'REPLANNING' ? '#f59e0b' : '#10b981'} />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ORCHESTRATOR STATUS</div>
              <span className={
                systemState === 'REPLANNING' ? 'badge badge-warning' :
                systemState === 'COMPLETED' ? 'badge badge-active' : 'badge badge-info'
              }>
                {systemState || 'IDLE'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Human Override Group */}
        <div className="header-actions-group">
          <button
            onClick={onOpenModal}
            className="header-action-btn"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              border: 'none',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
            }}
          >
            <ShieldAlert size={16} />
            + REPORT NEW INCIDENT
          </button>

          <button 
            onClick={onTogglePause}
            className="header-action-btn"
            style={{
              background: isPaused ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              border: `1px solid ${isPaused ? '#10b981' : '#f59e0b'}`,
              color: isPaused ? '#6ee7b7' : '#fde047',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            {isPaused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>

          <button
            onClick={onReset}
            className="header-action-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-main)',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem'
            }}
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>

      </div>
    </header>
  );
}
