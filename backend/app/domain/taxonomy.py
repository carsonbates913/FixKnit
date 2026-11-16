"""The fixed vocabulary FixKnit reasons about, plus the words that map onto it."""

from enum import StrEnum


class Material(StrEnum):
    DENIM = "denim"
    WOOL = "wool"
    COTTON = "cotton"
    SILK = "silk"
    LEATHER = "leather"
    LINEN = "linen"
    POLYESTER = "polyester"
    NYLON = "nylon"


class GarmentType(StrEnum):
    PANTS = "pants"
    SWEATER = "sweater"
    SHIRT = "shirt"
    JACKET = "jacket"
    COAT = "coat"
    DRESS = "dress"
    SKIRT = "skirt"
    SCARF = "scarf"
    HAT = "hat"
    GLOVES = "gloves"
    SHOES = "shoes"


class Technique(StrEnum):
    KNITTING = "knitting"
    CROCHET = "crochet"
    EMBROIDERY = "embroidery"


class Color(StrEnum):
    RED = "red"
    ORANGE = "orange"
    YELLOW = "yellow"
    GREEN = "green"
    BLUE = "blue"
    PINK = "pink"
    PURPLE = "purple"
    BROWN = "brown"
    BLACK = "black"
    WHITE = "white"


# Single lowercase words; a label matches when any of its words is in the set.
MATERIAL_SYNONYMS: dict[Material, frozenset[str]] = {
    Material.DENIM: frozenset({"denim", "jean", "jeans"}),
    Material.WOOL: frozenset({"wool", "woolen", "woollen", "merino", "cashmere", "mohair"}),
    Material.COTTON: frozenset({"cotton"}),
    Material.SILK: frozenset({"silk"}),
    Material.LEATHER: frozenset({"leather", "suede"}),
    Material.LINEN: frozenset({"linen"}),
    Material.POLYESTER: frozenset({"polyester", "fleece"}),
    Material.NYLON: frozenset({"nylon"}),
}

GARMENT_SYNONYMS: dict[GarmentType, frozenset[str]] = {
    GarmentType.PANTS: frozenset(
        {"pants", "pant", "trousers", "jeans", "slacks", "leggings", "sweatpants"}
    ),
    GarmentType.SWEATER: frozenset(
        {"sweater", "jumper", "cardigan", "pullover", "knitwear", "sweatshirt", "hoodie"}
    ),
    GarmentType.SHIRT: frozenset({"shirt", "blouse", "polo", "top"}),
    GarmentType.JACKET: frozenset({"jacket", "blazer", "parka", "windbreaker"}),
    GarmentType.COAT: frozenset({"coat", "overcoat", "trenchcoat"}),
    GarmentType.DRESS: frozenset({"dress", "gown"}),
    GarmentType.SKIRT: frozenset({"skirt"}),
    GarmentType.SCARF: frozenset({"scarf", "shawl"}),
    GarmentType.HAT: frozenset({"hat", "beanie", "cap"}),
    GarmentType.GLOVES: frozenset({"glove", "gloves", "mitten", "mittens"}),
    GarmentType.SHOES: frozenset({"shoe", "shoes", "sneaker", "sneakers", "boot", "boots"}),
}

# How each technique reads as an adjective in an image search ("knitted sweater").
TECHNIQUE_ADJECTIVES: dict[Technique, str] = {
    Technique.KNITTING: "knitted",
    Technique.CROCHET: "crochet",
    Technique.EMBROIDERY: "embroidered",
}
