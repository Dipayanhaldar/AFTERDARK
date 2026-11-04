export const GOOGLE_MAPS_DEMO_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) ||
  'AIzaSyCuRh0QODBCDYGB-tGOScvs3C8TEfy3Fuw';

export const PUBLIC_SHARED_APP_URL =
  'https://ais-pre-uuczndxexn3f2ryx5z3t2o-857545814266.asia-southeast1.run.app';

export const indianQrThemes = [
  {
    id: 'charminar',
    name: '🌙 Charminar Emerald & Gold',
    flavor: 'Nizam Emerald, Shahi Gold & Moonlight',
    badge: '☾ PRIVATE COUPLE PASS',
    dark: '#0c3b2e',
    light: '#fdf6e4',
    accent: '#f5d076',
    bgStart: '#0b2e26',
    bgEnd: '#184e3f',
    emblem: 'chaand',
    defaultLabel: 'Scan karke seedha humare chat mein aao ♥'
  },
  {
    id: 'bollywood',
    name: '🎬 Crimson Filmy Velvet',
    flavor: 'Deep Velvet Rose, Crimson & Warm Gold',
    badge: '♥ PRIVATE COUPLE PASS',
    dark: '#540b20',
    light: '#ffedf1',
    accent: '#ff9ebb',
    bgStart: '#3d0716',
    bgEnd: '#7d1230',
    emblem: 'dil',
    defaultLabel: 'Palat... teri Jaan bulati hai ❤️'
  },
  {
    id: 'jaipur',
    name: '👑 Gulabi Rani Pink',
    flavor: 'Royal Rani Pink, Rose Sparkle & Ivory',
    badge: '♥ PRIVATE COUPLE PASS',
    dark: '#571037',
    light: '#ffeaf4',
    accent: '#ff7eb9',
    bgStart: '#420b29',
    bgEnd: '#961b5c',
    emblem: 'dil',
    defaultLabel: 'Sirf tumhare liye private link 👑'
  },
  {
    id: 'mehendi',
    name: '🌼 Marigold & Mehendi Glow',
    flavor: 'Warm Amber Gold & Festive Crimson',
    badge: '❀ PRIVATE COUPLE PASS',
    dark: '#5e112b',
    light: '#fff6df',
    accent: '#ffbe3d',
    bgStart: '#4f0e24',
    bgEnd: '#8f3214',
    emblem: 'kamal',
    defaultLabel: 'Humari private baatein yahin hongi 🌼'
  },
  {
    id: 'sufi',
    name: '🕯️ Midnight Plum & Mogra',
    flavor: 'Midnight Plum, Lavender & Starlight',
    badge: '☾ PRIVATE COUPLE PASS',
    dark: '#281038',
    light: '#f7ecfc',
    accent: '#e0aaff',
    bgStart: '#180b24',
    bgEnd: '#461d5c',
    emblem: 'chaand',
    defaultLabel: 'Tere bina adhoori hai har ek shaam 🌙'
  },
  {
    id: 'genz',
    name: '⚡ Cyber Rose Neon',
    flavor: 'Late-Night Neon Pink & Violet',
    badge: '♥ 1:13 AM COUPLE PASS',
    dark: '#1b0b2e',
    light: '#f3edff',
    accent: '#ff4f9a',
    bgStart: '#12071f',
    bgEnd: '#3b1054',
    emblem: 'dil',
    defaultLabel: '1:13 AM private couple room ⚡'
  }
];

export const CITY_PROFILES = {
  Hyderabad: {
    id: 'Hyderabad',
    label: 'Hyderabad (Telangana)',
    zomatoSlug: 'hyderabad',
    oyoSlug: 'hotels-in-hyderabad',
    defaultArea: 'Banjara Hills & Jubilee Hills',
    lat: 17.4156,
    lng: 78.4347,
    cafesAndSpots: [
      {
        id: 'hyd-niloufer',
        name: 'Café Niloufer Lounge, Banjara Hills',
        tier: 'Top-Tier Iconic Cafe',
        cuisine: 'Irani Dum Chai, Malai Bun, Osmania Biscuits & Classic Snacks',
        avgForTwo: '₹450 for two',
        rating: '4.9 ★',
        etaMinutes: 18,
        area: 'Banjara Hills Road No. 12, Hyderabad',
        bookingUrl: 'https://www.zomato.com/hyderabad/cafe-niloufer-banjara-hills',
        officialUrl: 'https://www.cafeniloufer.com/',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cafe+Niloufer+Banjara+Hills+Hyderabad'
      },
      {
        id: 'hyd-roastery',
        name: 'Roastery Coffee House, Banjara Hills',
        tier: 'Top-Tier Couple Cafe',
        cuisine: 'Artisanal Pour-Over Coffee, Courtyard Greenery & Pasta',
        avgForTwo: '₹1,100 for two',
        rating: '4.7 ★',
        etaMinutes: 22,
        area: 'Banjara Hills Road No. 14, Hyderabad',
        bookingUrl: 'https://www.zomato.com/hyderabad/roastery-coffee-house-banjara-hills',
        officialUrl: 'https://www.roasterycoffee.co.in/',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Roastery+Coffee+House+Banjara+Hills+Hyderabad'
      },
      {
        id: 'hyd-lamakaan-mid',
        name: 'The Hole In The Wall Café / Theory Café',
        tier: 'Mid-Tier Cozy Date Cafe',
        cuisine: 'Waffles, Cold Coffee, All-Day Breakfast & Quiet Corners',
        avgForTwo: '₹700 for two',
        rating: '4.5 ★',
        etaMinutes: 20,
        area: 'Jubilee Hills, Hyderabad',
        bookingUrl: 'https://www.zomato.com/hyderabad/restaurants?q=cozy+couple+cafe+jubilee+hills',
        officialUrl: 'https://www.zomato.com/hyderabad/dine-out',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Theory+Cafe+Jubilee+Hills+Hyderabad'
      },
      {
        id: 'hyd-olive',
        name: 'Olive Bistro & Bar, Durgam Cheruvu',
        tier: 'Top-Tier Candlelight Dinner',
        cuisine: 'Lakeview Mediterranean & Wood-Fired Pizzas',
        avgForTwo: '₹2,400 for two',
        rating: '4.7 ★',
        etaMinutes: 28,
        area: 'Durgam Cheruvu, Jubilee Hills, Hyderabad',
        bookingUrl: 'https://www.zomato.com/hyderabad/olive-bistro-bar-jubilee-hills',
        officialUrl: 'https://www.zomato.com/hyderabad/olive-bistro-bar-jubilee-hills/book',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Olive+Bistro+Durgam+Cheruvu+Hyderabad'
      }
    ]
  },
  Patna: {
    id: 'Patna',
    label: 'Patna / Bihar',
    zomatoSlug: 'patna',
    oyoSlug: 'hotels-in-patna',
    defaultArea: 'Boring Road & Fraser Road, Patna',
    lat: 25.6093,
    lng: 85.1376,
    cafesAndSpots: [
      {
        id: 'pat-sardarji',
        name: 'Sardar Ji Baksh Coffee & Co., Boring Road',
        tier: 'Top-Tier Couple Cafe',
        cuisine: 'Specialty Hazelnut Cold Coffee, Wood-Fired Pizza & Cozy Booths',
        avgForTwo: '₹800 for two',
        rating: '4.6 ★',
        etaMinutes: 19,
        area: 'Boring Road Crossing, Patna, Bihar',
        bookingUrl: 'https://www.zomato.com/patna/restaurants?q=Sardar+Ji+Baksh+Coffee+Boring+Road',
        officialUrl: 'https://www.zomato.com/patna/dine-out',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sardar+Ji+Baksh+Coffee+Boring+Road+Patna'
      },
      {
        id: 'pat-hideout',
        name: 'Cafe Hideout, Boring Road / Patliputra',
        tier: 'Mid-Tier Romantic Cafe',
        cuisine: 'Kulhad Chai, Sizzling Brownie, Mojitos & Private Couple Tables',
        avgForTwo: '₹500 for two',
        rating: '4.4 ★',
        etaMinutes: 16,
        area: 'North Sri Krishna Puri, Boring Road, Patna',
        bookingUrl: 'https://www.zomato.com/patna/restaurants?q=Cafe+Hideout+Patna',
        officialUrl: 'https://www.zomato.com/patna',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cafe+Hideout+Boring+Road+Patna+Bihar'
      },
      {
        id: 'pat-cookbook',
        name: 'The Cookbook Cafe & Rooftop, Patliputra',
        tier: 'Top-Tier Rooftop & Dining',
        cuisine: 'Continental, North Indian Candlelight Rooftop & Mocktails',
        avgForTwo: '₹1,100 for two',
        rating: '4.5 ★',
        etaMinutes: 22,
        area: 'Patliputra Colony, Patna, Bihar',
        bookingUrl: 'https://www.zomato.com/patna/restaurants?q=Cookbook+Cafe+Patna',
        officialUrl: 'https://www.zomato.com/patna/dine-out',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Cookbook+Cafe+Patliputra+Patna'
      },
      {
        id: 'pat-lemon-tree',
        name: 'Bansi Vihar & Maurya Spice Court, Gandhi Maidan',
        tier: 'Top-Tier Dinner & Biryani',
        cuisine: 'Champaran Mutton Handi, Dum Biryani & Royal Couple Dining',
        avgForTwo: '₹1,300 for two',
        rating: '4.6 ★',
        etaMinutes: 24,
        area: 'Fraser Road / South Gandhi Maidan, Patna',
        bookingUrl: 'https://www.zomato.com/patna/restaurants?q=biryani+dinner+patna',
        officialUrl: 'https://www.zomato.com/patna',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+Maurya+Patna+Fraser+Road'
      }
    ]
  },
  Delhi: {
    id: 'Delhi',
    label: 'Delhi NCR (Connaught Place / Hauz Khas)',
    zomatoSlug: 'ncr',
    oyoSlug: 'hotels-in-delhi',
    defaultArea: 'Hauz Khas & Connaught Place',
    lat: 28.6139,
    lng: 77.209,
    cafesAndSpots: [
      {
        id: 'del-diggin',
        name: 'Diggin Cafe, Chanakyapuri / Anand Lok',
        tier: 'Top-Tier Romantic Cafe',
        cuisine: 'Fairy-Lit Garden Courtyard, Cappuccino, Ravioli & Tiramisu',
        avgForTwo: '₹1,400 for two',
        rating: '4.6 ★',
        etaMinutes: 24,
        area: 'Chanakyapuri, New Delhi',
        bookingUrl: 'https://www.zomato.com/ncr/diggin-chanakyapuri-new-delhi',
        officialUrl: 'https://www.zomato.com/ncr/dine-out',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Diggin+Cafe+Chanakyapuri+New+Delhi'
      },
      {
        id: 'del-ama',
        name: 'AMA Cafe / Blue Tokai, Majnu Ka Tilla & Hauz Khas',
        tier: 'Mid-Tier Cozy Couple Cafe',
        cuisine: 'Himalayan Coffee, Pancakes, Cheesecake & Cozy Windows',
        avgForTwo: '₹650 for two',
        rating: '4.7 ★',
        etaMinutes: 19,
        area: 'Majnu Ka Tilla / Hauz Khas, Delhi',
        bookingUrl: 'https://www.zomato.com/ncr/ama-cafe-majnu-ka-tila-new-delhi',
        officialUrl: 'https://www.zomato.com/ncr',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=AMA+Cafe+Delhi'
      }
    ]
  },
  Mumbai: {
    id: 'Mumbai',
    label: 'Mumbai (Bandra / Colaba)',
    zomatoSlug: 'mumbai',
    oyoSlug: 'hotels-in-mumbai',
    defaultArea: 'Bandra West & Juhu',
    lat: 19.076,
    lng: 72.8777,
    cafesAndSpots: [
      {
        id: 'mum-candies',
        name: 'Candies & Subko Specialty Coffee, Bandra West',
        tier: 'Mid-Tier Iconic Couple Cafe',
        cuisine: 'Artisanal Coffee, Croissants, Portuguese Villa Terraces',
        avgForTwo: '₹750 for two',
        rating: '4.6 ★',
        etaMinutes: 20,
        area: 'Pali Hill, Bandra West, Mumbai',
        bookingUrl: 'https://www.zomato.com/mumbai/candies-bandra-west',
        officialUrl: 'https://www.zomato.com/mumbai/dine-out',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Candies+Bandra+West+Mumbai'
      },
      {
        id: 'mum-dome',
        name: 'Dome InterContinental, Marine Drive',
        tier: 'Top-Tier Sunset Candlelight',
        cuisine: 'Sea-Facing Rooftop Candlelight Dining Over Queen’s Necklace',
        avgForTwo: '₹2,800 for two',
        rating: '4.7 ★',
        etaMinutes: 27,
        area: 'Marine Drive, Churchgate, Mumbai',
        bookingUrl: 'https://www.zomato.com/mumbai/dome-intercontinental-marine-drive',
        officialUrl: 'https://www.zomato.com/mumbai/dine-out',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dome+InterContinental+Marine+Drive+Mumbai'
      }
    ]
  },
  Bengaluru: {
    id: 'Bengaluru',
    label: 'Bengaluru (Indiranagar / Koramangala)',
    zomatoSlug: 'bangalore',
    oyoSlug: 'hotels-in-bangalore',
    defaultArea: 'Indiranagar & Koramangala',
    lat: 12.9716,
    lng: 77.5946,
    cafesAndSpots: [
      {
        id: 'blr-thirdwave',
        name: 'Third Wave Coffee & Truffles, Indiranagar',
        tier: 'Mid-Tier Couple Favourite',
        cuisine: 'Sea Salt Mocha, Burgers, Truffle Pasta & Warm Lighting',
        avgForTwo: '₹700 for two',
        rating: '4.6 ★',
        etaMinutes: 17,
        area: '100 Feet Road, Indiranagar, Bengaluru',
        bookingUrl: 'https://www.zomato.com/bangalore/restaurants?q=Third+Wave+Coffee+Indiranagar',
        officialUrl: 'https://www.thirdwavecoffee.in/',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Third+Wave+Coffee+Indiranagar+Bengaluru'
      },
      {
        id: 'blr-dyu',
        name: 'Dyu Art Cafe, Koramangala',
        tier: 'Top-Tier Courtyard Cafe',
        cuisine: 'Kerala Villa Courtyard, Hot Chocolate & Banoffee Pie',
        avgForTwo: '₹800 for two',
        rating: '4.6 ★',
        etaMinutes: 21,
        area: 'Koramangala 5th Block, Bengaluru',
        bookingUrl: 'https://www.zomato.com/bangalore/dyu-art-cafe-koramangala-5th-block',
        officialUrl: 'https://www.zomato.com/bangalore/dine-out',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Dyu+Art+Cafe+Koramangala+Bengaluru'
      }
    ]
  },
  Kolkata: {
    id: 'Kolkata',
    label: 'Kolkata (Park Street / Salt Lake)',
    zomatoSlug: 'kolkata',
    oyoSlug: 'hotels-in-kolkata',
    defaultArea: 'Park Street & Hindustan Park',
    lat: 22.5726,
    lng: 88.3639,
    cafesAndSpots: [
      {
        id: 'kol-flury',
        name: 'Flurys & Roastery Coffee House, Park Street / Gariahat',
        tier: 'Top-Tier Heritage Cafe',
        cuisine: 'Darjeeling Tea, Rum Balls, English Breakfast & Vintage Vibes',
        avgForTwo: '₹900 for two',
        rating: '4.6 ★',
        etaMinutes: 19,
        area: 'Park Street / Hindustan Park, Kolkata',
        bookingUrl: 'https://www.zomato.com/kolkata/flurys-park-street-area',
        officialUrl: 'https://www.zomato.com/kolkata/dine-out',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Flurys+Park+Street+Kolkata'
      }
    ]
  }
};

export const brandCategories = [
  { id: 'all', label: '✨ All 38+ Top Indian Apps' },
  { id: 'instant', label: '⚡ 10-Min Quick Commerce (Blinkit / Flipkart Minutes / Zepto / Instamart)' },
  { id: 'food', label: '🍲 Food, Cafes & Dining (Zomato / Swiggy / Café Niloufer / Starbucks)' },
  { id: 'shopping', label: '🛍️ Shopping & Fashion (Amazon / Flipkart / Myntra / Ajio / Meesho)' },
  { id: 'beauty', label: '💄 Beauty, Perfume & Wellness (Nykaa / Tira / Bella Vita / Durex)' },
  { id: 'stays', label: '🏨 Stays, Rides & Movies (OYO / MakeMyTrip / Uber / BookMyShow)' },
  { id: 'gifts', label: '🌹 Roses, Cakes & Gifting (FNP / IGP / Cadbury)' }
];

const logoFor = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

