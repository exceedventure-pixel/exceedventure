import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Short references on every client and project.
 *
 * Two problems, one fix:
 *
 *   - Clients had no identifier at all, so there was nothing to quote on a call
 *     or search for when two companies have similar names.
 *   - Projects gained `code` in an earlier migration, but its generator only
 *     fires on create. Every project that already existed was left null and
 *     rendered as "—", which is exactly the gap the column was added to close.
 *
 * Both are backfilled here. A unique index over mostly-NULL values would be
 * legal — Postgres does not treat NULLs as equal — but a reference half the
 * rows do not have is not a reference.
 */

/**
 * Deterministic 6-character code from the row id, using the same alphabet the
 * application does (no I/O/0/1, so a code read aloud is unambiguous).
 *
 * Derived from a hash rather than random(): re-running produces identical
 * values, so this is safe to apply twice and gives the same result on a replica.
 * The prefix is folded into the hash input, so a client and a project with the
 * same id do not land on the same suffix.
 */
const backfill = (table: string, prefix: string) => sql.raw(`
  WITH alphabet AS (SELECT 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'::text AS a)
  UPDATE public.${table} t
  SET code = '${prefix}-' || (
    SELECT string_agg(
      substr(
        alphabet.a,
        1 + ((('x' || substr(md5('${prefix}' || t.id::text || '-' || g), 1, 8))::bit(32)::bigint) % 32)::int,
        1
      ),
      ''
    )
    FROM alphabet, generate_series(1, 6) AS g
  )
  WHERE t.code IS NULL;
`)

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE public.clients ADD COLUMN code character varying;`)
  await db.execute(backfill('clients', 'CLT'))
  await db.execute(sql`CREATE UNIQUE INDEX clients_code_idx ON public.clients USING btree (code);`)

  // projects.code already exists — only the rows predating it need filling.
  await db.execute(backfill('projects', 'PRJ'))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS public.clients_code_idx;
  ALTER TABLE public.clients DROP COLUMN IF EXISTS code;
  `)
  // Project codes are left in place: they were not created here, and clearing
  // them would throw away references people may already have quoted.
}
