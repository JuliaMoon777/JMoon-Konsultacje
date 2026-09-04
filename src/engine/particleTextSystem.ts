// ============================================================================
// LUXURY FLOATING DUST TYPOGRAPHY ENGINE (SCROLL-DRIVEN REVEAL & ASSEMBLY)
// Authentic microscopic metallic dust typography built from the EXACT master material
// of the floating background dust particles:
// - Master palette: muted copper (#C8754F), soft copper/terracotta (#D98C63),
//   warm champagne (#E6B089), warm ivory (#F0CEAF), deep terracotta (#B76548), dusty rose (#DC8F85).
// - Scroll-Driven Particle Reveal & Natural Organic Assembly:
//   * Phase 0 (Dormant): Dispersed floating dust field (anisotropic, non-circular)
//   * Phase 1 (Awakening): 0–20% subtle directional bias and drift
//   * Phase 2 (Attraction): 20–60% individual curved flight arcs (smoothstep)
//   * Phase 3 (Glyph Emergence): 60–85% micro-structural particles lock first, then medium, then jewelry
//   * Phase 4 (Settling & Lock): 85–100% gentle damped overshoot settling into exact font glyphs
//   * Phase 5 (Idle): High-resolution stable text, micro-drift, and cursor interaction
// - High-Resolution Typographic Architecture:
//   * 78% micro structural particles (0.6–1.2px diameter) -> crisp typography & high contrast
//   * 18% medium luster particles (1.2–1.8px diameter) -> depth & metallic body
//   * 4% rare bright accent particles (1.8–2.6px diameter with delicate micro-halo) -> jewelry & light
// - Exact font glyph raster mask fidelity for vertical stems, horizontal bars, curves & inner counters
// ============================================================================

export interface ParticleTextOptions {
  text: string;
  lines?: string[];
  fontSize?: number;
  minFontSize?: number;
  maxFontSize?: number;
  fontWeight?: number | string;
  letterSpacing?: number;
  lineHeight?: number;
  align?: 'left' | 'center' | 'right';
  colorTheme?: 'champagne' | 'copper' | 'roseGold';
  particleSize?: number;
  autoWrap?: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
  isPrice?: boolean;
  isHero?: boolean;
  disableInteraction?: boolean;
  variant?: 'heading' | 'price' | 'subheading' | 'hero';
  revealMode?: 'scroll' | 'immediate' | 'manual' | 'dormant' | 'pageLoad';
  revealDelay?: number;
  revealTriggered?: boolean;
  onAssemblyComplete?: () => void;
}

export interface MasterDustColor {
  hex: string;
  r: number;
  g: number;
  b: number;
}

// Master Background Dust Palette (100% matched to LuxuryBackground)
export const MASTER_DUST_PALETTE: MasterDustColor[] = [
  { hex: '#C8754F', r: 200, g: 117, b: 79 },  // 0: muted copper
  { hex: '#D98C63', r: 217, g: 140, b: 99 },  // 1: soft copper / warm terracotta
  { hex: '#E6B089', r: 230, g: 176, b: 137 }, // 2: warm champagne
  { hex: '#F0CEAF', r: 240, g: 206, b: 175 }, // 3: warm ivory
  { hex: '#B76548', r: 183, g: 101, b: 72 },  // 4: deep terracotta
  { hex: '#DC8F85', r: 220, g: 143, b: 133 }, // 5: dusty rose
];

export interface TextLayoutResult {
  lines: string[];
  fontSize: number;
  lineHeightPx: number;
  visualWidth: number;
  visualHeight: number;
}

/**
 * Universal Smart Text Layout & Auto-Wrap Engine
 * Calculates optimal line breaks and balanced font sizing so text never overflows.
 */
