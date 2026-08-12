import type { CollectionConfig } from 'payload'
import { isStaff, isScopedStaffOrOwnClient } from '@/access/crm'

/**
 * Money received against an invoice. Recorded by hand for now; Stripe webhooks
 * will create these automatically in Phase 4, which is why `stripePaymentId`
 * exists already.
 */
export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    hidden: true,
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'invoice', 'amount', 'paidAt'],
  },
  access: {
    create: isStaff,
    delete: isStaff,
    update: isStaff,
    // Scoped through the invoice's client, so a portal user sees only their own.
    read: isScopedStaffOrOwnClient('client'),
  },
  fields: [
    { name: 'reference', type: 'text' },
    { name: 'invoice', type: 'relationship', relationTo: 'invoices', required: true, index: true },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: true,
      index: true,
      admin: {
        description:
          'Denormalised from the invoice so portal access can be filtered in SQL without a join.',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: { description: 'In minor units, matching the invoice currency.' },
    },
    { name: 'paidAt', type: 'date' },
    {
      name: 'method',
      type: 'select',
      defaultValue: 'bankTransfer',
      options: [
        { label: 'Bank transfer', value: 'bankTransfer' },
        { label: 'Card', value: 'card' },
        { label: 'Cash', value: 'cash' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'notes', type: 'textarea' },
    { name: 'stripePaymentId', type: 'text', index: true, admin: { readOnly: true } },
  ],
  timestamps: true,
}

export default Payments
