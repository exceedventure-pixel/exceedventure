import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The depth the old task board had: subtasks, per-task links, and configurable
 * columns.
 *
 * The previous CRM modelled this as `tasks` (a list) → `subtasks` (the actual
 * items), with custom columns defined per list. Here a task *is* the item and
 * subtasks are its checklist, while columns are defined once per project — the
 * old per-list definition meant the same column had to be recreated for every
 * list, so a board reliably ended up with three slightly different "Status"
 * columns that meant three different things.
 *
 * Purely additive: nothing existing is touched, so applying this to a live
 * database changes no rows.
 *
 * Derived by diffing a database with the committed migrations applied against
 * one with the new config dev-pushed, then verified to produce an identical
 * schema.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE public.enum_tasks_subtasks_status AS ENUM ('todo', 'inProgress', 'blocked', 'done');
  CREATE TYPE public.enum_tasks_subtasks_priority AS ENUM ('low', 'normal', 'high');
  CREATE TYPE public.enum_tasks_links_kind AS ENUM ('doc', 'sheet', 'snap', 'drive', 'website');
  CREATE TYPE public.enum_projects_task_columns_type AS ENUM (
    'text', 'number', 'dropdown', 'checkbox', 'doc', 'sheet', 'snap', 'drive', 'website'
  );
  CREATE TYPE public.enum_projects_task_columns_options_tone AS ENUM (
    'neutral', 'info', 'success', 'warning', 'danger'
  );

  -- How complete a task is, for work that is not simply done or not done.
  ALTER TABLE public.tasks ADD COLUMN progress numeric;

  -- ── Subtasks ───────────────────────────────────────────────────────────────
  -- An array field, so Payload owns _order and a varchar id. They are only ever
  -- read with their parent task, never queried across projects.
  CREATE TABLE public.tasks_subtasks (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    title character varying NOT NULL,
    status public.enum_tasks_subtasks_status DEFAULT 'todo'::public.enum_tasks_subtasks_status,
    priority public.enum_tasks_subtasks_priority DEFAULT 'normal'::public.enum_tasks_subtasks_priority,
    assignee_id integer,
    due_date timestamp(3) with time zone,
    -- Values for the project's custom columns, keyed by column key.
    fields jsonb
  );
  ALTER TABLE ONLY public.tasks_subtasks ADD CONSTRAINT tasks_subtasks_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.tasks_subtasks
    ADD CONSTRAINT tasks_subtasks_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.tasks(id) ON DELETE CASCADE;
  ALTER TABLE ONLY public.tasks_subtasks
    ADD CONSTRAINT tasks_subtasks_assignee_id_crm_accounts_id_fk FOREIGN KEY (assignee_id) REFERENCES public.crm_accounts(id) ON DELETE SET NULL;
  CREATE INDEX tasks_subtasks_order_idx ON public.tasks_subtasks USING btree (_order);
  CREATE INDEX tasks_subtasks_parent_id_idx ON public.tasks_subtasks USING btree (_parent_id);
  CREATE INDEX tasks_subtasks_assignee_idx ON public.tasks_subtasks USING btree (assignee_id);

  -- ── Task links ─────────────────────────────────────────────────────────────
  -- Replaces the board's five near-identical doc / sheet / snap / drive /
  -- website link columns with one list carrying a kind.
  CREATE TABLE public.tasks_links (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    label character varying NOT NULL,
    url character varying NOT NULL,
    kind public.enum_tasks_links_kind DEFAULT 'website'::public.enum_tasks_links_kind
  );
  ALTER TABLE ONLY public.tasks_links ADD CONSTRAINT tasks_links_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.tasks_links
    ADD CONSTRAINT tasks_links_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.tasks(id) ON DELETE CASCADE;
  CREATE INDEX tasks_links_order_idx ON public.tasks_links USING btree (_order);
  CREATE INDEX tasks_links_parent_id_idx ON public.tasks_links USING btree (_parent_id);

  -- ── Custom board columns, defined per project ──────────────────────────────
  CREATE TABLE public.projects_task_columns (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    key character varying NOT NULL,
    label character varying NOT NULL,
    type public.enum_projects_task_columns_type DEFAULT 'text'::public.enum_projects_task_columns_type NOT NULL
  );
  ALTER TABLE ONLY public.projects_task_columns
    ADD CONSTRAINT projects_task_columns_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.projects_task_columns
    ADD CONSTRAINT projects_task_columns_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.projects(id) ON DELETE CASCADE;
  CREATE INDEX projects_task_columns_order_idx ON public.projects_task_columns USING btree (_order);
  CREATE INDEX projects_task_columns_parent_id_idx ON public.projects_task_columns USING btree (_parent_id);

  CREATE TABLE public.projects_task_columns_options (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    value character varying,
    tone public.enum_projects_task_columns_options_tone DEFAULT 'neutral'::public.enum_projects_task_columns_options_tone
  );
  ALTER TABLE ONLY public.projects_task_columns_options
    ADD CONSTRAINT projects_task_columns_options_pkey PRIMARY KEY (id);
  ALTER TABLE ONLY public.projects_task_columns_options
    ADD CONSTRAINT projects_task_columns_options_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.projects_task_columns(id) ON DELETE CASCADE;
  CREATE INDEX projects_task_columns_options_order_idx ON public.projects_task_columns_options USING btree (_order);
  CREATE INDEX projects_task_columns_options_parent_id_idx ON public.projects_task_columns_options USING btree (_parent_id);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS public.projects_task_columns_options;
  DROP TABLE IF EXISTS public.projects_task_columns;
  DROP TABLE IF EXISTS public.tasks_links;
  DROP TABLE IF EXISTS public.tasks_subtasks;

  ALTER TABLE public.tasks DROP COLUMN IF EXISTS progress;

  DROP TYPE IF EXISTS public.enum_projects_task_columns_options_tone;
  DROP TYPE IF EXISTS public.enum_projects_task_columns_type;
  DROP TYPE IF EXISTS public.enum_tasks_links_kind;
  DROP TYPE IF EXISTS public.enum_tasks_subtasks_priority;
  DROP TYPE IF EXISTS public.enum_tasks_subtasks_status;
  `)
}
