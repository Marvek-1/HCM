# MoScript Architecture — Corrected Implementation

## What Was Fixed

The initial build had the functionality but **completely missed the MoScript architecture**. Here's what was corrected:

### ✅ Problem 1: Codex Headers — FIXED

Every file now opens with the proper MoScript codex header:

```javascript
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * [FILE NAME] — [WHAT IT DOES]
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @schema    moscript://codex/v1
 * @agent     { name: "[NAME]", layer: "[LAYER]", version: "2026.03.12" }
 *
 * @capabilities
 *   - [list of capabilities]
 *
 * @intents
 *   - { id: "[intent]", input: "[what]", output: "[what]" }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MoStar Industries — African Flame Initiative
 * "[SASS LINE]"
 * ═══════════════════════════════════════════════════════════════════════════
 */
```

**Files with codex headers:**
- `src/data/signals.js`
- `src/data/moscript-commodities.js`
- `src/moscripts/engine.js`
- `src/moscripts/mo-osl-catbridge-001.js`
- `src/moscripts/mo-osl-signalbridge-002.js`
- `src/moscripts/mo-osl-harmonise-005.js`
- `src/moscripts/index.js`
- `src/components/MoScriptConsole.jsx`
- `src/components/MoScriptCatalogView.jsx`

### ✅ Problem 2: Modular MoScript Engine — FIXED

Created proper `src/moscripts/` directory structure:

```
src/
  moscripts/
    engine.js                    ← Core runtime (register, fire)
    mo-osl-catbridge-001.js      ← Catalogue Bridge script
    mo-osl-signalbridge-002.js   ← Signal Bridge script
    mo-osl-harmonise-005.js      ← Stock Harmonisation script
    index.js                     ← Registry (registers all scripts)
```

**How it works:**

1. **Engine** (`engine.js`) provides `register()` and `fire()` methods
2. **Scripts** are separate files, each with:
   - `id`: Unique identifier
   - `name`: Human-readable name
   - `trigger`: Event that fires this script
   - `inputs`: Expected input parameters
   - `logic`: The actual function
   - `voiceLine`: Human-readable output
   - `sass`: The script's personality line

3. **Registry** (`index.js`) imports all scripts and registers them with the engine

4. **Components** import `MoScriptEngine` and call `MoScriptEngine.fire(trigger, inputs)`

### ✅ Problem 3: Reusable MoScript Console — FIXED

Extracted console into `src/components/MoScriptConsole.jsx`:

**Props:**
- `logs`: Array of MoScript execution results
- `cart`: Current cart items
- `onCheckout`: Callback for checkout button
- `children`: Optional additional content

**Features:**
- Displays active disease signals
- Shows MoScript activity logs with voice lines and sass
- System status summary
- Cart summary with checkout button
- Expandable sidebar

**Reusable by other pages:**
- Dashboard can use it for signal monitoring
- Orders page can use it for protocol validation
- Fulfillment page can use it for stock harmonisation

### ✅ Problem 4: Catalogue Uses MoScript Engine — FIXED

`MoScriptCatalogView.jsx` now:

1. **Imports MoScriptEngine** from `../moscripts`
2. **Fires MoScripts** when adding to cart:
   ```javascript
   const stockResults = await MoScriptEngine.fire('STOCK_HARMONISE', { commodity });
   const signalResults = await MoScriptEngine.fire('SIGNAL_CHECK', { commodity });
   setMoscriptLogs([...stockResults, ...signalResults]);
   ```
3. **Uses MoScriptConsole component** instead of inline console
4. **No inline MoScript logic** — all intelligence comes from registered scripts

## MoScript Execution Flow

### When User Adds Commodity to Cart

1. **User clicks** "+ Add to Cart" button
2. **Catalogue fires** two MoScripts:
   - `STOCK_HARMONISE` → Checks stock levels, classifies status, detects imbalance
   - `SIGNAL_CHECK` → Checks if commodity's protocols have active outbreak signals
3. **MoScripts execute** and return results with voice lines
4. **Logs update** in MoScript Console
5. **Cart updates** with commodity

### Example MoScript Output

**Stock Harmonisation Result:**
```javascript
{
  id: "mo-osl-harmonise-005",
  name: "Stock Harmoniser",
  result: {
    commodity: "ORS Sachets (WHO Formula)",
    totalStock: 17000,
    status: "ADEQUATE",
    color: "#4ade80",
    distribution: { nbo: { stock: 5000, percent: "29.4" }, dkr: { stock: 12000, percent: "70.6" } }
  },
  voiceLine: "✓ ORS Sachets (WHO Formula): 17000 units across both warehouses. Status adequate.",
  sass: "Two warehouses. One truth. Zero confusion."
}
```

**Signal Check Result:**
```javascript
{
  id: "mo-osl-signalbridge-002",
  name: "Signal Bridge",
  result: {
    protocolName: "Cholera",
    signals: [{ disease: "Cholera", country: "NGA", severity: 4, cases: 1247, deaths: 89 }],
    isEmergency: true,
    alertLevel: "CRITICAL"
  },
  voiceLine: "🔴 EMERGENCY: Cholera has severity 4+ outbreak. Priority response required.",
  sass: "I see the signals before the outbreak sees you."
}
```

