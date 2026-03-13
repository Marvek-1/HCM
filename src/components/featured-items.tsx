"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useInventory } from "@/context/inventory-context"
import { InventoryItem } from "@/components/inventory-item"
import { InventoryDetails } from "@/components/inventory-details"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export function FeaturedItems() {
  const { inventory } = useInventory()
  const router = useRouter()
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Get featured items (items with images or special status)
  const featuredItems = inventory
    .filter((item) => {
      // Include items with real images or from important categories
      const importantCategories = [
        "Emergency Health Kits",
        "Pharmaceuticals",
        "Biomedical Equipment",
        "Cold Chain Equipment",
      ]
      return importantCategories.includes(item.category)
    })
    .slice(0, 8)

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

  const handleItemClick = (item: any) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  return (
    <section className="py-16 bg-gray-50 w-full">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#005A9C] mb-4">Featured Items</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most essential emergency health supplies and equipment for rapid response.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {featuredItems.map((item) => (
            <div key={item.id} className="h-full">
              <InventoryItem
                item={item}
                onClick={() => handleItemClick(item)}
                isSelected={selectedItem?.id === item.id}
              />
            </div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <button
            onClick={() => router.push("/category/all")}
            className="px-6 py-3 bg-[#0093D5] text-white rounded-md hover:bg-[#005A9C] transition-colors"
          >
            View All Items
          </button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedItem && <InventoryDetails item={selectedItem} />}
        </DialogContent>
      </Dialog>
    </section>
  )
}
