import type { CollectionConfig } from 'payload'
import { isStaff, isStaffOrSelfClient, notClientField, staffOnlyField } from '@/access/crm'

/** A company you work with. The root record everything else hangs off. */
export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: { hidden: true, useAsTitle: 'name', defaultColumns: ['name', 'status', 'updatedAt'] },
  access: {
    create: isStaff,
    delete: isStaff,
    update: isStaff,
    // A portal account can read its own company and no other; a member reads
    // only companies they have been put on.
    read: isStaffOrSelfClient,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Every client gets a short reference, the same way projects get
        // PRJ-XXXXXX. Without one there is nothing to quote on a phone call or
        // search for when two companies have similar names.
        if (operation === 'create' && !data?.code) {
          const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/0/1
          const suffix = Array.from(
            { length: 6 },
            () => alphabet[Math.floor(Math.random() * alphabet.length)],
          ).join('')
          return { ...data, code: `CLT-${suffix}` }
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'code',
      type: 'text',
      unique: true,
      index: true,
      admin: { readOnly: true, description: 'Generated on create — quote it in email.' },
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'lead',
      options: [
        { label: 'Lead', value: 'lead' },
        { label: 'Proposal', value: 'proposal' },
        { label: 'Active', value: 'active' },
        { label: 'On hold', value: 'onHold' },
        { label: 'Former', value: 'former' },
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'crm-accounts',
      hasMany: true,
      index: true,
      access: { create: staffOnlyField, update: staffOnlyField },
      admin: {
        description:
          'Team members who look after this client. A member sees every project of a client they are on.',
      },
    },
    { name: 'website', type: 'text' },
    // Contact details the previous CRM kept on the client record — WhatsApp
    // included, since that is how a lot of this contact actually happens.
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    { name: 'whatsapp', type: 'text' },
    { name: 'address', type: 'textarea' },
    {
      name: 'notes',
      type: 'textarea',
      // The client reads their own record to render the portal header, so this
      // has to be closed explicitly or account notes would leak to them.
      access: { read: notClientField, create: staffOnlyField, update: staffOnlyField },
      admin: { description: 'Team only — not visible in the client portal.' },
    },
  ],
  timestamps: true,
}

export default Clients