export function computeSmartTextLayout(
  text: string,
  explicitLines?: string[],
  requestedFontSize: number = 54,
  minFontSize: number = 24,
  letterSpacingRatio: number = 0.22,
  lineHeightRatio: number = 1.22,
  fontWeight: number | string = 600,
  containerWidth: number = 1200,
  autoWrap: boolean = true
): TextLayoutResult {
  if (typeof document === 'undefined') {
    return {
      lines: explicitLines || [text],
      fontSize: requestedFontSize,
      lineHeightPx: Math.round(requestedFontSize * lineHeightRatio),
      visualWidth: 600,
      visualHeight: Math.round(requestedFontSize * lineHeightRatio),
    };
  }

  const measurer = document.createElement('canvas');
  const mCtx = measurer.getContext('2d');
  if (!mCtx) {
    return {
      lines: explicitLines || [text],
      fontSize: requestedFontSize,
      lineHeightPx: Math.round(requestedFontSize * lineHeightRatio),
      visualWidth: 600,
      visualHeight: Math.round(requestedFontSize * lineHeightRatio),
    };
  }

  const measureTextAtSize = (str: string, size: number): number => {
    mCtx.font = `${fontWeight} ${size}px Montserrat, "Playfair Display", Inter, -apple-system, sans-serif`;
    const charSpacing = size * letterSpacingRatio;
    let totalW = 0;
    for (let i = 0; i < str.length; i++) {
      totalW += mCtx.measureText(str[i]).width + (i < str.length - 1 ? charSpacing : 0);
    }
    return totalW;
  };

  const maxAllowedWidth = Math.max(260, containerWidth - 16);

  // If explicit lines were provided by the caller
  if (explicitLines && explicitLines.length > 0) {
    let fontSize = requestedFontSize;
    while (fontSize > minFontSize) {
      let longestLineW = 0;
      for (const line of explicitLines) {
        const w = measureTextAtSize(line, fontSize);
        if (w > longestLineW) longestLineW = w;
      }
      if (longestLineW <= maxAllowedWidth) break;
      fontSize -= 1;
    }

    let visualWidth = 0;
    for (const line of explicitLines) {
      const w = measureTextAtSize(line, fontSize);
      if (w > visualWidth) visualWidth = w;
    }

    const lineHeightPx = Math.round(fontSize * lineHeightRatio);
    return {
      lines: explicitLines,
      fontSize,
      lineHeightPx,
      visualWidth: Math.ceil(visualWidth),
      visualHeight: Math.ceil(explicitLines.length * lineHeightPx),
    };
  }

  const cleanText = text.trim();
  const words = cleanText.split(/\s+/);

  // Single word handling
  if (words.length <= 1) {
    let fontSize = requestedFontSize;
    while (fontSize > minFontSize) {
      const w = measureTextAtSize(cleanText, fontSize);
      if (w <= maxAllowedWidth) break;
      fontSize -= 1;
    }
    const visualWidth = measureTextAtSize(cleanText, fontSize);
    const lineHeightPx = Math.round(fontSize * lineHeightRatio);
    return {
      lines: [cleanText],
      fontSize,
      lineHeightPx,
      visualWidth: Math.ceil(visualWidth),
      visualHeight: lineHeightPx,
    };
  }

  // 1. Try single-line if autoWrap is false or text fits
  const singleLineW = measureTextAtSize(cleanText, requestedFontSize);
  if (!autoWrap || singleLineW <= maxAllowedWidth) {
    let fontSize = requestedFontSize;
    while (fontSize > minFontSize && measureTextAtSize(cleanText, fontSize) > maxAllowedWidth) {
      fontSize -= 1;
    }
    const finalW = measureTextAtSize(cleanText, fontSize);
    const lineHeightPx = Math.round(fontSize * lineHeightRatio);
    return {
      lines: [cleanText],
      fontSize,
      lineHeightPx,
      visualWidth: Math.ceil(finalW),
      visualHeight: lineHeightPx,
    };
  }

  // 2. Try balanced 2-line break
  if (words.length >= 2) {
    let bestSplitIndex = 1;
    let minDiff = Infinity;

    for (let i = 1; i < words.length; i++) {
      const line1 = words.slice(0, i).join(' ');
      const line2 = words.slice(i).join(' ');
      const w1 = measureTextAtSize(line1, requestedFontSize);
      const w2 = measureTextAtSize(line2, requestedFontSize);
      const diff = Math.abs(w1 - w2);
      if (diff < minDiff) {
        minDiff = diff;
        bestSplitIndex = i;
      }
    }

    const twoLines = [
      words.slice(0, bestSplitIndex).join(' '),
      words.slice(bestSplitIndex).join(' '),
    ];

    let fontSize = requestedFontSize;
    while (fontSize > minFontSize) {
      const w1 = measureTextAtSize(twoLines[0], fontSize);
      const w2 = measureTextAtSize(twoLines[1], fontSize);
      if (Math.max(w1, w2) <= maxAllowedWidth) break;
      fontSize -= 1;
    }

    const w1 = measureTextAtSize(twoLines[0], fontSize);
    const w2 = measureTextAtSize(twoLines[1], fontSize);
    const maxTwoLineW = Math.max(w1, w2);

    if (fontSize >= minFontSize + 4 || maxAllowedWidth < 450) {
      const lineHeightPx = Math.round(fontSize * lineHeightRatio);
      return {
        lines: twoLines,
        fontSize,
        lineHeightPx,
        visualWidth: Math.ceil(maxTwoLineW),
        visualHeight: Math.ceil(2 * lineHeightPx),
      };
    }
  }

  // 3. Greedy multi-line wrapping fallback
  let fontSize = requestedFontSize;
  let greedyLines: string[] = [];
  let maxWidth = 0;

  const tryGreedyWrap = (size: number): { lines: string[]; maxW: number } => {
    const result: string[] = [];
    let currentLine = words[0];
    let maxW = 0;

    for (let i = 1; i < words.length; i++) {
      const testLine = `${currentLine} ${words[i]}`;
      const testW = measureTextAtSize(testLine, size);
      if (testW <= maxAllowedWidth) {
        currentLine = testLine;
      } else {
        const curW = measureTextAtSize(currentLine, size);
        if (curW > maxW) maxW = curW;
        result.push(currentLine);
        currentLine = words[i];
      }
    }
    const curW = measureTextAtSize(currentLine, size);
    if (curW > maxW) maxW = curW;
    result.push(currentLine);

    return { lines: result, maxW };
  };

  while (fontSize >= minFontSize) {
    const wrap = tryGreedyWrap(fontSize);
    if (wrap.maxW <= maxAllowedWidth || fontSize === minFontSize) {
      greedyLines = wrap.lines;
      maxWidth = wrap.maxW;
      break;
    }
    fontSize -= 1;
  }

  const lineHeightPx = Math.round(fontSize * lineHeightRatio);
  return {
    lines: greedyLines,
    fontSize,
    lineHeightPx,
    visualWidth: Math.ceil(maxWidth),
    visualHeight: Math.ceil(greedyLines.length * lineHeightPx),
  };
}

// Session store to remember assembled instances across soft navigation/resizes
const ASSEMBLED_SESSION_KEYS = new Set<string>();

export class ParticleTextInstance {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D | null = null;
  public options: ParticleTextOptions;
  public inViewport: boolean = false;
  public isResting: boolean = false;

  // Layout metrics
  public availableWidth: number = 0;
  public visualWidth: number = 0;
  public visualHeight: number = 0;
  public computedLines: string[] = [];
  public computedFontSize: number = 0;

  // Master Material Particle Buffers
  private count: number = 0;
  private px: Float32Array = new Float32Array(0);
  private py: Float32Array = new Float32Array(0);
  private ox: Float32Array = new Float32Array(0);
  private oy: Float32Array = new Float32Array(0);
  private vx: Float32Array = new Float32Array(0);
  private vy: Float32Array = new Float32Array(0);
  private radius: Float32Array = new Float32Array(0);
  private depthTier: Uint8Array = new Uint8Array(0); // 0 = MICRO STRUCTURAL (FAR), 1 = MEDIUM BODY (MID), 2 = ACCENT JEWELRY (NEAR)
  private colorIdx: Uint8Array = new Uint8Array(0);
  private baseAlpha: Float32Array = new Float32Array(0);
  private currentAlpha: Float32Array = new Float32Array(0);

  // Halos for rare accent & glint particles
  private hasHalo: Uint8Array = new Uint8Array(0);
  private haloRadius: Float32Array = new Float32Array(0);
  private haloAlpha: Float32Array = new Float32Array(0);

  // Micro-shimmer buffers (calm, uncoordinated metallic reflection on jewelry accents)
  private isShimmering: Uint8Array = new Uint8Array(0);
  private shimmerPhase: Float32Array = new Float32Array(0);
  private shimmerSpeed: Float32Array = new Float32Array(0);
  private shimmerBoost: Float32Array = new Float32Array(0);

  // Micro-drift buffers (0.15–0.40px organic oscillation)
  private phaseX: Float32Array = new Float32Array(0);
  private phaseY: Float32Array = new Float32Array(0);
  private freqX: Float32Array = new Float32Array(0);
  private freqY: Float32Array = new Float32Array(0);
  private ampX: Float32Array = new Float32Array(0);
  private ampY: Float32Array = new Float32Array(0);

  // Interaction buffers
  private timeSinceTouch: Float32Array = new Float32Array(0);
  private isDisturbed: Uint8Array = new Uint8Array(0);

  // SCROLL-DRIVEN REVEAL & ASSEMBLY BUFFERS
  public assemblyState: 'DORMANT' | 'PREPARE' | 'ASSEMBLING' | 'SETTLING' | 'IDLE' = 'DORMANT';
  public hasAssembled: boolean = false;
  public revealTriggered: boolean = false;
  public assemblyProgress: number = 0; // 0 to 1
  public assemblyElapsed: number = 0;
  public assemblyDuration: number = 1.15; // seconds
  public revealDelay: number = 0; // seconds

  private initScatterX: Float32Array = new Float32Array(0);
  private initScatterY: Float32Array = new Float32Array(0);
  private scatterDist: Float32Array = new Float32Array(0);
  private perpNormX: Float32Array = new Float32Array(0);
  private perpNormY: Float32Array = new Float32Array(0);
  private particleDelay: Float32Array = new Float32Array(0);
  private arcCurvature: Float32Array = new Float32Array(0);
  private overshootAmp: Float32Array = new Float32Array(0);
  private trajNoisePhase: Float32Array = new Float32Array(0);

  // Grouped by [colorIdx][depthTier] for ultra-fast batched canvas rendering
  private batchGroups: number[][][] = [];
  private haloList: number[] = [];
  private shimmerList: number[] = [];

  // Pointer position tracking
  private prevPointerX: number = -99999;
  private prevPointerY: number = -99999;

  private dpr: number = 1;
  public width: number = 0;
  public height: number = 0;
  public padX: number = 0;
  public padY: number = 0;
  private isReducedMotion: boolean = false;
  private isPriceText: boolean = false;
  public isHeroTitle: boolean = false;

  // Layout change callback for React synchronization
  public onLayoutChange?: (width: number, height: number) => void;

  constructor(
    canvas: HTMLCanvasElement,
    options: ParticleTextOptions,
    onLayoutChange?: (w: number, h: number) => void
  ) {
    this.canvas = canvas;
    this.options = options;
    this.onLayoutChange = onLayoutChange;
    this.ctx = canvas.getContext('2d', { alpha: true });

    if (typeof window !== 'undefined' && window.matchMedia) {
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    this.bindEvents();
    this.build();
  }

  private bindEvents() {
    this.canvas.addEventListener('pointerenter', this.onPointerEnter, { passive: true });
    this.canvas.addEventListener('pointermove', this.onPointerMove, { passive: true });
    this.canvas.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
  }

  private onPointerEnter = (e: PointerEvent) => {
    if (this.isHeroTitle || this.options.disableInteraction) return;
    const rect = this.canvas.getBoundingClientRect();
    this.prevPointerX = e.clientX - rect.left;
    this.prevPointerY = e.clientY - rect.top;
  };

  public getInteractionStrength(): number {
    if (this.isHeroTitle || this.options.disableInteraction) return 0.0;
    if (this.hasAssembled || this.assemblyState === 'IDLE') return 1.0;
    if (this.assemblyProgress < 0.70) return 0.0;
    return (this.assemblyProgress - 0.70) / 0.30;
  }

  private onPointerMove = (e: PointerEvent) => {
    if (this.isReducedMotion || this.isHeroTitle || this.options.disableInteraction) return;

    const interactionStrength = this.getInteractionStrength();
    if (interactionStrength <= 0.01) return;

    const rect = this.canvas.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;

    if (this.prevPointerX === -99999) {
      this.prevPointerX = curX;
      this.prevPointerY = curY;
      return;
    }

    const ax = this.prevPointerX;
    const ay = this.prevPointerY;
    const bx = curX;
    const by = curY;

    this.prevPointerX = bx;
    this.prevPointerY = by;

    const dx = bx - ax;
    const dy = by - ay;
    const segLenSq = dx * dx + dy * dy;
    const segLen = Math.sqrt(segLenSq);

    if (segLen < 0.5) return;

    const dirX = dx / segLen;
    const dirY = dy / segLen;
    const perpX = -dirY;
    const perpY = dirX;

    const touchRadius = 8.5;
    const touchRadiusSq = touchRadius * touchRadius;

    const segMinX = Math.min(ax, bx) - touchRadius;
    const segMaxX = Math.max(ax, bx) + touchRadius;
    const segMinY = Math.min(ay, by) - touchRadius;
    const segMaxY = Math.max(ay, by) + touchRadius;

    const speed = Math.min(segLen, 28);
    const baseForce = (speed * 0.22 + 0.9) * interactionStrength;

    let touchedAny = false;

    for (let i = 0; i < this.count; i++) {
      const px = this.px[i];
      const py = this.py[i];

      if (px < segMinX || px > segMaxX || py < segMinY || py > segMaxY) {
        continue;
      }

      const apx = px - ax;
      const apy = py - ay;
      const t = Math.max(0, Math.min(1, (apx * dx + apy * dy) / segLenSq));
      const closeX = ax + t * dx;
      const closeY = ay + t * dy;

      const pdx = px - closeX;
      const pdy = py - closeY;
      const distSq = pdx * pdx + pdy * pdy;

      if (distSq < touchRadiusSq) {
        const dist = Math.sqrt(distSq);
        const touchFactor = 1 - dist / touchRadius;
        const impulse = baseForce * touchFactor;

        const cross = dirX * apy - dirY * apx;
        const side = cross >= 0 ? 1 : -1;
        const scatterAngle = (Math.random() - 0.5) * 0.65;

        const pushX = (dirX * 0.45 + perpX * side * 0.55) * impulse;
        const pushY = (dirY * 0.45 + perpY * side * 0.55) * impulse;

        const cosA = Math.cos(scatterAngle);
        const sinA = Math.sin(scatterAngle);

        this.vx[i] += pushX * cosA - pushY * sinA;
        this.vy[i] += pushX * sinA + pushY * cosA;

        this.timeSinceTouch[i] = 0.0;
        this.isDisturbed[i] = 1;
        touchedAny = true;
      }
    }

    if (touchedAny) {
      this.wakeUp();
    }
  };

  private onPointerLeave = () => {
    this.prevPointerX = -99999;
    this.prevPointerY = -99999;
  };

  public triggerReveal(immediate: boolean = false) {
    if (this.hasAssembled || this.revealTriggered) return;

    if (this.isReducedMotion || immediate) {
      this.hasAssembled = true;
      this.assemblyProgress = 1.0;
      this.assemblyState = 'IDLE';
      const key = this.options.id || this.options.text;
      if (key) ASSEMBLED_SESSION_KEYS.add(key);
      this.render();
      return;
    }

    this.revealTriggered = true;
    this.assemblyState = 'PREPARE';
    this.assemblyElapsed = 0;
    this.wakeUp();
  }

  public triggerSoftReEntry() {
    if (!this.hasAssembled) return;
    if (this.isHeroTitle) {
      this.wakeUp();
      return;
    }
    // Mild momentary shimmer ripple across accent particles on re-entry without destroying typography
    for (let s = 0; s < this.shimmerList.length; s++) {
      const i = this.shimmerList[s];
      this.shimmerPhase[i] = Math.random() * Math.PI;
    }
    this.wakeUp();
  }

  public wakeUp() {
    particleTextManager.wakeUp();
  }

  public resize(newAvailableWidth?: number) {
    if (newAvailableWidth && newAvailableWidth > 0) {
      this.availableWidth = newAvailableWidth;
    }
    this.build();
  }

  public updateOptions(newOptions: Partial<ParticleTextOptions>) {
    this.options = { ...this.options, ...newOptions };
    this.build();
  }

  public build() {
    if (typeof window === 'undefined') return;

    const winW = window.innerWidth;
    const isMobile = winW < 640;
    const isTablet = winW >= 640 && winW < 1024;

    // Determine available container width
    let currentAvailableWidth = this.availableWidth;
    if (currentAvailableWidth <= 0) {
      const parentEl = this.canvas.parentElement;
      if (parentEl && parentEl.clientWidth > 0) {
        currentAvailableWidth = parentEl.clientWidth;
      } else {
        currentAvailableWidth = Math.max(280, winW - (isMobile ? 32 : 64));
      }
    }

    const baseFontSize = this.options.fontSize ?? (isMobile ? 32 : 54);
    const minFontSize = this.options.minFontSize ?? (baseFontSize >= 40 ? 24 : 18);
    const fontWeight = this.options.fontWeight ?? 600;
    const letterSpacing = this.options.letterSpacing ?? 0.22;
    const lineHeightRatio = this.options.lineHeight ?? 1.22;
    const align = this.options.align ?? 'center';
    const autoWrap = this.options.autoWrap ?? true;

    const isPrice =
      this.options.isPrice === true ||
      this.options.variant === 'price' ||
      (typeof this.options.text === 'string' && this.options.text.includes('zł')) ||
      (baseFontSize <= 36 && /\d/.test(this.options.text));

    this.isPriceText = isPrice;

    this.isHeroTitle =
      this.options.isHero === true ||
      this.options.revealMode === 'pageLoad' ||
      this.options.variant === 'hero' ||
      (typeof this.options.text === 'string' &&
        this.options.text.trim().toUpperCase() === 'J MOON NUMEROLOGY');

    if (this.isHeroTitle || this.options.disableInteraction) {
      this.canvas.style.pointerEvents = 'none';
    }

    // Durations and timing setup
    if (this.isHeroTitle) {
      // 1.4–2.2 sec smooth organic assembly
      this.assemblyDuration = isMobile ? 1.55 : 1.75;
      this.revealDelay = 0;
    } else {
      this.assemblyDuration = isPrice ? (isMobile ? 0.58 : 0.72) : (isMobile ? 0.95 : 1.25);
      this.revealDelay = (this.options.revealDelay ?? (isPrice ? 320 : 0)) / 1000;
    }

    const sessionKey = this.options.id || this.options.text;
    const alreadyAssembled = sessionKey ? ASSEMBLED_SESSION_KEYS.has(sessionKey) : false;

    if (alreadyAssembled || this.isReducedMotion) {
      this.hasAssembled = true;
      this.assemblyProgress = 1.0;
      this.assemblyState = 'IDLE';
    } else if (this.isHeroTitle) {
      // Hero: Scattered on frame 0, initiates page load assembly immediately
      this.hasAssembled = false;
      this.revealTriggered = true;
      this.assemblyState = 'PREPARE';
      this.assemblyElapsed = 0;
      this.assemblyProgress = 0;
    } else if (this.options.revealTriggered) {
      this.hasAssembled = false;
      this.revealTriggered = true;
      this.assemblyState = 'PREPARE';
    } else if (this.options.revealMode === 'immediate') {
      this.hasAssembled = true;
      this.assemblyProgress = 1.0;
      this.assemblyState = 'IDLE';
    } else {
      this.hasAssembled = false;
      this.revealTriggered = false;
      this.assemblyState = 'DORMANT';
    }

    this.dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2.0), 3.0);

