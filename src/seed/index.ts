/**
 * Demo seed — run with: pnpm seed
 *
 * Creates 5 top-level categories + 8 sub-categories and 6 demo blog posts
 * with hero images (fetched from picsum.photos).
 *
 * Safe to re-run: skips anything whose slug already exists.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'

// ─── Lexical node helpers ─────────────────────────────────────────────────────

const txt = (text: string, format = 0) => ({ type: 'text', text, format, version: 1 })
const bold = (text: string) => txt(text, 1)

function p(...children: object[]) {
  return { type: 'paragraph', children, direction: 'ltr', format: '', indent: 0, version: 1 }
}

function h(tag: 'h2' | 'h3', text: string) {
  return { type: 'heading', tag, children: [txt(text)], direction: 'ltr', format: '', indent: 0, version: 1 }
}

function hr() {
  return { type: 'horizontalrule', version: 1 }
}

function quote(text: string) {
  return {
    type: 'quote',
    children: [txt(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

function bulletList(...items: string[]) {
  return {
    type: 'list',
    listType: 'bullet',
    start: 1,
    tag: 'ul',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: items.map((item) => ({
      type: 'listitem',
      value: 1,
      checked: undefined,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: [txt(item)],
    })),
  }
}

function numberedList(...items: string[]) {
  return {
    type: 'list',
    listType: 'number',
    start: 1,
    tag: 'ol',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: items.map((item, i) => ({
      type: 'listitem',
      value: i + 1,
      checked: undefined,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: [txt(item)],
    })),
  }
}

function doc(...children: object[]) {
  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ─── Image helper ─────────────────────────────────────────────────────────────

async function uploadImage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  seed: string,
  alt: string,
): Promise<number | null> {
  try {
    const res = await fetch(`https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/800`)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const media = await payload.create({
      collection: 'media',
      data: { alt } as any,
      file: { data: buf, mimetype: 'image/jpeg', name: `${seed}.jpg`, size: buf.byteLength },
    })
    return media.id as number
  } catch {
    console.warn(`  ⚠️  Image fetch failed for "${seed}" (offline?). Skipping.`)
    return null
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const payload = await getPayload({ config: configPromise })
  console.log('🌱 Starting seed…\n')

  // ── 1. Categories ──────────────────────────────────────────────────────────

  const catDefs = [
    // top-level
    { title: 'Technology', slug: 'technology' },
    { title: 'Design', slug: 'design' },
    { title: 'Business', slug: 'business' },
    { title: 'Tutorial', slug: 'tutorial' },
    { title: 'News', slug: 'news' },
    // children
    { title: 'Web Development', slug: 'web-development', parentSlug: 'technology' },
    { title: 'AI & Machine Learning', slug: 'ai-machine-learning', parentSlug: 'technology' },
    { title: 'Mobile Apps', slug: 'mobile-apps', parentSlug: 'technology' },
    { title: 'UI & UX', slug: 'ui-ux', parentSlug: 'design' },
    { title: 'Branding', slug: 'branding', parentSlug: 'design' },
    { title: 'Marketing', slug: 'marketing', parentSlug: 'business' },
    { title: 'Strategy', slug: 'strategy', parentSlug: 'business' },
    { title: 'Beginner Guides', slug: 'beginner-guides', parentSlug: 'tutorial' },
  ] as const

  const idBySlug: Record<string, number> = {}

  for (const def of catDefs) {
    const existing = await payload.find({
      collection: 'categories',
      where: { title: { equals: def.title } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      console.log(`  ↩  Category "${def.title}" already exists`)
      idBySlug[def.slug] = existing.docs[0].id as number
      continue
    }
    const parentId = 'parentSlug' in def ? idBySlug[def.parentSlug] : undefined
    const cat = await payload.create({
      collection: 'categories',
      data: { title: def.title, ...(parentId ? { parent: parentId } : {}) } as any,
    })
    idBySlug[def.slug] = cat.id as number
    console.log(`  ✅ Category "${'parentSlug' in def ? '  ' : ''}${def.title}" created`)
  }

  // ── 2. Demo author ─────────────────────────────────────────────────────────

  let authorId: number | null = null
  const existingUser = await payload.find({
    collection: 'users',
    where: { email: { equals: 'demo@example.com' } },
    limit: 1,
  })
  if (existingUser.docs.length > 0) {
    authorId = existingUser.docs[0].id as number
    console.log('\n  ↩  Demo author already exists')
  } else {
    try {
      const user = await payload.create({
        collection: 'users',
        data: { name: 'Demo Author', email: 'demo@example.com', password: 'Demo1234!' } as any,
      })
      authorId = user.id as number
      console.log('\n  ✅ Demo author created')
    } catch {
      console.log('\n  ↩  Could not create demo author')
    }
  }

  // ── 3. Posts ───────────────────────────────────────────────────────────────

  console.log('\n📸 Fetching images…\n')

  const posts = [
    // ── Post 1
    {
      title: 'Getting Started with Modern Web Development',
      slug: 'getting-started-modern-web-development',
      cats: ['technology', 'web-development'],
      img: 'webdev-2025',
      date: '2025-01-15T10:00:00.000Z',
      excerpt: 'A practical guide to the tools, frameworks, and mindsets that define web development today.',
      content: doc(
        h('h2', 'What Is Modern Web Development?'),
        p(txt('Modern web development has evolved dramatically over the past decade. Developers now have access to powerful frameworks, build tools, and deployment pipelines that were unimaginable just a few years ago.')),
        h('h3', 'Choosing a Framework'),
        p(txt('React, Vue, Svelte, and Angular are the dominant choices for frontend development. Each has its own trade-offs in terms of learning curve, performance, and ecosystem size.')),
        bulletList(
          'React — Huge ecosystem, component model, great for SPAs',
          'Vue — Gentle learning curve, great documentation',
          'Svelte — Compiles to vanilla JS, minimal runtime overhead',
          'Next.js — Full-stack React with SSR and file-based routing',
        ),
        h('h3', 'Setting Up Your Environment'),
        p(txt('A modern dev environment typically involves Node.js, a package manager (npm, pnpm, or yarn), and a code editor like VS Code. We recommend starting with Vite for blazing-fast local builds.')),
        quote('Master HTML, CSS, and JavaScript first. Frameworks are tools, not the foundation.'),
        hr(),
        p(txt('Whether you choose Next.js for server-side rendering, Astro for static sites, or Remix for full-stack apps — the fundamentals remain the same. Invest in them early.')),
      ),
    },

    // ── Post 2
    {
      title: 'The Future of AI in Design',
      slug: 'future-ai-in-design',
      cats: ['technology', 'ai-machine-learning', 'design'],
      img: 'aidesign-2025',
      date: '2025-02-03T09:00:00.000Z',
      excerpt: 'How generative AI is changing the way designers work — and what it means for the craft.',
      content: doc(
        h('h2', 'AI Is Reshaping the Creative Process'),
        p(txt('From generative imagery to automated layout suggestions, artificial intelligence is no longer a distant concept for designers. Tools like Figma AI, Adobe Firefly, and Midjourney are changing how teams prototype and ideate.')),
        h('h3', 'Generative UI: From Prompt to Prototype'),
        p(txt('Imagine describing a dashboard interface in plain English and receiving a fully-composed wireframe in seconds. That is already possible with current LLMs paired with design system tokens.')),
        quote("AI doesn't replace designers — it amplifies their capabilities and compresses iteration cycles."),
        h('h3', 'What Designers Need to Learn'),
        numberedList(
          'Prompt engineering — how to describe design intent clearly',
          'Output curation — selecting and refining AI-generated assets',
          'Quality control — spotting AI errors and hallucinations',
          'Ethical considerations — copyright, attribution, and originality',
        ),
        h('h3', 'Ethics and Originality'),
        p(txt('As AI-generated content becomes indistinguishable from human work, the design community must grapple with questions of copyright and attribution. Always disclose AI-assisted work to clients and stakeholders.')),
        hr(),
        p(txt('The designers who will thrive are those who embrace AI as a collaborator, learning to prompt, curate, and refine outputs rather than competing with the tool itself.')),
      ),
    },

    // ── Post 3
    {
      title: 'Building a Brand That Lasts',
      slug: 'building-a-brand-that-lasts',
      cats: ['business', 'strategy', 'branding'],
      img: 'branding-2025',
      date: '2025-02-20T08:30:00.000Z',
      excerpt: 'A brand is not a logo — it is a promise. Here is how to build one that endures.',
      content: doc(
        h('h2', 'Brand Is More Than a Logo'),
        p(txt('A lasting brand is built on consistent values, a distinct voice, and a promise kept over time. Companies like Apple, Patagonia, and Airbnb did not succeed on aesthetics alone — they built deep emotional connections with their audiences.')),
        h('h3', 'The Four Pillars of Brand Identity'),
        numberedList(
          'Purpose — Why do you exist beyond profit?',
          'Positioning — Who are you for, and who are you not for?',
          'Personality — How do you speak and behave?',
          'Promise — What consistent experience do you deliver?',
        ),
        quote('A brand is the set of expectations, memories, stories, and relationships that, taken together, account for a decision to choose one product over another. — Seth Godin'),
        h('h3', 'Consistency Across Touchpoints'),
        p(txt('From your website to your invoice templates, every customer touchpoint reinforces — or undermines — your brand. Create a simple brand guide that any team member can follow.')),
        bulletList(
          'Visual identity — logo, colors, typography, photography style',
          'Voice & tone — formal vs. friendly, humor, word choices',
          'Customer experience — onboarding, support, follow-up',
          'Social presence — post cadence, content mix, engagement style',
        ),
        hr(),
        p(txt('Brands that survive decades do so not by chasing trends, but by evolving their expression while staying true to their core identity. Invest in brand clarity now, and it will pay dividends for years.')),
      ),
    },

    // ── Post 4
    {
      title: '10 UI/UX Principles Every Designer Should Know',
      slug: '10-ui-ux-principles-every-designer-should-know',
      cats: ['design', 'ui-ux'],
      img: 'uxprinciples-2025',
      date: '2025-03-10T11:00:00.000Z',
      excerpt: 'From Hick\'s Law to Fitts\'s Law, these timeless principles shape every great user experience.',
      content: doc(
        h('h2', "Design Principles That Stand the Test of Time"),
        p(txt("Good design isn't magic — it follows established cognitive and visual principles. Here are ten you should have at your fingertips.")),
        h('h3', "1. Hick's Law"),
        p(txt("The more choices a user has, the longer it takes to decide. Reduce cognitive load by limiting options and using progressive disclosure.")),
        h('h3', "2. Fitts's Law"),
        p(txt("The time to click a target depends on its size and distance. Make primary actions large and close to where users naturally rest their cursor or thumb.")),
        h('h3', '3. The Gestalt Principles'),
        p(txt("Proximity, similarity, and continuity explain how humans group visual elements. Use them to create intuitive, scannable layouts.")),
        h('h3', '4. Affordances & Signifiers'),
        p(txt("Objects should look like they function. Buttons should look clickable; sliders should look draggable. Don't make users guess.")),
        h('h3', '5. The 80/20 Rule'),
        p(txt("80% of users use 20% of features. Identify your core user flows and optimise those mercilessly before expanding scope.")),
        quote("Good UX is invisible. When users notice the interface, something has probably gone wrong."),
        h('h3', 'Applying These Principles'),
        bulletList(
          'Audit existing screens against each principle',
          'Run usability tests with 5 users to uncover the biggest pain points',
          'Prioritise fixes by frequency of use and severity of friction',
          'Iterate quickly — good UX is never done',
        ),
        hr(),
        p(txt("These principles aren't rules to follow blindly — they're lenses for understanding why some designs feel effortless and others frustrate. Apply them with context and empathy.")),
      ),
    },

    // ── Post 5
    {
      title: 'A Complete Tutorial: Setting Up Your Dev Environment',
      slug: 'complete-tutorial-setting-up-dev-environment',
      cats: ['tutorial', 'beginner-guides', 'web-development'],
      img: 'devenv-2025',
      date: '2025-04-05T07:00:00.000Z',
      excerpt: 'Step-by-step: Node.js, pnpm, VS Code, and your first Next.js project running in minutes.',
      content: doc(
        h('h2', 'Prerequisites'),
        p(txt('Before we start, ensure you have administrator access on your machine. This tutorial covers macOS and Windows (WSL2).')),
        h('h3', 'Step 1 — Install Node.js via nvm'),
        p(txt('Using nvm (Node Version Manager) lets you switch between Node versions effortlessly. This is the recommended approach over installing Node directly from the website.')),
        bulletList(
          'Visit https://github.com/nvm-sh/nvm and copy the install command',
          'Run the install command in your terminal',
          'Restart your terminal or run: source ~/.zshrc',
          'Run: nvm install --lts && nvm use --lts',
          'Verify: node --version && npm --version',
        ),
        h('h3', 'Step 2 — Install pnpm'),
        p(txt('pnpm is faster than npm and uses less disk space through its content-addressable store. Install it globally once: npm install -g pnpm')),
        h('h3', 'Step 3 — Set Up VS Code'),
        p(txt('Install VS Code and the following extensions for a great developer experience:')),
        bulletList(
          'ESLint — catch bugs and enforce code style',
          'Prettier — automatic code formatting',
          'Tailwind CSS IntelliSense — autocomplete for Tailwind classes',
          'GitLens — inline git blame and history',
          'Error Lens — inline error highlighting',
        ),
        quote('Set "editor.formatOnSave": true in your VS Code settings. Your future self will thank you.'),
        h('h3', 'Step 4 — Clone and Run'),
        p(txt('Now you are ready to clone any project and get it running:')),
        numberedList(
          'git clone https://github.com/your-org/your-project',
          'cd your-project',
          'pnpm install',
          'pnpm dev',
          'Open http://localhost:3000 in your browser',
        ),
        hr(),
        p(txt('You now have a fully functional development environment. The investment you make in tooling pays dividends every single day.')),
      ),
    },

    // ── Post 6
    {
      title: "What's Changing in Tech This Year",
      slug: 'whats-changing-in-tech-this-year',
      cats: ['news', 'technology'],
      img: 'technews-2025',
      date: '2025-05-01T12:00:00.000Z',
      excerpt: 'AI goes mainstream, edge computing matures, and open-source models close the gap with proprietary ones.',
      content: doc(
        h('h2', 'The Biggest Shifts Reshaping the Industry'),
        p(txt('From the rise of edge computing to the commoditisation of large language models, this year is shaping up to be a pivotal one for the technology sector.')),
        h('h3', 'AI Goes Mainstream'),
        p(txt('Enterprise adoption of AI tooling has crossed the chasm. Most large companies now have dedicated AI teams, and developer productivity tools powered by LLMs are becoming table stakes rather than differentiators.')),
        quote("Companies without an AI strategy today are in a similar position to those without a website in 2005."),
        h('h3', 'The Edge Computing Wave'),
        p(txt('Running compute closer to users — at the network edge — reduces latency and unlocks new real-time experiences. Platforms like Cloudflare Workers, Vercel Edge, and AWS Lambda@Edge are leading the charge.')),
        h('h3', 'Open Source Wins'),
        p(txt('Open-weight models are closing the gap with proprietary offerings. This democratises AI for smaller teams and reduces dependence on any single vendor.')),
        h('h3', 'Key Trends to Watch'),
        bulletList(
          'LLM agents that can browse, code, and act autonomously',
          'WebAssembly (Wasm) enabling high-performance apps in the browser',
          'Rust adoption growing across systems and web tooling',
          'Developer experience (DX) becoming a key competitive moat',
          'Privacy-first architectures responding to global regulation',
        ),
        hr(),
        p(txt("Staying informed isn't optional in today's landscape — it's a competitive advantage. Set aside 30 minutes each week to read industry news and follow the communities shaping what comes next.")),
      ),
    },
  ]

  for (const def of posts) {
    const existing = await payload.find({
      collection: 'posts',
      where: { title: { equals: def.title } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      console.log(`  ↩  Post "${def.title}" already exists`)
      continue
    }

    process.stdout.write(`  📸 Fetching image for "${def.title}"…`)
    const mediaId = await uploadImage(payload, def.img, def.title)
    process.stdout.write(mediaId ? ' ✓\n' : ' skipped\n')

    const catIds = def.cats.map((s) => idBySlug[s]).filter((id): id is number => id != null)

    await payload.create({
      collection: 'posts',
      data: {
        title: def.title,
        heroImage: mediaId ?? undefined,
        content: def.content as any,
        categories: catIds,
        authors: authorId ? [authorId] : [],
        publishedAt: def.date,
        _status: 'published',
        meta: { title: def.title, description: def.excerpt },
      } as any,
    })

    console.log(`  ✅ Post "${def.title}" created`)
  }

  console.log('\n✨ Seed complete!\n')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
