import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

import background from '@/assets/landing-page-background.svg'
import blueSweater from '@/assets/blue-sweater.svg'
import logo from '@/assets/fix-knit-logo.svg'
import pinkSweater from '@/assets/pink-sweater.svg'
import yellowSweater from '@/assets/yellow-sweater.svg'

const steps = [
  { image: blueSweater, text: 'Find a design you love in Explore' },
  { image: pinkSweater, text: 'Upload a photo of your damaged garment' },
  { image: yellowSweater, text: 'Learn how to repair it — and make it better than new' },
]

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
})

export function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-background to-mint">
      <section
        className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-4 bg-cover bg-center px-4 pb-24 text-center"
        style={{ backgroundImage: `url(${background})` }}
      >
        <motion.img src={logo} alt="FixKnit" className="h-48 sm:h-72" {...rise(0.2)} />
        <motion.h1 className="text-2xl sm:text-3xl" {...rise(0.4)}>
          Revive, Repair, Reimagine
        </motion.h1>
        <motion.p className="text-xl sm:text-2xl" {...rise(0.6)}>
          Sustainable fixes for your favourite clothes.
        </motion.p>
        <motion.div {...rise(0.8)}>
          <Link
            to="/repair"
            className="mt-10 inline-flex h-16 w-52 items-center justify-center border-2 border-brand text-2xl outline-brand transition-all hover:outline-2"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      <motion.section
        className="px-4 pb-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 rounded-2xl bg-background p-8 text-center shadow-[0_0_8px_rgba(0,0,0,0.3)] sm:p-12">
          <h2 className="text-5xl sm:text-6xl">Mission</h2>
          <p className="max-w-3xl text-xl sm:text-2xl">
            Our mission is to empower people to repair their clothes sustainably with crochet, knitting
            and embroidery. FixKnit helps you discover creative designs that breathe new life into
            garments, promoting mindful fashion and reducing waste.
          </p>
          <ol className="grid w-full gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <motion.li
                key={step.text}
                className="flex flex-col items-center gap-4 rounded-xl bg-brand p-6 text-white shadow-md"
                whileHover={{ scale: 1.05, rotate: index === 0 ? 0 : 3 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <img src={step.image} alt="" className="h-24" />
                <span className="text-lg font-bold">
                  {index + 1}. {step.text}
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
      </motion.section>
    </div>
  )
}
