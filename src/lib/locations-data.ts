/** London Monopoly board properties with approximate real-world coordinates. */
export const LONDON_LOCATIONS = [
  { name: "Old Kent Road", colorGroup: "brown", price: 60, rent: 6, latitude: 51.4878, longitude: -0.0634, boardOrder: 1 },
  { name: "Whitechapel Road", colorGroup: "brown", price: 60, rent: 6, latitude: 51.5175, longitude: -0.0669, boardOrder: 2 },
  { name: "The Angel, Islington", colorGroup: "light-blue", price: 100, rent: 10, latitude: 51.5347, longitude: -0.1058, boardOrder: 3 },
  { name: "Euston Road", colorGroup: "light-blue", price: 100, rent: 10, latitude: 51.5282, longitude: -0.1337, boardOrder: 4 },
  { name: "Pentonville Road", colorGroup: "light-blue", price: 120, rent: 12, latitude: 51.5315, longitude: -0.1189, boardOrder: 5 },
  { name: "Pall Mall", colorGroup: "pink", price: 140, rent: 14, latitude: 51.5068, longitude: -0.1372, boardOrder: 6 },
  { name: "Whitehall", colorGroup: "pink", price: 140, rent: 14, latitude: 51.5034, longitude: -0.1276, boardOrder: 7 },
  { name: "Northumberland Avenue", colorGroup: "pink", price: 160, rent: 16, latitude: 51.5059, longitude: -0.1228, boardOrder: 8 },
  { name: "Bow Street", colorGroup: "orange", price: 180, rent: 18, latitude: 51.5131, longitude: -0.1225, boardOrder: 9 },
  { name: "Marlborough Street", colorGroup: "orange", price: 180, rent: 18, latitude: 51.5144, longitude: -0.1412, boardOrder: 10 },
  { name: "Vine Street", colorGroup: "orange", price: 200, rent: 20, latitude: 51.5138, longitude: -0.1425, boardOrder: 11 },
  { name: "The Strand", colorGroup: "red", price: 220, rent: 22, latitude: 51.5112, longitude: -0.1198, boardOrder: 12 },
  { name: "Fleet Street", colorGroup: "red", price: 220, rent: 22, latitude: 51.5136, longitude: -0.1109, boardOrder: 13 },
  { name: "Trafalgar Square", colorGroup: "red", price: 240, rent: 24, latitude: 51.508, longitude: -0.1281, boardOrder: 14 },
  { name: "Leicester Square", colorGroup: "yellow", price: 260, rent: 26, latitude: 51.5103, longitude: -0.1301, boardOrder: 15 },
  { name: "Coventry Street", colorGroup: "yellow", price: 260, rent: 26, latitude: 51.5107, longitude: -0.1325, boardOrder: 16 },
  { name: "Piccadilly", colorGroup: "yellow", price: 280, rent: 28, latitude: 51.5098, longitude: -0.1379, boardOrder: 17 },
  { name: "Regent Street", colorGroup: "green", price: 300, rent: 30, latitude: 51.5115, longitude: -0.1401, boardOrder: 18 },
  { name: "Oxford Street", colorGroup: "green", price: 300, rent: 30, latitude: 51.5154, longitude: -0.1415, boardOrder: 19 },
  { name: "Bond Street", colorGroup: "green", price: 320, rent: 32, latitude: 51.5142, longitude: -0.1494, boardOrder: 20 },
  { name: "Park Lane", colorGroup: "dark-blue", price: 350, rent: 35, latitude: 51.5089, longitude: -0.1556, boardOrder: 21 },
  { name: "Mayfair", colorGroup: "dark-blue", price: 400, rent: 40, latitude: 51.5074, longitude: -0.1477, boardOrder: 22 },
] as const;