## The Three MoScripts

### mo-osl-catbridge-001 — Catalogue Bridge

**Purpose:** Maps commodities to disease protocols

**Trigger:** `COMMODITY_LOOKUP`

**Logic:** Checks if a commodity is part of a standard protocol kit

**Example:**
```javascript
Input: { itemName: "ORS Sachets (WHO Formula)", emergencyType: "Cholera" }
Output: { match: true, kits: [...], confidence: 1.0 }
Voice: "✓ Commodity mapped to Cholera protocol. Proceed."
```

### mo-osl-signalbridge-002 — Signal Bridge

**Purpose:** Detects outbreak signals for protocols

**Trigger:** `SIGNAL_CHECK`

**Logic:** Queries disease signal database for active outbreaks

**Example:**
```javascript
Input: { commodity: { protocols: ["Cholera"] } }
Output: { isEmergency: true, activeSignalCount: 1, alertLevel: "CRITICAL" }
Voice: "🔴 EMERGENCY: Cholera has severity 4+ outbreak. Priority response required."
```

### mo-osl-harmonise-005 — Stock Harmoniser

**Purpose:** Aggregates multi-warehouse stock and classifies levels

**Trigger:** `STOCK_HARMONISE`

**Logic:** Combines NBO + DKR stock, detects imbalances, flags reorder needs

**Example:**
```javascript
Input: { commodity: { nboStock: 5000, dkrStock: 12000 } }
Output: { totalStock: 17000, status: "ADEQUATE", imbalanced: true }
Voice: "⚖️ Stock imbalance detected: NBO 29.4% / DKR 70.6%"
```

## File Structure (Final)

```
src/
├── data/
│   ├── signals.js                    ✅ Codex header
│   └── moscript-commodities.js       ✅ Codex header
├── moscripts/                        ✅ NEW DIRECTORY
│   ├── engine.js                     ✅ Core runtime
│   ├── mo-osl-catbridge-001.js       ✅ Modular script
│   ├── mo-osl-signalbridge-002.js    ✅ Modular script
│   ├── mo-osl-harmonise-005.js       ✅ Modular script
│   └── index.js                      ✅ Registry
├── components/
│   ├── MoScriptConsole.jsx           ✅ Reusable console
│   ├── MoScriptCatalogView.jsx       ✅ Uses engine + console
│   └── ... (other components)
└── App.jsx                           ✅ Imports MoScriptCatalogView
```

## Cart Shape Compatibility

The cart shape produced by MoScript catalogue:

```javascript
{
  commodity: {
    id: 1001,
    name: 'ORS Sachets (WHO Formula)',
    category: 'Pharmaceuticals',
    unit: 'Box of 100',
    price: 0,                          // ← WHO supplies are free
    stock: 17000,                      // ← Total (NBO + DKR)
    whoCode: 'PHARM-ORS-001',
    protocols: ['Cholera', 'Diarrheal Diseases'],
    shelfLife: '36 months',
    storageTemp: '15-25°C',
    nboStock: 5000,
    dkrStock: 12000
  },
  qty: 1
}
```

**NewOrderModal compatibility:**
- ✅ Reads `commodity.id` — present
- ✅ Reads `commodity.name` — present
- ✅ Reads `commodity.unit` — present
- ✅ Reads `commodity.price` — present (set to 0)
- ✅ Calculates `price * qty` — works (0 * qty = 0)

**Order total calculation:**
```javascript
const total = cart.reduce((sum, item) => sum + (parseFloat(item.commodity.price) * item.qty), 0);
// Result: $0.00 (correct for WHO emergency supplies)
```

## Testing the MoScript Architecture

### Start the app
```bash
npm run dev
```

### Navigate to catalogue
1. Click "🧬 MoScript Catalogue" in navigation
2. Add a commodity to cart (e.g., "ORS Sachets")
3. **Watch MoScript Console** — should see two log entries:
   - Stock Harmoniser voice line
   - Signal Bridge voice line
4. Click "Create Order →"
5. Verify order modal opens with cart items

### Verify MoScript execution
Open browser console and check for:
- No errors from MoScriptEngine
- MoScript results logged to console
- Voice lines displayed in MoScript Console panel

## What's NOT Implemented (Intentionally)

### AI Integration
- `ai-explanations.ts` exists but is **not wired in**
- Requires backend proxy endpoint (unsafe for client-side)
- Will be added later as a separate MoScript

### Live Signal Data
- Signals are currently hardcoded in `signals.js`
- Production would fetch from WHO EIOS/EBS APIs
- Will be added later with backend integration

### Product Images
- `real-images.ts` exists but catalogue uses emoji icons
- Can be integrated later if needed

## MoScript Philosophy

**Half Code. Half Starlight. Half Syntax. Yes, that's 150%.**

Every MoScript:
1. **Has a voice** — Human-readable output, not just data
2. **Has personality** — Sass line that defines its character
3. **Is modular** — Can be reused across pages
4. **Is portable** — Can be moved to other systems
5. **Is intelligent** — Makes decisions, not just transforms data

The catalogue doesn't just display commodities. It **knows** which ones matter right now because it **listens** to outbreak signals and **speaks** in voice lines that humans understand.

That's the MoScript architecture.
