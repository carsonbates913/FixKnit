import { ArrowRight, Camera, ScanSearch, Scissors } from 'lucide-react'
import { Link } from 'react-router-dom'

import { garmentTypeValues, materialValues, techniqueValues } from '@/api/schema'
import greenYarn from '@/assets/green-yarn.webp'
import { StitchGrid } from '@/components/brand/StitchGrid'
import { SectionHeading } from '@/components/SectionHeading'
import { Button } from '@/components/ui/button'

const steps = [
  {
    icon: Camera,
    title: 'Photograph the damage',
    body: 'Lay the garment flat in daylight and take one clear photo of the hole, tear or worn patch.',
  },
  {
    icon: ScanSearch,
    title: 'Get a diagnosis',
    body: 'FixKnit identifies the garment and its material, with a confidence score for each.',
  },
  {
    icon: Scissors,
    title: 'Repair it, your way',
    body: 'Follow a material-specific guide, then browse knitted, crocheted and embroidered fixes.',
  },
]

const techniques = [
  { name: 'Knitting', query: 'sweater', technique: 'knitting', stitches: 'Swiss darn · duplicate stitch', body: 'Swiss darning and duplicate stitch rebuild knit fabric stitch by stitch.' },
  { name: 'Crochet', query: 'patch', technique: 'crochet', stitches: 'Granny square · appliqué', body: 'Granny squares and appliqué cover larger holes with something new.' },
  { name: 'Embroidery', query: 'mending', technique: 'embroidery', stitches: 'Sashiko · satin stitch', body: 'Sashiko, darning and floral cover-ups make the repair the feature.' },
]

export function LandingPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b">
        <div className="grid-paper absolute inset-0 -z-10" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:py-24">
          <div className="grid justify-items-start gap-6">
            <span className="eyebrow">
              <span className="text-signal-ink">// </span>Clothing repair, measured
            </span>
            <h1 className="text-[clamp(48px,8vw,100px)] leading-[0.95] font-bold tracking-[-0.045em] text-balance">
              Revive, repair, reimagine.
            </h1>
            <p className="max-w-[52ch] text-lg text-pretty text-muted-foreground">
              Photograph a damaged garment. FixKnit tells you what it is, what it’s made of and how to mend it with
              knitting, crochet or embroidery.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/repair">
                  <Camera /> Start a repair
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/explore">Browse designs</Link>
              </Button>
            </div>
            <dl className="flex flex-wrap gap-x-6 gap-y-2 pt-2 font-mono text-xs text-muted-foreground">
              <div className="flex gap-2"><dt>Materials</dt><dd className="text-foreground">{materialValues.length}</dd></div>
              <div className="flex gap-2"><dt>Garment types</dt><dd className="text-foreground">{garmentTypeValues.length}</dd></div>
              <div className="flex gap-2"><dt>Techniques</dt><dd className="text-foreground">{techniqueValues.length}</dd></div>
            </dl>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <StitchGrid className="absolute inset-0 size-full" />
            <img
              src={greenYarn}
              alt="A green ball of yarn"
              className="absolute top-[8%] left-[6%] w-[58%] drop-shadow-[0_28px_30px_rgb(10_40_25/0.28)]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-20">
        <SectionHeading
          eyebrow="How it works"
          title="From hole to finished repair in three steps"
          description="FixKnit does the diagnosis, so you can get straight to the mending."
        />
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="grid content-start gap-4 rounded-lg border bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-md border bg-surface-2 text-primary-ink">
                  <step.icon className="size-5" strokeWidth={1.6} />
                </span>
                <span className="font-mono text-xs text-muted-foreground">Step {index + 1} / 3</span>
              </div>
              <h3 className="text-lg font-semibold tracking-[-0.01em]">{step.title}</h3>
              <p className="text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y bg-background-2">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-20">
          <SectionHeading
            eyebrow="Techniques"
            title="Three ways to make a repair the best part"
            description="Visible mending turns damage into design. Pick a technique to see what other menders have made."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {techniques.map((t) => (
              <Link
                key={t.name}
                to={`/explore?q=${t.query}&technique=${t.technique}`}
                className="group grid content-start gap-3 rounded-lg border bg-surface p-6 transition-[border-color,box-shadow] hover:border-foreground/40 hover:shadow-md"
              >
                <span className="eyebrow">{t.stitches}</span>
                <h3 className="text-2xl font-bold tracking-[-0.03em]">{t.name}</h3>
                <p className="text-muted-foreground">{t.body}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-ink">
                  See designs <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:py-20">
        <SectionHeading
          eyebrow="Why repair"
          title="The most sustainable sweater is the one you already own"
          description="Mending keeps clothes in use and out of landfill. FixKnit helps you repair with crochet, knitting and embroidery, and makes the result something to show off."
        />
        <Button asChild size="lg">
          <Link to="/repair">
            Start a repair <ArrowRight />
          </Link>
        </Button>
      </section>
    </>
  )
}
