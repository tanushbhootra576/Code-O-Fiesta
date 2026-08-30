'use client';

import React from 'react';

export interface RacingFlagProps {
  className?: string;
  isWaving?: boolean;
}

export default function RacingFlag({ className = '', isWaving = true }: RacingFlagProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Flagpole connecting to car rear */}
      <div className="w-1.5 h-36 sm:h-48 bg-gradient-to-b from-slate-400 via-slate-200 to-slate-500 rounded-full shadow-lg transform -rotate-6 origin-bottom z-10" />

      {/* Animated Flag Cloth Body */}
      <div
        className={`relative -ml-1 flex flex-col justify-center origin-left transform -rotate-3 transition-transform ${
          isWaving ? 'animate-[flagWave_3s_infinite_ease-in-out]' : ''
        }`}
      >
        <svg
          className="w-72 sm:w-96 md:w-[480px] h-auto drop-shadow-[0_15px_35px_rgba(139,92,246,0.5)]"
          viewBox="0 0 540 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Flag Cloth Purple/Violet Gradient */}
            <linearGradient id="flagBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="40%" stopColor="#7c3aed" />
              <stop offset="85%" stopColor="#4c1d95" />
              <stop offset="100%" stopColor="#0d0e24" />
            </linearGradient>

            {/* Checkered Racing Border Pattern */}
            <pattern id="checkeredPattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="#ffffff" />
              <rect x="8" width="8" height="8" fill="#090a1a" />
              <rect y="8" width="8" height="8" fill="#090a1a" />
              <rect x="8" y="8" width="8" height="8" fill="#ffffff" />
            </pattern>

            {/* Flag Shimmer / Cloth Fold Effect */}
            <linearGradient id="foldShine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="25%" stopColor="#000000" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="75%" stopColor="#000000" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Main Flag Cloth Shape with Waving Curves */}
          <path
            d="M 10 15 
               Q 140 35, 270 15 
               T 530 25 
               L 510 195 
               Q 270 215, 130 195 
               T 10 205 
               Z"
            fill="url(#flagBg)"
            stroke="#00f5d4"
            strokeWidth="2"
          />

          {/* Top Checkered Racing Strip */}
          <path
            d="M 10 15 Q 140 35, 270 15 T 530 25 L 526 40 Q 268 30, 130 48 T 10 30 Z"
            fill="url(#checkeredPattern)"
            opacity="0.9"
          />

          {/* Cloth Fold & Lighting Shadows */}
          <path
            d="M 10 15 Q 140 35, 270 15 T 530 25 L 510 195 Q 270 215, 130 195 T 10 205 Z"
            fill="url(#foldShine)"
          />

          {/* Text Content: CODE-O-FIESTA */}
          <g transform="rotate(-1.5, 260, 105)">
            {/* Primary Bold Title */}
            <text
              x="260"
              y="110"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="38"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              letterSpacing="2"
              className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
            >
              CODE-O-FIESTA
            </text>

            {/* Subtitle Text: BY CODECHEF VITC */}
            <text
              x="260"
              y="150"
              textAnchor="middle"
              fill="#00f5d4"
              fontSize="16"
              fontFamily="monospace"
              fontWeight="800"
              letterSpacing="3"
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
            >
              BY CODECHEF VITC
            </text>
          </g>

          {/* Bottom Cyan Accent Line */}
          <path
            d="M 10 205 Q 130 195, 270 215 T 510 195"
            stroke="#00f5d4"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Flag Wave Keyframes CSS */}
      <style jsx>{`
        @keyframes flagWave {
          0%, 100% {
            transform: rotate(-3deg) translateY(0px) skewY(0deg);
          }
          25% {
            transform: rotate(-1.5deg) translateY(-4px) skewY(1.5deg);
          }
          50% {
            transform: rotate(-4deg) translateY(2px) skewY(-1deg);
          }
          75% {
            transform: rotate(-2deg) translateY(-2px) skewY(1deg);
          }
        }
      `}</style>
    </div>
  );
}
