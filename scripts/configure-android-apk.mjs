#!/usr/bin/env node
/**
 * Configures the Capacitor Android project and web PWA icons for:
 * - Samsung Galaxy Store (Signed Release APK & AAB, One UI / Foldable / Tablet compatibility)
 * - PhonePe Developer / Indus Appstore (Signed Release APK & AAB, Indian commerce deep-links)
 * - Amazon Appstore & GitHub Releases
 *
 * 1. Generates high-resolution PNG icons (`public/icon-192.png`, `public/icon-512.png`, and
 *    all Android `mipmap-*` densities: `ic_launcher.png`, `ic_launcher_round.png`, `ic_launcher_foreground.png`).
 * 2. Configures dark theme (`#0c0612`), notch/cutout safe-area protection (`android:fitsSystemWindows="true"`),
 *    and dark status/navigation bars in `styles.xml` and `ic_launcher_background.xml`.
 * 3. Optimizes `AndroidManifest.xml` with optional `<uses-feature android:required="false" />` tags
 *    so Galaxy Store and Indus Appstore never block tablets/foldables, and configures
 *    V1 + V2 Release Signing in `android/app/build.gradle`.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');
const ANDROID_MAIN = path.resolve(ROOT_DIR, 'android/app/src/main');
const RES_DIR = path.join(ANDROID_MAIN, 'res');

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodeRgbaToPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const rawScanlines = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    rawScanlines[rowStart] = 0; // filter type 0 (None)
    rgbaBuffer.copy(rawScanlines, rowStart + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  return Buffer.concat([
    signature,
    makePngChunk('IHDR', ihdr),
    makePngChunk('IDAT', compressed),
    makePngChunk('IEND', Buffer.alloc(0))
  ]);
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function signedDistanceRoundedRect(px, py, cx, cy, halfSize, cornerRadius) {
  const qx = Math.abs(px - cx) - (halfSize - cornerRadius);
  const qy = Math.abs(py - cy) - (halfSize - cornerRadius);
  const outDist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inDist = Math.min(Math.max(qx, qy), 0);
  return outDist + inDist - cornerRadius;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Renders the AFTERDARK brand icon (matching the website header logo beside AFTERDARK)
 * - `mode`: 'square' | 'round' | 'foreground' | 'store'
 */
function renderAfterDarkIconPng(size, mode = 'square') {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const aa = Math.max(1.0, size / 192);

  // Inner brand squircle geometry
  const squircleHalf = mode === 'foreground' ? size * 0.29 : size * 0.36;
  const squircleRadius = squircleHalf * 0.48;

  // Crescent moon geometry (outer circle minus inner offset circle)
  const moonOuterR = squircleHalf * 0.56;
  const moonOuterCx = cx - squircleHalf * 0.04;
  const moonOuterCy = cy + squircleHalf * 0.02;

  const moonCutR = squircleHalf * 0.48;
  const moonCutCx = cx + squircleHalf * 0.22;
  const moonCutCy = cy - squircleHalf * 0.12;

  // Starlight dot geometry
  const starCx = cx + squircleHalf * 0.36;
  const starCy = cy - squircleHalf * 0.34;
  const starR = Math.max(1.5, squircleHalf * 0.09);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const nx = x / size;
      const ny = y / size;

      // 1. Outer shape mask
      let outerAlpha = 1;
      if (mode === 'foreground') {
        outerAlpha = 0;
      } else if (mode === 'store') {
        outerAlpha = 1;
      } else if (mode === 'round') {
        const distFromCenter = Math.hypot(x - cx, y - cy) - size * 0.47;
        outerAlpha = 1 - smoothstep(-aa, aa, distFromCenter);
      } else {
        const outerDist = signedDistanceRoundedRect(x, y, cx, cy, size * 0.47, size * 0.22);
        outerAlpha = 1 - smoothstep(-aa, aa, outerDist);
      }

      // Base dark luxury background (#0c0612 -> #1b0c2b radial glow)
      const radialT = Math.min(1, Math.hypot(nx - 0.28, ny - 0.22) * 1.25);
      let r = lerp(38, 12, radialT);
      let g = lerp(16, 6, radialT);
      let b = lerp(59, 18, radialT);
      let a = outerAlpha * 255;

      // 2. Inner pink-to-gold brand squircle (#ff4f9a -> #ff7c83 -> #ffb36b)
      const sqDist = signedDistanceRoundedRect(x, y, cx, cy, squircleHalf, squircleRadius);
      const sqAlpha = 1 - smoothstep(-aa, aa, sqDist);

      if (sqAlpha > 0) {
        const gradT = Math.max(
          0,
          Math.min(1, (x - (cx - squircleHalf) + (y - (cy - squircleHalf))) / (squircleHalf * 4))
        );
        let sr;
        let sg;
        let sb;
        if (gradT < 0.5) {
          const t2 = gradT * 2;
          sr = lerp(255, 255, t2);
          sg = lerp(79, 124, t2);
          sb = lerp(154, 131, t2);
        } else {
          const t2 = (gradT - 0.5) * 2;
          sr = lerp(255, 255, t2);
          sg = lerp(124, 179, t2);
          sb = lerp(131, 107, t2);
        }

        // 3. Crescent Moon glyph (#16081f) inside the squircle
        const dOuter = Math.hypot(x - moonOuterCx, y - moonOuterCy) - moonOuterR;
        const dCut = Math.hypot(x - moonCutCx, y - moonCutCy) - moonCutR;
        const inOuter = 1 - smoothstep(-aa, aa, dOuter);
        const outOfCut = smoothstep(-aa, aa, dCut);
        const moonMask = inOuter * outOfCut;

        // 4. Starlight dot (#16081f)
        const dStar = Math.hypot(x - starCx, y - starCy) - starR;
        const starMask = 1 - smoothstep(-aa, aa, dStar);

        const glyphMask = Math.min(1, moonMask + starMask);

        const fgR = lerp(sr, 22, glyphMask);
        const fgG = lerp(sg, 8, glyphMask);
        const fgB = lerp(sb, 31, glyphMask);

        if (mode === 'foreground') {
          r = fgR;
          g = fgG;
          b = fgB;
          a = sqAlpha * 255;
        } else {
          r = lerp(r, fgR, sqAlpha);
          g = lerp(g, fgG, sqAlpha);
          b = lerp(b, fgB, sqAlpha);
        }
      }

      buf[idx] = Math.round(r);
      buf[idx + 1] = Math.round(g);
      buf[idx + 2] = Math.round(b);
      buf[idx + 3] = Math.round(a);
    }
  }

  return encodeRgbaToPng(size, size, buf);
}