/** Compact board centred on Liverpool Street — suited to a 2–3 hour run. */
export const CITY_OF_LONDON_LOCATIONS = [
  { name: "Moorgate", colorGroup: "brown", price: 80, rent: 8, latitude: 51.5183, longitude: -0.0882, boardOrder: 1 },
  { name: "Wormwood Street", colorGroup: "brown", price: 80, rent: 8, latitude: 51.5154, longitude: -0.0822, boardOrder: 2 },
  { name: "Bishopsgate", colorGroup: "light-blue", price: 100, rent: 10, latitude: 51.5165, longitude: -0.0795, boardOrder: 3 },
  { name: "Lime Street", colorGroup: "light-blue", price: 100, rent: 10, latitude: 51.513, longitude: -0.0815, boardOrder: 4 },
  { name: "Old Broad Street", colorGroup: "light-blue", price: 120, rent: 12, latitude: 51.516, longitude: -0.084, boardOrder: 5 },
  { name: "Leadenhall Street", colorGroup: "pink", price: 140, rent: 14, latitude: 51.5127, longitude: -0.078, boardOrder: 6 },
  { name: "St Mary Axe", colorGroup: "pink", price: 160, rent: 16, latitude: 51.5145, longitude: -0.0803, boardOrder: 7 },
  { name: "Gracechurch Street", colorGroup: "pink", price: 140, rent: 14, latitude: 51.5136, longitude: -0.0843, boardOrder: 8 },
  { name: "Fenchurch Street", colorGroup: "orange", price: 180, rent: 18, latitude: 51.5118, longitude: -0.0788, boardOrder: 9 },
  { name: "Threadneedle Street", colorGroup: "orange", price: 180, rent: 18, latitude: 51.514, longitude: -0.0865, boardOrder: 10 },
  { name: "King William Street", colorGroup: "orange", price: 200, rent: 20, latitude: 51.511, longitude: -0.0865, boardOrder: 11 },
  { name: "Poultry", colorGroup: "red", price: 220, rent: 22, latitude: 51.5133, longitude: -0.0907, boardOrder: 12 },
  { name: "Cannon Street", colorGroup: "red", price: 240, rent: 24, latitude: 51.5113, longitude: -0.09, boardOrder: 13 },
  { name: "Queen Victoria Street", colorGroup: "yellow", price: 280, rent: 28, latitude: 51.5128, longitude: -0.0935, boardOrder: 14 },
] as const;

/** Market town board — compact centre, ~2–3 hours on foot. */
export const SAFFRON_WALDEN_LOCATIONS = [
  { name: "Radwinter Road", colorGroup: "brown", price: 80, rent: 8, latitude: 52.0245, longitude: 0.252, boardOrder: 1 },
  { name: "Debden Road", colorGroup: "brown", price: 80, rent: 8, latitude: 52.0262, longitude: 0.25, boardOrder: 2 },
  { name: "Newport", colorGroup: "light-blue", price: 100, rent: 10, latitude: 52.0258, longitude: 0.2318, boardOrder: 3 },
  { name: "Audley Road", colorGroup: "light-blue", price: 100, rent: 10, latitude: 52.0202, longitude: 0.2345, boardOrder: 4 },
  { name: "Museum Street", colorGroup: "light-blue", price: 120, rent: 12, latitude: 52.0221, longitude: 0.237, boardOrder: 5 },
  { name: "George Street", colorGroup: "pink", price: 140, rent: 14, latitude: 52.0242, longitude: 0.2388, boardOrder: 6 },
  { name: "Myddleton Place", colorGroup: "pink", price: 140, rent: 14, latitude: 52.0226, longitude: 0.2378, boardOrder: 7 },
  { name: "Castle Street", colorGroup: "pink", price: 160, rent: 16, latitude: 52.0239, longitude: 0.2362, boardOrder: 8 },
  { name: "King Street", colorGroup: "orange", price: 180, rent: 18, latitude: 52.0223, longitude: 0.2392, boardOrder: 9 },
  { name: "High Street", colorGroup: "orange", price: 180, rent: 18, latitude: 52.0229, longitude: 0.2412, boardOrder: 10 },
  { name: "Bridge Street", colorGroup: "orange", price: 200, rent: 20, latitude: 52.0215, longitude: 0.2425, boardOrder: 11 },
  { name: "Market Square", colorGroup: "red", price: 220, rent: 22, latitude: 52.0234, longitude: 0.2408, boardOrder: 12 },
  { name: "Abbey Lane", colorGroup: "red", price: 240, rent: 24, latitude: 52.0248, longitude: 0.2442, boardOrder: 13 },
  { name: "Common Hill", colorGroup: "yellow", price: 280, rent: 28, latitude: 52.0255, longitude: 0.2468, boardOrder: 14 },
] as const;

