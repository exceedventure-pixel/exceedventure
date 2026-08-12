import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Roles for CMS accounts, and a flag marking the environment-provisioned
 * recovery login in both admin areas.
 *
 * Before this, every signed-in CMS user could create, edit and delete every
 * other CMS user — there was no notion of rank at all.
 *
 * EXISTING ACCOUNTS BECOME `admin`, not `editor`. The column default is
 * `editor` because that is the right default for a *new* invite, but demoting
 * the people who already had full access as a side effect of a deploy would
 * lock them out of their own site. The `ensureAdminUser` boot step then
 * promotes the ADMIN_EMAIL account to superAdmin.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE public.enum_users_role AS ENUM ('superAdmin', 'admin', 'editor');

  ALTER TABLE public.users
    ADD COLUMN role public.enum_users_role DEFAULT 'editor'::public.enum_users_role NOT NULL;
  ALTER TABLE public.users ADD COLUMN is_env_managed boolean DEFAULT false;

  -- Everyone who already had an account had unrestricted access; keep it.
  UPDATE public.users SET role = 'admin'::public.enum_users_role;

  CREATE INDEX users_role_idx ON public.users USING btree (role);

  ALTER TABLE public.crm_accounts ADD COLUMN is_env_managed boolean DEFAULT false;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE public.crm_accounts DROP COLUMN IF EXISTS is_env_managed;
  DROP INDEX IF EXISTS public.users_role_idx;
  ALTER TABLE public.users DROP COLUMN IF EXISTS is_env_managed;
  ALTER TABLE public.users DROP COLUMN IF EXISTS role;
  DROP TYPE IF EXISTS public.enum_users_role;
  `)
}
