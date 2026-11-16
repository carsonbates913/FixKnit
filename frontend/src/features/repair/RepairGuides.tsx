import { ExternalLink } from 'lucide-react'

import type { RepairGuide } from '@/api/schema'
import { titleCase } from '@/lib/format'

export function RepairGuides({ guides }: { guides: RepairGuide[] }) {
  if (guides.length === 0) {
    return (
      <p className="text-muted-foreground">
        We don't have a material-specific guide for this garment yet. Try Explore for design ideas.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {guides.map((guide) => (
        <article key={guide.material} className="flex flex-col gap-3">
          <h3 className="text-3xl">{titleCase(guide.material)}</h3>
          <p className="text-lg leading-relaxed text-muted-foreground">{guide.instructions}</p>
          {guide.links && guide.links.length > 0 && (
            <ul className="flex flex-col gap-2">
              {guide.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand underline-offset-4 hover:underline"
                  >
                    {link.title} <ExternalLink className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  )
}
