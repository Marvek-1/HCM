"use client"

import { useInventory } from "@/context/inventory-context"

export function LoadingScreen() {
  const { isLoading, progress } = useInventory()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#0093D5] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-4 text-[#333333]">Loading inventory data ({progress}%)...</p>
    </div>
  )
}
