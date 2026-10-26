export const site = {
  name: "Aurelstone",
  tagline: "Surfaces for the whole home.",
  description:
    "A Melbourne showroom for custom joinery, SPC walls and floors, wall protection, and outdoor WPC living — specified together so the house reads as one.",
  phone: "03 9429 0188",
  phoneHref: "tel:+61394290188",
  email: "hello@aurelstone.com.au",
  mapsUrl: "https://maps.google.com/?q=14+Cubitt+Street+Cremorne+VIC+3121",
  mapsEmbed:
    "https://maps.google.com/maps?q=14%20Cubitt%20Street%20Cremorne%20VIC%203121&z=16&output=embed",
  showroom: {
    name: "Cremorne Showroom",
    street: "14 Cubitt Street",
    suburb: "Cremorne",
    state: "VIC",
    postcode: "3121",
    hours: [
      { days: "Tuesday–Friday", time: "10:00–16:00" },
      { days: "Saturday", time: "10:00–15:00" },
      { days: "Sunday–Monday", time: "By appointment" },
    ],
  },
} as const;

export const nav = [
  { to: "/indoor", label: "Indoor" },
  { to: "/outdoor", label: "Outdoor" },
  { to: "/projects", label: "Projects" },
  { to: "/materials", label: "Materials" },
  { to: "/styles", label: "Styles" },
  { to: "/showroom", label: "Showroom" },
  { to: "/process", label: "Process" },
] as const;

export const visitTimes = ["10:00", "11:00", "12:30", "14:00", "15:00"] as const;

export const interests = [
  { id: "joinery", label: "Whole-home joinery" },
  { id: "spc-floor", label: "SPC flooring" },
  { id: "wall-panels", label: "Wall panels" },
  { id: "wall-protection", label: "Wall protection" },
  { id: "wpc-deck", label: "WPC decking" },
  { id: "wpc-fence", label: "WPC fencing" },
  { id: "whole-home", label: "Whole-home package" },
] as const;

export type InterestId = (typeof interests)[number]["id"];

export const indoorDisciplines = [
  {
    id: "joinery",
    title: "Whole-home joinery",
    kicker: "Kitchens, wardrobes, vanities, living",
    image: "/images/kitchen-joinery.jpg",
    summary:
      "Cabinetry designed around Melbourne rooms — ceiling heights, appliance sizes, and the way you actually live. Kitchens, pantries, wardrobes, vanities, and living storage, specified as one language.",
    points: [
      "Made-to-measure carcasses and fronts",
      "Soft-close hardware and integrated lighting",
      "Finishes matched to floors and wall panels",
      "Shop drawings before anything is cut",
    ],
  },
  {
    id: "spc-floor",
    title: "SPC hybrid flooring",
    kicker: "Waterproof timber-look floors",
    image: "/images/living-floor.jpg",
    summary:
      "Stone-polymer planks that read as timber and stay still in Melbourne humidity. Suitable for living rooms, kitchens, and wet areas, with underfloor heating compatibility on the thicker ranges.",
    points: [
      "Rigid limestone core — no swell in wet rooms",
      "Wear layers for pets, kids, and rental use",
      "Click-lock install over most subfloors",
      "Residential warranties up to 20 years",
    ],
  },
  {
    id: "wall-panels",
    title: "SPC wall panels",
    kicker: "Feature walls without the fuss",
    image: "/images/wall-panels.jpg",
    summary:
      "Large-format stone-look panels for media walls, dining rooms, and entries — starting with Calacatta Warm, a white ground with a fine warm vein that sits with oak joinery and a black television. Fluted and slat profiles in the same family.",
    points: [
      "Calacatta Warm (9Z220) — bookmatched stone look",
      "Fluted limestone and oak slat options",
      "Wipeable, low-VOC surfaces",
      "Samples to take home from Cremorne",
    ],
  },
  {
    id: "wall-protection",
    title: "Wall protection",
    kicker: "Quiet, wipeable, high-traffic",
    image: "/images/wall-protection.jpg",
    summary:
      "Impact-resistant panels for hallways, entries, and family rooms — dado-height boards that look like joinery, not a hospital corridor. Also specified for aged care, education, and boutique hospitality.",
    points: [
      "Dado-height residential systems",
      "Corner and door protection to match",
      "Easy-clean linen, sand, and grey tones",
      "Commercial ranges on request",
    ],
  },
] as const;

