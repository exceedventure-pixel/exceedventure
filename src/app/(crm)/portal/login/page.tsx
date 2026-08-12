import React from 'react'
import { redirect } from 'next/navigation'
import { getAccount } from '@/crm/auth'
import { LoginForm } from '@/crm/LoginForm'
import { googleConfigured } from '@/crm/google'

/** Client sign-in, with self-registration enabled. */
export default async function PortalLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>
}) {
  if (await getAccount('client-accounts')) redirect('/portal')
  const { error, mode } = await searchParams

  return (
    <LoginForm
      title="Client Dashboard"
      subtitle="Sign in or create an account"
      loginEndpoint="/portal/api/login"
      redirectTo="/portal"
      googleHref={googleConfigured() ? '/portal/api/auth/google' : undefined}
      forgotPasswordHref="/portal/forgot-password"
      allowSignup
      initialMode={mode === 'signup' ? 'signup' : 'login'}
      error={error}
    />
  )
}
