export interface AppConfig {
  particlesDesktop: number;
  particlesTablet: number;
  particlesMobile: number;

  particleSizeDesktop: number;
  particleSizeTablet: number;
  particleSizeMobile: number;

  // Trail Impulse interaction parameters
  trailWidthMin: number;
  trailWidthMax: number;
  impulseForce: number;

  // Physics & Reconstruction parameters
  freeFlightDrag: number;
  returnSpring: number;
  returnDrag: number;
  settledSpring: number;

  // Idle micro movement
  idleNoiseAmplitude: number;
  idleNoiseSpeed: number;

  // Aesthetic color system
  background: string;
  particleColors: string[];
  particleAlphaMin: number;
  particleAlphaMax: number;
  textColorPrimary: string;
  textColorSecondary: string;
  borderColor: string;
  matrixLineColor: string;
  matrixLineOpacity: number;
}

export interface ParticleTargets {
  title: Float32Array;
  heart: Float32Array;
  diamond: Float32Array;
}

export interface MatrixNode {
  x: number;
  y: number;
  radius: number;
  clusterCount: number;
}