export const outdoorDisciplines = [
  {
    id: "decking",
    title: "WPC decking",
    kicker: "The room beyond the glass",
    image: "/images/wpc-teak-deck.jpg",
    summary:
      "Co-extruded composite boards in five sand-carved colours. Melbourne decks, pool surrounds, and courtyards — no annual oiling.",
    points: [
      "Capped boards — stain and fade resistant",
      "Hidden-fastener systems",
      "Pool-safe, splinter-free walking surface",
      "Colours that sit with indoor oak and stone",
    ],
  },
  {
    id: "fencing",
    title: "WPC fencing & screening",
    kicker: "Privacy without the paint cycle",
    image: "/images/wpc-rosewood-fence.jpg",
    summary:
      "Solid and slatted composite fencing with aluminium posts. Screening that holds a line in the garden and matches the deck underfoot.",
    points: [
      "Termite and rot resistant",
      "Aluminium posts, composite infill",
      "Horizontal screen and full-privacy options",
      "Gates and corner details made to site",
    ],
  },
] as const;

export type WpcColour = {
  id: string;
  name: string;
  tone: string;
  sample: string;
  deck: string;
  fence: string;
  deckId: string;
  fenceId: string;
  note: string;
};

export const wpcColours: WpcColour[] = [
  {
    id: "ancient",
    name: "Ancient Wood",
    tone: "Weathered grey-brown",
    sample: "/images/material-wpc-ancient.jpg",
    deck: "/images/wpc-ancient-deck.jpg",
    fence: "/images/wpc-ancient-fence.jpg",
    deckId: "ancient-deck",
    fenceId: "ancient-fence",
    note: "Weathered grey-brown. Outdoor dining on a quiet courtyard — sits with pale oak indoors.",
  },
  {
    id: "grey",
    name: "Light Grey",
    tone: "Cool grey",
    sample: "/images/material-wpc-grey.jpg",
    deck: "/images/wpc-grey-deck.jpg",
    fence: "/images/wpc-grey-fence.jpg",
    deckId: "grey-deck",
    fenceId: "grey-fence",
    note: "Cool grey under a pergola lounge. Black frames, stone walls, contemporary courtyards.",
  },
  {
    id: "maple",
    name: "Maple",
    tone: "Warm tan",
    sample: "/images/material-wpc-maple.jpg",
    deck: "/images/wpc-maple-deck.jpg",
    fence: "/images/wpc-maple-fence.jpg",
    deckId: "maple-deck",
    fenceId: "maple-fence",
    note: "Warm tan for family dining decks. Lighter than Teak, still timber.",
  },
  {
    id: "teak",
    name: "Teak",
    tone: "Golden brown",
    sample: "/images/material-wpc-teak.jpg",
    deck: "/images/wpc-teak-deck.jpg",
    fence: "/images/wpc-teak-fence.jpg",
    deckId: "teak-deck",
    fenceId: "teak-fence",
    note: "Golden brown under a pergola. The house outdoor colour.",
  },
  {
    id: "rosewood",
    name: "Rosewood",
    tone: "Deep brown",
    sample: "/images/material-wpc-rosewood.jpg",
    deck: "/images/wpc-rosewood-deck.jpg",
    fence: "/images/wpc-rosewood-fence.jpg",
    deckId: "rosewood-deck",
    fenceId: "rosewood-fence",
    note: "Deep brown for evening decks and a fire pit. Recedes into the garden.",
  },
];

export type MaterialRealm = "indoor" | "outdoor";
export type MaterialKind =
  | "joinery"
  | "floor"
  | "wall-panel"
  | "wall-protection"
  | "decking"
  | "fencing";

export type Material = {
  id: string;
  name: string;
  kind: MaterialKind;
  realm: MaterialRealm;
  tone: string;
  image: string;
  use: string;
};

