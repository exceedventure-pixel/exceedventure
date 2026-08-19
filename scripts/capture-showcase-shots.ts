/**
 * Screenshots every site in the Website Showcase and works out whether it can
 * be embedded — run with: pnpm capture:showcase
 *
 * Prerequisite: `npx playwright install chromium`. @playwright/test is in
 * devDependencies but the browser binaries are a separate download.
 *
 * For each showcase entry this opens the site in headless Chromium, reads the
 * framing headers off the navigation response, dismisses cookie banners, scrolls
 * the whole page to wake lazy images, screenshots it full-page at 1440px wide,
 * uploads that into Media, and writes the result back onto the entry.
 *
 * Deliberately a developer task, not a build step or a Payload hook: there is no
 * Chromium binary on the deploy host. Run it locally after adding sites, or from
 * CI against the production DATABASE_URL and storage credentials.
 *
 *   pnpm capture:showcase                      # only entries missing a poster
 *   pnpm capture:showcase --force              # everything, again
 *   pnpm capture:showcase --url=https://x.com  # just this one
 *   pnpm capture:showcase --id=12
 *   pnpm capture:showcase --headed --timeout=60000
 */

import { chromium, type Page } from '@playwright/test'
import { getPayload } from 'payload'
import sharp from 'sharp'
// Relative, not the `@payload-config` / `@/…` aliases — same reason
// scripts/push-schema.ts does it: this runs outside Next, so nothing guarantees
// the aliases resolve.
import config from '../src/payload.config'
import { getServerSideURL } from '../src/utilities/getURL'

/** The design width the card renders at — poster and iframe must agree. */
const CAPTURE_WIDTH = 1440
/** A real viewport height, so the site's own vh units land where it expects. */
const CAPTURE_VIEWPORT_HEIGHT = 900
/** Past this the poster stops being worth the bytes; the card never scrolls that far. */
const MAX_SHOT_HEIGHT = 5200

const argv = process.argv.slice(2)
const has = (flag: string) => argv.includes(flag)
const value = (name: string) =>
  argv.find((a) => a.startsWith(`${name}=`))?.slice(name.length + 1) ?? undefined

const force = has('--force')
const headed = has('--headed')
const onlyUrl = value('--url')
const onlyId = value('--id')
const timeout = Number(value('--timeout') ?? 45_000)

type Verdict = { status: 'allowed' | 'blocked'; reason: string }

/**
 * Can we frame this site?
 *
 * Read off the navigation response rather than a separate HEAD request: plenty
 * of sites 403 a bare request or answer HEAD differently, and we are navigating
 * anyway.
 */
function framingVerdict(headers: Record<string, string>, ourOrigin: string): Verdict {
  const xfo = (headers['x-frame-options'] ?? '').trim().toLowerCase()
  if (/deny|sameorigin|allow-from/.test(xfo)) {
    return { status: 'blocked', reason: `X-Frame-Options: ${xfo}` }
  }

  // Report-only never blocks anything, so it is not consulted.
  const csp = headers['content-security-policy'] ?? ''
  const ancestors = /(?:^|;)\s*frame-ancestors\s+([^;]*)/i.exec(csp)?.[1]?.trim().toLowerCase()

  if (ancestors) {
    const host = new URL(ourOrigin).hostname
    const permitted = ancestors.split(/\s+/).some((token) => {
      if (token === '*' || token === 'https:') return true
      if (token === ourOrigin || token === host) return true
      // `*.example.com` — the leading star covers subdomains only.
      if (token.startsWith('*.')) return host.endsWith(token.slice(1))
      return false
    })
    if (!permitted) return { status: 'blocked', reason: `CSP frame-ancestors ${ancestors}` }
    return { status: 'allowed', reason: `CSP frame-ancestors ${ancestors}` }
  }

  return { status: 'allowed', reason: xfo ? `X-Frame-Options: ${xfo}` : 'no framing headers' }
}

/**
 * Second opinion: actually try to frame it.
 *
 * Header parsing misses a `<meta http-equiv>` CSP and anything a CDN injects on
 * the way out. `iframe.onload` is useless as a signal — Chromium fires it even
 * when the frame is refused, because it loads its own error document — but it
 * logs the refusal to the *parent* page's console, which we can read.
 */
async function probeFraming(page: Page, url: string): Promise<string | null> {
  const messages: string[] = []
  page.on('console', (msg) => messages.push(msg.text()))

  await page.setContent(
    `<iframe src="${url.replace(/"/g, '&quot;')}" sandbox="allow-scripts allow-same-origin" style="width:1440px;height:800px;border:0"></iframe>`,
    { waitUntil: 'load' },
  )
  await page.waitForTimeout(5000)

  const refusal = messages.find((text) =>
    /refused to (display|frame)|frame-ancestors|x-frame-options/i.test(text),
  )
  return refusal ?? null
}

/** Best effort, never fatal — a banner left standing only affects the poster. */
async function dismissConsent(page: Page) {
  const labels = [/accept all/i, /accept cookies/i, /^accept$/i, /i agree/i, /got it/i, /allow all/i]
  for (const name of labels) {
    await page
      .getByRole('button', { name })
      .first()
      .click({ timeout: 1200 })
      .catch(() => {})
  }
}

