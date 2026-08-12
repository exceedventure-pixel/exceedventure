import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Everything the old Firebase CRM did that the first cut did not: notifications,
 * the shared mailbox, worker assignment, richer projects and resources, and
 * self-service profiles on both sides.
 *
 * Written by hand rather than generated, because `payload migrate:create` does
 * not run in this environment (see the note on the previous migration). It was
 * derived by diffing two throwaway databases: one with the committed migrations
 * applied, one with the new config dev-pushed — so every column, index, enum
 * value and foreign key below matches what Payload itself produces.
 *
 * Nothing here drops or rewrites existing data. The one loosened constraint is
 * `messages.client_id`, which becomes nullable so the mailbox can hold a thread
 * from someone who has no account yet; existing rows all have a client and are
 * unaffected.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- ── New enums ──────────────────────────────────────────────────────────────
  CREATE TYPE public.enum_conversations_mailbox AS ENUM ('support', 'sales', 'info', 'billing', 'contact', 'other');
  CREATE TYPE public.enum_conversations_folder AS ENUM ('inbox', 'archived', 'trash');
  CREATE TYPE public.enum_messages_direction AS ENUM ('inbound', 'outbound');
  CREATE TYPE public.enum_notifications_recipient_type AS ENUM ('staff', 'client');
  CREATE TYPE public.enum_notifications_type AS ENUM (
    'general', 'projectRequested', 'projectApproved', 'projectDeclined', 'projectCreated',
    'projectStatusChanged', 'taskAdded', 'taskUpdated', 'invoiceIssued', 'invoiceUpdated',
    'paymentRecorded', 'accessRequested', 'accessApproved', 'accessRejected',
    'deletionRequested', 'messageReceived', 'resourceShared'
  );

  -- ── Widened enums ──────────────────────────────────────────────────────────
  -- 'pendingApproval' comes first so it reads as the stage before "not started";
  -- the rest append, which is the only safe direction for a live enum.
  ALTER TYPE public.enum_projects_status ADD VALUE IF NOT EXISTS 'pendingApproval' BEFORE 'notStarted';
  ALTER TYPE public.enum_clients_status ADD VALUE IF NOT EXISTS 'proposal' AFTER 'lead';
  ALTER TYPE public.enum_resources_kind ADD VALUE IF NOT EXISTS 'screen';
  ALTER TYPE public.enum_resources_kind ADD VALUE IF NOT EXISTS 'doc';
  ALTER TYPE public.enum_resources_kind ADD VALUE IF NOT EXISTS 'drive';
  ALTER TYPE public.enum_resources_kind ADD VALUE IF NOT EXISTS 'custom';
  `)

  /**
   * Postgres will not let a value added to an enum be used in the same
   * transaction that added it. Payload runs migrations inside one, so the
   * widened types above have to be committed before anything defaults to them.
   * Splitting the statements into a second execute is what makes that hold.
   */
  await db.execute(sql`
  -- ── Conversations: the shared team mailbox ─────────────────────────────────
  CREATE TABLE public.conversations (
    id integer NOT NULL,
    subject character varying NOT NULL,
    client_id integer,
    contact_name character varying,
    contact_email character varying,
    mailbox public.enum_conversations_mailbox DEFAULT 'support'::public.enum_conversations_mailbox,
    folder public.enum_conversations_folder DEFAULT 'inbox'::public.enum_conversations_folder NOT NULL,
    unread boolean DEFAULT true,
    last_message_at timestamp(3) with time zone,
    last_message_preview character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE SEQUENCE public.conversations_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
  ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;
  ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);
  ALTER TABLE ONLY public.conversations ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  CREATE INDEX conversations_client_idx ON public.conversations USING btree (client_id);
  CREATE INDEX conversations_contact_email_idx ON public.conversations USING btree (contact_email);
  CREATE INDEX conversations_mailbox_idx ON public.conversations USING btree (mailbox);
  CREATE INDEX conversations_folder_idx ON public.conversations USING btree (folder);
  CREATE INDEX conversations_unread_idx ON public.conversations USING btree (unread);
  CREATE INDEX conversations_last_message_at_idx ON public.conversations USING btree (last_message_at);
  CREATE INDEX conversations_updated_at_idx ON public.conversations USING btree (updated_at);
  CREATE INDEX conversations_created_at_idx ON public.conversations USING btree (created_at);

  -- ── Notifications: the bell, for both audiences ────────────────────────────
  -- Two typed recipient columns rather than one polymorphic relation, so access
  -- control can narrow every read to one person with an indexed equality.
  CREATE TABLE public.notifications (
    id integer NOT NULL,
    recipient_type public.enum_notifications_recipient_type NOT NULL,
    staff_recipient_id integer,
    client_recipient_id integer,
    type public.enum_notifications_type DEFAULT 'general'::public.enum_notifications_type NOT NULL,
    title character varying NOT NULL,
    message character varying,
    link character varying,
    read boolean DEFAULT false,
    meta jsonb,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  CREATE SEQUENCE public.notifications_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
  ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;
  ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);
  ALTER TABLE ONLY public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_staff_recipient_id_crm_accounts_id_fk FOREIGN KEY (staff_recipient_id) REFERENCES public.crm_accounts(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_client_recipient_id_client_accounts_id_fk FOREIGN KEY (client_recipient_id) REFERENCES public.client_accounts(id) ON DELETE SET NULL;
  CREATE INDEX notifications_recipient_type_idx ON public.notifications USING btree (recipient_type);
  CREATE INDEX notifications_staff_recipient_idx ON public.notifications USING btree (staff_recipient_id);
  CREATE INDEX notifications_client_recipient_idx ON public.notifications USING btree (client_recipient_id);
  CREATE INDEX notifications_read_idx ON public.notifications USING btree (read);
  CREATE INDEX notifications_updated_at_idx ON public.notifications USING btree (updated_at);
  CREATE INDEX notifications_created_at_idx ON public.notifications USING btree (created_at);

  -- ── Messages become part of a thread ───────────────────────────────────────
  -- client_id drops NOT NULL so the mailbox can hold mail from someone with no
  -- portal account. Every existing row already has one.
  ALTER TABLE public.messages ADD COLUMN conversation_id integer;
  ALTER TABLE public.messages ADD COLUMN direction public.enum_messages_direction DEFAULT 'inbound'::public.enum_messages_direction;
  ALTER TABLE public.messages ADD COLUMN from_email character varying;
  ALTER TABLE public.messages ADD COLUMN to_email character varying;
  ALTER TABLE public.messages ADD COLUMN external_id character varying;
  ALTER TABLE public.messages ALTER COLUMN client_id DROP NOT NULL;
  ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE SET NULL;
  CREATE INDEX messages_conversation_idx ON public.messages USING btree (conversation_id);
  CREATE INDEX messages_external_id_idx ON public.messages USING btree (external_id);

  -- ── Projects: code, scope, internal notes ──────────────────────────────────
  ALTER TABLE public.projects ADD COLUMN code character varying;
  ALTER TABLE public.projects ADD COLUMN scope_of_work character varying;
  ALTER TABLE public.projects ADD COLUMN internal_notes character varying;
  CREATE UNIQUE INDEX projects_code_idx ON public.projects USING btree (code);

  -- ── Worker assignment ──────────────────────────────────────────────────────
  -- projects_rels already exists (it carries the media join); this adds the
  -- crm_accounts side. clients_rels is new — clients had no relationships before.
  ALTER TABLE public.projects_rels ADD COLUMN crm_accounts_id integer;
  ALTER TABLE ONLY public.projects_rels
    ADD CONSTRAINT projects_rels_crm_accounts_fk FOREIGN KEY (crm_accounts_id) REFERENCES public.crm_accounts(id) ON DELETE CASCADE;
  CREATE INDEX projects_rels_crm_accounts_id_idx ON public.projects_rels USING btree (crm_accounts_id);

  CREATE TABLE public.clients_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    crm_accounts_id integer
  );
  CREATE SEQUENCE public.clients_rels_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
  ALTER SEQUENCE public.clients_rels_id_seq OWNED BY public.clients_rels.id;
  ALTER TABLE ONLY public.clients_rels ALTER COLUMN id SET DEFAULT nextval('public.clients_rels_id_seq'::regclass);
  ALTER TABLE ONLY public.clients_rels ADD CONSTRAINT clients_rels_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.clients_rels
    ADD CONSTRAINT clients_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.clients(id) ON DELETE CASCADE;
  ALTER TABLE ONLY public.clients_rels
    ADD CONSTRAINT clients_rels_crm_accounts_fk FOREIGN KEY (crm_accounts_id) REFERENCES public.crm_accounts(id) ON DELETE CASCADE;
  CREATE INDEX clients_rels_order_idx ON public.clients_rels USING btree ("order");
  CREATE INDEX clients_rels_parent_idx ON public.clients_rels USING btree (parent_id);
  CREATE INDEX clients_rels_path_idx ON public.clients_rels USING btree (path);
  CREATE INDEX clients_rels_crm_accounts_id_idx ON public.clients_rels USING btree (crm_accounts_id);

  -- ── Resources gain sections, captions and ordering ─────────────────────────
  ALTER TABLE public.resources ADD COLUMN section character varying;
  ALTER TABLE public.resources ADD COLUMN caption character varying;
  ALTER TABLE public.resources ADD COLUMN "order" numeric DEFAULT 0;
  CREATE INDEX resources_kind_idx ON public.resources USING btree (kind);

  -- ── Staff accounts: pause and job title ────────────────────────────────────
  ALTER TABLE public.crm_accounts ADD COLUMN is_paused boolean DEFAULT false;
  ALTER TABLE public.crm_accounts ADD COLUMN job_title character varying;
  CREATE INDEX crm_accounts_is_paused_idx ON public.crm_accounts USING btree (is_paused);

  -- ── Client accounts: profile fields and the closure request ────────────────
  ALTER TABLE public.client_accounts ADD COLUMN job_title character varying;
  ALTER TABLE public.client_accounts ADD COLUMN organization character varying;
  ALTER TABLE public.client_accounts ADD COLUMN whatsapp character varying;
  ALTER TABLE public.client_accounts ADD COLUMN address character varying;
  ALTER TABLE public.client_accounts ADD COLUMN bio character varying;
  ALTER TABLE public.client_accounts ADD COLUMN deletion_requested boolean DEFAULT false;
  ALTER TABLE public.client_accounts ADD COLUMN deletion_requested_at timestamp(3) with time zone;
  ALTER TABLE public.client_accounts ADD COLUMN deletion_reason character varying;
  CREATE INDEX client_accounts_deletion_requested_idx ON public.client_accounts USING btree (deletion_requested);

  -- ── Admin document locking for the two new collections ─────────────────────
  ALTER TABLE public.payload_locked_documents_rels ADD COLUMN conversations_id integer;
  ALTER TABLE public.payload_locked_documents_rels ADD COLUMN notifications_id integer;
  ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_conversations_fk FOREIGN KEY (conversations_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
  ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_notifications_fk FOREIGN KEY (notifications_id) REFERENCES public.notifications(id) ON DELETE CASCADE;
  CREATE INDEX payload_locked_documents_rels_conversations_id_idx ON public.payload_locked_documents_rels USING btree (conversations_id);
  CREATE INDEX payload_locked_documents_rels_notifications_id_idx ON public.payload_locked_documents_rels USING btree (notifications_id);
  `)
}

/**
 * The reverse.
 *
 * The widened enums are deliberately left in place: Postgres cannot drop a
 * value from an enum, and rebuilding those three types would mean rewriting
 * every row of projects, clients and resources to undo an addition that breaks
 * nothing. Any project sitting in `pendingApproval` is first moved to
 * `notStarted`, so no row is left holding a value the old code cannot read.
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  UPDATE public.projects SET status = 'notStarted' WHERE status = 'pendingApproval';
  UPDATE public.clients SET status = 'lead' WHERE status = 'proposal';
  UPDATE public.resources SET kind = 'link' WHERE kind IN ('screen', 'doc', 'drive', 'custom');

  ALTER TABLE public.payload_locked_documents_rels DROP COLUMN IF EXISTS conversations_id;
  ALTER TABLE public.payload_locked_documents_rels DROP COLUMN IF EXISTS notifications_id;

  ALTER TABLE public.client_accounts DROP COLUMN IF EXISTS job_title;
  ALTER TABLE public.client_accounts DROP COLUMN IF EXISTS organization;
  ALTER TABLE public.client_accounts DROP COLUMN IF EXISTS whatsapp;
  ALTER TABLE public.client_accounts DROP COLUMN IF EXISTS address;
  ALTER TABLE public.client_accounts DROP COLUMN IF EXISTS bio;
  ALTER TABLE public.client_accounts DROP COLUMN IF EXISTS deletion_requested;
  ALTER TABLE public.client_accounts DROP COLUMN IF EXISTS deletion_requested_at;
  ALTER TABLE public.client_accounts DROP COLUMN IF EXISTS deletion_reason;

  ALTER TABLE public.crm_accounts DROP COLUMN IF EXISTS is_paused;
  ALTER TABLE public.crm_accounts DROP COLUMN IF EXISTS job_title;

  DROP INDEX IF EXISTS public.resources_kind_idx;
  ALTER TABLE public.resources DROP COLUMN IF EXISTS section;
  ALTER TABLE public.resources DROP COLUMN IF EXISTS caption;
  ALTER TABLE public.resources DROP COLUMN IF EXISTS "order";

  DROP TABLE IF EXISTS public.clients_rels;
  ALTER TABLE public.projects_rels DROP COLUMN IF EXISTS crm_accounts_id;

  DROP INDEX IF EXISTS public.projects_code_idx;
  ALTER TABLE public.projects DROP COLUMN IF EXISTS code;
  ALTER TABLE public.projects DROP COLUMN IF EXISTS scope_of_work;
  ALTER TABLE public.projects DROP COLUMN IF EXISTS internal_notes;

  -- A message with no client cannot exist under the old schema; there is
  -- nowhere to put it, so it goes rather than blocking the rollback.
  DELETE FROM public.messages WHERE client_id IS NULL;
  ALTER TABLE public.messages DROP COLUMN IF EXISTS conversation_id;
  ALTER TABLE public.messages DROP COLUMN IF EXISTS direction;
  ALTER TABLE public.messages DROP COLUMN IF EXISTS from_email;
  ALTER TABLE public.messages DROP COLUMN IF EXISTS to_email;
  ALTER TABLE public.messages DROP COLUMN IF EXISTS external_id;
  ALTER TABLE public.messages ALTER COLUMN client_id SET NOT NULL;

  DROP TABLE IF EXISTS public.notifications;
  DROP TABLE IF EXISTS public.conversations;

  DROP TYPE IF EXISTS public.enum_notifications_type;
  DROP TYPE IF EXISTS public.enum_notifications_recipient_type;
  DROP TYPE IF EXISTS public.enum_messages_direction;
  DROP TYPE IF EXISTS public.enum_conversations_folder;
  DROP TYPE IF EXISTS public.enum_conversations_mailbox;
  `)
}
