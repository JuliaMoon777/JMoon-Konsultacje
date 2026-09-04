import React, { useEffect, useRef } from 'react';

/**
 * J MOON NUMEROLOGY — DIGITAL MATERIAL BACKGROUND ENGINE
 * 
 * Dark Liquid Terracotta Satin / Living Light Surface
 * 
 * Color & Lighting Calibration:
 * - Lifted Shadows (+8–12% base luminance): #2D0C14 → #321018 → #3B121B → #45151D → #501A21
 * - Compressed Dynamic Range: Soft clamp on peak specular sheen without harsh glare.
 * - Muted Copper: #A85A35, #B86A42, #C77A50
 * - Soft Champagne: #D6A77F, #DDB892 (under 1–2% volume, delicate non-glaring)
 * - Tonal Balance: 65–70% deep wine/burgundy, 20–25% dark terracotta, 8–10% muted copper, 1–2% soft champagne.
 */

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision highp float;
  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_scroll;
  uniform float u_scrollVelocity;
  uniform float u_dpr;

  // Optimized Simplex / Smooth Noise
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float gnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = st;
    uv.x *= aspect;

    // Ultra-slow autonomous time scale (approx 45-65s full loop)
    float t = u_time * 0.016;

    // Velocity stretching along scroll vector (2-3% subtle distortion)
    float velOffset = u_scrollVelocity * 0.035;
    vec2 scrollDir = vec2(0.0, u_scroll + velOffset);

    // =========================================================================
    // 1. OPTICAL DEPTH: Domain Warping (Continuous Satin Curvature)
    // =========================================================================
    // Warp Layer 1: Massive macro ground motion (0.4 - 0.8 spatial scale)
    vec2 q = vec2(
      gnoise(uv * 0.45 + vec2(t * 0.6, t * 0.4) + scrollDir * 0.35),
      gnoise(uv * 0.45 + vec2(t * -0.5 + 4.2, t * 0.5 + 1.8) - scrollDir * 0.28)
    );

    // Warp Layer 2: Medium undulating satin fold vectors
    vec2 r = vec2(
      gnoise(uv * 0.75 + 1.8 * q + vec2(1.7, 9.2) + vec2(t * 0.8, -t * 0.6) + scrollDir * 0.6),
      gnoise(uv * 0.75 + 1.8 * q + vec2(8.3, 2.8) + vec2(-t * 0.7, t * 0.9) - scrollDir * 0.5)
    );

    // Primary smooth curved satin ridges (sinusoidal continuous field)
    float foldA = sin(uv.x * 1.45 + uv.y * 1.15 + 2.4 * r.x + u_scroll * 2.6 + t * 1.2);
    float foldB = cos(uv.x * 1.2 - uv.y * 1.55 + 2.1 * r.y - u_scroll * 2.2 - t * 0.9);
    float foldC = sin((uv.x * 0.85 - uv.y * 0.9) + 1.6 * q.x + u_scroll * 1.8 + t * 0.7);

    // Composite satin field with high smoothness
    float satinField = foldA * 0.48 + foldB * 0.36 + foldC * 0.26; // approx -1.1 to 1.1

    // Normalize field into [0, 1] with soft sigmoid curve
    float lightIntensity = smoothstep(-0.65, 0.95, satinField);

    // =========================================================================
    // 2. SECTION-AWARE & LOCAL LIGHT MODULATION
    // =========================================================================
    // Hero Top Warmth: Soft warm reflection near upper center, dark perimeters
    float heroGlow = smoothstep(0.4, 0.0, u_scroll) * 
                     smoothstep(1.3, 0.1, distance(st, vec2(0.5, 0.28))) * 0.28;

    // Puzzle warm resonance (around scroll 0.15 - 0.4)
    float puzzleWarmth = smoothstep(0.08, 0.24, u_scroll) * (1.0 - smoothstep(0.38, 0.55, u_scroll)) * 0.18;

    // Services dynamic reflection pass (scroll 0.35 - 0.85)
    float servicesSwell = smoothstep(0.3, 0.55, u_scroll) * (1.0 - smoothstep(0.82, 0.98, u_scroll)) * 0.22;

    // Deep calm grounding near footer
    float footerSerenity = smoothstep(0.85, 1.0, u_scroll);

    // Dynamic light envelope with soft compression (prevents sharp glare spikes)
    float activeLight = lightIntensity * (0.68 + heroGlow + puzzleWarmth + servicesSwell) * (1.0 - footerSerenity * 0.25);
    activeLight = clamp(activeLight, 0.0, 0.96);

    // Vignette for mineral deep canvas boundary
    float centerVignette = smoothstep(1.45, 0.25, distance(st, vec2(0.5, 0.45)));
    activeLight *= (0.80 + 0.20 * centerVignette);

    // =========================================================================
    // 3. COLOR PALETTE: Calibrated Linear Pigments (Lifted Base & Muted Sheen)
    // =========================================================================
    // Base Deep Wine / Burgundy (Lifted +8–12% luminance: #240A12 / #321018 / #3B121B / #45151D / #501A21)
    vec3 cDeepWineShadow  = vec3(0.141, 0.039, 0.071); // #240A12
    vec3 cDeepWine1       = vec3(0.196, 0.063, 0.094); // #321018
    vec3 cDeepWine2       = vec3(0.231, 0.071, 0.106); // #3B121B
    vec3 cWineBurgundy    = vec3(0.271, 0.082, 0.114); // #45151D
    vec3 cWineVelvet      = vec3(0.314, 0.102, 0.129); // #501A21

    // Terracotta Optical Resonance (20–25% volume: rich, warm, not over-saturated)
    vec3 cBurntTerracotta = vec3(0.478, 0.184, 0.094); // #7A2F18
    vec3 cRichTerracotta   = vec3(0.573, 0.239, 0.118); // #923D1E
    vec3 cDarkTerracotta   = vec3(0.612, 0.275, 0.141); // #9C4624

    // Muted Copper Sheen (8–10% volume: #A85A35, #B86A42, #C77A50)
    vec3 cMutedCopper1    = vec3(0.659, 0.353, 0.208); // #A85A35
    vec3 cMutedCopper2    = vec3(0.722, 0.416, 0.259); // #B86A42
    vec3 cMutedCopper3    = vec3(0.780, 0.478, 0.314); // #C77A50

    // Soft Champagne Highlight (1–2% volume: #D6A77F, #DDB892, non-glaring)
    vec3 cSoftChampagne1  = vec3(0.839, 0.655, 0.498); // #D6A77F
    vec3 cSoftChampagne2  = vec3(0.867, 0.722, 0.573); // #DDB892

    // =========================================================================
    // 4. MULTI-LAYER LIGHT ACCUMULATION (Compressed Dynamic Range)
    // =========================================================================
    // 4.1 Base Mineral Field (Visible surface structure even in shadows)
    float baseGradY = st.y + q.y * 0.15;
    vec3 baseColor = mix(cDeepWineShadow, cDeepWine1, smoothstep(0.0, 0.35, baseGradY));
    baseColor = mix(baseColor, cDeepWine2, smoothstep(0.25, 0.75, baseGradY));
    baseColor = mix(baseColor, cWineBurgundy, smoothstep(0.6, 0.98, baseGradY));
    baseColor = mix(baseColor, cWineVelvet, q.x * 0.45 + 0.5);

    // 4.2 Terracotta Subsurface Reflection
    float terraMask = smoothstep(0.28, 0.72, activeLight);
    vec3 terraColor = mix(cBurntTerracotta, cRichTerracotta, smoothstep(0.32, 0.62, activeLight));
    terraColor = mix(terraColor, cDarkTerracotta, smoothstep(0.58, 0.82, activeLight));

    // 4.3 Muted Copper Highlight Reflection (Gentle, controlled peak)
    float copperMask = smoothstep(0.58, 0.85, activeLight);
    vec3 copperColor = mix(cMutedCopper1, cMutedCopper2, smoothstep(0.62, 0.80, activeLight));
    copperColor = mix(copperColor, cMutedCopper3, smoothstep(0.78, 0.92, activeLight));

    // 4.4 Soft Champagne Specular Crest (Subtle satin reflection, no harsh white/gold)
    float specMask = pow(smoothstep(0.75, 0.94, activeLight), 2.8);
    vec3 specColor = mix(cSoftChampagne1, cSoftChampagne2, smoothstep(0.82, 0.96, activeLight));

    // Layer Composite with Compressed Dynamic Contrast
    vec3 finalColor = baseColor;
    finalColor = mix(finalColor, terraColor, terraMask * 0.72);
    finalColor = mix(finalColor, copperColor, copperMask * 0.58);
    finalColor = mix(finalColor, specColor, specMask * 0.32);

    // 4.5 Hero Soft Warmth Modulation
    if (heroGlow > 0.01) {
      finalColor += cDarkTerracotta * heroGlow * 0.32;
    }

    // =========================================================================
    // 5. MICRO-MATERIAL GRAIN & SUBTLE SPECULAR
    // =========================================================================
    // Procedural High-Precision Micro-Grain (0.9% opacity)
    float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    finalColor += (grain - 0.5) * 0.008;

    // Rare microscopic satin sheen glints on copper crests
    float microNoise = fract(sin(dot(gl_FragCoord.xy * 0.35, vec2(93.27, 47.19))) * 98765.4321);
    float microGlint = step(0.9975, microNoise) * specMask * 0.14;
    finalColor += microGlint * cSoftChampagne1;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// =========================================================================
