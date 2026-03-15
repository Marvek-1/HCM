"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { ShoppingCart, Eye } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { InventoryDetails } from "../components/inventory-details"
import { getItemSvgPath } from "@/lib/utils"
import { getRealItemImage } from "@/lib/real-images"

interface InventoryItemProps {
  item: any
}

export function InventoryItem({ item }: InventoryItemProps) {
  const { addToCart } = useCart()
  const [showDetails, setShowDetails] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(item)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDetails(true)
  }

  const svgPath = getItemSvgPath(item)
  const realImage = getRealItemImage(item)
  const imageSrc = realImage || svgPath || `/placeholder.svg?height=200&width=200`

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full touch-manipulation">
        <CardContent className="p-3 sm:p-4 flex flex-col h-full">
          <div className="aspect-square mb-3 sm:mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imageSrc || "/placeholder.svg"}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `/placeholder.svg?height=200&width=200`
              }}
            />
          </div>

          <div className="flex-1 flex flex-col">
            <div className="mb-2">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-[#0093D5]/10 text-[#005A9C] rounded">
                {item.category}
              </span>
            </div>

            <h3 className="font-medium text-sm sm:text-base mb-2 line-clamp-2 flex-1 leading-tight">{item.name}</h3>

            {item.description && (
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{item.description}</p>
            )}

            {item.price && (
              <div className="mb-3">
                <span className="text-sm sm:text-base font-bold text-[#0093D5]">{item.price}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 mt-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewDetails}
                className="flex-1 h-8 sm:h-9 text-xs sm:text-sm touch-manipulation"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="flex-1 h-8 sm:h-9 text-xs sm:text-sm bg-[#0093D5] hover:bg-[#005A9C] touch-manipulation"
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showDetails && <InventoryDetails item={item} isOpen={showDetails} onClose={() => setShowDetails(false)} />}
    </>
  )
}
