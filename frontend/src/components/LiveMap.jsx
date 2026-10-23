import React, { useEffect, useRef } from 'react';
import { Navigation, AlertTriangle } from 'lucide-react';

export default function LiveMap({ incident, activeAmbulanceId, activeHospitalId, isReplanning, failedAmbulanceId }) {
  const canvasRef = useRef(null);

  // Map Coordinates System (Normalized canvas positions)
  const mapNodes = {
    incident: { x: 420, y: 180, label: incident?.location_name ? `Incident (${incident.location_name})` : 'Incident (Ring Road)', type: 'incident' },
    A17: { x: 120, y: 120, label: 'Depot A17', type: 'ambulance', id: 'A17' },
    A21: { x: 140, y: 320, label: 'Depot A21', type: 'ambulance', id: 'A21' },
    hospital: { x: 680, y: 280, label: 'City Trauma Center', type: 'hospital', id: 'HOSP-01' }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let dashOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Connecting Roads Infrastructure
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 4;
      
      // Road 1: A17 to Incident
      ctx.beginPath();
      ctx.moveTo(mapNodes.A17.x, mapNodes.A17.y);
      ctx.lineTo(mapNodes.incident.x, mapNodes.incident.y);
      ctx.stroke();

      // Road 2: A21 to Incident
      ctx.beginPath();
      ctx.moveTo(mapNodes.A21.x, mapNodes.A21.y);
      ctx.lineTo(mapNodes.incident.x, mapNodes.incident.y);
      ctx.stroke();

      // Road 3: Incident to Hospital
      ctx.beginPath();
      ctx.moveTo(mapNodes.incident.x, mapNodes.incident.y);
      ctx.lineTo(mapNodes.hospital.x, mapNodes.hospital.y);
      ctx.stroke();

      // Draw Active Emergency Route Corridor with Animation
      dashOffset -= 0.8;
      ctx.lineWidth = 5;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = dashOffset;

      if (failedAmbulanceId === 'A17') {
        // Red failed line for A17
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.beginPath();
        ctx.moveTo(mapNodes.A17.x, mapNodes.A17.y);
        ctx.lineTo(mapNodes.incident.x, mapNodes.incident.y);
        ctx.stroke();
      }

      // Active selected ambulance route (e.g. A21 or A17 if active)
      const currentAmbNode = activeAmbulanceId === 'A21' ? mapNodes.A21 : mapNodes.A17;
      if (activeAmbulanceId && activeAmbulanceId !== failedAmbulanceId) {
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(currentAmbNode.x, currentAmbNode.y);
        ctx.lineTo(mapNodes.incident.x, mapNodes.incident.y);
        ctx.lineTo(mapNodes.hospital.x, mapNodes.hospital.y);
        ctx.stroke();
      }

      ctx.setLineDash([]); // Reset line dash

      // Render Nodes (Incident, Ambulances, Hospital)
      // 1. Incident Marker
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.arc(mapNodes.incident.x, mapNodes.incident.y, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(mapNodes.incident.x, mapNodes.incident.y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = '11px Outfit, sans-serif';
      ctx.fillText(mapNodes.incident.label, mapNodes.incident.x - 45, mapNodes.incident.y + 36);

      // 2. Ambulance A17
      const isA17Failed = failedAmbulanceId === 'A17';
      ctx.fillStyle = isA17Failed ? '#ef4444' : (activeAmbulanceId === 'A17' ? '#10b981' : '#3b82f6');
      ctx.beginPath();
      ctx.arc(mapNodes.A17.x, mapNodes.A17.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(isA17Failed ? 'A17 (OFFLINE)' : 'A17 (ALS)', mapNodes.A17.x - 30, mapNodes.A17.y - 18);

      // 3. Ambulance A21
      ctx.fillStyle = activeAmbulanceId === 'A21' ? '#10b981' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(mapNodes.A21.x, mapNodes.A21.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText('A21 (ALS)', mapNodes.A21.x - 20, mapNodes.A21.y + 26);

      // 4. Hospital Node
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.beginPath();
      ctx.arc(mapNodes.hospital.x, mapNodes.hospital.y, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(mapNodes.hospital.x, mapNodes.hospital.y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.fillText(mapNodes.hospital.label, mapNodes.hospital.x - 45, mapNodes.hospital.y + 36);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [activeAmbulanceId, activeHospitalId, failedAmbulanceId, isReplanning, incident]);

  return (
    <div className="map-canvas-container" style={{ position: 'relative', height: '360px' }}>
      <div className="map-grid-overlay" />
      
      {/* Map Header Overlay */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.85)',
        padding: '6px 12px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '0.8rem',
        fontWeight: 600
      }}>
        <Navigation size={14} color="var(--accent-blue)" />
        LIVE TACTICAL MAP • INDORE REGION
      </div>

      {/* Replanning Warning Banner */}
      {isReplanning && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(245, 158, 11, 0.9)',
          color: '#000',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)'
        }}>
          <AlertTriangle size={16} />
          AUTONOMOUS REPLANNING IN PROGRESS...
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={800}
        height={360}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
