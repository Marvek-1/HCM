// Updated descriptions for items to match the new images

// Biomedical Equipment updates
export const biomedicalUpdates = [
  {
    id: 1001,
    name: "Operating Room Equipment Set",
    description: "Complete operating room equipment set with surgical lights, monitors, and patient table",
    usedFor: "Performing surgical procedures in hospital or field settings",
    price: "$85,000.00",
    category: "Biomedical Equipment",
    status: "Normal",
    specifications: {
      components: "Surgical lights, operating table, vital signs monitors, anesthesia machine",
      powerRequirements: "220-240V, 50/60Hz with backup power capability",
      installation: "Professional installation required",
      certification: "ISO 13485, CE marked medical devices",
      maintenance: "Annual preventive maintenance recommended",
      warranty: "2 years parts and labor",
      training: "Operator training included with purchase",
    },
    image: "/images/real/biomedical-operating-room.png",
  },
  {
    id: 1002,
    name: "Surgical Light System",
    description: "Advanced LED surgical lighting system with multiple adjustable heads",
    usedFor: "Providing optimal illumination during surgical procedures",
    price: "$12,500.00",
    category: "Biomedical Equipment",
    status: "Normal",
    specifications: {
      lightSource: "LED technology with 160,000 lux per head",
      heads: "Multiple adjustable heads with 360° rotation",
      colorTemperature: "4500K for accurate tissue color rendering",
      controlSystem: "Wall-mounted touch panel with dimming capability",
      powerConsumption: "Low power consumption with minimal heat generation",
      sterilization: "Removable handles for sterilization",
      mounting: "Ceiling mounted with flexible positioning",
    },
    image: "/images/real/biomedical-operating-room.png",
  },
]

// Emergency Health Kits updates
export const emergencyKitUpdates = [
  {
    id: 2001,
    name: "Comprehensive Emergency Medical Kit",
    description: "Complete emergency medical kit in durable red carrying case with essential supplies",
    usedFor: "First response in emergency situations and disaster relief",
    price: "$245.00",
    category: "Emergency Health Kits",
    status: "Normal",
    specifications: {
      case: "Water-resistant red nylon with reflective strips",
      weight: "3.2 kg fully equipped",
      dimensions: "40 × 25 × 20 cm",
      contents: "Bandages, gauze, masks, gloves, scissors, stethoscope, blood pressure monitor, thermometer, splints",
      features: "Organized compartments with clear labeling",
      certification: "Meets WHO emergency response standards",
      storage: "Store in cool, dry place away from direct sunlight",
    },
    image: "/images/real/emergency-first-aid-kit.png",
  },
  {
    id: 2002,
    name: "Advanced First Aid Kit",
    description: "Professional-grade first aid kit with diagnostic equipment and emergency supplies",
    usedFor: "Medical response in field settings and remote locations",
    price: "$175.00",
    category: "Emergency Health Kits",
    status: "Normal",
    specifications: {
      case: "Durable red carrying case with shoulder strap",
      contents: "Diagnostic equipment, airway management tools, wound care supplies, medications",
      organization: "Clear internal compartments for quick access",
      portability: "Lightweight design with comfortable carrying handle",
      durability: "Water-resistant and impact-resistant construction",
      compliance: "Meets or exceeds OSHA and ANSI requirements",
      refills: "Refill kits available for consumable items",
    },
    image: "/images/real/emergency-first-aid-kit.png",
  },
]

// Update any references to cholera kits to use the IDA boxes image

// Find any cholera kit items in the emergencyKitUpdates array and update them
emergencyKitUpdates.forEach((kit) => {
  if (kit.name.toLowerCase().includes("cholera")) {
    kit.image = "/images/real/ida-boxes.jpeg"
  }
})

// PPE updates
export const ppeUpdates = [
  {
    id: 3001,
    name: "Protective Coverall with Orange Seams",
    description: "High-visibility white protective coverall with orange seams and integrated hood",
    usedFor: "Protection against infectious diseases, chemicals, and hazardous materials",
    price: "$22.50",
    category: "PPE",
    status: "Normal",
    specifications: {
      material: "Tyvek or equivalent microporous material",
      classification: "Type 4/5/6 protection",
      features: "Elasticated hood, cuffs, ankles and waist with orange seam highlights",
      seams: "Stitched and taped for enhanced protection",
      zipper: "Two-way zipper with storm flap",
      sizes: "S to 3XL",
      color: "White with orange seams",
      standards: "EN 14126, EN 1073-2, EN 1149-5",
    },
    image: "/images/real/ppe-tyvek-coverall.png",
  },
  {
    id: 3002,
    name: "Biohazard Protection Suit",
    description: "Full-body protective suit for high-risk environments with integrated hood",
    usedFor: "Protection in infectious disease outbreaks and hazardous material handling",
    price: "$28.75",
    category: "PPE",
    status: "Normal",
    specifications: {
      material: "Laminated fabric with barrier film technology",
      protection: "Fluid-resistant and particle-tight",
      design: "One-piece design with attached hood",
      visibility: "High-visibility orange seams for safety",
      closure: "Front zipper with adhesive storm flap",
      certification: "ASTM F1670/F1671 for bloodborne pathogen resistance",
      disposal: "Biohazard waste disposal after single use",
      packaging: "Individually sealed packages",
    },
    image: "/images/real/ppe-tyvek-coverall.png",
  },
]
