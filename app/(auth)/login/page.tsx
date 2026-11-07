"use client";

import { useState, useTransition, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isPending, startTransition] = useTransition();

  function validate() {
    const errors: { email?: string; password?: string } = {};

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = "Format email tidak valid.";
    }

    if (!password) {
      errors.password = "Kata sandi wajib diisi.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    // Cek dulu email & kata sandi sebelum dikirim
    if (!validate()) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await signIn("credentials", {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
          callbackUrl,
        });

        if (!res) {
          setErrorMessage("Terjadi kesalahan jaringan atau server tidak merespons.");
          return;
        }

        if (res.error) {
          // Tampilkan pesan error dari server
          if (res.error === "CredentialsSignin" || res.status === 401) {
            setErrorMessage("Email atau kata sandi yang kamu masukkan salah.");
          } else {
            setErrorMessage(res.error || "Gagal masuk ke akun. Silakan coba lagi.");
          }
          return;
        }

        // Berhasil login
        router.push(res.url || callbackUrl);
        router.refresh();
      } catch (err) {
        console.error("Login error:", err);
        setErrorMessage("Terjadi gangguan koneksi ke server. Coba beberapa saat lagi.");
      }
    });
  }

  return (
    <div className="w-full">
      {/* Kartu form dengan gaya visual Matchday */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
        {/* Ornamen aksen halus di sudut atas */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-field/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-shuttle/20 blur-2xl" />

        {/* Header form */}
        <div className="relative mb-6 space-y-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-field/20 bg-field/10 px-3 py-1 text-xs font-semibold text-field-dark">
            <span className="size-1.5 rounded-full bg-field animate-pulse" />
            Portal Masuk Matchday
          </span>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-night sm:text-3xl">
            Masuk ke Akun
          </h1>
          <p className="text-sm text-muted-foreground">
            Akses pemesanan lapangan futsal &amp; badminton favoritmu.
          </p>
        </div>

        {/* Notifikasi jika baru registrasi */}
        {registered === "1" && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-field/20 bg-field/10 p-3.5 text-xs text-field-dark sm:text-sm"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-field" />
            <span>Akun kamu berhasil dibuat! Silakan masuk dengan email dan kata sandimu.</span>
          </div>
        )}

        {/* Alert pesan error dari server */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-danger/25 bg-danger/10 p-3.5 text-xs text-[#B91C1C] sm:text-sm animate-in fade-in slide-in-from-top-1"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" />
            <span className="flex-1 font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Input Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-night sm:text-sm">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={email}
                disabled={isPending}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                  if (errorMessage) setErrorMessage("");
                }}
                className={`h-11 rounded-xl pl-10 text-sm transition-all sm:h-12 ${
                  fieldErrors.email
                    ? "border-danger focus-visible:ring-danger/30"
                    : "border-line focus-visible:border-field focus-visible:ring-field/30"
                }`}
                aria-invalid={!!fieldErrors.email}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs font-medium text-danger">{fieldErrors.email}</p>
            )}
          </div>

          {/* Input Kata Sandi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-night sm:text-sm">
                Kata Sandi
              </Label>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                value={password}
                disabled={isPending}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                  if (errorMessage) setErrorMessage("");
                }}
                className={`h-11 rounded-xl pl-10 text-sm transition-all sm:h-12 ${
                  fieldErrors.password
                    ? "border-danger focus-visible:ring-danger/30"
                    : "border-line focus-visible:border-field focus-visible:ring-field/30"
                }`}
                aria-invalid={!!fieldErrors.password}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs font-medium text-danger">{fieldErrors.password}</p>
            )}
          </div>

          {/* Tombol Masuk dengan State Loading */}
          <Button
            type="submit"
            disabled={isPending}
            className="mt-2 h-11 w-full rounded-xl bg-field text-sm font-semibold text-white shadow-sm transition-all hover:bg-field-dark active:scale-[0.99] disabled:opacity-70 sm:h-12 sm:text-base"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-white sm:size-5" />
                <span>Memeriksa Akun...</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span>Masuk</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            )}
          </Button>

          {/* Navigasi ke Daftar Akun */}
          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground sm:text-sm">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-semibold text-field hover:text-field-dark hover:underline underline-offset-4"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Info Tambahan Mobile & Desktop */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        Dengan masuk, kamu menyetujui ketentuan pemesanan di Matchday.
      </div>
    </div>
  );
}
