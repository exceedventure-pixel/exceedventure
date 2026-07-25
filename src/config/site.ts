import {
  Home,
  Layers,
  Briefcase,
  GitBranch,
  Tag,
  Users,
  BookOpen,
  Mail,
  Globe,
  Bot,
  Megaphone,
  Palette,
  TrendingUp,
  Target,
  FileText,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavGrandchild = {
  label: string
  href: string
}

export type NavChild = {
  label: string
  href: string
  children?: NavGrandchild[]
  /** Optional leading icon (e.g. Services dropdown). */
  icon?: LucideIcon
  iconColor?: string
  /** Optional brand logo shown instead of the label (e.g. Branches dropdown). */
  logoLight?: string
  logoDark?: string
  /** One-line summary shown under the label in the desktop mega menu. */
  description?: string
  /** Accent key — same palette as the homepage solution cards. */
  color?: 'teal' | 'red' | 'blue' | 'purple' | 'emerald' | 'amber' | 'pink' | 'indigo'
}

export type NavLink = {
  label: string
  href: string
  external?: boolean
  icon?: LucideIcon
  children?: NavChild[]
  /**
   * Keep this item out of the inline header bar. It still appears in the
   * hamburger drawer, which carries the full menu.
   */
  drawerOnly?: boolean
}

export type FooterLinkGroup = {
  heading: string
  links: { label: string; href: string }[]
}

export type SocialLink = {
  platform: string
  href: string
  icon: 'twitter' | 'linkedin' | 'github' | 'instagram' | 'facebook' | 'youtube' | 'tiktok'
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
  name: 'Exceed Venture',
  tagline: 'Building Digital Excellence.',
  description:
    'Exceed Venture is a full-service digital agency specializing in web development, media buying, creative content, and AI automation solutions.',
  url: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',

  // ─── Logo ──────────────────────────────────────────────────────────────────
  logo: {
    text: 'Exceed Venture',
    // Theme-aware SVG logo is rendered directly by the Logo component.
  },

  // ─── SEO defaults ──────────────────────────────────────────────────────────
  seo: {
    titleTemplate: '%s | Exceed Venture',
    defaultTitle: 'Exceed Venture | Digital Agency',
    defaultDescription:
      'Exceed Venture is a full-service digital agency specializing in web development, media buying, creative content, and AI automation solutions.',
    defaultOgImage: '/website-template-OG.webp',
    twitterHandle: '@exceedventure',
    googleVerification: process.env.GOOGLE_SITE_VERIFICATION ?? '',
    bingVerification: process.env.BING_SITE_VERIFICATION ?? '',
  },

  // ─── Navigation ────────────────────────────────────────────────────────────
  nav: [
    { label: 'Home', href: '/', icon: Home, drawerOnly: true },
    {
      label: 'Solutions',
      href: '/solutions',
      icon: Layers,
      children: [
        { label: 'Websites & Apps', href: '/solutions/websites-apps', icon: Globe, iconColor: 'text-teal-500', color: 'teal', description: 'High-performance sites and platforms' },
        { label: 'Automation', href: '/solutions/automation', icon: Bot, iconColor: 'text-red-500', color: 'red', description: 'Put the repetitive work on autopilot' },
        { label: 'Media Buying', href: '/solutions/media-buying', icon: Megaphone, iconColor: 'text-blue-500', color: 'blue', description: 'Paid campaigns built for ROI' },
        { label: 'Web Growth (SEO)', href: '/solutions/web-growth-seo', icon: TrendingUp, iconColor: 'text-emerald-500', color: 'emerald', description: 'Compounding organic search growth' },
        { label: 'Branding', href: '/solutions/branding', icon: Palette, iconColor: 'text-purple-500', color: 'purple', description: 'Identity and design that gets remembered' },
        { label: 'Marketing', href: '/solutions/marketing', icon: Target, iconColor: 'text-amber-500', color: 'amber', description: 'Full-funnel strategy and campaigns' },
        { label: 'Content Supply', href: '/solutions/content-supply', icon: FileText, iconColor: 'text-pink-500', color: 'pink', description: 'On-brand content at scale' },
        { label: 'SMM & VA', href: '/solutions/smm-va', icon: Users, iconColor: 'text-indigo-500', color: 'indigo', description: 'Social management and virtual assistants' },
      ],
    },
    {
      label: 'Branches',
      href: '/ventures',
      icon: GitBranch,
      children: [
        {
          label: 'Corporate Crafts',
          href: '/corporate-crafts',
          logoLight: '/assets/corporate-crafts.svg',
          logoDark: '/assets/dark-corporate-crafts.svg',
        },
        {
          label: 'Create a Content',
          href: '/creata-content',
          logoLight: '/assets/createacontent.svg',
          logoDark: '/assets/dark-createacontent.svg',
        },
        {
          label: 'Softal Core',
          href: '/softal-core',
          logoLight: '/assets/softal-core.svg',
          logoDark: '/assets/dark-softal-core.svg',
        },
      ],
    },
    { label: 'Works', href: '/our-works', icon: Briefcase },
    { label: 'Pricing', href: '/pricing', icon: Tag },
    { label: 'About', href: '/about', icon: Users, drawerOnly: true },
    { label: 'Blog', href: '/blog', icon: BookOpen, drawerOnly: true },
    { label: 'Contact', href: '/contact', icon: Mail, drawerOnly: true },
  ],

  // ─── Footer links ──────────────────────────────────────────────────────────
  footerLinks: [
    {
      heading: 'Resources',
      links: [
        { label: 'Blogs', href: '/blog' },
        { label: 'Documentation', href: '/resources/documentation' },
        { label: 'Freebies & Audits', href: '/resources/freebies-audits' },
        { label: 'Referral Program', href: '/resources/referral-program' },
      ],
    },
    {
      heading: 'Support',
      links: [
        { label: 'Support Center', href: '/support' },
        { label: 'How to Order', href: '/support/how-to-order' },
        { label: 'Order Tracking', href: '/support/order-tracking' },
        { label: 'Payment', href: '/support/payment' },
        { label: 'Shipping', href: '/support/shipping' },
        { label: 'FAQ', href: '/company/faqs' },
      ],
    },
    {
      heading: 'Consumer Policy',
      links: [
        { label: 'Happy Return', href: '/consumer-policy/happy-return' },
        { label: 'Refund Policy', href: '/consumer-policy/refund-policy' },
        { label: 'Exchange', href: '/consumer-policy/exchange' },
        { label: 'Cancellation', href: '/consumer-policy/cancellation' },
        { label: 'Pre-Order', href: '/consumer-policy/pre-order' },
        { label: 'Extra Discount', href: '/consumer-policy/extra-discount' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'FAQs', href: '/company/faqs' },
        { label: 'Privacy Policy', href: '/company/privacy-policy' },
        { label: 'Terms of Service', href: '/company/terms-of-service' },
      ],
    },
    {
      heading: 'Quick Links',
      links: [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/about' },
        { label: 'Solutions', href: '/solutions' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ],

  // ─── Contact ───────────────────────────────────────────────────────────────
  contact: {
    email: 'hello@exceedventure.com',
    address: '',
  },

  // ─── Social ────────────────────────────────────────────────────────────────
  social: [
    { platform: 'Facebook', href: 'https://www.facebook.com/exceedventure', icon: 'facebook' },
    { platform: 'Instagram', href: 'https://www.instagram.com/exceed_venture', icon: 'instagram' },
    {
      platform: 'LinkedIn',
      href: 'https://www.linkedin.com/company/exceedventure',
      icon: 'linkedin',
    },
    { platform: 'YouTube', href: 'https://www.youtube.com/@ExceedVenture', icon: 'youtube' },
    { platform: 'TikTok', href: 'https://www.tiktok.com/@exceedventure', icon: 'tiktok' },
  ],

  // ─── Organization (used for JSON-LD structured data) ───────────────────────
  org: {
    legalName: 'Exceed Venture',
    foundingYear: 2020,
    areaServed: 'Worldwide',
  },
}

export default siteConfig
