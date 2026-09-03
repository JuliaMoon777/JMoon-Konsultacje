import React from 'react';
import { ParticleText } from './ParticleText';

export const Hero: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative w-full min-h-[100svh] flex flex-col justify-between items-center pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-8 select-none bg-transparent overflow-visible"
    >
      {/* Centered Composition: [ ORIGINAL LOGO ] + [ JMOON NUMEROLOGY — PARTICLES ] */}
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-5 sm:gap-7 max-w-4xl mx-auto my-auto z-10 overflow-visible">
        {/* [ ORIGINAL LOGO ] */}
        <div className="relative flex items-center justify-center p-2">
          <img
            src="https://i.postimg.cc/j2szw3rX/JMoon-new-logo.png"
            alt="Logo JMoon Numerology"
            referrerPolicy="no-referrer"
            className="w-[190px] sm:w-[240px] md:w-[280px] lg:w-[310px] max-h-[46vh] h-auto object-contain pointer-events-none select-none drop-shadow-[0_8px_24px_rgba(209,122,82,0.12)]"
            loading="eager"
          />
        </div>

        {/* [ J MOON NUMEROLOGY — PARTICLES ] */}
        <div className="relative w-full flex items-center justify-center px-4 max-w-full overflow-visible">
          <ParticleText
            text="J MOON NUMEROLOGY"
            fontSize={54}
            minFontSize={28}
            fontWeight={600}
            letterSpacing={0.28}
            align="center"
            className="text-center"
            as="h1"
            ariaLabel="J MOON NUMEROLOGY"
          />
        </div>
      </div>

      {/* [ PRZEWIŃ W DÓŁ ] */}
      <div
        id="hero-scroll-indicator"
        className="relative z-20 flex flex-col items-center gap-2.5 text-[#F2EFEA]/45 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-body pointer-events-none mt-auto pt-4"
      >
        <span>Przewiń w dół</span>
        <div className="w-[1px] h-6 bg-gradient-to-b from-[#D07A4D]/60 via-[#E8B58E]/40 to-transparent" />
      </div>
    </section>
  );
};