// LUXURY FLOATING DUST / MICRO-SPECULAR PARTICLES
// Independent microscopic jewelry dust floating before dark satin.
// Noticeable, atmospheric, elegant with soft micro-glow & organic clusters.
// =========================================================================

const PARTICLE_VERTEX_SHADER_SOURCE = `
  attribute vec2 a_p_position;
  attribute float a_p_size;
  attribute vec4 a_p_color;
  varying vec4 v_p_color;

  void main() {
    // Convert normalized [0, 1] screen UVs to clip space [-1, 1]
    vec2 clipPos = vec2(a_p_position.x * 2.0 - 1.0, 1.0 - a_p_position.y * 2.0);
    gl_Position = vec4(clipPos, 0.0, 1.0);
    gl_PointSize = a_p_size;
    v_p_color = a_p_color;
  }
`;

const PARTICLE_FRAGMENT_SHADER_SOURCE = `
  precision mediump float;
  varying vec4 v_p_color;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) {
      discard;
    }
    // High-contrast specular core + delicate soft micro-glow halo
    float core = smoothstep(0.24, 0.04, dist);
    float halo = smoothstep(0.50, 0.14, dist) * 0.36;
    float alpha = clamp(core + halo, 0.0, 1.0) * v_p_color.a;
    gl_FragColor = vec4(v_p_color.rgb, alpha);
  }
`;

