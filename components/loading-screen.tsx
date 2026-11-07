import { CourtLines } from "@/components/court-lines";
import { Logo } from "@/components/logo";

/* ---------- Geometri adegan (viewBox 360 x 240) ---------- */
const GROUND = 210;
const HIP = { x: 82, y: 160 };
const SHOULDER_GAP = 40; // jarak pinggul ke bahu
const LEG = 50;
const UPPER_ARM = 22;
const FOREARM = 21;
const BALL_R = 9;
const RIM = { x: 303, y: 92, half: 19 };
const DURATION = 2.6; // detik per tembakan
const FRAMES = 64;

type Key = [t: number, value: number];

/** Interpolasi halus (ease in-out) di antara keyframe. */
function track(keys: Key[], t: number) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) {
      const p = (t - t0) / (t1 - t0);
      const eased = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      return v0 + (v1 - v0) * eased;
    }
  }
  return keys[keys.length - 1][1];
}

const bodyY: Key[] = [[0, 0], [0.12, 0], [0.26, 7], [0.38, -16], [0.52, -4], [0.62, 0], [1, 0]];
const shootUpper: Key[] = [[0, 35], [0.26, 50], [0.38, -62], [0.62, -50], [0.82, 35], [1, 35]];
const shootFore: Key[] = [[0, -75], [0.26, -85], [0.38, -78], [0.48, -20], [0.62, -15], [0.82, -75], [1, -75]];
const guideUpper: Key[] = [[0, 55], [0.26, 60], [0.36, -40], [0.5, 10], [0.7, 70], [1, 55]];
const guideFore: Key[] = [[0, -95], [0.26, -100], [0.36, -110], [0.5, -40], [0.7, 0], [1, -95]];
const netStretch: Key[] = [[0, 1], [0.7, 1], [0.76, 1.35], [0.84, 0.95], [0.9, 1], [1, 1]];

const RELEASE = 0.38;
const AT_RIM = 0.7;
const FLOOR = 0.88;

const rad = (deg: number) => (deg * Math.PI) / 180;

function pose(t: number) {
  const dy = track(bodyY, t);
  const hip = { x: HIP.x, y: HIP.y + dy };
  const shoulder = { x: hip.x + 2, y: hip.y - SHOULDER_GAP };
  const head = { x: shoulder.x + 1, y: shoulder.y - 16 };

  const footY = GROUND + Math.min(dy, 0);
  const legs = [-13, 13].map((spread) => {
    const foot = { x: hip.x + spread, y: footY };
    const d = Math.hypot(foot.x - hip.x, foot.y - hip.y);
    const bend = Math.sqrt(Math.max((LEG / 2) ** 2 - (d / 2) ** 2, 0));
    const knee = { x: (hip.x + foot.x) / 2 + bend, y: (hip.y + foot.y) / 2 };
    return { knee, foot };
  });

  const arm = (upper: number, fore: number) => {
    const elbow = { x: shoulder.x + UPPER_ARM * Math.cos(rad(upper)), y: shoulder.y + UPPER_ARM * Math.sin(rad(upper)) };
    const hand = { x: elbow.x + FOREARM * Math.cos(rad(fore)), y: elbow.y + FOREARM * Math.sin(rad(fore)) };
    return { elbow, hand };
  };
  const shoot = arm(track(shootUpper, t), track(shootFore, t));
  const guide = arm(track(guideUpper, t), track(guideFore, t));

  return { hip, shoulder, head, legs, shoot, guide };
}

