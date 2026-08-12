import React from 'react'
import { portalQuery } from '@/crm/data'
import { PageHeader, Card, Badge, humanise, EmptyState } from '@/crm/ui/primitives'
import { Library } from 'lucide-react'
import { relId } from '@/crm/parse'

/**
 * Everything shared with this client, in one place.
 *
 * Grouped by project, with account-wide items first — which is how people
 * actually look for a Drive link: "the one from the rebrand", not "the fourth
 * item in a flat list".
 */
export default async function PortalResources() {
  const { payload, as } = await portalQuery()

  const [resources, projects] = await Promise.all([
    payload.find({ collection: 'resources', limit: 200, sort: 'order', depth: 0, ...as }),
    payload.find({ collection: 'projects', limit: 100, depth: 0, ...as }),
  ])

  const projectName = new Map(projects.docs.map((p) => [String(p.id), p.name]))

  const groups = new Map<string, typeof resources.docs>()
  for (const r of resources.docs) {
    const projectId = relId(r.project)
    const heading =
      r.kind === 'custom' && r.section
        ? r.section
        : projectId
          ? (projectName.get(String(projectId)) ?? 'Project')
          : 'Shared with you'
    groups.set(heading, [...(groups.get(heading) ?? []), r])
  }

  return (
    <>
      <PageHeader icon={<Library />} title="Resources" description="Files, folders and links we have shared." />

      {resources.docs.length === 0 ? (
        <EmptyState
          title="Nothing shared yet"
          description="Design files, drive folders and staging links will collect here."
        />
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([heading, items]) => (
            <section key={heading}>
              <h2 className="mb-3 text-sm font-semibold">{heading}</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((r) => (
                  <Card key={r.id}>
                    <a
                      href={r.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 hover:bg-muted/40"
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-medium">{r.label}</span>
                        <Badge>{humanise(r.kind)}</Badge>
                      </span>
                      {(r.caption || r.notes) && (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {r.caption || r.notes}
                        </span>
                      )}
                      <span className="mt-3 block text-[11px] font-medium text-primary">
                        Open →
                      </span>
                    </a>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