/** Wake lazy images and scroll-reveal animations, then go back to the top. */
async function primePage(page: Page): Promise<number> {
  await page.evaluate(async () => {
    const step = 600
    const height = document.body.scrollHeight
    for (let y = 0; y < height; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 120))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(900)

  return page.evaluate(() =>
    Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
  )
}

const slug = (host: string) => host.replace(/^www\./, '').replace(/[^a-z0-9]+/gi, '-')

type Row = { title: string; verdict: string; height: string; size: string; note: string }

try {
  const payload = await getPayload({ config })
  const ourOrigin = new URL(getServerSideURL()).origin

  const { docs } = await payload.find({
    collection: 'website-showcase',
    depth: 0,
    limit: 200,
    pagination: false,
    where: onlyId
      ? { id: { equals: Number(onlyId) } }
      : onlyUrl
        ? { url: { equals: onlyUrl } }
        : force
          ? {}
          : { or: [{ poster: { exists: false } }, { 'embed.status': { equals: 'unknown' } }] },
  })

  if (!docs.length) {
    payload.logger.info('capture:showcase — nothing to do. Use --force to recapture everything.')
    process.exit(0)
  }

  const browser = await chromium.launch({ headless: !headed })
  const context = await browser.newContext({
    viewport: { width: CAPTURE_WIDTH, height: CAPTURE_VIEWPORT_HEIGHT },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'en-GB',
    // Honest about who we are. If a client's WAF blocks this, that is a
    // conversation worth having rather than a mystery to debug.
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/131.0.0.0 Safari/537.36 ExceedVentureShowcaseBot/1.0 (+https://exceedventure.com)',
  })

  const rows: Row[] = []
  let failures = 0

  // Sequential on purpose: these are client servers, not a load test.
  for (const doc of docs) {
    const url = String(doc.url)
    const title = String(doc.title ?? url)
    const page = await context.newPage()

    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout })
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})

      const verdict = framingVerdict(response?.headers() ?? {}, ourOrigin)

      const probe = await context.newPage()
      const refusal = await probeFraming(probe, url).catch(() => null)
      await probe.close()

      const finalVerdict: Verdict = refusal
        ? { status: 'blocked', reason: refusal.slice(0, 200) }
        : verdict

      await dismissConsent(page)
      const pageHeight = await primePage(page)

      const raw = await page.screenshot({
        type: 'png',
        fullPage: true,
        animations: 'disabled',
        scale: 'css',
      })

      /*
       * JPEG, not PNG. A 1440x5000 PNG of a real website runs 6-15MB; the same
       * at q82 is 300-700KB, and Payload derives seven more sizes from whatever
       * we hand it. Screenshots are photographic enough that the artefacts are
       * invisible at the ~0.3-0.5 scale the card renders them at.
       */
      const clipHeight = Math.min(pageHeight, MAX_SHOT_HEIGHT)
      const buffer = await sharp(raw)
        .extract({ left: 0, top: 0, width: CAPTURE_WIDTH, height: clipHeight })
        .jpeg({ quality: 82, progressive: true, mozjpeg: true })
        .toBuffer()

      const media = await payload.create({
        collection: 'media',
        data: { alt: `Screenshot of the ${title} website` },
        file: {
          data: buffer,
          name: `showcase-${slug(new URL(url).hostname)}-${Date.now()}.jpg`,
          mimetype: 'image/jpeg',
          size: buffer.length,
        },
      })

      await payload.update({
        collection: 'website-showcase',
        id: doc.id,
        // Running outside a Next request — the revalidate hook would throw.
        context: { disableRevalidate: true },
        data: {
          poster: media.id,
          embed: {
            ...(doc.embed ?? {}),
            status: finalVerdict.status,
            reason: finalVerdict.reason,
            checkedAt: new Date().toISOString(),
            pageHeight: clipHeight,
          },
          capture: { lastCapturedAt: new Date().toISOString(), error: null },
        },
      })

      rows.push({
        title,
        verdict: finalVerdict.status,
        height: `${clipHeight}px${pageHeight > MAX_SHOT_HEIGHT ? ' (clipped)' : ''}`,
        size: `${Math.round(buffer.length / 1024)}KB`,
        note: finalVerdict.reason,
      })
    } catch (err) {
      failures += 1
      const message = err instanceof Error ? err.message : String(err)

      // One bad site must not cost you the rest of the run.
      await payload
        .update({
          collection: 'website-showcase',
          id: doc.id,
          context: { disableRevalidate: true },
          data: { capture: { lastCapturedAt: new Date().toISOString(), error: message.slice(0, 500) } },
        })
        .catch(() => {})

      rows.push({ title, verdict: 'FAILED', height: '—', size: '—', note: message.slice(0, 120) })
    } finally {
      await page.close()
    }
  }

  await context.close()
  await browser.close()

  console.log('\ncapture:showcase\n')
  for (const row of rows) {
    console.log(
      `  ${row.verdict === 'FAILED' ? '✗' : '✓'} ${row.title.padEnd(28)} ${row.verdict.padEnd(8)} ${row.height.padEnd(18)} ${row.size.padEnd(8)} ${row.note}`,
    )
  }
  console.log(
    `\n  ${rows.length - failures} captured, ${failures} failed. ` +
      'Sites marked "blocked" fall back to the scrolling screenshot automatically.\n',
  )

  process.exit(failures ? 1 : 0)
} catch (err) {
  console.error('capture:showcase failed:', err)
  process.exit(1)
}
