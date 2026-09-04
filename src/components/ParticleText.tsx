import React, { useEffect, useRef, useState } from 'react';
import { ParticleTextInstance, particleTextManager, ParticleTextOptions } from '../engine/particleTextSystem';

export interface ParticleTextProps extends ParticleTextOptions {
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
  revealTriggered?: boolean;
}

export const ParticleText: React.FC<ParticleTextProps> = ({
  text,
  lines,
  fontSize,
  minFontSize,
  maxFontSize,
  fontWeight = 600,
  letterSpacing = 0.22,
  lineHeight = 1.22,
  align = 'center',
  colorTheme = 'champagne',
  particleSize,
  autoWrap = true,
  className = '',
  id,
  as = 'div',
  ariaLabel,
  isPrice,
  isHero,
  disableInteraction,
  variant,
  revealMode,
  revealDelay,
  revealTriggered,
  onAssemblyComplete,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const instanceRef = useRef<ParticleTextInstance | null>(null);

  const [visualDimensions, setVisualDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (revealTriggered && instanceRef.current) {
      instanceRef.current.triggerReveal(false);
    }
  }, [revealTriggered]);

  // Handle ResizeObserver & Available Width detection
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    let isMounted = true;

    const handleLayoutChange = (w: number, h: number) => {
      if (!isMounted) return;
      setVisualDimensions({ width: w, height: h });
    };

    const init = () => {
      if (!isMounted || !canvasRef.current || !containerRef.current) return;

      const parentEl = containerRef.current.parentElement || containerRef.current;
      const initialAvailableWidth = Math.max(160, parentEl.clientWidth || window.innerWidth - 32);

      const instance = new ParticleTextInstance(
        canvasRef.current,
        {
          text,
          lines,
          fontSize,
          minFontSize,
          maxFontSize,
          fontWeight,
          letterSpacing,
          lineHeight,
          align: align as 'left' | 'center' | 'right',
          colorTheme: colorTheme as 'champagne' | 'copper' | 'roseGold',
          particleSize,
          autoWrap,
          id,
          isPrice,
          isHero,
          disableInteraction,
          variant,
          revealMode,
          revealDelay,
          onAssemblyComplete,
        },
        handleLayoutChange
      );

      instance.availableWidth = initialAvailableWidth;
      instance.build();
      instanceRef.current = instance;
      particleTextManager.register(instance);
      setVisualDimensions({ width: instance.visualWidth, height: instance.visualHeight });
    };

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(init);
    } else {
      init();
    }

    // Set up ResizeObserver to recalculate on container resize
    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window && containerRef.current) {
      const targetObserved = containerRef.current.parentElement || containerRef.current;
      let resizeTimeout: number | null = null;

      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newWidth = Math.floor(entry.contentRect.width);
          if (newWidth > 0 && instanceRef.current) {
            if (resizeTimeout) window.clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(() => {
              if (instanceRef.current && isMounted) {
                instanceRef.current.resize(newWidth);
              }
            }, 60);
          }
        }
      });

      resizeObserver.observe(targetObserved);
    }

    return () => {
      isMounted = false;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (instanceRef.current) {
        particleTextManager.unregister(instanceRef.current);
        instanceRef.current = null;
      }
    };
  }, [
    text,
    lines ? lines.join('|') : '',
    fontSize,
    minFontSize,
    maxFontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
    align,
    colorTheme,
    particleSize,
    autoWrap,
    id,
    isPrice,
    variant,
    revealMode,
    revealDelay,
  ]);

  const accessibleText = ariaLabel || (lines ? lines.join(' ') : text);

  const alignStyles =
    align === 'left'
      ? 'items-start text-left'
      : align === 'right'
      ? 'items-end text-right'
      : 'items-center text-center';

  const containerClasses = `particle-text-container relative inline-flex flex-col select-none overflow-visible max-w-full ${alignStyles} ${className}`;

  const content = (
    <>
      {/* Screen reader text for SEO & accessibility */}
      <span className="sr-only">{accessibleText}</span>

      {/* Particle canvas with unclipped boundary */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="block shrink-0 cursor-default select-none pointer-events-auto"
      />
    </>
  );

  const inlineStyles: React.CSSProperties = {
    maxWidth: '100%',
    width: visualDimensions.width > 0 ? `${visualDimensions.width}px` : 'auto',
    height: visualDimensions.height > 0 ? `${visualDimensions.height}px` : 'auto',
  };

  if (as === 'h1') {
    return (
      <h1 ref={containerRef as React.RefObject<HTMLHeadingElement>} id={id} className={containerClasses} style={inlineStyles} aria-label={accessibleText}>
        {content}
      </h1>
    );
  }
  if (as === 'h2') {
    return (
      <h2 ref={containerRef as React.RefObject<HTMLHeadingElement>} id={id} className={containerClasses} style={inlineStyles} aria-label={accessibleText}>
        {content}
      </h2>
    );
  }
  if (as === 'h3') {
    return (
      <h3 ref={containerRef as React.RefObject<HTMLHeadingElement>} id={id} className={containerClasses} style={inlineStyles} aria-label={accessibleText}>
        {content}
      </h3>
    );
  }
  if (as === 'span') {
    return (
      <span ref={containerRef as React.RefObject<HTMLSpanElement>} id={id} className={containerClasses} style={inlineStyles} aria-label={accessibleText}>
        {content}
      </span>
    );
  }
  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} id={id} className={containerClasses} style={inlineStyles} aria-label={accessibleText}>
      {content}
    </div>
  );
};
