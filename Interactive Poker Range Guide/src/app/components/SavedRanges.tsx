import { Trash2, Upload, FileJson } from 'lucide-react';

interface SavedRangesProps {
  ranges: any[];
  onLoad: (range: any) => void;
  onDelete: (id: number) => void;
}

export function SavedRanges({ ranges, onLoad, onDelete }: SavedRangesProps) {
  if (ranges.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
        <div className="text-4xl mb-3 opacity-20">🎴</div>
        <p className="text-sm text-[var(--muted-foreground)] font-['JetBrains_Mono']">
          Nenhum range salvo ainda
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-2 font-['JetBrains_Mono']">
          Configure um range e clique em "Salvar"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ranges.map((range) => (
        <div
          key={range.id}
          className="group relative rounded-xl border border-[var(--border)] p-4 overflow-hidden transition-all duration-300 hover:border-[var(--poker-suited)]"
          style={{
            background: 'linear-gradient(135deg, var(--card) 0%, var(--muted) 100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--poker-pair)]/5 to-[var(--poker-suited)]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-bold font-['Orbitron'] tracking-wider"
                    style={{
                      background: range.source === 'import'
                        ? 'linear-gradient(135deg, var(--poker-3bet) 0%, var(--poker-offsuit) 100%)'
                        : 'linear-gradient(135deg, var(--poker-pair) 0%, var(--poker-suited) 100%)',
                      color: 'var(--primary-foreground)'
                    }}>
                    {range.position}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] font-['JetBrains_Mono']">•</span>
                  <span className="text-xs text-[var(--foreground)] font-['JetBrains_Mono']">
                    {range.action}
                  </span>
                  {range.source === 'import' && (
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold"
                      style={{
                        background: 'rgba(255, 0, 255, 0.15)',
                        color: 'var(--poker-3bet)',
                        border: '1px solid rgba(255,0,255,0.3)',
                      }}
                    >
                      <FileJson size={9} />
                      JSON
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-1.5 font-['JetBrains_Mono']">
                  {range.source === 'import' && range.sourceLabel
                    ? range.sourceLabel
                    : new Date(range.timestamp).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onLoad(range)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{
                  background: 'var(--poker-suited)',
                  color: 'var(--primary-foreground)'
                }}
              >
                <Upload size={14} />
                Carregar
              </button>
              <button
                onClick={() => onDelete(range.id)}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border border-[var(--destructive)] text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
