import {
  Home,
  Briefcase,
  Tag,
  Users,
  BookOpen,
  Mail,
  Globe,
  Bot,
  Megaphone,
  Palette,
  LayoutTemplate,
  ShoppingCart,
  Code2,
  CalendarClock,
  TrendingUp,
  Target,
  Share2,
  Compass,
  Lightbulb,
  Plug,
  Workflow,
  PenTool,
  Clapperboard,
  Package,
  ShoppingBag,
  Server,
  MousePointer,
  Brush,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavGrandchild = {
  label: string
  href: string
  /**
   * One-line summary shown on the parent service page's card grid. These pages
   * are intentionally absent from the header menus — see SubServiceGrid.
   */
  description?: string
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
  /**
   * Compact label for the inline header bar only — the drawer, mega menu and
   * dropdown headings keep the full `label`. Falls back to `label`.
   */
  shortLabel?: string
  /** Small line set above `shortLabel` in the header bar; the two read as a phrase. */
  overline?: string
  href: string
  external?: boolean
  icon?: LucideIcon
  children?: NavChild[]
  /** Show this item as a top-level section in the mega menu. */
  megaSection?: boolean
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
    /** GA4 measurement id, e.g. `G-XXXXXXXXXX`. Empty disables analytics. */
    googleAnalyticsId: string
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
    // Falls back to the live property, so no env var is needed to ship. Set the
    // variable to override it per environment — or to '' to switch it off.
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-M3TZ34VWYP',
  },

  // ─── Navigation ────────────────────────────────────────────────────────────
  nav: [
    { label: 'Home', href: '/', icon: Home, drawerOnly: true },
    {
      label: 'Websites & Softwares',
      overline: 'Softwares &',
      shortLabel: 'Websites',
      href: '/websites-softwares',
      icon: Globe,
      megaSection: true,
      children: [
        {
          label: 'WordPress',
          href: '/websites-softwares/wordpress',
          icon: LayoutTemplate,
          color: 'blue',
          description: 'Fast, editable sites your team can run',
          children: [
            {
              label: 'WordPress Web Designers',
              href: '/websites-softwares/wordpress/wordpress-web-designers',
              description:
                'Design-led WordPress builds that look sharp and stay easy for your team to run.',
            },
            {
              label: 'WordPress Development Agency London',
              href: '/websites-softwares/wordpress/wordpress-development-agency-london',
              description:
                'A London-based WordPress team for builds, migrations and ongoing support.',
            },
            {
              label: 'WordPress E-commerce',
              href: '/websites-softwares/wordpress/wordpress-ecommerce',
              description:
                'WooCommerce storefronts built to handle real catalogues and real order volume.',
            },
          ],
        },
        {
          label: 'Shopify',
          href: '/websites-softwares/shopify',
          icon: ShoppingBag,
          description: 'Storefronts built on Shopify to sell',
          children: [
            {
              label: 'Shopify Web Design',
              href: '/websites-softwares/shopify/shopify-web-design',
              description:
                'Storefront design that reflects your brand and moves shoppers toward checkout.',
            },
            {
              label: 'Shopify Development Agency',
              href: '/websites-softwares/shopify/shopify-development-agency',
              description:
                "Development support for themes, apps and the parts Shopify doesn't do out of the box.",
            },
          ],
        },
        {
          label: 'E-commerce',
          href: '/websites-softwares/e-commerce',
          icon: ShoppingCart,
          color: 'amber',
          description: 'Storefronts built to sell and scale',
          children: [
            {
              label: 'Ecommerce Website Design UK',
              href: '/websites-softwares/e-commerce/ecommerce-website-design-uk',
              description:
                'Online stores designed for UK retailers, with the trust signals shoppers expect.',
            },
            {
              label: 'Ecommerce Web Developers',
              href: '/websites-softwares/e-commerce/ecommerce-web-developers',
              description: 'Developers who build storefronts that stay fast under real traffic.',
            },
            {
              label: 'Single Product & SME Stores',
              href: '/websites-softwares/e-commerce/single-product-sme-stores',
              description:
                'Lean stores for a single product or a small range, without enterprise overhead.',
            },
          ],
        },
        {
          label: 'Custom Websites',
          href: '/websites-softwares/custom-websites',
          icon: Code2,
          color: 'purple',
          description: 'Bespoke builds designed around your goals',
          children: [
            {
              label: 'Bespoke Web Design Agency',
              href: '/websites-softwares/custom-websites/bespoke-web-design-agency',
              description:
                'Websites designed from scratch around your goals, not adapted from a template.',
            },
            {
              label: 'Next.js & React Development',
              href: '/websites-softwares/custom-websites/nextjs-react-development',
              description:
                'Modern front-ends built with Next.js and React for speed and flexibility.',
            },
            {
              label: 'Single Page Apps',
              href: '/websites-softwares/custom-websites/single-page-apps',
              description: 'App-like experiences that respond instantly without full page reloads.',
            },
          ],
        },
        {
          label: 'Custom Web Systems',
          href: '/websites-softwares/custom-web-systems',
          icon: Server,
          description: 'Internal tools and portals built to fit',
          children: [
            {
              label: 'Headless Payload CMS Architectures',
              href: '/websites-softwares/custom-web-systems/headless-payload-cms-architectures',
              description:
                'Headless Payload CMS setups that separate content from how it gets presented.',
            },
            {
              label: 'Kanban & Team Management Dashboards',
              href: '/websites-softwares/custom-web-systems/kanban-team-management-dashboards',
              description:
                'Internal boards and dashboards that give a team one shared view of the work.',
            },
            {
              label: 'Custom Client Portal Solutions',
              href: '/websites-softwares/custom-web-systems/custom-client-portal-solutions',
              description:
                'Private portals where clients track progress, approve work and reach their files.',
            },
          ],
        },
        {
          label: 'Pay Monthly Websites',
          href: '/websites-softwares/pay-monthly-websites',
          icon: CalendarClock,
          color: 'emerald',
          description: 'Launch now, spread the cost over time',
          children: [
            {
              label: 'Pay Monthly Websites UK',
              href: '/websites-softwares/pay-monthly-websites/pay-monthly-websites-uk',
              description: 'Professional websites for UK businesses on a fixed monthly fee.',
            },
            {
              label: 'Pay Monthly Website Design',
              href: '/websites-softwares/pay-monthly-websites/pay-monthly-website-design',
              description:
                'Design, build and maintenance bundled into one predictable monthly payment.',
            },
          ],
        },
      ],
    },
    {
      label: 'Digital Marketing',
      overline: 'Digital',
      shortLabel: 'Marketing',
      href: '/digital-marketing',
      icon: Megaphone,
      megaSection: true,
      children: [
        {
          label: 'Web Growth SEO',
          href: '/digital-marketing/web-growth-seo',
          icon: TrendingUp,
          color: 'emerald',
          description: 'Rank higher and earn traffic that compounds',
          children: [
            {
              label: 'SEO Audit Services',
              href: '/digital-marketing/web-growth-seo/seo-audit-services',
              description:
                "A clear picture of what's holding your rankings back, and what to fix first.",
            },
            {
              label: 'White Label SEO UK',
              href: '/digital-marketing/web-growth-seo/white-label-seo-uk',
              description: 'SEO delivered under your brand, for agencies that need extra capacity.',
            },
            {
              label: 'Enterprise SEO Agency',
              href: '/digital-marketing/web-growth-seo/enterprise-seo-agency',
              description:
                'SEO for large sites where scale, governance and stakeholders all matter.',
            },
          ],
        },
        {
          label: 'Media Buying',
          href: '/digital-marketing/media-buying',
          icon: Target,
          color: 'red',
          description: 'Paid campaigns measured on return, not reach',
          children: [
            {
              label: 'Facebook Advertising Agency',
              href: '/digital-marketing/media-buying/facebook-advertising-agency',
              description:
                'Facebook campaigns built around measurable return rather than vanity reach.',
            },
            {
              label: 'Facebook Ads Agency UK',
              href: '/digital-marketing/media-buying/facebook-ads-agency-uk',
              description: 'UK-focused Facebook and Instagram buying with local audience insight.',
            },
            {
              label: 'Google Ads Marketing Agency',
              href: '/digital-marketing/media-buying/google-ads-marketing-agency',
              description:
                'Search, shopping and display campaigns managed against your cost per lead.',
            },
          ],
        },
        {
          label: 'SMM & VA',
          href: '/digital-marketing/smm-va',
          icon: Share2,
          color: 'pink',
          description: 'Social management and dedicated assistants',
          children: [
            {
              label: 'Administrative & Operational Support',
              href: '/digital-marketing/smm-va/administrative-operational-support',
              description:
                'Trained assistants handling the admin that keeps pulling you away from the work.',
            },
            {
              label: 'Booking & Reservation Management',
              href: '/digital-marketing/smm-va/booking-reservation-management',
              description:
                'Someone managing your diary, bookings and confirmations from end to end.',
            },
            {
              label: 'Client Portal Access & Invoice Generation',
              href: '/digital-marketing/smm-va/client-portal-invoice-generation',
              description:
                'Client-facing admin handled: portal access, invoices raised and payment chased.',
            },
          ],
        },
        {
          label: 'Niche Marketing',
          href: '/digital-marketing/niche-marketing',
          icon: Compass,
          color: 'indigo',
          description: 'Targeted plays for specialist markets',
          children: [
            {
              label: 'Fitness Marketing Agency',
              href: '/digital-marketing/niche-marketing/fitness-marketing-agency',
              description: 'Marketing for gyms, studios and coaches who need a full timetable.',
            },
            {
              label: 'Law Firm Marketing Agency',
              href: '/digital-marketing/niche-marketing/law-firm-marketing-agency',
              description: 'Compliant marketing for firms competing on high-value search terms.',
            },
            {
              label: 'Automotive Marketing Agency',
              href: '/digital-marketing/niche-marketing/automotive-marketing-agency',
              description: 'Marketing for dealers, garages and automotive service businesses.',
            },
          ],
        },
      ],
    },
    {
      label: 'Automation & AI',
      overline: 'Workflow',
      shortLabel: 'Automation',
      href: '/automation-ai',
      icon: Bot,
      megaSection: true,
      children: [
        {
          label: 'AI Consultancy',
          href: '/automation-ai/ai-consultancy',
          icon: Lightbulb,
          color: 'amber',
          description: 'Find where AI actually pays off for you',
          children: [
            {
              label: 'AI Strategy & Consulting',
              href: '/automation-ai/ai-consultancy/ai-strategy-consulting',
              description:
                "A grounded plan for where AI fits in your business, and where it doesn't.",
            },
            {
              label: 'AI for SMEs',
              href: '/automation-ai/ai-consultancy/ai-for-smes',
              description: 'Practical AI for smaller teams, sized to a real budget.',
            },
          ],
        },
        {
          label: 'AI Integration Services',
          href: '/automation-ai/ai-integration-services',
          icon: Plug,
          color: 'blue',
          description: 'Wire AI into the tools you already use',
          children: [
            {
              label: 'Chatbot Integration',
              href: '/automation-ai/ai-integration-services/chatbot-integration',
              description: 'Assistants that answer real questions using your own content.',
            },
            {
              label: 'Customer Support Automation',
              href: '/automation-ai/ai-integration-services/customer-support-automation',
              description: 'Automate the repetitive half of support and route the rest properly.',
            },
          ],
        },
        {
          label: 'Workflow Automation',
          href: '/automation-ai/workflow-automation',
          icon: Workflow,
          color: 'teal',
          description: 'Hand the repetitive work to a system',
          children: [
            {
              label: 'CRM Automation Setup',
              href: '/automation-ai/workflow-automation/crm-automation-setup',
              description: 'A CRM that updates itself instead of relying on someone remembering.',
            },
            {
              label: 'Internal Process Automation',
              href: '/automation-ai/workflow-automation/internal-process-automation',
              description: 'Connect the tools you already use so work moves without copy-paste.',
            },
          ],
        },
      ],
    },
    {
      label: 'Creative & Branding',
      overline: 'Branding &',
      shortLabel: 'Creatives',
      href: '/creative-branding',
      icon: Palette,
      megaSection: true,
      children: [
        {
          label: 'Brand Design',
          href: '/creative-branding/brand-design',
          icon: PenTool,
          color: 'purple',
          description: 'Identity systems that stay recognizable',
          children: [
            {
              label: 'Branding Services',
              href: '/creative-branding/brand-design/branding-services',
              description: 'Brand identities built to stay recognisable across every touchpoint.',
            },
            {
              label: 'Corporate Identity Development',
              href: '/creative-branding/brand-design/corporate-identity-development',
              description: 'A consistent corporate identity across teams, offices and documents.',
            },
          ],
        },
        {
          label: 'Content Supply',
          href: '/creative-branding/content-supply',
          icon: Clapperboard,
          color: 'pink',
          description: 'A steady stream of on-brand content',
          children: [
            {
              label: 'SEO Content Services',
              href: '/creative-branding/content-supply/seo-content-services',
              description: 'Content written to rank and still worth reading.',
            },
            {
              label: 'Content Creation Services',
              href: '/creative-branding/content-supply/content-creation-services',
              description: 'A steady supply of on-brand content across the formats you need.',
            },
            {
              label: 'Video Editing',
              href: '/creative-branding/content-supply/video-editing',
              description: 'Edited video for social, advertising and your website.',
            },
          ],
        },
        {
          label: 'Brand Materials',
          href: '/creative-branding/brand-materials',
          icon: Package,
          color: 'teal',
          description: 'Print and digital assets, ready to use',
          children: [
            {
              label: 'Business Cards & Corporate Stationery',
              href: '/creative-branding/brand-materials/business-cards-corporate-stationery',
              description: 'Cards and stationery that match the rest of your brand.',
            },
            {
              label: 'Brochures, Flyers & Leaflets',
              href: '/creative-branding/brand-materials/brochures-flyers-leaflets',
              description: 'Print collateral designed to be handed over and kept.',
            },
            {
              label: 'Brand Guidelines & Internal Paperwork',
              href: '/creative-branding/brand-materials/brand-guidelines-internal-paperwork',
              description: "The rules that keep your brand consistent when you're not in the room.",
            },
          ],
        },
        {
          label: 'UI/UX Design',
          href: '/creative-branding/ui-ux-design',
          icon: MousePointer,
          description: 'Interfaces designed to be obvious',
          children: [
            {
              label: 'UI UX Design Agency',
              href: '/creative-branding/ui-ux-design/ui-ux-design-agency',
              description:
                'A design team for products, dashboards and genuinely complex interfaces.',
            },
            {
              label: 'User Experience Design Services',
              href: '/creative-branding/ui-ux-design/user-experience-design-services',
              description:
                'Research-led UX that removes friction before it ever reaches your users.',
            },
          ],
        },
        {
          label: 'Graphic Design',
          href: '/creative-branding/graphic-design',
          icon: Brush,
          description: 'Design across digital and print',
          children: [
            {
              label: 'Graphic Design Services',
              href: '/creative-branding/graphic-design/graphic-design-services',
              description: 'Day-to-day design support across every format you need.',
            },
            {
              label: 'Graphic Design Agency',
              href: '/creative-branding/graphic-design/graphic-design-agency',
              description: 'A design partner for bigger campaigns and continuing work.',
            },
          ],
        },
      ],
    },
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
