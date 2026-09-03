import React from 'react';
import masterPanoramaImage from '../assets/images/terracotta_puzzle_panorama_1788426961417.jpg';
import masterVerticalImage from '../assets/images/terracotta_puzzle_vertical_1788426974810.jpg';

export type IllustrationType = 'routine' | 'forecast' | 'matrix';

export interface CardIllustrationProps {
  type: IllustrationType;
  staggerIndex?: number;
}

export const CardIllustration: React.FC<CardIllustrationProps> = ({ type }) => {
  const index = type === 'routine' ? 0 : type === 'forecast' ? 1 : 2;

  // Shared coordinate offsets for continuous master artwork slicing across 3 independent puzzle pieces:
  // Desktop: 3 separate cards side-by-side with --puzzle-gap
  // Mobile: 3 separate cards stacked vertically with --puzzle-gap-mb
  const desktopLeftOffset =
    index === 0
      ? '0%'
      : index === 1
      ? 'calc(-100% - var(--puzzle-gap, 8px))'
      : 'calc(-200% - (2 * var(--puzzle-gap, 8px)))';

  const mobileTopOffset =
    index === 0
      ? '0%'
      : index === 1
      ? 'calc(-100% - var(--puzzle-gap-mb, 16px))'
      : 'calc(-200% - (2 * var(--puzzle-gap-mb, 16px)))';

  return (
    <div
      className="card-media-layer absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* =========================================================================
          DESKTOP: Continuous Master Terracotta Panoramic Artwork (Span 3:1)
          Each card renders ONLY its dedicated slice through its own independent mask
          ========================================================================= */}
      <div
        className="hidden md:block absolute top-0 bottom-0 h-full pointer-events-none"
        style={{
          width: 'calc(300% + (2 * var(--puzzle-gap, 8px)))',
          left: desktopLeftOffset,
        }}
      >
        <img
          src={masterPanoramaImage}
          alt=""
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-[50%_35%] opacity-100 pointer-events-none transition-opacity duration-500 ease-out"
        />
      </div>

      {/* =========================================================================
          MOBILE: Continuous Master Terracotta Vertical Artwork (Span 1:3)
          Each card renders ONLY its dedicated slice through its own independent mask
          ========================================================================= */}
      <div
        className="block md:hidden absolute left-0 right-0 w-full pointer-events-none"
        style={{
          height: 'calc(300% + (2 * var(--puzzle-gap-mb, 16px)))',
          top: mobileTopOffset,
        }}
      >
        <img
          src={masterVerticalImage}
          alt=""
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-100 pointer-events-none transition-opacity duration-500 ease-out"
        />
      </div>

      {/* Apple Liquid Glass Seamless Dissolve: Soft shadow gradient at bottom so text stays ultra-readable while preserving rich terracotta tones */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-[#200A05]/10 to-[#180804]/45 pointer-events-none" />
      {/* Ambient glass light sheen */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-[#32140E]/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
