import React from 'react';
import { Cpu, Stethoscope, Truck, Navigation, Radio } from 'lucide-react';

export default function AgentPanel({ activeAgent }) {
  const agents = [
    {
      id: 'commander',
      name: 'Commander Agent',
      emoji: '🧠',
      icon: Cpu,
      role: 'Central Orchestrator',
      color: '#8b5cf6',
      description: 'System goal decomposition & plan management'
    },
    {
      id: 'medical',
      name: 'Medical Agent',
      emoji: '🚑',
      icon: Stethoscope,
      role: 'Severity & Trauma',
      color: '#ef4444',
      description: 'Victim count & hospital capacity verification'
    },
    {
      id: 'logistics',
      name: 'Logistics Agent',
      emoji: '📍',
      icon: Truck,
      role: 'Fleet Allocation',
      color: '#10b981',
      description: 'Ambulance discovery, ETA comparison & dispatch'
    },
    {
      id: 'traffic',
      name: 'Traffic Agent',
      emoji: '🚗',
      icon: Navigation,
      role: 'Route & ETA',
      color: '#3b82f6',
      description: 'Congestion monitoring & green-corridor rerouting'
    },
    {
      id: 'communication',
      name: 'Communication Agent',
      emoji: '📡',
      icon: Radio,
      role: 'Alert Dispatch',
      color: '#f59e0b',
      description: 'Police PCR, Traffic & Hospital trauma alerts'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={18} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>ARES AGENT FLEET</h2>
        </div>
        <span className="badge badge-active">5/5 OPERATIONAL</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {agents.map((agent) => {
          const IconComp = agent.icon;
          const isActive = activeAgent && activeAgent.toLowerCase().includes(agent.id);

          return (
            <div
              key={agent.id}
              style={{
                background: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                border: isActive ? `1px solid ${agent.color}` : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '12px',
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? `0 0 15px ${agent.color}33` : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{agent.emoji}</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{agent.name}</div>
                </div>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isActive ? agent.color : 'rgba(255,255,255,0.2)',
                    boxShadow: isActive ? `0 0 8px ${agent.color}` : 'none'
                  }}
                />
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: agent.color, marginBottom: '4px' }}>
                {agent.role}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                {agent.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
