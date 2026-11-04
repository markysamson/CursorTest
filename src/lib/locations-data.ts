/** Board stop: a real-world landmark (not a street name). Rent is derived from price at seed time. */
export type LocationDefinition = {
  name: string;
  colorGroup: string;
  price: number;
  latitude: number;
  longitude: number;
  boardOrder: number;
  /** Wikimedia Commons file name (resolved to a URL when seeding). */
  commonsFile: string;
};

export const LONDON_LOCATIONS: LocationDefinition[] = [
  { name: "Tower Bridge", colorGroup: "brown", price: 60, latitude: 51.4878, longitude: -0.0634, boardOrder: 1, commonsFile: "Tower_Bridge_from_Shad_Thames.jpg" },
  { name: "Whitechapel Gallery", colorGroup: "brown", price: 60, latitude: 51.5175, longitude: -0.0669, boardOrder: 2, commonsFile: "Whitechapel Gallery 2020 (3) - Copy.jpg" },
  { name: "The Angel, Islington", colorGroup: "light-blue", price: 100, latitude: 51.5347, longitude: -0.1058, boardOrder: 3, commonsFile: "The Angel, Islington, from Pentonville Road - geograph.org.uk - 1523990.jpg" },
  { name: "British Library", colorGroup: "light-blue", price: 100, latitude: 51.5282, longitude: -0.1337, boardOrder: 4, commonsFile: "The British Library, London - geograph.org.uk - 1599135.jpg" },
  { name: "King's Cross Station", colorGroup: "light-blue", price: 120, latitude: 51.5315, longitude: -0.1189, boardOrder: 5, commonsFile: "King's Cross Western Concourse.jpg" },
  { name: "Institute of Contemporary Arts", colorGroup: "pink", price: 140, latitude: 51.5068, longitude: -0.1372, boardOrder: 6, commonsFile: "Institute of Contemporary Arts in London 2004.jpg" },
  { name: "Banqueting House", colorGroup: "pink", price: 140, latitude: 51.5034, longitude: -0.1276, boardOrder: 7, commonsFile: "Banqueting_House,_Whitehall,_London.jpg" },
  { name: "Cleopatra's Needle", colorGroup: "pink", price: 160, latitude: 51.5059, longitude: -0.1228, boardOrder: 8, commonsFile: "Cleopatra's_Needle,_London.jpg" },
  { name: "Royal Opera House", colorGroup: "orange", price: 180, latitude: 51.5131, longitude: -0.1225, boardOrder: 9, commonsFile: "Royal Opera House, Covent Garden, London WC2 - geograph.org.uk - 4481270.jpg" },
  { name: "Liberty London", colorGroup: "orange", price: 180, latitude: 51.5144, longitude: -0.1412, boardOrder: 10, commonsFile: "Liberty, London (January 2024) 02.jpg" },
  { name: "St James's Palace", colorGroup: "orange", price: 200, latitude: 51.5138, longitude: -0.1425, boardOrder: 11, commonsFile: "Friary Court, St James's Palace, London - 2023-05-04.jpg" },
  { name: "Somerset House", colorGroup: "red", price: 220, latitude: 51.5112, longitude: -0.1198, boardOrder: 12, commonsFile: "Strand Entrance to Somerset House, London-geograph-3685577.jpg" },
  { name: "St Bride's Church", colorGroup: "red", price: 220, latitude: 51.5136, longitude: -0.1109, boardOrder: 13, commonsFile: "St Bride's Church, London - Diliff.jpg" },
  { name: "Trafalgar Square", colorGroup: "red", price: 240, latitude: 51.508, longitude: -0.1281, boardOrder: 14, commonsFile: "Trafalgar_Square,_London_2_-_Jun_2009.jpg" },
  { name: "Leicester Square", colorGroup: "yellow", price: 260, latitude: 51.5103, longitude: -0.1301, boardOrder: 15, commonsFile: "Leicester_Square,_London.jpg" },
  { name: "Chinatown Gate", colorGroup: "yellow", price: 260, latitude: 51.5107, longitude: -0.1325, boardOrder: 16, commonsFile: "London,_China_Town_--_2016_--_4868.jpg" },
  { name: "Piccadilly Circus", colorGroup: "yellow", price: 280, latitude: 51.5098, longitude: -0.1379, boardOrder: 17, commonsFile: "Open Happiness Piccadilly Circus Blue-Pink Hour 120917-1126-jikatu.jpg" },
  { name: "BBC Broadcasting House", colorGroup: "green", price: 300, latitude: 51.5115, longitude: -0.1401, boardOrder: 18, commonsFile: "New_Broadcasting_House_(14561681425).jpg" },
  { name: "Selfridges", colorGroup: "green", price: 300, latitude: 51.5154, longitude: -0.1415, boardOrder: 19, commonsFile: "Selfridges,_Oxford_Street_-_geograph.org.uk_-_7624514.jpg" },
  { name: "Royal Academy of Arts", colorGroup: "green", price: 320, latitude: 51.5142, longitude: -0.1494, boardOrder: 20, commonsFile: "Royal_Academy.jpg" },
  { name: "Hyde Park Corner", colorGroup: "dark-blue", price: 350, latitude: 51.5089, longitude: -0.1556, boardOrder: 21, commonsFile: "Shotter_Boys_Hyde_Park_Corner,_1842_edited.jpg" },
  { name: "Grosvenor Square", colorGroup: "dark-blue", price: 400, latitude: 51.5074, longitude: -0.1477, boardOrder: 22, commonsFile: "Grosvenor_Square_-_geograph.org.uk_-_1090067.jpg" },
];

