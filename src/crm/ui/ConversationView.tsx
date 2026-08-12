'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utilities/ui'
import { Card } from './primitives'
import { replyToConversation, markConversationRead } from '@/crm/mailbox-actions'
import { useToast } from './actions'

/**
 * One mail thread, with the reply box.
 *
 * Opening a thread marks it read — once, guarded by a ref. Without the guard,
 * React's development double-invoke fires the mutation twice, and every
 * `router.refresh()` afterwards would fire it again.
 *
 * The old Mailbox deliberately did not scroll to the newest message on open,
 * because landing on the reply box means you start typing before reading. That
 * behaviour is kept.
 */

export type ThreadMessage = {
  id: string
  body: string
  authorType: 'staff' | 'client'
  authorName?: string
  createdAt?: string
}

export const ConversationView: React.FC<{
  conversationId: string | number
  messages: ThreadMessage[]
  unread: boolean
  canReply?: boolean
}> = ({ conversationId, messages, unread, canReply = true }) => {
  const router = useRouter()
  const toast = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [busy, setBusy] = useState(false)
  const marked = useRef(false)

  useEffect(() => {
    if (!unread || marked.current) return
    marked.current = true
    void markConversationRead(String(conversationId)).then(() => router.refresh())
  }, [conversationId, unread, router])

  // A different thread is a different read state.
  useEffect(() => {
    marked.current = false
  }, [conversationId])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    const result = await replyToConversation(new FormData(e.currentTarget))
    setBusy(false)

    if (!result.ok) {
      toast(result.message, 'error')
      return
    }
    formRef.current?.reset()
    toast('Reply sent.')
    router.refresh()
  }

  return (
    <Card className="flex flex-col">
      <div className="max-h-[28rem] space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nothing in this thread.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn('flex', m.authorType === 'staff' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm',
                m.authorType === 'staff'
                  ? 'rounded-br-sm bg-primary text-primary-foreground'
                  : 'rounded-bl-sm bg-muted',
              )}
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p
                className={cn(
                  'mt-1.5 text-[10px]',
                  m.authorType === 'staff'
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground',
                )}
              >
                {m.authorName || (m.authorType === 'staff' ? 'Team' : 'Client')}
                {m.createdAt &&
                  ` · ${new Date(m.createdAt).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {canReply && (
        <form ref={formRef} onSubmit={onSubmit} className="border-t border-border p-3">
          <input type="hidden" name="conversation" value={conversationId} />
          <textarea
            name="body"
            rows={3}
            required
            placeholder="Write a reply…"
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              Sent by email, and to their dashboard if they have one.
            </p>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {busy ? 'Sending…' : 'Send reply'}
            </button>
          </div>
        </form>
      )}
    </Card>
  )
}
