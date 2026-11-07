import { PagePlaceholder } from "@/components/page-placeholder";

export default async function EditFieldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PagePlaceholder title={`Detail Lapangan ${id}`} owner="Frontend" items={["Tampilkan detail lapangan.", "Sediakan form untuk mengubah data lapangan."]} />;
}
