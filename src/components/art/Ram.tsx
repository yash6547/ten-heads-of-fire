import { forwardRef } from "react";

export const ARROW_NOCK = { x: 304, y: 280 };
const BLUE = "#3a6cc0";
const BLUE_D = "#24498a";
const GOLD = "#e7b53c";
const GOLD_D = "#9b6a16";
const STRING_REST = "M258,112 L258,280 L258,448";
const STRING_DRAWN = "M258,112 L206,280 L258,448";

interface Props { drawn?: boolean; arrowNocked?: boolean; className?: string }

/** Shri Ram — static figure; only the bow string and nocked arrow animate. */
export const Ram = forwardRef<SVGSVGElement, Props>(function Ram({ drawn, arrowNocked, className }, ref) {
  const d = drawn ? STRING_DRAWN : STRING_REST;
  return (
    <svg ref={ref} viewBox="0 0 340 600" className={className} role="img" aria-label="Shri Ram with bow and arrow" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ram-halo">
          <stop offset="0.55" stopColor="#ffd77a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ram-skin" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#5b8ee0" />
          <stop offset="1" stopColor={BLUE_D} />
        </radialGradient>
        <linearGradient id="ram-pitambar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffcf3a" />
          <stop offset="1" stopColor="#e08a12" />
        </linearGradient>
      </defs>
      <circle cx="140" cy="98" r="80" fill="url(#ram-halo)" />
      <circle cx="140" cy="98" r="56" fill="none" stroke="#ffe3a0" strokeWidth="1.5" opacity=".6" />

      {/* quiver */}
      <g transform="rotate(-14 90 240)">
        <rect x="72" y="150" width="28" height="170" rx="8" fill="#7a3e12" stroke={GOLD} strokeWidth="2.5" />
        <rect x="72" y="180" width="28" height="6" fill={GOLD} />
        <rect x="72" y="290" width="28" height="6" fill={GOLD} />
        {[78, 86, 94].map((x, i) => (
          <g key={x}>
            <line x1={x} y1={150} x2={x} y2={124 - i * 3} stroke="#d9c49a" strokeWidth="2" />
            <path d={`M${x},${118 - i * 3} l-4,10 l4,-3 l4,3 Z`} fill="#c4161c" />
          </g>
        ))}
      </g>

      {/* hair at back */}
      <path d="M110,90 Q100,150 112,190 L168,190 Q180,150 170,90 Z" fill="#120a14" />

      {/* legs + pitambar */}
      <rect x="112" y="520" width="20" height="36" rx="8" fill={BLUE} />
      <rect x="150" y="520" width="20" height="36" rx="8" fill={BLUE} />
      <ellipse cx="118" cy="560" rx="18" ry="7" fill={BLUE_D} />
      <ellipse cx="164" cy="560" rx="18" ry="7" fill={BLUE_D} />
      <rect x="110" y="534" width="24" height="5" fill={GOLD} />
      <rect x="148" y="534" width="24" height="5" fill={GOLD} />
      <path d="M100,325 L182,325 L196,530 L150,536 L141,440 L132,536 L86,530 Z" fill="url(#ram-pitambar)" stroke="#b3261e" strokeWidth="4" strokeLinejoin="round" />
      <path d="M134,335 L141,470 L148,335" stroke="#b3261e" strokeWidth="2" fill="none" />

      {/* torso */}
      <rect x="128" y="124" width="24" height="30" fill={BLUE} />
      <path d="M104,168 Q140,156 176,168 L186,250 Q184,300 180,330 L100,330 Q96,300 94,250 Z" fill="url(#ram-skin)" />
      <path d="M112,170 L170,320" stroke="#f6efd8" strokeWidth="2.2" />
      <path d="M118,166 Q140,200 162,166" stroke={GOLD} strokeWidth="4" fill="none" />
      <path d="M112,168 Q140,250 168,168" stroke="#f05a7e" strokeWidth="5" strokeDasharray="2 5" strokeLinecap="round" fill="none" />
      <path d="M108,168 Q140,330 172,168" stroke="#ffcf3a" strokeWidth="3" strokeDasharray="1 7" strokeLinecap="round" fill="none" />
      <rect x="98" y="314" width="86" height="16" rx="5" fill={GOLD} stroke={GOLD_D} />
      <circle cx="141" cy="322" r="5" fill="#c4161c" />
      {/* uttariya sash */}
      <path d="M172,166 Q190,200 176,260 Q170,300 186,340 L196,338 Q182,290 190,250 Q200,200 182,162 Z" fill="#e8601c" />
      <ellipse cx="106" cy="174" rx="16" ry="10" fill={GOLD} />
      <ellipse cx="174" cy="174" rx="16" ry="10" fill={GOLD} />

      {/* back arm to string/arrow */}
      <path d="M106,180 Q100,240 150,268 Q180,282 204,280" stroke={BLUE} strokeWidth="18" strokeLinecap="round" fill="none" />
      <rect x="128" y="250" width="22" height="7" rx="3" fill={GOLD} transform="rotate(30 139 253)" />
      <circle cx="206" cy="280" r="10" fill={BLUE} stroke={BLUE_D} />

      {/* bow (separately animated) */}
      <g id="bow">
        <path d="M258,112 Q350,280 258,448" stroke="#7a3e12" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M258,112 Q350,280 258,448" stroke={GOLD} strokeWidth="2" strokeDasharray="6 10" fill="none" />
        <path className="bow-string" d={d} style={{ d: `path("${d}")` } as React.CSSProperties} stroke="#f3ead2" strokeWidth="1.6" fill="none" />
        {arrowNocked && (
          <g>
            <line x1={drawn ? 206 : 258} y1="280" x2={drawn ? 330 : 382} y2="280" stroke="#d9c49a" strokeWidth="3" style={{ transition: "all .9s" }} />
          </g>
        )}
      </g>
      {/* front arm holding bow */}
      <path d="M172,180 Q220,220 300,278" stroke={BLUE} strokeWidth="18" strokeLinecap="round" fill="none" />
      <rect x="215" y="215" width="22" height="7" rx="3" fill={GOLD} transform="rotate(38 226 218)" />
      <circle cx="303" cy="280" r="11" fill={BLUE} stroke={BLUE_D} />
      <rect x="296" y="268" width="14" height="24" rx="3" fill="#5b2f0e" opacity=".8" />

      {/* head */}
      <ellipse cx="117" cy="104" rx="5" ry="8" fill={BLUE} />
      <ellipse cx="163" cy="104" rx="5" ry="8" fill={BLUE} />
      <ellipse cx="140" cy="102" rx="23" ry="28" fill="url(#ram-skin)" />
      <path d="M126,98 Q131,102 136,98" stroke="#0e1530" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M144,98 Q149,102 154,98" stroke="#0e1530" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M124,91 Q131,86 137,90" stroke="#0e1530" strokeWidth="1.6" fill="none" />
      <path d="M143,90 Q149,86 156,91" stroke="#0e1530" strokeWidth="1.6" fill="none" />
      <path d="M136,78 L140,94 L144,78" stroke="#f6efd8" strokeWidth="1.6" fill="none" />
      <path d="M140,80 L140,92" stroke="#c4161c" strokeWidth="1.8" />
      <path d="M140,100 Q137,108 140,111" stroke={BLUE_D} strokeWidth="1.4" fill="none" />
      <path d="M133,117 Q140,122 147,117" stroke="#9e2b3a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="116" cy="117" r="4" fill={GOLD} />
      <circle cx="164" cy="117" r="4" fill={GOLD} />
      {/* crown */}
      <path d="M115,80 Q114,48 140,26 Q166,48 165,80 Z" fill={GOLD} stroke={GOLD_D} strokeWidth="1.5" />
      <path d="M124,78 Q124,54 140,40 Q156,54 156,78 Z" fill="#c4161c" opacity=".55" />
      <rect x="113" y="74" width="54" height="8" rx="2" fill={GOLD} stroke={GOLD_D} />
      <circle cx="140" cy="58" r="5" fill="#1f8a5b" stroke="#fff0b0" />
      <circle cx="140" cy="22" r="4" fill={GOLD} stroke={GOLD_D} />
      {[121, 130, 150, 159].map((x) => <circle key={x} cx={x} cy="78" r="1.8" fill="#c4161c" />)}
    </svg>
  );
});