    // Compute smart typographic layout
    const layout = computeSmartTextLayout(
      this.options.text || '',
      this.options.lines,
      baseFontSize,
      minFontSize,
      letterSpacing,
      lineHeightRatio,
      fontWeight,
      currentAvailableWidth,
      autoWrap
    );

    this.computedLines = layout.lines;
    this.computedFontSize = layout.fontSize;
    this.visualWidth = layout.visualWidth;
    this.visualHeight = layout.visualHeight;

    if (this.onLayoutChange) {
      this.onLayoutChange(layout.visualWidth, layout.visualHeight);
    }

    // Safety margins (generous padding for organic curved trajectories and scatter field)
    const padX = isMobile ? (isPrice ? 45 : 70) : (isPrice ? 65 : 120);
    const padY = isMobile ? (isPrice ? 35 : 55) : (isPrice ? 50 : 85);

    this.padX = padX;
    this.padY = padY;

    const totalWidth = layout.visualWidth + padX * 2;
    const totalHeight = layout.visualHeight + padY * 2;

    this.width = totalWidth;
    this.height = totalHeight;

    // Measurement & Mask Scratch Canvas
    const scratch = document.createElement('canvas');
    scratch.width = totalWidth;
    scratch.height = totalHeight;
    const sCtx = scratch.getContext('2d', { willReadFrequently: true });
    if (!sCtx) return;

    const fontString = `${fontWeight} ${layout.fontSize}px Montserrat, "Playfair Display", Inter, -apple-system, sans-serif`;
    sCtx.font = fontString;
    sCtx.fillStyle = '#FFFFFF';
    sCtx.textBaseline = 'middle';

    const charSpacing = layout.fontSize * letterSpacing;

    layout.lines.forEach((line, lineIndex) => {
      const cy = padY + (lineIndex + 0.5) * layout.lineHeightPx;

      let lineTotalW = 0;
      const charWidths: number[] = [];
      for (let i = 0; i < line.length; i++) {
        const cw = sCtx.measureText(line[i]).width;
        charWidths.push(cw);
        lineTotalW += cw + (i < line.length - 1 ? charSpacing : 0);
      }

      let startX = padX;
      if (align === 'center') {
        startX = padX + (layout.visualWidth - lineTotalW) / 2;
      } else if (align === 'right') {
        startX = padX + (layout.visualWidth - lineTotalW);
      }

      let curX = startX;
      for (let i = 0; i < line.length; i++) {
        sCtx.fillText(line[i], curX, cy);
        curX += charWidths[i] + charSpacing;
      }
    });

    // Extract exact pixel mask data
    const imgData = sCtx.getImageData(0, 0, totalWidth, totalHeight);
    const pixels = imgData.data;

    // HIGH-RESOLUTION ADAPTIVE SAMPLING
    const step = isPrice
      ? 0.58 // Ultra-high density for prices
      : (isMobile ? 1.20 : 1.38);

    const sampledPoints: Array<{ x: number; y: number; isEdge: boolean }> = [];

