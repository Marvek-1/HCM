/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MoScriptFleetView.jsx — Emergency Response Fleet Management
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "Fleet Commander", layer: "osl", version: "2026.03.12" }
 *
 * @capabilities
 *   - vehicle_tracking
 *   - maintenance_scheduling
 *   - deployment_readiness
 *
 * @intents
 *   - { id: "fleet.status",  input: "vehicleId", output: "readiness_report" }
 *   - { id: "fleet.deploy",  input: "missionId", output: "assigned_vehicles" }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * "Wheels on the ground. Hope in the cargo."
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import MoScriptConsole from './MoScriptConsole';

function MoScriptFleetView() {
  const [activeFilter, setActiveFilter] = useState('all');

  const fleet = [
    { id: 'V001', name: 'Toyota Hilux 4x4', status: 'Ready', location: 'NBO Hub', type: 'Support', icon: '🛻' },
    { id: 'V002', name: 'Toyota Hiace Ambulance', status: 'In Service', location: 'Nairobi Central', type: 'Medical', icon: '🚑' },
    { id: 'V003', name: 'Supply Transport Truck', status: 'Ready', location: 'DKR Hub', type: 'Logistics', icon: '🚚' },
    { id: 'V004', name: 'Land Cruiser (Cold Chain)', status: 'Maintenance', location: 'NBO Workshop', type: 'Specialized', icon: '❄️' },
    { id: 'V005', name: 'Mobile Medical Unit', status: 'Deployed', location: 'Turkana Region', type: 'Medical', icon: '🏥' },
  ];

  const filteredFleet = activeFilter === 'all' ? fleet : fleet.filter(v => v.type.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="moscript-fleet-view">
      <style>{`
        .moscript-fleet-view {
          display: flex;
          height: calc(100vh - 80px);
          background: #0a0a0f;
          color: #e8e8e8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .fleet-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .fleet-header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 24px;
          border-bottom: 2px solid #d4af37;
        }

        .fleet-title {
          font-size: 28px;
          font-weight: 700;
          color: #d4af37;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .fleet-subtitle {
          font-size: 14px;
          color: #888;
          font-family: 'Courier New', monospace;
        }

        .fleet-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .fleet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .vehicle-card {
          background: #1a1a2e;
          border: 1px solid #2a2a3e;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          transition: all 0.2s;
        }

        .vehicle-card:hover {
          border-color: #d4af37;
          transform: translateY(-4px);
        }

        .vehicle-icon {
          font-size: 40px;
          margin-bottom: 16px;
        }

        .vehicle-name {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .vehicle-id {
          font-size: 12px;
          color: #d4af37;
          font-family: 'Courier New', monospace;
          margin-bottom: 12px;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-ready { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
        .status-inservice { background: rgba(96, 165, 250, 0.1); color: #60a5fa; }
        .status-maintenance { background: rgba(248, 113, 113, 0.1); color: #f87171; }
        .status-deployed { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }

        .vehicle-meta {
          margin-top: 16px;
          font-size: 13px;
          color: #aaa;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
      `}</style>

      <div className="fleet-main">
        <div className="fleet-header">
          <h1 className="fleet-title">🚚 Fleet Management</h1>
          <div className="fleet-subtitle">mo-osl-fleet-001 | Operational Readiness & Deployment Tracking</div>
        </div>

        <div className="fleet-controls" style={{ padding: '16px 24px', background: '#0f0f15', borderBottom: '1px solid #2a2a3e', display: 'flex', gap: '12px' }}>
          {['all', 'Support', 'Medical', 'Logistics', 'Specialized'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '8px 16px',
                background: activeFilter === filter ? '#d4af37' : '#1a1a2e',
                color: activeFilter === filter ? '#0a0a0f' : '#e8e8e8',
                border: '1px solid #2a2a3e',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <div className="fleet-content">
          <div className="fleet-grid">
            {filteredFleet.map(vehicle => (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-icon">{vehicle.icon}</div>
                <div className="vehicle-name">{vehicle.name}</div>
                <div className="vehicle-id">{vehicle.id}</div>
                <div>
                  <span className={`status-badge status-${vehicle.status.toLowerCase().replace(' ', '')}`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="vehicle-meta">
                  <div className="meta-row">
                    <span>Location:</span>
                    <span>{vehicle.location}</span>
                  </div>
                  <div className="meta-row">
                    <span>Type:</span>
                    <span>{vehicle.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MoScriptConsole 
        logs={[]}
        cart={[]}
        onCheckout={() => {}}
      />
    </div>
  );
}

export default MoScriptFleetView;