function renderStoreBannerPng(width, height, variant = 0) {
  const buf = Buffer.alloc(width * height * 4);
  const cx = width * (variant === 0 ? 0.5 : 0.5);
  const cy = height * (variant === 0 ? 0.5 : 0.36);
  const minDim = Math.min(width, height);
  const aa = 1.5;

  const squircleHalf = minDim * (variant === 0 ? 0.28 : 0.2);
  const squircleRadius = squircleHalf * 0.48;
  const moonOuterR = squircleHalf * 0.56;
  const moonOuterCx = cx - squircleHalf * 0.04;
  const moonOuterCy = cy + squircleHalf * 0.02;
  const moonCutR = squircleHalf * 0.48;
  const moonCutCx = cx + squircleHalf * 0.22;
  const moonCutCy = cy - squircleHalf * 0.12;
  const starCx = cx + squircleHalf * 0.36;
  const starCy = cy - squircleHalf * 0.34;
  const starR = Math.max(2, squircleHalf * 0.09);

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const idx = (y * width + x) * 4;

      const radialT = Math.min(1, Math.hypot(nx - 0.5, ny - 0.42) * 1.35);
      let r = lerp(42 + variant * 6, 12, radialT);
      let g = lerp(16 + variant * 3, 6, radialT);
      let b = lerp(64 + variant * 8, 18, radialT);

      // Decorative card frame for portrait screenshots (variant > 0)
      if (variant > 0) {
        const cardDist = signedDistanceRoundedRect(
          x,
          y,
          width * 0.5,
          height * 0.68,
          width * 0.38,
          width * 0.05
        );
        if (cardDist < 0 && Math.abs(y - height * 0.68) < height * 0.18) {
          const cardAlpha = 1 - smoothstep(-2, 0, cardDist);
          r = lerp(r, 34, cardAlpha * 0.85);
          g = lerp(g, 15, cardAlpha * 0.85);
          b = lerp(b, 52, cardAlpha * 0.85);
        }
      }

      const sqDist = signedDistanceRoundedRect(x, y, cx, cy, squircleHalf, squircleRadius);
      const sqAlpha = 1 - smoothstep(-aa, aa, sqDist);
      if (sqAlpha > 0) {
        const gradT = Math.max(
          0,
          Math.min(1, (x - (cx - squircleHalf) + (y - (cy - squircleHalf))) / (squircleHalf * 4))
        );
        const sr = 255;
        const sg = gradT < 0.5 ? lerp(79, 124, gradT * 2) : lerp(124, 179, (gradT - 0.5) * 2);
        const sb = gradT < 0.5 ? lerp(154, 131, gradT * 2) : lerp(131, 107, (gradT - 0.5) * 2);

        const dOuter = Math.hypot(x - moonOuterCx, y - moonOuterCy) - moonOuterR;
        const dCut = Math.hypot(x - moonCutCx, y - moonCutCy) - moonCutR;
        const moonMask = (1 - smoothstep(-aa, aa, dOuter)) * smoothstep(-aa, aa, dCut);
        const dStar = Math.hypot(x - starCx, y - starCy) - starR;
        const starMask = 1 - smoothstep(-aa, aa, dStar);
        const glyphMask = Math.min(1, moonMask + starMask);

        const fgR = lerp(sr, 22, glyphMask);
        const fgG = lerp(sg, 8, glyphMask);
        const fgB = lerp(sb, 31, glyphMask);

        r = lerp(r, fgR, sqAlpha);
        g = lerp(g, fgG, sqAlpha);
        b = lerp(b, fgB, sqAlpha);
      }

      buf[idx] = Math.round(r);
      buf[idx + 1] = Math.round(g);
      buf[idx + 2] = Math.round(b);
      buf[idx + 3] = 255;
    }
  }
  return encodeRgbaToPng(width, height, buf);
}

