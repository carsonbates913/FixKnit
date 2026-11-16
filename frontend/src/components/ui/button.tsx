import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold tracking-[-0.005em] transition-[background-color,box-shadow,filter,transform] duration-150 select-none disabled:pointer-events-none disabled:opacity-45 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
  {
    variants: {
      variant: {
        primary: 'sheen bg-primary text-primary-foreground shadow-primary hover:brightness-110',
        secondary:
          'border border-line-strong bg-gradient-to-b from-surface to-surface-2 text-foreground shadow-sm hover:border-foreground/40',
        ghost: 'text-foreground hover:bg-surface-2',
        link: 'h-auto px-0 text-primary-ink underline-offset-4 hover:underline active:translate-y-0',
      },
      size: {
        sm: 'h-8 px-3 text-[13.5px]',
        md: 'h-10 px-4 text-[14.5px]',
        lg: 'h-12 px-5 text-[15px]',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
