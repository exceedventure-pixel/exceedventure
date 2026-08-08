'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import siteConfig from '@/config/site'

/**
 * Chat-style enquiry widget for the hamburger panel.
 *
 * It behaves like an ordinary message interface: the visitor writes and sends.
 * The first send is gated by a popup asking who they are, because a message we
 * can't reply to is worthless; once given, that identity is reused for the rest
 * of the session and sending is uninterrupted.
 *
 * Replies are canned for now — `respondTo` is the single seam where an AI
 * response would slot in later. Every message posts to the same endpoint the
 * /contact page uses.
 */

type Msg = { id: number; from: 'them' | 'you'; text: string }
type Identity = { name: string; email: string }

const GREETING = 'Hi! Send us a message and we’ll get back to you.'

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const initials = siteConfig.name
  .split(' ')
  .map((w) => w[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

/** Canned for now; swap this for an AI call without touching the transport. */
const respondTo = (isFirst: boolean, who: Identity) =>
  isFirst
    ? `Thanks, ${who.name.split(' ')[0]} — that's with us. We'll reply to ${who.email}.`
    : 'Got it — added to the thread.'

const fieldClass =
  'w-full rounded-lg bg-(--menu-surface-hover) px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40'

const TypingDots: React.FC = () => (
  <div className="flex justify-start">
    <span className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-(--menu-surface-hover) px-3 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
    <span className="sr-only">Typing…</span>
  </div>
)

export const MenuContactForm: React.FC = () => {
  const [messages, setMessages] = useState<Msg[]>([{ id: 0, from: 'them', text: GREETING }])
  const [draft, setDraft] = useState('')
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [asking, setAsking] = useState(false)
  const [idError, setIdError] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)
  const [sending, setSending] = useState(false)

  const nextId = useRef(1)
  const threadRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  // The panel stays mounted, so pending replies must not outlive the component.
  useEffect(() => {
    const live = timers.current
    return () => live.forEach(clearTimeout)
  }, [])

  // Keep the newest message in view. scrollTop rather than scrollIntoView, which
  // would also scroll the page behind the menu.
  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  useEffect(() => {
    if (asking) nameRef.current?.focus()
  }, [asking])

  const push = useCallback((from: Msg['from'], text: string) => {
    setMessages((m) => [...m, { id: nextId.current++, from, text }])
  }, [])

  const deliver = useCallback(
    async (text: string, who: Identity, isFirst: boolean) => {
      push('you', text)
      setSending(true)
      setTyping(true)
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...who, message: text }),
        })
        if (!res.ok) throw new Error(String(res.status))
        push('them', respondTo(isFirst, who))
      } catch {
        push('them', `That didn't send. You can try again, or email ${siteConfig.contact.email}.`)
      } finally {
        setTyping(false)
        setSending(false)
      }
    },
    [push],
  )

  const onSend = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    // First message: hold it back and ask who we're replying to.
    if (!identity) {
      setPending(text)
      setDraft('')
      setIdError(null)
      setAsking(true)
      return
    }
    setDraft('')
    void deliver(text, identity, false)
  }

  const onIdentify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()

    if (!name) return setIdError('Please add your name.')
    if (!isEmail(email)) return setIdError('That doesn’t look like an email address.')

    const who = { name, email }
    setIdentity(who)
    setAsking(false)
    setIdError(null)
    const text = pending
    setPending(null)
    if (text) void deliver(text, who, true)
  }

  /** Cancelling puts the held message back in the composer rather than losing it. */
  const cancelIdentify = () => {
    setAsking(false)
    setIdError(null)
    if (pending) setDraft(pending)
    setPending(null)
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-background shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06),0_14px_32px_-10px_rgba(0,0,0,0.22)] ring-1 ring-(--menu-border)">
      {/* ── Header: brand strip so the widget reads as a chat, not a panel section ── */}
      <div className="flex items-center gap-2.5 bg-primary px-3.5 py-3 text-primary-foreground">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-[11px] font-bold">
          {initials}
        </span>
        <p className="min-w-0 truncate text-sm font-semibold">{siteConfig.name}</p>
      </div>

      {/* ── Thread ── */}
      <div
        ref={threadRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="h-40 space-y-2 overflow-y-auto p-3"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={clsx('flex', m.from === 'you' ? 'justify-end' : 'justify-start')}
          >
            <span
              className={clsx(
                'max-w-[85%] animate-in rounded-2xl px-3 py-2 text-xs leading-relaxed fade-in-0 slide-in-from-bottom-1 duration-200 ease-out',
                m.from === 'you'
                  ? 'rounded-br-sm bg-primary text-primary-foreground'
                  : 'rounded-bl-sm bg-(--menu-surface-hover) text-foreground',
              )}
            >
              {m.text}
            </span>
          </div>
        ))}
        {typing && <TypingDots />}
      </div>

      {/* ── Composer ── */}
      <form onSubmit={onSend} className="flex items-center gap-2 p-2.5 pt-0">
        <label className="sr-only" htmlFor="menu-chat-input">
          Your message
        </label>
        <input
          id="menu-chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your message…"
          disabled={sending}
          className="min-w-0 flex-1 rounded-full bg-(--menu-surface-hover) px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Send"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:bg-primary/90 disabled:opacity-40"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </form>

      {/* ── Identity popup: gates the first send ── */}
      {asking && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 p-3 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-chat-id-title"
            // Escape closes the popup only — without this it would bubble to the
            // header's handler and close the whole menu.
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation()
                cancelIdentify()
              }
            }}
            className="w-full animate-in rounded-xl bg-background p-4 shadow-lg ring-1 ring-(--menu-border) fade-in-0 zoom-in-95 duration-200"
          >
            <p id="menu-chat-id-title" className="text-sm font-semibold text-foreground">
              Where should we reply?
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Just once — then you can keep messaging.
            </p>

            <form onSubmit={onIdentify} noValidate className="mt-3 space-y-2">
              <label className="sr-only" htmlFor="menu-chat-name">
                Your name
              </label>
              <input
                ref={nameRef}
                id="menu-chat-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                className={fieldClass}
              />

              <label className="sr-only" htmlFor="menu-chat-email">
                Your email
              </label>
              <input
                id="menu-chat-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={fieldClass}
              />

              {idError && (
                <p className="text-xs text-destructive" role="alert">
                  {idError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Send message
                </button>
                <button
                  type="button"
                  onClick={cancelIdentify}
                  className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuContactForm
