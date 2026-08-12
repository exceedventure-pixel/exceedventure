import React from 'react'
import { crmQuery } from '@/crm/data'
import {
  PageHeader,
  StatCard,
  Table,
  Badge,
  humanise,
  EmptyState,
  DateText,
  Money,
} from '@/crm/ui/primitives'
import { SearchBox } from '@/crm/ui/Filters'
import { PaymentForm } from '@/crm/ui/forms'
import { Wallet } from 'lucide-react'
import { DeletePayment } from '@/crm/ui/decisions'
import { relName } from '@/crm/parse'
import type { Where } from 'payload'

/** Money in. Recording one here settles its invoice automatically. */
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const { payload, as } = await crmQuery()

  const filters: Where[] = []
  if (q) filters.push({ reference: { like: q } })

  const [payments, openInvoices, allPayments] = await Promise.all([
    payload.find({
      collection: 'payments',
      where: filters.length ? { and: filters } : undefined,
      limit: 100,
      sort: '-paidAt',
      depth: 1,
      ...as,
    }),
    payload.find({
      collection: 'invoices',
      where: { status: { not_equals: 'paid' } },
      limit: 200,
      sort: '-issueDate',
      depth: 1,
      ...as,
    }),
    // Totals should reflect the whole ledger, not the filtered page.
    payload.find({ collection: 'payments', limit: 500, pagination: false, depth: 0, ...as }),
  ])

  const received = allPayments.docs.reduce((sum, p) => sum + (p.amount ?? 0), 0)
  const thisMonth = allPayments.docs
    .filter((p) => {
      if (!p.paidAt) return false
      const d = new Date(p.paidAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, p) => sum + (p.amount ?? 0), 0)

  const invoiceOptions = openInvoices.docs.map((i) => ({
    label: `${i.number} — ${relName(i.client) || 'No client'}`,
    value: String(i.id),
  }))

  return (
    <>
      <PageHeader
        icon={<Wallet />}
        title="Payments"
        description="Every payment recorded against an invoice."
        action={<PaymentForm invoices={invoiceOptions} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Received all time" value={<Money minor={received} />} />
        <StatCard label="This month" value={<Money minor={thisMonth} />} />
        <StatCard label="Payments" value={allPayments.docs.length} />
        <StatCard
          label="Unpaid invoices"
          value={openInvoices.totalDocs}
          hint={openInvoices.totalDocs > 0 ? 'Still outstanding' : 'All settled'}
        />
      </div>

      <div className="mb-4 mt-8">
        <SearchBox placeholder="Search by reference…" />
      </div>

      {payments.docs.length === 0 ? (
        <EmptyState
          title={q ? 'Nothing matches that' : 'No payments recorded'}
          description={
            q
              ? 'Try a different reference.'
              : 'Record one against an invoice and it will be marked paid for you.'
          }
        />
      ) : (
        <Table headers={['Paid', 'Invoice', 'Client', 'Method', 'Reference', 'Amount', '']}>
          {payments.docs.map((p) => (
            <tr key={p.id} className="hover:bg-muted/40">
              <td className="px-4 py-2.5 text-muted-foreground">
                <DateText value={p.paidAt} />
              </td>
              <td className="px-4 py-2.5 font-medium">
                {relName(p.invoice, 'number') || '—'}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{relName(p.client) || '—'}</td>
              <td className="px-4 py-2.5">
                <Badge>{humanise(p.method)}</Badge>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{p.reference || '—'}</td>
              <td className="px-4 py-2.5 text-right font-medium">
                <Money minor={p.amount} />
              </td>
              <td className="px-4 py-2.5 text-right">
                <DeletePayment id={p.id} />
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  )
}
