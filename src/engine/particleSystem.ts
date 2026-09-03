import * as THREE from 'three';
import { CONFIG } from '../config';
import { sampleLogoImage, getDefaultLogoImage, LogoSamplingData } from './logoMask';
import logoSvgUrl from '../assets/images/Logo_no_JM.svg';

export class ParticleEngine {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;

  private width: number = 0;
  private height: number = 0;
  private isMobile: boolean = false;
  private isTablet: boolean = false;

  private particleCount: number = CONFIG.particlesDesktop;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private points: THREE.Points;

  // Continuous particle buffers
  private currentPositions: Float32Array;
  private velocities: Float32Array;
  private colors: Float32Array;
  private alphas: Float32Array;
  private sizes: Float32Array;
  private seeds: Float32Array;

  // Independent particle displacement and physics buffers
  private displacementX: Float32Array;
  private displacementY: Float32Array;
  private impulseMult: Float32Array;
  private scatterAngle: Float32Array;
  private scatterSign: Float32Array;
  private damping: Float32Array;
  private returnStrength: Float32Array;
  private timeSinceImpulse: Float32Array;

  // Target positions for the celestial logo emblem
  private logoTarget: Float32Array = new Float32Array(0);
  private logoImage: HTMLImageElement | null = null;

  private animationFrameId: number | null = null;
  private time: number = 0;
  private isReducedMotion: boolean = false;

  // Pointer position tracking strictly for computing movement delta
  private prevMouseX: number = -99999;
  private prevMouseY: number = -99999;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
    this.container = container;
    this.canvas = canvas;

    if (typeof window !== 'undefined' && window.matchMedia) {
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Determine initial dimensions
    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(rect.width, typeof window !== 'undefined' ? window.innerWidth : 1200);
    this.height = Math.max(rect.height, typeof window !== 'undefined' ? window.innerHeight : 800);

    this.isMobile = this.width < 768;
    this.isTablet = this.width >= 768 && this.width < 1024;

    this.particleCount = this.isMobile
      ? CONFIG.particlesMobile
      : this.isTablet
      ? CONFIG.particlesTablet
      : CONFIG.particlesDesktop;

    const count = this.particleCount;

    // Pre-allocate all buffers synchronously
    this.currentPositions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 3);
    this.alphas = new Float32Array(count);
    this.sizes = new Float32Array(count);
    this.seeds = new Float32Array(count);

    this.displacementX = new Float32Array(count);
    this.displacementY = new Float32Array(count);
    this.impulseMult = new Float32Array(count);
    this.scatterAngle = new Float32Array(count);
    this.scatterSign = new Float32Array(count);
    this.damping = new Float32Array(count);
    this.returnStrength = new Float32Array(count);
    this.timeSinceImpulse = new Float32Array(count);

    const baseSize = this.isMobile
      ? CONFIG.particleSizeMobile
      : this.isTablet
      ? CONFIG.particleSizeTablet
      : CONFIG.particleSizeDesktop;

    // Synchronous pixel-by-pixel sampling from master logo emblem
    const sampling: LogoSamplingData = sampleLogoImage({
      width: this.width,
      height: this.height,
      count,
      isMobile: this.isMobile,
      baseSize,
      image: getDefaultLogoImage(),
    });

    this.logoTarget = sampling.positions;

    // Set initial positions strictly at target (ZERO chaotic cloud, ZERO random scatter)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const tx = this.logoTarget[i3] || 0;
      const ty = this.logoTarget[i3 + 1] || 0;

      this.currentPositions[i3] = tx;
      this.currentPositions[i3 + 1] = ty;
      this.currentPositions[i3 + 2] = 0;

      this.velocities[i3] = 0;
      this.velocities[i3 + 1] = 0;
      this.velocities[i3 + 2] = 0;

      // Authentic source image pixel colors (Gold on sun, Silver on face & heart, Champagne on scrolls)
      this.colors[i3] = sampling.colors[i3];
      this.colors[i3 + 1] = sampling.colors[i3 + 1];
      this.colors[i3 + 2] = sampling.colors[i3 + 2];

      this.alphas[i] = sampling.alphas[i];
      this.sizes[i] = sampling.sizes[i];
      this.seeds[i] = Math.random() * 100.0;

      this.displacementX[i] = 0;
      this.displacementY[i] = 0;
      this.timeSinceImpulse[i] = 999.0;

