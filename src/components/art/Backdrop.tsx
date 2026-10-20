import { useMemo } from "react";

function prng(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
}

/** Night sky, moon, distant temples/city, trees, festival ground and crowd silhouettes. */
export function Backdrop({ className }: { className?: string }) {
  const { stars, crowd, lamps } = useMemo(() => {
    const r = prng(42);
    const stars = Array.from({ length: 110 }, () => ({ x: r() * 1600, y: r() * 560, s: 0.6 + r() * 1.8, d: r() * 4 }));
    const crowd: { x: number; h: number; w: number }[] = [];
    for (let x = -10; x < 1620; x += 16 + r() * 14) crowd.push({ x, h: 26 + r() * 22, w: 9 + r() * 5 });
    const lamps = Array.from({ length: 24 }, (_, i) => ({ x: 30 + i * 66 + r() * 20, y: 852 + r() * 10 }));
    return { stars, crowd, lamps };
  }, []);

  return (
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060a1f" />
          <stop offset="0.55" stopColor="#11194a" />
          <stop offset="0.85" stopColor="#3a2350" />
          <stop offset="1" stopColor="#7a3a2a" />
        </linearGradient>
        <radialGradient id="bd-moon">
          <stop offset="0" stopColor="#fff6dc" />
          <stop offset="0.7" stopColor="#f3dfae" />
          <stop offset="1" stopColor="#f3dfae" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bd-glow" cx="0.5" cy="1" r="0.7">
          <stop offset="0" stopColor="#ff9a3c" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bd-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1a22" />
          <stop offset="1" stopColor="#0b0710" />
        </linearGradient>
        <radialGradient id="bd-lamp">
          <stop offset="0" stopColor="#ffd77a" />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#bd-sky)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff7e0" className="anim-twinkle" style={{ animationDelay: `${s.d}s` }} />
      ))}
      <circle cx="1300" cy="170" r="110" fill="url(#bd-moon)" opacity="0.35" />
      <circle cx="1300" cy="170" r="52" fill="#f8ebc6" />
      <circle cx="1285" cy="160" r="8" fill="#e6d2a0" opacity=".6" />
      <circle cx="1318" cy="185" r="5" fill="#e6d2a0" opacity=".6" />
      <rect x="0" y="500" width="1600" height="500" fill="url(#bd-glow)" />
      {/* far hills */}
      <path d="M0,700 Q200,620 420,680 T820,660 T1240,670 T1600,650 L1600,1000 L0,1000 Z" fill="#1a1838" />
      {/* temple + city silhouettes */}
      <g fill="#120f28">
        <path d="M120,720 L120,640 L140,640 L150,580 L160,640 L180,640 L180,720 Z" />
        <path d="M250,720 L250,610 Q290,560 330,610 L330,720 Z" />
        <circle cx="290" cy="590" r="6" />
        <path d="M1180,720 L1180,600 L1205,600 L1230,500 L1255,600 L1280,600 L1280,720 Z" />
        <path d="M1240,500 l-10,-14 l20,0 Z" fill="#e7b53c" opacity=".7" />
        <path d="M1350,720 L1350,630 Q1390,585 1430,630 L1430,720 Z" />
        <path d="M1460,720 L1460,650 L1520,650 L1520,720 Z" />
        <path d="M420,720 L420,660 L470,660 L470,720 Z M500,720 L500,640 L540,620 L580,640 L580,720 Z" />
      </g>
      {/* trees */}
      <g fill="#0d0b1f">
        {[40, 380, 640, 980, 1120, 1560].map((x, i) => (
          <g key={x}>
            <rect x={x - 4} y={700 - (i % 2) * 20} width="8" height="60" />
            <ellipse cx={x} cy={680 - (i % 2) * 20} rx={46} ry={40} />
            <ellipse cx={x - 26} cy={700 - (i % 2) * 20} rx={30} ry={24} />
            <ellipse cx={x + 26} cy={700 - (i % 2) * 20} rx={30} ry={24} />
          </g>
        ))}
      </g>
      {/* ground */}
      <path d="M0,760 Q800,730 1600,760 L1600,1000 L0,1000 Z" fill="url(#bd-ground)" />
      {/* festive string lights */}
      <path d="M0,560 Q400,640 800,580 T1600,560" stroke="#3b2b40" strokeWidth="1.5" fill="none" />
      {Array.from({ length: 30 }, (_, i) => {
        const x = i * 55 + 10;
        const y = 560 + Math.sin((x / 1600) * Math.PI * 2) * 30 + 30 * Math.sin((x / 800) * Math.PI);
        return <circle key={i} cx={x} cy={y} r="3" fill={i % 3 === 0 ? "#ffd77a" : i % 3 === 1 ? "#ff7a3c" : "#ffe9b0"} className="anim-twinkle" style={{ animationDelay: `${(i % 5) * 0.4}s` }} />;
      })}
      {/* diyas */}
      {lamps.map((l, i) => (
        <g key={i}>
          <circle cx={l.x} cy={l.y - 6} r="16" fill="url(#bd-lamp)" opacity=".7" className="anim-glow" style={{ animationDelay: `${(i % 4) * 0.5}s` }} />
          <path d={`M${l.x - 8},${l.y} Q${l.x},${l.y + 8} ${l.x + 8},${l.y} Z`} fill="#8a4a1c" />
          <ellipse cx={l.x} cy={l.y - 5} rx="2.2" ry="4.5" fill="#ffd77a" />
        </g>
      ))}
      {/* crowd */}
      <g fill="#05030a">
        {crowd.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={1000 - c.h - c.w} r={c.w * 0.6} />
            <path d={`M${c.x - c.w},1000 L${c.x - c.w},${1000 - c.h + 6} Q${c.x},${1000 - c.h - 6} ${c.x + c.w},${1000 - c.h + 6} L${c.x + c.w},1000 Z`} />
          </g>
        ))}
      </g>
    </svg>
  );
}
