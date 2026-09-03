import React from 'react';
import { CardIllustration, IllustrationType } from './CardIllustration';

interface ServiceCardData {
  id: string;
  targetId: string;
  title: string;
  price: string;
  type: IllustrationType;
  staggerIndex: number;
  desktopClipId: string;
  mobileClipId: string;
  desktopPath: string;
  mobilePath: string;
}

// =============================================================================
// PIXEL-PERFECT SHARED PUZZLE GEOMETRY (KEY + LOCK ARCHITECTURE)
//
// 1. NO DOM OVERLAP: Cards sit side-by-side in standard layout flow.
// 2. TRUE PUZZLE CONTOUR:
//    - Card 1 right edge = Convex protrusion (+2.0% outward tab between Y=28% and Y=72%)
//    - Card 2 left edge  = Exact Matching Concave socket (+2.0% inward notch between Y=28% and Y=72%)
//    - Card 2 right edge = Convex protrusion (+2.0% outward tab between Y=28% and Y=72%)
//    - Card 3 left edge  = Exact Matching Concave socket (+2.0% inward notch between Y=28% and Y=72%)
// 3. UNIFORM PARALLEL SEAM:
//    Because the concave notch on Card N+1 exactly tracks the convex tab of Card N,
//    the distance between adjacent card boundaries is 100% constant across the entire curved joint!
// 4. VERTICAL ON MOBILE:
//    - Card 1 bottom = Convex tab
//    - Card 2 top = Matching Concave socket, bottom = Convex tab
//    - Card 3 top = Matching Concave socket, bottom = straight
// =============================================================================

const SERVICES: ServiceCardData[] = [
  {
    id: 'service-twoja-rutyna',
    targetId: 'twoja-rutyna',
    title: 'TWOJA RUTYNA',
    price: '130 zł',
    type: 'routine',
    staggerIndex: 0,
    desktopClipId: 'clip-card-left-dt',
    mobileClipId: 'clip-card-top-mb',
    desktopPath:
      'M 0.5,3.5 Q 0.5,0.5 3.5,0.5 L 94.5,0.5 Q 97.5,0.5 97.5,3.5 L 97.5,28 C 97.5,34 98.3,38 99.0,43 C 99.5,46.5 99.5,53.5 99.0,57 C 98.3,62 97.5,66 97.5,72 L 97.5,96.5 Q 97.5,99.5 94.5,99.5 L 3.5,99.5 Q 0.5,99.5 0.5,96.5 Z',
    mobilePath:
      'M 0.5,3.5 Q 0.5,0.5 3.5,0.5 L 96.5,0.5 Q 99.5,0.5 99.5,3.5 L 99.5,94.5 Q 99.5,97.5 96.5,97.5 L 72,97.5 C 66,97.5 62,98.3 57,99.0 C 53.5,99.5 46.5,99.5 43,99.0 C 38,98.3 34,97.5 28,97.5 L 3.5,97.5 Q 0.5,97.5 0.5,94.5 Z',
  },
  {
    id: 'service-prognoza-miesiaca',
    targetId: 'prognoza-miesiaca',
    title: 'PROGNOZA MIESIĄCA',
    price: '170 zł',
    type: 'forecast',
    staggerIndex: 1,
    desktopClipId: 'clip-card-mid-dt',
    mobileClipId: 'clip-card-mid-mb',
    desktopPath:
      'M 0.5,3.5 Q 0.5,0.5 3.5,0.5 L 94.5,0.5 Q 97.5,0.5 97.5,3.5 L 97.5,28 C 97.5,34 98.3,38 99.0,43 C 99.5,46.5 99.5,53.5 99.0,57 C 98.3,62 97.5,66 97.5,72 L 97.5,96.5 Q 97.5,99.5 94.5,99.5 L 3.5,99.5 Q 0.5,99.5 0.5,96.5 L 0.5,72 C 0.5,66 1.3,62 2.0,57 C 2.5,53.5 2.5,46.5 2.0,43 C 1.3,38 0.5,34 0.5,28 Z',
    mobilePath:
      'M 0.5,3.5 Q 0.5,0.5 3.5,0.5 L 28,0.5 C 34,0.5 38,1.3 43,2.0 C 46.5,2.5 53.5,2.5 57,2.0 C 62,1.3 66,0.5 72,0.5 L 96.5,0.5 Q 99.5,0.5 99.5,3.5 L 99.5,94.5 Q 99.5,97.5 96.5,97.5 L 72,97.5 C 66,97.5 62,98.3 57,99.0 C 53.5,99.5 46.5,99.5 43,99.0 C 38,98.3 34,97.5 28,97.5 L 3.5,97.5 Q 0.5,97.5 0.5,94.5 Z',
  },
  {
    id: 'service-matryca-losu',
    targetId: 'matryca-losu',
    title: 'EKSPRESOWA ANALIZA MATRYCY LOSU',
    price: '250 zł',
    type: 'matrix',
    staggerIndex: 2,
    desktopClipId: 'clip-card-right-dt',
    mobileClipId: 'clip-card-bot-mb',
    desktopPath:
      'M 0.5,3.5 Q 0.5,0.5 3.5,0.5 L 96.5,0.5 Q 99.5,0.5 99.5,3.5 L 99.5,96.5 Q 99.5,99.5 96.5,99.5 L 3.5,99.5 Q 0.5,99.5 0.5,96.5 L 0.5,72 C 0.5,66 1.3,62 2.0,57 C 2.5,53.5 2.5,46.5 2.0,43 C 1.3,38 0.5,34 0.5,28 Z',
    mobilePath:
      'M 0.5,3.5 Q 0.5,0.5 3.5,0.5 L 28,0.5 C 34,0.5 38,1.3 43,2.0 C 46.5,2.5 53.5,2.5 57,2.0 C 62,1.3 66,0.5 72,0.5 L 96.5,0.5 Q 99.5,0.5 99.5,3.5 L 99.5,96.5 Q 99.5,99.5 96.5,99.5 L 3.5,99.5 Q 0.5,99.5 0.5,96.5 Z',
  },
];

