import type { CollectionConfig } from 'payload'
import {
  isStaff,
  isScopedStaffOrOwnClient,
  canWithdrawRequest,
  staffOnlyField,
  isClientAccount,
} from '@/access/crm'

/**
 * "Request new project" from the client dashboard — a feature of the old portal
 * worth keeping, because it turns an email thread into a tracked record.
 *
 * Clients may create and read their own; only staff can change status, so a
 * client cannot approve their own request.
 */
export const ProjectRequests: CollectionConfig = {
  slug: 'project-requests',
  admin: { hidden: true, useAsTitle: 'title', defaultColumns: ['title', 'client', 'status'] },
  access: {
    // A client can raise one; the client field is forced server-side.
    create: ({ req }) => isClientAccount({ req } as never) || isStaff({ req } as never),
    read: isScopedStaffOrOwnClient('client'),
    update: isStaff,
    // A client may withdraw a request they raised, but only while it is open.
    delete: canWithdrawRequest,
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        /**
         * The company is taken from the session, never the request body.
         *
         * `client` must be writable on create for the request action to set it,
         * which would otherwise let a client file work against another
         * company's account. Overwriting it here means that cannot happen
         * however the row is created.
         */
        if (operation !== 'create') return data

        const user = req.user as { collection?: string; client?: unknown } | undefined
        if (user?.collection !== 'client-accounts') return data

        const raw = user.client
        const clientId = typeof raw === 'object' && raw !== null ? (raw as { id: unknown }).id : raw

        return { ...data, client: clientId }
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: true,
      index: true,
      access: { update: staffOnlyField },
    },
    { name: 'details', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In review', value: 'review' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Declined', value: 'declined' },
      ],
      // Only staff decide — a client could otherwise mark their own accepted.
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      access: { update: staffOnlyField },
    },
  ],
  timestamps: true,
}
export default ProjectRequests