/** Compact board around Canary Wharf and West India Quay — ~2–3 hours on foot. */
export const CANARY_WHARF_LOCATIONS = [
  { name: "Westferry Circus", colorGroup: "brown", price: 80, rent: 8, latitude: 51.5068, longitude: -0.0282, boardOrder: 1 },
  { name: "Montgomery Street", colorGroup: "brown", price: 80, rent: 8, latitude: 51.5069, longitude: -0.0186, boardOrder: 2 },
  { name: "Cabot Square", colorGroup: "light-blue", price: 100, rent: 10, latitude: 51.5051, longitude: -0.0214, boardOrder: 3 },
  { name: "Canada Square", colorGroup: "light-blue", price: 100, rent: 10, latitude: 51.5033, longitude: -0.0197, boardOrder: 4 },
  { name: "Churchill Place", colorGroup: "light-blue", price: 120, rent: 12, latitude: 51.5041, longitude: -0.0144, boardOrder: 5 },
  { name: "West India Quay", colorGroup: "pink", price: 140, rent: 14, latitude: 51.5077, longitude: -0.0223, boardOrder: 6 },
  { name: "Hertsmere Road", colorGroup: "pink", price: 140, rent: 14, latitude: 51.5082, longitude: -0.0255, boardOrder: 7 },
  { name: "Bank Street", colorGroup: "pink", price: 160, rent: 16, latitude: 51.5036, longitude: -0.0169, boardOrder: 8 },
  { name: "Adams Place", colorGroup: "orange", price: 180, rent: 18, latitude: 51.5058, longitude: -0.0162, boardOrder: 9 },
  { name: "Marsh Wall", colorGroup: "orange", price: 180, rent: 18, latitude: 51.5012, longitude: -0.0178, boardOrder: 10 },
  { name: "South Colonnade", colorGroup: "orange", price: 200, rent: 20, latitude: 51.5024, longitude: -0.0231, boardOrder: 11 },
  { name: "Jubilee Place", colorGroup: "red", price: 220, rent: 22, latitude: 51.5038, longitude: -0.0188, boardOrder: 12 },
  { name: "Crossrail Place", colorGroup: "red", price: 240, rent: 24, latitude: 51.5056, longitude: -0.0158, boardOrder: 13 },
  { name: "Harbour Exchange", colorGroup: "yellow", price: 280, rent: 28, latitude: 51.4998, longitude: -0.0135, boardOrder: 14 },
] as const;

export const COLOR_GROUP_STYLES: Record<string, { bg: string; border: string; label: string }> = {
  brown: { bg: "bg-amber-900/90", border: "border-amber-950", label: "Brown" },
  "light-blue": { bg: "bg-sky-400/90", border: "border-sky-600", label: "Light blue" },
  pink: { bg: "bg-pink-400/90", border: "border-pink-600", label: "Pink" },
  orange: { bg: "bg-orange-500/90", border: "border-orange-700", label: "Orange" },
  red: { bg: "bg-red-600/90", border: "border-red-800", label: "Red" },
  yellow: { bg: "bg-yellow-400/90", border: "border-yellow-600", label: "Yellow" },
  green: { bg: "bg-emerald-600/90", border: "border-emerald-800", label: "Green" },
  "dark-blue": { bg: "bg-blue-800/90", border: "border-blue-950", label: "Dark blue" },
};
