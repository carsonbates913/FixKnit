from app.domain.matching import match_labels
from app.domain.taxonomy import GARMENT_SYNONYMS, MATERIAL_SYNONYMS, GarmentType, Material
from app.schemas import Label


def labels(*pairs: tuple[str, float]) -> list[Label]:
    return [Label(description=d, score=s) for d, s in pairs]


def test_jeans_maps_to_pants_and_denim() -> None:
    found = labels(("Jeans", 0.9))
    assert match_labels(found, GARMENT_SYNONYMS) == [(GarmentType.PANTS, 0.9)]
    assert match_labels(found, MATERIAL_SYNONYMS) == [(Material.DENIM, 0.9)]


def test_whole_words_only() -> None:
    # The old substring matcher read "pant" inside these.
    found = labels(("Pantone", 0.9), ("Plant", 0.8), ("Elephant", 0.7))
    assert match_labels(found, GARMENT_SYNONYMS) == []


def test_hyphenated_labels_split_into_words() -> None:
    assert match_labels(labels(("T-shirt", 0.8)), GARMENT_SYNONYMS) == [(GarmentType.SHIRT, 0.8)]


def test_keeps_highest_score_and_sorts() -> None:
    found = labels(("Wool", 0.6), ("Cotton", 0.9), ("Woolen", 0.7))
    assert match_labels(found, MATERIAL_SYNONYMS) == [(Material.COTTON, 0.9), (Material.WOOL, 0.7)]
