/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MoScriptKnowledgeHub.jsx — Interactive Learning Center
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "Knowledge Hub", layer: "osl", version: "2026.03.12" }
 *
 * @capabilities
 *   - interactive_learning
 *   - protocol_training
 *   - accessibility_support
 *   - progress_tracking
 *
 * @intents
 *   - { id: "knowledge.browse", input: "category", output: "learning_modules" }
 *   - { id: "knowledge.assist", input: "query",    output: "ai_explanation" }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * "Knowledge is the ultimate emergency supply."
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import MoScriptConsole from './MoScriptConsole';

function MoScriptKnowledgeHub() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const learningModules = [
    {
      id: 'emergency-response-basics',
      title: 'Emergency Response Fundamentals',
      category: 'Foundation',
      duration: '15 min',
      difficulty: 'Beginner',
      type: 'interactive',
      description: 'Learn the core principles of emergency response and WHO protocols',
      icon: '📚'
    },
    {
      id: 'equipment-identification',
      title: 'Equipment Identification & Usage',
      category: 'Equipment',
      duration: '20 min',
      difficulty: 'Intermediate',
      type: 'visual',
      description: 'Visual guide to identifying and properly using emergency equipment',
      icon: '🏥'
    },
    {
      id: 'maintenance-protocols',
      title: 'Equipment Maintenance Protocols',
      category: 'Maintenance',
      duration: '25 min',
      difficulty: 'Advanced',
      type: 'simulation',
      description: 'Hands-on simulation of equipment maintenance procedures',
      icon: '🛠️'
    }
  ];

  const filteredModules = learningModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || module.category.toLowerCase() === selectedFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="moscript-knowledge-hub">
      <style>{`
        .moscript-knowledge-hub {
          display: flex;
          height: calc(100vh - 80px);
          background: #0a0a0f;
          color: #e8e8e8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .hub-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .hub-header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 24px;
          border-bottom: 2px solid #d4af37;
        }

        .hub-title {
          font-size: 28px;
          font-weight: 700;
          color: #d4af37;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .hub-subtitle {
          font-size: 14px;
          color: #888;
          font-family: 'Courier New', monospace;
        }

        .hub-controls {
          display: flex;
          gap: 16px;
          padding: 16px 24px;
          background: #0f0f15;
          border-bottom: 1px solid #2a2a3e;
          align-items: center;
        }

        .hub-search {
          flex: 1;
          padding: 8px 16px;
          background: #1a1a2e;
          border: 1px solid #2a2a3e;
          border-radius: 6px;
          color: #e8e8e8;
        }

        .hub-filter {
          padding: 8px 12px;
          background: #1a1a2e;
          border: 1px solid #2a2a3e;
          border-radius: 6px;
          color: #e8e8e8;
        }

        .hub-nav {
          display: flex;
          gap: 16px;
          padding: 0 24px;
          background: #0f0f15;
          border-bottom: 1px solid #2a2a3e;
        }

        .hub-nav-item {
          padding: 12px 16px;
          color: #888;
          cursor: pointer;
          font-weight: 600;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .hub-nav-item:hover {
          color: #d4af37;
        }

        .hub-nav-item.active {
          color: #d4af37;
          border-bottom-color: #d4af37;
        }

        .hub-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .module-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .module-card {
          background: #1a1a2e;
          border: 1px solid #2a2a3e;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          transition: all 0.2s;
          cursor: pointer;
        }

        .module-card:hover {
          border-color: #d4af37;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }

        .module-icon {
          font-size: 32px;
          margin-bottom: 16px;
        }

        .module-category {
          font-size: 11px;
          color: #d4af37;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .module-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #e8e8e8;
        }

        .module-description {
          font-size: 14px;
          color: #aaa;
          line-height: 1.5;
          margin-bottom: 20px;
          flex: 1;
        }

        .module-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #2a2a3e;
          padding-top: 16px;
        }

        .start-btn {
          padding: 8px 16px;
          background: #d4af37;
          color: #0a0a0f;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          cursor: pointer;
        }

        .start-btn:hover {
          background: #e8c04d;
        }

        .ai-assistant-view {
          max-width: 800px;
          margin: 0 auto;
          background: #1a1a2e;
          border-radius: 12px;
          border: 1px solid #2a2a3e;
          padding: 24px;
        }

        .ai-message {
          margin-bottom: 20px;
          padding: 16px;
          border-radius: 8px;
        }

        .ai-message.bot {
          background: #0f0f15;
          border-left: 4px solid #d4af37;
        }

        .ai-input-group {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .ai-input {
          flex: 1;
          padding: 12px 16px;
          background: #0f0f15;
          border: 1px solid #2a2a3e;
          border-radius: 8px;
          color: #e8e8e8;
        }

        .ai-send-btn {
          padding: 0 24px;
          background: #d4af37;
          color: #0a0a0f;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>

      <div className="hub-main">
        <div className="hub-header">
          <h1 className="hub-title">🧠 Knowledge Hub</h1>
          <div className="hub-subtitle">Interactive Intelligence & Protocol Training Center</div>
        </div>

        <div className="hub-controls">
          <input 
            type="text" 
            className="hub-search" 
            placeholder="Search modules..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select 
            className="hub-filter"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="foundation">Foundation</option>
            <option value="equipment">Equipment</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="hub-nav">
          <div className={`hub-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</div>
          <div className={`hub-nav-item ${activeTab === 'ai-tutor' ? 'active' : ''}`} onClick={() => setActiveTab('ai-tutor')}>AI Tutor</div>
          <div className={`hub-nav-item ${activeTab === 'visual' ? 'active' : ''}`} onClick={() => setActiveTab('visual')}>Visual Library</div>
          <div className={`hub-nav-item ${activeTab === 'simulations' ? 'active' : ''}`} onClick={() => setActiveTab('simulations')}>Simulations</div>
        </div>

        <div className="hub-content">
          {activeTab === 'overview' && (
            <div className="module-grid">
              {filteredModules.length > 0 ? (
                filteredModules.map(module => (
                  <div key={module.id} className="module-card">
                    <div className="module-icon">{module.icon}</div>
                    <div className="module-category">{module.category}</div>
                    <div className="module-title">{module.title}</div>
                    <div className="module-description">{module.description}</div>
                    <div className="module-meta">
                      <span>⏱ {module.duration} | {module.difficulty}</span>
                      <button className="start-btn">Start Module</button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '40px', color: '#666' }}>
                  No modules found matching your search.
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai-tutor' && (
            <div className="ai-assistant-view">
              <div className="ai-message bot">
                Hello. I am the MoScript Intelligence Assistant. I can help you with equipment protocols, maintenance schedules, and emergency response guidelines. What would you like to know?
              </div>
              <div className="ai-input-group">
                <input type="text" className="ai-input" placeholder="Ask about WHO protocols, cold chain maintenance, or PPE requirements..." />
                <button className="ai-send-btn">Ask</button>
              </div>
            </div>
          )}

          {(activeTab === 'visual' || activeTab === 'simulations') && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
              <div>Module currently being compiled by MoScript Engine...</div>
            </div>
          )}
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

export default MoScriptKnowledgeHub;
