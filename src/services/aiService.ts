import { languageOptions } from '../i18n/config';

// Key for storage
export const API_KEY_STORAGE_KEY = 'farm-in-one-gemini-key';

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface DiseaseDiagnosis {
  disease: string;
  severity: 'safe' | 'warning' | 'critical';
  preventiveMeasures: string;
}

// Deep local advice dictionary for dynamic fallback responder
interface AdviceDictionary {
  blast: string;
  borer: string;
  curl: string;
  rot: string;
  nutrient: string;
  soil: string;
  market: string;
  weather: string;
  finance: string;
  paddy: string;
  cotton: string;
  chilli: string;
  corn: string;
  wheat: string;
  tomato: string;
  default: string;
}

const ADVICE_DB: Record<string, AdviceDictionary> = {
  en: {
    blast: "Disease Suggestion: Fungal Blast / Blight. Measures: Spray Pseudomonas fluorescens (10g/L) or Tricyclazole 75 WP (0.6g/L). Reduce excessive Nitrogen/Urea application.",
    borer: "Pest Suggestion: Stem Borer / Fall Armyworm. Measures: Install pheromone traps (5/acre). Release Trichogramma cards. If severe, apply Cartap Hydrochloride 4G granules (8kg/acre).",
    curl: "Disease Suggestion: Leaf Curl Virus. Measures: Caused by sucking pests (whiteflies/thrips). Spray Neem oil (1500 ppm) or Imidacloprid (0.5ml/L). Remove infected weeds.",
    rot: "Disease Suggestion: Root Rot / Wilt. Measures: Ensure proper water drainage. Apply Trichoderma viride mixed with compost to the soil, or drench with Carbendazim (2g/L).",
    nutrient: "Deficiency Suggestion: Nutrient Deficit (Zinc/Nitrogen). Measures: Apply organic compost. Spray 0.5% Zinc Sulfate mixed with lime to correct yellowing.",
    soil: "Soil & Fertilizer: Perform soil test. Apply DAP at sowing, and split Urea doses at 21 and 42 days. Use organic manure to preserve soil moisture.",
    market: "Mandi & Prices: Today Mandi trends suggest selling Paddy (Rs 2310/q), Corn (Rs 1960/q) and Wheat (Rs 2275/q) due to positive demand. Hold Cotton (Rs 6840/q) and Tomato (Rs 1540/q).",
    weather: "Weather Advice: Avoid pesticide sprays when heavy rain is forecasted. Mulch fields to retain moisture if heat index is high.",
    finance: "Finance Advice: Always prefer state-sponsored Kisan Credit Card (KCC) benchmark crop loans at 4% interest. Do not borrow from high-rate private lenders.",
    paddy: "Paddy Crop Care: Keep water at 2-5 cm depth during transplanting. Watch for brown plant hoppers and blast spots. Apply Trichoderma viride.",
    cotton: "Cotton Crop Care: Maintain plant spacing. Keep soil moist but not waterlogged. Watch for pink bollworm and whitefly pests; apply neem extracts.",
    chilli: "Chilli Crop Care: Protect from sucking pests using yellow sticky traps. Irrigate in alternate furrows to prevent root rot wilt.",
    corn: "Corn (Maize) Crop Care: Plant in well-drained loamy soil. Keep weed-free during first 30 days. Watch for Fall Armyworm and downy mildew. Apply organic neem sprays or install traps.",
    wheat: "Wheat Crop Care: Ensure adequate soil moisture at crown root initiation (21 days). Watch for rust spots and loose smut. Treat seed with Trichoderma.",
    tomato: "Tomato Crop Care: Staking is essential to support plants. Watch for leaf curl virus and late blight fungal spots. Spray Pseudomonas fluorescens or copper fungicides.",
    default: "I understand you have a crop query. To give you the best advice, please specify your crop (Paddy, Cotton, Chilli, Corn, Wheat, Tomato) and symptoms (like leaf spots, leaf curl, insects, yellow leaves)."
  },
  hi: {
    blast: "रोग संकेत: ब्लास्ट / झुलसा (कवक रोग)। उपाय: स्यूडोमोनास फ्लोरेसेंस (10 ग्राम/लीटर) या ट्राईसाइक्लाजोल 75 डब्ल्यूपी (0.6 ग्राम/लीटर) का छिड़काव करें। अत्यधिक यूरिया डालने से बचें।",
    borer: "कीट संकेत: तना छेदक / फॉल्स आर्मीवॉर्म। उपाय: प्रति एकड़ 5 फेरोमोन ट्रैप लगाएं। ट्राइकोकार्ड का उपयोग करें। गंभीर प्रकोप में कार्टाप हाइड्रोक्लोराइड (8 किग्रा/एकड़) डालें।",
    curl: "रोग संकेत: पर्ण कुंचन वायरस (पत्ती मुड़ना)। उपाय: यह सफेद मक्खी या थ्रिप्स द्वारा फैलता है। 5% नीम बीज अर्क (NSKE) या इमिडाक्लोप्रिड (0.5 मिली/लीटर) का छिड़काव करें।",
    rot: "रोग संकेत: जड़ सड़न / उकठा। उपाय: खेत से जल निकासी सुनिश्चित करें। मिट्टी में ट्राइकोडर्मा विरिडी समृद्ध खाद डालें, या कार्बेन्डाजिम (2 ग्राम/लीटर) का छिड़काव जड़ों पर करें।",
    nutrient: "कमी संकेत: पोषक तत्वों की कमी (जिंक/नाइट्रोजन)। उपाय: गोबर की खाद डालें। पीलापन दूर करने के लिए चूने के साथ मिश्रित 0.5% जिंक सल्फेट का छिड़काव करें।",
    soil: "मिट्टी और उर्वरक: मिट्टी की जांच कराएं। बुवाई के समय डीएपी डालें, और यूरिया की खुराक को 21 और 42 दिनों पर बांटें। मिट्टी की नमी बनाए रखने के लिए कम्पोस्ट का प्रयोग करें।",
    market: "मंडी और दाम: आज मंडी रुझान बताते हैं कि धान (रु 2310), मक्का (रु 1960) और गेहूं (रु 2275) की मांग तेज है, बेचना सही है। कपास (रु 6840) और टमाटर (रु 1540) को रोक कर रखें।",
    weather: "मौसम सलाह: भारी बारिश का अनुमान होने पर कीटनाशकों का छिड़काव न करें। अत्यधिक गर्मी में वाष्पीकरण रोकने के लिए मल्चिंग का प्रयोग करें।",
    finance: "वित्त सलाह: हमेशा 4% ब्याज पर मिलने वाले सरकारी किसान क्रेडिट कार्ड (KCC) ऋण को प्राथमिकता दें। निजी साहूकारों के जाल से बचें।",
    paddy: "धान फसल देखभाल: रोपाई के समय खेत में 2-5 सेमी पानी रखें। भूरा फुदका कीट और ब्लास्ट रोग के लक्षणों पर नजर रखें। ट्राइकोडर्मा का प्रयोग करें।",
    cotton: "कपास फसल देखभाल: पौधों के बीच उचित दूरी रखें। जलभराव न होने दें। गुलाबी सुंडी और सफेद मक्खी की निगरानी करें, नीम अर्क का छिड़काव करें।",
    chilli: "मिर्च फसल देखभाल: पीले चिपचिपे जाल (sticky traps) लगाकर रस चूसक कीटों से बचाएं। जड़ सड़न रोकने के लिए वैकल्पिक कतार सिंचाई (alternate furrow) करें।",
    corn: "मक्का (Corn) फसल देखभाल: जल निकासी वाली दोमट मिट्टी में बोएं। पहले 30 दिनों में खरपतवार नियंत्रण रखें। कत्तर पुल्लू (आर्मीवॉर्म) से बचाएं, नीम तेल छिड़कें।",
    wheat: "गेहूं (Wheat) फसल देखभाल: ताज जड़ निकलने के समय (21 दिन) मिट्टी में नमी रखें। गेरूआ रोग और कांगियारी पर नजर रखें। बीज उपचार ट्राइकोडर्मा से करें।",
    tomato: "टमाटर (Tomato) फसल देखभाल: पौधों को सहारा (staking) देना जरूरी है। पर्णकुंचन (लीफ कर्ल) और झुलसा रोग की निगरानी करें, स्यूडोमोनास या कॉपर कवकनाशी छिड़कें।",
    default: "मुझे समझ में आया कि आपका खेती से जुड़ा प्रश्न है। सही समाधान के लिए कृपया अपनी फसल का नाम (धान, कपास, मिर्च, मक्का, गेहूं, टमाटर) और लक्षण (जैसे पत्ते मुड़ना, धब्बे, कीड़े, पीलापन) बताएं।"
  },
  te: {
    blast: "తెగులు సూచన: అగ్గి తెగులు / ఆకు తెగులు. నివారణ: సూడోమోనాస్ ఫ్లోరసెంట్స్ (10 గ్రా/లీ) లేదా ట్రైసైక్లాజోల్ 75 WP (0.6 గ్రా/లీ) పిచికారీ చేయండి. నత్రజని/యూరియా వాడకం తగ్గించండి.",
    borer: "పురుగు సూచన: కాండం తొలిచే పురుగు / కత్తెర పురుగు. నివారణ: ఎకరానికి 5 లింగమార్పిడి బుట్టలు పెట్టండి. తీవ్రంగా ఉంటే కార్టాప్ హైడ్రోక్లోరైడ్ 4G గుళికలు (ఎకరానికి 8 కిలోలు) చల్లండి.",
    curl: "తెగులు సూచన: ఆకు ముడత వైరస్ తెగులు. నివారణ: రసం పీల్చే పురుగుల ద్వారా వస్తుంది. వేప నూనె (1500 ppm) లేదా ఇమిడాక్లోప్రిడ్ (0.5 మి.లీ/లీ) పిచికారీ చేయండి. వైరస్ సోకిన మొక్కలను తొలగించండి.",
    rot: "తెగులు సూచన: వేరు కుళ్లు / వడలు తెగులు. నివారణ: పొలంలో నీరు నిల్వ ఉండకుండా చూసుకోండి. నేలలో ట్రైకోడెర్మా విరిడి కలిపిన పశువుల ఎరువు వేయండి లేదా మొదళ్ల వద్ద కార్బెండజిమ్ (2 గ్రా/లీ) పోయండి.",
    nutrient: "లోపం సూచన: జింక్/నత్రజని లోపం. నివారణ: పశువుల ఎరువు వేయండి. ఆకులు పసుపు రంగులోకి మారితే 0.5% జింక్ సల్ఫేట్ ద్రావణం పిచికారీ చేయండి.",
    soil: "నేల & ఎరువులు: నేల పరీక్ష చేయించండి. విత్తే సమయంలో DAP వేయండి, యూరియాను 21 మరియు 42 రోజులకు విభజించి వేయండి. నేల తేమను కాపాడటానికి పచ్చిరొట్ట ఎరువులు వాడండి.",
    market: "మార్కెట్ ధరలు: ఈరోజు వరి (రూ. 2310), మొక్కజొన్న (రూ. 1960) మరియు గోధుమ (రూ. 2275) మార్కెట్ ధరలు అనుకూలంగా ఉన్నాయి, అమ్మవచ్చు. పత్తి (రూ. 6840) మరియు టమోటా (రూ. 1540) నిల్వ చేసుకోండి.",
    weather: "వాతావరణ సలహా: భారీ వర్ష సూచన ఉంటే మందులు పిచికారీ చేయవద్దు. ఎండ ఎక్కువగా ఉంటే తేమ కోల్పోకుండా మల్చింగ్ చేయండి.",
    finance: "ఆర్థిక సలహా: ఎల్లప్పుడూ 4% వడ్డీతో లభించే ప్రభుత్వ కిసాన్ క్రెడిట్ కార్డ్ (KCC) పంట రుణాలనే తీసుకోండి. ప్రైవేట్ వడ్డీ వ్యాపారుల వద్ద అప్పులు చేయవద్దు.",
    paddy: "వరి పంట సంరక్షణ: నాట్లు వేసేటప్పుడు 2-5 సెం.మీ నీరు ఉంచండి. సుడి దోమ మరియు అగ్గి తెగులును గమనిస్తూ ఉండండి. ట్రైకోడెర్మా విరిడి ఉపయోగించండి.",
    cotton: "పత్తి పంట సంరక్షణ: మొక్కల మధ్య దూరం పాటించండి. పొలంలో నీరు నిలవకుండా చూసుకోండి. గులాబీ రంగు కాయతొలిచే పురుగు నివారణకు వేప కషాయం వాడండి.",
    chilli: "మిర్చి పంట సంరక్షణ: పసుపు జిగురు అట్టలను ఉపయోగించి రసం పీల్చే పురుగులను నివారించండి. వేరుకుళ్లు తెగులు రాకుండా ప్రత్యామ్నాయ సళ్ల పద్ధతిలో నీరు పెట్టండి.",
    corn: "మొక్కజొన్న (Corn) పంట సంరక్షణ: మంచి నీటి పారుదల ఉన్న నేలల్లో నాటండి. కత్తెర పురుగు నివారణకు వేప కషాయం స్ప్రే చేయండి లేదా లింగమార్పిడి బుట్టలు పెట్టండి.",
    wheat: "గోధుమ (Wheat) పంట సంరక్షణ: 21 రోజులకు మొదళ్ల వద్ద తగినంత తేమ ఉండేలా చూసుకోండి. తుప్పు తెగులు పట్ల జాగ్రత్తగా ఉండండి. విత్తన శుద్ధి చేయండి.",
    tomato: "టమోటా (Tomato) పంట సంరక్షణ: మొక్కలు నిటారుగా ఉండటానికి కర్రల మద్దతు (staking) ఇవ్వండి. ఆకుముడత మరియు లేట్ బ్లైట్ తెగుళ్లకు సూడోమోనాస్ పిచికారీ చేయండి.",
    default: "మీ పంట ప్రశ్నను నేను అర్థం చేసుకున్నాను. మరింత ఖచ్చితమైన సలహా కోసం దయచేసి పంట పేరు (వరి, పత్తి, మిర్చి, మొక్కజొన్న, గోధుమ, టమోటా) మరియు తెగులు లక్షణాలు (ఆకు ముడుచుకోవడం, మచ్చలు, పురుగులు, పసుపు ఆకులు) వివరించండి."
  },
  ta: {
    blast: "நோய் அறிகுறி: குலை நோய் / கருகல் நோய். தடுப்பு: சூடோமோனாஸ் (10 கிராம்/லிட்டர்) அல்லது ட்ரைசைக்ளசோல் 75 WP (0.6 கிராம்/லிட்டர்) தெளிக்கவும். அதிக யூரியா இடுவதைத் தவிர்க்கவும்.",
    borer: "பூச்சி அறிகுறி: தண்டு துளைப்பான் / குருத்து பூச்சி. தடுப்பு: ஏக்கருக்கு 5 இனக்கவர்ச்சி பொறிகளை வைக்கவும். கார்டாப் ஹைட்ரோகுளோரைடு 4G ஏக்கருக்கு 8 கிலோ இடவும்.",
    curl: "நோய் அறிகுறி: இலை சுருள் வைரஸ் நோய். தடுப்பு: சாறு உறிஞ்சும் பூச்சிகளால் பரவுகிறது. வேப்ப எண்ணெய் (1500 பிபிஎம்) அல்லது இமிடா குளோப்ரிட் (0.5 மிலி/லி) தெளிக்கவும்.",
    rot: "நோய் அறிகுறி: வேர் அழுகல் / வாடல் நோய். தடுப்பு: தண்ணீர் தேங்குவதைத் தவிர்க்கவும். தொழு உரத்துடன் டிரைக்கோடெர்மா விரிடி கலந்து மண்ணில் இடவும் அல்லது கார்பென்டாசிம் ஊற்றவும்.",
    nutrient: "குறைபாடு அறிகுறி: துத்தநாகம்/நைட்ரஜன் குறைபாடு. தடுப்பு: மட்கிய உரம் இடவும். இலைகள் மஞ்சள் நிறமாவதைத் தடுக்க 0.5% துத்தநாக சல்பேட் கரைசல் தெளிக்கவும்.",
    soil: "மண் & உர மேலாண்மை: மண் பரிசோதனை செய்யவும். birdseye DAP இடவும், யூரியாவை 21 மற்றும் 42 நாட்களில் பிரித்து இடவும். மண்ணின் ஈரப்பதம் காக்க மூடாக்கு பயன்படுத்தவும்.",
    market: "மண்டி விலைகள்: இன்று நெல் (ரூ. 2310), சோளம் (ரூ. 1960) மற்றும் கோதுமை (ரூ. 2275) மண்டி விலைகள் சாதகமாக உள்ளன, விற்கலாம். பருத்தி மற்றும் தக்காளியைச் சேமிக்கவும்.",
    weather: "வானிலை ஆலோசனை: கனமழை எச்சரிக்கை இருந்தால் மருந்து தெளிப்பதைத் தவிர்க்கவும். வெப்பத்தின் போது ஈரப்பதத்தைக் காக்க இலை தழைகளை மூடாக்காக்கவும்.",
    finance: "நிதி ஆலோசனை: எப்போதும் 4% வட்டி கொண்ட அரசு கிசான் கிரெடிட் கார்டு (KCC) கடன்களைப் பெறவும். கந்துவட்டிக் கடன்களைத் தவிர்க்கவும்.",
    paddy: "நெல் பயிர் மேலாண்மை: நாற்று நடும் போது 2-5 செ.மீ நீர் வைக்கவும். புகையான் பூச்சி மற்றும் குலை நோயைக் கண்காணித்து டிரைக்கோடெர்மா விரிடி இடவும்.",
    cotton: "பருத்தி பயிர் மேலாண்மை: செடிகளுக்கு இடையே போதிய இடைவெளி விடவும். இளஞ்சிவப்பு காய் புழு மற்றும் வெள்ளை ஈக்களைக் கண்காணிக்க வேப்ப எண்ணெய் தெளிக்கவும்.",
    chilli: "மிளகாய் பயிர் மேலாண்மை: மஞ்சள் ஒட்டும் பொறிகளைப் பயன்படுத்தி சாறு உறிஞ்சும் பூச்சிகளைக் கட்டுப்படுத்தவும். வேர் அழுகலைத் தடுக்க மாற்று வரிசை பாசனம் செய்யவும்.",
    corn: "சோளம் (Corn) பயிர் மேலாண்மை: வடிகால் வசதியுள்ள மண்ணில் பயிரிடவும். குருத்து பூச்சி தாக்குதலைத் தடுக்க வேப்ப எண்ணெய் தெளிக்கவும்.",
    wheat: "கோதுமை (Wheat) பயிர் மேலாண்மை: கிரீட வேர் உருவாகும் போது (21 நாட்கள்) ஈரப்பதம் அவசியம். துரு நோயைக் கவனித்து விதைகளை டிரைக்கோடெர்மா மூலம் சுத்திகரிக்கவும்.",
    tomato: "தக்காளி (Tomato) பயிர் மேலாண்மை: தக்காளிச் செடிகளுக்கு கொம்புகளின் முட்டு கொடுக்கவும். இலைச் சுருள் மற்றும் கருகல் நோய்களுக்கு காப்பர் பூஞ்சைக் கொல்லி இடவும்.",
    default: "விவசாயம் குறித்த உங்கள் கேள்வி எனக்குப் புரிந்தது. சரியான தீர்வைப் பெற உங்கள் பயிர் பெயர் (நெல், பருத்தி, மிளகாய், சோளம், கோதுமை, தக்காளி) மற்றும் அறிகுறிகளை (இலை சுருக்கம், புள்ளிகள், பூச்சிகள், மஞ்சள் இலை) குறிப்பிடவும்."
  },
  mr: {
    blast: "रोग संकेत: करपा / तांबेरा रोग. उपाय: स्यूडोमोनास फ्लोरेसेन्स (१० ग्रॅम/लिटर) किंवा ट्रायसायक्लाझोल ७५ डब्ल्यूपी (०.६ ग्रॅम/लिटर) फवारा. युरिया खताचा अतिवापर टाळा.",
    borer: "कीड संकेत: खोडकिडा / लष्करी अळी. उपाय: एकरी ५ कामगंध सापळे लावा. तीव्र प्रादुर्भाव असल्यास कार्टाप हायड्रोक्लोराईड ४ जी दाणेदार औषध (८ किलो/एकरी) जमिनीत टाका.",
    curl: "रोग संकेत: पर्णगुच्छ रोग (पाने वाकणे). उपाय: हा रोग पांढरी माशी किंवा थ्रिप्सद्वारे पसरतो. ५% निंबोळी अर्क (NSKE) किंवा इमिडाक्लोप्रिड (०.५ मिली/लिटर) फवारा.",
    rot: "रोग संकेत: मूळ कुजणे / मर रोग. उपाय: शेतात पाणी साचू देऊ नका. शेणखतात ट्रायकोडर्मा विरिडी मिसळून जमिनीत द्या किंवा मुळांपाशी कार्बेंडाझिम (२ ग्रॅम/लिटर) टाका.",
    nutrient: "कमतरता संकेत: जस्त/नायट्रोजन कमतरता. उपाय: कुजलेले शेणखत वापरा. पाने पिवळी पडल्यास ०.५% झिंक सल्फेट आणि चुन्याच्या द्रावणाची फवारणी करा.",
    soil: "माती आणि खत नियोजन: माती परीक्षण करा. पेरणीच्या वेळी डीएपी द्या, आणि युरियाचे डोस २१ आणि ४२ दिवसांनी विभागून द्या. मातीतील ओलावा टिकवण्यासाठी कंपोस्ट वापरा.",
    market: "मंडी आणि दर: आजचे मंडीचे कल धान (रु २३१०), मका (रु १९६०) आणि गहू (रु २२७५) विक्रीसाठी योग्य दर्शवतात. कापूस आणि टोमॅटो दरवाढीसाठी राखून ठेवा.",
    weather: "हवामान सल्ला: मुसळधार पावसाचा अंदाज असल्यास फवारणी करू नका. उष्णतेच्या काळात मातीतील ओलावा टिकवण्यासाठी आच्छादन (मल्चिंग) करा.",
    finance: "आर्थिक सल्ला: नेहमी ४% व्याजदर असणाऱ्या अधिकृत सरकारी किसान क्रेडिट कार्ड (KCC) कर्जाला प्राधान्य द्या. खाजगी सावकारांकडून कर्ज घेणे टाळा.",
    paddy: "भात पीक काळजी: पुनर्लागवडीच्या वेळी शेतात २-५ सेमी पाणी ठेवा. तुडतुडे आणि करपा रोगाच्या लक्षणांवर लक्ष ठेवा. ट्रायकोडर्मा विरिडी वापरा.",
    cotton: "कापूस पीक काळजी: पिकात योग्य अंतर ठेवा. पाणी साचू देऊ नका. बोंडअळी आणि पांढऱ्या माशीवर नियंत्रण ठेवण्यासाठी निंबोळी अर्काचा वापर करा.",
    chilli: "मिरची पीक काळजी: पिवळे चिकट सापळे लावून रसशोषक कीटकांचे नियंत्रण करा. मूळ कुजणे रोखण्यासाठी वाफसा पद्धतीचा वापर करा.",
    corn: "मका (Corn) पीक काळजी: चांगला निचरा होणाऱ्या जमिनीत पेरणी करा. लष्करी अळीच्या नियंत्रणासाठी निंबोळी अर्काची फवारणी करा.",
    wheat: "गहू (Wheat) पीक काळजी: तांबेरा रोगापासून पिकाचे संरक्षण करा. पेरणीनंतर २१ दिवसांनी जमिनीत पुरेशी ओल असल्याची खात्री करा.",
    tomato: "टोमॅटो (Tomato) पीक काळजी: वेलींना आधार देण्याची गरज असते. पर्णगुच्छ आणि करपा रोगाच्या नियंत्रणासाठी ट्रायकोडर्मा किंवा कॉपर बुरशीनाशक वापरा.",
    default: "मला समजले की आपली शेतीशी संबंधित समस्या आहे. अचूक माहितीसाठी कृपया पिकाचे नाव (भात, कापूस, मिरची, मका, गहू, टोमॅटो) आणि लक्षणे (जसे पानांवर डाग, पाने आकसणे, पिवळी पाने, कीड) नमूद करा."
  }
};

