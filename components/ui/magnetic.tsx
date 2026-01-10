"use client"

import { useRef, useState, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface MagneticProps {
  children: ReactNode
  strength?: number
}

export const Magnetic = ({ children, strength = 30 }: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e
    const { width, height, left, top } = ref.current?.getBoundingClientRect() || { width: 0, height: 0, left: 0, top: 0 }
    
    const x = (clientX - (left + width / 2)) * (strength / 100)
    const y = (clientY - (top + height / 2)) * (strength / 100)
    
    setPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      style={{ position: 'relative' }}
    >
      {children}
    </motion.div>
  )
}
