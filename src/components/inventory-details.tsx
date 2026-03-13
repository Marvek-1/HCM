"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Info, MessageCircle, X } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { getItemSvgPath } from "@/lib/utils"
import { getRealItemImage } from "@/lib/real-images"

interface InventoryDetailsProps {
  item: any
  isOpen: boolean
  onClose: () => void
}

export function InventoryDetails({ item, isOpen, onClose }: InventoryDetailsProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  if (!item) return null

  const handleAddToCart = () => {
    addToCart({ ...item, quantity })
  }

  const svgPath = getItemSvgPath(item)
  const realImage = getRealItemImage(item)
  const imageSrc = realImage || svgPath || `/placeholder.svg?height=400&width=400`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">{item.name}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={imageSrc || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = `/placeholder.svg?height=400&width=400`
                }}
              />
            </div>

            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleAddToCart} className="bg-[#0093D5] hover:bg-[#005A9C] mt-6">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-[#0093D5]/10 text-[#005A9C] rounded mb-2">
                {item.category}
              </span>
              <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
              {item.description && <p className="text-gray-600 mb-4">{item.description}</p>}
              {item.price && <div className="text-xl font-bold text-[#0093D5] mb-4">{item.price}</div>}
            </div>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">
                  <Info className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  AI Assistant
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {item.specifications && (
                    <div>
                      <h4 className="font-medium mb-2">Specifications</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {Object.entries(item.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.technical_details && (
                    <div>
                      <h4 className="font-medium mb-2">Technical Details</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {Object.entries(item.technical_details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace("_", " ")}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {item.usage_instructions && (
                  <div>
                    <h4 className="font-medium mb-2">Usage Instructions</h4>
                    <p className="text-sm text-gray-600">{item.usage_instructions}</p>
                  </div>
                )}

                {item.maintenance_requirements && (
                  <div>
                    <h4 className="font-medium mb-2">Maintenance Requirements</h4>
                    <p className="text-sm text-gray-600">{item.maintenance_requirements}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">AI Assistant</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Ask questions about this equipment for emergency response scenarios.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      How is this used in emergency situations?
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      What are the maintenance requirements?
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      What alternatives are available?
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
