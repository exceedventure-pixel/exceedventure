import React from 'react'
import { portalQuery } from '@/crm/data'
import {
  PageHeader,
  Table,
  Badge,
  toneFor,
  humanise,
  EmptyState,
  DateText,
  Money,
  StatCard,
  Card,
} from '@/crm/ui/primitives'
import { Receipt } from 'lucide-react'
import { relId } from '@/crm/parse'

/**
 * Billing history, with what has been paid against each invoice.
 *
 * The old portal showed invoices as a list of amounts with no payment record,
 * so "have we paid this?" was a question for email.
 */
export default async function PortalInvoices() {
  const { payload, as } = await portalQuery()

  const [invoices, payments] = await Promise.all([
    payload.find({ collection: 'invoices', limit: 100, sort: '-issueDate', depth: 0, ...as }),
    payload.find({ collection: 'payments', limit: 200, sort: '-paidAt', depth: 0, ...as }),
  ])

  const paidByInvoice = new Map<string, number>()
  for (const p of payments.docs) {
    const key = String(relId(p.invoice))
    paidByInvoice.set(key, (paidByInvoice.get(key) ?? 0) + (p.amount ?? 0))
  }

  const outstanding = invoices.docs
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.total ?? 0), 0)
  const settled = payments.docs.reduce((sum, p) => sum + (p.amount ?? 0), 0)

  return (
    <>
      <PageHeader icon={<Receipt />} title="Invoices" description="Your billing history with us." />

      <div className="grid grid-cols-2 gap-3 sm:max-w-lg">
        <StatCard
          label="Outstanding"
          value={<Money minor={outstanding} />}
          hint={outstanding === 0 ? 'Nothing due' : undefined}
        />
        <StatCard label="Paid to date" value={<Money minor={settled} />} />
      </div>

      <section className="mt-8">
        {invoices.docs.length === 0 ? (
          <EmptyState title="No invoices yet" description="Invoices will appear here when issued." />
        ) : (
          <Table headers={['Number', 'Status', 'Issued', 'Due', 'Paid', 'Total']}>
            {invoices.docs.map((i) => {
              const paid = paidByInvoice.get(String(i.id)) ?? 0
              return (
                <tr key={i.id} className="hover:bg-muted/40">
                  <td className="px-4 py-2.5 font-medium">{i.number}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={toneFor(i.status)}>{humanise(i.status)}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    <DateText value={i.issueDate} />
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    <DateText value={i.dueDate} />
                  </td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    <Money minor={paid} currency={i.currency} />
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium">
                    <Money minor={i.total} currency={i.currency} />
                  </td>
                </tr>
              )
            })}
          </Table>
        )}
      </section>

      {payments.docs.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold">Payments received</h2>
          <Card className="divide-y divide-border text-sm">
            {payments.docs.slice(0, 20).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span>
                  <span className="font-medium">
                    <Money minor={p.amount} />
                  </span>
                  {p.reference && (
                    <span className="ml-2 text-xs text-muted-foreground">{p.reference}</span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  <DateText value={p.paidAt} />
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}
    </>
  )
}
