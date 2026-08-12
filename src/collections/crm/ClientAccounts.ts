import type { CollectionConfig } from 'payload'
import { renderPasswordResetEmail } from '@/crm/email'
import { getServerSideURL } from '@/utilities/getURL'
import { isStaff, isAnyAccount, isStaffOrSelfAccount, staffOnlyField } from '@/access/crm'

/**
 * Client logins for the dashboard at /portal.
 *
 * A separate collection from `crm-accounts` on purpose: the client dashboard and
 * the internal CRM are two different products with two different login pages,
 * and keeping the accounts apart means a portal user has no path to staff
 * privileges at all.
 *
 * `client` is the field that decides whose data this account can read, so only
 * staff may ever write it.
 */
export const ClientAccounts: CollectionConfig = {
  slug: 'client-accounts',
  auth: {
    /**
     * Reset links must land in this area, not /admin — Payload's default
     * destination, which a client cannot even reach.
     */
    forgotPassword: {
      generateEmailSubject: () => 'Reset your Exceed Venture password',
      generateEmailHTML: (args) =>
        renderPasswordResetEmail({
          name: (args?.user as { name?: string } | undefined)?.name,
          url: `${getServerSideURL()}/portal/reset-password?token=${args?.token ?? ''}`,
        }),
    },
  },
  admin: {
    hidden: true,
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'client', 'approvalStatus'],
  },
  access: {
    /**
     * Clients self-register, but NOT by POSTing here directly — that is closed.
     * Signup goes through a server route that creates a brand-new `clients`
     * record and links it, so a stranger can never sign up and attach
     * themselves to an existing company's invoices. The route is the only place
     * `client` is ever set from, and it sets it itself rather than trusting the
     * request body.
     */
    create: isStaff,
    delete: isStaff,
    // Staff, or the account itself editing its own profile. Everything that
    // decides what it can see — client, approvalStatus, provider — is
    // staff-only at field level, so this grants a name and a phone number and
    // nothing more.
    update: isStaffOrSelfAccount,
    // A portal user needs to read their own record to render "signed in as".
    // Field access below stops them changing anything that matters.
    read: isAnyAccount,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: true,
      index: true,
      // The whole scoping model rests on this field. If a portal user could set
      // it, they could read any company's invoices.
      access: { create: staffOnlyField, update: staffOnlyField },
      admin: { description: 'The company this dashboard login belongs to.' },
    },
    {
      name: 'approvalStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending approval', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Rejected', value: 'rejected' },
      ],
      index: true,
      access: { create: staffOnlyField, update: staffOnlyField },
      admin: {
        description:
          'Signups start pending and see a waiting screen. Only your team can move an account to active.',
      },
    },
    // Profile fields the old dashboard kept on the user document. Self-editable
    // — none of them affect what the account can read.
    { name: 'jobTitle', type: 'text' },
    { name: 'organization', type: 'text' },
    {
      name: 'phone',
      type: 'text',
      admin: { description: 'For SMS one-time codes (not yet enabled).' },
    },
    { name: 'whatsapp', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'bio', type: 'textarea' },
    /**
     * Account closure, matching the old "request deletion" flow.
     *
     * A client raises the request and your team carries it out, rather than the
     * account deleting itself: the old app deleted the auth user client-side and
     * kept a `deleted_users` blocklist to paper over the half-states that
     * created. A request plus a human step has neither problem, and the
     * invoices attached to the account do not vanish underneath your books.
     */
    { name: 'deletionRequested', type: 'checkbox', defaultValue: false, index: true },
    { name: 'deletionRequestedAt', type: 'date' },
    { name: 'deletionReason', type: 'textarea' },
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'password',
      options: [
        { label: 'Password', value: 'password' },
        { label: 'Google', value: 'google' },
      ],
      access: { create: staffOnlyField, update: staffOnlyField },
    },
    {
      name: 'providerAccountId',
      type: 'text',
      index: true,
      access: { create: staffOnlyField, update: staffOnlyField },
    },
  ],
  timestamps: true,
}

export default ClientAccounts
