import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Hijau lembut: Tersedia, Aktif, Dikonfirmasi, Futsal. */
        default: "border-field/20 bg-field/10 text-field-dark",
        /** Hijau penuh untuk penekanan. */
        solid: "border-transparent bg-field text-white",
        /** Lime: Dipilih, Promo, Baru. */
        highlight: "border-transparent bg-shuttle text-night",
        /** Oranye: Badminton, Promo. */
        court: "border-court/20 bg-court/10 text-[#C2410C]",
        /** Kuning: Menunggu konfirmasi. */
        warning: "border-warning/25 bg-warning/10 text-[#B45309]",
        /** Merah: Dibatalkan, Nonaktif, Penuh. */
        danger: "border-danger/20 bg-danger/10 text-[#B91C1C]",
        /** Abu-abu: Selesai, info netral. */
        secondary: "border-transparent bg-secondary text-slate-600",
        outline: "border-line bg-white text-night",
        /** Gelap, cocok di atas foto lapangan. */
        dark: "border-transparent bg-night/85 text-white backdrop-blur-sm",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
