import { AppConfig } from './types';

export const CONFIG: AppConfig = {
  particlesDesktop: 32000,
  particlesTablet: 20000,
  particlesMobile: 12000,

  particleSizeDesktop: 1.1,
  particleSizeTablet: 1.0,
  particleSizeMobile: 0.9,

  // Mouse Trail Impulse interaction parameters (Subtle, weak interaction as requested)
  trailWidthMin: 15,
  trailWidthMax: 35,
  impulseForce: 0.7,

  // Independent particle flight & Critically damped spring reconstruction
  freeFlightDrag: 0.94,
  returnSpring: 0.035,
  returnDrag: 0.88,
  settledSpring: 0.08,

  // Idle micro movement (Subtle, calm living presence without pulsation or jitter)
  idleNoiseAmplitude: 0.0,
  idleNoiseSpeed: 0.2,

  // Authentic celestial emblem palette (Gold, Champagne, Warm Ivory, Silver & Platinum)
  background: '#2D0818',
  particleColors: [
    '#FFFFFF', // Specular pure silver/white highlight
    '#FFF8D6', // Warm ivory highlight
    '#FEE482', // Radiant polished gold
    '#E5B242', // Rich classical gold
    '#BA8220', // Warm amber bronze
    '#E8EEF5', // Lustrous platinum silver
    '#B5C2D2', // Sculpted pewter silver
  ],
  particleAlphaMin: 0.65,
  particleAlphaMax: 1.0,
  textColorPrimary: '#F8F4F0',
  textColorSecondary: 'rgba(248, 244, 240, 0.65)',
  borderColor: 'rgba(209, 122, 82, 0.45)',
  matrixLineColor: '#D17A52',
  matrixLineOpacity: 0.22,
};
