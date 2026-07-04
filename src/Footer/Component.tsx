import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Logo } from '@/components/Logo/Logo'
import siteConfig from '@/config/site'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-12">
        {/* Top row: logo + link groups */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" aria-label={siteConfig.name}>
              <Logo />
            </Link>
            <p className="mt-3 text-sm text-white/60 max-w-xs">{siteConfig.tagline}</p>
          </div>

          {siteConfig.footerLinks.map((group) => (
            <div key={group.heading}>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
                {group.heading}
              </p>
              <ul className="flex flex-col gap-2">
                {group.links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row: copyright + theme selector */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            &copy; {currentYear} {siteConfig.org.legalName || siteConfig.name}. All rights
            reserved.
          </p>
          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