function generateWebAndStorePngIcons() {
  try {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    const icon192 = renderAfterDarkIconPng(192, 'store');
    const icon512 = renderAfterDarkIconPng(512, 'store');
    const featureGraphic = renderStoreBannerPng(1024, 500, 0);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-192.png'), icon192);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-512.png'), icon512);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'feature-graphic-1024x500.png'), featureGraphic);
    console.log(
      '[configure-android-apk] Generated public/icon-192.png, public/icon-512.png (512x512 Store Icon), and public/feature-graphic-1024x500.png.'
    );
  } catch (err) {
    console.warn('[configure-android-apk] Could not write public PNG icons:', err?.message);
  }
}

function configureAndroidResources() {
  generateWebAndStorePngIcons();

  if (!fs.existsSync(ANDROID_MAIN)) {
    console.log('[configure-android-apk] android/app/src/main not found yet — web icons ready.');
    return;
  }

  const densities = [
    { folder: 'mipmap-mdpi', launcherSize: 48, fgSize: 108 },
    { folder: 'mipmap-hdpi', launcherSize: 72, fgSize: 162 },
    { folder: 'mipmap-xhdpi', launcherSize: 96, fgSize: 216 },
    { folder: 'mipmap-xxhdpi', launcherSize: 144, fgSize: 324 },
    { folder: 'mipmap-xxxhdpi', launcherSize: 192, fgSize: 432 }
  ];

  for (const { folder, launcherSize, fgSize } of densities) {
    const dir = path.join(RES_DIR, folder);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), renderAfterDarkIconPng(launcherSize, 'square'));
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), renderAfterDarkIconPng(launcherSize, 'round'));
    fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), renderAfterDarkIconPng(fgSize, 'foreground'));
  }

  // Dark background color for adaptive icons
  const valuesDir = path.join(RES_DIR, 'values');
  fs.mkdirSync(valuesDir, { recursive: true });

  const icBgXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0C0612</color>
</resources>
`;
  fs.writeFileSync(path.join(valuesDir, 'ic_launcher_background.xml'), icBgXml, 'utf8');

  // Dark theme + camera notch protection (`android:fitsSystemWindows="true"`) in styles.xml
  const stylesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="colorPrimary">#FF4F9A</item>
        <item name="colorPrimaryDark">#0C0612</item>
        <item name="colorAccent">#FFB36B</item>
        <item name="android:windowBackground">#0C0612</item>
        <item name="android:statusBarColor">#0C0612</item>
        <item name="android:navigationBarColor">#0C0612</item>
        <item name="android:windowLightStatusBar">false</item>
        <item name="android:fitsSystemWindows">true</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
        <item name="android:windowBackground">#0C0612</item>
        <item name="android:statusBarColor">#0C0612</item>
        <item name="android:navigationBarColor">#0C0612</item>
        <item name="android:windowLightStatusBar">false</item>
        <item name="android:fitsSystemWindows">true</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
        <item name="android:background">#0C0612</item>
        <item name="android:windowBackground">#0C0612</item>
    </style>
</resources>
`;
  fs.writeFileSync(path.join(valuesDir, 'styles.xml'), stylesXml, 'utf8');

  const resolvedPackageId = String(
    process.env.ANDROID_PACKAGE_ID || 'com.afterdark.universe'
  ).trim();
  const resolvedAppName = String(process.env.ANDROID_APP_NAME || 'AFTERDARK').trim();

  // Write canonical strings.xml so APK label (app_name) and package_name strictly match Store Listing
  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${resolvedAppName}</string>
    <string name="title_activity_main">${resolvedAppName}</string>
    <string name="package_name">${resolvedPackageId}</string>
    <string name="custom_url_scheme">${resolvedPackageId}</string>
