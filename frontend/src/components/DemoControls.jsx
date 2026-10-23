import React from 'react';
import { Play, AlertTriangle, PlusCircle } from 'lucide-react';

export default function DemoControls({ onLaunchDemo, onSimulateFailure, onOpenModal, isRunning, currentIncidentId }) {
  return (
    <div className="glass-panel" style={{ padding: '16px 20px', marginTop: '20px' }}>
      <div className="demo-engine-wrapper">
        
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--accent-amber)' }}>
            🔥 DEMO SIMULATION & INCIDENT ENGINE
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Report a custom emergency incident or run the Golden Demo scenario with autonomous failure replanning.
          </div>
        </div>

        <div className="demo-engine-actions">
          {/* Custom Incident Button */}
          <button
            onClick={onOpenModal}
            disabled={isRunning}
            className="demo-btn"
            style={{
              background: isRunning ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.2)',
              border: `1px solid ${isRunning ? 'rgba(255,255,255,0.1)' : 'var(--accent-blue)'}`,
              color: isRunning ? 'var(--text-muted)' : '#93c5fd',
              cursor: isRunning ? 'not-allowed' : 'pointer'
            }}
          >
            <PlusCircle size={16} />
            REPORT CUSTOM INCIDENT
          </button>

          {/* Step 1: Launch Golden Incident */}
          <button
            onClick={onLaunchDemo}
            disabled={isRunning}
            className="demo-btn"
            style={{
              background: isRunning ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #10b981, #047857)',
              color: '#fff',
              border: 'none',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              boxShadow: isRunning ? 'none' : '0 0 15px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Play size={16} />
            1. LAUNCH GOLDEN SCENARIO
          </button>

          {/* Step 2: Trigger Failure */}
          <button
            onClick={onSimulateFailure}
            disabled={!currentIncidentId}
            className="demo-btn"
            style={{
              background: !currentIncidentId ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: '#fff',
              border: 'none',
              cursor: !currentIncidentId ? 'not-allowed' : 'pointer',
              boxShadow: !currentIncidentId ? 'none' : '0 0 15px rgba(239, 68, 68, 0.4)'
            }}
          >
            <AlertTriangle size={16} />
            2. SIMULATE RESOURCE FAILURE
          </button>
        </div>

      </div>
    </div>
  );
}
