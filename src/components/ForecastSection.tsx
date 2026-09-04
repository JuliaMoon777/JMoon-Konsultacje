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

export const ForecastSection: React.FC = () => {
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

  const forecastItems = [
    {
      bold: 'Trzy kluczowe archetypy',
      rest: ' dla wybranego miesiąca',
    },
    {
      bold: 'Główne energie i zadania',
      rest: ' na ten czas',
    },
    {
      bold: 'Ostrzeżenia',
      rest: ' oraz obszary do rozwoju',
    },
    {
      bold: 'Praktyczne wskazówki',
      rest: ', gdzie skierować energię i uwagę',
    },
    {
      bold: 'Odpowiedź na jedno ważne pytanie',
      rest: ' przez pryzmat aktualnych energii',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="prognoza-miesiaca"
      className="relative z-20 w-full py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-8 scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-28"
    >
      {/* Editorial Content Container */}
      <div
        id="forecast-content-container"
        className="w-full max-w-[min(calc(100%-24px),1440px)] sm:max-w-[min(calc(100%-48px),1440px)] lg:max-w-[min(calc(100%-64px),1440px)] mx-auto"
      >
        {/* Top Bar: Dynamic Rating Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
          <div id="forecast-rating-block" className="flex items-center gap-3">
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
                  id="forecast-open-reviews-btn"
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
            text="INDYWIDUALNA PROGNOZA MIESIĄCA"
            fontSize={56}
            minFontSize={22}
            fontWeight={600}
            letterSpacing={0.16}
            colorTheme="champagne"
            align="left"
            as="h2"
            ariaLabel="INDYWIDUALNA PROGNOZA MIESIĄCA"
            onAssemblyComplete={() => {
              setTimeout(() => {
                setPriceReady(true);
              }, 200);
            }}
          />

          {/* [ PARTICLE PRICE: Directly below heading ] */}
          <div
            id="forecast-price-tag"
            className="flex items-baseline overflow-visible"
            aria-label="Cena: 170 zł"
          >
            <ParticleText
              text="170 zł"
              fontSize={33}
              minFontSize={24}
              fontWeight={600}
              letterSpacing={0.04}
              colorTheme="champagne"
              align="left"
              as="div"
              ariaLabel="Cena: 170 zł"
              variant="price"
              isPrice={true}
              revealMode="dormant"
              revealTriggered={priceReady}
            />
          </div>
        </div>

        {/* Subtle Jewelry Talisman Charms Row */}
        <div
          id="forecast-charms-row"
          className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4 select-none"
          aria-hidden="true"
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.025] backdrop-blur-[10px] border border-[#E6B491]/14">
            <span className="text-xs text-[#E8B58E]/90 font-light">♡</span>
            <span className="font-body text-[11px] uppercase tracking-wider text-[#CFBFB6]/80">Relacje</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.025] backdrop-blur-[10px] border border-[#E6B491]/14">
            <span className="text-xs text-[#E8B58E]/90 font-light">$</span>
            <span className="font-body text-[11px] uppercase tracking-wider text-[#CFBFB6]/80">Finanse</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.025] backdrop-blur-[10px] border border-[#E6B491]/14">
            <span className="text-xs text-[#E8B58E]/90 font-light">★</span>
            <span className="font-body text-[11px] uppercase tracking-wider text-[#CFBFB6]/80">Archetyp</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.025] backdrop-blur-[10px] border border-[#E6B491]/14">
            <span className="text-xs text-[#E8B58E]/90 font-light">?</span>
            <span className="font-body text-[11px] uppercase tracking-wider text-[#CFBFB6]/80">Pytanie</span>
          </div>
        </div>

        {/* Editorial Lead Prose */}
        <div
          id="forecast-lead-description"
          className="mt-6 sm:mt-8 space-y-3 font-body text-base sm:text-lg text-[#E3D8D2] leading-[1.75] max-w-3xl font-light"
        >
          <p>
            Dzięki dacie urodzenia dowiesz się, jakie energie będą u Ciebie dominować w wybranym miesiącu. Zobaczysz, na co zwrócić uwagę i jak najlepiej wykorzystać szanse, które niesie ten czas.
          </p>
          <p className="text-[#CFBFB6]/90">
            Mój autorski system prognozowania, oparty na numerologii karmicznej oraz wiedzy o archetypach, sprawdził się w praktyce podczas licznych analiz dla moich klientów. W każdym miesiącu ujawniają się u nas trzy najsilniejsze archetypy — to one wskazują kluczowe energie, wyzwania i obszary do pracy.
          </p>
        </div>

        {/* =========================================================================
           CO DOSTAJESZ W ANALIZIE: Luxury Particle-Marked Editorial List
           ========================================================================= */}
        <div id="forecast-details-inside" className="mt-12 sm:mt-16 space-y-5">
          <div className="flex items-center gap-3">
            <h3 className="font-title text-xs sm:text-sm uppercase tracking-[0.22em] text-[#E8B58E] font-medium">
              CO DOSTAJESZ W ANALIZIE:
            </h3>
          </div>

          <div className="divide-y divide-[#E6B491]/10">
            {forecastItems.map((item, idx) => (
              <div
                key={idx}
                className="group relative flex items-start gap-4 sm:gap-6 py-4.5 sm:py-5 px-3 sm:px-4 rounded-xl transition-colors duration-300 hover:bg-white/[0.015]"
              >
                <div className="w-[16px] h-[16px] shrink-0 mt-1 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity duration-300">
                  <ParticleMarker />
                </div>
                <p className="font-body text-sm sm:text-[15px] lg:text-base text-[#D8C7BD] font-light leading-relaxed tracking-wide break-words min-w-0 flex-1 transition-colors duration-200">
                  <strong className="font-medium text-[#F8F4F0] group-hover:text-white transition-colors duration-200">
                    {item.bold}
                  </strong>
                  <span>{item.rest}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
           FORMAT / CZAS REALIZACJI / CZEGO POTRZEBUJĘ: Harmonious Glass Specs Grid
           ========================================================================= */}
        <div
          id="forecast-specs-grid"
          className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch"
        >
          {/* FORMAT */}
          <div
            id="forecast-format-plane"
            className="h-full p-6 sm:p-7 rounded-2xl bg-white/[0.025] backdrop-blur-[16px] border border-[#E6B491]/[0.12] hover:border-[#E6B491]/[0.20] transition-colors duration-300 flex flex-col"
          >
            <h4 className="font-title text-xs sm:text-sm uppercase tracking-[0.2em] text-[#E8B58E] font-medium flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D17A52] shrink-0" />
              FORMAT
            </h4>
            <div className="mt-5 sm:mt-6 flex-1 flex flex-col space-y-3 sm:space-y-3.5">
              <p className="font-body text-sm sm:text-[14.5px] text-[#F8F4F0] font-normal leading-snug tracking-wide">
                Bezpośrednio w Direct na Instagramie
              </p>
              <p className="font-body text-xs sm:text-[13.5px] text-[#D8C7BD] font-light leading-relaxed">
                Osobiste wiadomości głosowe z interpretacją dominujących archetypów.
              </p>
              <p className="font-body text-xs sm:text-[12.5px] text-[#CFBFB6]/80 font-light leading-relaxed">
                Podsumowanie tekstowe najważniejszych okresów oraz zrzuty ekranu.
              </p>
            </div>
          </div>

          {/* CZAS REALIZACJI */}
          <div
            id="forecast-turnaround-plane"
            className="h-full p-6 sm:p-7 rounded-2xl bg-white/[0.025] backdrop-blur-[16px] border border-[#E6B491]/[0.12] hover:border-[#E6B491]/[0.20] transition-colors duration-300 flex flex-col"
          >
            <h4 className="font-title text-xs sm:text-sm uppercase tracking-[0.2em] text-[#E8B58E] font-medium flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D17A52] shrink-0" />
              CZAS REALIZACJI
            </h4>
            <div className="mt-5 sm:mt-6 flex-1 flex flex-col space-y-3 sm:space-y-3.5">
              <p className="font-body text-sm sm:text-[14.5px] text-[#F8F4F0] font-normal leading-snug tracking-wide">
                2–3 godziny w godzinach realizacji
              </p>
              <p className="font-body text-xs sm:text-[13.5px] text-[#D8C7BD] font-light leading-relaxed">
                Usługi realizowane są od poniedziałku do piątku, do godz. 21:00.
              </p>
              <p className="font-body text-xs sm:text-[12.5px] text-[#CFBFB6]/80 font-light leading-relaxed">
                Zamówienia złożone po godz. 21:00, w weekendy lub dni ustawowo wolne od pracy realizowane są w najbliższym dniu roboczym.
              </p>
            </div>
          </div>

          {/* CZEGO POTRZEBUJĘ */}
          <div
            id="forecast-requirements-plane"
            className="h-full p-6 sm:p-7 rounded-2xl bg-white/[0.025] backdrop-blur-[16px] border border-[#E6B491]/[0.12] hover:border-[#E6B491]/[0.20] transition-colors duration-300 flex flex-col"
          >
            <h4 className="font-title text-xs sm:text-sm uppercase tracking-[0.2em] text-[#E8B58E] font-medium flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D17A52] shrink-0" />
              CZEGO POTRZEBUJĘ
            </h4>
            <div className="mt-5 sm:mt-6 flex-1 flex flex-col space-y-3 sm:space-y-3.5">
              <p className="font-body text-sm sm:text-[14.5px] text-[#F8F4F0] font-normal leading-snug tracking-wide">
                Pełnoletność (18+) oraz data urodzenia
              </p>
              <p className="font-body text-xs sm:text-[13.5px] text-[#D8C7BD] font-light leading-relaxed">
                Do przygotowania prognozy wystarczy wyłącznie dokładna data Twojego urodzenia.
              </p>
              <p className="font-body text-xs sm:text-[12.5px] text-[#CFBFB6]/80 font-light leading-relaxed">
                Dokładna godzina oraz miejsce urodzenia w tej analizie nie są wymagane.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
           CTA: SKONTAKTUJ SIĘ ZE MNĄ NA INSTAGRAMIE
           ========================================================================= */}
        <div id="forecast-cta-container" className="mt-12 sm:mt-16 space-y-4 max-w-xl">
          <a
            href="https://www.instagram.com/j.moon777/"
            target="_blank"
            rel="noopener noreferrer"
            id="forecast-instagram-cta-btn"
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
            id="forecast-cta-subtext"
            className="font-body text-xs sm:text-[13.5px] text-[#CFBFB6]/90 leading-relaxed font-light"
          >
            Kliknij i napisz w Direct: <span className="text-[#E8B58E] font-normal">„Indywidualna prognoza miesiąca”</span>. Wyślę Ci link do płatności oraz kilka pytań potrzebnych do przygotowania analizy.
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
                Opinie o usłudze Indywidualna Prognoza Miesiąca
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
