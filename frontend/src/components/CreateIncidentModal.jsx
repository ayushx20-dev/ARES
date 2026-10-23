import React, { useState } from 'react';
import { ShieldAlert, MapPin, Users, AlertCircle, X, Send, Search, Loader } from 'lucide-react';

export default function CreateIncidentModal({ isOpen, onClose, onSubmit }) {
  const [description, setDescription] = useState('Multi-vehicle Collision near Vijay Nagar Square');
  const [locationName, setLocationName] = useState('Vijay Nagar Square, Indore');
  const [victimCount, setVictimCount] = useState(3);
  const [criticalCount, setCriticalCount] = useState(2);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedStatus, setGeocodedStatus] = useState('');

  if (!isOpen) return null;

  const geocodeAndSubmit = async (e) => {
    e.preventDefault();
    setIsGeocoding(true);
    setGeocodedStatus('Geocoding location via OpenStreetMap...');

    let lat = 22.7533;
    let lng = 75.8937;

    try {
      // Query OpenStreetMap Nominatim API for real geographic coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        lat = parseFloat(results[0].lat);
        lng = parseFloat(results[0].lon);
        setGeocodedStatus(`Resolved coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } else {
        setGeocodedStatus('Location resolved to city region.');
      }
    } catch (err) {
      console.warn("Geocoding failed, using local coordinates fallback:", err);
    } finally {
      setIsGeocoding(false);
      onSubmit({
        description,
        location_name: locationName,
        victim_count: parseInt(victimCount, 10),
        critical_victim_count: parseInt(criticalCount, 10),
        latitude: lat,
        longitude: lng
      });
      onClose();
    }
  };

  const presets = [
    { label: '🚘 Vijay Nagar Collision', loc: 'Vijay Nagar Square, Indore', desc: 'Multi-vehicle highway accident on Ring Road Expressway', victims: 3, critical: 2 },
    { label: '🔥 MG Road Fire', loc: 'MG Road, Indore', desc: 'Structural fire reported at MG Road Shopping Complex', victims: 5, critical: 3 },
    { label: '🏬 Palasia Square Crash', loc: 'Palasia Square, Indore', desc: 'Passenger bus rollover accident near Palasia Square', victims: 4, critical: 2 }
  ];

  const applyPreset = (preset) => {
    setDescription(preset.desc);
    setLocationName(preset.loc);
    setVictimCount(preset.victims);
    setCriticalCount(preset.critical);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '28px',
        position: 'relative',
        boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '8px' }}>
              <ShieldAlert size={22} color="#ef4444" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>REPORT EMERGENCY INCIDENT</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Real-world OpenStreetMap Geocoding & Multi-Agent Autonomous Dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            REAL-WORLD CITY PRESETS
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  cursor: 'pointer'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Incident Form */}
        <form onSubmit={geocodeAndSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
              INCIDENT DESCRIPTION & NATURE OF EMERGENCY
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. High speed crash involving 2 passenger vehicles"
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Location Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
              REAL LOCATION / ADDRESS NAME (GEOCODED VIA OPENSTREETMAP)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Vijay Nagar Square, Indore"
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '10px 14px 10px 36px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <MapPin size={16} color="var(--accent-red)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
            {geocodedStatus && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginTop: '4px' }}>
                {geocodedStatus}
              </div>
            )}
          </div>

          {/* Victims Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                TOTAL VICTIMS
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={victimCount}
                onChange={(e) => setVictimCount(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#fca5a5' }}>
                CRITICAL TRAUMA VICTIMS
              </label>
              <input
                type="number"
                min="0"
                max={victimCount}
                required
                value={criticalCount}
                onChange={(e) => setCriticalCount(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#ef4444',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-main)',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGeocoding}
              style={{
                flex: 2,
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                border: 'none',
                color: '#fff',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: isGeocoding ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
              }}
            >
              {isGeocoding ? <Loader size={16} className="spin-slow" /> : <Send size={16} />}
              {isGeocoding ? 'RESOLVING GEOCODING...' : 'GEOCODE & LAUNCH ARES'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
