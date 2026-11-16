import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  as?: 'h1' | 'h2'
  className?: string
}

/** Heading block with the system's ink rule on the left and a mono "// eyebrow". */
export function SectionHeading({ eyebrow, title, description, as: Tag = 'h2', className }: SectionHeadingProps) {
  return (
    <div className={cn('grid gap-2 border-l-2 border-foreground pl-5', className)}>
      <span className="eyebrow">
        <span className="text-signal-ink">// </span>
        {eyebrow}
      </span>
      <Tag
        className={cn(
          'font-bold text-balance',
          Tag === 'h1'
            ? 'text-[clamp(36px,5vw,52px)] leading-[1.02] tracking-[-0.04em]'
            : 'text-[clamp(26px,3.2vw,34px)] leading-[1.08] tracking-[-0.03em]',
        )}
      >
        {title}
      </Tag>
      {description && <p className="max-w-[62ch] text-pretty text-muted-foreground">{description}</p>}
    </div>
  )
}
