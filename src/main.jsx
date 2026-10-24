import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const brands = [
  { name: 'Starbucks', note: 'Matcha date?', category: 'Coffee', url: 'https://www.starbucks.in/' },
  { name: 'Zomato', note: 'Send a little craving', category: 'Food', url: 'https://www.zomato.com/' },
  { name: 'District', note: 'Find your next plan', category: 'Things to do', url: 'https://www.district.in/' },
  { name: 'BookMyShow', note: 'Movie night, sorted', category: 'Movies', url: 'https://in.bookmyshow.com/' },
  { name: 'IGP', note: 'Tiny gift, big hint', category: 'Gifting', url: 'https://www.igp.com/' },
  { name: 'Uber', note: 'Get there together', category: 'Travel', url: 'https://www.uber.com/in/en/' },
];

function App() {
  const [tab, setTab] = useState('home');
  const [invite, setInvite] = useState('');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [inviteState, setInviteState] = useState('waiting');

  const createInvite = () => {
    // Prototype only: real invites must be generated and validated by the server.
    const token = Array.from(crypto.getRandomValues(new Uint8Array(18)), b => b.toString(16).padStart(2, '0')).join('');
    setInvite(window.location.origin + '/invite/' + token);
    setInviteState('waiting');
    setCopied(false);
    setToast('Preview invite created. Server-backed links are not connected yet.');
  };

  const copyInvite = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite);
      setCopied(true);
      setToast('Invite copied. Send it only to the person you choose.');
    } catch {
      setToast('Copy is unavailable here. Select and copy the invite link manually.');
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#" onClick={() => setTab('home')} aria-label="AFTERDARK home">
          <span className="moon">☾</span> AFTERDARK<span className="dot">.</span>
        </a>
        <div className="top-actions"><span className="adult-pill">18+ ONLY</span><button className="ghost-btn" onClick={() => setTab('safety')}>Safety</button></div>
      </header>

      <main>
        {!ageConfirmed && <section className="age-note">
          <div><strong>Adults only. Always.</strong><p>AFTERDARK is designed for people aged 18 and above.</p></div>
          <button className="primary-btn small" onClick={() => setAgeConfirmed(true)}>I'm 18 or older</button>
        </section>}

        <section className="hero">
          <div className="eyebrow"><span className="pulse"></span> YOUR LITTLE WORLD, OFF THE TIMELINE</div>
          <h1>Not just a <em>situationship.</em><br />Make it <span className="gradient-text">your thing.</span></h1>
          <p className="hero-copy">No public swipe circus. No random people in your business. Just you, your person, and a private space you both choose.</p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => { setTab('invite'); document.getElementById('workspace')?.scrollIntoView({behavior:'smooth'}); }}>Create your invite <span>↗</span></button>
            <button className="secondary-btn" onClick={() => { setTab('explore'); document.getElementById('workspace')?.scrollIntoView({behavior:'smooth'}); }}>Explore the vibe</button>
          </div>
          <div className="trust-row"><span>✦ Consent first</span><span>✦ Private by design</span><span>✦ No public discovery</span></div>
          <div className="orb orb-one"></div><div className="orb orb-two"></div>
        </section>

        <section className="workspace" id="workspace">
          <div className="section-heading"><div><div className="eyebrow">THE AFTERDARK SPACE</div><h2>Your connection, your rules.</h2></div><span className="preview-tag">EARLY PREVIEW</span></div>
          <nav className="tabs" aria-label="App sections">
            {[['home','Overview'],['invite','Invite link'],['explore','Vibe drops'],['safety','Boundaries']].map(([id,label]) => <button key={id} className={tab === id ? 'tab active' : 'tab'} onClick={() => setTab(id)}>{label}</button>)}
          </nav>

          {tab === 'home' && <div className="feature-grid">
            <article className="feature-card invite-card"><div className="card-icon">↗</div><span className="card-kicker">START WITH A PERSON</span><h3>One link.<br />One intentional choice.</h3><p>Share your invite through WhatsApp or Instagram. The other person decides whether to approve or ignore. No approval, no chat.</p><button className="text-btn" onClick={() => setTab('invite')}>Make an invite <span>→</span></button></article>
            <article className="feature-card"><div className="card-icon pink">♡</div><span className="card-kicker">WHEN IT'S MUTUAL</span><h3>A space for just you two.</h3><p>Private chat, daily questions, mini games, dares, shared memories and boundaries — unlocked only after mutual approval.</p><span className="coming-label">PLANNED FEATURE</span></article>
            <article className="feature-card"><div className="card-icon lilac">✧</div><span className="card-kicker">LESS “WHAT NOW?”</span><h3>Turn the vibe into a plan.</h3><p>Matcha this Sunday? Movie night? A small gift? Contextual ideas can help turn “we should” into an actual plan.</p><button className="text-btn" onClick={() => setTab('explore')}>Find a vibe <span>→</span></button></article>
          </div>}

          {tab === 'invite' && <div className="panel invite-panel">
            <div className="panel-copy"><span className="card-kicker">YOUR PERSONAL INVITE</span><h3>Make the first move.<br /><em>Keep it mutual.</em></h3><p>Generate a preview link, then share it with the one person you have in mind. The live approval flow is not connected yet, so this preview link does not create an actual account connection.</p><button className="primary-btn" onClick={createInvite}>Generate preview link <span>↗</span></button></div>
            <div className="invite-box"><div className="link-symbol">⌁</div><strong>Your invite link</strong><p className="muted">A private invite starts with a choice.</p>{invite ? <><div className="generated-link">{invite}</div><button className="secondary-btn full" onClick={copyInvite}>{copied ? 'Copied ✓' : 'Copy invite link'}</button><div className="state-row"><span className="state-dot"></span>{inviteState === 'waiting' ? 'Waiting for a real approval flow to be connected' : inviteState}</div></> : <div className="empty-link">Your link will appear here</div>}<small>Preview only · Not a live connection</small></div>
          </div>}

          {tab === 'explore' && <div className="explore-content"><div className="explore-intro"><span className="card-kicker">VIBE DROPS</span><h3>Less scrolling. More <em>“let's go.”</em></h3><p>Ideas and links for the moment you're in. These are independent brand links, not claims of sponsorship.</p></div><div className="brand-grid">{brands.map((brand, i) => <a className="brand-card" href={brand.url} target="_blank" rel="noreferrer" key={brand.name}><span className={'brand-mark mark-' + i}>{brand.name.slice(0,1)}</span><span className="brand-meta"><small>{brand.category}</small><strong>{brand.name}</strong><span>{brand.note}</span></span><span className="external">↗</span></a>)}</div><p className="disclosure">Brand links open the providers' websites. AFTERDARK does not claim a partnership or endorsement.</p></div>}

          {tab === 'safety' && <div className="safety-grid"><div><span className="card-kicker">YOUR SPACE, YOUR CALL</span><h3>Consent isn't a setting.<br /><em>It's the foundation.</em></h3><p>These are product requirements for the live build. They are not all implemented in this preview.</p></div><ul className="safety-list"><li><span>✓</span><div><strong>Explicit approval</strong><p>Ignoring an invite never unlocks chat.</p></div></li><li><span>✓</span><div><strong>Private by default</strong><p>Only the two approved members can read messages.</p></div></li><li><span>✓</span><div><strong>Block and report</strong><p>Safety controls must be available in every connection.</p></div></li><li><span>✓</span><div><strong>Control your data</strong><p>Revoke invites and delete your account and data.</p></div></li></ul></div>}
        </section>

        <section className="coming-section"><div className="eyebrow">THE ROADMAP</div><h2>Little moments. <em>Big energy.</em></h2><div className="roadmap-grid">{[['01','The invite','Unique links, QR download, approve or ignore'],['02','The private space','Server-checked chat, games, questions and dares'],['03','The archive','Memories, milestones, boundaries and shared plans'],['04','The nudge','Opt-in push notifications and a real Android app']].map(([n,title,desc]) => <div className="roadmap-item" key={n}><span>{n}</span><div><strong>{title}</strong><p>{desc}</p></div></div>)}</div></section>
      </main>

      <footer><a className="wordmark" href="#"><span className="moon">☾</span> AFTERDARK<span className="dot">.</span></a><span>For adults, by choice. Not by pressure.</span><span className="footer-status"><i></i> Preview build · backend not connected</span></footer>
      {toast && <div className="toast" role="status">{toast}<button onClick={() => setToast('')} aria-label="Dismiss">×</button></div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
