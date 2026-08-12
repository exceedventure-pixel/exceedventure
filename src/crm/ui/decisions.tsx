'use client'

import React from 'react'
import { ActionButton, ActionChoices, StatusSelect } from './actions'
import {
  setRequestStatus,
  setProjectStatus,
  setInvoiceStatus,
  setClientStatus,
  setTaskStatus,
  deleteProject,
  deleteClient,
  deleteInvoice,
  deleteTask,
  deleteContact,
  deleteResource,
  deletePayment,
  withdrawRequest,
} from '@/crm/actions'
import {
  setClientAccountStatus,
  deleteClientAccount,
  setTeammatePaused,
  setTeammateRole,
  removeTeammate,
  cancelDeletionRequest,
} from '@/crm/account-actions'
import { setConversationFolder, emptyTrash } from '@/crm/mailbox-actions'
import { INVOICE_STATUS, PROJECT_STATUS, TASK_STATUS } from './forms'

/**
 * The decision controls that appear in table rows.
 *
 * Every one is a thin binding of a server action to `ActionButton` /
 * `ActionChoices`, which handle the confirm step, the pending state and the
 * error toast. The old CRM had thirty-odd of these written out individually,
 * each with its own `actionLoading` flag and its own modal — and several with no
 * error branch at all, so a failed write looked exactly like a successful one.
 */

// ── Requests ─────────────────────────────────────────────────────────────────

const REQUEST_NEXT: Record<string, { label: string; value: string; tone?: 'primary' }[]> = {
  new: [
    { label: 'Review', value: 'review' },
    { label: 'Accept', value: 'accepted', tone: 'primary' },
    { label: 'Decline', value: 'declined' },
  ],
  review: [
    { label: 'Accept', value: 'accepted', tone: 'primary' },
    { label: 'Decline', value: 'declined' },
  ],
  accepted: [{ label: 'Reopen', value: 'review' }],
  declined: [{ label: 'Reopen', value: 'review' }],
}

/**
 * Accepting also creates the project — see `setRequestStatus`. The label says
 * "Accept" rather than "Accept & create project" because that is the only thing
 * accepting has ever meant; the old CRM just made you do the second half by hand.
 */
export const RequestDecision: React.FC<{ id: string | number; status: string }> = ({
  id,
  status,
}) => (
  <ActionChoices
    options={REQUEST_NEXT[status] ?? REQUEST_NEXT.new!}
    onChoose={(value) => setRequestStatus(String(id), value)}
    success="Request updated."
  />
)

export const WithdrawRequest: React.FC<{ id: string | number }> = ({ id }) => (
  <ActionButton
    tone="danger"
    confirm="Withdraw?"
    success="Request withdrawn."
    action={() => withdrawRequest(String(id))}
  >
    Withdraw
  </ActionButton>
)

// ── Client accounts ──────────────────────────────────────────────────────────

const ACCOUNT_NEXT: Record<string, { label: string; value: string; tone?: 'primary' }[]> = {
  pending: [
    { label: 'Approve', value: 'active', tone: 'primary' },
    { label: 'Reject', value: 'rejected' },
  ],
  active: [{ label: 'Pause', value: 'paused' }],
  paused: [{ label: 'Restore', value: 'active', tone: 'primary' }],
  rejected: [{ label: 'Approve', value: 'active', tone: 'primary' }],
}

