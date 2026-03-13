/**
 * HCOMS Catalog Seeder
 * Standalone script to populate the catalog with 160 real WHO AFRO operational items.
 *
 * Usage:
 *   node server/catalog/seed.js
 *
 * Requires: PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT in .env
 * Safe to run multiple times (idempotent — skips existing rows).
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('../config/database');
const fs = require('fs');

// ─── 12 VERIFIED CATEGORIES ───────────────────────────────
const CATEGORIES = [
  { name: "Biomedical Consumables", description: "Disposable medical supplies and consumables" },
  { name: "Biomedical Equipment", description: "Medical devices and laboratory equipment" },
  { name: "Cold Chain Equipment", description: "Refrigeration and temperature-controlled storage" },
  { name: "Emergency Health Kits", description: "Standardized emergency response kits" },
  { name: "IT & Communications", description: "Information technology and communication devices" },
  { name: "Lab & Diagnostics", description: "Laboratory diagnostic tools and reagents" },
  { name: "PPE", description: "Personal protective equipment" },
  { name: "Pharmaceuticals", description: "Medicines and pharmaceutical products" },
  { name: "Shelter & Field", description: "Temporary shelter and field operations supplies" },
  { name: "Visibility Materials", description: "WHO branding and visibility items" },
  { name: "WASH & Water", description: "Water, sanitation, and hygiene supplies" },
  { name: "Wellbeing", description: "Staff wellbeing and medical care kits" }
];

// ─── 2 WAREHOUSES ──────────────────────────────────────────
const WAREHOUSES = [
  { name: 'Nairobi Warehouse', location: 'Nairobi, Kenya', code: 'NBO' },
  { name: 'Dakar Warehouse', location: 'Dakar, Senegal', code: 'DKR' }
];

// ─── 160 OPERATIONAL ITEMS ─────────────────────────────────
const ITEMS = [
  { name: "(chemistry analyzer piccolo xpress) piccolo chemistry control kit (lev. 1), 1 ml lyoph. pwd, 2 ml dil., box-10", category: "Biomedical Equipment", unit: "Box", price: 199.0, stock: 450, description: "Chemistry control kit for Piccolo Xpress analyzer.", storageRequirements: "2-8°C", shelfLife: "12 months" },
  { name: "(chemistry analyzer piccolo xpress) piccolo chemistry control kit (lev. 2), 1 ml lyoph. pwd, 2 ml dil., box-10", category: "Biomedical Equipment", unit: "Box", price: 199.0, stock: 450, description: "Chemistry control kit for Piccolo Xpress analyzer.", storageRequirements: "2-8°C", shelfLife: "12 months" },
  { name: "(chemistry analyzer piccolo xpress) reagent disc (piccolo liver panel plus), cartridge, 100 ul, box-10", category: "Biomedical Equipment", unit: "Box", price: 179.0, stock: 320, description: "Liver panel reagent disc for Piccolo Xpress.", storageRequirements: "2-8°C", shelfLife: "9 months" },
  { name: "bin bag, 120 l, 700x1100x0.06 mm, box-25", category: "WASH & Water", unit: "Box", price: 6.0, stock: 1200, description: "Heavy duty bin bags for waste management.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "body bag, 4 handles, u-shaped zip, white, 400 microns, child, 150 x 100 cm, box-5", category: "PPE", unit: "Box", price: 59.0, stock: 150, description: "Child size body bags, heavy duty.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "body bag, 8 handles, u-shaped zip, white, 400 microns, adult, 230 x 100 cm, box-5", category: "PPE", unit: "Box", price: 196.0, stock: 200, description: "Adult size body bags, heavy duty.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "cap surgical, bouffant, nonwoven, disp., pack-600", category: "PPE", unit: "Box", price: 41.0, stock: 800, description: "Disposable surgical bouffant caps.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "glove examination, nitrile, pf, size l, ext. cuff min. 28 cm, box-100", category: "PPE", unit: "Box", price: 27.0, stock: 5000, description: "Nitrile examination gloves, powder-free, size large.", storageRequirements: "Store dry, away from light", shelfLife: "36 months" },
  { name: "glove examination, nitrile, pf, size m, ext. cuff min. 28 cm, box-100", category: "PPE", unit: "Box", price: 38.0, stock: 5000, description: "Nitrile examination gloves, powder-free, size medium.", storageRequirements: "Store dry, away from light", shelfLife: "36 months" },
  { name: "glove examination, nitrile, pf, size s, ext. cuff min. 28 cm, box-100", category: "PPE", unit: "Box", price: 35.0, stock: 5000, description: "Nitrile examination gloves, powder-free, size small.", storageRequirements: "Store dry, away from light", shelfLife: "36 months" },
  { name: "glove examination, nitrile, pf, size xl, ext. cuff min. 28 cm, box-100", category: "PPE", unit: "Box", price: 13.0, stock: 3000, description: "Nitrile examination gloves, powder-free, size XL.", storageRequirements: "Store dry, away from light", shelfLife: "36 months" },
  { name: "glove, examination (intco synguard snbe10017), nitrile, pf, size xl, box-100", category: "PPE", unit: "Box", price: 8.0, stock: 3000, description: "Intco Synguard nitrile examination gloves, powder-free, size XL.", storageRequirements: "Store dry, away from light", shelfLife: "36 months" },
  { name: "iv catheter, cannula w/inj.port and wing, s.u., 16g (1.8 x 45 mm), grey, box-50", category: "Biomedical Consumables", unit: "Box", price: 15.0, stock: 1000, description: "16G IV catheter with injection port.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "iv catheter, cannula w/inj.port and wing, s.u., 24g (0.7x19 mm), yellow, box-50", category: "Biomedical Consumables", unit: "Box", price: 6.0, stock: 1000, description: "24G IV catheter with injection port.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "mask medical (knh 1mmab50dm1-eu), type iir, ce marked, fluid resist, earloop, 4 ply, flat, box-50", category: "PPE", unit: "Box", price: 36.0, stock: 10000, description: "Type IIR fluid resistant medical mask.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "mask medical (knh 1mmnb50dm6-eu), type ii, ce marked, fluid non-resist, earloop, 3 ply, flat, box-50", category: "PPE", unit: "Box", price: 12.0, stock: 10000, description: "Type II medical mask.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "oral rehydration salts (ors), 20.5 g, pwd, sachet, for 1 l, box-100", category: "Pharmaceuticals", unit: "Box", price: 8.0, stock: 2000, description: "WHO standard ORS powder.", storageRequirements: "Store dry, below 30°C", shelfLife: "36 months" },
  { name: "pipette tip filter, 100ul, ster., low retention, rack, 10x96 tips, box-960", category: "Lab & Diagnostics", unit: "Box", price: 31.0, stock: 500, description: "Sterile filtered pipette tips, 100ul.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "pipette tip filter, 10ul, ster., low retention, rack, 10x96 tips, box-960", category: "Lab & Diagnostics", unit: "Box", price: 31.0, stock: 500, description: "Sterile filtered pipette tips, 10ul.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "pipette tip filter, 50ul, ster., low retention, rack, 10x96 tips, box-960", category: "Lab & Diagnostics", unit: "Box", price: 104.0, stock: 500, description: "Sterile filtered pipette tips, 50ul.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "safety box, needles/syringes, 5l, cardboard for incineration, box-25", category: "Biomedical Consumables", unit: "Box", price: 28.0, stock: 1000, description: "Puncture resistant safety box for sharps disposal.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "water purification tablet (nadcc), 33 mg, tab, for 5 l, box-10000", category: "WASH & Water", unit: "Box", price: 175.0, stock: 100, description: "NaDCC water purification tablets.", storageRequirements: "Store dry, cool", shelfLife: "36 months" },
  { name: "apron protection (alphatec 56-101), pvc, 18 mil / 457 um, reusable, white, case-12", category: "PPE", unit: "Case", price: 63.0, stock: 500, description: "Heavy duty reusable PVC protection apron.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "bed pads, absorbent, 90 x 60 cm, capacity 900-1100 ml, case-30", category: "PPE", unit: "Case", price: 7.0, stock: 1000, description: "Absorbent bed pads for medical use.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "biohazard waste bag (dongguan hengjin), hdpe, 50 x 80 cm, 33 l, red, autocl., case-250", category: "WASH & Water", unit: "Case", price: 98.0, stock: 400, description: "Autoclavable biohazard waste bags, red.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "biohazard waste bag, hdpe, red, 48 x 58 cm, 34.1 l, 50 um, autocl. with ind. patch, case-200", category: "WASH & Water", unit: "Case", price: 468.0, stock: 400, description: "Red biohazard bags with indicator patch.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "face shield (weihai dishang), clear plastic, disp., case-250", category: "PPE", unit: "Case", price: 79.0, stock: 1000, description: "Disposable clear plastic face shields.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "glove examination (anhui intco), nitrile, pf, size xl, case-1000", category: "PPE", unit: "Case", price: 27.0, stock: 200, description: "Nitrile examination gloves, case of 1000.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "glove examination (halyard 52819), nitrile, pf, lavender, size l, case-2500", category: "PPE", unit: "Case", price: 83.0, stock: 100, description: "Halyard nitrile gloves, lavender, large.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "glove, examination (selefa core 210263l), nitrile, pf, size l, case-1000", category: "PPE", unit: "Case", price: 86.0, stock: 200, description: "Selefa Core nitrile examination gloves, size large.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "glove, examination (selefa core 210263m), nitrile, pf, size m, case-1000", category: "PPE", unit: "Case", price: 43.0, stock: 200, description: "Selefa Core nitrile examination gloves, size medium.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "glove, examination (selefa core 210263s), nitrile, pf, size s, case-1000", category: "PPE", unit: "Case", price: 43.0, stock: 200, description: "Selefa Core nitrile examination gloves, size small.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "glove, examination (selefa core 210263xl), nitrile, pf, size xl, case-1000", category: "PPE", unit: "Case", price: 86.0, stock: 200, description: "Selefa Core nitrile examination gloves, size XL.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "gloves, surgical (encore 330100075), latex, pf, ster., size 7.5, pair, case-200", category: "PPE", unit: "Case", price: 115.0, stock: 150, description: "Sterile surgical gloves, size 7.5.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "gloves, surgical (fitone), latex, pf, sterile, size 7, pair, case-500", category: "PPE", unit: "Case", price: 120.0, stock: 100, description: "Sterile surgical gloves, size 7.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "gloves, surgical (gammex 340007070), neopr., pf, ster., size 7.0, pair, case-200", category: "PPE", unit: "Case", price: 706.0, stock: 50, description: "Sterile neoprene surgical gloves, size 7.0.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "gloves, surgical (gammex 340063080), hybrid, pf, ster., size 8.0, pair, case-200", category: "PPE", unit: "Case", price: 805.0, stock: 50, description: "Sterile hybrid surgical gloves, size 8.0.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "gloves, surgical (guilin hbm mtpc), latex, pf, sterile, size 7, pair, case-400", category: "PPE", unit: "Case", price: 99.0, stock: 100, description: "Sterile surgical gloves, size 7.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "gloves, surgical (n2100 - fitone), latex, pf, sterile, size 8.5, pair, case-500", category: "PPE", unit: "Case", price: 162.0, stock: 100, description: "Sterile surgical gloves, size 8.5.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "gown (medline nonelv200), aami level 2, yellow, non-sterile, size l, case-100", category: "PPE", unit: "Case", price: 72.0, stock: 200, description: "Yellow isolation gown, AAMI Level 2, size large.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown (medline nonelv200), aami level ii, yellow, non-sterile, size l, case-100", category: "PPE", unit: "Case", price: 67.0, stock: 200, description: "Yellow isolation gown, AAMI Level II, size large.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown (medline nonelv200m), aami level ii, yellow, non-sterile, size m, case-100", category: "PPE", unit: "Case", price: 69.0, stock: 200, description: "Yellow isolation gown, AAMI Level II, size medium.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown (medline nonelv200xl), aami level ii, yellow, non-sterile,size xl, case-100", category: "PPE", unit: "Case", price: 69.0, stock: 200, description: "Yellow isolation gown, AAMI Level II, size XL.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown (medline nonlv315), aami level iii, yellow, non-sterile, size m/l, case-100", category: "PPE", unit: "Case", price: 56.0, stock: 200, description: "Yellow isolation gown, AAMI Level III, size M/L.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown (medline nonlv315xl), aami level iii, yellow, non-sterile, size xl, case-100", category: "PPE", unit: "Case", price: 63.0, stock: 200, description: "Yellow isolation gown, AAMI Level III, size XL.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown, isolation (winner 604-008697), aami lvl 2, non-ster., size xl, case-80", category: "PPE", unit: "Case", price: 53.0, stock: 200, description: "Winner isolation gown, AAMI Level 2, size XL.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown, isolation (zig-1256), aami lvl 3, non-ster., size l, case-100", category: "PPE", unit: "Case", price: 129.0, stock: 200, description: "Zig isolation gown, AAMI Level 3, size large.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown, isolation (zig-1256), aami lvl 3, non-ster., size m, case-100", category: "PPE", unit: "Case", price: 129.0, stock: 200, description: "Zig isolation gown, AAMI Level 3, size medium.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown, isolation (zig-1256), aami lvl 3, non-ster., size xl, case-100", category: "PPE", unit: "Case", price: 129.0, stock: 200, description: "Zig isolation gown, AAMI Level 3, size XL.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "plastic sheeting, who logo, 4x6m, white/white, 6 bands, prepunch.hole, sheet, case-5", category: "Shelter & Field", unit: "Case", price: 52.0, stock: 300, description: "WHO branded heavy duty plastic sheeting.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "respirator mask (o&m halyard - fluidshield 62126), n95, level 2, case-300", category: "PPE", unit: "Case", price: 218.0, stock: 500, description: "Halyard N95 respirator masks.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "shoe cover, s.u., blue, pair, slip resistant, case-300", category: "PPE", unit: "Case", price: 18.0, stock: 1000, description: "Slip resistant shoe covers.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "tube centrifuge, pp, 50 ml, ster., blue screw cap, grad., con. bottom, case-500", category: "Lab & Diagnostics", unit: "Case", price: 76.0, stock: 200, description: "Sterile 50ml centrifuge tubes.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "water purification sachet (hth), 4 g, sachet, for 10 l, case-1000", category: "WASH & Water", unit: "Case", price: 61.0, stock: 100, description: "HTH water purification sachets.", storageRequirements: "Store dry, cool", shelfLife: "36 months" },
  { name: "water purification tablet (nadcc), 33 mg, tab, for 5 l, case-1000", category: "WASH & Water", unit: "Case", price: 77.0, stock: 100, description: "NaDCC water purification tablets.", storageRequirements: "Store dry, cool", shelfLife: "36 months" },
  { name: "(centrifuge rotanta 460) rotor (5699-r), swing-out, 4-place", category: "Biomedical Equipment", unit: "Each", price: 1269.0, stock: 10, description: "Swing-out rotor for Rotanta 460 centrifuge.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "(centrifuge rotanta 460, rotor 5699-r) bucket (4880), w/clamp lock", category: "Biomedical Equipment", unit: "Each", price: 291.0, stock: 40, description: "Centrifuge bucket with clamp lock.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "(centrifuge rotanta 460r) adapter, no 4839, 14x12ml tubes, for carrier 4880", category: "Biomedical Equipment", unit: "Each", price: 112.0, stock: 40, description: "Adapter for centrifuge buckets.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "(chemistry analyzer piccolo xpress) thermal paper, roll", category: "Biomedical Equipment", unit: "Each", price: 24.0, stock: 100, description: "Thermal paper rolls for Piccolo Xpress.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "(cold box aucma arktek-ybc-5e) coolant liquid, pcm (plusice e-65), jerrycan 5 l", category: "Cold Chain Equipment", unit: "Each", price: 439.0, stock: 50, description: "PCM coolant liquid for Arktek cold box.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "(conc.o2 canta,v8-wn-ns) kit spare parts, 6 months, without sieve beds", category: "Biomedical Equipment", unit: "Each", price: 41.0, stock: 20, description: "Spare parts kit for Canta oxygen concentrator.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "(endoscope) antifog agent (ultrastop pro med.), sterile, 30 ml, vial", category: "Biomedical Equipment", unit: "Each", price: 12.0, stock: 50, description: "Anti-fog agent for endoscopic procedures.", storageRequirements: "Store dry", shelfLife: "24 months" },
  { name: "(high flow nasal cannula) humidifier clinic hygiene, set", category: "Biomedical Equipment", unit: "Each", price: 26.0, stock: 50, description: "Humidifier set for high flow nasal cannula.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "(high flow nasal cannula) oxygen tubing, 4 meters", category: "Biomedical Equipment", unit: "Each", price: 3.0, stock: 200, description: "Oxygen tubing, 4m length.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "(lenovo tab m11) flip cover, tri-fold stand design", category: "IT & Communications", unit: "Each", price: 43.0, stock: 50, description: "Protective flip cover for Lenovo Tab M11.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "(masimo rad-97/rad-97 nibp) mobile roll stand (300239), w/direct connect", category: "Biomedical Equipment", unit: "Each", price: 700.0, stock: 15, description: "Mobile roll stand for Masimo monitor.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "(masimo rad-97/rad-97 nibp) spo2 sensor (4050), adult, reusable", category: "Biomedical Equipment", unit: "Each", price: 120.0, stock: 50, description: "Reusable SpO2 sensor for adults.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "(masimo rad-97/rad-97 nibp) spo2 sensor (4051), pediatric, reusable", category: "Biomedical Equipment", unit: "Each", price: 130.0, stock: 50, description: "Reusable SpO2 sensor for pediatric use.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "(masimo rad-97/rad-97 nibp) spo2 sensor (4054), neonatal, reusable", category: "Biomedical Equipment", unit: "Each", price: 260.0, stock: 50, description: "Reusable SpO2 sensor for neonates.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "(tent multipurpose xpert 24) hard floor, 2 x 12 m2, plastic tiles", category: "Shelter & Field", unit: "Each", price: 540.0, stock: 20, description: "Hard floor tiles for Xpert 24 tent.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "(tent multipurpose xpert 48) hard floor, 4 x 12 m2, plastic tiles", category: "Shelter & Field", unit: "Each", price: 1080.0, stock: 20, description: "Hard floor tiles for Xpert 48 tent.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "(tent multipurpose xpert 72) hard floor, 6 x 12 m2, plastic tiles", category: "Shelter & Field", unit: "Each", price: 1620.0, stock: 20, description: "Hard floor tiles for Xpert 72 tent.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "adaptor plug (gn-l07), male uk+us+au+eu/it, with usb port", category: "Shelter & Field", unit: "Each", price: 26.0, stock: 100, description: "Universal travel adapter with USB.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "anti fog solution, approx. 100 ml, bot.", category: "PPE", unit: "Each", price: 1.0, stock: 200, description: "Anti-fog solution for goggles.", storageRequirements: "Store dry", shelfLife: "24 months" },
  { name: "apron protection (xinle huabao), pe, 50 microns, disposable, blue", category: "PPE", unit: "Each", price: 0.0, stock: 5000, description: "Disposable polyethylene protective apron.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "apron protection, polyester, reusable, 300g/m2, white, unit", category: "PPE", unit: "Each", price: 12.0, stock: 500, description: "Reusable polyester protection apron.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "bag, waterproof, 3 compartment, for medical kit shw", category: "Cold Chain Equipment", unit: "Each", price: 14.0, stock: 100, description: "Waterproof 3-compartment bag for medical kits.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "biohazard specimen bag, 15 x 25 cm, with document pouch, zip lock", category: "Lab & Diagnostics", unit: "Each", price: 0.0, stock: 10000, description: "Zip lock biohazard specimen bags.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "body bag, 4 handles, j-shaped zip, peva, white, 300 um, child, 150 x 100 cm", category: "PPE", unit: "Each", price: 10.0, stock: 150, description: "Child size body bags with J-shaped zip.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "body bag, 4 handles, u-shaped zip, peva, white, 300 um, child, 150 x 100 cm", category: "PPE", unit: "Each", price: 20.0, stock: 150, description: "Child size body bags with U-shaped zip.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "body bag, 4 handles, u-shaped zip, white, 400 microns, child, 150 x 100 cm", category: "PPE", unit: "Each", price: 19.0, stock: 150, description: "Heavy duty child size body bags.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "body bag, 6 handles, u-shaped zip, peva, white, 300 um, adult, 150 x 100 cm", category: "PPE", unit: "Each", price: 16.0, stock: 200, description: "Adult size body bags with 6 handles.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "body bag, 6 handles, u-shaped zip, peva, white, 300 um, adult, 250 x 120 cm", category: "PPE", unit: "Each", price: 33.0, stock: 200, description: "Large adult size body bags with 6 handles.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "body bag, 8 handles, u-shaped zip, white, 400 microns, adult, 230 x 100 cm", category: "PPE", unit: "Each", price: 69.0, stock: 200, description: "Heavy duty adult size body bags with 8 handles.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "boundary net, 1x50m, orange fluo, roll", category: "Shelter & Field", unit: "Each", price: 29.0, stock: 50, description: "Fluorescent orange boundary net.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "box triple packaging (airsea 0500), 17x17x21 cm, 4g, gb/2815, w/biojar, pp, 1.5 l, class 6.2", category: "Cold Chain Equipment", unit: "Each", price: 76.0, stock: 100, description: "Triple packaging box for infectious substances.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "cap who logo, eng., blue, cotton, adjustable size", category: "Visibility Materials", unit: "Each", price: 4.0, stock: 500, description: "WHO branded cotton cap.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "cap who logo, eng., blue, polyester, adjustable size", category: "Visibility Materials", unit: "Each", price: 9.0, stock: 500, description: "WHO branded polyester cap.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "cell freezing container (mr frosty), 1-2ml, for 18 cryogenic tube", category: "Cold Chain Equipment", unit: "Each", price: 75.0, stock: 20, description: "Cell freezing container for lab use.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "centrifuge (phoenix cd-3124r), max 15000rpm, max 18x5ml tube 200-240v", category: "Biomedical Equipment", unit: "Each", price: 3662.0, stock: 5, description: "Refrigerated micro-centrifuge.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "centrifuge (rotanta 460 r), benchtop, max. 4 x 1000 ml, 50 - 15 000 rpm, -20/+40 c, 100-127 v", category: "Biomedical Equipment", unit: "Each", price: 8168.0, stock: 5, description: "Large capacity refrigerated benchtop centrifuge.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "cholera bed, washable canvas, w/hole diam. 20 cm, < 159 kg, 208x82.5x43 cm", category: "WASH & Water", unit: "Each", price: 137.0, stock: 100, description: "Standard cholera treatment bed.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "cold box (aucma arktek-ybc-5e), deep freeze, 7.9l + 8 pcm packs 1l", category: "Cold Chain Equipment", unit: "Each", price: 12870.0, stock: 10, description: "Long-range vaccine carrier with deep freeze capability.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "coverall (tyvek 800j), cat iii, type 3/4/5/6, hooded, s.u., white, size m", category: "PPE", unit: "Each", price: 31.0, stock: 500, description: "Chemical protection coverall, hooded, size medium.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "coverall (tyvek 800j), cat iii, type 3/4/5/6, hooded, s.u., white, size xl", category: "PPE", unit: "Each", price: 16.0, stock: 500, description: "Chemical protection coverall, hooded, size XL.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "coverall (tyvek 800j), cat iii, type 3/4/5/6, hooded, s.u., white, size xxl", category: "PPE", unit: "Each", price: 8.0, stock: 500, description: "Chemical protection coverall, hooded, size XXL.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "cryobox, pc, tube, 1-2ml, 81 holes, blue, w/lid, autocl.", category: "Cold Chain Equipment", unit: "Each", price: 1.0, stock: 200, description: "Autoclavable polycarbonate cryobox.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "data logger (libero cd), -95/+50 c, s.u.", category: "Cold Chain Equipment", unit: "Each", price: 2170.0, stock: 100, description: "Ultra-low temperature data logger.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "data logger (q-tag clm doc lr, 145-00023), multi-use, configured for +2 to +8 c", category: "Cold Chain Equipment", unit: "Each", price: 275.0, stock: 100, description: "Multi-use data logger for cold chain monitoring.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "data logger (tempilot s100), single-use, programmable, -90 to +70 c", category: "Cold Chain Equipment", unit: "Each", price: 170.0, stock: 100, description: "Single-use programmable data logger.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "face shield, clear plastic, disp.", category: "PPE", unit: "Each", price: 1.0, stock: 5000, description: "Disposable clear plastic face shield.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gloves, surgical, latex, s.u., sterile, size 7, pair", category: "PPE", unit: "Each", price: 0.0, stock: 5000, description: "Sterile surgical latex gloves, size 7.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "gloves, surgical, latex, s.u., sterile, size 7.5, pair", category: "PPE", unit: "Each", price: 0.0, stock: 5000, description: "Sterile surgical latex gloves, size 7.5.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "gloves, surgical, latex, s.u., sterile, size 8.5, pair", category: "PPE", unit: "Each", price: 0.0, stock: 5000, description: "Sterile surgical latex gloves, size 8.5.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "goggles protective (lb1 n1117), wraparound, soft frame", category: "PPE", unit: "Each", price: 2.0, stock: 1000, description: "Wraparound protective goggles with soft frame.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "goggles protective (uvex 9301-714), long nose, wraparound", category: "PPE", unit: "Each", price: 17.0, stock: 500, description: "Uvex wraparound goggles, long nose version.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "goggles protective (uvex 9301-906), flat nose, wraparound", category: "PPE", unit: "Each", price: 30.0, stock: 500, description: "Uvex wraparound goggles, flat nose version.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "goggles protective, wraparound, soft frame, indirect vent.", category: "PPE", unit: "Each", price: 11.0, stock: 1000, description: "Indirectly vented wraparound goggles.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown (medline nonelv200), aami level ii, yellow, non-sterile, size l", category: "PPE", unit: "Each", price: 1.0, stock: 2000, description: "Yellow isolation gown, size large.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown (medline nonelv200m), aami level 2, yellow, non-sterile, size m", category: "PPE", unit: "Each", price: 1.0, stock: 2000, description: "Yellow isolation gown, AAMI Level 2, size medium.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown (medline nonelv200m), aami level ii, yellow, non-sterile, size m", category: "PPE", unit: "Each", price: 1.0, stock: 2000, description: "Yellow isolation gown, AAMI Level II, size medium.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown (medline nonelv200s), aami level 2, yellow, non-sterile, size s", category: "PPE", unit: "Each", price: 1.0, stock: 2000, description: "Yellow isolation gown, AAMI Level 2, size small.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown (medline nonelv200s), aami level ii, yellow, non-sterile, size s", category: "PPE", unit: "Each", price: 1.0, stock: 2000, description: "Yellow isolation gown, AAMI Level II, size small.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "gown, aami level 3, non sterile, disp., size m", category: "PPE", unit: "Each", price: 1.0, stock: 2000, description: "Disposable AAMI Level 3 gown, size medium.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "haemacytometer, set,count.chamb.neubauer-improved dark lines,pip.thoma red+white", category: "Lab & Diagnostics", unit: "Each", price: 24.0, stock: 50, description: "Neubauer-improved counting chamber set.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "high flow nasal cannula (masimo tni softflow50), neo/inf/adult, 110-240v, w/acc", category: "Biomedical Equipment", unit: "Each", price: 2525.0, stock: 10, description: "High flow nasal cannula for oxygen therapy.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "hood (tyvek ph30l0), s.u., non-woven, fluid resistant", category: "PPE", unit: "Each", price: 1.0, stock: 1000, description: "Fluid resistant non-woven hood.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "ice pack, 0.6 l, empty, for water", category: "Cold Chain Equipment", unit: "Each", price: 2.0, stock: 1000, description: "Reusable empty ice pack, 0.6L.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "oral rehydration salts (ors), 20.5 g, pwd, sachet, for 1 l", category: "Pharmaceuticals", unit: "Each", price: 0.0, stock: 5000, description: "Individual standard ORS sachet.", storageRequirements: "Store dry, below 30°C", shelfLife: "36 months" },
  { name: "ringer lactate, 500 ml, plastic bottle", category: "Pharmaceuticals", unit: "Each", price: 1.0, stock: 2000, description: "Ringer Lactate infusion solution, 500ml.", storageRequirements: "Store at 2-30°C", shelfLife: "24 months" },
  { name: "safety box, needles/syringes, 5l, cardboard for incineration", category: "Biomedical Consumables", unit: "Each", price: 3.0, stock: 2000, description: "Individual sharps safety box, 5L.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "oxygen cylinder, 4.7 l, 150 bar, empty", category: "Biomedical Equipment", unit: "Each", price: 65.0, stock: 50, description: "Small medical oxygen cylinder, 4.7L.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "oxygen cylinder, 47.2 l, 150 bar, empty", category: "Biomedical Equipment", unit: "Each", price: 185.0, stock: 50, description: "Large medical oxygen cylinder, 47.2L.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "oxygen cylinder, 9.4 l, 150 bar, empty", category: "Biomedical Equipment", unit: "Each", price: 89.0, stock: 50, description: "Medium medical oxygen cylinder, 9.4L.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "pulse oximeter (edan h100b), spo2/pr, handheld, 100-240 v, rech. battery", category: "Biomedical Equipment", unit: "Each", price: 349.0, stock: 20, description: "Handheld professional pulse oximeter.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "pulse oximeter (pc-60n), portable, fingertip, w/accessories", category: "Biomedical Equipment", unit: "Each", price: 23.0, stock: 50, description: "Fingertip pulse oximeter for quick monitoring.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "tablet (lenovo tab m11), 11\", 128 gb rom, 4 gb ram, android", category: "IT & Communications", unit: "Each", price: 356.0, stock: 50, description: "Android tablet for field data collection.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "thermometer, infrared (beurer ft90), no-contact, handheld, 2xaaa batt.", category: "Biomedical Equipment", unit: "Each", price: 25.0, stock: 100, description: "No-contact infrared thermometer.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "stretcher (saikang), 208 x 57 cm, <159 kg patient, foldable", category: "Biomedical Equipment", unit: "Each", price: 74.0, stock: 50, description: "Foldable patient stretcher.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "ventilator (mindray sv300), neonate/pediatric/adult, on castors, 100-240v, batt., w/acc.", category: "Biomedical Equipment", unit: "Unit", price: 12495.0, stock: 5, description: "Professional medical ventilator on castors.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "ventilator (sternmed vento 62), ped/adult, on castors, 100-240 v, batt., w/acc.", category: "Biomedical Equipment", unit: "Unit", price: 42142.0, stock: 5, description: "Advanced ICU ventilator.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "oxygen concentrator (canta v8-wn-ns), 8l/mn, 220v, w/acc.", category: "Biomedical Equipment", unit: "Unit", price: 835.0, stock: 10, description: "High capacity oxygen concentrator, 8L/min.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "oxygen concentrator (longfian jay 10), 0.5-10 l/min, 230 v, w/acc.", category: "Biomedical Equipment", unit: "Unit", price: 548.0, stock: 10, description: "Portable oxygen concentrator, 10L/min.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "patient monitor (edan im60), w/ecg, nibp, temp, spo2, w/accessories", category: "Biomedical Equipment", unit: "Unit", price: 4569.0, stock: 5, description: "Multi-parameter patient monitor.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "patient monitor (biocare pm-900), 12.1\"lcd, multi-parameter, 220v, batt., w/acc", category: "Biomedical Equipment", unit: "Unit", price: 4495.0, stock: 5, description: "Professional patient monitor with LCD.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "defibrillator (cardio-aid 360b), mobile, semi-auto, multi-para., ac/dc, w/acc", category: "Biomedical Equipment", unit: "Unit", price: 7630.0, stock: 5, description: "Mobile semi-automatic defibrillator.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "chemistry analyzer (piccolo xpress), portable, 100-240 v", category: "Biomedical Equipment", unit: "Unit", price: 33309.0, stock: 2, description: "Portable blood chemistry analyzer.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "freezer, ult (aucma dw-86l348), vertical, -86/-40 c, 348 l, 220v", category: "Cold Chain Equipment", unit: "Unit", price: 6820.0, stock: 2, description: "Ultra-low temperature vertical freezer.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "freezer, lt (aucma dw-25w300), horizontal, -25/-10 c, 300 l, 220v", category: "Cold Chain Equipment", unit: "Unit", price: 616.0, stock: 2, description: "Low temperature horizontal freezer.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "tent multipurpose (xpert 72), 72m2, aluminium frame, groundsheet, w/acc", category: "Shelter & Field", unit: "Unit", price: 5952.0, stock: 10, description: "Large multipurpose field tent, 72sqm.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "rdt cholera (sd bioline 44fk30), ag, stool, w/acc., kit-20", category: "Lab & Diagnostics", unit: "Kit", price: 72.0, stock: 100, description: "Cholera rapid diagnostic test kit.", storageRequirements: "Store at 2-30°C", shelfLife: "24 months" },
  { name: "rdt malaria (first response-pi13frc25), ag pf, hrp2,card test, wb,w/acc.,kit-25", category: "Lab & Diagnostics", unit: "Kit", price: 7.0, stock: 500, description: "Malaria rapid diagnostic test kit.", storageRequirements: "Store below 30°C", shelfLife: "24 months" },
  { name: "rdt dengue (standard q-09den30a), ns1 ag+igg/igm, ser/pl/wb, w/o acc., kit-10", category: "Lab & Diagnostics", unit: "Kit", price: 35.0, stock: 200, description: "Dengue rapid diagnostic test kit.", storageRequirements: "Store at 2-30°C", shelfLife: "24 months" },
  { name: "rdt leishmaniasis visceral(kalazar detect - ins025), ab, ser.,w/o acc,kit-25", category: "Lab & Diagnostics", unit: "Kit", price: 37.0, stock: 100, description: "Leishmaniasis rapid diagnostic test kit.", storageRequirements: "Store at 2-30°C", shelfLife: "24 months" },
  { name: "rdt chikungunya (onsite - r0066c), igm, ser/pl/wb, kit-30", category: "Lab & Diagnostics", unit: "Kit", price: 85.0, stock: 100, description: "Chikungunya rapid diagnostic test kit.", storageRequirements: "Store at 2-30°C", shelfLife: "24 months" },
  { name: "(kit cholera central) module, drugs (1.1)", category: "Emergency Health Kits", unit: "Kit", price: 1356.0, stock: 20, description: "Cholera central kit - drug module.", storageRequirements: "Store below 30°C", shelfLife: "36 months" },
  { name: "(kit cholera central) module, equipment (1.3)", category: "Emergency Health Kits", unit: "Kit", price: 484.0, stock: 20, description: "Cholera central kit - equipment module.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "(kit cholera central) module, renewable supplies (1.2)", category: "Emergency Health Kits", unit: "Kit", price: 1519.0, stock: 20, description: "Cholera central kit - renewable supplies module.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "(kit cholera community) module, drugs (3.1)", category: "Emergency Health Kits", unit: "Kit", price: 287.0, stock: 20, description: "Cholera community kit - drug module.", storageRequirements: "Store below 30°C", shelfLife: "36 months" },
  { name: "(kit cholera hardware) module, water (6.2)", category: "Emergency Health Kits", unit: "Kit", price: 21585.0, stock: 10, description: "Cholera hardware kit - water module.", storageRequirements: "N/A", shelfLife: "N/A" },
  { name: "kit, cholera investigation (5), complete", category: "Emergency Health Kits", unit: "Kit", price: 830.0, stock: 20, description: "Cholera investigation kit, complete.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "(iehk 2017, basic) module, malaria", category: "Emergency Health Kits", unit: "Kit", price: 595.0, stock: 50, description: "IEHK 2017 basic kit - malaria module.", storageRequirements: "Store below 30°C", shelfLife: "36 months" },
  { name: "(iehk 2017, basic) module, medicines", category: "Emergency Health Kits", unit: "Kit", price: 215.0, stock: 50, description: "IEHK 2017 basic kit - medicines module.", storageRequirements: "Store below 30°C", shelfLife: "36 months" },
  { name: "kit, major trauma, backpack, complete (2021), for doctors/hospitals", category: "Wellbeing", unit: "Kit", price: 736.0, stock: 20, description: "Complete major trauma backpack for clinical use.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "kit, trauma (ifak 2022), individual first aid kit, ziplock bag", category: "Wellbeing", unit: "Kit", price: 216.0, stock: 100, description: "Individual first aid kit for field staff.", storageRequirements: "Store dry", shelfLife: "36 months" },
  { name: "kit, water testing (wagtech potatest classic ptw10005)", category: "WASH & Water", unit: "Kit", price: 3551.0, stock: 10, description: "Standard field water testing kit.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "boots, rubber, size 42, white, pair", category: "PPE", unit: "Pair", price: 11.0, stock: 500, description: "White rubber safety boots, size 42.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "boots, rubber, size 44, black, pair", category: "PPE", unit: "Pair", price: 4.0, stock: 500, description: "Black rubber safety boots, size 44.", storageRequirements: "Store dry", shelfLife: "N/A" },
  { name: "gloves protection, heavy duty, nitrile, green, cat iii, size 9, pair", category: "PPE", unit: "Pair", price: 6.0, stock: 500, description: "Heavy duty nitrile protection gloves, green.", storageRequirements: "Store dry", shelfLife: "60 months" },
  { name: "shoe cover, s.u., blue, pair", category: "PPE", unit: "Pair", price: 0.0, stock: 5000, description: "Disposable blue shoe covers.", storageRequirements: "Store dry", shelfLife: "60 months" }
];

// ─── SEED LOGIC ────────────────────────────────────────────

async function runSeed() {
  console.log('=== HCOMS Catalog Seeder ===\n');

  // 1. Run schema
  console.log('1. Applying schema...');
  const schemaSQL = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf8');
  await db.query(schemaSQL);
  console.log('   Schema applied.\n');

  // 2. Seed categories
  console.log('2. Seeding categories...');
  for (const cat of CATEGORIES) {
    await db.query(
      `INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
      [cat.name, cat.description]
    );
  }
  console.log(`   ${CATEGORIES.length} categories ensured.\n`);

  // 3. Seed warehouses
  console.log('3. Seeding warehouses...');
  for (const wh of WAREHOUSES) {
    await db.query(
      `INSERT INTO warehouses (name, location, code) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING`,
      [wh.name, wh.location, wh.code]
    );
  }
  console.log(`   ${WAREHOUSES.length} warehouses ensured.\n`);

  // 4. Seed items + warehouse stock
  console.log('4. Seeding catalog items...');
  let created = 0;
  let skipped = 0;

  const warehouses = (await db.query('SELECT id, code FROM warehouses')).rows;

  for (const item of ITEMS) {
    const exists = await db.query('SELECT id FROM commodities WHERE name = $1', [item.name]);

    if (exists.rows.length > 0) {
      skipped++;
      continue;
    }

    const catResult = await db.query('SELECT id FROM categories WHERE name = $1', [item.category]);
    const categoryId = catResult.rows[0]?.id;

    const result = await db.query(
      `INSERT INTO commodities (name, category, category_id, unit, price, stock, description, storage_requirements, shelf_life)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [item.name, item.category, categoryId, item.unit, item.price, item.stock,
       item.description, item.storageRequirements, item.shelfLife]
    );

    // Distribute stock: 60% Nairobi, 40% Dakar
    for (const wh of warehouses) {
      const qty = wh.code === 'NBO'
        ? Math.floor(item.stock * 0.6)
        : Math.ceil(item.stock * 0.4);

      await db.query(
        `INSERT INTO warehouse_inventory (commodity_id, warehouse_id, quantity)
         VALUES ($1, $2, $3) ON CONFLICT (warehouse_id, commodity_id) DO NOTHING`,
        [result.rows[0].id, wh.id, qty]
      );
    }
    created++;
  }
  console.log(`   Created: ${created}, Skipped (existing): ${skipped}\n`);

  // 5. Verify
  const totalItems = (await db.query('SELECT COUNT(*) FROM commodities')).rows[0].count;
  const totalCats = (await db.query('SELECT COUNT(*) FROM categories')).rows[0].count;
  const totalWI = (await db.query('SELECT COUNT(*) FROM warehouse_inventory')).rows[0].count;

  console.log('=== Seed Complete ===');
  console.log(`Total items:      ${totalItems}`);
  console.log(`Total categories: ${totalCats}`);
  console.log(`Stock records:    ${totalWI}`);
}

runSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
