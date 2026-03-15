"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ImageLoader } from "../components/image-loader"
import { getItemSvgPath } from "@/lib/utils"
import { getRealItemImage } from "@/lib/real-images"
import { ShoppingCart, Check, Info, X } from "lucide-react"
import { Button } from "../components/ui/button"
import { useCart } from "@/context/cart-context"
import Image from "next/image"

interface FlipableCardProps {
  item: any
  onClose: () => void
}

export function FlipableCard({ item, onClose }: FlipableCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addToCart } = useCart()

  // Get SVG path and real image for this item
  const svgPath = getItemSvgPath(item)
  const realImage = getRealItemImage(item)

  // Check if this is the face shield item
  const isFaceShield =
    item.name === "Face Shield" || (item.category === "PPE" && item.description?.includes("face shield"))

  const handleAddToCart = () => {
    addToCart({
      ...item,
      quantity,
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-20 bg-white/80 hover:bg-white/90"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="perspective-1000 w-full">
          <motion.div
            className="relative w-full transition-all duration-500"
            animate={{
              rotateY: isFlipped ? 180 : 0,
            }}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Front of card */}
            <div
              className={`backface-hidden w-full ${isFlipped ? "opacity-0" : "opacity-100"}`}
              style={{
                backfaceVisibility: "hidden",
                position: isFlipped ? "absolute" : "relative",
                top: 0,
                left: 0,
              }}
            >
              <div className="p-6 bg-gradient-to-r from-[#005A9C]/90 to-[#0093D5]/80 text-white">
                <h2 className="text-xl font-medium">{item.name}</h2>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2 aspect-square relative rounded-md overflow-hidden bg-white border border-gray-200">
                    {realImage ? (
                      <div className="relative w-full h-full bg-white">
                        <Image
                          src={realImage || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className={`object-contain p-4 ${item.category === "PPE" || isFaceShield ? "bg-white" : ""}`}
                          priority
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        {(item.category === "PPE" || isFaceShield) && (
                          <div className="absolute inset-0 bg-white opacity-100 -z-10"></div>
                        )}
                      </div>
                    ) : (
                      <ImageLoader
                        src={svgPath || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-contain p-4"
                        priority
                        fallbackCategory={item.category}
                      />
                    )}
                  </div>

                  <div className="md:w-1/2">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-700">Description</h3>
                      <p className="mt-2 text-gray-600">{item.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-[#0093D5]/5 p-3 rounded-md">
                        <h4 className="text-sm text-[#005A9C] font-medium">Category</h4>
                        <p className="font-medium mt-1">{item.category}</p>
                      </div>
                      <div className="bg-[#0093D5]/5 p-3 rounded-md">
                        <h4 className="text-sm text-[#005A9C] font-medium">Price</h4>
                        <p className="font-bold text-[#0093D5] mt-1">{item.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-6">
                      <Button
                        variant="outline"
                        className="flex-1 border-[#0093D5] text-[#0093D5] hover:bg-[#0093D5]/10"
                        onClick={handleFlip}
                      >
                        <Info className="mr-2 h-4 w-4" /> More Info
                      </Button>

                      <motion.div className="relative flex-1" initial={false}>
                        <motion.div
                          animate={{ opacity: addedToCart ? 0 : 1, y: addedToCart ? -20 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            className="w-full bg-[#0093D5] hover:bg-[#005A9C] text-white"
                            onClick={handleAddToCart}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                          </Button>
                        </motion.div>

                        <motion.div
                          className="absolute inset-0"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: addedToCart ? 1 : 0, y: addedToCart ? 0 : 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white cursor-default">
                            <Check className="mr-2 h-4 w-4" /> Added
                          </Button>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back of card */}
            <div
              className={`backface-hidden w-full ${isFlipped ? "opacity-100" : "opacity-0"}`}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                position: isFlipped ? "relative" : "absolute",
                top: 0,
                left: 0,
              }}
            >
              <div className="p-6 bg-gradient-to-r from-[#0093D5]/80 to-[#005A9C]/90 text-white">
                <h2 className="text-xl font-medium">Detailed Information</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {/* Specifications if available */}
                  {item.specifications && (
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-700 mb-2">Specifications</h3>
                      <div className="grid grid-cols-1 gap-2 bg-gray-50 p-3 rounded-md">
                        {Object.entries(item.specifications).map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="font-medium capitalize w-1/3">{key}:</span>
                            <span className="text-gray-700 w-2/3">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Usage Information</h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                      {item.usedFor ||
                        "This item is used in emergency response operations. Detailed usage information coming soon."}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Storage Requirements</h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                      Store in a cool, dry place away from direct sunlight. Follow manufacturer guidelines for specific
                      storage requirements.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    className="border-[#0093D5] text-[#0093D5] hover:bg-[#0093D5]/10"
                    onClick={handleFlip}
                  >
                    Back to Item
                  </Button>

                  <Button className="bg-[#0093D5] hover:bg-[#005A9C] text-white" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <style jsx global>{`
          .perspective-1000 {
            perspective: 1000px;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
        `}</style>
      </motion.div>
    </div>
  )
}
