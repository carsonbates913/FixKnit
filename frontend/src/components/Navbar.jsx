import { NavLink } from 'react-router-dom'
import './Navbar.css';

export default function Navbar() {
  return (
    <nav>

      <NavLink to="/" activeclassname="active-link">Home</NavLink>
      <NavLink to="/explore" activeclassname="active-link">Explore</NavLink>
      <NavLink to="/repair" activeclassname="active-link">Repair</NavLink>

    </nav>
  )
}