// Check if string contains farming/agriculture topics
export function isFarmingRelated(query: string): boolean {
  const lowercaseQuery = query.toLowerCase();
  const farmingKeywords = [
    'farm', 'crop', 'pest', 'disease', 'weather', 'rain', 'water', 'soil', 'irrigation', 'fertilizer', 'urea', 'dap',
    'mop', 'potash', 'manure', 'paddy', 'rice', 'cotton', 'chilli', 'seed', 'mandi', 'price', 'rate', 'cost', 'rent',
    'tractor', 'sprayer', 'cooperative', 'loan', 'kcc', 'finance', 'insect', 'fungus', 'leaf', 'root', 'stem', 'harvest',
    'wilt', 'rot', 'yellow', 'dry', 'curl', 'spot', 'bug', 'worm', 'spray', 'blight', 'mildew', 'agriculture',
    'corn', 'maize', 'wheat', 'tomato', 'armyworm', 'rust', 'smut',
    'खेती', 'फसल', 'कीट', 'रोग', 'मौसम', 'बारिश', 'पानी', 'मिट्टी', 'सिंचाई', 'खाद', 'यूरिया', 'धान', 'कपास', 'मिर्च', 'बीज', 'मंडी', 'ऋण', 'ट्रैक्टर',
    'पत्ता', 'पत्ती', 'पीला', 'धब्बा', 'कीड़ा', 'सूख', 'उकठा', 'मक्का', 'मक्के', 'गेहूं', 'टमाटर',
    'పంట', 'పురుగు', 'తెగులు', 'వాతావరణం', 'వర్షం', 'నీరు', 'నేల', 'నీటి పారుదల', 'ఎరువులు', 'వరి', 'పత్తి', 'మిర్చి', 'విత్తనాలు', 'రుణాలు',
    'ఆకు', 'మచ్చ', 'ముడత', 'పసుపు', 'మొక్కజొన్న', 'గోధుమ', 'టమోటా',
    'பயிர்', 'பூச்சி', 'நோய்', 'வானிலை', 'மழை', 'நீர்', 'மண்', 'பாசனம்', 'உரம்', 'நெல்', 'பருத்தி', 'மிளகாய்', 'விதை', 'கடன்',
    'இலை', 'புள்ளி', 'சுருள்', 'மஞ்சள்', 'அழுகல்', 'சோளம்', 'கோதுமை', 'தக்காளி',
    'पीक', 'कीड', 'रोग', 'हवामान', 'पाऊस', 'पाणी', 'माती', 'सिंचन', 'खत', 'धान', 'भातावरील', 'कापूस', 'मिरची', 'बियाणे', 'कर्ज',
    'पान', 'पिवळे', 'डाग', 'वाकणे', 'खोडकिडा', 'मका', 'गहू', 'टोमॅटो'
  ];
  return farmingKeywords.some((word) => lowercaseQuery.includes(word));
}

