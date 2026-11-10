import { images } from "./images";

/**
 * Portfolio projects. Replace the placeholder photos and descriptions with
 * your own completed work. Categories are generated from the entries below.
 */
export type Project = {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  image: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: "modern-kitchen-remodel",
    title: "Modern Kitchen Remodel",
    category: "Remodeling",
    location: "Residential",
    description:
      "Full kitchen gut and rebuild: relocated walls, new cabinetry and island, quartz counters, and custom-fit trim throughout.",
    image: images.residentialRemodeling,
    featured: true,
  },
  {
    id: "custom-home-build",
    title: "Custom Home Build",
    category: "Construction",
    location: "New construction",
    description:
      "Ground-up construction of a two-story home, from foundation coordination and framing to exterior finishes.",
    image: images.exteriorRenovations,
    featured: true,
  },
  {
    id: "backyard-deck-pool",
    title: "Backyard Deck & Outdoor Living",
    category: "Decks",
    location: "Residential",
    description:
      "Multi-level hardwood deck with integrated steps, hidden fasteners, and a seamless transition to the pool area.",
    image: images.deckConstruction,
    featured: true,
  },
  {
    id: "open-concept-renovation",
    title: "Open-Concept Renovation",
    category: "Interiors",
    location: "Residential",
    description:
      "Removed a load-bearing wall with an engineered beam to create an open living and dining space with new flooring.",
    image: images.livingRoom,
    featured: true,
  },
  {
    id: "framing-addition",
    title: "Two-Story Addition Framing",
    category: "Framing",
    location: "Addition",
    description:
      "Structural framing for a 900 sq ft addition, tied into the existing roofline and built to pass inspection the first time.",
    image: images.framing,
  },
  {
    id: "built-in-library",
    title: "Built-In Library Wall",
    category: "Carpentry",
    location: "Residential",
    description:
      "Floor-to-ceiling built-in shelving with integrated lighting, crown molding, and a hand-finished painted surface.",
    image: images.customCarpentry,
    featured: true,
  },
  {
    id: "hardwood-installation",
    title: "Wide-Plank Hardwood Installation",
    category: "Flooring",
    location: "Residential",
    description:
      "1,800 sq ft of wide-plank white oak installed over a leveled subfloor, sanded and finished on site.",
    image: images.flooring,
  },
  {
    id: "luxury-interior-finish",
    title: "Luxury Interior Finish",
    category: "Interiors",
    location: "Residential",
    description:
      "High-end interior finish package including feature walls, custom trim details, and coordinated lighting.",
    image: images.modernInterior,
  },
  {
    id: "custom-walnut-pieces",
    title: "Custom Hardwood Pieces",
    category: "Carpentry",
    location: "Shop-built",
    description:
      "Shop-built hardwood pieces — a floating mantel, matching shelves, and a custom vanity — made to the client's design.",
    image: images.customWoodworking,
  },
  {
    id: "commercial-site",
    title: "Commercial Site Build-Out",
    category: "Construction",
    location: "Commercial",
    description:
      "General construction and project management for a multi-phase commercial build with a tight schedule.",
    image: images.generalConstruction,
  },
  {
    id: "contemporary-living",
    title: "Contemporary Living Space",
    category: "Remodeling",
    location: "Residential",
    description:
      "Whole-floor remodel with new flooring, custom trim, and an updated layout for better light and flow.",
    image: images.openPlan,
  },
  {
    id: "exterior-refresh",
    title: "Exterior Renovation",
    category: "Exteriors",
    location: "Residential",
    description:
      "New siding, trim, windows, and entry details that transformed the home's curb appeal and weather protection.",
    image: images.homeExterior,
  },
];

export const projectCategories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
