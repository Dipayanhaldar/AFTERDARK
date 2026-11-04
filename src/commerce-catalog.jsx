import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  GOOGLE_MAPS_DEMO_KEY,
  PUBLIC_SHARED_APP_URL,
  CITY_PROFILES,
  CITY_TREASURE_HUNT_MISSIONS,
  indianQrThemes,
  brandCategories,
  brandCatalog,
  flirtyHindiDrops,
  MONETIZATION_BLUEPRINT,
  detectBrandsInMessage,
  detectImplicitChatBrands,
  getPersonalizedInChatBrandAd,
  analyzeChatContextLocally
} from './commerce-data';
import { getGenZSeenStatusText } from './notification-sound';

export {
  GOOGLE_MAPS_DEMO_KEY,
  PUBLIC_SHARED_APP_URL,
  CITY_PROFILES,
  CITY_TREASURE_HUNT_MISSIONS,
  indianQrThemes,
  brandCategories,
  brandCatalog,
  flirtyHindiDrops,
  MONETIZATION_BLUEPRINT,
  detectBrandsInMessage,
  detectImplicitChatBrands,
  getPersonalizedInChatBrandAd,
  analyzeChatContextLocally
};

/**
 * Renders the brand's official logo image with a clean styled monogram fallback.
 */
export function BrandLogoBadge({ brand, size = 26, showTextBadge = true }) {
  const [imgErr, setImgErr] = useState(false);
  if (!brand) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      {brand.logoUrl && !imgErr ? (
        <img
          src={brand.logoUrl}
          alt={brand.name}
          width={size}
          height={size}
          onError={() => setImgErr(true)}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '7px',
            objectFit: 'contain',
            background: '#ffffff',
            padding: '2px',
            border: `1px solid ${brand.accent || '#ff4f9a'}66`,
            flexShrink: 0
          }}
        />
      ) : (
        <span
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '7px',
            background: brand.logoBg,
            color: brand.logoColor,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.7rem',
            flexShrink: 0
          }}
        >
          {brand.emoji || brand.logoText?.slice(0, 2)}
        </span>
      )}
      {showTextBadge && (
        <span
          className="ad-inchat-brand-logo"
          style={{
            background: brand.logoBg,
            color: brand.logoColor,
            fontSize: '0.68rem',
            padding: '2px 7px'
          }}
        >
          {brand.logoText}
        </span>
      )}
    </span>
  );
}

/**
 * Floating Incoming Message Notification Banner with Sound Control
 */
