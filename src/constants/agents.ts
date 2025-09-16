import { Agent } from '@/types';

export const AVAILABLE_AGENTS: Agent[] = [
  {
    id: 'support',
    name: 'Suporte',
    description: 'Assistente de suporte geral com capacidade de resposta criativa'
  },
  {
    id: 'message_data_parser',
    name: 'Parser de Dados',
    description: 'Especializado em análise e estruturação de dados de mensagens'
  },
  {
    id: 'extract_document',
    name: 'Extrator de Documentos',
    description: 'Focado na extração e processamento de informações de documentos'
  }
];