export const brandCatalog = [
  // ================= 1. QUICK COMMERCE & INSTANT DELIVERY =================
  {
    id: 'flipkart_minutes',
    companionBrandId: 'blinkit',
    name: 'Flipkart Minutes',
    logoText: 'MINUTES',
    logoDomain: 'flipkart.com',
    logoUrl: logoFor('flipkart.com'),
    logoBg: '#2874f0',
    logoColor: '#ffe500',
    emoji: '⚡',
    category: 'instant',
    accent: '#2874f0',
    couponCode: 'MINUTES50',
    offerHeadline: 'Flat ₹100 OFF + Free 9-Min Express Drop on Flipkart Minutes',
    displayUrl: 'flipkart.com/flipkart-minutes',
    externalUrl: 'https://www.flipkart.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Cadbury Silk Ferrero Rocher') =>
      `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Intezaar kyun karna jaan? 😉 Flipkart Minutes se 9 minute mein Ferrero Rocher, Mood Kit ya Midnight Snacks chupke se mangwa lo!',
    guestFlirtLine:
      'Raat ki baatein aur instant cravings ⚡ Flipkart Minutes pe 9 mins mein Ice Cream, Chocolates ya Care Essentials order karo!',
    tagline: '9-Min Superfast Delivery · Chocolates, Late-Night Essentials & Electronics',
    meme: {
      memeEmoji: '🕶️',
      memeBadge: 'HERA PHERI · RAJU SCHEME VIBE',
      memeTitle: '“25 din nahi Babu Bhaiya... sirf 9 MINUTE mein pyaar double!” 😂',
      memeQuote: 'When bae says “mood ho raha hai” and Flipkart Minutes rider reaches before the next reply:'
    },
    keywords: ['flipkart minutes', 'minutes', 'urgent', 'fast', 'quick', 'ferrero', 'silk', 'snacks', 'chips', 'charger'],
    items: [
      {
        id: 'fkm-silk-pack',
        name: 'Cadbury Dairy Milk Silk Heart Blush + Ferrero Rocher Combo',
        searchQuery: 'Cadbury Dairy Milk Silk Ferrero Rocher',
        tag: '9-Min Hyperlocal Drop',
        originalPrice: 549,
        etaMinutes: 9
      },
      {
        id: 'fkm-wellness-kit',
        name: 'Durex Air Ultra Thin + Scented Soy Candle Couple Kit',
        searchQuery: 'Durex Air Ultra Thin Condoms',
        tag: '100% Discreet Pack',
        originalPrice: 499,
        etaMinutes: 10
      }
    ]
  },
  {
    id: 'blinkit',
    companionBrandId: 'flipkart_minutes',
    name: 'Blinkit',
    logoText: 'blinkit',
    logoDomain: 'blinkit.com',
    logoUrl: logoFor('blinkit.com'),
    logoBg: '#f8cb46',
    logoColor: '#111111',
    emoji: '💛',
    category: 'instant',
    accent: '#f8cb46',
    couponCode: 'BLINKITLOVE',
    offerHeadline: 'Free Discreet Delivery in 8–10 Mins via Blinkit Partner Store',
    displayUrl: 'blinkit.com',
    externalUrl: 'https://blinkit.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Durex Air Chocolate') =>
      `https://blinkit.com/s/?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Mood thoda gehra ho raha hai 😉 Blinkit se 8 minute mein Durex Air, Massage Oil ya Belgian Ice Cream bina partner ko bataye surprise mangwao!',
    guestFlirtLine:
      'Raat lambi hai aur vibe romantic 🔥 Blinkit se 8 mins mein Strawberries, Ice Cream ya Intimate Care Kit order karo!',
    tagline: '8-Min Discreet Doorstep Delivery · Intimate Wellness & Midnight Cravings',
    meme: {
      memeEmoji: '👀',
      memeBadge: 'PANCHAYAT · BINOD VIBE',
      memeTitle: '“Dekh rahe ho Binod... baat mausam ki ho rahi hai aur Blinkit se Mood Kit mangwaya ja raha hai!” 🤣',
      memeQuote: '8-Minute discreet brown-bag delivery — padosi ko bhi pata nahi chalega!'
    },
    keywords: ['blinkit', 'condom', 'condoms', 'protection', 'intimate', 'ice cream', 'strawberry', 'strawberries', 'lube', 'candle'],
    items: [
      {
        id: 'blk-durex-mood',
        name: 'Durex Air Ultra-Thin + Vanilla Mood Candle + Silk Pack',
        searchQuery: 'Durex Air Ultra Thin',
        tag: 'Discreet 8-Min Drop',
        originalPrice: 649,
        etaMinutes: 8
      },
      {
        id: 'blk-tub-choco',
        name: 'Belgian Dark Chocolate Ice Cream Tub + Fresh Strawberries',
        searchQuery: 'Belgian Dark Chocolate Ice Cream',
        tag: 'Midnight Mood Booster',
        originalPrice: 480,
        etaMinutes: 9
      }
    ]
  },
  {
    id: 'zepto',
    companionBrandId: 'swiggy_instamart',
    name: 'Zepto 10-Min',
    logoText: 'zepto',
    logoDomain: 'zeptonow.com',
    logoUrl: logoFor('zeptonow.com'),
    logoBg: '#4b0082',
    logoColor: '#ff4f9a',
    emoji: '🚀',
    category: 'instant',
    accent: '#a855f7',
    couponCode: 'ZEPTOCAFE',
    offerHeadline: '10-Min Zepto Cafe Vietnamese Cold Coffee & Midnight Essentials',
    displayUrl: 'zeptonow.com',
    externalUrl: 'https://www.zeptonow.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Vietnamese Cold Coffee') =>
      `https://www.zeptonow.com/search?query=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      '10 minute mein Zepto Cafe ki Vietnamese Cold Coffee aur Croissant mangwa ke late-night mood set karein? 🚀',
    guestFlirtLine:
      'Late night baat aur Zepto Cafe ki Spanish Latte 🚀 Order in 10 mins!',
    tagline: '10-Min Zepto Cafe Coffee, Desserts & Instant Cravings',
    meme: {
      memeEmoji: '⚡',
      memeBadge: '3 IDIOTS · VIRUS VIBE',
      memeTitle: '“Life is a race... aur Zepto rider sabse aage hai!” 🛵💨',
      memeQuote: 'Neend aa rahi hai par chat band nahi karni? 10 min mein Cold Coffee hazir!'
    },
    keywords: ['zepto', 'vietnamese', 'croissant', 'mocha', 'cold coffee', 'energy drink', 'redbull'],
    items: [
      {
        id: 'zep-coffee-duo',
        name: 'Zepto Cafe 2x Vietnamese Iced Coffee + Warm Butter Croissant',
        searchQuery: 'Vietnamese Iced Coffee Croissant',
        tag: '10-Min Cafe Drop',
        originalPrice: 389,
        etaMinutes: 10
      }
    ]
  },
  {
    id: 'swiggy_instamart',
    companionBrandId: 'zepto',
    name: 'Swiggy Instamart',
    logoText: 'INSTAMART',
    logoDomain: 'swiggy.com',
    logoUrl: logoFor('swiggy.com'),
    logoBg: '#fc8019',
    logoColor: '#ffffff',
    emoji: '🛒',
    category: 'instant',
    accent: '#fb923c',
    couponCode: 'INSTALOVE100',
    offerHeadline: '24x7 Midnight Munchies, Ice Cream & Couple Care in 10 Mins',
    displayUrl: 'swiggy.com/instamart',
    externalUrl: 'https://www.swiggy.com/instamart',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Maggi Chocolate Ice Cream') =>
      `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Raat ke 2 baje wali Maggi aur Hot Chocolate? 🛒 Swiggy Instamart se 10 minute mein sab kuch mangwa lo!',
    guestFlirtLine:
      'Midnight cravings ka ilaj — Swiggy Instamart 10-Min Late Night Drop 🍫',
    tagline: '10-Min Groceries, Chocolates, Korean Ramen & Couple Essentials',
    meme: {
      memeEmoji: '🍜',
      memeBadge: 'JAB WE MET · GEET VIBE',
      memeTitle: '“Main apni favourite hoon... aur 2 AM wali Spicy Ramen meri soulmate!” 😋',
      memeQuote: 'Jab baatein khatam na hon, toh Instamart se midnight snacks mangwa lo!'
    },
    keywords: ['instamart', 'maggi', 'ramen', 'noodles', 'kurkure', 'lays', 'munchies', 'midnight snack'],
    items: [
      {
        id: 'inst-ramen-box',
        name: 'Korean Spicy Ramen + Coke Zero + Belgian Choco Brownie Tub',
        searchQuery: 'Korean Ramen Chocolate Ice Cream',
        tag: '2 AM Couple Binge',
        originalPrice: 449,
        etaMinutes: 10
      }
    ]
  },

  // ================= 2. TOP SHOPPING & FASHION APPS (AMAZON, FLIPKART, MYNTRA, AJIO, MEESHO) =================
  {
    id: 'amazon',
    companionBrandId: 'flipkart',
    name: 'Amazon India',
    logoText: 'amazon.in',
    logoDomain: 'amazon.in',
    logoUrl: logoFor('amazon.in'),
    logoBg: '#232f3e',
    logoColor: '#ff9900',
    emoji: '📦',
    category: 'shopping',
    accent: '#ff9900',
    couponCode: 'AMAZONPRIME10',
    offerHeadline: 'Same-Day Prime Delivery on Couple Gifts, Smartwatches, Perfumes & Decor',
    displayUrl: 'amazon.in',
    externalUrl: 'https://www.amazon.in',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Couple Gift Set') =>
      `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Unke चेहरे pe smile dekhni hai? 📦 Amazon Prime se Same-Day Couple Gift Box, Fairy Lights ya Smartwatch surprise order karo!',
    guestFlirtLine:
      'Wishlist mein jo rakha tha woh mangwane ka time aa gaya 😉 Check out Amazon India Deals!',
    tagline: 'India’s #1 Store · Couple Gifts, Electronics, Chocolates & Same-Day Prime Delivery',
    meme: {
      memeEmoji: '📦',
      memeBadge: 'MIRZAPUR · KALEEN BHAIYA VIBE',
      memeTitle: '“rishte mein izzat aur Amazon cart mein unke liye gift... dono hona chahiye!” 😎',
      memeQuote: 'When you casually drop a hint and Amazon Prime delivers it the same evening:'
    },
    keywords: ['amazon', 'prime', 'order', 'shopping', 'watch', 'smartwatch', 'headphones', 'earbuds', 'alexa', 'kindle', 'gadget'],
    items: [
      {
        id: 'amz-couple-box',
        name: 'Amazon Prime Luxury Couple Gift Hamper (Pendant + Perfume + Chocolates)',
        searchQuery: 'Romantic Couple Gift Hamper',
        tag: 'Prime Same-Day Delivery',
        originalPrice: 1299,
        etaMinutes: 180
      },
      {
        id: 'amz-sunset-lamp',
        name: 'Sunset Projection Mood Lamp + Warm Fairy Curtain Lights for Bedroom',
        searchQuery: 'Sunset Lamp Romantic Room Decor',
        tag: 'AfterDark Mood Lighting',
        originalPrice: 699,
        etaMinutes: 210
      }
    ]
  },
  {
    id: 'flipkart',
    companionBrandId: 'amazon',
    name: 'Flipkart',
    logoText: 'Flipkart',
    logoDomain: 'flipkart.com',
    logoUrl: logoFor('flipkart.com'),
    logoBg: '#2874f0',
    logoColor: '#ffe500',
    emoji: '🛍️',
    category: 'shopping',
    accent: '#3b82f6',
    couponCode: 'FLIPCOUPLE',
    offerHeadline: 'Big Bachat Deals on Couple Watches, Sneakers, Phones & Gifts on Flipkart',
    displayUrl: 'flipkart.com',
    externalUrl: 'https://www.flipkart.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Couple Watches Gift Set') =>
      `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Tohfa aisa do ki yaad rahe 🛍️ Flipkart se Couple Analog Watch Set, Polaroid Camera ya Gift Box order karo!',
    guestFlirtLine:
      'Shopping therapy best therapy hai ✨ Grab top deals on Fashion, Gadgets & Gifts on Flipkart!',
    tagline: 'Trending Gadgets, Instax Polaroid Cameras, Couple Watches & Gifts',
    meme: {
      memeEmoji: '🤑',
      memeBadge: 'HERA PHERI · BABURAO VIBE',
      memeTitle: '“Utha le re baba... mere ko nahi, Flipkart se yeh Instax Camera utha le!” 📸😂',
      memeQuote: 'Agli date ki cute polaroid photos ke liye abhi order kar lo!'
    },
    keywords: ['flipkart', 'camera', 'polaroid', 'instax', 'phone', 'iphone', 'mobile', 'bag', 'handbag', 'shoes', 'sneakers'],
    items: [
      {
        id: 'flp-instax-mini',
        name: 'Fujifilm Instax Mini Polaroid Camera + 20 Couple Film Sheets',
        searchQuery: 'Fujifilm Instax Mini Camera',
        tag: 'Date Memory Maker',
        originalPrice: 5499,
        etaMinutes: 240
      },
      {
        id: 'flp-couple-watches',
        name: 'Titan / Sonata Rose-Gold Pair Couple Watches Gift Set',
        searchQuery: 'Couple Watches Set',
        tag: 'Bestseller Gift',
        originalPrice: 2199,
        etaMinutes: 180
      }
    ]
  },
  {
    id: 'myntra',
    companionBrandId: 'ajio',
    name: 'Myntra',
    logoText: 'Myntra',
    logoDomain: 'myntra.com',
    logoUrl: logoFor('myntra.com'),
    logoBg: '#ff3f6c',
    logoColor: '#ffffff',
    emoji: '👗',
    category: 'shopping',
    accent: '#ff3f6c',
    couponCode: 'MYNTRADATE',
    offerHeadline: 'Date-Night Fits, Silver Jhumkas & M-Now 30-Min Express Delivery on Myntra',
    displayUrl: 'myntra.com',
    externalUrl: 'https://www.myntra.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'oxidised silver jhumkas') =>
      `https://www.myntra.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`,
    creatorFlirtLine:
      'Candlelight dinner ke liye Oxidised Silver Jhumke ya Black Chikankari Kurta gift karo 👗 Myntra pe abhi dekho!',
    guestFlirtLine:
      '“Mere paas kuch pehenne ko nahi hai” problem solved! ✨ Explore Date-Night Outfits & Jhumkas on Myntra.',
    tagline: 'Date-Night Outfits, Silver Jhumkas & Matching Couple Hoodies',
    meme: {
      memeEmoji: '💅',
      memeBadge: 'K3G · POO VIBE',
      memeTitle: '“Kaun hai yeh jisne dobara mudke mujhe nahi dekha?” — You in your new Myntra Date Fit 🔥',
      memeQuote: 'Jhumke dilwa do, saara gussa 2 second mein gayab!'
    },
    keywords: ['myntra', 'jhumka', 'jhumkas', 'dress', 'outfit', 'kurta', 'hoodie', 'saree', 'shirt', 'jeans', 'heels', 'top'],
    items: [
      {
        id: 'myn-jhumka-kurta',
        name: 'Jaipuri Oxidised Silver Jhumkas + Midnight Black Chikankari Set',
        searchQuery: 'oxidised silver jhumkas',
        tag: 'Date Night Ready',
        originalPrice: 1499,
        etaMinutes: 40
      },
      {
        id: 'myn-couple-hoodie',
        name: 'Oversized Matching Couple Hoodies & Date-Night Satin Dress',
        searchQuery: 'satin party dress',
        tag: 'Myntra Bestseller',
        originalPrice: 1699,
        etaMinutes: 60
      }
    ]
  },
  {
    id: 'ajio',
    companionBrandId: 'myntra',
    name: 'AJIO Luxe & Street',
    logoText: 'AJIO',
    logoDomain: 'ajio.com',
    logoUrl: logoFor('ajio.com'),
    logoBg: '#2c4152',
    logoColor: '#ffffff',
    emoji: '🧥',
    category: 'shopping',
    accent: '#38bdf8',
    couponCode: 'AJIOBOLD',
    offerHeadline: 'Up to 70% OFF on Sneakers, Streetwear & Date-Night Jackets on AJIO',
    displayUrl: 'ajio.com',
    externalUrl: 'https://www.ajio.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Date Night Shirt Jacket') =>
      `https://www.ajio.com/search/?text=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Date pe unhe impress karna hai? 🧥 AJIO se sharp Linen Shirt, Sneakers ya Oversized Tee mangwa lo!',
    guestFlirtLine:
      'Gen-Z couple drip check! ✨ Shop aesthetic Streetwear, Dresses & Sneakers on AJIO.',
    tagline: 'Trendsetting Gen-Z Streetwear, Sneakers & Luxe Date Fits',
    meme: {
      memeEmoji: '👟',
      memeBadge: 'WELCOME · MAJNU BHAI VIBE',
      memeTitle: '“Control Uday, Control... AJIO ka 70% OFF sale dekh ke rukna mushkil hai!” 😂',
      memeQuote: 'Matching couple sneakers pehen ke date pe jaane ka alag hi swag hai!'
    },
    keywords: ['ajio', 'streetwear', 'jacket', 'denim', 'tshirt', 'cargo', 'drip', 'fashion'],
    items: [
      {
        id: 'ajio-street-fit',
        name: 'Cuban Collar Date-Night Linen Shirt + Chunky White Sneakers',
        searchQuery: 'Cuban Collar Shirt',
        tag: 'Gen-Z Date Drip',
        originalPrice: 1599,
        etaMinutes: 180
      }
    ]
  },
  {
    id: 'meesho',
    companionBrandId: 'myntra',
    name: 'Meesho',
    logoText: 'meesho',
    logoDomain: 'meesho.com',
    logoUrl: logoFor('meesho.com'),
    logoBg: '#9f2089',
    logoColor: '#ffffff',
    emoji: '🎀',
    category: 'shopping',
    accent: '#e879f9',
    couponCode: 'MEESHOLOVE',
    offerHeadline: 'Lowest Prices on Cute Couple Keychains, Jewellery, Kurtis & Room Decor',
    displayUrl: 'meesho.com',
    externalUrl: 'https://www.meesho.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Oxidised Jhumka Couple Rings') =>
      `https://www.meesho.com/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Pocket-friendly cute surprises! 🎀 Meesho se Magnetic Couple Bracelets, Jhumka Set ya Neon Heart Light mangwao!',
    guestFlirtLine:
      'Sasta, sundar aur super cute! ✨ Check out Jhumkas, Kurtis & Couple Rings on Meesho.',
    tagline: 'Cute Couple Rings, Magnetic Bracelets, Jhumkas & Room Decor at Wholesale Prices',
    meme: {
      memeEmoji: '💍',
      memeBadge: 'SHARK TANK · ASHNEER VIBE',
      memeTitle: '“Bhai kya kar raha hai tu?! ₹199 mein itna pyara Jhumka aur Couple Ring mil raha hai!” 🦈😂',
      memeQuote: 'Budget friendly pyaar — dil bada hona chahiye, bill nahi!'
    },
    keywords: ['meesho', 'kurti', 'bangles', 'ring', 'bracelet', 'decor', 'budget', 'sasta', 'cute'],
    items: [
      {
        id: 'msh-couple-bracelets',
        name: 'Magnetic Heart Distance Couple Bracelets + Adjustable Couple Rings + Jhumka Combo',
        searchQuery: 'Magnetic Couple Bracelets',
        tag: 'Under ₹299 Deal',
        originalPrice: 279,
        etaMinutes: 240
      }
    ]
  },

  // ================= 3. FOOD, CAFES & DINING (ZOMATO, SWIGGY, CAFE NILOUFER, STARBUCKS, DOMINO'S, ETC.) =================
  {
    id: 'zomato',
    companionBrandId: 'swiggy',
    name: 'Zomato',
    logoText: 'zomato',
    logoDomain: 'zomato.com',
    logoUrl: logoFor('zomato.com'),
    logoBg: '#cb202d',
    logoColor: '#ffffff',
    emoji: '🍲',
    category: 'food',
    accent: '#ff5263',
    couponCode: 'ZOMATOCOUPLE',
    offerHeadline: 'Up to 50% OFF + Gold Dining & Delivery Offers on Zomato',
    displayUrl: 'zomato.com',
    externalUrl: 'https://www.zomato.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Dum Biryani') => {
      const profile = CITY_PROFILES[city] || CITY_PROFILES.Hyderabad;
      return `https://www.zomato.com/${profile.zomatoSlug}/restaurants?q=${encodeURIComponent(query)}`;
    },
    creatorFlirtLine:
      'Bhook lagi hai ya pyaar jatana hai? ❤️ Zomato se unke current location pe गरमा-गरम Dum Biryani, Wood-Fired Pizza ya Tiramisu surprise bhejo!',
    guestFlirtLine:
      'Pyaar bhari baaton ke saath pet pooja bhi zaroori hai 😋 Zomato pe apne shaher ke best restaurants se Biryani ya Pizza order karo!',
    tagline: 'Live Restaurant Delivery & Table Reservations in Your City',
    meme: {
      memeEmoji: '🍛',
      memeBadge: 'MUNNA BHAI · CIRCUIT VIBE',
      memeTitle: '“Bhai ne bola Biryani mangwane ka, toh mangwane ka!” 🍗🔥',
      memeQuote: 'True love is sending Zomato Dum Biryani when your partner says “mujhe bhook nahi hai”.'
    },
    keywords: ['zomato', 'biryani', 'dinner', 'lunch', 'hungry', 'bhook', 'bhookh', 'khana', 'khaana', 'pizza', 'tiramisu', 'food', 'kebab', 'pasta', 'restaurant'],
    items: [
      {
        id: 'zom-biryani-her',
        name: 'Special Royal Zafrani Dum Biryani + Double Ka Meetha / Gulab Jamun',
        searchQuery: 'Dum Biryani',
        tag: 'Bestseller in Your City',
        originalPrice: 649,
        etaMinutes: 25
      },
      {
        id: 'zom-pizza-tiramisu',
        name: 'Artisanal Wood-Fired Margherita Pizza + Classic Tiramisu',
        searchQuery: 'Wood Fired Pizza Tiramisu',
        tag: 'Date Night Dinner',
        originalPrice: 799,
        etaMinutes: 28
      }
    ]
  },
  {
    id: 'swiggy',
    companionBrandId: 'zomato',
    name: 'Swiggy Food',
    logoText: 'SWIGGY',
    logoDomain: 'swiggy.com',
    logoUrl: logoFor('swiggy.com'),
    logoBg: '#fc8019',
    logoColor: '#ffffff',
    emoji: '🧡',
    category: 'food',
    accent: '#fc8019',
    couponCode: 'SWIGGYIT',
    offerHeadline: 'Flat ₹125 OFF on Late-Night Cravings, Momos & Desserts via Swiggy',
    displayUrl: 'swiggy.com',
    externalUrl: 'https://www.swiggy.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Choco Lava Cake Momos') =>
      `https://www.swiggy.com/search?query=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Raat wali craving hit ho rahi? 🧡 Swiggy se गरमा-गरम Momos, Shawarma ya Molten Choco Lava Cake chupke se unke ghar bhejo!',
    guestFlirtLine:
      'Nakhre kam karo aur Swiggy se kuch meetha mangwao! 🍫 Tap to order real desserts & snacks.',
    tagline: 'Midnight Cravings, Desserts & Hot Snacks Delivered Fast',
    meme: {
      memeEmoji: '🥟',
      memeBadge: 'TMKOC · JETHALAL VIBE',
      memeTitle: '“Ae Pagli! Gussa thook de, tere liye Swiggy se गरमा-गरम Momos aur Choco Lava bheja hai!” 😍',
      memeQuote: '99% couple fights end immediately after the Swiggy doorbell rings.'
    },
    keywords: ['swiggy', 'momos', 'shawarma', 'dessert', 'cake', 'burger', 'craving', 'fries', 'waffle', 'roll'],
    items: [
      {
        id: 'swg-shawarma-lava',
        name: '2x Special Rumali Shawarma + Warm Molten Choco Lava Cake',
        searchQuery: 'Shawarma Choco Lava Cake',
        tag: 'Late Night Combo',
        originalPrice: 440,
        etaMinutes: 21
      },
      {
        id: 'swg-peri-momos',
        name: 'Crispy Peri-Peri Momos + Cheesy Loaded Fries + Cold Coffee',
        searchQuery: 'Peri Peri Momos Cold Coffee',
        tag: 'Nok-Jhok Snack Pack',
        originalPrice: 410,
        etaMinutes: 20
      }
    ]
  },
  {
    id: 'cafes',
    companionBrandId: 'starbucks',
    name: 'Café Niloufer & City Cafes',
    logoText: 'CAFÉ DATE',
    logoDomain: 'cafeniloufer.com',
    logoUrl: logoFor('cafeniloufer.com'),
    logoBg: '#d97706',
    logoColor: '#ffffff',
    emoji: '☕',
    category: 'food',
    accent: '#f59e0b',
    couponCode: 'CAFEDATE20',
    offerHeadline: 'Book Top-Tier & Mid-Tier Couple Cafes in Your City + Add to Google Calendar',
    displayUrl: 'cafeniloufer.com',
    externalUrl: 'https://www.cafeniloufer.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Cafe Niloufer') => {
      if (city === 'Hyderabad' && query.toLowerCase().includes('niloufer')) {
        return 'https://www.cafeniloufer.com/';
      }
      const profile = CITY_PROFILES[city] || CITY_PROFILES.Hyderabad;
      return `https://www.zomato.com/${profile.zomatoSlug}/restaurants?q=${encodeURIComponent(query + ' ' + city)}`;
    },
    creatorFlirtLine:
      'Chai ya coffee pe aankhon mein dekh ke baat karni hai ☕ Café Niloufer ya apne shaher ke Top-Tier Cafe mein table dekho aur Google Calendar mein date save karo!',
    guestFlirtLine:
      'Ek pyali गरमा-गरम Irani Chai / Cold Coffee aur tumhara saath ☕♥ Check out live nearby cafes & book our table!',
    tagline: 'Café Niloufer (Hyderabad) + Top & Mid-Tier Couple Cafes in Bihar, Delhi, Mumbai & Across India',
    meme: {
      memeEmoji: '☕',
      memeBadge: 'HYDERABADI CHAI VIBE',
      memeTitle: '“Pyaar-vyaar sab dhoka hai... Café Niloufer ki Malai Bun aur Irani Chai hi asli mauka hai!” ☕👑',
      memeQuote: 'Chai date pe chalo, saari overthinking ek ghunt mein khatam!'
    },
    keywords: ['niloufer', 'chai', 'tea', 'coffee', 'cappuccino', 'latte', 'cafe', 'cafes', 'irani', 'osmania', 'bun maska', 'table', 'hangout'],
    items: [
      {
        id: 'caf-niloufer-special',
        name: 'Café Niloufer Dum Irani Chai Flask + Malai Bun & Osmania Biscuits',
        searchQuery: 'Cafe Niloufer Chai Bun Maska',
        tag: 'Iconic Chai Date',
        originalPrice: 360,
        etaMinutes: 18
      },
      {
        id: 'caf-top-tier-table',
        name: 'Top-Tier Specialty Coffee & Courtyard Table for Two (Roastery / Sardar Ji Baksh / Diggin)',
        searchQuery: 'Specialty Coffee Couple Cafe',
        tag: 'Top-Tier Cafe Table',
        originalPrice: 799,
        etaMinutes: 20
      }
    ]
  },
  {
    id: 'starbucks',
    companionBrandId: 'cafes',
    name: 'Starbucks India',
    logoText: 'STARBUCKS',
    logoDomain: 'starbucks.in',
    logoUrl: logoFor('starbucks.in'),
    logoBg: '#00704a',
    logoColor: '#ffffff',
    emoji: '🥤',
    category: 'food',
    accent: '#10b981',
    couponCode: 'STARBUCKS2FOR1',
    offerHeadline: 'Java Chip Frappuccino & Personalized Name Cups for Your Coffee Date',
    displayUrl: 'starbucks.in',
    externalUrl: 'https://www.starbucks.in',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Starbucks') =>
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Starbucks Coffee ${city}`)}`,
    creatorFlirtLine:
      'Cup pe tumhara naam aur samne meri aankhein 💚 Chalo Starbucks ki Java Chip Frappuccino date pe!',
    guestFlirtLine:
      'Coffee date aesthetic chahiye? 💚 Find the nearest Starbucks or order Frappuccinos for two!',
    tagline: 'Signature Frappuccinos, Cheesecake & Cozy Coffee Dates',
    meme: {
      memeEmoji: '🧋',
      memeBadge: 'WELCOME · UDAY SHETTY VIBE',
      memeTitle: '“भगवान का दिया सब कुछ है... बस Starbucks के कप पे हम दोनों का नाम लिखा होना बाकी है!” 💚😂',
      memeQuote: 'Tap to locate the closest Starbucks or order cold coffee in 18 mins!'
    },
    keywords: ['starbucks', 'frappuccino', 'java chip', 'espresso', 'americano', 'iced coffee'],
    items: [
      {
        id: 'sbx-java-duo',
        name: '2x Tall Java Chip Frappuccino + New York Blueberry Cheesecake',
        searchQuery: 'Starbucks Java Chip Frappuccino',
        tag: 'Coffee Date Classic',
        originalPrice: 780,
        etaMinutes: 19
      }
    ]
  },
  {
    id: 'blue_tokai',
    companionBrandId: 'starbucks',
    name: 'Blue Tokai Coffee',
    logoText: 'BLUE TOKAI',
    logoDomain: 'bluetokaicoffee.com',
    logoUrl: logoFor('bluetokaicoffee.com'),
    logoBg: '#1d4ed8',
    logoColor: '#ffffff',
    emoji: '🫘',
    category: 'food',
    accent: '#60a5fa',
    couponCode: 'TOKAI20',
    offerHeadline: 'Artisanal Indian Specialty Pour-Over Coffee & Sourdough Croissants',
    displayUrl: 'bluetokaicoffee.com',
    externalUrl: 'https://bluetokaicoffee.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Blue Tokai Iced Latte') =>
      `https://bluetokaicoffee.com/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Asli coffee lovers ke liye Blue Tokai Iced Sea-Salt Latte aur Almond Croissant 🫘♥',
    guestFlirtLine:
      'Subah ki shuruat ya shaam ki guftagu — Blue Tokai Specialty Coffee mangwao!',
    tagline: 'Specialty Indian Estate Coffee & Artisanal Bakery',
    meme: {
      memeEmoji: '☕',
      memeBadge: 'KOTA FACTORY · JEETU BHAIYA VIBE',
      memeTitle: '“Coffee sirf drink nahi hai... yeh do dilo ko jagane ka emotion hai!” ☕✨',
      memeQuote: 'Freshly roasted specialty coffee delivered right to your table.'
    },
    keywords: ['blue tokai', 'pour over', 'cold brew', 'artisanal coffee', 'roastery'],
    items: [
      {
        id: 'btk-iced-latte',
        name: '2x Vietnamese Style Iced Coffee + Pain Au Chocolat',
        searchQuery: 'Vietnamese Iced Coffee',
        tag: 'Specialty Roast',
        originalPrice: 540,
        etaMinutes: 20
      }
    ]
  },
  {
    id: 'dominos',
    companionBrandId: 'kfc',
    name: "Domino's Pizza",
    logoText: "DOMINO'S",
    logoDomain: 'dominos.co.in',
    logoUrl: logoFor('dominos.co.in'),
    logoBg: '#006491',
    logoColor: '#ffffff',
    emoji: '🍕',
    category: 'food',
    accent: '#38bdf8',
    couponCode: 'DOMINOS80',
    offerHeadline: '30-Min Hot Cheese Burst Pizza + Garlic Breadsticks + Choco Lava Cake',
    displayUrl: 'dominos.co.in',
    externalUrl: 'https://pizzaonline.dominos.co.in',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Cheese Burst Pizza') =>
      `https://www.zomato.com/${(CITY_PROFILES[city] || CITY_PROFILES.Hyderabad).zomatoSlug}/restaurants?q=${encodeURIComponent("Domino's Pizza")}`,
    creatorFlirtLine:
      'Tumse zyada cheesy sirf Domino’s ka Cheese Burst Pizza hai 🍕 Aaj raat pizza + Choco Lava party karein?',
    guestFlirtLine:
      'Last slice tumhare liye bacha ke rakhungi 🍕 Order Domino’s Cheese Burst + Garlic Bread in 25 mins!',
    tagline: 'Cheese Burst Pizzas, Stuffed Garlic Bread & Choco Lava Cake',
    meme: {
      memeEmoji: '🍕',
      memeBadge: 'GOLMAAL · VASOOLI BHAI VIBE',
      memeTitle: '“Jaldi bol kal subah Panvel nikalna hai... kaunsa Cheese Burst Pizza mangwaun?!” 🍕😂',
      memeQuote: 'Oregano sachets sambhal ke rakhna, wahi asli daulat hai!'
    },
    keywords: ['dominos', 'cheese burst', 'garlic bread', 'choco lava', 'pepproni', 'farmhouse'],
    items: [
      {
        id: 'dom-couple-meal',
        name: 'Medium Farmhouse Cheese Burst Pizza + Stuffed Garlic Bread + 2x Choco Lava Cake',
        searchQuery: 'Dominos Cheese Burst Pizza',
        tag: '30-Min Hot Delivery',
        originalPrice: 649,
        etaMinutes: 25
      }
    ]
  },
  {
    id: 'kfc',
    companionBrandId: 'dominos',
    name: 'KFC & McDonald’s Combos',
    logoText: 'KFC',
    logoDomain: 'online.kfc.co.in',
    logoUrl: logoFor('online.kfc.co.in'),
    logoBg: '#e4002b',
    logoColor: '#ffffff',
    emoji: '🍗',
    category: 'food',
    accent: '#f43f5e',
    couponCode: 'KFCDATE',
    offerHeadline: 'Hot & Crispy Zinger Burger Bucket & Peri-Peri Strips for Movie Night',
    displayUrl: 'online.kfc.co.in',
    externalUrl: 'https://online.kfc.co.in',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'KFC Zinger Bucket') =>
      `https://www.swiggy.com/search?query=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Late night movie aur crispy KFC Zinger Bucket 🍗 Chalo saath mein binge-eat karte hain!',
    guestFlirtLine:
      'Crispy Chicken Popcorn aur Fries bina share kiye mat khana! 🍟 Order KFC in 20 mins.',
    tagline: 'Crispy Chicken Buckets, Zinger Burgers & Loaded Fries',
    meme: {
      memeEmoji: '🍗',
      memeBadge: 'GANGS OF WASSEYPUR VIBE',
      memeTitle: '“Tumse na ho payega... akele poora KFC Bucket khatam karna!” 😂🍗',
      memeQuote: 'Crispy cravings ka 20-minute solution!'
    },
    keywords: ['kfc', 'mcdonalds', 'zinger', 'chicken bucket', 'popcorn chicken', 'wings', 'nuggets'],
    items: [
      {
        id: 'kfc-couple-bucket',
        name: '2x Hot Zinger Burgers + Medium Chicken Popcorn + 2x Peri-Peri Fries',
        searchQuery: 'KFC Zinger Burger Bucket',
        tag: 'Movie Night Bucket',
        originalPrice: 599,
        etaMinutes: 22
      }
    ]
  },
  {
    id: 'baskin_robbins',
    companionBrandId: 'swiggy',
    name: 'Baskin Robbins & Naturals',
    logoText: 'BR 31',
    logoDomain: 'baskinrobbinsindia.com',
    logoUrl: logoFor('baskinrobbinsindia.com'),
    logoBg: '#ec4899',
    logoColor: '#ffffff',
    emoji: '🍨',
    category: 'food',
    accent: '#f472b6',
    couponCode: 'SWEET31',
    offerHeadline: 'Mississippi Mud & Tender Coconut Ice Cream Tubs Delivered till 3 AM',
    displayUrl: 'baskinrobbinsindia.com',
    externalUrl: 'https://baskinrobbinsindia.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Baskin Robbins Mississippi Mud') =>
      `https://www.swiggy.com/search?query=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Raat ke 1 baje meetha khane ka mann hai? 🍨 Baskin Robbins Mississippi Mud Sundae abhi bheju?',
    guestFlirtLine:
      'Gussa thanda karne ke liye Ice Cream Sundae se behtar kuch nahi! 🍨♥',
    tagline: 'Late-Night Ice Cream Sundaes, Belgian Waffles & Gelato',
    meme: {
      memeEmoji: '🍨',
      memeBadge: 'CHUP CHUP KE · BANDYA VIBE',
      memeTitle: '“Meri taraf se haan hai... bas do scoop Belgian Chocolate Ice Cream khila do!” 😋',
      memeQuote: 'Thandi raat mein ice cream date = 100% romance.'
    },
    keywords: ['baskin', 'naturals', 'sundae', 'gelato', 'scoop', 'fudge', 'brownie'],
    items: [
      {
        id: 'br-mud-sundae',
        name: 'Mississippi Mud Hot Fudge Sundae + Cotton Candy Tub',
        searchQuery: 'Baskin Robbins Mississippi Mud',
        tag: 'Sweet Tooth Favourite',
        originalPrice: 420,
        etaMinutes: 18
      }
    ]
  },
  {
    id: 'eazydiner',
    companionBrandId: 'district',
    name: 'EazyDiner Table Booking',
    logoText: 'EazyDiner',
    logoDomain: 'eazydiner.com',
    logoUrl: logoFor('eazydiner.com'),
    logoBg: '#f97316',
    logoColor: '#ffffff',
    emoji: '🍽️',
    category: 'food',
    accent: '#fb923c',
    couponCode: 'EAZYCOUPLE25',
    offerHeadline: 'Guaranteed Instant Table Reservations + Up to 50% OFF at 5-Star Rooftops',
    displayUrl: 'eazydiner.com',
    externalUrl: 'https://www.eazydiner.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Romantic Rooftop') =>
      `https://www.eazydiner.com/${city.toLowerCase()}?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Iss weekend candlelight rooftop table confirm karein? 🍽️ EazyDiner se flat 25–50% bill discount ke saath instant table book karo!',
    guestFlirtLine:
      'VIP couple entry + complimentary dessert at top rooftop restaurants via EazyDiner 🥂',
    tagline: 'Instant Location-Based Table Booking & VIP Bill Discounts Across India',
    meme: {
      memeEmoji: '🥂',
      memeBadge: 'PHIR HERA PHERI · AMIRI VIBE',
      memeTitle: '“5-Star Rooftop pe Candlelight Table... aur EazyDiner se 50% OFF! Paisa hi paisa hoga!” 🥂😂',
      memeQuote: 'Book a real table in your city in 15 seconds — free in this version!'
    },
    keywords: ['eazydiner', 'table booking', 'rooftop', 'candlelight', 'buffet', 'fine dining', 'reservation'],
    items: [
      {
        id: 'ezy-rooftop-vip',
        name: 'VIP Couple Candlelight Table Reservation + Complimentary Mocktails (25% Bill OFF)',
        searchQuery: 'Rooftop Romantic Dining',
        tag: 'Instant Table Pass',
        originalPrice: 999,
        etaMinutes: 15
      }
    ]
  },

  // ================= 4. BEAUTY, FRAGRANCE & INTIMATE WELLNESS (NYKAA, TIRA, PURPLLE, BELLA VITA, DUREX, BOLD CARE, MAMAEARTH) =================
  {
    id: 'nykaa',
    companionBrandId: 'tira',
    name: 'Nykaa',
    logoText: 'NYKAA',
    logoDomain: 'nykaa.com',
    logoUrl: logoFor('nykaa.com'),
    logoBg: '#fc2779',
    logoColor: '#ffffff',
    emoji: '💄',
    category: 'beauty',
    accent: '#fc2779',
    couponCode: 'NYKAAGLOW',
    offerHeadline: 'Luxury Fragrances, Lip Gloss & Date-Night Beauty Gifts on Nykaa',
    displayUrl: 'nykaa.com',
    externalUrl: 'https://www.nykaa.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Luxury Perfume Gift Set') =>
      `https://www.nykaa.com/search/result/?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Date night se pehle unko surprise gift do 💄 Nykaa Luxury Perfume & Cherry Lip Oil Gift Set chupke se order karo!',
    guestFlirtLine:
      'Agli date pe sabse khoobsurat dikhna hai ✨ Grab your Nykaa Date-Night Glow & Fragrance Kit!',
    tagline: 'Luxury Date-Night Perfumes, Lip Gloss & Couple Self-Care',
    meme: {
      memeEmoji: '💋',
      memeBadge: 'OM SHANTI OM · DEEPIKA VIBE',
      memeTitle: '“Ek chutki sindoor nahi... ek Nykaa Parcel ki keemat tum kya jaano Ramesh Babu!” 💄😍',
      memeQuote: 'Send her a Nykaa Lip Gloss + Perfume set and watch her melt instantly!'
    },
    keywords: ['nykaa', 'perfume', 'lipstick', 'gloss', 'makeup', 'glow', 'beauty', 'skincare', 'fragrance', 'kajal'],
    items: [
      {
        id: 'nyk-date-perfume',
        name: 'Eau De Parfum Date-Night Duo + Cherry Lip Glow Oil',
        searchQuery: 'Eau De Parfum Gift Set',
        tag: 'Couple Gift Favourite',
        originalPrice: 1199,
        etaMinutes: 45
      }
    ]
  },
  {
    id: 'tira',
    companionBrandId: 'nykaa',
    name: 'Tira Beauty (Reliance)',
    logoText: 'TIRA',
    logoDomain: 'tirabeauty.com',
    logoUrl: logoFor('tirabeauty.com'),
    logoBg: '#e11d48',
    logoColor: '#ffffff',
    emoji: '✨',
    category: 'beauty',
    accent: '#fb7185',
    couponCode: 'TIRALUXE',
    offerHeadline: 'Flat ₹500 OFF on Designer Perfumes, Korean Skincare & Luxe Beauty on Tira',
    displayUrl: 'tirabeauty.com',
    externalUrl: 'https://www.tirabeauty.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Korean Glass Skin Kit Perfume') =>
      `https://www.tirabeauty.com/products/?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Korean Glass-Skin Kit ya Designer Fragrance gift karke unka din bana do ✨ Shop Tira Beauty!',
    guestFlirtLine:
      'Date-night glow up with Tira Beauty’s luxury skincare & fragrances 💖',
    tagline: 'Curated Global & Korean Beauty, Luxury Scents & Gift Boxes',
    meme: {
      memeEmoji: '✨',
      memeBadge: 'BOLLYWOOD GLOW-UP VIBE',
      memeTitle: '“Chaand bhi sharma jaye jab Tira ka Korean Glow-Up chehre pe aaye!” ✨🌙',
      memeQuote: '100% authentic luxury beauty with free surprise samples!'
    },
    keywords: ['tira', 'korean skincare', 'serum', 'tint', 'blush', 'luxury perfume'],
    items: [
      {
        id: 'tira-glow-set',
        name: 'Korean Glass-Skin Hydration Set + Velvet Lip Tint',
        searchQuery: 'Korean Skincare Set',
        tag: 'Tira Exclusive',
        originalPrice: 1399,
        etaMinutes: 120
      }
    ]
  },
  {
    id: 'bella_vita',
    companionBrandId: 'nykaa',
    name: 'Bella Vita Luxury',
    logoText: 'BELLA VITA',
    logoDomain: 'bellavitaorganic.com',
    logoUrl: logoFor('bellavitaorganic.com'),
    logoBg: '#111827',
    logoColor: '#f59e0b',
    emoji: '🖤',
    category: 'beauty',
    accent: '#fbbf24',
    couponCode: 'BELLADATE',
    offerHeadline: 'Bestselling Date-Night Unisex Luxury Perfume Gift Box (4x20ml)',
    displayUrl: 'bellavitaorganic.com',
    externalUrl: 'https://bellavitaorganic.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Date Woman Klub Man Perfume Set') =>
      `https://bellavitaorganic.com/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Paas aane ka bahana chahiye? 🖤 Bella Vita DATE & KLUB Man Luxury Perfume Gift Box try karo!',
    guestFlirtLine:
      'Aisi khushboo jo gale lagne ke baad bhi yaad rahe 🖤 Bella Vita Luxury Perfume Set!',
    tagline: 'Long-Lasting Date Night & AfterDark Luxury Perfumes',
    meme: {
      memeEmoji: '🔥',
      memeBadge: 'BOLLYWOOD ROMANCE VIBE',
      memeTitle: '“Khushboo aisi lagao ki hug karne ke baad woh jaane hi na de!” 🖤✨',
      memeQuote: 'India’s #1 trending couple perfume gift box under ₹599!'
    },
    keywords: ['bella vita', 'date perfume', 'cologne', 'scent', 'khushboo', 'attar', 'deo'],
    items: [
      {
        id: 'bv-couple-perfume',
        name: 'Bella Vita Luxury Couple Perfume Gift Set (DATE Woman + KLUB Man + CEO + SENORITA)',
        searchQuery: 'Luxury Perfume Gift Set',
        tag: '#1 Couple Scent',
        originalPrice: 549,
        etaMinutes: 60
      }
    ]
  },
  {
    id: 'purplle',
    companionBrandId: 'mamaearth',
    name: 'Purplle Beauty',
    logoText: 'purplle',
    logoDomain: 'purplle.com',
    logoUrl: logoFor('purplle.com'),
    logoBg: '#7e22ce',
    logoColor: '#ffffff',
    emoji: '💜',
    category: 'beauty',
    accent: '#c084fc',
    couponCode: 'PURPLLEBOGO',
    offerHeadline: 'Buy 1 Get 1 Free on Sheet Masks, Body Mists & Date Makeup on Purplle',
    displayUrl: 'purplle.com',
    externalUrl: 'https://www.purplle.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Body Mist Sheet Mask Combo') =>
      `https://www.purplle.com/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Self-care hamper for your queen 💜 Purplle se Vanilla Body Mist aur Sheet Mask Combo bhejo!',
    guestFlirtLine:
      'Pamper night before date night 💜 Buy 1 Get 1 Free on Purplle Beauty!',
    tagline: 'Pocket-Friendly Body Mists, Sheet Masks & Glam Kits',
    meme: {
      memeEmoji: '💆‍♀️',
      memeBadge: 'SELF-CARE QUEEN VIBE',
      memeTitle: '“Pehle Sheet Mask lagao, phir पिया जी से वीडियो कॉल पे बात करो!” 💜😂',
      memeQuote: 'BOGO deals on everyday beauty essentials!'
    },
    keywords: ['purplle', 'body mist', 'sheet mask', 'nail polish', 'eyeliner'],
    items: [
      {
        id: 'prp-mist-combo',
        name: 'French Vanilla Body Mist + 5x Hydrating Sheet Masks Pamper Kit',
        searchQuery: 'Vanilla Body Mist Sheet Mask',
        tag: 'Buy 1 Get 1 Free',
        originalPrice: 499,
        etaMinutes: 120
      }
    ]
  },
  {
    id: 'mamaearth',
    companionBrandId: 'purplle',
    name: 'Mamaearth',
    logoText: 'mamaearth',
    logoDomain: 'mamaearth.in',
    logoUrl: logoFor('mamaearth.in'),
    logoBg: '#16a34a',
    logoColor: '#ffffff',
    emoji: '🌿',
    category: 'beauty',
    accent: '#4ade80',
    couponCode: 'MAMA25',
    offerHeadline: 'Ubtan Date-Glow Facial Kit & Vitamin C Skincare Combos',
    displayUrl: 'mamaearth.in',
    externalUrl: 'https://mamaearth.in',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Ubtan Glow Kit') =>
      `https://mamaearth.in/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Unki natural smile aur glow ke liye Mamaearth Ubtan & Rose Care Hamper 🌿♥',
    guestFlirtLine:
      'Shadi-wali glow har date pe! 🌿 Explore Mamaearth Ubtan & Vitamin C Kits.',
    tagline: 'Toxin-Free Ubtan Glow Kits, Lip Balms & Couple Grooming',
    meme: {
      memeEmoji: '🌿',
      memeBadge: 'DESI GLOW VIBE',
      memeTitle: '“Itna glow mat karo jaan, bijli ka bill bach jayega!” ✨😂',
      memeQuote: 'Natural Ubtan & Rose water skincare delivered fast.'
    },
    keywords: ['mamaearth', 'ubtan', 'face wash', 'vitamin c', 'lip balm', 'natural'],
    items: [
      {
        id: 'mme-ubtan-kit',
        name: 'Ubtan Bridal-Glow Facial Kit + Cherry Tinted 100% Natural Lip Balm',
        searchQuery: 'Ubtan Facial Kit',
        tag: 'Instant Date Glow',
        originalPrice: 599,
        etaMinutes: 90
      }
    ]
  },
  {
    id: 'durex_india',
    companionBrandId: 'bold_care',
    name: 'Durex India Official',
    logoText: 'durex',
    logoDomain: 'durexindia.com',
    logoUrl: logoFor('durexindia.com'),
    logoBg: '#0284c7',
    logoColor: '#ffffff',
    emoji: '🔥',
    category: 'beauty',
    accent: '#38bdf8',
    couponCode: 'AFTERDARK20',
    offerHeadline: '100% Discreet Unmarked Box · Durex Air, Invisible & Massage Gels',
    displayUrl: 'durexindia.com',
    externalUrl: 'https://www.durexindia.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Durex Invisible Ultra Thin') =>
      `https://www.durexindia.com/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'After-Dark baatein ab real-life nazdeekiyon mein 🔥 Durex Invisible & Sensual Massage Gel 100% plain discreet box mein mangwao!',
    guestFlirtLine:
      'Zero compromise on closeness & safety 💙 Order Durex India Official 100% Privately!',
    tagline: 'Ultra-Thin Protection, Sensual Massage 2-in-1 Gels & Couple Intimacy Packs',
    meme: {
      memeEmoji: '🤫',
      memeBadge: 'FAMILY MAN · SRIKANT TIWARI VIBE',
      memeTitle: '“Mission Top Secret: Plain brown dabba aayega, kisi ko kanon-kaan khabar nahi hogi!” 🕵️‍♂️🔥',
      memeQuote: '100% private billing & unmarked packaging for couples.'
    },
    keywords: ['durex', 'invisible', 'air', 'climax', 'massage gel', 'pleasure', 'safe'],
    items: [
      {
        id: 'drx-invisible-combo',
        name: 'Durex Invisible Super Ultra-Thin (10s) + Aloe Vera 2-in-1 Sensual Massage Gel',
        searchQuery: 'Durex Invisible Massage Gel',
        tag: '100% Discreet Box',
        originalPrice: 749,
        etaMinutes: 15
      }
    ]
  },
  {
    id: 'bold_care',
    companionBrandId: 'durex_india',
    name: 'Bold Care (Ranveer Singh)',
    logoText: 'BOLD CARE',
    logoDomain: 'boldcare.in',
    logoUrl: logoFor('boldcare.in'),
    logoBg: '#18181b',
    logoColor: '#facc15',
    emoji: '⚡',
    category: 'beauty',
    accent: '#facc15',
    couponCode: 'BOLDFOREVER',
    offerHeadline: 'Doctor-Backed Couple Intimate Wellness & Stamina Range in Plain Packaging',
    displayUrl: 'boldcare.in',
    externalUrl: 'https://www.boldcare.in',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Couple Wellness') =>
      `https://www.boldcare.in/collections/all`,
    creatorFlirtLine:
      'Raat lambi aur energy double ⚡ Bold Care Intimate Wellness Kit 100% discreetly order karo!',
    guestFlirtLine:
      'Modern couple wellness with zero awkwardness ✨ Explore Bold Care Official.',
    tagline: 'Modern Couple Intimacy, Lubegels & Confidence Boosters',
    meme: {
      memeEmoji: '⚡',
      memeBadge: 'RANVEER SINGH × JOHNNY SINS AD VIBE',
      memeTitle: '“Kamaal hai... Johnny bhai aur Ranveer bhai dono ne bola hai toh asli hi hoga!” 😂⚡',
      memeQuote: 'India’s most viral couple wellness brand — delivered privately.'
    },
    keywords: ['bold care', 'boldcare', 'wellness', 'stamina', 'intimate wash', 'forever'],
    items: [
      {
        id: 'bld-couple-pack',
        name: 'Bold Care Ultra-Thin Combo + Water-Based Natural Intimate Gel',
        searchQuery: 'Bold Care Combo',
        tag: 'Discreet Express',
        originalPrice: 699,
        etaMinutes: 20
      }
    ]
  },

  // ================= 5. STAYS, TRAVEL, CABS & ENTERTAINMENT (OYO, MAKEMYTRIP, GOIBIBO, AIRBNB, UBER, OLA, RAPIDO, BOOKMYSHOW, DISTRICT, NETFLIX, SPOTIFY) =================
  {
    id: 'oyo',
    companionBrandId: 'makemytrip',
    name: 'OYO Townhouse & Stays',
    logoText: 'OYO',
    logoDomain: 'oyorooms.com',
    logoUrl: logoFor('oyorooms.com'),
    logoBg: '#ee2e24',
    logoColor: '#ffffff',
    emoji: '🏨',
    category: 'stays',
    accent: '#ff4757',
    couponCode: 'OYOCOUPLE40',
    offerHeadline: '100% Couple-Friendly Verified Stays · Local ID Accepted · Up to 45% OFF',
    displayUrl: 'oyorooms.com',
    externalUrl: 'https://www.oyorooms.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Townhouse') => {
      const profile = CITY_PROFILES[city] || CITY_PROFILES.Hyderabad;
      return `https://www.oyorooms.com/${profile.oyoSlug}/?search=${encodeURIComponent(query + ' ' + city)}`;
    },
    creatorFlirtLine:
      'Phone pe kab tak “miss you” bologe? 🔥 Apne shaher mein 100% Couple-Friendly OYO Townhouse Suite dekho — Local ID accepted & 100% private!',
    guestFlirtLine:
      'Koi disturb karne wala nahi, sirf hum dono 🌙 Explore verified Couple-Friendly OYO Townhouse & Boutique Stays nearby!',
    tagline: '100% Couple-Friendly Private Stays · Local ID Accepted · Instant Check-In',
    meme: {
      memeEmoji: '🏨',
      memeBadge: 'MIRZAPUR · MUNNA BHAIYA VIBE',
      memeTitle: '“Receptionist kuch nahi poochega... Local ID dikhao aur seedha Couple Suite mein entry lo!” 😎🔑',
      memeQuote: 'Verified OYO Townhouse Oak properties with zero moral policing.'
    },
    keywords: ['oyo', 'room', 'rooms', 'hotel', 'hotels', 'stay', 'stays', 'townhouse', 'cuddle', 'check in', 'checkin', 'suite'],
    items: [
      {
        id: 'oyo-townhouse-suite',
        name: 'Super OYO Townhouse Oak — Verified Couple Deluxe Suite (Local ID OK)',
        searchQuery: 'OYO Townhouse Couple Friendly',
        tag: 'Couple Friendly · 4.7 ★',
        originalPrice: 2299,
        etaMinutes: 15
      },
      {
        id: 'oyo-collection-studio',
        name: 'Collection O Premium — Romantic Balcony Studio & Private Check-In',
        searchQuery: 'Collection O Couple Friendly',
        tag: 'Private Check-In',
        originalPrice: 2699,
        etaMinutes: 15
      }
    ]
  },
  {
    id: 'makemytrip',
    companionBrandId: 'oyo',
    name: 'MakeMyTrip Couple Stays',
    logoText: 'MMT',
    logoDomain: 'makemytrip.com',
    logoUrl: logoFor('makemytrip.com'),
    logoBg: '#dc2626',
    logoColor: '#ffffff',
    emoji: '✈️',
    category: 'stays',
    accent: '#f87171',
    couponCode: 'MMTLOVE',
    offerHeadline: 'Luxury 5-Star Staycations, Couple Villas & Weekend Getaways on MakeMyTrip',
    displayUrl: 'makemytrip.com',
    externalUrl: 'https://www.makemytrip.com/hotels/',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Luxury Couple Resort') =>
      `https://www.makemytrip.com/hotels/`,
    creatorFlirtLine:
      'Chalo is weekend shaher ke shor se door ek 5-Star Staycation pe चलते हैं ✈️ MakeMyTrip Couple Deals dekho!',
    guestFlirtLine:
      'Poolside breakfast aur luxury room view 🏖️ Plan our next staycation on MakeMyTrip!',
    tagline: '5-Star Couple Staycations, Resorts & Weekend Getaway Packages',
    meme: {
      memeEmoji: '🧳',
      memeBadge: 'ZINDAGI NA MILEGI DOBARA VIBE',
      memeTitle: '“Bag pack karo Jaan... iss weekend hum dono gayab hone wale hain!” ✈️🌅',
      memeQuote: 'Couple-friendly luxury hotels & resorts with free cancellation.'
    },
    keywords: ['makemytrip', 'mmt', 'resort', 'staycation', 'vacation', 'trip', 'flight', 'holiday', 'weekend getaway'],
    items: [
      {
        id: 'mmt-staycation',
        name: '5-Star Luxury Couple Staycation + Buffet Breakfast + Late Checkout',
        searchQuery: '5 Star Couple Staycation',
        tag: 'Weekend Escape',
        originalPrice: 4499,
        etaMinutes: 10
      }
    ]
  },
  {
    id: 'goibibo',
    companionBrandId: 'airbnb',
    name: 'Goibibo goStays',
    logoText: 'goibibo',
    logoDomain: 'goibibo.com',
    logoUrl: logoFor('goibibo.com'),
    logoBg: '#f97316',
    logoColor: '#ffffff',
    emoji: '🛎️',
    category: 'stays',
    accent: '#fb923c',
    couponCode: 'GOCOUPLE',
    offerHeadline: 'Hourly & Overnight Couple-Friendly Hotels with goCash Discounts',
    displayUrl: 'goibibo.com',
    externalUrl: 'https://www.goibibo.com/hotels/',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Couple Friendly Hotels') =>
      `https://www.goibibo.com/hotels/`,
    creatorFlirtLine:
      '3, 6 ya 12 ghante ka quick romantic break? 🛎️ Goibibo Couple-Friendly Stays pe instant booking!',
    guestFlirtLine:
      'Verified couple hotels with smooth check-in on Goibibo 🧡',
    tagline: 'Flexible Hourly & Overnight Couple Hotels Across India',
    meme: {
      memeEmoji: '🛎️',
      memeBadge: 'DE DANA DAN · HOTEL VIBE',
      memeTitle: '“Sirf 4 ghante milna hai? Goibibo pe Hourly Couple Stay book kar lo, full paisa vasool!” 😂',
      memeQuote: 'Smart hourly stays for busy couples.'
    },
    keywords: ['goibibo', 'hourly hotel', 'gostays', 'lodge', 'overnight'],
    items: [
      {
        id: 'goi-hourly-stay',
        name: '6-Hour Flexible Couple Boutique Room (Local ID Accepted)',
        searchQuery: 'Couple Friendly Hotel',
        tag: 'Flexible Check-In',
        originalPrice: 1499,
        etaMinutes: 10
      }
    ]
  },
  {
    id: 'airbnb',
    companionBrandId: 'goibibo',
    name: 'Airbnb Private Villas',
    logoText: 'airbnb',
    logoDomain: 'airbnb.co.in',
    logoUrl: logoFor('airbnb.co.in'),
    logoBg: '#ff385c',
    logoColor: '#ffffff',
    emoji: '🏡',
    category: 'stays',
    accent: '#ff385c',
    couponCode: 'AIRBNBCOZY',
    offerHeadline: 'Aesthetic Private Rooftop Penthouses, Farmhouses & Cozy Studios on Airbnb',
    displayUrl: 'airbnb.co.in',
    externalUrl: 'https://www.airbnb.co.in',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Penthouse') =>
      `https://www.airbnb.co.in/s/${encodeURIComponent(city)}--India/homes`,
    creatorFlirtLine:
      'Apna khud ka private terrace penthouse jahan hum saath mein pasta banayein 🏡 Airbnb Homes in your city!',
    guestFlirtLine:
      'Fairy lights, balcony view aur zero disturbance 🏡 Check out aesthetic Airbnbs nearby!',
    tagline: 'Private Couple Penthouses, Self-Check-In Studios & Pool Villas',
    meme: {
      memeEmoji: '🏡',
      memeBadge: 'YEH JAWAANI HAI DEEWANI VIBE',
      memeTitle: '“Main udna chahta hoon, daudna chahta hoon... bas ek cute Airbnb mein tumhare saath rukna chahta hoon!” 🏡✨',
      memeQuote: 'Self-lockbox check-in — complete privacy for couples.'
    },
    keywords: ['airbnb', 'villa', 'penthouse', 'farmhouse', 'studio apartment', 'homestay'],
    items: [
      {
        id: 'abnb-penthouse',
        name: 'Private Fairy-Lit Terrace Penthouse Studio with Projector & Kitchenette',
        searchQuery: 'Penthouse Studio',
        tag: 'Self Check-In',
        originalPrice: 3299,
        etaMinutes: 15
      }
    ]
  },
  {
    id: 'uber',
    companionBrandId: 'ola',
    name: 'Uber Premier & Rentals',
    logoText: 'Uber',
    logoDomain: 'uber.com',
    logoUrl: logoFor('uber.com'),
    logoBg: '#000000',
    logoColor: '#ffffff',
    emoji: '🚖',
    category: 'stays',
    accent: '#38bdf8',
    couponCode: 'UBERDATE50',
    offerHeadline: 'Send an Uber Premier Ride to Pick Up Your Partner for Tonight’s Date',
    displayUrl: 'm.uber.com',
    externalUrl: 'https://m.uber.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Uber Ride') => `https://m.uber.com`,
    creatorFlirtLine:
      'Tayyar ho jao jaan, tumhe pick karne ke liye Uber Premier bhej raha hoon 🚖♥',
    guestFlirtLine:
      'Raat ko safe aur comfy ghar pahuchne ke liye Uber Premier book kar lo 🚖',
    tagline: 'Doorstep Date Pickup, Late-Night Safe Rides & Hourly Rentals',
    meme: {
      memeEmoji: '🚖',
      memeBadge: 'DDLJ · RAJ & SIMRAN VIBE',
      memeTitle: '“Ja Simran Ja... tere liye train nahi, AC wala Uber Premier book kar diya hai!” 🚖😂',
      memeQuote: 'Chivalry in 2025 = Booking her Uber straight to the cafe!'
    },
    keywords: ['uber', 'cab', 'taxi', 'pickup', 'drop', 'ride', 'car', 'auto', 'traffic'],
    items: [
      {
        id: 'ubr-premier-pickup',
        name: 'Uber Premier Sedan Date-Night Pickup & Drop Pass',
        searchQuery: 'Uber Premier',
        tag: '5-Min Pickup',
        originalPrice: 349,
        etaMinutes: 5
      }
    ]
  },
  {
    id: 'ola',
    companionBrandId: 'uber',
    name: 'Ola Prime & Outstation',
    logoText: 'OLA',
    logoDomain: 'olacabs.com',
    logoUrl: logoFor('olacabs.com'),
    logoBg: '#16a34a',
    logoColor: '#fde047',
    emoji: '🚗',
    category: 'stays',
    accent: '#84cc16',
    couponCode: 'OLALOVE',
    offerHeadline: 'Instant Ola Prime Sedan & Long-Drive Rental Packages',
    displayUrl: 'book.olacabs.com',
    externalUrl: 'https://book.olacabs.com',
    buildCheckoutUrl: () => `https://book.olacabs.com`,
    creatorFlirtLine:
      'Baarish ka mausam aur Ola Rental mein hum dono ki long drive 🚗🌧️ Chalo chalein?',
    guestFlirtLine:
      'Zero driving stress — Ola Prime book karo aur piche baith ke haath pakdo ♥',
    tagline: 'City Rides, Hourly Couple Long-Drive Rentals & Outstation',
    meme: {
      memeEmoji: '🚗',
      memeBadge: 'DHAMAAL · DRIVER VIBE',
      memeTitle: '“Driver bhaiya gaana slow chalao, piche romantic baat chal rahi hai!” 🎶😂',
      memeQuote: 'Instant cab booking for your next meetup.'
    },
    keywords: ['ola', 'long drive', 'outstation', 'sedan', 'cab booking'],
    items: [
      {
        id: 'ola-long-drive',
        name: 'Ola 2-Hour / 20 KM Couple Evening Long-Drive Rental Package',
        searchQuery: 'Ola Rental',
        tag: 'Long Drive Ready',
        originalPrice: 499,
        etaMinutes: 6
      }
    ]
  },
  {
    id: 'rapido',
    companionBrandId: 'uber',
    name: 'Rapido Bike & Cab',
    logoText: 'Rapido',
    logoDomain: 'rapido.bike',
    logoUrl: logoFor('rapido.bike'),
    logoBg: '#facc15',
    logoColor: '#111111',
    emoji: '🛵',
    category: 'stays',
    accent: '#eab308',
    couponCode: 'RAPIDODATE',
    offerHeadline: 'Beat Peak Traffic in 5 Mins to Meet Your Partner Faster via Rapido',
    displayUrl: 'rapido.bike',
    externalUrl: 'https://www.rapido.bike',
    buildCheckoutUrl: () => `https://www.rapido.bike`,
    creatorFlirtLine:
      'Traffic humare beech deewar nahi ban sakta 🛵 Rapido pakad ke 10 minute mein tumhare paas aa raha hoon!',
    guestFlirtLine:
      'Date pe late mat hona! 🛵 Book a quick Rapido Auto or Cab right now.',
    tagline: '3-Min Pickup · Bike Taxi, Auto & Zero-Surge Cabs',
    meme: {
      memeEmoji: '🛵',
      memeBadge: 'DHOOM · ALI BIKE VIBE',
      memeTitle: '“Jab woh bole ‘ghar pe koi nahi hai’... aur tum Rapido Captain ban ke udo!” 🛵💨😂',
      memeQuote: 'Beat Hyderabad, Patna, Bengaluru & Mumbai traffic in minutes!'
    },
    keywords: ['rapido', 'bike', 'scooty', 'late', 'jaldi aao', 'stuck in traffic'],
    items: [
      {
        id: 'rap-express-pass',
        name: 'Rapido Priority Auto / Cab Express Date Pass',
        searchQuery: 'Rapido Cab',
        tag: '3-Min Arrival',
        originalPrice: 179,
        etaMinutes: 3
      }
    ]
  },
  {
    id: 'bookmyshow',
    companionBrandId: 'district',
    name: 'BookMyShow Recliners',
    logoText: 'BMS',
    logoDomain: 'in.bookmyshow.com',
    logoUrl: logoFor('in.bookmyshow.com'),
    logoBg: '#e11d48',
    logoColor: '#ffffff',
    emoji: '🎬',
    category: 'stays',
    accent: '#f43f5e',
    couponCode: 'BMSCOUPLE',
    offerHeadline: 'Corner Recliner Seats, PVR Insignia & Live Stand-Up Comedy Tickets',
    displayUrl: 'in.bookmyshow.com',
    externalUrl: 'https://in.bookmyshow.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Movies') =>
      `https://in.bookmyshow.com/explore/home/${city.toLowerCase()}`,
    creatorFlirtLine:
      'Corner recliner seats + Caramel Popcorn 🍿 BookMyShow pe aaj raat ka last show book karein?',
    guestFlirtLine:
      'Movie toh bas bahana hai, अंधेरे mein haath pakadna asli plan hai 😉🎬 Book on BookMyShow!',
    tagline: 'Corner Couple Recliners, IMAX Movies & Stand-Up Comedy Nights',
    meme: {
      memeEmoji: '🍿',
      memeBadge: 'CORNER SEAT COUPLE VIBE',
      memeTitle: '“Intermission tak toh pata hi nahi chala screen pe kaunsi movie chal rahi thi!” 🍿😏',
      memeQuote: 'Book last-row luxury recliners in your city!'
    },
    keywords: ['bookmyshow', 'movie', 'cinema', 'pvr', 'inox', 'recliner', 'tickets', 'show', 'popcorn', 'concert'],
    items: [
      {
        id: 'bms-recliner-duo',
        name: '2x Last-Row Luxury Couple Recliner Seats + Large Caramel Popcorn Tub',
        searchQuery: 'PVR Recliner Movies',
        tag: 'Corner Seats',
        originalPrice: 990,
        etaMinutes: 5
      }
    ]
  },
  {
    id: 'district',
    companionBrandId: 'bookmyshow',
    name: 'District by Zomato',
    logoText: 'DISTRICT',
    logoDomain: 'district.in',
    logoUrl: logoFor('district.in'),
    logoBg: '#6d28d9',
    logoColor: '#ffffff',
    emoji: '🎟️',
    category: 'stays',
    accent: '#a78bfa',
    couponCode: 'DISTRICTDATE',
    offerHeadline: 'Trending Concerts, Candlelight Gigs, Dining & Movies on District by Zomato',
    displayUrl: 'district.in',
    externalUrl: 'https://www.district.in',
    buildCheckoutUrl: () => `https://www.district.in`,
    creatorFlirtLine:
      'Arijit / Sufi Live Night ya VIP Dining Table? 🎟️ District by Zomato pe is weekend ka scene set karein!',
    guestFlirtLine:
      'Discover the hottest concerts, gigs & romantic dining in your city on District ✨',
    tagline: 'Live Concerts, Sufi Nights, Comedy & Curated Dining',
    meme: {
      memeEmoji: '🎸',
      memeBadge: 'ROCKSTAR · JORDAN VIBE',
      memeTitle: '“Live Sufi Concert mein tumhara haath pakad ke gaana... bas yahi dream date hai!” 🎸❤️',
      memeQuote: 'One app for dining, movies & live couple experiences.'
    },
    keywords: ['district', 'concert', 'gig', 'sufi night', 'standup', 'events', 'party', 'club'],
    items: [
      {
        id: 'dst-sufi-pass',
        name: 'Couple VIP Pass: Live Acoustic / Sufi Night & Rooftop Dining',
        searchQuery: 'Live Music Dining',
        tag: 'Trending Experience',
        originalPrice: 1499,
        etaMinutes: 5
      }
    ]
  },
  {
    id: 'netflix',
    companionBrandId: 'spotify',
    name: 'Netflix & Chill Pass',
    logoText: 'NETFLIX',
    logoDomain: 'netflix.com',
    logoUrl: logoFor('netflix.com'),
    logoBg: '#000000',
    logoColor: '#e50914',
    emoji: '📺',
    category: 'stays',
    accent: '#ef4444',
    couponCode: 'CHILL4K',
    offerHeadline: 'Late-Night Couple Watch-Party & Romantic Bollywood / K-Drama Binge',
    displayUrl: 'netflix.com/in',
    externalUrl: 'https://www.netflix.com/in/',
    buildCheckoutUrl: () => `https://www.netflix.com/in/`,
    creatorFlirtLine:
      'Aaj raat “Netflix & Chill” ka asli matlab samjhein? 📺🔥 Ek kambal, tum aur main!',
    guestFlirtLine:
      'K-Drama ya Romantic Thriller? 📺 Start a cozy late-night Netflix Watch Party!',
    tagline: '4K Couple Watch Parties, Romantic Classics & Late-Night Binge',
    meme: {
      memeEmoji: '🛋️',
      memeBadge: 'NETFLIX & CHILL INDIAN VIBE',
      memeTitle: '“45 minute toh sirf yeh decide karne mein nikal gaye ki dekhna kya hai!” 😂📺',
      memeQuote: 'Pair with Domino’s or Blinkit for the ultimate cozy night in.'
    },
    keywords: ['netflix', 'watch', 'series', 'kdrama', 'binge', 'chill', 'episode'],
    items: [
      {
        id: 'nflx-uhd-pass',
        name: 'Netflix 4K Ultra-HD Couple Watch-Party Setup',
        searchQuery: 'Romantic Movies',
        tag: 'Instant Stream',
        originalPrice: 199,
        etaMinutes: 2
      }
    ]
  },
  {
    id: 'spotify',
    companionBrandId: 'netflix',
    name: 'Spotify Couple Blend',
    logoText: 'Spotify',
    logoDomain: 'spotify.com',
    logoUrl: logoFor('spotify.com'),
    logoBg: '#1db954',
    logoColor: '#000000',
    emoji: '🎧',
    category: 'stays',
    accent: '#22c55e',
    couponCode: 'SPOTIFYDUO',
    offerHeadline: 'Spotify Premium Duo · Shared Late-Night Hindi Romantic Jam Session',
    displayUrl: 'open.spotify.com',
    externalUrl: 'https://open.spotify.com/search/Bol%20Do%20Na%20Zara%20Romantic%20Hindi',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Late Night Romantic Hindi Songs') =>
      `https://open.spotify.com/search/${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Ek earphone tumhare kaan mein, ek mere 🎧 Chalo Spotify pe Arijit aur Atif ki late-night playlist sunein!',
    guestFlirtLine:
      'Music hits different at 1:30 AM with you 🎧💚 Open our Romantic Hindi Playlist on Spotify!',
    tagline: 'Spotify Duo, Couple Blend Playlists & Late-Night Romantic Jams',
    meme: {
      memeEmoji: '🎧',
      memeBadge: 'AASHIQUI 2 · ARIJIT VIBE',
      memeTitle: '“Raat ke 1 baje Arijit Singh ke gaane + tumhari chat = सीधा रूह में सुकून!” 🎶❤️',
      memeQuote: 'Click to open a curated Late-Night Hindi Romantic Playlist on Spotify!'
    },
    keywords: ['spotify', 'song', 'songs', 'music', 'playlist', 'arijit', 'gaana', 'listen'],
    items: [
      {
        id: 'spt-duo-jam',
        name: 'Spotify Premium Duo + AfterDark Midnight Hindi Romance Playlist',
        searchQuery: 'Late Night Romantic Hindi Songs',
        tag: '1-Click Listen',
        originalPrice: 149,
        etaMinutes: 1
      }
    ]
  },

  // ================= 6. ROSES, CAKES, CHOCOLATES & EYEWEAR GIFTING (FNP, IGP, CADBURY, LENSKART) =================
  {
    id: 'fnp',
    companionBrandId: 'igp',
    name: 'Ferns N Petals (FNP)',
    logoText: 'FNP',
    logoDomain: 'fnp.com',
    logoUrl: logoFor('fnp.com'),
    logoBg: '#e11d48',
    logoColor: '#ffffff',
    emoji: '🌹',
    category: 'gifts',
    accent: '#fb7185',
    couponCode: 'FNPLOVE15',
    offerHeadline: 'Same-Day & Midnight Red Roses + Truffle Cake Delivery Across India',
    displayUrl: 'fnp.com',
    externalUrl: 'https://www.fnp.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Red Roses Bouquet') =>
      `https://www.fnp.com/search?qs=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Bina bole “I love you” kehna hai? 🌹 Ferns N Petals se ताज़ा Red Roses Bouquet aur Truffle Cake unke address pe surprise bhejo!',
    guestFlirtLine:
      'Thoda pamper hona toh banta hai! 💐 Send a surprise Midnight Rose Bouquet & Ferrero Box via FNP.',
    tagline: 'Express Red Roses, Bouquets & Romantic Midnight Surprises',
    meme: {
      memeEmoji: '🌹',
      memeBadge: 'BOLLYWOOD SHAH RUKH KHAN VIBE',
      memeTitle: '“Bade-bade deshon mein choti-choti baaton pe FNP se Red Roses bhejte rehna chahiye Senorita!” 🌹👐',
      memeQuote: '60-minute express flower & cake delivery in 400+ Indian cities.'
    },
    keywords: ['fnp', 'rose', 'roses', 'gulab', 'flowers', 'bouquet', 'anniversary', 'birthday', 'surprise'],
    items: [
      {
        id: 'fnp-red-roses',
        name: '12 Velvet Red Roses Bouquet + Handwritten Love Card',
        searchQuery: '12 Red Roses Bouquet',
        tag: 'Express 60-Min Delivery',
        originalPrice: 799,
        etaMinutes: 45
      },
      {
        id: 'fnp-rocher-box',
        name: 'Heart-Shaped Red Roses & Ferrero Rocher Luxury Box',
        searchQuery: 'Red Roses Ferrero Rocher Box',
        tag: 'Surprise Gift',
        originalPrice: 1299,
        etaMinutes: 50
      }
    ]
  },
  {
    id: 'igp',
    companionBrandId: 'fnp',
    name: 'IGP Personalized Gifts',
    logoText: 'IGP',
    logoDomain: 'igp.com',
    logoUrl: logoFor('igp.com'),
    logoBg: '#be123c',
    logoColor: '#ffffff',
    emoji: '🎁',
    category: 'gifts',
    accent: '#f43f5e',
    couponCode: 'IGPCOUPLE20',
    offerHeadline: '30-Min Cakes, Personalized Couple LED Lamps & Engraved Keepsakes on IGP',
    displayUrl: 'igp.com',
    externalUrl: 'https://www.igp.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Personalized Couple LED Lamp') =>
      `https://www.igp.com/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Hum dono ke naam aur photo wala Personalized 3D LED Moon Lamp 🎁 IGP se aaj hi order karo!',
    guestFlirtLine:
      'Custom engraved couple gifts & Belgian truffle cakes in 30 mins on IGP 🎂',
    tagline: 'Personalized Photo Lamps, Engraved Jewellery & Express Cakes',
    meme: {
      memeEmoji: '🎂',
      memeBadge: 'WELCOME · ANIL KAPOOR VIBE',
      memeTitle: '“Majnu भाई की पेंटिंग छोड़ो... IGP से हम दोनों की फोटो वाला LED Moon Lamp मंगवाओ!” 🌙😂',
      memeQuote: 'Same-day personalized gifts delivered across India.'
    },
    keywords: ['igp', 'personalized', 'moon lamp', 'photo frame', 'mug', 'truffle cake', 'hamper'],
    items: [
      {
        id: 'igp-moon-lamp',
        name: 'Custom Couple Photo 3D Moon Lamp + Belgian Chocolate Bento Cake',
        searchQuery: 'Personalized Couple Lamp Cake',
        tag: 'Same-Day Gift',
        originalPrice: 999,
        etaMinutes: 60
      }
    ]
  },
  {
    id: 'cadbury_gifting',
    companionBrandId: 'fnp',
    name: 'Cadbury Gifting India',
    logoText: 'Cadbury',
    logoDomain: 'cadburygifting.in',
    logoUrl: logoFor('cadburygifting.in'),
    logoBg: '#4c1d95',
    logoColor: '#fde047',
    emoji: '🍫',
    category: 'gifts',
    accent: '#a855f7',
    couponCode: 'SILKLOVE',
    offerHeadline: 'Personalized Cadbury Dairy Milk Silk Heart Blush Box with Photo & Message',
    displayUrl: 'cadburygifting.in',
    externalUrl: 'https://cadburygifting.in',
    buildCheckoutUrl: () => `https://cadburygifting.in`,
    creatorFlirtLine:
      '“Kuch meetha ho jaye?” 🍫 Cadbury Dairy Milk Silk Heart Blush pe unka naam print karwa ke bhejo!',
    guestFlirtLine:
      'Silk se zyada smooth tumhari baatein hain 💜 Order a custom Cadbury Silk Gift Box!',
    tagline: 'Custom Named Dairy Milk Silk Bars & Velvet Heart Boxes',
    meme: {
      memeEmoji: '🍫',
      memeBadge: 'CADBURY SILK · KISSMISS VIBE',
      memeTitle: '“Kuch meetha ho jaye... par pehle batao Silk ka aakhri tukda kaun khayega?!” 🍫😍',
      memeQuote: 'Official Cadbury Gifting store with custom photo sleeves.'
    },
    keywords: ['cadbury', 'dairy milk', 'chocolate', 'chocolates', 'meetha', 'sweet', 'heart blush'],
    items: [
      {
        id: 'cad-silk-heart',
        name: 'Personalized Tin Box of 4x Cadbury Dairy Milk Silk Heart Blush + Message Card',
        searchQuery: 'Cadbury Silk Heart Blush',
        tag: 'Say It With Silk',
        originalPrice: 650,
        etaMinutes: 45
      }
    ]
  },
  {
    id: 'lenskart',
    companionBrandId: 'myntra',
    name: 'Lenskart Sunglasses',
    logoText: 'LENSKART',
    logoDomain: 'lenskart.com',
    logoUrl: logoFor('lenskart.com'),
    logoBg: '#0f172a',
    logoColor: '#2dd4bf',
    emoji: '🕶️',
    category: 'shopping',
    accent: '#14b8a6',
    couponCode: 'BOGO2GLASSES',
    offerHeadline: 'Buy 1 Get 1 Free for Couples on John Jacobs & Vincent Chase Sunglasses',
    displayUrl: 'lenskart.com',
    externalUrl: 'https://www.lenskart.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Vincent Chase Sunglasses') =>
      `https://www.lenskart.com/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Buy 1 Get 1 Free — ek chashma mera, ek tumhara! 🕶️ Lenskart se matching couple sunglasses lein?',
    guestFlirtLine:
      'Tumhari aankhon pe yeh shades bohot jachenge 🕶️✨ Grab Lenskart BOGO Gold Membership Free!',
    tagline: 'Buy 1 Get 1 Couple Sunglasses & Blue-Cut Computer Glasses',
    meme: {
      memeEmoji: '🕶️',
      memeBadge: 'DABANGG · CHULBUL PANDEY VIBE',
      memeTitle: '“Swagat nahi karoge humara... Lenskart ke Buy-1-Get-1 Couple Shades mein?!” 😎🔥',
      memeQuote: '1 frame for you + 1 frame for your partner at the price of 1!'
    },
    keywords: ['lenskart', 'sunglasses', 'shades', 'chashma', 'glasses', 'spectacles'],
    items: [
      {
        id: 'lns-bogo-shades',
        name: 'Vincent Chase Polarized Couple Sunglasses (Buy 1 Get 1 Free)',
        searchQuery: 'Vincent Chase Polarized Sunglasses',
        tag: 'Couple BOGO Deal',
        originalPrice: 1499,
        etaMinutes: 120
      }
    ]
  },
  {
    id: 'bigbasket',
    companionBrandId: 'jiomart',
    name: 'BigBasket bbnow',
    logoText: 'bbnow',
    logoDomain: 'bigbasket.com',
    logoUrl: logoFor('bigbasket.com'),
    logoBg: '#65a30d',
    logoColor: '#ffffff',
    emoji: '🍓',
    category: 'instant',
    accent: '#84cc16',
    couponCode: 'BBNOW15',
    offerHeadline: '15-Min Fresh Strawberries, Whipped Cream, Exotic Chocolates & Snacks on bbnow',
    displayUrl: 'bigbasket.com',
    externalUrl: 'https://www.bigbasket.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Fresh Strawberries Dark Chocolate') =>
      `https://www.bigbasket.com/ps/?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Fresh Strawberries + Melted Dark Chocolate dip 🍓 BigBasket bbnow se 15 min mein mangwa lein?',
    guestFlirtLine:
      'Exotic fruits, cheese platter & dark chocolate in 15 mins via BigBasket bbnow 🍓',
    tagline: '15-Min Fresh Berries, Gourmet Cheese, Chocolates & Couple Night Essentials',
    meme: {
      memeEmoji: '🍓',
      memeBadge: 'BOLLYWOOD ROMANCE VIBE',
      memeTitle: '“Strawberries aur Chocolate... kyunki har baar Aloo Bhujia se romance nahi hota!” 🍓😂',
      memeQuote: '15-minute express delivery by Tata BigBasket.'
    },
    keywords: ['bigbasket', 'bbnow', 'berries', 'cheese', 'whipped cream', 'fruits', 'grocery'],
    items: [
      {
        id: 'bb-berry-choco',
        name: 'Fresh Mahabaleshwar Strawberries + Lindt 70% Dark Chocolate + Whipped Cream',
        searchQuery: 'Fresh Strawberries Lindt Dark Chocolate',
        tag: '15-Min Romantic Dip',
        originalPrice: 549,
        etaMinutes: 15
      }
    ]
  },
  {
    id: 'jiomart',
    companionBrandId: 'bigbasket',
    name: 'JioMart Express',
    logoText: 'JioMart',
    logoDomain: 'jiomart.com',
    logoUrl: logoFor('jiomart.com'),
    logoBg: '#0284c7',
    logoColor: '#ffffff',
    emoji: '🛍️',
    category: 'instant',
    accent: '#38bdf8',
    couponCode: 'JIOLOVE50',
    offerHeadline: 'Super Saver Combos on Dry Fruits, Chocolates, Cold Drinks & Home Care',
    displayUrl: 'jiomart.com',
    externalUrl: 'https://www.jiomart.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Ferrero Rocher Cold Drink') =>
      `https://www.jiomart.com/search/${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'House-party for two? 🛍️ JioMart se Party Snacks, Mocktail Mixers aur Chocolates mangwa lo!',
    guestFlirtLine:
      'Best discounts on chocolates, snacks & beverages on JioMart 💙',
    tagline: 'Party Mixers, Chocolates & Snack Hampers at Lowest Prices',
    meme: {
      memeEmoji: '🥤',
      memeBadge: 'AMUBANI JIO VIBE',
      memeTitle: '“Data bhi Jio ka, aur raat ke snacks bhi JioMart ke!” 📱😂',
      memeQuote: 'Free home delivery on snacks & chocolates.'
    },
    keywords: ['jiomart', 'jio', 'mixer', 'cold drink', 'coke', 'pepsi', 'namkeen', 'party snacks'],
    items: [
      {
        id: 'jio-party-pack',
        name: 'Couple Movie Night Snack Box: Ferrero + Doritos + Schweppes Ginger Ale',
        searchQuery: 'Ferrero Rocher Doritos',
        tag: 'Zero Delivery Fee',
        originalPrice: 499,
        etaMinutes: 30
      }
    ]
  },
  {
    id: 'boat',
    companionBrandId: 'croma',
    name: 'boAt Lifestyle',
    logoText: 'boAt',
    logoDomain: 'boat-lifestyle.com',
    logoUrl: logoFor('boat-lifestyle.com'),
    logoBg: '#dc2626',
    logoColor: '#ffffff',
    emoji: '🎧',
    category: 'shopping',
    accent: '#ef4444',
    couponCode: 'BOATCOUPLE',
    offerHeadline: 'ANC TWS Earbuds & Smartwatches for Late-Night Couple Calls',
    displayUrl: 'boat-lifestyle.com',
    externalUrl: 'https://www.boat-lifestyle.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'boAt Airdopes ANC') =>
      `https://www.boat-lifestyle.com/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Raat bhar bina disturbance tumhari aawaz sunni hai 🎧 boAt ANC Earbuds order kar lein?',
    guestFlirtLine:
      '3 AM whisper calls sound crystal clear on boAt Airdopes 🎧❤️',
    tagline: 'Noise-Cancelling Earbuds, Couple Smartwatches & Bluetooth Speakers',
    meme: {
      memeEmoji: '🎧',
      memeBadge: 'SHARK TANK · AMAN GUPTA VIBE',
      memeTitle: '“Haan bhai... hum boAt ke Earbuds bhi bana lenge taaki tum dono raat ke 3 baje tak fusfusa sako!” 🎧🦈😂',
      memeQuote: '50-hour battery life for endless couple calls!'
    },
    keywords: ['boat', 'airdopes', 'earbuds', 'speaker', 'bluetooth', 'call', 'voice'],
    items: [
      {
        id: 'boat-airdopes-anc',
        name: 'boAt Airdopes ANC True Wireless Earbuds (Crystal Clear 3 AM Call Mic)',
        searchQuery: 'boAt Airdopes ANC',
        tag: 'Late-Night Call Pro',
        originalPrice: 1299,
        etaMinutes: 90
      }
    ]
  },
  {
    id: 'croma',
    companionBrandId: 'boat',
    name: 'Croma Tata Electronics',
    logoText: 'croma',
    logoDomain: 'croma.com',
    logoUrl: logoFor('croma.com'),
    logoBg: '#0d9488',
    logoColor: '#ffffff',
    emoji: '📱',
    category: 'shopping',
    accent: '#2dd4bf',
    couponCode: 'CROMAGIFT',
    offerHeadline: 'Same-Day Express Gadget Delivery · Hair Stylers, Projectors & Apple Gear',
    displayUrl: 'croma.com',
    externalUrl: 'https://www.croma.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Mini Projector Hair Styler') =>
      `https://www.croma.com/searchB?q=${encodeURIComponent(query)}%3Arelevance`,
    creatorFlirtLine:
      'Bedroom ko private cinema hall banayein? 📱 Croma se Mini Smart Projector ya Hair Styler mangwao!',
    guestFlirtLine:
      'Tech gifts that actually slap ✨ Shop Croma Tata Official with Express Zip Delivery.',
    tagline: 'Portable Movie Projectors, Hair Stylers & Premium Tech Gifts',
    meme: {
      memeEmoji: '📽️',
      memeBadge: 'TECH BOYFRIEND VIBE',
      memeTitle: '“Jab woh bole ‘theatre jaane ka mann nahi’... aur tum deewar pe Projector chala do!” 📽️😎',
      memeQuote: 'Backed by Tata trust with instant store pickup or delivery.'
    },
    keywords: ['croma', 'projector', 'dyson', 'straightener', 'curler', 'ipad', 'powerbank'],
    items: [
      {
        id: 'crm-mini-projector',
        name: 'Portable HD Smart Bedroom Cinema Projector + Bluetooth Speaker',
        searchQuery: 'Portable Smart Projector',
        tag: 'Cozy Movie Wall',
        originalPrice: 4999,
        etaMinutes: 120
      }
    ]
  },
  {
    id: 'tanishq',
    companionBrandId: 'igp',
    name: 'Mia by Tanishq',
    logoText: 'Mia · Tanishq',
    logoDomain: 'miabytanishq.com',
    logoUrl: logoFor('miabytanishq.com'),
    logoBg: '#881337',
    logoColor: '#fde047',
    emoji: '💎',
    category: 'gifts',
    accent: '#fb7185',
    couponCode: 'MIALOVE',
    offerHeadline: '925 Sterling Silver & 14KT Gold Heart Pendants & Promise Rings by Tanishq',
    displayUrl: 'miabytanishq.com',
    externalUrl: 'https://www.miabytanishq.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Silver Heart Pendant Ring') =>
      `https://www.miabytanishq.com/en_IN/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Hamesha mere dil ke kareeb raho 💎 Mia by Tanishq se Sterling Silver Promise Ring ya Heart Pendant gift karo!',
    guestFlirtLine:
      'Minimalist silver & gold jewellery for everyday romance 💎✨ Explore Mia by Tanishq.',
    tagline: 'Certified Silver & 14KT Gold Promise Rings, Pendants & Bracelets',
    meme: {
      memeEmoji: '💍',
      memeBadge: 'VIVAH · PREM & POONAM VIBE',
      memeTitle: '“Jal lijiye... aur saath mein Mia by Tanishq ki Promise Ring bhi pehen lijiye!” 💍🥺',
      memeQuote: 'Authentic Tata Tanishq craftsmanship starting at ₹1,499.'
    },
    keywords: ['tanishq', 'mia', 'silver ring', 'pendant', 'necklace', 'gold', 'jewellery', 'promise ring'],
    items: [
      {
        id: 'mia-heart-pendant',
        name: 'Mia by Tanishq 925 Sterling Silver Infinity Heart Pendant with Chain',
        searchQuery: 'Silver Heart Pendant',
        tag: 'Promise Gift',
        originalPrice: 1999,
        etaMinutes: 180
      }
    ]
  },
  {
    id: 'chaayos',
    companionBrandId: 'cafes',
    name: 'Chaayos Desi Chai',
    logoText: 'Chaayos',
    logoDomain: 'chaayos.com',
    logoUrl: logoFor('chaayos.com'),
    logoBg: '#b45309',
    logoColor: '#ffffff',
    emoji: '🫖',
    category: 'food',
    accent: '#f59e0b',
    couponCode: 'MERICHAI',
    offerHeadline: 'Kulhad Wali Adrak Tulsi Chai + Bun Maska Delivered in Heat-Retaining Flasks',
    displayUrl: 'chaayos.com',
    externalUrl: 'https://www.chaayos.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Chaayos Kulhad Chai Bun Maska') =>
      `https://www.zomato.com/${(CITY_PROFILES[city] || CITY_PROFILES.Hyderabad).zomatoSlug}/restaurants?q=${encodeURIComponent('Chaayos Chai')}`,
    creatorFlirtLine:
      'Baarish, tumhari baatein aur Chaayos ki Kulhad Adrak Chai + Bun Maska 🫖♥',
    guestFlirtLine:
      '“Meri Wali Chai” aur tumhara saath 🫖 Order Chaayos Desi Chai Flask right now!',
    tagline: '25+ Custom Desi Chai Flavours, Bun Maska & Loaded Parathas',
    meme: {
      memeEmoji: '🫖',
      memeBadge: 'PANCHAYAT · SACHIV JI CHAI VIBE',
      memeTitle: '“Gussa kitna bhi ho... Adrak wali Kulhad Chai pite hi sab ‘Theek Hai’ ho jata hai!” 🫖😂',
      memeQuote: 'Piping hot chai flask delivered to your doorstep.'
    },
    keywords: ['chaayos', 'kulhad', 'adrak chai', 'masala chai', 'paratha', 'maggi'],
    items: [
      {
        id: 'chy-kulhad-flask',
        name: 'Chaayos Desi Kulhad Chai Flask (Serves 2) + 2x Butter Bun Maska',
        searchQuery: 'Chaayos Kulhad Chai Bun Maska',
        tag: 'Hot Chai Flask',
        originalPrice: 349,
        etaMinutes: 19
      }
    ]
  },
  {
    id: 'behrouz',
    companionBrandId: 'zomato',
    name: 'Behrouz Royal Biryani',
    logoText: 'BEHROUZ',
    logoDomain: 'behrouzbiryani.com',
    logoUrl: logoFor('behrouzbiryani.com'),
    logoBg: '#78350f',
    logoColor: '#fde047',
    emoji: '👑',
    category: 'food',
    accent: '#eab308',
    couponCode: 'SHAHIDATE',
    offerHeadline: '24-Karat Royal Dum Biryani for Two + Complementary Mint Raita & Gulab Jamun',
    displayUrl: 'behrouzbiryani.com',
    externalUrl: 'https://www.behrouzbiryani.com',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Behrouz Biryani') =>
      `https://www.behrouzbiryani.com`,
    creatorFlirtLine:
      'Meri Begum/Nawab ke liye शाही दावत 👑 Behrouz ki Lazeez Bhuna Murgh / Subz Biryani mangwayein?',
    guestFlirtLine:
      'Ishq aur Behrouz ki Dum Biryani — dono mein dum hona chahiye! 👑🍲',
    tagline: 'Royal Slow-Cooked Dum Biryani & Mughlai Kebabs for Two',
    meme: {
      memeEmoji: '👑',
      memeBadge: 'MUGHAL-E-AZAM ROYAL VIBE',
      memeTitle: '“Takhalluf ki zaroorat nahi... bas Behrouz ki Biryani mein leg piece humare liye chhod dena!” 👑🍗😂',
      memeQuote: 'Unbox a royal dastarkhwan at home.'
    },
    keywords: ['behrouz', 'shahi biryani', 'dum pukht', 'mughlai', 'royal dinner'],
    items: [
      {
        id: 'bhz-shahi-dawat',
        name: 'Shahi Dawat Couple Box: Lazeez Bhuna Biryani + Murgh Kefta + 2x Gulab Jamun',
        searchQuery: 'Behrouz Biryani Couple Combo',
        tag: 'Royal Couple Feast',
        originalPrice: 749,
        etaMinutes: 28
      }
    ]
  },
  {
    id: 'winni',
    companionBrandId: 'fnp',
    name: 'Winni Cakes & Flowers',
    logoText: 'Winni',
    logoDomain: 'winni.in',
    logoUrl: logoFor('winni.in'),
    logoBg: '#db2777',
    logoColor: '#ffffff',
    emoji: '🎂',
    category: 'gifts',
    accent: '#f472b6',
    couponCode: 'WINNILOVE',
    offerHeadline: '2-Hour Express Bento Pinata Cakes, Heart Red Velvet & Roses on Winni',
    displayUrl: 'winni.in',
    externalUrl: 'https://www.winni.in',
    buildCheckoutUrl: (city = 'Hyderabad', query = 'Heart Shape Red Velvet Cake') =>
      `https://www.winni.in/search?q=${encodeURIComponent(query)}`,
    creatorFlirtLine:
      'Bina kisi occasion ke bhi celebrate kar sakte hain 🎂 Winni se Heart-Shape Red Velvet Cake bhejo!',
    guestFlirtLine:
      'Hammer Pinata Cake fodne ka maza hi alag hai 🎂💖 Order on Winni!',
    tagline: 'Heart-Shape Cakes, Chocolate Pinata Cakes & Midnight Combos',
    meme: {
      memeEmoji: '🔨',
      memeBadge: 'PINATA CAKE VIBE',
      memeTitle: '“Saara gussa is Hammer Pinata Cake pe nikaalo, mere upar nahi!” 🔨🎂😂',
      memeQuote: 'Same-day & midnight delivery across 550+ Indian cities.'
    },
    keywords: ['winni', 'pinata cake', 'red velvet', 'bento cake', 'pastry', 'archies'],
    items: [
      {
        id: 'wnn-heart-pinata',
        name: 'Heart-Shaped Chocolate Pinata Cake with Wooden Hammer + Red Rose',
        searchQuery: 'Heart Chocolate Pinata Cake',
        tag: '2-Hr Express Cake',
        originalPrice: 849,
        etaMinutes: 60
      }
    ]
  }
];

