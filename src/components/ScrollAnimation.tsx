'use client'

import { useEffect } from 'react'

export function ScrollAnimation() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0')
          entry.target.classList.remove('opacity-0', 'translate-y-10')
        }
      })
    }, observerOptions)

    // Apply fade-in to feature cards and testimonials
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10')
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return null
}
