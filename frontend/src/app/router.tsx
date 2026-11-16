import { createBrowserRouter } from 'react-router-dom'

import { RootLayout } from '@/components/layout/RootLayout'
import { ExplorePage } from '@/features/explore/ExplorePage'
import { LandingPage } from '@/features/landing/LandingPage'
import { RepairPage } from '@/features/repair/RepairPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'repair', element: <RepairPage /> },
    ],
  },
])
