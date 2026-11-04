import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import { preparePhotoFiles } from './photo-helper';
import {
  CITY_PROFILES,
  detectUserLiveCityAndAddress,
  flirtyHindiDrops,
  indianQrThemes,
  getPersonalizedInChatBrandAd,
  QuickDropChipBar,
  InlineCommerceDrawer,
  LocationTreasureHuntDrawer,
  MessageWithBrandCards,
  InChatBrandPromoCard,
  IncomingMessageToast,
  ChatMediaInputActions
} from './commerce-catalog';
import {
  playIncomingMessageSound,
  playMessageSeenSound,
  triggerIncomingPartnerAlert
} from './notification-sound';
import {
  purgeStaleServiceWorkers,
  buildPublicInviteLinks,
  getClientDeviceId,
  isGuestInviteLocation,
  mirrorInviteLocally,
  resilientApiRequest,
  subscribeToCoupleSync
} from './couple-sync';
import { GuestApp } from './GuestApp';
import { ThreeRomanticScene } from './ThreeRomanticScene';
import './style.css';

purgeStaleServiceWorkers();

const SESSION_KEY = 'afterdark_session_token';
const INVITE_CACHE_KEY = 'afterdark_latest_invite_v3';
const CUSTOM_GUEST_ORIGIN_KEY = 'afterdark_custom_guest_origin';

const hyderabadCandlelightVenues = [
  'Olive Bistro, Durgam Cheruvu (Lakeview Candlelight)',
  'Taj Falaknuma Palace — Celeste Terrace',
  'Jewel of Nizam — The Minar (Golkonda Resort)',
  'Exotica Rooftop, Banjara Hills Road No. 12',
  'Tansen, Financial District (Mughlai Candlelight)',
  'Café Niloufer Lounge, Banjara Hills (Midnight Chai Date)'
];

async function renderStyledQrDataUrl(text, options) {
  if (!text) return '';
  const theme = indianQrThemes.find((t) => t.id === options.themeId) || indianQrThemes[0];
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, text, {
    width: 330,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: theme.dark,
      light: theme.light
    }
  });

  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return qrCanvas.toDataURL('image/png');

  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, theme.bgStart || '#1a0b24');
  bgGrad.addColorStop(0.55, '#12071b');
  bgGrad.addColorStop(1, theme.bgEnd || '#2d0f3a');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, 32);
  ctx.fill();

  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(12, 12, canvas.width - 24, canvas.height - 24, 26);
  ctx.stroke();

  ctx.fillStyle = `${theme.accent}28`;
  ctx.beginPath();
  ctx.roundRect(40, 26, canvas.width - 80, 38, 19);
  ctx.fill();

  ctx.fillStyle = theme.light;
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(theme.badge || '☾ PRIVATE COUPLE PASS', canvas.width / 2, 50);

  // Couple Names Header on Custom QR
  const creatorName = (options.creatorName || 'You').slice(0, 18);
  const partnerName = (options.partnerName || 'My Love').slice(0, 18);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 21px Georgia, serif';
  ctx.fillText(`${creatorName}  ♥  ${partnerName}`, canvas.width / 2, 92);

  ctx.fillStyle = theme.light;
  ctx.beginPath();
  ctx.roundRect(62, 110, 356, 356, 24);
  ctx.fill();

  ctx.drawImage(qrCanvas, 75, 123, 330, 330);

  const centerX = canvas.width / 2;
  const centerY = 288;
  ctx.fillStyle = theme.bgStart || '#1a0b24';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 28, 0, Math.PI * 2);
  ctx.stroke();

  const emblemGlyphMap = {
    chaand: '☾',
    kamal: '❀',
    dil: '♥',
    gulab: '✿'
  };
  const glyph = emblemGlyphMap[options.emblemStyle] || emblemGlyphMap[theme.emblem] || '♥';
  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, centerX, centerY + 1);
  ctx.textBaseline = 'alphabetic';

  const label = (options.label || theme.defaultLabel || 'Scan to open our private couple chat ♥').slice(0, 44);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.fillText(label, canvas.width / 2, 496);

  ctx.fillStyle = `${theme.accent}33`;
  ctx.beginPath();
  ctx.roundRect(96, 512, canvas.width - 192, 36, 18);
  ctx.fill();

  ctx.fillStyle = theme.light;
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('🔐 Scan QR · Enter Private Passcode ♥', canvas.width / 2, 535);

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('One-to-One Private Room · Couples & Best Friends', canvas.width / 2, 572);

  return canvas.toDataURL('image/png');
}

