/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MoScriptConsole.jsx — Reusable MoScript Console Component
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "MoScript Console", layer: "ui", version: "2026.03.12" }
 *
 * @capabilities
 *   - moscript_log_display
 *   - signal_monitoring
 *   - real_time_status
 *   - expandable_sidebar
 *
 * @intents
 *   - { id: "console.display", input: "log_array", output: "rendered_ui" }
 *   - { id: "console.toggle", input: "void", output: "expanded_state" }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * "I show you what the scripts see."
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { diseaseSignals, getSignalSummary } from '../data/signals';

function MoScriptConsole({ logs = [], cart = [], onCheckout, children }) {
  const [expanded, setExpanded] = useState(false);
  const signalSummary = getSignalSummary();

  return (
    <div className="moscript-console" style={{
      width: expanded ? '400px' : '320px',
      background: '#0f0f15',
      borderLeft: '2px solid #d4af37',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s',
    }}>
      <style>{`
        .console-header {
          padding: 16px;
          background: #1a1a2e;
          border-bottom: 1px solid #2a2a3e;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .console-title {
          font-size: 14px;
          font-weight: 700;
          color: #d4af37;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .console-toggle {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
        }

        .console-toggle:hover {
          color: #d4af37;
        }

        .console-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .console-section {
          margin-bottom: 20px;
        }

        .console-section-title {
          font-size: 12px;
          font-weight: 600;
          color: #d4af37;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .signal-item {
          background: #1a1a2e;
          border-left: 3px solid #ff4444;
          padding: 10px;
          margin-bottom: 8px;
          border-radius: 4px;
        }

        .signal-item.severity-5 {
          border-left-color: #ff0000;
          background: rgba(255, 0, 0, 0.05);
        }

        .signal-item.severity-4 {
          border-left-color: #ff4444;
        }

        .signal-item.severity-3 {
          border-left-color: #fbbf24;
        }

        .signal-disease {
          font-size: 13px;
          font-weight: 600;
          color: #e8e8e8;
          margin-bottom: 4px;
        }

        .signal-meta {
          font-size: 11px;
          color: #888;
          font-family: 'Courier New', monospace;
        }

        .signal-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 8px;
        }

        .stat-box {
          background: #2a2a3e;
          padding: 8px;
          border-radius: 4px;
          text-align: center;
        }

        .stat-label {
          font-size: 10px;
          color: #888;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 700;
          color: #e8e8e8;
          font-family: 'Courier New', monospace;
        }

        .log-item {
          background: #1a1a2e;
          border-left: 3px solid #d4af37;
          padding: 10px;
          margin-bottom: 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .log-script-name {
          font-weight: 600;
          color: #d4af37;
          margin-bottom: 4px;
        }

        .log-voice-line {
          color: #e8e8e8;
          margin-bottom: 4px;
        }

        .log-sass {
          color: #888;
          font-style: italic;
          font-size: 11px;
        }

        .cart-summary {
          background: #1a1a2e;
          padding: 12px;
          border-radius: 6px;
          margin-top: 16px;
        }

        .cart-summary-title {
          font-size: 12px;
          color: #888;
          margin-bottom: 8px;
        }

        .cart-summary-value {
          font-size: 24px;
          font-weight: 700;
          color: #d4af37;
          font-family: 'Courier New', monospace;
        }

        .checkout-btn {
          width: 100%;
          padding: 12px;
          background: #d4af37;
          border: none;
          border-radius: 6px;
          color: #0a0a0f;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          margin-top: 12px;
          transition: all 0.2s;
        }

        .checkout-btn:hover {
          background: #e8c04d;
        }

        .checkout-btn:disabled {
          background: #2a2a3e;
          color: #666;
          cursor: not-allowed;
        }
      `}</style>

      <div className="console-header">
        <div className="console-title">MoScript Console</div>
        <button
          className="console-toggle"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? '◀' : '▶'}
        </button>
      </div>

      <div className="console-content">
        {/* Active Signals Section */}
        <div className="console-section">
          <div className="console-section-title">Active Signals</div>
          {diseaseSignals.filter(s => s.active).map(signal => (
            <div key={signal.id} className={`signal-item severity-${signal.severity}`}>
              <div className="signal-disease">{signal.disease}</div>
              <div className="signal-meta">
                {signal.country} | Severity {signal.severity}/5
              </div>
              <div className="signal-stats">
                <div className="stat-box">
                  <div className="stat-label">Cases</div>
                  <div className="stat-value">{signal.cases?.toLocaleString() || 'N/A'}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Deaths</div>
                  <div className="stat-value">{signal.deaths?.toLocaleString() || 'N/A'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MoScript Logs Section */}
        {logs.length > 0 && (
          <div className="console-section">
            <div className="console-section-title">MoScript Activity</div>
            {logs.map((log, idx) => (
              <div key={idx} className="log-item">
                <div className="log-script-name">{log.name}</div>
                <div className="log-voice-line">{log.voiceLine}</div>
                {log.sass && <div className="log-sass">"{log.sass}"</div>}
              </div>
            ))}
          </div>
        )}

        {/* System Status Section */}
        <div className="console-section">
          <div className="console-section-title">System Status</div>
          <div className="signal-stats">
            <div className="stat-box">
              <div className="stat-label">Active Protocols</div>
              <div className="stat-value">{signalSummary.active}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Emergency</div>
              <div className="stat-value" style={{ color: '#ff4444' }}>{signalSummary.emergency}</div>
            </div>
          </div>
        </div>

        {/* Cart Summary Section */}
        <div className="console-section">
          <div className="cart-summary">
            <div className="cart-summary-title">Cart Items</div>
            <div className="cart-summary-value">{cart.length}</div>
            <button
              className="checkout-btn"
              onClick={onCheckout}
              disabled={cart.length === 0}
            >
              Create Order →
            </button>
          </div>
        </div>

        {/* Additional Content Slot */}
        {children}
      </div>
    </div>
  );
}

export default MoScriptConsole;
