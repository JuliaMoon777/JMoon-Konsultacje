import React from 'react';

/**
 * PARTICLE MARKER
 * A tiny organic metallic dust spark (10-14px) composed of 11 micro-particles.
 * Subtly breathes with gentle 0.3-0.5px micro-drifts over slow cycles.
 * No rotation, no pulsation, no heavy glow.
 */

interface ParticleMarkerProps {
  className?: string;
}

export const ParticleMarker: React.FC<ParticleMarkerProps> = ({ className = '' }) => {
  return (
    <span
      className={`relative inline-flex items-center justify-center w-[14px] h-[14px] select-none shrink-0 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 14 14"
        width="14"
        height="14"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <style>{`
            @keyframes microDrift1 {
              0% { transform: translate(0px, 0px); }
              100% { transform: translate(0.35px, -0.3px); }
            }
            @keyframes microDrift2 {
              0% { transform: translate(0px, 0px); }
              100% { transform: translate(-0.4px, 0.35px); }
            }
            @keyframes microDrift3 {
              0% { transform: translate(0px, 0px); }
              100% { transform: translate(0.3px, 0.4px); }
            }
            @keyframes microDrift4 {
              0% { transform: translate(0px, 0px); }
              100% { transform: translate(-0.35px, -0.35px); }
            }
            @keyframes microDrift5 {
              0% { transform: translate(0px, 0px); }
              100% { transform: translate(0.25px, -0.4px); }
            }
            @keyframes microDrift6 {
              0% { transform: translate(0px, 0px); }
              100% { transform: translate(-0.3px, 0.25px); }
            }
          `}</style>
        </defs>

        {/* 1. Core Luminous Champagne Particle */}
        <circle
          cx="7"
          cy="7"
          r="1.1"
          fill="#F5EFEB"
          opacity="0.95"
          style={{ animation: 'microDrift1 5.2s ease-in-out infinite alternate' }}
        />

        {/* 2. Inner Satellite Champagne & Copper Particles */}
        <circle
          cx="5.3"
          cy="6.2"
          r="0.85"
          fill="#E8BA93"
          opacity="0.85"
          style={{ animation: 'microDrift2 6.4s ease-in-out infinite alternate' }}
        />
        <circle
          cx="8.6"
          cy="6.5"
          r="0.9"
          fill="#E28E56"
          opacity="0.82"
          style={{ animation: 'microDrift3 7.1s ease-in-out infinite alternate' }}
        />
        <circle
          cx="6.6"
          cy="8.7"
          r="0.85"
          fill="#E8BA93"
          opacity="0.78"
          style={{ animation: 'microDrift4 5.9s ease-in-out infinite alternate' }}
        />
        <circle
          cx="7.5"
          cy="5.1"
          r="0.8"
          fill="#D17A52"
          opacity="0.75"
          style={{ animation: 'microDrift5 7.8s ease-in-out infinite alternate' }}
        />

        {/* 3. Outer Organic Metallic Dust Cluster */}
        <circle
          cx="3.8"
          cy="7.6"
          r="0.65"
          fill="#C86B37"
          opacity="0.6"
          style={{ animation: 'microDrift6 6.8s ease-in-out infinite alternate' }}
        />
        <circle
          cx="10.2"
          cy="7.7"
          r="0.6"
          fill="#E8BA93"
          opacity="0.65"
          style={{ animation: 'microDrift1 8.2s ease-in-out infinite alternate' }}
        />
        <circle
          cx="8.3"
          cy="3.8"
          r="0.55"
          fill="#D17A52"
          opacity="0.55"
          style={{ animation: 'microDrift2 7.5s ease-in-out infinite alternate' }}
        />
        <circle
          cx="4.7"
          cy="4.6"
          r="0.6"
          fill="#E28E56"
          opacity="0.58"
          style={{ animation: 'microDrift3 8.9s ease-in-out infinite alternate' }}
        />
        <circle
          cx="9.6"
          cy="5.4"
          r="0.5"
          fill="#C86B37"
          opacity="0.5"
          style={{ animation: 'microDrift4 6.7s ease-in-out infinite alternate' }}
        />
        <circle
          cx="6.1"
          cy="10.2"
          r="0.55"
          fill="#D17A52"
          opacity="0.52"
          style={{ animation: 'microDrift5 8.1s ease-in-out infinite alternate' }}
        />
      </svg>
    </span>
  );
};
