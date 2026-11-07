"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.get("nama"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message ?? "Pendaftaran gagal. Coba lagi nanti.");
        setLoading(false);
        return;
      }

      const login = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });
      setLoading(false);
      if (login?.error) {
        router.push("/login?registered=1");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Tidak terhubung dengan database. Silahkan coba lagi nanti.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Buat akun</CardTitle>
        <CardDescription>Daftar untuk mulai memesan lapangan.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama</Label>
            <Input id="nama" name="nama" autoComplete="name" placeholder="Nama lengkap" maxLength={100} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata sandi</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} placeholder="Minimal 8 karakter" required />
          </div>
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Buat akun"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun? <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/login">Masuk</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
