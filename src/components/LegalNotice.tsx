import React from 'react';

export const LEGAL_NOTICE_DATA = {
  title: 'NOTA PRAWNA',
  paragraphs: [
    'Oferowane usługi mają wyłącznie charakter informacyjny, ezoteryczny i rozrywkowy oraz mogą stanowić formę wsparcia osobistego.',
    'Konsultacje nie stanowią profesjonalnej porady medycznej, psychologicznej, finansowej, prawnej ani inwestycyjnej i nie zastępują konsultacji z odpowiednio wykwalifikowanym specjalistą.',
    'Informacje przekazywane w ramach analiz należy traktować jako dodatkową perspektywę, a nie podstawę do podejmowania decyzji dotyczących zdrowia, finansów, prawa lub innych istotnych obszarów życia.',
  ],
};

export const LegalNotice: React.FC = () => {
  return (
    <footer
      id="nota-prawna"
      className="relative z-20 w-full py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8"
      aria-label="Nota prawna"
    >
      {/* Structural Divider: Ultra-thin copper/terracotta hairline */}
      <div
        className="w-full max-w-[min(calc(100%-24px),1440px)] sm:max-w-[min(calc(100%-48px),1440px)] lg:max-w-[min(calc(100%-64px),1440px)] mx-auto mb-12 sm:mb-16"
        aria-hidden="true"
      >
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D17A52]/25 to-transparent" />
      </div>

      {/* Discreet, Elegant Legal Colophon */}
      <div
        id="legal-notice-container"
        className="w-full max-w-2xl sm:max-w-3xl mx-auto"
      >
        <h3
          id="legal-notice-heading"
          className="font-title text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#E8B58E]/70 font-medium mb-5 sm:mb-6"
        >
          {LEGAL_NOTICE_DATA.title}
        </h3>

        <div
          id="legal-notice-body"
          className="space-y-3.5 font-body text-xs sm:text-[13px] text-[#CFBFB6]/65 leading-[1.75] font-light"
        >
          {LEGAL_NOTICE_DATA.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </footer>
  );
};
