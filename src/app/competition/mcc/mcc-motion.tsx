'use client'

import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

type MccMotionProps = {
  children: ReactNode
  className?: string
  delay?: number
  style?: CSSProperties
}

export function MccMotion({ children, className, delay = 0, style }: MccMotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: EASE, delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
