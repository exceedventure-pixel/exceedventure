import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { PageSEO } from './collections/PageSEO'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { CrmAccounts } from './collections/crm/Accounts'
import { ClientAccounts } from './collections/crm/ClientAccounts'
import { Clients } from './collections/crm/Clients'
import { Contacts } from './collections/crm/Contacts'
import { Projects } from './collections/crm/Projects'
import { Invoices } from './collections/crm/Invoices'
import { Payments } from './collections/crm/Payments'
import { Tasks } from './collections/crm/Tasks'
import { ProjectRequests } from './collections/crm/ProjectRequests'
import { Conversations } from './collections/crm/Conversations'
import { Messages } from './collections/crm/Messages'
import { Resources } from './collections/crm/Resources'
import { Notifications } from './collections/crm/Notifications'
import { Enquiries } from './collections/crm/Enquiries'
import { SiteSettings } from './globals/SiteSettings'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { ensureAdminUser } from './utilities/ensureAdminUser'
import { ensureStaffAdmin } from './utilities/ensureStaffAdmin'
import { resendAdapter } from './crm/email'
import { ensurePageSeo } from './utilities/ensurePageSeo'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/payload',
    },
  }),
  collections: [
    PageSEO,
    Posts,
    Media,
    Categories,
    Users,
    // ─── CRM + client dashboard ────────────────────────────────────────────
    // Hidden from this admin and managed through /crm. `admin.user` stays
    // Users.slug below, so neither account collection can reach the admin panel.
    // Staff (/crm) and clients (/portal) are separate collections, so a client
    // has no structural path to staff privileges.
    Clients,
    CrmAccounts,
    ClientAccounts,
    Contacts,
    Projects,
    Invoices,
    Payments,
    Tasks,
    ProjectRequests,
    Conversations,
    Messages,
    Resources,
    Notifications,
    Enquiries,
  ],
  // Runs on every boot, so a deploy brings the CMS in line with the code:
  // a guaranteed admin login, and a page-seo record for every page.
  // Both are idempotent and neither throws.
  onInit: async (payload) => {
    await ensureAdminUser(payload)
    // Without this there is no way to create the first /crm login: the
    // collection only lets an existing staff admin create one.
    await ensureStaffAdmin(payload)
    await ensurePageSeo(payload)
  },
  // Payload sends its own emails — password resets above all. Without this they
  // are written to the console and the reset flow silently does nothing.
  email: resendAdapter(),
  cors: [getServerSideURL()].filter(Boolean),
  globals: [SiteSettings],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
