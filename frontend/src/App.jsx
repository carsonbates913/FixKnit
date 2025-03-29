import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import RootLayout from './layouts/RootLayout'
import LandingPage from './pages/LandingPage'
import ExplorePage from './pages/ExplorePage'
import RepairPage from './pages/RepairPage'
import ChatPage from './pages/ChatPage'
import FAQPage from './pages/FAQPage'

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
        {
          path: '/chat',
          element: <ChatPage />,
        },
        {
          path: '/FAQ',
          element: <FAQPage />,
        }
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
