import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Inbound demand from the public site — contact forms and quick messages now,
 * pricing and quotation requests when those forms are built.
 *
 * One table with a `kind` discriminator rather than a table per form: they all
 * mean "somebody wants something" and all follow the same short pipeline. A new
 * form adds an enum value, not a migration — and `details` (jsonb) carries
 * whatever extra fields that form collects, so even the enum is usually the
 * only change.
 *
 * Purely additive.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE public.enum_enquiries_kind AS ENUM ('contact', 'message', 'pricing', 'quote', 'callback', 'other');
  CREATE TYPE public.enum_enquiries_status AS ENUM ('new', 'inProgress', 'responded', 'won', 'closed', 'spam');

  CREATE TABLE public.enquiries (
    id integer NOT NULL,
    kind public.enum_enquiries_kind DEFAULT 'contact'::public.enum_enquiries_kind NOT NULL,
    status public.enum_enquiries_status DEFAULT 'new'::public.enum_enquiries_status NOT NULL,
    name character varying,
    email character varying,
    phone character varying,
    company character varying,
    subject character varying,
    message character varying,
    -- Whatever a particular form collects beyond the shared fields.
    details jsonb,
    source character varying,
    assigned_to_id integer,
    client_id integer,
    internal_notes character varying,
    responded_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE SEQUENCE public.enquiries_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
  ALTER SEQUENCE public.enquiries_id_seq OWNED BY public.enquiries.id;
  ALTER TABLE ONLY public.enquiries
    ALTER COLUMN id SET DEFAULT nextval('public.enquiries_id_seq'::regclass);
  ALTER TABLE ONLY public.enquiries ADD CONSTRAINT enquiries_pkey PRIMARY KEY (id);

  -- Both nullable with ON DELETE SET NULL: removing a teammate or a client must
  -- not take the enquiry history with it.
  ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_assigned_to_id_crm_accounts_id_fk FOREIGN KEY (assigned_to_id) REFERENCES public.crm_accounts(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.enquiries
    ADD CONSTRAINT enquiries_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

  CREATE INDEX enquiries_kind_idx ON public.enquiries USING btree (kind);
  CREATE INDEX enquiries_status_idx ON public.enquiries USING btree (status);
  CREATE INDEX enquiries_email_idx ON public.enquiries USING btree (email);
  CREATE INDEX enquiries_assigned_to_idx ON public.enquiries USING btree (assigned_to_id);
  CREATE INDEX enquiries_client_idx ON public.enquiries USING btree (client_id);
  CREATE INDEX enquiries_updated_at_idx ON public.enquiries USING btree (updated_at);
  CREATE INDEX enquiries_created_at_idx ON public.enquiries USING btree (created_at);

  -- Admin document locking, as for every other collection.
  ALTER TABLE public.payload_locked_documents_rels ADD COLUMN enquiries_id integer;
  ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_enquiries_fk FOREIGN KEY (enquiries_id) REFERENCES public.enquiries(id) ON DELETE CASCADE;
  CREATE INDEX payload_locked_documents_rels_enquiries_id_idx ON public.payload_locked_documents_rels USING btree (enquiries_id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE public.payload_locked_documents_rels DROP COLUMN IF EXISTS enquiries_id;
  DROP TABLE IF EXISTS public.enquiries;
  DROP TYPE IF EXISTS public.enum_enquiries_status;
  DROP TYPE IF EXISTS public.enum_enquiries_kind;
  `)
}
