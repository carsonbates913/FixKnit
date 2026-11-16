"""Canned diagnoses for demos and tests, chosen deterministically from the photo's bytes."""

import hashlib

from app.domain.taxonomy import GarmentType, Material, Technique
from app.schemas.diagnosis import Damage, DamageKind, DiagnosisResult, RepairOption, Severity

DEMO_NOTE = (
    "Demo diagnosis: the AI model isn’t connected yet, so this is one of three sample results."
)

SCENARIOS: list[DiagnosisResult] = [
    DiagnosisResult(
        garment=GarmentType.SWEATER,
        garment_confidence=0.95,
        material=Material.WOOL,
        material_confidence=0.88,
        damages=[
            Damage(
                kind=DamageKind.HOLE, location="Left elbow", size_cm=2.0, severity=Severity.MODERATE
            )
        ],
        options=[
            RepairOption(
                id="woven-darn",
                title="Woven darn",
                summary="Rebuild the fabric with a grid of matching yarn. Strong and nearly invisible on a busy knit.",
                visibility="invisible",
                difficulty=2,
                minutes=40,
                materials=[
                    "Darning needle",
                    "Matching wool yarn, same weight",
                    "Darning mushroom or jar lid",
                ],
                steps=[
                    "Turn the sweater inside out and stretch the hole gently over the darning mushroom.",
                    "Stitch a running-stitch circle 1 cm outside the hole to stabilise loose stitches.",
                    "Lay vertical threads across the hole, 2 mm apart, anchoring into healthy stitches.",
                    "Weave horizontally over and under the vertical threads, alternating each row.",
                    "Weave the tails into the back of the darn and steam lightly to settle it.",
                ],
            ),
            RepairOption(
                id="swiss-darn-heart",
                title="Swiss-darned heart",
                summary="Duplicate-stitch a small motif over the hole in a contrasting colour. The repair becomes the feature.",
                technique=Technique.KNITTING,
                visibility="visible",
                difficulty=3,
                minutes=90,
                materials=[
                    "Tapestry needle",
                    "Contrast wool yarn",
                    "Scrap yarn for a support grid",
                ],
                steps=[
                    "Chart a heart about 4 stitches wider than the hole on graph paper.",
                    "Bridge the hole with a ladder of scrap yarn so there is something to stitch over.",
                    "Follow each knit V with the contrast yarn, working row by row from the bottom.",
                    "Cover the bridged area completely, keeping your tension even with the knit.",
                    "Remove visible scrap yarn, weave in ends and block flat.",
                ],
            ),
            RepairOption(
                id="crochet-flower",
                title="Crochet flower patch",
                summary="Crochet a small flower and stitch it over the reinforced hole. Quick and beginner-friendly.",
                technique=Technique.CROCHET,
                visibility="visible",
                difficulty=1,
                minutes=45,
                materials=[
                    "3.5 mm crochet hook",
                    "Two colours of DK yarn",
                    "Sewing needle and thread",
                ],
                steps=[
                    "Close the hole loosely with a few whip stitches so it can’t grow.",
                    "Crochet a magic ring with 10 double crochets, then 5 petals of chain-3 and treble clusters.",
                    "Add a contrasting centre round and fasten off.",
                    "Pin the flower over the hole and whip-stitch around each petal from the inside.",
                ],
            ),
        ],
    ),
    DiagnosisResult(
        garment=GarmentType.PANTS,
        garment_confidence=0.93,
        material=Material.DENIM,
        material_confidence=0.91,
        damages=[
            Damage(
                kind=DamageKind.TEAR, location="Right knee", size_cm=6.0, severity=Severity.SEVERE
            )
        ],
        options=[
            RepairOption(
                id="sashiko-patch",
                title="Sashiko patch",
                summary="Back the tear with a denim scrap and cover it in rows of Japanese running stitch.",
                technique=Technique.EMBROIDERY,
                visibility="visible",
                difficulty=2,
                minutes=120,
                materials=[
                    "Denim scrap, 3 cm larger than the tear",
                    "Sashiko thread",
                    "Sashiko or long embroidery needle",
                    "Fabric chalk",
                ],
                steps=[
                    "Trim loose threads and pin the scrap behind the tear, right side facing out.",
                    "Chalk a grid of parallel lines 5 mm apart across the patch area.",
                    "Work running stitches along each line, 3–4 stitches per centimetre.",
                    "Add perpendicular rows for a cross-hatch, or keep them parallel for a classic look.",
                    "Knot inside and trim the backing patch to 1 cm beyond the stitching.",
                ],
            ),
            RepairOption(
                id="machine-darn",
                title="Machine darn",
                summary="Close the tear with dense back-and-forth machine stitching over an iron-on backing.",
                visibility="invisible",
                difficulty=2,
                minutes=30,
                materials=["Sewing machine", "Iron-on denim patch", "Thread matched to the denim"],
                steps=[
                    "Iron the backing patch inside the leg behind the tear.",
                    "Set a short straight stitch and sew forwards and back across the tear, 2 mm apart.",
                    "Rotate 90° and repeat for strength.",
                    "Trim threads and press.",
                ],
            ),
            RepairOption(
                id="embroidered-cover",
                title="Embroidered patch cover",
                summary="Stitch a pre-made or hand-embroidered patch over the tear. Fastest visible fix.",
                technique=Technique.EMBROIDERY,
                visibility="visible",
                difficulty=1,
                minutes=60,
                materials=["Fabric patch", "Embroidery floss", "Embroidery needle"],
                steps=[
                    "Reinforce the tear from the inside with a few rows of running stitch.",
                    "Centre the patch over the tear and pin it in place.",
                    "Blanket-stitch around the edge of the patch through both layers.",
                ],
            ),
        ],
    ),
    DiagnosisResult(
        garment=GarmentType.SHIRT,
        garment_confidence=0.9,
        material=Material.COTTON,
        material_confidence=0.84,
        damages=[
            Damage(
                kind=DamageKind.HOLE,
                location="Front, near the hem",
                size_cm=0.5,
                severity=Severity.MINOR,
            )
        ],
        options=[
            RepairOption(
                id="daisy-cover",
                title="Embroidered daisy cover-up",
                summary="Stitch a lazy-daisy flower over the hole. Ten minutes, and it looks intentional.",
                technique=Technique.EMBROIDERY,
                visibility="visible",
                difficulty=1,
                minutes=20,
                materials=[
                    "Embroidery floss in two colours",
                    "Embroidery needle",
                    "Small hoop (optional)",
                ],
                steps=[
                    "Close the hole with two or three tiny stitches from the inside.",
                    "Work five or six lazy-daisy petals around the hole.",
                    "Fill the centre with French knots in the second colour.",
                ],
            ),
            RepairOption(
                id="ladder-close",
                title="Ladder-stitch close",
                summary="Pull the edges together with an invisible ladder stitch in matching thread.",
                visibility="invisible",
                difficulty=1,
                minutes=10,
                materials=["Fine sewing needle", "Thread matched to the shirt"],
                steps=[
                    "Turn the edges of the hole slightly inward.",
                    "Take small alternating stitches from one edge to the other, like rungs of a ladder.",
                    "Pull the thread gently to close the gap, then knot inside.",
                ],
            ),
            RepairOption(
                id="crochet-applique",
                title="Crochet appliqué",
                summary="Add a small crochet leaf or star over the hole, with a matching one elsewhere for balance.",
                technique=Technique.CROCHET,
                visibility="visible",
                difficulty=2,
                minutes=40,
                materials=["2.5 mm crochet hook", "Cotton yarn", "Sewing needle and thread"],
                steps=[
                    "Crochet two small appliqués in cotton yarn.",
                    "Stitch the hole closed from inside.",
                    "Sew one appliqué over the hole and the second nearby to make it look deliberate.",
                ],
            ),
        ],
    ),
]


class FakeRepairAdvisor:
    async def diagnose(self, image: bytes) -> DiagnosisResult:
        scenario = SCENARIOS[hashlib.sha256(image).digest()[0] % len(SCENARIOS)]
        return scenario.model_copy(update={"notes": DEMO_NOTE})

    async def aclose(self) -> None:
        pass
