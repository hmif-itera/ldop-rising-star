import { cn } from "@/lib/utils";

/**
 * Ornamen garis lapangan tipis untuk latar gelap (navbar, hero, footer).
 * Taruh di dalam elemen `relative`; warnanya mengikuti `text-*`.
 */
export function CourtLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={cn("pointer-events-none absolute inset-0 h-full w-full text-white/[0.06]", className)}
    >
      <rect x="40" y="30" width="720" height="340" rx="6" />
      <line x1="400" y1="30" x2="400" y2="370" />
      <circle cx="400" cy="200" r="60" />
      <circle cx="400" cy="200" r="3" fill="currentColor" />
      <path d="M40 120h70a10 10 0 0 1 10 10v140a10 10 0 0 1-10 10H40" />
      <path d="M760 120h-70a10 10 0 0 0-10 10v140a10 10 0 0 0 10 10h70" />
    </svg>
  );
}
