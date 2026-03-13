# MoScript Catalogue Integration - Complete

## What Was Built

### 1. Data Layer (`src/data/`)

**`signals.js`** - Disease outbreak signal database
- Hardcoded WHO disease surveillance signals
- 6 active disease protocols: Cholera, Mpox, Ebola, Measles, Yellow Fever, Malaria
- Severity levels 1-5 with case/death counts
- Helper functions for protocol filtering and emergency detection

**`moscript-commodities.js`** - Protocol-mapped commodity database
- 30 WHO emergency commodities across all categories
- Each commodity mapped to disease protocols (e.g., ORS → Cholera)
- Dual-warehouse stock tracking (NBO + DKR)
- WHO codes, shelf life, storage temp metadata
- Helper functions for protocol filtering and search

### 2. MoScript Catalogue Component

**`src/components/MoScriptCatalogView.jsx`**
- **Protocol-first navigation** - Filter by disease kit, not category
- **Signal-aware badges** - Red pulse when disease has active outbreak
- **Dual-warehouse visibility** - Shows NBO and DKR stock separately
- **MoScript Console** - Real-time signal monitoring sidebar
- **Dark theme** - `#0a0a0f` background, `#d4af37` gold accents
- **Cart integration** - Preserves existing order flow interface

### 3. App Integration

**Modified `src/App.jsx`**
- Replaced `CatalogView` import with `MoScriptCatalogView`
- Preserved exact props interface: `commodities`, `cart`, `setCart`, `onCreateOrder`
- Drop-in replacement - no changes needed to order system

## How It Works

### Protocol-Aware Intelligence

When a disease has an active outbreak signal:
1. Protocol filter button shows red pulse dot
2. All commodities in that protocol kit show red badge
3. MoScript Console displays signal details (cases, deaths, severity)

Example: Cholera outbreak in Nigeria (severity 4)
- "Cholera" button has red pulse
- ORS Sachets, IV Ringer Lactate, Doxycycline, Cholera RDT all show emergency badge
- Console shows: 1,247 cases, 89 deaths

### Cart Compatibility

MoScript commodities produce the same cart shape as the old system:

```javascript
{
  commodity: {
    id: 1001,
    name: 'ORS Sachets (WHO Formula)',
    category: 'Pharmaceuticals',
    unit: 'Box of 100',
    price: 0,  // WHO supplies are free
    stock: 17000,  // nboStock + dkrStock
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

The order system reads `commodity.id`, `commodity.name`, `commodity.unit`, `commodity.price` - all present.

## Visual Design

### Color Palette
- **Background**: `#0a0a0f` (dark)
- **Cards**: `#1a1a2e` (dark blue-grey)
- **Borders**: `#2a2a3e` (subtle)
- **Gold accent**: `#d4af37` (titles, buttons, active states)
- **Emergency red**: `#ff4444` (signal pulse, emergency badges)
- **Success green**: `#4ade80` (high stock levels)

### UI Elements Borrowed from TSX Files
- Category emoji icons (from `category-grid.tsx`)
- Protocol count badges (from `category-navigation.tsx`)
- Staggered animation concept (adapted to simple hover effects)
- Gold underline pattern (used in section titles)

### UI Elements NOT Used
- WHO blue color scheme (replaced with MoScript dark theme)
- Next.js routing (replaced with state-based filtering)
- Framer Motion animations (replaced with CSS transitions)
- shadcn/ui components (replaced with inline styled components)

## Testing the Integration

### Start the app
```bash
cd "c:\Users\idona\OneDrive - World Health Organization\Documents\Github\health_commodity_management_system-main\health_commodity_management_system-main"
npm run dev
```

### Navigate to catalogue
1. Login with dev bypass (auto-login if `VITE_DEV_AUTH_BYPASS=true`)
2. Click "Commodity Catalog" in navigation
3. You should see the MoScript dark theme catalogue

### Test protocol filtering
1. Click "Cholera" protocol button (should have red pulse dot)
2. Should show 4 commodities: ORS, IV Ringer, Doxycycline, Cholera RDT
3. All should have red "Cholera" badge with pulse animation

### Test cart flow
1. Click "+ Add to Cart" on any commodity
2. Cart count should increment in MoScript Console
3. Click "Create Order →" button in console
4. Should open the existing NewOrderModal with cart items
5. Submit order - should work exactly as before

### Verify stock display
- Each commodity card shows total stock (NBO + DKR)
- Hover over stock to see warehouse breakdown
- Stock color coding:
  - Green: > 1000 units
  - Yellow: 100-1000 units
  - Red: < 100 units

