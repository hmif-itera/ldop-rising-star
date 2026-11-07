import { PagePlaceholder } from "@/components/page-placeholder";

export default function AdminUsersPage() {
  return (
    <PagePlaceholder
      title="Kelola Pengguna"
      owner="Frontend"
      items={[
        "Tampilkan daftar akun pengguna.",
        "Sediakan akses untuk melihat, mengubah, dan menghapus akun pengguna.",
      ]}
    />
  );
}
