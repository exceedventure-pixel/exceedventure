import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Testimonials — client reviews shown under the homepage hero.
 *
 * This collection shipped in a previous commit without a matching migration,
 * so `payload migrate` never created its table in any environment that relies
 * on migrations (production). Dev environments never noticed because the
 * postgres adapter auto-pushes schema there. Captured from the schema the
 * running dev server had already pushed, verified to match `Testimonials`
 * field-for-field.
 *
 * Purely additive.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE public.testimonials (
    id integer NOT NULL,
    quote character varying NOT NULL,
    name character varying NOT NULL,
    role character varying,
    rating numeric DEFAULT 5 NOT NULL,
    avatar_id integer,
    published boolean DEFAULT true,
    sort_order numeric,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE SEQUENCE public.testimonials_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
  ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;
  ALTER TABLE ONLY public.testimonials
    ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);
  ALTER TABLE ONLY public.testimonials ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);

  ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_avatar_id_media_id_fk FOREIGN KEY (avatar_id) REFERENCES public.media(id) ON DELETE SET NULL;

  CREATE INDEX testimonials_avatar_idx ON public.testimonials USING btree (avatar_id);
  CREATE INDEX testimonials_published_idx ON public.testimonials USING btree (published);
  CREATE INDEX testimonials_updated_at_idx ON public.testimonials USING btree (updated_at);
  CREATE INDEX testimonials_created_at_idx ON public.testimonials USING btree (created_at);

  -- Admin document locking, as for every other collection.
  ALTER TABLE public.payload_locked_documents_rels ADD COLUMN testimonials_id integer;
  ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_testimonials_fk FOREIGN KEY (testimonials_id) REFERENCES public.testimonials(id) ON DELETE CASCADE;
  CREATE INDEX payload_locked_documents_rels_testimonials_id_idx ON public.payload_locked_documents_rels USING btree (testimonials_id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE public.payload_locked_documents_rels DROP COLUMN IF EXISTS testimonials_id;
  DROP TABLE IF EXISTS public.testimonials;
  `)
}
