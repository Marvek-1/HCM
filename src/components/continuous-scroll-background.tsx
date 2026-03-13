"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimation } from "framer-motion"
import { useInventory } from "@/context/inventory-context"
import { getCategorySvgPath } from "@/lib/utils"
import { ImageLoader } from "@/components/image-loader"

export function ContinuousScrollBackground() {
  const { categories } = useInventory()
  const containerRef = useRef<HTMLDivElement>(null)
  const [duplicatedCategories, setDuplicatedCategories] = useState<string[]>([])
  const [containerHeight, setContainerHeight] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)
  const controls = useAnimation()
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const [scrollDirection, setScrollDirection] = useState(1) // 1 for down, -1 for up
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  // Duplicate categories to create seamless loop
  useEffect(() => {
    if (categories.length > 0) {
      // Duplicate the categories array to create a seamless loop
      setDuplicatedCategories([...categories, ...categories, ...categories])
    }
  }, [categories])

  // Set up container height and viewport height
  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportHeight(window.innerHeight)

      const handleResize = () => {
        setViewportHeight(window.innerHeight)
      }

      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Calculate container height based on categories
  useEffect(() => {
    if (duplicatedCategories.length > 0 && containerRef.current) {
      const categoryHeight = viewportHeight
      setContainerHeight(categoryHeight * duplicatedCategories.length)
    }
  }, [duplicatedCategories, viewportHeight])

  // Handle auto-scrolling animation
  useEffect(() => {
    let animationId: number
    let startTime = performance.now()
    const scrollSpeed = 0.5 // pixels per millisecond

    const animate = (time: number) => {
      if (!containerRef.current || !autoScrollEnabled || isHovering) {
        animationId = requestAnimationFrame(animate)
        return
      }

      const elapsed = time - startTime
      const scrollAmount = elapsed * scrollSpeed * scrollDirection

      // Get the current scroll position
      const scrollTop = containerRef.current.scrollTop

      // Calculate new scroll position
      let newScrollTop = scrollTop + scrollAmount

      // Reset scroll position when reaching the end of the middle set of categories
      // to create the illusion of infinite scrolling
      const singleSetHeight = containerHeight / 3
      if (newScrollTop >= singleSetHeight * 2) {
        newScrollTop = singleSetHeight
      } else if (newScrollTop <= 0) {
        newScrollTop = singleSetHeight
      }

      // Apply the new scroll position
      containerRef.current.scrollTop = newScrollTop

      // Reset the start time for the next frame
      startTime = time

      // Continue the animation
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [containerHeight, autoScrollEnabled, scrollDirection, isHovering])

  // Handle manual scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !autoScrollEnabled) return

      const currentScrollY = containerRef.current.scrollTop

      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection(1) // scrolling down
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection(-1) // scrolling up
      }

      setLastScrollY(currentScrollY)

      // Implement the loop effect
      const singleSetHeight = containerHeight / 3
      if (currentScrollY >= singleSetHeight * 2) {
        containerRef.current.scrollTop = singleSetHeight
      } else if (currentScrollY <= 0) {
        containerRef.current.scrollTop = singleSetHeight
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [containerHeight, lastScrollY, autoScrollEnabled])

  // Handle mouse interactions
  const handleMouseEnter = () => {
    setIsHovering(true)
    setAutoScrollEnabled(false)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setAutoScrollEnabled(true)
  }

  if (duplicatedCategories.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-y-scroll overflow-x-hidden scrollbar-hide z-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ height: "100vh" }}
    >
      <div style={{ height: containerHeight }}>
        {duplicatedCategories.map((category, index) => (
          <div
            key={`${category}-${index}`}
            className="h-screen w-full relative"
            style={{
              position: "absolute",
              top: index * viewportHeight,
              left: 0,
              right: 0,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#005A9C]/80 to-[#0093D5]/60 z-10" />

            <div className="relative h-full w-full overflow-hidden">
              <ImageLoader
                src={getCategorySvgPath(category) || "/placeholder.svg"}
                alt={category}
                fill
                className="object-contain opacity-30 scale-125"
                fallbackCategory={category}
              />
            </div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false, margin: "-20%" }}
            >
              <div className="text-center text-white">
                <motion.h2
                  className="text-5xl md:text-7xl font-bold mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: false, margin: "-20%" }}
                >
                  {category}
                </motion.h2>
                <motion.div
                  className="h-1 w-24 bg-[#FFC20E] mx-auto mb-6"
                  initial={{ width: 0 }}
                  whileInView={{ width: 96 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: false, margin: "-20%" }}
                />
                <motion.p
                  className="text-xl text-gray-200 max-w-md mx-auto"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: false, margin: "-20%" }}
                >
                  Explore our {category.toLowerCase()} collection
                </motion.p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}
