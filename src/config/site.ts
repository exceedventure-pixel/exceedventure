import { Home, Layers, Users, BookOpen, Mail } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavGrandchild = {
  label: string
  href: string
}

export type NavChild = {
  label: string
  href: string
  children?: NavGrandchild[]
}

export type NavLink = {
  label: string
  href: string
  external?: boolean
  icon?: LucideIcon
  children?: NavChild[]
}

export type FooterLinkGroup = {
  heading: string
  links: { label: string; href: string }[]
}

export type SocialLink = {
  platform: string
  href: string
  icon: 'twitter' | 'linkedin' | 'github' | 'instagram' | 'facebook' | 'youtube'
}

export type SiteConfig = {
  name: string
  tagline: string
  description: string
  url: string
  logo: {
    text: string
    imagePath?: string
  }
  seo: {
    titleTemplate: string
    defaultTitle: string
    defaultDescription: string
    defaultOgImage: string
    twitterHandle: string
    googleVerification: string
    bingVerification: string
  }
  nav: NavLink[]
  footerLinks: FooterLinkGroup[]
  contact: {
    email: string
    phone?: string
    address?: string
  }
  social: SocialLink[]
  org: {
    legalName: string
    foundingYear: number
    areaServed: string
  }
}

const siteConfig: SiteConfig = {
  // ─── Identity ──────────────────────────────────────────────────────────────
  name: 'Acme Agency',
  tagline: 'We grow your business.',
  description:
    'Acme Agency delivers world-class digital marketing, SEO, and web design for modern businesses.',
  url: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',

  // ─── Logo ──────────────────────────────────────────────────────────────────
  logo: {
    text: 'Acme Agency',
    // imagePath: '/logo.svg',
  },

  // ─── SEO defaults ──────────────────────────────────────────────────────────
  seo: {
    titleTemplate: '%s | Acme Agency',
    defaultTitle: 'Acme Agency — Digital Marketing & Web Design',
    defaultDescription:
      'Acme Agency delivers world-class SEO, web design, and paid advertising for modern businesses.',
    defaultOgImage: '/website-template-OG.webp',
    twitterHandle: '@acme',
    googleVerification: process.env.GOOGLE_SITE_VERIFICATION ?? '',
    bingVerification: process.env.BING_SITE_VERIFICATION ?? '',
  },

  // ─── Navigation ────────────────────────────────────────────────────────────
  nav: [
    { label: 'Home', href: '/', icon: Home },
    {
      label: 'Services',
      href: '/services',
      icon: Layers,
      children: [
        {
          label: 'Service 1',
          href: '/services/service-1',
          children: [
            { label: 'Sub Service 1', href: '/services/service-1/sub-service-1' },
            { label: 'Sub Service 2', href: '/services/service-1/sub-service-2' },
            { label: 'Sub Service 3', href: '/services/service-1/sub-service-3' },
          ],
        },
        {
          label: 'Service 2',
          href: '/services/service-2',
          children: [
            { label: 'Sub Service 1', href: '/services/service-2/sub-service-1' },
            { label: 'Sub Service 2', href: '/services/service-2/sub-service-2' },
            { label: 'Sub Service 3', href: '/services/service-2/sub-service-3' },
          ],
        },
        {
          label: 'Service 3',
          href: '/services/service-3',
          children: [
            { label: 'Sub Service 1', href: '/services/service-3/sub-service-1' },
            { label: 'Sub Service 2', href: '/services/service-3/sub-service-2' },
            { label: 'Sub Service 3', href: '/services/service-3/sub-service-3' },
          ],
        },
        {
          label: 'Service 4',
          href: '/services/service-4',
          children: [
            { label: 'Sub Service 1', href: '/services/service-4/sub-service-1' },
            { label: 'Sub Service 2', href: '/services/service-4/sub-service-2' },
            { label: 'Sub Service 3', href: '/services/service-4/sub-service-3' },
          ],
        },
        {
          label: 'Service 5',
          href: '/services/service-5',
          children: [
            { label: 'Sub Service 1', href: '/services/service-5/sub-service-1' },
            { label: 'Sub Service 2', href: '/services/service-5/sub-service-2' },
            { label: 'Sub Service 3', href: '/services/service-5/sub-service-3' },
          ],
        },
      ],
    },
    { label: 'About', href: '/about', icon: Users },
    { label: 'Blog', href: '/blog', icon: BookOpen },
    { label: 'Contact', href: '/contact', icon: Mail },
  ],

  // ─── Footer links ──────────────────────────────────────────────────────────
  footerLinks: [
    {
      heading: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      heading: 'Content',
      links: [{ label: 'Blog', href: '/blog' }],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
    },
  ],

  // ─── Contact ───────────────────────────────────────────────────────────────
  contact: {
    email: 'hello@acme.com',
    phone: '+1 (555) 000-0000',
    address: '123 Main St, San Francisco, CA 94105',
  },

  // ─── Social ────────────────────────────────────────────────────────────────
  social: [
    { platform: 'Twitter / X', href: 'https://twitter.com/acme', icon: 'twitter' },
    { platform: 'LinkedIn', href: 'https://linkedin.com/company/acme', icon: 'linkedin' },
    { platform: 'GitHub', href: 'https://github.com/acme', icon: 'github' },
  ],

  // ─── Organization (used for JSON-LD structured data) ───────────────────────
  org: {
    legalName: 'Acme Agency LLC',
    foundingYear: 2020,
    areaServed: 'Worldwide',
  },
}

export default siteConfig
