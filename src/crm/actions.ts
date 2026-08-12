'use server'

import { revalidatePath } from 'next/cache'
import { crmQuery, clientIdOf, isStaffUser } from './data'
import { notifyClient, notifyStaff } from './notify'
import {
  fail,
  formatMoney,
  humaniseValue,
  ids,
  money,
  num,
  optional,
  relId,
  relName,
  str,
  type ActionResult,
} from './parse'

/**
 * Mutations for the CRM and portal.
 *
 * Every call goes through `crmQuery`, which carries `overrideAccess: false`, so
 * collection access control decides what each account may write — these actions
 * add convenience, never privilege. A client calling the project-request action
 * still cannot set its own status, because that field is staff-only.
 *
 * Notifications are raised *after* the write succeeds and are never awaited into
 * the result: a mail outage must not turn a saved invoice into an error.
 *
 * Enum fields arrive from forms as plain strings. Payload validates them against
 * the collection on write and throws a ValidationError for anything invalid, so
 * the casts below are safe at this boundary.
 */

// ── Clients ──────────────────────────────────────────────────────────────────

export async function saveClient(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const id = str(form.get('id'))
    const data = {
      name: str(form.get('name')),
      status: optional(str(form.get('status'))),
      website: optional(str(form.get('website'))),
      email: optional(str(form.get('email'))),
      phone: optional(str(form.get('phone'))),
      whatsapp: optional(str(form.get('whatsapp'))),
      address: optional(str(form.get('address'))),
      notes: optional(str(form.get('notes'))),
    }

    if (!data.name) return { ok: false, message: 'A company name is required.' }

    const saved = id
      ? await payload.update({ collection: 'clients', id, data: data as never, ...as })
      : await payload.create({ collection: 'clients', data: data as never, ...as })

    revalidatePath('/crm/clients')
    if (id) revalidatePath(`/crm/clients/${id}`)
    return { ok: true, id: saved.id }
  } catch (err) {
    return fail(err)
  }
}

export async function setClientStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    await payload.update({ collection: 'clients', id, data: { status } as never, ...as })
    revalidatePath('/crm/clients')
    revalidatePath(`/crm/clients/${id}`)
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

/**
 * Who looks after this client. Assignment is what a member's whole view hangs
 * off, so it is a staff-only field and this action only reaches it for staff.
 */
