import React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { MATRIX_REVIEWS } from '../data/reviews';

export const OpinieSection: React.FC = () => {
  const review = MATRIX_REVIEWS[0];

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
        {/* Editorial Eyebrow / Section Title */}
        <div className="flex items-center gap-2.5 mb-8 sm:mb-12">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D17A52] shrink-0" />
          <h2 className="font-title text-xs sm:text-sm uppercase tracking-[0.25em] text-[#E8B58E] font-medium">
            OPINIE
          </h2>
        </div>

        {/* Authentic Client Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl rounded-2xl sm:rounded-3xl bg-white/[0.025] backdrop-blur-[16px] border border-[#E6B491]/[0.12] hover:border-[#E6B491]/[0.22] p-6 sm:p-9 md:p-11 transition-all duration-300 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
        >
          {/* Rating Stars: ★★★★★ */}
          <div
            className="flex items-center gap-1.5 mb-4 sm:mb-5"
            aria-label={`Ocena: ${review.rating} na 5 gwiazdek`}
          >
            {[1, 2, 3, 4, 5].map((starIdx) => (
              <Star
                key={starIdx}
                size={17}
                className="text-[#E8B58E] fill-[#E8B58E]"
                strokeWidth={1.25}
              />
            ))}
          </div>

          {/* Author Name: Agnieszka */}
          <h3 className="font-title text-lg sm:text-xl text-[#F8F4F0] font-normal tracking-wide mb-6 sm:mb-7">
            {review.author}
          </h3>

          {/* Review Text Body */}
          <div className="space-y-4 font-body text-sm sm:text-base md:text-[16.5px] text-[#E3D8D2] font-light leading-[1.8] max-w-full">
            <p>
              „Julio, dziękuję Ci za poświęcony czas i za odpowiedzi na moje pytania. Cieszę się, że mogłam chwilę z Tobą porozmawiać.
            </p>
            <p>
              Imponuje mi Twoja intuicja i wiedza na temat liczb i wyczucie. Dziękuję za to, co robisz.
            </p>
            <p>
              I dziękuję za dzisiejszy dzień. ☺️ Życzę Ci wszystkiego dobrego :)
            </p>
            <p className="text-[#F3ECE7]/95">
              PS. Twój sposób tłumaczenia bardzo do mnie trafia. Ciepły głos i prosty przekaz są super.”
            </p>
          </div>

          {/* Card Footer: Service Name & Rating Fraction */}
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-7 border-t border-[#E6B491]/10 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-[13px]">
            <span className="font-title uppercase tracking-[0.16em] text-[#E8B58E] font-medium">
              {review.service}
            </span>
            <span className="font-title tracking-wider text-[#CFBFB6]/80 font-normal">
              5/5
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
