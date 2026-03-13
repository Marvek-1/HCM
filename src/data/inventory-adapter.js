/**
 * ═══════════════════════════════════════════════════════════════════════════
 * inventory-adapter.js — Operational Inventory Adapter
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "Inventory Adapter", layer: "data", version: "2026.03.12" }
 *
 * @capabilities
 *   - data_transformation         // INVENTORY -> MoScript format
 *   - protocol_inference          // Auto-mapping items to disease protocols
 *   - stock_generation            // Simulated warehouse distribution
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * "Bridging raw ledger data to protocol intelligence."
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { INVENTORY, CATEGORY_ICONS } from './inventory-data';

/**
 * Maps categories/keywords to disease protocols
 */
const inferProtocols = (item) => {
  const protocols = [];
  const desc = item.description.toLowerCase();
  const cat = item.category;

  if (desc.includes('cholera') || desc.includes('ors') || desc.includes('ringer')) protocols.push('Cholera');
  if (desc.includes('ebola') || desc.includes('vhf') || desc.includes('body bag')) protocols.push('Ebola');
  if (desc.includes('mpox') || desc.includes('tecovirimat')) protocols.push('Mpox');
  if (desc.includes('measles') || desc.includes('vaccine')) protocols.push('Measles');
  if (desc.includes('malaria') || desc.includes('artemether') || desc.includes('rdt')) protocols.push('Malaria');
  if (cat === 'PPE' || desc.includes('glove') || desc.includes('gown') || desc.includes('mask')) {
    protocols.push('IPC');
    protocols.push('Universal Precautions');
  }
  if (cat.includes('Lab') || desc.includes('test') || desc.includes('pipette')) protocols.push('Diagnostics');
  
  return protocols.length > 0 ? protocols : ['General Emergency'];
};

/**
 * Transforms the flat inventory data into MoScript-compatible commodity shape
 */
export const adaptedInventory = INVENTORY.map(item => {
  // Generate simulated stock levels (NBO = Nairobi, DKR = Dakar)
  // Higher ID items are newer/rarer, lower IDs are bulk staples
  const baseStock = Math.max(10, Math.floor(5000 / (item.id % 50 + 1)));
  const nboStock = Math.floor(baseStock * 0.4);
  const dkrStock = Math.floor(baseStock * 0.6);

  return {
    id: item.id,
    itemCode: item.itemCode,
    whoCode: item.itemCode, // Aligning field names
    name: item.description,
    description: item.description,
    category: item.category,
    unit: item.uom,
    price: item.unitPrice,
    nboStock,
    dkrStock,
    stock: nboStock + dkrStock,
    protocols: inferProtocols(item),
    shelfLife: '24-36 months', // Default metadata
    storageTemp: item.category.includes('Cold Chain') || item.category.includes('Vaccine') ? '2-8°C' : '15-25°C',
    icon: CATEGORY_ICONS[item.category] || '📦'
  };
});

// Helper functions similar to moscript-commodities.js but for the full inventory
export const getAllProtocols = () => {
  const protocols = new Set();
  adaptedInventory.forEach(item => {
    item.protocols.forEach(p => protocols.add(p));
  });
  return Array.from(protocols).sort();
};

export const getCommoditiesForProtocol = (protocol) => {
  return adaptedInventory.filter(item => item.protocols.includes(protocol));
};

export const searchInventory = (query) => {
  const lowerQuery = query.toLowerCase();
  return adaptedInventory.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    item.itemCode.toLowerCase().includes(lowerQuery) ||
    item.category.toLowerCase().includes(lowerQuery)
  );
};