    // Scan bounding area
    const startX = Math.max(1, Math.floor(padX - 8));
    const endX = Math.min(totalWidth - 2, Math.ceil(padX + layout.visualWidth + 8));
    const startY = Math.max(1, Math.floor(padY - 8));
    const endY = Math.min(totalHeight - 2, Math.ceil(padY + layout.visualHeight + 8));

    for (let gy = startY; gy <= endY; gy += step) {
      const yInt = Math.floor(gy);
      const rowOffset = yInt * totalWidth;

      for (let gx = startX; gx <= endX; gx += step) {
        const xInt = Math.floor(gx);
        const idx = (rowOffset + xInt) * 4;
        const a = pixels[idx + 3];

        if (a > 25) {
          const checkDist = Math.max(1, Math.round(step * 1.15));
          const leftA = pixels[(rowOffset + Math.max(0, xInt - checkDist)) * 4 + 3] || 0;
          const rightA = pixels[(rowOffset + Math.min(totalWidth - 1, xInt + checkDist)) * 4 + 3] || 0;
          const topA = pixels[(Math.max(0, yInt - checkDist) * totalWidth + xInt) * 4 + 3] || 0;
          const botA = pixels[(Math.min(totalHeight - 1, yInt + checkDist) * totalWidth + xInt) * 4 + 3] || 0;

          const isEdge = leftA < 130 || rightA < 130 || topA < 130 || botA < 130;

          if (isPrice) {
            // Price: Ultra-fine precision sampling
            sampledPoints.push({
              x: gx + (Math.random() - 0.5) * 0.12,
              y: gy + (Math.random() - 0.5) * 0.12,
              isEdge,
            });
          } else {
            const jitterScale = isEdge ? 0.28 : 0.48;
            const jx = (Math.random() - 0.5) * step * jitterScale;
            const jy = (Math.random() - 0.5) * step * jitterScale;

            sampledPoints.push({
              x: gx + jx,
              y: gy + jy,
              isEdge,
            });
          }
        }
      }
    }

    if (sampledPoints.length === 0) return;

    this.count = sampledPoints.length;
    this.px = new Float32Array(this.count);
    this.py = new Float32Array(this.count);
    this.ox = new Float32Array(this.count);
    this.oy = new Float32Array(this.count);
    this.vx = new Float32Array(this.count);
    this.vy = new Float32Array(this.count);
    this.radius = new Float32Array(this.count);
    this.depthTier = new Uint8Array(this.count);
    this.colorIdx = new Uint8Array(this.count);
    this.baseAlpha = new Float32Array(this.count);
    this.currentAlpha = new Float32Array(this.count);

    this.hasHalo = new Uint8Array(this.count);
    this.haloRadius = new Float32Array(this.count);
    this.haloAlpha = new Float32Array(this.count);

    this.isShimmering = new Uint8Array(this.count);
    this.shimmerPhase = new Float32Array(this.count);
    this.shimmerSpeed = new Float32Array(this.count);
    this.shimmerBoost = new Float32Array(this.count);

    this.phaseX = new Float32Array(this.count);
    this.phaseY = new Float32Array(this.count);
    this.freqX = new Float32Array(this.count);
    this.freqY = new Float32Array(this.count);
    this.ampX = new Float32Array(this.count);
    this.ampY = new Float32Array(this.count);

    this.timeSinceTouch = new Float32Array(this.count);
    this.isDisturbed = new Uint8Array(this.count);

    // Assembly trajectory buffers
    this.initScatterX = new Float32Array(this.count);
    this.initScatterY = new Float32Array(this.count);
    this.scatterDist = new Float32Array(this.count);
    this.perpNormX = new Float32Array(this.count);
    this.perpNormY = new Float32Array(this.count);
    this.particleDelay = new Float32Array(this.count);
    this.arcCurvature = new Float32Array(this.count);
    this.overshootAmp = new Float32Array(this.count);
    this.trajNoisePhase = new Float32Array(this.count);

    this.batchGroups = Array.from({ length: 6 }, () =>
      Array.from({ length: 3 }, () => [])
    );
    this.haloList = [];
    this.shimmerList = [];

    const centerX = padX + layout.visualWidth * 0.5;
    const centerY = padY + layout.visualHeight * 0.5;

    const microThreshold = isPrice ? 0.88 : 0.78;
    const midThreshold = isPrice ? 0.975 : 0.96;

