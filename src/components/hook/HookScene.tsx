'use client';

import React, { useState, useEffect } from 'react';
import RacingCar from './RacingCar';
import RacingFlag from './RacingFlag';
import HookTitle from './HookTitle';
import HookCTA from './HookCTA';

export default function HookScene() {
  const [reducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [step, setStep] = useState<number>(() => (reducedMotion ? 4 : 0));

  useEffect(() => {
    if (reducedMotion) return;

    // Short intro animation timeline (non-intrusive)
    const t1 = setTimeout(() => setStep(1), 200);   // Lights & Grid appear
    const t2 = setTimeout(() => setStep(2), 700);   // Car enters at speed
    const t3 = setTimeout(() => setStep(3), 1600);  // Title locks into place
    const t4 = setTimeout(() => setStep(4), 2200);  // CTA reveals

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [reducedMotion]);

  return (
    <div className="relative w-full min-h-screen bg-[#05070d] text-white overflow-hidden flex flex-col justify-between select-none">
      
      {/* 1. DARK CINEMATIC BACKGROUND ENVIRONMENT */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-950/20 via-[#070a14] to-[#040508]" />

      {/* Perspective Racing Track Grid Lines */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[200%] h-[200%] -left-[50%] -top-[50%] bg-[linear-gradient(to_right,#1f293d_1px,transparent_1px),linear-gradient(to_bottom,#1f293d_1px,transparent_1px)] bg-[size:4rem_4rem] transform rotate-12 skew-x-12 animate-[gridMove_8s_linear_infinite]"
        />
      </div>

      {/* Road Horizon Speed Beam */}
      <div className="absolute top-[55%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent blur-[1px]" />
      <div className="absolute top-[55%] left-0 w-full h-[120px] bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />

      {/* Background Ambient Particles & Dust */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-cyan-400/40 blur-xs animate-ping" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-rose-500/40 blur-xs animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-rose-400/30 blur-xs animate-ping" />
      </div>

      {/* 2. HERO COMPOSITION: TITLE AT TOP */}
      <header className="relative z-20 pt-12 sm:pt-16 px-4 flex flex-col items-center">
        <HookTitle isVisible={step >= 3} />
      </header>

      {/* 3. CENTERPIECE: RACING CAR & FLAG ANIMATION SCENE */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-6">
        <div
          className={`flex items-center justify-center transition-all duration-1000 ease-out transform ${
            step >= 2 || reducedMotion
              ? 'translate-x-0 opacity-100 scale-100'
              : '-translate-x-[120%] opacity-0 scale-90'
          }`}
        >
          {/* Flag trailing behind car */}
          <div className="transform -mr-16 sm:-mr-24 z-10">
            <RacingFlag isWaving={!reducedMotion} />
          </div>

          {/* Stylized Animated Racing Car */}
          <div className="z-20">
            <RacingCar speedLines={!reducedMotion && step >= 2} />
          </div>
        </div>
      </main>

      {/* 4. FOOTER AREA: SINGLE CTA BUTTON */}
      <footer className="relative z-20 pb-12 sm:pb-16 px-4 flex flex-col items-center">
        <HookCTA isVisible={step >= 4} />
      </footer>

      {/* Grid Motion Keyframes CSS */}
      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: rotate(12deg) skewX(12deg) translateY(0px);
          }
          100% {
            transform: rotate(12deg) skewX(12deg) translateY(64px);
          }
        }
      `}</style>
    </div>
  );
}
