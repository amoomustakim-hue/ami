export type Fragrance = {
  id: string;
  name: string;
  family: string;
  description: string;
  price: string;
  volume: string;
  /** Liquid tone for the vector flacon. */
  tone: string;
  mark: string;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
};

export const FRAGRANCES: Fragrance[] = [
  {
    id: "nuit-ivoire",
    name: "Nuit Ivoire",
    family: "Amber",
    description:
      "Warm labdanum drawn over soft vanilla, with a trace of smoke left in the room.",
    price: "$185",
    volume: "100 ml",
    tone: "#a9855f",
    mark: "N I",
    notes: {
      top: ["Pink Pepper", "Bergamot"],
      heart: ["Labdanum", "Orris Butter"],
      base: ["Vanilla Absolute", "Cashmeran", "Birch Smoke"],
    },
  },
  {
    id: "vert-atlas",
    name: "Vert Atlas",
    family: "Woody",
    description:
      "Atlas cedar and vetiver, cooled by crushed fig leaf and a breath of green sap.",
    price: "$165",
    volume: "100 ml",
    tone: "#6a6d56",
    mark: "V A",
    notes: {
      top: ["Fig Leaf", "Galbanum"],
      heart: ["Atlas Cedar", "Cypress"],
      base: ["Vetiver", "Papyrus", "Dry Moss"],
    },
  },
  {
    id: "blanche-heure",
    name: "Blanche Heure",
    family: "Floral",
    description:
      "Neroli caught at first light, iris settling slowly into clean white musk.",
    price: "$175",
    volume: "100 ml",
    tone: "#d5c5ad",
    mark: "B H",
    notes: {
      top: ["Neroli", "Petitgrain"],
      heart: ["Iris", "Jasmine Sambac"],
      base: ["White Musk", "Sandalwood"],
    },
  },
  {
    id: "oud-batir",
    name: "Oud Bâtir",
    family: "Oud",
    description:
      "Agarwood, saffron and rose, assembled with the patience of architecture.",
    price: "$240",
    volume: "100 ml",
    tone: "#6b4a32",
    mark: "O B",
    notes: {
      top: ["Saffron", "Black Pepper"],
      heart: ["Agarwood", "Turkish Rose"],
      base: ["Leather", "Amber", "Oud Accord"],
    },
  },
  {
    id: "sel-et-figue",
    name: "Sel & Figue",
    family: "Fresh",
    description:
      "Salt air off warm stone, green fig and the last of the afternoon citrus.",
    price: "$150",
    volume: "100 ml",
    tone: "#9aa891",
    mark: "S F",
    notes: {
      top: ["Sea Salt", "Grapefruit"],
      heart: ["Green Fig", "Coconut Water"],
      base: ["Driftwood", "White Amber"],
    },
  },
  {
    id: "ambre-peau",
    name: "Ambre Peau",
    family: "Amber",
    description:
      "Skin-close amber with tonka and a low, unhurried heat that stays all evening.",
    price: "$195",
    volume: "100 ml",
    tone: "#94724f",
    mark: "A P",
    notes: {
      top: ["Cardamom", "Davana"],
      heart: ["Tonka Bean", "Benzoin"],
      base: ["Amber", "Sandalwood", "Musk"],
    },
  },
];

export const FEATURED_IDS = ["nuit-ivoire", "vert-atlas", "blanche-heure", "oud-batir"];

export const FEATURED = FEATURED_IDS.map(
  (id) => FRAGRANCES.find((f) => f.id === id)!
);

/** Section 7 flagship. */
export const FLAGSHIP = FRAGRANCES[0];

export type Mood = {
  id: string;
  label: string;
  /** The line shown once a mood is chosen. */
  line: string;
  fragranceId: string;
};

export const MOODS: Mood[] = [
  {
    id: "moody",
    label: "Moody",
    line: "You keep something back. The room notices anyway.",
    fragranceId: "vert-atlas",
  },
  {
    id: "fresh",
    label: "Fresh",
    line: "You arrive like an open window.",
    fragranceId: "sel-et-figue",
  },
  {
    id: "warm",
    label: "Warm",
    line: "People stand a little closer than they meant to.",
    fragranceId: "nuit-ivoire",
  },
  {
    id: "sensual",
    label: "Sensual",
    line: "Worn low, on the skin, for one person at a time.",
    fragranceId: "ambre-peau",
  },
  {
    id: "mysterious",
    label: "Mysterious",
    line: "Recognised long before you are placed.",
    fragranceId: "oud-batir",
  },
  {
    id: "clean",
    label: "Clean",
    line: "Nothing announced. Everything considered.",
    fragranceId: "blanche-heure",
  },
];

export function fragranceById(id: string) {
  return FRAGRANCES.find((f) => f.id === id)!;
}