export function IncomingMessageToast({
  notification,
  soundEnabled,
  onToggleSound,
  onTestSound,
  onDismiss
}) {
  if (!notification) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '18px',
        right: '18px',
        zIndex: 10000,
        maxWidth: '380px',
        width: 'calc(100vw - 36px)',
        background: 'linear-gradient(135deg, #2b0938 0%, #150720 100%)',
        border: '1.5px solid #ff4f9a',
        borderRadius: '16px',
        padding: '12px 14px',
        boxShadow: '0 18px 42px rgba(255, 79, 154, 0.35)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: '#ff4f9a',
              color: '#111',
              fontWeight: 800,
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '99px'
            }}
          >
            🔔 NEW MESSAGE
          </span>
          <strong style={{ fontSize: '0.88rem', color: '#ffd1e6' }}>
            {notification.senderName || 'Your Partner'} texted you ♥
          </strong>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontSize: '0.88rem'
          }}
        >
          ✕
        </button>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: '0.84rem',
          color: '#f8fafc',
          background: 'rgba(255,255,255,0.06)',
          padding: '7px 10px',
          borderRadius: '10px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        “{notification.text}”
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontSize: '0.72rem', opacity: 0.78 }}>
          {soundEnabled ? '🔊 Chime sound played' : '🔇 Sound muted'}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {onTestSound && (
            <button
              type="button"
              onClick={onTestSound}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                borderRadius: '6px',
                padding: '2px 7px',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
            >
              🔊 Replay Chime
            </button>
          )}
          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                borderRadius: '6px',
                padding: '2px 7px',
                fontSize: '0.7rem',
                cursor: 'pointer'
              }}
            >
              {soundEnabled ? 'Mute Alerts' : 'Unmute'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Dynamic Clickable Brand & Keyword Highlighter inside Chat Messages
 */
function renderTextWithClickableAdLinks(text, onOpenBrandDrawer) {
  const raw = String(text || '');
  if (!raw) return null;

  const combinedPattern =
    /(@[a-z0-9_]+|\b(?:amazon|flipkart|minutes|myntra|nykaa|blinkit|zomato|swiggy|instamart|zepto|oyo|niloufer|starbucks|dominos|kfc|baskin|eazydiner|tira|purplle|mamaearth|bella\s*vita|durex|bold\s*care|makemytrip|goibibo|airbnb|uber|ola|rapido|bookmyshow|district|netflix|spotify|fnp|igp|cadbury|lenskart|bigbasket|bbnow|jiomart|boat|croma|tanishq|chaayos|behrouz|winni|chocolates?|ferrero|silk|condoms?|biryani|pizza|dinner|bhookh?|hungry|chai|coffee|cafes?|hotels?|rooms?|stays?|momos|shawarma|roses?|gulab|bouquet|perfume|jhumkas?|outfit|dress|sunglasses|earbuds)\b)/gi;

  const parts = raw.split(combinedPattern);
  return parts.map((part, idx) => {
    if (!part) return null;
    const clean = part.replace(/^@/, '').toLowerCase().trim();
    let matchedBrand =
      brandCatalog.find((b) => b.id === clean || b.name.toLowerCase().includes(clean)) ||
      brandCatalog.find((b) => b.keywords.some((kw) => kw.toLowerCase() === clean));

    if (matchedBrand) {
      return (
        <button
          key={idx}
          type="button"
          className="ad-contextual-keyword-link"
          title={`Private: Open ${matchedBrand.name} offers & real checkout`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onOpenBrandDrawer) onOpenBrandDrawer(matchedBrand.id);
          }}
        >
          {part}
          <span className="ad-keyword-spark">↗</span>
        </button>
      );
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

// Build a direct Google Calendar template link for a couple date / cafe table / candlelight dinner
export function buildGoogleCalendarUrl(dateMeta) {
  if (!dateMeta) return 'https://calendar.google.com';
  const title = encodeURIComponent(dateMeta.title || 'Couple Cafe / Candlelight Date ♥');
  const details = encodeURIComponent(
    `${dateMeta.description || 'Our private AFTERDARK couple date!'}\nPlanned with love ♥`
  );
  const location = encodeURIComponent(dateMeta.location || 'Hyderabad');

  let datesParam = '';
  try {
    const startObj = dateMeta.dateTime
      ? new Date(dateMeta.dateTime)
      : new Date(Date.now() + 3 * 60 * 60 * 1000);
    const endObj = new Date(startObj.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    datesParam = `&dates=${fmt(startObj)}/${fmt(endObj)}`;
  } catch {
    datesParam = '';
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${datesParam}`;
}

export function downloadIcsFile(dateMeta) {
  if (!dateMeta) return;
  const startObj = dateMeta.dateTime
    ? new Date(dateMeta.dateTime)
    : new Date(Date.now() + 3 * 60 * 60 * 1000);
  const endObj = new Date(startObj.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AFTERDARK//Couple Date Planner//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(startObj)}`,
    `DTEND:${fmt(endObj)}`,
    `SUMMARY:${dateMeta.title || 'Couple Cafe / Dinner Date'}`,
    `DESCRIPTION:${(dateMeta.description || 'Private Couple Date').replace(/\n/g, '\\n')}`,
    `LOCATION:${dateMeta.location || 'Hyderabad'}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `couple-date-${Date.now()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Helper to detect user's real city using Browser Geolocation + Google Maps Reverse Geocoding
 * or IP fallback so users in Bihar (Patna), Hyderabad, Delhi, Mumbai, etc. see their real city.
 */
export async function detectUserLiveCityAndAddress() {
  let fallbackCity = 'Hyderabad';
  let fallbackArea = '';
  try {
    const ipRes = await fetch('https://ipapi.co/json/');
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      const region = String(ipData.region || '').toLowerCase();
      const city = String(ipData.city || '');
      if (
        region.includes('bihar') ||
        city.toLowerCase().includes('patna') ||
        city.toLowerCase().includes('gaya') ||
        city.toLowerCase().includes('muzaffarpur')
      ) {
        fallbackCity = 'Patna';
        fallbackArea = `${city || 'Patna'}, Bihar`;
      } else if (
        city.toLowerCase().includes('delhi') ||
        city.toLowerCase().includes('noida') ||
        city.toLowerCase().includes('gurgaon')
      ) {
        fallbackCity = 'Delhi';
        fallbackArea = `${city}, NCR`;
      } else if (city.toLowerCase().includes('mumbai') || city.toLowerCase().includes('thane')) {
        fallbackCity = 'Mumbai';
        fallbackArea = `${city}, Maharashtra`;
      } else if (
        city.toLowerCase().includes('bengaluru') ||
        city.toLowerCase().includes('bangalore')
      ) {
        fallbackCity = 'Bengaluru';
        fallbackArea = `${city}, Karnataka`;
      } else if (city.toLowerCase().includes('kolkata') || city.toLowerCase().includes('howrah')) {
        fallbackCity = 'Kolkata';
        fallbackArea = `${city}, West Bengal`;
      } else if (city) {
        fallbackCity = CITY_PROFILES[city] ? city : 'Hyderabad';
        fallbackArea = `${city}${ipData.region ? `, ${ipData.region}` : ''}`;
      }
    }
  } catch {
    // Ignore IP lookup blocked
  }

  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 4500,
          maximumAge: 300000
        });
      });
      const { latitude, longitude } = pos.coords;
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_DEMO_KEY}`;
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const first = geoData.results?.[0];
        if (first) {
          const formatted = first.formatted_address || '';
          const lowerAddr = formatted.toLowerCase();
          let matchedCity = fallbackCity;
          if (lowerAddr.includes('bihar') || lowerAddr.includes('patna') || lowerAddr.includes('gaya')) {
            matchedCity = 'Patna';
          } else if (
            lowerAddr.includes('hyderabad') ||
            lowerAddr.includes('secunderabad') ||
            lowerAddr.includes('telangana')
          ) {
            matchedCity = 'Hyderabad';
          } else if (
            lowerAddr.includes('delhi') ||
            lowerAddr.includes('noida') ||
            lowerAddr.includes('gurugram')
          ) {
            matchedCity = 'Delhi';
          } else if (lowerAddr.includes('mumbai') || lowerAddr.includes('maharashtra')) {
            matchedCity = 'Mumbai';
          } else if (lowerAddr.includes('bengaluru') || lowerAddr.includes('bangalore')) {
            matchedCity = 'Bengaluru';
          } else if (lowerAddr.includes('kolkata') || lowerAddr.includes('west bengal')) {
            matchedCity = 'Kolkata';
          }
          return {
            city: matchedCity,
            formattedAddress: formatted,
            lat: latitude,
            lng: longitude,
            source: 'google-maps-gps'
          };
        }
      }
    } catch {
      // Fall back to IP/default
    }
  }

  return {
    city: fallbackCity,
    formattedAddress: fallbackArea || CITY_PROFILES[fallbackCity]?.defaultArea || 'Hyderabad',
    lat: CITY_PROFILES[fallbackCity]?.lat || 17.4156,
    lng: CITY_PROFILES[fallbackCity]?.lng || 78.4347,
    source: 'city-profile'
  };
}

export function QuickDropChipBar({ drops = flirtyHindiDrops, onSendQuickFlirt }) {
  return (
    <div className="ad-flirt-bar" role="region" aria-label="Flirty Couple Lines">
      {drops.map((drop) => (
        <button
          key={drop.id || drop.label}
          type="button"
          className="ad-flirt-chip"
          onClick={() => {
            if (onSendQuickFlirt) onSendQuickFlirt(drop.text);
          }}
        >
          {drop.label}
        </button>
      ))}
    </div>
  );
}

export function MessageWithBrandCards({
  messageId,
  body,
  dateMeta,
  photoMeta,
  voiceMeta,
  isMine = false,
  seenAt = null,
  onOpenBrandDrawer,
  onSavePhoto
}) {
  return (
    <div className="ad-msg-ad-wrapper">
      {body && (
        <p className="ad-msg-text">{renderTextWithClickableAdLinks(body, onOpenBrandDrawer)}</p>
      )}

      {voiceMeta?.dataUrl && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            marginTop: '6px',
            padding: '8px 10px',
            borderRadius: '12px',
            background: 'rgba(255, 79, 154, 0.14)',
            border: '1px solid rgba(255, 79, 154, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: '#ffd1e6',
              fontWeight: 700
            }}
          >
            <span>🎤 Private Voice Note ♥</span>
            {voiceMeta.durationSec ? <span>{voiceMeta.durationSec}s</span> : null}
          </div>
          <audio
            controls
            preload="metadata"
            src={voiceMeta.dataUrl}
            style={{ width: '100%', height: '32px', borderRadius: '8px' }}
          />
        </div>
      )}

      {photoMeta?.dataUrl && (
        <div className="ad-inline-photo-card" onClick={(e) => e.stopPropagation()}>
          {photoMeta.isLiveSnap && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.22)',
                color: '#fecdd3',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px 6px 0 0',
                letterSpacing: '0.04em'
              }}
            >
              🔴 LIVE CAMERA SNAP · INSTANT MOMENT
            </div>
          )}
          <img src={photoMeta.dataUrl} alt={photoMeta.caption || 'Shared couple photo'} />
          <div className="ad-inline-photo-bar">
            <span>{photoMeta.caption || 'Private Couple Photo'}</span>
            <button
              type="button"
              className="ad-save-photo-btn"
              onClick={() =>
                onSavePhoto &&
                onSavePhoto(
                  photoMeta.dataUrl,
                  `afterdark-photo-${photoMeta.id || Date.now()}.jpg`
                )
              }
            >
              ⬇ Save Photo
            </button>
          </div>
        </div>
      )}

      {dateMeta?.title && (
        <div className="ad-inline-date-card" onClick={(e) => e.stopPropagation()}>
          <div className="ad-inline-date-head">
            <span className="ad-date-badge">🕯️ UPCOMING COUPLE DATE INVITE</span>
            <strong>{dateMeta.title}</strong>
          </div>
          <p className="ad-inline-date-meta">
            📍 {dateMeta.location || 'Hyderabad'} · 🕒{' '}
            {dateMeta.dateTime
              ? new Date(dateMeta.dateTime).toLocaleString([], {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })
              : 'Tonight 8:30 PM'}
          </p>
          {dateMeta.description && (
            <p className="ad-inline-date-desc">“{dateMeta.description}”</p>
          )}
          <div className="ad-inline-date-actions">
            <a
              href={buildGoogleCalendarUrl(dateMeta)}
              target="_blank"
              rel="noopener noreferrer"
              className="ad-gcal-btn"
            >
              📅 Add to Google Calendar ↗
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                dateMeta.location || 'Romantic Cafe'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ad-ics-btn"
              style={{ textDecoration: 'none' }}
            >
              📍 View on Google Maps ↗
            </a>
            <button
              type="button"
              className="ad-ics-btn"
              onClick={() => downloadIcsFile(dateMeta)}
            >
              ⬇ Save .ICS
            </button>
          </div>
        </div>
      )}

      {isMine && (
        <div
          style={{
            marginTop: '5px',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: seenAt ? '#ffd1e6' : 'rgba(255,255,255,0.52)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {seenAt
            ? getGenZSeenStatusText(messageId)
            : '🕊️ Hawa mein gaya · Partner abhi padhne wala hai...'}
        </div>
      )}
    </div>
  );
}

/**
 * Minimal, Non-Intrusive Surprise In-Chat Brand Pill:
 * - Renders as a sleek 1-line surprise whisper pill by default so it NEVER clutters or disturbs the chat!
 * - Tapping "Peek Surprise ▾" expands the full Desi reaction & 1-click coupon/store link.
 */
export function InChatBrandPromoCard({ adData, onOpenBrandDrawer }) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!adData || !adData.brand || dismissed) return null;
  const { brand, flirtCopy, city, meme } = adData;

  const directBrandHref = brand.buildCheckoutUrl
    ? brand.buildCheckoutUrl(city || 'Hyderabad', brand.items[0]?.searchQuery || brand.name)
    : brand.externalUrl;

  function handleCopyCode(e) {
    e.stopPropagation();
    if (!brand.couponCode) return;
    navigator.clipboard?.writeText(brand.couponCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  }

  return (
    <div
      className="ad-inchat-promo-card"
      style={{
        borderColor: `${brand.accent}55`,
        padding: expanded ? '10px 12px' : '6px 11px',
        margin: '4px 0 6px',
        borderRadius: '12px',
        background: 'rgba(22, 10, 32, 0.82)'
      }}
    >
      {/* Ultra-minimal 1-line Surprise Whisper Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap'
        }}
      >
        <div
          onClick={() => setExpanded((prev) => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            cursor: 'pointer',
            flex: 1,
            minWidth: '180px'
          }}
        >
          <span style={{ fontSize: '0.78rem' }}>🎁</span>
          <BrandLogoBadge brand={brand} size={20} showTextBadge={false} />
          <strong style={{ fontSize: '0.78rem', color: '#ffd1e6' }}>{brand.name}</strong>
          <span
            style={{
              fontSize: '0.74rem',
              color: 'rgba(255,255,255,0.82)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '280px'
            }}
          >
            {meme?.memeTitle || flirtCopy}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            style={{
              background: 'rgba(255, 79, 154, 0.14)',
              border: `1px solid ${brand.accent}66`,
              color: '#ffd1e6',
              borderRadius: '99px',
              padding: '2px 8px',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {expanded ? 'Hide ▴' : '✨ Surprise Peek ▾'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenBrandDrawer) onOpenBrandDrawer(brand.id);
            }}
            style={{
              background: brand.accent || '#ff4f9a',
              border: 'none',
              color: '#111',
              borderRadius: '99px',
              padding: '2px 8px',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Open ↗
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              fontSize: '0.74rem',
              padding: '0 3px'
            }}
            title="Dismiss surprise"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Expanded Surprise Details (Only shown when user taps "Surprise Peek ▾") */}
      {expanded && (
        <div
          style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          {meme && (
            <div
              onClick={() => onOpenBrandDrawer && onOpenBrandDrawer(brand.id)}
              style={{
                padding: '7px 10px',
                borderRadius: '9px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderLeft: `3px solid ${brand.accent || '#ff4f9a'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{meme.memeEmoji || '😂'}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    color: '#facc15',
                    textTransform: 'uppercase'
                  }}
                >
                  {meme.memeBadge || 'DESI VIBE PICK'} · Private to you
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                  {meme.memeTitle}
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '0.76rem'
            }}
          >
            <span style={{ opacity: 0.88 }}>{flirtCopy}</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {brand.couponCode && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  style={{
                    background: 'rgba(255, 79, 154, 0.16)',
                    border: '1px dashed #ff7eb9',
                    color: '#ffd1e6',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {copiedCode ? `✓ Copied ${brand.couponCode}` : `🎟️ ${brand.couponCode}`}
                </button>
              )}
              <a
                href={directBrandHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: brand.accent, fontWeight: 700, textDecoration: 'underline' }}
              >
                {brand.displayUrl} ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 10-Minute Chat Milestone: Location-Based Treasure Hunt & Duo Task Game
 * Works for both Romantic Couples AND Boy-Girl Best Friends / Dosts!
 */
