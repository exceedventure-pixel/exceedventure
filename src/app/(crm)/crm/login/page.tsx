import React from 'react'
import { redirect } from 'next/navigation'
import { getAccount } from '@/crm/auth'
import { LoginForm } from '@/crm/LoginForm'
import { googleConfigured } from '@/crm/google'

/** Staff sign-in. Google here is invite-only — see the callback route. */
export default async function CrmLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if (await getAccount('crm-accounts')) redirect('/crm')
  const { error } = await searchParams

  return (
    <LoginForm
      title="Exceed Venture CRM"
      subtitle="Team sign-in"
      loginEndpoint="/crm/api/login"
      redirectTo="/crm"
      googleHref={googleConfigured() ? '/crm/api/auth/google' : undefined}
      forgotPasswordHref="/crm/forgot-password"
      error={error}
    />
  )
}
