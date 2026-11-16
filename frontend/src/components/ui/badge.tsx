import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-[13px] font-semibold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary-soft text-primary-ink',
        signal: 'bg-signal-soft text-signal-ink',
        warn: 'bg-warn-soft text-warn-ink',
        neutral: 'border border-line bg-surface-2 text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
)

function Badge({ className, variant, ...props }: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
