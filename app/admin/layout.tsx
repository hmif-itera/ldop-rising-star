import { Navbar } from "@/components/navbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar variant="admin" />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
