import { forwardRef, useId } from "react";

export type PartState = "ok" | "burning" | "charred" | "gone";
export type PartId = "legs" | "torso" | "armL" | "armR" | `head${number}`;
export type BurnMap = Partial<Record<PartId, PartState>>;

/** Head layout in SVG coords. index 9 is the central (front) head. Render order = array order. */
export const HEADS = [
  { x: 300, y: 72, s: 0.9 }, // top head behind
  { x: 62, y: 146, s: 0.84 }, { x: 538, y: 146, s: 0.84 },
  { x: 122, y: 143, s: 0.9 }, { x: 478, y: 143, s: 0.9 },
  { x: 182, y: 141, s: 0.96 }, { x: 418, y: 141, s: 0.96 },
  { x: 241, y: 140, s: 1.02 }, { x: 359, y: 140, s: 1.02 },
  { x: 300, y: 140, s: 1.16 }, // central head
];
/** Order heads ignite in: outermost pairs first, central last. */
export const HEAD_BURN_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 0, 9];

export const REGIONS: Record<string, { x: number; y: number; w: number; h: number }> = {
  legs: { x: 205, y: 425, w: 190, h: 285 },
  torso: { x: 222, y: 165, w: 156, h: 280 },
  armL: { x: 100, y: 190, w: 140, h: 245 },
  armR: { x: 360, y: 190, w: 140, h: 245 },
  ...Object.fromEntries(HEADS.map((h, i) => [`head${i}`, { x: h.x - 34 * h.s, y: h.y - 74 * h.s, w: 68 * h.s, h: 120 * h.s }])),
};
export const IMPACT_POINT = { x: 300, y: 330 };
export const RAVAN_VIEWBOX = "0 -20 600 740";

const SKIN = "#b65a2e";
const GOLD = "#e7b53c";
const GOLD_D = "#9b6a16";

function Head({ faceUrl, clipId, gradId }: { faceUrl?: string | null | undefined; clipId: string; gradId: string }) {
  return (
    <g>
      <path d="M-31,-8 C-36,24 -22,44 0,45 C22,44 36,24 31,-8 Z" fill="#1b0e0a" />
      <ellipse cx="-23" cy="5" rx="5" ry="8" fill={SKIN} />
      <ellipse cx="23" cy="5" rx="5" ry="8" fill={SKIN} />
      <ellipse cx="0" cy="4" rx="22" ry="27" fill={`url(#${gradId})`} />
      {faceUrl ? (
        <>
          <image href={faceUrl} x="-22" y="-23" width="44" height="54" clipPath={`url(#${clipId})`} preserveAspectRatio="xMidYMid slice" />
          <ellipse cx="0" cy="4" rx="22" ry="27" fill="none" stroke={GOLD_D} strokeWidth="1.5" opacity="0.8" />
        </>
      ) : (
        <g>
          <path d="M-18,-5 Q-11,-13 -3,-7" stroke="#120806" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M18,-5 Q11,-13 3,-7" stroke="#120806" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <ellipse cx="-9.5" cy="0" rx="5.5" ry="3.2" fill="#fff4dc" />
          <ellipse cx="9.5" cy="0" rx="5.5" ry="3.2" fill="#fff4dc" />
          <circle cx="-9" cy="0" r="2" fill="#a3161a" />
          <circle cx="9" cy="0" r="2" fill="#a3161a" />
          <path d="M-14.5,-0.5 Q-9.5,-4.5 -4.5,-0.5" stroke="#120806" strokeWidth="1.2" fill="none" />
          <path d="M14.5,-0.5 Q9.5,-4.5 4.5,-0.5" stroke="#120806" strokeWidth="1.2" fill="none" />
          <path d="M-3,-17 L0,-6 L3,-17" stroke="#f4ead2" strokeWidth="1.4" fill="none" />
          <path d="M0,-15 L-1.6,-8 L0,-5 L1.6,-8 Z" fill="#c4161c" />
          <path d="M0,0 Q-3.5,8 -4,10 Q0,12 4,10" stroke="#7a3214" strokeWidth="1.5" fill="none" />
          <path d="M0,13 C-6,10 -14,11 -19,17 C-21,21 -24,18 -22,14 C-16,15 -8,14.5 0,16 C8,14.5 16,15 22,14 C24,18 21,21 19,17 C14,11 6,10 0,13 Z" fill="#120806" />
          <path d="M-7,21 Q0,25 7,21" stroke="#5c0f0f" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M-5,21.5 L-4,25 L-3,22 Z M5,21.5 L4,25 L3,22 Z" fill="#fff" />
        </g>
      )}
      <circle cx="-24" cy="17" r="4.5" fill={GOLD} stroke={GOLD_D} strokeWidth="1" />
      <circle cx="24" cy="17" r="4.5" fill={GOLD} stroke={GOLD_D} strokeWidth="1" />
      <circle cx="-24" cy="17" r="1.8" fill="#c4161c" />
      <circle cx="24" cy="17" r="1.8" fill="#c4161c" />
      {/* crown (mukut) */}
      <path d="M-25,-21 L-21,-49 L-11,-40 L0,-68 L11,-40 L21,-49 L25,-21 Z" fill={GOLD} stroke={GOLD_D} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M-15,-23 L-11,-36 L0,-29 L11,-36 L15,-23 Z" fill="#a3161a" opacity="0.85" />
      <path d="M-6,-44 L0,-58 L6,-44 Z" fill="#fff0b0" opacity="0.5" />
      <rect x="-26" y="-25" width="52" height="8" rx="2" fill={GOLD} stroke={GOLD_D} strokeWidth="1.2" />
      {[-18, -9, 0, 9, 18].map((x) => (
        <circle key={x} cx={x} cy="-21" r="2" fill={x === 0 ? "#1f8a5b" : "#c4161c"} />
      ))}
      <circle cx="0" cy="-45" r="4" fill="#c4161c" stroke="#fff0b0" strokeWidth="0.8" />
      <circle cx="0" cy="-70" r="3" fill={GOLD} stroke={GOLD_D} />
      <circle cx="-21" cy="-51" r="2" fill={GOLD} />
      <circle cx="21" cy="-51" r="2" fill={GOLD} />
    </g>
  );
}

