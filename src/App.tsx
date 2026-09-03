import React from 'react';
import { Hero } from './components/Hero';
import { LuxuryBackground } from './components/LuxuryBackground';
import { ServiceCards } from './components/ServiceCards';
import { RoutineSection } from './components/RoutineSection';
import { ForecastSection } from './components/ForecastSection';
import { MatrixSection } from './components/MatrixSection';
import { LegalNotice } from './components/LegalNotice';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#2D0818] text-[#F8F4F0] relative selection:bg-[#B85F43]/40 selection:text-[#F8F4F0]">
      {/* Luminous Animated Gradient Luxury Atmospheric Background */}
      <LuxuryBackground />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Phase 01: Interactive Particle Hero */}
        <Hero />

        {/* Section 02: Service Cards Section */}
        <ServiceCards />

        {/* Section 03: Twoja Rutyna — 130 zł Editorial Section */}
        <RoutineSection />

        {/* Section 04: Prognoza Miesiąca — 170 zł Editorial Section */}
        <ForecastSection />

        {/* Section 05: Ekspresowa Analiza Matrycy Losu — 250 zł Editorial Section */}
        <MatrixSection />

        {/* Section 06: Nota Prawna / Disclaimer */}
        <LegalNotice />

        {/* Section 07: Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default App;
