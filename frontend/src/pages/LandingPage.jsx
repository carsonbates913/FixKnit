import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react'

import './LandingPage.css';
import hero from '../assets/fix-knit-logo.svg';

export default function LandingPage() {
  return (
    <main className="landing-page">
<motion.section 
      className="hero"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <motion.img 
        src={hero} 
        alt="Hero Image" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }} 
        transition={{
          duration: 0.7,
          delay: 0.3,
        }}
      />
      
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.5,
        }}
      >
        Revive, Repair, Reimagine
      </motion.h2>
      
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.7,
        }}
      >
        Sustainable Fixes for Your Favorite Clothes.
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.9,
        }}
      >
        <NavLink className="get-started" to="/explore">
          Get Started
        </NavLink>
      </motion.div>
    </motion.section>
    
    <motion.section       whileInView={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 1, ease: 'easeInOut' }}className="mission" style={{ fontFamily: 'Baskerville, serif' }}
      viewport={{amount: .4}}>
      <div className="mission-content">
        <motion.h1 
          className="mission-title" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1 }}
        >
          Mission
        </motion.h1>

        <motion.h2 
          className="mission-statement" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          Our mission is to empower individuals to sustainably repair their clothes using crochet, knitting, and embroidery. We provide a platform for discovering creative designs that breathe new life into garments, promoting mindful fashion and reducing waste.
        </motion.h2>

        <div className="card-containers">

          <motion.div 
            className="step-card"
            whileHover={{ scale: 1.1}} 
            transition={{ duration: .2, type: 'spring',}}
          >
            <h1>1. Find a design that you like</h1>
          </motion.div>


          <motion.div 
            className="step-card"
            whileHover={{ scale: 1.1, rotate: 5 }} 
            transition={{ duration: .6, type: 'spring'}}
          >
            <h2>2. Submit your damaged clothing into the garment repair selection</h2>
          </motion.div>


          <motion.div 
            className="step-card"
            whileHover={{ scale: 1.1, rotate: 5 }} 
            transition={{ duration: .6, type: 'spring'}}
          >
            <h3>3. Learn how to improve it like never before!</h3>
          </motion.div>
        </div>
      </div>
    </motion.section>
    </main>
  )
}