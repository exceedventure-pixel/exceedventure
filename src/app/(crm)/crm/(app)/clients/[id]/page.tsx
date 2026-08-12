import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { crmQuery, isWideStaffUser } from '@/crm/data'
import {
  PageHeader,
  Card,
  Table,
  Badge,
  toneFor,
  humanise,
  EmptyState,
  DateText,
  Money,
  StatCard,
} from '@/crm/ui/primitives'
import { ClientForm, ResourceForm, ContactForm, ProjectForm, AssignForm } from '@/crm/ui/forms'
import {
  ClientStatusControl,
  DeleteClient,
  DeleteContact,
  DeleteResource,
} from '@/crm/ui/decisions'
import { MessageThread } from '@/crm/ui/MessageThread'
import { Building2 } from 'lucide-react'
import { relId } from '@/crm/parse'

/**
 * Everything about one client on a single page — the old ClientManager, which
 * was 2,200 lines of modals over the same handful of records.
 */
export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { payload, user, as } = await crmQuery()

  const client = await payload.findByID({ collection: 'clients', id, depth: 0, ...as }).catch(() => null)
  if (!client) notFound()

  const [projects, invoices, contacts, resources, messages, accounts, team, payments] =
    await Promise.all([
      payload.find({ collection: 'projects', where: { client: { equals: id } }, limit: 50, depth: 0, ...as }),
      payload.find({ collection: 'invoices', where: { client: { equals: id } }, limit: 50, sort: '-issueDate', depth: 0, ...as }),
      payload.find({ collection: 'contacts', where: { client: { equals: id } }, limit: 50, depth: 0, ...as }),
      payload.find({ collection: 'resources', where: { client: { equals: id } }, limit: 50, sort: 'order', depth: 0, ...as }),
      payload.find({ collection: 'messages', where: { client: { equals: id } }, limit: 50, sort: 'createdAt', depth: 0, ...as }),
      payload.find({ collection: 'client-accounts', where: { client: { equals: id } }, limit: 20, depth: 0, ...as }),
      payload.find({ collection: 'crm-accounts', limit: 100, sort: 'name', depth: 0, ...as }),
      payload.find({ collection: 'payments', where: { client: { equals: id } }, limit: 100, depth: 0, ...as }),
    ])

  const outstanding = invoices.docs
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + (i.total ?? 0), 0)
  const received = payments.docs.reduce((s, p) => s + (p.amount ?? 0), 0)

  const wide = isWideStaffUser(user)
  const assigned = (client.assignedTo ?? []).map((a) => relId(a)).filter(Boolean) as (string | number)[]
  const assignedNames = team.docs
    .filter((m) => assigned.some((a) => String(a) === String(m.id)))
    .map((m) => m.name || m.email)

  // Resources with a custom section are grouped under that heading; the rest
  // fall into one list, which is how the old five arrays actually read.
  const grouped = new Map<string, typeof resources.docs>()
  for (const r of resources.docs) {
    const key = r.kind === 'custom' && r.section ? r.section : 'Shared with this client'
    grouped.set(key, [...(grouped.get(key) ?? []), r])
  }

  return (
    <>
      <PageHeader
        icon={<Building2 />}
        breadcrumbs={[{ label: 'Clients', href: '/crm/clients' }, { label: client.name }]}
        title={client.name}
        description={[client.code, client.website].filter(Boolean).join(' · ') || undefined}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {wide && (
              <AssignForm
                kind="client"
                id={client.id}
                assigned={assigned}
                team={team.docs.map((m) => ({
                  id: m.id,
                  name: m.name || m.email,
                  role: m.role ?? undefined,
                }))}
              />
            )}
            <ClientForm label="Edit" values={client as never} />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Status"
          value={
            wide ? (
              <ClientStatusControl id={client.id} status={String(client.status ?? 'lead')} />
            ) : (
              <Badge tone={toneFor(client.status)}>{humanise(client.status)}</Badge>
            )
          }
        />
        <StatCard label="Projects" value={projects.totalDocs} />
        <StatCard label="Outstanding" value={<Money minor={outstanding} />} />
        <StatCard label="Received" value={<Money minor={received} />} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Projects</h2>
              <ProjectForm
                label="New project"
                clients={[{ label: client.name, value: String(client.id) }]}
                values={{ client: client.id }}
                lockClient
              />
            </div>
            {projects.docs.length === 0 ? (
              <EmptyState title="No projects" description="Start one for this client." />
            ) : (
              <Table headers={['Project', 'Status', 'Due', 'Value']}>
                {projects.docs.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5">
                      <Link href={`/crm/projects/${p.id}`} className="font-medium hover:text-primary">
                        {p.name}
                      </Link>
                      {p.code && (
                        <div className="text-[11px] text-muted-foreground">{p.code}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={toneFor(p.status)}>{humanise(p.status)}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <DateText value={p.dueDate} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Money minor={p.value} />
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold">Invoices</h2>
            {invoices.docs.length === 0 ? (
              <EmptyState title="No invoices" />
            ) : (
              <Table headers={['Number', 'Status', 'Due', 'Total']}>
                {invoices.docs.map((i) => (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5 font-medium">{i.number}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={toneFor(i.status)}>{humanise(i.status)}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <DateText value={i.dueDate} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">
                      <Money minor={i.total} currency={i.currency} />
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold">Messages</h2>
            <MessageThread
              messages={messages.docs.map((m) => ({
                id: String(m.id),
                body: m.body,
                authorType: (m.authorType as 'staff' | 'client') ?? 'client',
                authorName: m.authorName ?? undefined,
                createdAt: m.createdAt,
              }))}
              clientId={String(client.id)}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold">Contact</h2>
            <Card className="divide-y divide-border text-sm">
              {[
                ['Email', client.email],
                ['Phone', client.phone],
                ['WhatsApp', client.whatsapp],
                ['Address', client.address],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-right">{(value as string) || '—'}</span>
                </div>
              ))}
            </Card>
          </section>

          {assignedNames.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold">Looked after by</h2>
              <Card className="flex flex-wrap gap-1.5 p-3">
                {assignedNames.map((name) => (
                  <Badge key={name} tone="info">
                    {name}
                  </Badge>
                ))}
              </Card>
            </section>
          )}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">People</h2>
              <ContactForm clientId={client.id} />
            </div>
            {contacts.docs.length === 0 ? (
              <EmptyState title="No contacts" />
            ) : (
              <Card className="divide-y divide-border text-sm">
                {contacts.docs.map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{c.name}</span>
                        {c.isPrimary && <Badge tone="info">Main</Badge>}
                      </div>
                      {c.jobTitle && (
                        <div className="text-[11px] text-muted-foreground">{c.jobTitle}</div>
                      )}
                      <div className="truncate text-xs text-muted-foreground">
                        {c.email || c.phone || '—'}
                      </div>
                    </div>
                    <DeleteContact id={c.id} clientId={client.id} />
                  </div>
                ))}
              </Card>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Resources</h2>
              <ResourceForm
                clientId={client.id}
                projects={projects.docs.map((p) => ({ label: p.name, value: String(p.id) }))}
              />
            </div>
            {resources.docs.length === 0 ? (
              <EmptyState title="Nothing shared yet" />
            ) : (
              <div className="space-y-3">
                {[...grouped.entries()].map(([section, items]) => (
                  <div key={section}>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {section}
                    </p>
                    <Card className="divide-y divide-border text-sm">
                      {items.map((r) => (
                        <div key={r.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                          <a
                            href={r.url ?? '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 flex-1 hover:text-primary"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="truncate font-medium">{r.label}</span>
                              <Badge>{humanise(r.kind)}</Badge>
                            </div>
                            {(r.caption || r.notes) && (
                              <div className="truncate text-xs text-muted-foreground">
                                {r.caption || r.notes}
                              </div>
                            )}
                          </a>
                          <DeleteResource id={r.id} clientId={client.id} />
                        </div>
                      ))}
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold">Dashboard logins</h2>
            {accounts.docs.length === 0 ? (
              <EmptyState title="No logins" description="Nobody here has portal access yet." />
            ) : (
              <Card className="divide-y divide-border text-sm">
                {accounts.docs.map((a) => (
                  <div key={a.id} className="px-4 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{a.name || a.email}</span>
                      <Badge tone={toneFor(a.approvalStatus)}>{humanise(a.approvalStatus)}</Badge>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{a.email}</div>
                    {a.deletionRequested && (
                      <div className="mt-1 text-[11px] text-amber-600">
                        Has asked to close their account
                      </div>
                    )}
                  </div>
                ))}
              </Card>
            )}
          </section>

          {wide && (
            <section>
              <h2 className="mb-3 text-sm font-semibold">Danger zone</h2>
              <Card className="border-destructive/30 p-4">
                <p className="mb-3 text-xs text-muted-foreground">
                  Deleting removes this client along with its projects, invoices, payments and
                  messages. There is no undo.
                </p>
                <DeleteClient id={client.id} />
              </Card>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
