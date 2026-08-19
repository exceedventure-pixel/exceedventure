import type { ServiceColor } from '@/components/ServiceDetail/colors'
import type { ServiceHeroContent } from '@/components/ServiceDetail/ServiceHero'

/**
 * The four main services, in one place.
 *
 * Written once and read twice: the service pages render `headline`/`pain` as
 * their hero, and the homepage's opening loop renders `slide` as its frames.
 * Two voices for two audiences (see `slide` below for why) but one file, so
 * the colour, the link and the naming can never drift apart the way the copy
 * once did.
 *
 * The voice is set by automation-ai: the headline is the verdict, the pain line
 * is the evidence — three concrete fragments, an em dash, then the cost. Keep
 * the pain lines structurally parallel, because they play back to back in the
 * loop and the rhythm is what makes them land. Let the headlines vary; four
 * identical grammatical shapes in a row read as a filled-in template.
 */

export type ServiceKey =
  'websites-softwares' | 'digital-marketing' | 'automation-ai' | 'creative-branding'

export type ServiceCopy = {
  href: string
  /** Short name. The kicker above the headline on the opening loop's slides. */
  name: string
  /**
   * The H1, written clean — no trailing space. `ServiceHero` needs one before
   * the accent, and `serviceHero()` below adds it. A meaningful trailing space
   * stored in a literal survives exactly until an editor trims whitespace on
   * save, and then the page quietly reads "yourbest".
   */
  headline: string
  /** Accented tail of the headline. */
  headlineAccent: string
  /**
   * One sentence of recognition, under eighty characters. Also becomes the
   * Service JSON-LD description, so it is SEO-visible, not decoration.
   */
  pain: string
  /**
   * The page's colour, and the same value it passes to `ServiceHero`. Resolve
   * it through `colorMap` for classes rather than writing them out here — the
   * two used to be duplicated and the opening loop's glow had already drifted a
   * shade off the page's.
   */
  color: ServiceColor
  /**
   * What the homepage's opening loop says for this service — deliberately not
   * the same words as the page H1 above.
   *
   * The two do different jobs. A service page is reached by someone already
   * looking for that service, so its H1 leads with the pain they arrived with.
   * The slide has a couple of seconds with a visitor who may not know what we
   * sell, so it leads with the benefit in plain words. Keeping both here means
   * they still live in one file and can be read against each other.
   */
  slide: SlideCopy
}

/** A single frame of the homepage's opening loop. */
export type SlideCopy = {
  /** Headline, split so the tail can take the service's accent colour. */
  lead: string
  accent: string
  /** The line under it — one sentence, plain language, no jargon. */
  sub: string
  /**
   * The slide's button. A verb, two to four words: it is read in under two
   * seconds and has to say what happens next without the headline's help.
   */
  cta: string
}

export const SERVICE_COPY: Record<ServiceKey, ServiceCopy> = {
  'websites-softwares': {
    href: '/websites-softwares',
    name: 'Websites & Softwares',
    // Left alone: the only one of the four whose H1 already carries its keyword
    // and reads well. Changing it would be all risk and no gain.
    headline: 'Your website should be',
    headlineAccent: 'your best salesperson.',
    pain: 'Slow to load, dated, impossible to edit — and quietly losing you enquiries.',
    color: 'teal',
    slide: {
      lead: 'BUILD YOUR',
      accent: 'DIGITAL HOME',
      sub: 'Websites, software & digital platforms built for your business.',
      cta: 'See what we build',
    },
  },
  'digital-marketing': {
    href: '/digital-marketing',
    name: 'Digital Marketing',
    // The previous H1 ("Spending, without knowing what works.") never said
    // "marketing" — a missing keyword on a money page. This puts it first.
    headline: 'Marketing you cannot',
    headlineAccent: 'trace to a sale.',
    pain: 'Ads running, posts going out, spend approved — nobody can say what worked.',
    color: 'blue',
    slide: {
      lead: 'GET FOUND.',
      accent: 'GET CUSTOMERS.',
      sub: 'SEO, social media & digital campaigns that bring your business online.',
      cta: 'Get found online',
    },
  },
  'automation-ai': {
    href: '/automation-ai',
    name: 'Automation & AI',
    // The reference the other three are written against. Do not touch it.
    headline: 'Stop doing work a',
    headlineAccent: 'computer should do.',
    pain: 'Copying data, chasing updates, retyping replies — days a month, gone.',
    color: 'red',
    slide: {
      lead: 'WORK SMARTER,',
      accent: 'NOT HARDER',
      sub: 'Automate repetitive tasks and connect your business workflows.',
      cta: 'Automate the busywork',
    },
  },
  'creative-branding': {
    href: '/creative-branding',
    name: 'Creative & Branding',
    // Keeps the mechanism of the old line — forgettable, so price is the only
    // thing left to compare — while getting "brand" into the H1.
    headline: 'A brand nobody remembers',
    headlineAccent: 'competes on price.',
    pain: 'Mismatched materials, borrowed ideas, no story — you blend into the noise.',
    color: 'purple',
    slide: {
      lead: 'LOOK PROFESSIONAL.',
      accent: 'STAND OUT.',
      sub: 'Brand identity, graphics & creative content that make your business memorable.',
      cta: 'Build your brand',
    },
  },
}

/** The order the opening loop plays them in. */
export const SERVICE_ORDER: ServiceKey[] = [
  'websites-softwares',
  'digital-marketing',
  'automation-ai',
  'creative-branding',
]

/**
 * The hero fields a service page shares with the opening loop.
 *
 * Spread this into a page's `hero` prop; everything page-specific — the badge,
 * the symptoms, the CTAs — stays inline on the page where it belongs.
 */
export const serviceHero = (key: ServiceKey): ServiceHeroContent => {
  const copy = SERVICE_COPY[key]
  return {
    headline: `${copy.headline} `,
    headlineAccent: copy.headlineAccent,
    pain: copy.pain,
  }
}
