import type { CollectionConfig } from 'payload'
import { isStaff, isScopedStaffOrOwnClient, notClientField, staffOnlyField } from '@/access/crm'

/** A piece of work for a client. */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: { hidden: true, useAsTitle: 'name', defaultColumns: ['name', 'client', 'status'] },
  access: {
    create: isStaff,
    delete: isStaff,
    update: isStaff,
    // Clients see their own; members see projects for a client they are on, or
    // ones they are personally assigned to.
    read: isScopedStaffOrOwnClient('client', 'assignedTo'),
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Every project carries a short human reference — the old CRM's
        // PRJ-XXXXXX, which people quote in email and on invoices. Generated
        // here rather than in the form so it exists however the row was made.
        if (operation === 'create' && !data?.code) {
          const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/0/1
          const suffix = Array.from(
            { length: 6 },
            () => alphabet[Math.floor(Math.random() * alphabet.length)],
          ).join('')
          return { ...data, code: `PRJ-${suffix}` }
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
    { name: 'client', type: 'relationship', relationTo: 'clients', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'notStarted',
      // Mirrors the stages the previous CRM used, which reflect how work
      // actually moves here — a five-stage version lost "review" and "on hold",
      // the two states projects sit in longest.
      options: [
        { label: 'Pending approval', value: 'pendingApproval' },
        { label: 'Not started', value: 'notStarted' },
        { label: 'Planning', value: 'planning' },
        { label: 'In progress', value: 'inProgress' },
        { label: 'Review', value: 'review' },
        { label: 'Completed', value: 'completed' },
        { label: 'On hold', value: 'onHold' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'crm-accounts',
      hasMany: true,
      index: true,
      access: { create: staffOnlyField, update: staffOnlyField },
      admin: { description: 'Team members put on this project. Drives what they can see.' },
    },
    { name: 'startDate', type: 'date' },
    { name: 'dueDate', type: 'date' },
    {
      name: 'value',
      type: 'number',
      admin: { description: 'Agreed project value, in minor units (e.g. pence).' },
      // A client should not read what the work is booked at internally.
      access: { read: notClientField },
    },
    { name: 'summary', type: 'textarea' },
    {
      name: 'scopeOfWork',
      type: 'textarea',
      admin: { description: 'What is included. Shown to the client on their project page.' },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      // Field-level read guard, so the portal cannot surface it even though it
      // loads the same document.
      access: { read: notClientField, create: staffOnlyField, update: staffOnlyField },
      admin: { description: 'Team only — never rendered in the client portal.' },
    },
    {
      name: 'files',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'Deliverables and attachments. Reuses the existing R2-backed media.' },
    },
    /**
     * Extra columns for this project's task board — the old CRM's configurable
     * spreadsheet columns.
     *
     * Defined on the project rather than per task list, which is where they
     * lived before: the same column had to be re-created for every list, so in
     * practice a board ended up with three slightly different "Status" columns.
     * One definition per board keeps a column meaning one thing.
     *
     * Values are stored per subtask in `tasks.subtasks[].fields`, keyed by the
     * `key` below.
     */
    {
      name: 'taskColumns',
      type: 'array',
      labels: { singular: 'Task column', plural: 'Task columns' },
      admin: { description: 'Custom columns shown on this project’s task board.' },
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          admin: { description: 'Stable id used to store values. Do not change it once in use.' },
        },
        { name: 'label', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'text',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Number', value: 'number' },
            { label: 'Dropdown', value: 'dropdown' },
            { label: 'Checkbox', value: 'checkbox' },
            { label: 'Document link', value: 'doc' },
            { label: 'Spreadsheet link', value: 'sheet' },
            { label: 'Screenshot link', value: 'snap' },
            { label: 'Drive link', value: 'drive' },
            { label: 'Website link', value: 'website' },
          ],
        },
        {
          name: 'options',
          type: 'array',
          admin: {
            description: 'Choices for a dropdown column.',
            condition: (_, sibling) => sibling?.type === 'dropdown',
          },
          fields: [
            { name: 'value', type: 'text', required: true },
            {
              name: 'tone',
              type: 'select',
              defaultValue: 'neutral',
              options: [
                { label: 'Neutral', value: 'neutral' },
                { label: 'Info', value: 'info' },
                { label: 'Success', value: 'success' },
                { label: 'Warning', value: 'warning' },
                { label: 'Danger', value: 'danger' },
              ],
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}

export default Projects
