import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function createRomanticPavilionGroup() {
  const group = new THREE.Group();

  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0xf7e7ce,
    roughness: 0.35,
    metalness: 0.1
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffc857,
    roughness: 0.25,
    metalness: 0.85
  });
  const roseVelvetMat = new THREE.MeshStandardMaterial({
    color: 0x9b1b47,
    roughness: 0.7,
    metalness: 0.05
  });

  // 1. Stepped octagonal marble terrace base
  const baseBottom = new THREE.Mesh(
    new THREE.CylinderGeometry(4.4, 4.7, 0.3, 8),
    marbleMat
  );
  baseBottom.position.y = 0.15;
  group.add(baseBottom);

  const baseTop = new THREE.Mesh(
    new THREE.CylinderGeometry(3.9, 4.2, 0.25, 8),
    marbleMat
  );
  baseTop.position.y = 0.42;
  group.add(baseTop);

  // 2. Decorative gold inlay border ring
  const inlayRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.85, 0.05, 12, 48),
    goldMat
  );
  inlayRing.rotation.x = Math.PI / 2;
  inlayRing.position.y = 0.55;
  group.add(inlayRing);

  // 3. Four ornate corner pillars with lotus capitals & mini domes
  const pillarPositions = [
    [-2.2, -2.2],
    [2.2, -2.2],
    [-2.2, 2.2],
    [2.2, 2.2]
  ];

  for (const [px, pz] of pillarPositions) {
    const pillarGroup = new THREE.Group();
    pillarGroup.position.set(px, 0.55, pz);

    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.35, 0.55),
      marbleMat
    );
    plinth.position.y = 0.175;
    pillarGroup.add(plinth);

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 2.8, 16),
      marbleMat
    );
    shaft.position.y = 1.75;
    pillarGroup.add(shaft);

    const goldCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.21, 0.04, 10, 24),
      goldMat
    );
    goldCollar.rotation.x = Math.PI / 2;
    goldCollar.position.y = 3.1;
    pillarGroup.add(goldCollar);

    const turretDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
      goldMat
    );
    turretDome.position.y = 3.95;
    pillarGroup.add(turretDome);

    const finial = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.28, 12),
      goldMat
    );
    finial.position.y = 4.32;
    pillarGroup.add(finial);

    group.add(pillarGroup);
  }

  // 4. Pavilion upper cornice & royal dome canopy
  const cornice = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 0.32, 5.0),
    marbleMat
  );
  cornice.position.y = 3.85;
  group.add(cornice);

  const mainDome = new THREE.Mesh(
    new THREE.SphereGeometry(2.1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    roseVelvetMat
  );
  mainDome.position.y = 4.0;
  group.add(mainDome);

  const domeFinial = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.55, 16),
    goldMat
  );
  domeFinial.position.y = 6.25;
  group.add(domeFinial);

  return group;
}

function createCandlelightTableGroup() {
  const tableGroup = new THREE.Group();
  tableGroup.position.y = 0.55;

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xffb703,
    roughness: 0.25,
    metalness: 0.85
  });
  const clothMat = new THREE.MeshStandardMaterial({
    color: 0x590d22,
    roughness: 0.65,
    metalness: 0.05
  });
  const waxMat = new THREE.MeshStandardMaterial({
    color: 0xfff3d1,
    roughness: 0.4,
    metalness: 0.0
  });
  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    emissive: 0xff7b00,
    emissiveIntensity: 3.5,
    roughness: 0.1
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.65
  });

  // Pedestal & Draped Tabletop
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.38, 0.9, 16),
    brassMat
  );
  pedestal.position.y = 0.45;
  tableGroup.add(pedestal);

  const tableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.12, 0.12, 24),
    clothMat
  );
  tableTop.position.y = 0.92;
  tableGroup.add(tableTop);

  // Two Candles with Glowing Flames
  const candleOffsets = [-0.28, 0.28];
  const flames = [];
  for (const cx of candleOffsets) {
    const holder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 0.08, 12),
      brassMat
    );
    holder.position.set(cx, 1.02, 0);
    tableGroup.add(holder);

    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.32, 12),
      waxMat
    );
    candle.position.set(cx, 1.2, 0);
    tableGroup.add(candle);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.12, 10),
      flameMat
    );
    flame.position.set(cx, 1.41, 0);
    tableGroup.add(flame);
    flames.push(flame);
  }

  // Two Wine Glasses
  for (const gx of [-0.55, 0.55]) {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.06, 0.18, 10),
      glassMat
    );
    stem.position.set(gx, 1.07, 0.32);
    tableGroup.add(stem);

    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.02, 0.14, 12),
      glassMat
    );
    bowl.position.set(gx, 1.22, 0.32);
    tableGroup.add(bowl);
  }

  tableGroup.userData.flames = flames;
  return tableGroup;
}

function createSkyLanternGroup(seed = 0) {
  const lantern = new THREE.Group();

  const paperMat = new THREE.MeshStandardMaterial({
    color: 0xff6b8b,
    emissive: 0xff4d6d,
    emissiveIntensity: 1.6,
    roughness: 0.45
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    roughness: 0.3,
    metalness: 0.8
  });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.15, 0.42, 12),
    paperMat
  );
  lantern.add(body);

  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    paperMat
  );
  cap.position.y = 0.21;
  lantern.add(cap);

  const bottomRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.02, 8, 16),
    rimMat
  );
  bottomRing.rotation.x = Math.PI / 2;
  bottomRing.position.y = -0.21;
  lantern.add(bottomRing);

  lantern.userData = {
    baseY: 1.8 + (seed % 5) * 0.9,
    radius: 3.2 + (seed % 3) * 1.1,
    angle: (seed * Math.PI * 2) / 8,
    speed: 0.25 + (seed % 4) * 0.06
  };

  return lantern;
}