export const CITY_OF_LONDON_LOCATIONS: LocationDefinition[] = [
  { name: "Barbican Centre", colorGroup: "brown", price: 80, latitude: 51.5183, longitude: -0.0882, boardOrder: 1, commonsFile: "Barbican_Lakeside_on_a_summer_evening.jpg" },
  { name: "Liverpool Street Station", colorGroup: "brown", price: 80, latitude: 51.5154, longitude: -0.0822, boardOrder: 2, commonsFile: "Liverpool_Street_Station_South_Entrance_(Southeast_View_-_01).jpg" },
  { name: "Spitalfields Market", colorGroup: "light-blue", price: 100, latitude: 51.5165, longitude: -0.0795, boardOrder: 3, commonsFile: "Old_Spitalfields_Market_Panorama,_London,_UK_-_Diliff.jpg" },
  { name: "Leadenhall Market", colorGroup: "light-blue", price: 100, latitude: 51.513, longitude: -0.0815, boardOrder: 4, commonsFile: "Leadenhall_Market_In_London_-_Feb_2006.jpg" },
  { name: "The Gherkin", colorGroup: "light-blue", price: 120, latitude: 51.516, longitude: -0.084, boardOrder: 5, commonsFile: "30_St_Mary_Axe,_'Gherkin'.JPG" },
  { name: "Lloyd's Building", colorGroup: "pink", price: 140, latitude: 51.5127, longitude: -0.078, boardOrder: 6, commonsFile: "Lloyds_building_taken_2011.jpg" },
  { name: "The Monument", colorGroup: "pink", price: 160, latitude: 51.5145, longitude: -0.0803, boardOrder: 7, commonsFile: "The_Monument_to_the_Great_Fire_of_London.JPG" },
  { name: "Bank of England", colorGroup: "pink", price: 140, latitude: 51.5136, longitude: -0.0843, boardOrder: 8, commonsFile: "Bank-of-England.jpg" },
  { name: "Tower of London", colorGroup: "orange", price: 180, latitude: 51.5118, longitude: -0.0788, boardOrder: 9, commonsFile: "Tower_of_London_from_the_Shard_(8515883950).jpg" },
  { name: "St Paul's Cathedral", colorGroup: "orange", price: 180, latitude: 51.514, longitude: -0.0865, boardOrder: 10, commonsFile: "St_Pauls_aerial_(cropped).jpg" },
  { name: "Mansion House", colorGroup: "orange", price: 200, latitude: 51.511, longitude: -0.0865, boardOrder: 11, commonsFile: "Mansion_House,_London.jpg" },
  { name: "Guildhall", colorGroup: "red", price: 220, latitude: 51.5133, longitude: -0.0907, boardOrder: 12, commonsFile: "Guildhall,_London.jpg" },
  { name: "Wren's St Stephen Walbrook", colorGroup: "red", price: 240, latitude: 51.5113, longitude: -0.09, boardOrder: 13, commonsFile: "St_Stephen_Walbrook_20130324_033.jpg" },
  { name: "Millennium Bridge", colorGroup: "yellow", price: 280, latitude: 51.5102, longitude: -0.0984, boardOrder: 14, commonsFile: "Millenium_bridge_2015.jpg" },
];

