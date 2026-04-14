import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { parseStrategyJson } from '../utils/strategyParser';
import type { ParsedStrategy } from '../utils/strategyParser';

interface ImportStrategyProps {
  onImport: (strategy: ParsedStrategy) => void;
}

export function ImportStrategy({ onImport }: ImportStrategyProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        const strategy = parseStrategyJson(json);
        onImport(strategy);
      } catch {
        alert('Erro ao ler o JSON. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 border border-[var(--poker-suited)] text-[var(--poker-suited)] hover:bg-[var(--poker-suited)] hover:text-[var(--primary-foreground)]"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
        title="Importar estratégia em formato JSON"
      >
        <Upload size={16} />
        Importar JSON
      </button>
    </>
  );
}
