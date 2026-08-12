import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Renames the `worker` staff role to `member`.
 *
 * "Worker" read as something done *to* people rather than a seat on the team,
 * and "staff" was not available — the codebase already uses that word for every
 * CRM account, so a role called staff would collide with `isStaff`,
 * `staffOnlyField` and the `authorType: 'staff'` on messages.
 *
 * `ALTER TYPE … RENAME VALUE` rewrites the label in place. Existing rows keep
 * pointing at the same enum member, so nobody's role changes and no data moves —
 * which is why this is a rename rather than an add-then-migrate-then-drop
 * (Postgres cannot drop an enum value at all).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TYPE public.enum_crm_accounts_role RENAME VALUE 'worker' TO 'member';
  ALTER TABLE public.crm_accounts ALTER COLUMN role SET DEFAULT 'member'::public.enum_crm_accounts_role;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TYPE public.enum_crm_accounts_role RENAME VALUE 'member' TO 'worker';
  ALTER TABLE public.crm_accounts ALTER COLUMN role SET DEFAULT 'worker'::public.enum_crm_accounts_role;
  `)
}
