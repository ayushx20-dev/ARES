import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import IncidentPanel from './components/IncidentPanel';
import LiveMap from './components/LiveMap';
import AgentPanel from './components/AgentPanel';
import Timeline from './components/Timeline';
import DemoControls from './components/DemoControls';
import CreateIncidentModal from './components/CreateIncidentModal';

const API_BASE = 'http://localhost:8000/api';
const WS_BASE = 'ws://localhost:8000/ws/incidents';

export default function App() {
  const [incident, setIncident] = useState(null);
  const [ambulance, setAmbulance] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [logs, setLogs] = useState([]);
  const [systemState, setSystemState] = useState('IDLE');
  const [activeAgent, setActiveAgent] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [failedAmbulanceId, setFailedAmbulanceId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const wsRef = useRef(null);

  // Initialize & Listen to WebSocket Real-time events
  const connectWebSocket = (incidentId) => {
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(`${WS_BASE}/${incidentId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Event Received:", data);

      if (data.type === 'COT_EVENT') {
        setActiveAgent(data.agent);
        setLogs((prev) => [...prev, data]);
        fetchIncident(incidentId);
      } else if (data.type === 'STATE_CHANGE') {
        setSystemState(data.status);
      } else if (data.type === 'RESOURCE_FAILURE') {
        setFailedAmbulanceId(data.ambulance_id);
      } else if (data.type === 'COORDINATION_COMPLETE') {
        setSystemState('COMPLETED');
        fetchIncident(incidentId);
        fetchAmbulance(data.ambulance_id);
      }
    };
  };

  const fetchIncident = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}`);
      if (res.ok) {
        const data = await res.json();
        setIncident(data);
        if (data.active_ambulance_id) fetchAmbulance(data.active_ambulance_id);
        if (data.active_hospital_id) fetchHospital(data.active_hospital_id);
      }
    } catch (err) {
      console.error("Error fetching incident:", err);
    }
  };

  const fetchAmbulance = async (ambId) => {
    try {
      const res = await fetch(`${API_BASE}/ambulances/${ambId}`);
      if (res.ok) {
        const data = await res.json();
        setAmbulance(data);
      }
    } catch (err) {
      console.error("Error fetching ambulance:", err);
    }
  };

  const fetchHospital = async (hospId) => {
    try {
      const res = await fetch(`${API_BASE}/hospitals/${hospId}`);
      if (res.ok) {
        const data = await res.json();
        setHospital(data);
      }
    } catch (err) {
      console.error("Error fetching hospital:", err);
    }
  };

  // Launch Golden Demo Flow
  const handleLaunchDemo = async () => {
    setLogs([]);
    setFailedAmbulanceId(null);
    setSystemState('INITIALIZING');

    try {
      // 1. Create Incident
      const createRes = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'High-speed Multi-vehicle Collision on Ring Road Expressway',
          location_name: 'Ring Road Junction, Indore',
          latitude: 22.7196,
          longitude: 75.8577,
          victim_count: 3,
          critical_victim_count: 2
        })
      });

      const incidentData = await createRes.json();
      setIncident(incidentData);

      // 2. Connect WebSocket
      connectWebSocket(incidentData.id);

      // 3. Activate ARES Autonomous Agent Orchestration
      await fetch(`${API_BASE}/incidents/${incidentData.id}/activate`, { method: 'POST' });
    } catch (err) {
      console.error("Failed to launch demo:", err);
    }
  };

  // Launch Custom Incident Flow
  const handleCreateCustomIncident = async (customData) => {
    setLogs([]);
    setFailedAmbulanceId(null);
    setSystemState('INITIALIZING');

    try {
      // 1. Create Custom Incident
      const createRes = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customData)
      });

      const incidentData = await createRes.json();
      setIncident(incidentData);

      // 2. Connect WebSocket
      connectWebSocket(incidentData.id);

      // 3. Activate ARES Autonomous Agent Orchestration
      await fetch(`${API_BASE}/incidents/${incidentData.id}/activate`, { method: 'POST' });
    } catch (err) {
      console.error("Failed to launch custom incident:", err);
    }
  };

  // Trigger Simulated Resource Failure (HERO FEATURE)
  const handleSimulateFailure = async () => {
    if (!incident || !incident.active_ambulance_id) return;
    const targetAmbId = incident.active_ambulance_id;

    try {
      await fetch(`${API_BASE}/incidents/${incident.id}/simulate-failure?ambulance_id=${targetAmbId}`, {
        method: 'POST'
      });
    } catch (err) {
      console.error("Failed to simulate failure:", err);
    }
  };

  // Reset Demo
  const handleReset = () => {
    setIncident(null);
    setAmbulance(null);
    setHospital(null);
    setLogs([]);
    setSystemState('IDLE');
    setActiveAgent('');
    setFailedAmbulanceId(null);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* Top Header */}
      <Header
        systemState={systemState}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onReset={handleReset}
        onOpenModal={() => setIsModalOpen(true)}
      />

      {/* Main Responsive Grid Layout */}
      <div className="dashboard-grid">
        
        {/* Left Column: Active Incident Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <IncidentPanel incident={incident} ambulance={ambulance} hospital={hospital} />
        </div>

        {/* Center Column: Tactical Map & Agent Fleet Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <LiveMap
            incident={incident}
            activeAmbulanceId={ambulance?.id || incident?.active_ambulance_id}
            activeHospitalId={hospital?.id || incident?.active_hospital_id}
            isReplanning={systemState === 'REPLANNING'}
            failedAmbulanceId={failedAmbulanceId}
          />
          <AgentPanel activeAgent={activeAgent} />
        </div>

        {/* Right Column: Live Streaming Activity Timeline */}
        <div style={{ height: '100%' }}>
          <Timeline logs={logs} />
        </div>

      </div>

      {/* Bottom Demo Controls */}
      <DemoControls
        onLaunchDemo={handleLaunchDemo}
        onSimulateFailure={handleSimulateFailure}
        onOpenModal={() => setIsModalOpen(true)}
        isRunning={systemState !== 'IDLE' && systemState !== 'COMPLETED' && systemState !== 'FAILED'}
        currentIncidentId={incident?.id}
      />

      {/* Create / Report Custom Incident Modal */}
      <CreateIncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCustomIncident}
      />

    </div>
  );
}
