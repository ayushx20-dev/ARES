import React, { useEffect, useRef } from 'react';
import { Clock, Wrench, AlertTriangle, CheckCircle2, RefreshCw, Cpu, Target, ArrowRight } from 'lucide-react';

export default function Timeline({ logs }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const renderLogContent = (log) => {
    const summary = log.summary || '';

    if (summary.includes('REPLANNING DECISION')) {
      const lines = summary.split('\n');
      return (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '8px',
          padding: '10px 12px',
          marginTop: '4px',
          boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{ fontWeight: 700, color: '#fde047', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={16} color="#f59e0b" />
            🧠 REPLANNING DECISION
          </div>
          {lines.slice(1).map((line, i) => (
            <div key={i} style={{ fontSize: '0.78rem', color: '#fef08a', margin: '3px 0', lineHeight: '1.4' }}>
              {line}
            </div>
          ))}
        </div>
      );
    }

    if (summary.includes('PLAN DELTA')) {
      const lines = summary.split('\n');
      return (
        <div style={{
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '8px',
          padding: '10px 12px',
          marginTop: '4px',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.15)'
        }}>
          <div style={{ fontWeight: 700, color: '#67e8f9', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={16} color="#06b6d4" />
            🎯 PLAN DELTA
          </div>
          {lines.slice(1).map((line, i) => (
            <div key={i} style={{
              fontSize: '0.78rem',
              color: line.includes('➔') ? '#67e8f9' : '#a5f3fc',
              margin: '3px 0',
              fontWeight: line.includes('➔') ? 700 : 400,
              lineHeight: '1.4'
            }}>
              {line}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>
        {summary}
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>AGENT ACTIVITY TIMELINE</h2>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {logs.length} Events Streamed
        </span>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingRight: '6px'
      }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Awaiting emergency activation. Logs will stream in real time...
          </div>
        ) : (
          logs.map((log, index) => {
            const isFailure = log.summary?.includes('DISRUPTIVE') || log.summary?.includes('UNAVAILABLE') || log.result === 'RESOURCE_UNAVAILABLE';
            const isReplanning = log.summary?.includes('REPLANNING DECISION') || log.result === 'TARGETED_REPLANNING';
            const isDelta = log.summary?.includes('PLAN DELTA') || log.result === 'PLAN_DELTA_COMPUTED';
            const isSuccess = log.result === 'SUCCESS' || log.result === 'PLAN_RECOVERED' || log.result === 'COMPLETED';

            let cardBg = 'rgba(255, 255, 255, 0.03)';
            let borderColor = 'rgba(255, 255, 255, 0.06)';
            let icon = <Clock size={16} color="var(--accent-blue)" />;

            if (isFailure) {
              cardBg = 'rgba(239, 68, 68, 0.15)';
              borderColor = 'rgba(239, 68, 68, 0.4)';
              icon = <AlertTriangle size={16} color="#ef4444" />;
            } else if (isReplanning) {
              cardBg = 'rgba(245, 158, 11, 0.08)';
              borderColor = 'rgba(245, 158, 11, 0.3)';
              icon = <Cpu size={16} color="#f59e0b" />;
            } else if (isDelta) {
              cardBg = 'rgba(6, 182, 212, 0.08)';
              borderColor = 'rgba(6, 182, 212, 0.3)';
              icon = <Target size={16} color="#06b6d4" />;
            } else if (isSuccess) {
              cardBg = 'rgba(16, 185, 129, 0.15)';
              borderColor = 'rgba(16, 185, 129, 0.4)';
              icon = <CheckCircle2 size={16} color="#10b981" />;
            }

            return (
              <div
                key={index}
                style={{
                  background: cardBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    {icon}
                    <span>{log.agent}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {log.timestamp}
                  </span>
                </div>

                {renderLogContent(log)}

                {log.tool && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--accent-blue)',
                    background: 'rgba(59, 130, 246, 0.08)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    width: 'fit-content',
                    marginTop: '2px'
                  }}>
                    <Wrench size={12} />
                    <span>Tool Invoked: <code>{log.tool}</code></span>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
