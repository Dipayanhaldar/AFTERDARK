import React, { useEffect, useMemo, useRef, useState } from 'react';
import { preparePhotoFiles } from './photo-helper';
import {
  CITY_PROFILES,
  detectUserLiveCityAndAddress,
  flirtyHindiDrops,
  getPersonalizedInChatBrandAd,
  analyzeChatContextLocally,
  QuickDropChipBar,
  InlineCommerceDrawer,
  LocationTreasureHuntDrawer,
  MessageWithBrandCards,
  InChatBrandPromoCard,
  IncomingMessageToast,
  ChatMediaInputActions,
  FlipkartBrandQuickStrip,
  GoogleSignInButton
} from './commerce-catalog';
import {
  playIncomingMessageSound,
  playOutgoingMessageSound,
  playMessageSeenSound,
  triggerIncomingPartnerAlert,
  requestNativeNotificationPermission
} from './notification-sound';
import {
  purgeStaleServiceWorkers,
  getClientDeviceId,
  isCurrentDeviceTheLinkGenerator,
  resilientApiRequest,
  subscribeToCoupleSync
} from './couple-sync';
import { signInWithGoogleAccount } from './google-auth';
import { getAdaptivePollIntervalMs } from './traffic-control';
import { ThreeRomanticScene } from './ThreeRomanticScene';
import './style.css';

purgeStaleServiceWorkers();

const GUEST_TOKEN_PREFIX = 'afterdark_guest_token_';

const hyderabadCandlelightVenues = [
  'Olive Bistro, Durgam Cheruvu (Lakeview Candlelight)',
  'Taj Falaknuma Palace — Celeste Terrace',
  'Jewel of Nizam — The Minar (Golkonda Resort)',
  'Exotica Rooftop, Banjara Hills Road No. 12',
  'Café Niloufer Lounge, Banjara Hills (Midnight Chai Date)'
];

export function readInviteParamsFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const direct = params.get('invite') || params.get('inviteToken') || params.get('token') || '';
  const otp = (params.get('otp') || '').replace(/\D/g, '').slice(0, 6);
  const k = params.get('k') || '';
  const creator = params.get('creator') || '';
  const hint = params.get('hint') || '';
  const cdev = params.get('cdev') || '';
  const cip = params.get('cip') || '';
  const apiOrigin = params.get('api') || '';

  if (direct) {
    return { token: direct.trim(), otp, k, creator, hint, cdev, cip, apiOrigin };
  }

  const hash = String(window.location.hash || '').replace(/^#\/?/, '');
  if (hash) {
    const hashParams = new URLSearchParams(hash.replace(/^\?/, ''));
    const fromHash =
      hashParams.get('invite') || hashParams.get('inviteToken') || hashParams.get('token') || '';
    if (fromHash) {
      return {
        token: fromHash.trim(),
        otp: (hashParams.get('otp') || otp).replace(/\D/g, '').slice(0, 6),
        k: hashParams.get('k') || k,
        creator: hashParams.get('creator') || creator,
        hint: hashParams.get('hint') || hint,
        cdev: hashParams.get('cdev') || cdev,
        cip: hashParams.get('cip') || cip,
        apiOrigin: hashParams.get('api') || apiOrigin
      };
    }
  }

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'invite' && pathParts[1]) {
    return {
      token: decodeURIComponent(pathParts[1]).trim(),
      otp,
      k,
      creator,
      hint,
      cdev,
      cip,
      apiOrigin
    };
  }

  return { token: '', otp: '', k, creator, hint, cdev, cip, apiOrigin };
}

function stabilizeGuestConnection(prev, next) {
  if (!next) return prev;
  if (
    prev &&
    prev.id === next.id &&
    prev.status === next.status &&
    prev.creatorDisplayName === next.creatorDisplayName &&
    prev.guestDisplayName === next.guestDisplayName
  ) {
    return prev;
  }
  return next;
}

function mergeMessagesStable(prev, incoming) {
  if (!Array.isArray(incoming)) return prev;
  if (incoming.length === 0 && prev.length > 0) {
    return prev;
  }
  const byId = new Map();
  for (const m of prev) {
    if (m && m.id) byId.set(m.id, m);
  }
  for (const m of incoming) {
    if (m && m.id) {
      const existing = byId.get(m.id);
      byId.set(m.id, existing ? { ...existing, ...m } : m);
    }
  }
  const merged = Array.from(byId.values()).sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return ta - tb;
  });
  if (merged.length === prev.length) {
    let identical = true;
    for (let i = 0; i < merged.length; i += 1) {
      const a = prev[i];
      const b = merged[i];
      if (
        a.id !== b.id ||
        (a.body || a.text) !== (b.body || b.text) ||
        (a.seenAt || null) !== (b.seenAt || null)
      ) {
        identical = false;
        break;
      }
    }
    if (identical) return prev;
  }
  return merged;
}

