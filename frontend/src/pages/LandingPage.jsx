import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import './LandingPage.css';
import hero from '../assets/fix-knit-logo.svg';

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="hero">
        <img src={hero}></img>
        <h2>
        Revive, Repair, Reimagine
        </h2>
        <h2>
        Sustainable Fixes for Your Favorite Clothes.
        </h2>
        <NavLink className="get-started" to="/explore">
          Get Started
        </NavLink>
      </section>
      <section className="mission">
        <div className="mission-content">
          <h1>Mission</h1>
          <h2>I love this very much</h2>
          <div className="card-containers"></div>
        </div>
      </section>
    </main>
  )
}