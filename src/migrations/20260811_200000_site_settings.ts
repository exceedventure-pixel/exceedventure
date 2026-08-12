import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The `site-settings` global — contact channels for the header and contact page.
 *
 * A global, so exactly one row: Payload still gives it a serial id and the usual
 * timestamps. Note the timestamps are nullable here, unlike collection tables,
 * which is how Payload builds globals.
 *
 * Nothing is seeded. Every field is optional and the header falls back to
 * `src/config/site.ts`, so an empty row and no row behave identically.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE public.site_settings (
    id integer NOT NULL,
    phone character varying,
    whatsapp character varying,
    whatsapp_message character varying,
    email character varying,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
  );
  CREATE SEQUENCE public.site_settings_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
  ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;
  ALTER TABLE ONLY public.site_settings
    ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);
  ALTER TABLE ONLY public.site_settings ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS public.site_settings;`)
}