export async function assignClientMembers(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const id = str(form.get('id'))
    if (!id) return { ok: false, message: 'Missing client.' }

    await payload.update({
      collection: 'clients',
      id,
      data: { assignedTo: ids(form.getAll('assignedTo')) } as never,
      ...as,
    })

    revalidatePath('/crm/clients')
    revalidatePath(`/crm/clients/${id}`)
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

/**
 * Removes a client and everything hanging off it.
 *
 * Postgres would refuse the delete while invoices still reference the row, so
 * the children go first. The old CRM deleted the client document alone and left
 * orphaned projects that showed up in lists with a blank company name.
 */
export async function deleteClient(id: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()

    for (const collection of [
      'payments',
      'invoices',
      'resources',
      'messages',
      'project-requests',
      'contacts',
      'conversations',
      'projects',
    ] as const) {
      await payload.delete({
        collection,
        where: { client: { equals: id } },
        ...as,
      })
    }

    await payload.delete({ collection: 'clients', id, ...as })

    revalidatePath('/crm/clients')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

// ── Projects ─────────────────────────────────────────────────────────────────

export async function saveProject(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const id = str(form.get('id'))
    const data = {
      name: str(form.get('name')),
      client: num(form.get('client')),
      status: optional(str(form.get('status'))),
      startDate: optional(str(form.get('startDate'))),
      dueDate: optional(str(form.get('dueDate'))),
      value: money(form.get('value')),
      summary: optional(str(form.get('summary'))),
      scopeOfWork: optional(str(form.get('scopeOfWork'))),
      internalNotes: optional(str(form.get('internalNotes'))),
    }

    if (!data.name) return { ok: false, message: 'A project name is required.' }
    if (!data.client) return { ok: false, message: 'Choose a client.' }

    if (id) {
      await payload.update({ collection: 'projects', id, data: data as never, ...as })
      revalidatePath(`/crm/projects/${id}`)
    } else {
      const created = await payload.create({
        collection: 'projects',
        data: data as never,
        ...as,
      })

      // Only a brand-new project is news worth sending.
      void notifyClient(
        {
          payload,
          clientId: data.client,
          type: 'projectCreated',
          title: 'New project created',
          message: `We have set up “${data.name}” for you.`,
          link: `/portal/projects/${created.id}`,
          meta: { projectId: created.id },
        },
        (name) => ({
          type: 'projectCreated',
          name,
          projectTitle: data.name,
          projectId: created.id,
        }),
      )
    }

    revalidatePath('/crm/projects')
    revalidatePath('/portal/projects')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function setProjectStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const project = await payload.update({
      collection: 'projects',
      id,
      data: { status } as never,
      depth: 1,
      ...as,
    })

    const clientId = relId(project.client)
    if (clientId) {
      const readable = humaniseValue(status)
      void notifyClient(
        {
          payload,
          clientId,
          type: 'projectStatusChanged',
          title: `${project.name} is now ${readable}`,
          message: `The status of your project changed to ${readable}.`,
          link: `/portal/projects/${id}`,
          meta: { projectId: id, status },
        },
        (name) => ({
          type: 'projectStatusChanged',
          name,
          projectTitle: project.name,
          status: readable,
          projectId: id,
        }),
      )
    }

    revalidatePath('/crm/projects')
    revalidatePath(`/crm/projects/${id}`)
    revalidatePath('/portal/projects')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function assignProjectMembers(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const id = str(form.get('id'))
    if (!id) return { ok: false, message: 'Missing project.' }

    await payload.update({
      collection: 'projects',
      id,
      data: { assignedTo: ids(form.getAll('assignedTo')) } as never,
      ...as,
    })

    revalidatePath('/crm/projects')
    revalidatePath(`/crm/projects/${id}`)
    revalidatePath('/crm/my-work')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()

    // Same ordering rule as deleting a client: children before parent.
    await payload.delete({ collection: 'tasks', where: { project: { equals: id } }, ...as })
    await payload.delete({ collection: 'projects', id, ...as })

    revalidatePath('/crm/projects')
    revalidatePath('/portal/projects')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

// ── Tasks ────────────────────────────────────────────────────────────────────

export async function saveTask(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const id = str(form.get('id'))
    const assignee = num(form.get('assignee'))
    const data = {
      title: str(form.get('title')),
      project: num(form.get('project')),
      status: optional(str(form.get('status'))),
      priority: optional(str(form.get('priority'))),
      dueDate: optional(str(form.get('dueDate'))),
      notes: optional(str(form.get('notes'))),
      ...(assignee ? { assignee } : {}),
    }
    if (!data.title) return { ok: false, message: 'A task title is required.' }
    if (!data.project) return { ok: false, message: 'A task needs a project.' }

    if (id) await payload.update({ collection: 'tasks', id, data: data as never, ...as })
    else await payload.create({ collection: 'tasks', data: data as never, ...as })

    revalidatePath(`/crm/projects/${data.project}`)
    revalidatePath('/crm/my-work')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function setTaskStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const task = await payload.update({
      collection: 'tasks',
      id,
      data: { status } as never,
      ...as,
    })
    revalidatePath(`/crm/projects/${relId(task.project) ?? ''}`)
    revalidatePath('/crm/my-work')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const task = await payload.findByID({ collection: 'tasks', id, depth: 0, ...as })
    await payload.delete({ collection: 'tasks', id, ...as })
    revalidatePath(`/crm/projects/${relId(task.project) ?? ''}`)
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

// ── Invoices ─────────────────────────────────────────────────────────────────

export async function saveInvoice(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const id = str(form.get('id'))

    // Line items arrive as parallel arrays from the repeatable form rows.
    const descriptions = form.getAll('lineDescription').map((v) => str(v))
    const quantities = form.getAll('lineQuantity').map((v) => num(v) ?? 0)
    const amounts = form.getAll('lineAmount').map((v) => money(v) ?? 0)

    const lineItems = descriptions
      .map((description, i) => ({
        description,
        quantity: quantities[i] ?? 0,
        unitAmount: amounts[i] ?? 0,
      }))
      // Blank rows are how people leave an unused slot — drop them silently.
      .filter((l) => l.description !== '')

    if (lineItems.length === 0) return { ok: false, message: 'Add at least one line item.' }

    const projectId = num(form.get('project'))
    const status = optional(str(form.get('status')))
    const data = {
      number: str(form.get('number')),
      client: num(form.get('client')),
      ...(projectId ? { project: projectId } : {}),
      status,
      issueDate: optional(str(form.get('issueDate'))),
      dueDate: optional(str(form.get('dueDate'))),
      currency: optional(str(form.get('currency'))) ?? 'GBP',
      taxRate: num(form.get('taxRate')) ?? 0,
      notes: optional(str(form.get('notes'))),
      lineItems,
      // subtotal/tax/total are deliberately absent — the collection's
      // beforeChange hook computes them and ignores anything sent.
    }

    if (!data.number) return { ok: false, message: 'An invoice number is required.' }
    if (!data.client) return { ok: false, message: 'Choose a client.' }

    const saved = id
      ? await payload.update({ collection: 'invoices', id, data: data as never, ...as })
      : await payload.create({ collection: 'invoices', data: data as never, ...as })

    // A draft is not news; a sent invoice is. Only tell the client once it is
    // actually issued, which is the moment they owe something.
    if (!id && status === 'sent' && data.client) {
      void notifyClient(
        {
          payload,
          clientId: data.client,
          type: 'invoiceIssued',
          title: `Invoice ${data.number}`,
          message: `A new invoice for ${formatMoney(saved.total, saved.currency)} is available.`,
          link: '/portal/invoices',
          meta: { invoiceId: saved.id },
        },
        (name) => ({
          type: 'invoiceIssued',
          name,
          number: data.number,
          amount: formatMoney(saved.total, saved.currency),
          dueDate: data.dueDate,
        }),
      )
    }

    revalidatePath('/crm/invoices')
    revalidatePath('/portal/invoices')
    return { ok: true, id: saved.id }
  } catch (err) {
    return fail(err)
  }
}

export async function setInvoiceStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const invoice = await payload.update({
      collection: 'invoices',
      id,
      data: { status } as never,
      depth: 1,
      ...as,
    })

    const clientId = relId(invoice.client)
    // 'draft' and 'void' are internal bookkeeping; the rest are worth an email.
    if (clientId && status !== 'draft' && status !== 'void') {
      void notifyClient(
        {
          payload,
          clientId,
          type: status === 'sent' ? 'invoiceIssued' : 'invoiceUpdated',
          title: `Invoice ${invoice.number} is now ${humaniseValue(status)}`,
          link: '/portal/invoices',
          meta: { invoiceId: id, status },
        },
        (name) => ({
          type: 'invoiceUpdated',
          name,
          number: invoice.number,
          status: humaniseValue(status),
        }),
      )
    }

    revalidatePath('/crm/invoices')
    revalidatePath('/portal/invoices')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    await payload.delete({ collection: 'payments', where: { invoice: { equals: id } }, ...as })
    await payload.delete({ collection: 'invoices', id, ...as })
    revalidatePath('/crm/invoices')
    revalidatePath('/crm/payments')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

// ── Payments ─────────────────────────────────────────────────────────────────

/**
 * Records money received and settles the invoice when it is covered.
 *
 * `client` is copied from the invoice rather than taken from the form: it is
 * what portal scoping filters on, so it must agree with the invoice or a payment
 * could surface under the wrong company.
 */
export async function recordPayment(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()

    const invoiceId = num(form.get('invoice'))
    const amount = money(form.get('amount'))
    if (!invoiceId) return { ok: false, message: 'Choose an invoice.' }
    if (!amount || amount <= 0) return { ok: false, message: 'Enter an amount.' }

    const invoice = await payload.findByID({
      collection: 'invoices',
      id: invoiceId,
      depth: 0,
      ...as,
    })
    const clientId = relId(invoice.client)
    if (!clientId) return { ok: false, message: 'That invoice has no client.' }

    await payload.create({
      collection: 'payments',
      data: {
        invoice: invoiceId,
        client: clientId,
        amount,
        reference: optional(str(form.get('reference'))),
        paidAt: optional(str(form.get('paidAt'))) ?? new Date().toISOString(),
        method: optional(str(form.get('method'))) ?? 'bankTransfer',
        notes: optional(str(form.get('notes'))),
      } as never,
      ...as,
    })

    // Settle the invoice automatically once payments cover the total, so nobody
    // has to remember the second step.
    const paid = await payload.find({
      collection: 'payments',
      where: { invoice: { equals: invoiceId } },
      limit: 200,
      depth: 0,
      pagination: false,
      ...as,
    })
    const settled = paid.docs.reduce((sum, p) => sum + (p.amount ?? 0), 0)
    if (settled >= (invoice.total ?? 0) && invoice.status !== 'paid') {
      await payload.update({
        collection: 'invoices',
        id: invoiceId,
        data: { status: 'paid' } as never,
        ...as,
      })
    }

    void notifyClient(
      {
        payload,
        clientId,
        type: 'paymentRecorded',
        title: `Payment received for ${invoice.number}`,
        message: `We have recorded ${formatMoney(amount, invoice.currency)}.`,
        link: '/portal/invoices',
        meta: { invoiceId },
      },
      (name) => ({
        type: 'paymentRecorded',
        name,
        number: invoice.number,
        amount: formatMoney(amount, invoice.currency),
      }),
    )

    revalidatePath('/crm/payments')
    revalidatePath('/crm/invoices')
    revalidatePath('/portal/invoices')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function deletePayment(id: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    await payload.delete({ collection: 'payments', id, ...as })
    revalidatePath('/crm/payments')
    revalidatePath('/crm/invoices')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

// ── Contacts ─────────────────────────────────────────────────────────────────

export async function saveContact(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const id = str(form.get('id'))
    const data = {
      name: str(form.get('name')),
      client: num(form.get('client')),
      email: optional(str(form.get('email'))),
      phone: optional(str(form.get('phone'))),
      jobTitle: optional(str(form.get('jobTitle'))),
      isPrimary: str(form.get('isPrimary')) !== '',
      notes: optional(str(form.get('notes'))),
    }
    if (!data.name) return { ok: false, message: 'A name is required.' }
    if (!data.client) return { ok: false, message: 'Choose a client.' }

    if (id) await payload.update({ collection: 'contacts', id, data: data as never, ...as })
    else await payload.create({ collection: 'contacts', data: data as never, ...as })

    revalidatePath(`/crm/clients/${data.client}`)
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function deleteContact(id: string, clientId: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    await payload.delete({ collection: 'contacts', id, ...as })
    revalidatePath(`/crm/clients/${clientId}`)
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

// ── Project requests (raised by clients) ─────────────────────────────────────

export async function requestProject(form: FormData): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery('client-accounts')

    // The client id comes from the signed-in account, never the form — the same
    // rule as signup. Otherwise a request could be filed against another company.
    const clientId = clientIdOf(user)
    if (!clientId) return { ok: false, message: 'No client attached to this account.' }

    const title = str(form.get('title'))
    if (!title) return { ok: false, message: 'Give the request a title.' }
    const details = optional(str(form.get('details')))

    await payload.create({
      collection: 'project-requests',
      data: { title, details, client: clientId } as never,
      ...as,
    })

    const company =
      (await payload
        .findByID({ collection: 'clients', id: clientId, depth: 0, overrideAccess: true })
        .then((c) => c.name)
        .catch(() => '')) || (user?.name ?? user?.email ?? 'A client')

    void notifyStaff(
      {
        payload,
        type: 'projectRequested',
        title: 'New project request',
        message: `${company} asked for “${title}”.`,
        link: '/crm/requests',
        meta: { clientId, title },
      },
      { type: 'staffProjectRequest', clientName: company, projectTitle: title, details },
    )

    revalidatePath('/portal/requests')
    revalidatePath('/crm/requests')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

/**
 * A decision on a request. Accepting also creates the project, which is the
 * step the old CRM left to whoever remembered — the request there just changed
 * colour and someone typed the project in again by hand.
 */
export async function setRequestStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()

    const request = await payload.findByID({
      collection: 'project-requests',
      id,
      depth: 0,
      ...as,
    })
    const clientId = relId(request.client)

    let projectId = relId(request.project)

    if (status === 'accepted' && !projectId && clientId) {
      const project = await payload.create({
        collection: 'projects',
        data: {
          name: request.title,
          client: clientId,
          status: 'notStarted',
          summary: request.details ?? undefined,
        } as never,
        ...as,
      })
      projectId = project.id
    }

    await payload.update({
      collection: 'project-requests',
      id,
      data: { status, ...(projectId ? { project: projectId } : {}) } as never,
      ...as,
    })

    if (clientId && (status === 'accepted' || status === 'declined')) {
      const accepted = status === 'accepted'
      void notifyClient(
        {
          payload,
          clientId,
          type: accepted ? 'projectApproved' : 'projectDeclined',
          title: accepted ? 'Project request approved' : 'Project request update',
          message: accepted
            ? `“${request.title}” has been approved and is now active.`
            : `We could not take on “${request.title}” as requested.`,
          link: accepted && projectId ? `/portal/projects/${projectId}` : '/portal/requests',
          meta: { requestId: id, projectId },
        },
        (name) =>
          accepted
            ? {
                type: 'projectApproved',
                name,
                projectTitle: request.title,
                projectId: projectId ?? '',
              }
            : { type: 'projectDeclined', name, projectTitle: request.title },
      )
    }

    revalidatePath('/crm/requests')
    revalidatePath('/crm/projects')
    revalidatePath('/portal/requests')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

/**
 * A client withdrawing their own request — the old portal's "cancel request".
 *
 * Only while it is still open: once your team has decided, the record stays, so
 * the decision cannot be erased by the person it went against.
 */
export async function withdrawRequest(id: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery('client-accounts')

    const request = await payload.findByID({
      collection: 'project-requests',
      id,
      depth: 0,
      ...as,
    })
    if (request.status !== 'new' && request.status !== 'review') {
      return { ok: false, message: 'This request has already been decided.' }
    }

    await payload.delete({ collection: 'project-requests', id, ...as })

    revalidatePath('/portal/requests')
    revalidatePath('/crm/requests')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

// ── Messages ─────────────────────────────────────────────────────────────────

/**
 * Posts into a client's thread from either side.
 *
 * A conversation is created on first use, so neither side has to think about
 * threads: the portal has exactly one, and it appears in the team mailbox the
 * moment a client writes.
 */
export async function sendMessage(form: FormData): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery('any')

    const body = str(form.get('body'))
    if (!body) return { ok: false, message: 'Write a message first.' }

    const staff = isStaffUser(user)
    const clientId = staff ? num(form.get('client')) : clientIdOf(user)
    if (!clientId) return { ok: false, message: 'No client for this message.' }

    const company =
      (await payload
        .findByID({ collection: 'clients', id: clientId, depth: 0, overrideAccess: true })
        .then((c) => c.name)
        .catch(() => '')) || 'Client'

    // One thread per client for portal traffic. Found by client rather than by
    // id from the form, so a client cannot post into somebody else's thread.
    const existing = await payload.find({
      collection: 'conversations',
      where: { client: { equals: clientId } },
      sort: '-lastMessageAt',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const preview = body.slice(0, 140)
    const now = new Date().toISOString()

    let conversationId = existing.docs[0]?.id
    if (conversationId) {
      await payload.update({
        collection: 'conversations',
        id: conversationId,
        data: {
          lastMessageAt: now,
          lastMessagePreview: preview,
          // Only a client writing makes it unread for the team.
          unread: !staff,
          folder: 'inbox',
        } as never,
        overrideAccess: true,
      })
    } else {
      const created = await payload.create({
        collection: 'conversations',
        data: {
          subject: `${company} — dashboard`,
          client: clientId,
          mailbox: 'support',
          folder: 'inbox',
          unread: !staff,
          lastMessageAt: now,
          lastMessagePreview: preview,
        } as never,
        overrideAccess: true,
      })
      conversationId = created.id
    }

    await payload.create({
      collection: 'messages',
      data: {
        conversation: conversationId,
        client: clientId,
        body,
        // Staff-only field, so a client cannot post as the team.
        authorType: staff ? 'staff' : 'client',
        authorName: user?.name || user?.email,
        direction: staff ? 'outbound' : 'inbound',
        readByStaff: staff,
      } as never,
      ...as,
    })

    if (staff) {
      void notifyClient(
        {
          payload,
          clientId,
          type: 'messageReceived',
          title: 'New message from the team',
          message: preview,
          link: '/portal/messages',
          meta: { conversationId },
        },
        (name) => ({
          type: 'messageReceived',
          name,
          from: user?.name || 'Exceed Venture',
          preview,
        }),
      )
    } else {
      void notifyStaff(
        {
          payload,
          type: 'messageReceived',
          title: `New message from ${company}`,
          message: preview,
          link: '/crm/mailbox',
          meta: { conversationId, clientId },
        },
        { type: 'staffNewMessage', clientName: company, preview },
      )
    }

    revalidatePath('/portal/messages')
    revalidatePath('/crm/mailbox')
    revalidatePath(`/crm/clients/${clientId}`)
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

// ── Resources ────────────────────────────────────────────────────────────────

export async function saveResource(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const id = str(form.get('id'))
    const projectId = num(form.get('project'))
    const kind = optional(str(form.get('kind'))) ?? 'link'

    const data = {
      label: str(form.get('label')),
      client: num(form.get('client')),
      ...(projectId ? { project: projectId } : {}),
      kind,
      // An embed pasted straight from Figma or Drive is the common case; pull
      // the src out rather than making people hand-edit the markup, which is
      // what the old CRM's extractUrlFromIframe did.
      url: optional(extractUrl(str(form.get('url')))),
      section: kind === 'custom' ? optional(str(form.get('section'))) : undefined,
      caption: optional(str(form.get('caption'))),
      order: num(form.get('order')) ?? 0,
      notes: optional(str(form.get('notes'))),
    }
    if (!data.label) return { ok: false, message: 'Give the resource a label.' }
    if (!data.client) return { ok: false, message: 'Choose a client.' }

    if (id) {
      await payload.update({ collection: 'resources', id, data: data as never, ...as })
    } else {
      await payload.create({ collection: 'resources', data: data as never, ...as })
      void notifyClient({
        payload,
        clientId: data.client,
        type: 'resourceShared',
        title: 'New resource shared',
        message: `“${data.label}” is now in your dashboard.`,
        link: '/portal/resources',
      })
    }

    revalidatePath(`/crm/clients/${data.client}`)
    if (projectId) revalidatePath(`/crm/projects/${projectId}`)
    revalidatePath('/portal/resources')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function deleteResource(id: string, clientId: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    await payload.delete({ collection: 'resources', id, ...as })
    revalidatePath(`/crm/clients/${clientId}`)
    revalidatePath('/portal/resources')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

/**
 * Pulls the src out of a pasted `<iframe …>`; passes a plain URL through.
 *
 * Not exported — a `'use server'` module may only export async functions, and
 * this is a plain helper.
 */
function extractUrl(input: string): string {
  const match = input.match(/src=["']([^"']+)["']/i)
  return match ? match[1]! : input
}