// Get Local Gemini API Key
export function getGeminiApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

// Save Gemini API Key
export function saveGeminiApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
}

// Call text generate API
export async function askGeminiAgent(prompt: string, activeLang: string): Promise<string> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return simulateLocalChat(prompt, activeLang);
  }

  // Double check if question is farming related
  if (!isFarmingRelated(prompt)) {
    return simulateLocalChat('unrelated_fallback_trigger', activeLang);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Farm-in-One AI Assistant, a hyper-localized farming bot. You must ONLY answer questions related to agriculture, farming, crops, soil, water, weather, loans/KCC rates, and mandi market prices. Reject all other queries (e.g. general knowledge, sports, entertainment) politely in the requested language. Keep your explanation plain-language, extremely simple, concise, and helpful for a smallholder farmer. You MUST reply ONLY in the active language: ${activeLang} (choose from en, hi, te, ta, mr). Direct translation first! Never output markdown code blocks. Here is the question: ${prompt}`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) throw new Error('API Request failed');
    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return simulateLocalChat(prompt, activeLang);
    return reply;
  } catch {
    return simulateLocalChat(prompt, activeLang);
  }
}

// Multimodal disease diagnostic API
export async function diagnoseCropDisease(
  imageFile: File,
  description: string,
  activeLang: string,
  profileCrop: string
): Promise<DiseaseDiagnosis> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return simulateLocalDiagnosis(description, activeLang, profileCrop);
  }

  try {
    const base64Data = await fileToBase64(imageFile);
    const mimeType = imageFile.type;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this crop leaf image with symptoms described as: "${description}". Target crop: ${profileCrop}. Identify the disease, severity (must be exactly 'safe', 'warning', or 'critical'), and detailed organic and chemical preventive measures. Return a structured JSON response in the language "${activeLang}" (choose from en, hi, te, ta, mr). The JSON must EXACTLY match this structure without markdown wraps:
{
  "disease": "Disease Name",
  "severity": "safe" | "warning" | "critical",
  "preventiveMeasures": "Detailed preventive actions in active language..."
}`
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) throw new Error('API Request failed');
    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) throw new Error('Empty response');

    // Parse JSON safely
    const cleanText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText) as DiseaseDiagnosis;
    return parsed;
  } catch {
    return simulateLocalDiagnosis(description, activeLang, profileCrop);
  }
}

// Convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Local chatbot heuristic simulator
function simulateLocalChat(prompt: string, activeLang: string): string {
  const lang = ADVICE_DB[activeLang] ? activeLang : 'en';
  const db = ADVICE_DB[lang];

  if (prompt === 'unrelated_fallback_trigger') {
    return db.default;
  }

  const lowercase = prompt.toLowerCase();

  // 1. Crop + Pest/Disease Specific Queries
  const isPaddy = lowercase.includes('paddy') || lowercase.includes('rice') || lowercase.includes('धान') || lowercase.includes('వరి') || lowercase.includes('நெல்') || lowercase.includes('भात');
  const isCotton = lowercase.includes('cotton') || lowercase.includes('कपास') || lowercase.includes('పత్తి') || lowercase.includes('பருத்தி') || lowercase.includes('कापूस');
  const isChilli = lowercase.includes('chilli') || lowercase.includes('chili') || lowercase.includes('मिर्च') || lowercase.includes('మిర్చి') || lowercase.includes('மிளகாய்') || lowercase.includes('मिरची');
  const isCorn = lowercase.includes('corn') || lowercase.includes('maize') || lowercase.includes('मक्का') || lowercase.includes('మొక్కజొన్న') || lowercase.includes('சோளம்') || lowercase.includes('मका');
  const isWheat = lowercase.includes('wheat') || lowercase.includes('गेहूं') || lowercase.includes('గోధుమ') || lowercase.includes('கோதுமை') || lowercase.includes('गहू');
  const isTomato = lowercase.includes('tomato') || lowercase.includes('टमाटर') || lowercase.includes('టమోటా') || lowercase.includes('தக்காளி') || lowercase.includes('टोमॅटो');

  const hasBlast = lowercase.includes('blast') || lowercase.includes('spot') || lowercase.includes('धब्बा') || lowercase.includes('మచ్చ') || lowercase.includes('புள்ளி') || lowercase.includes('ठिपके') || lowercase.includes('mildew') || lowercase.includes('blight');
  const hasBorer = lowercase.includes('borer') || lowercase.includes('hole') || lowercase.includes('छेदक') || lowercase.includes('తొలిచే') || lowercase.includes('துளை') || lowercase.includes('किडा') || lowercase.includes('armyworm') || lowercase.includes('कीड़ा');
  const hasCurl = lowercase.includes('curl') || lowercase.includes('wilt') || lowercase.includes('मुड़ना') || lowercase.includes('ముడత') || lowercase.includes('சுருள்') || lowercase.includes('वाकणे');
  const hasRot = lowercase.includes('rot') || lowercase.includes('सड़न') || lowercase.includes('కుళ్లు') || lowercase.includes('அழுகல்') || lowercase.includes('कुजणे');
  const hasYellow = lowercase.includes('yellow') || lowercase.includes('पीला') || lowercase.includes('పసుపు') || lowercase.includes('மஞ்சள்') || lowercase.includes('पिवळे');

  if (isPaddy) {
    if (hasBlast) return db.blast;
    if (hasBorer) return db.borer;
    if (hasYellow) return db.nutrient;
    return db.paddy;
  }

  if (isCotton) {
    if (hasCurl) return db.curl;
    if (hasBlast) return db.blast;
    return db.cotton;
  }

  if (isChilli) {
    if (hasCurl) return db.curl;
    if (hasRot) return db.rot;
    return db.chilli;
  }

  if (isCorn) {
    if (hasBlast) return db.blast; // downy mildew
    if (hasBorer) return db.borer; // armyworm
    return db.corn;
  }

  if (isWheat) {
    if (hasBlast) return db.blast; // rust spots
    return db.wheat;
  }

  if (isTomato) {
    if (hasCurl) return db.curl;
    if (hasBlast) return db.blast; // late blight
    return db.tomato;
  }

  // 2. Generic Disease & Pest matching
  if (hasBlast) return db.blast;
  if (hasBorer) return db.borer;
  if (hasCurl) return db.curl;
  if (hasRot) return db.rot;
  if (hasYellow) return db.nutrient;

  // 3. Category queries
  if (lowercase.includes('weather') || lowercase.includes('rain') || lowercase.includes('बारिश') || lowercase.includes('వర్షం') || lowercase.includes('மழை') || lowercase.includes('पाऊस')) {
    return db.weather;
  }
  if (lowercase.includes('water') || lowercase.includes('irrigate') || lowercase.includes('నీరు') || lowercase.includes('நீர்') || lowercase.includes('पाणी')) {
    return db.weather; // falls back to irrigation guidelines
  }
  if (lowercase.includes('soil') || lowercase.includes('fertilizer') || lowercase.includes('urea') || lowercase.includes('dap') || lowercase.includes('खाद') || lowercase.includes('ఎరువు') || lowercase.includes('खत') || lowercase.includes('உரம்')) {
    return db.soil;
  }
  if (lowercase.includes('money') || lowercase.includes('loan') || lowercase.includes('kcc') || lowercase.includes('వ्याज') || lowercase.includes('భీమా') || lowercase.includes('கடன்') || lowercase.includes('कर्ज')) {
    return db.finance;
  }
  if (lowercase.includes('market') || lowercase.includes('price') || lowercase.includes('mandi') || lowercase.includes('मंडी') || lowercase.includes('ధర') || lowercase.includes('விற்பனை') || lowercase.includes('भाव')) {
    return db.market;
  }

  return db.default;
}

