export interface PesticideShop {
  name: string;
  distance: string;
  rating: number;
  phone: string;
  address: string;
  mapsUrl: string;
  status: 'open' | 'closed';
}

const LOCAL_SHOPS_BY_LANG: Record<string, Array<{ name: string; address: string; openText: string; closedText: string }>> = {
  en: [
    { name: "Krishi Kendra Agricultural Seeds & Pesticides", address: "Main Bazaar Road, Near Cluster bus stop", openText: "Open Now", closedText: "Closed" },
    { name: "Balaji Agro Chemicals & Fertilisers", address: "Station Road, opposite Co-operative bank", openText: "Open Now", closedText: "Closed" },
    { name: "FPO Organic Inputs Depot", address: "APMC Mandi Compound, block B", openText: "Open Now", closedText: "Closed" },
    { name: "Green Crop Solutions Ltd.", address: "National Highway 44, near Toll booth", openText: "Open Now", closedText: "Closed" }
  ],
  hi: [
    { name: "कृषि केंद्र कृषि बीज और कीटनाशक", address: "मुख्य बाजार रोड, क्लस्टर बस स्टॉप के पास", openText: "अभी खुला है", closedText: "बंद" },
    { name: "बालाजी एग्रो केमिकल्स और उर्वरक", address: "स्टेशन रोड, सहकारी बैंक के सामने", openText: "अभी खुला है", closedText: "बंद" },
    { name: "एफपीओ जैविक इनपुट डिपो", address: "एपीएमसी मंडी परिसर, ब्लॉक बी", openText: "अभी खुला है", closedText: "बंद" },
    { name: "ग्रीन क्रॉप सॉल्यूशंस लिमिटेड", address: "राष्ट्रीय राजमार्ग 44, टोल बूथ के पास", openText: "अभी खुला है", closedText: "बंद" }
  ],
  te: [
    { name: "కృషి కేంద్ర వ్యవసాయ విత్తనాలు & పురుగుల మందులు", address: "మెయిన్ బజార్ రోడ్డు, బస్ స్టాప్ దగ్గర", openText: "ఇప్పుడు తెరిచి ఉంది", closedText: "మూసివేసి ఉంది" },
    { name: "బాలాజీ ఆగ్రో కెమికల్స్ & ఎరువులు", address: "స్టేషన్ రోడ్డు, కోఆపరేటివ్ బ్యాంక్ ఎదురుగా", openText: "ఇప్పుడు తెరిచి ఉంది", closedText: "మూసివేసి ఉంది" },
    { name: "FPO సేంద్రీయ ఎరువుల డిపో", address: "APMC మార్కెట్ యార్డ్ కాంపౌండ్, బ్లాక్ B", openText: "ఇప్పుడు తెరిచి ఉంది", closedText: "మూసివేసి ఉంది" },
    { name: "గ్రీన్ క్రాప్ సొల్యూషన్స్ లిమిటెడ్", address: "జాతీయ రహదారి 44, టోల్ ప్లాజా దగ్గర", openText: "ఇప్పుడు తెరిచి ఉంది", closedText: "మూసివేసి ఉంది" }
  ],
  ta: [
    { name: "கிருஷி கேந்திரா வேளாண் விதைகள் & பூச்சிக்கொல்லிகள்", address: "முக்கிய கடைவீதி, பேருந்து நிலையம் அருகில்", openText: "திறந்துள்ளது", closedText: "மூடப்பட்டுள்ளது" },
    { name: "பாலாஜி அக்ரோ கெமிக்கல்ஸ் & உரங்கள்", address: "ஸ்டேஷன் ரோடு, கூட்டுறவு வங்கி எதிரில்", openText: "திறந்துள்ளது", closedText: "மூடப்பட்டுள்ளது" },
    { name: "FPO இயற்கை உள்ளீட்டு கிடங்கு", address: "APMC மண்டி வளாகம், தொகுதி B", openText: "திறந்துள்ளது", closedText: "மூடப்பட்டுள்ளது" },
    { name: "கிரீன் கிராப் சொல்யூஷன்ஸ் லிமிடெட்", address: "தேசிய நெடுஞ்சாலை 44, சுங்கச்சாவடி அருகில்", openText: "திறந்துள்ளது", closedText: "மூடப்பட்டுள்ளது" }
  ],
  mr: [
    { name: "कृषि केंद्र कृषी बियाणे आणि कीटकनाशके", address: "मुख्य बाजार रस्ता, बस स्टॉप जवळ", openText: "सध्या सुरू आहे", closedText: "बंद" },
    { name: "बालाजी ऍग्रो केमिकल्स आणि खते", address: "स्टेशन रोड, सहकारी बँकेच्या समोर", openText: "सध्या सुरू आहे", closedText: "बंद" },
    { name: "FPO सेंद्रिय खत आगार", address: "APMC मार्केट यार्ड, ब्लॉक बी", openText: "सध्या सुरू आहे", closedText: "बंद" },
    { name: "ग्रीन क्रॉप सोल्यूशन्स लिमिटेड", address: "राष्ट्रीय महामार्ग ४४, टोल प्लाझा जवळ", openText: "सध्या सुरू आहे", closedText: "बंद" }
  ]
};

export async function fetchNearbyPesticideShops(
  village: string,
  lang: string,
  latitude?: number,
  longitude?: number
): Promise<PesticideShop[]> {
  const activeLang = LOCAL_SHOPS_BY_LANG[lang] ? lang : 'en';
  const shopsTemplate = LOCAL_SHOPS_BY_LANG[activeLang];

  // Build location query — prefer precise GPS, fall back to village name
  let locationQuery = village || 'local';
  if (latitude !== undefined && longitude !== undefined) {
    locationQuery = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  } else {
    // Try to get live coords if not saved yet
    try {
      const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          (err) => reject(err),
          { timeout: 4000, enableHighAccuracy: true }
        );
      });
      locationQuery = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`;
    } catch {
      // Fail silently, fallback to village name
    }
  }

  // Create precise Google Maps search Link
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=pesticide+fertilizer+agro+shops+near+${encodeURIComponent(locationQuery)}`;

  // Populate mock shop details with customized coordinates and maps links
  return [
    {
      name: shopsTemplate[0].name,
      distance: "1.2 km",
      rating: 4.6,
      phone: "+91 98450 12345",
      address: shopsTemplate[0].address,
      mapsUrl: searchUrl,
      status: "open"
    },
    {
      name: shopsTemplate[1].name,
      distance: "2.4 km",
      rating: 4.3,
      phone: "+91 98450 67890",
      address: shopsTemplate[1].address,
      mapsUrl: searchUrl,
      status: "open"
    },
    {
      name: shopsTemplate[2].name,
      distance: "3.8 km",
      rating: 4.8,
      phone: "+91 99000 54321",
      address: shopsTemplate[2].address,
      mapsUrl: searchUrl,
      status: "open"
    },
    {
      name: shopsTemplate[3].name,
      distance: "6.5 km",
      rating: 4.1,
      phone: "+91 97890 12340",
      address: shopsTemplate[3].address,
      mapsUrl: searchUrl,
      status: "closed"
    }
  ];
}
