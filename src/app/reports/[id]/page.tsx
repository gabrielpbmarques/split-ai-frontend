import { ReportDetailPage } from '@/components/pages/ReportDetailPage';

export default function ReportView({ params }: { params: { id: string } }) {
  return <ReportDetailPage id={params.id} />;
}
