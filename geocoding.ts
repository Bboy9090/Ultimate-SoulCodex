// Simple geocoding utility for major cities
// This provides basic geocoding support for synastry calculations
// Can be enhanced with a proper geocoding API later if needed

interface GeocodeResult {
  lat: string;
  lon: string;
  location: string;
}

// Comprehensive city database (same as frontend for consistency)
const LOCATION_DATABASE: { [key: string]: { lat: string; lon: string } } = {
  // United States - Major Cities
  "new york": { lat: "40.7128", lon: "-74.0060" },
  "new york city": { lat: "40.7128", lon: "-74.0060" },
  "nyc": { lat: "40.7128", lon: "-74.0060" },
  "manhattan": { lat: "40.7831", lon: "-73.9712" },
  "brooklyn": { lat: "40.6782", lon: "-73.9442" },
  "los angeles": { lat: "34.0522", lon: "-118.2437" },
  "la": { lat: "34.0522", lon: "-118.2437" },
  "chicago": { lat: "41.8781", lon: "-87.6298" },
  "houston": { lat: "29.7604", lon: "-95.3698" },
  "phoenix": { lat: "33.4484", lon: "-112.0740" },
  "philadelphia": { lat: "39.9526", lon: "-75.1652" },
  "san antonio": { lat: "29.4241", lon: "-98.4936" },
  "san diego": { lat: "32.7157", lon: "-117.1611" },
  "dallas": { lat: "32.7767", lon: "-96.7970" },
  "san jose": { lat: "37.3382", lon: "-121.8863" },
  "austin": { lat: "30.2672", lon: "-97.7431" },
  "san francisco": { lat: "37.7749", lon: "-122.4194" },
  "seattle": { lat: "47.6062", lon: "-122.3321" },
  "denver": { lat: "39.7392", lon: "-104.9903" },
  "boston": { lat: "42.3601", lon: "-71.0589" },
  "miami": { lat: "25.7617", lon: "-80.1918" },
  "atlanta": { lat: "33.7490", lon: "-84.3880" },
  "washington": { lat: "38.9072", lon: "-77.0369" },
  "washington dc": { lat: "38.9072", lon: "-77.0369" },
  
  // Canada
  "toronto": { lat: "43.6532", lon: "-79.3832" },
  "montreal": { lat: "45.5017", lon: "-73.5673" },
  "vancouver": { lat: "49.2827", lon: "-123.1207" },
  "calgary": { lat: "51.0447", lon: "-114.0719" },
  "ottawa": { lat: "45.4215", lon: "-75.6972" },
  
  // UK
  "london": { lat: "51.5074", lon: "-0.1278" },
  "manchester": { lat: "53.4808", lon: "-2.2426" },
  "birmingham": { lat: "52.4862", lon: "-1.8904" },
  "liverpool": { lat: "53.4084", lon: "-2.9916" },
  "edinburgh": { lat: "55.9533", lon: "-3.1883" },
  
  // Europe
  "paris": { lat: "48.8566", lon: "2.3522" },
  "berlin": { lat: "52.5200", lon: "13.4050" },
  "madrid": { lat: "40.4168", lon: "-3.7038" },
  "rome": { lat: "41.9028", lon: "12.4964" },
  "amsterdam": { lat: "52.3676", lon: "4.9041" },
  "vienna": { lat: "48.2082", lon: "16.3738" },
  "barcelona": { lat: "41.3851", lon: "2.1734" },
  "munich": { lat: "48.1351", lon: "11.5820" },
  "prague": { lat: "50.0755", lon: "14.4378" },
  "budapest": { lat: "47.4979", lon: "19.0402" },
  "warsaw": { lat: "52.2297", lon: "21.0122" },
  "stockholm": { lat: "59.3293", lon: "18.0686" },
  "copenhagen": { lat: "55.6761", lon: "12.5683" },
  "oslo": { lat: "59.9139", lon: "10.7522" },
  "helsinki": { lat: "60.1699", lon: "24.9384" },
  "athens": { lat: "37.9838", lon: "23.7275" },
  "lisbon": { lat: "38.7223", lon: "-9.1393" },
  "dublin": { lat: "53.3498", lon: "-6.2603" },
  
  // Asia
  "tokyo": { lat: "35.6762", lon: "139.6503" },
  "shanghai": { lat: "31.2304", lon: "121.4737" },
  "beijing": { lat: "39.9042", lon: "116.4074" },
  "hong kong": { lat: "22.3193", lon: "114.1694" },
  "singapore": { lat: "1.3521", lon: "103.8198" },
  "mumbai": { lat: "19.0760", lon: "72.8777" },
  "delhi": { lat: "28.7041", lon: "77.1025" },
  "bangalore": { lat: "12.9716", lon: "77.5946" },
  "seoul": { lat: "37.5665", lon: "126.9780" },
  "bangkok": { lat: "13.7563", lon: "100.5018" },
  "manila": { lat: "14.5995", lon: "120.9842" },
  "jakarta": { lat: "-6.2088", lon: "106.8456" },
  "kuala lumpur": { lat: "3.1390", lon: "101.6869" },
  "taipei": { lat: "25.0330", lon: "121.5654" },
  "dubai": { lat: "25.2048", lon: "55.2708" },
  "tel aviv": { lat: "32.0853", lon: "34.7818" },
  "jerusalem": { lat: "31.7683", lon: "35.2137" },
  
  // Australia & Oceania
  "sydney": { lat: "-33.8688", lon: "151.2093" },
  "melbourne": { lat: "-37.8136", lon: "144.9631" },
  "brisbane": { lat: "-27.4698", lon: "153.0251" },
  "perth": { lat: "-31.9505", lon: "115.8605" },
  "auckland": { lat: "-36.8485", lon: "174.7633" },
  "wellington": { lat: "-41.2865", lon: "174.7762" },
  
  // South America
  "sao paulo": { lat: "-23.5505", lon: "-46.6333" },
  "rio de janeiro": { lat: "-22.9068", lon: "-43.1729" },
  "buenos aires": { lat: "-34.6037", lon: "-58.3816" },
  "santiago": { lat: "-33.4489", lon: "-70.6693" },
  "lima": { lat: "-12.0464", lon: "-77.0428" },
  "bogota": { lat: "4.7110", lon: "-74.0721" },
  "mexico city": { lat: "19.4326", lon: "-99.1332" },
  
  // Africa
  "cairo": { lat: "30.0444", lon: "31.2357" },
  "lagos": { lat: "6.5244", lon: "3.3792" },
  "johannesburg": { lat: "-26.2041", lon: "28.0473" },
  "cape town": { lat: "-33.9249", lon: "18.4241" },
  "nairobi": { lat: "-1.2864", lon: "36.8172" },
  "casablanca": { lat: "33.5731", lon: "-7.5898" },
  
  // Ivory Coast / Côte d'Ivoire
  "abidjan": { lat: "5.3600", lon: "-4.0083" },
  "yamoussoukro": { lat: "6.8276", lon: "-5.2893" },
  "bouake": { lat: "7.6900", lon: "-5.0300" },
  
  // Additional International Cities
  "reykjavik": { lat: "64.1466", lon: "-21.9426" },
  "bucharest": { lat: "44.4268", lon: "26.1025" },
  "sofia": { lat: "42.6977", lon: "23.3219" },
  "belgrade": { lat: "44.7866", lon: "20.4489" },
  "kyiv": { lat: "50.4501", lon: "30.5234" },
  "hanoi": { lat: "21.0285", lon: "105.8542" },
  "ho chi minh": { lat: "10.8231", lon: "106.6297" },
  "yangon": { lat: "16.8661", lon: "96.1951" },
  "islamabad": { lat: "33.6844", lon: "73.0479" },
  "karachi": { lat: "24.8607", lon: "67.0011" },
  "lahore": { lat: "31.5497", lon: "74.3436" },
  "dhaka": { lat: "23.8103", lon: "90.4125" },
  "colombo": { lat: "6.9271", lon: "79.8612" },
  "kathmandu": { lat: "27.7172", lon: "85.3240" },
  
  // More West Africa
  "dakar": { lat: "14.6928", lon: "-17.4467" },
  "bamako": { lat: "12.6392", lon: "-8.0029" },
  "conakry": { lat: "9.6412", lon: "-13.5784" },
  "accra": { lat: "5.6037", lon: "-0.1870" },
  "ouagadougou": { lat: "12.3714", lon: "-1.5197" },
  "lome": { lat: "6.1256", lon: "1.2225" },
  "cotonou": { lat: "6.3703", lon: "2.3912" },
  
  // More East/Central Africa
  "kampala": { lat: "0.3476", lon: "32.5825" },
  "dar es salaam": { lat: "-6.7924", lon: "39.2083" },
  "kigali": { lat: "-1.9536", lon: "30.0606" },
  "kinshasa": { lat: "-4.4419", lon: "15.2663" },
  "luanda": { lat: "-8.8383", lon: "13.2344" },
  "addis ababa": { lat: "9.1450", lon: "40.4897" },
};

/**
 * Geocode a location string to latitude/longitude coordinates
 * Returns null if location cannot be geocoded
 */
export function geocodeLocation(location: string): GeocodeResult | null {
  if (!location || typeof location !== 'string') {
    return null;
  }

  // Normalize the input
  const normalized = location.toLowerCase().trim();
  
  // Try exact match first
  if (LOCATION_DATABASE[normalized]) {
    const coords = LOCATION_DATABASE[normalized];
    return {
      lat: coords.lat,
      lon: coords.lon,
      location: location.trim()
    };
  }

  // Try partial matches (e.g., "New York, NY" should match "new york")
  for (const [key, coords] of Object.entries(LOCATION_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return {
        lat: coords.lat,
        lon: coords.lon,
        location: location.trim()
      };
    }
  }

  // Location not found in database
  return null;
}

/**
 * Check if a location can be geocoded
 */
export function canGeocodeLocation(location: string): boolean {
  return geocodeLocation(location) !== null;
}