function mergePhotosStable(prev, incoming) {
  if (!Array.isArray(incoming)) return prev;
  if (incoming.length === 0 && prev.length > 0) {
    return prev;
  }
  if (incoming.length === prev.length) {
    let identical = true;
    for (let i = 0; i < incoming.length; i += 1) {
      if (prev[i]?.id !== incoming[i]?.id) {
        identical = false;
        break;
      }
    }
    if (identical) return prev;
  }
  return incoming;
}

export function GuestApp() {
  const urlContext = useMemo(() => readInviteParamsFromLocation(), []);
  const inviteToken = urlContext.token;
  const storageKey = `${GUEST_TOKEN_PREFIX}${inviteToken || 'default'}`;

  const [guestToken, setGuestToken] = useState(
    () => (inviteToken ? localStorage.getItem(storageKey) || '' : '')
  );
  const [invitePreview, setInvitePreview] = useState(() =>
    urlContext.creator || urlContext.hint
      ? {
          status: 'pending',
          creatorDisplayName: urlContext.creator || 'Your Partner',
          recipientHint: urlContext.hint || 'Meri Jaan'
        }
      : null
  );
  const [revokedError, setRevokedError] = useState('');
  const [sameDeviceOrIpBlock, setSameDeviceOrIpBlock] = useState(() => {
    const myDev = getClientDeviceId();
    if (
      isCurrentDeviceTheLinkGenerator(inviteToken) ||
      (urlContext.cdev && urlContext.cdev === myDev)
    ) {
      return '🚫 Same-Device Blocked: You generated this Couple Link on this device! One device cannot chat with itself. Please send the QR code or link to your partner’s separate phone/device.';
    }
    return '';
  });

  const [guestName, setGuestName] = useState(() => urlContext.hint || '');
  const [verificationCode, setVerificationCode] = useState(() => urlContext.otp || '');
  const [consentConfirmed, setConsentConfirmed] = useState(true);

  const [stage, setStage] = useState('otp-gate');
  const [banner, setBanner] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');

  // Hidden tool drawers inside chat so the UI is clean and uncluttered
  const [activeDrawer, setActiveDrawer] = useState('none'); // 'none' | 'photos' | 'calendar' | 'flirt' | 'rooftop3d' | 'store' | 'treasure'
  const [googleBusy, setGoogleBusy] = useState(false);
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
    if (stage !== 'chat' || !connection) return undefined;
    const baseStart =
      (connection.approvedAt && Date.parse(connection.approvedAt)) ||
      (messages[0]?.createdAt && Date.parse(messages[0].createdAt)) ||
      chatStartTimeRef.current;
    const updateElapsed = () => {
      const mins = Math.max(0, Math.floor((Date.now() - baseStart) / 60000));
      setElapsedChatMinutes(mins);
    };
    updateElapsed();
    const timer = setInterval(updateElapsed, 15000);
    return () => clearInterval(timer);
  }, [stage, connection?.id, messages.length]);

  const [dateForm, setDateForm] = useState({
    title: 'Romantic Candlelight Dinner ♥',
    location: hyderabadCandlelightVenues[0],
    dateTime: '',
    description: 'Can’t wait to see you tonight ♥'
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

  function clearFeedback() {
    setBanner('');
    setError('');
  }

  async function api(path, options = {}, activeGuestToken = guestToken) {
    return resilientApiRequest(path, options, activeGuestToken, urlContext);
  }

  async function loadGuestSession(activeGuestToken = guestToken, knownConnection = connection) {
    if (!activeGuestToken && !knownConnection) return false;
    try {
      let activeConnection = knownConnection;
      if (!activeConnection) {
        const me = await api('/guest/me', {}, activeGuestToken);
        activeConnection = me.connection || null;
      }
      if (!activeConnection) return false;

      if (
        inviteToken &&
        activeConnection.inviteToken &&
        activeConnection.inviteToken !== inviteToken
      ) {
        return false;
      }

      setConnection((prev) => stabilizeGuestConnection(prev, activeConnection));
      const [messageData, photoData] = await Promise.all([
        api(`/guest/connections/${activeConnection.id}/messages`, {}, activeGuestToken),
        api(`/guest/connections/${activeConnection.id}/photos`, {}, activeGuestToken)
      ]);
      const nextMsgs = messageData.messages || [];
      setMessages((prev) => mergeMessagesStable(prev, nextMsgs));
      if (!initializedMsgStreamRef.current) {
        initializedMsgStreamRef.current = true;
        if (nextMsgs.length > 0) {
          lastSeenMsgIdRef.current = nextMsgs[nextMsgs.length - 1].id;
          nextMsgs.forEach((m) => {
            if (m.senderRole === 'guest' && m.seenAt) {
              seenByPartnerIdsRef.current.add(m.id);
            }
          });
        }
      }
      setPhotos((prev) => mergePhotosStable(prev, photoData.photos || []));
      setStage('chat');
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    let mounted = true;
    async function init() {
      const myDev = getClientDeviceId();
      if (
        isCurrentDeviceTheLinkGenerator(inviteToken) ||
        (urlContext.cdev && urlContext.cdev === myDev)
      ) {
        if (mounted) {
          setSameDeviceOrIpBlock(
            '🚫 Same-Device Blocked: You generated this Couple Link on this device! One device cannot chat with itself. Please send the QR code or link to your partner’s separate phone/device.'
          );
        }
        return;
      }

      if (!inviteToken) return;
      try {
        const data = await api(
          `/invites/${encodeURIComponent(inviteToken)}?creator=${encodeURIComponent(
            urlContext.creator || ''
          )}&hint=${encodeURIComponent(urlContext.hint || '')}`
        );
        if (data?.invite?.status === 'revoked') {
          if (mounted) {
            setRevokedError(
              'This QR code and invite link was revoked by your partner and is no longer active.'
            );
          }
          return;
        }
        if (data?.invite?.sameDeviceOrIpBlocked || data?.invite?.ownInvite) {
          if (mounted) {
            setSameDeviceOrIpBlock(
              data.invite.blockReason ||
                '🚫 Security Block: Same Device or Same IP Address Detected! The link generator cannot open or chat as the Guest from the same device or IP network.'
            );
          }
          return;
        }
        if (data?.invite && mounted) {
          setInvitePreview((prev) => ({
            ...prev,
            ...data.invite,
            creatorDisplayName:
              data.invite.creatorDisplayName || urlContext.creator || 'Your Partner',
            recipientHint: data.invite.recipientHint || urlContext.hint || 'Meri Jaan'
          }));
          if ((data.invite.recipientHint || urlContext.hint) && !guestName) {
            setGuestName(data.invite.recipientHint || urlContext.hint);
          }
        }
      } catch (err) {
        if (String(err.message || '').toLowerCase().includes('revoked') && mounted) {
          setRevokedError(err.message);
          return;
        }
      }

      if (guestToken) {
        const ok = await loadGuestSession(guestToken);
        if (!ok && mounted) {
          setStage('otp-gate');
        }
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, [inviteToken]);

  useEffect(() => {
    if (stage !== 'chat' || !connection?.id) return undefined;

    let pollInFlight = false;
    const refresh = async () => {
      if (pollInFlight) return;
      pollInFlight = true;
      try {
        const [messageData, photoData] = await Promise.all([
          api(`/guest/connections/${connection.id}/messages`, {}, guestToken),
          api(`/guest/connections/${connection.id}/photos`, {}, guestToken)
        ]);
        const nextMessages = messageData.messages || [];
        setMessages((prev) => mergeMessagesStable(prev, nextMessages));
        if (photoData.photos) {
          setPhotos((prev) => mergePhotosStable(prev, photoData.photos));
        }

        // Detect newly arrived message from Host (creator) and play chime + show visual toast
        if (!initializedMsgStreamRef.current) {
          initializedMsgStreamRef.current = true;
          if (nextMessages.length > 0) {
            const latest = nextMessages[nextMessages.length - 1];
            lastSeenMsgIdRef.current = latest.id;
            nextMessages.forEach((m) => {
              if (m.senderRole === 'guest' && m.seenAt) {
                seenByPartnerIdsRef.current.add(m.id);
              }
            });
          }
        } else if (nextMessages.length > 0) {
          const latest = nextMessages[nextMessages.length - 1];
          if (latest.id && latest.id !== lastSeenMsgIdRef.current) {
            lastSeenMsgIdRef.current = latest.id;
            if (latest.senderRole && latest.senderRole !== 'guest') {
              const partnerName = connection.creatorDisplayName || 'Your Partner';
              const textPreview =
                latest.body || latest.text || 'Sent you a voice note / live snap ♥';
              triggerIncomingPartnerAlert({
                senderName: partnerName,
                messageText: textPreview,
                soundEnabled,
                viewerRole: 'guest'
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
            if (m.senderRole === 'guest' && m.seenAt && !seenByPartnerIdsRef.current.has(m.id)) {
              seenByPartnerIdsRef.current.add(m.id);
              newlySeen = true;
            }
          }
          if (newlySeen) {
            playMessageSeenSound(soundEnabled);
          }
        }

        if (nextMessages.length > 0) {
          if (nextMessages.length !== lastAnalyzedCountRef.current) {
            lastAnalyzedCountRef.current = nextMessages.length;
            setAiInsight(analyzeChatContextLocally(nextMessages.slice(-6), '', 'guest'));
          }
        }
      } catch (err) {
        if (String(err.message || '').toLowerCase().includes('revoked')) {
          setRevokedError('Your partner revoked access and closed this private room.');
          setConnection(null);
          setStage('otp-gate');
        }
      } finally {
        pollInFlight = false;
      }
    };

    const pollMs = getAdaptivePollIntervalMs(2200, stage === 'chat' && Boolean(connection?.id));
    const interval = setInterval(refresh, pollMs);
    const unsubscribe = subscribeToCoupleSync(refresh);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [stage, guestToken, connection?.id]);

  async function handleGoogleQuickFill() {
    clearFeedback();
    setGoogleBusy(true);
    try {
      const result = await signInWithGoogleAccount(resilientApiRequest);
      if (result.cancelled) return;
      if (result.ok && result.user) {
        setGuestName(result.user.displayName || guestName);
        setBanner(
          `✅ Google Account verified as ${result.user.displayName} (${result.user.email})! Enter your partner’s 6-digit OTP below to pair ♥`
        );
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err?.message || 'Google verification failed.');
    } finally {
      setGoogleBusy(false);
    }
  }

  async function acceptInvite(event) {
    event.preventDefault();
    clearFeedback();
    requestNativeNotificationPermission();

    if (!consentConfirmed) {
      setError('Please confirm your mutual consent to enter the private chat.');
      return;
    }

    const normalizedCode = verificationCode.replace(/\D/g, '').slice(0, 6);
    if (normalizedCode.length !== 6) {
      setError('Please enter the 6-digit OTP shared by your partner.');
      return;
    }

    setBusy(true);
    try {
      const targetToken = inviteToken || 'otp-direct';
      const data = await api(`/guest/invites/${encodeURIComponent(targetToken)}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          inviteToken: targetToken,
          guestDisplayName:
            guestName.trim() || invitePreview?.recipientHint || urlContext.hint || 'Meri Jaan',
          creatorDisplayName:
            invitePreview?.creatorDisplayName || urlContext.creator || 'Your Partner',
          verificationCode: normalizedCode,
          code: normalizedCode,
          expectedSignature: urlContext.k || '',
          creatorDeviceId: urlContext.cdev || '',
          creatorIp: urlContext.cip || '',
          deviceId: getClientDeviceId(),
          ageConfirmed: true,
          adult: true
        })
      });

      const issuedToken = data.guestSessionToken || data.sessionToken;
      const effectiveStorageKey = `${GUEST_TOKEN_PREFIX}${
        data.connection?.inviteToken || inviteToken || 'default'
      }`;
      if (issuedToken) {
        localStorage.setItem(effectiveStorageKey, issuedToken);
        localStorage.setItem(storageKey, issuedToken);
        setGuestToken(issuedToken);
      }
      setConnection(data.connection);
      setStage('chat');
      setBanner(
        `🔒 Connected privately with ${
          data.connection?.creatorDisplayName || 'your partner / bestie'
        } ♥`
      );
      await loadGuestSession(issuedToken, data.connection);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please check the 6-digit OTP with your partner.');
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!messageBody.trim() || !connection) return;
    clearFeedback();
    try {
      const textToSend = messageBody;
      setMessageBody('');
      playOutgoingMessageSound(soundEnabled, 'guest');
      await api(
        `/guest/connections/${connection.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ body: textToSend, text: textToSend })
        },
        guestToken
      );
      await loadGuestSession(guestToken, connection);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSendQuickFlirt(text) {
    if (!connection) return;
    clearFeedback();
    try {
      playOutgoingMessageSound(soundEnabled, 'guest');
      await api(
        `/guest/connections/${connection.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ body: text, text })
        },
        guestToken
      );
      setActiveDrawer('none');
      await loadGuestSession(guestToken, connection);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSendVoiceNote(voiceMeta) {
    if (!connection || !voiceMeta?.dataUrl) return;
    clearFeedback();
    try {
      playOutgoingMessageSound(soundEnabled, 'guest');
      await api(
        `/guest/connections/${connection.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            body: `🎤 Sent a private voice note (${voiceMeta.durationSec || 1}s) ♥`,
            voiceMeta
          })
        },
        guestToken
      );
      await loadGuestSession(guestToken, connection);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSendLiveCameraSnap(photoMeta) {
    if (!connection || !photoMeta?.dataUrl) return;
    clearFeedback();
    try {
      playOutgoingMessageSound(soundEnabled, 'guest');
      await api(
        `/guest/connections/${connection.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            body: `📷 ${photoMeta.caption || 'Live Camera Snap ♥'}`,
            photoMeta
          })
        },
        guestToken
      );
      await loadGuestSession(guestToken, connection);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDiscoverGroundedSpots() {
    setLoadingSpots(true);
    try {
      const res = await api('/ai/discover-date-spots', {
        method: 'POST',
        body: JSON.stringify({ city: userCity || 'Hyderabad', mood: dateForm.title })
      });
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
    clearFeedback();
    if (!connection) {
      setBanner(
        `🔒 Private order details ready for "${itemTitle}"! Redirecting to official store checkout...`
      );
      return;
    }
    try {
      const res = await api(
        `/guest/connections/${connection.id}/orders`,
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
        guestToken
      );
      setBanner(
        `🔒 Private order details saved for "${res.order.itemName}" on ${res.order.brandName} (Hidden from partner chat). Click "Proceed to Official ${res.order.brandName}" to pay!`
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleShareCafeDateInChat(customDateMeta) {
    if (!connection || !customDateMeta) return;
    clearFeedback();
    try {
      await api(
        `/guest/connections/${connection.id}/dates`,
        {
          method: 'POST',
          body: JSON.stringify(customDateMeta)
        },
        guestToken
      );
      setBanner('🕯️ Cafe / Dinner Date shared in chat with direct Google Calendar button!');
      await loadGuestSession(guestToken, connection);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleScheduleCandlelightDate(event) {
    event.preventDefault();
    if (!connection) return;
    clearFeedback();
    setBusy(true);
    try {
      await api(
        `/guest/connections/${connection.id}/dates`,
        {
          method: 'POST',
          body: JSON.stringify(dateForm)
        },
        guestToken
      );
      setActiveDrawer('none');
      setBanner('🕯️ Candlelight Dinner Date shared in chat! Tap "Add to Google Calendar" on the card.');
      await loadGuestSession(guestToken, connection);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadPhoto(event) {
    const files = event.target.files;
    if (!files?.length || !connection) return;
    clearFeedback();
    setBusy(true);
    try {
      const prepared = await preparePhotoFiles(files);
      for (const file of prepared) {
        await api(
          `/guest/connections/${connection.id}/photos`,
          {
            method: 'POST',
            body: JSON.stringify({
              dataUrl: file.dataUrl,
              caption: photoCaption || file.name
            })
          },
          guestToken
        );
      }
      setPhotoCaption('');
      setActiveDrawer('none');
      await loadGuestSession(guestToken, connection);
      setBanner('📸 Photo shared in chat!');
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleOpenBrandDrawer(brandId) {
    setActiveBrandId(brandId || 'flipkart_minutes');
    setActiveDrawer('store');
  }

  function downloadDataUrl(dataUrl, filename) {
    if (!dataUrl) return;
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  return (
    <div className="guest-shell">
      <header className="guest-topbar">
        <div className="guest-brand">
          <span className="guest-moon-icon ad-animated-logo" aria-hidden="true">
            <span className="ad-logo-moon-glyph">☾</span>
            <span className="ad-logo-star-dot" />
          </span>
          <div className="guest-brand-text">
            <span className="guest-brand-name">
              AFTERDARK · Private 1-on-1 Room
            </span>
            <span className="guest-brand-sub">
              Private Couple &amp; Bestie Space · Instant Passcode Pairing ♥
            </span>
          </div>
        </div>
        <div className="guest-topbar-actions">
          <button
            type="button"
            className={`guest-tool-btn ${activeDrawer === 'store' ? 'active' : ''}`}
            onClick={() => {
              setActiveBrandId('flipkart_minutes');
              setActiveDrawer((prev) => (prev === 'store' ? 'none' : 'store'));
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(40, 116, 240, 0.28), rgba(255, 214, 0, 0.22))',
              borderColor: 'rgba(255, 214, 0, 0.55)',
              color: '#fef08a'
            }}
          >
            ⚡ Flipkart Minutes &amp; Brands ({userCity})
          </button>
          <a
            href="https://www.flipkart.com/search?q=couple+gift+hamper+chocolates"
            target="_blank"
            rel="noopener noreferrer"
            className="guest-tool-btn"
            style={{
              textDecoration: 'none',
              background: 'rgba(40, 116, 240, 0.22)',
              borderColor: 'rgba(96, 165, 250, 0.5)',
              color: '#bfdbfe'
            }}
          >
            🛒 Flipkart Official ↗
          </a>
        </div>
      </header>

      <IncomingMessageToast
        notification={incomingToast}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onTestSound={() => playIncomingMessageSound(true, 'guest')}
        onDismiss={() => setIncomingToast(null)}
      />

      {(banner || error) && (
        <div className="guest-banner-wrap">
          {banner && (
            <div className="guest-banner ok" onClick={() => setBanner('')}>
              <span>{banner}</span>
              <small>✕</small>
            </div>
          )}
          {error && (
            <div className="guest-banner err" onClick={() => setError('')}>
              <span>{error}</span>
              <small>✕</small>
            </div>
          )}
        </div>
      )}

      {/* Global Built-in Brand Store & Flipkart Redirect when on OTP Gate */}
      {(stage !== 'chat' || !connection) && activeDrawer === 'store' && (
        <div style={{ marginTop: '12px' }}>
          <InlineCommerceDrawer
            open={activeDrawer === 'store'}
            activeBrandId={activeBrandId}
            onSelectBrand={setActiveBrandId}
            onClose={() => setActiveDrawer('none')}
            onBookFreeItem={handleBookAffiliateOrder}
            onShareDateInChat={handleShareCafeDateInChat}
            userCity={userCity}
            onChangeCity={setUserCity}
          />
        </div>
      )}

      <main className="guest-main">
        {/* CASE 0: Same-Device or Same-IP Security Block (Generator cannot open or chat with their own Guest link!) */}
        {sameDeviceOrIpBlock ? (
          <section className="guest-otp-card">
            <div className="guest-pill-row">
              <span className="guest-pill">🚫 SAME DEVICE / SAME IP BLOCKED</span>
              <span className="guest-pill">🔐 TWO SEPARATE DEVICES REQUIRED</span>
            </div>
            <h1 className="guest-hero-title">One Device Cannot Chat With Itself</h1>
            <p className="guest-hero-lead">{sameDeviceOrIpBlock}</p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="guest-btn guest-btn-primary"
                onClick={() => {
                  window.location.href = 'https://afterdark-social-universe.vercel.app';
                }}
              >
                ← Return to My Host Dashboard
              </button>
            </div>
          </section>
        ) : revokedError ? (
          /* CASE 1: Invite was explicitly Revoked by Host */
          <section className="guest-otp-card">
            <div className="guest-pill-row">
              <span className="guest-pill">🔒 INVITE REVOKED</span>
            </div>
            <h1 className="guest-hero-title">QR Code &amp; Link Revoked</h1>
            <p className="guest-hero-lead">{revokedError}</p>
          </section>
        ) : stage !== 'chat' || !connection ? (
          /* CASE 2: Consent + 6-Digit OTP Gate (Validates against Host's Generated Session) */
          <section className="guest-otp-card">
            <div className="guest-pill-row">
              <span className="guest-pill">
                💌 PRIVATE INVITE FROM {(invitePreview?.creatorDisplayName || 'YOUR PARTNER').toUpperCase()}
              </span>
              <span className="guest-pill">🔐 NO LOGIN REQUIRED</span>
              <span className="guest-pill">⚡ FLIPKART &amp; BRAND STORE BUILT-IN</span>
              {inviteToken && (
                <span className="guest-pill">
                  ● HOST SESSION READY
                </span>
              )}
            </div>

            <h1 className="guest-hero-title">
              Hey {invitePreview?.recipientHint || 'Friend'}!{' '}
              {invitePreview?.creatorDisplayName || 'Your Partner'} invited you to a private 1-on-1 room ♥
            </h1>

            <p className="guest-hero-lead">
              No account or login needed — built for both <strong>couples &amp; best friends (boy–girl duos)</strong>. Confirm your consent and enter the{' '}
              <strong>6-digit passcode</strong> shared by{' '}
              {invitePreview?.creatorDisplayName || 'your friend'} to open your private chat, or optionally autofill your profile with Google.
            </p>

            <div style={{ maxWidth: '420px', marginBottom: '12px' }}>
              <GoogleSignInButton
                onClick={handleGoogleQuickFill}
                busy={googleBusy || busy}
                label="Quick-Fill Identity with Google (Optional)"
              />
            </div>

            <form className="guest-otp-form" onSubmit={acceptInvite}>
              <div className="guest-form-grid">
                <label className="guest-field">
                  <span>Your Nickname</span>
                  <input
                    type="text"
                    required
                    placeholder={invitePreview?.recipientHint || 'e.g. Zoya'}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </label>

                <label className="guest-field">
                  <span>
                    6-Digit Couple OTP ({verificationCode.length}/6 digits)
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    className="guest-otp-input"
                    placeholder="• • • • • •"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                  />
                </label>
              </div>

              <label className="guest-checkbox">
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                />
                <span>
                  I am 18+ and enter this private 1-on-1 chat with my full consent ♥
                </span>
              </label>

              <button
                type="submit"
                className="guest-btn guest-btn-primary guest-submit-btn"
                disabled={busy}
              >
                {busy
                  ? 'Validating OTP & Pairing Channel...'
                  : '✨ Verify 6-Digit OTP & Pair Secure Chat →'}
              </button>
            </form>
          </section>
        ) : (
          /* CASE 3: Verified -> Clean, Focused Private Chat (No Channel ID or OTP exposed on User End) */
          <section className="guest-card guest-focused-chat">
            <div className="guest-chat-head">
              <div>
                <span className="guest-tag">
                  ● PRIVATE 1-ON-1 ROOM · LIVE CONNECTION
                </span>
                <h2>
                  {connection.guestDisplayName || 'You'} &amp; {connection.creatorDisplayName} ♥
                </h2>
              </div>

              <div className="guest-chat-toolbar">
                <button
                  type="button"
                  className={`guest-tool-btn ${activeDrawer === 'treasure' ? 'active' : ''}`}
                  onClick={() =>
                    setActiveDrawer((prev) => (prev === 'treasure' ? 'none' : 'treasure'))
                  }
                  style={{
                    borderColor:
                      elapsedChatMinutes >= 10
                        ? 'rgba(251, 191, 36, 0.75)'
                        : 'rgba(167, 139, 250, 0.45)',
                    background:
                      elapsedChatMinutes >= 10 ? 'rgba(251, 191, 36, 0.16)' : undefined
                  }}
                >
                  🗺️ {elapsedChatMinutes >= 10 ? 'Treasure Hunt Unlocked!' : 'Treasure Hunt & Tasks'}
                </button>
                <button
                  type="button"
                  className={`guest-tool-btn ${activeDrawer === 'store' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveBrandId('flipkart_minutes');
                    setActiveDrawer((prev) => (prev === 'store' ? 'none' : 'store'));
                  }}
                >
                  ⚡ Flipkart &amp; Brand Store ({userCity === 'Patna' ? 'Patna/Bihar' : userCity})
                </button>
                <a
                  href="https://www.flipkart.com/search?q=couple+gift+hamper+chocolates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="guest-tool-btn"
                  style={{
                    textDecoration: 'none',
                    borderColor: 'rgba(255, 214, 0, 0.55)',
                    color: '#fef08a'
                  }}
                >
                  🛒 Flipkart Redirect ↗
                </a>
                <button
                  type="button"
                  className={`guest-tool-btn ${activeDrawer === 'photos' ? 'active' : ''}`}
                  onClick={() =>
                    setActiveDrawer((prev) => (prev === 'photos' ? 'none' : 'photos'))
                  }
                >
                  📸 Photos ({photos.length})
                </button>
                <button
                  type="button"
                  className={`guest-tool-btn ${activeDrawer === 'calendar' ? 'active' : ''}`}
                  onClick={() =>
                    setActiveDrawer((prev) => (prev === 'calendar' ? 'none' : 'calendar'))
                  }
                >
                  🕯️ Plan Outing / Date
                </button>
                <button
                  type="button"
                  className={`guest-tool-btn ${activeDrawer === 'rooftop3d' ? 'active' : ''}`}
                  onClick={() =>
                    setActiveDrawer((prev) => (prev === 'rooftop3d' ? 'none' : 'rooftop3d'))
                  }
                >
                  🌙 3D Rooftop
                </button>
                <button
                  type="button"
                  className={`guest-tool-btn ${activeDrawer === 'flirt' ? 'active' : ''}`}
                  onClick={() =>
                    setActiveDrawer((prev) => (prev === 'flirt' ? 'none' : 'flirt'))
                  }
                >
                  💬 Fun &amp; Flirt Lines
                </button>
                <button
                  type="button"
                  className={`guest-tool-btn ${soundEnabled ? 'active' : ''}`}
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    if (next) playIncomingMessageSound(true, 'guest');
                  }}
                  title="Toggle incoming message chime sound"
                >
                  {soundEnabled ? '🔔 Sound: ON' : '🔇 Sound: OFF'}
                </button>
              </div>
            </div>

            {/* SAME-THEME FLIPKART OFFICIAL REDIRECT & BUILT-IN BRAND QUICK BAR */}
            <FlipkartBrandQuickStrip
              userCity={userCity}
              onOpenBrandDrawer={handleOpenBrandDrawer}
            />

            {/* COLLAPSIBLE DRAWER 1: SEND & SAVE PHOTOS */}
            {activeDrawer === 'photos' && (
              <div className="guest-collapsible-drawer">
                <div className="guest-drawer-head">
                  <strong>📸 Send or Save Private Couple Photos</strong>
                  <button
                    type="button"
                    className="ad-btn-close"
                    onClick={() => setActiveDrawer('none')}
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="guest-photo-controls">
                  <input
                    type="text"
                    placeholder="Caption (optional)..."
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                  />
                  <label className="guest-upload-label">
                    <span>+ Choose Photo to Send</span>
                    <input type="file" accept="image/*" multiple onChange={uploadPhoto} />
                  </label>
                </div>
                {photos.length > 0 && (
                  <div className="guest-photos-grid">
                    {photos.map((photo) => (
                      <figure key={photo.id} className="guest-photo-item">
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

            {/* COLLAPSIBLE DRAWER 2: CANDLELIGHT DINNER / GOOGLE CALENDAR */}
            {activeDrawer === 'calendar' && (
              <div className="guest-collapsible-drawer">
                <div className="guest-drawer-head">
                  <strong>🕯️ Plan an Upcoming Candlelight Dinner (Google Calendar)</strong>
                  <button
                    type="button"
                    className="ad-btn-close"
                    onClick={() => setActiveDrawer('none')}
                  >
                    ✕ Close
                  </button>
                </div>
                <form className="guest-otp-form" onSubmit={handleScheduleCandlelightDate}>
                  <div className="guest-form-grid">
                    <label className="guest-field">
                      <span>Date Title</span>
                      <input
                        type="text"
                        required
                        value={dateForm.title}
                        onChange={(e) =>
                          setDateForm({ ...dateForm, title: e.target.value })
                        }
                      />
                    </label>
                    <label className="guest-field">
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
                  <div className="guest-form-grid">
                    <label className="guest-field">
                      <span>Venue / Location</span>
                      <input
                        type="text"
                        required
                        list="guest-venues"
                        value={dateForm.location}
                        onChange={(e) =>
                          setDateForm({ ...dateForm, location: e.target.value })
                        }
                      />
                      <datalist id="guest-venues">
                        {hyderabadCandlelightVenues.map((v) => (
                          <option key={v} value={v} />
                        ))}
                      </datalist>
                    </label>
                    <label className="guest-field">
                      <span>Romantic Description</span>
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
                    <button type="submit" className="guest-btn guest-btn-primary" disabled={busy}>
                      📅 Share Date Invite &amp; Google Calendar Link →
                    </button>
                    <button
                      type="button"
                      className="guest-tool-btn"
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
                              className="guest-tool-btn"
                              style={{ textDecoration: 'none' }}
                            >
                              📍 Maps ↗
                            </a>
                          )}
                          <button
                            type="button"
                            className="guest-tool-btn"
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

            {/* COLLAPSIBLE DRAWER 3: INTERACTIVE 3D ROOFTOP */}
            {activeDrawer === 'rooftop3d' && (
              <div className="guest-collapsible-drawer">
                <div className="guest-drawer-head">
                  <strong>🌙 3D Moonlit Candlelight Rooftop Preview</strong>
                  <button
                    type="button"
                    className="ad-btn-close"
                    onClick={() => setActiveDrawer('none')}
                  >
                    ✕ Close
                  </button>
                </div>
                <ThreeRomanticScene
                  creatorName={connection.creatorDisplayName}
                  partnerName={connection.guestDisplayName || 'You'}
                  onSelectMoodVenue={(venue) => {
                    setDateForm((prev) => ({ ...prev, location: venue }));
                    setActiveDrawer('calendar');
                  }}
                />
              </div>
            )}

            {/* COLLAPSIBLE DRAWER 4: FUN BESTIE & FLIRT LINES */}
            {activeDrawer === 'flirt' && (
              <div className="guest-collapsible-drawer">
                <div className="guest-drawer-head">
                  <strong>💬 Tap to Send a Fun Bestie Banter or Flirty Line</strong>
                  <button
                    type="button"
                    className="ad-btn-close"
                    onClick={() => setActiveDrawer('none')}
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
              open={activeDrawer === 'treasure'}
              userCity={userCity}
              elapsedMinutes={elapsedChatMinutes}
              onClose={() => setActiveDrawer('none')}
              onSendChallengeToChat={(challengeText) => {
                handleSendQuickFlirt(challengeText);
                setActiveDrawer('none');
              }}
            />

            {/* 10-Minute Milestone Auto-Suggestion Banner */}
            {(elapsedChatMinutes >= 10 || messages.length >= 12) &&
              !treasurePromptDismissed &&
              activeDrawer !== 'treasure' && (
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
                      className="guest-tool-btn"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 700
                      }}
                      onClick={() => setActiveDrawer('treasure')}
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
              open={activeDrawer === 'store'}
              activeBrandId={activeBrandId}
              onSelectBrand={setActiveBrandId}
              onClose={() => setActiveDrawer('none')}
              onBookFreeItem={handleBookAffiliateOrder}
              onShareDateInChat={handleShareCafeDateInChat}
              userCity={userCity}
              onChangeCity={setUserCity}
            />

            {/* PRIVATE CHAT MESSAGES + RATE-LIMITED, STRICTLY CONTEXTUAL ONE-SIDED BRAND PROMOTIONS */}
            <div className="guest-messages">
              {messages.length === 0 ? (
                <p className="guest-empty">
                  You are connected with {connection.creatorDisplayName} ♥ Send a message, voice note (🎤), live camera snap (📷), or plan a candlelight date!
                </p>
              ) : (
                messages.map((msg, idx) => {
                  const inStreamAd = getPersonalizedInChatBrandAd(
                    messages,
                    idx,
                    'guest',
                    userCity,
                    aiInsight
                  );
                  return (
                    <React.Fragment key={msg.id}>
                      <div
                        className={`guest-bubble ${
                          msg.senderRole === 'guest' ? 'mine' : 'theirs'
                        }`}
                      >
                        <MessageWithBrandCards
                          messageId={msg.id}
                          body={msg.body || msg.text}
                          dateMeta={msg.dateMeta}
                          photoMeta={msg.photoMeta}
                          voiceMeta={msg.voiceMeta}
                          isMine={msg.senderRole === 'guest'}
                          seenAt={msg.seenAt}
                          onOpenBrandDrawer={handleOpenBrandDrawer}
                          onSavePhoto={downloadDataUrl}
                        />
                        <small>
                          {msg.senderRole === 'guest'
                            ? connection.guestDisplayName || 'You'
                            : connection.creatorDisplayName}{' '}
                          ·{' '}
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>

                      {/* Guest-Personalized In-Between Chat Brand Promotion Card (Different from Creator's view!) */}
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

            <form className="guest-chat-form" onSubmit={sendMessage}>
              <ChatMediaInputActions
                onSendVoiceNote={handleSendVoiceNote}
                onSendLiveCameraSnap={handleSendLiveCameraSnap}
                disabled={busy}
              />
              <input
                type="text"
                placeholder={`Message ${connection.creatorDisplayName}...`}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
              />
              <button type="submit" className="guest-btn guest-btn-primary">
                Send ♥
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
