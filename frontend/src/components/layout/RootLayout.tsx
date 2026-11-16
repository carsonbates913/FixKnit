import { Link, Outlet, ScrollRestoration } from 'react-router-dom'

import { Logo } from '@/components/brand/Logo'

import { Navbar } from './Navbar'

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-8 text-sm text-muted-foreground sm:px-6">
          <Logo className="text-muted-foreground [&_span]:text-[15px]" />
          <span>Repair guidance for knitters, menders and everyone in between.</span>
          <nav aria-label="Footer" className="ml-auto flex gap-4">
            <Link to="/explore" className="hover:text-foreground">Explore</Link>
            <Link to="/repair" className="hover:text-foreground">Repair</Link>
          </nav>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
