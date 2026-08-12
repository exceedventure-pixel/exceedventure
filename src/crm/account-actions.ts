'use server'

import { revalidatePath } from 'next/cache'
import { areaFromForm, crmQuery, isAdminUser, isStaffUser } from './data'
import { notifyAccount, notifyStaff } from './notify'
import { sendEmail } from './email'
import { fail, optional, relId, str, type ActionResult } from './parse'

/**
 * Accounts: your team, your clients' logins, and each person's own profile.
 *
 * The old CRM ran all of this from the browser against a single `users`
 * collection with a `roles` array, and "pausing" someone only hid buttons.
 * Here the two audiences are separate collections, role and pause are
 * admin-only fields, and the pause is enforced in access control — so a
 * suspended session can read and write nothing, not merely see less.
 */

// ── Team ─────────────────────────────────────────────────────────────────────

export async function inviteTeammate(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const email = str(form.get('email')).toLowerCase()
    const password = str(form.get('password'))
    const name = optional(str(form.get('name')))
    const role = optional(str(form.get('role'))) ?? 'member'

    if (!email) return { ok: false, message: 'An email is required.' }
    if (password.length < 10)
      return { ok: false, message: 'Password must be at least 10 characters.' }

    await payload.create({
      collection: 'crm-accounts',
      data: { email, password, name, role } as never,
      ...as,
    })

    // Sending the credentials is the point of an invite — without it somebody
    // has to copy the password into a chat window, which is worse.
    void sendEmail(email, { type: 'teamInvite', name, email, password, role })

    revalidatePath('/crm/team')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function setTeammateRole(id: string, role: string): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery()

    // A stronger rule than the field guard: an admin must not demote *itself*
    // and lock the last admin out of account management by accident.
    if (String(user?.id) === String(id) && role !== 'admin') {
      return { ok: false, message: 'You cannot change your own role.' }
    }

    const target = await payload.findByID({ collection: 'crm-accounts', id, depth: 0, ...as })
    if (target.isEnvManaged) {
      return {
        ok: false,
        message: 'This is the recovery account from CRM_ADMIN_EMAIL — change it in the environment.',
      }
    }

    await payload.update({ collection: 'crm-accounts', id, data: { role } as never, ...as })
    revalidatePath('/crm/team')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function setTeammatePaused(id: string, paused: boolean): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery()

    if (String(user?.id) === String(id)) {
      return { ok: false, message: 'You cannot pause your own account.' }
    }

    const target = await payload.findByID({ collection: 'crm-accounts', id, depth: 0, ...as })
    if (target.isEnvManaged) {
      return { ok: false, message: 'The recovery account cannot be paused.' }
    }

    await payload.update({
      collection: 'crm-accounts',
      id,
      data: { isPaused: paused } as never,
      ...as,
    })
    revalidatePath('/crm/team')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function removeTeammate(id: string): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery()

    if (String(user?.id) === String(id)) {
      return { ok: false, message: 'You cannot delete your own account.' }
    }
    if (!isAdminUser(user)) return { ok: false, message: 'Only an admin can remove a teammate.' }

    // Refuse to remove the last admin — otherwise nobody can manage accounts,
    // invite anyone, or undo it.
    const admins = await payload.count({
      collection: 'crm-accounts',
      where: { and: [{ role: { equals: 'admin' } }, { isPaused: { not_equals: true } }] },
      ...as,
    })
    const target = await payload.findByID({ collection: 'crm-accounts', id, depth: 0, ...as })
    if (target.isEnvManaged) {
      return { ok: false, message: 'The recovery account cannot be removed.' }
    }
    if (target.role === 'admin' && admins.totalDocs <= 1) {
      return { ok: false, message: 'This is the last admin — promote someone else first.' }
    }

    await payload.delete({ collection: 'crm-accounts', id, ...as })
    revalidatePath('/crm/team')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

// ── Client accounts ──────────────────────────────────────────────────────────

/**
 * Approve, reject, pause or restore a dashboard login.
 *
 * This replaces the REST PATCH the requests screen used to make from the
 * browser. Same access rules either way — but going through an action means the
 * approval email and the in-app notification happen with it, rather than the
 * client discovering their account works by trying again.
 */
export async function setClientAccountStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()

    const account = await payload.update({
      collection: 'client-accounts',
      id,
      data: { approvalStatus: status } as never,
      depth: 0,
      ...as,
    })

    if (status === 'active' || status === 'rejected') {
      const approved = status === 'active'
      void notifyAccount(
        {
          payload,
          side: 'client',
          accountId: id,
          type: approved ? 'accessApproved' : 'accessRejected',
          title: approved ? 'Your dashboard is open' : 'About your dashboard request',
          message: approved
            ? 'Your account has been approved. Everything is available now.'
            : 'We could not approve this account.',
          link: '/portal',
        },
        account.email
          ? {
              to: account.email,
              template: {
                type: approved ? 'accessApproved' : 'accessRejected',
                name: account.name ?? undefined,
              },
            }
          : undefined,
      )
    }

    revalidatePath('/crm/requests')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

/**
 * Moves a dashboard login onto an existing company.
 *
 * Signup always creates a fresh `clients` record, deliberately — see the signup
 * route. This is the human step that merges a new signup into the company they
 * actually belong to, and the empty shell company gets cleaned up behind it.
 */
export async function reassignClientAccount(form: FormData): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    const id = str(form.get('id'))
    const clientId = str(form.get('client'))
    if (!id || !clientId) return { ok: false, message: 'Choose a company.' }

    const account = await payload.findByID({
      collection: 'client-accounts',
      id,
      depth: 0,
      ...as,
    })
    const previous = relId(account.client)

    await payload.update({
      collection: 'client-accounts',
      id,
      data: { client: Number(clientId) } as never,
      ...as,
    })

    // If the company they came from was the auto-created shell and nothing else
    // is attached to it, remove it rather than leaving a duplicate in the list.
    if (previous && String(previous) !== String(clientId)) {
      const [accounts, projects, invoices] = await Promise.all([
        payload.count({
          collection: 'client-accounts',
          where: { client: { equals: previous } },
          ...as,
        }),
        payload.count({ collection: 'projects', where: { client: { equals: previous } }, ...as }),
        payload.count({ collection: 'invoices', where: { client: { equals: previous } }, ...as }),
      ])
      if (accounts.totalDocs === 0 && projects.totalDocs === 0 && invoices.totalDocs === 0) {
        await payload
          .delete({ collection: 'clients', id: previous, ...as })
          .catch(() => undefined)
      }
    }

    revalidatePath('/crm/requests')
    revalidatePath('/crm/clients')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function deleteClientAccount(id: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    // The login goes; the company, its projects and its invoices stay. Deleting
    // an account must never quietly remove billing history.
    await payload.delete({ collection: 'client-accounts', id, ...as })
    revalidatePath('/crm/requests')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

// ── Self-service profile ─────────────────────────────────────────────────────

/**
 * Each person editing their own record, from either area.
 *
 * The collection is chosen from the session, never the form. Everything that
 * decides what an account can see — `client`, `approvalStatus`, `role`,
 * `isPaused` — is a staff-only or admin-only field, so this cannot widen
 * anyone's access no matter what is posted.
 */
export async function updateMyProfile(form: FormData): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery(areaFromForm(form.get('area')))
    if (!user) return { ok: false, message: 'Not signed in.' }

    const staff = isStaffUser(user)
    const data = staff
      ? {
          name: optional(str(form.get('name'))),
          jobTitle: optional(str(form.get('jobTitle'))),
          phone: optional(str(form.get('phone'))),
        }
      : {
          name: optional(str(form.get('name'))),
          jobTitle: optional(str(form.get('jobTitle'))),
          organization: optional(str(form.get('organization'))),
          phone: optional(str(form.get('phone'))),
          whatsapp: optional(str(form.get('whatsapp'))),
          address: optional(str(form.get('address'))),
          bio: optional(str(form.get('bio'))),
        }

    await payload.update({
      collection: staff ? 'crm-accounts' : 'client-accounts',
      id: user.id,
      data: data as never,
      ...as,
    })

    revalidatePath(staff ? '/crm/account' : '/portal/account')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

/**
 * Password change, current password required.
 *
 * Payload's update would happily set a new password from a valid session alone.
 * Re-authenticating first means a borrowed laptop or a stolen cookie cannot be
 * turned into permanent ownership of the account.
 */
export async function changeMyPassword(form: FormData): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery(areaFromForm(form.get('area')))
    if (!user) return { ok: false, message: 'Not signed in.' }

    const current = str(form.get('currentPassword'))
    const next = str(form.get('newPassword'))
    const confirm = str(form.get('confirmPassword'))

    if (next.length < 10) return { ok: false, message: 'Use at least 10 characters.' }
    if (next !== confirm) return { ok: false, message: 'The two passwords do not match.' }

    const collection = isStaffUser(user) ? 'crm-accounts' : 'client-accounts'

    try {
      await payload.login({
        collection,
        data: { email: user.email, password: current },
        overrideAccess: true,
      })
    } catch {
      return { ok: false, message: 'Your current password is not right.' }
    }

    await payload.update({
      collection,
      id: user.id,
      data: { password: next } as never,
      ...as,
    })

    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

/**
 * A client asking to close their account.
 *
 * A request rather than a deletion. The old app deleted the Firebase auth user
 * from the browser and kept a `deleted_users` blocklist to handle the wreckage
 * when the Firestore half failed — a race it papered over with a 24-hour
 * cooldown. Nothing is destroyed here, and the invoices attached to the account
 * stay in your books.
 */
export async function requestAccountDeletion(form: FormData): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery('client-accounts')
    if (!user) return { ok: false, message: 'Not signed in.' }

    const reason = optional(str(form.get('reason')))

    await payload.update({
      collection: 'client-accounts',
      id: user.id,
      data: {
        deletionRequested: true,
        deletionRequestedAt: new Date().toISOString(),
        deletionReason: reason,
      } as never,
      ...as,
    })

    void notifyStaff(
      {
        payload,
        type: 'deletionRequested',
        title: 'Account deletion requested',
        message: `${user.name || user.email} asked to close their account.`,
        link: '/crm/requests',
        meta: { accountId: user.id },
      },
      {
        type: 'staffDeletionRequest',
        clientName: user.name || user.email,
        email: user.email,
        reason,
      },
    )

    revalidatePath('/portal/account')
    revalidatePath('/crm/requests')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function cancelDeletionRequest(): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery('client-accounts')
    if (!user) return { ok: false, message: 'Not signed in.' }

    await payload.update({
      collection: 'client-accounts',
      id: user.id,
      data: {
        deletionRequested: false,
        deletionRequestedAt: null,
        deletionReason: null,
      } as never,
      ...as,
    })

    revalidatePath('/portal/account')
    revalidatePath('/crm/requests')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}
