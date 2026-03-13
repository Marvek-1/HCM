/**
 * ═══════════════════════════════════════════════════════════════════════════
 * index.js — MoScript Registry
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "MoScript Registry", layer: "core", version: "2026.03.12" }
 *
 * @capabilities
 *   - script_auto_registration
 *   - engine_initialization
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * "All scripts report here. No exceptions."
 * ═══════════════════════════════════════════════════════════════════════════
 */

import MoScriptEngine from './engine.js';
import moOslCatbridge001 from './mo-osl-catbridge-001.js';
import moOslSignalbridge002 from './mo-osl-signalbridge-002.js';
import moOslHarmonise005 from './mo-osl-harmonise-005.js';

// Register all MoScripts
MoScriptEngine.register(moOslCatbridge001);
MoScriptEngine.register(moOslSignalbridge002);
MoScriptEngine.register(moOslHarmonise005);

export default MoScriptEngine;
