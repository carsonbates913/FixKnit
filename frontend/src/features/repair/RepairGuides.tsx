import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Label, RepairGuide } from '@/api/schema'
import { percent, titleCase } from '@/lib/format'

export function RepairGuides({ guides }: { guides: RepairGuide[] }) {
  if (guides.length === 0) {
    return (
      <div className="grid gap-2 rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
        <p>There’s no material-specific guide for this garment yet.</p>
        <Link to="/explore" className="font-semibold text-primary-ink hover:underline">
          Browse repair designs instead
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {guides.map((guide) => (
        <article key={guide.material} className="grid gap-3 rounded-lg border bg-surface p-5">
          <header className="flex items-baseline justify-between gap-3">
            <h3 className="text-xl font-bold tracking-[-0.025em]">Repairing {guide.material}</h3>
            <span className="eyebrow">{titleCase(guide.material)}</span>
          </header>
          <p className="text-pretty text-muted-foreground">{guide.instructions}</p>
          {guide.links && guide.links.length > 0 && (
            <ul className="grid gap-1 border-t pt-3">
              {guide.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary-ink hover:underline"
                  >
                    {link.title}
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" strokeWidth={1.8} />
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

export function RawLabels({ labels }: { labels: Label[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <caption className="sr-only">Every label the vision model returned</caption>
        <thead className="bg-surface-2">
          <tr className="eyebrow text-left">
            <th className="px-4 py-2 font-medium">Label</th>
            <th className="px-4 py-2 text-right font-medium">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {labels.map((label) => (
            <tr key={label.description}>
              <td className="px-4 py-2">{label.description}</td>
              <td className="px-4 py-2 text-right font-mono tabular-nums">{percent(label.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
