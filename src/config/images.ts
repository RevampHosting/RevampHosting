/**
 * Placeholder photography (Unsplash). Replace any URL with a path to your own
 * photo in /public (e.g. "/images/kitchen-remodel.jpg") or another hosted image.
 * If a remote image ever fails to load, a branded placeholder is shown instead.
 */
const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const images = {
  hero: u("1504307651254-35680f356dfd"),
  aboutCrew: u("1621905251189-08b45d6a269e"),
  aboutBlueprint: u("1503387762-592deb58ef4e"),
  ctaBackground: u("1541888946425-d81bb19240f5"),

  generalConstruction: u("1541888946425-d81bb19240f5"),
  residentialRemodeling: u("1484154218962-a197022b5858"),
  customCarpentry: u("1504148455328-c376907d081c"),
  framing: u("1503387762-592deb58ef4e"),
  deckConstruction: u("1600585154340-be6161a56a0c"),
  flooring: u("1618221195710-dd6b41faaea6"),
  interiorRenovations: u("1600566753190-17f0baa2a6c3"),
  exteriorRenovations: u("1512917774080-9991f1c4c750"),
  customWoodworking: u("1517705008128-361805f42e86"),

  livingRoom: u("1513694203232-719a280e022f"),
  modernInterior: u("1600607687939-ce8a6c25118c"),
  openPlan: u("1600210492486-724fe5c67fb0"),
  workshop: u("1590069261209-f8e9b8642343"),
  tools: u("1581858726788-75bc0f6a952d"),
  homeExterior: u("1558618666-fcd25c85cd64"),
  hardwood: u("1589939705384-5185137a7f0f"),
  floorInstall: u("1562259949-e8e7689d7828"),
} as const;
