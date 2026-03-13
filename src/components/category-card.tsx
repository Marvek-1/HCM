"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { getCategoryImage } from "@/lib/real-images"
import { useInventory } from "@/context/inventory-context"
import Image from "next/image"

interface CategoryCardProps {
  category: string
  itemCount: number
  onClick: () => void
}

export function CategoryCard({ category, itemCount, onClick }: CategoryCardProps) {
  const { inventory } = useInventory()
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  // Get the best image for this category
  const categoryImage = getCategoryImage(category)

  return (
    <motion.div
      className="group cursor-pointer h-64 w-full overflow-hidden rounded-lg shadow-md transition-all hover:shadow-lg"
      variants={item}
      whileHover={{ y: -5 }}
      onClick={onClick}
    >
      <div className="relative h-full w-full overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={categoryImage || "/placeholder.svg"}
            alt={category}
            fill
            className="transition-transform duration-700 group-hover:scale-110 object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#005A9C] via-[#0093D5]/60 to-transparent" />

        <div className="absolute bottom-0 left-0 p-6 w-full">
          <h3 className="text-xl font-medium text-white mb-1">{category}</h3>
          <p className="text-gray-200 text-sm">{itemCount} items available</p>

          <div className="flex items-center mt-4 text-[#FFC20E] opacity-0 transform translate-x-[-20px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            <span className="mr-2 text-sm font-medium">View Category</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
