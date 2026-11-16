import { Link, NavLink } from 'react-router-dom'

import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

const links = [
  { to: '/explore', label: 'Explore' },
  { to: '/repair', label: 'Repair' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="FixKnit home" className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Main" className="ml-auto flex items-center gap-1">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground',
                  isActive && 'bg-surface-2 text-foreground',
                )
              }
            >
              {label}
            </NavLink>
          ))}
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
