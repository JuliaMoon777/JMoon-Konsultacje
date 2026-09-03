import React from 'react';

/**
 * LIVING MICRO JEWELRY DUST CLUSTER MARKER
 * An asymmetric, organic dust cluster of ~18 particles (micro, medium, and accent jewelry)
 * in champagne, copper, warm ivory, and dusty terracotta.
 * Particles drift independently with zero cross/star symmetry.
 */

interface ParticleMarkerProps {
  className?: string;
}

export const ParticleMarker: React.FC<ParticleMarkerProps> = ({ className = '' }) => {
  return (
    <span
      className={`relative inline-flex items-center justify-center w-[20px] h-[20px] select-none shrink-0 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 22 22"
        width="20"
        height="20"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <style>{`
            @keyframes dustDrift1 {
              0% { transform: translate(0px, 0px); }
              50% { transform: translate(0.4px, -0.5px); }
              100% { transform: translate(-0.3px, 0.3px); }
            }
            @keyframes dustDrift2 {
              0% { transform: translate(0px, 0px); }
              50% { transform: translate(-0.5px, 0.4px); }
              100% { transform: translate(0.3px, -0.4px); }
            }
            @keyframes dustDrift3 {
              0% { transform: translate(0px, 0px); }
              50% { transform: translate(0.6px, 0.5px); }
              100% { transform: translate(-0.4px, -0.5px); }
            }
            @keyframes dustDrift4 {
              0% { transform: translate(0px, 0px); }
              50% { transform: translate(-0.3px, -0.6px); }
              100% { transform: translate(0.5px, 0.4px); }
            }
            @keyframes accentDrift {
              0% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(0.9px, -1.1px) scale(1.05); }
              66% { transform: translate(-0.8px, 0.7px) scale(0.95); }
              100% { transform: translate(0px, 0px) scale(1); }
            }
            @keyframes shimmerGlint {
              0%, 100% { opacity: 0.85; }
              50% { opacity: 1; filter: drop-shadow(0 0 1.5px rgba(240, 206, 175, 0.8)); }
            }
          `}</style>
        </defs>

        {/* --- MICRO STRUCTURAL PARTICLES (0.5–1.0px) --- */}
        <circle cx="6.2" cy="5.1" r="0.7" fill="#E6B089" opacity="0.85" style={{ animation: 'dustDrift1 5.4s ease-in-out infinite' }} />
        <circle cx="9.4" cy="4.2" r="0.6" fill="#D98C63" opacity="0.80" style={{ animation: 'dustDrift2 6.8s ease-in-out infinite' }} />
        <circle cx="13.1" cy="5.8" r="0.8" fill="#F0CEAF" opacity="0.88" style={{ animation: 'dustDrift3 4.9s ease-in-out infinite' }} />
        <circle cx="5.0" cy="9.3" r="0.6" fill="#C8754F" opacity="0.75" style={{ animation: 'dustDrift4 7.2s ease-in-out infinite' }} />
        <circle cx="8.2" cy="8.0" r="0.9" fill="#E6B089" opacity="0.90" style={{ animation: 'dustDrift1 6.1s ease-in-out infinite' }} />
        <circle cx="11.5" cy="9.1" r="0.7" fill="#DC8F85" opacity="0.82" style={{ animation: 'dustDrift2 5.7s ease-in-out infinite' }} />
        <circle cx="15.2" cy="8.4" r="0.6" fill="#B76548" opacity="0.78" style={{ animation: 'dustDrift3 8.0s ease-in-out infinite' }} />
        <circle cx="4.2" cy="13.5" r="0.8" fill="#D98C63" opacity="0.85" style={{ animation: 'dustDrift4 6.5s ease-in-out infinite' }} />
        <circle cx="7.8" cy="12.2" r="0.7" fill="#F0CEAF" opacity="0.88" style={{ animation: 'dustDrift1 7.4s ease-in-out infinite' }} />
        <circle cx="12.8" cy="13.8" r="0.9" fill="#C8754F" opacity="0.80" style={{ animation: 'dustDrift2 5.2s ease-in-out infinite' }} />
        <circle cx="16.5" cy="12.0" r="0.6" fill="#E6B089" opacity="0.75" style={{ animation: 'dustDrift3 6.9s ease-in-out infinite' }} />
        <circle cx="9.1" cy="16.2" r="0.8" fill="#DC8F85" opacity="0.82" style={{ animation: 'dustDrift4 5.8s ease-in-out infinite' }} />

        {/* --- MEDIUM LUSTER PARTICLES (1.0–1.6px) --- */}
        <circle cx="10.2" cy="6.5" r="1.2" fill="#E6B089" opacity="0.92" style={{ animation: 'dustDrift3 7.5s ease-in-out infinite' }} />
        <circle cx="6.8" cy="10.5" r="1.4" fill="#D98C63" opacity="0.90" style={{ animation: 'dustDrift1 6.3s ease-in-out infinite' }} />
        <circle cx="13.8" cy="11.2" r="1.3" fill="#B76548" opacity="0.88" style={{ animation: 'dustDrift4 8.2s ease-in-out infinite' }} />
        <circle cx="8.5" cy="14.5" r="1.1" fill="#F0CEAF" opacity="0.90" style={{ animation: 'dustDrift2 7.1s ease-in-out infinite' }} />

        {/* --- BRIGHTER ACCENT JEWELRY PARTICLES (1.6–2.2px) --- */}
        <circle cx="7.2" cy="7.1" r="1.9" fill="#F0CEAF" opacity="0.98" style={{ animation: 'accentDrift 9.5s ease-in-out infinite, shimmerGlint 3.2s ease-in-out infinite' }} />
        <circle cx="14.1" cy="6.9" r="1.7" fill="#E6B089" opacity="0.95" style={{ animation: 'accentDrift 8.2s ease-in-out infinite, shimmerGlint 4.1s ease-in-out infinite' }} />
      </svg>
    </span>
  );
};
