import { cn } from "@/lib/utils";

/** Pembungkus lebar konten yang sama untuk semua halaman (maks 72rem, padding samping 16px di HP). */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />;
}
