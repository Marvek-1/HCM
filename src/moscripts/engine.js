/**
 * ═══════════════════════════════════════════════════════════════════════════
 * engine.js — MoScript Core Runtime
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "MoScript Engine", layer: "core", version: "2026.03.12" }
 *
 * @capabilities
 *   - script_registration
 *   - event_trigger
 *   - result_collection
 *   - parallel_execution
 *
 * @intents
 *   - { id: "engine.register", input: "script_object", output: "void" }
 *   - { id: "engine.fire", input: "trigger_event", output: "result_array" }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * Half Code. Half Starlight. Half Syntax. Yes, that's 150%.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MoScriptEngine = {
  scripts: new Map(),

  register(script) {
    this.scripts.set(script.id, script);
  },

  async fire(trigger, inputs) {
    const results = [];
    for (const [id, script] of this.scripts) {
      if (script.trigger === trigger) {
        const result = await script.logic(inputs);
        results.push({
          id,
          name: script.name,
          result,
          voiceLine: script.voiceLine(result),
          sass: script.sass,
        });
      }
    }
    return results;
  },
};

export default MoScriptEngine;
