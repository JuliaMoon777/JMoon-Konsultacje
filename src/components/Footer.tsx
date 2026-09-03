import React from 'react';

// Original logo URL for J Moon Numerology
export const LOGO_URL = 'https://i.postimg.cc/j2szw3rX/JMoon-new-logo.png';

export const Footer: React.FC = () => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    let el = document.getElementById(targetId);
    if (!el && targetId === 'opinie') {
      // Smoothly navigate to the first verified reviews / rating section anchor
      el = document.getElementById('routine-rating-block') || document.getElementById('twoja-rutyna');
    }
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  return (
    <footer
      id="site-footer"
      className="relative z-20 w-full pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8"
      aria-label="Stopka strony"
    >
      {/* Structural Divider: Ultra-thin copper/terracotta hairline */}
      <div
        className="w-full max-w-[min(calc(100%-24px),1440px)] sm:max-w-[min(calc(100%-48px),1440px)] lg:max-w-[min(calc(100%-64px),1440px)] mx-auto mb-14 sm:mb-18 lg:mb-20"
        aria-hidden="true"
      >
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#D17A52]/25 to-transparent" />
      </div>

      <div
        id="footer-content-container"
        className="w-full max-w-[min(calc(100%-24px),1440px)] sm:max-w-[min(calc(100%-48px),1440px)] lg:max-w-[min(calc(100%-64px),1440px)] mx-auto"
      >
        {/* Main Footer Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-start">
          
          {/* Brand Logo Column */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col items-start">
            {LOGO_URL ? (
              <img
                src={LOGO_URL}
                alt="J Moon Numerology"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto max-w-[280px] sm:max-w-[340px] md:max-w-[400px] object-contain select-none"
              />
            ) : null}
          </div>

          {/* Navigation & Contact Column Pair */}
          <div className="md:col-span-6 lg:col-span-5 grid grid-cols-2 gap-8 sm:gap-10">
            
            {/* NAWIGACJA */}
            <div id="footer-navigation-col" className="space-y-4">
              <h3 className="font-title text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#E8B58E]/75 font-medium">
                NAWIGACJA
              </h3>
              <ul className="space-y-2.5 font-body text-xs sm:text-[13.5px] font-light">
                <li>
                  <a
                    href="#analizy"
                    onClick={(e) => handleNavClick(e, 'analizy')}
                    className="text-[#CFBFB6]/75 hover:text-[#E8B58E] transition-colors duration-200"
                  >
                    Analizy
                  </a>
                </li>
                <li>
                  <a
                    href="#opinie"
                    onClick={(e) => handleNavClick(e, 'opinie')}
                    className="text-[#CFBFB6]/75 hover:text-[#E8B58E] transition-colors duration-200"
                  >
                    Opinie
                  </a>
                </li>
                <li>
                  <a
                    href="#nota-prawna"
                    onClick={(e) => handleNavClick(e, 'nota-prawna')}
                    className="text-[#CFBFB6]/75 hover:text-[#E8B58E] transition-colors duration-200"
                  >
                    Nota prawna
                  </a>
                </li>
              </ul>
            </div>

            {/* KONTAKT */}
            <div id="footer-contact-col" className="space-y-4">
              <h3 className="font-title text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#E8B58E]/75 font-medium">
                KONTAKT
              </h3>
              <ul className="space-y-2.5 font-body text-xs sm:text-[13.5px] font-light">
                <li>
                  <a
                    href="https://www.instagram.com/j.moon777/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#CFBFB6]/75 hover:text-[#E8B58E] transition-colors duration-200"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:juliamoon@jmoon-numerology.com"
                    className="text-[#CFBFB6]/75 hover:text-[#E8B58E] transition-colors duration-200"
                  >
                    juliamoon@jmoon-numerology.com
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Subtle Micro-Separator */}
        <div className="mt-14 sm:mt-18 pt-6 sm:pt-8 border-t border-[#D17A52]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] sm:text-xs text-[#CFBFB6]/45 font-light tracking-wide">
          <p>© 2026 JMoon Numerology. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
};
