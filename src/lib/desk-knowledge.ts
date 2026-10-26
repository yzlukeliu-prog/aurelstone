import { site } from "@/lib/site";

export type DeskReply = {
  text: string;
  handoff: boolean;
};

const hours = site.showroom.hours
  .map((h) => `${h.days} ${h.time}`)
  .join("; ");

const address = `${site.showroom.street}, ${site.showroom.suburb} ${site.showroom.state} ${site.showroom.postcode}`;

function has(q: string, words: string[]) {
  return words.some((w) => q.includes(w));
}

export function answerFromSite(raw: string): DeskReply {
  const q = raw.toLowerCase();

  if (has(q, ["person", "human", "someone", "staff", "call me", "speak to", "talk to"])) {
    return {
      handoff: true,
      text: "I'll leave this with the showroom. Someone from Aurelstone will reply here, or you can call 03 9429 0188.",
    };
  }

  if (has(q, ["hour", "open", "close", "when", "appointment", "visit", "showroom"])) {
    return {
      handoff: false,
      text: `The Cremorne showroom is at ${address}. Hours: ${hours}. Sunday and Monday are by appointment. You can book a time on the Enquire page, or call ${site.phone}.`,
    };
  }

  if (has(q, ["where", "address", "location", "cremorne", "melbourne", "parking"])) {
    return {
      handoff: false,
      text: `We are at ${address}, a short walk from Richmond station. Samples are in the showroom — bring a floor plan if you have one.`,
    };
  }

  if (has(q, ["price", "cost", "quote", "how much", "budget"])) {
    return {
      handoff: true,
      text: "Pricing depends on the room, the finish, and how much is specified together. Send the suburb and what you are looking at — joinery, floors, wall panels, or outdoor — and we will come back with a showroom time rather than a number over chat.",
    };
  }

  if (has(q, ["spc", "floor", "flooring", "waterproof", "hybrid"])) {
    return {
      handoff: false,
      text: "SPC hybrid flooring is a stone-polymer plank that reads as timber and stays still in Melbourne humidity. It suits living rooms, kitchens, and wet areas. Thicker ranges can go over underfloor heating. Samples are at Cremorne.",
    };
  }

  if (has(q, ["wall panel", "tv wall", "feature wall", "calacatta", "marble", "9z220"])) {
    return {
      handoff: false,
      text: "SPC wall panels are large-format stone-look boards for media walls, dining rooms, and entries. Calacatta Warm (9Z220) is a white ground with a fine warm vein, meant to sit with oak joinery. Fluted and slat profiles are in the same family. Take a sample home from the showroom.",
    };
  }

  if (has(q, ["joinery", "kitchen", "wardrobe", "vanity", "cabinet", "custom"])) {
    return {
      handoff: false,
      text: "Whole-home joinery covers kitchens, pantries, wardrobes, vanities, and living storage, drawn to the room rather than a catalogue box. We match the fronts to the floors and wall panels, and shop drawings come before anything is cut.",
    };
  }

  if (has(q, ["wpc", "deck", "outdoor", "fence", "pool", "courtyard"])) {
    return {
      handoff: false,
      text: "Outdoor is co-extruded WPC decking and fencing in five colours: Ancient Wood, Light Grey, Maple, Teak, and Rosewood. Capped boards, hidden fasteners, no annual oiling. Fencing uses aluminium posts. Colours are chosen to sit with the indoor oak and stone.",
    };
  }

  if (has(q, ["protect", "dado", "impact", "hallway", "aged care"])) {
    return {
      handoff: false,
      text: "Wall protection is a dado-height, wipeable board for hallways, entries, and family rooms. It is meant to read as joinery, not a hospital corridor. Commercial ranges are available on request.",
    };
  }

  if (has(q, ["process", "lead", "how long", "install", "warranty", "sample"])) {
    return {
      handoff: false,
      text: "The usual path is a showroom visit, a measured brief, shop drawings, then install by our team or yours with our detailing. Warranties and care notes are handed over with the work. Samples can be taken from Cremorne.",
    };
  }

  if (has(q, ["hello", "hi", "hey", "good morning", "good afternoon"])) {
    return {
      handoff: false,
      text: "Hello. I can answer questions about the Cremorne showroom, joinery, SPC floors and wall panels, wall protection, and outdoor WPC. If you would rather a person, say so and I will pass it through.",
    };
  }

  return {
    handoff: true,
    text: "I don't have a sure answer for that from the showroom notes. I've marked it for a person at Aurelstone — or call 03 9429 0188, or send the details on the Enquire page.",
  };
}