function readCachedInvite() {
  try {
    const raw = localStorage.getItem(INVITE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.status === 'revoked') return null;
    return parsed;
  } catch {
    return null;
  }
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(SESSION_KEY) || '');
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('invite');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const [authMode, setAuthMode] = useState('signup');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    displayName: '',
    ageConfirmed: true
  });

  const [activeConnection, setActiveConnection] = useState(null);
  const [activeInvite, setActiveInvite] = useState(() => readCachedInvite());

  const [customGuestOrigin, setCustomGuestOrigin] = useState(
    () => localStorage.getItem(CUSTOM_GUEST_ORIGIN_KEY) || ''
  );
  const [showCustomDomainConfig, setShowCustomDomainConfig] = useState(false);

  // Single-Invite Generator Form (only accessible when NO invite is active)
  const [generatorForm, setGeneratorForm] = useState({
    creatorCustomName: '',
    partnerCustomName: '',
    themeId: 'charminar',
    emblemStyle: 'dil',
    customLabel: 'Scan karke seedha humare chat mein aao ♥'
  });

  const [standardQrDataUrl, setStandardQrDataUrl] = useState('');
  const [customQrDataUrl, setCustomQrDataUrl] = useState('');
  const [showCustomQrCard, setShowCustomQrCard] = useState(false);

  // Private Chat State & Hidden Tool Drawers
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoCaption, setPhotoCaption] = useState('');

  // Collapsible drawers inside chat so nothing is clumsy or expanded unnecessarily
  const [activeChatDrawer, setActiveChatDrawer] = useState('none'); // 'none' | 'photos' | 'calendar' | 'rooftop3d' | 'flirt' | 'store' | 'treasure'
  const [activeBrandId, setActiveBrandId] = useState('flipkart_minutes');
  const [userCity, setUserCity] = useState('Hyderabad');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [incomingToast, setIncomingToast] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [elapsedChatMinutes, setElapsedChatMinutes] = useState(0);
  const [treasurePromptDismissed, setTreasurePromptDismissed] = useState(false);
  const chatStartTimeRef = useRef(Date.now());
  const lastSeenMsgIdRef = useRef(null);
  const initializedMsgStreamRef = useRef(false);
  const seenByPartnerIdsRef = useRef(new Set());
  const lastAnalyzedCountRef = useRef(0);

  useEffect(() => {
    if (!activeConnection) return undefined;
    const baseStart =
      (activeConnection.approvedAt && Date.parse(activeConnection.approvedAt)) ||
      (messages[0]?.createdAt && Date.parse(messages[0].createdAt)) ||
      chatStartTimeRef.current;
    const updateElapsed = () => {
      const mins = Math.max(0, Math.floor((Date.now() - baseStart) / 60000));
      setElapsedChatMinutes(mins);
    };
    updateElapsed();
    const timer = setInterval(updateElapsed, 15000);
    return () => clearInterval(timer);
  }, [activeConnection?.id, messages.length]);

  // Candlelight Dinner / Google Calendar Form
  const [dateForm, setDateForm] = useState({
    title: 'Romantic Candlelight Dinner ♥',
    location: hyderabadCandlelightVenues[0],
    dateTime: '',
    description: 'Dress up for a magical evening — just the two of us.'
  });
  const [groundedSpots, setGroundedSpots] = useState([]);
  const [loadingSpots, setLoadingSpots] = useState(false);

  useEffect(() => {
    let mounted = true;
    detectUserLiveCityAndAddress().then((detected) => {
      if (mounted && detected?.city) {
        setUserCity(detected.city);
        const firstSpot = CITY_PROFILES[detected.city]?.cafesAndSpots?.[0]?.name;
        if (firstSpot) {
          setDateForm((prev) => ({ ...prev, location: firstSpot }));
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const chatEndRef = useRef(null);

  const inviteLinks = useMemo(() => {
    if (!activeInvite?.inviteToken) {
      return { primaryUrl: '', guestAppUrl: '', rootDirectUrl: '', sameOriginUrl: '' };
    }
    return buildPublicInviteLinks({
      inviteToken: activeInvite.inviteToken,
      verificationCode: activeInvite.verificationCode,
      creatorDisplayName:
        activeInvite.creatorCustomName ||
        user?.displayName ||
        activeInvite.creatorDisplayName ||
        'Partner',
      recipientHint:
        activeInvite.partnerCustomName || activeInvite.recipientHint || 'Meri Jaan',
      creatorDeviceId: activeInvite.creatorDeviceId || getClientDeviceId(),
      creatorIp: activeInvite.creatorIp || '',
      customGuestOrigin
    });
  }, [activeInvite, user?.displayName, customGuestOrigin]);

  const guestInviteLink = inviteLinks.primaryUrl;

  useEffect(() => {
    try {
      if (activeInvite && activeInvite.status !== 'revoked') {
        localStorage.setItem(INVITE_CACHE_KEY, JSON.stringify(activeInvite));
        mirrorInviteLocally(activeInvite);
      } else {
        localStorage.removeItem(INVITE_CACHE_KEY);
      }
    } catch {
      // Ignore storage issues
    }
  }, [activeInvite]);

  useEffect(() => {
    let mounted = true;
    if (!guestInviteLink || !activeInvite) {
      setStandardQrDataUrl('');
      setCustomQrDataUrl('');
      return undefined;
    }

    QRCode.toDataURL(guestInviteLink, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#14081c',
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (mounted) setStandardQrDataUrl(url);
      })
      .catch(() => {
        if (mounted) setStandardQrDataUrl('');
      });

    renderStyledQrDataUrl(guestInviteLink, {
      themeId: activeInvite.themeId || generatorForm.themeId || 'charminar',
      emblemStyle: activeInvite.emblemStyle || generatorForm.emblemStyle || 'dil',
      creatorName: activeInvite.creatorCustomName || user?.displayName || 'You',
      partnerName: activeInvite.partnerCustomName || activeInvite.recipientHint || 'My Love',
      label: generatorForm.customLabel,
      otpCode: activeInvite.verificationCode || ''
    })
      .then((customUrl) => {
        if (mounted) setCustomQrDataUrl(customUrl);
      })
      .catch(() => {
        if (mounted) setCustomQrDataUrl('');
      });

    return () => {
      mounted = false;
    };
  }, [
    guestInviteLink,
    activeInvite,
    user?.displayName,
    generatorForm.themeId,
    generatorForm.emblemStyle,
    generatorForm.customLabel
  ]);

  async function loadWorkspace(currentToken = token) {
    if (!currentToken) return;
    try {
      const queryParams = new URLSearchParams();
      if (activeInvite?.inviteToken) queryParams.set('inviteToken', activeInvite.inviteToken);
      if (activeInvite?.verificationCode) queryParams.set('otp', activeInvite.verificationCode);
      if (activeInvite?.partnerCustomName || activeInvite?.recipientHint) {
        queryParams.set('hint', activeInvite.partnerCustomName || activeInvite.recipientHint);
      }
      const qs = queryParams.toString();

      const [meData, currentInviteData, connectionData] = await Promise.all([
        resilientApiRequest('/me', {}, currentToken),
        resilientApiRequest('/invites/current', {}, currentToken).catch(() => ({ invite: null })),
        resilientApiRequest(`/connections${qs ? `?${qs}` : ''}`, {}, currentToken)
      ]);

      setUser(meData.user);
      if (meData.user?.displayName && !generatorForm.creatorCustomName) {
        setGeneratorForm((prev) => ({
          ...prev,
          creatorCustomName: meData.user.displayName
        }));
      }

      if (currentInviteData?.invite) {
        setActiveInvite(currentInviteData.invite);
      }

      const list = connectionData.connections || [];
      const active = list.find((item) => item.status === 'active') || null;
      setActiveConnection(active);
    } catch {
      localStorage.removeItem(SESSION_KEY);
      setToken('');
      setUser(null);
    }
  }

  async function loadConnectionDetails(connection, currentToken = token) {
    if (!connection || connection.status !== 'active' || !currentToken) {
      setMessages([]);
      setPhotos([]);
      return;
    }

    try {
      const [msgData, photoData] = await Promise.all([
        resilientApiRequest(`/connections/${connection.id}/messages`, {}, currentToken),
        resilientApiRequest(`/connections/${connection.id}/photos`, {}, currentToken)
      ]);
      const nextMessages = msgData.messages || [];
      setMessages(nextMessages);
      setPhotos(photoData.photos || []);

      // Detect newly arrived message from partner (Guest) and trigger chime + visual toast
      if (nextMessages.length > 0) {
        const latest = nextMessages[nextMessages.length - 1];
        if (!initializedMsgStreamRef.current) {
          initializedMsgStreamRef.current = true;
          lastSeenMsgIdRef.current = latest.id;
          nextMessages.forEach((m) => {
            if (m.senderRole === 'creator' && m.seenAt) {
              seenByPartnerIdsRef.current.add(m.id);
            }
          });
        } else {
          if (latest.id && latest.id !== lastSeenMsgIdRef.current) {
            lastSeenMsgIdRef.current = latest.id;
            if (latest.senderRole && latest.senderRole !== 'creator') {
              const partnerName = connection.peerDisplayName || 'Your Partner';
              const textPreview =
                latest.body || latest.text || 'Sent you a voice note / live snap ♥';
              triggerIncomingPartnerAlert({
                senderName: partnerName,
                messageText: textPreview,
                soundEnabled
              });
              setIncomingToast({
                id: latest.id,
                senderName: partnerName,
                text: textPreview
              });
            }
          }

          // Detect when partner reads our sent message (seenAt transitions from null -> timestamp)
          let newlySeen = false;
          for (const m of nextMessages) {
            if (m.senderRole === 'creator' && m.seenAt && !seenByPartnerIdsRef.current.has(m.id)) {
              seenByPartnerIdsRef.current.add(m.id);
              newlySeen = true;
            }
          }
          if (newlySeen) {
            playMessageSeenSound(soundEnabled);
          }
        }

        // Background Free Server-Side Gemini Chat Analysis when message count changes
        if (nextMessages.length !== lastAnalyzedCountRef.current) {
          lastAnalyzedCountRef.current = nextMessages.length;
          resilientApiRequest(
            '/ai/analyze-chat',
            {
              method: 'POST',
              body: JSON.stringify({
                messages: nextMessages.slice(-6),
                viewerRole: 'creator'
              })
            },
            currentToken
          )
            .then((res) => {
              if (res?.insight) setAiInsight(res.insight);
            })
            .catch(() => {});
        }
      }
    } catch {
      // Ignore transient poll errors
    }
  }

  useEffect(() => {
    if (token) {
      loadWorkspace(token);
    }
  }, [token]);

  useEffect(() => {
    if (activeConnection && token) {
      loadConnectionDetails(activeConnection, token);
    }
  }, [activeConnection?.id, activeConnection?.status, token]);

  useEffect(() => {
    if (!token) return undefined;

    const refresh = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (activeInvite?.inviteToken) queryParams.set('inviteToken', activeInvite.inviteToken);
        if (activeInvite?.verificationCode) queryParams.set('otp', activeInvite.verificationCode);
        if (activeInvite?.partnerCustomName || activeInvite?.recipientHint) {
          queryParams.set('hint', activeInvite.partnerCustomName || activeInvite.recipientHint);
        }
        const qs = queryParams.toString();
        const connectionData = await resilientApiRequest(
          `/connections${qs ? `?${qs}` : ''}`,
          {},
          token
        );
        const list = connectionData.connections || [];
        const active = list.find((item) => item.status === 'active') || null;

        if (active) {
          const justConnected =
            !activeConnection ||
            activeConnection.status !== 'active' ||
            activeConnection.id !== active.id;
          setActiveConnection(active);
          if (justConnected) {
            setStatusMessage(
              `🎉 ${active.peerDisplayName} connected to your private 1-on-1 room! Start chatting ♥`
            );
            setTab('chat');
          }
          await loadConnectionDetails(active, token);
        } else if (activeConnection) {
          setActiveConnection(null);
        }
      } catch {
        // Ignore transient poll errors
      }
    };

    const interval = setInterval(refresh, 2000);
    const unsubscribe = subscribeToCoupleSync(refresh);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [token, activeConnection?.id, activeConnection?.status, activeInvite?.inviteToken]);

  function clearBanners() {
    setErrorMessage('');
    setStatusMessage('');
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    clearBanners();
    setBusy(true);
    try {
      const endpoint = authMode === 'signup' ? '/auth/signup' : '/auth/login';
      const data = await resilientApiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(authForm)
      });
      localStorage.setItem(SESSION_KEY, data.sessionToken);
      setToken(data.sessionToken);
      setUser(data.user);
      setGeneratorForm((prev) => ({
        ...prev,
        creatorCustomName: data.user?.displayName || ''
      }));
      setTab('invite');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    clearBanners();
    try {
      if (token) {
        await resilientApiRequest('/auth/logout', { method: 'POST' }, token);
      }
    } catch {
      // Ignore
    }
    localStorage.removeItem(SESSION_KEY);
    setToken('');
    setUser(null);
    setActiveConnection(null);
  }

  async function handleGenerateSingleInvite(event) {
    event.preventDefault();
    clearBanners();

    if (activeInvite || activeConnection) {
      setErrorMessage(
        'You already have an active Couple Link & QR Code. Revoke access and remove your current QR code first!'
      );
      return;
    }

    setBusy(true);
    try {
      const creatorCustomName =
        generatorForm.creatorCustomName.trim() || user?.displayName || 'You';
      const partnerCustomName =
        generatorForm.partnerCustomName.trim() || 'Meri Jaan';

      const data = await resilientApiRequest(
        '/invites',
        {
          method: 'POST',
          body: JSON.stringify({
            recipientHint: partnerCustomName,
            creatorCustomName,
            partnerCustomName,
            deviceId: getClientDeviceId(),
            themeId: generatorForm.themeId,
            emblemStyle: generatorForm.emblemStyle
          })
        },
        token
      );

      setActiveInvite(data);
      setStatusMessage(
        `✨ Unique Couple Link, QR Code & OTP (${data.verificationCode}) generated for ${creatorCustomName} ♥ ${partnerCustomName}!`
      );
    } catch (error) {
      setErrorMessage(error.message);
      await loadWorkspace(token);
    } finally {
      setBusy(false);
    }
  }

  async function handleRevokeInviteAndQr() {
    clearBanners();
    setBusy(true);
    try {
      await resilientApiRequest('/invites/revoke', { method: 'POST' }, token);
      localStorage.removeItem(INVITE_CACHE_KEY);
      setActiveInvite(null);
      setActiveConnection(null);
      setMessages([]);
      setPhotos([]);
      setShowCustomQrCard(false);
      setStatusMessage(
        '🔒 Access revoked and QR code removed! The previous link & OTP are now permanently disabled. You can generate a new one now.'
      );
      setTab('invite');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    if (!messageInput.trim() || !activeConnection) return;
    clearBanners();
    try {
      const textToSend = messageInput;
      setMessageInput('');
      await resilientApiRequest(
        `/connections/${activeConnection.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ body: textToSend, text: textToSend })
        },
        token
      );
      await loadConnectionDetails(activeConnection, token);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleSendQuickFlirt(text) {
    if (!activeConnection) return;
    clearBanners();
    try {
      await resilientApiRequest(
        `/connections/${activeConnection.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ body: text, text })
        },
        token
      );
      setActiveChatDrawer('none');
      await loadConnectionDetails(activeConnection, token);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleSendVoiceNote(voiceMeta) {
    if (!activeConnection || !voiceMeta?.dataUrl) return;
    clearBanners();
    try {
      await resilientApiRequest(
        `/connections/${activeConnection.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            body: `🎤 Sent a private voice note (${voiceMeta.durationSec || 1}s) ♥`,
            voiceMeta
          })
        },
        token
      );
      await loadConnectionDetails(activeConnection, token);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleSendLiveCameraSnap(photoMeta) {
    if (!activeConnection || !photoMeta?.dataUrl) return;
    clearBanners();
    try {
      await resilientApiRequest(
        `/connections/${activeConnection.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            body: `📷 ${photoMeta.caption || 'Live Camera Snap ♥'}`,
            photoMeta
          })
        },
        token
      );
      await loadConnectionDetails(activeConnection, token);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDiscoverGroundedSpots() {
    setLoadingSpots(true);
    try {
      const res = await resilientApiRequest(
        '/ai/discover-date-spots',
        {
          method: 'POST',
          body: JSON.stringify({ city: userCity || 'Hyderabad', mood: dateForm.title })
        },
        token
      );
      setGroundedSpots(res.spots || []);
    } catch {
      // Ignore
    } finally {
      setLoadingSpots(false);
    }
  }

  async function handleBookAffiliateOrder({
    brandId,
    itemId,
    itemTitle,
    phoneNumber,
    city,
    address,
    note
  }) {
    if (!activeConnection) return;
    clearBanners();
    try {
      const res = await resilientApiRequest(
        `/connections/${activeConnection.id}/orders`,
        {
          method: 'POST',
          body: JSON.stringify({
            brandId,
            itemId,
            itemTitle,
            phoneNumber,
            city: city || userCity,
            address,
            note,
            privateOnly: true
          })
        },
        token
      );
      setStatusMessage(
        `🔒 Private order details saved for "${res.order.itemName}" on ${res.order.brandName} (Hidden from partner chat). Click "Proceed to Official ${res.order.brandName}" to complete payment!`
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleShareCafeDateInChat(customDateMeta) {
    if (!activeConnection || !customDateMeta) return;
    clearBanners();
    try {
      await resilientApiRequest(
        `/connections/${activeConnection.id}/dates`,
        {
          method: 'POST',
          body: JSON.stringify(customDateMeta)
        },
        token
      );
      setStatusMessage(
        '🕯️ Cafe / Dinner Date shared in chat with direct Google Calendar button!'
      );
      await loadConnectionDetails(activeConnection, token);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleScheduleCandlelightDate(event) {
    event.preventDefault();
    if (!activeConnection) return;
    clearBanners();
    setBusy(true);
    try {
      await resilientApiRequest(
        `/connections/${activeConnection.id}/dates`,
        {
          method: 'POST',
          body: JSON.stringify(dateForm)
        },
        token
      );
      setActiveChatDrawer('none');
      setStatusMessage(
        '🕯️ Candlelight Dinner Date shared in chat! Click "Add to Google Calendar" on the card in chat.'
      );
      await loadConnectionDetails(activeConnection, token);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePhotoUpload(event) {
    const fileList = event.target.files;
    if (!fileList?.length || !activeConnection) return;
    clearBanners();
    setBusy(true);
    try {
      const prepared = await preparePhotoFiles(fileList);
      for (const item of prepared) {
        await resilientApiRequest(
          `/connections/${activeConnection.id}/photos`,
          {
            method: 'POST',
            body: JSON.stringify({
              dataUrl: item.dataUrl,
              caption: photoCaption || item.name
            })
          },
          token
        );
      }
      setPhotoCaption('');
      setActiveChatDrawer('none');
      await loadConnectionDetails(activeConnection, token);
      setStatusMessage('📸 Photo sent to your private couple chat!');
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  function handleOpenBrandDrawer(brandId) {
    setActiveBrandId(brandId || 'blinkit');
    setActiveChatDrawer('store');
  }

  async function copyText(value, label) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setStatusMessage(`${label} copied to clipboard!`);
    } catch {
      setErrorMessage(`Could not copy ${label.toLowerCase()}.`);
    }
  }

  function downloadDataUrl(dataUrl, filename) {
    if (!dataUrl) return;
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.appendChild && document.body.removeChild(anchor);
  }

  return (
    <div className="ad-shell">
      <div className="ad-ambient ad-ambient-one" />
      <div className="ad-ambient ad-ambient-two" />

      <header className="ad-header">
        <div className="ad-brand">
          <span className="ad-brand-mark">☾</span>
          <div>
            <p className="ad-brand-title">AFTERDARK</p>
            <p className="ad-brand-subtitle">
              One-to-One Private Couple Link · Encrypted OTP &amp; QR Room
            </p>
          </div>
        </div>

        {/* Clean Navigation: Once signed in, never show Sign-In again, and never mix the Guest Site into the Main Site */}
        <nav className="ad-nav" aria-label="Creator Workspace Navigation">
          {user && (
            <>
              <button
                type="button"
                className={tab === 'invite' ? 'active' : ''}
                onClick={() => setTab('invite')}
              >
                1. My Couple Link &amp; QR
              </button>
              <button
                type="button"
                className={tab === 'chat' ? 'active' : ''}
                onClick={() => setTab('chat')}
              >
                2. Private Couple Chat {activeConnection?.status === 'active' ? '● Live' : ''}
              </button>
            </>
          )}
          {user && (
            <div className="ad-user-chip">
              <span>♥ {user.displayName}</span>
              <button type="button" className="ad-signout-mini" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </nav>
      </header>

      <IncomingMessageToast
        notification={incomingToast}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onTestSound={() => playIncomingMessageSound(true)}
        onDismiss={() => setIncomingToast(null)}
      />

      {(statusMessage || errorMessage) && (
        <div className="ad-banner-stack">
          {statusMessage && (
            <div className="ad-banner success" onClick={() => setStatusMessage('')}>
              <span>{statusMessage}</span>
              <small style={{ marginLeft: 12, cursor: 'pointer' }}>✕</small>
            </div>
          )}
          {errorMessage && (
            <div className="ad-banner error" onClick={() => setErrorMessage('')}>
              <span>{errorMessage}</span>
              <small style={{ marginLeft: 12, cursor: 'pointer' }}>✕</small>
            </div>
          )}
        </div>
      )}

      <main className="ad-main">
        {/* VIEW 1: BEFORE SIGN-IN -> Clean Landing + Sign In / Create Account (No clumsy extra tabs) */}
        {!user ? (
          <section className="ad-hero">
            <div className="ad-hero-copy">
              <div className="ad-pill-row">
                <span className="ad-pill">STRICTLY ONE-TO-ONE</span>
                <span className="ad-pill">COUPLES &amp; BEST FRIENDS (BOY–GIRL DUOS)</span>
                <span className="ad-pill">GUEST CHATS WITHOUT LOGIN</span>
              </div>
              <h1>
                One Private Link. One QR Code. <br />
                <span>For Couples &amp; Best Friends ♥</span>
              </h1>
              <p className="ad-lead">
                Whether you are <strong>romantic partners</strong> or <strong>two best friends (boy &amp; girl dosts)</strong>, sign in to generate your single active <strong>Guest Website Link, 6-Digit Passcode &amp; Custom QR Code</strong>. When your partner or bestie scans the QR on their phone, it opens a login-free private 1-on-1 room — with voice notes, live snaps, location treasure hunts, and surprise perks.
              </p>

              <div className="ad-stat-grid">
                <div>
                  <small>Strict Single-Partner Rule</small>
                  <strong>1 Active QR &amp; OTP at a time (Revoke required to reset)</strong>
                </div>
                <div>
                  <small>Partner Experience</small>
                  <strong>Scans QR → Enters Consent &amp; OTP → Instant Chat</strong>
                </div>
              </div>
            </div>

            <div className="ad-card">
              <div className="ad-tab-pills">
                <button
                  type="button"
                  className={authMode === 'signup' ? 'active' : ''}
                  onClick={() => setAuthMode('signup')}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  className={authMode === 'login' ? 'active' : ''}
                  onClick={() => setAuthMode('login')}
                >
                  Sign In
                </button>
              </div>

              <h2>
                {authMode === 'signup'
                  ? 'Create Your Creator Account'
                  : 'Welcome Back'}
              </h2>
              <p className="ad-muted">
                Sign in to generate your unique 1-on-1 partner QR code and OTP.
              </p>

              <form className="ad-form" onSubmit={handleAuthSubmit}>
                {authMode === 'signup' && (
                  <label>
                    <span>Your Name / Nickname</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ayaan"
                      value={authForm.displayName}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, displayName: e.target.value })
                      }
                    />
                  </label>
                )}

                <label>
                  <span>Email Address</span>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  />
                </label>

                <label>
                  <span>Password (8+ characters)</span>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  />
                </label>

                {authMode === 'signup' && (
                  <label className="ad-checkbox">
                    <input
                      type="checkbox"
                      checked={authForm.ageConfirmed}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, ageConfirmed: e.target.checked })
                      }
                    />
                    <span>I confirm I am 18+ and creating a mutual 1-on-1 couple link.</span>
                  </label>
                )}

                <button type="submit" className="ad-btn ad-btn-primary" disabled={busy}>
                  {busy
                    ? 'Please wait...'
                    : authMode === 'signup'
                    ? 'Create Account & Generate Couple QR →'
                    : 'Sign In →'}
                </button>
              </form>
            </div>
          </section>
        ) : tab === 'invite' ? (
          /* VIEW 2: SIGNED-IN CREATOR -> STRICT 1-AT-A-TIME LINK + QR + OTP PASS */
          <section className="ad-section">
            {!activeInvite ? (
              <div className="ad-card ad-narrow">
                <span className="ad-tag">STEP 1 · ONE-AT-A-TIME COUPLE LINK GENERATOR</span>
                <h2>Generate Your Unique Partner Link, QR &amp; OTP</h2>
                <p className="ad-muted">
                  You can only have <strong>one active QR code and invite link at a time</strong>. Enter both your names and choose a color theme for your Custom Couple QR.
                </p>

                <form className="ad-form" onSubmit={handleGenerateSingleInvite}>
                  <div className="ad-two-col-inputs">
                    <label>
                      <span>Your Name (Printed on Custom QR)</span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ayaan"
                        value={generatorForm.creatorCustomName}
                        onChange={(e) =>
                          setGeneratorForm({
                            ...generatorForm,
                            creatorCustomName: e.target.value
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Partner&apos;s Name (Printed on Custom QR)</span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Zoya"
                        value={generatorForm.partnerCustomName}
                        onChange={(e) =>
                          setGeneratorForm({
                            ...generatorForm,
                            partnerCustomName: e.target.value
                          })
                        }
                      />
                    </label>
                  </div>

                  <label>
                    <span>Custom QR Color &amp; Romantic Theme</span>
                    <div className="ad-indian-theme-grid">
                      {indianQrThemes.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className={`ad-indian-theme-card ${
                            generatorForm.themeId === t.id ? 'active' : ''
                          }`}
                          onClick={() =>
                            setGeneratorForm({
                              ...generatorForm,
                              themeId: t.id,
                              emblemStyle: t.emblem,
                              customLabel: t.defaultLabel
                            })
                          }
                        >
                          <div className="ad-theme-swatch-row">
                            <span
                              className="ad-theme-dot"
                              style={{ background: t.dark, borderColor: t.accent }}
                            />
                            <span
                              className="ad-theme-dot"
                              style={{ background: t.accent }}
                            />
                            <span
                              className="ad-theme-dot"
                              style={{ background: t.light }}
                            />
                          </div>
                          <strong>{t.name}</strong>
                          <small>{t.flavor}</small>
                        </button>
                      ))}
                    </div>
                  </label>

                  <label>
                    <span>Romantic Message on Custom QR</span>
                    <input
                      type="text"
                      maxLength={44}
                      value={generatorForm.customLabel}
                      onChange={(e) =>
                        setGeneratorForm({ ...generatorForm, customLabel: e.target.value })
                      }
                    />
                  </label>

                  <button type="submit" className="ad-btn ad-btn-primary" disabled={busy}>
                    {busy
                      ? 'Generating Unique Link, OTP & QR...'
                      : '✨ Generate Unique Link, QR Code & 6-Digit OTP →'}
                  </button>
                </form>
              </div>
            ) : (
              /* ACTIVE SINGLE INVITE + QR CARD (Generator is locked until Revoked!) */
              <div className="ad-card">
                <div className="ad-qr-hub-grid">
                  <div className="ad-qr-hub-info">
                    <div className="ad-pill-row">
                      <span className="ad-pill">🔒 SINGLE ACTIVE COUPLE PASS</span>
                      <span className="ad-pill">
                        {activeConnection?.status === 'active'
                          ? `● CONNECTED WITH ${activeConnection.peerDisplayName.toUpperCase()}`
                          : '⏳ WAITING FOR PARTNER OTP'}
                      </span>
                    </div>

                    <h2>
                      {activeInvite.creatorCustomName || user.displayName} ♥{' '}
                      {activeInvite.partnerCustomName || activeInvite.recipientHint}
                    </h2>
                    <p className="ad-muted">
                      Send this unique Second App (Guest) Link or QR code to your partner. Scanning the QR code opens the dedicated login-free Guest Chat Page where they enter this <strong>6-Digit OTP</strong> to connect with you.
                    </p>

                    <div className="ad-otp-highlight">
                      <div>
                        <span className="ad-otp-label">UNIQUE 6-DIGIT COUPLE OTP</span>
                        <div className="ad-otp-digits">{activeInvite.verificationCode}</div>
                      </div>
                      <button
                        type="button"
                        className="ad-btn ad-btn-secondary"
                        onClick={() => copyText(activeInvite.verificationCode, '6-Digit OTP')}
                      >
                        Copy OTP
                      </button>
                    </div>

                    <div className="ad-copy-box">
                      <small>
                        Partner Invite Link (Share Only With Your Partner — Cannot Be Opened on This Device/IP)
                      </small>
                      <code>{guestInviteLink}</code>
                    </div>

                    <div className="ad-cta-row">
                      <button
                        type="button"
                        className="ad-btn ad-btn-primary"
                        onClick={() => copyText(guestInviteLink, 'Partner Invite Link')}
                      >
                        📋 Copy Link to Send to Partner
                      </button>

                      {typeof navigator !== 'undefined' && navigator.share && (
                        <button
                          type="button"
                          className="ad-btn ad-btn-secondary"
                          onClick={() => {
                            navigator
                              .share({
                                title: 'Our Private AFTERDARK Couple Chat ♥',
                                text: `Join our private 1-on-1 chat! Use 6-digit OTP: ${activeInvite.verificationCode}`,
                                url: guestInviteLink
                              })
                              .catch(() => {});
                          }}
                        >
                          📲 Share to Partner’s Phone
                        </button>
                      )}

                      <button
                        type="button"
                        className="ad-btn ad-btn-secondary"
                        onClick={() => setShowCustomDomainConfig((prev) => !prev)}
                      >
                        ⚙️ Custom Second App Domain
                      </button>

                      {activeConnection?.status === 'active' && (
                        <button
                          type="button"
                          className="ad-btn ad-btn-secondary"
                          onClick={() => setTab('chat')}
                        >
                          Open Private Chat with {activeConnection.peerDisplayName} ♥
                        </button>
                      )}

                      <button
                        type="button"
                        className="ad-btn ad-btn-danger"
                        onClick={handleRevokeInviteAndQr}
                        disabled={busy}
                      >
                        🔒 Revoke Access &amp; Remove QR Code
                      </button>
                    </div>

                    {showCustomDomainConfig && (
                      <div className="ad-collapsible-drawer" style={{ marginTop: 12 }}>
                        <div className="ad-drawer-head">
                          <strong>🌐 Custom Second App Base URL (Optional)</strong>
                          <button
                            type="button"
                            className="ad-btn-close"
                            onClick={() => setShowCustomDomainConfig(false)}
                          >
                            ✕ Close
                          </button>
                        </div>
                        <p className="ad-muted" style={{ fontSize: '0.84rem', margin: '4px 0 8px' }}>
                          Leave blank to use this domain automatically (guaranteed zero 404). Or enter a separate deployed Guest App URL if you hosted <code>guest-site</code> separately:
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="url"
                            placeholder="https://your-guest-app.vercel.app (leave empty for default)"
                            value={customGuestOrigin}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomGuestOrigin(val);
                              localStorage.setItem(CUSTOM_GUEST_ORIGIN_KEY, val);
                            }}
                            style={{ flex: 1 }}
                          />
                          {customGuestOrigin && (
                            <button
                              type="button"
                              className="ad-btn ad-btn-secondary"
                              onClick={() => {
                                setCustomGuestOrigin('');
                                localStorage.removeItem(CUSTOM_GUEST_ORIGIN_KEY);
                              }}
                            >
                              Reset to Default
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <p className="ad-lock-notice">
                      * Strict 1-on-1 Privacy: You cannot generate another link or QR code while this one is active. Click <strong>Revoke Access &amp; Remove QR Code</strong> to disable this link and generate a new one.
                    </p>
                  </div>

                  <div className="ad-qr-hub-visual">
                    <span className="ad-tag">
                      {showCustomQrCard
                        ? 'CUSTOM COLORFUL COUPLE QR (WITH NAMES)'
                        : 'STANDARD GUEST LINK QR CODE'}
                    </span>

                    {!showCustomQrCard && standardQrDataUrl && (
                      <div className="ad-qr-single-box">
                        <img
                          src={standardQrDataUrl}
                          alt="Standard Partner Invite QR"
                          className="ad-qr-img-standard"
                        />
                        <button
                          type="button"
                          className="ad-btn ad-btn-secondary"
                          onClick={() =>
                            downloadDataUrl(
                              standardQrDataUrl,
                              `afterdark-qr-${activeInvite.verificationCode}.png`
                            )
                          }
                        >
                          ⬇ Download Standard QR
                        </button>
                      </div>
                    )}

                    {showCustomQrCard && customQrDataUrl && (
                      <div className="ad-qr-single-box">
                        <img
                          src={customQrDataUrl}
                          alt="Custom Named Couple QR"
                          className="ad-qr-img-custom"
                        />
                        <button
                          type="button"
                          className="ad-btn ad-btn-primary"
                          onClick={() =>
                            downloadDataUrl(
                              customQrDataUrl,
                              `afterdark-couple-qr-${activeInvite.verificationCode}.png`
                            )
                          }
                        >
                          ⬇ Download Custom Named QR
                        </button>
                      </div>
                    )}

                    <div style={{ marginTop: 12, width: '100%' }}>
                      <button
                        type="button"
                        className={`ad-custom-qr-toggle-btn ${showCustomQrCard ? 'open' : ''}`}
                        onClick={() => setShowCustomQrCard((prev) => !prev)}
                      >
                        {showCustomQrCard
                          ? 'Switch to Standard QR Code'
                          : '🎨 View Custom Colorful QR with Couple Names'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        ) : (
          /* VIEW 3: FOCUSED, UNCLUTTERED PRIVATE COUPLE CHAT */
          <section className="ad-section">
            {!activeConnection || activeConnection.status !== 'active' ? (
              <div className="ad-card ad-narrow">
                <span className="ad-tag">WAITING FOR PARTNER</span>
                <h2>Your Partner Hasn&apos;t Entered the OTP Yet</h2>
                <p className="ad-muted">
                  Share your unique QR code or Guest Website Link and the 6-digit OTP (
                  <strong>{activeInvite?.verificationCode || '—'}</strong>) with your partner. As soon as they verify the OTP on the Guest Website, your private chat will open here automatically!
                </p>
                <div className="ad-cta-row">
                  <button
                    type="button"
                    className="ad-btn ad-btn-primary"
                    onClick={() => setTab('invite')}
                  >
                    ← Back to My Link &amp; QR Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="ad-card ad-focused-chat-shell">
                {/* Clean Chat Topbar with Hidden/Toggleable Actions (No private Channel ID or OTP exposed) */}
                <div className="ad-chat-header">
                  <div>
                    <span className="ad-tag">
                      ● PRIVATE 1-ON-1 ROOM · END-TO-END ISOLATED · COUPLES &amp; BESTIES
                    </span>
                    <h2>
                      {activeInvite?.creatorCustomName || user.displayName} &amp;{' '}
                      {activeConnection.peerDisplayName} ♥
                    </h2>
                  </div>

                  <div className="ad-chat-toolbar">
                    <button
                      type="button"
                      className={`ad-tool-btn ${activeChatDrawer === 'treasure' ? 'active' : ''}`}
                      onClick={() =>
                        setActiveChatDrawer((prev) => (prev === 'treasure' ? 'none' : 'treasure'))
                      }
                      style={{
                        borderColor:
                          elapsedChatMinutes >= 10
                            ? 'rgba(251, 191, 36, 0.75)'
                            : 'rgba(167, 139, 250, 0.45)',
                        background:
                          elapsedChatMinutes >= 10
                            ? 'rgba(251, 191, 36, 0.16)'
                            : undefined
                      }}
                    >
                      🗺️ {elapsedChatMinutes >= 10 ? 'Treasure Hunt Unlocked!' : 'Treasure Hunt & Tasks'}
                    </button>
                    <button
                      type="button"
                      className={`ad-tool-btn ${activeChatDrawer === 'store' ? 'active' : ''}`}
                      onClick={() =>
                        setActiveChatDrawer((prev) => (prev === 'store' ? 'none' : 'store'))
                      }
                    >
                      🛍️ Private Offers &amp; Cafes ({userCity === 'Patna' ? 'Patna/Bihar' : userCity})
                    </button>
                    <button
                      type="button"
                      className={`ad-tool-btn ${activeChatDrawer === 'photos' ? 'active' : ''}`}
                      onClick={() =>
                        setActiveChatDrawer((prev) => (prev === 'photos' ? 'none' : 'photos'))
                      }
                    >
                      📸 Photos ({photos.length})
                    </button>
                    <button
                      type="button"
                      className={`ad-tool-btn ${activeChatDrawer === 'calendar' ? 'active' : ''}`}
                      onClick={() =>
                        setActiveChatDrawer((prev) => (prev === 'calendar' ? 'none' : 'calendar'))
                      }
                    >
                      🕯️ Plan Outing / Date
                    </button>
                    <button
                      type="button"
                      className={`ad-tool-btn ${activeChatDrawer === 'rooftop3d' ? 'active' : ''}`}
                      onClick={() =>
                        setActiveChatDrawer((prev) =>
                          prev === 'rooftop3d' ? 'none' : 'rooftop3d'
                        )
                      }
                    >
                      🌙 3D Rooftop
                    </button>
                    <button
                      type="button"
                      className={`ad-tool-btn ${activeChatDrawer === 'flirt' ? 'active' : ''}`}
                      onClick={() =>
                        setActiveChatDrawer((prev) => (prev === 'flirt' ? 'none' : 'flirt'))
                      }
                    >
                      💬 Fun &amp; Flirt Lines
                    </button>
                    <button
                      type="button"
                      className={`ad-tool-btn ${soundEnabled ? 'active' : ''}`}
                      onClick={() => {
                        const next = !soundEnabled;
                        setSoundEnabled(next);
                        if (next) playIncomingMessageSound(true);
                      }}
                      title="Toggle incoming partner message sound alert"
                    >
                      {soundEnabled ? '🔔 Sound: ON' : '🔇 Sound: OFF'}
                    </button>
                    <button
                      type="button"
                      className="ad-tool-btn danger"
                      onClick={handleRevokeInviteAndQr}
                    >
                      🔒 Revoke &amp; End
                    </button>
                  </div>
                </div>

                {/* COLLAPSIBLE DRAWER 1: SEND & SAVE PHOTOS */}
                {activeChatDrawer === 'photos' && (
                  <div className="ad-collapsible-drawer">
                    <div className="ad-drawer-head">
                      <strong>📸 Send or Save Private Couple Photos</strong>
                      <button
                        type="button"
                        className="ad-btn-close"
                        onClick={() => setActiveChatDrawer('none')}
                      >
                        ✕ Close
                      </button>
                    </div>
                    <div className="ad-photo-upload-bar">
                      <input
                        type="text"
                        placeholder="Add a sweet caption (optional)..."
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                      />
                      <label className="ad-upload-btn">
                        <span>+ Choose Photo to Send</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                        />
                      </label>
                    </div>
                    {photos.length > 0 && (
                      <div className="ad-photo-grid">
                        {photos.map((photo) => (
                          <figure key={photo.id} className="ad-photo-item">
                            <img src={photo.dataUrl} alt={photo.caption || 'Shared photo'} />
                            <figcaption>
                              <span>{photo.caption || 'Photo'}</span>
                              <button
                                type="button"
                                className="ad-save-photo-btn"
                                onClick={() =>
                                  downloadDataUrl(photo.dataUrl, `couple-photo-${photo.id}.jpg`)
                                }
                              >
                                ⬇ Save
                              </button>
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* COLLAPSIBLE DRAWER 2: CANDLELIGHT DINNER / GOOGLE CALENDAR PLANNER */}
                {activeChatDrawer === 'calendar' && (
                  <div className="ad-collapsible-drawer">
                    <div className="ad-drawer-head">
                      <strong>🕯️ Plan an Upcoming Candlelight Dinner / Date (Google Calendar)</strong>
                      <button
                        type="button"
                        className="ad-btn-close"
                        onClick={() => setActiveChatDrawer('none')}
                      >
                        ✕ Close
                      </button>
                    </div>
                    <form className="ad-form" onSubmit={handleScheduleCandlelightDate}>
                      <div className="ad-two-col-inputs">
                        <label>
                          <span>Date / Occasion Name</span>
                          <input
                            type="text"
                            required
                            value={dateForm.title}
                            onChange={(e) =>
                              setDateForm({ ...dateForm, title: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          <span>Date &amp; Time</span>
                          <input
                            type="datetime-local"
                            required
                            value={dateForm.dateTime}
                            onChange={(e) =>
                              setDateForm({ ...dateForm, dateTime: e.target.value })
                            }
                          />
                        </label>
                      </div>
                      <div className="ad-two-col-inputs">
                        <label>
                          <span>Venue / Restaurant</span>
                          <input
                            type="text"
                            required
                            list="hyd-venues"
                            value={dateForm.location}
                            onChange={(e) =>
                              setDateForm({ ...dateForm, location: e.target.value })
                            }
                          />
                          <datalist id="hyd-venues">
                            {hyderabadCandlelightVenues.map((v) => (
                              <option key={v} value={v} />
                            ))}
                          </datalist>
                        </label>
                        <label>
                          <span>Romantic Note / Dress Code</span>
                          <input
                            type="text"
                            value={dateForm.description}
                            onChange={(e) =>
                              setDateForm({ ...dateForm, description: e.target.value })
                            }
                          />
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="submit" className="ad-btn ad-btn-primary" disabled={busy}>
                          📅 Send Date Invite to Chat &amp; Google Calendar →
                        </button>
                        <button
                          type="button"
                          className="ad-btn ad-btn-secondary"
                          onClick={handleDiscoverGroundedSpots}
                          disabled={loadingSpots}
                        >
                          {loadingSpots
                            ? 'Searching Google Maps...'
                            : `📍 Discover Live ${userCity} Cafes & Couple Spots`}
                        </button>
                      </div>
                    </form>
                    {groundedSpots.length > 0 && (
                      <div className="ad-grounded-spots-list" style={{ marginTop: 10 }}>
                        {groundedSpots.map((spot, i) => (
                          <div key={i} className="ad-grounded-spot-item">
                            <div>
                              <strong>{spot.name}</strong>
                              <small>{spot.vibe} — {spot.highlight}</small>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {spot.mapsUrl && (
                                <a
                                  href={spot.mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ad-tool-btn"
                                  style={{ textDecoration: 'none' }}
                                >
                                  📍 Maps ↗
                                </a>
                              )}
                              <button
                                type="button"
                                className="ad-tool-btn"
                                onClick={() => setDateForm((prev) => ({ ...prev, location: spot.name }))}
                              >
                                Select Venue
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* COLLAPSIBLE DRAWER 3: INTERACTIVE 3D ROOFTOP SCENE */}
                {activeChatDrawer === 'rooftop3d' && (
                  <div className="ad-collapsible-drawer">
                    <div className="ad-drawer-head">
                      <strong>🌙 3D Moonlit Candlelight Rooftop Preview</strong>
                      <button
                        type="button"
                        className="ad-btn-close"
                        onClick={() => setActiveChatDrawer('none')}
                      >
                        ✕ Close
                      </button>
                    </div>
                    <ThreeRomanticScene
                      creatorName={activeInvite?.creatorCustomName || user.displayName}
                      partnerName={activeConnection.peerDisplayName}
                      onSelectMoodVenue={(venue) => {
                        setDateForm((prev) => ({ ...prev, location: venue }));
                        setActiveChatDrawer('calendar');
                      }}
                    />
                  </div>
                )}

                {/* COLLAPSIBLE DRAWER 4: QUICK FLIRT & BESTIE BANTER LINES */}
                {activeChatDrawer === 'flirt' && (
                  <div className="ad-collapsible-drawer">
                    <div className="ad-drawer-head">
                      <strong>💬 Tap to Send a Fun Bestie Banter or Flirt Line</strong>
                      <button
                        type="button"
                        className="ad-btn-close"
                        onClick={() => setActiveChatDrawer('none')}
                      >
                        ✕ Close
                      </button>
                    </div>
                    <QuickDropChipBar
                      drops={flirtyHindiDrops}
                      onSendQuickFlirt={handleSendQuickFlirt}
                    />
                  </div>
                )}

                {/* COLLAPSIBLE DRAWER 5: 10-MINUTE LOCATION TREASURE HUNT & DUO TASK GAME */}
                <LocationTreasureHuntDrawer
                  open={activeChatDrawer === 'treasure'}
                  userCity={userCity}
                  elapsedMinutes={elapsedChatMinutes}
                  onClose={() => setActiveChatDrawer('none')}
                  onSendChallengeToChat={(challengeText) => {
                    handleSendQuickFlirt(challengeText);
                    setActiveChatDrawer('none');
                  }}
                />

                {/* 10-Minute Milestone Auto-Suggestion Banner */}
                {(elapsedChatMinutes >= 10 || messages.length >= 12) &&
                  !treasurePromptDismissed &&
                  activeChatDrawer !== 'treasure' && (
                    <div
                      style={{
                        margin: '6px 0 10px',
                        padding: '10px 14px',
                        borderRadius: '14px',
                        background:
                          'linear-gradient(135deg, rgba(251, 191, 36, 0.16), rgba(244, 63, 94, 0.16))',
                        border: '1px solid rgba(251, 191, 36, 0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <span style={{ fontSize: '0.82rem', color: '#fef3c7' }}>
                        🗺️ <strong>10+ Min Vibe Milestone!</strong> Unlock your live{' '}
                        <strong>{userCity} Treasure Hunt &amp; Secret Duo Task</strong> (for couples &amp; best friends).
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="ad-tool-btn"
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 700
                          }}
                          onClick={() => setActiveChatDrawer('treasure')}
                        >
                          🎯 Play {userCity} Treasure Hunt
                        </button>
                        <button
                          type="button"
                          className="ad-btn-close"
                          onClick={() => setTreasurePromptDismissed(true)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                {/* CENTERED PRIVATE MODAL: ONE-SIDED PARTNER CHECKOUT & LOCAL CAFE DISCOVERY */}
                <InlineCommerceDrawer
                  open={activeChatDrawer === 'store'}
                  activeBrandId={activeBrandId}
                  onSelectBrand={setActiveBrandId}
                  onClose={() => setActiveChatDrawer('none')}
                  onBookFreeItem={handleBookAffiliateOrder}
                  onShareDateInChat={handleShareCafeDateInChat}
                  userCity={userCity}
                  onChangeCity={setUserCity}
                />

                {/* MAIN CHAT STREAM WITH RATE-LIMITED, STRICTLY CONTEXTUAL ONE-SIDED BRAND PROMOTIONS */}
                <div className="ad-messages">
                  {messages.length === 0 ? (
                    <p className="ad-empty">
                      Say hi to {activeConnection.peerDisplayName} ♥ Send a message, voice note (🎤), live camera snap (📷), or plan a candlelight dinner!
                    </p>
                  ) : (
                    messages.map((msg, idx) => {
                      const inStreamAd = getPersonalizedInChatBrandAd(
                        messages,
                        idx,
                        'creator',
                        userCity,
                        aiInsight
                      );
                      return (
                        <React.Fragment key={msg.id}>
                          <div
                            className={`ad-bubble ${
                              msg.senderRole === 'creator' ? 'mine' : 'theirs'
                            }`}
                          >
                            <MessageWithBrandCards
                              messageId={msg.id}
                              body={msg.body || msg.text}
                              dateMeta={msg.dateMeta}
                              photoMeta={msg.photoMeta}
                              voiceMeta={msg.voiceMeta}
                              isMine={msg.senderRole === 'creator'}
                              seenAt={msg.seenAt}
                              onOpenBrandDrawer={handleOpenBrandDrawer}
                              onSavePhoto={downloadDataUrl}
                            />
                            <small>
                              {msg.senderRole === 'creator'
                                ? activeInvite?.creatorCustomName || user.displayName
                                : activeConnection.peerDisplayName}{' '}
                              ·{' '}
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                          </div>

                          {/* In-Between Chat Brand Promotion Card (Creator-Personalized, Invisible Click -> Opens In-Website Affiliate Sheet) */}
                          {inStreamAd && (
                            <InChatBrandPromoCard
                              adData={inStreamAd}
                              onOpenBrandDrawer={handleOpenBrandDrawer}
                            />
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {aiInsight?.suggestedFlirtReply && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 10px',
                      fontSize: '0.75rem'
                    }}
                  >
                    <button
                      type="button"
                      className="ad-flirt-chip"
                      onClick={() => handleSendQuickFlirt(aiInsight.suggestedFlirtReply)}
                      title="Tap to send AI-crafted Hinglish flirt reply"
                    >
                      ✨ {aiInsight.suggestedFlirtReply}
                    </button>
                  </div>
                )}

                <form className="ad-chat-input" onSubmit={handleSendMessage}>
                  <ChatMediaInputActions
                    onSendVoiceNote={handleSendVoiceNote}
                    onSendLiveCameraSnap={handleSendLiveCameraSnap}
                    disabled={busy}
                  />
                  <input
                    type="text"
                    placeholder={`Message ${activeConnection.peerDisplayName}...`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <button type="submit" className="ad-btn ad-btn-primary">
                    Send ♥
                  </button>
                </form>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// Automatic Second-App (Guest) Routing:
// Whenever a Guest scans the QR Code or opens the link (`/?invite=<token>` or `/guest` or `/invite/<token>`),
// mount ONLY the standalone login-free <GuestApp /> so it NEVER returns 404 on any host!
const rootElement = document.getElementById('root');
if (isGuestInviteLocation()) {
  createRoot(rootElement).render(<GuestApp />);
} else {
  createRoot(rootElement).render(<App />);
}
