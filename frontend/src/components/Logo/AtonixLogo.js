import React from 'react';

const AtonixLogo = ({ size = 'medium' }) => {
  return (
    <div className={`atonix-logo ${size}`}>
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        {/* Outer circle - gradient background */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f093fb" />
            <stop offset="100%" stopColor="#f5576c" />
          </linearGradient>
        </defs>

        {/* Main circle background */}
        <circle cx="100" cy="100" r="95" fill="url(#logoGradient)" />

        {/* Decorative rings */}
        <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Main symbol - stylized "A" for Atonix with growth arrow */}
        <g className="logo-symbol">
          {/* Left upward line of A */}
          <line x1="70" y1="130" x2="85" y2="60" stroke="white" strokeWidth="8" strokeLinecap="round" />

          {/* Right upward line of A */}
          <line x1="130" y1="130" x2="115" y2="60" stroke="white" strokeWidth="8" strokeLinecap="round" />

          {/* Horizontal bar of A */}
          <line x1="75" y1="105" x2="125" y2="105" stroke="white" strokeWidth="7" strokeLinecap="round" />

          {/* Growth arrow accent - upward and right */}
          <g transform="translate(120, 55)">
            {/* Arrow line */}
            <line x1="0" y1="15" x2="0" y2="-5" stroke="url(#accentGradient)" strokeWidth="6" strokeLinecap="round" />
            <line x1="0" y1="-5" x2="15" y2="-5" stroke="url(#accentGradient)" strokeWidth="6" strokeLinecap="round" />

            {/* Arrow head */}
            <polygon points="0,-5 5,-12 -5,-12" fill="url(#accentGradient)" />
            <polygon points="15,-5 22,0 15,5" fill="url(#accentGradient)" />
          </g>

          {/* Accent dots - representing connectivity/network */}
          <circle cx="60" cy="140" r="4" fill="rgba(255,255,255,0.8)" />
          <circle cx="140" cy="140" r="4" fill="rgba(255,255,255,0.8)" />
          <circle cx="100" cy="155" r="4" fill="rgba(255,255,255,0.8)" />
        </g>

        {/* Center highlight for depth */}
        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" opacity="0.5" />
      </svg>

      <style>{`
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .atonix-logo.animated .logo-svg {
          animation: logoFloat 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AtonixLogo;
