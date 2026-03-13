/**
 * ═══════════════════════════════════════════════════════════════════════════
 * mo-osl-catbridge-001 — Catalogue Bridge
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "Catalogue Bridge", layer: "osl", version: "2026.03.12" }
 *
 * @capabilities
 *   - commodity_to_protocol_mapping
 *   - emergency_kit_validation
 *   - protocol_compliance_check
 *
 * @intents
 *   - { id: "catalogue.lookup", input: "emergencyType", output: "protocol_kit" }
 *   - { id: "catalogue.validate", input: "itemName+emergencyType", output: "match_result" }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * "I don't guess protocols. I know them."
 * ═══════════════════════════════════════════════════════════════════════════
 */

const moOslCatbridge001 = {
  id: "mo-osl-catbridge-001",
  name: "Catalogue Bridge",
  trigger: "COMMODITY_LOOKUP",
  inputs: ["itemName", "emergencyType", "hub"],
  
  logic: ({ itemName, emergencyType }) => {
    const protocolMap = {
      Cholera: [
        "ORS Sachets (WHO Formula)",
        "IV Ringer Lactate Solution",
        "Doxycycline 100mg Tablets",
        "Cholera Rapid Diagnostic Test",
        "Chlorine 0.5% Solution (HTH)",
        "Nitrile Examination Gloves",
      ],
      "Ebola": [
        "Ebola Specimen Triple Packaging Kit",
        "Tyvek Coverall Suit (PPE)",
        "Nitrile Examination Gloves",
        "Chlorine 0.5% Solution (HTH)",
        "Body Bag (Infection Control)",
      ],
      "Mpox": [
        "Mpox Specimen Collection Kit",
        "Tyvek Coverall Suit (PPE)",
        "Nitrile Examination Gloves",
        "Tecovirimat 200mg (TPOXX)",
      ],
      "Measles": [
        "Measles Vaccine (MR)",
        "Vaccine Carrier (Cold Chain)",
        "Auto-Disable Syringes 0.5ml",
        "Vitamin A 200,000 IU Capsules",
      ],
      "Yellow Fever": [
        "Yellow Fever Vaccine (17D)",
        "Insecticide-Treated Bed Nets",
      ],
      "Malaria": [
        "Artemether-Lumefantrine (ACT)",
        "Malaria Rapid Diagnostic Test (RDT)",
        "Insecticide-Treated Bed Nets",
      ],
    };

    const kits = protocolMap[emergencyType] || [];
    const match = kits.includes(itemName);
    
    return {
      match,
      kits,
      emergencyType,
      itemName,
      protocolMapped: true,
      confidence: match ? 1.0 : 0.0,
    };
  },

  voiceLine: (r) =>
    r.match
      ? `✓ Commodity mapped to ${r.emergencyType} protocol. Proceed.`
      : `⚠ Item not in standard ${r.emergencyType} kit. Verify with protocol lead.`,

  sass: "I don't guess protocols. I know them.",
};

export default moOslCatbridge001;
