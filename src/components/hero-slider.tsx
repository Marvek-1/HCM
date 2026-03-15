"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../components/ui/button"
import { WHOLogo } from "../components/who-logo"

const slides = [
  {
    title: "Nairobi Hub Inventory Catalogue",
    subtitle: "Your one-stop gallery of services and knowledge base for your emergency needs",
    image: "/images/real/emergency-health-kit.png",
    color: "from-blue-900/80 to-blue-800/80",
  },
  {
    title: "Emergency Health Kits",
    subtitle: "Pre-packaged kits for rapid deployment in emergency situations",
    image: "/images/real/emergency-first-aid-kit.png",
    color: "from-blue-900/80 to-blue-800/80",
  },
  {
    title: "Field Support Materials",
    subtitle: "Essential equipment for field operations and emergency response",
    image: "/images/real/field-support-cot.png",
    color: "from-blue-900/80 to-blue-800/80",
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay])

  const handlePrev = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {slides.map(
          (slide, index) =>
            current === index && (
              <motion.div
                key={index}
                className="absolute inset-0 h-full w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative h-full w-full">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${slide.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.color}`} />

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <WHOLogo className="mb-6 h-16 w-auto" />
                    <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">{slide.title}</h1>
                    <p className="mb-8 max-w-2xl text-xl text-white/90">{slide.subtitle}</p>
                  </div>
                </div>
              </motion.div>
            ),
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-8 rounded-full transition-all ${current === index ? "bg-white" : "bg-white/50"}`}
            onClick={() => {
              setAutoplay(false)
              setCurrent(index)
            }}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
        onClick={handlePrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
        onClick={handleNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  )
}