export const flirtyHindiDrops = [
  {
    id: 'drop-mood-1',
    category: 'pyaar',
    label: '⚡ Flipkart Minutes / Blinkit',
    brandId: 'flipkart_minutes',
    text: 'Suno, bohot din ho gaye... Aaj raat chocolate aur midnight snacks mangwa lein 9 minute mein? 😉♥'
  },
  {
    id: 'drop-biryani-2',
    category: 'craving',
    label: '🍲 Zomato Biryani Treat',
    brandId: 'zomato',
    text: 'Tumhari smile ke liye kuch bhi! Batao aaj dinner mein गरमा-गरम Dum Biryani khani hai ya Wood-Fired Pizza? ♥'
  },
  {
    id: 'drop-chai-4',
    category: 'pyaar',
    label: '☕ Café Niloufer Chai',
    brandId: 'cafes',
    text: 'Ek pyali गरमा-गरम Irani Chai aur Osmania biscuit... Chalo aaj shaam Café Niloufer ya apne favourite cafe mein milte hain? ☕✨'
  },
  {
    id: 'drop-friend-banter-1',
    category: 'dosti',
    label: '😎 Dost Party Vasooli',
    brandId: 'swiggy',
    text: 'Abe sunn! Khali phokat ki baatein mat kar, kab se teri treat pending hai — aaj Zomato/Swiggy se shawarma aur cold coffee bhej chup-chaap! 🌯😂'
  },
  {
    id: 'drop-friend-banter-2',
    category: 'dosti',
    label: '🍿 Bestie Roast & Chill',
    brandId: 'netflix',
    text: 'Tu dost kam aur mera daily drama subscription zyada hai 🍿😂 Chal aaj koi thriller movie ya bowling plan karte hain!'
  },
  {
    id: 'drop-roast-6',
    category: 'roast',
    label: '🌶️ Hyderabadi Nok-Jhok',
    brandId: 'swiggy',
    text: 'Baigan ke baatan nakko karo! Traffic se zyada nakhre hain tumhare, ab chup chaap Choco Lava Cake khao 😤❤️'
  },
  {
    id: 'drop-amazon-5',
    category: 'pyaar',
    label: '📦 Amazon / Myntra Surprise',
    brandId: 'amazon',
    text: 'Apni Amazon aur Myntra wishlist bhejo chup chaap... aaj tumhe surprise dene ka mood hai 🛍️✨'
  },
  {
    id: 'drop-oyo-3',
    category: 'pyaar',
    label: '🏨 Weekend Staycation',
    brandId: 'oyo',
    text: 'Phone pe kab tak baatein karenge? Chalo is weekend ek peaceful staycation ya rooftop hangout plan karte hain ♥'
  }
];

