import { Outlet, ScrollRestoration } from 'react-router-dom'

import { Navbar } from './Navbar'

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <ScrollRestoration />
    </div>
  )
}
