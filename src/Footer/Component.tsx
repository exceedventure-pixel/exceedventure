import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Logo } from '@/components/Logo/Logo'
import siteConfig from '@/config/site'

import { socialIcons } from '@/components/SocialIcons'


export function Footer() {
  const currentYear = new Date().getFullYear()
  const { contact, social } = siteConfig

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="container py-16">
        {/* Top: brand column + link groups */}
        <div className="grid grid-cols-1 gap-12 mb-14 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-3 space-y-6">
            <Link href="/" aria-label={siteConfig.name} className="inline-block">
              <Logo />
            </Link>

            <div className="flex flex-col gap-3">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {contact.email}
                </a>
              )}
              {contact.address && (
                <p className="flex items-start gap-2 text-muted-foreground whitespace-pre-line">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mt-1 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {contact.address}
                </p>
              )}
            </div>

            {social.length > 0 && (
              <div className="flex gap-4 items-center pt-2">
                {social.map((item) => {
                  const Icon = socialIcons[item.icon]
                  if (!Icon) return null
                  return (
                    <a
                      key={item.platform}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.platform}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Icon size={30} />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Link groups */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-9 lg:grid-cols-5">
            {siteConfig.footerLinks.map((group) => (
              <div key={group.heading}>
                <h3 className="font-bold text-lg mb-6 text-foreground">{group.heading}</h3>
                <ul className="space-y-4">
                  {group.links.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {siteConfig.org.legalName || siteConfig.name}. All rights reserved.
          </p>
          <ThemeSelector />
        </div>
      </div>
    </footer>
  )
}
