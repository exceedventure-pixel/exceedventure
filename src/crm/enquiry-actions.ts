'use server'

import { revalidatePath } from 'next/cache'
import { crmQuery } from './data'
import { sendEmail } from './email'
import { fail, num, optional, str, type ActionResult } from './parse'

/**
 * What your team does with an inbound enquiry.
 *
 * The pipeline is deliberately short — new → in progress → responded → won or
 * closed — because an enquiry that needs more stages than that is a project,
 * and there is already a place for those.
 */

export async function setEnquiryStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    await payload.update({
      collection: 'enquiries',
      id,
      data: {
        status,
        // Stamped automatically so nobody has to remember, and so "how long do
        // we take to reply" is answerable later.
        ...(status === 'responded' ? { respondedAt: new Date().toISOString() } : {}),
      } as never,
      ...as,
    })
    revalidatePath('/crm/enquiries')
    revalidatePath(`/crm/enquiries/${id}`)
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function assignEnquiry(id: string, assignee: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    await payload.update({
      collection: 'enquiries',
      id,
      data: { assignedTo: assignee ? Number(assignee) : null } as never,
      ...as,
    })
    revalidatePath('/crm/enquiries')
    revalidatePath(`/crm/enquiries/${id}`)
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function saveEnquiryNotes(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const id = str(form.get('id'))
    if (!id) return { ok: false, message: 'Missing enquiry.' }

    await payload.update({
      collection: 'enquiries',
      id,
      data: { internalNotes: optional(str(form.get('internalNotes'))) } as never,
      ...as,
    })
    revalidatePath(`/crm/enquiries/${id}`)
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

/**
 * Replies to the person who wrote in, and records that we did.
 *
 * Sends straight from the enquiry rather than making someone copy the address
 * into a mail client — which is where the reply-time promise usually dies.
 */
export async function replyToEnquiry(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const id = str(form.get('id'))
    const body = str(form.get('body'))
    if (!id) return { ok: false, message: 'Missing enquiry.' }
    if (!body) return { ok: false, message: 'Write a reply first.' }

    const enquiry = await payload.findByID({ collection: 'enquiries', id, depth: 0, ...as })
    if (!enquiry.email) return { ok: false, message: 'This enquiry has no email address.' }

    const result = await sendEmail(enquiry.email, {
      type: 'custom',
      subject: enquiry.subject ? `Re: ${enquiry.subject}` : 'Re: your enquiry',
      heading: 'Thanks for getting in touch',
      message: body,
    })

    if (!result.sent && !result.skipped) {
      return { ok: false, message: 'The reply could not be sent.' }
    }

    await payload.update({
      collection: 'enquiries',
      id,
      data: {
        status: 'responded',
        respondedAt: new Date().toISOString(),
        internalNotes: [enquiry.internalNotes, `— Replied:\n${body}`].filter(Boolean).join('\n\n'),
      } as never,
      ...as,
    })

    revalidatePath(`/crm/enquiries/${id}`)
    revalidatePath('/crm/enquiries')
    // Say so plainly when email is switched off, rather than implying it went.
    return result.skipped
      ? { ok: false, message: 'Marked as responded, but email is not configured so nothing sent.' }
      : { ok: true }
  } catch (err) {
    return fail(err)
  }
}

/**
 * Turns an enquiry into a client.
 *
 * Reuses the company already on the enquiry when one is picked, so a returning
 * customer does not become a duplicate — the mistake the portal signup route
 * deliberately avoids too.
 */
export async function convertEnquiry(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const id = str(form.get('id'))
    if (!id) return { ok: false, message: 'Missing enquiry.' }

    const enquiry = await payload.findByID({ collection: 'enquiries', id, depth: 0, ...as })

    const existing = num(form.get('client'))
    let clientId: string | number

    if (existing) {
      clientId = existing
    } else {
      const name = optional(str(form.get('name'))) || enquiry.company || enquiry.name || enquiry.email
      if (!name) return { ok: false, message: 'Give the company a name.' }

      const created = await payload.create({
        collection: 'clients',
        data: {
          name,
          status: 'lead',
          email: enquiry.email ?? undefined,
          phone: enquiry.phone ?? undefined,
        } as never,
        ...as,
      })
      clientId = created.id
    }

    await payload.update({
      collection: 'enquiries',
      id,
      data: { client: clientId, status: 'won' } as never,
      ...as,
    })

    revalidatePath('/crm/enquiries')
    revalidatePath(`/crm/enquiries/${id}`)
    revalidatePath('/crm/clients')
    return { ok: true, id: clientId }
  } catch (err) {
    return fail(err)
  }
}

export async function deleteEnquiry(id: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    await payload.delete({ collection: 'enquiries', id, ...as })
    revalidatePath('/crm/enquiries')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}