export const ServiceCards: React.FC = () => {
  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  return (
    <section
      id="analizy"
      className="relative z-20 w-full py-16 sm:py-20 md:py-24 lg:py-28 px-3 sm:px-6 lg:px-8"
    >
      {/* SVG Clip Paths & Apple Liquid Glass Contours for Interconnected Modular Architecture */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Desktop Object Bounding Box Clip Paths (Exact 1:1 Matching Key + Lock Curves) */}
          <clipPath id="clip-card-left-dt" clipPathUnits="objectBoundingBox">
            <path d="M 0.005,0.035 Q 0.005,0.005 0.035,0.005 L 0.945,0.005 Q 0.975,0.005 0.975,0.035 L 0.975,0.28 C 0.975,0.34 0.983,0.38 0.990,0.43 C 0.995,0.465 0.995,0.535 0.990,0.57 C 0.983,0.62 0.975,0.66 0.975,0.72 L 0.975,0.965 Q 0.975,0.995 0.945,0.995 L 0.035,0.995 Q 0.005,0.995 0.005,0.965 Z" />
          </clipPath>
          <clipPath id="clip-card-mid-dt" clipPathUnits="objectBoundingBox">
            <path d="M 0.005,0.035 Q 0.005,0.005 0.035,0.005 L 0.945,0.005 Q 0.975,0.005 0.975,0.035 L 0.975,0.28 C 0.975,0.34 0.983,0.38 0.990,0.43 C 0.995,0.465 0.995,0.535 0.990,0.57 C 0.983,0.62 0.975,0.66 0.975,0.72 L 0.975,0.965 Q 0.975,0.995 0.945,0.995 L 0.035,0.995 Q 0.005,0.995 0.005,0.965 L 0.005,0.72 C 0.005,0.66 0.013,0.62 0.020,0.57 C 0.025,0.535 0.025,0.465 0.020,0.43 C 0.013,0.38 0.005,0.34 0.005,0.28 Z" />
          </clipPath>
          <clipPath id="clip-card-right-dt" clipPathUnits="objectBoundingBox">
            <path d="M 0.005,0.035 Q 0.005,0.005 0.035,0.005 L 0.965,0.005 Q 0.995,0.005 0.995,0.035 L 0.995,0.965 Q 0.995,0.995 0.965,0.995 L 0.035,0.995 Q 0.005,0.995 0.005,0.965 L 0.005,0.72 C 0.005,0.66 0.013,0.62 0.020,0.57 C 0.025,0.535 0.025,0.465 0.020,0.43 C 0.013,0.38 0.005,0.34 0.005,0.28 Z" />
          </clipPath>

          {/* Mobile Object Bounding Box Clip Paths (Vertical Interlocking Alignment) */}
          <clipPath id="clip-card-top-mb" clipPathUnits="objectBoundingBox">
            <path d="M 0.005,0.035 Q 0.005,0.005 0.035,0.005 L 0.965,0.005 Q 0.995,0.005 0.995,0.035 L 0.995,0.945 Q 0.995,0.975 0.965,0.975 L 0.72,0.975 C 0.66,0.975 0.62,0.983 0.57,0.990 C 0.535,0.995 0.465,0.995 0.43,0.990 C 0.38,0.983 0.34,0.975 0.28,0.975 L 0.035,0.975 Q 0.005,0.975 0.005,0.945 Z" />
          </clipPath>
          <clipPath id="clip-card-mid-mb" clipPathUnits="objectBoundingBox">
            <path d="M 0.005,0.035 Q 0.005,0.005 0.035,0.005 L 0.28,0.005 C 0.34,0.005 0.38,0.013 0.43,0.020 C 0.465,0.025 0.535,0.025 0.57,0.020 C 0.62,0.013 0.66,0.005 0.72,0.005 L 0.965,0.005 Q 0.995,0.005 0.995,0.035 L 0.995,0.945 Q 0.995,0.975 0.965,0.975 L 0.72,0.975 C 0.66,0.975 0.62,0.983 0.57,0.990 C 0.535,0.995 0.465,0.995 0.43,0.990 C 0.38,0.983 0.34,0.975 0.28,0.975 L 0.035,0.975 Q 0.005,0.975 0.005,0.945 Z" />
          </clipPath>
          <clipPath id="clip-card-bot-mb" clipPathUnits="objectBoundingBox">
            <path d="M 0.005,0.035 Q 0.005,0.005 0.035,0.005 L 0.28,0.005 C 0.34,0.005 0.38,0.013 0.43,0.020 C 0.465,0.025 0.535,0.025 0.57,0.020 C 0.62,0.013 0.66,0.005 0.72,0.005 L 0.965,0.005 Q 0.995,0.005 0.995,0.035 L 0.995,0.965 Q 0.995,0.995 0.965,0.995 L 0.035,0.995 Q 0.005,0.995 0.005,0.965 Z" />
          </clipPath>

          {/* Apple Liquid Glass Subtle Contours */}
          <linearGradient id="liquidGlassContour" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="liquidGlassContourHover" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.48" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.18" />
          </linearGradient>
        </defs>
      </svg>

      {/* Expanded Luxury Modular Puzzle Container (90–94vw on Desktop, max-width: 1800px) */}
      <div
        id="services-container"
        className="w-full max-w-[min(94vw,1800px)] mx-auto box-border"
      >
        {/* 3 Independent Cards in Standard Grid Flow without any DOM Overlap */}
        <div
          id="services-grid"
          style={
            {
              '--puzzle-gap': '8px',
              '--puzzle-gap-mb': '16px',
            } as React.CSSProperties
          }
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-2 lg:gap-2.5 xl:gap-3 items-stretch w-full relative max-w-[480px] sm:max-w-[540px] md:max-w-none mx-auto"
        >
          {SERVICES.map((service) => {
            return (
              <a
                key={service.id}
                href={`#${service.targetId}`}
                onClick={(e) => handleCardClick(e, service.targetId)}
                className="service-card-wrapper group relative w-full min-w-0 box-border block cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                role="link"
                aria-label={`Przejdź do szczegółów: ${service.title}, cena ${service.price}`}
              >
                {/* Apple Liquid Glass Card */}
                <div
                  id={service.id}
                  className="triptych-glass-card relative z-10 w-full min-w-0 box-border flex flex-col justify-between px-6 sm:px-8 md:px-10 lg:px-12 xl:px-14 py-7 sm:py-8 md:py-9 lg:py-10 min-h-[360px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] xl:min-h-[540px] aspect-[4/5] sm:aspect-[4/5] md:aspect-[3/4.2] lg:aspect-[3/4] cursor-pointer"
                  data-desktop-clip={service.desktopClipId}
                  data-mobile-clip={service.mobileClipId}
                >
                  {/* SVG Vector Ultra-Thin Glass Rim Overlay (Desktop) */}
                  <svg
                    className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-20"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={service.desktopPath}
                      fill="none"
                      stroke="url(#liquidGlassContour)"
                      strokeWidth="1.0"
                      vectorEffect="non-scaling-stroke"
                      className="card-contour-stroke transition-all duration-300 group-hover:stroke-[url(#liquidGlassContourHover)]"
                    />
                  </svg>

                  {/* SVG Vector Ultra-Thin Glass Rim Overlay (Mobile) */}
                  <svg
                    className="block md:hidden absolute inset-0 w-full h-full pointer-events-none z-20"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={service.mobilePath}
                      fill="none"
                      stroke="url(#liquidGlassContour)"
                      strokeWidth="1.0"
                      vectorEffect="non-scaling-stroke"
                      className="card-contour-stroke transition-all duration-300 group-hover:stroke-[url(#liquidGlassContourHover)]"
                    />
                  </svg>

                  {/* Subtle Top Environmental Glass Light Highlight */}
                  <div className="top-glass-reflection" aria-hidden="true" />

                  {/* Top Section: Service Title - Text Safe Area with High-Contrast Editorial Typography */}
                  <div className="relative z-10 max-w-[85%] md:max-w-[78%] pt-1">
                    <h2 className="font-title text-[clamp(1.1rem,1.35vw,1.6rem)] font-normal text-[#F8F4F0] tracking-[0.03em] leading-snug drop-shadow-sm">
                      {service.title}
                    </h2>
                  </div>

                  {/* Editorial Artwork: Top artwork smoothly blending into translucent glass bottom */}
                  <CardIllustration type={service.type} staggerIndex={service.staggerIndex} />

                  {/* Bottom Section: Integrated Price directly in the glass panel without any separate box */}
                  <div className="relative z-10 pt-4 flex items-baseline justify-between border-t border-white/[0.08] mt-auto">
                    <span className="font-title text-[clamp(1.35rem,1.75vw,2.1rem)] font-light text-[#F8F4F0] tracking-tight">
                      {service.price}
                    </span>
                    <span className="text-[clamp(10px,0.8vw,12px)] uppercase tracking-[0.2em] text-[#F8F4F0]/65 font-sans group-hover:text-[#F8F4F0] transition-colors duration-300">
                      Szczegóły &rarr;
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
