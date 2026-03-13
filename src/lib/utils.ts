import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getItemSvgPath(item: any): string {
  if (typeof item === "object" && item !== null) {
    const category = item.category?.toLowerCase().replace(/\s+/g, "-") || "unknown"
    const itemId = item.id?.toString().padStart(3, "0") || "000"
    return `/svg/items/${category}/${itemId}.png`
  }

  const category = (typeof item === "string" ? item : "unknown").toLowerCase().replace(/\s+/g, "-")
  return `/svg/categories/${category}.png`
}

export function getFallbackSvgPath(category: string): string {
  return `/svg/fallbacks/${category.toLowerCase().replace(/\s+/g, "-")}.png`
}

export function getEquipmentTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    "Biomedical Equipment": "activity",
    "Biomedical Consumables": "clipboard",
    "Cold Chain Equipment": "thermometer",
    "Emergency Health Kits": "first-aid",
    "Field Support Material": "tent",
    PPE: "shield",
    Vehicles: "truck",
    default: "package",
  }

  return iconMap[type] || iconMap["default"]
}

export function getVehicleTypeIcon(vehicleName: string): string {
  const name = vehicleName.toLowerCase()

  if (name.includes("ambulance")) return "🚑"
  if (name.includes("truck") || name.includes("lorry")) return "🚚"
  if (name.includes("van")) return "🚐"
  if (name.includes("jeep") || name.includes("land cruiser") || name.includes("suv")) return "🚙"
  if (name.includes("motorcycle") || name.includes("bike")) return "🏍️"
  if (name.includes("helicopter")) return "🚁"
  if (name.includes("plane") || name.includes("aircraft")) return "✈️"
  if (name.includes("boat") || name.includes("ship")) return "🚢"

  return "🚗"
}
