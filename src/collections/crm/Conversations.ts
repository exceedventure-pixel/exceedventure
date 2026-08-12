import type { CollectionConfig } from 'payload'
import { isStaff, isScopedStaffOrOwnClient, staffOnlyField } from '@/access/crm'

/**
 * A mail thread — the old Mailbox, which was a flat list of Firestore
 * `conversations` with a `messages` subcollection.
 *
 * Threads exist because the mailbox handles two different things at once:
 * portal messages from a signed-in client, and mail arriving at
 * support@ / sales@ / info@ from someone who may not have an account at all.
 * `client` is therefore optional, and `contactEmail` carries the sender when
 * there is no account behind it.
 *
 * `folder` and `mailbox` are staff-only: filing and labelling are the team's
 * business, and a client must not be able to move a thread out of your inbox.
 */
export const Conversations: CollectionConfig = {
  slug: 'conversations',
  admin: {
    hidden: true,
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'client', 'mailbox', 'folder', 'lastMessageAt'],
  },
  access: {
    create: isStaff,
    update: isStaff,
    delete: isStaff,
    // A portal user sees only their own thread; a member only threads for
    // clients they are on.
    read: isScopedStaffOrOwnClient('client'),
  },
  fields: [
    { name: 'subject', type: 'text', required: true },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      index: true,
      access: { update: staffOnlyField },
      admin: { description: 'Empty for mail from someone without a portal account.' },
    },
    { name: 'contactName', type: 'text' },
    { name: 'contactEmail', type: 'email', index: true },
    {
      name: 'mailbox',
      type: 'select',
      defaultValue: 'support',
      index: true,
      // The addresses the old mailbox sorted by.
      options: [
        { label: 'Support', value: 'support' },
        { label: 'Sales', value: 'sales' },
        { label: 'Info', value: 'info' },
        { label: 'Billing', value: 'billing' },
        { label: 'Contact', value: 'contact' },
        { label: 'Other', value: 'other' },
      ],
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    {
      name: 'folder',
      type: 'select',
      required: true,
      defaultValue: 'inbox',
      index: true,
      options: [
        { label: 'Inbox', value: 'inbox' },
        { label: 'Archived', value: 'archived' },
        { label: 'Trash', value: 'trash' },
      ],
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    {
      name: 'unread',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      access: { update: staffOnlyField },
      admin: { description: 'Unread by your team — cleared when a teammate opens it.' },
    },
    // Denormalised so the thread list renders without loading every message.
    {
      name: 'lastMessageAt',
      type: 'date',
      index: true,
      access: { update: staffOnlyField },
    },
    { name: 'lastMessagePreview', type: 'text', access: { update: staffOnlyField } },
  ],
  timestamps: true,
}

export default Conversations
