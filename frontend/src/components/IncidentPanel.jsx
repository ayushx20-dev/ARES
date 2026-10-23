import React from 'react';
import { AlertCircle, MapPin, Users, Ambulance, Hospital, Navigation, Clock } from 'lucide-react';

export default function IncidentPanel({ incident, ambulance, hospital }) {
  if (!incident) {
    return (
      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <AlertCircle size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
        <p>No Active Emergency Incident. Trigger a scenario below.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="pulse-red" style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.5px' }}>ACTIVE EMERGENCY INCIDENT</h2>
        </div>
        <span className={incident.severity === 'CRITICAL' ? 'badge badge-critical' : 'badge badge-warning'}>
          {incident.severity || 'EVALUATING'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Incident Summary Card */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          borderLeft: '4px solid #ef4444',
          padding: '12px 14px',
          borderRadius: '6px'
        }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fca5a5', marginBottom: '4px' }}>
            {incident.description}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <MapPin size={14} color="#ef4444" />
            <span>{incident.location_name}</span>
          </div>
        </div>

        {/* Victims Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Users size={14} color="var(--accent-blue)" />
              TOTAL VICTIMS
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '2px' }}>
              {incident.victim_count} Persons
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <AlertCircle size={14} color="#ef4444" />
              CRITICAL TRAUMA
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444', marginTop: '2px' }}>
              {incident.critical_victim_count} Critical
            </div>
          </div>
        </div>

        {/* Dynamic Resource Allocation Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            AUTONOMOUS RESOURCE ALLOCATION
          </div>

          {/* Ambulance Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContain: 'space-between',
            background: 'rgba(255,255,255,0.03)',
            padding: '10px 12px',
            borderRadius: '8px',
            border: ambulance?.status === 'OFFLINE' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Ambulance size={20} color={ambulance?.status === 'OFFLINE' ? '#ef4444' : 'var(--accent-green)'} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Ambulance {ambulance?.id || incident.active_ambulance_id || 'Searching...'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {ambulance?.vehicle_number || 'Dispatch pending'}
                </div>
              </div>
            </div>
            {incident.eta_minutes && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                  <Clock size={14} />
                  ETA: {incident.eta_minutes}m
                </div>
              </div>
            )}
          </div>

          {/* Hospital Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.03)',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Hospital size={20} color="var(--accent-blue)" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {hospital?.name || 'City Central Trauma Center'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Trauma Bay Ready • Beds: {hospital?.available_beds ?? 4}
                </div>
              </div>
            </div>
          </div>

          {/* Route Status */}
          {incident.recommended_route && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#93c5fd'
            }}>
              <Navigation size={16} color="var(--accent-blue)" />
              <span>Corridor: <strong>{incident.recommended_route}</strong></span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
