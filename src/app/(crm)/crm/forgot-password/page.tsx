import React from 'react'
import { ForgotPasswordForm } from '@/crm/PasswordResetForm'

/** Sibling of the login page, outside the (app) guard so it is reachable signed out. */
export default function ForgotPassword() {
  return (
    <ForgotPasswordForm
      title="Team CRM"
      collection="crm-accounts"
      loginPath="/crm/login"
    />
  )
}
