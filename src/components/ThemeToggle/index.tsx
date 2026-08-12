'use client'

import { Moon, Sun } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useTheme } from '@/providers/Theme'

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <button
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted sm:h-10 sm:w-10"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
