/**
 * moscript://codex/v1
 * id:       mo-osl-registry
 * name:     MoScript Registry — All Scripts Report Here
 * element:  🜂
 * trigger:  REGISTRY_INIT
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "All scripts report here. No exceptions."
 */

import MoScriptEngine from './engine.js';
import moOslCatbridge001 from './mo-osl-catbridge-001.js';
import moOslSignalbridge002 from './mo-osl-signalbridge-002.js';
import moOslSessiongate001 from './mo-osl-sessiongate-001.js';
import moOslOrdergate003 from './mo-osl-ordergate-003.js';
import moOslFulfilltrack004 from './mo-osl-fulfilltrack-004.js';
import moOslHarmonise005 from './mo-osl-harmonise-005.js';
import moOslAssetgate006 from './mo-osl-assetgate-006.js';
import moOslAnalyticsPulse001 from './mo-osl-analytics-pulse-001.js';

// Register all 8 MoScripts — the nervous system
MoScriptEngine.register(moOslCatbridge001);
MoScriptEngine.register(moOslSignalbridge002);
MoScriptEngine.register(moOslSessiongate001);
MoScriptEngine.register(moOslOrdergate003);
MoScriptEngine.register(moOslFulfilltrack004);
MoScriptEngine.register(moOslHarmonise005);
MoScriptEngine.register(moOslAssetgate006);
MoScriptEngine.register(moOslAnalyticsPulse001);

export default MoScriptEngine;

// Re-export individual scripts for direct access
export {
  moOslCatbridge001,
  moOslSignalbridge002,
  moOslSessiongate001,
  moOslOrdergate003,
  moOslFulfilltrack004,
  moOslHarmonise005,
  moOslAssetgate006,
  moOslAnalyticsPulse001,
};