// Local disease diagnostics simulator
function simulateLocalDiagnosis(description: string, activeLang: string, profileCrop: string): DiseaseDiagnosis {
  const lang = LOCAL_DISEASES[activeLang] ? activeLang : 'en';
  const db = LOCAL_DISEASES[lang];
  const lowercaseDesc = description.toLowerCase();

  let matchedKey = 'nutrient'; // default deficiency

  if (lowercaseDesc.includes('blast') || lowercaseDesc.includes('spots') || lowercaseDesc.includes('धब्बा') || lowercaseDesc.includes('మచ్చలు') || lowercaseDesc.includes('புள்ளி') || lowercaseDesc.includes('blight') || lowercaseDesc.includes('mildew')) {
    matchedKey = 'spot';
  }
  if (lowercaseDesc.includes('curl') || lowercaseDesc.includes('wilt') || lowercaseDesc.includes('मुड़ना') || lowercaseDesc.includes('ముడత') || lowercaseDesc.includes('சுருள்') || lowercaseDesc.includes('वाकणे')) {
    matchedKey = 'curl';
  }
  if (lowercaseDesc.includes('borer') || lowercaseDesc.includes('hole') || lowercaseDesc.includes('च्छेदक') || lowercaseDesc.includes('రంధ్రం') || lowercaseDesc.includes('துளை') || lowercaseDesc.includes('छिद्र') || lowercaseDesc.includes('armyworm')) {
    matchedKey = 'borer';
  }
  if (lowercaseDesc.includes('rot') || lowercaseDesc.includes('die') || lowercaseDesc.includes('सड़न') || lowercaseDesc.includes('కుళ్లు') || lowercaseDesc.includes('அழுகல்') || lowercaseDesc.includes('कुजणे')) {
    matchedKey = 'rot';
  }

  const result = db[matchedKey];
  return {
    disease: `${profileCrop} ${result.name}`,
    severity: result.severity,
    preventiveMeasures: result.preventiveMeasures
  };
}

