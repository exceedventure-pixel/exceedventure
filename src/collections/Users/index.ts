import type { CollectionConfig } from 'payload'

import {
  canDeleteCmsUser,
  canReadCmsUsers,
  canUpdateCmsUser,
  cmsAdminField,
  cmsRank,
  cmsSuperAdminField,
  isCmsAdmin,
  canAccessAdminPanel,
} from '../../access/roles'

/**
 * CMS logins for /admin.
 *
 * INVITE ONLY. `create` requires an existing admin, so there is no public
 * signup and no way to self-register — the first account comes from
 * ADMIN_EMAIL / ADMIN_PASSWORD at boot, and everyone else is added by someone
 * who is already in.
 *
 * Every permission here is a *rank* comparison rather than a role equality
 * check, which is what stops an admin editing, demoting or deleting the
 * superAdmin the recovery path depends on.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Reaching /admin at all.
    admin: canAccessAdminPanel,
    // Invite only — no self-registration.
    create: isCmsAdmin,
    delete: canDeleteCmsUser,
    read: canReadCmsUsers,
    update: canUpdateCmsUser,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
    group: 'Settings',
  },
  auth: true,
  hooks: {
    beforeChange: [
      ({ data, req, operation, originalDoc }) => {
        /**
         * Nobody may grant a rank they do not hold.
         *
         * Field-level access already stops an editor touching `role` at all,
         * but an *admin* passes that guard — without this an admin could set
         * their own role to superAdmin and step over the boundary the rank
         * comparisons exist to draw.
         *
         * SYSTEM CALLS ARE EXEMPT, and must be. With no signed-in user this is
         * the boot provisioner, a migration or a seed — all of which already
         * hold `overrideAccess: true`. Treating "no user" as rank zero made
         * `ensureAdminUser` create the recovery superAdmin as an *editor*,
         * which locks you out of a fresh deployment entirely.
         */
        const me = req.user as { collection?: string; role?: string } | undefined
        if (!me) return data

        const actorRank = me.collection === 'users' ? cmsRank(me.role as never) : 0

        if (data?.role && cmsRank(data.role) > actorRank) {
          // Silently keep whatever they had rather than throwing: on create
          // this lands them at the default, on update it is a no-op.
          return { ...data, role: operation === 'create' ? 'editor' : originalDoc?.role }
        }

        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      index: true,
      options: [
        { label: 'Super admin', value: 'superAdmin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      // Editors cannot see or set this at all; only a superAdmin can hand out
      // superAdmin, enforced again in the hook above.
      access: { create: cmsAdminField, update: cmsAdminField, read: () => true },
      admin: {
        description:
          'Super admin: everything, and cannot be demoted by an admin. Admin: content, settings and inviting editors. Editor: content only.',
      },
    },
    {
      name: 'isEnvManaged',
      type: 'checkbox',
      defaultValue: false,
      access: { create: cmsSuperAdminField, update: cmsSuperAdminField, read: () => true },
      admin: {
        readOnly: true,
        description:
          'Provisioned from ADMIN_EMAIL. Its password is reset from the environment on every restart, so change it there rather than here.',
      },
    },
  ],
  timestamps: true,
  versions: false,
}
