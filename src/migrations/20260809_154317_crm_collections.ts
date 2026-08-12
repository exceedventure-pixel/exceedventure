import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * CRM + client dashboard schema.
 *
 * Generated from the schema Payload's own dev push produced, captured with
 * pg_dump, because `payload migrate:create` cannot run in this environment
 * (tsx fails to resolve node: specifiers — reproduced on both Windows/Node
 * 24.13 and Linux/Node 24.19, so it is the CLI, not the platform).
 *
 * Verified by applying it to an empty database and confirming every table,
 * index and foreign key matches the pushed schema.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE public.enum_client_accounts_approval_status AS ENUM ('pending', 'active', 'paused', 'rejected');
  CREATE TYPE public.enum_client_accounts_provider AS ENUM ('password', 'google');
  CREATE TYPE public.enum_clients_status AS ENUM ('lead', 'active', 'onHold', 'former');
  CREATE TYPE public.enum_crm_accounts_provider AS ENUM ('password', 'google');
  CREATE TYPE public.enum_crm_accounts_role AS ENUM ('admin', 'manager', 'worker');
  CREATE TYPE public.enum_invoices_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'void');
  CREATE TYPE public.enum_messages_author_type AS ENUM ('staff', 'client');
  CREATE TYPE public.enum_payments_method AS ENUM ('bankTransfer', 'card', 'cash', 'other');
  CREATE TYPE public.enum_project_requests_status AS ENUM ('new', 'review', 'accepted', 'declined');
  CREATE TYPE public.enum_projects_status AS ENUM ('notStarted', 'planning', 'inProgress', 'review', 'completed', 'onHold', 'cancelled');
  CREATE TYPE public.enum_resources_kind AS ENUM ('link', 'file');
  CREATE TYPE public.enum_tasks_priority AS ENUM ('low', 'normal', 'high');
  CREATE TYPE public.enum_tasks_status AS ENUM ('todo', 'inProgress', 'blocked', 'done');
  CREATE TABLE public.client_accounts (
    id integer NOT NULL,
    name character varying,
    client_id integer NOT NULL,
    approval_status public.enum_client_accounts_approval_status DEFAULT 'pending'::public.enum_client_accounts_approval_status NOT NULL,
    phone character varying,
    provider public.enum_client_accounts_provider DEFAULT 'password'::public.enum_client_accounts_provider,
    provider_account_id character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    email character varying NOT NULL,
    reset_password_token character varying,
    reset_password_expiration timestamp(3) with time zone,
    salt character varying,
    hash character varying,
    login_attempts numeric DEFAULT 0,
    lock_until timestamp(3) with time zone
);
  CREATE SEQUENCE public.client_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
  ALTER SEQUENCE public.client_accounts_id_seq OWNED BY public.client_accounts.id;
  CREATE TABLE public.client_accounts_sessions (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    created_at timestamp(3) with time zone,
    expires_at timestamp(3) with time zone NOT NULL
);
  CREATE TABLE public.clients (
    id integer NOT NULL,
    name character varying NOT NULL,
    status public.enum_clients_status DEFAULT 'lead'::public.enum_clients_status,
    website character varying,
    notes character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    email character varying,
    phone character varying,
    whatsapp character varying,
    address character varying
);
  CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
  ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;
  CREATE TABLE public.contacts (
    id integer NOT NULL,
    name character varying NOT NULL,
    client_id integer NOT NULL,
    email character varying,
    phone character varying,
    job_title character varying,
    is_primary boolean DEFAULT false,
    notes character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
  CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
  ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;
  CREATE TABLE public.crm_accounts (
    id integer NOT NULL,
    name character varying,
    role public.enum_crm_accounts_role DEFAULT 'worker'::public.enum_crm_accounts_role NOT NULL,
    phone character varying,
    provider public.enum_crm_accounts_provider DEFAULT 'password'::public.enum_crm_accounts_provider,
    provider_account_id character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    email character varying NOT NULL,
    reset_password_token character varying,
    reset_password_expiration timestamp(3) with time zone,
    salt character varying,
    hash character varying,
    login_attempts numeric DEFAULT 0,
    lock_until timestamp(3) with time zone
);
  CREATE SEQUENCE public.crm_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
  ALTER SEQUENCE public.crm_accounts_id_seq OWNED BY public.crm_accounts.id;
  CREATE TABLE public.crm_accounts_sessions (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    created_at timestamp(3) with time zone,
    expires_at timestamp(3) with time zone NOT NULL
);
  CREATE TABLE public.invoices (
    id integer NOT NULL,
    number character varying NOT NULL,
    client_id integer NOT NULL,
    project_id integer,
    status public.enum_invoices_status DEFAULT 'draft'::public.enum_invoices_status,
    issue_date timestamp(3) with time zone,
    due_date timestamp(3) with time zone,
    currency character varying DEFAULT 'GBP'::character varying,
    tax_rate numeric DEFAULT 0,
    subtotal numeric,
    tax numeric,
    total numeric,
    notes character varying,
    stripe_invoice_id character varying,
    stripe_status character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
  CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
  ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;
  CREATE TABLE public.invoices_line_items (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    description character varying NOT NULL,
    quantity numeric DEFAULT 1 NOT NULL,
    unit_amount numeric NOT NULL
);
  CREATE TABLE public.messages (
    id integer NOT NULL,
    client_id integer NOT NULL,
    project_id integer,
    body character varying NOT NULL,
    author_type public.enum_messages_author_type DEFAULT 'client'::public.enum_messages_author_type NOT NULL,
    author_name character varying,
    read_by_staff boolean DEFAULT false,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
  CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
  ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;
  CREATE TABLE public.payments (
    id integer NOT NULL,
    reference character varying,
    invoice_id integer NOT NULL,
    client_id integer NOT NULL,
    amount numeric NOT NULL,
    paid_at timestamp(3) with time zone,
    method public.enum_payments_method DEFAULT 'bankTransfer'::public.enum_payments_method,
    notes character varying,
    stripe_payment_id character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
  CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
  ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;
  CREATE TABLE public.project_requests (
    id integer NOT NULL,
    title character varying NOT NULL,
    client_id integer NOT NULL,
    details character varying,
    status public.enum_project_requests_status DEFAULT 'new'::public.enum_project_requests_status,
    project_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
  CREATE SEQUENCE public.project_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
  ALTER SEQUENCE public.project_requests_id_seq OWNED BY public.project_requests.id;
  CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying NOT NULL,
    client_id integer NOT NULL,
    status public.enum_projects_status DEFAULT 'notStarted'::public.enum_projects_status,
    start_date timestamp(3) with time zone,
    due_date timestamp(3) with time zone,
    value numeric,
    summary character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
  CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
  ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;
  CREATE TABLE public.projects_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    media_id integer
);
  CREATE SEQUENCE public.projects_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
  ALTER SEQUENCE public.projects_rels_id_seq OWNED BY public.projects_rels.id;
  CREATE TABLE public.resources (
    id integer NOT NULL,
    label character varying NOT NULL,
    client_id integer NOT NULL,
    project_id integer,
    kind public.enum_resources_kind DEFAULT 'link'::public.enum_resources_kind,
    url character varying,
    file_id integer,
    notes character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
  CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
  ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;
  CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying NOT NULL,
    project_id integer NOT NULL,
    status public.enum_tasks_status DEFAULT 'todo'::public.enum_tasks_status,
    priority public.enum_tasks_priority DEFAULT 'normal'::public.enum_tasks_priority,
    assignee_id integer,
    due_date timestamp(3) with time zone,
    notes character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
  CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
  ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;
  ALTER TABLE ONLY public.client_accounts ALTER COLUMN id SET DEFAULT nextval('public.client_accounts_id_seq'::regclass);
  ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);
  ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);
  ALTER TABLE ONLY public.crm_accounts ALTER COLUMN id SET DEFAULT nextval('public.crm_accounts_id_seq'::regclass);
  ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);
  ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);
  ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);
  ALTER TABLE ONLY public.project_requests ALTER COLUMN id SET DEFAULT nextval('public.project_requests_id_seq'::regclass);
  ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);
  ALTER TABLE ONLY public.projects_rels ALTER COLUMN id SET DEFAULT nextval('public.projects_rels_id_seq'::regclass);
  ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);
  ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);
  ALTER TABLE ONLY public.client_accounts
    ADD CONSTRAINT client_accounts_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.client_accounts_sessions
    ADD CONSTRAINT client_accounts_sessions_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.crm_accounts
    ADD CONSTRAINT crm_accounts_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.crm_accounts_sessions
    ADD CONSTRAINT crm_accounts_sessions_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.invoices_line_items
    ADD CONSTRAINT invoices_line_items_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.project_requests
    ADD CONSTRAINT project_requests_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.projects_rels
    ADD CONSTRAINT projects_rels_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);
  CREATE INDEX client_accounts_approval_status_idx ON public.client_accounts USING btree (approval_status);
  CREATE INDEX client_accounts_client_idx ON public.client_accounts USING btree (client_id);
  CREATE INDEX client_accounts_created_at_idx ON public.client_accounts USING btree (created_at);
  CREATE UNIQUE INDEX client_accounts_email_idx ON public.client_accounts USING btree (email);
  CREATE INDEX client_accounts_provider_account_id_idx ON public.client_accounts USING btree (provider_account_id);
  CREATE INDEX client_accounts_sessions_order_idx ON public.client_accounts_sessions USING btree (_order);
  CREATE INDEX client_accounts_sessions_parent_id_idx ON public.client_accounts_sessions USING btree (_parent_id);
  CREATE INDEX client_accounts_updated_at_idx ON public.client_accounts USING btree (updated_at);
  CREATE INDEX clients_created_at_idx ON public.clients USING btree (created_at);
  CREATE INDEX clients_updated_at_idx ON public.clients USING btree (updated_at);
  CREATE INDEX contacts_client_idx ON public.contacts USING btree (client_id);
  CREATE INDEX contacts_created_at_idx ON public.contacts USING btree (created_at);
  CREATE INDEX contacts_updated_at_idx ON public.contacts USING btree (updated_at);
  CREATE INDEX crm_accounts_created_at_idx ON public.crm_accounts USING btree (created_at);
  CREATE UNIQUE INDEX crm_accounts_email_idx ON public.crm_accounts USING btree (email);
  CREATE INDEX crm_accounts_provider_account_id_idx ON public.crm_accounts USING btree (provider_account_id);
  CREATE INDEX crm_accounts_sessions_order_idx ON public.crm_accounts_sessions USING btree (_order);
  CREATE INDEX crm_accounts_sessions_parent_id_idx ON public.crm_accounts_sessions USING btree (_parent_id);
  CREATE INDEX crm_accounts_updated_at_idx ON public.crm_accounts USING btree (updated_at);
  CREATE INDEX invoices_client_idx ON public.invoices USING btree (client_id);
  CREATE INDEX invoices_created_at_idx ON public.invoices USING btree (created_at);
  CREATE INDEX invoices_line_items_order_idx ON public.invoices_line_items USING btree (_order);
  CREATE INDEX invoices_line_items_parent_id_idx ON public.invoices_line_items USING btree (_parent_id);
  CREATE UNIQUE INDEX invoices_number_idx ON public.invoices USING btree (number);
  CREATE INDEX invoices_project_idx ON public.invoices USING btree (project_id);
  CREATE INDEX invoices_stripe_invoice_id_idx ON public.invoices USING btree (stripe_invoice_id);
  CREATE INDEX invoices_updated_at_idx ON public.invoices USING btree (updated_at);
  CREATE INDEX messages_client_idx ON public.messages USING btree (client_id);
  CREATE INDEX messages_created_at_idx ON public.messages USING btree (created_at);
  CREATE INDEX messages_project_idx ON public.messages USING btree (project_id);
  CREATE INDEX messages_updated_at_idx ON public.messages USING btree (updated_at);
  CREATE INDEX payments_client_idx ON public.payments USING btree (client_id);
  CREATE INDEX payments_created_at_idx ON public.payments USING btree (created_at);
  CREATE INDEX payments_invoice_idx ON public.payments USING btree (invoice_id);
  CREATE INDEX payments_stripe_payment_id_idx ON public.payments USING btree (stripe_payment_id);
  CREATE INDEX payments_updated_at_idx ON public.payments USING btree (updated_at);
  CREATE INDEX project_requests_client_idx ON public.project_requests USING btree (client_id);
  CREATE INDEX project_requests_created_at_idx ON public.project_requests USING btree (created_at);
  CREATE INDEX project_requests_project_idx ON public.project_requests USING btree (project_id);
  CREATE INDEX project_requests_updated_at_idx ON public.project_requests USING btree (updated_at);
  CREATE INDEX projects_client_idx ON public.projects USING btree (client_id);
  CREATE INDEX projects_created_at_idx ON public.projects USING btree (created_at);
  CREATE INDEX projects_rels_media_id_idx ON public.projects_rels USING btree (media_id);
  CREATE INDEX projects_rels_order_idx ON public.projects_rels USING btree ("order");
  CREATE INDEX projects_rels_parent_idx ON public.projects_rels USING btree (parent_id);
  CREATE INDEX projects_rels_path_idx ON public.projects_rels USING btree (path);
  CREATE INDEX projects_updated_at_idx ON public.projects USING btree (updated_at);
  CREATE INDEX resources_client_idx ON public.resources USING btree (client_id);
  CREATE INDEX resources_created_at_idx ON public.resources USING btree (created_at);
  CREATE INDEX resources_file_idx ON public.resources USING btree (file_id);
  CREATE INDEX resources_project_idx ON public.resources USING btree (project_id);
  CREATE INDEX resources_updated_at_idx ON public.resources USING btree (updated_at);
  CREATE INDEX tasks_assignee_idx ON public.tasks USING btree (assignee_id);
  CREATE INDEX tasks_created_at_idx ON public.tasks USING btree (created_at);
  CREATE INDEX tasks_project_idx ON public.tasks USING btree (project_id);
  CREATE INDEX tasks_updated_at_idx ON public.tasks USING btree (updated_at);
  ALTER TABLE ONLY public.client_accounts
    ADD CONSTRAINT client_accounts_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.client_accounts_sessions
    ADD CONSTRAINT client_accounts_sessions_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.client_accounts(id) ON DELETE CASCADE;
  ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.crm_accounts_sessions
    ADD CONSTRAINT crm_accounts_sessions_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.crm_accounts(id) ON DELETE CASCADE;
  ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.invoices_line_items
    ADD CONSTRAINT invoices_line_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.invoices(id) ON DELETE CASCADE;
  ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_invoices_id_fk FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.project_requests
    ADD CONSTRAINT project_requests_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.project_requests
    ADD CONSTRAINT project_requests_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.projects_rels
    ADD CONSTRAINT projects_rels_media_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE CASCADE;
  ALTER TABLE ONLY public.projects_rels
    ADD CONSTRAINT projects_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.projects(id) ON DELETE CASCADE;
  ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_file_id_media_id_fk FOREIGN KEY (file_id) REFERENCES public.media(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assignee_id_crm_accounts_id_fk FOREIGN KEY (assignee_id) REFERENCES public.crm_accounts(id) ON DELETE SET NULL;
  ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_projects_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
  -- Payload tracks document locks and admin preferences through shared join
  -- tables; every new collection needs a column, index and FK there or the
  -- admin panel errors the first time it locks one of these documents.
  ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "client_accounts_id" integer;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "clients_id" integer;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "contacts_id" integer;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "crm_accounts_id" integer;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "invoices_id" integer;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "messages_id" integer;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "payments_id" integer;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "project_requests_id" integer;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "projects_id" integer;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "resources_id" integer;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tasks_id" integer;
  ALTER TABLE "public"."payload_preferences_rels" ADD COLUMN IF NOT EXISTS "client_accounts_id" integer;
  ALTER TABLE "public"."payload_preferences_rels" ADD COLUMN IF NOT EXISTS "crm_accounts_id" integer;
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_client_accounts_id_idx" ON "public"."payload_locked_documents_rels" USING btree (client_accounts_id);
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_clients_id_idx" ON "public"."payload_locked_documents_rels" USING btree (clients_id);
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_contacts_id_idx" ON "public"."payload_locked_documents_rels" USING btree (contacts_id);
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_crm_accounts_id_idx" ON "public"."payload_locked_documents_rels" USING btree (crm_accounts_id);
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_invoices_id_idx" ON "public"."payload_locked_documents_rels" USING btree (invoices_id);
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_messages_id_idx" ON "public"."payload_locked_documents_rels" USING btree (messages_id);
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_payments_id_idx" ON "public"."payload_locked_documents_rels" USING btree (payments_id);
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_project_requests_id_idx" ON "public"."payload_locked_documents_rels" USING btree (project_requests_id);
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_projects_id_idx" ON "public"."payload_locked_documents_rels" USING btree (projects_id);
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_resources_id_idx" ON "public"."payload_locked_documents_rels" USING btree (resources_id);
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tasks_id_idx" ON "public"."payload_locked_documents_rels" USING btree (tasks_id);
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_client_accounts_id_idx" ON "public"."payload_preferences_rels" USING btree (client_accounts_id);
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_crm_accounts_id_idx" ON "public"."payload_preferences_rels" USING btree (crm_accounts_id);
  ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_client_accounts_fk" FOREIGN KEY (client_accounts_id) REFERENCES client_accounts(id) ON DELETE CASCADE;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_clients_fk" FOREIGN KEY (clients_id) REFERENCES clients(id) ON DELETE CASCADE;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY (contacts_id) REFERENCES contacts(id) ON DELETE CASCADE;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_crm_accounts_fk" FOREIGN KEY (crm_accounts_id) REFERENCES crm_accounts(id) ON DELETE CASCADE;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invoices_fk" FOREIGN KEY (invoices_id) REFERENCES invoices(id) ON DELETE CASCADE;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY (messages_id) REFERENCES messages(id) ON DELETE CASCADE;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY (payments_id) REFERENCES payments(id) ON DELETE CASCADE;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_project_requests_fk" FOREIGN KEY (project_requests_id) REFERENCES project_requests(id) ON DELETE CASCADE;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY (projects_id) REFERENCES projects(id) ON DELETE CASCADE;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY (resources_id) REFERENCES resources(id) ON DELETE CASCADE;
  ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tasks_fk" FOREIGN KEY (tasks_id) REFERENCES tasks(id) ON DELETE CASCADE;
  ALTER TABLE "public"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_client_accounts_fk" FOREIGN KEY (client_accounts_id) REFERENCES client_accounts(id) ON DELETE CASCADE;
  ALTER TABLE "public"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_crm_accounts_fk" FOREIGN KEY (crm_accounts_id) REFERENCES crm_accounts(id) ON DELETE CASCADE;

  -- Repairs drift predating the CRM: the S3 storage plugin adds media.prefix,
  -- but it was introduced after the initial migration was generated, so a
  -- database built purely from migrations never got the column.
  ALTER TABLE "public"."media" ADD COLUMN IF NOT EXISTS "prefix" character varying DEFAULT 'media';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "public"."clients" CASCADE;
  DROP TABLE IF EXISTS "public"."crm_accounts" CASCADE;
  DROP TABLE IF EXISTS "public"."crm_accounts_sessions" CASCADE;
  DROP TABLE IF EXISTS "public"."client_accounts" CASCADE;
  DROP TABLE IF EXISTS "public"."client_accounts_sessions" CASCADE;
  DROP TABLE IF EXISTS "public"."contacts" CASCADE;
  DROP TABLE IF EXISTS "public"."projects" CASCADE;
  DROP TABLE IF EXISTS "public"."projects_rels" CASCADE;
  DROP TABLE IF EXISTS "public"."invoices" CASCADE;
  DROP TABLE IF EXISTS "public"."invoices_line_items" CASCADE;
  DROP TABLE IF EXISTS "public"."payments" CASCADE;
  DROP TABLE IF EXISTS "public"."tasks" CASCADE;
  DROP TABLE IF EXISTS "public"."project_requests" CASCADE;
  DROP TABLE IF EXISTS "public"."messages" CASCADE;
  DROP TABLE IF EXISTS "public"."resources" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_clients_status";
  DROP TYPE IF EXISTS "public"."enum_crm_accounts_provider";
  DROP TYPE IF EXISTS "public"."enum_crm_accounts_role";
  DROP TYPE IF EXISTS "public"."enum_client_accounts_provider";
  DROP TYPE IF EXISTS "public"."enum_client_accounts_approval_status";
  DROP TYPE IF EXISTS "public"."enum_projects_status";
  DROP TYPE IF EXISTS "public"."enum_invoices_status";
  DROP TYPE IF EXISTS "public"."enum_payments_method";
  DROP TYPE IF EXISTS "public"."enum_tasks_status";
  DROP TYPE IF EXISTS "public"."enum_tasks_priority";
  DROP TYPE IF EXISTS "public"."enum_project_requests_status";
  DROP TYPE IF EXISTS "public"."enum_messages_author_type";
  DROP TYPE IF EXISTS "public"."enum_resources_kind";
  ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "client_accounts_id";
  ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "clients_id";
  ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "contacts_id";
  ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "crm_accounts_id";
  ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "invoices_id";
  ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "messages_id";
  ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "payments_id";
  ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "project_requests_id";
  ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "projects_id";
  ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "resources_id";
  ALTER TABLE "public"."payload_locked_documents_rels" DROP COLUMN IF EXISTS "tasks_id";
  ALTER TABLE "public"."payload_preferences_rels" DROP COLUMN IF EXISTS "client_accounts_id";
  ALTER TABLE "public"."payload_preferences_rels" DROP COLUMN IF EXISTS "crm_accounts_id";`)
}
