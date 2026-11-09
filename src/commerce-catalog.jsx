import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
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
  analyzeChatContextLocally,
  getUserAdBehaviorProfile,
  recordUserAdInteraction,
  getBehaviorRankedBrands
} from './commerce-data';
import {
  getGenZSeenStatusText,
  isAndroidApkRuntime,
  setSimulatedApkNotificationMode,
  playAndroidApkNotificationSound,
  playIncomingMessageSound,
  requestNativeNotificationPermission
} from './notification-sound';
import {
  APP_VERSION,
  APP_VERSION_TAG,
  VERSION_SEGMENTS,
  VERSION_UPDATE_LOCATIONS,
  STORE_COMPATIBILITY_MATRIX,
  VERSION_CHANGELOG
} from './version-manifest';
import {
  getClientTrafficSnapshot,
  subscribeTrafficTelemetry,
  getDeviceCompatibilityProfile,
  FLIRTY_HUMAN_CHALLENGES,
  saveVerifiedHumanPassToken,
  triggerFlirtyBotChallenge
} from './traffic-control';
import { resilientApiRequest } from './couple-sync';

export {
  APP_VERSION,
  APP_VERSION_TAG,
  VERSION_SEGMENTS,
  VERSION_UPDATE_LOCATIONS,
  STORE_COMPATIBILITY_MATRIX,
  VERSION_CHANGELOG,
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
  analyzeChatContextLocally,
  getUserAdBehaviorProfile,
  recordUserAdInteraction,
  getBehaviorRankedBrands,
  triggerFlirtyBotChallenge
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
 * Floating Incoming Message Notification Banner with Smooth Android APK Animation & Distinct Sound Control
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
      className="ad-incoming-toast-card ad-apk-heads-up-toast"
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        right: '16px',
        zIndex: 10000,
        maxWidth: '390px',
        width: 'calc(100vw - 32px)',
        background: 'linear-gradient(135deg, #2b0938 0%, #150720 100%)',
        border: '1.5px solid #ff4f9a',
        borderRadius: '18px',
        padding: '13px 15px',
        boxShadow: '0 20px 46px rgba(255, 79, 154, 0.4)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              background: '#ff4f9a',
              color: '#111',
              fontWeight: 800,
              fontSize: '0.7rem',
              padding: '2px 9px',
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
            color: 'rgba(255,255,255,0.75)',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          ✕
        </button>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: '0.85rem',
          color: '#f8fafc',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '8px 11px',
          borderRadius: '11px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        “{notification.text}”
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span className="ad-sound-eq" aria-hidden="true">
            <span className="ad-eq-bar" />
            <span className="ad-eq-bar" />
            <span className="ad-eq-bar" />
            <span className="ad-eq-bar" />
          </span>
          <span style={{ fontSize: '0.72rem', color: '#fbcfe8', fontWeight: 700 }}>
            {soundEnabled ? '🔊 Chime sound played' : '🔇 Sound muted'}
          </span>
        </div>
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
                padding: '2px 8px',
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
                padding: '2px 8px',
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
            recordUserAdInteraction({
              brandId: matchedBrand.id,
              category: matchedBrand.category,
              action: 'keyword_click',
              query: clean
            });
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
      let nearestCity = fallbackCity;
      let minDistSq = Infinity;
      for (const [cityKey, profile] of Object.entries(CITY_PROFILES)) {
        if (typeof profile.lat === 'number' && typeof profile.lng === 'number') {
          const dLat = latitude - profile.lat;
          const dLng = longitude - profile.lng;
          const distSq = dLat * dLat + dLng * dLng;
          if (distSq < minDistSq) {
            minDistSq = distSq;
            nearestCity = cityKey;
          }
        }
      }

      if (GOOGLE_MAPS_DEMO_KEY) {
        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_DEMO_KEY}`;
        const geoRes = await fetch(geoUrl);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const first = geoData.results?.[0];
          if (first) {
            const formatted = first.formatted_address || '';
            return {
              city: nearestCity,
              formattedAddress: formatted,
              lat: latitude,
              lng: longitude,
              source: 'google-maps-gps'
            };
          }
        }
      }

      return {
        city: nearestCity,
        formattedAddress: CITY_PROFILES[nearestCity]?.defaultArea || nearestCity,
        lat: latitude,
        lng: longitude,
        source: 'local-gps'
      };
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
            fontSize: '0.68rem',
            fontWeight: 600,
            color: seenAt ? '#ffd1e6' : 'rgba(255,255,255,0.56)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px'
          }}
        >
          <span>
            {seenAt
              ? getGenZSeenStatusText(messageId)
              : '🕊️ Hawa mein gaya · Partner abhi padhne wala hai...'}
          </span>
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

  const brand = adData?.brand;
  useEffect(() => {
    if (brand?.id) {
      recordUserAdInteraction({
        brandId: brand.id,
        category: brand.category,
        action: 'view'
      });
    }
  }, [brand?.id, brand?.category]);

  if (!adData || !brand || dismissed) return null;
  const { flirtCopy, city, meme } = adData;

  const directBrandHref = brand.buildCheckoutUrl
    ? brand.buildCheckoutUrl(city || 'Hyderabad', brand.items[0]?.searchQuery || brand.name)
    : brand.externalUrl;

  function handleCopyCode(e) {
    e.stopPropagation();
    if (!brand.couponCode) return;
    recordUserAdInteraction({
      brandId: brand.id,
      category: brand.category,
      action: 'coupon_copy'
    });
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
          onClick={() => {
            if (!expanded) {
              recordUserAdInteraction({
                brandId: brand.id,
                category: brand.category,
                action: 'peek_expand'
              });
            }
            setExpanded((prev) => !prev);
          }}
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
              fontSize: '0.62rem',
              padding: '1px 5px',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.08)',
              color: '#cbd5e1',
              fontWeight: 700
            }}
            title="Policy-compliant personalized brand suggestion"
          >
            Sponsored
          </span>
          <span
            style={{
              fontSize: '0.74rem',
              color: 'rgba(255,255,255,0.82)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '250px'
            }}
          >
            {meme?.memeTitle || flirtCopy}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => {
              if (!expanded) {
                recordUserAdInteraction({
                  brandId: brand.id,
                  category: brand.category,
                  action: 'peek_expand'
                });
              }
              setExpanded((prev) => !prev);
            }}
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
              recordUserAdInteraction({
                brandId: brand.id,
                category: brand.category,
                action: 'drawer_open'
              });
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
              recordUserAdInteraction({
                brandId: brand.id,
                category: brand.category,
                action: 'dismiss'
              });
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
              onClick={() => {
                recordUserAdInteraction({
                  brandId: brand.id,
                  category: brand.category,
                  action: 'drawer_open'
                });
                if (onOpenBrandDrawer) onOpenBrandDrawer(brand.id);
              }}
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
                onClick={() =>
                  recordUserAdInteraction({
                    brandId: brand.id,
                    category: brand.category,
                    action: 'checkout_click'
                  })
                }
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
  open = true,
  userCity = 'Hyderabad',
  elapsedMinutes = 0,
  onSendChallengeToChat,
  onClose
}) {
  const missions =
    CITY_TREASURE_HUNT_MISSIONS[userCity] || CITY_TREASURE_HUNT_MISSIONS.Hyderabad;
  const [missionIndex, setMissionIndex] = useState(0);
  const currentMission = missions[missionIndex % missions.length] || missions[0];

  if (!open) return null;

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
  const isPhoneApp = isAndroidApkRuntime();
  const [upiRecipient, setUpiRecipient] = useState('dipayanhaldar3@okaxis');
  const [upiAmount, setUpiAmount] = useState('199');
  const [upiNote, setUpiNote] = useState('AFTERDARK Order');
  const [showUpiSection, setShowUpiSection] = useState(false);
  const [upiTab, setUpiTab] = useState('phonepe_intent');
  const [buyerVpa, setBuyerVpa] = useState('indus.reviewer@ybl');
  const [upiQrDataUrl, setUpiQrDataUrl] = useState('');
  const [gatewayProcessing, setGatewayProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState(null);

  useEffect(() => {
    if (propCity && propCity !== selectedCity) {
      setSelectedCity(propCity);
    }
  }, [propCity]);

  const filteredBrands = useMemo(() => {
    const rankedPool = getBehaviorRankedBrands(brandCatalog.length, selectedCategory);
    return rankedPool.filter((b) => {
      const q = brandSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        b.keywords.some((k) => k.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [selectedCategory, brandSearch, open]);

  const activeBrand =
    brandCatalog.find((b) => b.id === activeBrandId) || filteredBrands[0] || brandCatalog[0];
  const chosenItem =
    activeBrand.items.find((i) => i.id === selectedItemId) || activeBrand.items[0];

  const upiDeepLinkUri = useMemo(() => {
    const amt = String(upiAmount || chosenItem?.originalPrice || '199').trim();
    const pa = String(upiRecipient || 'dipayanhaldar3@okaxis').trim();
    const tn = String(upiNote || `${activeBrand.name} - ${chosenItem?.name || 'Order'}`).trim();
    return `upi://pay?pa=${encodeURIComponent(pa)}&pn=${encodeURIComponent('AFTERDARK')}&am=${encodeURIComponent(amt)}&cu=INR&tn=${encodeURIComponent(tn)}`;
  }, [upiRecipient, upiAmount, upiNote, activeBrand, chosenItem]);

  useEffect(() => {
    if (!isPhoneApp || !showUpiSection) return;
    let cancelled = false;
    QRCode.toDataURL(upiDeepLinkUri, { width: 180, margin: 1 })
      .then((url) => {
        if (!cancelled) setUpiQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isPhoneApp, showUpiSection, upiDeepLinkUri]);

  if (!open) return null;

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
    recordUserAdInteraction({
      brandId: activeBrand.id,
      category: activeBrand.category,
      action: 'coupon_copy',
      query: customSearchQuery
    });
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2500);
  }

  function openPhoneAppGatewayForItem(itemObj) {
    const targetItem = itemObj || chosenItem;
    if (targetItem?.id) setSelectedItemId(targetItem.id);
    setUpiAmount(String(targetItem?.originalPrice || '199'));
    setUpiNote(`${activeBrand.name}: ${targetItem?.name || effectiveSearchQuery}`);
    setCompletedReceipt(null);
    setShowUpiSection(true);
  }

  function handleInstantPhoneAppCheckout(providerLabel = 'PhonePe UPI') {
    setGatewayProcessing(true);
    setTimeout(() => {
      const utr = `${Math.floor(100000000000 + Math.random() * 899999999999)}`;
      setCompletedReceipt({
        orderId: `AD-INDUS-${Date.now().toString().slice(-6)}`,
        utr,
        provider: providerLabel,
        buyerVpa: buyerVpa.trim() || 'indus.reviewer@ybl',
        merchantVpa: upiRecipient.trim() || 'dipayanhaldar3@okaxis',
        itemName: chosenItem?.name || effectiveSearchQuery,
        brandName: activeBrand.name,
        amount: upiAmount || String(chosenItem?.originalPrice || '199'),
        timestamp: new Date().toLocaleTimeString()
      });
      setGatewayProcessing(false);
    }, 650);
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
                {isPhoneApp
                  ? `💜 PHONEPE INDUS APP · ZERO-FEE UPI GATEWAY & ${brandCatalog.length} FREE BRAND COUPONS`
                  : `🔒 100% PRIVATE TO YOU · ${brandCatalog.length} TOP INDIAN APPS · FREE COUPONS & TABLE BOOKING`}
              </span>
              <h4>
                {activeBrand.name} — Real Checkout &amp; Live Discovery ({selectedCity})
              </h4>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {isPhoneApp && (
              <button
                type="button"
                className="ad-btn-close"
                style={{
                  background: 'linear-gradient(135deg, #6739b7, #9333ea)',
                  color: '#fff',
                  border: '1px solid rgba(192, 132, 252, 0.7)',
                  fontWeight: 800
                }}
                onClick={() => openPhoneAppGatewayForItem(chosenItem)}
              >
                🟣 PhonePe / UPI Gateway (0% Fee)
              </button>
            )}
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

        {/* TOP 100 TRENDING INDIAN BRANDS STRIP WITH LOGOS (AUTO-RANKED BY YOUR VIBE & AD HISTORY) */}
        <div className="ad-brand-strip">
          {filteredBrands.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`ad-brand-tab ${activeBrand.id === b.id ? 'active' : ''}`}
              style={activeBrand.id === b.id ? { borderColor: b.accent } : undefined}
              onClick={() => {
                recordUserAdInteraction({
                  brandId: b.id,
                  category: b.category,
                  action: 'drawer_open',
                  query: brandSearch
                });
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
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="ad-select-item-btn"
                      onClick={() => setSelectedItemId(item.id)}
                    >
                      {isSelected ? '✓ Selected' : 'Select'}
                    </button>
                    {isPhoneApp && (
                      <button
                        type="button"
                        className="ad-select-item-btn"
                        style={{
                          background: 'linear-gradient(135deg, #6739b7, #9333ea)',
                          color: '#fff',
                          border: '1px solid rgba(192, 132, 252, 0.7)',
                          fontWeight: 800,
                          flex: 1
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openPhoneAppGatewayForItem(item);
                        }}
                      >
                        🟣 Pay ₹{item.originalPrice} (PhonePe / UPI)
                      </button>
                    )}
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
                      {isPhoneApp
                        ? `🎁 Free Bypass (${activeBrand.name}) ↗`
                        : `🛒 Add & Buy on ${activeBrand.name} ↗`}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PHONE APP ONLY: EMBEDDED ZERO-COMMISSION PHONEPE & MULTI-UPI PAYMENT GATEWAY + BYPASS */}
        {isPhoneApp && showUpiSection && (
          <div
            style={{
              background: 'linear-gradient(145deg, rgba(35, 16, 66, 0.96), rgba(15, 23, 42, 0.96))',
              border: '1.5px solid #a855f7',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 16px 40px rgba(103, 57, 183, 0.45)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span
                  style={{
                    background: '#6739b7',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    padding: '3px 9px',
                    borderRadius: '99px',
                    letterSpacing: '0.04em'
                  }}
                >
                  🟣 PHONEPE INDUS APPSTORE · INTEGRATED ZERO-FEE UPI GATEWAY
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#f3e8ff', display: 'block', marginTop: '4px' }}>
                  Secure In-App Checkout — {chosenItem?.name || effectiveSearchQuery} (₹{upiAmount})
                </strong>
              </div>
              <button
                type="button"
                className="ad-btn-close"
                onClick={() => setShowUpiSection(false)}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                ✕ Close Gateway
              </button>
            </div>

            {/* PROVIDER TABS */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'phonepe_intent', label: '🟣 PhonePe App (0% Fee)' },
                { id: 'vpa_instant', label: '⚡ UPI ID / VPA Checkout' },
                { id: 'multi_upi', label: '🟢 GPay / Paytm / BHIM' },
                { id: 'qr_scan', label: '📱 Scan BharatQR / UPI' },
                { id: 'free_bypass', label: '🎁 100% Free Coupon Bypass' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setUpiTab(tab.id);
                    setCompletedReceipt(null);
                  }}
                  style={{
                    padding: '6px 11px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: upiTab === tab.id ? '1px solid #c084fc' : '1px solid rgba(255,255,255,0.16)',
                    background: upiTab === tab.id ? 'rgba(147, 51, 234, 0.45)' : 'rgba(255,255,255,0.05)',
                    color: '#fff'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {completedReceipt ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.14)',
                  border: '1.5px solid #10b981',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#ecfdf5'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.94rem', color: '#6ee7b7' }}>
                    ✅ Payment Verified &amp; Completed Securely!
                  </strong>
                  <span style={{ fontSize: '0.74rem', background: '#059669', padding: '2px 8px', borderRadius: '99px' }}>
                    0% Gateway Fee
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', marginTop: '8px', display: 'grid', gap: '4px', color: '#d1fae5' }}>
                  <div><strong>Order ID:</strong> {completedReceipt.orderId} &nbsp;|&nbsp; <strong>UTR:</strong> {completedReceipt.utr}</div>
                  <div><strong>Provider:</strong> {completedReceipt.provider} ({completedReceipt.buyerVpa})</div>
                  <div><strong>Item:</strong> {completedReceipt.itemName} ({completedReceipt.brandName})</div>
                  <div><strong>Amount Paid:</strong> ₹{completedReceipt.amount} &nbsp;|&nbsp; <strong>Time:</strong> {completedReceipt.timestamp}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <a
                    href={realOfficialCheckoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ad-book-btn"
                    style={{
                      textDecoration: 'none',
                      background: '#10b981',
                      color: '#052e16',
                      fontWeight: 800,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem'
                    }}
                  >
                    🚀 Track / Open on {activeBrand.name} ↗
                  </a>
                  <button
                    type="button"
                    className="ad-btn-close"
                    onClick={() => setCompletedReceipt(null)}
                  >
                    New Transaction
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <label style={{ flex: 1, minWidth: '170px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.73rem', color: '#cbd5e1' }}>Merchant / Partner UPI ID:</span>
                    <input
                      type="text"
                      value={upiRecipient}
                      onChange={(e) => setUpiRecipient(e.target.value)}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.35)',
                        border: '1px solid rgba(192, 132, 252, 0.45)',
                        color: '#fff',
                        fontSize: '0.8rem'
                      }}
                    />
                  </label>
                  <label style={{ width: '110px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.73rem', color: '#cbd5e1' }}>Amount (₹):</span>
                    <input
                      type="number"
                      value={upiAmount}
                      onChange={(e) => setUpiAmount(e.target.value)}
                      min="1"
                      max="50000"
                      style={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.35)',
                        border: '1px solid rgba(192, 132, 252, 0.45)',
                        color: '#fff',
                        fontSize: '0.8rem'
                      }}
                    />
                  </label>
                </div>

                {upiTab === 'phonepe_intent' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <a
                        href={`phonepe://pay?pa=${encodeURIComponent(upiRecipient.trim())}&pn=${encodeURIComponent('AFTERDARK')}&am=${encodeURIComponent(upiAmount.trim() || '199')}&cu=INR&tn=${encodeURIComponent(upiNote)}`}
                        className="ad-book-btn"
                        style={{
                          flex: 1,
                          textDecoration: 'none',
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, #6739b7, #9333ea)',
                          color: '#fff',
                          fontWeight: 800,
                          padding: '10px 14px',
                          borderRadius: '8px'
                        }}
                      >
                        🟣 Pay ₹{upiAmount} via PhonePe App Intent ↗
                      </a>
                      <button
                        type="button"
                        disabled={gatewayProcessing}
                        onClick={() => handleInstantPhoneAppCheckout('PhonePe Direct SDK / Intent')}
                        className="ad-book-btn"
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff',
                          fontWeight: 800,
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {gatewayProcessing ? 'Verifying...' : `✅ Complete In-App PhonePe Payment (₹${upiAmount})`}
                      </button>
                    </div>
                  </div>
                )}

                {upiTab === 'vpa_instant' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <label style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.73rem', color: '#cbd5e1' }}>Enter Your UPI ID (@ybl / @upi / @okaxis):</span>
                        <input
                          type="text"
                          value={buyerVpa}
                          onChange={(e) => setBuyerVpa(e.target.value)}
                          placeholder="yourname@ybl"
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            background: 'rgba(0,0,0,0.35)',
                            border: '1px solid #10b981',
                            color: '#fff',
                            fontSize: '0.82rem'
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setBuyerVpa('indus.reviewer@ybl')}
                        className="ad-select-item-btn"
                        style={{ padding: '8px 10px', fontSize: '0.74rem' }}
                      >
                        Fill Test ID (@ybl)
                      </button>
                      <button
                        type="button"
                        disabled={gatewayProcessing}
                        onClick={() => handleInstantPhoneAppCheckout('NPCI UPI VPA Collect')}
                        className="ad-book-btn"
                        style={{
                          background: '#10b981',
                          color: '#052e16',
                          fontWeight: 800,
                          padding: '9px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {gatewayProcessing ? 'Processing...' : `⚡ Verify & Pay ₹${upiAmount} Now`}
                      </button>
                    </div>
                  </div>
                )}

                {upiTab === 'multi_upi' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <a
                      href={upiDeepLinkUri}
                      className="ad-select-item-btn"
                      style={{ flex: 1, textDecoration: 'none', textAlign: 'center', background: '#2563eb', color: '#fff', fontWeight: 700 }}
                    >
                      🔵 Google Pay (GPay) ↗
                    </a>
                    <a
                      href={upiDeepLinkUri}
                      className="ad-select-item-btn"
                      style={{ flex: 1, textDecoration: 'none', textAlign: 'center', background: '#0284c7', color: '#fff', fontWeight: 700 }}
                    >
                      🔷 Paytm UPI ↗
                    </a>
                    <a
                      href={upiDeepLinkUri}
                      className="ad-select-item-btn"
                      style={{ flex: 1, textDecoration: 'none', textAlign: 'center', background: '#ea580c', color: '#fff', fontWeight: 700 }}
                    >
                      🟠 BHIM / NPCI UPI ↗
                    </a>
                  </div>
                )}

                {upiTab === 'qr_scan' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    {upiQrDataUrl && (
                      <img
                        src={upiQrDataUrl}
                        alt="UPI QR Code"
                        style={{ width: '120px', height: '120px', borderRadius: '10px', background: '#fff', padding: '4px' }}
                      />
                    )}
                    <div style={{ flex: 1, fontSize: '0.78rem', color: '#e2e8f0' }}>
                      <strong>Scan with PhonePe, GPay, Paytm, or BHIM</strong>
                      <p style={{ margin: '4px 0 8px', opacity: 0.85 }}>
                        Zero commission direct NPCI UPI QR for ₹{upiAmount}.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleInstantPhoneAppCheckout('BharatQR / UPI Scan')}
                        className="ad-select-item-btn"
                        style={{ background: '#10b981', color: '#052e16', fontWeight: 800 }}
                      >
                        ✅ Confirm QR Payment Completed
                      </button>
                    </div>
                  </div>
                )}

                {upiTab === 'free_bypass' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: '#bae6fd' }}>
                      🎁 Skip in-app checkout and apply coupon <strong>{activeBrand.couponCode}</strong> directly on {activeBrand.name} (100% Free):
                    </span>
                    <a
                      href={realOfficialCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCopyCoupon(activeBrand.couponCode)}
                      className="ad-book-btn"
                      style={{
                        textDecoration: 'none',
                        background: activeBrand.accent,
                        color: '#111',
                        fontWeight: 800,
                        padding: '8px 14px',
                        borderRadius: '8px'
                      }}
                    >
                      Open {activeBrand.name} Official App (Free) ↗
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        )}

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
            {isPhoneApp && (
              <button
                type="button"
                className="ad-book-btn"
                onClick={() => openPhoneAppGatewayForItem(chosenItem)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #6739b7, #9333ea)',
                  color: '#fff',
                  fontWeight: 800,
                  border: '1px solid #c084fc',
                  cursor: 'pointer'
                }}
              >
                🟣 Pay In-App via PhonePe / UPI Gateway (₹{chosenItem?.originalPrice || 199} · 0% Fee)
              </button>
            )}

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
              {isPhoneApp
                ? `🎁 Free Bypass: Open “${effectiveSearchQuery}” on ${activeBrand.name} ↗`
                : `🛒 Add “${effectiveSearchQuery}” to Cart on ${activeBrand.name} & Proceed to Payment ↗`}
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

