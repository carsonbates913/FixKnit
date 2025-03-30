import { NavLink } from 'react-router-dom'
import './Navbar.css';

export default function Navbar() {
  return (
    <nav>

      <NavLink to="/explore" activeclassname="active-link">Explore</NavLink>
      <NavLink to="/repair" activeclassname="active-link">Repair</NavLink>
      <NavLink to="/chat" activeclassname="active-link">Chat</NavLink>
      <NavLink to="/FAQ" activeclassname="active-link">FAQ</NavLink>

    </nav>
  )
}