import type React from "react"
interface BackgroundImageProps {
  imageUrl: string
  opacity?: number
  children: React.ReactNode
  className?: string
}

export function BackgroundImage({ imageUrl, opacity = 0.15, children, className = "" }: BackgroundImageProps) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          opacity: opacity,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
