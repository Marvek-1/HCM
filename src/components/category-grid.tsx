"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useInventory } from "@/context/inventory-context"
import { Badge } from "../components/ui/badge"
import { Search, Layers } from "lucide-react"
import { Input } from "../components/ui/input"
import { EPRLogo } from "../components/epr-logo"
import { Button } from "../components/ui/button"

const CATEGORY_ICONS = {
  "Biomedical Consumables": "🧪",
  "Biomedical Equipment": "🔬",
  "Cold Chain Equipment": "❄️",
  "Emergency Health Kits": "🧰",
  "Field Support Material": "🏕️",
  "IT & Communication Equipment": "💻",
  "Lab & Diagnostics": "🔍",
  Nutrition: "🍎",
  PPE: "🥽",
  Pharmaceuticals: "💊",
  Vehicles: "🚑",
  "Visibility Materials": "👁️",
  "Wash & IPC Materials": "🧼",
  Wellbeing: "❤️",
}

export function CategoryGrid() {
  const { categories, inventory } = useInventory()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const filteredCategories = categories.filter((category) => category.toLowerCase().includes(searchQuery.toLowerCase()))

  const categoryItemCounts = categories.reduce(
    (counts, category) => {
      counts[category] = inventory.filter((item) => item.category === category).length
      return counts
    },
    {} as Record<string, number>,
  )

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  const navigateToCategory = (category: string) => {
    router.push(`/category/${encodeURIComponent(category)}`)
  }

  const getCategoryIcon = (category: string): string => {
    return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || "📦"
  }

  if (!isLoaded) return null

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 md:py-8">
      <header className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <EPRLogo className="mr-4" />
          </div>
          <div className="flex gap-2 md:gap-4 w-full md:w-auto">
            <Button
              className="flex-1 md:flex-none bg-[#FFC20E] hover:bg-[#FFD44F] text-[#333333] text-sm md:text-base"
              onClick={() => router.push("/scroll")}
            >
              <Layers className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">View Scrolling Categories</span>
              <span className="sm:hidden">Scroll View</span>
            </Button>
          </div>
        </div>

        <div className="bg-blue-800 p-3 md:p-4 rounded-lg shadow-lg mb-6 md:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
            <Input
              placeholder="Search categories..."
              className="pl-10 bg-blue-900 border-blue-700 text-white placeholder:text-blue-400 h-10 md:h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="bg-blue-800 rounded-lg shadow-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
          <h2 className="text-lg md:text-xl font-semibold text-white">Categories</h2>
          <Badge
            className="bg-blue-600 hover:bg-blue-500 cursor-pointer text-sm"
            onClick={() => navigateToCategory("all")}
          >
            View All Items
          </Badge>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-blue-200 text-sm md:text-base">
            No categories found matching your search criteria.
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
            variants={containerAnimation}
            initial="hidden"
            animate="show"
          >
            {filteredCategories.map((category) => (
              <motion.div
                key={category}
                className="bg-blue-900 rounded-lg p-3 md:p-4 cursor-pointer hover:bg-blue-800 transition-colors border border-blue-700 hover:border-blue-500 touch-manipulation"
                onClick={() => navigateToCategory(category)}
                variants={itemAnimation}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="h-24 sm:h-28 md:h-32 flex items-center justify-center bg-blue-950 rounded-md mb-3 overflow-hidden">
                  <div className="text-3xl sm:text-4xl md:text-5xl text-blue-400 opacity-70">
                    {getCategoryIcon(category)}
                  </div>
                </div>
                <h3 className="font-medium text-white text-sm sm:text-base md:text-lg mb-1 line-clamp-2">{category}</h3>
                <p className="text-blue-300 text-xs sm:text-sm">{categoryItemCounts[category] || 0} items available</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