export function LocationTreasureHuntDrawer({
  userCity = 'Hyderabad',
  elapsedMinutes = 0,
  onSendChallengeToChat,
  onClose
}) {
  const missions =
    CITY_TREASURE_HUNT_MISSIONS[userCity] || CITY_TREASURE_HUNT_MISSIONS.Hyderabad;
  const [missionIndex, setMissionIndex] = useState(0);
  const currentMission = missions[missionIndex % missions.length] || missions[0];

  function handleNextMission() {
    setMissionIndex((prev) => (prev + 1) % missions.length);
  }

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    currentMission.mapsQuery || currentMission.spotName
  )}`;

  return (
    <div
      className="ad-collapsible-drawer"
      style={{
        border: '1.5px solid rgba(250, 204, 21, 0.5)',
        background: 'linear-gradient(135deg, rgba(35, 16, 48, 0.96), rgba(16, 9, 28, 0.98))'
      }}
    >
      <div className="ad-drawer-head">
        <div>
          <span
            style={{
              background: '#facc15',
              color: '#111',
              fontWeight: 800,
              fontSize: '0.66rem',
              padding: '2px 8px',
              borderRadius: '99px',
              marginRight: '8px'
            }}
          >
            🗺️ {elapsedMinutes >= 10 ? '10+ MIN MILESTONE UNLOCKED' : 'LIVE CITY TREASURE HUNT'}
          </span>
          <strong>
            {userCity} Location Treasure Hunt &amp; Fun Duo Task (Couples &amp; Besties)
          </strong>
        </div>
        {onClose && (
          <button type="button" className="ad-btn-close" onClick={onClose}>
            ✕ Close
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: '8px',
          padding: '12px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '6px'
          }}
        >
          <strong style={{ fontSize: '0.92rem', color: '#fde047' }}>
            {currentMission.title}
          </strong>
          <span style={{ fontSize: '0.73rem', color: '#bae6fd' }}>
            📍 {currentMission.spotName}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.82rem', fontStyle: 'italic', color: '#f8fafc' }}>
          {currentMission.riddle}
        </p>

        <div
          style={{
            padding: '8px 10px',
            borderRadius: '8px',
            background: 'rgba(255, 79, 154, 0.14)',
            borderLeft: '3px solid #ff4f9a',
            fontSize: '0.8rem',
            color: '#ffd1e6'
          }}
        >
          🎯 <strong>{currentMission.taskInstruction}</strong>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '4px'
          }}
        >
          <span style={{ fontSize: '0.73rem', color: '#6ee7b7', fontWeight: 700 }}>
            {currentMission.rewardBadge}
          </span>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ad-select-item-btn"
              onClick={handleNextMission}
            >
              🎲 Next Clue / Task ({missionIndex + 1}/{missions.length})
            </button>

            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ad-select-item-btn"
              style={{ textDecoration: 'none' }}
            >
              📍 Spot on Google Maps ↗
            </a>

            {onSendChallengeToChat && (
              <button
                type="button"
                className="ad-book-btn"
                style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                onClick={() => {
                  onSendChallengeToChat(
                    `🗺️ ${userCity} Treasure Hunt Challenge — ${currentMission.title} at ${currentMission.spotName}! ${currentMission.taskInstruction}`
                  );
                  if (onClose) onClose();
                }}
              >
                🚀 Send Task Challenge to Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact In-Chat Voice Note Recorder (🎤) & Live Camera Instant Snap (📷) Controls
 * - Keeps the chat bar 100% clean while letting couples send voice notes or live camera snaps!
 */
export function ChatMediaInputActions({
  onSendVoiceNote,
  onSendLiveCameraSnap,
  disabled = false
}) {
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [capturedSnap, setCapturedSnap] = useState('');
  const [snapCaption, setSnapCaption] = useState('');
  const [mediaError, setMediaError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const startTimeRef = useRef(0);
  const videoRef = useRef(null);
  const videoStreamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopAudioRecording(false);
      stopCameraStream();
    };
  }, []);

  function stopCameraStream() {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
    }
  }

  async function startAudioRecording() {
    setMediaError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError('Microphone not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 24000 }
        : undefined;
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setRecordSeconds(0);
      setRecording(true);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recordTimerRef.current) {
          clearInterval(recordTimerRef.current);
          recordTimerRef.current = null;
        }
      };

      recorder.start(250);
      recordTimerRef.current = setInterval(() => {
        const elapsed = Math.min(30, Math.round((Date.now() - startTimeRef.current) / 1000));
        setRecordSeconds(elapsed);
        if (elapsed >= 30) {
          stopAudioRecording(true);
        }
      }, 400);
    } catch {
      setMediaError('Please allow microphone access to send a voice note.');
    }
  }

  function stopAudioRecording(shouldSend = true) {
    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      setRecording(false);
      return;
    }
    const durationSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    recorder.onstop = () => {
      try {
        recorder.stream?.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      setRecording(false);
      if (shouldSend && audioChunksRef.current.length > 0 && onSendVoiceNote) {
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm'
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            onSendVoiceNote({
              dataUrl: reader.result,
              durationSec
            });
          }
        };
        reader.readAsDataURL(blob);
      }
      audioChunksRef.current = [];
      mediaRecorderRef.current = null;
    };
    if (recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      setRecording(false);
    }
  }

  async function openLiveCamera(preferredFacing = facingMode) {
    setMediaError('');
    setCapturedSnap('');
    setCameraOpen(true);
    stopCameraStream();
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError('Camera access is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: preferredFacing, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      setMediaError('Please allow camera permission to take a live snap.');
    }
  }

  function handleFlipCamera() {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    openLiveCamera(nextFacing);
  }

  function captureFrameFromVideo() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const maxDim = 480;
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const compressedJpeg = canvas.toDataURL('image/jpeg', 0.72);
    setCapturedSnap(compressedJpeg);
    stopCameraStream();
  }

  function handleSendCapturedSnap() {
    if (!capturedSnap || !onSendLiveCameraSnap) return;
    onSendLiveCameraSnap({
      dataUrl: capturedSnap,
      caption: snapCaption.trim() || '🔴 Live Camera Snap ♥',
      isLiveSnap: true
    });
    setCapturedSnap('');
    setSnapCaption('');
    setCameraOpen(false);
  }

  function closeCameraModal() {
    stopCameraStream();
    setCapturedSnap('');
    setSnapCaption('');
    setCameraOpen(false);
  }

  return (
    <>
      {recording ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(244, 63, 94, 0.22)',
            border: '1px solid #f43f5e',
            borderRadius: '12px',
            padding: '4px 10px',
            color: '#fecdd3',
            fontSize: '0.76rem',
            fontWeight: 700
          }}
        >
          <span>🔴 {recordSeconds}s</span>
          <button
            type="button"
            onClick={() => stopAudioRecording(true)}
            style={{
              background: '#10b981',
              color: '#052e16',
              border: 'none',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.73rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Send Voice ♥
          </button>
          <button
            type="button"
            onClick={() => stopAudioRecording(false)}
            style={{
              background: 'transparent',
              color: '#fecdd3',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
            title="Cancel recording"
          >
            ✕
          </button>
        </div>
      ) : (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            disabled={disabled}
            onClick={startAudioRecording}
            title="Record a private voice note (up to 30s)"
            style={{
              background: 'rgba(255, 79, 154, 0.14)',
              border: '1px solid rgba(255, 79, 154, 0.4)',
              color: '#ffd1e6',
              borderRadius: '10px',
              padding: '8px 11px',
              cursor: 'pointer',
              fontSize: '0.86rem',
              fontWeight: 700
            }}
          >
            🎤
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => openLiveCamera(facingMode)}
            title="Take an instant live camera snap"
            style={{
              background: 'rgba(56, 189, 248, 0.14)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#bae6fd',
              borderRadius: '10px',
              padding: '8px 11px',
              cursor: 'pointer',
              fontSize: '0.86rem',
              fontWeight: 700
            }}
          >
            📷
          </button>
        </div>
      )}

      {mediaError && (
        <span style={{ fontSize: '0.72rem', color: '#fca5a5' }}>{mediaError}</span>
      )}

      {cameraOpen && (
        <div
          className="ad-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(8, 4, 15, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={closeCameraModal}
        >
          <div
            style={{
              width: 'min(420px, 100%)',
              background: '#160922',
              border: '1.5px solid #ff4f9a',
              borderRadius: '18px',
              padding: '14px',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.9rem', color: '#ffd1e6' }}>
                📷 Instant Live Camera Snap ♥
              </strong>
              <button
                type="button"
                onClick={closeCameraModal}
                className="ad-btn-close"
              >
                ✕ Close
              </button>
            </div>

            {!capturedSnap ? (
              <>
                <div
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#000',
                    aspectRatio: '4 / 3'
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={handleFlipCamera}
                    className="ad-select-item-btn"
                  >
                    🔄 Flip Camera
                  </button>
                  <button
                    type="button"
                    onClick={captureFrameFromVideo}
                    className="ad-book-btn"
                    style={{ flex: 1 }}
                  >
                    📸 Capture Live Snap
                  </button>
                </div>
              </>
            ) : (
              <>
                <img
                  src={capturedSnap}
                  alt="Captured live snap"
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    maxHeight: '280px',
                    objectFit: 'cover'
                  }}
                />
                <input
                  type="text"
                  placeholder="Add a flirty caption (optional)..."
                  value={snapCaption}
                  onChange={(e) => setSnapCaption(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '0.82rem'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => openLiveCamera(facingMode)}
                    className="ad-select-item-btn"
                  >
                    ↺ Retake
                  </button>
                  <button
                    type="button"
                    onClick={handleSendCapturedSnap}
                    className="ad-book-btn"
                    style={{ flex: 1 }}
                  >
                    💌 Send Live Snap to Chat ♥
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Private One-Sided Partner Checkout, Real Brand Redirect & Location-Aware Cafe/Venue Modal:
 * - Supports 48+ Top Indian Apps with Category Filters, Search Bar, Logos & Desi Couple Vibes!
 */
export function InlineCommerceDrawer({
  open,
  activeBrandId,
  onSelectBrand,
  onClose,
  onShareDateInChat,
  userCity: propCity,
  onChangeCity
}) {
  const [selectedCity, setSelectedCity] = useState(propCity || 'Hyderabad');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [brandSearch, setBrandSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [detectingGps, setDetectingGps] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState('');
  const [cafeDateTime, setCafeDateTime] = useState(() => {
    const tonight = new Date(Date.now() + 3 * 3600 * 1000);
    return tonight.toISOString().slice(0, 16);
  });

  useEffect(() => {
    if (propCity && propCity !== selectedCity) {
      setSelectedCity(propCity);
    }
  }, [propCity]);

  const filteredBrands = useMemo(() => {
    return brandCatalog.filter((b) => {
      const matchesCat = selectedCategory === 'all' || b.category === selectedCategory;
      const q = brandSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        b.keywords.some((k) => k.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, brandSearch]);

  if (!open) return null;

  const activeBrand =
    brandCatalog.find((b) => b.id === activeBrandId) || filteredBrands[0] || brandCatalog[0];
  const chosenItem =
    activeBrand.items.find((i) => i.id === selectedItemId) || activeBrand.items[0];
  const cityProfile = CITY_PROFILES[selectedCity] || CITY_PROFILES.Hyderabad;
  const cityCafes = cityProfile.cafesAndSpots || [];

  const effectiveSearchQuery =
    customSearchQuery.trim() || chosenItem?.searchQuery || chosenItem?.name || activeBrand.name;

  const realOfficialCheckoutUrl = activeBrand.buildCheckoutUrl
    ? activeBrand.buildCheckoutUrl(selectedCity, effectiveSearchQuery)
    : activeBrand.externalUrl;

  const googleMapsNearbyUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${effectiveSearchQuery} near ${cityProfile.defaultArea || selectedCity}`
  )}`;

  async function handleDetectGpsLocation() {
    setDetectingGps(true);
    try {
      const detected = await detectUserLiveCityAndAddress();
      setSelectedCity(detected.city);
      if (onChangeCity) onChangeCity(detected.city);
    } finally {
      setDetectingGps(false);
    }
  }

  function handleCityChange(newCity) {
    setSelectedCity(newCity);
    if (onChangeCity) onChangeCity(newCity);
  }

  function handleCopyCoupon(code) {
    if (!code) return;
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2500);
  }

  return (
    <div
      className="ad-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(8, 4, 15, 0.84)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <section
        className="ad-commerce-drawer"
        aria-label="Private Partner Brand Store & Local Discovery"
        style={{
          width: 'min(880px, 100%)',
          maxHeight: '92vh',
          overflowY: 'auto',
          margin: 0,
          boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
          border: `1px solid ${activeBrand.accent}66`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="ad-commerce-header">
          <div className="ad-inchat-brand-identity">
            <BrandLogoBadge brand={activeBrand} size={34} showTextBadge={true} />
            <div>
              <span className="ad-commerce-badge">
                🔒 100% PRIVATE TO YOU · {brandCatalog.length} TOP INDIAN APPS · FREE COUPONS &amp; TABLE BOOKING
              </span>
              <h4>
                {activeBrand.name} — Real Checkout &amp; Live Discovery ({selectedCity})
              </h4>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <a
              href={realOfficialCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ad-btn-close"
              style={{
                textDecoration: 'none',
                background: activeBrand.accent,
                color: '#111',
                fontWeight: 700
              }}
            >
              Open {activeBrand.name} Directly ↗
            </a>
            <button type="button" className="ad-btn-close" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* LIVE CITY & LOCATION BAR */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
            background: 'rgba(255,255,255,0.04)',
            padding: '10px 12px',
            borderRadius: '12px',
            marginBottom: '10px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>📍 Your City / Partner Location:</span>
            {Object.keys(CITY_PROFILES).map((cityKey) => (
              <button
                key={cityKey}
                type="button"
                onClick={() => handleCityChange(cityKey)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  border:
                    selectedCity === cityKey
                      ? `1px solid ${activeBrand.accent}`
                      : '1px solid rgba(255,255,255,0.14)',
                  background:
                    selectedCity === cityKey ? `${activeBrand.accent}28` : 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  fontWeight: selectedCity === cityKey ? 700 : 400
                }}
              >
                {cityKey === 'Patna' ? 'Patna (Bihar)' : cityKey}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleDetectGpsLocation}
            disabled={detectingGps}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              background: 'rgba(56, 189, 248, 0.16)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              color: '#bae6fd'
            }}
          >
            {detectingGps ? 'Detecting GPS...' : '🛰️ Auto-Detect via Google Maps'}
          </button>
        </div>

        {/* CATEGORY FILTER PILLS + SEARCH ACROSS 36+ BRANDS */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '10px'
          }}
        >
          {brandCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '5px 10px',
                borderRadius: '99px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                border:
                  selectedCategory === cat.id
                    ? '1px solid #ff4f9a'
                    : '1px solid rgba(255,255,255,0.14)',
                background:
                  selectedCategory === cat.id ? 'rgba(255, 79, 154, 0.22)' : 'rgba(255,255,255,0.04)',
                color: '#fff',
                fontWeight: selectedCategory === cat.id ? 700 : 400
              }}
            >
              {cat.label}
            </button>
          ))}
          <input
            type="search"
            placeholder="🔍 Search Amazon, Flipkart, Myntra, Café Niloufer, OYO..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            style={{
              marginLeft: 'auto',
              padding: '5px 10px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#fff',
              fontSize: '0.76rem',
              minWidth: '210px'
            }}
          />
        </div>

        {/* TOP 36+ TRENDING INDIAN BRANDS STRIP WITH LOGOS */}
        <div className="ad-brand-strip">
          {filteredBrands.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`ad-brand-tab ${activeBrand.id === b.id ? 'active' : ''}`}
              style={activeBrand.id === b.id ? { borderColor: b.accent } : undefined}
              onClick={() => {
                if (onSelectBrand) onSelectBrand(b.id);
                setSelectedItemId(b.items[0]?.id || '');
              }}
            >
              <BrandLogoBadge brand={b} size={20} showTextBadge={false} />
              <span>{b.name}</span>
            </button>
          ))}
        </div>

        {/* DESI COUPLE VIBE BANNER FOR SELECTED BRAND */}
        {activeBrand.meme && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              background: 'rgba(250, 204, 21, 0.08)',
              border: '1px solid rgba(250, 204, 21, 0.35)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span style={{ fontSize: '1.7rem' }}>{activeBrand.meme.memeEmoji || '😂'}</span>
            <div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#fde047',
                  letterSpacing: '0.05em'
                }}
              >
                {activeBrand.meme.memeBadge}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                {activeBrand.meme.memeTitle}
              </div>
              <div style={{ fontSize: '0.76rem', opacity: 0.82 }}>
                {activeBrand.meme.memeQuote}
              </div>
            </div>
          </div>
        )}

        {/* PARTNER OFFER BANNER WITH COPYABLE COUPON CODE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(255, 79, 154, 0.1)',
            border: '1px dashed rgba(255, 79, 154, 0.4)',
            marginBottom: '12px'
          }}
        >
          <div>
            <strong style={{ fontSize: '0.86rem', color: '#ffd1e6' }}>
              🎁 {activeBrand.offerHeadline}
            </strong>
            <div style={{ fontSize: '0.76rem', opacity: 0.8 }}>
              Apply coupon code on {activeBrand.name} checkout · Estimated delivery in {selectedCity}:{' '}
              <strong>{chosenItem?.etaMinutes || 20} mins</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCopyCoupon(activeBrand.couponCode)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#1f102b',
              border: '1px solid #ff7eb9',
              color: '#ff9ebb',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            {copiedCoupon === activeBrand.couponCode
              ? `✓ Copied ${activeBrand.couponCode}`
              : `📋 Copy Code: ${activeBrand.couponCode}`}
          </button>
        </div>

        {/* LOCATION-BASED TABLE BOOKING & TOP/MID-TIER CAFES (FREE IN THIS VERSION) */}
        {(activeBrand.id === 'cafes' ||
          activeBrand.id === 'zomato' ||
          activeBrand.id === 'eazydiner' ||
          activeBrand.id === 'starbucks' ||
          activeBrand.id === 'chaayos') && (
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <strong style={{ fontSize: '0.9rem' }}>
                ☕ Location-Based Table Booking &amp; Couple Cafes in {cityProfile.label} (Free)
              </strong>
              <input
                type="datetime-local"
                value={cafeDateTime}
                onChange={(e) => setCafeDateTime(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: '0.76rem'
                }}
                title="Pick date & time for Google Calendar"
              />
            </div>

            <div className="ad-items-grid">
              {cityCafes.map((cafe) => {
                const calUrl = buildGoogleCalendarUrl({
                  title: `Couple Date at ${cafe.name} ♥`,
                  location: `${cafe.name}, ${cafe.area}`,
                  dateTime: cafeDateTime,
                  description: `${cafe.tier} · ${cafe.cuisine}. Booked via AfterDark Couple Pass ♥`
                });
                return (
                  <div
                    key={cafe.id}
                    className="ad-item-card"
                    style={{ borderColor: 'rgba(245, 158, 11, 0.45)' }}
                  >
                    <div>
                      <div className="ad-item-top">
                        <span className="ad-item-tag">{cafe.tier}</span>
                        <span className="ad-item-eta">
                          {cafe.rating} · ~{cafe.etaMinutes} mins away
                        </span>
                      </div>
                      <h5>{cafe.name}</h5>
                      <p style={{ fontSize: '0.77rem', opacity: 0.82, margin: '4px 0' }}>
                        {cafe.cuisine}
                      </p>
                      <small style={{ display: 'block', opacity: 0.7, marginBottom: '8px' }}>
                        📍 {cafe.area} · {cafe.avgForTwo}
                      </small>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <a
                        href={cafe.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ad-select-item-btn"
                        style={{
                          textDecoration: 'none',
                          textAlign: 'center',
                          background: '#f59e0b',
                          color: '#111',
                          fontWeight: 700
                        }}
                      >
                        ↗ Book Table / Order
                      </a>
                      <a
                        href={cafe.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ad-select-item-btn"
                        style={{ textDecoration: 'none', textAlign: 'center' }}
                      >
                        📍 Google Maps ↗
                      </a>
                      <a
                        href={calUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ad-select-item-btn"
                        style={{
                          textDecoration: 'none',
                          textAlign: 'center',
                          borderColor: '#38bdf8',
                          color: '#bae6fd'
                        }}
                      >
                        📅 Add to Google Calendar ↗
                      </a>
                      {onShareDateInChat && (
                        <button
                          type="button"
                          className="ad-select-item-btn"
                          style={{ fontSize: '0.73rem' }}
                          onClick={() => {
                            onShareDateInChat({
                              title: `Date at ${cafe.name} ♥`,
                              location: `${cafe.name}, ${cafe.area}`,
                              dateTime: cafeDateTime,
                              description: `Let's meet at ${cafe.name} (${cafe.cuisine})! Tap below to add to Google Calendar ♥`
                            });
                            onClose();
                          }}
                        >
                          💌 Share Date Card in Chat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CURATED ITEMS / PACKAGES FOR SELECTED BRAND */}
        <div style={{ marginBottom: '10px' }}>
          <strong style={{ fontSize: '0.86rem', display: 'block', marginBottom: '8px' }}>
            🛍️ Select Package or Search Anything on {activeBrand.name} ({selectedCity}):
          </strong>
          <div className="ad-items-grid">
            {activeBrand.items.map((item) => {
              const isSelected = chosenItem?.id === item.id;
              const itemUrl = activeBrand.buildCheckoutUrl
                ? activeBrand.buildCheckoutUrl(selectedCity, item.searchQuery || item.name)
                : activeBrand.externalUrl;
              return (
                <div
                  key={item.id}
                  className={`ad-item-card ${isSelected ? 'selected' : ''}`}
                  style={isSelected ? { borderColor: activeBrand.accent } : undefined}
                  onClick={() => setSelectedItemId(item.id)}
                >
                  <div>
                    <div className="ad-item-top">
                      <span className="ad-item-tag">{item.tag}</span>
                      <span className="ad-item-eta">⚡ ~{item.etaMinutes} mins in {selectedCity}</span>
                    </div>
                    <h5>{item.name}</h5>
                    <div className="ad-item-price-row">
                      <strong className="ad-free-price">
                        ₹{item.originalPrice} · Use {activeBrand.couponCode}
                      </strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <button
                      type="button"
                      className="ad-select-item-btn"
                      onClick={() => setSelectedItemId(item.id)}
                    >
                      {isSelected ? '✓ Selected' : 'Select'}
                    </button>
                    <a
                      href={itemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ad-select-item-btn"
                      style={{
                        textDecoration: 'none',
                        textAlign: 'center',
                        background: activeBrand.accent,
                        color: '#111',
                        fontWeight: 800,
                        flex: 1
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCoupon(activeBrand.couponCode);
                      }}
                    >
                      🛒 Add &amp; Buy on {activeBrand.name} ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DIRECT PRODUCT / DISH SEARCH & 1-CLICK OFFICIAL CHECKOUT BAR (NO MISLEADING FORM) */}
        <div
          className="ad-affiliate-checkout-form"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>
              🔍 Want a specific dish, product, or hotel on {activeBrand.name}? Type below to open its direct page:
            </span>
            <input
              type="text"
              placeholder={`Default: ${chosenItem?.searchQuery || chosenItem?.name} (${selectedCity})`}
              value={customSearchQuery}
              onChange={(e) => setCustomSearchQuery(e.target.value)}
            />
          </label>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href={realOfficialCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ad-book-btn"
              onClick={() => handleCopyCoupon(activeBrand.couponCode)}
              style={{
                flex: 1,
                textDecoration: 'none',
                textAlign: 'center',
                background: activeBrand.accent,
                color: '#111',
                fontWeight: 800
              }}
            >
              🛒 Add &ldquo;{effectiveSearchQuery}&rdquo; to Cart on {activeBrand.name} &amp; Proceed to Payment ↗
            </a>

            <a
              href={googleMapsNearbyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ad-btn-close"
              style={{ textDecoration: 'none', padding: '10px 14px' }}
            >
              📍 View Nearby on Google Maps ↗
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
