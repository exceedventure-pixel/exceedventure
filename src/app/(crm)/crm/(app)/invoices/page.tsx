import React from 'react'
import Link from 'next/link'
import { crmQuery } from '@/crm/data'
import {
  PageHeader,
  Table,
  EmptyState,
  DateText,
  Money,
  StatCard,
} from '@/crm/ui/primitives'
import { SearchBox, FilterTabs, Pager } from '@/crm/ui/Filters'
import { InvoiceForm, PaymentForm } from '@/crm/ui/forms'
import { Receipt } from 'lucide-react'
import { InvoiceStatusControl, DeleteInvoice } from '@/crm/ui/decisions'
import { relName } from '@/crm/parse'
import type { Where } from 'payload'

/**
 * Invoices.
 *
 * The headline figures are computed over the whole ledger rather than the
 * visible page — an "outstanding" total that changes when you filter the table
 * is worse than no total at all.
 */

const PAGE_SIZE = 25

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Paid', value: 'paid' },
  { label: 'Void', value: 'void' },
]

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const { q, status, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { payload, as } = await crmQuery()

  const filters: Where[] = []
  if (status) filters.push({ status: { equals: status } })
  if (q) filters.push({ number: { like: q } })

  const [invoices, everything, clientList] = await Promise.all([
    payload.find({
      collection: 'invoices',
      where: filters.length ? { and: filters } : undefined,
      limit: PAGE_SIZE,
      page,
      sort: '-issueDate',
      depth: 1,
      ...as,
    }),
    payload.find({
      collection: 'invoices',
      limit: 1000,
      pagination: false,
      depth: 0,
      ...as,
    }),
    payload.find({ collection: 'clients', limit: 200, sort: 'name', depth: 0, ...as }),
  ])

  const clientOptions = clientList.docs.map((c) => ({ label: c.name, value: String(c.id) }))

  const sum = (predicate: (status?: string | null) => boolean) =>
    everything.docs.filter((i) => predicate(i.status)).reduce((total, i) => total + (i.total ?? 0), 0)

  const outstanding = sum((s) => s === 'sent' || s === 'overdue')
  const paid = sum((s) => s === 'paid')
  const overdue = sum((s) => s === 'overdue')

  const unpaidOptions = everything.docs
    .filter((i) => i.status !== 'paid' && i.status !== 'void')
    .map((i) => ({ label: i.number, value: String(i.id) }))

  return (
    <>
      <PageHeader
        icon={<Receipt />}
        title="Invoices"
        description={`${everything.docs.length} in total.`}
        action={
          <div className="flex items-center gap-2">
            {unpaidOptions.length > 0 && <PaymentForm invoices={unpaidOptions} />}
            <InvoiceForm label="New invoice" clients={clientOptions} />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Outstanding" value={<Money minor={outstanding} />} />
        <StatCard
          label="Overdue"
          value={<Money minor={overdue} />}
          hint={overdue > 0 ? 'Chase these' : 'Nothing late'}
        />
        <StatCard label="Paid" value={<Money minor={paid} />} />
        <StatCard label="Invoices" value={everything.docs.length} />
      </div>

      <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs param="status" options={STATUS_FILTERS} />
        <SearchBox placeholder="Search by number…" />
      </div>

      {invoices.docs.length === 0 ? (
        <EmptyState
          title={q || status ? 'Nothing matches' : 'No invoices yet'}
          description={
            q || status
              ? 'Try a different search or clear the filter.'
              : 'Raise an invoice against a client to see it here.'
          }
        />
      ) : (
        <>
          <Table headers={['Number', 'Client', 'Status', 'Issued', 'Due', 'Total', '']}>
            {invoices.docs.map((i) => {
              const clientId =
                typeof i.client === 'object' && i.client !== null
                  ? (i.client as { id: string | number }).id
                  : i.client
              return (
                <tr key={i.id} className="hover:bg-muted/40">
                  <td className="px-4 py-2.5 font-medium">{i.number}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {clientId ? (
                      <Link href={`/crm/clients/${clientId}`} className="hover:text-primary">
                        {relName(i.client) || '—'}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <InvoiceStatusControl id={i.id} status={String(i.status ?? 'draft')} />
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    <DateText value={i.issueDate} />
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    <DateText value={i.dueDate} />
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium">
                    <Money minor={i.total} currency={i.currency} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <DeleteInvoice id={i.id} />
                  </td>
                </tr>
              )
            })}
          </Table>
          <Pager page={invoices.page ?? 1} totalPages={invoices.totalPages ?? 1} />
        </>
      )}
    </>
  )
}
