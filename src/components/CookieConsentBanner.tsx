import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Check } from 'lucide-react';

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'jmoon_cookie_consent';
export const OPEN_COOKIE_SETTINGS_EVENT = 'jmoon-open-cookie-settings';
export const COOKIE_CONSENT_UPDATED_EVENT = 'jmoon-cookie-consent-updated';

export const openCookieSettings = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT));
  }
};

export const getStoredCookieConsent = (): CookieConsent | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
};

export const CookieConsentBanner: React.FC = () => {
  const [hasConsent, setHasConsent] = useState<boolean>(true); // start true to prevent flash
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Preference switches inside the settings panel
  const [analyticsAllowed, setAnalyticsAllowed] = useState<boolean>(false);
  const [marketingAllowed, setMarketingAllowed] = useState<boolean>(false);

  // Initialize consent on client mount
  useEffect(() => {
    const stored = getStoredCookieConsent();
    if (!stored) {
      setHasConsent(false);
      // Soft delayed entrance for calm user experience
      const timer = setTimeout(() => {
        setIsBannerVisible(true);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setHasConsent(true);
      setAnalyticsAllowed(!!stored.analytics);
      setMarketingAllowed(!!stored.marketing);
    }
  }, []);

  // Listen for global request to open cookie settings (e.g. from footer)
  useEffect(() => {
    const handleOpenSettings = () => {
      const stored = getStoredCookieConsent();
      if (stored) {
        setAnalyticsAllowed(!!stored.analytics);
        setMarketingAllowed(!!stored.marketing);
      }
      setIsSettingsOpen(true);
    };

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    };
  }, []);

  // Handle ESC key to close settings modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen]);

  const savePreferences = useCallback(
    (analytics: boolean, marketing: boolean) => {
      const consent: CookieConsent = {
        necessary: true,
        analytics,
        marketing,
        timestamp: Date.now(),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      } catch (err) {
        console.warn('Could not save cookie consent:', err);
      }

      setHasConsent(true);
      setIsBannerVisible(false);
      setIsSettingsOpen(false);

      // Dispatch event for any analytics/marketing scripts waiting for user consent
      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: consent })
      );
    },
    []
  );

  const handleAcceptAll = () => {
    savePreferences(true, true);
  };

  const handleOnlyNecessary = () => {
    savePreferences(false, false);
  };

  const handleSaveCustom = () => {
    savePreferences(analyticsAllowed, marketingAllowed);
  };

  const handleOpenSettingsPanel = () => {
    const stored = getStoredCookieConsent();
    if (stored) {
      setAnalyticsAllowed(!!stored.analytics);
      setMarketingAllowed(!!stored.marketing);
    }
    setIsSettingsOpen(true);
  };

  return (
    <>
      {/* =========================================================================
          MAIN COOKIE CONSENT BANNER
          ========================================================================= */}
      <AnimatePresence>
        {isBannerVisible && !hasConsent && (
          <aside
            id="cookie-consent-banner"
            role="region"
            aria-label="Prywatność i pliki cookies"
            aria-labelledby="cookie-banner-title"
            aria-describedby="cookie-banner-description"
            className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 md:p-8 pointer-events-none flex justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.25, ease: 'easeOut' } }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-[820px] rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 bg-[#240A12]/92 backdrop-blur-[24px] border border-[#E5B78D]/[0.18] shadow-[0_24px_60px_rgba(10,2,6,0.75)] relative overflow-hidden"
            >
              {/* Subtle ambient luxury glass sheen */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#E5B78D]/[0.06] via-transparent to-[#7A2F18]/[0.08] pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative z-10 flex flex-col">
                {/* Header & Description */}
                <div>
                  <h3
                    id="cookie-banner-title"
                    className="font-title text-base sm:text-lg font-medium text-[#F5ECE6] tracking-wide"
                  >
                    Dbanie o prywatność
                  </h3>
                  <p
                    id="cookie-banner-description"
                    className="font-body text-xs sm:text-[13.5px] text-[#CFBFB6]/90 leading-relaxed font-light mt-2 sm:mt-2.5 max-w-3xl"
                  >
                    Używamy niezbędnych plików cookies, aby strona działała prawidłowo. Za Twoją zgodą możemy również korzystać z plików analitycznych i marketingowych. Swoje ustawienia możesz zmienić w dowolnym momencie.
                  </p>
                </div>

                {/* Action Buttons Grid */}
                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5">
                  {/* Primary: AKCEPTUJ WSZYSTKIE */}
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="flex-1 px-5 py-3 min-h-[44px] rounded-xl font-title text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#1C060D] bg-gradient-to-r from-[#E5B78D] via-[#DF9B72] to-[#C96A35] hover:brightness-110 active:scale-[0.99] transition-all duration-200 shadow-[0_4px_20px_rgba(201,106,53,0.22)] flex items-center justify-center text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B78D]/60"
                  >
                    Akceptuj wszystkie
                  </button>

                  {/* Secondary: TYLKO NIEZBĘDNE */}
                  <button
                    type="button"
                    onClick={handleOnlyNecessary}
                    className="flex-1 px-5 py-3 min-h-[44px] rounded-xl font-title text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#F5ECE6] bg-white/[0.05] hover:bg-white/[0.09] border border-[#E5B78D]/25 hover:border-[#E5B78D]/45 active:scale-[0.99] transition-all duration-200 flex items-center justify-center text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B78D]/60"
                  >
                    Tylko niezbędne
                  </button>

                  {/* Tertiary: USTAWIENIA */}
                  <button
                    type="button"
                    onClick={handleOpenSettingsPanel}
                    className="px-5 py-3 min-h-[44px] rounded-xl font-title text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#E5B78D]/90 hover:text-[#F5ECE6] bg-transparent hover:bg-white/[0.04] border border-[#E5B78D]/16 hover:border-[#E5B78D]/35 active:scale-[0.99] transition-all duration-200 flex items-center justify-center text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B78D]/60"
                  >
                    Ustawienia
                  </button>
                </div>

                {/* Micro Privacy Links at the bottom */}
                <div className="mt-4 pt-3 border-t border-[#E5B78D]/[0.08] flex flex-wrap items-center gap-4 text-[11px] sm:text-xs text-[#CFBFB6]/60 font-light">
                  <a
                    href="https://jmoon-numerology.com/regulamin_konsultacja"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#E5B78D] transition-colors duration-200 underline underline-offset-2"
                  >
                    Polityka prywatności
                  </a>
                  <span className="text-[#E5B78D]/30" aria-hidden="true">•</span>
                  <a
                    href="https://jmoon-numerology.com/regulamin_konsultacja"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#E5B78D] transition-colors duration-200 underline underline-offset-2"
                  >
                    Polityka cookies
                  </a>
                </div>
              </div>
            </motion.div>
          </aside>
        )}
      </AnimatePresence>

      {/* =========================================================================
          COOKIE SETTINGS MODAL / DRAWER
          ========================================================================= */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div
            id="cookie-settings-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            {/* Soft Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
              aria-hidden="true"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.2 } }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-[620px] rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#351018] via-[#240A12] to-[#1A060E] border border-[#E5B78D]/25 shadow-[0_30px_70px_rgba(0,0,0,0.85)] max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5B78D]/12">
                <div>
                  <h3
                    id="cookie-settings-title"
                    className="font-title text-lg sm:text-xl font-medium text-[#F5ECE6] tracking-wide"
                  >
                    Ustawienia preferencji cookies
                  </h3>
                  <p className="font-body text-xs sm:text-[13px] text-[#CFBFB6]/80 font-light mt-1">
                    Wybierz, na jakie kategorie plików cookies wyrażasz zgodę.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  aria-label="Zamknij panel ustawień"
                  className="p-2 rounded-xl text-[#CFBFB6]/70 hover:text-[#F5ECE6] hover:bg-white/[0.05] transition-colors duration-200 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B78D]/60"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Categories Body */}
              <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
                {/* 1. Niezbędne */}
                <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/[0.025] border border-[#E5B78D]/10 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-title text-sm sm:text-[15px] font-medium text-[#F5ECE6]">
                        Niezbędne
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider text-[#E5B78D] bg-[#E5B78D]/10 border border-[#E5B78D]/20 flex items-center gap-1">
                        <Lock size={10} /> Zawsze aktywne
                      </span>
                    </div>

                    {/* Locked Toggle Switch */}
                    <div
                      aria-disabled="true"
                      className="w-11 h-6 rounded-full bg-[#C96A35]/40 p-0.5 flex items-center justify-end cursor-not-allowed opacity-80"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#E5B78D] shadow-sm flex items-center justify-center text-[#240A12]">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    </div>
                  </div>

                  <p className="font-body text-xs text-[#CFBFB6]/80 font-light leading-relaxed">
                    Umożliwiają prawidłowe działanie strony, jej bezpieczeństwo oraz zapamiętanie Twoich preferencji (w tym niniejszej zgody). Te pliki cookies nie mogą być wyłączone.
                  </p>
                </div>

                {/* 2. Analityczne */}
                <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/[0.025] border border-[#E5B78D]/10 hover:border-[#E5B78D]/20 transition-colors duration-200 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="toggle-analytics"
                      className="font-title text-sm sm:text-[15px] font-medium text-[#F5ECE6] cursor-pointer select-none"
                    >
                      Analityczne
                    </label>

                    {/* Interactive Toggle Switch */}
                    <button
                      id="toggle-analytics"
                      type="button"
                      role="switch"
                      aria-checked={analyticsAllowed}
                      onClick={() => setAnalyticsAllowed((prev) => !prev)}
                      className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B78D]/60 ${
                        analyticsAllowed
                          ? 'bg-gradient-to-r from-[#DF9B72] to-[#C96A35]'
                          : 'bg-white/[0.12] hover:bg-white/[0.18]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-[#F5ECE6] shadow-md transition-transform duration-200 flex items-center justify-center ${
                          analyticsAllowed ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      >
                        {analyticsAllowed && (
                          <Check size={11} strokeWidth={3} className="text-[#351018]" />
                        )}
                      </div>
                    </button>
                  </div>

                  <p className="font-body text-xs text-[#CFBFB6]/80 font-light leading-relaxed">
                    Pomagają nam zrozumieć, jak użytkownicy wchodzą w interakcję ze stroną, co pozwala nam doskonalić jej działanie i architekturę.
                  </p>
                </div>

                {/* 3. Marketingowe */}
                <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white/[0.025] border border-[#E5B78D]/10 hover:border-[#E5B78D]/20 transition-colors duration-200 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="toggle-marketing"
                      className="font-title text-sm sm:text-[15px] font-medium text-[#F5ECE6] cursor-pointer select-none"
                    >
                      Marketingowe
                    </label>

                    {/* Interactive Toggle Switch */}
                    <button
                      id="toggle-marketing"
                      type="button"
                      role="switch"
                      aria-checked={marketingAllowed}
                      onClick={() => setMarketingAllowed((prev) => !prev)}
                      className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B78D]/60 ${
                        marketingAllowed
                          ? 'bg-gradient-to-r from-[#DF9B72] to-[#C96A35]'
                          : 'bg-white/[0.12] hover:bg-white/[0.18]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-[#F5ECE6] shadow-md transition-transform duration-200 flex items-center justify-center ${
                          marketingAllowed ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      >
                        {marketingAllowed && (
                          <Check size={11} strokeWidth={3} className="text-[#351018]" />
                        )}
                      </div>
                    </button>
                  </div>

                  <p className="font-body text-xs text-[#CFBFB6]/80 font-light leading-relaxed">
                    Używane do mierzenia skuteczności komunikacji oraz ewentualnego dopasowywania treści do Twoich zainteresowań.
                  </p>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 border-t border-[#E5B78D]/12 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                {/* ZAPISZ USTAWIENIA */}
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="flex-1 px-5 py-3 min-h-[44px] rounded-xl font-title text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#F5ECE6] bg-white/[0.06] hover:bg-white/[0.12] border border-[#E5B78D]/30 hover:border-[#E5B78D]/50 active:scale-[0.99] transition-all duration-200 flex items-center justify-center text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B78D]/60"
                >
                  Zapisz ustawienia
                </button>

                {/* AKCEPTUJ WSZYSTKIE */}
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 px-5 py-3 min-h-[44px] rounded-xl font-title text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase text-[#1C060D] bg-gradient-to-r from-[#E5B78D] via-[#DF9B72] to-[#C96A35] hover:brightness-110 active:scale-[0.99] transition-all duration-200 shadow-[0_4px_20px_rgba(201,106,53,0.22)] flex items-center justify-center text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5B78D]/60"
                >
                  Akceptuj wszystkie
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