const filterFor = (uid: string, st?: PartState) =>
  st === "burning" ? `url(#burn-${uid})` : st === "charred" || st === "gone" ? `url(#char-${uid})` : undefined;

function Part({ pid, uid, burn, children }: { pid: PartId; uid: string; burn: BurnMap; children: React.ReactNode }) {
  const st = burn[pid];
  const r = REGIONS[pid]!;
  const mid = `m-${pid}-${uid}`;
  return (
    <g mask={`url(#${mid})`}>
      <defs>
        <mask id={mid} maskUnits="userSpaceOnUse" x="-50" y="-400" width="700" height="1300">
          <rect
            x={r.x - 40} y={r.y - 40} width={r.w + 80} height={r.h + 80}
            fill={`url(#mg-${uid})`} className="mask-rise"
            style={{ transform: st === "gone" ? `translateY(-${r.h + 100}px)` : "none" }}
          />
        </mask>
      </defs>
      <g className={`part ${st === "gone" ? "gone" : ""}`} filter={filterFor(uid, st)}>{children}</g>
    </g>
  );
}

interface Props { faceUrl?: string | null; burn?: BurnMap; className?: string }

export const Ravan = forwardRef<SVGSVGElement, Props>(function Ravan({ faceUrl, burn = {}, className }, ref) {
  const uid = useId().replace(/:/g, "");
  const id = (s: string) => `${s}-${uid}`;

  return (
    <svg ref={ref} viewBox={RAVAN_VIEWBOX} className={className} role="img" aria-label="Ten-headed Ravan effigy" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id("mg")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.82" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <radialGradient id={id("skin")} cx="0.45" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#d77a45" />
          <stop offset="1" stopColor="#8f3f1d" />
        </radialGradient>
        <linearGradient id={id("dhoti")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a11f1f" />
          <stop offset="1" stopColor="#5e0d14" />
        </linearGradient>
        <linearGradient id={id("armor")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24745c" />
          <stop offset="1" stopColor="#123d33" />
        </linearGradient>
        <linearGradient id={id("blade")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e8ecf2" />
          <stop offset="1" stopColor="#8d96a3" />
        </linearGradient>
        <clipPath id={id("face")}><ellipse cx="0" cy="4" rx="22" ry="27" /></clipPath>
        <filter id={id("burn")}>
          <feColorMatrix type="matrix" values="1.25 0.35 0 0 0.12  0.25 0.75 0 0 0.04  0 0 0.25 0 0  0 0 0 1 0" />
        </filter>
        <filter id={id("char")}>
          <feColorMatrix type="matrix" values="0.22 0.08 0 0 0.04  0.07 0.08 0 0 0.015  0.03 0.03 0.04 0 0  0 0 0 1 0" />
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="300" cy="708" rx="190" ry="14" fill="#000" opacity="0.4" />

      <Part uid={uid} burn={burn} pid="armL">
        <line x1="156" y1="415" x2="126" y2="262" stroke="#5b2f0e" strokeWidth="8" strokeLinecap="round" />
        <circle cx="124" cy="240" r="25" fill={GOLD} stroke={GOLD_D} strokeWidth="2" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1={124} y1={240} x2={124 + Math.cos((a * Math.PI) / 180) * 32} y2={240 + Math.sin((a * Math.PI) / 180) * 32} stroke={GOLD_D} strokeWidth="3" strokeLinecap="round" />
        ))}
        <circle cx="124" cy="240" r="9" fill="#c4161c" opacity=".8" />
        <path d="M234,212 Q192,262 179,322 Q170,372 158,405" stroke={SKIN} strokeWidth="30" strokeLinecap="round" fill="none" />
        <rect x="181" y="262" width="34" height="9" rx="3" fill={GOLD} transform="rotate(-55 198 266)" />
        <rect x="147" y="384" width="30" height="10" rx="3" fill={GOLD} transform="rotate(-75 162 389)" />
        <circle cx="157" cy="414" r="16" fill={SKIN} stroke="#7a3214" strokeWidth="1.5" />
      </Part>

      <Part uid={uid} burn={burn} pid="armR">
        <path d="M444,410 L486,212 L496,200 L494,216 L452,412 Z" fill={`url(#${id("blade")})`} stroke="#5d6672" strokeWidth="1" />
        <rect x="430" y="402" width="34" height="8" rx="3" fill={GOLD} transform="rotate(12 447 406)" />
        <path d="M366,212 Q408,262 421,322 Q430,372 442,405" stroke={SKIN} strokeWidth="30" strokeLinecap="round" fill="none" />
        <rect x="385" y="262" width="34" height="9" rx="3" fill={GOLD} transform="rotate(55 402 266)" />
        <rect x="423" y="384" width="30" height="10" rx="3" fill={GOLD} transform="rotate(75 438 389)" />
        <circle cx="443" cy="414" r="16" fill={SKIN} stroke="#7a3214" strokeWidth="1.5" />
      </Part>

      <Part uid={uid} burn={burn} pid="legs">
        <rect x="238" y="630" width="26" height="62" rx="10" fill={SKIN} />
        <rect x="336" y="630" width="26" height="62" rx="10" fill={SKIN} />
        <rect x="236" y="670" width="30" height="7" rx="3" fill={GOLD} />
        <rect x="334" y="670" width="30" height="7" rx="3" fill={GOLD} />
        <ellipse cx="246" cy="697" rx="22" ry="9" fill={SKIN} stroke="#7a3214" />
        <ellipse cx="354" cy="697" rx="22" ry="9" fill={SKIN} stroke="#7a3214" />
        <path d="M226,428 L374,428 L392,640 L332,650 L300,548 L268,650 L208,640 Z" fill={`url(#${id("dhoti")})`} stroke={GOLD} strokeWidth="4" strokeLinejoin="round" />
        {[250, 275, 325, 350].map((x) => (
          <path key={x} d={`M${x},440 L${x + (x < 300 ? -14 : 14)},630`} stroke="#3d0a0e" strokeWidth="2" opacity=".6" />
        ))}
        <path d="M285,440 L300,540 L315,440 Z" fill={GOLD} opacity=".9" />
        <path d="M290,455 L300,525 L310,455" stroke="#a3161a" strokeWidth="2" fill="none" />
      </Part>

      <Part uid={uid} burn={burn} pid="torso">
        <rect x="284" y="166" width="32" height="36" fill={SKIN} />
        <path d="M238,202 Q300,186 362,202 L374,300 Q368,380 354,432 L246,432 Q232,380 226,300 Z" fill={`url(#${id("skin")})`} />
        <path d="M248,216 Q300,206 352,216 L357,305 Q300,330 243,305 Z" fill={`url(#${id("armor")})`} stroke={GOLD} strokeWidth="3" />
        <circle cx="300" cy="262" r="17" fill={GOLD} stroke={GOLD_D} strokeWidth="2" />
        <circle cx="300" cy="262" r="8" fill="#c4161c" />
        <path d="M262,212 Q300,250 338,212" stroke={GOLD} strokeWidth="4" fill="none" />
        <path d="M252,214 Q300,290 348,214" stroke="#f3e2b0" strokeWidth="3" strokeDasharray="1 6" strokeLinecap="round" fill="none" />
        <ellipse cx="238" cy="208" rx="22" ry="14" fill={GOLD} stroke={GOLD_D} strokeWidth="2" />
        <ellipse cx="362" cy="208" rx="22" ry="14" fill={GOLD} stroke={GOLD_D} strokeWidth="2" />
        <rect x="240" y="402" width="120" height="30" rx="6" fill={GOLD} stroke={GOLD_D} strokeWidth="2" />
        {[258, 279, 300, 321, 342].map((x) => (
          <g key={x}>
            <circle cx={x} cy="417" r="5" fill={x === 300 ? "#1f8a5b" : "#c4161c"} />
            <path d={`M${x},432 L${x - 4},452 L${x + 4},452 Z`} fill={GOLD} />
          </g>
        ))}
      </Part>

      {HEADS.map((h, i) => (
        <Part key={i} uid={uid} burn={burn} pid={`head${i}`}>
          <g transform={`translate(${h.x} ${h.y}) scale(${h.s})`}>
            <Head faceUrl={faceUrl} clipId={id("face")} gradId={id("skin")} />
          </g>
        </Part>
      ))}
    </svg>
  );
});
