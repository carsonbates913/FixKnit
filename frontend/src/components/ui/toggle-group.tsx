import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

/** A row of filter chips. Selected chips invert to ink on paper. */
function ToggleGroup({ className, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root data-slot="toggle-group" className={cn('flex flex-wrap gap-2', className)} {...props} />
  )
}

function ToggleGroupItem({ className, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        'inline-flex h-8 items-center gap-2 rounded-md border border-line-strong bg-surface px-3 text-[13.5px] font-medium transition-colors hover:border-primary',
        'data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background',
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
