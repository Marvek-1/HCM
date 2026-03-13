/**
 * ═══════════════════════════════════════════════════════════════════════════
 * moscript-commodities.js — Protocol-Mapped Commodity Database
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "Commodity Database", layer: "data", version: "2026.03.12" }
 *
 * @capabilities
 *   - commodity_storage
 *   - protocol_mapping
 *   - warehouse_distribution
 *   - stock_aggregation
 *   - commodity_search
 *
 * @intents
 *   - { id: "commodity.by_protocol", input: "protocolName", output: "commodity_list" }
 *   - { id: "commodity.search", input: "query", output: "commodity_list" }
 *   - { id: "commodity.stock", input: "commodityId", output: "total_stock" }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * "Every commodity knows its protocol. Do you?"
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const moscriptCommodities = [
  // Cholera Response Kit
  {
    id: 1001,
    name: 'ORS Sachets (WHO Formula)',
    category: 'Pharmaceuticals',
    unit: 'Box of 100',
    price: 0,
    whoCode: 'PHARM-ORS-001',
    protocols: ['Cholera', 'Diarrheal Diseases'],
    shelfLife: '36 months',
    storageTemp: '15-25°C',
    nboStock: 5000,
    dkrStock: 12000,
    description: 'Oral rehydration salts for cholera and acute diarrhea treatment'
  },
  {
    id: 1002,
    name: 'IV Ringer Lactate Solution',
    category: 'Pharmaceuticals',
    unit: 'Box of 20 x 1L',
    price: 0,
    whoCode: 'PHARM-IVF-002',
    protocols: ['Cholera', 'Severe Dehydration'],
    shelfLife: '24 months',
    storageTemp: '15-25°C',
    nboStock: 800,
    dkrStock: 2400,
    description: 'Intravenous fluid for severe dehydration cases'
  },
  {
    id: 1003,
    name: 'Doxycycline 100mg Tablets',
    category: 'Pharmaceuticals',
    unit: 'Bottle of 1000',
    price: 0,
    whoCode: 'PHARM-ABX-003',
    protocols: ['Cholera'],
    shelfLife: '36 months',
    storageTemp: '15-25°C',
    nboStock: 200,
    dkrStock: 600,
    description: 'Antibiotic for cholera treatment (adult dosing)'
  },
  {
    id: 1004,
    name: 'Cholera Rapid Diagnostic Test',
    category: 'Lab & Diagnostics',
    unit: 'Kit of 25 tests',
    price: 0,
    whoCode: 'DIAG-RDT-004',
    protocols: ['Cholera'],
    shelfLife: '18 months',
    storageTemp: '2-8°C',
    nboStock: 150,
    dkrStock: 450,
    description: 'Rapid test for Vibrio cholerae O1/O139 detection'
  },

  // Mpox Response Kit
  {
    id: 2001,
    name: 'Mpox Specimen Collection Kit',
    category: 'Lab & Diagnostics',
    unit: 'Kit of 50',
    price: 0,
    whoCode: 'DIAG-SPEC-005',
    protocols: ['Mpox'],
    shelfLife: '12 months',
    storageTemp: '2-8°C',
    nboStock: 100,
    dkrStock: 300,
    description: 'Complete kit for mpox lesion sample collection'
  },
  {
    id: 2002,
    name: 'Tyvek Coverall Suit (PPE)',
    category: 'PPE',
    unit: 'Box of 25',
    price: 0,
    whoCode: 'PPE-COV-006',
    protocols: ['Mpox', 'Ebola', 'High-Risk Pathogens'],
    shelfLife: '60 months',
    storageTemp: 'Room temp',
    nboStock: 400,
    dkrStock: 1200,
    description: 'Full-body protective coverall for high-risk pathogen response'
  },
  {
    id: 2003,
    name: 'Nitrile Examination Gloves',
    category: 'PPE',
    unit: 'Box of 100 pairs',
    price: 0,
    whoCode: 'PPE-GLV-007',
    protocols: ['Mpox', 'Ebola', 'Universal Precautions'],
    shelfLife: '60 months',
    storageTemp: 'Room temp',
    nboStock: 2000,
    dkrStock: 6000,
    description: 'Powder-free nitrile gloves for patient care'
  },
  {
    id: 2004,
    name: 'Tecovirimat 200mg (TPOXX)',
    category: 'Pharmaceuticals',
    unit: 'Bottle of 60',
    price: 0,
    whoCode: 'PHARM-AVR-008',
    protocols: ['Mpox'],
    shelfLife: '36 months',
    storageTemp: '15-25°C',
    nboStock: 50,
    dkrStock: 150,
    description: 'Antiviral treatment for severe mpox cases'
  },

  // Ebola Response Kit
  {
    id: 3001,
    name: 'Ebola Specimen Triple Packaging Kit',
    category: 'Lab & Diagnostics',
    unit: 'Kit of 20',
    price: 0,
    whoCode: 'DIAG-PACK-009',
    protocols: ['Ebola', 'Viral Hemorrhagic Fever'],
    shelfLife: '24 months',
    storageTemp: 'Room temp',
    nboStock: 80,
    dkrStock: 240,
    description: 'UN3373 compliant packaging for Ebola samples'
  },
  {
    id: 3002,
    name: 'Chlorine 0.5% Solution (HTH)',
    category: 'WASH & IPC Materials',
    unit: '25kg bucket',
    price: 0,
    whoCode: 'WASH-CHL-010',
    protocols: ['Ebola', 'Cholera', 'IPC'],
    shelfLife: '12 months',
    storageTemp: 'Cool, dry',
    nboStock: 300,
    dkrStock: 900,
    description: 'High-test hypochlorite for disinfection'
  },
  {
    id: 3003,
    name: 'Body Bag (Infection Control)',
    category: 'WASH & IPC Materials',
    unit: 'Pack of 10',
    price: 0,
    whoCode: 'IPC-BAG-011',
    protocols: ['Ebola', 'High-Risk Pathogens'],
    shelfLife: '60 months',
    storageTemp: 'Room temp',
    nboStock: 200,
    dkrStock: 600,
    description: 'Leak-proof body bags for safe dignified burials'
  },

  // Measles Response Kit
  {
    id: 4001,
    name: 'Measles Vaccine (MR)',
    category: 'Vaccines',
    unit: 'Vial of 10 doses',
    price: 0,
    whoCode: 'VAC-MR-012',
    protocols: ['Measles'],
    shelfLife: '24 months',
    storageTemp: '2-8°C',
    nboStock: 1000,
    dkrStock: 3000,
    description: 'Measles-rubella vaccine for outbreak response'
  },
  {
    id: 4002,
    name: 'Vaccine Carrier (Cold Chain)',
    category: 'Cold Chain Equipment',
    unit: 'Unit',
    price: 0,
    whoCode: 'COLD-CAR-013',
    protocols: ['Measles', 'Vaccines', 'Cold Chain'],
    shelfLife: 'Durable',
    storageTemp: 'N/A',
    nboStock: 50,
    dkrStock: 150,
    description: 'Insulated carrier for vaccine transport'
  },
  {
    id: 4003,
    name: 'Auto-Disable Syringes 0.5ml',
    category: 'Biomedical Consumables',
    unit: 'Box of 100',
    price: 0,
    whoCode: 'CONS-SYR-014',
    protocols: ['Measles', 'Vaccines', 'Injection Safety'],
    shelfLife: '60 months',
    storageTemp: 'Room temp',
    nboStock: 5000,
    dkrStock: 15000,
    description: 'Single-use auto-disable syringes for vaccination'
  },
  {
    id: 4004,
    name: 'Vitamin A 200,000 IU Capsules',
    category: 'Nutrition',
    unit: 'Bottle of 100',
    price: 0,
    whoCode: 'NUTR-VITA-015',
    protocols: ['Measles', 'Malnutrition'],
    shelfLife: '36 months',
    storageTemp: '15-25°C',
    nboStock: 800,
    dkrStock: 2400,
    description: 'Vitamin A supplementation for measles cases'
  },

  // Yellow Fever Response Kit
  {
    id: 5001,
    name: 'Yellow Fever Vaccine (17D)',
    category: 'Vaccines',
    unit: 'Vial of 10 doses',
    price: 0,
    whoCode: 'VAC-YF-016',
    protocols: ['Yellow Fever'],
    shelfLife: '24 months',
    storageTemp: '2-8°C',
    nboStock: 500,
    dkrStock: 1500,
    description: 'Live attenuated yellow fever vaccine'
  },
  {
    id: 5002,
    name: 'Insecticide-Treated Bed Nets',
    category: 'Field Support Material',
    unit: 'Bundle of 25',
    price: 0,
    whoCode: 'FIELD-ITN-017',
    protocols: ['Yellow Fever', 'Malaria', 'Vector Control'],
    shelfLife: '36 months',
    storageTemp: 'Room temp',
    nboStock: 400,
    dkrStock: 1200,
    description: 'Long-lasting insecticidal nets for vector control'
  },

  // Malaria Response Kit
  {
    id: 6001,
    name: 'Artemether-Lumefantrine (ACT)',
    category: 'Pharmaceuticals',
    unit: 'Box of 60 tablets',
    price: 0,
    whoCode: 'PHARM-ACT-018',
    protocols: ['Malaria'],
    shelfLife: '36 months',
    storageTemp: '15-25°C',
    nboStock: 3000,
    dkrStock: 9000,
    description: 'First-line artemisinin combination therapy'
  },
  {
    id: 6002,
    name: 'Malaria Rapid Diagnostic Test (RDT)',
    category: 'Lab & Diagnostics',
    unit: 'Kit of 25 tests',
    price: 0,
    whoCode: 'DIAG-RDT-019',
    protocols: ['Malaria'],
    shelfLife: '18 months',
    storageTemp: '2-30°C',
    nboStock: 2000,
    dkrStock: 6000,
    description: 'Pf/Pan rapid diagnostic test for malaria'
  },

  // Multi-Protocol Equipment
  {
    id: 7001,
    name: 'Portable Ultrasound Machine',
    category: 'Biomedical Equipment',
    unit: 'Unit',
    price: 0,
    whoCode: 'BIOMED-US-020',
    protocols: ['Emergency Care', 'Maternal Health'],
    shelfLife: 'Durable',
    storageTemp: 'Room temp',
    nboStock: 5,
    dkrStock: 15,
    description: 'Battery-powered ultrasound for field diagnostics'
  },
  {
    id: 7002,
    name: 'Emergency Health Kit (IEHK)',
    category: 'Emergency Health Kits',
    unit: 'Complete Kit',
    price: 0,
    whoCode: 'KIT-IEHK-021',
    protocols: ['Emergency Response', 'Primary Care'],
    shelfLife: '24 months',
    storageTemp: 'Room temp',
    nboStock: 20,
    dkrStock: 60,
    description: 'Interagency Emergency Health Kit for 10,000 people'
  },
  {
    id: 7003,
    name: 'Oxygen Concentrator (10L/min)',
    category: 'Biomedical Equipment',
    unit: 'Unit',
    price: 0,
    whoCode: 'BIOMED-OXY-022',
    protocols: ['Emergency Care', 'Respiratory Support'],
    shelfLife: 'Durable',
    storageTemp: 'Room temp',
    nboStock: 30,
    dkrStock: 90,
    description: 'Medical-grade oxygen concentrator for patient care'
  },
  {
    id: 7004,
    name: 'Trauma First Aid Kit',
    category: 'Emergency Health Kits',
    unit: 'Kit',
    price: 0,
    whoCode: 'KIT-TRAUMA-023',
    protocols: ['Emergency Response', 'Trauma Care'],
    shelfLife: '36 months',
    storageTemp: 'Room temp',
    nboStock: 100,
    dkrStock: 300,
    description: 'Comprehensive trauma response kit'
  }
];

/**
 * Get all unique protocols from commodity database
 */
export function getAllProtocols() {
  const protocols = new Set();
  moscriptCommodities.forEach(commodity => {
    commodity.protocols.forEach(protocol => protocols.add(protocol));
  });
  return Array.from(protocols).sort();
}

/**
 * Get commodities for a specific protocol
 */
export function getCommoditiesForProtocol(protocolName) {
  return moscriptCommodities.filter(commodity =>
    commodity.protocols.includes(protocolName)
  );
}

/**
 * Get total stock for a commodity (both warehouses)
 */
export function getTotalStock(commodity) {
  return commodity.nboStock + commodity.dkrStock;
}

/**
 * Search commodities by name or WHO code
 */
export function searchCommodities(query) {
  const lowerQuery = query.toLowerCase();
  return moscriptCommodities.filter(commodity =>
    commodity.name.toLowerCase().includes(lowerQuery) ||
    commodity.whoCode.toLowerCase().includes(lowerQuery) ||
    commodity.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get commodities by category
 */
export function getCommoditiesByCategory(category) {
  return moscriptCommodities.filter(c => c.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories() {
  const categories = new Set(moscriptCommodities.map(c => c.category));
  return Array.from(categories).sort();
}