const LOCAL_DISEASES: Record<string, Record<string, Omit<DiseaseDiagnosis, 'disease'> & { name: string }>> = {
  en: {
    blast: { name: "Blast / Blight", severity: "critical", preventiveMeasures: "Organic: Spray Pseudomonas fluorescens at 10g/L.\nChemical: Apply Tricyclazole 75 WP at 0.6g/L. Reduce Nitrogen/Urea." },
    spot: { name: "Leaf Spot / Downy Mildew", severity: "warning", preventiveMeasures: "Organic: Spray fresh cow dung extract or neem extracts.\nChemical: Copper Oxychloride 50 WP at 3g/L mixed with Streptocycline." },
    borer: { name: "Stem Borer / Armyworm Damage", severity: "critical", preventiveMeasures: "Organic: Install pheromone traps at 5 per acre.\nChemical: Apply Cartap Hydrochloride 4G granules at 8kg/acre." },
    curl: { name: "Leaf Curl Virus", severity: "warning", preventiveMeasures: "Organic: Spray 5% neem seed kernel extract (NSKE).\nChemical: Control whiteflies using Imidacloprid 17.8 SL at 0.5ml/L." },
    rot: { name: "Root Rot Wilt", severity: "critical", preventiveMeasures: "Organic: Apply Trichoderma viride enriched farmyard manure.\nChemical: Drench soil with Carbendazim 50 WP at 2g/L." },
    nutrient: { name: "Zinc/Nitrogen Deficiency", severity: "safe", preventiveMeasures: "Organic: Apply well-decomposed manure.\nChemical: Spray 0.5% Zinc Sulfate mixed with lime." }
  },
  hi: {
    blast: { name: "ब्लास्ट / झुलसा रोग", severity: "critical", preventiveMeasures: "जैविक: स्यूडोमोनास फ्लोरेसेंस 10 ग्राम/लीटर छिड़कें।\nरासायनिक: ट्राईसाइक्लाजोल 75 डब्ल्यूपी 0.6 ग्राम/लीटर डालें।" },
    spot: { name: "पत्ती का धब्बा / डाउनी मिल्ड्यू", severity: "warning", preventiveMeasures: "जैविक: गोबर खाद अर्क या नीम के अर्क का छिड़काव करें।\nरासायनिक: कॉपर ऑक्सीक्लोराइड 3 ग्राम/लीटर के साथ स्ट्रेप्टोसाइक्लिन छिड़कें।" },
    borer: { name: "तना छेदक / सुंडी प्रकोप", severity: "critical", preventiveMeasures: "जैविक: 5 फेरोमोन जाल प्रति एकड़ लगाएं।\nरासायनिक: कार्टाप हाइड्रोक्लोराइड 4जी दानेदार 8 किलोग्राम/एकड़ डालें।" },
    curl: { name: "पर्ण कुंचन वायरस", severity: "warning", preventiveMeasures: "जैविक: 5% नीम बीज अर्क (NSKE) छिड़कें।\nरासायनिक: इमिडाक्लोप्रिड 17.8 एसएल 0.5 मिली/लीटर का छिड़काव करें।" },
    rot: { name: "जड़ सड़न उकठा", severity: "critical", preventiveMeasures: "जैविक: ट्राइकोडर्मा विरिडी युक्त जैविक खाद डालें।\nरासायनिक: कार्बेन्डाजिम 50 डब्ल्यूपी 2 ग्राम/लीटर का जड़ों पर छिड़काव करें।" },
    nutrient: { name: "जिंक/नाइट्रोजन की कमी", severity: "safe", preventiveMeasures: "जैविक: सड़ी हुई गोबर खाद डालें।\nरासायनिक: चूने के साथ 0.5% जिंक सल्फेट मिलाकर छिड़कें।" }
  },
  te: {
    blast: { name: "అగ్గి తెగులు / ఆకు కారుడు తెగులు", severity: "critical", preventiveMeasures: "సేంద్రీయ: సూడోమోనాస్ ఫ్లోరసెంట్స్ 10 గ్రా/లీ పిచికారీ చేయండి.\nరసాయన: ట్రైసైక్లాజోల్ 75 WP 0.6 గ్రా/లీ పిచికారీ చేయండి." },
    spot: { name: "ఆకుమచ్చ / బూజు తెగులు", severity: "warning", preventiveMeasures: "సేంద్రీయ: పశువుల పేడ సారం పిచికారీ చేయండి.\nరసాయన: కాపర్ ఆక్సిక్లోరైడ్ 3 గ్రా + స్ట్రెప్టోసైక్లిన్ కలిపి చల్లండి." },
    borer: { name: "కాండం తొలిచే / కత్తెర పురుగు", severity: "critical", preventiveMeasures: "సేంద్రీయ: ఎకరానికి 5 లింగమార్పిడి బుట్టలను పెట్టండి.\nరసాయన: కార్టాప్ హైడ్రోక్లోరైడ్ 4G గుళికలు 8 కిలోలు చల్లండి." },
    curl: { name: "ఆకు ముడత వైరస్", severity: "warning", preventiveMeasures: "సేంద్రీయ: 5% వేప గింజల కషాయం పిచికారీ చేయండి.\nరసాయన: ఇమిడాక్లోప్రిడ్ 17.8 SL లీటరుకు 0.5 మి.లీ కలిపి స్ప్రే చేయండి." },
    rot: { name: "వేరు కుళ్లు తెగులు", severity: "critical", preventiveMeasures: "సేంద్రీయ: పశువుల ఎరువుతో కలిపిన ట్రైకోడెర్మా విరిడి వేయండి.\nరసాయన: కార్బెండజిమ్ 2 గ్రా లీటరు నీటికి కలిపి మొదళ్ల వద్ద పోయండి." },
    nutrient: { name: "జింక్/నత్రజని లోపం", severity: "safe", preventiveMeasures: "సేంద్రీయ: కుళ్లిన పశువుల ఎరువు వేయండి.\nరసాయన: 0.5% జింక్ సల్ఫేట్ ద్రావణం పిచికారీ చేయండి." }
  },
  ta: {
    blast: { name: "குலை / கருகல் நோய்", severity: "critical", preventiveMeasures: "இயற்கை: சூடோமோனாஸ் 10 கிராம்/லிட்டர் தெளிக்கவும்.\nஇரஸாயனம்: ட்ரைசைக்ளசோல் 75 WP 0.6 கிராம்/லிட்டர் தெளிக்கவும்." },
    spot: { name: "இலைப்புள்ளி / சோள இலை கருகல்", severity: "warning", preventiveMeasures: "இயற்கை: பசு மாட்டு சாண கரைசல் தெளிக்கவும்.\nஇரஸாயனம்: காப்பர் ஆக்ஸிகுளோரைடு 3 கிராம் + ஸ்டிரெப்டோசைக்ளின் 1 கிராம் தெளிக்கவும்." },
    borer: { name: "தண்டு துளைப்பான் / குருத்து பூச்சி", severity: "critical", preventiveMeasures: "இயற்கை: ஏக்கருக்கு 5 இனக்கவர்ச்சி பொறிகளை வைக்கவும்.\nஇரஸாயனம்: கார்டாப் ஹைட்ரோகுளோரைடு 4G ஏக்கருக்கு 8 கிலோ இடவும்." },
    curl: { name: "இலை சுருள் நோய்", severity: "warning", preventiveMeasures: "இயற்கை: 5% வேப்பங்கொட்டை கரைசல் தெளிக்கவும்.\nஇரஸாயனம்: இமிடா குளோப்रीட் 17.8 SL மருந்தை லிட்டருக்கு 0.5 மிலி தெளிக்கவும்." },
    rot: { name: "வேர் அழுகல் நோய்", severity: "critical", preventiveMeasures: "இயற்கை: டிரைக்கோடெர்மா விரிடி மண்ணில் இடவும்.\nஇரஸாயனம்: கார்பென்டாசிம் 2 கிராம்/லிட்டர் வேர்ப்பகுதியில் ஊற்றவும்." },
    nutrient: { name: "துத்தநாக/நைட்ரஜன் குறைபாடு", severity: "safe", preventiveMeasures: "இயற்கை: தொழு உரம் இடவும்.\nஇரஸாயனம்: 0.5% துத்தநாக சல்பேட் கரைசல் தெளிக்கவும்." }
  },
  mr: {
    blast: { name: "करपा / तांबेरा रोग", severity: "critical", preventiveMeasures: "सेंद्रिय: स्यूडोमोनास फ्लोरेसेन्स १० ग्रॅम/लिटर फवारणी करा.\nरासायनिक: ट्रायसायक्लाझोल ७५ डब्ल्यूपी ०.६ ग्रॅम/लिटर वापरा." },
    spot: { name: "पानावरील ठिपके / डाऊनी मिल्ड्यू", severity: "warning", preventiveMeasures: "सेंद्रिय: शेणखताचा अर्क फवारा.\nरासायनिक: कॉपर ऑक्सीक्लोराईड ३ ग्रॅम + स्ट्रेप्टोसायक्लीन १ ग्रॅम फवारा." },
    borer: { name: "खोडकिडा / लष्करी अळी", severity: "critical", preventiveMeasures: "सेंद्रिय: एकरी ५ कामगंध सापळे लावा.\nरासायनिक: कार्टाप हायड्रोक्लोराईड ४ जी औषध एकरी ८ किलो जमिनीत टाका." },
    curl: { name: "पाने वाकणे (व्हायरस)", severity: "warning", preventiveMeasures: "सेंद्रिय: ५% निंबोळी अर्क फवारा.\nरासायनिक: इमिडाक्लोप्रिड ०.५ मिली/लिटर पाण्यात मिसळून फवारा." },
    rot: { name: "मूळ कुजणे / मर रोग", severity: "critical", preventiveMeasures: "सेंद्रिय: शेणखतासोबत ट्रायकोडर्मा विरिडी जमिनीत द्या.\nरासायनिक: कार्बेंडाझिम २ ग्रॅम प्रति लिटर पाण्यात मिसळून मुळाशी टाका." },
    nutrient: { name: "जस्त/नायट्रोजन कमतरता", severity: "safe", preventiveMeasures: "सेंद्रिय: शेणखत वापरा.\nरासायनिक: ०.५% झिंक सल्फेट द्रावणाची फवारणी करा." }
  }
};
