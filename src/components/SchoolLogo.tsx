import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number | string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ className = 'h-12 w-12', size }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Logo SDN Percontohan PAM Terdepan Makassar"
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="96" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />

      {/* Outer subtle ring */}
      <circle cx="100" cy="100" r="92" fill="#ffffff" />

      {/* Circular Text Paths */}
      <defs>
        {/* Upper text path for "SDN PERCONTOHAN PAM" */}
        <path
          id="upperSchoolTextPath"
          d="M 28 100 A 72 72 0 0 1 172 100"
          fill="none"
        />
        {/* Lower text path for "TERDEPAN" */}
        <path
          id="lowerSchoolTextPath"
          d="M 32 100 A 68 68 0 0 0 168 100"
          fill="none"
        />
        {/* Linear Gradients for Motion Streaks */}
        <linearGradient id="streakGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="streakCyan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="streakRed" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="streakGreen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>

      {/* Top Curved Text: SDN PERCONTOHAN PAM */}
      <text
        fill="#0b2c6b"
        fontSize="14.5"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="2.5"
      >
        <textPath
          href="#upperSchoolTextPath"
          startOffset="50%"
          textAnchor="middle"
        >
          SDN PERCONTOHAN PAM
        </textPath>
      </text>

      {/* Bottom Curved Text: TERDEPAN */}
      <text
        fill="#0b2c6b"
        fontSize="17.5"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="6"
      >
        <textPath
          href="#lowerSchoolTextPath"
          startOffset="50%"
          textAnchor="middle"
        >
          TERDEPAN
        </textPath>
      </text>

      {/* 4 Motion Streaks (Left side of the runner) */}
      {/* Streak 1: Orange/Gold */}
      <path
        d="M 28 80 C 44 80, 70 78, 88 84 C 74 87, 50 87, 28 85 Z"
        fill="url(#streakGold)"
      />
      <circle cx="88" cy="84" r="3.5" fill="#d97706" />

      {/* Streak 2: Cyan/Sky Blue */}
      <path
        d="M 27 96 C 44 96, 74 95, 90 99 C 76 102, 50 102, 27 100 Z"
        fill="url(#streakCyan)"
      />
      <circle cx="90" cy="99" r="4" fill="#0284c7" />

      {/* Streak 3: Red */}
      <path
        d="M 28 112 C 45 112, 70 112, 87 115 C 72 118, 50 118, 28 116 Z"
        fill="url(#streakRed)"
      />
      <circle cx="87" cy="115" r="3.5" fill="#dc2626" />

      {/* Streak 4: Green */}
      <path
        d="M 30 128 C 48 128, 68 127, 85 130 C 72 133, 52 133, 30 131 Z"
        fill="url(#streakGreen)"
      />
      <circle cx="85" cy="130" r="3.5" fill="#16a34a" />

      {/* Stylized Runner (Deep Blue #0b2c6b) */}
      <g fill="#0b2c6b">
        {/* Head */}
        <circle cx="152" cy="74" r="10" />

        {/* Dynamic Forward Right Arm */}
        <path d="M 148 84 C 158 87, 172 96, 178 112 C 176 113, 172 113, 169 110 C 164 99, 154 94, 146 90 Z" />

        {/* Back Left Arm */}
        <path d="M 124 94 C 114 84, 102 78, 96 82 C 94 85, 96 90, 102 92 C 110 94, 118 99, 126 106 Z" />

        {/* Torso & Leading Right Leg */}
        <path d="M 130 92 C 142 98, 148 108, 140 122 C 134 133, 126 142, 138 152 C 146 160, 148 163, 144 165 C 137 167, 130 162, 124 150 C 116 135, 122 124, 127 114 C 129 108, 126 102, 120 98 Z" />

        {/* Trailing Left Leg (Sprinting backward) */}
        <path d="M 125 120 C 116 128, 96 148, 66 160 C 80 148, 102 132, 115 116 Z" />
      </g>
    </svg>
  );
};
