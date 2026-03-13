// Updated pharmaceutical items with new images

export const pharmaceuticalItems = [
  {
    id: 1001,
    name: "Lactated Ringer's Solution",
    description: "Sterile solution for intravenous administration, 1000 mL bag",
    usedFor: "Fluid and electrolyte replacement in dehydration, burns, surgery, and shock",
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
    image: "/images/real/lactated-ringers-iv.jpeg",
  },
  {
    id: 1002,
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
      WHORecommended: "Yes",
    },
    image: "/images/real/ors-box.webp",
  },
  {
    id: 1003,
    name: "Chlorine HTH",
    description: "Ca(ClO)2, 65%, granules, 45 kg, drum",
    usedFor: "Water disinfection and surface decontamination in emergency settings",
    price: "$216.81",
    category: "Pharmaceuticals",
    status: "Normal",
    specifications: {
      activeIngredient: "Calcium hypochlorite 65%",
      form: "Granules",
      packaging: "45 kg drum",
      dilution: "Follow WHO guidelines for proper dilution",
      applications: "Water treatment, surface disinfection",
      hazardClass: "Oxidizer, corrosive",
      storage: "Store in cool, dry place away from combustible materials",
    },
    image: "/images/real/diagnostic-test-kit.webp",
  },
]

// Cold chain equipment update
export const coldChainUpdates = [
  {
    id: 2001,
    name: "Portable Medical Refrigerator",
    description: "Portable temperature-controlled storage for vaccines and biologicals",
    usedFor: "Field transport of temperature-sensitive medical supplies and vaccines",
    price: "$1,450.00",
    category: "Cold Chain Equipment",
    status: "Normal",
    specifications: {
      capacity: "12 liters",
      temperature: "2-8°C adjustable",
      power: "AC/DC and battery operation",
      batteryLife: "Up to 12 hours on full charge",
      display: "Digital temperature display with alarm",
      weight: "5.2 kg",
      dimensions: "45 × 32 × 28 cm",
      features: "Carrying strap, digital temperature monitoring",
    },
    image: "/images/real/medical-coolers.png",
  },
]
