"use client"

import { motion } from "framer-motion"
import { Info } from "lucide-react"
import { ImageLoader } from "../components/image-loader"
import { getEquipmentTypeIcon, getItemSvgPath } from "@/lib/utils"
import { Button } from "../components/ui/button"

interface EquipmentCardProps {
  equipment: any
  onClick: () => void
}

export function EquipmentCard({ equipment, onClick }: EquipmentCardProps) {
  const equipmentIcon = getEquipmentTypeIcon(equipment.name)
  const svgPath = getItemSvgPath(equipment)

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden morphic-card"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-48 overflow-hidden">
        <ImageLoader
          src={svgPath || "/placeholder.svg"}
          alt={equipment.name}
          fill
          className="object-contain p-2"
          fallbackCategory={equipment.category}
        />
        <div className="absolute top-2 right-2 bg-[#0093D5] text-white text-2xl p-2 rounded-full">{equipmentIcon}</div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-[#005A9C] mb-1">{equipment.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 h-10 mb-2">{equipment.description}</p>

        <div className="flex justify-between items-center">
          <span className="text-[#0093D5] font-bold">{equipment.price}</span>
          <Button size="sm" onClick={onClick} className="bg-[#005A9C] hover:bg-[#0093D5]">
            <Info className="mr-1 h-4 w-4" /> Details
          </Button>
        </div>
      </div>

      {equipment.specifications && (
        <div className="px-4 pb-4 pt-0">
          <div className="text-xs text-gray-500 grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {Object.entries(equipment.specifications)
              .slice(0, 4)
              .map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key}:</span>
                  <span className="font-medium text-gray-700">{value as string}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
