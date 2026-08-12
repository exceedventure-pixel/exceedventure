import React from 'react'
import { portalQuery } from '@/crm/data'
import { PageHeader, Card } from '@/crm/ui/primitives'
import { MessageSquare } from 'lucide-react'
import { MessageThread } from '@/crm/ui/MessageThread'

/**
 * Client side of the conversation. No clientId is passed — the action takes it
 * from the session, so a client cannot post into another company's thread.
 */
export default async function PortalMessages() {
  const { payload, as } = await portalQuery()
  const messages = await payload.find({
    collection: 'messages',
    limit: 200,
    sort: 'createdAt',
    depth: 0,
    ...as,
  })

  return (
    <>
      <PageHeader
        icon={<MessageSquare />}
        title="Messages"
        description="Talk to the team. Replies reach whoever is on your work."
      />
      <div className="max-w-2xl space-y-3">
        <MessageThread
          messages={messages.docs.map((m) => ({
            id: String(m.id),
            body: m.body,
            authorType: (m.authorType as 'staff' | 'client') ?? 'client',
            authorName: m.authorName ?? undefined,
            createdAt: m.createdAt,
          }))}
        />
        <Card className="p-3 text-[11px] text-muted-foreground">
          Messages here also land in our shared mailbox, and we will email you when someone replies.
        </Card>
      </div>
    </>
  )
}