/**
 * 10-MINUTE CHAT MILESTONE: LOCATION-BASED TREASURE HUNT & DUO TASK ENGINE
 * Works for both Romantic Couples AND Boy-Girl Best Friends / Dosts!
 */
export const CITY_TREASURE_HUNT_MISSIONS = {
  Hyderabad: [
    {
      id: 'hyd-hunt-1',
      title: 'Clue #1: The Midnight Bun Maska & Irani Chai Riddle ☕',
      spotName: 'Café Niloufer Lounge, Banjara Hills / Lakdikapul',
      mapsQuery: 'Cafe Niloufer Banjara Hills Hyderabad',
      riddle:
        '“Jahan subah 4 baje bhi chai ki khushboo aati hai aur Osmania biscuit dil jeet leta hai...”',
      taskInstruction:
        'Challenge: Meet at (or order from) Café Niloufer! Click a Live Camera Snap (📷) holding two chai cups or send a 10-sec Voice Note (🎤) rating each other’s chai addiction out of 10!',
      rewardBadge: '🏆 Charminar Chai Explorers · Use Code: NILOUFERDATE'
    },
    {
      id: 'hyd-hunt-2',
      title: 'Clue #2: The Neon Cable Bridge Secret Whisper 🌉',
      spotName: 'Durgam Cheruvu Cable Bridge & Olive Bistro',
      mapsQuery: 'Durgam Cheruvu Cable Bridge Hyderabad',
      riddle:
        '“Pani ke upar chamakti rang-birangi lights, jahan Jubilee Hills ki hawa sabseandaaz mein chalti hai...”',
      taskInstruction:
        'Challenge: Record a 10-second Voice Note (🎤) in your funniest Hyderabadi accent (“Hau miyaan, kyaich dikhre!”) OR take a live evening sky snap (📷) and send it in chat!',
      rewardBadge: '🌉 Jubilee Hills Night Owls · Use Code: ZOMATOCOUPLE'
    },
    {
      id: 'hyd-hunt-3',
      title: 'Clue #3: The Mystery ₹199 Surprise Box 🎁',
      spotName: 'Tank Bund / Necklace Road Eat Street',
      mapsQuery: 'Necklace Road Eat Street Hyderabad',
      riddle:
        '“Bina bataye ek choti si cheez mangwao jo samne wale ke chehre pe 100-watt ki smile le aaye!”',
      taskInstruction:
        'Challenge: Secretly pick 1 snack, dessert, or funny gift under ₹199 on Blinkit / Flipkart Minutes / Swiggy and drop a 3-word clue in chat so the other person has to guess what it is!',
      rewardBadge: '🎁 Secret Santa Duo · Use Code: MINUTES50'
    }
  ],
  Patna: [
    {
      id: 'pat-hunt-1',
      title: 'Clue #1: The Ganga Path Sunset Breeze Challenge 🌊',
      spotName: 'JP Ganga Path (Patna Marine Drive) / Digha Ghat',
      mapsQuery: 'JP Ganga Path Marine Drive Patna',
      riddle:
        '“Ganga ji ki thandi hawa aur shaam ki kulhad chai — Patna ka sabse happening hangout spot!”',
      taskInstruction:
        'Challenge: Send a Live Camera Snap (📷) of your current view or record a Voice Note (🎤) telling your partner/bestie which street food at Maurya Lok or Boring Road you’re craving right now!',
      rewardBadge: '🏆 Patliputra Vibe Masters · Use Code: ZOMATOCOUPLE'
    },
    {
      id: 'pat-hunt-2',
      title: 'Clue #2: The Boring Road Cafe Mystery ☕',
      spotName: 'Sardar Ji Baksh Coffee / Fifth Avenue Cafe, Boring Road',
      mapsQuery: 'Sardar Ji Baksh Coffee Boring Road Patna',
      riddle:
        '“Jahan cold coffee ke saath ghanton gup-shup chalti hai aur waqt ka pata hi nahi chalta...”',
      taskInstruction:
        'Challenge: Pick 1 cafe spot in Patna for this weekend, share its Google Calendar card in chat, and make the other person guess what you’ll order for them!',
      rewardBadge: '☕ Boring Road Legends · Use Code: EAZYVIP500'
    }
  ],
  Delhi: [
    {
      id: 'del-hunt-1',
      title: 'Clue #1: The White Inner Circle & Cold Coffee Riddle 🏛️',
      spotName: 'Connaught Place (CP) / Hauz Khas Village Lakeview',
      mapsQuery: 'Connaught Place New Delhi',
      riddle:
        '“Safed khambon ka gol chakkar ya phir fort ke peeche jheel wali shaam...”',
      taskInstruction:
        'Challenge: Send a 10-second Voice Note (🎤) roasting your friend/partner in full Delhi style (“Bhai sunn...”) or snap a live selfie (📷) making your funniest face!',
      rewardBadge: '🏛️ Dilli Dilwale Duo · Use Code: SWIGGYDIL'
    }
  ],
  Mumbai: [
    {
      id: 'mum-hunt-1',
      title: 'Clue #1: The Queen’s Necklace & Carter Road Sea Breeze 🌊',
      spotName: 'Marine Drive / Bandra Carter Road Promenade',
      mapsQuery: 'Marine Drive Mumbai',
      riddle:
        '“Samundar ki lehren, cutting chai aur raat ko chamakta Queen’s Necklace...”',
      taskInstruction:
        'Challenge: Send a Live Camera Snap (📷) of what’s in front of you right now + a Voice Note (🎤) naming 1 Bollywood scene you two should recreate at Marine Drive!',
      rewardBadge: '🌊 Bombay Vibe Check · Use Code: BLINKITLOVE'
    }
  ],
  Bengaluru: [
    {
      id: 'blr-hunt-1',
      title: 'Clue #1: The Indiranagar / Church Street Book & Boba Hunt🧋',
      spotName: 'Church Street Blossoms & Indiranagar 100ft Road',
      mapsQuery: 'Church Street Bengaluru',
      riddle:
        '“Bangalore ka suhana mausam, purani kitabein aur गरमा-गरम filter coffee...”',
      taskInstruction:
        'Challenge: Record a quick Voice Note (🎤) pitching your dream startup idea together in 15 seconds OR pick a rooftop spot in Indiranagar for tonight!',
      rewardBadge: '🧋 Peak Bengaluru Duo · Use Code: ZEPTO100'
    }
  ],
  Kolkata: [
    {
      id: 'kol-hunt-1',
      title: 'Clue #1: The Princep Ghat & Park Street Adda Mystery 🌉',
      spotName: 'Princep Ghat Riverfront & Flurys Park Street',
      mapsQuery: 'Princep Ghat Kolkata',
      riddle:
        '“Hooghly nadi ke kinare safed pillars aur Park Street ki purani roshni...”',
      taskInstruction:
        'Challenge: Send a Voice Note (🎤) sharing your favourite memory together or snap a live photo (📷) of your current mood!',
      rewardBadge: '🌉 City of Joy Explorers · Use Code: ZOMATOCOUPLE'
    }
  ]
};

