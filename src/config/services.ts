import { images } from "./images";

/**
 * Services offered. Add, remove or reorder entries here — the services page,
 * homepage preview, footer and the quote form's "Type of Project" dropdown
 * all update automatically.
 */
export type Service = {
  slug: string;
  title: string;
  short: string;
  description: string;
  image: string;
  highlights: string[];
  featured?: boolean; // shown in the homepage preview
};

export const services: Service[] = [
  {
    slug: "general-construction",
    title: "General Construction",
    short: "Ground-up builds and additions managed from permit to punch list.",
    description:
      "Full-scope general contracting for new builds, additions, and structural work. One accountable team handles scheduling, subcontractors, inspections, and quality control.",
    image: images.generalConstruction,
    highlights: ["New construction & additions", "Permits & inspections", "Single point of contact"],
    featured: true,
  },
  {
    slug: "residential-remodeling",
    title: "Residential Remodeling",
    short: "Kitchens, baths and whole-home remodels designed around how you live.",
    description:
      "Thoughtful remodels that modernize your home without the headaches. We plan carefully, protect your space, and keep you informed every step of the way.",
    image: images.residentialRemodeling,
    highlights: ["Kitchens & bathrooms", "Basements & attics", "Whole-home remodels"],
    featured: true,
  },
  {
    slug: "custom-carpentry",
    title: "Custom Carpentry",
    short: "Built-ins, trim, stairs and millwork crafted to fit perfectly.",
    description:
      "Precision finish carpentry that elevates every room — custom built-ins, crown and trim, wainscoting, staircases, and doors fitted with care.",
    image: images.customCarpentry,
    highlights: ["Built-ins & cabinetry", "Trim, crown & wainscoting", "Stairs & railings"],
    featured: true,
  },
  {
    slug: "framing",
    title: "Framing",
    short: "Square, plumb and true structural framing for lasting results.",
    description:
      "The quality of a build starts with its frame. Our framing crews deliver accurate, code-compliant wall, floor, and roof systems that make every trade after us faster and better.",
    image: images.framing,
    highlights: ["Wall, floor & roof framing", "Structural beams & headers", "Load-bearing modifications"],
    featured: true,
  },
  {
    slug: "deck-construction",
    title: "Deck Construction",
    short: "Durable decks and outdoor living spaces built for every season.",
    description:
      "Custom decks, porches, and pergolas in pressure-treated lumber, cedar, or composite — engineered properly and finished beautifully.",
    image: images.deckConstruction,
    highlights: ["Wood & composite decks", "Pergolas & covered porches", "Railings & stairs"],
    featured: true,
  },
  {
    slug: "flooring",
    title: "Flooring",
    short: "Hardwood, LVP, tile and more — installed flat, tight and clean.",
    description:
      "Professional flooring installation with proper subfloor prep. Hardwood, engineered wood, luxury vinyl plank, laminate, and tile installed to last.",
    image: images.flooring,
    highlights: ["Hardwood & engineered", "Luxury vinyl plank", "Subfloor repair & leveling"],
    featured: true,
  },
  {
    slug: "interior-renovations",
    title: "Interior Renovations",
    short: "Open up layouts, refresh finishes and transform interior spaces.",
    description:
      "From removing walls to complete interior makeovers, we handle drywall, finishes, lighting coordination, and the details that make a space feel new.",
    image: images.interiorRenovations,
    highlights: ["Open-concept conversions", "Drywall & finishes", "Doors, windows & trim"],
  },
  {
    slug: "exterior-renovations",
    title: "Exterior Renovations",
    short: "Siding, porches, windows and curb appeal that protects your home.",
    description:
      "Exterior upgrades that look great and stand up to the weather — siding, trim, windows, doors, porches, and rot repair done the right way.",
    image: images.exteriorRenovations,
    highlights: ["Siding & exterior trim", "Windows & entry doors", "Rot & structural repair"],
  },
  {
    slug: "custom-woodworking",
    title: "Custom Woodworking",
    short: "One-of-a-kind furniture, mantels and shop-built pieces.",
    description:
      "Shop-built custom pieces made from quality hardwoods — mantels, floating shelves, tables, vanities, and statement features designed for your home.",
    image: images.customWoodworking,
    highlights: ["Mantels & shelving", "Custom furniture", "Hardwood feature pieces"],
  },
];

export const projectTypeOptions = [...services.map((s) => s.title), "Other / Not Sure"];

export const budgetOptions = [
  "Under $10,000",
  "$10,000 – $25,000",
  "$25,000 – $50,000",
  "$50,000 – $100,000",
  "$100,000 – $250,000",
  "$250,000+",
  "Not sure yet",
];

export const contactMethodOptions = ["Phone call", "Email", "Text message", "No preference"];
