"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useInventory } from "@/context/inventory-context"
import { Button } from "@/components/ui/button"
import { useContinuousScroll } from "@/hooks/use-continuous-scroll"
import { ChevronDown, ChevronUp, Pause, Play } from "lucide-react"
import { getCategoryImage } from "@/lib/real-images"
import Image from "next/image"

export function CategoryScrollShowcase() {
  const { categories, inventory } = useInventory()
  const router = useRouter()
  const [duplicatedCategories, setDuplicatedCategories] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<"up" | "down">("down")

  const { containerRef, isHovering, isPaused, handleMouseEnter, handleMouseLeave, togglePause, changeDirection } =
    useContinuousScroll({
      speed: 0.3,
      direction,
      pauseOnHover: true,
    })

  // Duplicate categories to create seamless loop
  useEffect(() => {
    if (categories.length > 0) {
      // Create three sets of categories for the loop effect
      setDuplicatedCategories([...categories, ...categories, ...categories])
    }
  }, [categories])

  // Handle category click
  const handleCategoryClick = (category: string) => {
    router.push(`/category/${encodeURIComponent(category)}`)
  }

  // Toggle scroll direction
  const toggleDirection = () => {
    setDirection((prev) => (prev === "down" ? "up" : "down"))
    changeDirection()
  }

  if (duplicatedCategories.length === 0) return null

  return (
    <div className="relative h-screen overflow-hidden bg-[#005A9C]">
      {/* Control buttons */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePause}
          className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 rounded-full"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDirection}
          className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 rounded-full"
        >
          {direction === "down" ? <ChevronUp className="h-10 w-4" /> : <ChevronDown className="h-10 w-4" />}
        </Button>
      </div>

      {/* Scrolling container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll overflow-x-hidden scrollbar-hide"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative" style={{ height: `${duplicatedCategories.length * 100}vh` }}>
          {duplicatedCategories.map((category, index) => {
            // Get the best image for this category
            const categoryImage = getCategoryImage(category)

            return (
              <motion.div
                key={`${category}-${index}`}
                className="absolute w-full h-screen flex items-center justify-center"
                style={{ top: `${index * 100}vh` }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: false, margin: "-20%" }}
                onClick={() => handleCategoryClick(category)}
              >
                {/* Background image */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#005A9C]/80 to-[#0093D5]/60 z-10" />
                  <div className="relative w-full h-full">
                    <Image
                      src={categoryImage || "/placeholder.svg"}
                      alt={category}
                      fill
                      className="object-cover opacity-30 scale-125"
                      sizes="100vw"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-20 text-center text-white cursor-pointer transform transition-transform duration-300 hover:scale-105 px-8 max-w-4xl mx-auto">
                  <motion.h2
                    className="text-5xl md:text-7xl font-bold mb-4"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: false, margin: "-20%" }}
                  >
                    {category}
                  </motion.h2>
                  <motion.div
                    className="h-1 w-24 bg-[#FFC20E] mx-auto mb-6"
                    initial={{ width: 0 }}
                    whileInView={{ width: 96 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: false, margin: "-20%" }}
                  />
                  <motion.p
                    className="text-xl text-gray-200 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    viewport={{ once: false, margin: "-20%" }}
                  >
                    Explore our {category.toLowerCase()} collection
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    viewport={{ once: false, margin: "-20%" }}
                    className="mt-8"
                  >
                    <Button className="bg-[#FFC20E] hover:bg-[#FFD44F] text-[#005A9C] font-medium px-8 py-6">
                      View Category
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
