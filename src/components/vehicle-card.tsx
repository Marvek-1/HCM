"use client"

import { motion } from "framer-motion"
import { Info } from "lucide-react"
import { ImageLoader } from "../components/image-loader"
import { getVehicleTypeIcon, getItemSvgPath } from "@/lib/utils"
import { Button } from "../components/ui/button"
import { getRealItemImage } from "@/lib/real-images"
import Image from "next/image"

interface VehicleCardProps {
  vehicle: any
  onClick: () => void
}

export function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const vehicleIcon = getVehicleTypeIcon(vehicle.name)
  const svgPath = getItemSvgPath(vehicle)
  const realImage = getRealItemImage(vehicle)

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden morphic-card"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-48 overflow-hidden">
        {realImage ? (
          <div className="relative w-full h-full">
            <Image
              src={realImage || "/placeholder.svg"}
              alt={vehicle.name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <ImageLoader
            src={svgPath || `/svg/fallbacks/vehicles.png`}
            alt={vehicle.name}
            fill
            className="object-contain p-2"
            fallbackCategory="Vehicles"
          />
        )}
        <div className="absolute top-2 right-2 bg-[#FFC20E] text-[#005A9C] text-2xl p-2 rounded-full">
          {vehicleIcon}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-[#005A9C] mb-1">{vehicle.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 h-10 mb-2">{vehicle.description}</p>

        <div className="flex justify-between items-center">
          <span className="text-[#0093D5] font-bold">{vehicle.price}</span>
          <Button size="sm" onClick={onClick} className="bg-[#005A9C] hover:bg-[#0093D5]">
            <Info className="mr-1 h-4 w-4" /> Details
          </Button>
        </div>
      </div>

      {vehicle.specifications && (
        <div className="px-4 pb-4 pt-0">
          <div className="text-xs text-gray-500 grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {Object.entries(vehicle.specifications)
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
