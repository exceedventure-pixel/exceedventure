import React from 'react'
import Link from 'next/link'
import { Building2, Globe, Mail, Phone } from 'lucide-react'
import { Badge, Card, DateText, Money, toneFor, humanise } from './primitives'

/**
 * Card layouts for the list screens.
 *
 * The table is the default because it is denser and better for looking one
 * thing up. Cards are for browsing — more room per record, so the details you
 * would otherwise have to open the row to see are on the surface.
 *
 * Both views show the same serial and reference code, so a record is
 * identifiable whichever way you are looking at it.
 */

/** The `#` and `CLT-`/`PRJ-` pair, rendered identically in both views. */
export const RecordRef: React.FC<{ serial: number; code?: string | null }> = ({
  serial,
  code,
}) => (
  <span className="flex items-center gap-2 text-[11px] tabular-nums text-muted-foreground">
    <span className="font-semibold">#{serial}</span>
    {code && (
      <>
        <span aria-hidden="true" className="text-muted-foreground/40">
          ·
        </span>
        <span className="font-mono">{code}</span>
      </>
    )}
  </span>
)

export const CardGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
)

export const ClientCard: React.FC<{
  id: string | number
  serial: number
  code?: string | null
  name: string
  status?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  projectCount?: number
  outstanding?: number
}> = ({ id, serial, code, name, status, email, phone, website, projectCount, outstanding }) => (
  <Card className="flex flex-col p-4 transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      <RecordRef serial={serial} code={code} />
      <Badge tone={toneFor(status)}>{humanise(status)}</Badge>
    </div>

    <Link href={`/crm/clients/${id}`} className="mt-2 flex items-start gap-2.5 hover:text-primary">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary"
        style={{ backgroundColor: 'var(--area-tint)' }}
      >
        <Building2 className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium">{name}</span>
        {website && (
          <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Globe className="h-3 w-3 shrink-0" />
            {website}
          </span>
        )}
      </span>
    </Link>

    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
      {email && (
        <p className="flex items-center gap-1.5 truncate">
          <Mail className="h-3 w-3 shrink-0" />
          {email}
        </p>
      )}
      {phone && (
        <p className="flex items-center gap-1.5 truncate">
          <Phone className="h-3 w-3 shrink-0" />
          {phone}
        </p>
      )}
      {!email && !phone && <p className="italic">No contact details</p>}
    </div>

    {(projectCount !== undefined || outstanding !== undefined) && (
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
        {projectCount !== undefined && (
          <span className="text-muted-foreground">
            {projectCount} {projectCount === 1 ? 'project' : 'projects'}
          </span>
        )}
        {outstanding !== undefined && outstanding > 0 && (
          <span className="font-medium">
            <Money minor={outstanding} /> due
          </span>
        )}
      </div>
    )}
  </Card>
)

export const ProjectCard: React.FC<{
  /** Where the title links. Differs by area — /crm/projects vs /portal/projects. */
  href: string
  serial: number
  code?: string | null
  name: string
  clientName?: string
  /** Omitted in the portal, where a client has no client pages to visit. */
  clientHref?: string | null
  status?: string | null
  dueDate?: string | null
  value?: number | null
  summary?: string | null
  /** Hidden from clients, so the portal simply does not pass it. */
  showValue?: boolean
}> = ({
  href,
  serial,
  code,
  name,
  clientName,
  clientHref,
  status,
  dueDate,
  value,
  summary,
  showValue = true,
}) => {
  const overdue =
    Boolean(dueDate) &&
    status !== 'completed' &&
    status !== 'cancelled' &&
    new Date(dueDate!).getTime() < new Date().setHours(0, 0, 0, 0)

  return (
    <Card className="flex flex-col p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <RecordRef serial={serial} code={code} />
        <Badge tone={toneFor(status)}>{humanise(status)}</Badge>
      </div>

      <Link href={href} className="mt-2 block font-medium hover:text-primary">
        {name}
      </Link>

      {summary && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{summary}</p>}

      {clientName && (
        <p className="mt-2 truncate text-xs text-muted-foreground">
          {clientHref ? (
            <Link href={clientHref} className="hover:text-foreground">
              {clientName}
            </Link>
          ) : (
            clientName
          )}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
        <span className="text-muted-foreground">
          {dueDate ? (
            <>
              Due <DateText value={dueDate} overdue={overdue} />
            </>
          ) : (
            'No due date'
          )}
        </span>
        {showValue && value ? (
          <span className="font-medium">
            <Money minor={value} />
          </span>
        ) : null}
      </div>
    </Card>
  )
}