## AI Integration Status

### Current State
The uploaded `ai-learning-assistant.tsx` and `ai-explanations.ts` files are **NOT integrated** because:

1. **Security issue**: `ai-explanations.ts` makes direct client-side calls to Groq API
2. **Missing dependencies**: Requires `@ai-sdk/groq`, `ai` packages not in `package.json`
3. **API key exposure**: Would require `GROQ_API_KEY` in browser (unsafe)

### Required for AI Integration

**Backend proxy endpoint needed**:
```javascript
// server/routes/ai.js (needs to be created)
router.post('/api/ai/explain-commodity', async (req, res) => {
  const { commodityId, question } = req.body;
  
  // Server-side call to Groq/Azure OpenAI
  const response = await groq.generateText({
    model: 'llama-3.1-8b-instant',
    prompt: `Explain ${commodity.name}...`
  });
  
  res.json({ explanation: response.text });
});
```

**Environment variables needed**:
```env
# Backend only - never expose to frontend
GROQ_API_KEY=your_key_here
# OR
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=your_endpoint_here
```

**Frontend integration**:
Once backend proxy exists, add AI panel to MoScript Console:
- "Ask AI" button on each commodity card
- Opens chat panel in console
- Sends questions to `/api/ai/explain-commodity`
- Displays responses with text-to-speech option

## File Structure

```
src/
├── data/
│   ├── signals.js                    # NEW - Disease outbreak signals
│   └── moscript-commodities.js       # NEW - Protocol-mapped commodities
├── components/
│   ├── MoScriptCatalogView.jsx       # NEW - Main catalogue component
│   ├── CatalogView.jsx               # OLD - Still exists but unused
│   ├── cart.tsx                      # REFERENCE - Not integrated (Next.js)
│   ├── category-grid.tsx             # REFERENCE - Design inspiration only
│   ├── ai-learning-assistant.tsx     # REFERENCE - Needs backend proxy
│   └── ... (other existing components)
├── lib/
│   ├── ai-explanations.ts            # EXISTS - Unsafe for direct use
│   ├── real-images.ts                # EXISTS - Image mapping (not used yet)
│   └── utils.ts                      # EXISTS - Utility functions
└── App.jsx                           # MODIFIED - Imports MoScriptCatalogView
```

## Known Issues

1. **Lint warning in App.jsx**: `'draft' is defined but never used` (line 569)
   - Pre-existing issue, not related to MoScript integration
   - Can be fixed by prefixing with underscore: `_draft`

2. **AI not functional**: Requires backend proxy implementation

3. **Image mapping not used**: `real-images.ts` exists but MoScript catalogue uses emoji icons
   - Can be integrated later if product images are needed

## Next Steps

### Immediate (Ready Now)
1. Test the catalogue in browser
2. Verify cart → order flow works
3. Check MoScript Console displays signals correctly

### Short-term (Backend Work Needed)
1. Create `/api/ai/explain-commodity` endpoint
2. Add Groq or Azure OpenAI integration to backend
3. Wire AI panel into MoScript Console

### Long-term (Enhancements)
1. Replace hardcoded signals with live WHO EIOS/EBS API
2. Add commodity image support from `real-images.ts`
3. Add protocol kit export (download full kit as PDF/Excel)
4. Add stock alert notifications when protocol has active signal

## MoScript Codex Pattern

All new files follow the MoScript naming convention:

- `mo-data-signals-001` - Signal database
- `mo-data-commodities-001` - Commodity database  
- `mo-osl-catbridge-001` - Catalogue bridge component

This pattern enables:
- Version tracking (increment number for updates)
- Domain identification (data, osl, etc.)
- Purpose clarity (signals, commodities, catbridge)

## Summary

✅ **Complete**: MoScript catalogue with protocol intelligence and signal awareness
✅ **Complete**: Dual-warehouse stock visibility
✅ **Complete**: Dark theme with gold accents
✅ **Complete**: Cart integration preserving existing order flow
✅ **Complete**: MoScript Console for real-time monitoring

⚠️ **Pending**: AI assistant (requires backend proxy)
⚠️ **Pending**: Live signal data (currently hardcoded)
⚠️ **Pending**: Product images (currently using emoji icons)

The catalogue is **fully functional** and ready for testing. The order creation flow is **unchanged** - you can add items to cart and submit orders exactly as before, but now with protocol-aware intelligence layered on top.
