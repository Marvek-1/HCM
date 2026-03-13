"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getRealItemImage } from "@/lib/real-images"

interface ImageLoaderProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fallbackCategory?: string
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
}

export function ImageLoader({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  fallbackCategory,
  objectFit = "contain",
}: ImageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  useEffect(() => {
    setImageSrc(src)
    setIsLoading(true)
    setError(false)
  }, [src])

  const handleError = () => {
    setError(true)
    setIsLoading(false)

    // Set fallback image based on category
    if (fallbackCategory) {
      // Try to use a real image for the category first
      const categoryImage = getRealItemImage({ category: fallbackCategory })
      if (categoryImage) {
        setImageSrc(categoryImage)
      } else {
        // Fall back to placeholder
        setImageSrc(`/placeholder.svg?height=600&width=800&query=${encodeURIComponent(fallbackCategory)}`)
      }
    } else {
      // Generic fallback
      setImageSrc(`/placeholder.svg?height=600&width=800&query=WHO%20Emergency%20Item`)
    }
  }

  // Determine the object-fit style based on the prop
  const objectFitClass = {
    contain: "object-contain",
    cover: "object-cover",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  }[objectFit]

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Placeholder/background while loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="text-sm text-gray-500 text-center p-2">
            <svg
              className="w-8 h-8 mx-auto text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      )}

      {/* Actual image */}
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`${className} ${objectFitClass} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        priority={priority}
        crossOrigin="anonymous"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-sm text-gray-500 text-center p-2">
            <span className="block font-medium">{alt}</span>
          </div>
        </div>
      )}
    </div>
  )
}
