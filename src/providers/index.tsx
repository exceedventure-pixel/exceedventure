import React from 'react'

import { AccentProvider } from './Accent'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <AccentProvider>{children}</AccentProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
