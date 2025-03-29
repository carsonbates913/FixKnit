import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div>
      <p>hello</p>
      <Outlet />
    </div>
  )
}