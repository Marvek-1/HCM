"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useInventory } from "@/context/inventory-context"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { EquipmentCard } from "@/components/equipment-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EquipmentShowcase() {
  const { inventory } = useInventory()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const router = useRouter()

  // Get equipment categories
  const equipmentCategories = Array.from(
    new Set(inventory.filter((item) => item.category !== "Vehicles").map((item) => item.category)),
  ).sort()

  // Get all equipment (non-vehicle items)
  const allEquipment = inventory.filter((item) => item.category !== "Vehicles")

  // Filter equipment based on search query and category
  const filteredEquipment = allEquipment.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || equipment.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Sort equipment
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name)
    } else if (sortBy === "price-asc") {
      const priceA = Number.parseFloat(a.price.replace(/[^0-9.-]+/g, "")) || 0
      const priceB = Number.parseFloat(b.price.replace(/[^0-9.-]+/g, "")) || 0
      return priceA - priceB
    } else if (sortBy === "price-desc") {
      const priceA = Number.parseFloat(a.price.replace(/[^0-9.-]+/g, "")) || 0
      const priceB = Number.parseFloat(b.price.replace(/[^0-9.-]+/g, "")) || 0
      return priceB - priceA
    } else if (sortBy === "category") {
      return a.category.localeCompare(b.category)
    }
    return 0
  })

  const handleEquipmentClick = (equipment: any) => {
    router.push(`/category/${encodeURIComponent(equipment.category)}?item=${equipment.id}`)
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-light text-[#333333]">
              <span className="font-bold">Medical</span> Equipment
            </h2>
            <div className="h-1 w-16 bg-[#FFC20E] mt-2" />
            <p className="text-gray-500 mt-2">Emergency response and field operation equipment</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0093D5]" />
              <Input
                placeholder="Search equipment..."
                className="pl-10 border-[#0093D5]/20 focus:border-[#0093D5] focus:ring-[#0093D5] rounded-full w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#0093D5]" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] border-[#0093D5]/20 focus:border-[#0093D5] focus:ring-[#0093D5]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {equipmentCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#0093D5]" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] border-[#0093D5]/20 focus:border-[#0093D5] focus:ring-[#0093D5]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredEquipment.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No equipment found matching your search criteria.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedEquipment.slice(0, 8).map((equipment, index) => (
              <motion.div
                key={equipment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <EquipmentCard equipment={equipment} onClick={() => handleEquipmentClick(equipment)} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button className="bg-[#005A9C] hover:bg-[#0093D5] px-8" onClick={() => router.push("/category/all")}>
            View All Equipment
          </Button>
        </div>
      </div>
    </div>
  )
}
