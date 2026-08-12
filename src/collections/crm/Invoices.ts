import type { CollectionConfig } from 'payload'
import { isStaff, isScopedStaffOrOwnClient } from '@/access/crm'

type LineItem = { description?: string; quantity?: number; unitAmount?: number }

/**
 * Invoices — record-keeping for now, shaped so Stripe can be switched on later
 * without migrating live billing data.
 *
 * Money is stored in **minor units** (pence/cents) as integers. Floats are the
 * classic way to end up a penny out after enough arithmetic.
 */
export const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    hidden: true,
    useAsTitle: 'number',
    defaultColumns: ['number', 'client', 'status', 'total'],
  },
  access: {
    create: isStaff,
    delete: isStaff,
    update: isStaff,
    // Clients can see their own invoices in the portal.
    read: isScopedStaffOrOwnClient('client'),
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Totals are always derived from the line items server-side. Anything
        // sent by the client for subtotal/total is discarded — otherwise a
        // crafted request could set its own amount due.
        const items: LineItem[] = Array.isArray(data?.lineItems) ? data.lineItems : []
        const subtotal = items.reduce((sum, item) => {
          const qty = Number(item?.quantity ?? 0)
          const unit = Number(item?.unitAmount ?? 0)
          return sum + Math.round(qty * unit)
        }, 0)

        const taxRate = Number(data?.taxRate ?? 0)
        const tax = Math.round((subtotal * taxRate) / 100)

        return { ...data, subtotal, tax, total: subtotal + tax }
      },
    ],
  },
  fields: [
    { name: 'number', type: 'text', required: true, unique: true, index: true },
    { name: 'client', type: 'relationship', relationTo: 'clients', required: true, index: true },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Void', value: 'void' },
      ],
    },
    { name: 'issueDate', type: 'date' },
    { name: 'dueDate', type: 'date' },
    { name: 'currency', type: 'text', defaultValue: 'GBP' },
    {
      name: 'lineItems',
      type: 'array',
      fields: [
        { name: 'description', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true, defaultValue: 1 },
        {
          name: 'unitAmount',
          type: 'number',
          required: true,
          admin: { description: 'In minor units — 12345 means £123.45.' },
        },
      ],
    },
    {
      name: 'taxRate',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Percent, e.g. 20.' },
    },
    // Computed in beforeChange. Read-only in any UI; recalculated on every write.
    { name: 'subtotal', type: 'number', admin: { readOnly: true } },
    { name: 'tax', type: 'number', admin: { readOnly: true } },
    { name: 'total', type: 'number', admin: { readOnly: true } },
    { name: 'notes', type: 'textarea' },
    // Unused until Phase 4. Present now so adding Stripe is not a migration
    // against live invoice data.
    {
      name: 'stripeInvoiceId',
      type: 'text',
      index: true,
      admin: { readOnly: true, description: 'Set by Stripe once online payments are enabled.' },
    },
    { name: 'stripeStatus', type: 'text', admin: { readOnly: true } },
  ],
  timestamps: true,
}

export default Invoices
