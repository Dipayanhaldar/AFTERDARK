import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import './style.css';

const brands = [
  { name: 'Netflix', slug: 'netflix', category: 'Movie night', url: 'https://www.netflix.com/', keys: ['movie','film','watch','netflix','binge','series','show','k-drama'], pitch: 'Movie plan? Netflix & chill bolo, “kal dekhenge” ka season finale kabhi nahi aata 😭🍿', cta: 'Pick the watchlist', logo: 'N', color: '#e50914' },
  { name: 'BookMyShow', slug: 'bookmyshow', category: 'Movie tickets', url: 'https://in.bookmyshow.com/', keys: ['tickets','pvr','cinema','theatre','screening','concert'], pitch: 'Talking stage se theatre stage tak? Tickets book karo, bestie. 👀🎟️', cta: 'Find a show', logo: 'B', color: '#d81f26' },
  { name: 'Zomato', slug: 'zomato', category: 'Food cravings', url: 'https://www.zomato.com/', keys: ['zomato','food','hungry','eat','dinner','lunch','craving','pizza','biryani','momos','khana'], pitch: 'Momos ya biryani ka mood aa? Hint dena band karo miyaan, order scene set karo 🌶️🤌', cta: 'Order something cute', logo: 'zomato', color: '#e23744' },
  { name: 'Swiggy', slug: 'swiggy', category: 'Food delivery', url: 'https://www.swiggy.com/', keys: ['swiggy','delivery','takeaway','late night food'], pitch: 'Pyaar apni jagah, late-night cravings apni jagah. Kuch mangwao aur gossip chalao 😭🍟', cta: 'Get the food scene going', logo: 'swiggy', color: '#fc8019' },
  { name: 'Blinkit', slug: 'blinkit', category: 'Tiny surprises', url: 'https://blinkit.com/', keys: ['blinkit','snack','chocolate','surprise','midnight','ice cream','chips','craving'], pitch: 'Green-flag move: unka favourite snack yaad rakhna. Chhota surprise, full aura 💛', cta: 'Send a little treat', logo: 'blinkit', color: '#f8cb46' },
  { name: 'Amazon', slug: 'amazon', category: 'Little something', url: 'https://www.amazon.in/', keys: ['amazon','shopping','order','buy','wishlist','headphones','book','gadget'], pitch: 'Wishlist mein hint daal diya? Ab dekhte hain tumhara person FBI-level observant hai kya 👀📦', cta: 'Browse the wishlist', logo: 'a', color: '#ff9900' },
  { name: 'Myntra', slug: 'myntra', category: 'Fit check', url: 'https://www.myntra.com/', keys: ['myntra','outfit','fit check','dress','clothes','fashion','date outfit','wear'], pitch: 'Date ka fit ready hai ya abhi bhi “mere paas kuch nahi hai” arc chal raha? 💅✨', cta: 'Find the date fit', logo: 'M', color: '#ff3f6c' },
  { name: 'Zudio', slug: 'zudio', category: 'Budget fits', url: 'https://www.zudio.com/', keys: ['zudio','budget fit','affordable clothes','budget shopping'], pitch: 'Cute fit, budget intact. Paisa bachao, aura badhao — Hyderabad ka asli flex 😌❤️', cta: 'Browse the fits', logo: 'Z', color: '#ed1c24' },
  { name: 'AJIO', slug: 'ajio', category: 'Style plans', url: 'https://www.ajio.com/', keys: ['ajio','streetwear','sneakers','style','wardrobe'], pitch: 'Matching fits? Low-key couple goals. Bas dono ka drip alag level ka hona chahiye 😎', cta: 'Style the moment', logo: 'AJIO', color: '#2d1c47' },
  { name: 'Ferns N Petals', slug: 'fnp', category: 'Flowers & gifts', url: 'https://www.fnp.com/', keys: ['flowers','bouquet','fnp','roses','flower','surprise gift'], pitch: '“Flowers nahi chahiye” bolke story pe bouquets repost karna? Chachi sab samajhti 😭🌹', cta: 'Send flowers', logo: 'fnp', color: '#6b9b42' },
  { name: 'IGP', slug: 'igp', category: 'Thoughtful gifts', url: 'https://www.igp.com/', keys: ['igp','gift','birthday','anniversary','present','personalized'], pitch: 'Subtle hint bhi hint hota miyaan. A thoughtful gift says “I listen” 💐💌', cta: 'Find a thoughtful gift', logo: 'IGP', color: '#7c3f8c' },
  { name: 'Archies', slug: 'archies', category: 'Cards & keepsakes', url: 'https://www.archiesonline.com/', keys: ['archies','greeting card','love letter','handwritten note','keepsake'], pitch: 'Typing “I miss you” easy hai… handwritten note? Arrey, dil jeet liya janaab 💌', cta: 'Send a little note', logo: 'A', color: '#c21e45' },
  { name: 'Nykaa', slug: 'nykaa', category: 'Self-care treat', url: 'https://www.nykaa.com/', keys: ['nykaa','makeup','skincare','perfume','beauty','lipstick'], pitch: 'Self-care date or a tiny treat? Main character energy deserves its own shelf 💄✨', cta: 'Pick a self-care treat', logo: 'N', color: '#fc2779' },
  { name: 'Starbucks', slug: 'starbucks', category: 'Coffee date', url: 'https://www.starbucks.in/', keys: ['starbucks','coffee','cafe','matcha','latte','chai','drink'], pitch: '“Quick coffee?” — famous last words before a 3-hour yap session ☕🫶', cta: 'Plan a coffee run', logo: '★', color: '#00754a' },
  { name: 'Uber', slug: 'uber', category: 'Getting there', url: 'https://www.uber.com/in/en/', keys: ['uber','ride','cab','travel','pickup','drop','going there'], pitch: 'Plan toh set hai, ab “kaise aaoge?” ka plot twist mat rakho 😭🚗', cta: 'Sort the ride', logo: 'UBER', color: '#111111' },
  { name: 'Rapido', slug: 'rapido', category: 'Quick ride', url: 'https://www.rapido.bike/', keys: ['rapido','bike taxi','scooter','pickup','drop'], pitch: '“5 min mein aata” bolke 40 min? Scene set karo, ride plan bhi 😭🏍️', cta: 'Sort your ride', logo: 'R', color: '#ffcb05' },
  { name: 'District', slug: 'district', category: 'Date plans', url: 'https://www.district.in/', keys: ['district','date','plan','event','activity','weekend','outing'], pitch: 'Hyd lo “we should go” ante calendar lo pettu ra. Sirf reels share karne se date nahi hota 😌✨', cta: 'Find your next plan', logo: 'D', color: '#5b2be0' },
  { name: 'Cadbury 5 Star', slug: 'cadbury', category: 'Chocolate break', url: 'https://www.cadburygifting.in/', keys: ['5 star','cadbury','bad day','rough day','tired','stress','reset'], pitch: 'Life full drama chestunda? Chocolate break teesko, jaan. Main character needs a reset 🍫', cta: 'Take a sweet break', logo: '5★', color: '#4b2678' },
  { name: 'Spotify', slug: 'spotify', category: 'Your song', url: 'https://open.spotify.com/', keys: ['spotify','playlist','song','music','listen','soundtrack'], pitch: 'Ek playlist bana do jaan ke liye. 10 songs aur 1 soft launch — full cinema 🎧💗', cta: 'Make the playlist', logo: '≋', color: '#1db954' },
  { name: 'MakeMyTrip', slug: 'makemytrip', category: 'Little getaway', url: 'https://www.makemytrip.com/', keys: ['trip','travel together','getaway','holiday','vacation','staycation'], pitch: '“Kabhi trip pe chalte” ko actual dates do ra. Delulu itinerary loading ✈️👀', cta: 'Dream up a getaway', logo: 'MMT', color: '#1c4e9b' }
];
const vibeLines = ['Acha suno… soft launch karna hai ya hard launch? 👀💋','Scene toh full filmy lag raha hai, jaan. Clock it. 💘','Arrey, this is giving “I made a playlist for you” energy. 🎧','Hyd Gen Z rule: “dekhenge” nahi, date ka time bolo. 🌙','Low-key obsessed? High-key communicate, bestie. 🫶','Aiyo, butterflies aa rahe kya? Don’t fumble the bag. 🦋'];
const dailyPrompts = [
  { id: 'green-flag', question: 'What tiny thing instantly makes someone a green flag?' },
  { id: 'perfect-evening', question: 'Describe your perfect low-pressure evening together.' },
  { id: 'comfort-food', question: 'What comfort food would fix a rough day for you?' },
  { id: 'first-impression', question: 'What was your honest first impression of your person?' },
  { id: 'soft-launch-song', question: 'Which song would be your soft-launch soundtrack?' },
  { id: 'love-language', question: 'What small action makes you feel genuinely cared for?' },
  { id: 'hyderabad-date', question: 'Pick one Hyderabad spot for a spontaneous date. Why?' },
  { id: 'funny-memory', question: 'What moment together still makes you laugh?' },
  { id: 'ideal-weekend', question: 'What does your ideal no-pressure weekend look like?' },
  { id: 'communication', question: 'What helps you feel safe communicating honestly?' }
];
const dateSpots = [{"id":"necklace-road","name":"Necklace Road","area":"Hussain Sagar","desc":"Sunset walk and city lights"},{"id":"durgam-cheruvu","name":"Durgam Cheruvu","area":"Madhapur","desc":"Lake views and a relaxed evening"},{"id":"charminar","name":"Charminar","area":"Old City","desc":"Historic streets and local snacks"},{"id":"golconda","name":"Golconda Fort","area":"Ibrahim Bagh","desc":"Golden-hour views; check visiting hours"},{"id":"chowmahalla","name":"Chowmahalla Palace","area":"Khilwat","desc":"Architecture and a daytime culture date"},{"id":"lumbini-park","name":"Lumbini Park","area":"Hussain Sagar","desc":"Easy public-park plan"},{"id":"paradise-biryani","name":"Paradise Biryani","area":"Secunderabad","desc":"A classic Hyderabad food date"},{"id":"ramoji-film-city","name":"Ramoji Film City","area":"Abdullapurmet","desc":"Plan a full-day outing"}];
const suggestionsFor = (text) => {
  const lower = text.toLowerCase();
  if (['tickets','pvr','cinema','theatre','screening','concert'].some(k => lower.includes(k))) return brands.filter(b => b.slug === 'bookmyshow');
  if (['movie','film','netflix','series','binge','k-drama'].some(k => lower.includes(k))) return brands.filter(b => b.slug === 'netflix');
  const match = brands.find(b => b.keys.some(k => lower.includes(k)));
  return match ? [match] : [];
};
const chachiReplyFor = (text) => {
  const lower = String(text || '').toLowerCase();
  if (/movie|netflix|film|series|watch|cinema/.test(lower)) return 'Arrey wah, movie ka plan toh bana lo… popcorn tum, company main? 👀🍿';
  if (/momo|biryani|food|hungry|eat|craving|khana|pizza/.test(lower)) return 'Miyaan, pehle khana order karo. Dil ki baat biryani ke baad bhi kar sakte 😌🤌';
  if (/miss you|miss u|yaad|love you|love u|like you|feelings/.test(lower)) return 'Acha ji, itna yaad karte? Proof ke liye ek cute sa plan bhi bhejo na, hero sahab 💋';
  if (/date|meet|milte|weekend|outing|plan/.test(lower)) return 'Hyd mein milte? Bas “dekhenge” mat bolo ra, day aur time fix karo 😭💗';
  if (/cute|beautiful|handsome|pretty|gorgeous|sweet|compliment/.test(lower)) return 'Hayeee, itni tareef? Ab blush karun ya tumko chai pe bulaun? 👀☕';
  if (/sorry|upset|sad|bad day|stress|tired/.test(lower)) return 'Acha suno, no pressure. Batao kya hua — main sun raha/rahi hoon. Chai aur thoda sa comfort scene? 🫶';
  const replies = [
    'Hau miyaan, flirting toh solid hai… ab consistency bhi dikhao, hero sahab 😌💗',
    'Kya bolte, janaab? Itni smooth baatein karte toh dil ka Wi-Fi auto-connect ho jaata 👀📶',
    'Acha suno, dil ko confuse nahi, thoda sa pamper karo bas 💋',
    'Arrey wah, rizz toh full Hyderabadi hai. Ab plan bhi solid karo na 😭✨',
    'Chachi ka kehna hai: green flags sirf bolte nahi, follow-through bhi karte hain beta 💅💌'
  ];
  return replies[Math.floor(Math.random() * replies.length)];
};
const toLocalDateTimeInput = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? '' : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
async function request(path, options = {}) {
  let response;
  try { response = await fetch('/api/' + path, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options }); }
  catch { throw new Error('Connection hiccup. Check your internet and try again.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something glitched. Try again.');
  return data;
}
function App() {
  const resetToken = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', []);
  const [tab, setTab] = useState(() => resetToken ? 'account' : 'home');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState(() => resetToken ? 'reset' : 'register');
  const [resetMessage, setResetMessage] = useState('');
  const [bursts, setBursts] = useState([]);
  const [auth, setAuth] = useState({ email: '', password: '', handle: '', adult: false, consent: false });
  const [authError, setAuthError] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [invite, setInvite] = useState('');
  const [qr, setQr] = useState('');
  const [inviteInfo, setInviteInfo] = useState(null);
  const [connections, setConnections] = useState([]);
  const [activeConnection, setActiveConnection] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [moments, setMoments] = useState([]);
  const [dailyAnswers, setDailyAnswers] = useState([]);
  const [dailyAnswer, setDailyAnswer] = useState('');
  const dailyAnswerDirty = useRef(false);
  const [memoryDraft, setMemoryDraft] = useState('');
  const [inviteReply, setInviteReply] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [chatSuggestionShown, setChatSuggestionShown] = useState({});
  const [dismissedSuggestions, setDismissedSuggestions] = useState({});
  const [chachiReply, setChachiReply] = useState('');
  const [inviteAccepted, setInviteAccepted] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [datePlan, setDatePlan] = useState(null);
  const [planDateTime, setPlanDateTime] = useState(() => { const d = new Date(Date.now() + 7 * 86400000); d.setHours(17, 0, 0, 0); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); });
  const inviteToken = useMemo(() => window.location.pathname.match(/^\/invite\/([A-Za-z0-9_-]+)\/?$/)?.[1] || '', []);
  function handleMicroReaction(e) {
    const target = e.target.closest('button, .brand-card');
    if (!target || target.disabled) return;
    const rect = target.getBoundingClientRect();
    const emojis = ['💗','💋','🦋','✨','🫶','💌','👀','💘'];
    const id = Date.now() + Math.random();
    setBursts(prev => [...prev, { id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, emoji: emojis[Math.floor(Math.random() * emojis.length)] }].slice(-8));
    setTimeout(() => setBursts(prev => prev.filter(item => item.id !== id)), 900);
  }

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const onInstallPrompt = (event) => { event.preventDefault(); setInstallPrompt(event); };
    const onInstalled = () => { setInstallPrompt(null); setToast('AFTERDARK is on your home screen. Keep it mutual 💗'); };
    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onInstallPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);
  async function installApp() {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setToast('You already have AFTERDARK installed. 💗'); return;
    }
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        setToast(choice?.outcome === 'accepted' ? 'Installing AFTERDARK… 💗' : 'No pressure. You can install it whenever you want.');
      } catch { setToast('Open your browser menu and choose Install app.'); }
      setInstallPrompt(null); return;
    }
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      setToast('On iPhone: tap Share ↑, then “Add to Home Screen”.'); return;
    }
    if (/android/i.test(navigator.userAgent)) {
      window.location.href = 'https://github.com/Dipayanhaldar/AFTERDARK/releases/latest/download/afterdark.apk';
      return;
    }
    setToast('Open your browser menu (⋮) and choose “Install app” or “Add to Home screen”.');
  }
  useEffect(() => { request('me').then(data => { setUser(data.user); if (data.user) loadConnections(); }).catch(() => {}); }, []);
  useEffect(() => {
    if (inviteToken) request('invites/' + inviteToken).then(d => setInviteInfo(d.invite)).catch(e => setInviteReply(e.message));
  }, [inviteToken, user]);
  useEffect(() => {
    if (!activeConnection || !user) { setMessages([]); return; }
    let alive = true;
    const loadMessages = () => request('connections/' + activeConnection + '/messages').then(d => { if (alive) setMessages(d.messages || []); }).catch(e => { if (alive) setToast(e.message); });
    setMessages([]); loadMessages();
    const timer = window.setInterval(loadMessages, 7000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [activeConnection, user]);
  const dailyKey = new Date().toISOString().slice(0, 10);
  const dailyPrompt = dailyPrompts[Math.floor(Date.parse(dailyKey) / 86400000) % dailyPrompts.length];
  useEffect(() => {
    if (!activeConnection || !user) { dailyAnswerDirty.current = false; setMoments([]); setDailyAnswers([]); setDailyAnswer(''); return; }
    let alive = true;
    dailyAnswerDirty.current = false;
    const loadMoments = () => request('connections/' + activeConnection + '/moments?dayKey=' + dailyKey).then(d => {
      if (!alive) return;
      setMoments(d.moments || []); setDailyAnswers(d.answers || []);
      if (!dailyAnswerDirty.current) { const mine = (d.answers || []).find(a => a.userId === d.currentUserId); setDailyAnswer(mine?.text || ''); }
    }).catch(() => {});
    loadMoments();
    const timer = window.setInterval(loadMoments, 15000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [activeConnection, user, dailyKey]);
  useEffect(() => { if (tab === 'date' && activeConnection && user) request('connections/' + activeConnection + '/date-plan').then(d => { setDatePlan(d.plan || null); if (d.plan?.theirChoice && !d.plan?.lockedPlaceId) setPlanDateTime(toLocalDateTimeInput(d.plan.theirChoice.dateTime)); }).catch(e => setToast(e.message)); }, [tab, activeConnection, user]);
  async function loadConnections() { try { const d = await request('connections'); setConnections(d.connections || []); if (!activeConnection && d.connections?.[0]) setActiveConnection(d.connections[0].id); if (d.connections?.[0]?.role === 'invitee') setTab('chat'); } catch {} }
  async function submitAuth(e) {
    e.preventDefault(); setAuthError(''); setResetMessage(''); setBusy(true);
    try {
      if (authMode === 'forgot') {
        const data = await request('forgot-password', { method: 'POST', body: JSON.stringify({ email: auth.email }) });
        setResetMessage(data.message || 'If that email is registered, a reset link will arrive shortly. Check your inbox and spam folder.');
      } else if (authMode === 'reset') {
        const data = await request('reset-password', { method: 'POST', body: JSON.stringify({ token: resetToken, password: auth.password }) });
        setResetMessage(data.message || 'Password updated. Sign in with your new password.');
        setAuth(p => ({ ...p, password: '' })); setAuthMode('login'); history.replaceState({}, '', '/');
      } else {
        const data = await request(authMode === 'register' ? 'register' : 'login', { method: 'POST', body: JSON.stringify({ ...auth, adult: auth.adult || ageConfirmed, consent: auth.consent || ageConfirmed }) });
        setUser(data.user); setToast(authMode === 'register' ? 'You’re in. Now make it mutual ✨' : 'You’re back, bestie.');
        if (inviteToken) { const d = await request('invites/' + inviteToken); setInviteInfo(d.invite); } else setTab('invite');
        await loadConnections();
      }
    } catch (e) { setAuthError(e.message); }
    finally { setBusy(false); }
  }
  async function createInvite() {
    setBusy(true); setToast('');
    try { const data = await request('invites', { method: 'POST', body: '{}' }); const link = location.origin + '/invite/' + data.invite; setInvite(link); const image = await QRCode.toDataURL(link, { width: 600, margin: 2, color: { dark: '#251226', light: '#ffffff' }, errorCorrectionLevel: 'H' }); setQr(image); setToast('Invite ready. Share it with your person, not the whole timeline.'); }
    catch (e) { setToast(e.message); }
    finally { setBusy(false); }
  }
  async function respondToInvite(action) {
    if (action === 'approve' && !ageConfirmed) { setToast('Please confirm you are 18 or older first.'); return; }
    setBusy(true);
    try {
      await request('invites/' + inviteToken + '/' + action, { method: 'POST', body: JSON.stringify({ adult: ageConfirmed }) });
      setInviteReply(action === 'approve' ? 'Approved! The vibe is mutual 💗 Your chat is ready — no account needed.' : 'Aiyo bro, ee saari scene set avvaledhu 💔');
      if (action === 'approve') { setInviteAccepted(true); const me = await request('me'); setUser(me.user); await loadConnections(); setTab('chat'); }
    } catch (e) { setInviteReply(e.message); }
    finally { setBusy(false); }
  }
  async function sendMessage(e) {
    e.preventDefault(); const text = draft.trim(); if (!text || !activeConnection) return;
    setBusy(true);
    try { const d = await request('connections/' + activeConnection + '/messages', { method: 'POST', body: JSON.stringify({ text }) }); setMessages(prev => [...prev, d.message]); setDraft(''); const matched = suggestionsFor(text); if (matched.length && !chatSuggestionShown[activeConnection]) { setChatSuggestionShown(prev => ({ ...prev, [activeConnection]: true })); setToast(vibeLines[Math.floor(Math.random() * vibeLines.length)]); } }
    catch (e) { setToast(e.message); }
    finally { setBusy(false); }
  }
  async function saveDailyAnswer(e) {
    e.preventDefault();
    if (!activeConnection || !dailyAnswer.trim()) return;
    try {
      const data = await request('connections/' + activeConnection + '/moments', { method: 'POST', body: JSON.stringify({ type: 'answer', dayKey: dailyKey, promptId: dailyPrompt.id, text: dailyAnswer.trim() }) });
      setDailyAnswers(data.answers || []); dailyAnswerDirty.current = false; setToast('Daily answer saved for you two 💗');
    } catch (e) { setToast(e.message); }
  }
  async function saveSharedMemory(e) {
    e.preventDefault();
    if (!activeConnection || !memoryDraft.trim()) return;
    try {
      const data = await request('connections/' + activeConnection + '/moments', { method: 'POST', body: JSON.stringify({ type: 'memory', text: memoryDraft.trim() }) });
      setMoments(prev => [data.moment, ...prev]); setMemoryDraft(''); setToast('Memory saved in your private space ✨');
    } catch (e) { setToast(e.message); }
  }
  async function deleteSharedMemory(id) {
    if (!confirm('Delete this memory from your private space?')) return;
    try { await request('connections/' + activeConnection + '/moments/' + id, { method: 'DELETE' }); setMoments(prev => prev.filter(m => m.id !== id)); setToast('Memory deleted.'); }
    catch (e) { setToast(e.message); }
  }
  function generateChachiReply() { const incoming = [...messages].reverse().find(m => m.senderId !== user?.id)?.text || messages[messages.length - 1]?.text || ''; setChachiReply(chachiReplyFor(incoming)); }
  async function sendGamePrompt(prompt) {
    if (!activeConnection) return;
    try { const data = await request('connections/' + activeConnection + '/messages', { method: 'POST', body: JSON.stringify({ text: prompt }) }); setMessages(prev => [...prev, data.message]); setToast('Game prompt sent. Your person’s turn 👀'); }
    catch (e) { setToast(e.message); }
  }
  async function chooseDateSpot(placeId) {
    if (!activeConnection) { setToast('First connect with your person after they approve your invite.'); return; }
    if (!planDateTime || new Date(planDateTime).getTime() <= Date.now()) { setToast('Choose a future date and time first.'); return; }
    try {
      const data = await request('connections/' + activeConnection + '/date-plan', { method: 'POST', body: JSON.stringify({ placeId, dateTime: new Date(planDateTime).toISOString() }) });
      setDatePlan(data.plan);
      setToast(data.plan?.lockedPlaceId ? 'Mutual plan locked! Date is on 💗' : 'Your choice is saved. Your person chooses too. 💌');
    } catch (e) { setToast(e.message); }
  }
  function downloadDateCalendar() {
    if (!datePlan?.lockedPlaceId) return;
    const place = dateSpots.find(p => p.id === datePlan.lockedPlaceId);
    if (!place) return;
    const start = new Date(datePlan.lockedDateTime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//AFTERDARK//Date Plan//EN\r\nBEGIN:VEVENT\r\nUID:afterdark-' + activeConnection + '@afterdark\r\nDTSTAMP:' + fmt(new Date()) + '\r\nDTSTART:' + fmt(start) + '\r\nDTEND:' + fmt(end) + '\r\nSUMMARY:AFTERDARK date 💗\r\nLOCATION:' + place.name + ', Hyderabad\r\nDESCRIPTION:Your mutually chosen AFTERDARK date. Meet in public and respect each other’s boundaries.\r\nEND:VEVENT\r\nEND:VCALENDAR';
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'afterdark-date.ics'; a.click(); URL.revokeObjectURL(url);
  }
  async function blockActiveConnection() {
    if (!activeConnection || !confirm('Block this person? Your private chat will close for both accounts.')) return;
    try { await request('connections/' + activeConnection + '/block', { method: 'POST', body: '{}' }); setConnections(prev => prev.filter(c => c.id !== activeConnection)); setActiveConnection(''); setMessages([]); setDatePlan(null); setToast('Blocked. This connection is now closed.'); }
    catch (e) { setToast(e.message); }
  }
  async function reportActiveConnection() {
    if (!activeConnection) return;
    const reason = prompt('What should our safety team know? Do not include passwords or private financial details.');
    if (!reason || !reason.trim()) return;
    try { await request('connections/' + activeConnection + '/report', { method: 'POST', body: JSON.stringify({ reason: reason.trim().slice(0, 1000) }) }); setToast('Report submitted. Thanks for helping keep this space safer.'); }
    catch (e) { setToast(e.message); }
  }
  async function signOut() { try { await request('logout', { method: 'POST', body: '{}' }); } catch {} setUser(null); setConnections([]); setMessages([]); setActiveConnection(''); setInvite(''); setQr(''); setToast('Signed out. Take care, bestie.'); }
  const active = connections.find(c => c.id === activeConnection);
  const isInvitee = active?.role === 'invitee';
  const contextualBrands = suggestionsFor(messages.slice(-3).map(m => m.text).join(' '));
  const showInviteLanding = Boolean(inviteToken && !isInvitee && !inviteAccepted);
  return <div className="app-shell" onClick={handleMicroReaction}>
    <header className="topbar"><a className="wordmark" href="/" onClick={e => { e.preventDefault(); history.pushState({}, '', '/'); setTab('home'); }} aria-label="AFTERDARK home"><span className="moon">☾</span> AFTERDARK<span className="dot">.</span></a><div className="top-actions"><span className="adult-pill">18+ ONLY</span>{user ? <><span className="user-pill">@{user.handle}</span><button className="ghost-btn" onClick={signOut}>Log out</button></> : <button className="ghost-btn" onClick={() => { setAuthMode('login'); setTab('account'); }}>Sign in</button>}<button className="ghost-btn" onClick={() => setTab('safety')}>Safety</button><button className="install-btn" onClick={installApp} aria-label="Install or download AFTERDARK app">↓ <span>Download App</span></button></div></header>
    <main>
      {!ageConfirmed && <section className="age-note"><div><strong>Adults only. Always.</strong><p>AFTERDARK is for people aged 18 and above. Keep it consensual.</p></div><button className="primary-btn small" onClick={() => setAgeConfirmed(true)}>I’m 18 or older</button></section>}
      {showInviteLanding ? <section className="invite-landing glass-panel"><span className="eyebrow">SOMEONE THOUGHT OF YOU ✦</span><h1>Ohooo, <em>you got a vibe invite.</em></h1>{inviteReply ? <p className="invite-result">{inviteReply}</p> : inviteInfo ? <><p>{inviteInfo.ownInvite ? 'This is your link, bestie. Share it with your person to let them choose.' : 'One person. One choice. No pressure. Approve only if you want to.'}</p>{!inviteInfo.ownInvite && inviteInfo.status === 'pending' && <><p className="guest-note">No sign-up needed. Confirm you’re 18+, choose approve or ignore, then chat privately.</p><div className="hero-actions"><button className="primary-btn" disabled={busy || !ageConfirmed} onClick={() => respondToInvite('approve')}>Approve the vibe 💗</button><button className="secondary-btn" disabled={busy} onClick={() => respondToInvite('ignore')}>Not my scene</button></div></>}</> : <p>{inviteReply || 'Checking this invite…'}</p>}</section> : <section className="hero"><div className="eyebrow"><span className="pulse"></span> YOUR LITTLE WORLD, OFF THE TIMELINE</div><h1>It’s giving <em>butterflies.</em><br/>Not another <span className="gradient-text">almost-love.</span></h1><p className="hero-copy">Soft launch the feelings. Drop the “wyd?” at 1:13 AM. Turn “we should” into “I booked it.” Your little corner of romance, chaos and mutual vibes. 💋</p><div className="hero-flirt"><span>“u up?”</span><span>“only for you 👀”</span><span>delulu? maybe. mutual? hopefully. 💗</span></div><div className="hero-actions"><button className="primary-btn" onClick={() => { setTab(isInvitee ? 'chat' : user ? 'invite' : 'account'); document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' }); }}>{isInvitee ? 'Open your private chat' : user ? 'Create your invite' : 'Get your invite link'} <span>↗</span></button></div><div className="trust-row"><span>✦ Consent first</span><span>✦ Private by design</span><span>✦ No public discovery</span></div><div className="orb orb-one"></div><div className="orb orb-two"></div><div className="heart-3d" aria-hidden="true"><div className="heart-core">♥</div><span className="heart-chip chip-one">💌</span><span className="heart-chip chip-two">🦋</span><span className="heart-chip chip-three">💋</span></div></section>}
      <section className="workspace" id="workspace"><div className="section-heading"><div><div className="eyebrow">THE AFTERDARK SPACE</div><h2>Your connection, your rules.</h2></div><span className="preview-tag">YOUR PRIVATE SPACE</span></div>
        <nav className="tabs" aria-label="App sections">{[['home','Overview'],['account',user?.guest ? 'Save your chat' : 'Sign in / Join'],['invite','Invite + QR'],['chat','Your chat'],['date','Date plan'],['privacy','Privacy'],['safety','Boundaries']].filter(([id]) => !isInvitee || ['chat','date','privacy','safety'].includes(id)).map(([id,label]) => <button key={id} className={tab === id ? 'tab active' : 'tab'} onClick={() => setTab(id)}>{label}</button>)}</nav>
        {tab === 'home' && <div className="feature-grid"><article className="feature-card invite-card"><div className="card-icon">↗</div><span className="card-kicker">START WITH YOUR PERSON</span><h3>One link.<br/>One intentional choice.</h3><p>Share a link or QR through WhatsApp or Instagram. They decide whether to approve or ignore. No approval, no chat.</p><button className="text-btn" onClick={() => setTab(user ? 'invite' : 'account')}>Make an invite <span>→</span></button></article><article className="feature-card"><div className="card-icon pink">♡</div><span className="card-kicker">WHEN IT'S MUTUAL</span><h3>A space for just you two.</h3><p>Private chat, daily questions, mini games, dares, shared memories and boundaries — unlocked only after approval.</p><span className="coming-label">MORE MOMENTS COMING</span></article><article className="feature-card"><div className="card-icon lilac">✧</div><span className="card-kicker">LESS “WHAT NOW?”</span><h3>Turn the vibe into a plan.</h3><p>Matcha this Sunday? Movie night? A small gift? Tiny suggestions can turn “we should” into an actual plan.</p></article></div>}
        {tab === 'account' && <div className="auth-layout"><div><span className="card-kicker">YOUR SPACE STARTS HERE</span><h3>{authMode === 'register' ? 'Join the private side.' : authMode === 'forgot' ? 'Lost the password, bestie?' : authMode === 'reset' ? 'New password, new chapter.' : 'Back for the plot?'}</h3><p>{authMode === 'forgot' ? 'We’ll send a one-time reset link to your email if an account matches. Check spam too.' : authMode === 'reset' ? 'Pick a strong new password. Your reset link expires after one hour.' : 'Your person gets your vibe, never your password. Keep your account yours.'}</p><button className="text-btn" onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setAuthError(''); setResetMessage(''); }}>{authMode === 'register' ? 'Already here? Sign in →' : 'New here? Create an account →'}</button></div><form className="auth-form" onSubmit={submitAuth}>{authMode !== 'reset' && <label>Email<input type="email" required autoComplete="email" value={auth.email} onChange={e => setAuth({...auth,email:e.target.value})} placeholder="you@example.com"/></label>}{authMode === 'register' && <label>Your handle (optional)<input value={auth.handle} onChange={e => setAuth({...auth,handle:e.target.value})} maxLength="24" placeholder="maincharacter"/></label>}{(authMode === 'register' || authMode === 'login' || authMode === 'reset') && <label>{authMode === 'reset' ? 'New password' : 'Password'}<input type="password" required minLength="10" autoComplete={authMode === 'register' || authMode === 'reset' ? 'new-password' : 'current-password'} value={auth.password} onChange={e => setAuth({...auth,password:e.target.value})} placeholder="At least 10 characters"/></label>}{authMode === 'register' && <div className="checks"><label className="check"><input type="checkbox" checked={auth.adult} onChange={e => setAuth({...auth,adult:e.target.checked})}/> I’m 18 or older.</label><label className="check"><input type="checkbox" checked={auth.consent} onChange={e => setAuth({...auth,consent:e.target.checked})}/> I agree to use this space respectfully.</label></div>}{authError && <p className="form-error" role="alert">💔 {authError}</p>}{resetMessage && <p className="form-success" role="status">💌 {resetMessage}</p>}{authMode === 'login' && <button type="button" className="text-btn forgot-link" onClick={() => { setAuthMode('forgot'); setAuthError(''); setResetMessage(''); }}>Forgot password? Get a reset link →</button>}{authMode === 'forgot' ? <button className="primary-btn full" disabled={busy}>{busy ? 'Sending the love note…' : 'Email me a reset link 💌'}</button> : authMode === 'reset' ? <button className="primary-btn full" disabled={busy}>{busy ? 'Saving…' : 'Set new password 💗'}</button> : <button className="primary-btn full" disabled={busy}>{busy ? 'One sec…' : authMode === 'register' ? 'Create my account ↗' : 'Sign in ↗'}</button>}{authMode === 'forgot' && <button type="button" className="text-btn" onClick={() => { setAuthMode('login'); setAuthError(''); setResetMessage(''); }}>Back to sign in →</button>}</form></div>}
        {tab === 'invite' && <div className="panel invite-panel"><div className="panel-copy"><span className="card-kicker">YOUR PERSONAL INVITE</span><h3>Make the first move.<br/><em>Keep it mutual.</em></h3><p>Only signed-in users can create an invite. Your person can scan the QR or open your link, then choose for themselves.</p><button className="primary-btn" disabled={!user || busy} onClick={createInvite}>{!user ? 'Sign in to make an invite' : busy ? 'Making your link…' : 'Generate my invite'} <span>↗</span></button>{!user && <button className="text-btn" onClick={() => setTab('account')}>Join or sign in →</button>}</div><div className="invite-box"><div className="link-symbol">⌁</div><strong>Your invite + QR</strong><p className="muted">One link for your person. Valid for 7 days.</p>{invite ? <><div className="generated-link">{invite}</div><div className="invite-actions"><button className="secondary-btn" onClick={async()=>{try{await navigator.clipboard.writeText(invite);setToast('Copied! Now drop it in their DMs 💌')}catch{setToast('Copy not available. Long-press the link to copy.')}}}>Copy link</button><a className="secondary-btn" href={qr} download="afterdark-invite-qr.png">Save QR image</a></div><img className="qr-image" src={qr} alt="Scannable AFTERDARK invitation QR code"/><p className="qr-hint">Save it to your gallery, then send the image. Easy scene.</p></> : <div className="empty-link">Your private link and QR will show up here</div>}</div></div>}
        {tab === 'chat' && <div className="chat-layout"><aside className="chat-sidebar"><span className="card-kicker">YOUR PEOPLE</span>{connections.length ? connections.map(c => <button key={c.id} className={'connection-item '+(activeConnection===c.id?'selected':'')} onClick={()=>setActiveConnection(c.id)}><span className="avatar-dot">♡</span><span>{c.handle}</span><span className="online-dot"/></button>) : <p className="muted">No mutual vibes yet. Your chat unlocks after your person approves an invite.</p>}</aside><div className="chat-main"><div className="chat-title"><span className="avatar-dot">♡</span><div><strong>{active?.handle || 'Your private chat'}</strong><small>Just you two. Keep it kind.</small></div>{activeConnection && <div className="chat-safety-actions"><button type="button" className="text-btn" onClick={reportActiveConnection}>Report</button><button type="button" className="danger-btn" onClick={blockActiveConnection}>Block</button></div>}</div><div className="message-list">{activeConnection ? messages.map((m, index) => <React.Fragment key={m.id}><div className={'message '+(m.senderId===user?.id?'mine':'theirs')}><p>{m.text}</p><small>{new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></div>{suggestionsFor(m.text).map(b => <article className={'chat-brand-card brand-'+b.slug} key={b.slug}><span className="chat-brand-logo" style={{background:b.color}}>{b.logo}</span><div className="chat-brand-copy"><small>THE CHAT IS GIVING… · {b.name.toUpperCase()}</small><p>{b.pitch}</p><a href={b.url} target="_blank" rel="noreferrer">{b.cta} <span aria-hidden="true">↗</span></a></div></article>)}{user?.guest && index === 3 && <aside className="guest-account-nudge"><span>💌</span><div><strong>Want to keep your vibe?</strong><p>Chat works without an account. Sign up or sign in whenever you feel like saving your space.</p><button type="button" className="text-btn" onClick={() => { setAuthMode('register'); setTab('account'); }}>Optional account · no pressure →</button><button type="button" className="text-btn" onClick={() => { setAuthMode('login'); setTab('account'); }}>Already have an account? Sign in →</button></div></aside>}</React.Fragment>) : <div className="chat-empty"><span>☾</span><strong>Chat unlocks when the vibe is mutual.</strong><p>Share your invite. They choose. Then the conversation is yours.</p></div>}</div>{activeConnection && <section className="ritual-panel"><div className="ritual-head"><span className="card-kicker">TODAY’S LITTLE RITUAL</span><span className="ritual-date">{dailyKey}</span></div><h4>Daily question 💌</h4><p className="ritual-question">{dailyPrompt.question}</p><form className="ritual-answer-form" onSubmit={saveDailyAnswer}><textarea value={dailyAnswer} onChange={e=>{dailyAnswerDirty.current = true; setDailyAnswer(e.target.value);}} maxLength="500" rows="2" placeholder="Your honest answer, no pressure…"/><button className="primary-btn" disabled={!dailyAnswer.trim()}>Save answer</button></form><div className="ritual-answers">{dailyAnswers.map(a=><div className="ritual-answer" key={a.id}><strong>{a.userId===user?.id?'Your answer':'Their answer'}</strong><p>{a.text}</p></div>)}</div><div className="ritual-games"><strong>Quick game starters</strong><div><button type="button" className="secondary-btn" onClick={()=>sendGamePrompt('THIS OR THAT 💗: Matcha date or biryani date? Tell me your pick and why.')}>This or that</button><button type="button" className="secondary-btn" onClick={()=>sendGamePrompt('TWO TRUTHS & A LIE 👀: Send me three statements — two true, one false. I’ll guess the lie.')}>Two truths & a lie</button><button type="button" className="secondary-btn" onClick={()=>sendGamePrompt('TINY DARE 🦋: Send me a song that matches your current mood. No pressure to share anything private.')}>Tiny dare</button></div></div><form className="ritual-memory-form" onSubmit={saveSharedMemory}><label htmlFor="memory-draft">Save a little memory</label><div><input id="memory-draft" value={memoryDraft} onChange={e=>setMemoryDraft(e.target.value)} maxLength="1000" placeholder="That funny thing we want to remember…"/><button className="primary-btn" disabled={!memoryDraft.trim()}>Save</button></div></form>{moments.filter(m=>m.type==='memory').map(m=><article className="saved-memory" key={m.id}><p>{m.text}</p><small>{new Date(m.createdAt).toLocaleDateString()} · {m.userId===user?.id?'You saved this':'Your person saved this'}</small>{m.userId===user?.id && <button type="button" className="text-btn" onClick={()=>deleteSharedMemory(m.id)}>Delete</button>}</article>)}</section>}{activeConnection && messages.length > 0 && <section className="chachi-helper"><div className="chachi-helper-heading"><span className="chachi-avatar">✦</span><div><strong>Chachi AI</strong><small>Hyderabadi reply ideas · no API key needed</small></div><button type="button" className="secondary-btn chachi-generate" onClick={generateChachiReply}>Chachi, reply kya doon? ✨</button></div>{chachiReply && <div className="chachi-reply"><p>{chachiReply}</p><div><button type="button" className="primary-btn small" onClick={() => { setDraft(chachiReply); setToast('Reply added to your draft. Send it only if it feels like you 💗'); }}>Use this reply</button><button type="button" className="text-btn" onClick={generateChachiReply}>One more line ↻</button></div></div>}</section>}
        <form className="chat-composer" onSubmit={sendMessage}><input value={draft} onChange={e=>setDraft(e.target.value)} maxLength="2000" placeholder={activeConnection ? 'Drop a message, bestie…' : 'Your chat unlocks after approval'} disabled={!activeConnection || busy}/><button className="primary-btn" disabled={!activeConnection || !draft.trim() || busy}>Send ↗</button></form></div></div>}
        {tab === 'date' && <div className="date-planner">
          <div className="explore-intro"><span className="card-kicker">HYDERABAD DATE PLANNER</span><h3>Make a plan, not a <em>“we should.”</em></h3><p>Pick a public place and a future time. Your plan locks only when both people choose the same place and time.</p></div>
          {!activeConnection ? <div className="empty-link">Your date planner unlocks after your person approves an invite and you have a mutual connection.</div> : <>
            <label className="date-time-label">Choose a date & time <input type="datetime-local" value={planDateTime} min={toLocalDateTimeInput(Date.now() + 60000)} onChange={e=>setPlanDateTime(e.target.value)} disabled={Boolean(datePlan?.lockedPlaceId)} /></label>
            {datePlan?.lockedPlaceId ? <div className="date-locked"><span className="card-kicker">MUTUAL PLAN LOCKED 💗</span><h4>{dateSpots.find(p=>p.id===datePlan.lockedPlaceId)?.name || 'Your date'} · Hyderabad</h4><p>{new Date(datePlan.lockedDateTime).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})}</p><a className="secondary-btn" href={'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent((dateSpots.find(p=>p.id===datePlan.lockedPlaceId)?.name || 'Hyderabad')+', Hyderabad')} target="_blank" rel="noreferrer">Open Google Maps ↗</a><a className="secondary-btn" href={'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent('AFTERDARK date 💗')+'&dates='+encodeURIComponent(new Date(datePlan.lockedDateTime).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')+'/'+new Date(new Date(datePlan.lockedDateTime).getTime()+7200000).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''))+'&location='+encodeURIComponent((dateSpots.find(p=>p.id===datePlan.lockedPlaceId)?.name || 'Hyderabad')+', Hyderabad')} target="_blank" rel="noreferrer">Add to Google Calendar ↗</a><button className="primary-btn" onClick={downloadDateCalendar}>Download .ics calendar</button></div> : <p className="date-status">{datePlan?.myChoice ? 'Your choice is saved. ' : ''}{datePlan?.theirChoice ? <>Your person picked <strong>{dateSpots.find(p=>p.id===datePlan.theirChoice.placeId)?.name || 'a place'}</strong> for {new Date(datePlan.theirChoice.dateTime).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})}. Choose the same place and time to lock it.</> : 'Your person still needs to choose. No pressure, no lock until it matches.'}</p>}
            <div className="date-grid">{dateSpots.map(p=><article className={'date-card '+(datePlan?.myChoice?.placeId===p.id?'date-card-selected':'')} key={p.id}><span className="date-pin">♡</span><small>{p.area}</small><h4>{p.name}</h4><p>{p.desc}</p><div className="date-card-actions"><a href={'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.name+', Hyderabad')} target="_blank" rel="noreferrer">Map ↗</a><button className="secondary-btn" onClick={()=>chooseDateSpot(p.id)} disabled={Boolean(datePlan?.lockedPlaceId)}>{datePlan?.myChoice?.placeId===p.id?'Chosen ✓':'Choose this'}</button></div></article>)}</div>
          </>}
        </div>}
        {tab === 'privacy' && <div className="safety-grid"><div><span className="card-kicker">YOUR DATA, YOUR BOUNDARIES</span><h3>Private by design.<br/><em>Clear by choice.</em></h3><p>AFTERDARK is for adults 18+. Your account and messages are used to provide invite-only chat and date planning. We do not offer public people search.</p><p>Messages are automatically deleted after 30 days. Invitation links expire after 7 days. Passwords are stored as salted hashes, not plain text.</p><p>Reports are stored for safety review. Do not send passwords, financial details, or sensitive personal information in a report.</p>{user && <button className="danger-btn" onClick={async()=>{if(!confirm('Delete your account and associated chats? This cannot be undone.'))return;try{await request('delete-account',{method:'DELETE',body:'{}'});setUser(null);setConnections([]);setMessages([]);setDatePlan(null);setToast('Account deleted. Take care.')}catch(e){setToast(e.message)}}}>Delete my account and associated data</button>}</div><ul className="safety-list"><li><span>✓</span><div><strong>Invite-only</strong><p>Profiles are not searchable or listed publicly.</p></div></li><li><span>✓</span><div><strong>7-day invites</strong><p>Invitation tokens expire and are stored as hashes.</p></div></li><li><span>✓</span><div><strong>30-day message retention</strong><p>Messages expire automatically through the database TTL policy.</p></div></li><li><span>✓</span><div><strong>Account deletion</strong><p>Use the button to delete your account, chats, and associated invitations.</p></div></li></ul></div>}
        {tab === 'safety' && <div className="safety-grid"><div><span className="card-kicker">YOUR SPACE, YOUR CALL</span><h3>Consent isn't a setting.<br/><em>It's the foundation.</em></h3><p>Boundaries are real. No approval means no chat, no pressure, no chasing.</p>{user && <><button className="secondary-btn" onClick={async()=>{try{await request('revoke-invites',{method:'POST',body:'{}'});setInvite('');setQr('');setToast('All pending invites revoked. Clean slate.')}catch(e){setToast(e.message)}}}>Revoke pending invites</button><button className="danger-btn" onClick={async()=>{if(!confirm('Delete your account and associated chats? This cannot be undone.'))return;try{await request('delete-account',{method:'DELETE',body:'{}'});setUser(null);setConnections([]);setMessages([]);setToast('Account deleted. Take care.')}catch(e){setToast(e.message)}}}>Delete my account</button></>}</div><ul className="safety-list"><li><span>✓</span><div><strong>Explicit approval</strong><p>Ignoring an invite never unlocks chat.</p></div></li><li><span>✓</span><div><strong>Private by default</strong><p>Only approved people can open their chat.</p></div></li><li><span>✓</span><div><strong>Block and report</strong><p>Use the chat controls to block or report a person.</p></div></li><li><span>✓</span><div><strong>Your call, always</strong><p>Revoke pending invites and delete your account.</p></div></li></ul></div>}
      </section>
      <section className="coming-section"><div className="eyebrow">THE AFTERDARK VIBE</div><h2>Little moments. <em>Big energy.</em></h2><div className="roadmap-grid">{[['01','The invite','A personal link + QR, approve or ignore'],['02','The private space','Messages for approved connections only'],['03','The archive','Memories, milestones, boundaries and shared plans'],['04','The little nudge','Opt-in reminders that never spam your peace']].map(([n,title,desc])=><div className="roadmap-item" key={n}><span>{n}</span><div><strong>{title}</strong><p>{desc}</p></div></div>)}</div></section>
    </main>
    <footer><a className="wordmark" href="/" onClick={e=>{e.preventDefault();setTab('home')}}><span className="moon">☾</span> AFTERDARK<span className="dot">.</span></a><span>For adults, by choice. Not by pressure.</span><div className="footer-links"><button onClick={()=>setTab('safety')}>Safety</button><button onClick={()=>setTab('privacy')}>Privacy</button></div></footer>
    {bursts.map(b => <span key={b.id} className="emoji-burst" style={{ left: b.x, top: b.y }}>{b.emoji}</span>)}
    {toast && <div className="toast" role="status">{toast}<button onClick={()=>setToast('')} aria-label="Dismiss">×</button></div>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
