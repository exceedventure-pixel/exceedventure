import type { CollectionConfig } from 'payload'
import { isOwnNotification, isStaff, staffOnlyField } from '@/access/crm'

/**
 * In-app notifications for both audiences — the bell in the header.
 *
 * The recipient is split across two nullable relationships rather than one
 * polymorphic field. Polymorphic relations cannot be filtered with a simple
 * `equals` in Payload's query layer, and the whole point of this collection is
 * that access control narrows every read to one person in SQL. Two typed
 * columns keep that constraint trivial and indexable.
 *
 * Nothing here is written from the browser: notifications are raised by
 * `src/crm/notify.ts` server-side, so `create` stays staff-only. What a
 * recipient may do is mark their own read and clear it.
 */
export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    hidden: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'recipientType', 'read', 'createdAt'],
  },
  access: {
    create: isStaff,
    read: isOwnNotification,
    // Both scoped to your own rows by the same constraint — "mark read" and
    // "clear" are the only things a recipient does here.
    update: isOwnNotification,
    delete: isOwnNotification,
  },
  fields: [
    {
      name: 'recipientType',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Team', value: 'staff' },
        { label: 'Client', value: 'client' },
      ],
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    {
      name: 'staffRecipient',
      type: 'relationship',
      relationTo: 'crm-accounts',
      index: true,
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    {
      name: 'clientRecipient',
      type: 'relationship',
      relationTo: 'client-accounts',
      index: true,
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'general',
      // Mirrors the old NOTIFICATION_TYPES, minus the two tool-access families
      // that went away with the standalone tools.
      options: [
        { label: 'General', value: 'general' },
        { label: 'Project requested', value: 'projectRequested' },
        { label: 'Project approved', value: 'projectApproved' },
        { label: 'Project declined', value: 'projectDeclined' },
        { label: 'Project created', value: 'projectCreated' },
        { label: 'Project status changed', value: 'projectStatusChanged' },
        { label: 'Task added', value: 'taskAdded' },
        { label: 'Task updated', value: 'taskUpdated' },
        { label: 'Invoice issued', value: 'invoiceIssued' },
        { label: 'Invoice updated', value: 'invoiceUpdated' },
        { label: 'Payment recorded', value: 'paymentRecorded' },
        { label: 'Access requested', value: 'accessRequested' },
        { label: 'Access approved', value: 'accessApproved' },
        { label: 'Access rejected', value: 'accessRejected' },
        { label: 'Deletion requested', value: 'deletionRequested' },
        { label: 'Message received', value: 'messageReceived' },
        { label: 'Resource shared', value: 'resourceShared' },
      ],
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    { name: 'title', type: 'text', required: true, access: { update: staffOnlyField } },
    { name: 'message', type: 'textarea', access: { update: staffOnlyField } },
    {
      name: 'link',
      type: 'text',
      admin: { description: 'In-app path the bell sends you to, e.g. /crm/requests.' },
      access: { update: staffOnlyField },
    },
    // The one field a recipient is meant to change.
    { name: 'read', type: 'checkbox', defaultValue: false, index: true },
    {
      name: 'meta',
      type: 'json',
      admin: { description: 'Ids and names the notification was built from.' },
      access: { create: staffOnlyField, update: staffOnlyField },
    },
  ],
  timestamps: true,
}

export default Notifications