/**
 * MONETIZATION BLUEPRINT & PUBLIC LAUNCH GUIDE
 * Explains how the creator can monetize AFTERDARK in production.
 */
export const MONETIZATION_BLUEPRINT = [
  {
    id: 'affiliate-cpa',
    icon: '💰',
    title: '1. Instant Affiliate Commissions (Cuelinks / EarnKaro / Amazon Associates / vCommission)',
    payout: '₹35 to ₹450 per order/booking (4% – 18% Revenue Share)',
    howItWorks:
      'Replace the base checkout URLs in commerce-data.js with your Cuelinks Universal SmartLink or Amazon Associates tag (?tag=yourid-21). Whenever a user clicks an in-chat surprise drop for Amazon, Flipkart, Myntra, Nykaa, Ajio, OYO, MakeMyTrip, or Ferns N Petals and buys something, you earn automatic affiliate commission!'
  }
];

const INITIAL_GREETING_STOPWORDS =
  /^(hi+|hey+|hello+|hlo+|hlw+|oi+|yo+|sup|namaste|salam|assalamualaikum|kya haal|kaise ho|kaisi ho|aur batao|hmm+|ok+|okay|haan|hanji|achha|acha|fine|good|nice|test|testing)[!?.~\s♥❤️😊😂]*$/i;

