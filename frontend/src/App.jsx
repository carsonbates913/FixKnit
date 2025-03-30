import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import RootLayout from './layouts/RootLayout'
import LandingPage from './pages/LandingPage'
import ExplorePage from './pages/ExplorePage'
import RepairPage from './pages/RepairPage'

function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout/>,
      children: [
        {
          path: '/',
          element: <LandingPage />,
        },
        {
          path: '/explore',
          element: <ExplorePage />,
        },
        {
          path: '/repair',
          element: <RepairPage />,
        },
      ]
    }
  ])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
