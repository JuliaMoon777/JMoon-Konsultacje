import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { useReviews } from '../context/ReviewsContext';
import { AdminReviewsModal } from './AdminReviewsModal';

export const OpinieSection: React.FC = () => {
  const { reviews, totalPublishedCount, averageRating } = useReviews();

  // Hidden admin panel trigger: 5 fast clicks on "OPINIE" heading
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const clickCount = useRef<number>(0);
  const lastClickTime = useRef<number>(0);

  const handleHeadingClick = () => {
    const now = Date.now();
    if (now - lastClickTime.current > 2000) {
      clickCount.current = 1;
    } else {
      clickCount.current += 1;
    }
    lastClickTime.current = now;

    if (clickCount.current >= 5) {
      clickCount.current = 0;
      setIsAdminModalOpen(true);
    }
  };

  const getOpinieWord = (count: number) => {
    if (count === 1) return 'opinia';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
      return 'opinie';
    }
    return 'opinii';
  };

  return (
    <section
      id="opinie"
      className="relative z-20 w-full py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-28"
      aria-label="Opinie klientów"
    >
      <div
        id="opinie-content-container"
        className="w-full max-w-[min(calc(100%-24px),1440px)] sm:max-w-[min(calc(100%-48px),1440px)] lg:max-w-[min(calc(100%-64px),1440px)] mx-auto flex flex-col items-start"
      >
        {/* Editorial Eyebrow / Section Title with hidden 5-click admin trigger */}
        <div className="flex flex-wrap items-center justify-between w-full max-w-3xl gap-4 mb-8 sm:mb-12">
          <div
            className="flex items-center gap-2.5 cursor-default select-none"
            onClick={handleHeadingClick}
            title=""
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D17A52] shrink-0" />
            <h2
              id="opinie-heading"
              className="font-title text-xs sm:text-sm uppercase tracking-[0.25em] text-[#E8B58E] font-medium transition-colors"
            >
              OPINIE
            </h2>
          </div>

          {/* Dynamic Rating Summary: ★★★★★ 5.0 (X opinii) */}
          {totalPublishedCount > 0 && (
            <div
              id="opinie-rating-summary"
              className="flex items-center gap-2 font-body text-xs sm:text-[13px] text-[#CFBFB6]/85"
            >
              <div className="flex items-center gap-1" aria-label={`Średnia ocena: ${averageRating} na 5`}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={
                      s <= Math.round(averageRating)
                        ? 'text-[#E8B58E] fill-[#E8B58E]'
                        : 'text-[#E8B58E]/30'
                    }
                  />
                ))}
              </div>
              <span className="font-title font-semibold text-[#E8B58E] text-xs sm:text-sm">
                {averageRating.toFixed(1)}
              </span>
              <span>
                ({totalPublishedCount} {getOpinieWord(totalPublishedCount)})
              </span>
            </div>
          )}
        </div>

        {/* Stable Anchor Container for "OTWÓRZ OPINIE" smooth scrolling */}
        <div
          id="opinie-list"
          className="w-full max-w-3xl flex flex-col gap-8 sm:gap-10 scroll-mt-24 sm:scroll-mt-28 lg:scroll-mt-32"
        >
          {reviews.length === 0 ? (
            <div className="w-full rounded-2xl bg-white/[0.025] backdrop-blur-[16px] border border-[#E6B491]/[0.12] p-8 text-center text-[#CFBFB6]/60 text-sm font-body">
              Opinie pojawią się wkrótce.
            </div>
          ) : (
            reviews.map((rev, index) => {
              const paragraphs = rev.text.split('\n\n').filter((p) => p.trim().length > 0);
              const authorName = rev.name || rev.author || 'Klient';

              return (
                <motion.div
                  key={rev.id || `review-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full rounded-2xl sm:rounded-3xl bg-white/[0.025] backdrop-blur-[16px] border border-[#E6B491]/[0.12] hover:border-[#E6B491]/[0.22] p-6 sm:p-9 md:p-11 transition-all duration-300 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
                >
                  {/* Rating Stars: ★★★★★ */}
                  <div
                    className="flex items-center gap-1.5 mb-4 sm:mb-5"
                    aria-label={`Ocena: ${rev.rating} na 5 gwiazdek`}
                  >
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <Star
                        key={starIdx}
                        size={17}
                        className={
                          starIdx <= rev.rating
                            ? 'text-[#E8B58E] fill-[#E8B58E]'
                            : 'text-[#E8B58E]/25'
                        }
                        strokeWidth={1.25}
                      />
                    ))}
                  </div>

                  {/* Author Name */}
                  <h3 className="font-title text-lg sm:text-xl text-[#F8F4F0] font-normal tracking-wide mb-6 sm:mb-7">
                    {authorName}
                  </h3>

                  {/* Review Text Body */}
                  <div className="space-y-4 font-body text-sm sm:text-base md:text-[16.5px] text-[#E3D8D2] font-light leading-[1.8] max-w-full">
                    {paragraphs.map((para, pIdx) => (
                      <p
                        key={pIdx}
                        className={
                          pIdx === paragraphs.length - 1 && para.includes('PS.')
                            ? 'text-[#F3ECE7]/95'
                            : ''
                        }
                      >
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Card Footer: Service Name & Rating Fraction */}
                  <div className="mt-8 sm:mt-10 pt-6 sm:pt-7 border-t border-[#E6B491]/10 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-[13px]">
                    <span className="font-title uppercase tracking-[0.16em] text-[#E8B58E] font-medium">
                      {rev.service}
                    </span>
                    <span className="font-title tracking-wider text-[#CFBFB6]/80 font-normal">
                      {rev.rating}/5
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Hidden Admin Review Panel Modal */}
      <AdminReviewsModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </section>
  );
};