export function detectBrandsInMessage(text) {
  const raw = String(text || '').trim();
  if (!raw || raw.length < 3) return [];

  // Never trigger on system welcome message or initial "hi/hello" greetings
  if (
    (raw.includes('OTP') && raw.includes('verify')) ||
    raw.includes('private couple chat khol liya') ||
    INITIAL_GREETING_STOPWORDS.test(raw)
  ) {
    return [];
  }

  const lower = raw.toLowerCase();
  const directMatches = [];
  const keywordMatches = [];
  const seen = new Set();

  for (const b of brandCatalog) {
    const brandFirstToken = b.name.toLowerCase().split(/\s+/)[0];
    const hasMention =
      lower.includes(`@${b.id}`) ||
      lower.includes(b.name.toLowerCase()) ||
      (brandFirstToken.length >= 4 && new RegExp(`\\b${brandFirstToken}\\b`, 'i').test(lower));
    const hasKeyword = b.keywords.some((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(lower);
    });

    if (hasMention || hasKeyword) {
      if (!seen.has(b.id)) {
        seen.add(b.id);
        if (hasMention) {
          directMatches.push(b);
        } else {
          keywordMatches.push(b);
        }
      }
    }
  }
  return [...directMatches, ...keywordMatches];
}

/**
 * IMPLICIT ("ANONYMOUS") CONVERSATIONAL VIBE CLASSIFIER:
 * Reads the conversational mood/sentiment after the initial warm-up messages
 * and returns a contextually matched pair of brands [creatorBrand, guestBrand].
 */
