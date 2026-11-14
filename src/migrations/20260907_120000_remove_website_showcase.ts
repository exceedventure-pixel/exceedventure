import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Drop the `website-showcase` collection.
 *
 * The homepage "Proof" section is now hard-coded — a static list in
 * src/components/WebsiteShowcase/items.ts with posters in
 * public/assets/showcase/ — so the collection, its table and the
 * `pnpm capture:showcase` script have all been removed. Nothing reads this
 * table any more.
 *
 * `down` recreates the table as it stood after 20260819_120000 (i.e. without
 * the long-gone `size` column), so a rollback lands on a schema Payload can
 * still build a collection against. It does not restore any rows — those were
 * six marketing entries, not data worth carrying in a migration.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE public.payload_locked_documents_rels DROP COLUMN IF EXISTS website_showcase_id;
  DROP TABLE IF EXISTS public.website_showcase;
  DROP TYPE IF EXISTS public.enum_website_showcase_embed_status;
  DROP TYPE IF EXISTS public.enum_website_showcase_embed_mode;
  DROP TYPE IF EXISTS public.enum_website_showcase_size;
  DROP TYPE IF EXISTS public.enum_website_showcase_category;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE public.enum_website_showcase_category AS ENUM ('website', 'webApp', 'ecommerce', 'landing', 'content', 'other');
  CREATE TYPE public.enum_website_showcase_embed_mode AS ENUM ('auto', 'live', 'poster');
  CREATE TYPE public.enum_website_showcase_embed_status AS ENUM ('unknown', 'allowed', 'blocked');

  CREATE TABLE public.website_showcase (
    id integer NOT NULL,
    title character varying NOT NULL,
    url character varying NOT NULL,
    display_url character varying,
    category public.enum_website_showcase_category,
    poster_id integer,
    sort_order numeric DEFAULT 0,
    published boolean DEFAULT false,
    featured boolean DEFAULT false,
    embed_mode public.enum_website_showcase_embed_mode DEFAULT 'auto'::public.enum_website_showcase_embed_mode NOT NULL,
    embed_status public.enum_website_showcase_embed_status DEFAULT 'unknown'::public.enum_website_showcase_embed_status,
    embed_reason character varying,
    embed_checked_at timestamp(3) with time zone,
    embed_viewport_height numeric DEFAULT 2600,
    embed_page_height numeric,
    capture_last_captured_at timestamp(3) with time zone,
    capture_error character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE SEQUENCE public.website_showcase_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
  ALTER SEQUENCE public.website_showcase_id_seq OWNED BY public.website_showcase.id;
  ALTER TABLE ONLY public.website_showcase
    ALTER COLUMN id SET DEFAULT nextval('public.website_showcase_id_seq'::regclass);
  ALTER TABLE ONLY public.website_showcase ADD CONSTRAINT website_showcase_pkey PRIMARY KEY (id);

  ALTER TABLE ONLY public.website_showcase
    ADD CONSTRAINT website_showcase_poster_id_media_id_fk FOREIGN KEY (poster_id) REFERENCES public.media(id) ON DELETE SET NULL;

  CREATE UNIQUE INDEX website_showcase_url_idx ON public.website_showcase USING btree (url);
  CREATE INDEX website_showcase_poster_idx ON public.website_showcase USING btree (poster_id);
  CREATE INDEX website_showcase_updated_at_idx ON public.website_showcase USING btree (updated_at);
  CREATE INDEX website_showcase_created_at_idx ON public.website_showcase USING btree (created_at);

  ALTER TABLE public.payload_locked_documents_rels ADD COLUMN website_showcase_id integer;
  ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_website_showcase_fk FOREIGN KEY (website_showcase_id) REFERENCES public.website_showcase(id) ON DELETE CASCADE;
  CREATE INDEX payload_locked_documents_rels_website_showcase_id_idx ON public.payload_locked_documents_rels USING btree (website_showcase_id);
  `)
}