    for (let i = 0; i < this.count; i++) {
      const pt = sampledPoints[i];
      this.ox[i] = pt.x;
      this.oy[i] = pt.y;
      this.vx[i] = 0;
      this.vy[i] = 0;
      this.timeSinceTouch[i] = 999.0;
      this.isDisturbed[i] = 0;

      // Micro-drift setup
      this.phaseX[i] = Math.random() * Math.PI * 2;
      this.phaseY[i] = Math.random() * Math.PI * 2;
      if (this.isHeroTitle) {
        this.freqX[i] = 0.16 + Math.random() * 0.18;
        this.freqY[i] = 0.14 + Math.random() * 0.16;
      } else {
        this.freqX[i] = 0.30 + Math.random() * 0.40;
        this.freqY[i] = 0.25 + Math.random() * 0.35;
      }

      const rTier = Math.random();
      let tier = 0; // 0 = MICRO STRUCTURAL, 1 = MEDIUM BODY, 2 = ACCENT JEWELRY
      let rad = 0.35;
      let alpha = 0.75;
      let cIdx = 0;

      if (rTier < microThreshold) {
        tier = 0;
        rad = isPrice ? 0.23 + Math.random() * 0.22 : 0.32 + Math.random() * 0.28;
        alpha = isPrice ? 0.88 + Math.random() * 0.08 : 0.70 + Math.random() * 0.14;
        const cRand = Math.random();
        if (cRand < 0.42) cIdx = 2;
        else if (cRand < 0.72) cIdx = 1;
        else if (cRand < 0.88) cIdx = 0;
        else cIdx = 3;
      } else if (rTier < midThreshold) {
        tier = 1;
        rad = isPrice ? 0.46 + Math.random() * 0.24 : 0.60 + Math.random() * 0.30;
        alpha = isPrice ? 0.92 + Math.random() * 0.06 : 0.82 + Math.random() * 0.12;
        const cRand = Math.random();
        if (cRand < 0.50) cIdx = 2;
        else if (cRand < 0.80) cIdx = 1;
        else if (cRand < 0.92) cIdx = 3;
        else cIdx = 0;
      } else {
        tier = 2;
        rad = isPrice ? 0.75 + Math.random() * 0.32 : 0.90 + Math.random() * 0.38;
        alpha = isPrice ? 0.94 + Math.random() * 0.05 : 0.88 + Math.random() * 0.10;
        const cRand = Math.random();
        if (cRand < 0.65) cIdx = 2;
        else if (cRand < 0.90) cIdx = 3;
        else cIdx = 1;

        this.hasHalo[i] = 1;
        this.haloRadius[i] = rad * (isPrice ? 1.8 : 2.2);
        this.haloAlpha[i] = isPrice ? 0.15 + Math.random() * 0.08 : 0.18 + Math.random() * 0.10;
        this.haloList.push(i);
        this.isShimmering[i] = Math.random() < 0.60 ? 1 : 0;
      }

      if (this.isHeroTitle) {
        if (tier === 0) {
          // structural: 0.1–0.3px
          this.ampX[i] = 0.10 + Math.random() * 0.16;
          this.ampY[i] = 0.10 + Math.random() * 0.16;
        } else if (tier === 1) {
          // medium: 0.2–0.5px
          this.ampX[i] = 0.22 + Math.random() * 0.22;
          this.ampY[i] = 0.22 + Math.random() * 0.22;
        } else {
          // rare specular: 0.5–0.8px
          this.ampX[i] = 0.48 + Math.random() * 0.26;
          this.ampY[i] = 0.48 + Math.random() * 0.26;
        }
      } else {
        this.ampX[i] = isPrice ? 0.08 + Math.random() * 0.08 : 0.15 + Math.random() * 0.22;
        this.ampY[i] = isPrice ? 0.08 + Math.random() * 0.08 : 0.15 + Math.random() * 0.22;
      }

      this.depthTier[i] = tier;
      this.radius[i] = rad;
      this.colorIdx[i] = cIdx;
      this.baseAlpha[i] = alpha;
      this.currentAlpha[i] = alpha;

      if (this.isShimmering[i] === 1) {
        this.shimmerPhase[i] = Math.random() * Math.PI * 2;
        this.shimmerSpeed[i] = 0.80 + Math.random() * 1.4;
        this.shimmerBoost[i] = 0.15 + Math.random() * 0.20;
        this.shimmerList.push(i);
      }

      this.batchGroups[cIdx][tier].push(i);

      // =======================================================================
      // ORGANIC ASYMMETRIC SCATTER FIELD & TRAJECTORY GENERATION
      // Desktop: 40–180px (Price: 25–70px) | Mobile: 25–90px (Price: 18–50px)
      // Asymmetric dispersed matter (non-circular, non-uniform, natural floating)
      // =======================================================================
      const angleBase = Math.atan2(pt.y - centerY, pt.x - centerX);
      const angleVariation = (Math.sin(i * 0.41) + Math.cos(i * 0.67)) * 0.82;
      const angle = angleBase + angleVariation + (Math.random() - 0.5) * 0.95;

      let minDist = isPrice ? (isMobile ? 18 : 25) : (isMobile ? 25 : 40);
      let maxDist = isPrice ? (isMobile ? 50 : 70) : (isMobile ? 90 : 180);

      if (this.isHeroTitle) {
        minDist = isMobile ? 18 : 35;
        maxDist = isMobile ? 65 : 140;
      }

      const distRand = Math.pow(Math.random(), 0.72);
      const dist = minDist + distRand * (maxDist - minDist);

      const scX = Math.cos(angle) * dist * 1.15;
      const scY = Math.sin(angle) * dist * 0.85;

      this.initScatterX[i] = scX;
      this.initScatterY[i] = scY;
      this.scatterDist[i] = Math.sqrt(scX * scX + scY * scY);

      const normLen = Math.max(1, this.scatterDist[i]);
      this.perpNormX[i] = -scY / normLen;
      this.perpNormY[i] = scX / normLen;

      const sign = Math.random() < 0.5 ? 1 : -1;
      if (this.isHeroTitle) {
        if (tier === 0) {
          // Micro structural: arrives first, disciplined contour forming strokes
          this.arcCurvature[i] = sign * (0.09 + Math.random() * 0.14);
          this.particleDelay[i] = Math.random() * 0.12; // 0–120ms
          this.overshootAmp[i] = 0.02 + Math.random() * 0.04; // essentially no overshoot
        } else if (tier === 1) {
          // Medium body: arrives second, adds density and texture
          this.arcCurvature[i] = sign * (0.24 + Math.random() * 0.22);
          this.particleDelay[i] = 0.20 + Math.random() * 0.22; // 200–420ms
          this.overshootAmp[i] = 0.20 + Math.random() * 0.22; // subtle ~0.3px overshoot
        } else {
          // Accent jewelry: arrives last with jewelry highlights
          this.arcCurvature[i] = sign * (0.38 + Math.random() * 0.26);
          this.particleDelay[i] = 0.45 + Math.random() * 0.25; // 450–700ms
          this.overshootAmp[i] = 0.45 + Math.random() * 0.38; // max ~0.8px overshoot
        }
      } else {
        if (tier === 0) {
          // Micro structural: arrives first, disciplined contour
          this.arcCurvature[i] = sign * (0.12 + Math.random() * 0.18);
          this.particleDelay[i] = Math.random() * 0.12; // 0–120ms
          this.overshootAmp[i] = isPrice ? 0.02 : 0.08 + Math.random() * 0.08;
        } else if (tier === 1) {
          // Medium body: arrives second, graceful arc
          this.arcCurvature[i] = sign * (0.30 + Math.random() * 0.28);
          this.particleDelay[i] = 0.05 + Math.random() * 0.17; // 50–220ms
          this.overshootAmp[i] = isPrice ? 0.15 : 0.32 + Math.random() * 0.30;
        } else {
          // Accent jewelry: arrives last, beautiful sweeping arc and light reflection
          this.arcCurvature[i] = sign * (0.50 + Math.random() * 0.38);
          this.particleDelay[i] = 0.12 + Math.random() * 0.23; // 120–350ms
          this.overshootAmp[i] = isPrice ? 0.28 : 0.65 + Math.random() * 0.60;
        }
      }

      this.trajNoisePhase[i] = Math.random() * Math.PI * 2;

      // Initial positions
      if (this.hasAssembled) {
        this.px[i] = pt.x;
        this.py[i] = pt.y;
      } else {
        this.px[i] = pt.x + scX;
        this.py[i] = pt.y + scY;
      }
    }

    // Canvas styling
    this.canvas.width = Math.round(totalWidth * this.dpr);
    this.canvas.height = Math.round(totalHeight * this.dpr);
    this.canvas.style.width = `${totalWidth}px`;
    this.canvas.style.height = `${totalHeight}px`;
    this.canvas.style.marginLeft = `-${padX}px`;
    this.canvas.style.marginRight = `-${padX}px`;
    this.canvas.style.marginTop = `-${padY}px`;
    this.canvas.style.marginBottom = `-${padY}px`;

