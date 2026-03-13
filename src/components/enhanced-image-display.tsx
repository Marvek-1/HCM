"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface EnhancedImageDisplayProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}

export function EnhancedImageDisplay({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: EnhancedImageDisplayProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Enhanced image with CSS filters for better appearance */}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          "object-contain transition-all duration-300",
          // CSS filters to enhance image quality
          "contrast-110 brightness-105 saturate-110",
          // Smooth edges and anti-aliasing
          "antialiased",
          // Loading state
          isLoading && "blur-sm",
          // Error state
          hasError && "grayscale",
        )}
        style={{
          // Additional CSS for image enhancement
          imageRendering: "high-quality",
          filter: `
            contrast(1.1) 
            brightness(1.05) 
            saturate(1.1)
            drop-shadow(0 2px 8px rgba(0,0,0,0.1))
          `,
        }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Image unavailable</div>
          </div>
        </div>
      )}
    </div>
  )
}
