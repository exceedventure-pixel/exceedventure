'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, Check, ChevronLeft, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import siteConfig from '@/config/site'

/**
 * Chat-shaped enquiry widget — a quote request wearing a messenger's clothes.
 *
 * A form headed "Request a quote" asks someone to fill in a form. A chat asks
 * them to say one thing, which is a far smaller commitment, and the structure a
 * quote actually needs (which service, which sub-service) is gathered by
 * *offering* it rather than demanding it: tappable chips in the thread, each
 * one a single decision.
 *
 * The picker is skippable throughout. Someone who just wants to ask a question
 * should never be trapped in a qualification funnel — "Something else" and
 * "Skip" are always there, and a message with no service attached is still a
 * perfectly good enquiry.
 *
 * Everything posts to the same /api/contact intake as the contact page. Picking
 * a service files it as `kind: 'quote'`; otherwise it stays a `message`. The
 * choices ride along in `details`, which the CRM renders without knowing what
 * they are.
 */

type Msg = { id: number; from: 'them' | 'you'; text: string }
type Identity = { name: string; email: string }
type Picked = { service?: string; subService?: string }

const GREETING = 'Hi! What can we help you with?'

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const initials = siteConfig.name
  .split(' ')
  .map((w) => w[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

/** Top-level services are exactly the nav entries that have children. */
const SERVICES = siteConfig.nav.filter((item) => !!item.children?.length)

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

/** One tappable suggestion in the thread. */
const Chip: React.FC<{ onClick: () => void; children: React.ReactNode; muted?: boolean }> = ({
  onClick,
  children,
  muted,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      'rounded-full border px-3 py-1.5 text-left text-xs font-medium transition-colors',
      muted
        ? 'border-border text-muted-foreground hover:bg-(--menu-surface-hover) hover:text-foreground'
        : 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10',
    )}
  >
    {children}
  </button>
)

export const ContactChat: React.FC<{
  /** `tall` for the dialog, `compact` for the menu panel. */
  size?: 'compact' | 'tall'
  className?: string
}> = ({ size = 'compact', className }) => {
  const [messages, setMessages] = useState<Msg[]>([{ id: 0, from: 'them', text: GREETING }])
  const [draft, setDraft] = useState('')
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [asking, setAsking] = useState(false)
  const [idError, setIdError] = useState<string | null>(null)
  const [typing, setTyping] = useState(false)
  const [sending, setSending] = useState(false)

  // Which chips to offer next. `done` means the picker is out of the way.
  const [step, setStep] = useState<'service' | 'sub' | 'done'>('service')
  const [picked, setPicked] = useState<Picked>({})

  const nextId = useRef(1)
  const threadRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    [],
  )

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, step])

  useEffect(() => {
    if (asking) nameRef.current?.focus()
  }, [asking])

  const push = useCallback((from: Msg['from'], text: string) => {
    setMessages((m) => [...m, { id: nextId.current++, from, text }])
  }, [])

  const deliver = useCallback(
    async (text: string, who: Identity, isFirst: boolean, choice: Picked) => {
      push('you', text)
      setSending(true)
      setTyping(true)
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...who,
            message: text,
            // A named service makes this a quote request; without one it is
            // just a message. The CRM filters on exactly this.
            kind: choice.service ? 'quote' : 'message',
            subject: choice.subService
              ? `${choice.service} — ${choice.subService}`
              : choice.service,
            // Unknown keys land in `details` on the enquiry, so adding a
            // question here never needs a schema change.
            service: choice.service,
            subService: choice.subService,
            source: typeof window === 'undefined' ? undefined : window.location.pathname,
          }),
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

  /** Picking a service is a message in the thread, not a silent state change. */
  const chooseService = (label: string | null) => {
    if (!label) {
      push('you', 'Something else')
      setStep('done')
      timers.current.push(
        setTimeout(() => push('them', 'No problem — tell us what you need.'), 300),
      )
      return
    }

    const service = SERVICES.find((s) => s.label === label)
    push('you', label)
    setPicked({ service: label })

    const subs = service?.children?.length ? service.children : []
    if (subs.length === 0) {
      setStep('done')
      timers.current.push(setTimeout(() => push('them', `Great — tell us a bit more.`), 300))
      return
    }

    setStep('sub')
    timers.current.push(setTimeout(() => push('them', `Which part of ${label}?`), 300))
  }

  const chooseSub = (label: string | null) => {
    push('you', label ?? 'Not sure yet')
    setPicked((p) => ({ ...p, subService: label ?? undefined }))
    setStep('done')
    timers.current.push(
      setTimeout(
        () => push('them', 'Got it. Describe what you need and we will come back with a price.'),
        300,
      ),
    )
  }

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
    void deliver(text, identity, false, picked)
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
    if (text) void deliver(text, who, true, picked)
  }

  /** Cancelling puts the held message back in the composer rather than losing it. */
  const cancelIdentify = () => {
    setAsking(false)
    setIdError(null)
    if (pending) setDraft(pending)
    setPending(null)
  }

  const activeService = SERVICES.find((s) => s.label === picked.service)

  return (
    <div
      className={clsx(
        'relative flex h-full flex-col overflow-hidden rounded-2xl bg-background shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06),0_14px_32px_-10px_rgba(0,0,0,0.22)] ring-1 ring-(--menu-border)',
        className,
      )}
    >
      {/* Brand strip, so it reads as a chat rather than a panel section. */}
      <div className="flex items-center gap-2.5 bg-primary px-3.5 py-3 text-primary-foreground">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-[11px] font-bold">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{siteConfig.name}</p>
          <p className="truncate text-[11px] text-primary-foreground/70">
            Typically replies within a day
          </p>
        </div>
      </div>

      <div
        ref={threadRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className={clsx('space-y-2 overflow-y-auto p-3', size === 'tall' ? 'h-80' : 'h-40')}
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

        {/* Suggestions sit in the thread, so choosing feels like replying. */}
        {!typing && step === 'service' && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SERVICES.map((s) => (
              <Chip key={s.href} onClick={() => chooseService(s.label)}>
                {s.label}
              </Chip>
            ))}
            <Chip muted onClick={() => chooseService(null)}>
              Something else
            </Chip>
          </div>
        )}

        {!typing && step === 'sub' && activeService && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {activeService.children!.map((c) => (
              <Chip key={c.href} onClick={() => chooseSub(c.label)}>
                {c.label}
              </Chip>
            ))}
            <Chip muted onClick={() => chooseSub(null)}>
              Not sure yet
            </Chip>
          </div>
        )}
      </div>

      {/* What has been chosen so far, and a way back out of it. */}
      {picked.service && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-(--menu-border) px-3 py-2">
          <Check className="h-3 w-3 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 truncate text-[11px] text-muted-foreground">
            {picked.service}
            {picked.subService ? ` · ${picked.subService}` : ''}
          </span>
          <button
            type="button"
            onClick={() => {
              setPicked({})
              setStep('service')
            }}
            className="ml-auto flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3 w-3" aria-hidden="true" />
            Change
          </button>
        </div>
      )}

      <form onSubmit={onSend} className="flex items-center gap-2 p-2.5 pt-2">
        <label className="sr-only" htmlFor="chat-input">
          Your message
        </label>
        <input
          id="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={picked.service ? 'Describe what you need…' : 'Type your message…'}
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

      {/* Identity popup: gates the first send. */}
      {asking && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 p-3 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-id-title"
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
            <p id="chat-id-title" className="text-sm font-semibold text-foreground">
              Where should we reply?
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Just once — then you can keep messaging.
            </p>

            <form onSubmit={onIdentify} noValidate className="mt-3 space-y-2">
              <label className="sr-only" htmlFor="chat-name">
                Your name
              </label>
              <input
                ref={nameRef}
                id="chat-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                className={fieldClass}
              />

              <label className="sr-only" htmlFor="chat-email">
                Your email
              </label>
              <input
                id="chat-email"
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

export default ContactChat
