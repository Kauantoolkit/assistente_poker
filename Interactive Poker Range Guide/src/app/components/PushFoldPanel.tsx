import type { ParsedStrategy } from '../utils/strategyParser';
import type { StackDepth } from './GameContext';

interface PushFoldPanelProps {
  stack: StackDepth;
  position: string;
  strategy: ParsedStrategy | null;
}

// Generic push ranges when no strategy is imported
const GENERIC_PUSH: Record<string, { threshold: string; hands: string }> = {
  'pushfold': {
    threshold: '≤8BB (qualquer posição)',
    hands: 'AA–22, Ax, KQo, KJs+, KTs+, QJs',
  },
  'shortstack': {
    threshold: '≤12BB (BTN/SB)',
    hands: 'Pares, Ax, KQs, KJs, broadways suited',
  },
};

const POSITION_PUSH_NOTES: Record<string, string> = {
  UTG:  'UTG curto: range fechado. Push apenas com mãos premium.',
  CO:   'CO: amplie um pouco vs UTG sem ação.',
  BTN:  'BTN: range mais amplo. Pressione os blinds.',
  SB:   'SB: empurre antes do BB. Amplie vs campo sem ação.',
  BB:   'BB: precisa de range de call. Use chart de call vs push.',
  MP:   'MP: similar ao UTG. Mantenha range fechado.',
};

export function PushFoldPanel({ stack, position, strategy }: PushFoldPanelProps) {
  const isPushFold = stack === 'pushfold';
  const color = isPushFold ? '#ff3366' : '#ff6b35';

  // Get push/fold data from imported strategy or fallback to generic
  const strategyEntries = strategy?.pko.push_fold.filter(e => e.range_push) ?? [];
  const useStrategyData = strategyEntries.length > 0;

  return (
    <div
      className="rounded-2xl border p-5 space-y-4"
      style={{
        background: `color-mix(in srgb, ${color} 5%, var(--card))`,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
        boxShadow: `0 0 30px color-mix(in srgb, ${color} 15%, transparent)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0"
          style={{ background: `color-mix(in srgb, ${color} 20%, transparent)`, color }}
        >
          ⚡
        </div>
        <div>
          <h3
            className="text-sm font-black uppercase tracking-wide"
            style={{ color, fontFamily: "'Orbitron', sans-serif" }}
          >
            Modo {isPushFold ? 'Push/Fold' : 'Semi Push/Fold'}
          </h3>
          <p
            className="text-[10px] mt-0.5"
            style={{ color: 'var(--muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {isPushFold ? 'Nunca abra sem ir all-in' : 'Evite entrar sem intenção de all-in'}
          </p>
        </div>
      </div>

      {/* Position note */}
      {POSITION_PUSH_NOTES[position] && (
        <div
          className="rounded-lg px-3 py-2"
          style={{ background: `color-mix(in srgb, ${color} 10%, transparent)` }}
        >
          <p
            className="text-[11px]"
            style={{ color, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {POSITION_PUSH_NOTES[position]}
          </p>
        </div>
      )}

      {/* Push ranges */}
      <div className="space-y-3">
        <p
          className="text-[9px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--muted-foreground)', fontFamily: "'Orbitron', sans-serif" }}
        >
          Ranges de Push
        </p>

        {useStrategyData ? (
          strategyEntries.map((entry, i) => (
            <RangeCard
              key={i}
              label={entry.stack ?? `Situação ${i + 1}`}
              value={
                Array.isArray(entry.range_push)
                  ? entry.range_push.join(', ')
                  : String(entry.range_push)
              }
              color={color}
              type="push"
            />
          ))
        ) : (
          Object.entries(GENERIC_PUSH).map(([key, data]) => (
            <RangeCard
              key={key}
              label={data.threshold}
              value={data.hands}
              color={color}
              type="push"
            />
          ))
        )}

        {/* Call ranges from strategy */}
        {useStrategyData && strategy?.pko.push_fold
          .filter(e => e.range_call)
          .map((entry, i) => (
            <RangeCard
              key={`call-${i}`}
              label={entry.situacao ?? 'Call all-in'}
              value={typeof entry.range_call === 'string' ? entry.range_call : ''}
              color="var(--poker-suited)"
              type="call"
            />
          ))}
      </div>

      {/* Rules */}
      <div
        className="rounded-lg p-3 space-y-1.5 border"
        style={{
          background: 'var(--muted)',
          borderColor: 'var(--border)',
        }}
      >
        <p
          className="text-[9px] font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--muted-foreground)', fontFamily: "'Orbitron', sans-serif" }}
        >
          Regras gerais
        </p>
        {[
          'Empurre ANTES de ser blindado a um stack crítico',
          'BTN e SB: amplie o range de push',
          'BB: precise de odds boas para chamar',
          isPushFold
            ? 'Nunca faça open-raise convencional — é push ou fold'
            : 'Avoid multi-street play sem intenção de all-in',
        ].map((rule, i) => (
          <p
            key={i}
            className="text-[10px] flex items-start gap-2"
            style={{ color: 'var(--muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span style={{ color }}>›</span>
            {rule}
          </p>
        ))}
      </div>
    </div>
  );
}

function RangeCard({
  label,
  value,
  color,
  type,
}: {
  label: string;
  value: string;
  color: string;
  type: 'push' | 'call';
}) {
  return (
    <div
      className="rounded-lg p-3 border"
      style={{
        background: `color-mix(in srgb, ${color} 8%, var(--muted))`,
        borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
          style={{
            background: `color-mix(in srgb, ${color} 20%, transparent)`,
            color,
            fontFamily: "'Orbitron', sans-serif",
          }}
        >
          {type === 'push' ? 'PUSH' : 'CALL'}
        </span>
        <span
          className="text-[10px]"
          style={{ color: 'var(--muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-[11px] font-semibold"
        style={{ color, fontFamily: "'JetBrains Mono', monospace" }}
      >
        {value}
      </p>
    </div>
  );
}
