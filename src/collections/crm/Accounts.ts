import type { CollectionConfig } from 'payload'
import { renderPasswordResetEmail } from '@/crm/email'
import { getServerSideURL } from '@/utilities/getURL'
import { isStaff, isStaffAdmin, isStaffAdminOrSelf, staffAdminField } from '@/access/crm'

/**
 * Your team's logins for the CRM at /crm.
 *
 * Separate from both the CMS `users` collection and from `client-accounts`.
 * Clients are not "users with fewer permissions" — they are a different
 * collection entirely and log in somewhere else, so no bug in a role check can
 * turn a client into staff.
 *
 * `payload.config.ts` keeps `admin.user: Users.slug`, so these accounts cannot
 * reach /admin either.
 *
 * Password login works today. Google sign-in is added as a custom auth strategy;
 * SMS/OTP will be another strategy on this same collection, which is why `phone`
 * already exists.
 */
export const CrmAccounts: CollectionConfig = {
  slug: 'crm-accounts',
  auth: {
    /**
     * Reset links must land in this area, not /admin — Payload's default
     * destination, which a teammate cannot even reach.
     */
    forgotPassword: {
      generateEmailSubject: () => 'Reset your Exceed Venture password',
      generateEmailHTML: (args) =>
        renderPasswordResetEmail({
          name: (args?.user as { name?: string } | undefined)?.name,
          url: `${getServerSideURL()}/crm/reset-password?token=${args?.token ?? ''}`,
        }),
    },
  },
  admin: {
    // Managed from the CRM's own UI, not the CMS admin.
    hidden: true,
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'isPaused'],
  },
  access: {
    // Only an admin teammate can mint or remove team logins.
    create: isStaffAdmin,
    delete: isStaffAdmin,
    // An admin edits anyone; everyone else edits only their own profile. The
    // fields that grant anything — role, isPaused — are admin-only below, so
    // self-editing cannot become self-promotion.
    update: isStaffAdminOrSelf,
    // Any teammate may read the team list (needed to render "assigned to" etc).
    read: isStaff,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'member',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
        { label: 'Member', value: 'member' },
      ],
      // Guarded so a teammate cannot promote themselves.
      access: { create: staffAdminField, update: staffAdminField },
      admin: {
        description:
          'Admin manages accounts and billing. Manager runs clients and projects. Member sees assigned work.',
      },
    },
    {
      /**
       * The env-provisioned recovery login.
       *
       * Marked so the team screen can refuse to demote, pause or delete it. An
       * admin locking out the one account that can restore access is the
       * failure this exists to prevent — and it is silently reasserted on every
       * restart anyway, so allowing the change would only be confusing.
       */
      name: 'isEnvManaged',
      type: 'checkbox',
      defaultValue: false,
      access: { create: staffAdminField, update: staffAdminField },
      admin: {
        readOnly: true,
        description:
          'Provisioned from CRM_ADMIN_EMAIL. Manage its password in the environment.',
      },
    },
    {
      name: 'isPaused',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      access: { create: staffAdminField, update: staffAdminField },
      admin: {
        description:
          'Suspends the account without deleting it. Enforced in access control, not just hidden in the UI — a paused session can read and write nothing.',
      },
    },
    {
      name: 'jobTitle',
      type: 'text',
      admin: { description: 'Shown next to their name on assignments.' },
    },
    {
      name: 'phone',
      type: 'text',
      admin: { description: 'For SMS one-time codes (not yet enabled).' },
    },
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'password',
      options: [
        { label: 'Password', value: 'password' },
        { label: 'Google', value: 'google' },
      ],
      access: { create: staffAdminField, update: staffAdminField },
    },
    {
      name: 'providerAccountId',
      type: 'text',
      index: true,
      access: { create: staffAdminField, update: staffAdminField },
      admin: {
        description:
          'Google subject id — binds one Google identity to this account so logins are not re-matched by email each time.',
      },
    },
  ],
  timestamps: true,
}

export default CrmAccounts
