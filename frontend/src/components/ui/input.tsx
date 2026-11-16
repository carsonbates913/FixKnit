import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-md border border-line-strong bg-surface px-4 text-base text-foreground transition-[border-color,box-shadow] outline-none',
        'placeholder:text-muted-foreground focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--primary-soft)] focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
