// This file contains updates to inventory items to better match our new images
// These would be merged into the main inventory.json in a real application

// For the Pharmaceuticals category
export const pharmaceuticalItems = [
  {
    id: 101,
    name: "Lactated Ringer's Solution",
    description: "Sterile solution for intravenous administration, 1000 mL bag",
    usedFor: "Fluid and electrolyte replacement in dehydration, burns, and surgery",
    price: "$4.50",
    category: "Pharmaceuticals",
    status: "Normal",
    specifications: {
      volume: "1000 mL",
      composition: "Sodium chloride, potassium chloride, calcium chloride, sodium lactate",
      sterility: "Sterile, non-pyrogenic",
      storage: "Store at room temperature (15-30°C)",
      shelfLife: "24 months from date of manufacture",
      administration: "For intravenous use only",
    },
  },
  {
    id: 102,
    name: "Oral Rehydration Salts (ORS)",
    description: "WHO-recommended formula, orange flavor, 10 sachets per box",
    usedFor: "Prevention and treatment of dehydration due to diarrhea, including cholera",
    price: "$3.25",
    category: "Pharmaceuticals",
    status: "Normal",
    specifications: {
      quantity: "10 sachets per box",
      weight: "30g per sachet",
      flavor: "Orange",
      composition: "Glucose, sodium chloride, potassium chloride, trisodium citrate",
      preparation: "Dissolve one sachet in 1 liter of clean water",
      storage: "Store in a cool, dry place",
    },
  },
]

// For the Lab & Diagnostics category
export const diagnosticItems = [
  {
    id: 103,
    name: "Cholera Test Kit",
    description: "SD Cholera Ag 01/0139 rapid immunochromatographic test",
    usedFor: "Rapid detection of Vibrio cholerae O1/O139 antigens in human stool specimens",
    price: "$85.00",
    category: "Lab & Diagnostics",
    status: "Normal",
    specifications: {
      testType: "Lateral flow immunochromatographic assay",
      sensitivity: "≥ 90%",
      specificity: "≥ 95%",
      testTime: "15-20 minutes",
      storage: "2-30°C",
      shelfLife: "24 months from date of manufacture",
      contents: "20 test devices, buffer solution, sample collection tools",
    },
  },
]

// For the Biomedical Equipment category
export const biomedicalItems = [
  {
    id: 104,
    name: "Patient Monitor",
    description: "Advanced vital signs monitor with multi-parameter capabilities",
    usedFor: "Continuous monitoring of patient vital signs in clinical settings",
    price: "$3,500.00",
    category: "Biomedical Equipment",
    status: "Normal",
    specifications: {
      parameters: "ECG, NIBP, SpO2, Temperature, Respiration",
      display: '12.1" color TFT LCD',
      alarms: "Audible and visual, adjustable limits",
      battery: "Rechargeable lithium-ion, 4 hours operation",
      connectivity: "LAN, USB, HL7 compatible",
      dimensions: "318 × 264 × 152 mm",
      weight: "4.5 kg",
    },
  },
]

// For the Cold Chain Equipment category
export const coldChainItems = [
  {
    id: 105,
    name: "Portable Medical Refrigerator",
    description: "Portable temperature-controlled storage for vaccines and biologicals",
    usedFor: "Field transport of temperature-sensitive medical supplies",
    price: "$1,200.00",
    category: "Cold Chain Equipment",
    status: "Normal",
    specifications: {
      capacity: "8 liters",
      temperature: "2-8°C adjustable",
      power: "AC/DC and battery operation",
      batteryLife: "Up to 12 hours on full charge",
      display: "Digital temperature display with alarm",
      weight: "4.8 kg",
      dimensions: "42 × 28 × 24 cm",
    },
  },
]

// For the Wellbeing category
export const wellbeingItems = [
  {
    id: 106,
    name: "Trauma First Aid Kit",
    description: "Comprehensive trauma response kit in durable red case",
    usedFor: "Emergency response to traumatic injuries in field settings",
    price: "$195.00",
    category: "Wellbeing",
    status: "Normal",
    specifications: {
      case: "Water-resistant nylon with MOLLE attachment system",
      weight: "1.2 kg fully equipped",
      dimensions: "22 × 18 × 8 cm",
      contents: "Tourniquets, pressure bandages, chest seals, airways, trauma shears",
      features: "Color-coded compartments for quick access",
      certification: "Meets WHO emergency response standards",
    },
    image: "/images/real/trauma-kit-red.webp",
  },
]

// For the PPE category - updated with new face shield
export const ppeItems = [
  {
    id: 203,
    name: "Face Shield",
    description: "High-visibility yellow-frame face shield with clear visor for splash and droplet protection",
    usedFor: "Protection against splashes, droplets, and aerosols in medical and industrial settings",
    price: "$8.75",
    category: "PPE",
    status: "Normal",
    specifications: {
      material: "Clear polycarbonate visor with high-visibility yellow frame",
      dimensions: "Full face coverage with extended chin protection",
      features: "Adjustable headband with comfort padding, anti-fog design",
      reusability: "Reusable after proper disinfection",
      weight: "180g",
      protection: "Provides ANSI Z87.1 splash and impact protection",
      adjustability: "Ratchet adjustment system for secure fit",
      visibility: "High-visibility yellow frame for safety awareness",
    },
    image: "/images/real/face-shield-yellow.png",
  },
]
