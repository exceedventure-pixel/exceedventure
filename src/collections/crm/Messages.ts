import type { CollectionConfig } from 'payload'
import { isStaff, isScopedStaffOrOwnClient, staffOnlyField, isClientAccount } from '@/access/crm'

/**
 * One message inside a conversation — both the portal thread and the shared
 * team mailbox.
 *
 * Scoped by client like everything else, so a portal user only ever sees their
 * own thread. `authorType` records which side wrote it and is staff-writable
 * only, so a client cannot forge a message that appears to come from you. The
 * same applies to `direction` and the email envelope fields: an inbound message
 * is something the server recorded, never something a browser claimed.
 */
export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    hidden: true,
    useAsTitle: 'body',
    defaultColumns: ['client', 'authorType', 'createdAt'],
  },
  access: {
    create: ({ req }) => isClientAccount({ req } as never) || isStaff({ req } as never),
    read: isScopedStaffOrOwnClient('client'),
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        /**
         * A portal account never chooses which company a message belongs to.
         *
         * Field-level `staffOnlyField` guards `client` on *update*, but create
         * has to stay open or the send action could not set it at all — and
         * that gap would let a hand-crafted POST drop a message into another
         * company's thread. Read scoping would hide it from the sender, so
         * nothing would look wrong; it would simply appear in someone else's
         * inbox. Forcing the value from the session here closes it, and means
         * the action is a convenience rather than the security boundary.
         */
        if (operation !== 'create') return data

        const user = req.user as { collection?: string; client?: unknown } | undefined
        if (user?.collection !== 'client-accounts') return data

        const raw = user.client
        const clientId = typeof raw === 'object' && raw !== null ? (raw as { id: unknown }).id : raw

        return { ...data, client: clientId, authorType: 'client', direction: 'inbound' }
      },
    ],
  },
  fields: [
    {
      name: 'conversation',
      type: 'relationship',
      relationTo: 'conversations',
      index: true,
      access: { update: staffOnlyField },
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      index: true,
      access: { update: staffOnlyField },
      admin: { description: 'Empty for mail from someone with no portal account.' },
    },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
    { name: 'body', type: 'textarea', required: true },
    {
      name: 'authorType',
      type: 'select',
      required: true,
      defaultValue: 'client',
      options: [
        { label: 'Team', value: 'staff' },
        { label: 'Client', value: 'client' },
      ],
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    { name: 'authorName', type: 'text' },
    {
      name: 'direction',
      type: 'select',
      defaultValue: 'inbound',
      options: [
        { label: 'Inbound', value: 'inbound' },
        { label: 'Outbound', value: 'outbound' },
      ],
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    {
      name: 'fromEmail',
      type: 'text',
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    { name: 'toEmail', type: 'text', access: { create: staffOnlyField, update: staffOnlyField } },
    {
      name: 'externalId',
      type: 'text',
      index: true,
      access: { create: staffOnlyField, update: staffOnlyField },
      admin: { description: "The provider's message id, for threading replies." },
    },
    {
      name: 'readByStaff',
      type: 'checkbox',
      defaultValue: false,
      access: { update: staffOnlyField },
    },
  ],
  timestamps: true,
}
export default Messages
