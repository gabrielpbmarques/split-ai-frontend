'use client';

import React, { memo, useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAgents } from '@/contexts/AgentsContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, X, ChevronDown } from 'lucide-react';

interface AgentsMultiSelectorProps {
  selectedAgentIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export const AgentsMultiSelector = memo(function AgentsMultiSelector({ selectedAgentIds, onChange, className }: AgentsMultiSelectorProps) {
  const { agents, loading, error } = useAgents();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const agentNameById = useMemo(() => {
    const map = new Map<string, string>();
    (agents || []).forEach(a => map.set(a.id, a.name));
    return map;
  }, [agents]);

  const availableOptions = useMemo(() => {
    return (agents || [])
      .filter(a => !selectedAgentIds.includes(a.id))
      .map(a => ({ value: a.id, label: a.name }));
  }, [agents, selectedAgentIds]);

  const selectedAgents = useMemo(() => {
    return selectedAgentIds.map(id => ({
      id,
      name: agentNameById.get(id) || '—'
    }));
  }, [selectedAgentIds, agentNameById]);

  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const handleRemoveAgent = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedAgentIds.filter(id => id !== agentId));
  };

  const handleAddAgent = (agentId: string) => {
    if (!selectedAgentIds.includes(agentId)) {
      const newIds = [...selectedAgentIds, agentId];
      onChange(newIds);
    }
    setTimeout(() => setIsOpen(false), 0);
  };

  const handleToggleDropdown = () => {
    if (!loading) {
      if (!isOpen) {
        updateDropdownPosition();
      }
      setIsOpen(!isOpen);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className={`relative ${className || ''}`} ref={containerRef}>
        <div
          onClick={handleToggleDropdown}
          className="w-full liquid-glass border-0 focus:liquid-glass-strong focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3 py-2 min-h-[44px] flex items-center justify-between cursor-pointer"
        >
          <div className="flex flex-wrap gap-1 flex-1 min-h-[20px]">
            {selectedAgents.length === 0 ? (
              <span className="text-muted-foreground text-sm">
                {loading ? 'Carregando agentes...' : 'Selecionar agentes'}
              </span>
            ) : (
              selectedAgents.map((agent) => (
                <span
                  key={agent.id}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs"
                >
                  <span>{agent.name}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveAgent(agent.id, e)}
                    className="hover:text-red-500 transition-colors"
                    aria-label="Remover agente"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && availableOptions.length > 0 && typeof document !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
          <div 
            className="fixed z-[9999] liquid-glass border-0 rounded-xl shadow-lg max-h-48 overflow-y-auto"
            style={{ 
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width
            }}
          >
            {availableOptions.map((option) => (
              <div
                key={option.value}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleAddAgent(option.value);
                }}
                role="option"
                tabIndex={-1}
                className="px-3 py-2 hover:bg-blue-500/10 cursor-pointer text-sm transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {option.label}
              </div>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
});
