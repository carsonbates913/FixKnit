"""Build inspiration image-search queries from user intent."""

from collections.abc import Sequence

from app.domain.taxonomy import TECHNIQUE_ADJECTIVES, Color, Technique

DEFAULT_TECHNIQUE = Technique.EMBROIDERY


def build_inspiration_query(
    subject: str, techniques: Sequence[Technique] = (), colors: Sequence[Color] = ()
) -> str:
    """e.g. ("sweater", [crochet], [green]) -> "crochet green sweater"."""
    adjectives = [TECHNIQUE_ADJECTIVES[t] for t in techniques or [DEFAULT_TECHNIQUE]]
    return " ".join([*adjectives, *colors, subject.strip()])
