import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Inbox } from 'lucide-react'
import { crmQuery } from '@/crm/data'
import {
  PageHeader,
  Card,
  Section,
  Badge,
  toneFor,
  humanise,
  DateText,
} from '@/crm/ui/primitives'
import {
  EnquiryStatusControl,
  EnquiryAssignControl,
  DeleteEnquiry,
  ReplyForm,
  NotesForm,
  ConvertForm,
} from '@/crm/ui/EnquiryControls'
import { relId, relName } from '@/crm/parse'

/** One enquiry: what they said, and everything you can do about it. */
export default async function EnquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { payload, as } = await crmQuery()

  const enquiry = await payload
    .findByID({ collection: 'enquiries', id, depth: 1, ...as })
    .catch(() => null)
  if (!enquiry) notFound()

  const [team, clients] = await Promise.all([
    payload.find({ collection: 'crm-accounts', limit: 100, sort: 'name', depth: 0, ...as }),
    payload.find({ collection: 'clients', limit: 200, sort: 'name', depth: 0, ...as }),
  ])

  const teamOptions = team.docs.map((m) => ({ label: m.name || m.email, value: String(m.id) }))
  const clientOptions = clients.docs.map((c) => ({ label: c.name, value: String(c.id) }))

  // Whatever a form sent beyond the standard fields — budget, services, and
  // anything a future pricing form decides to collect.
  const extra =
    enquiry.details && typeof enquiry.details === 'object'
      ? Object.entries(enquiry.details as Record<string, unknown>)
      : []

  const linkedClientId = relId(enquiry.client)

  return (
    <>
      <PageHeader
        icon={<Inbox />}
        breadcrumbs={[
          { label: 'Enquiries', href: '/crm/enquiries' },
          { label: enquiry.name || enquiry.email || 'Enquiry' },
        ]}
        title={enquiry.subject || `${humanise(enquiry.kind)} from ${enquiry.name || enquiry.email}`}
        description={
          enquiry.createdAt
            ? `Received ${new Date(enquiry.createdAt).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : undefined
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {enquiry.email && <ReplyForm id={enquiry.id} to={enquiry.email} />}
            {!linkedClientId && (
              <ConvertForm
                id={enquiry.id}
                suggestedName={enquiry.company || enquiry.name || ''}
                clients={clientOptions}
              />
            )}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="What they sent">
            <Card className="p-5">
              {enquiry.message ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{enquiry.message}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground">No message body.</p>
              )}
            </Card>
          </Section>

          {extra.length > 0 && (
            <Section
              title="Form details"
              description="Extra fields this particular form collected."
            >
              <Card className="divide-y divide-border text-sm">
                {extra.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 px-4 py-2.5">
                    <span className="capitalize text-muted-foreground">
                      {key.replace(/[_-]/g, ' ')}
                    </span>
                    <span className="text-right font-medium">{String(value)}</span>
                  </div>
                ))}
              </Card>
            </Section>
          )}

          <Section title="Internal notes" description="Team only — never sent to the enquirer.">
            <Card className="p-5">
              <NotesForm id={enquiry.id} value={enquiry.internalNotes ?? undefined} />
            </Card>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Handling">
            <Card className="space-y-3 p-4">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Status</p>
                <EnquiryStatusControl id={enquiry.id} status={String(enquiry.status ?? 'new')} />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Assigned to</p>
                <EnquiryAssignControl
                  id={enquiry.id}
                  assignee={relId(enquiry.assignedTo)}
                  team={teamOptions}
                />
              </div>
              {enquiry.respondedAt && (
                <p className="text-[11px] text-muted-foreground">
                  Responded <DateText value={enquiry.respondedAt} />
                </p>
              )}
            </Card>
          </Section>

          <Section title="Contact">
            <Card className="divide-y divide-border text-sm">
              {[
                ['Type', humanise(enquiry.kind)],
                ['Name', enquiry.name],
                ['Email', enquiry.email],
                ['Phone', enquiry.phone],
                ['Company', enquiry.company],
                ['Page', enquiry.source],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="max-w-[60%] truncate text-right">
                    {label === 'Email' && value ? (
                      <a href={`mailto:${value}`} className="hover:text-primary">
                        {value as string}
                      </a>
                    ) : (
                      (value as string) || '—'
                    )}
                  </span>
                </div>
              ))}
            </Card>
          </Section>

          {linkedClientId && (
            <Section title="Client">
              <Card className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Badge tone={toneFor('won')}>Converted</Badge>
                  <p className="mt-1.5 truncate text-sm font-medium">
                    {relName(enquiry.client) || 'Client'}
                  </p>
                </div>
                <Link
                  href={`/crm/clients/${linkedClientId}`}
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                >
                  Open →
                </Link>
              </Card>
            </Section>
          )}

          <Section title="Danger zone">
            <Card className="border-destructive/30 p-4">
              <p className="mb-3 text-xs text-muted-foreground">
                Spam is better marked than deleted — it keeps the record without cluttering the
                list.
              </p>
              <DeleteEnquiry id={enquiry.id} />
            </Card>
          </Section>
        </div>
      </div>
    </>
  )
}
