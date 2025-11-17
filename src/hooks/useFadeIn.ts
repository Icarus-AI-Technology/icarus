import { useEffect, useRef, useState } from 'react'

interface UseFadeInOptions {
  threshold?: number
  delay?: number
}

export function useFadeIn({ threshold = 0.1, delay = 0 }: UseFadeInOptions = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold, delay])

  return { isVisible, ref }
}
