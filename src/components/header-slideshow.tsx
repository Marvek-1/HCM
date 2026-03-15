"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WHOLogo } from "../components/who-logo"

const slideshowImages = [
  "/images/slideshow/cargo-loading.jpeg",
  "/images/slideshow/equipment-inspection-cropped.png",
  "/images/slideshow/equipment-inspection.png",
]

export function HeaderSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slideshowImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-[500px] w-full overflow-hidden">
      {/* Slideshow background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <div className="relative h-full w-full">
            <img
              src={slideshowImages[currentIndex] || "/placeholder.svg"}
              alt={`WHO operations slide ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#005A9C]/60" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Static title overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="text-center">
          <WHOLogo className="h-20 w-auto mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Nairobi Hub Inventory Catalogue
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Your one-stop gallery of services and knowledge base for your emergency needs
          </p>
        </div>
      </div>

      {/* Slideshow indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-20">
        {slideshowImages.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-8 rounded-full transition-all ${currentIndex === index ? "bg-[#FFC20E]" : "bg-white/50"}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
