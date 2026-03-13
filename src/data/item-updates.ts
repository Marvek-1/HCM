// Enhanced descriptions for Chemistry Analyzer and Trauma Kit items

export const chemistryAnalyzerUpdates = [
  {
    id: 5001,
    name: "Chemistry Analyzer Piccolo Xpress",
    description: "Portable point-of-care blood chemistry analyzer with touchscreen display and automated testing",
    usedFor: "Rapid blood chemistry analysis in clinical and field settings",
    price: "$17,500.00",
    category: "Biomedical Equipment",
    status: "Normal",
    specifications: {
      dimensions: "26 x 15 x 36 cm",
      weight: "5.1 kg",
      display: "Color touchscreen",
      testTime: "Approximately 12 minutes per sample",
      sampleVolume: "100 μL whole blood, serum, or plasma",
      parameters: "Up to 14 chemistry parameters per disc",
      storage: "Onboard storage for 5,000 patient results",
      connectivity: "USB, Ethernet, optional wireless",
      power: "100-240V AC, 50-60 Hz",
      batteryBackup: "Optional rechargeable battery",
    },
    image: "/images/real/chemistry-piccolo-analyzer.png",
  },
]

export const traumaKitUpdates = [
  {
    id: 6001,
    name: "Trauma First Aid Kit",
    description: "Comprehensive trauma response kit in durable red case with MOLLE attachment system",
    usedFor: "Emergency response to traumatic injuries in field settings",
    price: "$195.00",
    category: "Emergency Health Kits",
    status: "Normal",
    specifications: {
      case: "Water-resistant nylon with MOLLE attachment system",
      weight: "1.2 kg fully equipped",
      dimensions: "22 × 18 × 8 cm",
      contents: "Tourniquets, pressure bandages, chest seals, airways, trauma shears",
      features: "Color-coded compartments for quick access",
      certification: "Meets WHO emergency response standards",
      portability: "Includes carrying handle and attachment straps",
      visibility: "High-visibility red with reflective cross marking",
    },
    image: "/images/real/trauma-kit-red.webp",
  },
]
