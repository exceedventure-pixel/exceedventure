'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck } from 'lucide-react'
import { cn } from '@/utilities/ui'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/crm/notification-actions'
import type { SessionCollection } from '@/crm/session'

/**
 * The notification bell, in the header of both areas.
 *
 * Polls rather than subscribes. The old app opened a Firestore `onSnapshot`
 * listener per tab and played a sound on every new document — pleasant once,
 * then not. A thirty-second poll, paused while the tab is hidden, costs almost
 * nothing and is plenty for something a person checks by looking at it.
 */

type Item = {
  id: string
  title: string
  message?: string
  link?: string
  read: boolean
  createdAt: string
}

const POLL_MS = 30_000

const ago = (iso: string): string => {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = seconds / 60
  if (minutes < 60) return `${Math.floor(minutes)}m ago`
  const hours = minutes / 60
  if (hours < 24) return `${Math.floor(hours)}h ago`
  const days = hours / 24
  if (days < 7) return `${Math.floor(days)}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export const NotificationBell: React.FC<{
  allHref: string
  initialUnread?: number
  /** Which area's session to read — the two now have separate cookies. */
  area: SessionCollection
}> = ({ allHref, initialUnread = 0, area }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(initialUnread)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const data = await fetchNotifications(area)
    setUnread(data.unread)
    setItems(data.items)
  }, [area])

  // Poll, but only while the tab is actually being looked at.
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null

    const start = () => {
      if (timer) return
      timer = setInterval(() => void load(), POLL_MS)
    }
    const stop = () => {
      if (!timer) return
      clearInterval(timer)
      timer = null
    }
    const onVisibility = () => {
      if (document.hidden) stop()
      else {
        void load()
        start()
      }
    }

    void load()
    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [load])

  // Close on an outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const openPanel = async () => {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      await load()
      setLoading(false)
    }
  }

  const readAll = async () => {
    setUnread(0)
    setItems((list) => list.map((i) => ({ ...i, read: true })))
    await markAllNotificationsRead(area)
    router.refresh()
  }

  const openItem = async (item: Item) => {
    setOpen(false)
    if (!item.read) {
      setUnread((n) => Math.max(0, n - 1))
      await markNotificationRead(item.id, area)
    }
    if (item.link) router.push(item.link)
    else router.refresh()
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={openPanel}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-xs font-semibold">Notifications</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={readAll}
                className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">Loading…</p>
            )}
            {!loading && items.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                Nothing yet. Updates on your work will show up here.
              </p>
            )}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openItem(item)}
                className={cn(
                  'flex w-full gap-2.5 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-muted/50',
                  !item.read && 'bg-primary/5',
                )}
              >
                <span
                  className={cn(
                    'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                    item.read ? 'bg-transparent' : 'bg-primary',
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium">{item.title}</span>
                  {item.message && (
                    <span className="mt-0.5 block line-clamp-2 text-[11px] text-muted-foreground">
                      {item.message}
                    </span>
                  )}
                  <span className="mt-1 block text-[10px] text-muted-foreground/70">
                    {ago(item.createdAt)}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <Link
            href={allHref}
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-2.5 text-center text-[11px] font-medium text-primary hover:bg-muted/50"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  )
}
