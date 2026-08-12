'use client'

import React, { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utilities/ui'
import { sendMessage } from '@/crm/actions'
import { Card } from './primitives'

/**
 * Client ↔ team conversation, used from both sides.
 *
 * `authorType` comes from the server (it is a staff-only field), so the side a
 * message is attributed to cannot be spoofed by whoever posts it.
 */

export type ThreadMessage = {
  id: string
  body: string
  authorType: 'staff' | 'client'
  authorName?: string
  createdAt?: string
}

export const MessageThread: React.FC<{
  messages: ThreadMessage[]
  /** Staff must say which client; the portal takes it from the session. */
  clientId?: string
}> = ({ messages, clientId }) => {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const result = await sendMessage(new FormData(e.currentTarget))
    setBusy(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    formRef.current?.reset()
    router.refresh()
  }

  return (
    <Card className="flex flex-col">
      <div className="max-h-80 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No messages yet.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn('flex', m.authorType === 'staff' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                m.authorType === 'staff'
                  ? 'rounded-br-sm bg-primary text-primary-foreground'
                  : 'rounded-bl-sm bg-muted',
              )}
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p
                className={cn(
                  'mt-1 text-[10px]',
                  m.authorType === 'staff' ? 'text-primary-foreground/70' : 'text-muted-foreground',
                )}
              >
                {m.authorName || (m.authorType === 'staff' ? 'Team' : 'Client')}
                {m.createdAt && ` · ${new Date(m.createdAt).toLocaleDateString('en-GB')}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form ref={formRef} onSubmit={onSubmit} className="border-t border-border p-3">
        {clientId && <input type="hidden" name="client" value={clientId} />}
        <div className="flex items-end gap-2">
          <textarea
            name="body"
            rows={2}
            required
            placeholder="Write a message…"
            className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? '…' : 'Send'}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </form>
    </Card>
  )
}