export function ThreeRomanticScene({ creatorName = 'You', partnerName = 'Meri Jaan', onSelectMoodVenue }) {
  const containerRef = useRef(null);
  const [ambienceMode, setAmbienceMode] = useState('moonlit'); // 'moonlit' | 'golden' | 'rose'

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      return undefined;
    }

    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|Google Inc\./i.test(rendererStr);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 320;
    renderer.setSize(width, height, false);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgColors = {
      moonlit: 0x0e0618,
      golden: 0x1b0d14,
      rose: 0x1f0719
    };
    scene.background = new THREE.Color(bgColors[ambienceMode] || 0x0e0618);
    scene.fog = new THREE.FogExp2(bgColors[ambienceMode] || 0x0e0618, 0.045);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 8.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 1.8, 0);
    controls.minDistance = 4.5;
    controls.maxDistance = 13;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffb3c6, 0x1a0b2e, 0.8);
    scene.add(hemiLight);

    const candlePointLight = new THREE.PointLight(0xff9f1c, 3.2, 12);
    candlePointLight.position.set(0, 2.2, 0);
    scene.add(candlePointLight);

    const moonLight = new THREE.DirectionalLight(0xd8b4fe, 1.4);
    moonLight.position.set(6, 10, -6);
    scene.add(moonLight);

    // Reflective Lake Water Plane (Durgam Cheruvu / Hussain Sagar vibe)
    const waterGeo = new THREE.CircleGeometry(28, 48);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x120824,
      roughness: 0.15,
      metalness: 0.85
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = 0;
    scene.add(waterMesh);

    // Composite Procedural Groups
    const pavilion = createRomanticPavilionGroup();
    scene.add(pavilion);

    const table = createCandlelightTableGroup();
    scene.add(table);

    const lanterns = [];
    for (let i = 0; i < 8; i++) {
      const l = createSkyLanternGroup(i);
      scene.add(l);
      lanterns.push(l);
    }

    // Crescent Moon in the sky
    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xfff1d0,
        emissive: 0xffd166,
        emissiveIntensity: 1.4,
        roughness: 0.3
      })
    );
    moonMesh.position.set(-4.5, 6.4, -7.5);
    scene.add(moonMesh);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        }
      }
    });
    resizeObserver.observe(container);

    const pixel = new Uint8Array(4);
    const afterDraw = isSoftwareGl
      ? () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
      : () => {};

    const clock = new THREE.Clock();
    let timerId = 0;
    let disposed = false;

    function tick() {
      if (disposed) return;
      const elapsed = clock.getElapsedTime();

      // Gentle candle flicker
      candlePointLight.intensity = 2.9 + Math.sin(elapsed * 7.5) * 0.35;
      const flames = table.userData.flames || [];
      for (let i = 0; i < flames.length; i++) {
        flames[i].scale.y = 1 + Math.sin(elapsed * 9 + i) * 0.14;
      }

      // Orbiting floating sky lanterns
      for (const lantern of lanterns) {
        const d = lantern.userData;
        const a = d.angle + elapsed * d.speed;
        lantern.position.set(
          Math.cos(a) * d.radius,
          d.baseY + Math.sin(elapsed * 1.4 + d.angle) * 0.35,
          Math.sin(a) * d.radius
        );
        lantern.rotation.y = -a;
      }

      controls.update();
      renderer.render(scene, camera);
      afterDraw();

      if (isSoftwareGl) {
        timerId = window.setTimeout(tick, 250);
      } else {
        timerId = window.requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      if (isSoftwareGl) {
        clearTimeout(timerId);
      } else {
        cancelAnimationFrame(timerId);
      }
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
    };
  }, [ambienceMode]);

  return (
    <div className="ad-three-scene-card">
      <div className="ad-three-header">
        <div>
          <span className="ad-tag">☾ INTERACTIVE 3D HYDERABAD CANDLELIGHT ROOFTOP</span>
          <h4>
            {creatorName} ♥ {partnerName} — 3D Moonlit Pavilion &amp; Sky Lanterns
          </h4>
        </div>
        <div className="ad-three-controls">
          <button
            type="button"
            className={`ad-tool-btn ${ambienceMode === 'moonlit' ? 'active' : ''}`}
            onClick={() => setAmbienceMode('moonlit')}
          >
            🌙 Durgam Cheruvu Night
          </button>
          <button
            type="button"
            className={`ad-tool-btn ${ambienceMode === 'golden' ? 'active' : ''}`}
            onClick={() => setAmbienceMode('golden')}
          >
            ✨ Falaknuma Gold
          </button>
          <button
            type="button"
            className={`ad-tool-btn ${ambienceMode === 'rose' ? 'active' : ''}`}
            onClick={() => setAmbienceMode('rose')}
          >
            🌹 Banjara Rose
          </button>
          {onSelectMoodVenue && (
            <button
              type="button"
              className="ad-tool-btn"
              onClick={() =>
                onSelectMoodVenue(
                  ambienceMode === 'golden'
                    ? 'Taj Falaknuma Palace — Celeste Terrace'
                    : ambienceMode === 'rose'
                    ? 'Exotica Rooftop, Banjara Hills Road No. 12'
                    : 'Olive Bistro, Durgam Cheruvu (Lakeview Candlelight)'
                )
              }
            >
              🕯️ Book This Rooftop for Our Date
            </button>
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        className="ad-three-canvas-wrap"
        style={{ width: '100%', height: '270px', borderRadius: '14px', overflow: 'hidden' }}
      />
      <small className="ad-three-hint">
        Drag to rotate 360° · Scroll/pinch to zoom into your private candlelight table
      </small>
    </div>
  );
}