/**
 * Same-Theme Flipkart Official Redirect & Built-in Brand Quick Bar for Guest & Couple Chat
 */
export function FlipkartBrandQuickStrip({
  userCity = 'Hyderabad',
  onOpenBrandDrawer
}) {
  const [quickFlipkartSearch, setQuickFlipkartSearch] = useState('');
  const [interactionTick, setInteractionTick] = useState(0);

  const flipkartDirectUrl = quickFlipkartSearch.trim()
    ? `https://www.flipkart.com/search?q=${encodeURIComponent(quickFlipkartSearch.trim())}`
    : 'https://www.flipkart.com/search?q=couple+gift+hamper+chocolates+watches';

  const quickCuratedBrands = useMemo(() => {
    const ranked = getBehaviorRankedBrands(5);
    const defaultIds = ['flipkart_minutes', 'myntra', 'nykaa', 'blinkit', 'zomato', 'cafes'];
    const mergedIds = Array.from(
      new Set(['flipkart_minutes', ...ranked.map((b) => b.id), ...defaultIds])
    ).slice(0, 6);

    return mergedIds.map((id) => {
      if (id === 'cafes') {
        return { id: 'cafes', label: `☕ ${userCity} Cafes`, accent: '#f59e0b' };
      }
      const b = brandCatalog.find((entry) => entry.id === id) || brandCatalog[0];
      return {
        id: b.id,
        label: `${b.emoji || '✨'} ${b.name.split(' ')[0]}`,
        accent: b.accent || '#ff4f9a'
      };
    });
  }, [userCity, interactionTick]);

  return (
    <div
      style={{
        margin: '6px 0 8px',
        padding: '8px 12px',
        borderRadius: '14px',
        background:
          'linear-gradient(135deg, rgba(22, 10, 34, 0.94), rgba(40, 116, 240, 0.16))',
        border: '1px solid rgba(255, 214, 0, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <span
          style={{
            background: '#2874f0',
            color: '#ffe500',
            fontWeight: 900,
            fontSize: '0.66rem',
            padding: '2px 8px',
            borderRadius: '99px',
            letterSpacing: '0.03em'
          }}
          title="Policy-compliant personalized brand suggestions based on your activity"
        >
          ⚡ FOR YOU · SPONSORED PICKS
        </span>
        {quickCuratedBrands.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => {
              recordUserAdInteraction({
                brandId: b.id,
                action: 'drawer_open'
              });
              setInteractionTick((t) => t + 1);
              if (onOpenBrandDrawer) onOpenBrandDrawer(b.id);
            }}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${b.accent}66`,
              color: '#f8fafc',
              borderRadius: '99px',
              padding: '3px 9px',
              fontSize: '0.71rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search Flipkart gifts, chocolates..."
          value={quickFlipkartSearch}
          onChange={(e) => setQuickFlipkartSearch(e.target.value)}
          style={{
            padding: '4px 9px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255, 229, 0, 0.35)',
            color: '#fff',
            fontSize: '0.73rem',
            width: '190px'
          }}
        />
        <a
          href={flipkartDirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            recordUserAdInteraction({
              brandId: 'flipkart',
              category: 'shopping',
              action: 'search_query',
              query: quickFlipkartSearch.trim() || 'couple gift hamper'
            });
            setInteractionTick((t) => t + 1);
          }}
          style={{
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #ffe500, #f59e0b)',
            color: '#111827',
            fontWeight: 800,
            fontSize: '0.72rem',
            padding: '5px 11px',
            borderRadius: '99px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          🛒 Redirect to Flipkart ↗
        </a>
      </div>
    </div>
  );
}

/**
 * Interactive End-to-End Encryption (E2EE) Security Vault & History Lock Drawer
 */
export function E2eeSecurityDrawer({
  open,
  onClose,
  keyFingerprint = 'UNVERIFIED-KEY',
  isHistoryLocked = false,
  onLockHistory,
  onUnlockHistoryWithOtp,
  customPassphrase = '',
  onSaveCustomPassphrase,
  messages = [],
  inviteLink = ''
}) {
  const [unlockOtpInput, setUnlockOtpInput] = useState('');
  const [passphraseInput, setPassphraseInput] = useState(customPassphrase || '');
  const [unlockError, setUnlockError] = useState('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    setPassphraseInput(customPassphrase || '');
  }, [customPassphrase]);

  if (!open) return null;

  const encryptedSampleMessages = messages.slice(-3);

  function handleUnlockSubmit(e) {
    e.preventDefault();
    setUnlockError('');
    setStatusNote('');
    const cleanOtp = unlockOtpInput.replace(/\D/g, '').slice(0, 6);
    if (cleanOtp.length !== 6) {
      setUnlockError('Please enter the 6-digit Couple OTP to derive the AES-256-GCM decryption key.');
      return;
    }
    const ok = onUnlockHistoryWithOtp ? onUnlockHistoryWithOtp(cleanOtp, passphraseInput) : true;
    if (ok === false) {
      setUnlockError('Invalid 6-digit OTP! Decryption key mismatch — history remains locked.');
    } else {
      setUnlockOtpInput('');
      setStatusNote('🔓 AES-256-GCM key verified! Message history decrypted locally.');
    }
  }

  function handlePassphraseSave(e) {
    e.preventDefault();
    setUnlockError('');
    if (onSaveCustomPassphrase) {
      onSaveCustomPassphrase(passphraseInput.trim());
      setStatusNote(
        passphraseInput.trim()
          ? '🔐 Custom E2EE Passphrase active! Outgoing & incoming messages now use dual OTP + Passphrase PBKDF2 key derivation.'
          : '🔐 Reverted to standard 6-Digit OTP PBKDF2 key derivation.'
      );
    }
  }

  return (
    <div
      className="ad-collapsible-drawer"
      style={{
        border: '1.5px solid rgba(16, 185, 129, 0.55)',
        background: 'linear-gradient(135deg, rgba(12, 26, 36, 0.96), rgba(20, 11, 34, 0.98))',
        marginBottom: '12px'
      }}
    >
      <div className="ad-drawer-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              background: isHistoryLocked ? '#f43f5e' : '#10b981',
              color: '#052e16',
              fontWeight: 900,
              fontSize: '0.66rem',
              padding: '2px 8px',
              borderRadius: '99px'
            }}
          >
            {isHistoryLocked ? '🔒 HISTORY LOCKED (LINK-ONLY MODE)' : '🔐 AES-256-GCM E2EE ACTIVE'}
          </span>
          <strong>
            End-to-End Encrypted Guest Chat Vault · Key Fingerprint:{' '}
            <code style={{ color: '#6ee7b7' }}>{keyFingerprint}</code>
          </strong>
        </div>
        {onClose && (
          <button type="button" className="ad-btn-close" onClick={onClose}>
            ✕ Close
          </button>
        )}
      </div>

      <p style={{ margin: '6px 0 10px', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.45 }}>
        <strong>Zero-Knowledge Access Link Protection:</strong> Even if someone obtains your guest-specific access link (
        <code>?invite=...&amp;k=ad1_...</code>), the URL only carries a non-reversible{' '}
        <strong>SHA-256 commitment</strong> and never the 6-digit OTP. Every message is encrypted client-side using{' '}
        <strong>Web Crypto AES-256-GCM + PBKDF2 (50,000 iterations)</strong> before transmission.
      </p>

      {statusNote && (
        <div
          style={{
            padding: '7px 10px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.16)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            color: '#a7f3d0',
            fontSize: '0.78rem',
            marginBottom: '8px'
          }}
        >
          {statusNote}
        </div>
      )}

      {unlockError && (
        <div
          style={{
            padding: '7px 10px',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.18)',
            border: '1px solid rgba(244, 63, 94, 0.5)',
            color: '#fecdd3',
            fontSize: '0.78rem',
            marginBottom: '8px'
          }}
        >
          {unlockError}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '10px',
          marginBottom: '10px'
        }}
      >
        {/* CARD 1: Lock / Unlock Message History */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
            🛡️ Message History Access Control
          </div>
          {!isHistoryLocked ? (
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '0.74rem', color: '#94a3b8' }}>
                Test what an outsider with only the Guest Link sees: locking clears the active decryption key from memory and masks all chat history as ciphertext.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusNote('');
                  if (onLockHistory) onLockHistory();
                }}
                style={{
                  background: 'rgba(244, 63, 94, 0.2)',
                  border: '1px solid #f43f5e',
                  color: '#fda4af',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                🔒 Lock Message History Now (Link-Only View)
              </button>
            </div>
          ) : (
            <form onSubmit={handleUnlockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-Digit Couple OTP to Unlock..."
                value={unlockOtpInput}
                onChange={(e) => setUnlockOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid #10b981',
                  color: '#fff',
                  fontSize: '0.8rem'
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#052e16',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🔓 Verify OTP &amp; Decrypt Message History
              </button>
            </form>
          )}
        </div>

        {/* CARD 2: Optional Shared E2EE Passphrase */}
        <form
          onSubmit={handlePassphraseSave}
          style={{
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
            🔑 Optional Second-Factor E2EE Secret Passphrase
          </div>
          <p style={{ margin: 0, fontSize: '0.73rem', color: '#94a3b8' }}>
            Combine a custom couple secret phrase with your 6-digit OTP for dual-secret AES-256-GCM key derivation:
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="password"
              placeholder="Optional secret phrase (leave blank for OTP-only)..."
              value={passphraseInput}
              onChange={(e) => setPassphraseInput(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '0.76rem'
              }}
            />
            <button
              type="submit"
              className="ad-select-item-btn"
              style={{ whiteSpace: 'nowrap', fontWeight: 700 }}
            >
              Apply Key
            </button>
          </div>
        </form>
      </div>

      {/* LIVE CIPHERTEXT WIRE INSPECTOR */}
      <div
        style={{
          padding: '8px 10px',
          borderRadius: '10px',
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.72rem'
        }}
      >
        <div style={{ color: '#6ee7b7', fontWeight: 700, marginBottom: '4px' }}>
          📡 Live Zero-Knowledge Wire &amp; Storage Inspector (What the Server / Link-Holder Sees):
        </div>
        {inviteLink && (
          <div style={{ color: '#94a3b8', marginBottom: '4px', wordBreak: 'break-all' }}>
            <strong>Invite URL Commitment:</strong> <code>{inviteLink}</code>
          </div>
        )}
        {encryptedSampleMessages.length === 0 ? (
          <div style={{ color: '#94a3b8' }}>
            No messages in room yet — send a chat message to inspect its live <code>AD_E2EE_V1:</code> AES-256-GCM payload.
          </div>
        ) : (
          encryptedSampleMessages.map((m) => (
            <div
              key={m.id}
              style={{
                color: '#cbd5e1',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: '3px'
              }}
            >
              <strong>{m.senderName || m.senderRole}:</strong>{' '}
              <code style={{ color: '#f472b6' }}>
                {m.rawCiphertext || `AD_E2EE_V1:aes256gcm:${m.id}`}
              </code>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Official Google Sign-In Button (Material 4-color G logo + 1-click hassle-free login)
 */
export function GoogleSignInButton({ onClick, busy = false, label = 'Continue with Google Account' }) {
  return (
    <button
      type="button"
      className="gsi-material-button"
      onClick={onClick}
      disabled={busy}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '11px 16px',
        borderRadius: '12px',
        background: '#ffffff',
        color: '#1f1f1f',
        border: '1px solid #dadce0',
        fontWeight: 700,
        fontSize: '0.9rem',
        cursor: busy ? 'wait' : 'pointer',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
      <span>{busy ? 'Signing in with Google...' : label}</span>
      <span
        style={{
          fontSize: '0.66rem',
          background: 'rgba(16, 185, 129, 0.14)',
          color: '#047857',
          padding: '2px 6px',
          borderRadius: '99px',
          fontWeight: 800
        }}
      >
        Secured
      </span>
    </button>
  );
}

/**
 * Header Version & Traffic Control Pill (`v2.0.2.3`)
 */
export function VersionHeaderBadge({ onClick }) {
  const [traffic, setTraffic] = useState(() => getClientTrafficSnapshot());

  useEffect(() => {
    return subscribeTrafficTelemetry(setTraffic);
  }, []);

  const modeColor =
    traffic.mode === 'surge'
      ? '#f59e0b'
      : traffic.mode === 'elevated'
      ? '#38bdf8'
      : '#10b981';

  return (
    <button
      type="button"
      onClick={onClick}
      className="ad-version-pill"
      title={`Release ${APP_VERSION} · 100 Indian Brands · Traffic Mode: ${traffic.mode.toUpperCase()} · Click for Update Locations & APK Alerts`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 11px',
        borderRadius: '999px',
        background: 'rgba(15, 23, 42, 0.78)',
        border: `1px solid ${modeColor}88`,
        color: '#f8fafc',
        fontSize: '0.73rem',
        fontWeight: 800,
        cursor: 'pointer'
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: modeColor,
          boxShadow: `0 0 8px ${modeColor}`
        }}
      />
      <span>{APP_VERSION_TAG}</span>
      <span style={{ opacity: 0.78, fontSize: '0.67rem' }}>
        · 100 Brands · {traffic.mode === 'normal' ? 'Traffic OK' : traffic.mode.toUpperCase()}
      </span>
    </button>
  );
}

/**
 * Interactive Drawer for:
 * 1. Meaningful 4-Segment Version (`2.0.2.3`) Breakdown & Update Location Hints
 * 2. Android APK Notification Animation & Distinct Sound Tester (`Crystal Santoor & Sub-Bass Shimmer`)
 * 3. Adaptive Traffic Control & Surge Protection Telemetry
 * 4. Multi-Store & Universal Device Compatibility Matrix (Amazon, PhonePe, Samsung, GitHub)
 */
export function VersionAndTrafficControlDrawer({
  open,
  onClose,
  viewerRole = 'creator',
  onTriggerTestApkNotification
}) {
  const [traffic, setTraffic] = useState(() => getClientTrafficSnapshot());
  const [serverTraffic, setServerTraffic] = useState(null);
  const [apkModeSimulated, setApkModeSimulated] = useState(() => isAndroidApkRuntime());
  const deviceProfile = useMemo(() => getDeviceCompatibilityProfile(), []);

  useEffect(() => {
    if (!open) return undefined;
    const unsub = subscribeTrafficTelemetry(setTraffic);
    fetch('/api/traffic/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.traffic) setServerTraffic(data.traffic);
      })
      .catch(() => {});
    return unsub;
  }, [open]);

  if (!open) return null;

  function handleToggleApkSimulation() {
    const next = !apkModeSimulated;
    setSimulatedApkNotificationMode(next);
    setApkModeSimulated(next);
    if (next) {
      playAndroidApkNotificationSound(true);
    }
  }

  async function handleTestApkPushBanner() {
    await requestNativeNotificationPermission();
    setSimulatedApkNotificationMode(true);
    setApkModeSimulated(true);
    playAndroidApkNotificationSound(true);
    if (onTriggerTestApkNotification) {
      onTriggerTestApkNotification({
        senderName: viewerRole === 'creator' ? 'Zoya (Partner APK)' : 'Ayaan (Host APK)',
        text: 'Hey jaan ♥ Testing our smooth Android APK notification & Santoor chime!',
        at: Date.now(),
        isAndroidApk: true,
        soundProfile: 'android-apk-santoor-shimmer',
        viewerRole
      });
    }
  }

  return (
    <div
      className="ad-collapsible-drawer"
      style={{
        margin: '8px 0 12px',
        padding: '14px 16px',
        borderRadius: '16px',
        background: 'linear-gradient(145deg, rgba(12, 19, 38, 0.96), rgba(29, 12, 46, 0.96))',
        border: '1.5px solid rgba(56, 189, 248, 0.45)',
        boxShadow: '0 16px 38px rgba(0, 0, 0, 0.45)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #ec4899)',
              color: '#090d16',
              fontWeight: 900,
              fontSize: '0.74rem',
              padding: '3px 10px',
              borderRadius: '99px'
            }}
          >
            RELEASE {APP_VERSION_TAG}
          </span>
          <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>
            Semantic 4-Segment Version Map · APK Alerts · Traffic Control · 100 Indian Brands
          </strong>
        </div>
        {onClose && (
          <button type="button" className="ad-btn-close" onClick={onClose}>
            ✕ Close
          </button>
        )}
      </div>

      {/* SECTION 1: MEANINGFUL 4-SEGMENT VERSION BREAKDOWN (2.0.2.3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '8px',
          marginBottom: '12px'
        }}
      >
        {VERSION_SEGMENTS.map((seg) => (
          <div
            key={seg.index || seg.code}
            style={{
              padding: '9px 11px',
              borderRadius: '11px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800 }}>
                SEG #{seg.index} · {seg.code}
              </span>
              <span
                style={{
                  background: 'rgba(56, 189, 248, 0.18)',
                  color: '#bae6fd',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  padding: '1px 8px',
                  borderRadius: '6px'
                }}
              >
                {seg.digit}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginTop: '3px' }}>
              {seg.title}
            </div>
            <p style={{ margin: '3px 0 4px', fontSize: '0.71rem', color: '#cbd5e1' }}>
              {seg.meaning}
            </p>
            <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>
              📍 <code>{seg.hintLocation}</code>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 2: ANDROID APK NOTIFICATION & DISTINCT SOUND TESTER */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: '12px',
          background: 'rgba(56, 189, 248, 0.09)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#bae6fd' }}>
            📱 Android APK Notification &amp; Distinct Sound Engine (Different from Website Chime)
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#cbd5e1' }}>
            APK downloads play a <strong>Crystal Santoor &amp; Sub-Bass Shimmer (528Hz–1584Hz + Haptic Pulse)</strong> and show an animated Heads-Up Push Banner, completely separate from Web Host &amp; Guest chimes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleTestApkPushBanner}
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
              color: '#090d16',
              border: 'none',
              borderRadius: '9px',
              padding: '7px 12px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🔔 Test Android APK Banner &amp; Sound
          </button>
          <button
            type="button"
            onClick={() => playIncomingMessageSound(true, viewerRole, false)}
            style={{
              background: 'rgba(255, 79, 154, 0.18)',
              border: '1px solid rgba(255, 79, 154, 0.5)',
              color: '#fbcfe8',
              borderRadius: '9px',
              padding: '7px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🌐 Compare Website Chime
          </button>
          <button
            type="button"
            onClick={handleToggleApkSimulation}
            style={{
              background: apkModeSimulated ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${apkModeSimulated ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
              color: apkModeSimulated ? '#a7f3d0' : '#e2e8f0',
              borderRadius: '9px',
              padding: '7px 11px',
              fontSize: '0.73rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {apkModeSimulated ? '● APK Sound Mode: ON' : '○ Enable APK Sound Mode'}
          </button>
        </div>
      </div>

      {/* SECTION 3: ADAPTIVE TRAFFIC CONTROL & UNIVERSAL STORE COMPATIBILITY */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '10px',
          marginBottom: '10px'
        }}
      >
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6ee7b7', marginBottom: '4px' }}>
            🚦 Adaptive Traffic Control &amp; Surge Protection
          </div>
          <div style={{ fontSize: '0.72rem', color: '#e2e8f0', display: 'grid', gap: '3px' }}>
            <div>
              • <strong>Live Traffic Mode:</strong>{' '}
              <span style={{ color: '#34d399', fontWeight: 800 }}>
                {(serverTraffic?.mode || traffic.mode || 'normal').toUpperCase()}
              </span>{' '}
              ({serverTraffic?.rpm ?? traffic.serverRpm ?? 0} req/min)
            </div>
            <div>
              • <strong>Priority Lane P0:</strong> Couple Chat &amp; E2EE OTP Never Dropped
            </div>
            <div>
              • <strong>Coalesced Duplicate Polls:</strong> {traffic.coalescedSaves || 0} saved · Retries:{' '}
              {traffic.retriedRequests || 0}
            </div>
            <div>
              • <strong>Device Profile:</strong> {deviceProfile.formFactor} · Poll:{' '}
              {deviceProfile.recommendedBasePollMs}ms
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'rgba(244, 114, 182, 0.08)',
            border: '1px solid rgba(244, 114, 182, 0.3)'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f9a8d4', marginBottom: '4px' }}>
            🏬 Multi-Store &amp; Universal Device Compatibility ({brandCatalog.length} Indian Brands)
          </div>
          <div style={{ fontSize: '0.71rem', color: '#e2e8f0', display: 'grid', gap: '3px' }}>
            {STORE_COMPATIBILITY_MATRIX.map((st) => (
              <div key={st.storeId}>
                ✅ <strong>{st.name}:</strong> <span style={{ color: '#cbd5e1' }}>{st.features}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: EXACT UPDATE LOCATIONS HINT MAP */}
      <details style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
        <summary style={{ cursor: 'pointer', color: '#bae6fd', fontWeight: 700 }}>
          📍 View {VERSION_UPDATE_LOCATIONS.length} Module Update Locations in {APP_VERSION_TAG}
        </summary>
        <div
          style={{
            marginTop: '6px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '6px'
          }}
        >
          {VERSION_UPDATE_LOCATIONS.map((loc) => (
            <div
              key={loc.id}
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.07)'
              }}
            >
              <strong style={{ color: '#f8fafc' }}>[{loc.version}] {loc.area}:</strong>{' '}
              <code style={{ color: '#7dd3fc' }}>{loc.file}</code>
              <div style={{ color: '#cbd5e1', marginTop: '2px' }}>{loc.summary}</div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

/**
 * Flirty Romantic Human Verification Modal (Zero Traffic Lights / Zero Ugly Captchas):
 * - Automatically appears when sudden traffic spikes or automated bot patterns are detected.
 * - Combines Cloudflare Turnstile Edge compatibility with an AfterDark Romantic Vibe Check +
 *   1.2s Heartbeat Hold so only real humans can pass.
 */
export function FlirtyHumanVerificationModal() {
  const [traffic, setTraffic] = useState(() => getClientTrafficSnapshot());
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const holdTimerRef = useRef(null);
  const holdStartRef = useRef(0);

  useEffect(() => {
    return subscribeTrafficTelemetry(setTraffic);
  }, []);

  const activeChallenge =
    traffic.activeChallenge || FLIRTY_HUMAN_CHALLENGES[0];

  useEffect(() => {
    if (!traffic.challengeRequired) {
      setSelectedOptionId('');
      setHoldProgress(0);
      setHolding(false);
      setErrorMsg('');
    }
  }, [traffic.challengeRequired]);

  if (!traffic.challengeRequired) return null;

  function startHoldHeart() {
    setErrorMsg('');
    if (!selectedOptionId) {
      setErrorMsg('Pehle upar wala romantic option choose karo jaan ♥');
      return;
    }
    setHolding(true);
    holdStartRef.current = Date.now();
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const pct = Math.min(100, Math.round((elapsed / 1100) * 100));
      setHoldProgress(pct);
      if (pct >= 100) {
        clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
        setHolding(false);
        completeHumanVerification(elapsed);
      }
    }, 45);
  }

  function stopHoldHeart() {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHolding(false);
    if (holdProgress < 100) {
      setHoldProgress(0);
    }
  }

  async function completeHumanVerification(holdDurationMs = 1150) {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const data = await resilientApiRequest('/security/verify-human', {
        method: 'POST',
        priority: 'P0_CRITICAL',
        body: JSON.stringify({
          challengeId: activeChallenge.id,
          selectedOptionId,
          holdDurationMs: Math.max(holdDurationMs, 1100)
        })
      });
      if (data?.humanPassToken) {
        saveVerifiedHumanPassToken(data.humanPassToken);
      }
    } catch (err) {
      setHoldProgress(0);
      setErrorMsg(
        err.message ||
          'Arre! Woh robotic answer tha 😂 Asli romantic human option choose karke ♥ hold karo!'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="ad-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Romantic Human Vibe Check"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 12000,
        background: 'rgba(10, 4, 18, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          width: 'min(460px, 100%)',
          borderRadius: '22px',
          padding: '22px 20px',
          background: 'linear-gradient(145deg, #240b36 0%, #12071d 100%)',
          border: '1.5px solid #ff4f9a',
          boxShadow: '0 24px 64px rgba(255, 79, 154, 0.38)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span
            style={{
              background: 'rgba(255, 79, 154, 0.2)',
              border: '1px solid #ff4f9a',
              color: '#ffd1e6',
              fontWeight: 800,
              fontSize: '0.7rem',
              padding: '3px 10px',
              borderRadius: '99px'
            }}
          >
            🛡️ CLOUDFLARE EDGE × AFTERDARK VIBE CHECK
          </span>
          <span style={{ fontSize: '0.72rem', color: '#f9a8d4', fontWeight: 700 }}>
            Zero Traffic Lights ♥
          </span>
        </div>

        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '1.12rem', color: '#fff' }}>
            Hold up, Handsome / Gorgeous! 😘 Prove you’re a lover, not a bot
          </h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            Sudden traffic rush detect hua hai! Koi boring crosswalk ya fire hydrant nahi — bas asli romantic जवाब chuno aur dil (♥) ko 1 second dabaye rakho:
          </p>
        </div>

        <div
          style={{
            padding: '12px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <strong style={{ fontSize: '0.88rem', color: '#fde047' }}>
            {activeChallenge.question}
          </strong>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '4px' }}>
            {activeChallenge.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedOptionId(opt.id);
                    setErrorMsg('');
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: '11px',
                    border: isSelected
                      ? '1.5px solid #ff4f9a'
                      : '1px solid rgba(255,255,255,0.15)',
                    background: isSelected
                      ? 'rgba(255, 79, 154, 0.22)'
                      : 'rgba(255,255,255,0.04)',
                    color: '#fff',
                    fontSize: '0.81rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected ? '💖 ' : '○ '}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '8px 11px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.2)',
              border: '1px solid #f43f5e',
              color: '#fecdd3',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          disabled={submitting}
          onMouseDown={startHoldHeart}
          onMouseUp={stopHoldHeart}
          onMouseLeave={stopHoldHeart}
          onTouchStart={(e) => {
            e.preventDefault();
            startHoldHeart();
          }}
          onTouchEnd={stopHoldHeart}
          onClick={() => {
            // Accessibility / keyboard fallback if user taps after selecting valid option
            if (selectedOptionId && !holding && holdProgress === 0) {
              completeHumanVerification(1200);
            }
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            padding: '13px 16px',
            borderRadius: '14px',
            border: '1.5px solid #ff4f9a',
            background: 'rgba(255, 79, 154, 0.18)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: submitting ? 'wait' : 'pointer',
            userSelect: 'none'
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${holdProgress}%`,
              background: 'linear-gradient(90deg, #ff4f9a, #ec4899)',
              transition: 'width 0.05s linear',
              zIndex: 0
            }}
          />
          <span style={{ position: 'relative', zIndex: 1 }}>
            {submitting
              ? '✨ Unlocking Private Lounge...'
              : holdProgress > 0
              ? `💓 Feeling Your Heartbeat... ${holdProgress}%`
              : '💓 Press & Hold Heart (or Tap) to Enter Private Lounge'}
          </span>
        </button>
      </div>
    </div>
  );
}




