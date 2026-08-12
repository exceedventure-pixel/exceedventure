import type { CollectionConfig } from 'payload'
import { isStaff, isScopedStaffOrOwnClient } from '@/access/crm'

/** A person at a client company. Not a login — see crm-accounts for that. */
export const Contacts: CollectionConfig = {
  slug: 'contacts',
  admin: { hidden: true, useAsTitle: 'name', defaultColumns: ['name', 'client', 'email'] },
  access: {
    create: isStaff,
    delete: isStaff,
    update: isStaff,
    read: isScopedStaffOrOwnClient('client'),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'client', type: 'relationship', relationTo: 'clients', required: true, index: true },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    { name: 'jobTitle', type: 'text' },
    { name: 'isPrimary', type: 'checkbox', defaultValue: false },
    { name: 'notes', type: 'textarea' },
  ],
  timestamps: true,
}

export default Contacts
