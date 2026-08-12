import React from 'react'
import { ResetPasswordForm } from '@/crm/PasswordResetForm'

/** Landing page for the emailed link — the token arrives as ?token=. */
export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return (
    <ResetPasswordForm
      title="Team CRM"
      resetEndpoint="/crm/api/reset-password"
      loginPath="/crm/login"
      forgotPath="/crm/forgot-password"
      redirectTo="/crm"
      token={token}
    />
  )
}
