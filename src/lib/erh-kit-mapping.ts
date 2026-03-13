// ERH Kit color mapping based on UNFPA standards
export interface ERHKit {
  id: string
  name: string
  description: string
  color: string
  colorCode: string
  imagePath: string
}

// Standard UNFPA ERH Kit color mapping
export const erhKits: ERHKit[] = [
  {
    id: "kit1",
    name: "KIT 1 A",
    description: "CONDOMS, male condoms, 10000 people / 3mth",
    color: "Lime Green",
    colorCode: "#A4D65E",
    imagePath: "/images/real/erh_kits/erh_1.jpeg",
  },
  {
    id: "kit2",
    name: "KIT 2 A",
    description: "CLEAN DELIVERY INDIVIDUAL, mother, 10000 people / 3mth",
    color: "Pink",
    colorCode: "#F8A1BE",
    imagePath: "/images/real/erh_kits/erh_2.jpeg",
  },
  {
    id: "kit3",
    name: "KIT 3",
    description: "POST RAPE TREATMENT, 10000 people / 3mth",
    color: "Red",
    colorCode: "#ED1C24",
    imagePath: "/images/real/erh_kits/erh_3.jpeg",
  },
  {
    id: "kit4",
    name: "KIT 4",
    description: "ORAL AND INJECTABLE CONTRACEPTION, 10000 people / 3mth",
    color: "Blue",
    colorCode: "#0054A6",
    imagePath: "/images/real/erh_kits/erh_4.jpeg",
  },
  {
    id: "kit5",
    name: "KIT 5",
    description: "TREATMENT OF SEXUALLY TRANSMITTED INFECTIONS, 10000 people / 3mth",
    color: "Yellow",
    colorCode: "#FFC20E",
    imagePath: "/images/real/erh_kits/erh_5.jpeg",
  },
  {
    id: "kit6",
    name: "KIT 6A/6B",
    description: "CLINICAL DELIVERY ASSISTANCE, medical equipment & drugs, 30000 people / 3mth",
    color: "Purple",
    colorCode: "#7B439A",
    imagePath: "/images/real/erh_kits/erh_6.jpeg",
  },
  {
    id: "kit7",
    name: "KIT 7A/7B",
    description: "INTRAUTERINE DEVICES (IUD) & CONTRACEPTIVE IMPLANT, 30000 people / 3mth",
    color: "Teal",
    colorCode: "#4DC5D6",
    imagePath: "/images/real/erh_kits/erh_7.jpeg",
  },
]

/**
 * Get ERH kit information by kit number
 * @param kitNumber The kit number (e.g., "1A", "6B")
 * @returns The ERH kit information or undefined if not found
 */
export function getERHKitByNumber(kitNumber: string): ERHKit | undefined {
  const normalizedKitNumber = kitNumber.toUpperCase().replace(/\s+/g, "")

  // Handle special cases for combined kits
  if (normalizedKitNumber === "6A" || normalizedKitNumber === "6B") {
    return erhKits.find((kit) => kit.id === "kit6")
  }

  if (normalizedKitNumber === "7A" || normalizedKitNumber === "7B") {
    return erhKits.find((kit) => kit.id === "kit7")
  }

  // Handle regular cases
  return erhKits.find((kit) => {
    const kitId = kit.id.replace("kit", "")
    return normalizedKitNumber === kitId
  })
}

/**
 * Get ERH kit information by inventory item
 * @param item The inventory item
 * @returns The ERH kit information or undefined if not found
 */
export function getERHKitByItem(item: any): ERHKit | undefined {
  if (!item || !item.description) return undefined

  // Check if this is an ERH kit
  if (!item.description.includes("ERH kit UNFPA") && !item.name?.includes("ERH kit UNFPA")) {
    return undefined
  }

  // Extract kit number from description
  const kitMatch = item.description.match(/KIT\s+(\d+[A-Z]?)/i) || item.name?.match(/KIT\s+(\d+[A-Z]?)/i)

  if (!kitMatch) return undefined

  return getERHKitByNumber(kitMatch[1])
}

/**
 * Update the real image mapping for ERH kits
 * @param realItemImages The existing real item images mapping
 * @returns Updated mapping with ERH kit images
 */
export function updateERHKitImageMapping(realItemImages: Record<string, string>): Record<string, string> {
  const updatedMapping = { ...realItemImages }

  // Add ERH kit mappings
  erhKits.forEach((kit) => {
    const kitPattern = `KIT ${kit.id.replace("kit", "")}`
    updatedMapping[kitPattern] = kit.imagePath
    updatedMapping[kit.name] = kit.imagePath

    // Add variations
    updatedMapping[`ERH ${kitPattern}`] = kit.imagePath
    updatedMapping[`ERH kit UNFPA ${kitPattern}`] = kit.imagePath
  })

  return updatedMapping
}
