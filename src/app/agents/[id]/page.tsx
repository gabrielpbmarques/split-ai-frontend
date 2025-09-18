import { AgentEditPage } from '@/components/pages/AgentEditPage';

export default function AgentsEdit({ params }: { params: { id: string } }) {
  return <AgentEditPage id={params.id} />;
}