function ballAt(t: number) {
  const held = (tt: number) => {
    const { hand } = pose(tt).shoot;
    return { x: hand.x + 2, y: hand.y - BALL_R + 1 };
  };

  if (t < RELEASE) {
    return { ...held(t), spin: 0, opacity: Math.min(t / 0.06, 1) };
  }
  if (t < AT_RIM) {
    // Lengkung parabola (kurva Bezier kuadrat) dari tangan ke tengah ring.
    const start = held(RELEASE);
    const end = { x: RIM.x, y: RIM.y - 2 };
    const ctrl = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 110 };
    const p = (t - RELEASE) / (AT_RIM - RELEASE);
    const x = (1 - p) ** 2 * start.x + 2 * (1 - p) * p * ctrl.x + p ** 2 * end.x;
    const y = (1 - p) ** 2 * start.y + 2 * (1 - p) * p * ctrl.y + p ** 2 * end.y;
    return { x, y, spin: p * -540, opacity: 1 };
  }
  if (t < FLOOR) {
    // Jatuh menembus jaring lalu ke lantai, makin lama makin cepat.
    const p = (t - AT_RIM) / (FLOOR - AT_RIM);
    return { x: RIM.x + p * 4, y: RIM.y - 2 + (GROUND - BALL_R - RIM.y + 2) * p * p, spin: -540, opacity: 1 };
  }
  // Pantulan kecil lalu menghilang.
  const p = (t - FLOOR) / (1 - FLOOR);
  const bounce = Math.sin(p * Math.PI) * 26 * (1 - p);
  return { x: RIM.x + 4 + p * 14, y: GROUND - BALL_R - bounce, spin: -540 - p * 180, opacity: 1 - p };
}

type Point = { x: number; y: number };

/** Ruas tubuh digambar sebagai garis 0→panjang, lalu digeser & diputar ke posisi sendinya. */
const SEGMENTS = {
  torso: SHOULDER_GAP,
  "thigh-a": LEG / 2,
  "shin-a": LEG / 2,
  "thigh-b": LEG / 2,
  "shin-b": LEG / 2,
  "guide-upper": UPPER_ARM,
  "guide-fore": FOREARM,
  "shoot-upper": UPPER_ARM,
  "shoot-fore": FOREARM,
};
type Part = keyof typeof SEGMENTS | "head" | "ball" | "ball-spin" | "net" | "swish";

const n = (value: number, digits = 1) => value.toFixed(digits);

function segment(from: Point, to: Point, length: number) {
  const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
  const stretch = Math.hypot(to.x - from.x, to.y - from.y) / length;
  return `transform:translate(${n(from.x)}px,${n(from.y)}px) rotate(${n(angle)}deg) scale(${n(stretch, 3)},1)`;
}

/**
 * Semua frame dihitung saat render lalu dijadikan @keyframes CSS.
 * Sengaja tanpa JavaScript di browser dan tanpa animasi SVG (SMIL): selama halaman masih dimuat,
 * React belum aktif dan timeline SMIL belum berjalan, sedangkan animasi CSS langsung jalan.
 */
function buildKeyframes() {
  const frames: Record<Part, string[]> = Object.fromEntries(
    [...Object.keys(SEGMENTS), "head", "ball", "ball-spin", "net", "swish"].map((part) => [part, []]),
  ) as unknown as Record<Part, string[]>;

  for (let i = 0; i <= FRAMES; i++) {
    const t = i / FRAMES;
    const p = pose(t);
    const b = ballAt(t);
    const at = `${n(t * 100, 3)}%`;
    const add = (part: Part, css: string) => frames[part].push(`${at}{${css}}`);

    add("torso", segment(p.hip, p.shoulder, SEGMENTS.torso));
    add("thigh-a", segment(p.hip, p.legs[0].knee, SEGMENTS["thigh-a"]));
    add("shin-a", segment(p.legs[0].knee, p.legs[0].foot, SEGMENTS["shin-a"]));
    add("thigh-b", segment(p.hip, p.legs[1].knee, SEGMENTS["thigh-b"]));
    add("shin-b", segment(p.legs[1].knee, p.legs[1].foot, SEGMENTS["shin-b"]));
    add("guide-upper", segment(p.shoulder, p.guide.elbow, SEGMENTS["guide-upper"]));
    add("guide-fore", segment(p.guide.elbow, p.guide.hand, SEGMENTS["guide-fore"]));
    add("shoot-upper", segment(p.shoulder, p.shoot.elbow, SEGMENTS["shoot-upper"]));
    add("shoot-fore", segment(p.shoot.elbow, p.shoot.hand, SEGMENTS["shoot-fore"]));
    add("head", `transform:translate(${n(p.head.x)}px,${n(p.head.y)}px)`);
    add("ball", `transform:translate(${n(b.x)}px,${n(b.y)}px);opacity:${n(b.opacity, 2)}`);
    add("ball-spin", `transform:rotate(${n(b.spin, 0)}deg)`);
    add("net", `transform:translateY(${RIM.y}px) scaleY(${n(track(netStretch, t), 3)}) translateY(${-RIM.y}px)`);
    const swish = t > 0.74 && t < 0.98 ? Math.sin(((t - 0.74) / 0.24) * Math.PI) : 0;
    add("swish", `transform:translateY(${n(-swish * 8)}px);opacity:${n(swish, 2)}`);
  }

  const keyframes = Object.entries(frames)
    .map(([part, list]) => `@keyframes md-${part}{${list.join("")}}`)
    .join("");
  const rules = Object.keys(frames)
    .map((part) => `.md-${part}{animation:md-${part} ${DURATION}s linear infinite;transform-box:view-box;transform-origin:0 0}`)
    .join("");
  // Kalau pengguna memilih "kurangi gerakan", tampilkan satu pose diam saat bola di udara.
  const reduced = `@media (prefers-reduced-motion:reduce){svg [class^="md-"]{animation-play-state:paused!important;animation-delay:-${n(DURATION * 0.55, 2)}s!important}}`;
  return keyframes + rules + reduced;
}

