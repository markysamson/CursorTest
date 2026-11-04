/** Board stop: a real-world landmark (not a street name). Rent is derived from price at seed time. */
export type LocationDefinition = {
  name: string;
  colorGroup: string;
  price: number;
  latitude: number;
  longitude: number;
  boardOrder: number;
  landmarkImageUrl: string;
};

export const LONDON_LOCATIONS: LocationDefinition[] = [
  { name: "Tower Bridge", colorGroup: "brown", price: 60, latitude: 51.4878, longitude: -0.0634, boardOrder: 1, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Tower_Bridge_from_Shad_Thames.jpg/640px-Tower_Bridge_from_Shad_Thames.jpg" },
  { name: "Whitechapel Gallery", colorGroup: "brown", price: 60, latitude: 51.5175, longitude: -0.0669, boardOrder: 2, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Whitechapel_Gallery_%28front%29.jpg/640px-Whitechapel_Gallery_%28front%29.jpg" },
  { name: "The Angel, Islington", colorGroup: "light-blue", price: 100, latitude: 51.5347, longitude: -0.1058, boardOrder: 3, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Angel_Islington.jpg/640px-Angel_Islington.jpg" },
  { name: "British Library", colorGroup: "light-blue", price: 100, latitude: 51.5282, longitude: -0.1337, boardOrder: 4, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/British_Library_%281020273990%29.jpg/640px-British_Library_%281020273990%29.jpg" },
  { name: "King's Cross Station", colorGroup: "light-blue", price: 120, latitude: 51.5315, longitude: -0.1189, boardOrder: 5, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Kings_Cross_Station_-_Western_Concourse_%282%29.jpg/640px-Kings_Cross_Station_-_Western_Concourse_%282%29.jpg" },
  { name: "Institute of Contemporary Arts", colorGroup: "pink", price: 140, latitude: 51.5068, longitude: -0.1372, boardOrder: 6, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Institute_of_Contemporary_Arts_%28ICA%29%2C_The_Mall%2C_London.jpg/640px-Institute_of_Contemporary_Arts_%28ICA%29%2C_The_Mall%2C_London.jpg" },
  { name: "Banqueting House", colorGroup: "pink", price: 140, latitude: 51.5034, longitude: -0.1276, boardOrder: 7, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Banqueting_House%2C_Whitehall%2C_London.jpg/640px-Banqueting_House%2C_Whitehall%2C_London.jpg" },
  { name: "Cleopatra's Needle", colorGroup: "pink", price: 160, latitude: 51.5059, longitude: -0.1228, boardOrder: 8, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Cleopatra%27s_Needle%2C_London.jpg/640px-Cleopatra%27s_Needle%2C_London.jpg" },
  { name: "Royal Opera House", colorGroup: "orange", price: 180, latitude: 51.5131, longitude: -0.1225, boardOrder: 9, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Royal_Opera_House%2C_Covent_Garden%2C_London%2C_UK_-_Diliff.jpg/640px-Royal_Opera_House%2C_Covent_Garden%2C_London%2C_UK_-_Diliff.jpg" },
  { name: "Liberty London", colorGroup: "orange", price: 180, latitude: 51.5144, longitude: -0.1412, boardOrder: 10, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Liberty_Store%2C_London.jpg/640px-Liberty_Store%2C_London.jpg" },
  { name: "St James's Palace", colorGroup: "orange", price: 200, latitude: 51.5138, longitude: -0.1425, boardOrder: 11, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/St_James%27s_Palace%2C_London.jpg/640px-St_James%27s_Palace%2C_London.jpg" },
  { name: "Somerset House", colorGroup: "red", price: 220, latitude: 51.5112, longitude: -0.1198, boardOrder: 12, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Somerset_House_%28London%29.jpg/640px-Somerset_House_%28London%29.jpg" },
  { name: "St Bride's Church", colorGroup: "red", price: 220, latitude: 51.5136, longitude: -0.1109, boardOrder: 13, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/St_Bride%27s_Church%2C_Fleet_Street%2C_London.jpg/640px-St_Bride%27s_Church%2C_Fleet_Street%2C_London.jpg" },
  { name: "Trafalgar Square", colorGroup: "red", price: 240, latitude: 51.508, longitude: -0.1281, boardOrder: 14, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Trafalgar_Square%2C_London%2C_UK_-_Diliff.jpg/640px-Trafalgar_Square%2C_London%2C_UK_-_Diliff.jpg" },
  { name: "Leicester Square", colorGroup: "yellow", price: 260, latitude: 51.5103, longitude: -0.1301, boardOrder: 15, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Leicester_Square%2C_London.jpg/640px-Leicester_Square%2C_London.jpg" },
  { name: "Chinatown Gate", colorGroup: "yellow", price: 260, latitude: 51.5107, longitude: -0.1325, boardOrder: 16, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Chinatown_gate%2C_Wardour_Street%2C_London.jpg/640px-Chinatown_gate%2C_Wardour_Street%2C_London.jpg" },
  { name: "Piccadilly Circus", colorGroup: "yellow", price: 280, latitude: 51.5098, longitude: -0.1379, boardOrder: 17, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Piccadilly_Circus%2C_London%2C_UK_-_Diliff.jpg/640px-Piccadilly_Circus%2C_London%2C_UK_-_Diliff.jpg" },
  { name: "BBC Broadcasting House", colorGroup: "green", price: 300, latitude: 51.5115, longitude: -0.1401, boardOrder: 18, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/BBC_Broadcasting_House_%28front%29.jpg/640px-BBC_Broadcasting_House_%28front%29.jpg" },
  { name: "Selfridges", colorGroup: "green", price: 300, latitude: 51.5154, longitude: -0.1415, boardOrder: 19, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Selfridges%2C_Oxford_Street%2C_London.jpg/640px-Selfridges%2C_Oxford_Street%2C_London.jpg" },
  { name: "Royal Academy of Arts", colorGroup: "green", price: 320, latitude: 51.5142, longitude: -0.1494, boardOrder: 20, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Royal_Academy_of_Arts%2C_Burlington_House.jpg/640px-Royal_Academy_of_Arts%2C_Burlington_House.jpg" },
  { name: "Hyde Park Corner", colorGroup: "dark-blue", price: 350, latitude: 51.5089, longitude: -0.1556, boardOrder: 21, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Wellington_Arch%2C_Hyde_Park_Corner%2C_London.jpg/640px-Wellington_Arch%2C_Hyde_Park_Corner%2C_London.jpg" },
  { name: "Grosvenor Square", colorGroup: "dark-blue", price: 400, latitude: 51.5074, longitude: -0.1477, boardOrder: 22, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Grosvenor_Square%2C_London.jpg/640px-Grosvenor_Square%2C_London.jpg" },
];

export const CITY_OF_LONDON_LOCATIONS: LocationDefinition[] = [
  { name: "Barbican Centre", colorGroup: "brown", price: 80, latitude: 51.5183, longitude: -0.0882, boardOrder: 1, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Barbican_Centre%2C_London.jpg/640px-Barbican_Centre%2C_London.jpg" },
  { name: "Liverpool Street Station", colorGroup: "brown", price: 80, latitude: 51.5154, longitude: -0.0822, boardOrder: 2, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Liverpool_Street_Station%2C_London.jpg/640px-Liverpool_Street_Station%2C_London.jpg" },
  { name: "Spitalfields Market", colorGroup: "light-blue", price: 100, latitude: 51.5165, longitude: -0.0795, boardOrder: 3, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Spitalfields_Market%2C_London.jpg/640px-Spitalfields_Market%2C_London.jpg" },
  { name: "Leadenhall Market", colorGroup: "light-blue", price: 100, latitude: 51.513, longitude: -0.0815, boardOrder: 4, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Leadenhall_Market_In_London_-_Feb_2006.jpg/640px-Leadenhall_Market_In_London_-_Feb_2006.jpg" },
  { name: "The Gherkin", colorGroup: "light-blue", price: 120, latitude: 51.516, longitude: -0.084, boardOrder: 5, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/30_St_Mary_Axe_%28The_Gherkin%29.jpg/640px-30_St_Mary_Axe_%28The_Gherkin%29.jpg" },
  { name: "Lloyd's Building", colorGroup: "pink", price: 140, latitude: 51.5127, longitude: -0.078, boardOrder: 6, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Lloyd%27s_building_%28London%29.jpg/640px-Lloyd%27s_building_%28London%29.jpg" },
  { name: "The Monument", colorGroup: "pink", price: 160, latitude: 51.5145, longitude: -0.0803, boardOrder: 7, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/The_Monument_to_the_Great_Fire_of_London%2C_Fish_Street_Hill%2C_London.jpg/640px-The_Monument_to_the_Great_Fire_of_London%2C_Fish_Street_Hill%2C_London.jpg" },
  { name: "Bank of England", colorGroup: "pink", price: 140, latitude: 51.5136, longitude: -0.0843, boardOrder: 8, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Bank_of_England%2C_London.jpg/640px-Bank_of_England%2C_London.jpg" },
  { name: "Tower of London", colorGroup: "orange", price: 180, latitude: 51.5118, longitude: -0.0788, boardOrder: 9, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Tower_of_London_from_Shard_%28cropped%29.jpg/640px-Tower_of_London_from_Shard_%28cropped%29.jpg" },
  { name: "St Paul's Cathedral", colorGroup: "orange", price: 180, latitude: 51.514, longitude: -0.0865, boardOrder: 10, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/St_Paul%27s_Cathedral_%28cropped%29.jpg/640px-St_Paul%27s_Cathedral_%28cropped%29.jpg" },
  { name: "Mansion House", colorGroup: "orange", price: 200, latitude: 51.511, longitude: -0.0865, boardOrder: 11, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mansion_House%2C_London.jpg/640px-Mansion_House%2C_London.jpg" },
  { name: "Guildhall", colorGroup: "red", price: 220, latitude: 51.5133, longitude: -0.0907, boardOrder: 12, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Guildhall%2C_London.jpg/640px-Guildhall%2C_London.jpg" },
  { name: "Wren's St Stephen Walbrook", colorGroup: "red", price: 240, latitude: 51.5113, longitude: -0.09, boardOrder: 13, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/St_Stephen_Walbrook%2C_London.jpg/640px-St_Stephen_Walbrook%2C_London.jpg" },
  { name: "Millennium Bridge", colorGroup: "yellow", price: 280, latitude: 51.5128, longitude: -0.0935, boardOrder: 14, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Millennium_Bridge_and_St_Paul%27s%2C_London.jpg/640px-Millennium_Bridge_and_St_Paul%27s%2C_London.jpg" },
];

export const SAFFRON_WALDEN_LOCATIONS: LocationDefinition[] = [
  { name: "Saffron Walden Museum", colorGroup: "brown", price: 80, latitude: 52.0245, longitude: 0.252, boardOrder: 1, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Saffron_Walden_Museum.jpg/640px-Saffron_Walden_Museum.jpg" },
  { name: "Audley End House", colorGroup: "brown", price: 80, latitude: 52.0262, longitude: 0.25, boardOrder: 2, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Audley_End_House_-_geograph.org.uk_-_1274632.jpg/640px-Audley_End_House_-_geograph.org.uk_-_1274632.jpg" },
  { name: "St Mary the Virgin Church", colorGroup: "light-blue", price: 100, latitude: 52.0258, longitude: 0.2318, boardOrder: 3, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/St_Mary%27s_Church%2C_Saffron_Walden.jpg/640px-St_Mary%27s_Church%2C_Saffron_Walden.jpg" },
  { name: "Saffron Walden Castle", colorGroup: "light-blue", price: 100, latitude: 52.0202, longitude: 0.2345, boardOrder: 4, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Saffron_Walden_castle%2C_keep.jpg/640px-Saffron_Walden_castle%2C_keep.jpg" },
  { name: "Fry Art Gallery", colorGroup: "light-blue", price: 120, latitude: 52.0221, longitude: 0.237, boardOrder: 5, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Fry_Art_Gallery%2C_Saffron_Walden.jpg/640px-Fry_Art_Gallery%2C_Saffron_Walden.jpg" },
  { name: "Market Square", colorGroup: "pink", price: 140, latitude: 52.0242, longitude: 0.2388, boardOrder: 6, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Market_Square%2C_Saffron_Walden.jpg/640px-Market_Square%2C_Saffron_Walden.jpg" },
  { name: "The Old Sun Inn", colorGroup: "pink", price: 140, latitude: 52.0226, longitude: 0.2378, boardOrder: 7, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Old_Sun_Inn%2C_Saffron_Walden.jpg/640px-Old_Sun_Inn%2C_Saffron_Walden.jpg" },
  { name: "Bridge End Gardens", colorGroup: "pink", price: 160, latitude: 52.0239, longitude: 0.2362, boardOrder: 8, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bridge_End_Gardens%2C_Saffron_Walden.jpg/640px-Bridge_End_Gardens%2C_Saffron_Walden.jpg" },
  { name: "Saffron Walden Town Hall", colorGroup: "orange", price: 180, latitude: 52.0223, longitude: 0.2392, boardOrder: 9, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Saffron_Walden_Town_Hall.jpg/640px-Saffron_Walden_Town_Hall.jpg" },
  { name: "The Eight Bells", colorGroup: "orange", price: 180, latitude: 52.0229, longitude: 0.2412, boardOrder: 10, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Eight_Bells%2C_Saffron_Walden.jpg/640px-Eight_Bells%2C_Saffron_Walden.jpg" },
  { name: "Common Hill Windmill", colorGroup: "orange", price: 200, latitude: 52.0215, longitude: 0.2425, boardOrder: 11, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Common_Windmill%2C_Saffron_Walden.jpg/640px-Common_Windmill%2C_Saffron_Walden.jpg" },
  { name: "Gibsons Mill", colorGroup: "red", price: 220, latitude: 52.0234, longitude: 0.2408, boardOrder: 12, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Gibsons_Mill%2C_Saffron_Walden.jpg/640px-Gibsons_Mill%2C_Saffron_Walden.jpg" },
  { name: "The Friends Meeting House", colorGroup: "red", price: 240, latitude: 52.0248, longitude: 0.2442, boardOrder: 13, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Friends_Meeting_House%2C_Saffron_Walden.jpg/640px-Friends_Meeting_House%2C_Saffron_Walden.jpg" },
  { name: "Audley End Railway Station", colorGroup: "yellow", price: 280, latitude: 52.0255, longitude: 0.2468, boardOrder: 14, landmarkImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Audley_End_railway_station.jpg/640px-Audley_End_railway_station.jpg" },
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
