// ============================================================================
// LUXURY IRIDESCENT METALLIC PARTICULATE TYPOGRAPHY ENGINE
// Authentic microscopic metallic dust physics & rendering with Smart Auto-Wrapping
// - Smart responsive wrapping and auto-fitting for mobile, tablet, and desktop
// - Microscopic round particles (0.7 - 1.4px diameter)
// - Organic sub-pixel jitter distribution (zero grid, zero dot-matrix, zero LED)
// - Iridescent luxury metallic palette: champagne, copper, rose-gold, diamond glints & subtle sheen
// - Gentle resting micro-drift (0.3 - 0.75px natural organic shimmer in state of rest)
// - Physical cursor touch: only particles physically crossed by cursor receive velocity
// - Free inertia motion -> gentle velocity decay (0.958 - 0.965)
// - Calm, linear/damped convergence back to resting target in 1.5 - 2.5 seconds (NO springs, NO bounce)
// - Generous unclipped canvas bounds with zero horizontal scroll on mobile
// - Ultra-high performance batch 2D canvas rendering with IntersectionObserver pausing
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
}

// Iridescent luxury metallic palette: champagne, copper, dusty rose-gold, diamond glints + delicate mist
const LUXURY_METALLIC_PALETTE = [
  '#F6E3D3', // 0: luminous champagne gold
  '#EBB890', // 1: warm radiant champagne
  '#DFC1A8', // 2: satin antique gold
  '#E39B72', // 3: warm rose copper
  '#D27B53', // 4: burnished terracotta copper
  '#B85F43', // 5: deep rich copper
  '#E89C90', // 6: dusty rose-gold
  '#F3CDD2', // 7: soft petal rose
  '#D97F72', // 8: deep rose copper
  '#FFF9F2', // 9: specular diamond glint
  '#FFEFEA', // 10: specular warm ivory
  '#8FD5C4', // 11: iridescent pale seafoam / emerald sheen
  '#A4BAE9', // 12: iridescent soft celestial azure
  '#D5A5E8', // 13: iridescent delicate violet mist
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
  rawText: string,
  explicitLines: string[] | undefined,
  targetFontSize: number,
  minFontSize: number,
  letterSpacing: number,
  lineHeightRatio: number,
  fontWeight: number | string,
  availableWidth: number,
  autoWrap: boolean = true
): TextLayoutResult {
  const scratch = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  const ctx = scratch ? scratch.getContext('2d') : null;

  const measureLineWidth = (str: string, size: number): number => {
    if (!ctx) return str.length * size * 0.65;
    ctx.font = `${fontWeight} ${size}px Montserrat, Inter, -apple-system, sans-serif`;
    const baseW = ctx.measureText(str).width;
    const spacingExtra = Math.max(0, (str.length - 1) * (size * letterSpacing));
    return baseW + spacingExtra;
  };

  // Keep a safe width margin so glyphs never clip or hug the screen borders
  const safeWidth = Math.max(140, availableWidth);

  const getMaxWidth = (candidateLines: string[], size: number): number => {
    let maxW = 0;
    for (const l of candidateLines) {
      const w = measureLineWidth(l, size);
      if (w > maxW) maxW = w;
    }
    return maxW;
  };

  const findOptimalFontSize = (
    candidateLines: string[],
    maxAllowedSize: number = targetFontSize
  ): { fontSize: number; maxWidth: number } => {
    const maxWAtTarget = getMaxWidth(candidateLines, maxAllowedSize);
    if (maxWAtTarget <= safeWidth) {
      return { fontSize: maxAllowedSize, maxWidth: maxWAtTarget };
    }
    const scaleRatio = safeWidth / Math.max(1, maxWAtTarget);
    const calculatedSize = Math.max(minFontSize, Math.floor(maxAllowedSize * scaleRatio));
    const finalMaxW = getMaxWidth(candidateLines, calculatedSize);
    return { fontSize: calculatedSize, maxWidth: finalMaxW };
  };

  // 1. Explicit lines provided by user
  if (explicitLines && explicitLines.length > 0) {
    const { fontSize, maxWidth } = findOptimalFontSize(explicitLines);

    // If even at minFontSize one line still overflows, split it if autoWrap is active
    if (autoWrap && maxWidth > safeWidth && fontSize <= minFontSize) {
      const brokenLines: string[] = [];
      for (const line of explicitLines) {
        const words = line.trim().split(/\s+/);
        if (words.length <= 1) {
          brokenLines.push(line);
        } else {
          let current = words[0];
          for (let i = 1; i < words.length; i++) {
            const testLine = `${current} ${words[i]}`;
            if (measureLineWidth(testLine, minFontSize) <= safeWidth) {
              current = testLine;
            } else {
              brokenLines.push(current);
              current = words[i];
            }
          }
          brokenLines.push(current);
        }
      }
      const rechecked = findOptimalFontSize(brokenLines);
      const lineHeightPx = Math.round(rechecked.fontSize * lineHeightRatio);
      return {
        lines: brokenLines,
        fontSize: rechecked.fontSize,
        lineHeightPx,
        visualWidth: Math.ceil(rechecked.maxWidth),
        visualHeight: Math.ceil(brokenLines.length * lineHeightPx),
      };
    }

    const lineHeightPx = Math.round(fontSize * lineHeightRatio);
    return {
      lines: explicitLines,
      fontSize,
      lineHeightPx,
      visualWidth: Math.ceil(maxWidth),
      visualHeight: Math.ceil(explicitLines.length * lineHeightPx),
    };
  }

  // 2. Single string input
  const normalizedText = rawText.trim();
  const words = normalizedText.split(/\s+/);

  if (words.length <= 1 || !autoWrap) {
    const { fontSize, maxWidth } = findOptimalFontSize([normalizedText]);
    const lineHeightPx = Math.round(fontSize * lineHeightRatio);
    return {
      lines: [normalizedText],
      fontSize,
      lineHeightPx,
      visualWidth: Math.ceil(maxWidth),
      visualHeight: Math.ceil(lineHeightPx),
    };
  }

  // Check if single line fits at target font size
  const singleLineWidthAtTarget = measureLineWidth(normalizedText, targetFontSize);
  if (singleLineWidthAtTarget <= safeWidth) {
    const lineHeightPx = Math.round(targetFontSize * lineHeightRatio);
    return {
      lines: [normalizedText],
      fontSize: targetFontSize,
      lineHeightPx,
      visualWidth: Math.ceil(singleLineWidthAtTarget),
      visualHeight: Math.ceil(lineHeightPx),
    };
  }

  // Single line with modest font reduction if clean & short
  const singleLineScaleRatio = safeWidth / Math.max(1, singleLineWidthAtTarget);
  const singleLineScaledSize = Math.floor(targetFontSize * singleLineScaleRatio);
  const singleLineAcceptable =
    singleLineScaledSize >= Math.max(34, Math.floor(targetFontSize * 0.72)) && words.length <= 2;

  if (singleLineAcceptable) {
    const w = measureLineWidth(normalizedText, singleLineScaledSize);
    const lineHeightPx = Math.round(singleLineScaledSize * lineHeightRatio);
    return {
      lines: [normalizedText],
      fontSize: singleLineScaledSize,
      lineHeightPx,
      visualWidth: Math.ceil(w),
      visualHeight: Math.ceil(lineHeightPx),
    };
  }

  // Smart Multi-line Partitioning
  if (words.length === 2) {
    const candidateLines = [words[0], words[1]];
    const { fontSize, maxWidth } = findOptimalFontSize(candidateLines);
    const lineHeightPx = Math.round(fontSize * lineHeightRatio);
    return {
      lines: candidateLines,
      fontSize,
      lineHeightPx,
      visualWidth: Math.ceil(maxWidth),
      visualHeight: Math.ceil(candidateLines.length * lineHeightPx),
    };
  }

  // 3+ words: evaluate balanced 2-line splits
  let best2LineSplit: string[] | null = null;
  let best2LineScore = Infinity;

  for (let splitIdx = 1; splitIdx < words.length; splitIdx++) {
    const line1 = words.slice(0, splitIdx).join(' ');
    const line2 = words.slice(splitIdx).join(' ');
    const w1 = measureLineWidth(line1, targetFontSize);
    const w2 = measureLineWidth(line2, targetFontSize);
    const diff = Math.abs(w1 - w2);
    if (diff < best2LineScore) {
      best2LineScore = diff;
      best2LineSplit = [line1, line2];
    }
  }

  if (best2LineSplit) {
    const { fontSize, maxWidth } = findOptimalFontSize(best2LineSplit);
    if (fontSize >= minFontSize + 4 || maxWidth <= safeWidth) {
      const lineHeightPx = Math.round(fontSize * lineHeightRatio);
      return {
        lines: best2LineSplit,
        fontSize,
        lineHeightPx,
        visualWidth: Math.ceil(maxWidth),
        visualHeight: Math.ceil(best2LineSplit.length * lineHeightPx),
      };
    }
  }

  // Multi-line greedy wrap
  const greedyLines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = `${currentLine} ${words[i]}`;
    if (measureLineWidth(testLine, Math.max(minFontSize, targetFontSize * 0.75)) <= safeWidth) {
      currentLine = testLine;
    } else {
      greedyLines.push(currentLine);
      currentLine = words[i];
    }
  }
  greedyLines.push(currentLine);

  const { fontSize, maxWidth } = findOptimalFontSize(greedyLines);
  const lineHeightPx = Math.round(fontSize * lineHeightRatio);
  return {
    lines: greedyLines,
    fontSize,
    lineHeightPx,
    visualWidth: Math.ceil(maxWidth),
    visualHeight: Math.ceil(greedyLines.length * lineHeightPx),
  };
}

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

  // Particle buffers
  private count: number = 0;
  private px: Float32Array = new Float32Array(0);
  private py: Float32Array = new Float32Array(0);
  private ox: Float32Array = new Float32Array(0);
  private oy: Float32Array = new Float32Array(0);
  private vx: Float32Array = new Float32Array(0);
  private vy: Float32Array = new Float32Array(0);
  private radius: Float32Array = new Float32Array(0);
  private timeSinceTouch: Float32Array = new Float32Array(0);
  private isDisturbed: Uint8Array = new Uint8Array(0);

  // Micro-drift buffers
  private phaseX: Float32Array = new Float32Array(0);
  private phaseY: Float32Array = new Float32Array(0);
  private freqX: Float32Array = new Float32Array(0);
  private freqY: Float32Array = new Float32Array(0);
  private ampX: Float32Array = new Float32Array(0);
  private ampY: Float32Array = new Float32Array(0);

  // Grouped by color index for batch rendering
  private colorGroups: number[][] = [];

  // Pointer position tracking
  private prevPointerX: number = -99999;
  private prevPointerY: number = -99999;

  private dpr: number = 1;
  public width: number = 0;
  public height: number = 0;
  public padX: number = 0;
  public padY: number = 0;
  private isReducedMotion: boolean = false;

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
    const rect = this.canvas.getBoundingClientRect();
    this.prevPointerX = e.clientX - rect.left;
    this.prevPointerY = e.clientY - rect.top;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.isReducedMotion) return;

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

    const touchRadius = 7.0;
    const touchRadiusSq = touchRadius * touchRadius;

    const segMinX = Math.min(ax, bx) - touchRadius;
    const segMaxX = Math.max(ax, bx) + touchRadius;
    const segMinY = Math.min(ay, by) - touchRadius;
    const segMaxY = Math.max(ay, by) + touchRadius;

    const speed = Math.min(segLen, 30);
    const baseForce = speed * 0.24 + 1.0;

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

    // Determine available width
    let currentAvailableWidth = this.availableWidth;
    if (currentAvailableWidth <= 0) {
      const parentEl = this.canvas.parentElement;
      if (parentEl && parentEl.clientWidth > 0) {
        currentAvailableWidth = parentEl.clientWidth;
      } else {
        currentAvailableWidth = Math.max(280, winW - (isMobile ? 32 : 64));
      }
    }

    const baseFontSize = this.options.fontSize ?? (isMobile ? 32 : 52);
    const minFontSize = this.options.minFontSize ?? (baseFontSize >= 40 ? 24 : 18);
    const fontWeight = this.options.fontWeight ?? 600;
    const letterSpacing = this.options.letterSpacing ?? 0.22;
    const lineHeightRatio = this.options.lineHeight ?? 1.22;
    const align = this.options.align ?? 'center';
    const autoWrap = this.options.autoWrap ?? true;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2.0);

    // Compute responsive layout
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

    // Safety margins: Desktop 120/80, Tablet 80/55, Mobile 45/30
    const padX = isMobile ? 45 : isTablet ? 80 : 120;
    const padY = isMobile ? 30 : isTablet ? 55 : 80;

    this.padX = padX;
    this.padY = padY;

    const totalWidth = layout.visualWidth + padX * 2;
    const totalHeight = layout.visualHeight + padY * 2;

    this.width = totalWidth;
    this.height = totalHeight;

    // Measurement canvas
    const scratch = document.createElement('canvas');
    scratch.width = totalWidth;
    scratch.height = totalHeight;
    const sCtx = scratch.getContext('2d', { willReadFrequently: true });
    if (!sCtx) return;

    const fontString = `${fontWeight} ${layout.fontSize}px Montserrat, Inter, -apple-system, sans-serif`;
    sCtx.font = fontString;
    sCtx.fillStyle = '#FFFFFF';
    sCtx.strokeStyle = '#FFFFFF';
    sCtx.lineWidth = Math.max(0.7, layout.fontSize * 0.022);
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
        sCtx.strokeText(line[i], curX, cy);
        curX += charWidths[i] + charSpacing;
      }
    });

    // Sample pixel grid
    const imgData = sCtx.getImageData(0, 0, totalWidth, totalHeight);
    const pixels = imgData.data;

    const solidPixels: Array<{ x: number; y: number; a: number }> = [];
    const edgePixels: Array<{ x: number; y: number; a: number }> = [];

    for (let y = 1; y < totalHeight - 1; y++) {
      const rowOffset = y * totalWidth;
      for (let x = 1; x < totalWidth - 1; x++) {
        const idx = (rowOffset + x) * 4;
        const a = pixels[idx + 3];

        if (a > 28) {
          const item = { x, y, a: a / 255 };
          const leftA = pixels[(rowOffset + x - 1) * 4 + 3];
          const rightA = pixels[(rowOffset + x + 1) * 4 + 3];
          const topA = pixels[((y - 1) * totalWidth + x) * 4 + 3];
          const botA = pixels[((y + 1) * totalWidth + x) * 4 + 3];

          if (leftA < 180 || rightA < 180 || topA < 180 || botA < 180) {
            edgePixels.push(item);
          } else {
            solidPixels.push(item);
          }
        }
      }
    }

    const allCandidatePixels = edgePixels.concat(solidPixels);
    if (allCandidatePixels.length === 0) return;

    // Dynamic high-density metallic dust target
    const targetParticleCount = Math.min(
      22000,
      Math.max(2800, Math.floor(allCandidatePixels.length * 0.92))
    );

    this.count = targetParticleCount;
    this.px = new Float32Array(this.count);
    this.py = new Float32Array(this.count);
    this.ox = new Float32Array(this.count);
    this.oy = new Float32Array(this.count);
    this.vx = new Float32Array(this.count);
    this.vy = new Float32Array(this.count);
    this.radius = new Float32Array(this.count);
    this.timeSinceTouch = new Float32Array(this.count);
    this.isDisturbed = new Uint8Array(this.count);

    this.phaseX = new Float32Array(this.count);
    this.phaseY = new Float32Array(this.count);
    this.freqX = new Float32Array(this.count);
    this.freqY = new Float32Array(this.count);
    this.ampX = new Float32Array(this.count);
    this.ampY = new Float32Array(this.count);

    const paletteCount = LUXURY_METALLIC_PALETTE.length;
    this.colorGroups = Array.from({ length: paletteCount }, () => []);

    const edgeRatio = edgePixels.length > 0 ? 0.36 : 0.0;
    const edgeCount = Math.floor(this.count * edgeRatio);
    const fillCount = this.count - edgeCount;

    let particleIdx = 0;

    const initDrift = (idx: number) => {
      this.phaseX[idx] = Math.random() * Math.PI * 2;
      this.phaseY[idx] = Math.random() * Math.PI * 2;
      this.freqX[idx] = 0.4 + Math.random() * 0.5;
      this.freqY[idx] = 0.4 + Math.random() * 0.5;
      this.ampX[idx] = 0.35 + Math.random() * 0.40;
      this.ampY[idx] = 0.35 + Math.random() * 0.40;
    };

    // 1. Edge contour particles
    for (let i = 0; i < edgeCount; i++) {
      const src = edgePixels[Math.floor(Math.random() * edgePixels.length)];
      const jitterX = (Math.random() - 0.5) * 0.85;
      const jitterY = (Math.random() - 0.5) * 0.85;
      const posX = src.x + jitterX;
      const posY = src.y + jitterY;

      this.ox[particleIdx] = posX;
      this.oy[particleIdx] = posY;
      this.px[particleIdx] = posX;
      this.py[particleIdx] = posY;
      this.vx[particleIdx] = 0;
      this.vy[particleIdx] = 0;
      this.timeSinceTouch[particleIdx] = 999.0;
      this.isDisturbed[particleIdx] = 0;
      initDrift(particleIdx);

      this.radius[particleIdx] = 0.36 + Math.random() * 0.30;

      const rand = Math.random();
      let cIdx = 0;
      if (rand < 0.32) cIdx = 1;      // warm champagne
      else if (rand < 0.50) cIdx = 0; // pale champagne
      else if (rand < 0.65) cIdx = 3; // soft copper
      else if (rand < 0.76) cIdx = 6; // dusty rose-gold
      else if (rand < 0.85) cIdx = 4; // radiant copper
      else if (rand < 0.92) cIdx = 9; // diamond sparkle
      else if (rand < 0.95) cIdx = 11;// iridescent seafoam
      else if (rand < 0.98) cIdx = 12;// celestial azure
      else cIdx = 13;                 // violet mist

      this.colorGroups[cIdx].push(particleIdx);
      particleIdx++;
    }

    // 2. Interior volumetric dust
    const fillPool = solidPixels.length > 0 ? solidPixels : allCandidatePixels;
    for (let i = 0; i < fillCount; i++) {
      const src = fillPool[Math.floor(Math.random() * fillPool.length)];
      const jitterX = (Math.random() - 0.5) * 0.95;
      const jitterY = (Math.random() - 0.5) * 0.95;
      const posX = src.x + jitterX;
      const posY = src.y + jitterY;

      this.ox[particleIdx] = posX;
      this.oy[particleIdx] = posY;
      this.px[particleIdx] = posX;
      this.py[particleIdx] = posY;
      this.vx[particleIdx] = 0;
      this.vy[particleIdx] = 0;
      this.timeSinceTouch[particleIdx] = 999.0;
      this.isDisturbed[particleIdx] = 0;
      initDrift(particleIdx);

      this.radius[particleIdx] = 0.35 + Math.random() * 0.35;

      const rand = Math.random();
      let cIdx = 0;
      if (rand < 0.28) cIdx = 1;      // warm champagne
      else if (rand < 0.44) cIdx = 0; // pale champagne
      else if (rand < 0.58) cIdx = 3; // copper
      else if (rand < 0.70) cIdx = 6; // dusty rose-gold
      else if (rand < 0.78) cIdx = 2; // antique champagne
      else if (rand < 0.85) cIdx = 7; // petal rose
      else if (rand < 0.90) cIdx = 8; // deep rose copper
      else if (rand < 0.94) cIdx = 9; // diamond sparkle
      else if (rand < 0.96) cIdx = 10;// specular ivory
      else if (rand < 0.98) cIdx = 11;// iridescent seafoam
      else cIdx = 12;                 // celestial azure

      this.colorGroups[cIdx].push(particleIdx);
      particleIdx++;
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

    for (let i = 0; i < this.count; i++) {
      const driftX = Math.sin(time * this.freqX[i] + this.phaseX[i]) * this.ampX[i];
      const driftY = Math.cos(time * this.freqY[i] + this.phaseY[i]) * this.ampY[i];
      const targetX = this.ox[i] + driftX;
      const targetY = this.oy[i] + driftY;

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
      vx *= 0.962;
      vy *= 0.962;

      if (t > 0.06) {
        const returnRate = Math.min(0.044, 0.024 + (t - 0.06) * 0.022);
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
    }

    return true;
  }

  public render() {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.clearRect(0, 0, this.width, this.height);

    const TAU = Math.PI * 2;

    for (let c = 0; c < LUXURY_METALLIC_PALETTE.length; c++) {
      const group = this.colorGroups[c];
      if (!group || group.length === 0) continue;

      this.ctx.fillStyle = LUXURY_METALLIC_PALETTE[c];
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

    this.ctx.restore();
  }

  public destroy() {
    this.canvas.removeEventListener('pointerenter', this.onPointerEnter);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
  }
}

// ============================================================================
// CENTRAL SINGLETON MANAGER
// ============================================================================
class ParticleTextManager {
  private instances: Set<ParticleTextInstance> = new Set();
  private observer: IntersectionObserver | null = null;
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
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const instance = Array.from(this.instances).find(
              (inst) => inst.canvas === entry.target
            );
            if (instance) {
              instance.inViewport = entry.isIntersecting;
              if (entry.isIntersecting) {
                this.wakeUp();
              }
            }
          });
        },
        { rootMargin: '100px' }
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
    this.wakeUp();
  }

  public unregister(instance: ParticleTextInstance) {
    this.instances.delete(instance);
    if (this.observer) {
      this.observer.unobserve(instance.canvas);
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
