import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'
import siteConfig from '@/config/site'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to {siteConfig.name} Admin</h4>
      </Banner>
      <p>Use the sidebar to manage your site:</p>
      <ul className={`${baseClass}__instructions`}>
        <li>
          <strong>Page SEO</strong> — Set meta titles, descriptions, and OG images for each
          hardcoded page.
        </li>
        <li>
          <strong>Posts</strong> — Write and publish blog articles. SEO fields are included on each
          post.
        </li>
        <li>
          <strong>Media</strong> — Upload images used in posts and OG images.
        </li>
        <li>
          <strong>Redirects</strong> — Manage URL redirects without code changes.
        </li>
      </ul>
    </div>
  )
}

export default BeforeDashboard