    this.render();
  }

  public update(dt: number, time: number): boolean {
    if (this.isReducedMotion) return false;

    // =========================================================================
    // 1. SCROLL-DRIVEN REVEAL & ASSEMBLY STATE MACHINE
    // DORMANT -> PREPARE -> ASSEMBLING -> SETTLING -> IDLE
    // =========================================================================
    if (this.revealTriggered && !this.hasAssembled) {
      this.assemblyElapsed += dt;

      if (this.assemblyElapsed >= this.revealDelay) {
        const activeElapsed = this.assemblyElapsed - this.revealDelay;
        const rawProgress = activeElapsed / Math.max(0.001, this.assemblyDuration);
        this.assemblyProgress = Math.min(1.0, rawProgress);

        if (rawProgress < 0.20) {
          this.assemblyState = 'PREPARE';
        } else if (rawProgress < 0.85) {
          this.assemblyState = 'ASSEMBLING';
        } else if (rawProgress < 1.35) {
          this.assemblyState = 'SETTLING';
        } else {
          this.assemblyState = 'IDLE';
          this.hasAssembled = true;
          const sessionKey = this.options.id || this.options.text;
          if (sessionKey) ASSEMBLED_SESSION_KEYS.add(sessionKey);
          if (this.options.onAssemblyComplete) {
            this.options.onAssemblyComplete();
          }
        }
      }
    }

    // Update shimmering particles opacity
    for (let s = 0; s < this.shimmerList.length; s++) {
      const i = this.shimmerList[s];
      const wave = Math.sin(time * this.shimmerSpeed[i] + this.shimmerPhase[i]);
      if (wave > 0.25) {
        const factor = Math.pow((wave - 0.25) / 0.75, 2.0);
        this.currentAlpha[i] = Math.min(0.98, this.baseAlpha[i] + factor * this.shimmerBoost[i]);
      } else {
        this.currentAlpha[i] = this.baseAlpha[i];
      }
    }

    const isDormant = this.assemblyState === 'DORMANT';
    const isPrepare = this.assemblyState === 'PREPARE';
    const isFullyAssembled = this.hasAssembled || this.assemblyState === 'IDLE';
    const activeElapsed = Math.max(0, this.assemblyElapsed - this.revealDelay);

    for (let i = 0; i < this.count; i++) {
      const driftX = Math.sin(time * this.freqX[i] + this.phaseX[i]) * this.ampX[i];
      const driftY = Math.cos(time * this.freqY[i] + this.phaseY[i]) * this.ampY[i];
      const targetX = this.ox[i] + driftX;
      const targetY = this.oy[i] + driftY;

      // =======================================================================
      // FINAL / IDLE STATE (EXACT APPROVED INTERACTION & IDLE PHYSICS)
      // =======================================================================
      if (isFullyAssembled) {
        if (this.isDisturbed[i] === 0) {
          this.px[i] = targetX;
          this.py[i] = targetY;
          continue;
        }

        this.timeSinceTouch[i] += dt;
        const t = this.timeSinceTouch[i];

        let px = this.px[i];
        let py = this.py[i];
        let vx = this.vx[i];
        let vy = this.vy[i];

        px += vx;
        py += vy;
        vx *= 0.960;
        vy *= 0.960;

        if (t > 0.05) {
          const returnRate = Math.min(0.046, 0.025 + (t - 0.05) * 0.022);
          px += (targetX - px) * returnRate;
          py += (targetY - py) * returnRate;
        }

        const distSq = (px - targetX) * (px - targetX) + (py - targetY) * (py - targetY);
        const velSq = vx * vx + vy * vy;

        if (distSq < 0.16 && velSq < 0.008) {
          px = targetX;
          py = targetY;
          vx = 0;
          vy = 0;
          this.isDisturbed[i] = 0;
        }

        this.px[i] = px;
        this.py[i] = py;
        this.vx[i] = vx;
        this.vy[i] = vy;
        continue;
      }

      // =======================================================================
      // PHASE 0: DORMANT (ATMOSPHERIC FLOATING DUST IN ROOM)
      // =======================================================================
      if (isDormant) {
        this.px[i] = this.ox[i] + this.initScatterX[i] + driftX * 1.5;
        this.py[i] = this.oy[i] + this.initScatterY[i] + driftY * 1.5;
        this.currentAlpha[i] = this.baseAlpha[i] * 0.48;
        continue;
      }

      // =======================================================================
      // PHASE 1: PREPARE / AWAKENING (0–20% OF ASSEMBLY PROGRESS)
      // =======================================================================
      if (isPrepare) {
        const prepProgress = Math.min(1.0, activeElapsed / (this.assemblyDuration * 0.20));
        const bias = prepProgress * 0.14;
        const scX = this.initScatterX[i] * (1 - bias);
        const scY = this.initScatterY[i] * (1 - bias);
        this.px[i] = this.ox[i] + scX + driftX * (1.5 - bias * 0.5);
        this.py[i] = this.oy[i] + scY + driftY * (1.5 - bias * 0.5);
        this.currentAlpha[i] = this.baseAlpha[i] * (0.48 + prepProgress * 0.14);
        continue;
      }

      // =======================================================================
      // PHASE 2, 3 & 4: ATTRACTION -> GLYPH EMERGENCE -> SETTLE (20–100%+)
      // =======================================================================
      const effectiveTravelDuration = this.assemblyDuration * 0.82;
      const pRaw = (activeElapsed - this.particleDelay[i]) / Math.max(0.001, effectiveTravelDuration);
      const p = Math.max(0, Math.min(1.0, pRaw));

      // Natural physical ease (Hermite smoothstep)
      const ease = p * p * (3 - 2 * p);

      const startX = this.ox[i] + this.initScatterX[i];
      const startY = this.oy[i] + this.initScatterY[i];
      let cx = (1 - ease) * startX + ease * this.ox[i];
      let cy = (1 - ease) * startY + ease * this.oy[i];

      // Soft organic curved arc path
      const arcEnvelope = Math.sin(p * Math.PI);
      const arcOffset = arcEnvelope * this.arcCurvature[i] * this.scatterDist[i] * 0.36;
      cx += this.perpNormX[i] * arcOffset;
      cy += this.perpNormY[i] * arcOffset;

      // Trajectory micro-noise modulation
      const noiseEnvelope = arcEnvelope * (1 - p * 0.4);
      const noise = Math.sin(p * 5.2 + this.trajNoisePhase[i]) * 1.8 * noiseEnvelope;
      cx += this.perpNormX[i] * noise;
      cy += this.perpNormY[i] * noise;

      // Gentle settling overshoot (Phase 4: 85–100%+)
      if (pRaw > 1.0) {
        const overshootP = Math.min(1.0, (pRaw - 1.0) / 0.35);
        const decay = Math.exp(-overshootP * 4.5) * Math.sin(overshootP * Math.PI * 1.5);
        cx += decay * this.overshootAmp[i] * (this.initScatterX[i] > 0 ? -1 : 1);
        cy += decay * this.overshootAmp[i] * (this.initScatterY[i] > 0 ? -1 : 1);
      }

      // Micro-drift blend upon locking
      cx += driftX * ease;
      cy += driftY * ease;

      this.px[i] = cx;
      this.py[i] = cy;

      // Specular light reflection glint boost during arrival (Tier 1 & Tier 2)
      if (p > 0.60 && p < 0.98 && this.depthTier[i] >= 1) {
        const glintWave = Math.sin((p - 0.60) / 0.38 * Math.PI);
        const boost = this.depthTier[i] === 2 ? 0.28 : 0.14;
        this.currentAlpha[i] = Math.min(0.98, this.baseAlpha[i] + glintWave * boost);
      } else {
        this.currentAlpha[i] = this.baseAlpha[i] * (0.62 + ease * 0.38);
      }
    }

    return true;
  }

  public render() {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.clearRect(0, 0, this.width, this.height);

    const TAU = Math.PI * 2;

    // =========================================================================
    // PASS 1: Soft Micro-Glow Halo for Rare Accent Particles
    // =========================================================================
    if (this.haloList.length > 0) {
      for (let h = 0; h < this.haloList.length; h++) {
        const i = this.haloList[h];
        const color = MASTER_DUST_PALETTE[this.colorIdx[i]];
        const x = this.px[i];
        const y = this.py[i];
        const hr = this.haloRadius[i];
        const hAlpha = this.haloAlpha[i] * (this.hasAssembled ? 1.0 : (this.assemblyState === 'DORMANT' ? 0.45 : 0.75));

        this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${hAlpha})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, hr, 0, TAU);
        this.ctx.fill();
      }
    }

    // =========================================================================
    // PASS 2: Batched Metallic Particulate Cores
    // Tier 0 (MICRO STRUCTURAL) -> Tier 1 (MEDIUM BODY) -> Tier 2 (ACCENT JEWELRY)
    // =========================================================================
    const tierAlphas = this.isPriceText ? [0.82, 0.90, 0.96] : [0.62, 0.80, 0.94];

    for (let tier = 0; tier < 3; tier++) {
      const alphaMultiplier = this.hasAssembled ? 1.0 : (this.assemblyState === 'DORMANT' ? 0.55 : 0.85);
      const alpha = tierAlphas[tier] * alphaMultiplier;

      for (let c = 0; c < 6; c++) {
        const group = this.batchGroups[c][tier];
        if (!group || group.length === 0) continue;

        const color = MASTER_DUST_PALETTE[c];
        this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        this.ctx.beginPath();

        for (let k = 0; k < group.length; k++) {
          const i = group[k];
          const x = this.px[i];
          const y = this.py[i];
          const r = this.radius[i];

          this.ctx.moveTo(x + r, y);
          this.ctx.arc(x, y, r, 0, TAU);
        }

        this.ctx.fill();
      }
    }

    // =========================================================================
    // PASS 3: Dynamic Micro-Shimmer Specular Highlights
    // =========================================================================
    for (let s = 0; s < this.shimmerList.length; s++) {
      const i = this.shimmerList[s];
      const curA = this.currentAlpha[i];
      const baseA = this.baseAlpha[i];

      if (curA > baseA + 0.04) {
        const boostAlpha = (curA - baseA) * 1.15;
        // Warm ivory / champagne specular glint
        this.ctx.fillStyle = `rgba(240, 206, 175, ${Math.min(0.96, boostAlpha)})`;
        this.ctx.beginPath();
        this.ctx.arc(this.px[i], this.py[i], this.radius[i] * 1.08, 0, TAU);
        this.ctx.fill();
      }
    }

    this.ctx.restore();
  }

  public destroy() {
    this.canvas.removeEventListener('pointerenter', this.onPointerEnter);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
  }
}

