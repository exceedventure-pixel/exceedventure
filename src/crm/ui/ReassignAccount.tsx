'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { reassignClientAccount } from '@/crm/account-actions'
import { useToast } from './actions'
import { inputClass } from './form'

/**
 * Moves a dashboard login onto an existing company.
 *
 * Shown inline in the requests table rather than behind a drawer, because it is
 * almost always done in the same breath as approving — a signup creates its own
 * new company by design, and merging it is the step that turns "Acme Ltd" and
 * "acme" into one client.
 */
export const ReassignAccount: React.FC<{
  id: string | number
  current: string
  clients: { label: string; value: string }[]
}> = ({ id, current, clients }) => {
  const router = useRouter()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        title="Move to another company"
        className="text-left text-sm text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
      >
        {current}
      </button>
    )
  }

  const move = async (value: string) => {
    if (!value) return setEditing(false)
    setBusy(true)
    const form = new FormData()
    form.set('id', String(id))
    form.set('client', value)
    const result = await reassignClientAccount(form)
    setBusy(false)
    setEditing(false)

    if (!result.ok) return toast(result.message, 'error')
    toast('Account moved.')
    router.refresh()
  }

  return (
    <select
      autoFocus
      disabled={busy}
      defaultValue=""
      onBlur={() => setEditing(false)}
      onChange={(e) => move(e.target.value)}
      className={`${inputClass} py-1 text-xs`}
    >
      <option value="">Move to…</option>
      {clients.map((c) => (
        <option key={c.value} value={c.value}>
          {c.label}
        </option>
      ))}
    </select>
  )
}
