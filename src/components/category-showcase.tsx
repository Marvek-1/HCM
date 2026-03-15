"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useInventory } from "@/context/inventory-context"
import { Search } from "lucide-react"
import { Input } from "../components/ui/input"
import { CategoryDossierCard } from "../components/category-dossier-card"

export function CategoryShowcase() {
  const { categories, inventory } = useInventory()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) => category.toLowerCase().includes(searchQuery.toLowerCase()))

  // Count items in each category
  const categoryCount = categories.reduce(
    (acc, category) => {
      acc[category] = inventory.filter((item) => item.category === category).length
      return acc
    },
    {} as Record<string, number>,
  )

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const handleCategoryClick = (category: string) => {
    router.push(`/category/${encodeURIComponent(category)}`)
  }

  return (
    <section className="py-16 bg-white w-full">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-[#005A9C]">Browse Categories</h2>
            <div className="h-1 w-26 bg-[#FFC20E] mt-2" />
            <p className="text-gray-600 mt-2">
              Explore our comprehensive inventory of emergency health supplies and equipment
            </p>
          </div>

          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0093D5]" />
              <Input
                placeholder="Search categories..."
                className="pl-10 border-[#0093D5]/20 focus:border-[#0093D5] focus:ring-[#0093D5] rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No categories found matching your search criteria.</div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {filteredCategories.map((category) => (
              <CategoryDossierCard
                key={category}
                category={category}
                itemCount={categoryCount[category] || 0}
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
