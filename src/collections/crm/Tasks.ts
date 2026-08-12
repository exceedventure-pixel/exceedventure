import type { CollectionConfig } from 'payload'
import { isStaff, isScopedStaffTasks } from '@/access/crm'

/**
 * Work items inside a project. Staff-only — clients see project status, not the
 * task breakdown, which is how the previous CRM worked too.
 */
export const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: { hidden: true, useAsTitle: 'title', defaultColumns: ['title', 'project', 'status'] },
  // A member reads and updates tasks on projects they are assigned to; only
  // admins and managers can delete one, matching the old rules exactly.
  access: { create: isStaff, delete: isStaff, update: isScopedStaffTasks, read: isScopedStaffTasks },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'project', type: 'relationship', relationTo: 'projects', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'todo',
      options: [
        { label: 'To do', value: 'todo' },
        { label: 'In progress', value: 'inProgress' },
        { label: 'Blocked', value: 'blocked' },
        { label: 'Done', value: 'done' },
      ],
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
      ],
    },
    { name: 'assignee', type: 'relationship', relationTo: 'crm-accounts' },
    { name: 'dueDate', type: 'date' },
    { name: 'notes', type: 'textarea' },
    {
      name: 'progress',
      type: 'number',
      min: 0,
      max: 100,
      admin: { description: 'Percent complete, for work that is not simply done or not done.' },
    },
    /**
     * Links hanging off a task — the old board's doc / sheet / snap / drive /
     * website columns, which were five near-identical link types.
     */
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        {
          name: 'kind',
          type: 'select',
          defaultValue: 'website',
          options: [
            { label: 'Document', value: 'doc' },
            { label: 'Spreadsheet', value: 'sheet' },
            { label: 'Screenshot', value: 'snap' },
            { label: 'Drive folder', value: 'drive' },
            { label: 'Website', value: 'website' },
          ],
        },
      ],
    },
    /**
     * Checklist items inside a task — the old `tasks/{id}/subtasks`
     * subcollection.
     *
     * An array field rather than its own collection: they are only ever read
     * and written with their parent, never queried across projects, and a
     * subcollection meant a second round trip for every task on the board.
     */
    {
      name: 'subtasks',
      type: 'array',
      labels: { singular: 'Subtask', plural: 'Subtasks' },
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'todo',
          options: [
            { label: 'To do', value: 'todo' },
            { label: 'In progress', value: 'inProgress' },
            { label: 'Blocked', value: 'blocked' },
            { label: 'Done', value: 'done' },
          ],
        },
        {
          name: 'priority',
          type: 'select',
          defaultValue: 'normal',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Normal', value: 'normal' },
            { label: 'High', value: 'high' },
          ],
        },
        { name: 'assignee', type: 'relationship', relationTo: 'crm-accounts' },
        { name: 'dueDate', type: 'date' },
        {
          name: 'fields',
          type: 'json',
          admin: {
            description:
              'Values for this project’s custom columns, keyed by column id.',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
export default Tasks
