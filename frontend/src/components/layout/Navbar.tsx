import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/repair', label: 'Repair' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-center gap-2 px-4">
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'rounded-md px-4 py-2 text-lg transition-colors hover:bg-surface',
                isActive && 'text-brand underline decoration-2 underline-offset-8',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
