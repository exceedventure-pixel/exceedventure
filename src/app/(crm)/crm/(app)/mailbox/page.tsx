import React from 'react'
import Link from 'next/link'
import { crmQuery } from '@/crm/data'
import { PageHeader, Card, Badge, EmptyState } from '@/crm/ui/primitives'
import { SearchBox, FilterTabs } from '@/crm/ui/Filters'
import { ComposeForm } from '@/crm/ui/forms'
import { ConversationControls, EmptyTrashButton } from '@/crm/ui/decisions'
import { Mail } from 'lucide-react'
import { ConversationView } from '@/crm/ui/ConversationView'
import type { Where } from 'payload'

/**
 * The shared team mailbox.
 *
 * Folder, label and the open thread all live in the URL, so a conversation can
 * be linked to and the back button behaves. The old Mailbox held every one of
 * those in component state and re-fetched the whole list from Firestore on each
 * change — reopening the app always dumped you back in an unfiltered inbox.
 */

const FOLDERS = [
  { label: 'Inbox', value: 'inbox' },
  { label: 'Archived', value: 'archived' },
  { label: 'Trash', value: 'trash' },
]

const MAILBOXES = [
  { label: 'All', value: '' },
  { label: 'Support', value: 'support' },
  { label: 'Sales', value: 'sales' },
  { label: 'Info', value: 'info' },
  { label: 'Billing', value: 'billing' },
  { label: 'Contact', value: 'contact' },
  { label: 'Other', value: 'other' },
]

const relative = (iso?: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  const sameDay = new Date().toDateString() === date.toDateString()
  return sameDay
    ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default async function MailboxPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; mailbox?: string; q?: string; thread?: string }>
}) {
  const { folder = 'inbox', mailbox, q, thread } = await searchParams
  const { payload, as } = await crmQuery()

  const filters: Where[] = [{ folder: { equals: folder } }]
  if (mailbox) filters.push({ mailbox: { equals: mailbox } })
  if (q) {
    filters.push({
      or: [
        { subject: { like: q } },
        { contactEmail: { like: q } },
        { contactName: { like: q } },
        { lastMessagePreview: { like: q } },
      ],
    })
  }

  const conversations = await payload.find({
    collection: 'conversations',
    where: { and: filters },
    limit: 100,
    sort: '-lastMessageAt',
    depth: 1,
    ...as,
  })

  // The open thread is resolved separately rather than picked out of the list:
  // it may sit in a folder the current filter excludes, and it must still load.
  const open = thread
    ? await payload
        .findByID({ collection: 'conversations', id: thread, depth: 1, ...as })
        .catch(() => null)
    : null

  const messages = open
    ? await payload.find({
        collection: 'messages',
        where: { conversation: { equals: open.id } },
        limit: 200,
        sort: 'createdAt',
        depth: 0,
        ...as,
      })
    : null

  // Addresses for the compose autocomplete.
  const accounts = await payload.find({
    collection: 'client-accounts',
    limit: 200,
    depth: 0,
    ...as,
  })

  const href = (params: Record<string, string | undefined>) => {
    const next = new URLSearchParams()
    const merged = { folder, mailbox, q, thread, ...params }
    for (const [key, value] of Object.entries(merged)) if (value) next.set(key, value)
    return `/crm/mailbox?${next.toString()}`
  }

  const companyOf = (c: unknown) =>
    typeof c === 'object' && c !== null && 'name' in c ? String((c as { name: string }).name) : null

  return (
    <>
      <PageHeader
        icon={<Mail />}
        title="Mailbox"
        description="Everything clients have sent you, in one thread list."
        action={
          <div className="flex items-center gap-2">
            {folder === 'trash' && conversations.docs.length > 0 && <EmptyTrashButton />}
            <ComposeForm
              suggestions={accounts.docs.map((a) => ({
                email: a.email,
                name: a.name || a.email,
              }))}
            />
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {FOLDERS.map((f) => (
            <Link
              key={f.value}
              href={href({ folder: f.value, thread: undefined })}
              className={
                folder === f.value
                  ? 'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'
                  : 'rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
              }
            >
              {f.label}
            </Link>
          ))}
        </div>
        <FilterTabs param="mailbox" options={MAILBOXES} />
        <div className="ml-auto">
          <SearchBox placeholder="Search mail…" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Card className="divide-y divide-border overflow-hidden">
          {conversations.docs.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={folder === 'inbox' ? 'Inbox is clear' : `Nothing in ${folder}`}
                description={
                  folder === 'inbox'
                    ? 'Messages from the client dashboard land here.'
                    : undefined
                }
              />
            </div>
          ) : (
            conversations.docs.map((c) => {
              const active = String(c.id) === String(thread ?? '')
              return (
                <Link
                  key={c.id}
                  href={href({ thread: String(c.id) })}
                  className={`block px-4 py-3 transition-colors hover:bg-muted/40 ${
                    active ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`truncate text-sm ${c.unread ? 'font-semibold' : 'font-medium'}`}
                    >
                      {companyOf(c.client) || c.contactName || c.contactEmail || 'Unknown sender'}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {relative(c.lastMessageAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-medium">{c.subject}</p>
                  {c.lastMessagePreview && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {c.lastMessagePreview}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Badge>{c.mailbox ?? 'support'}</Badge>
                    {c.unread && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="Unread" />
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </Card>

        {open && messages ? (
          <div className="space-y-3">
            <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{open.subject}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {companyOf(open.client) || open.contactName || open.contactEmail || '—'}
                </p>
              </div>
              <ConversationControls id={open.id} folder={open.folder ?? 'inbox'} />
            </Card>

            <ConversationView
              conversationId={open.id}
              unread={Boolean(open.unread)}
              messages={messages.docs.map((m) => ({
                id: String(m.id),
                body: m.body,
                authorType: (m.authorType as 'staff' | 'client') ?? 'client',
                authorName: m.authorName ?? undefined,
                createdAt: m.createdAt,
              }))}
              canReply={open.folder !== 'trash'}
            />
          </div>
        ) : (
          <EmptyState
            title="Nothing open"
            description="Pick a conversation on the left to read it and reply."
          />
        )}
      </div>
    </>
  )
}
