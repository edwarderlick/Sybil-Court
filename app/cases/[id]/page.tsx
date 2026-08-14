import { CaseDetailView } from "@/components/cases/CaseDetailView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CaseDetailView caseId={id} />;
}
