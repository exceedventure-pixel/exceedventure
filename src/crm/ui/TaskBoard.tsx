'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utilities/ui'
import { setTaskStatus } from '@/crm/actions'

/**
 * Task board — columns by status, click a card to advance it.
 *
 * Deliberately click-to-advance rather than drag-and-drop: it works on touch,
 * it is keyboard reachable, and it needs no drag library. Drag can come later
 * if it earns its place.
 */

export type BoardTask = {
  id: string
  title: string
  status: string
  priority: string
  dueDate?: string
  assignee?: string
}

const COLUMNS = [
  { key: 'todo', label: 'To do' },
  { key: 'inProgress', label: 'In progress' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'done', label: 'Done' },
]

/** Clicking cycles forward through the columns. */
const NEXT: Record<string, string> = {
  todo: 'inProgress',
  inProgress: 'done',
  blocked: 'inProgress',
  done: 'todo',
}

const PRIORITY: Record<string, string> = {
  high: 'bg-red-500/10 text-red-600',
  normal: 'bg-muted text-muted-foreground',
  low: 'bg-muted text-muted-foreground',
}

export const TaskBoard: React.FC<{ tasks: BoardTask[] }> = ({ tasks }) => {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = React.useState<string | null>(null)

  const advance = async (task: BoardTask) => {
    setBusy(task.id)
    await setTaskStatus(task.id, NEXT[task.status] ?? 'todo')
    setBusy(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.key)
        return (
          <div key={col.key} className="rounded-xl border border-border bg-muted/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold">{col.label}</span>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((task) => (
                <button
                  key={task.id}
                  onClick={() => advance(task)}
                  disabled={busy === task.id || pending}
                  title={`Move to ${COLUMNS.find((c) => c.key === NEXT[task.status])?.label}`}
                  className={cn(
                    'w-full rounded-lg border border-border bg-background p-3 text-left transition-shadow hover:shadow-sm disabled:opacity-50',
                  )}
                >
                  <p className="text-sm font-medium">{task.title}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize',
                        PRIORITY[task.priority] ?? PRIORITY.normal,
                      )}
                    >
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    )}
                    {task.assignee && (
                      <span className="ml-auto truncate text-[10px] text-muted-foreground">
                        {task.assignee}
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {items.length === 0 && (
                <p className="py-3 text-center text-[11px] text-muted-foreground">Empty</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
