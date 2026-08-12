'use client'

import React from 'react'
import { ActionForm, Drawer, Field, Input, Textarea, Select, Button } from './form'
import {
  saveClient,
  saveProject,
  saveInvoice,
  saveTask,
  saveResource,
  saveContact,
  recordPayment,
  assignClientMembers,
  assignProjectMembers,
  requestProject,
} from '@/crm/actions'
import { inviteTeammate, updateMyProfile, changeMyPassword } from '@/crm/account-actions'
import { composeMessage } from '@/crm/mailbox-actions'

/**
 * Concrete create/edit forms.
 *
 * Each is a thin arrangement of fields over a server action — validation and
 * anything security-relevant lives in the action and the collection, not here.
 */

export type Option = { label: string; value: string }

const CLIENT_STATUS: Option[] = [
  { label: 'Lead', value: 'lead' },
  { label: 'Proposal', value: 'proposal' },
  { label: 'Active', value: 'active' },
  { label: 'On hold', value: 'onHold' },
  { label: 'Former', value: 'former' },
]

export const PROJECT_STATUS: Option[] = [
  { label: 'Pending approval', value: 'pendingApproval' },
  { label: 'Not started', value: 'notStarted' },
  { label: 'Planning', value: 'planning' },
  { label: 'In progress', value: 'inProgress' },
  { label: 'Review', value: 'review' },
  { label: 'Completed', value: 'completed' },
  { label: 'On hold', value: 'onHold' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const INVOICE_STATUS: Option[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Void', value: 'void' },
]

export const TASK_STATUS: Option[] = [
  { label: 'To do', value: 'todo' },
  { label: 'In progress', value: 'inProgress' },
  { label: 'Blocked', value: 'blocked' },
  { label: 'Done', value: 'done' },
]

const RESOURCE_KIND: Option[] = [
  { label: 'Link', value: 'link' },
  { label: 'Screen / preview', value: 'screen' },
  { label: 'Document', value: 'doc' },
  { label: 'Drive folder', value: 'drive' },
  { label: 'Custom section', value: 'custom' },
]

const blank: Option = { label: '—', value: '' }

// ── Clients ──────────────────────────────────────────────────────────────────

export type ClientValues = {
  id?: string | number
  name?: string
  status?: string
  website?: string
  email?: string
  phone?: string
  whatsapp?: string
  address?: string
  notes?: string
}

export const ClientForm: React.FC<{ label: string; values?: ClientValues }> = ({
  label,
  values,
}) => (
  <Drawer title={values?.id ? 'Edit client' : 'New client'} trigger={<Button>{label}</Button>}>
    {(close) => (
      <ActionForm action={saveClient} onDone={close} submitLabel="Save client">
        {values?.id && <input type="hidden" name="id" value={values.id} />}
        <div className="space-y-3">
          <Field label="Company name">
            <Input name="name" defaultValue={values?.name} required />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={values?.status ?? 'lead'} options={CLIENT_STATUS} />
          </Field>
          <Field label="Website">
            <Input name="website" defaultValue={values?.website} placeholder="example.com" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <Input name="email" type="email" defaultValue={values?.email} />
            </Field>
            <Field label="Phone">
              <Input name="phone" defaultValue={values?.phone} />
            </Field>
          </div>
          <Field label="WhatsApp">
            <Input name="whatsapp" defaultValue={values?.whatsapp} />
          </Field>
          <Field label="Address">
            <Textarea name="address" defaultValue={values?.address} />
          </Field>
          <Field label="Internal notes" hint="Never shown in the client portal.">
            <Textarea name="notes" defaultValue={values?.notes} />
          </Field>
        </div>
      </ActionForm>
    )}
  </Drawer>
)

// ── Projects ─────────────────────────────────────────────────────────────────

export type ProjectValues = {
  id?: string | number
  name?: string
  client?: string | number
  status?: string
  startDate?: string
  dueDate?: string
  value?: number
  summary?: string
  scopeOfWork?: string
  internalNotes?: string
}

export const ProjectForm: React.FC<{
  label: string
  clients: Option[]
  values?: ProjectValues
  /** Locks the client when opened from that client's own page. */
  lockClient?: boolean
}> = ({ label, clients, values, lockClient }) => (
  <Drawer title={values?.id ? 'Edit project' : 'New project'} trigger={<Button>{label}</Button>}>
    {(close) => (
      <ActionForm action={saveProject} onDone={close} submitLabel="Save project">
        {values?.id && <input type="hidden" name="id" value={values.id} />}
        {lockClient && <input type="hidden" name="client" value={String(values?.client ?? '')} />}
        <div className="space-y-3">
          <Field label="Project name">
            <Input name="name" defaultValue={values?.name} required />
          </Field>
          {!lockClient && (
            <Field label="Client">
              <Select name="client" defaultValue={String(values?.client ?? '')} options={clients} />
            </Field>
          )}
          <Field label="Status">
            <Select
              name="status"
              defaultValue={values?.status ?? 'notStarted'}
              options={PROJECT_STATUS}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <Input name="startDate" type="date" defaultValue={values?.startDate?.slice(0, 10)} />
            </Field>
            <Field label="Due date">
              <Input name="dueDate" type="date" defaultValue={values?.dueDate?.slice(0, 10)} />
            </Field>
          </div>
          <Field label="Value" hint="In pounds — stored to the penny. Not shown to the client.">
            <Input
              name="value"
              type="number"
              step="0.01"
              defaultValue={values?.value ? values.value / 100 : undefined}
            />
          </Field>
          <Field label="Summary" hint="A line the client sees on their project page.">
            <Textarea name="summary" defaultValue={values?.summary} />
          </Field>
          <Field label="Scope of work" hint="What is included. Shown to the client.">
            <Textarea name="scopeOfWork" defaultValue={values?.scopeOfWork} rows={4} />
          </Field>
          <Field label="Internal notes" hint="Team only — never rendered in the portal.">
            <Textarea name="internalNotes" defaultValue={values?.internalNotes} />
          </Field>
        </div>
      </ActionForm>
    )}
  </Drawer>
)

// ── Invoices ─────────────────────────────────────────────────────────────────

export const InvoiceForm: React.FC<{
  label: string
  clients: Option[]
  projects?: Option[]
}> = ({ label, clients, projects }) => {
  const [rows, setRows] = React.useState([0])

  return (
    <Drawer title="New invoice" trigger={<Button>{label}</Button>}>
      {(close) => (
        <ActionForm action={saveInvoice} onDone={close} submitLabel="Save invoice">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Number">
                <Input name="number" required placeholder="INV-1046" />
              </Field>
              <Field label="Status" hint="Sending it emails the client.">
                <Select name="status" defaultValue="draft" options={INVOICE_STATUS} />
              </Field>
            </div>
            <Field label="Client">
              <Select name="client" options={clients} />
            </Field>
            {projects && projects.length > 0 && (
              <Field label="Project" hint="Optional.">
                <Select name="project" options={[blank, ...projects]} defaultValue="" />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Issue date">
                <Input name="issueDate" type="date" />
              </Field>
              <Field label="Due date">
                <Input name="dueDate" type="date" />
              </Field>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Line items</p>
              <div className="space-y-2">
                {rows.map((row) => (
                  <div key={row} className="grid grid-cols-[1fr_60px_90px] gap-2">
                    <Input name="lineDescription" placeholder="Description" />
                    <Input name="lineQuantity" type="number" step="1" defaultValue={1} />
                    <Input name="lineAmount" type="number" step="0.01" placeholder="0.00" />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setRows((r) => [...r, r.length])}
                className="mt-2 text-xs font-medium text-primary"
              >
                + Add line
              </button>
            </div>

            <Field label="Tax rate %" hint="Totals are calculated on the server.">
              <Input name="taxRate" type="number" step="0.01" defaultValue={20} />
            </Field>
            <Field label="Notes">
              <Textarea name="notes" />
            </Field>
          </div>
        </ActionForm>
      )}
    </Drawer>
  )
}

/** Records money received. Marking the invoice paid happens server-side. */
export const PaymentForm: React.FC<{
  invoices: Option[]
  defaultInvoice?: string | number
  label?: string
}> = ({ invoices, defaultInvoice, label = 'Record payment' }) => (
  <Drawer title="Record a payment" trigger={<Button>{label}</Button>}>
    {(close) => (
      <ActionForm action={recordPayment} onDone={close} submitLabel="Record payment">
        <div className="space-y-3">
          <Field label="Invoice">
            <Select
              name="invoice"
              options={invoices}
              defaultValue={defaultInvoice ? String(defaultInvoice) : undefined}
            />
          </Field>
          <Field label="Amount" hint="In pounds.">
            <Input name="amount" type="number" step="0.01" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Paid on">
              <Input name="paidAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field label="Method">
              <Select
                name="method"
                defaultValue="bankTransfer"
                options={[
                  { label: 'Bank transfer', value: 'bankTransfer' },
                  { label: 'Card', value: 'card' },
                  { label: 'Cash', value: 'cash' },
                  { label: 'Other', value: 'other' },
                ]}
              />
            </Field>
          </div>
          <Field label="Reference">
            <Input name="reference" placeholder="Bank reference" />
          </Field>
          <Field label="Notes">
            <Textarea name="notes" />
          </Field>
        </div>
      </ActionForm>
    )}
  </Drawer>
)

// ── Tasks ────────────────────────────────────────────────────────────────────

export const TaskForm: React.FC<{
  projectId: string | number
  team?: Option[]
  values?: { id?: string | number; title?: string; status?: string; priority?: string; dueDate?: string; notes?: string; assignee?: string | number }
  label?: string
}> = ({ projectId, team, values, label = 'Add task' }) => (
  <Drawer title={values?.id ? 'Edit task' : 'New task'} trigger={<Button>{label}</Button>}>
    {(close) => (
      <ActionForm action={saveTask} onDone={close} submitLabel={values?.id ? 'Save task' : 'Add task'}>
        <input type="hidden" name="project" value={projectId} />
        {values?.id && <input type="hidden" name="id" value={values.id} />}
        <div className="space-y-3">
          <Field label="Title">
            <Input name="title" defaultValue={values?.title} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select name="status" defaultValue={values?.status ?? 'todo'} options={TASK_STATUS} />
            </Field>
            <Field label="Priority">
              <Select
                name="priority"
                defaultValue={values?.priority ?? 'normal'}
                options={[
                  { label: 'Low', value: 'low' },
                  { label: 'Normal', value: 'normal' },
                  { label: 'High', value: 'high' },
                ]}
              />
            </Field>
          </div>
          {team && team.length > 0 && (
            <Field label="Assignee">
              <Select
                name="assignee"
                options={[blank, ...team]}
                defaultValue={values?.assignee ? String(values.assignee) : ''}
              />
            </Field>
          )}
          <Field label="Due date">
            <Input name="dueDate" type="date" defaultValue={values?.dueDate?.slice(0, 10)} />
          </Field>
          <Field label="Notes">
            <Textarea name="notes" defaultValue={values?.notes} />
          </Field>
        </div>
      </ActionForm>
    )}
  </Drawer>
)

// ── Resources ────────────────────────────────────────────────────────────────

export const ResourceForm: React.FC<{
  clientId: string | number
  projectId?: string | number
  projects?: Option[]
}> = ({ clientId, projectId, projects }) => {
  const [kind, setKind] = React.useState('link')

  return (
    <Drawer title="Share a resource" trigger={<Button variant="secondary">Add resource</Button>}>
      {(close) => (
        <ActionForm action={saveResource} onDone={close} submitLabel="Share">
          <input type="hidden" name="client" value={clientId} />
          {projectId && <input type="hidden" name="project" value={projectId} />}
          <div className="space-y-3">
            <Field label="Label">
              <Input name="label" required placeholder="Brand assets (Drive)" />
            </Field>
            <Field label="Kind">
              <Select
                name="kind"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                options={RESOURCE_KIND}
              />
            </Field>
            {kind === 'custom' && (
              <Field label="Section heading" hint="Groups resources under your own heading.">
                <Input name="section" placeholder="Ad creatives" />
              </Field>
            )}
            {!projectId && projects && projects.length > 0 && (
              <Field label="Project" hint="Optional — leave blank for the whole account.">
                <Select name="project" options={[blank, ...projects]} defaultValue="" />
              </Field>
            )}
            <Field label="URL" hint="An embed snippet works too — the link is pulled out of it.">
              <Input name="url" placeholder="https://…" />
            </Field>
            {kind === 'screen' && (
              <Field label="Caption">
                <Textarea name="caption" />
              </Field>
            )}
            <Field label="Notes">
              <Textarea name="notes" />
            </Field>
          </div>
        </ActionForm>
      )}
    </Drawer>
  )
}

// ── Contacts ─────────────────────────────────────────────────────────────────

export const ContactForm: React.FC<{
  clientId: string | number
  values?: {
    id?: string | number
    name?: string
    email?: string
    phone?: string
    jobTitle?: string
    isPrimary?: boolean
    notes?: string
  }
  label?: string
}> = ({ clientId, values, label = 'Add contact' }) => (
  <Drawer
    title={values?.id ? 'Edit contact' : 'New contact'}
    trigger={<Button variant="secondary">{label}</Button>}
  >
    {(close) => (
      <ActionForm action={saveContact} onDone={close} submitLabel="Save contact">
        <input type="hidden" name="client" value={clientId} />
        {values?.id && <input type="hidden" name="id" value={values.id} />}
        <div className="space-y-3">
          <Field label="Name">
            <Input name="name" defaultValue={values?.name} required />
          </Field>
          <Field label="Job title">
            <Input name="jobTitle" defaultValue={values?.jobTitle} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <Input name="email" type="email" defaultValue={values?.email} />
            </Field>
            <Field label="Phone">
              <Input name="phone" defaultValue={values?.phone} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPrimary"
              defaultChecked={values?.isPrimary}
              className="h-4 w-4 rounded border-border"
            />
            Main point of contact
          </label>
          <Field label="Notes">
            <Textarea name="notes" defaultValue={values?.notes} />
          </Field>
        </div>
      </ActionForm>
    )}
  </Drawer>
)

// ── Assignment ───────────────────────────────────────────────────────────────

/**
 * Who is on this client or project.
 *
 * A checkbox list rather than a multi-select: it is scanned far more often than
 * it is changed, and this way the current answer is readable at a glance. The
 * chosen ids drive member scoping, so the field is staff-only server-side.
 */
export const AssignForm: React.FC<{
  kind: 'client' | 'project'
  id: string | number
  team: { id: string | number; name: string; role?: string }[]
  assigned: (string | number)[]
}> = ({ kind, id, team, assigned }) => {
  const current = new Set(assigned.map(String))

  return (
    <Drawer
      title={kind === 'client' ? 'Who looks after this client' : 'Who is on this project'}
      trigger={<Button variant="secondary">Assign</Button>}
    >
      {(close) => (
        <ActionForm
          action={kind === 'client' ? assignClientMembers : assignProjectMembers}
          onDone={close}
          submitLabel="Save assignment"
        >
          <input type="hidden" name="id" value={id} />
          <div className="space-y-1">
            {team.length === 0 && (
              <p className="text-sm text-muted-foreground">No teammates to assign yet.</p>
            )}
            {team.map((member) => (
              <label
                key={member.id}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  name="assignedTo"
                  value={member.id}
                  defaultChecked={current.has(String(member.id))}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="flex-1">{member.name}</span>
                {member.role && (
                  <span className="text-[11px] capitalize text-muted-foreground">
                    {member.role}
                  </span>
                )}
              </label>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            A member only sees clients and projects they are assigned to. Admins and managers see
            everything.
          </p>
        </ActionForm>
      )}
    </Drawer>
  )
}

// ── Team ─────────────────────────────────────────────────────────────────────

export const InviteForm: React.FC = () => (
  <Drawer title="Invite a teammate" trigger={<Button>Invite teammate</Button>}>
    {(close) => (
      <ActionForm action={inviteTeammate} onDone={close} submitLabel="Create account">
        <div className="space-y-3">
          <Field label="Name">
            <Input name="name" />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" required />
          </Field>
          <Field label="Role">
            <Select
              name="role"
              defaultValue="member"
              options={[
                { label: 'Member', value: 'member' },
                { label: 'Manager', value: 'manager' },
                { label: 'Admin', value: 'admin' },
              ]}
            />
          </Field>
          <Field
            label="Temporary password"
            hint="At least 10 characters. It is emailed to them and they can change it after signing in."
          >
            <Input name="password" type="text" required />
          </Field>
        </div>
      </ActionForm>
    )}
  </Drawer>
)

// ── Mailbox ──────────────────────────────────────────────────────────────────

export const ComposeForm: React.FC<{ suggestions?: { email: string; name: string }[] }> = ({
  suggestions = [],
}) => (
  <Drawer title="New message" trigger={<Button>Compose</Button>}>
    {(close) => (
      <ActionForm action={composeMessage} onDone={close} submitLabel="Send">
        <div className="space-y-3">
          <Field label="To" hint="If they have a dashboard login, it lands there too.">
            <Input name="to" type="email" required list="crm-contact-suggestions" />
            <datalist id="crm-contact-suggestions">
              {suggestions.map((s) => (
                <option key={s.email} value={s.email}>
                  {s.name}
                </option>
              ))}
            </datalist>
          </Field>
          <Field label="From">
            <Select
              name="mailbox"
              defaultValue="support"
              options={[
                { label: 'support@', value: 'support' },
                { label: 'sales@', value: 'sales' },
                { label: 'info@', value: 'info' },
                { label: 'billing@', value: 'billing' },
              ]}
            />
          </Field>
          <Field label="Subject">
            <Input name="subject" required />
          </Field>
          <Field label="Message">
            <Textarea name="body" rows={8} required />
          </Field>
        </div>
      </ActionForm>
    )}
  </Drawer>
)

// ── Self-service ─────────────────────────────────────────────────────────────

export const ProfileForm: React.FC<{
  side: 'staff' | 'client'
  values: Record<string, string | undefined>
}> = ({ side, values }) => (
  <ActionForm action={updateMyProfile} submitLabel="Save profile">
    <input type="hidden" name="area" value={side} />
    <div className="space-y-3">
      <Field label="Name">
        <Input name="name" defaultValue={values.name} />
      </Field>
      <Field label="Job title">
        <Input name="jobTitle" defaultValue={values.jobTitle} />
      </Field>
      {side === 'client' && (
        <Field label="Company you work for" hint="Your own reference — it does not move your account.">
          <Input name="organization" defaultValue={values.organization} />
        </Field>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Phone">
          <Input name="phone" defaultValue={values.phone} />
        </Field>
        {side === 'client' && (
          <Field label="WhatsApp">
            <Input name="whatsapp" defaultValue={values.whatsapp} />
          </Field>
        )}
      </div>
      {side === 'client' && (
        <>
          <Field label="Address">
            <Textarea name="address" defaultValue={values.address} />
          </Field>
          <Field label="About you">
            <Textarea name="bio" defaultValue={values.bio} />
          </Field>
        </>
      )}
    </div>
  </ActionForm>
)

export const PasswordForm: React.FC<{ side: 'staff' | 'client' }> = ({ side }) => (
  <ActionForm action={changeMyPassword} submitLabel="Change password">
    <input type="hidden" name="area" value={side} />
    <div className="space-y-3">
      <Field label="Current password">
        <Input name="currentPassword" type="password" required autoComplete="current-password" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="New password" hint="At least 10 characters.">
          <Input name="newPassword" type="password" required autoComplete="new-password" />
        </Field>
        <Field label="Confirm new password">
          <Input name="confirmPassword" type="password" required autoComplete="new-password" />
        </Field>
      </div>
    </div>
  </ActionForm>
)

// ── Portal ───────────────────────────────────────────────────────────────────

export const RequestProjectForm: React.FC = () => (
  <Drawer title="Request new work" trigger={<Button>Request new work</Button>}>
    {(close) => (
      <ActionForm action={requestProject} onDone={close} submitLabel="Send request">
        <div className="space-y-3">
          <Field label="What do you need?">
            <Input name="title" required placeholder="New landing page" />
          </Field>
          <Field label="Any detail that would help" hint="Timings, budget, references — anything.">
            <Textarea name="details" rows={6} />
          </Field>
        </div>
      </ActionForm>
    )}
  </Drawer>
)
