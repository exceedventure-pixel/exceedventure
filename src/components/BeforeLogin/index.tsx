import React from 'react'
import siteConfig from '@/config/site'

const BeforeLogin: React.FC = () => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <p>
        <strong>{siteConfig.name} — Admin</strong>
      </p>
      <p style={{ marginTop: '0.25rem', color: '#6b7280', fontSize: '0.875rem' }}>
        Sign in to manage SEO and content for your website.
      </p>
    </div>
  )
}

export default BeforeLogin