      // Interaction physics: subtle, gentle displacement with swift return
      this.impulseMult[i] = 0.65 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 0.40;
      this.scatterAngle[i] = ((Math.sin(i * 78.233) * 0.5 + 0.5) - 0.5) * 0.45;
      this.scatterSign[i] = i % 2 === 0 ? 1 : -1;
      this.damping[i] = 0.92;
      this.returnStrength[i] = 0.045 + (Math.sin(i * 91.713) * 0.5 + 0.5) * 0.025;
    }

    // Three.js Scene & Orthographic Camera Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(
      -this.width / 2,
      this.width / 2,
      this.height / 2,
      -this.height / 2,
      0.1,
      1000
    );
    this.camera.position.z = 10;

    // WebGL Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));

    // BufferGeometry with position, authentic color, alpha, size, seed
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.currentPositions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('aAlpha', new THREE.BufferAttribute(this.alphas, 1));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(this.seeds, 1));

    // Precision Shader Material: preserves razor-sharp edges and genuine pixel hues
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uGlobalAlpha: { value: 1.0 },
        uTime: { value: 0.0 },
      },
      vertexShader: `
        attribute vec3 color;
        attribute float aAlpha;
        attribute float aSize;
        attribute float aSeed;
        uniform float uGlobalAlpha;
        uniform float uTime;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = color;
          // Calm celestial micro-twinkle without positional drift
          float shimmer = 0.90 + 0.10 * sin(uTime * 1.8 + aSeed * 6.28);
          vAlpha = aAlpha * uGlobalAlpha * shimmer;
          gl_PointSize = aSize * 1.4;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          // Crisp point with subtle anti-aliased edge
          float edge = smoothstep(0.5, 0.28, dist);
          gl_FragColor = vec4(vColor, vAlpha * edge);
        }
      `,
      transparent: true,
      depthTest: false,
      blending: THREE.NormalBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    // Render immediately on frame 0 — logo is immediately 100% visible and readable
    this.render();

    // Also asynchronously load vector SVG asset URL if available to ensure best crispness
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = logoSvgUrl;
      img.onload = () => {
        this.logoImage = img;
        this.applyImageSampling(img);
      };
    }

    this.startLoop();
  }

  private applyImageSampling(img: HTMLImageElement) {
    const baseSize = this.isMobile
      ? CONFIG.particleSizeMobile
      : this.isTablet
      ? CONFIG.particleSizeTablet
      : CONFIG.particleSizeDesktop;

    const sampling = sampleLogoImage({
      width: this.width,
      height: this.height,
      count: this.particleCount,
      isMobile: this.isMobile,
      baseSize,
      image: img,
    });

    this.logoTarget.set(sampling.positions);

    const count = this.particleCount;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // If particle is at rest, smoothly align to new sampling
      if (this.displacementX[i] === 0 && this.displacementY[i] === 0) {
        this.currentPositions[i3] = this.logoTarget[i3];
        this.currentPositions[i3 + 1] = this.logoTarget[i3 + 1];
      }
      this.colors[i3] = sampling.colors[i3];
      this.colors[i3 + 1] = sampling.colors[i3 + 1];
      this.colors[i3 + 2] = sampling.colors[i3 + 2];
      this.alphas[i] = sampling.alphas[i];
      this.sizes[i] = sampling.sizes[i];
    }

    if (this.geometry) {
      (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (this.geometry.attributes.color as THREE.BufferAttribute).needsUpdate = true;
      (this.geometry.attributes.aAlpha as THREE.BufferAttribute).needsUpdate = true;
      (this.geometry.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
    }
  }

  public resize() {
    const rect = this.container.getBoundingClientRect();
    const newWidth = Math.max(rect.width, window.innerWidth);
    const newHeight = Math.max(rect.height, window.innerHeight);

    if (Math.abs(newWidth - this.width) < 2 && Math.abs(newHeight - this.height) < 2) {
      return;
    }

    this.width = newWidth;
    this.height = newHeight;
    this.isMobile = this.width < 768;
    this.isTablet = this.width >= 768 && this.width < 1024;

    this.renderer.setSize(this.width, this.height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.left = -this.width / 2;
    this.camera.right = this.width / 2;
    this.camera.top = this.height / 2;
    this.camera.bottom = -this.height / 2;
    this.camera.updateProjectionMatrix();

    if (this.logoImage) {
      this.applyImageSampling(this.logoImage);
    } else {
      this.applyImageSampling(getDefaultLogoImage());
    }
  }

  // =========================================================================
  // POINTER MOVE IMPULSE (Weak, subtle, nearby particles only, swift return)
  // =========================================================================
  public setPointerPosition(clientX: number, clientY: number) {
    if (this.isReducedMotion) return;
    const rect = this.container.getBoundingClientRect();
    const x = clientX - rect.left - this.width / 2;
    const y = -(clientY - rect.top - this.height / 2);

    if (this.prevMouseX === -99999) {
      this.prevMouseX = x;
      this.prevMouseY = y;
      return;
    }

    const ax = this.prevMouseX;
    const ay = this.prevMouseY;
    const bx = x;
    const by = y;

    this.prevMouseX = bx;
    this.prevMouseY = by;

    const abx = bx - ax;
    const aby = by - ay;
    const segLenSq = abx * abx + aby * aby;
    const segLen = Math.sqrt(segLenSq);

    if (segLen < 1.0) {
      return;
    }

    const dirX = abx / segLen;
    const dirY = aby / segLen;
    const perpX = -dirY;
    const perpY = dirX;

    // Small interaction radius per user requirement: "курсор задевает только частицы непосредственно рядом с ним"
    const swipeRadius = this.isMobile ? 22 : 32;
    const swipeRadiusSq = swipeRadius * swipeRadius;

    const segMinX = Math.min(ax, bx) - swipeRadius;
    const segMaxX = Math.max(ax, bx) + swipeRadius;
    const segMinY = Math.min(ay, by) - swipeRadius;
    const segMaxY = Math.max(ay, by) + swipeRadius;

    const count = this.particleCount;
    const pos = this.currentPositions;
    const vel = this.velocities;
    const impMul = this.impulseMult;
    const angleJitter = this.scatterAngle;
    const sideBias = this.scatterSign;

    // Gentle impulse speed
    const speed = Math.min(segLen, 45);
    const baseImpulse = speed * 0.22 + 1.2;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const px = pos[i3];
      const py = pos[i3 + 1];

      if (px < segMinX || px > segMaxX || py < segMinY || py > segMaxY) {
        continue;
      }

      const apx = px - ax;
      const apy = py - ay;
      const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / segLenSq));
      const closeX = ax + t * abx;
      const closeY = ay + t * aby;

      const pdx = px - closeX;
      const pdy = py - closeY;
      const distSq = pdx * pdx + pdy * pdy;

      if (distSq < swipeRadiusSq) {
        const dist = Math.sqrt(distSq);
        const normDist = dist / swipeRadius;
        const falloff = (1 - normDist) * (1 - normDist);

        const cross = dirX * apy - dirY * apx;
        const side = cross > 0.05 ? 1 : cross < -0.05 ? -1 : sideBias[i];

        const pMag = baseImpulse * falloff * impMul[i];
        const pushX = (dirX * 0.35 + perpX * side * 0.65) * pMag;
        const pushY = (dirY * 0.35 + perpY * side * 0.65) * pMag;

        const theta = angleJitter[i];
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const scatterX = pushX * cosT - pushY * sinT;
        const scatterY = pushX * sinT + pushY * cosT;

        vel[i3] += scatterX;
        vel[i3 + 1] += scatterY;
        this.timeSinceImpulse[i] = 0.0;
      }
    }
  }

  public clearPointer() {
    this.prevMouseX = -99999;
    this.prevMouseY = -99999;
  }

  private isPaused: boolean = false;

  public pause() {
    this.isPaused = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public resume() {
    if (!this.isPaused && this.animationFrameId !== null) return;
    this.isPaused = false;
    this.startLoop();
  }

  private startLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (this.isPaused) return;
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  // =========================================================================
  // ANIMATION FRAME UPDATE:
  // In resting state: particles sit EXACTLY at target coordinates!
  // When disturbed: critically damped spring returns them directly back.
  // =========================================================================
  private update(dt: number) {
    this.time += dt;

    if (this.material && this.material.uniforms && this.material.uniforms.uTime) {
      this.material.uniforms.uTime.value = this.time;
    }

    const count = this.particleCount;
    const tLogo = this.logoTarget;

    if (!tLogo.length) {
      return;
    }

    const pos = this.currentPositions;
    const vel = this.velocities;
    const dispXArr = this.displacementX;
    const dispYArr = this.displacementY;
    const retKArr = this.returnStrength;
    const dampArr = this.damping;
    const timeSinceImpulseArr = this.timeSinceImpulse;

    let hasMotion = false;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const baseTx = tLogo[i3];
      const baseTy = tLogo[i3 + 1];

      let dispX = dispXArr[i];
      let dispY = dispYArr[i];
      let vx = vel[i3];
      let vy = vel[i3 + 1];

      if (dispX !== 0 || dispY !== 0 || vx !== 0 || vy !== 0) {
        hasMotion = true;
        timeSinceImpulseArr[i] += dt;
        const tImp = timeSinceImpulseArr[i];

        // Progressive spring return
        const returnRamp = tImp < 0.12
          ? (tImp / 0.12) * 0.35
          : Math.min(1.0, 0.35 + (tImp - 0.12) * 2.5);

        const retK = retKArr[i] * returnRamp;
        const damp = dampArr[i];

        vx *= damp;
        vy *= damp;

        vx += -dispX * retK;
        vy += -dispY * retK;

        dispX += vx;
        dispY += vy;

        // Snapping to exact target coordinate when settled
        const distSq = dispX * dispX + dispY * dispY;
        const velSq = vx * vx + vy * vy;
        if (distSq < 0.01 && velSq < 0.005) {
          dispX = 0;
          dispY = 0;
          vx = 0;
          vy = 0;
        }

        dispXArr[i] = dispX;
        dispYArr[i] = dispY;
        vel[i3] = vx;
        vel[i3 + 1] = vy;
      }

      // Exact target position + physics displacement (Zero continuous drift or wobble)
      pos[i3] = baseTx + dispX;
      pos[i3 + 1] = baseTy + dispY;
      pos[i3 + 2] = 0;
    }

    if (hasMotion && this.geometry) {
      (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.points && this.geometry) {
      this.scene.remove(this.points);
      this.geometry.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }
    this.renderer.dispose();
  }
}