const IMPLICIT_VIBE_BUCKETS = [
  {
    id: 'romance_missing',
    label: '💭 Sweet Vibe Pick',
    regex:
      /\b(miss|yaad|pyaar|pyar|love|jaan|jaanu|baby|babe|shona|cute|sweet|hug|kiss|dil|heart|meri|tera|tumhari|tumhare|saath|close|cuddle|feel|romantic|beautiful|hasi|smile)\b|[❤️♥😘🥰😍💕💖]/i,
    pairs: [
      ['fnp', 'cadbury_gifting'],
      ['blinkit', 'flipkart_minutes'],
      ['bella_vita', 'nykaa'],
      ['igp', 'amazon'],
      ['durex_india', 'bold_care']
    ]
  },
  {
    id: 'manana_nokjhok',
    label: '🌶️ Nok-Jhok Peace Offering',
    regex:
      /\b(sorry|gussa|naraz|maaf|baigan|nakhre|fight|kalesh|rooth|manana|bura|hurt|sad|cry|rona|pagal|chup|baat mat|attitude|ego|drama|jhagda)\b|[😤😠🥺😢😭]/i,
    pairs: [
      ['swiggy', 'zomato'],
      ['cadbury_gifting', 'fnp'],
      ['baskin_robbins', 'dominos'],
      ['myntra', 'nykaa']
    ]
  },
  {
    id: 'tired_work_late',
    label: '🌙 Late-Night / Break Pick',
    regex:
      /\b(thak|tired|office|work|kaam|boss|college|class|exam|study|sleep|neend|soja|so jao|raat|night|late|headache|sar dard|busy|exhausted|break|chai|coffee)\b|[😴🥱☕🌙]/i,
    pairs: [
      ['cafes', 'starbucks'],
      ['zepto', 'swiggy_instamart'],
      ['blue_tokai', 'flipkart_minutes'],
      ['spotify', 'netflix']
    ]
  },
  {
    id: 'meetup_weekend_plan',
    label: '📍 Hangout & Meetup Pick',
    regex:
      /\b(milna|milte|milo|meet|kab|kahan|kidhar|weekend|saturday|sunday|kal|aaj shaam|tonight|bahar|out|plan|drive|chalo|aao|aa jao|pick|wait|free ho|time)\b|[🚗🛵🏨🕯️]/i,
    pairs: [
      ['oyo', 'makemytrip'],
      ['eazydiner', 'cafes'],
      ['uber', 'ola'],
      ['airbnb', 'goibibo'],
      ['rapido', 'district']
    ]
  },
  {
    id: 'chill_bored_fun',
    label: '🎬 Chill & Dost Fun Pick',
    regex:
      /\b(bore|boring|kya kar|kkrh|sunao|kuch nahi|nothing|free|chill|fun|maza|joke|laugh|reel|insta|watch|dekho|game|play|dost|bro|yaar|bestie|party)\b|[😂🤣😎🍿]/i,
    pairs: [
      ['netflix', 'spotify'],
      ['bookmyshow', 'district'],
      ['dominos', 'kfc'],
      ['swiggy_instamart', 'zepto']
    ]
  },
  {
    id: 'compliment_style_gift',
    label: '✨ Style & Surprise Pick',
    regex:
      /\b(sundar|pretty|handsome|hot|gorgeous|look|looking|dp|photo|pic|selfie|wear|pehen|color|black|red|pink|suit|matching|gift|treat)\b|[🔥✨👑💃]/i,
    pairs: [
      ['myntra', 'ajio'],
      ['amazon', 'flipkart'],
      ['nykaa', 'tira'],
      ['lenskart', 'meesho'],
      ['mamaearth', 'purplle']
    ]
  }
];

