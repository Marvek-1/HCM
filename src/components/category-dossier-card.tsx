"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Package, FileText, Info } from "lucide-react"
import Image from "next/image"
import { getCategoryImage } from "@/lib/real-images"

interface CategoryDossierCardProps {
  category: string
  itemCount: number
  onClick: () => void
}

export function CategoryDossierCard({ category, itemCount, onClick }: CategoryDossierCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Get the best image for this category
  const categoryImage = getCategoryImage(category)

  return (
    <motion.div
      className="relative h-[350px] w-full rounded-lg overflow-hidden shadow-lg group cursor-pointer"
      whileHover={{
        y: -5,
        transition: { duration: 0.2 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={categoryImage || "/placeholder.svg"}
          alt={category}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#005A9C] via-[#0093D5]/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div>
          <motion.div
            className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFC20E] text-[#005A9C] text-sm font-medium mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Package className="h-3.5 w-3.5 mr-1" />
            <span>{itemCount} items</span>
          </motion.div>

          <motion.h3
            className="text-2xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {category}
          </motion.h3>

          <motion.div
            className="h-1 w-16 bg-[#FFC20E] mb-3"
            initial={{ width: 0 }}
            animate={{ width: isHovered ? 80 : 64 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Stats and info */}
        <div>
          <motion.div
            className="grid grid-cols-2 gap-2 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center text-white/90">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-sm">WHO Certified</span>
            </div>
            <div className="flex items-center text-white/90">
              <Info className="h-4 w-4 mr-2" />
              <span className="text-sm">Emergency Ready</span>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center text-[#FFC20E]"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: isHovered ? 0 : -10, opacity: isHovered ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
          >
            <span className="mr-2 font-medium">View Category</span>
            <ArrowRight className="h-4 w-4" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
