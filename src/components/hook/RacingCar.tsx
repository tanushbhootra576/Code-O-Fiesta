'use client';

import React from 'react';

export interface RacingCarProps {
  className?: string;
  speedLines?: boolean;
}

export default function RacingCar({ className = '', speedLines = true }: RacingCarProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Headlight Beam Effect extending forward */}
      <div className="absolute left-[92%] top-1/2 -translate-y-1/2 w-48 sm:w-72 h-24 sm:h-36 bg-gradient-to-r from-cyan-400/40 via-cyan-400/10 to-transparent blur-md pointer-events-none origin-left transform -skew-x-12" />
      <div className="absolute left-[95%] top-1/2 -translate-y-1/2 w-32 sm:w-48 h-8 sm:h-12 bg-gradient-to-r from-white/60 to-transparent blur-sm pointer-events-none" />

      {/* Speed lines trailing behind car */}
      {speedLines && (
        <div className="absolute right-[85%] top-1/2 -translate-y-1/2 w-32 sm:w-60 h-20 flex flex-col justify-between opacity-70 pointer-events-none">
          <div className="h-[2px] w-full bg-gradient-to-l from-purple-500/80 to-transparent animate-pulse" />
          <div className="h-[1.5px] w-[80%] bg-gradient-to-l from-cyan-400/60 to-transparent self-end" />
          <div className="h-[2px] w-[90%] bg-gradient-to-l from-violet-500/60 to-transparent" />
          <div className="h-[1px] w-[60%] bg-gradient-to-l from-cyan-400/40 to-transparent self-end" />
        </div>
      )}

      {/* Exhaust Smoke / Particle Glow */}
      <div className="absolute -left-6 top-[60%] w-12 h-6 bg-gradient-to-l from-purple-500/60 via-indigo-600/30 to-transparent rounded-full blur-sm animate-ping pointer-events-none opacity-70" />

      {/* Stylized Vector Cyber Racing Supercar */}
      <svg
        className="w-64 sm:w-96 md:w-[460px] h-auto drop-shadow-[0_10px_30px_rgba(139,92,246,0.5)] filter"
        viewBox="0 0 500 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Car Body Metallic Purple Gradient */}
          <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e183a" />
            <stop offset="35%" stopColor="#120e2a" />
            <stop offset="70%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>

          {/* Cyan Energy Stripe */}
          <linearGradient id="stripeCyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#00f5d4" />
          </linearGradient>

          {/* Carbon Roof Gradient */}
          <linearGradient id="roofCarbon" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0c10" />
            <stop offset="100%" stopColor="#1e2430" />
          </linearGradient>

          {/* Headlight Glow */}
          <filter id="headlightGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shadow Underneath Car */}
        <ellipse cx="250" cy="148" rx="210" ry="10" fill="#000000" opacity="0.85" />

        {/* Rear Spoiler Wings */}
        <path d="M 40 60 L 90 60 L 80 40 L 25 40 Z" fill="#0a0c10" stroke="#8b5cf6" strokeWidth="1.5" />
        <path d="M 45 42 L 75 42" stroke="#00f5d4" strokeWidth="2" />

        {/* Main Aerodynamic Chassis Silhouette */}
        <path
          d="M 30 110 
             L 60 110 
             C 90 105, 120 70, 160 55 
             C 210 40, 310 40, 370 65 
             C 420 85, 460 95, 490 115 
             L 480 130 
             C 450 135, 380 135, 300 135 
             C 200 135, 100 135, 40 130 
             Z"
          fill="url(#carBody)"
          stroke="#8b5cf6"
          strokeWidth="1.5"
        />

        {/* Cockpit Canopy / Glass */}
        <path
          d="M 175 56 
             C 210 43, 290 43, 335 62 
             L 320 80 
             C 270 75, 210 75, 165 80 
             Z"
          fill="url(#roofCarbon)"
          stroke="#00f5d4"
          strokeWidth="1"
          opacity="0.9"
        />

        {/* Glass Reflection Highlight */}
        <path d="M 210 48 Q 250 46 290 55" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

        {/* Side Racing Decal / Racing Stripes */}
        <path d="M 120 100 L 360 92 L 390 105 L 140 112 Z" fill="url(#stripeCyan)" opacity="0.85" />
        <path d="M 180 88 L 310 84 L 320 89 L 190 93 Z" fill="#8b5cf6" />

        {/* CodeChef VITC Racing Emblem / Lettering on Side */}
        <rect x="220" y="93" width="70" height="10" rx="2" fill="#070814" opacity="0.9" />
        <text x="224" y="101" fill="#ffffff" fontSize="7" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">
          VITC CC
        </text>

        {/* Front Splitter / Air Intake */}
        <path d="M 450 120 L 495 120 L 485 132 L 440 130 Z" fill="#070814" stroke="#00f5d4" strokeWidth="1" />

        {/* Front Headlights Assembly (Laser Cyan & Violet Accent) */}
        <path d="M 455 105 L 485 110 L 475 115 L 450 112 Z" fill="#ffffff" filter="url(#headlightGlow)" />
        <polygon points="460,107 488,111 484,113 458,110" fill="#00f5d4" />

        {/* Wheels (Rear & Front Wheel Wells) */}
        {/* Rear Wheel */}
        <g className="animate-spin origin-[110px_125px]" style={{ animationDuration: '0.4s' }}>
          <circle cx="110" cy="125" r="28" fill="#0a0c10" stroke="#8b5cf6" strokeWidth="3" />
          <circle cx="110" cy="125" r="18" fill="#1b1735" stroke="#00f5d4" strokeWidth="1.5" />
          <line x1="110" y1="97" x2="110" y2="153" stroke="#8b5cf6" strokeWidth="2" />
          <line x1="82" y1="125" x2="138" y2="125" stroke="#8b5cf6" strokeWidth="2" />
          <circle cx="110" cy="125" r="6" fill="#ffffff" />
        </g>

        {/* Front Wheel */}
        <g className="animate-spin origin-[400px_125px]" style={{ animationDuration: '0.4s' }}>
          <circle cx="400" cy="125" r="26" fill="#0a0c10" stroke="#8b5cf6" strokeWidth="3" />
          <circle cx="400" cy="125" r="16" fill="#1b1735" stroke="#00f5d4" strokeWidth="1.5" />
          <line x1="400" y1="99" x2="400" y2="151" stroke="#8b5cf6" strokeWidth="2" />
          <line x1="374" y1="125" x2="426" y2="125" stroke="#8b5cf6" strokeWidth="2" />
          <circle cx="400" cy="125" r="5" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
