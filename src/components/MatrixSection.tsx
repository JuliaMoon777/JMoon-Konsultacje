import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ArrowUpRight, Instagram, X } from 'lucide-react';
import { ParticleText } from './ParticleText';
import { ParticleMarker } from './ParticleMarker';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export const MatrixSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // Dynamic reviews state — 0 fake reviews
  const [reviews] = useState<Review[]>([]);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);
  const [priceReady, setPriceReady] = useState<boolean>(false);

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
      : 0;

  const topicsList = [
    { title: 'MIŁOŚĆ I RELACJE' },
    { title: 'KOMPATYBILNOŚĆ Z KONKRETNĄ OSOBĄ' },
    { title: 'PIENIĄDZE' },
    { title: 'WIDOCZNOŚĆ I REALIZACJA SIEBIE' },
    { title: 'ZWOLNIENIE Z PRACY' },
    { title: 'ŻYCIOWE ZMIANY' },
    { title: 'OSOBISTY POTENCJAŁ I SPOSOBY JEGO WYKORZYSTANIA' },
    {
      title: 'ENERGETYCZNE PRZYCZYNY ZADŁUŻENIA — DLACZEGO DŁUGI ROSNĄ I CO UTRUDNIA WYJŚCIE Z NICH',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="matryca-losu"
      className="relative z-20 w-full py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-8 scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-28"
    >
      {/* Editorial Content Container */}
      <div
        id="matrix-content-container"
        className="w-full max-w-[min(calc(100%-24px),1440px)] sm:max-w-[min(calc(100%-48px),1440px)] lg:max-w-[min(calc(100%-64px),1440px)] mx-auto"
      >
        {/* Editorial Top Bar: Dynamic Rating Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
          <div id="matrix-rating-block" className="flex items-center gap-3">
            {reviewCount === 0 ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1" aria-label="Ocena: brak opinii">
                  {[1, 2, 3, 4, 5].map((starIdx) => (
                    <Star
                      key={starIdx}
                      size={15}
                      className="text-[#E8B58E]/40"
                      strokeWidth={1.25}
                      fill="none"
                    />
                  ))}
                </div>
                <span className="font-title text-sm tracking-wider text-[#E8B58E]/75 font-normal">
                  „0”
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starIdx) => {
                    const isFilled = starIdx <= Math.round(Number(averageRating));
                    return (
                      <Star
                        key={starIdx}
                        size={15}
                        className={isFilled ? 'text-[#E8B58E] fill-[#E8B58E]' : 'text-[#E8B58E]/30'}
                        strokeWidth={1.25}
                      />
                    );
                  })}
                </div>
                <span className="font-title text-sm font-medium text-[#E8B58E]">
                  {averageRating}
                </span>
                <span className="font-body text-xs text-[#CFBFB6]/80">
                  ({reviewCount} {reviewCount === 1 ? 'opinia' : 'opinii'})
                </span>
                <button
                  type="button"
                  id="matrix-open-reviews-btn"
                  onClick={() => setIsReviewsModalOpen(true)}
                  className="ml-2 font-title text-xs uppercase tracking-[0.18em] text-[#E8B58E] hover:text-[#F3ECE7] underline decoration-[#D17A52]/50 underline-offset-4 transition-colors duration-200"
                >
                  OTWÓRZ OPINIE
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Editorial Headline + Price Compositional Group */}
        <div className="mt-8 sm:mt-10 flex flex-col items-start gap-3 sm:gap-4 overflow-visible w-full max-w-full">
          {/* [ PARTICLE HEADING ] */}
          <ParticleText
            text="EKSPRESOWA ANALIZA MATRYCY LOSU"
            lines={['EKSPRESOWA ANALIZA', 'MATRYCY LOSU']}
            fontSize={52}
            minFontSize={26}
            fontWeight={600}
            letterSpacing={0.14}
            lineHeight={1.22}
            colorTheme="champagne"
            align="left"
            as="h2"
            ariaLabel="EKSPRESOWA ANALIZA MATRYCY LOSU"
            onAssemblyComplete={() => {
              setTimeout(() => {
                setPriceReady(true);
              }, 200);
            }}
          />

          {/* [ PARTICLE PRICE: Directly below heading ] */}
          <div
            id="matrix-price-tag"
            className="flex items-baseline overflow-visible"
            aria-label="Cena: 250 zł"
          >
            <ParticleText
              text="250 zł"
              fontSize={33}
              minFontSize={24}
              fontWeight={600}
              letterSpacing={0.04}
              colorTheme="champagne"
              align="left"
              as="div"
              ariaLabel="Cena: 250 zł"
              variant="price"
              isPrice={true}
              revealMode="dormant"
              revealTriggered={priceReady}
            />
          </div>
        </div>

        {/* Editorial Lead Prose */}
        <div
          id="matrix-lead-description"
          className="mt-6 sm:mt-8 space-y-3 font-body text-base sm:text-lg text-[#E3D8D2] leading-[1.75] max-w-3xl font-light"
        >
          <p>
            Masz pytanie, które nie daje Ci spokoju? Otrzymaj konkretną analizę swojej sytuacji i zobacz, na co warto teraz skierować uwagę.
          </p>
          <p className="text-[#CFBFB6]/90">
            Szybka i precyzyjna odpowiedź na jedno ważne pytanie poprzez integrację Matrycy Losu — dla głębszego zrozumienia przyczyn tego, co się dzieje.
          </p>
        </div>

        {/* =========================================================================
           W ŚRODKU: Luxury Particle-Marked Editorial List
           ========================================================================= */}
        <div id="matrix-details-inside" className="mt-12 sm:mt-16 space-y-5">
          <div className="flex items-center gap-3">
            <h3 className="font-title text-xs sm:text-sm uppercase tracking-[0.22em] text-[#E8B58E] font-medium">
              W ŚRODKU
            </h3>
          </div>

          <div className="divide-y divide-[#E6B491]/10">
            {topicsList.map((item, idx) => (
              <div
                key={idx}
                className="group relative flex items-start sm:items-center gap-4 sm:gap-6 py-4.5 sm:py-5 px-3 sm:px-4 rounded-xl transition-colors duration-300 hover:bg-white/[0.015]"
              >
                <div className="w-[16px] h-[16px] shrink-0 pt-0.5 sm:pt-0 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity duration-300">
                  <ParticleMarker />
                </div>
                <span className="font-title text-sm sm:text-base lg:text-[16.5px] text-[#F3ECE7]/90 group-hover:text-white font-light tracking-wide leading-relaxed break-words min-w-0 flex-1 transition-colors duration-200">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
           FORMAT / CZAS REALIZACJI / CZEGO POTRZEBUJĘ: Large Lightweight Glass Planes
           ========================================================================= */}
        <div
          id="matrix-specs-grid"
          className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          {/* FORMAT */}
          <div
            id="matrix-format-plane"
            className="p-6 sm:p-7 rounded-2xl bg-white/[0.025] backdrop-blur-[16px] border border-[#E6B491]/[0.12] hover:border-[#E6B491]/[0.20] transition-colors duration-300 flex flex-col justify-between space-y-4"
          >
            <h4 className="font-title text-xs sm:text-sm uppercase tracking-[0.2em] text-[#E8B58E] font-medium flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D17A52]" />
              FORMAT
            </h4>
            <p className="font-body text-sm sm:text-[14.5px] text-[#D8C7BD] leading-relaxed font-light">
              Tekst, kilka screenów i wiadomości głosowe w Direct na Instagramie.
            </p>
          </div>

          {/* CZAS REALIZACJI */}
          <div
            id="matrix-turnaround-plane"
            className="p-6 sm:p-7 rounded-2xl bg-white/[0.025] backdrop-blur-[16px] border border-[#E6B491]/[0.12] hover:border-[#E6B491]/[0.20] transition-colors duration-300 flex flex-col justify-between space-y-4"
          >
            <h4 className="font-title text-xs sm:text-sm uppercase tracking-[0.2em] text-[#E8B58E] font-medium flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D17A52]" />
              CZAS REALIZACJI
            </h4>
            <p className="font-body text-sm sm:text-[14.5px] text-[#D8C7BD] leading-relaxed font-light">
              2–3 godziny od zaksięgowania płatności.
            </p>
          </div>

          {/* CZEGO POTRZEBUJĘ */}
          <div
            id="matrix-requirements-plane"
            className="p-6 sm:p-7 rounded-2xl bg-white/[0.025] backdrop-blur-[16px] border border-[#E6B491]/[0.12] hover:border-[#E6B491]/[0.20] transition-colors duration-300 flex flex-col justify-between space-y-4"
          >
            <h4 className="font-title text-xs sm:text-sm uppercase tracking-[0.2em] text-[#E8B58E] font-medium flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D17A52]" />
              CZEGO POTRZEBUJĘ
            </h4>
            <div className="space-y-2">
              <p className="font-body text-sm sm:text-[14.5px] text-[#D8C7BD] leading-relaxed font-light">
                Pełnoletność (18+), dokładna data urodzenia i Twoje pytanie.
              </p>
              <p className="text-xs text-[#E29A70]/90 italic font-light">
                W przypadku kompatybilności potrzebna jest data urodzenia drugiej osoby.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
           CTA: SKONTAKTUJ SIĘ ZE MNĄ NA INSTAGRAMIE
           ========================================================================= */}
        <div id="matrix-cta-container" className="mt-12 sm:mt-16 space-y-4 max-w-xl">
          <a
            href="https://www.instagram.com/j.moon777/"
            target="_blank"
            rel="noopener noreferrer"
            id="matrix-instagram-cta-btn"
            className="group relative inline-flex items-center justify-between gap-6 px-7 sm:px-9 py-4 sm:py-4.5 rounded-full border border-[#E6B491]/35 bg-gradient-to-r from-[#5B1533]/40 to-[#2D0818]/60 hover:from-[#731E43]/50 hover:to-[#3E0C23]/70 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(209,122,82,0.15)] hover:shadow-[0_15px_35px_-10px_rgba(209,122,82,0.3)] hover:border-[#E8B58E]/60 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Instagram size={18} className="text-[#E8B58E] group-hover:scale-110 transition-transform duration-300" />
              <span className="font-title text-xs sm:text-sm uppercase tracking-[0.2em] font-medium text-[#F8F4F0] group-hover:text-white transition-colors duration-200">
                SKONTAKTUJ SIĘ ZE MNĄ NA INSTAGRAMIE
              </span>
            </div>

            <ArrowUpRight
              size={18}
              className="text-[#E8B58E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
            />
          </a>

          <p
            id="matrix-cta-subtext"
            className="font-body text-xs sm:text-[13.5px] text-[#CFBFB6]/90 leading-relaxed font-light"
          >
            Kliknij i napisz w Direct: <span className="text-[#E8B58E] font-normal">„Ekspresowa analiza”</span>. Wyślę Ci link do płatności oraz kilka pytań potrzebnych do przygotowania analizy.
          </p>
        </div>
      </div>

      {/* Dynamic Reviews Modal */}
      <AnimatePresence>
        {isReviewsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-lg rounded-2xl bg-[#240614] border border-[#E6B491]/20 p-6 sm:p-8 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsReviewsModalOpen(false)}
                className="absolute top-5 right-5 text-[#E8B58E]/70 hover:text-[#E8B58E] transition-colors p-1"
                aria-label="Zamknij"
              >
                <X size={20} />
              </button>

              <h3 className="font-title text-xl text-[#F8F4F0] font-normal tracking-wide mb-4">
                Opinie o usłudze Ekspresowa Analiza Matrycy Losu
              </h3>

              {reviews.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={18} className="text-[#E8B58E]/40" strokeWidth={1.2} fill="none" />
                    ))}
                  </div>
                  <p className="font-body text-sm text-[#CFBFB6]">
                    Brak jeszcze opinii. Wszystkie recenzje są dodawane wyłącznie na podstawie autentycznych odpowiedzi klientek.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-white/[0.02] border border-[#E6B491]/12 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-title text-sm text-[#E8B58E]">{rev.author}</span>
                        <span className="font-body text-xs text-[#CFBFB6]/70">{rev.date}</span>
                      </div>
                      <p className="font-body text-sm text-[#E3D8D2] font-light leading-relaxed">
                        {rev.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
