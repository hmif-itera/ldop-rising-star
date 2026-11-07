import { notFound, redirect } from "next/navigation";
import { PagePlaceholder } from "@/components/page-placeholder";
import { auth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export default async function PublicUserProfilePage({ params }: Ctx) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  const session = await auth();
  if (session?.user?.id === id) redirect("/profile");

  return (
    <PagePlaceholder
      title="Profil Pengguna"
      owner="Frontend"
      items={[
        "Tampilkan nama dan foto profil yang dapat dilihat publik.",
        "Tampilkan rating dan komentar publik yang pernah dibuat.",
      ]}
    />
  );
}
