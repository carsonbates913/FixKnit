import type { Technique } from '@/api/schema'

/** Soft 3D craft illustrations (AI-generated, see assets/icons). */
export const craftIcons = {
  home: require('../../assets/icons/home.png'),
  create: require('../../assets/icons/create.png'),
  projects: require('../../assets/icons/projects.png'),
  profile: require('../../assets/icons/profile.png'),
  crochet: require('../../assets/icons/crochet.png'),
  knitting: require('../../assets/icons/knitting.png'),
  sewing: require('../../assets/icons/sewing.png'),
} as const

export const techniqueIcon: Record<Technique, number> = {
  knitting: craftIcons.knitting,
  crochet: craftIcons.crochet,
  embroidery: craftIcons.sewing,
}
