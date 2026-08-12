'use client'

import React, { useState } from 'react'
import { ActionForm, Field, Textarea } from './form'
import { requestAccountDeletion } from '@/crm/account-actions'

/**
 * "Close my account", behind one deliberate step.
 *
 * The reason box is optional but asked for, because the answer is usually
 * something worth knowing — and because a two-step makes an irreversible-feeling
 * request harder to fire off by accident.
 */
export const DeletionRequestForm: React.FC = () => {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        Request account closure
      </button>
    )
  }

  return (
    <ActionForm action={requestAccountDeletion} submitLabel="Send request" onDone={() => setOpen(false)}>
      <Field label="Anything you would like to tell us?" hint="Optional.">
        <Textarea name="reason" rows={3} placeholder="We no longer need the dashboard…" />
      </Field>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-3 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        Never mind
      </button>
    </ActionForm>
  )
}