export const materials: Material[] = [
  {
    id: "pale-oak",
    name: "Pale Oak",
    kind: "joinery",
    realm: "indoor",
    tone: "Warm light",
    image: "/images/material-joinery.jpg",
    use: "Kitchens, wardrobes, living",
  },
  {
    id: "warm-walnut",
    name: "Warm Walnut",
    kind: "joinery",
    realm: "indoor",
    tone: "Deep timber",
    image: "/images/project-kew.jpg",
    use: "Kitchens and studies",
  },
  {
    id: "warm-white",
    name: "Warm White",
    kind: "joinery",
    realm: "indoor",
    tone: "Cream cabinets",
    image: "/images/kitchen-custom.jpg",
    use: "Kitchens",
  },
  {
    id: "stone-grey",
    name: "Stone Grey",
    kind: "joinery",
    realm: "indoor",
    tone: "Cool mineral",
    image: "/images/kitchen-joinery.jpg",
    use: "Contemporary kitchens",
  },
  {
    id: "french-oak",
    name: "French Oak",
    kind: "floor",
    realm: "indoor",
    tone: "Pale grain",
    image: "/images/material-floor.jpg",
    use: "Living, kitchen, bedrooms",
  },
  {
    id: "spotted-gum",
    name: "Spotted Gum",
    kind: "floor",
    realm: "indoor",
    tone: "Australian warm",
    image: "/images/living-floor.jpg",
    use: "Family rooms",
  },
  {
    id: "fluted-limestone",
    name: "Fluted Limestone",
    kind: "wall-panel",
    realm: "indoor",
    tone: "Soft stone",
    image: "/images/material-fluted.jpg",
    use: "Dining and entries",
  },
  {
    id: "f3121",
    name: "Warm Limestone",
    kind: "wall-panel",
    realm: "indoor",
    tone: "Beige, fine grain",
    image: "/images/material-f3121.jpg",
    use: "TV walls and sofa walls",
  },
  {
    id: "f1141",
    name: "Soft Greige",
    kind: "wall-panel",
    realm: "indoor",
    tone: "Beige-grey stone",
    image: "/images/material-f1141.jpg",
    use: "TV walls and dining",
  },
  {
    id: "y5258",
    name: "Calacatta Honey",
    kind: "wall-panel",
    realm: "indoor",
    tone: "White, warm vein",
    image: "/images/material-y5258.jpg",
    use: "Open living walls",
  },
  {
    id: "calacatta-warm",
    name: "Calacatta Warm",
    kind: "wall-panel",
    realm: "indoor",
    tone: "White, fine warm vein",
    image: "/images/material-9z220.jpg",
    use: "Media walls and dining",
  },
  {
    id: "y5349",
    name: "Calacatta Grey",
    kind: "wall-panel",
    realm: "indoor",
    tone: "White, fine cool vein",
    image: "/images/material-y5349.jpg",
    use: "TV walls with black screens",
  },
  {
    id: "4z024",
    name: "Sage Marble",
    kind: "wall-panel",
    realm: "indoor",
    tone: "Green, bold white vein",
    image: "/images/material-4z024.jpg",
    use: "Feature walls, ensuites, powder rooms",
  },
  {
    id: "9z241",
    name: "Layered Grey",
    kind: "wall-panel",
    realm: "indoor",
    tone: "Mid grey stone",
    image: "/images/material-9z241.jpg",
    use: "Modern living walls",
  },
  {
    id: "9z248",
    name: "Charcoal Stone",
    kind: "wall-panel",
    realm: "indoor",
    tone: "Deep grey, diagonal vein",
    image: "/images/material-9z248.jpg",
    use: "Studies and darker living rooms",
  },
  {
    id: "f9107",
    name: "Umber Vein",
    kind: "wall-panel",
    realm: "indoor",
    tone: "Grey-brown stone",
    image: "/images/material-f9107.jpg",
    use: "Walnut kitchens and living",
  },
  {
    id: "y5239",
    name: "Noir Gold",
    kind: "wall-panel",
    realm: "indoor",
    tone: "Black stone, gold crack",
    image: "/images/material-y5239.jpg",
    use: "Statement walls, powder rooms",
  },
  {
    id: "oak-slat",
    name: "Oak Slat",
    kind: "wall-panel",
    realm: "indoor",
    tone: "Vertical timber",
    image: "/images/wall-panels-slat.jpg",
    use: "Media walls",
  },
  {
    id: "linen-dado",
    name: "Linen Dado",
    kind: "wall-protection",
    realm: "indoor",
    tone: "Warm neutral",
    image: "/images/wall-protection.jpg",
    use: "Hallways and entries",
  },
  {
    id: "sand-protection",
    name: "Sand",
    kind: "wall-protection",
    realm: "indoor",
    tone: "Soft clay",
    image: "/images/bathroom.jpg",
    use: "Family corridors",
  },
  {
    id: "ancient-deck",
    name: "Ancient Wood",
    kind: "decking",
    realm: "outdoor",
    tone: "Weathered grey-brown",
    image: "/images/material-wpc-ancient.jpg",
    use: "Decks, steps, pool edges",
  },
  {
    id: "grey-deck",
    name: "Light Grey",
    kind: "decking",
    realm: "outdoor",
    tone: "Cool grey",
    image: "/images/material-wpc-grey.jpg",
    use: "Contemporary courtyards",
  },
  {
    id: "maple-deck",
    name: "Maple",
    kind: "decking",
    realm: "outdoor",
    tone: "Warm tan",
    image: "/images/material-wpc-maple.jpg",
    use: "Family dining decks",
  },
  {
    id: "teak-deck",
    name: "Teak",
    kind: "decking",
    realm: "outdoor",
    tone: "Golden brown",
    image: "/images/material-wpc-teak.jpg",
    use: "Pool surrounds and steps",
  },
  {
    id: "rosewood-deck",
    name: "Rosewood",
    kind: "decking",
    realm: "outdoor",
    tone: "Deep brown",
    image: "/images/material-wpc-rosewood.jpg",
    use: "Evening decks and lounges",
  },
  {
    id: "ancient-fence",
    name: "Ancient Wood Fence",
    kind: "fencing",
    realm: "outdoor",
    tone: "Weathered grey-brown",
    image: "/images/wpc-ancient-fence.jpg",
    use: "Side boundaries",
  },
  {
    id: "grey-fence",
    name: "Light Grey Fence",
    kind: "fencing",
    realm: "outdoor",
    tone: "Cool grey",
    image: "/images/wpc-grey-fence.jpg",
    use: "Modern garden screens",
  },
  {
    id: "maple-fence",
    name: "Maple Fence",
    kind: "fencing",
    realm: "outdoor",
    tone: "Warm tan",
    image: "/images/wpc-maple-fence.jpg",
    use: "Privacy and planting",
  },
  {
    id: "teak-fence",
    name: "Teak Fence",
    kind: "fencing",
    realm: "outdoor",
    tone: "Golden brown",
    image: "/images/wpc-teak-fence.jpg",
    use: "Boundaries that match the deck",
  },
  {
    id: "rosewood-fence",
    name: "Rosewood Fence",
    kind: "fencing",
    realm: "outdoor",
    tone: "Deep brown",
    image: "/images/wpc-rosewood-fence.jpg",
    use: "Garden screening",
  },
];