// Contrast-calibrated luxury palette: muted copper, soft terracotta, warm champagne, warm ivory, dusty rose
const DUST_PALETTE: Array<[number, number, number]> = [
  [0.784, 0.459, 0.310], // 0: muted copper #C8754F
  [0.851, 0.549, 0.388], // 1: soft copper / warm terracotta #D98C63
  [0.902, 0.690, 0.537], // 2: warm champagne #E6B089
  [0.941, 0.808, 0.686], // 3: warm ivory #F0CEAF
  [0.863, 0.561, 0.522], // 4: dusty rose #DC8F85
];

interface LuxuryDustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  depthLayer: number; // 0 = FAR, 1 = MID, 2 = NEAR
  color: [number, number, number];
  baseOpacity: number;
  currentOpacity: number;
  driftPhaseX: number;
  driftPhaseY: number;
  driftFreqX: number;
  driftFreqY: number;
  driftAmpX: number;
  driftAmpY: number;
  isGlinting: boolean;
  glintProgress: number;
  glintDuration: number;
  glintPeakOpacity: number;
  timeUntilNextGlint: number;
}

function createLuxuryDustParticle(
  w: number,
  h: number,
  clusterCenterX?: number,
  clusterCenterY?: number,
  initialY?: number
): LuxuryDustParticle {
  const rand = Math.random();
  let depthLayer = 1; // MID by default
  let size = 2.0;
  let baseOpacity = 0.32;
  let speedMult = 1.0;

  if (rand < 0.30) {
    // FAR tier (30%): smaller, calm, slower (1.0–1.6px)
    depthLayer = 0;
    size = 1.0 + Math.random() * 0.60;
    baseOpacity = 0.18 + Math.random() * 0.10; // 0.18 - 0.28
    speedMult = 0.65 + Math.random() * 0.30;
  } else if (rand < 0.85) {
    // MID tier (55%): main visible body (1.8–2.6px)
    depthLayer = 1;
    size = 1.8 + Math.random() * 0.80;
    baseOpacity = 0.28 + Math.random() * 0.18; // 0.28 - 0.46
    speedMult = 0.95 + Math.random() * 0.35;
  } else {
    // NEAR tier (15%): rare accent particles giving luxurious depth (2.8–3.6px)
    depthLayer = 2;
    size = 2.8 + Math.random() * 0.80;
    baseOpacity = 0.46 + Math.random() * 0.18; // 0.46 - 0.64
    speedMult = 1.25 + Math.random() * 0.45;
  }

  // Independent gentle velocities: 0.12 - 0.45px/frame
  const dirRand = Math.random();
  let vx = (Math.random() - 0.5) * 0.28 * speedMult;
  let vy = -0.14 - Math.random() * 0.26 * speedMult;

  if (dirRand < 0.18) {
    // almost hovering / suspended
    vx = (Math.random() - 0.5) * 0.08;
    vy = (Math.random() - 0.5) * 0.07;
  } else if (dirRand < 0.44) {
    // slow drift up-left
    vx = -0.08 - Math.random() * 0.22 * speedMult;
    vy = -0.10 - Math.random() * 0.24 * speedMult;
  } else if (dirRand < 0.70) {
    // slow drift up-right
    vx = 0.08 + Math.random() * 0.22 * speedMult;
    vy = -0.10 - Math.random() * 0.24 * speedMult;
  } else if (dirRand < 0.88) {
    // gentle horizontal drift
    vx = (Math.random() - 0.5) * 0.32 * speedMult;
    vy = (Math.random() - 0.5) * 0.10;
  }

  // Pick contrast-calibrated muted color
  const colorIdx = Math.floor(Math.random() * DUST_PALETTE.length);
  const color = DUST_PALETTE[colorIdx];

  // Position: either organically grouped near a cluster center or freely distributed
  let posX = Math.random() * w;
  let posY = initialY !== undefined ? initialY : Math.random() * h;

  if (clusterCenterX !== undefined && clusterCenterY !== undefined) {
    const angle = Math.random() * Math.PI * 2;
    const rad = 25 + Math.random() * 120;
    posX = clusterCenterX + Math.cos(angle) * rad;
    posY = initialY !== undefined ? initialY : clusterCenterY + Math.sin(angle) * rad;
  }

  // Shimmer state (15-25% start already in a sparkling phase)
  const startsGlinting = Math.random() < 0.20;
  const glintDuration = 0.9 + Math.random() * 1.5; // 0.9 - 2.4 sec transition
  const peakGlint = depthLayer === 2 ? 0.72 + Math.random() * 0.08 : 0.55 + Math.random() * 0.20;

  return {
    x: posX,
    y: posY,
    vx,
    vy,
    size,
    depthLayer,
    color,
    baseOpacity,
    currentOpacity: startsGlinting ? baseOpacity + (peakGlint - baseOpacity) * 0.6 : baseOpacity,
    driftPhaseX: Math.random() * Math.PI * 2,
    driftPhaseY: Math.random() * Math.PI * 2,
    driftFreqX: 0.28 + Math.random() * 0.45,
    driftFreqY: 0.24 + Math.random() * 0.40,
    driftAmpX: 0.06 + Math.random() * 0.10,
    driftAmpY: 0.04 + Math.random() * 0.08,
    isGlinting: startsGlinting,
    glintProgress: startsGlinting ? Math.random() * 0.8 : 0,
    glintDuration,
    glintPeakOpacity: Math.min(0.80, peakGlint),
    timeUntilNextGlint: startsGlinting ? 0 : 0.6 + Math.random() * 5.0,
  };
}

