import { motion } from 'motion/react'

import type { InspirationImage } from '@/api/schema'

export function ImageGrid({ images }: { images: InspirationImage[] }) {
  if (images.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No designs found. Try another search.</p>
  }

  return (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 rounded-2xl bg-surface p-4 sm:p-6">
      {images.map((image, index) => (
        <motion.a
          key={image.url}
          href={image.source_url ?? image.url}
          target="_blank"
          rel="noopener noreferrer"
          title={image.title}
          className="block overflow-hidden rounded-lg border bg-background"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index, 10) * 0.05, duration: 0.4 }}
        >
          <img
            src={image.url}
            alt={image.title}
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </motion.a>
      ))}
    </div>
  )
}
