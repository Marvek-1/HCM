"use client"

import { useState, useEffect } from "react"
import { useInventory } from "@/context/inventory-context"
import { InventoryItem } from "../components/inventory-item"
import { CategoryNavigation } from "../components/category-navigation"
import { Pagination } from "../components/pagination"
import { Search, Filter, X } from "lucide-react"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"

const ITEMS_PER_PAGE = 12

interface InventoryCatalogProps {
  selectedCategory?: string
}

export function InventoryCatalog({ selectedCategory = "all" }: InventoryCatalogProps) {
  const { inventory, categories, loading } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [activeCategory, setActiveCategory] = useState(selectedCategory)

  useEffect(() => {
    setActiveCategory(selectedCategory)
    setCurrentPage(1)
  }, [selectedCategory])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeCategory])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0093D5] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    )
  }

  const filteredItems = inventory.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const clearSearch = () => {
    setSearchTerm("")
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setShowFilters(false)
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 md:py-6">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {activeCategory === "all" ? "All Items" : activeCategory}
        </h1>
        <p className="text-sm md:text-base text-gray-600">{filteredItems.length} items available</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-10 md:h-11"
            />
            {searchTerm && (
              <Button variant="ghost" size="sm" onClick={clearSearch} className="absolute right-1 top-1 h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto h-10 md:h-11"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-4 md:gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <CategoryNavigation
            categories={categories}
            selectedCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {currentItems.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-8 w-8 md:h-12 md:w-12 mx-auto" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-sm md:text-base text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
                {currentItems.map((item) => (
                  <InventoryItem key={item.id} item={item} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
