import { notFound } from "next/navigation";
import MosqueEditForm from "@/components/mosque-edit-form";
import { getMosqueById } from "@/lib/mosque-store";

type MosqueEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MosqueEditPage({ params }: MosqueEditPageProps) {
  const { id } = await params;
  const mosque = await getMosqueById(id);

  if (!mosque) {
    notFound();
  }

  return <MosqueEditForm mosque={mosque} />;
}
