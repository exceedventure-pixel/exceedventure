import React from 'react'
import { ForgotPasswordForm } from '@/crm/PasswordResetForm'

/** Sibling of the login page, outside the (app) guard so it is reachable signed out. */
export default function ForgotPassword() {
  return (
    <ForgotPasswordForm
      title="Client Dashboard"
      collection="client-accounts"
      loginPath="/portal/login"
    />
  )
}
