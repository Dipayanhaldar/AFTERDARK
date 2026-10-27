import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = 'https://afterdark-social-universe.vercel.app/api';
const SESSION_KEY = 'afterdark_guest_session_v1';
const brands = [
  { name: 'Zudio', keys: ['zudio','outfit','clothes','fit','fashion'], line: 'Cute fit, budget intact. Paisa bachao, aura badhao. ✨', url: 'https://www.zudio.com/' },
  { name: 'Zomato', keys: ['food','hungry','biryani','momos','pizza','eat','dinner','lunch'], line: 'Momos or biryani? Stop hinting, start planning. 🌶️', url: 'https://www.zomato.com/' },
  { name: 'Amazon', keys: ['gift','wishlist','shopping','headphones','book','order'], line: 'A tiny surprise can say “I actually listen.” 📦', url: 'https://www.amazon.in/' },
  { name: 'Blinkit', keys: ['snack','chocolate','chips','craving','ice cream','midnight'], line: 'Green-flag move: remember their comfort snack. 💛', url: 'https://blinkit.com/' },
  { name: 'Spotify', keys: ['song','music','playlist','listen'], line: 'One playlist, ten songs, a whole soft-launch soundtrack. 🎧', url: 'https://open.spotify.com/' },
  { name: 'Netflix', keys: ['movie','netflix','series','watch','film'], line: 'Movie plan? Pick the title and lock the time. 🍿', url: 'https://www.netflix.com/' },
  { name: 'BookMyShow', keys: ['cinema','tickets','concert','theatre','show'], line: 'From “we should go” to actual tickets. 🎟️', url: 'https://in.bookmyshow.com/' },
  { name: 'District', keys: ['date','outing','weekend','plan','activity'], line: 'Give that “someday” plan a real date. 🌙', url: 'https://www.district.in/' }
];
const places = {
  'necklace-road': 'Necklace Road · Hussain Sagar',
  'durgam-cheruvu': 'Durgam Cheruvu · Madhapur',
  charminar: 'Charminar · Old City',
  golconda: 'Golconda Fort · Ibrahim Bagh',
  chowmahalla: 'Chowmahalla Palace · Khilwat',
  'lumbini-park': 'Lumbini Park · Hussain Sagar',
  'paradise-biryani': 'Paradise Biryani · Secunderabad',
  'ramoji-film-city': 'Ramoji Film City · Abdullapurmet'
};
async function api(path, { token = '', method = 'GET', body } = {}) {
  const response = await fetch(API + path, {
    method,
    headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'The connection flickered. Try again.');
  return data;
}
function App() {
  const inviteToken = useMemo(() => {
    const match = window.location.pathname.match(/^\/invite\/([A-Za-z0-9_-]{12,160})\/?$/);
    return match?.[1] || '';
  }, []);
  const [stage, setStage] = useState('loading');
  const [inviteInfo, setInviteInfo] = useState(null);
  const [adult, setAdult] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [guestToken, setGuestToken] = useState(() => { try { return localStorage.getItem(SESSION_KEY) || ''; } catch { return ''; } });
  const [user, setUser] = useState(null);
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [moments, setMoments] = useState([]);
  const [plan, setPlan] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const seenMessageIds = useRef(new Set());

  const loadSession = useCallback(async (token) => {
    const data = await api('/guest/session', { token });
    setUser(data.user);
    setConnection(data.connection);
    setStage('chat');
  }, []);

  const loadChat = useCallback(async () => {
    if (!guestToken || !connection?.id) return;
    try {
      const [messageData, momentData, planData] = await Promise.all([
        api('/guest/connections/' + connection.id + '/messages', { token: guestToken }),
        api('/guest/connections/' + connection.id + '/moments', { token: guestToken }),
        api('/guest/connections/' + connection.id + '/date-plan', { token: guestToken })
      ]);
      setMessages(messageData.messages || []);
      setMoments(momentData.moments || []);
      setPlan(planData.plan || null);
      seenMessageIds.current = new Set((messageData.messages || []).map(m => m.id));
    } catch (e) { setError(e.message); }
  }, [guestToken, connection?.id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (guestToken) {
          try {
            const data = await api('/guest/session', { token: guestToken });
            if (!alive) return;
            setUser(data.user); setConnection(data.connection); setStage('chat');
            return;
          } catch {
            try { localStorage.removeItem(SESSION_KEY); } catch {}
            if (alive) setGuestToken('');
          }
        }
        if (!inviteToken) { if (alive) setStage('landing'); return; }
        const data = await api('/invites/' + encodeURIComponent(inviteToken));
        if (!alive) return;
        setInviteInfo(data.invite);
        setStage('invite');
        if (data.invite?.status === 'approved') setError('This invite has already been accepted. The link alone cannot open the private chat. If you accepted it on another browser, return to that browser.');
        else if (data.invite?.ownInvite) setError('This is your own invite. Send it to your person instead.');
      } catch (e) { if (alive) { setError(e.message); setStage('invite'); } }
    })();
    return () => { alive = false; };
  }, [inviteToken, guestToken]);

  useEffect(() => {
    if (stage !== 'chat' || !connection?.id || !guestToken) return;
    loadChat();
    const timer = setInterval(loadChat, 4000);
    return () => clearInterval(timer);
  }, [stage, connection?.id, guestToken, loadChat]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages.length]);

  async function acceptInvite() {
    setError('');
    if (!adult) { setError('Please confirm you are 18 or older.'); return; }
    if (!inviteToken) { setError('This invite link is missing its token. Ask the sender for a fresh link.'); return; }
    setSending(true);
    try {
      const data = await api('/guest/invites/' + encodeURIComponent(inviteToken) + '/approve', { method: 'POST', body: { adult: true, code: inviteCode } });
      try { localStorage.setItem(SESSION_KEY, data.guestSessionToken); } catch {}
      setGuestToken(data.guestSessionToken);
      setUser(data.user); setConnection(data.connection); setStage('chat');
      setError('');
      window.history.replaceState({}, '', '/');
    } catch (e) { setError(e.message); }
    finally { setSending(false); }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending || !connection?.id) return;
    setSending(true); setError('');
    try {
      const data = await api('/guest/connections/' + connection.id + '/messages', { token: guestToken, method: 'POST', body: { text } });
      setMessages(old => [...old.filter(m => m.id !== data.message.id), data.message]);
      setDraft('');
    } catch (e) { setError(e.message); }
    finally { setSending(false); }
  }

  const latestText = messages[messages.length - 1]?.text || '';
  const activeBrand = brands.find(b => b.keys.some(k => latestText.toLowerCase().includes(k)));
  const lockedPlace = plan?.lockedPlaceId ? places[plan.lockedPlaceId] || plan.lockedPlaceId : '';
  const lockedDate = plan?.lockedDateTime ? new Date(plan.lockedDateTime) : null;

  if (stage === 'loading') return <main className="center"><div className="moon">☾</div><p>Opening your private little universe…</p></main>;

  if (stage === 'landing') return <main className="center"><div className="eyebrow">18+ · INVITE ONLY</div><div className="brand-mark">☾ AFTERDARK<span>.</span></div><h1>Some things are<br/><em>just between two.</em></h1><p className="muted">Open the personal invite link shared with you. This site doesn't expose chats through a public profile or directory.</p><a className="button secondary" href="https://afterdark-social-universe.vercel.app/">Back to AFTERDARK</a></main>;

  if (stage === 'invite') return <main className="center invite-screen"><div className="brand-mark">☾ AFTERDARK<span>.</span></div><div className="eyebrow">A PRIVATE INVITATION · 18+</div><h1>Your next chapter<br/><em>starts with a choice.</em></h1><div className="invite-card"><div className="orb">✦</div><p>{inviteInfo?.handle ? '@' + inviteInfo.handle + ' sent you a little invitation.' : 'Someone sent you a little invitation.'}</p><p className="muted small">Accept only if you know who shared this link and genuinely want to connect. Your chat will be private to the two approved participants.</p><label className="code-label">Six-digit private code<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={inviteCode} onChange={e => setInviteCode(e.target.value.replace(/\\D/g, '').slice(0, 6))} placeholder="Ask the sender for the separate code"/></label><p className="muted tiny">The sender should share this code separately from the QR/link. If you only have the link, you cannot enter the chat.</p><label className="check-row"><input type="checkbox" checked={adult} onChange={e => setAdult(e.target.checked)}/><span>I confirm I am 18 or older and choose to open this chat.</span></label><button className="button primary" disabled={sending || inviteCode.length !== 6 || inviteInfo?.status !== 'pending' || Boolean(error && /already been accepted|own invite/.test(error))} onClick={acceptInvite}>{sending ? 'Opening your chat…' : 'Accept & enter private chat'} <span>↗</span></button></div>{error && <div className="error">{error}</div>}<p className="muted small">The invitation link is single-use and requires a separate private code. Once accepted, the link alone cannot reopen the chat on another device.</p></main>;

  if (stage !== 'chat' || !connection) return <main className="center"><div className="brand-mark">☾ AFTERDARK<span>.</span></div><h1>We hit a small plot twist.</h1><p className="muted">{error || 'This private chat is unavailable.'}</p><a className="button secondary" href="https://afterdark-social-universe.vercel.app/">Return to AFTERDARK</a></main>;

  return <div className="app-shell">
    <header className="topbar"><a className="brand-mark compact" href="https://afterdark-social-universe.vercel.app/">☾ AFTERDARK<span>.</span></a><div className="secure-pill"><span/> PRIVATE · 2 PEOPLE</div></header>
    <main className="chat-layout">
      <section className="chat-column">
        <div className="chat-heading"><div><div className="eyebrow">YOUR PRIVATE UNIVERSE</div><h1>Hey, <em>{connection.handle}</em></h1><p className="muted">No public profile. No searchable room. Just this conversation.</p></div><div className="lock-icon">⌁</div></div>
        <div className="messages" aria-live="polite">
          {messages.length === 0 && <div className="empty-chat"><span>✦</span><p>This is the first page of your story.</p><small>Say hi when you're ready. No pressure.</small></div>}
          {messages.map(m => <article key={m.id} className={'message ' + (m.senderId === user?.id ? 'mine' : 'theirs')}><div>{m.text}</div><time>{new Date(m.createdAt).toLocaleString([], { hour:'numeric', minute:'2-digit', month:'short', day:'numeric' })}</time></article>)}
          <div ref={bottomRef}/>
        </div>
        <form className="composer" onSubmit={sendMessage}><input value={draft} onChange={e => setDraft(e.target.value)} maxLength={2000} placeholder="Say something real…" aria-label="Your message"/><button className="send-button" disabled={sending || !draft.trim()} aria-label="Send message">↗</button></form>
        {error && <div className="error inline-error">{error}</div>}
        <p className="muted tiny">Guest mode: chat and view shared content only. Manage your account from the main AFTERDARK site.</p>
      </section>
      <aside className="side-column">
        <section className="side-card"><div className="eyebrow">SHARED MOMENTS</div><h2>Little things, kept.</h2>{moments.length === 0 ? <p className="muted small">When your person saves a shared moment, it will show up here.</p> : <div className="moment-list">{moments.map(m => <article className="moment" key={m.id}><div className="moment-kind">{m.type === 'answer' ? 'DAILY ANSWER' : m.type === 'photo' ? 'PHOTO' : 'MEMORY'}</div>{m.imageData && <img className="moment-photo" src={m.imageData} alt="A shared private photo"/>}{m.text && <p>{m.text}</p>}<time>{new Date(m.createdAt).toLocaleDateString()}</time></article>)}</div>}</section>
        <section className="side-card"><div className="eyebrow">DATE PLAN</div><h2>Out of the group chat.</h2>{lockedPlace && lockedDate ? <><p className="plan-place">{lockedPlace}</p><p className="muted small">{lockedDate.toLocaleString([], { dateStyle:'medium', timeStyle:'short' })}</p><p className="muted tiny">This plan was agreed in AFTERDARK.</p></> : <p className="muted small">When a plan is agreed and shared, the details will appear here.</p>}</section>
        {activeBrand && <a className="brand-card" href={activeBrand.url} target="_blank" rel="noreferrer"><span className="eyebrow">A LITTLE IDEA · {activeBrand.name.toUpperCase()}</span><p>{activeBrand.line}</p><span className="brand-link">Explore {activeBrand.name} ↗</span></a>}
        <div className="floating-note">“Good communication is the real green flag.” <span>— Chachi 🌙</span></div>
        <div className="brand-cloud">{brands.slice(0,4).map(b => <a href={b.url} target="_blank" rel="noreferrer" key={b.name}>{b.name}</a>)}</div>
      </aside>
    </main>
    <footer className="footer">AFTERDARK · 18+ · Your invite is private. Your choice matters.</footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
