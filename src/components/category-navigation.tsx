"use client"

import { useInventory } from "../context/inventory-context"

interface CategoryNavigationProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryNavigation({ categories, selectedCategory, onCategoryChange }: CategoryNavigationProps) {
  const { inventory } = useInventory()

  const getCategoryCount = (category: string) => {
    if (category === "all") {
      return inventory.length
    }
    return inventory.filter((item) => item.category === category).length
  }

  return (
    <div className="bg-white p-4 rounded-lg border sticky top-4">
      <h3 className="font-medium mb-4">Categories</h3>
      <div className="space-y-2">
        <div
          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
            selectedCategory === "all" ? "bg-[#0093D5] text-white" : "hover:bg-gray-100"
          }`}
          onClick={() => onCategoryChange("all")}
        >
          <span className="text-sm">All Items</span>
          <span className={`text-xs px-2 py-1 rounded ${selectedCategory === "all" ? "bg-white/20" : "bg-gray-200"}`}>
            {getCategoryCount("all")}
          </span>
        </div>
        {categories.map((category) => (
          <div
            key={category}
            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
              selectedCategory === category ? "bg-[#0093D5] text-white" : "hover:bg-gray-100"
            }`}
            onClick={() => onCategoryChange(category)}
          >
            <span className="text-sm">{category}</span>
            <span
              className={`text-xs px-2 py-1 rounded ${selectedCategory === category ? "bg-white/20" : "bg-gray-200"}`}
            >
              {getCategoryCount(category)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
