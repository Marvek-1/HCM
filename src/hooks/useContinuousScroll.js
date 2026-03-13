import { useRef, useState, useEffect, useCallback } from 'react';

export function useContinuousScroll({ speed = 0.3, direction = 'down', pauseOnHover = true } = {}) {
  const containerRef = useRef(null);
  const scrollPosRef = useRef(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollDirection, setScrollDirection] = useState(direction);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) setIsHovering(true);
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) setIsHovering(false);
  }, [pauseOnHover]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const changeDirection = useCallback((newDirection) => {
    setScrollDirection(newDirection || (prev => prev === 'down' ? 'up' : 'down'));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (!isPaused && !isHovering) {
        const scrollSpeed = speed * (deltaTime / 16);
        
        if (scrollDirection === 'down') {
          scrollPosRef.current += scrollSpeed;
          const maxScroll = container.scrollHeight - container.clientHeight;
          // Loop back if we've scrolled past 1/3 of the content (since we duplicated 3x)
          if (scrollPosRef.current >= maxScroll * 0.66) {
            scrollPosRef.current = maxScroll * 0.33;
          }
        } else {
          scrollPosRef.current -= scrollSpeed;
          const maxScroll = container.scrollHeight - container.clientHeight;
          if (scrollPosRef.current <= maxScroll * 0.33) {
            scrollPosRef.current = maxScroll * 0.66;
          }
        }
        
        container.scrollTop = scrollPosRef.current;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [speed, scrollDirection, isPaused, isHovering]);

  return {
    containerRef,
    isHovering,
    isPaused,
    handleMouseEnter,
    handleMouseLeave,
    togglePause,
    changeDirection,
  };
}
