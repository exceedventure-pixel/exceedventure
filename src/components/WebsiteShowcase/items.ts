import type { ShowcaseItem } from './types'

/**
 * The website showcase — hard-coded.
 *
 * This section used to be driven by the `website-showcase` collection in the
 * admin, read through `getWebsiteShowcase`. It is a list of six client sites
 * that changes a couple of times a year and needs a screenshot per entry that
 * can only be produced on a machine with Chromium — so the CMS round-trip
 * bought nothing. The list now lives here and the posters live in
 * `public/assets/showcase/`.
 *
 * To change what shows on the homepage, edit this array and commit. To refresh
 * a screenshot: capture the site full-page at 1440px wide, drop the JPG into
 * `public/assets/showcase/`, and update `posterHeight` to the new pixel height.
 *
 * Field notes (mirrors what `getWebsiteShowcase` used to compute):
 *  - `host` / `displayUrl` — the card's link target and fake address bar.
 *  - `posterHeight` — the poster's real pixel height at 1440px wide. The card
 *    scrolls exactly this far when it is showing the screenshot rather than the
 *    live frame, so it has to match the image or the scroll over- or undershoots.
 *  - `canEmbed` — whether the card may mount a live <iframe> of the site. All
 *    six were verified framable (X-Frame-Options / CSP `frame-ancestors`) at
 *    capture time; flip to `false` for any site that later starts blocking it
 *    and the card falls back to the scrolling screenshot with nothing missing.
 *  - `viewportHeight` — the live frame's render height in CSS px, 2600 for all.
 */
export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 1,
    title: 'Haven Abodes',
    url: 'https://havenabodes.co.uk/',
    host: 'havenabodes.co.uk',
    displayUrl: 'havenabodes.co.uk',
    category: 'Website',
    posterUrl: '/assets/showcase/haven-abodes.jpg',
    posterHeight: 5200,
    canEmbed: true,
    viewportHeight: 2600,
  },
  {
    id: 2,
    title: 'AssistIntellix',
    url: 'https://assistintellix.com/',
    host: 'assistintellix.com',
    displayUrl: 'assistintellix.com',
    category: 'Web App',
    posterUrl: '/assets/showcase/assistintellix.jpg',
    posterHeight: 5200,
    canEmbed: true,
    viewportHeight: 2600,
  },
  {
    id: 3,
    title: 'Buno Home Decor',
    url: 'https://bunohomedecor.com/bd',
    host: 'bunohomedecor.com',
    displayUrl: 'bunohomedecor.com',
    category: 'E-commerce',
    posterUrl: '/assets/showcase/buno-home-decor.jpg',
    posterHeight: 2627,
    canEmbed: true,
    viewportHeight: 2600,
  },
  {
    id: 4,
    title: 'Sphinx Property Group',
    url: 'https://sphinx-propertygroup.co.uk/',
    host: 'sphinx-propertygroup.co.uk',
    displayUrl: 'sphinx-propertygroup.co.uk',
    category: 'Website',
    posterUrl: '/assets/showcase/sphinx-property-group.jpg',
    posterHeight: 3677,
    canEmbed: true,
    viewportHeight: 2600,
  },
  {
    id: 5,
    title: 'Assist Growth',
    url: 'https://assist-growth.com/',
    host: 'assist-growth.com',
    displayUrl: 'assist-growth.com',
    category: 'Website',
    posterUrl: '/assets/showcase/assist-growth.jpg',
    posterHeight: 5200,
    canEmbed: true,
    viewportHeight: 2600,
  },
  {
    id: 6,
    title: 'SK Land',
    url: 'https://sklandbd.com/',
    host: 'sklandbd.com',
    displayUrl: 'sklandbd.com',
    category: 'E-commerce',
    posterUrl: '/assets/showcase/sk-land.jpg',
    posterHeight: 4540,
    canEmbed: true,
    viewportHeight: 2600,
  },
]
