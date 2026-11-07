"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main><h1>Terjadi kesalahan</h1><p>Silakan coba lagi.</p><button onClick={() => reset()}>Coba lagi</button></main>;
}