export const SAFFRON_WALDEN_LOCATIONS: LocationDefinition[] = [
  { name: "Saffron Walden Museum", colorGroup: "brown", price: 80, latitude: 52.0245, longitude: 0.252, boardOrder: 1, commonsFile: "Saffron Walden museum erratic.jpg" },
  { name: "Audley End House", colorGroup: "brown", price: 80, latitude: 52.0262, longitude: 0.25, boardOrder: 2, commonsFile: "Audley_End_House_front_elevation.jpg" },
  { name: "St Mary the Virgin Church", colorGroup: "light-blue", price: 100, latitude: 52.0258, longitude: 0.2318, boardOrder: 3, commonsFile: "St_Mary's_Church,_Saffron_Walden.jpg" },
  { name: "Saffron Walden Castle", colorGroup: "light-blue", price: 100, latitude: 52.0202, longitude: 0.2345, boardOrder: 4, commonsFile: "Walden_castle.jpg" },
  { name: "Fry Art Gallery", colorGroup: "light-blue", price: 120, latitude: 52.0221, longitude: 0.237, boardOrder: 5, commonsFile: "Fry_Art_Gallery,_Saffron_Walden.jpg" },
  { name: "Market Square", colorGroup: "pink", price: 140, latitude: 52.0242, longitude: 0.2388, boardOrder: 6, commonsFile: "4 Market Hill, Saffron Walden, October 2023.jpg" },
  { name: "The Old Sun Inn", colorGroup: "pink", price: 140, latitude: 52.0226, longitude: 0.2378, boardOrder: 7, commonsFile: "Old Sun Inn, Saffron Walden (2025-08-09).jpg" },
  { name: "Bridge End Gardens", colorGroup: "pink", price: 160, latitude: 52.0239, longitude: 0.2362, boardOrder: 8, commonsFile: "Bridge_End_Gardens,_Saffron_Walden.jpg" },
  { name: "Saffron Walden Town Hall", colorGroup: "orange", price: 180, latitude: 52.0223, longitude: 0.2392, boardOrder: 9, commonsFile: "Saffron_Walden_Town_Hall.jpg" },
  { name: "The Eight Bells", colorGroup: "orange", price: 180, latitude: 52.0229, longitude: 0.2412, boardOrder: 10, commonsFile: "Eight Bells Inn (geograph 3630517).jpg" },
  { name: "Common Hill Windmill", colorGroup: "orange", price: 200, latitude: 52.0215, longitude: 0.2425, boardOrder: 11, commonsFile: "Windmill Hill, Saffron Walden - geograph.org.uk - 7139134.jpg" },
  { name: "Gibsons Mill", colorGroup: "red", price: 220, latitude: 52.0234, longitude: 0.2408, boardOrder: 12, commonsFile: "High Street, Saffron Walden - geograph.org.uk - 3563732.jpg" },
  { name: "The Friends Meeting House", colorGroup: "red", price: 240, latitude: 52.0248, longitude: 0.2442, boardOrder: 13, commonsFile: "Friends Meeting House, High Street, Saffron Walden - geograph.org.uk - 3563736.jpg" },
  { name: "Audley End Railway Station", colorGroup: "yellow", price: 280, latitude: 52.0255, longitude: 0.2468, boardOrder: 14, commonsFile: "Audley_End_station_front.jpg" },
];

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
