'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/utilities/ui'
import { Card, EmptyState } from './primitives'
import { ActionButton } from './actions'
import { markAllNotificationsRead, clearNotifications } from '@/crm/notification-actions'
import type { SessionCollection } from '@/crm/session'

/**
 * The full notification history, shared by both areas.
 *
 * Read state is rendered from the server rather than tracked here: the page is
 * already server-rendered per request, and duplicating it in component state is
 * how the two get out of step.
 */

export type NotificationRow = {
  id: string
  title: string
  message?: string
  link?: string
  read: boolean
  createdAt: string
}

export const NotificationList: React.FC<{
  items: NotificationRow[]
  unread: number
  area: SessionCollection
}> = ({ items, unread, area }) => (
  <>
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {unread > 0 && (
        <ActionButton
          success="All caught up."
          action={() => markAllNotificationsRead(area)}
          size="md"
        >
          Mark all read
        </ActionButton>
      )}
      {items.length > 0 && (
        <ActionButton
          tone="danger"
          size="md"
          confirm="Clear everything?"
          success="Notifications cleared."
          action={() => clearNotifications(area)}
        >
          Clear all
        </ActionButton>
      )}
    </div>

    {items.length === 0 ? (
      <EmptyState
        title="Nothing here yet"
        description="Updates on your projects, invoices and messages will collect here."
      />
    ) : (
      <Card className="divide-y divide-border">
        {items.map((n) => {
          const inner = (
            <>
              <span
                className={cn(
                  'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                  n.read ? 'bg-transparent' : 'bg-primary',
                )}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{n.title}</span>
                {n.message && (
                  <span className="mt-0.5 block text-xs text-muted-foreground">{n.message}</span>
                )}
                <span className="mt-1 block text-[11px] text-muted-foreground/70">
                  {new Date(n.createdAt).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>
            </>
          )

          const className = cn(
            'flex gap-3 px-4 py-3 transition-colors',
            !n.read && 'bg-primary/5',
            n.link && 'hover:bg-muted/50',
          )

          return n.link ? (
            <Link key={n.id} href={n.link} className={className}>
              {inner}
            </Link>
          ) : (
            <div key={n.id} className={className}>
              {inner}
            </div>
          )
        })}
      </Card>
    )}
  </>
)
