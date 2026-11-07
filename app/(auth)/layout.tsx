import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (session?.user) redirect(session.user.role === "ADMIN" ? "/admin" : "/booking");
  return (
    <>
      <Navbar variant="auth" />
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center sm:py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <Footer />
    </>
  );
}
