'use client'

import React from 'react'
import { ContactChat } from '@/components/ContactChat'

/**
 * The mega menu's enquiry widget.
 *
 * The chat itself moved to `@/components/ContactChat` once the header's Contact
 * button needed the same thing — two copies of a stateful chat would have
 * drifted apart on the first change. This stays as the menu's entry point.
 */
export const MenuContactForm: React.FC = () => <ContactChat size="compact" />

export default MenuContactForm