const GENERAL_CHAT_BRAND_PAIRS = [
  ['zomato', 'swiggy'],
  ['amazon', 'flipkart'],
  ['flipkart_minutes', 'blinkit'],
  ['cafes', 'starbucks'],
  ['myntra', 'nykaa'],
  ['oyo', 'makemytrip'],
  ['zepto', 'swiggy_instamart'],
  ['fnp', 'cadbury_gifting'],
  ['dominos', 'baskin_robbins'],
  ['bookmyshow', 'district'],
  ['bella_vita', 'tira'],
  ['uber', 'rapido']
];

export function detectImplicitChatBrands(text = '', messages = [], msgIndex = 0) {
  const raw = String(text || '').trim();
  if (!raw || raw.length < 4) return null;
  if (
    (raw.includes('OTP') && raw.includes('verify')) ||
    raw.includes('private couple chat khol liya') ||
    INITIAL_GREETING_STOPWORDS.test(raw)
  ) {
    return null;
  }

  let hash = (msgIndex + 7) * 2654435761;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash ^ raw.charCodeAt(i)) * 16777619) >>> 0;
  }

  for (const bucket of IMPLICIT_VIBE_BUCKETS) {
    if (bucket.regex.test(raw)) {
      const pair = bucket.pairs[hash % bucket.pairs.length];
      const creatorBrand = brandCatalog.find((b) => b.id === pair[0]) || brandCatalog[0];
      const guestBrand = brandCatalog.find((b) => b.id === pair[1]) || brandCatalog[1];
      return {
        creatorBrand,
        guestBrand,
        vibeLabel: bucket.label,
        isImplicit: true,
        hash
      };
    }
  }

  // Mystery surprise drop ONLY when the conversation has real substance (at least 14 chars)
  // and passes the surprise lottery (roughly 1 in 3 messages), so it never feels robotic!
  if (raw.length >= 14 && hash % 3 === 0) {
    const fallbackPair = GENERAL_CHAT_BRAND_PAIRS[hash % GENERAL_CHAT_BRAND_PAIRS.length];
    const creatorBrand = brandCatalog.find((b) => b.id === fallbackPair[0]) || brandCatalog[0];
    const guestBrand = brandCatalog.find((b) => b.id === fallbackPair[1]) || brandCatalog[1];
    return {
      creatorBrand,
      guestBrand,
      vibeLabel: '🎁 Mystery Surprise Drop',
      isImplicit: true,
      hash
    };
  }

  return null;
}

/**
 * SURPRISE MYSTERY + 2-MINUTE RATE-LIMITED AD ENGINE:
 * - NEVER shows an ad on the initial welcome message or first 3 messages ("hi", "hello", etc.)!
 * - Enforces a strict 2-MINUTE (`120,000 ms`) cooldown AND at least 3 messages between surprise drops.
 * - Uses an asymmetric per-viewer surprise selector so Host and Guest get different surprise brands at different moments!
 */
export const MIN_AD_COOLDOWN_MS = 2 * 60 * 1000;
const MIN_WARMUP_MESSAGES = 3; // First 3 messages (indices 0, 1, 2) NEVER show an ad!
const MIN_MSG_GAP_BETWEEN_ADS = 3;

function resolveCandidateAdBrands(candidateMsg, messages, idx) {
  if (idx < 1) return null;
  if (candidateMsg?.e2eeLocked) return null;

  const text = String(candidateMsg?.body || candidateMsg?.text || '').trim();
  if (!text) return null;
  if (
    text.startsWith('AD_E2EE_V1:') ||
    text.startsWith('🔒 End-to-End Encrypted') ||
    (text.includes('OTP') && text.includes('verify')) ||
    text.includes('private couple chat khol liya') ||
    INITIAL_GREETING_STOPWORDS.test(text)
  ) {
    return null;
  }

  const explicit = detectBrandsInMessage(text);
  if (explicit.length > 0) {
    const primary = explicit[0];
    const companion =
      explicit[1] ||
      (primary.companionBrandId && brandCatalog.find((b) => b.id === primary.companionBrandId)) ||
      brandCatalog.find((b) => b.id !== primary.id && b.category === primary.category) ||
      primary;
    return {
      creatorBrand: primary,
      guestBrand: companion,
      vibeLabel: `🎯 Surprise Match`,
      isExplicit: true,
      hash: idx * 97
    };
  }

  // Implicit banter waits until after the initial greeting / warm-up phase
  if (idx < MIN_WARMUP_MESSAGES) return null;

  return detectImplicitChatBrands(text, messages, idx);
}

export function getPersonalizedInChatBrandAd(
  messages = [],
  msgIndex = 0,
  viewerRole = 'creator',
  userCity = 'Hyderabad',
  aiInsight = null
) {
  if (msgIndex < 1) return null;

  const msg = messages[msgIndex];
  if (!msg) return null;

  const currentMatch = resolveCandidateAdBrands(msg, messages, msgIndex);
  if (!currentMatch) return null;

  const isCreator = viewerRole === 'creator';

  // Asymmetric Surprise Gate for implicit ads:
  // So that Host and Guest don't even get interrupted on the exact same message every time!
  if (!currentMatch.isExplicit) {
    const viewerSalt = isCreator ? 1 : 2;
    if ((currentMatch.hash + msgIndex + viewerSalt) % 2 !== 0) {
      return null;
    }
  }

  let lastShownAdIndex = -1;
  let lastShownAdTs = 0;

  for (let i = 1; i <= msgIndex; i++) {
    const candidate = messages[i];
    const match = resolveCandidateAdBrands(candidate, messages, i);
    if (!match) continue;

    if (!match.isExplicit) {
      const viewerSalt = isCreator ? 1 : 2;
      if ((match.hash + i + viewerSalt) % 2 !== 0) continue;
    }

    const candidateTs = candidate?.createdAt ? new Date(candidate.createdAt).getTime() : 0;
    const elapsedMs =
      candidateTs && lastShownAdTs ? Math.abs(candidateTs - lastShownAdTs) : 0;
    const msgGapOk = lastShownAdIndex === -1 || i - lastShownAdIndex >= MIN_MSG_GAP_BETWEEN_ADS;

    const canShow =
      lastShownAdIndex === -1 ||
      match.isExplicit ||
      (msgGapOk && candidateTs && lastShownAdTs && elapsedMs >= MIN_AD_COOLDOWN_MS);

    if (i === msgIndex) {
      if (!canShow) return null;
    } else if (canShow) {
      lastShownAdIndex = i;
      lastShownAdTs = candidateTs;
    }
  }

  let chosen = isCreator
    ? currentMatch.creatorBrand
    : currentMatch.isExplicit
    ? currentMatch.creatorBrand
    : currentMatch.guestBrand;

  if (
    !currentMatch.isExplicit &&
    msgIndex === messages.length - 1 &&
    aiInsight?.primaryBrandId
  ) {
    const aiBrand = brandCatalog.find((b) => b.id === aiInsight.primaryBrandId);
    if (aiBrand) {
      chosen = isCreator
        ? aiBrand
        : (aiBrand.companionBrandId &&
            brandCatalog.find((b) => b.id === aiBrand.companionBrandId)) ||
          aiBrand;
    }
  }

  const baseFlirt =
    !currentMatch.isExplicit &&
    msgIndex === messages.length - 1 &&
    aiInsight?.notificationBody
      ? aiInsight.notificationBody
      : isCreator
      ? chosen.creatorFlirtLine
      : chosen.guestFlirtLine;

  const localizedFlirt =
    userCity && userCity !== 'Hyderabad'
      ? baseFlirt.replace(/Banjara Hills|Hyderabadi/gi, userCity)
      : baseFlirt;

  return {
    brand: chosen,
    companionBrand: isCreator ? currentMatch.guestBrand : currentMatch.creatorBrand,
    flirtCopy: localizedFlirt,
    vibeLabel: currentMatch.vibeLabel,
    meme: chosen.meme || {
      memeEmoji: '😂',
      memeBadge: 'DESI VIBE PICK',
      memeTitle: '“Baatein toh chalti rahengi... ek chota sa surprise toh banta hai!” ✨',
      memeQuote: '100% private in-chat surprise offer.'
    },
    reasonBadge: `🎁 Surprise Pick · ${userCity || 'Near You'}`,
    city: userCity || 'Hyderabad'
  };
}

export function analyzeChatContextLocally(messages = [], draftText = '', viewerRole = 'creator') {
  const recentText = [
    draftText,
    ...messages.slice(-4).map((m) => m.body || m.text || '')
  ]
    .join(' ')
    .toLowerCase();

  const matched = detectBrandsInMessage(recentText);
  const implicit =
    matched.length === 0
      ? detectImplicitChatBrands(recentText, messages, Math.max(0, messages.length - 1))
      : null;

  const primary =
    matched[0] ||
    (viewerRole === 'creator' ? implicit?.creatorBrand : implicit?.guestBrand) ||
    brandCatalog[0];
  const secondary =
    matched[1] ||
    (primary.companionBrandId && brandCatalog.find((b) => b.id === primary.companionBrandId)) ||
    brandCatalog[1];

  return {
    primaryBrand: primary,
    secondaryBrand: secondary
  };
}
