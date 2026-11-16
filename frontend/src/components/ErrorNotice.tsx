import { CircleAlert, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface NoticeProps {
  title: string
  children?: ReactNode
  tone?: 'danger' | 'signal'
  action?: ReactNode
  className?: string
}

export function Notice({ title, children, tone = 'danger', action, className }: NoticeProps) {
  const Icon = tone === 'danger' ? CircleAlert : Sparkles
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'note'}
      className={cn(
        'flex items-start gap-3 rounded-md border p-4 text-sm',
        tone === 'danger'
          ? 'border-danger/30 bg-danger-soft text-danger-ink'
          : 'border-signal/30 bg-signal-soft text-signal-ink',
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
      <div className="grid flex-1 gap-0.5">
        <b className="font-semibold">{title}</b>
        {children && <span>{children}</span>}
      </div>
      {action}
    </div>
  )
}

export function ErrorNotice({ error, action }: { error: Error; action?: ReactNode }) {
  return (
    <Notice title="Something went wrong" action={action}>
      {error.message}
    </Notice>
  )
}
