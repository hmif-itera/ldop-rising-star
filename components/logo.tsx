import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  /** Label kecil di samping nama, misalnya "Admin". */
  tag?: string;
  className?: string;
};

export function Logo({ href = "/", tag, className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5 rounded-lg text-white outline-none focus-visible:ring-2 focus-visible:ring-shuttle", className)}
    >
      <span className="grid size-9 place-items-center rounded-[10px] bg-shuttle text-night transition-transform group-hover:-rotate-6">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <line x1="12" y1="5" x2="12" y2="19" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        Match<span className="text-shuttle">day</span>
      </span>
      {tag ? (
        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-white/80 uppercase">{tag}</span>
      ) : null}
    </Link>
  );
}