export type WallPanelSample = {
  id: string;
  sku: string;
  name: string;
  tone: string;
  room: string;
  sample: string;
  use: string;
  note: string;
  set: "quiet" | "statement";
  scenes?: { src: string; label: string }[];
};

export const wallPanelSamples: WallPanelSample[] = [
  {
    id: "calacatta-warm",
    sku: "9Z220",
    name: "Calacatta Warm",
    tone: "Pale stone, light oak",
    room: "/images/panel-pick-tv-marble.jpg?v=light",
    sample: "/images/material-9z220.jpg",
    use: "Television wall",
    note: "Pale stone behind the screen, with oak.",
    set: "quiet",
  },
  {
    id: "f3121",
    sku: "F3121",
    name: "Warm Limestone",
    tone: "Beige, fine grain",
    room: "/images/panel-pick-sofa-niche.jpg",
    sample: "/images/material-f3121.jpg",
    use: "Sofa wall",
    note: "Stone in the niche, oak around it.",
    set: "quiet",
  },
  {
    id: "f1141",
    sku: "F1141",
    name: "Soft Greige",
    tone: "Pale beige stone",
    room: "/images/panel-pick-bath.jpg?v=light",
    sample: "/images/material-f1141.jpg",
    use: "Bathroom",
    note: "Pale stone behind the basin.",
    set: "quiet",
  },
  {
    id: "9z248",
    sku: "9Z248",
    name: "Charcoal Stone",
    tone: "Deep grey pier",
    room: "/images/panel-pick-tv-slat.jpg",
    sample: "/images/material-9z248.jpg",
    use: "Television wall",
    note: "Oak slats, with a charcoal pier.",
    set: "statement",
  },
  {
    id: "f9107",
    sku: "F9107",
    name: "Umber Vein",
    tone: "Grey-brown stone",
    room: "/images/panel-pick-living-layers.jpg",
    sample: "/images/material-f9107.jpg",
    use: "Sofa wall",
    note: "Plaster, umber stone, and pale oak.",
    set: "statement",
  },
  {
    id: "4z024",
    sku: "4Z024",
    name: "Sage Marble",
    tone: "Green, bold white vein",
    room: "/images/panel-4z024-front.jpg",
    sample: "/images/material-4z024.jpg",
    use: "Bathroom",
    note: "Sage stone behind the basin.",
    set: "quiet",
  },
  {
    id: "y5258",
    sku: "Y5258",
    name: "Calacatta Honey",
    tone: "White, warm vein",
    room: "/images/panel-y5258-living.jpg",
    sample: "/images/material-y5258.jpg",
    use: "Sofa wall",
    note: "Warm-veined stone between oak doors.",
    set: "quiet",
  },
  {
    id: "y5349",
    sku: "Y5349",
    name: "Calacatta Grey",
    tone: "White, cool vein",
    room: "/images/panel-y5349-living.jpg",
    sample: "/images/material-y5349.jpg",
    use: "Sofa wall",
    note: "Cool white vein with an oak screen.",
    set: "quiet",
  },
  {
    id: "f3121-tv",
    sku: "F3121",
    name: "Warm Limestone",
    tone: "Beige, fine grain",
    room: "/images/panel-f3121-tv.jpg",
    sample: "/images/material-f3121.jpg",
    use: "Television wall",
    note: "Beige stone framed in oak.",
    set: "quiet",
  },
  {
    id: "9z248-tv",
    sku: "9Z248",
    name: "Charcoal Stone",
    tone: "Deep grey, diagonal vein",
    room: "/images/panel-9z248-tv.jpg",
    sample: "/images/material-9z248.jpg",
    use: "Television wall",
    note: "Charcoal stone behind the screen.",
    set: "statement",
  },
];