const sceneCss = buildKeyframes();

const tips = [
  "Memanaskan lapangan…",
  "Mengecek slot jam yang kosong…",
  "Menyiapkan jadwal tanding…",
  "Mengikat tali sepatu…",
];

export function LoadingScreen({ label = "Memuat" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-night text-slate-300">
      <style dangerouslySetInnerHTML={{ __html: sceneCss }} />
      <CourtLines />
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-shuttle/10 blur-3xl" />

      <div className="relative flex justify-center pt-8 sm:pt-10">
        <Logo />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <svg
          viewBox="0 0 360 240"
          role="img"
          aria-label="Animasi pemain melempar bola basket ke ring"
          className="w-full max-w-[22rem] sm:max-w-md lg:max-w-xl"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Lantai lapangan */}
          <line x1="12" y1={GROUND} x2="348" y2={GROUND} stroke="#1A2D42" strokeWidth="3" />
          <line x1="150" y1={GROUND} x2="348" y2={GROUND} stroke="#C6F432" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="2 7" />
          <ellipse cx={HIP.x} cy={GROUND + 3} rx="22" ry="3" fill="#000" opacity="0.25" />

          {/* Tiang, papan, dan ring */}
          <line x1="342" y1={GROUND} x2="342" y2="66" stroke="#334155" strokeWidth="6" />
          <line x1="342" y1="70" x2="328" y2="70" stroke="#334155" strokeWidth="5" />
          <rect x="324" y="44" width="7" height="60" rx="2" fill="#F8FAFC" />
          <rect x="324.5" y="64" width="6" height="22" rx="1" fill="none" stroke="#F97316" strokeWidth="1.2" />
          <line x1={RIM.x + RIM.half} y1={RIM.y} x2="324" y2={RIM.y} stroke="#C6F432" strokeWidth="3" />
          <path d={`M${RIM.x - RIM.half} ${RIM.y} A${RIM.half} 4 0 0 1 ${RIM.x + RIM.half} ${RIM.y}`} fill="none" stroke="#C6F432" strokeWidth="3" />

          {/* Jaring: ditarik ke bawah dari tepi ring saat bola masuk */}
          <g className="md-net" stroke="#F8FAFC" strokeOpacity="0.75" strokeWidth="1.3" fill="none">
            <path d={`M${RIM.x - 19} ${RIM.y} L${RIM.x - 12} ${RIM.y + 26} M${RIM.x + 19} ${RIM.y} L${RIM.x + 12} ${RIM.y + 26}`} />
            <path d={`M${RIM.x - 19} ${RIM.y} L${RIM.x + 5} ${RIM.y + 26} M${RIM.x - 6} ${RIM.y + 3} L${RIM.x + 12} ${RIM.y + 26} M${RIM.x + 8} ${RIM.y + 3} L${RIM.x + 12} ${RIM.y + 12}`} />
            <path d={`M${RIM.x + 19} ${RIM.y} L${RIM.x - 5} ${RIM.y + 26} M${RIM.x + 6} ${RIM.y + 3} L${RIM.x - 12} ${RIM.y + 26} M${RIM.x - 8} ${RIM.y + 3} L${RIM.x - 12} ${RIM.y + 12}`} />
            <path d={`M${RIM.x - 12} ${RIM.y + 26} L${RIM.x + 12} ${RIM.y + 26}`} />
          </g>

          {/* Pemain */}
          <g fill="none">
            <line className="md-guide-upper" x2={UPPER_ARM} stroke="#CBD5E1" strokeWidth="6" />
            <line className="md-guide-fore" x2={FOREARM} stroke="#CBD5E1" strokeWidth="6" />
            <line className="md-thigh-a" x2={LEG / 2} stroke="#CBD5E1" strokeWidth="7" />
            <line className="md-shin-a" x2={LEG / 2} stroke="#CBD5E1" strokeWidth="7" />
            <line className="md-thigh-b" x2={LEG / 2} stroke="#F8FAFC" strokeWidth="7" />
            <line className="md-shin-b" x2={LEG / 2} stroke="#F8FAFC" strokeWidth="7" />
            <line className="md-torso" x2={SHOULDER_GAP} stroke="#C6F432" strokeWidth="15" />
            <circle className="md-head" r="11" fill="#F8FAFC" />
          </g>

          {/* Bola */}
          <g className="md-ball">
            <g className="md-ball-spin">
              <circle r={BALL_R} fill="#F97316" />
              <g fill="none" stroke="#0F1E2E" strokeWidth="1.2" strokeOpacity="0.7">
                <line x1={-BALL_R} y1="0" x2={BALL_R} y2="0" />
                <line x1="0" y1={-BALL_R} x2="0" y2={BALL_R} />
                <path d="M-6.5 -6.5 Q-2 0 -6.5 6.5 M6.5 -6.5 Q2 0 6.5 6.5" />
              </g>
            </g>
          </g>

          <g fill="none" stroke="#F8FAFC" strokeWidth="6">
            <line className="md-shoot-upper" x2={UPPER_ARM} />
            <line className="md-shoot-fore" x2={FOREARM} />
          </g>

          {/* Sisi depan ring (digambar setelah bola supaya bola terlihat masuk) */}
          <path d={`M${RIM.x - RIM.half} ${RIM.y} A${RIM.half} 4 0 0 0 ${RIM.x + RIM.half} ${RIM.y}`} fill="none" stroke="#C6F432" strokeWidth="3" />

          <text className="md-swish" x={RIM.x - 34} y={RIM.y - 22} textAnchor="middle" fill="#C6F432" fontSize="15" fontWeight="800" fontStyle="italic">
            +2 SWISH!
          </text>
        </svg>

        {/* Progres perkiraan lewat CSS (lihat .md-progress di globals.css): cepat di awal, lalu melambat sampai 95%. */}
        <div className="md-progress mt-8 w-full max-w-xs sm:mt-10 sm:max-w-sm">
          <div className="mb-2.5 flex items-baseline justify-between gap-4">
            <p className="text-sm font-semibold text-white sm:text-base">{label}</p>
            <p className="md-progress-text text-sm font-bold text-shuttle tabular-nums" aria-hidden="true" />
          </div>
          <div role="progressbar" aria-label={label} className="h-2.5 overflow-hidden rounded-full bg-night-soft ring-1 ring-white/10">
            <div className="md-progress-bar relative h-full overflow-hidden rounded-full bg-gradient-to-r from-field to-shuttle">
              <span className="absolute inset-y-0 -left-1/2 w-1/2 animate-[matchday-shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent motion-reduce:hidden" />
            </div>
          </div>
          <p className="relative mt-3 h-5 text-center text-xs text-slate-400 sm:text-sm">
            {tips.map((tip, i) => (
              <span key={tip} className="md-tip absolute inset-x-0" style={{ animationDelay: `${i * 1.8}s` }}>
                {tip}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
