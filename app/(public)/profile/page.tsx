import Link from "next/link";
import { PagePlaceholder } from "@/components/page-placeholder";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="space-y-4">
      <PagePlaceholder
        title="Profil Pengguna"
        owner="Frontend"
        items={[
          "Tampilkan nama dan foto profil yang dapat dilihat publik.",
          "Tampilkan rating dan komentar publik yang pernah dibuat.",
        ]}
      />
      {session?.user ? (
        <Button asChild>
          <Link href="/profile/edit">Ubah profil</Link>
        </Button>
      ) : null}
    </div>
  );
}