export const kindLabels: Record<MaterialKind, string> = {
  joinery: "Joinery",
  floor: "SPC floor",
  "wall-panel": "Wall panel",
  "wall-protection": "Wall protection",
  decking: "WPC decking",
  fencing: "WPC fencing",
};

export type Project = {
  slug: string;
  title: string;
  suburb: string;
  year: string;
  cover: string;
  gallery: string[];
  summary: string;
  story: string;
  materialsUsed: string[];
  rooms: string[];
};

export const projects: Project[] = [
  {
    slug: "hawthorn-house",
    title: "Hawthorn House",
    suburb: "Hawthorn",
    year: "2025",
    cover: "/images/kitchen-joinery.jpg",
    gallery: [
      "/images/kitchen-joinery.jpg",
      "/images/living-floor.jpg",
      "/images/wardrobe.jpg",
      "/images/bathroom.jpg",
    ],
    summary:
      "A family renovation where pale oak joinery, hybrid floors, and a quiet hallway dado were specified as one palette.",
    story:
      "The brief was a kitchen that could take a household of five and still feel calm. We matched Pale Oak fronts to French Oak SPC through the living level, then ran Linen wall protection down the hall so bags and bikes did not mark the plaster. The same oak returns in the walk-in and the vanity, so the house does not change language from room to room.",
    materialsUsed: ["pale-oak", "french-oak", "linen-dado"],
    rooms: ["Kitchen", "Living", "Wardrobe", "Bathroom", "Hall"],
  },
  {
    slug: "kew-garden",
    title: "Kew Garden Residence",
    suburb: "Kew",
    year: "2025",
    cover: "/images/project-kew.jpg",
    gallery: [
      "/images/project-kew.jpg",
      "/images/outdoor-deck.jpg",
      "/images/outdoor-dining.jpg",
      "/images/hero.jpg",
    ],
    summary:
      "Walnut joinery indoors, charcoal composite decking outside — one house, from the island bench to the pool.",
    story:
      "A north-facing Kew block with a new living pavilion. Warm Walnut cabinetry holds the kitchen; the floor runs through to a flush threshold and a Rosewood WPC deck around the water. Screening in Light Grey keeps the neighbours at a polite distance without a painted paling fence.",
    materialsUsed: ["warm-walnut", "rosewood-deck", "grey-fence"],
    rooms: ["Kitchen", "Dining", "Deck", "Pool", "Fence"],
  },
  {
    slug: "mornington-beach",
    title: "Mornington Beach House",
    suburb: "Mornington",
    year: "2024",
    cover: "/images/project-mornington.jpg",
    gallery: [
      "/images/project-mornington.jpg",
      "/images/outdoor-dining.jpg",
      "/images/outdoor-fence.jpg",
      "/images/material-deck.jpg",
    ],
    summary:
      "A peninsula weekender: pale interiors, Ancient Wood decking, and a fence that can take salt air.",
    story:
      "Weekenders fail when the materials ask for maintenance. We kept the interior light — Pale Oak and French Oak — and put Ancient Wood decking and Teak screening outside, capped composites that sit in coastal light without oiling. The living room and the deck are meant to be used as one room in summer.",
    materialsUsed: ["pale-oak", "french-oak", "ancient-deck", "teak-fence"],
    rooms: ["Living", "Deck", "Screening"],
  },
  {
    slug: "fitzroy-terrace",
    title: "Fitzroy Terrace",
    suburb: "Fitzroy",
    year: "2025",
    cover: "/images/project-fitzroy.jpg",
    gallery: [
      "/images/project-fitzroy.jpg",
      "/images/wall-panels-slat.jpg",
      "/images/wall-protection.jpg",
      "/images/wardrobe.jpg",
    ],
    summary:
      "A narrow terrace where every wall has to work — joinery, fluted panels, and dado protection in a tight plan.",
    story:
      "Inner-north terraces are all corridor and no spare plaster. Floor-to-ceiling joinery takes the storage; a fluted limestone panel gives the dining wall some rhythm; linen dado boards take the knocks from bikes in the hall. Nothing is decorative for its own sake.",
    materialsUsed: ["pale-oak", "fluted-limestone", "linen-dado", "oak-slat"],
    rooms: ["Living", "Dining", "Hall", "Wardrobe"],
  },
  {
    slug: "brighton-bungalow",
    title: "Brighton Bungalow",
    suburb: "Brighton",
    year: "2024",
    cover: "/images/project-brighton.jpg",
    gallery: [
      "/images/project-brighton.jpg",
      "/images/bathroom.jpg",
      "/images/outdoor-dining.jpg",
      "/images/kitchen-joinery.jpg",
    ],
    summary:
      "A Brighton kitchen: warm white cabinets, a white marble splash, and pale oak underfoot.",
    story:
      "The wall cabinets are warm white, with a white stone splash and island top. The floor is pale oak through the kitchen.",
    materialsUsed: ["warm-white", "y5349", "french-oak"],
    rooms: ["Kitchen"],
  },
];