export const AccountDecision: React.FC<{ id: string | number; status: string }> = ({
  id,
  status,
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <ActionChoices
      options={ACCOUNT_NEXT[status] ?? ACCOUNT_NEXT.pending!}
      onChoose={(value) => setClientAccountStatus(String(id), value)}
      success="Account updated."
    />
    <ActionButton
      tone="danger"
      confirm="Delete login?"
      success="Login removed."
      action={() => deleteClientAccount(String(id))}
    >
      Delete
    </ActionButton>
  </div>
)

export const CancelDeletionRequest: React.FC = () => (
  <ActionButton success="Deletion request cancelled." action={() => cancelDeletionRequest()}>
    Cancel deletion request
  </ActionButton>
)

// ── Statuses ─────────────────────────────────────────────────────────────────

export const ProjectStatusControl: React.FC<{ id: string | number; status: string }> = ({
  id,
  status,
}) => (
  <StatusSelect
    value={status}
    options={PROJECT_STATUS}
    onChange={(value) => setProjectStatus(String(id), value)}
    success="Status updated — the client has been told."
  />
)

export const InvoiceStatusControl: React.FC<{ id: string | number; status: string }> = ({
  id,
  status,
}) => (
  <StatusSelect
    value={status}
    options={INVOICE_STATUS}
    onChange={(value) => setInvoiceStatus(String(id), value)}
    success="Invoice updated."
  />
)

export const ClientStatusControl: React.FC<{ id: string | number; status: string }> = ({
  id,
  status,
}) => (
  <StatusSelect
    value={status}
    options={[
      { label: 'Lead', value: 'lead' },
      { label: 'Proposal', value: 'proposal' },
      { label: 'Active', value: 'active' },
      { label: 'On hold', value: 'onHold' },
      { label: 'Former', value: 'former' },
    ]}
    onChange={(value) => setClientStatus(String(id), value)}
    success="Client updated."
  />
)

export const TaskStatusControl: React.FC<{ id: string | number; status: string }> = ({
  id,
  status,
}) => (
  <StatusSelect
    value={status}
    options={TASK_STATUS}
    onChange={(value) => setTaskStatus(String(id), value)}
  />
)

// ── Deletions ────────────────────────────────────────────────────────────────

export const DeleteProject: React.FC<{ id: string | number }> = ({ id }) => (
  <ActionButton
    tone="danger"
    confirm="Delete project and its tasks?"
    success="Project deleted."
    action={() => deleteProject(String(id))}
  >
    Delete
  </ActionButton>
)

export const DeleteClient: React.FC<{ id: string | number }> = ({ id }) => (
  <ActionButton
    tone="danger"
    confirm="Delete this client and everything on it?"
    success="Client deleted."
    action={() => deleteClient(String(id))}
  >
    Delete client
  </ActionButton>
)

export const DeleteInvoice: React.FC<{ id: string | number }> = ({ id }) => (
  <ActionButton
    tone="danger"
    confirm="Delete invoice?"
    success="Invoice deleted."
    action={() => deleteInvoice(String(id))}
  >
    Delete
  </ActionButton>
)

export const DeleteTask: React.FC<{ id: string | number }> = ({ id }) => (
  <ActionButton tone="danger" confirm="Delete?" action={() => deleteTask(String(id))}>
    Delete
  </ActionButton>
)

export const DeleteContact: React.FC<{ id: string | number; clientId: string | number }> = ({
  id,
  clientId,
}) => (
  <ActionButton
    tone="danger"
    confirm="Remove?"
    action={() => deleteContact(String(id), String(clientId))}
  >
    Remove
  </ActionButton>
)

export const DeleteResource: React.FC<{ id: string | number; clientId: string | number }> = ({
  id,
  clientId,
}) => (
  <ActionButton
    tone="danger"
    confirm="Remove?"
    action={() => deleteResource(String(id), String(clientId))}
  >
    Remove
  </ActionButton>
)

export const DeletePayment: React.FC<{ id: string | number }> = ({ id }) => (
  <ActionButton tone="danger" confirm="Delete payment?" action={() => deletePayment(String(id))}>
    Delete
  </ActionButton>
)

// ── Team ─────────────────────────────────────────────────────────────────────

export const TeamControls: React.FC<{
  id: string | number
  role: string
  paused: boolean
  /** Their own row: role and pause are refused server-side, so don't offer them. */
  isSelf: boolean
}> = ({ id, role, paused, isSelf }) => {
  if (isSelf) return <span className="text-xs text-muted-foreground">This is you</span>

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusSelect
        value={role}
        options={[
          { label: 'Member', value: 'member' },
          { label: 'Manager', value: 'manager' },
          { label: 'Admin', value: 'admin' },
        ]}
        onChange={(value) => setTeammateRole(String(id), value)}
        success="Role updated."
      />
      <ActionButton
        success={paused ? 'Access restored.' : 'Access paused.'}
        action={() => setTeammatePaused(String(id), !paused)}
      >
        {paused ? 'Restore' : 'Pause'}
      </ActionButton>
      <ActionButton
        tone="danger"
        confirm="Remove teammate?"
        success="Teammate removed."
        action={() => removeTeammate(String(id))}
      >
        Remove
      </ActionButton>
    </div>
  )
}

// ── Mailbox ──────────────────────────────────────────────────────────────────

export const ConversationControls: React.FC<{ id: string | number; folder: string }> = ({
  id,
  folder,
}) => {
  const options =
    folder === 'trash'
      ? [
          { label: 'Restore', value: 'inbox' },
          { label: 'Archive', value: 'archived' },
        ]
      : folder === 'archived'
        ? [
            { label: 'Move to inbox', value: 'inbox' },
            { label: 'Trash', value: 'trash' },
          ]
        : [
            { label: 'Archive', value: 'archived' },
            { label: 'Trash', value: 'trash' },
          ]

  return (
    <ActionChoices
      options={options}
      onChoose={(value) => setConversationFolder(String(id), value)}
      success="Moved."
    />
  )
}

export const EmptyTrashButton: React.FC = () => (
  <ActionButton
    tone="danger"
    confirm="Permanently delete everything in trash?"
    success="Trash emptied."
    action={() => emptyTrash()}
  >
    Empty trash
  </ActionButton>
)
