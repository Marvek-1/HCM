"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useInventory } from "@/context/inventory-context"
import { Search, Filter } from "lucide-react"
import { Input } from "../components/ui/input"
import { VehicleCard } from "../components/vehicle-card"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

export function VehiclesShowcase() {
  const { inventory } = useInventory()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const router = useRouter()

  // Get all vehicles
  const vehicles = inventory.filter((item) => item.category === "Vehicles")

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort vehicles
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
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
    }
    return 0
  })

  const handleVehicleClick = (vehicle: any) => {
    router.push(`/category/Vehicles?item=${vehicle.id}`)
  }

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-light text-[#333333]">
              <span className="font-bold">Vehicle</span> Fleet
            </h2>
            <div className="h-1 w-16 bg-[#FFC20E] mt-2" />
            <p className="text-gray-500 mt-2">Emergency response and field operation vehicles</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0093D5]" />
              <Input
                placeholder="Search vehicles..."
                className="pl-10 border-[#0093D5]/20 focus:border-[#0093D5] focus:ring-[#0093D5] rounded-full w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No vehicles found matching your search criteria.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <VehicleCard vehicle={vehicle} onClick={() => handleVehicleClick(vehicle)} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button className="bg-[#005A9C] hover:bg-[#0093D5] px-8" onClick={() => router.push("/category/Vehicles")}>
            View All Vehicles
          </Button>
        </div>
      </div>
    </div>
  )
}
