import { HeaderClient } from './Component.client'
import React from 'react'
import { getSiteSettings } from '@/utilities/getSiteSettings'

/**
 * Server wrapper. Resolves the contact channels once per render so the header
 * can offer call / WhatsApp without the client component fetching anything.
 */
export async function Header() {
  const channels = await getSiteSettings()
  return <HeaderClient channels={channels} />
}
