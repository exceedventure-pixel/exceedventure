import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Drops the showcase's per-card `size`.
 *
 * The bento is now three equal columns: every card frames its site at the same
 * width and the same scale, which is the only way the sites are comparable.
 * With nothing reading the column, leaving it would be a sidebar control that
 * silently does nothing — worse than removing it.
 *
 * `down` restores the column with its original default, so the old bento can be
 * rolled back to without hand-editing rows. The individual choices are gone
 * either way; there were four of them.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE public.website_showcase DROP COLUMN IF EXISTS size;
  DROP TYPE IF EXISTS public.enum_website_showcase_size;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE public.enum_website_showcase_size AS ENUM ('small', 'medium', 'large');
  ALTER TABLE public.website_showcase
    ADD COLUMN size public.enum_website_showcase_size
    DEFAULT 'medium'::public.enum_website_showcase_size NOT NULL;
  `)
}
