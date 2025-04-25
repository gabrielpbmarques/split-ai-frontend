import React from 'react';

interface LinkifyTextProps {
  text: string;
}

interface Match {
  index: number;
  length: number;
  match: RegExpExecArray;
  type: string;
}

/**
 * Componente que detecta URLs em texto e as transforma em links clicáveis
 * Também suporta formatação básica como negrito (texto entre asteriscos)
 */
const LinkifyText: React.FC<LinkifyTextProps> = ({ text }) => {
  // Função para processar o texto e renderizar os links
  const renderText = () => {
    // Dividir o texto em linhas para preservar quebras de linha
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Definir padrões para detectar links e formatação
      const patterns = [
        // Detectar padrões de lista com marcadores e formatação
        // Prioritário: "*Nome completo:** Valor" (formato comum em listas)
        { regex: /(^|\s)\*([^*:]+):\*\*/g, type: 'list-bold', priority: 10 },
        
        // Marcadores de lista simples "* Item" ou "- Item"
        { regex: /(^|\n)(\s*)([*\-•])\s+/g, type: 'list-marker', priority: 9 },
        
        // Links no formato markdown [texto](url)
        { regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: 'markdown-link', priority: 8 },
        
        // Texto em negrito entre asteriscos duplos **texto** (estilo WhatsApp)
        { regex: /\*\*([^*]+?)\*\*/g, type: 'bold', priority: 7 },
        
        // Texto em itálico entre sublinhados _texto_ (estilo WhatsApp)
        { regex: /_([^_]+)_/g, type: 'italic', priority: 6 },
        
        // Texto tachado entre til ~texto~ (estilo WhatsApp)
        { regex: /~([^~]+)~/g, type: 'strikethrough', priority: 5 },
        
        // URLs simples
        { regex: /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g, type: 'url', priority: 4 }
      ];
      
      let lastIndex = 0;
      const parts: React.ReactNode[] = [];
      const matches: Match[] = [];
      
      // Encontrar todas as correspondências de todos os padrões
      patterns.forEach(pattern => {
        let match: RegExpExecArray | null;
        pattern.regex.lastIndex = 0; // Resetar o regex antes de começar
        
        while ((match = pattern.regex.exec(line)) !== null) {
          matches.push({
            index: match.index,
            length: match[0].length,
            match: match,
            type: pattern.type
          });
        }
      });
      
      // Ordenar as correspondências primeiro por posição e depois por prioridade (se mesma posição)
      matches.sort((a, b) => {
        // Se os índices são diferentes, ordena por posição
        if (a.index !== b.index) {
          return a.index - b.index;
        }
        
        // Se os índices são iguais, ordena por prioridade (maior prioridade primeiro)
        const priorityA = patterns.find(p => p.type === a.type)?.priority || 0;
        const priorityB = patterns.find(p => p.type === b.type)?.priority || 0;
        return priorityB - priorityA;
      });
      
      // Filtrar correspondências sobrepostas (priorizando as que começam primeiro)
      const filteredMatches = matches.filter((match, index, self) => {
        // Se esta é a primeira correspondência, mantém
        if (index === 0) return true;
        
        // Verifica se esta correspondência se sobrepõe a alguma anterior
        for (let i = 0; i < index; i++) {
          const prevMatch = self[i];
          const prevEnd = prevMatch.index + prevMatch.length;
          
          // Se esta correspondência começa antes do fim da anterior, descarta
          if (match.index < prevEnd) {
            return false;
          }
        }
        
        return true;
      });
      
      // Processar todas as correspondências
      filteredMatches.forEach(matchItem => {
        const { index, match, type } = matchItem;
        
        // Adicionar texto antes da correspondência
        if (index > lastIndex) {
          parts.push(
            <span key={`${lineIndex}-text-${lastIndex}`}>
              {line.substring(lastIndex, index)}
            </span>
          );
        }
        
        // Adicionar o elemento apropriado com base no tipo
        if (type === 'markdown-link') {
          parts.push(
            <a 
              key={`${lineIndex}-link-${index}`}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {match[1]}
            </a>
          );
        } else if (type === 'bold') {
          parts.push(
            <strong key={`${lineIndex}-bold-${index}`}>
              {match[1]}
            </strong>
          );
        } else if (type === 'list-bold') {
          // Processar o formato "*Nome completo:** Valor" comum em listas
          const prefix = match[1]; // Espaço ou início de linha
          const boldText = match[2].trim(); // O texto entre * e :** (removendo espaços extras)
          
          parts.push(
            <React.Fragment key={`${lineIndex}-list-bold-${index}`}>
              {prefix}<strong>{boldText}:</strong>
            </React.Fragment>
          );
          
          // Ajustar o lastIndex para evitar processar o mesmo texto novamente
          lastIndex = index + match[0].length;
        } else if (type === 'list-marker') {
          // Processar marcadores de lista (*, -, •)
          const prefix = match[1]; // Quebra de linha ou início
          const indent = match[2]; // Espaços de indentação
          const marker = match[3]; // O marcador (*, -, •)
          
          parts.push(
            <React.Fragment key={`${lineIndex}-list-marker-${index}`}>
              {prefix}{indent}<span className="inline-block w-4">•</span>
            </React.Fragment>
          );
          
          // Ajustar o lastIndex para evitar processar o mesmo texto novamente
          lastIndex = index + match[0].length;
        } else if (type === 'italic') {
          parts.push(
            <em key={`${lineIndex}-italic-${index}`}>
              {match[1]}
            </em>
          );
        } else if (type === 'strikethrough') {
          parts.push(
            <span key={`${lineIndex}-strike-${index}`} className="line-through">
              {match[1]}
            </span>
          );
        } else if (type === 'url') {
          const url = match[0];
          const href = url.startsWith('http') ? url : `https://${url}`;
          
          parts.push(
            <a 
              key={`${lineIndex}-url-${index}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {url}
            </a>
          );
        }
        
        lastIndex = index + match[0].length;
      });
      
      // Adicionar o restante do texto após a última correspondência
      if (lastIndex < line.length) {
        parts.push(
          <span key={`${lineIndex}-text-end`}>
            {line.substring(lastIndex)}
          </span>
        );
      }
      
      // Retornar a linha com todos os elementos
      return (
        <React.Fragment key={`line-${lineIndex}`}>
          {parts}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };
  
  return <div className="whitespace-pre-wrap">{renderText()}</div>;
};

export default LinkifyText;
