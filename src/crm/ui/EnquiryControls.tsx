'use client'

import React from 'react'
import { ActionButton, StatusSelect } from './actions'
import { ActionForm, Drawer, Field, Input, Select, Textarea, Button } from './form'
import {
  setEnquiryStatus,
  assignEnquiry,
  deleteEnquiry,
  replyToEnquiry,
  saveEnquiryNotes,
  convertEnquiry,
} from '@/crm/enquiry-actions'

/** Status and kind vocabularies, shared by the list and the detail screen. */
export const ENQUIRY_STATUS = [
  { label: 'New', value: 'new' },
  { label: 'In progress', value: 'inProgress' },
  { label: 'Responded', value: 'responded' },
  { label: 'Won', value: 'won' },
  { label: 'Closed', value: 'closed' },
  { label: 'Spam', value: 'spam' },
]

export const ENQUIRY_KINDS = [
  { label: 'All', value: '' },
  { label: 'Contact', value: 'contact' },
  { label: 'Messages', value: 'message' },
  { label: 'Pricing', value: 'pricing' },
  { label: 'Quotes', value: 'quote' },
  { label: 'Callbacks', value: 'callback' },
]

export const EnquiryStatusControl: React.FC<{ id: string | number; status: string }> = ({
  id,
  status,
}) => (
  <StatusSelect
    value={status}
    options={ENQUIRY_STATUS}
    onChange={(value) => setEnquiryStatus(String(id), value)}
    success="Enquiry updated."
  />
)

export const EnquiryAssignControl: React.FC<{
  id: string | number
  assignee?: string | number | null
  team: { label: string; value: string }[]
}> = ({ id, assignee, team }) => (
  <StatusSelect
    value={assignee ? String(assignee) : ''}
    options={[{ label: 'Unassigned', value: '' }, ...team]}
    onChange={(value) => assignEnquiry(String(id), value)}
    success="Assigned."
  />
)

export const DeleteEnquiry: React.FC<{ id: string | number }> = ({ id }) => (
  <ActionButton
    tone="danger"
    confirm="Delete this enquiry?"
    success="Enquiry deleted."
    action={() => deleteEnquiry(String(id))}
  >
    Delete
  </ActionButton>
)

/** Replies by email and marks the enquiry responded in one step. */
export const ReplyForm: React.FC<{ id: string | number; to: string }> = ({ id, to }) => (
  <Drawer title="Reply by email" trigger={<Button>Reply</Button>}>
    {(close) => (
      <ActionForm action={replyToEnquiry} onDone={close} submitLabel="Send reply">
        <input type="hidden" name="id" value={id} />
        <div className="space-y-3">
          <Field label="To">
            <Input value={to} readOnly className="bg-muted/50" />
          </Field>
          <Field label="Message" hint="Sending also marks this responded.">
            <Textarea name="body" rows={8} required />
          </Field>
        </div>
      </ActionForm>
    )}
  </Drawer>
)

export const NotesForm: React.FC<{ id: string | number; value?: string }> = ({ id, value }) => (
  <ActionForm action={saveEnquiryNotes} submitLabel="Save notes">
    <input type="hidden" name="id" value={id} />
    <Textarea name="internalNotes" rows={5} defaultValue={value} placeholder="Team-only notes…" />
  </ActionForm>
)

/**
 * Turns an enquiry into a client — either a new company or an existing one.
 *
 * Offering the existing list matters: a returning customer who fills in the
 * contact form again should not become a second client record.
 */
export const ConvertForm: React.FC<{
  id: string | number
  suggestedName: string
  clients: { label: string; value: string }[]
}> = ({ id, suggestedName, clients }) => (
  <Drawer title="Turn into a client" trigger={<Button variant="secondary">Convert</Button>}>
    {(close) => (
      <ActionForm action={convertEnquiry} onDone={close} submitLabel="Convert">
        <input type="hidden" name="id" value={id} />
        <div className="space-y-3">
          <Field label="Existing company" hint="Pick one if they are already a client.">
            <Select name="client" defaultValue="" options={[{ label: '— New company —', value: '' }, ...clients]} />
          </Field>
          <Field label="New company name" hint="Used only when no existing company is chosen.">
            <Input name="name" defaultValue={suggestedName} />
          </Field>
        </div>
      </ActionForm>
    )}
  </Drawer>
)