export const LuxuryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    let ctx2d: CanvasRenderingContext2D | null = null;
    let useWebGL = true;

    // Attempt WebGL context initialization
    try {
      gl = canvas.getContext('webgl', {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: false,
        powerPreference: 'high-performance',
      });
    } catch {
      gl = null;
    }

    if (!gl) {
      useWebGL = false;
      ctx2d = canvas.getContext('2d', { alpha: false });
    }

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = true;
    let prefersReducedMotion = false;

    // Smooth scroll inertia tracking
    let scrollProgress = 0;
    let targetScrollProgress = 0;
    let lastScrollY = 0;
    let scrollVelocity = 0;
    let targetVelocity = 0;

    // Luxury Dust Particles State
    let dustParticles: LuxuryDustParticle[] = [];
    let particleBuffer: WebGLBuffer | null = null;
    let particleProgram: WebGLProgram | null = null;
    let pPosAttrLoc = -1;
    let pSizeAttrLoc = -1;
    let pColorAttrLoc = -1;
    let particleDataArray = new Float32Array(0);

    if (typeof window !== 'undefined' && window.matchMedia) {
      prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Compile WebGL Programs
    let program: WebGLProgram | null = null;
    let positionBuffer: WebGLBuffer | null = null;
    let uResolutionLoc: WebGLUniformLocation | null = null;
    let uTimeLoc: WebGLUniformLocation | null = null;
    let uScrollLoc: WebGLUniformLocation | null = null;
    let uScrollVelLoc: WebGLUniformLocation | null = null;
    let uDprLoc: WebGLUniformLocation | null = null;

    if (useWebGL && gl) {
      const createShader = (type: number, src: string) => {
        const s = gl!.createShader(type);
        if (!s) return null;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
          console.warn('Shader compile error:', gl!.getShaderInfoLog(s));
          gl!.deleteShader(s);
          return null;
        }
        return s;
      };

      // 1. Fullscreen Material Shader
      const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
      const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

      if (vs && fs) {
        program = gl.createProgram();
        if (program) {
          gl.attachShader(program, vs);
          gl.attachShader(program, fs);
          gl.linkProgram(program);

          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.warn('Program link error:', gl.getProgramInfoLog(program));
            program = null;
            useWebGL = false;
            ctx2d = canvas.getContext('2d', { alpha: false });
          } else {
            gl.useProgram(program);
            uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
            uTimeLoc = gl.getUniformLocation(program, 'u_time');
            uScrollLoc = gl.getUniformLocation(program, 'u_scroll');
            uScrollVelLoc = gl.getUniformLocation(program, 'u_scrollVelocity');
            uDprLoc = gl.getUniformLocation(program, 'u_dpr');

            // Full screen quad (-1 to 1)
            const positions = new Float32Array([
              -1, -1,
               1, -1,
              -1,  1,
              -1,  1,
               1, -1,
               1,  1,
            ]);

            positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

            const posAttr = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(posAttr);
            gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
          }
        }
      } else {
        useWebGL = false;
        ctx2d = canvas.getContext('2d', { alpha: false });
      }

      // 2. Micro-Specular Dust Point Shader
      if (useWebGL && gl) {
        const pVs = createShader(gl.VERTEX_SHADER, PARTICLE_VERTEX_SHADER_SOURCE);
        const pFs = createShader(gl.FRAGMENT_SHADER, PARTICLE_FRAGMENT_SHADER_SOURCE);
        if (pVs && pFs) {
          particleProgram = gl.createProgram();
          if (particleProgram) {
            gl.attachShader(particleProgram, pVs);
            gl.attachShader(particleProgram, pFs);
            gl.linkProgram(particleProgram);
            if (gl.getProgramParameter(particleProgram, gl.LINK_STATUS)) {
              pPosAttrLoc = gl.getAttribLocation(particleProgram, 'a_p_position');
              pSizeAttrLoc = gl.getAttribLocation(particleProgram, 'a_p_size');
              pColorAttrLoc = gl.getAttribLocation(particleProgram, 'a_p_color');
              particleBuffer = gl.createBuffer();
            } else {
              particleProgram = null;
            }
          }
        }
      }
    }

    const initDustParticles = (w: number, h: number) => {
      // Desktop (>= 1024): 88 particles (target: 70–110)
      // Tablet (640–1024): 56 particles (target: 45–70)
      // Mobile (< 640): 34 particles (target: 25–45)
      const targetCount = w >= 1024 ? 88 : w >= 640 ? 56 : 34;

      // Create 3-5 organic cluster focal points for natural non-uniform density
      const numClusters = w >= 1024 ? 5 : w >= 640 ? 4 : 3;
      const clusters: Array<{ x: number; y: number }> = [];
      for (let c = 0; c < numClusters; c++) {
        clusters.push({
          x: Math.random() * w,
          y: Math.random() * h,
        });
      }

      if (dustParticles.length === 0) {
        dustParticles = [];
        for (let i = 0; i < targetCount; i++) {
          const useCluster = Math.random() < 0.65;
          const cluster = clusters[Math.floor(Math.random() * clusters.length)];
          dustParticles.push(
            useCluster
              ? createLuxuryDustParticle(w, h, cluster.x, cluster.y)
              : createLuxuryDustParticle(w, h)
          );
        }
      } else if (dustParticles.length < targetCount) {
        while (dustParticles.length < targetCount) {
          const useCluster = Math.random() < 0.65;
          const cluster = clusters[Math.floor(Math.random() * clusters.length)];
          dustParticles.push(
            useCluster
              ? createLuxuryDustParticle(w, h, cluster.x, cluster.y)
              : createLuxuryDustParticle(w, h)
          );
        }
      } else if (dustParticles.length > targetCount) {
        dustParticles = dustParticles.slice(0, targetCount);
      }

      // 7 floats per particle: [x_norm, y_norm, size_phys, r, g, b, a]
      particleDataArray = new Float32Array(targetCount * 7);
    };

    const resize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      const isMobile = width < 768;
      // Clamp DPR for performance (desktop max 2.0, mobile max 1.5)
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2.0);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      initDustParticles(width, height);

      if (useWebGL && gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      } else if (ctx2d) {
        ctx2d.scale(dpr, dpr);
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const handleScroll = () => {
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const currentY = window.scrollY;
      targetScrollProgress = Math.min(1, Math.max(0, currentY / docHeight));

      const delta = currentY - lastScrollY;
      lastScrollY = currentY;
      targetVelocity = Math.min(1.5, Math.max(-1.5, delta / 35));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const startTime = performance.now();
    let lastFrameTimestamp = performance.now();
    let isLoopRunning = false;

    // =========================================================================
    // 2D CANVAS FALLBACK ENGINE (in case WebGL is unavailable)
    // =========================================================================
    const render2DFallback = (t: number) => {
      if (!ctx2d) return;
      const bgGrad = ctx2d.createLinearGradient(0, 0, width * 0.4, height);
      bgGrad.addColorStop(0.0, '#240A12');
      bgGrad.addColorStop(0.35 + scrollProgress * 0.1, '#321018');
      bgGrad.addColorStop(0.75 - scrollProgress * 0.08, '#3B121B');
      bgGrad.addColorStop(1.0, '#2D0C14');
      ctx2d.fillStyle = bgGrad;
      ctx2d.fillRect(0, 0, width, height);

      ctx2d.save();
      ctx2d.globalCompositeOperation = 'screen';

      const sShiftX = (scrollProgress - 0.5) * width * 0.06;
      const sShiftY = (scrollProgress - 0.5) * height * 0.06;

      // Primary Satin Wave
      const p1_x = width * 0.5 + Math.sin(t * 0.05) * (width * 0.08) - sShiftX;
      const p1_y = height * 0.45 + Math.cos(t * 0.04) * (height * 0.06) - sShiftY;
      const grad1 = ctx2d.createRadialGradient(p1_x, p1_y, 0, p1_x, p1_y, Math.max(width, height) * 0.9);
      grad1.addColorStop(0.0, 'rgba(184, 106, 66, 0.18)');
      grad1.addColorStop(0.3, 'rgba(146, 61, 30, 0.15)');
      grad1.addColorStop(0.65, 'rgba(69, 21, 29, 0.08)');
      grad1.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      ctx2d.fillStyle = grad1;
      ctx2d.fillRect(0, 0, width, height);

      ctx2d.restore();

      // 2D Dust Particles Pass
      if (dustParticles.length > 0) {
        ctx2d.save();
        ctx2d.globalCompositeOperation = 'source-over';
        for (let i = 0; i < dustParticles.length; i++) {
          const p = dustParticles[i];
          const r = Math.round(p.color[0] * 255);
          const g = Math.round(p.color[1] * 255);
          const b = Math.round(p.color[2] * 255);

          // Subtle micro-halo for brighter particles
          if (p.currentOpacity > 0.40) {
            ctx2d.fillStyle = `rgba(${r}, ${g}, ${b}, ${(p.currentOpacity * 0.22).toFixed(3)})`;
            ctx2d.beginPath();
            ctx2d.arc(p.x, p.y, Math.max(1.8, p.size * 1.5), 0, Math.PI * 2);
            ctx2d.fill();
          }

          // Crisp core
          ctx2d.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.currentOpacity.toFixed(3)})`;
          ctx2d.beginPath();
          ctx2d.arc(p.x, p.y, Math.max(0.6, p.size * 0.5), 0, Math.PI * 2);
          ctx2d.fill();
        }
        ctx2d.restore();
      }
    };

    // =========================================================================
    // MAIN RENDER LOOP
    // =========================================================================
    const renderFrame = (timestamp: number) => {
      if (!isVisible || prefersReducedMotion) {
        isLoopRunning = false;
        return;
      }

      const dt = Math.min(0.035, Math.max(0.001, (timestamp - lastFrameTimestamp) * 0.001));
      lastFrameTimestamp = timestamp;

      // Smooth scroll interpolation (damped spring lerp 0.042)
      scrollProgress += (targetScrollProgress - scrollProgress) * 0.042;
      scrollVelocity += (targetVelocity - scrollVelocity) * 0.08;
      targetVelocity *= 0.88; // rapid velocity damping

      const elapsed = (timestamp - startTime) * 0.001;
      const t = prefersReducedMotion ? 18.0 : elapsed;

      // Update independent luxury dust particles
      if (!prefersReducedMotion && dustParticles.length > 0) {
        const frameScale = dt * 60.0;
        for (let i = 0; i < dustParticles.length; i++) {
          const p = dustParticles[i];

          // Micro-drift organic low frequency noise
          const driftX = Math.sin(t * p.driftFreqX + p.driftPhaseX) * p.driftAmpX;
          const driftY = Math.cos(t * p.driftFreqY + p.driftPhaseY) * p.driftAmpY;

          // Subtle scroll influence (15-25% of natural movement)
          const depthFactor = p.depthLayer === 0 ? 0.08 : p.depthLayer === 1 ? 0.16 : 0.24;
          const scrollDrift = scrollVelocity * depthFactor * 0.55;

          p.x += (p.vx + driftX) * frameScale;
          p.y += (p.vy + driftY + scrollDrift) * frameScale;

          // Wrap boundaries gently with soft margin
          const pad = 24;
          if (p.y < -pad) {
            p.y = height + pad;
            p.x = Math.random() * width;
          } else if (p.y > height + pad) {
            p.y = -pad;
            p.x = Math.random() * width;
          }
          if (p.x < -pad) {
            p.x = width + pad;
          } else if (p.x > width + pad) {
            p.x = -pad;
          }

          // Individual specular light reflection cycle
          if (!p.isGlinting) {
            p.timeUntilNextGlint -= dt;
            if (p.timeUntilNextGlint <= 0) {
              p.isGlinting = true;
              p.glintProgress = 0;
              p.glintDuration = 0.9 + Math.random() * 1.5; // 0.9s - 2.4s transition
              const peak = p.depthLayer === 2 ? 0.72 + Math.random() * 0.08 : 0.55 + Math.random() * 0.20;
              p.glintPeakOpacity = Math.min(0.80, peak);
            }
          } else {
            p.glintProgress += dt / p.glintDuration;
            if (p.glintProgress >= 1.0) {
              p.isGlinting = false;
              p.currentOpacity = p.baseOpacity;
              p.timeUntilNextGlint = 1.0 + Math.random() * 4.5;
            } else {
              // Smooth light catch: Rise (0-0.42) -> Hold/Plateau (0.42-0.58) -> Soft Decay (0.58-1.0)
              let flare = 0;
              if (p.glintProgress < 0.42) {
                const norm = p.glintProgress / 0.42;
                flare = Math.sin(norm * Math.PI * 0.5);
              } else if (p.glintProgress < 0.58) {
                flare = 1.0; // soft 100-300ms specular plateau
              } else {
                const norm = (p.glintProgress - 0.58) / 0.42;
                flare = Math.cos(norm * Math.PI * 0.5);
              }
              p.currentOpacity = p.baseOpacity + (p.glintPeakOpacity - p.baseOpacity) * flare;
            }
          }
        }
      }

      if (useWebGL && gl && program) {
        // 1. Draw WebGL Procedural Satin Background
        gl.disable(gl.BLEND);
        gl.useProgram(program);
        if (positionBuffer) {
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          const posAttr = gl.getAttribLocation(program, 'a_position');
          gl.enableVertexAttribArray(posAttr);
          gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
        }

        if (uResolutionLoc) gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
        if (uTimeLoc) gl.uniform1f(uTimeLoc, t);
        if (uScrollLoc) gl.uniform1f(uScrollLoc, scrollProgress);
        if (uScrollVelLoc) gl.uniform1f(uScrollVelLoc, scrollVelocity);
        if (uDprLoc) gl.uniform1f(uDprLoc, dpr);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // 2. Draw Floating Micro-Specular Luxury Dust with Micro-Glow
        if (particleProgram && particleBuffer && dustParticles.length > 0) {
          const invW = 1.0 / Math.max(1, width);
          const invH = 1.0 / Math.max(1, height);

          for (let i = 0; i < dustParticles.length; i++) {
            const p = dustParticles[i];
            const offset = i * 7;
            particleDataArray[offset + 0] = p.x * invW;
            particleDataArray[offset + 1] = p.y * invH;
            // Point size scales by 2.2x to encompass the specular core + delicate surrounding micro-glow halo
            particleDataArray[offset + 2] = p.size * dpr * 2.2;
            particleDataArray[offset + 3] = p.color[0];
            particleDataArray[offset + 4] = p.color[1];
            particleDataArray[offset + 5] = p.color[2];
            particleDataArray[offset + 6] = p.currentOpacity;
          }

          gl.useProgram(particleProgram);
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

          gl.bindBuffer(gl.ARRAY_BUFFER, particleBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, particleDataArray, gl.DYNAMIC_DRAW);

          const stride = 7 * Float32Array.BYTES_PER_ELEMENT;
          if (pPosAttrLoc >= 0) {
            gl.enableVertexAttribArray(pPosAttrLoc);
            gl.vertexAttribPointer(pPosAttrLoc, 2, gl.FLOAT, false, stride, 0);
          }
          if (pSizeAttrLoc >= 0) {
            gl.enableVertexAttribArray(pSizeAttrLoc);
            gl.vertexAttribPointer(pSizeAttrLoc, 1, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
          }
          if (pColorAttrLoc >= 0) {
            gl.enableVertexAttribArray(pColorAttrLoc);
            gl.vertexAttribPointer(pColorAttrLoc, 4, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
          }

          gl.drawArrays(gl.POINTS, 0, dustParticles.length);
          gl.disable(gl.BLEND);
        }
      } else {
        render2DFallback(t);
      }

      if (!prefersReducedMotion && isVisible) {
        animationFrameId = requestAnimationFrame(renderFrame);
      } else {
        isLoopRunning = false;
      }
    };

    const startLoop = () => {
      if (!isLoopRunning && isVisible && !prefersReducedMotion) {
        isLoopRunning = true;
        lastFrameTimestamp = performance.now();
        animationFrameId = requestAnimationFrame(renderFrame);
      }
    };

    const stopLoop = () => {
      if (isLoopRunning) {
        isLoopRunning = false;
        cancelAnimationFrame(animationFrameId);
      }
    };

    const handleVisibility = () => {
      const wasVisible = isVisible;
      isVisible = document.visibilityState === 'visible';
      if (isVisible && !wasVisible) {
        startLoop();
      } else if (!isVisible && wasVisible) {
        stopLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    if (prefersReducedMotion) {
      // Render one single frozen high-fidelity frame
      renderFrame(startTime);
    } else {
      isLoopRunning = true;
      animationFrameId = requestAnimationFrame(renderFrame);
    }

    return () => {
      stopLoop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (gl && program) {
        gl.deleteProgram(program);
      }
      if (gl && positionBuffer) {
        gl.deleteBuffer(positionBuffer);
      }
      if (gl && particleProgram) {
        gl.deleteProgram(particleProgram);
      }
      if (gl && particleBuffer) {
        gl.deleteBuffer(particleBuffer);
      }
    };
  }, []);

  return (
    <div
      id="macro-luxury-background"
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none bg-[#240A12]"
    >
      {/* 1. Continuous WebGL Procedural Material Surface */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
        aria-hidden="true"
      />

      {/* 2. Optical Vignette for Boundary Depth (Subtly softened) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 96% 90% at 50% 48%, rgba(36, 10, 18, 0) 0%, rgba(29, 8, 15, 0.18) 65%, rgba(20, 5, 10, 0.45) 100%)',
        }}
      />
    </div>
  );
};
