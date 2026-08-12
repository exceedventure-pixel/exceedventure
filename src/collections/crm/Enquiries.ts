import type { CollectionConfig } from 'payload'
import { isStaff, isManager, staffOnlyField } from '@/access/crm'

/**
 * Everything inbound from the public site: contact forms, quick messages, and —
 * once those forms exist — pricing and quotation requests.
 *
 * ONE COLLECTION, NOT FOUR. A pricing request and a contact form differ in
 * which fields they carry, not in what happens to them: both arrive, both need
 * answering, both should be findable in one list and countable in one badge.
 * Four collections would mean four screens, four notification paths and four
 * places to forget. `kind` separates them; `details` carries whatever a
 * particular form collects that the others do not.
 *
 * Adding "request a callback" later means adding one enum value and one form —
 * no schema change, no new screen.
 *
 * `create` is deliberately public: these come from anonymous visitors. Nothing
 * a submitter sends can grant anything — status, assignment and the client link
 * are all staff-only fields, so the worst a bot achieves is a row in a list.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    hidden: true,
    useAsTitle: 'subject',
    defaultColumns: ['kind', 'name', 'email', 'status', 'createdAt'],
  },
  access: {
    // Anonymous visitors submit these. The intake route is the intended path,
    // but leaving create open means a form can post directly if it ever needs to.
    create: () => true,
    read: isStaff,
    update: isStaff,
    // Deleting inbound demand is a manager decision, not a member's.
    delete: isManager,
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'contact',
      index: true,
      options: [
        { label: 'Contact form', value: 'contact' },
        { label: 'Quick message', value: 'message' },
        { label: 'Pricing request', value: 'pricing' },
        { label: 'Quotation request', value: 'quote' },
        { label: 'Callback request', value: 'callback' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description:
          'What the visitor was doing. Add a value here when a new form goes live — nothing else needs to change.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'In progress', value: 'inProgress' },
        { label: 'Responded', value: 'responded' },
        { label: 'Won', value: 'won' },
        { label: 'Closed', value: 'closed' },
        { label: 'Spam', value: 'spam' },
      ],
      // A submitter must not be able to file their own enquiry as "won".
      access: { create: staffOnlyField, update: staffOnlyField },
    },

    // ── What the visitor told us ──────────────────────────────────────────
    { name: 'name', type: 'text' },
    { name: 'email', type: 'email', index: true },
    { name: 'phone', type: 'text' },
    { name: 'company', type: 'text' },
    { name: 'subject', type: 'text' },
    { name: 'message', type: 'textarea' },
    {
      name: 'details',
      type: 'json',
      admin: {
        description:
          'Anything a specific form collects beyond the fields above — budget, services, timeline. Kept as JSON so a new form needs no migration.',
      },
    },

    // ── Where it came from ────────────────────────────────────────────────
    {
      name: 'source',
      type: 'text',
      admin: { description: 'The page it was submitted from.' },
      access: { update: staffOnlyField },
    },

    // ── What we do about it ───────────────────────────────────────────────
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'crm-accounts',
      index: true,
      access: { create: staffOnlyField, update: staffOnlyField },
      admin: { description: 'Who is answering this.' },
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      index: true,
      access: { create: staffOnlyField, update: staffOnlyField },
      admin: { description: 'Set when an enquiry is turned into a client.' },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    {
      name: 'respondedAt',
      type: 'date',
      access: { create: staffOnlyField, update: staffOnlyField },
    },
  ],
  timestamps: true,
}

export default Enquiries
