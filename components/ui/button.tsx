import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-field/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /** Tombol utama: Booking, Simpan, Kirim. */
        default: "bg-field text-white shadow-xs hover:bg-field-dark",
        /** Sorotan di latar gelap (navbar, hero): Masuk, Booking Sekarang. */
        accent: "bg-shuttle text-night shadow-xs hover:bg-[#B5E21F] focus-visible:ring-shuttle/50",
        /** Tombol gelap di latar terang. */
        dark: "bg-night text-white shadow-xs hover:bg-night-soft",
        outline:
          "border-line bg-white text-night shadow-xs hover:border-slate-300 hover:bg-surface aria-expanded:bg-surface",
        secondary: "bg-secondary text-night hover:bg-line aria-expanded:bg-line",
        ghost: "text-night hover:bg-secondary aria-expanded:bg-secondary",
        /** Aksi berbahaya: Hapus, Batalkan booking. */
        destructive: "bg-danger text-white shadow-xs hover:bg-[#DC2626] focus-visible:ring-danger/40",
        link: "text-field underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-7 gap-1 rounded-md px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 rounded-[10px] px-3",
        lg: "h-12 gap-2 rounded-xl px-6 text-base",
        icon: "size-10",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 rounded-[10px]",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