// ============================================================================
// CENTRAL SINGLETON MANAGER (VIEWPORT & SCROLL REVEAL OBSERVERS)
// ============================================================================
class ParticleTextManager {
  private instances: Set<ParticleTextInstance> = new Set();
  private observer: IntersectionObserver | null = null;
  private revealObserver: IntersectionObserver | null = null;
  private rafId: number | null = null;
  private isRunning: boolean = false;
  private isVisible: boolean = true;
  private lastTime: number = 0;
  private startTime: number = 0;

  constructor() {
    if (typeof window === 'undefined') return;

    this.startTime = performance.now();
    this.initObserver();
    this.initVisibility();
    this.initResize();
  }

  private initObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      // 1. Viewport loop observer: wakes up rAF when any instance is near viewport
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const instance = Array.from(this.instances).find(
              (inst) => inst.canvas === entry.target
            );
            if (instance) {
              const wasInViewport = instance.inViewport;
              instance.inViewport = entry.isIntersecting;
              if (entry.isIntersecting) {
                if (!wasInViewport && instance.hasAssembled) {
                  instance.triggerSoftReEntry();
                }
                this.wakeUp();
              }
            }
          });
        },
        { rootMargin: '120px' }
      );

      // 2. Scroll Reveal Trigger Observer: starts assembly when approaching ~75–85% of viewport height
      this.revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const instance = Array.from(this.instances).find(
                (inst) => inst.canvas === entry.target
              );
              if (instance) {
                instance.triggerReveal();
              }
            }
          });
        },
        { rootMargin: '0px 0px -16% 0px' }
      );
    }
  }

  private initVisibility() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible) {
        this.wakeUp();
      } else {
        this.stop();
      }
    });
  }

  private initResize() {
    if (typeof window === 'undefined') return;

    let resizeTimer: number | null = null;
    window.addEventListener(
      'resize',
      () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          this.instances.forEach((inst) => inst.build());
        }, 100);
      },
      { passive: true }
    );
  }

  public register(instance: ParticleTextInstance) {
    this.instances.add(instance);
    if (this.observer) {
      this.observer.observe(instance.canvas);
    }
    if (this.revealObserver && !instance.hasAssembled) {
      this.revealObserver.observe(instance.canvas);
    }

    // Check if element is already within viewport on mount (e.g. Hero at top of page)
    if (typeof window !== 'undefined') {
      const rect = instance.canvas.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
        instance.triggerReveal();
      }
    }

    this.wakeUp();
  }

  public unregister(instance: ParticleTextInstance) {
    this.instances.delete(instance);
    if (this.observer) {
      this.observer.unobserve(instance.canvas);
    }
    if (this.revealObserver) {
      this.revealObserver.unobserve(instance.canvas);
    }
    instance.destroy();
  }

  public wakeUp() {
    if (this.isRunning || !this.isVisible) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  private stop() {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning || !this.isVisible) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.035);
    this.lastTime = currentTime;
    const timeSec = (currentTime - this.startTime) / 1000;

    let anyInViewport = false;

    this.instances.forEach((instance) => {
      if (instance.inViewport) {
        anyInViewport = true;
        instance.update(dt, timeSec);
        instance.render();
      }
    });

    if (anyInViewport) {
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      this.stop();
    }
  };
}

export const particleTextManager = new ParticleTextManager();
