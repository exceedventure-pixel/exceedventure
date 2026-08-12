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
      title="Client Dashboard"
      resetEndpoint="/portal/api/reset-password"
      loginPath="/portal/login"
      forgotPath="/portal/forgot-password"
      redirectTo="/portal"
      token={token}
    />
  )
}