export const processSteps = [
  {
    n: "01",
    title: "Visit the showroom",
    body: "Come to Cubitt Street. Sit with the samples in daylight, take boards home, and talk through the rooms you are actually building.",
  },
  {
    n: "02",
    title: "Brief and measure",
    body: "We take a site measure or work from your drawings — ceiling heights, services, and the way the indoor floor meets the deck.",
  },
  {
    n: "03",
    title: "Design and specification",
    body: "Joinery layouts, floor and wall schedules, outdoor boards and posts. One specification so the painter, tiler, and builder are not guessing.",
  },
  {
    n: "04",
    title: "Samples and finishes",
    body: "Lock colour in the room it will live in. We send a sample set before anything is ordered.",
  },
  {
    n: "05",
    title: "Manufacture",
    body: "Joinery is made to the shop drawings. Floors, panels, and outdoor boards are scheduled so they arrive when the site is ready.",
  },
  {
    n: "06",
    title: "Install and handover",
    body: "Our installers, or yours with our detailing. Care notes and warranties at handover — then we stay on the end of the phone.",
  },
] as const;

export const warranties = [
  { item: "Custom joinery", term: "7-year workmanship" },
  { item: "SPC hybrid flooring", term: "Up to 20 years residential" },
  { item: "SPC wall panels", term: "10 years" },
  { item: "Wall protection", term: "10 years" },
  { item: "WPC decking & fencing", term: "15 years structural" },
] as const;

export function materialById(id: string) {
  return materials.find((m) => m.id === id);
}

export function projectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function nextVisitDays(count = 8): Date[] {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  while (out.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 1) {
      out.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}
