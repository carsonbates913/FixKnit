"""Map free-text vision labels onto the FixKnit taxonomy."""

import re
from collections.abc import Iterable, Mapping

from app.schemas import Label

_WORD = re.compile(r"[a-z]+")


def match_labels[K](
    labels: Iterable[Label], synonyms: Mapping[K, frozenset[str]]
) -> list[tuple[K, float]]:
    """Return each taxonomy key whose synonyms appear as a whole word in some label.

    A key's confidence is the highest score among the labels that matched it.
    Results are sorted by confidence, highest first.
    """
    best: dict[K, float] = {}
    for label in labels:
        words = set(_WORD.findall(label.description.lower()))
        for key, terms in synonyms.items():
            if words & terms:
                best[key] = max(best.get(key, 0.0), label.score)
    return sorted(best.items(), key=lambda item: item[1], reverse=True)