</resources>
`;
  fs.writeFileSync(path.join(valuesDir, 'strings.xml'), stringsXml, 'utf8');

  // Write canonical, store-compliant AndroidManifest.xml (zero regex patching, zero duplicate attributes)
  const manifestPath = path.join(ANDROID_MAIN, 'AndroidManifest.xml');
  if (fs.existsSync(manifestPath)) {
    const canonicalManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />

    <!-- Optional hardware features so PhonePe Indus Appstore & tablets/foldables never filter out the app -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-feature android:name="android.hardware.microphone" android:required="false" />
    <uses-feature android:name="android.hardware.telephony" android:required="false" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />

    <application
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:resizeableActivity="true"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
            android:name="com.afterdark.universe.MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

        <meta-data
            android:name="android.allow_multiple_resumed_activities"
            android:value="true" />
    </application>
</manifest>
`;
    fs.writeFileSync(manifestPath, canonicalManifest, 'utf8');
  }

  // Ensure variables.gradle uses targetSdkVersion = 35 (Android 15 store-compatible) while keeping compileSdkVersion >= 36 for AndroidX
  const variablesGradlePath = path.resolve(ROOT_DIR, 'android/variables.gradle');
  if (fs.existsSync(variablesGradlePath)) {
    let varsGradle = fs.readFileSync(variablesGradlePath, 'utf8');
    varsGradle = varsGradle.replace(/targetSdkVersion\s*=\s*\d+/, 'targetSdkVersion = 35');
    fs.writeFileSync(variablesGradlePath, varsGradle, 'utf8');
  }

  // Sync monotonically increasing versionCode & versionName + applicationId + Release Signing in android/app/build.gradle
  const runNumber = Math.max(0, Number.parseInt(process.env.GITHUB_RUN_NUMBER || '0', 10) || 0);
  const resolvedVersionCode = 202600 + runNumber;
  const resolvedVersionName = runNumber > 0 ? `2.0.2.${6 + runNumber}` : '2.0.2.6';

  const gradlePath = path.resolve(ROOT_DIR, 'android/app/build.gradle');
  if (fs.existsSync(gradlePath)) {
    let gradle = fs.readFileSync(gradlePath, 'utf8');
    gradle = gradle.replace(/applicationId\s+"[^"]+"/, `applicationId "${resolvedPackageId}"`);
    gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${resolvedVersionCode}`);
    gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${resolvedVersionName}"`);

    const jksPath = path.resolve(ROOT_DIR, 'android/app/afterdark-upload.jks');
    const legacyKeystorePath = path.resolve(ROOT_DIR, 'android/app/afterdark-upload.keystore');
    const keystoreFileName = fs.existsSync(jksPath)
      ? 'afterdark-upload.jks'
      : fs.existsSync(legacyKeystorePath)
        ? 'afterdark-upload.keystore'
        : null;

    if (keystoreFileName && !gradle.includes('signingConfigs')) {
      const escapeGroovySingleQuote = (val) => String(val || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const storePassword = escapeGroovySingleQuote(process.env.ANDROID_KEYSTORE_PASSWORD);
      const keyAlias = escapeGroovySingleQuote(process.env.ANDROID_KEY_ALIAS);
      const keyPassword = escapeGroovySingleQuote(
        process.env.ANDROID_KEY_PASSWORD || process.env.ANDROID_KEYSTORE_PASSWORD
      );

      const signingBlock = `    signingConfigs {
        release {
            storeFile file('${keystoreFileName}')
            storePassword '${storePassword}'
            keyAlias '${keyAlias}'
            keyPassword '${keyPassword}'
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }`;

      if (/buildTypes\s*\{\s*release\s*\{/.test(gradle)) {
        gradle = gradle.replace(
          /buildTypes\s*\{\s*release\s*\{/,
          `${signingBlock}\n    buildTypes {\n        release {\n            signingConfig signingConfigs.release`
        );
      } else {
        gradle = gradle.replace(
          /buildTypes\s*\{/,
          `${signingBlock}\n    buildTypes {\n        release {\n            signingConfig signingConfigs.release\n        }`
        );
      }
    }
    fs.writeFileSync(gradlePath, gradle, 'utf8');
  }

  console.log(
    `[configure-android-apk] Configured ${resolvedAppName} (${resolvedPackageId}) v${resolvedVersionName} (versionCode ${resolvedVersionCode}) icons, manifest, strings.xml & release signing.`
  );
}

configureAndroidResources();
