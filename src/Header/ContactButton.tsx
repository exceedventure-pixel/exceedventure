'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, MessageCircle, Mail, SendHorizontal, X } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { useAccent } from '@/providers/Accent'
import { ContactChat } from '@/components/ContactChat'
import type { ContactChannels } from '@/utilities/getSiteSettings'

/**
 * The header's Contact button — a menu of ways to reach us rather than a link.
 *
 * Calling and WhatsApp are what people actually want from a header on a phone,
 * and both are one tap from here instead of a page load and a form. The full
 * contact page stays as the last item, so the button never removes a route that
 * already exists and the form is still reachable.
 *
 * If nothing is configured in the CMS the button falls back to being a plain
 * link to /contact — a menu with one item in it is worse than no menu.
 */
export const ContactButton: React.FC<{ channels: ContactChannels }> = ({ channels }) => {
  const [open, setOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  // createPortal needs document, which does not exist during the server render.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { accent, tokens } = useAccent()
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const pathname = usePathname()

  /**
   * Call and WhatsApp appear once their numbers are set in the CMS. Email is
   * always present — it falls back to the address in site config — so the menu
   * is never down to a single item and the button always behaves as a menu.
   *
   * An earlier version collapsed to a plain link whenever no numbers were
   * configured. That made a built feature look like it was missing, which is a
   * worse failure than a short menu.
   */
  const options = [
    channels.phoneHref && {
      key: 'call',
      Icon: Phone,
      label: 'Call us',
      detail: channels.phone!,
      href: channels.phoneHref,
      external: false,
      tint: 'bg-blue-500/10 text-blue-600',
    },
    channels.whatsappHref && {
      key: 'whatsapp',
      Icon: MessageCircle,
      label: 'WhatsApp',
      detail: channels.whatsapp!,
      href: channels.whatsappHref,
      external: true,
      tint: 'bg-emerald-500/10 text-emerald-600',
    },
    channels.email && {
      key: 'email',
      Icon: Mail,
      label: 'Email us',
      detail: channels.email,
      href: `mailto:${channels.email}`,
      external: false,
      tint: 'bg-violet-500/10 text-violet-600',
    },
  ].filter(Boolean) as {
    key: string
    Icon: typeof Phone
    label: string
    detail: string
    href: string
    external: boolean
    tint: string
  }[]

  // Close on navigation, outside click, and Escape.
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  /*
   * Takes the accent on its border and its text, not as a fill.
   *
   * This is deliberately the quieter of the two header buttons — the account
   * pill beside it is the solid one — and filling both would leave the header
   * with two equally loud actions and no obvious primary.
   */
  const triggerClass = cn(
    'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors duration-500 hover:bg-muted sm:gap-2 sm:px-4',
    accent === 'brand' ? 'border-border' : cn(tokens.ring, tokens.accent),
  )

  /** Pulsing dot — reads as an "available now" status indicator. */
  const dot = (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
    </span>
  )

  // Only if even the email fallback is somehow empty. Practically unreachable,
  // kept so the header can never render a menu with nothing in it.
  if (options.length === 0) {
    return (
      <Link href="/contact" className={triggerClass}>
        {dot}
        Contact
      </Link>
    )
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={cn(triggerClass, open && 'bg-muted')}
      >
        {dot}
        Contact
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Ways to contact us"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
        >
          <p className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Talk to us
          </p>

          {options.map(({ key, Icon, label, detail, href, external, tint }) => (
            <a
              key={key}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted"
            >
              <span
                aria-hidden="true"
                className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', tint)}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block truncate text-xs text-muted-foreground">{detail}</span>
              </span>
            </a>
          ))}

          {/*
           * Opens the chat rather than navigating to /contact. Someone who
           * clicked "Contact" has already decided to talk to us — sending them
           * to a page with a four-field form is a step backwards from a box
           * they can type into immediately.
           */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              setChatOpen(true)
            }}
            className="flex w-full items-center gap-3 border-t border-border px-3 py-2.5 text-left transition-colors hover:bg-muted"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
            >
              <SendHorizontal className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">Send a message</span>
              <span className="block truncate text-xs text-muted-foreground">
                Chat with us about your project
              </span>
            </span>
          </button>

          <Link
            href="/contact"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-3 py-2 text-center text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Open the full contact page
          </Link>
        </div>
      )}

      {/*
       * Portalled to <body>, not rendered in place.
       *
       * `#page-wrapper` carries a transform for the push-drawer animation, and a
       * transformed ancestor becomes the containing block for `position: fixed`
       * — so a dialog rendered here positioned itself against the header
       * instead of the viewport and sat partly off-screen. The mobile drawer
       * portals for the same reason.
       */}
      {chatOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-70 flex items-end justify-center p-4 sm:items-center">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setChatOpen(false)}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Contact us"
              className="relative w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-200"
            >
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
                className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-lg transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
              <ContactChat size="tall" />
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
