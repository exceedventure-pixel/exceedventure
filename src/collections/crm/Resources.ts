import type { CollectionConfig } from 'payload'
import { isStaff, isScopedStaffOrOwnClient } from '@/access/crm'

/**
 * Shared links and files per client.
 *
 * The old CRM kept five parallel arrays on the project document — `attachments`,
 * `screens`, `docs`, `drives`, `customResources` — each with the same shape and
 * its own copy of the add/remove code. They are one collection here with a
 * `kind`, so the list can be filtered, ordered and shown in the portal without
 * five code paths.
 */
export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: { hidden: true, useAsTitle: 'label', defaultColumns: ['label', 'client', 'kind'] },
  access: {
    create: isStaff,
    update: isStaff,
    delete: isStaff,
    // Clients see resources shared with them; members see their own clients'.
    read: isScopedStaffOrOwnClient('client'),
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'client', type: 'relationship', relationTo: 'clients', required: true, index: true },
    { name: 'project', type: 'relationship', relationTo: 'projects', index: true },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'link',
      index: true,
      options: [
        { label: 'Link', value: 'link' },
        { label: 'File', value: 'file' },
        { label: 'Screen / preview', value: 'screen' },
        { label: 'Document', value: 'doc' },
        { label: 'Drive folder', value: 'drive' },
        { label: 'Custom section', value: 'custom' },
      ],
    },
    {
      name: 'section',
      type: 'text',
      admin: {
        description: 'Heading to group under, for the custom kind.',
        condition: (_, siblingData) => siblingData?.kind === 'custom',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: { description: 'Shown under a screen preview.' },
    },
    { name: 'url', type: 'text' },
    { name: 'file', type: 'upload', relationTo: 'media' },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower sorts first.' },
    },
    { name: 'notes', type: 'textarea' },
  ],
  timestamps: true,
}
export default Resources
