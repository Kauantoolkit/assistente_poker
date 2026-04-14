export type StackDepth = 'pushfold' | 'shortstack' | 'midstack' | 'deepstack';
export type BountyLevel = 'none' | 'small' | 'medium' | 'large';
export type GameSituation = 'normal' | 'bubble' | 'final';

export interface GameContextValue {
  stack: StackDepth;
  bounty: BountyLevel;
  situation: GameSituation;
}

interface GameContextProps {
  value: GameContextValue;
  onChange: (v: GameContextValue) => void;
}

const STACK_OPTIONS: { id: StackDepth; label: string; sub: string; color: string }[] = [
  { id: 'pushfold',   label: '<15BB',   sub: 'Push/Fold',  color: '#ff3366' },
  { id: 'shortstack', label: '15–25BB', sub: 'Semi P/F',   color: '#ff6b35' },
  { id: 'midstack',   label: '25–50BB', sub: 'Mid',        color: '#ffaa00' },
  { id: 'deepstack',  label: '50BB+',   sub: 'Deep',       color: '#00ffaa' },
];

const BOUNTY_OPTIONS: { id: BountyLevel; label: string; sub: string }[] = [
  { id: 'none',   label: 'Sem',    sub: 'bounty'      },
  { id: 'small',  label: 'Peq.',   sub: '~$0.36'      },
  { id: 'medium', label: 'Méd.',   sub: '$1–$2'       },
  { id: 'large',  label: 'Grande', sub: '$3+'         },
];

const SITUATION_OPTIONS: { id: GameSituation; label: string; emoji: string }[] = [
  { id: 'normal', label: 'Normal', emoji: '▶' },
  { id: 'bubble', label: 'Bolha',  emoji: '⚠' },
  { id: 'final',  label: 'FT',     emoji: '🏆' },
];

export function GameContext({ value, onChange }: GameContextProps) {
  const set = <K extends keyof GameContextValue>(key: K, val: GameContextValue[K]) =>
    onChange({ ...value, [key]: val });

  const activeStack = STACK_OPTIONS.find(o => o.id === value.stack)!;

  return (
    <div
      className="rounded-xl border border-[var(--border)] p-3 space-y-3"
      style={{ background: 'var(--card)' }}
    >
      {/* Stack depth */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
          style={{ color: 'var(--muted-foreground)', fontFamily: "'Orbitron', sans-serif" }}>
          Meu Stack
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {STACK_OPTIONS.map(opt => {
            const active = value.stack === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => set('stack', opt.id)}
                className="rounded-lg py-2 flex flex-col items-center gap-0.5 transition-all duration-200 border"
                style={{
                  background: active ? `${opt.color}22` : 'var(--muted)',
                  borderColor: active ? opt.color : 'transparent',
                  boxShadow: active ? `0 0 12px ${opt.color}44` : 'none',
                }}
              >
                <span className="text-xs font-bold" style={{
                  color: active ? opt.color : 'var(--muted-foreground)',
                  fontFamily: "'Orbitron', sans-serif",
                }}>
                  {opt.label}
                </span>
                <span className="text-[9px]" style={{
                  color: active ? opt.color : 'var(--muted-foreground)',
                  fontFamily: "'JetBrains Mono', monospace",
                  opacity: 0.8,
                }}>
                  {opt.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Bounty */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--muted-foreground)', fontFamily: "'Orbitron', sans-serif" }}>
            Bounty adversário
          </p>
          <div className="grid grid-cols-2 gap-1">
            {BOUNTY_OPTIONS.map(opt => {
              const active = value.bounty === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => set('bounty', opt.id)}
                  className="rounded-lg py-1.5 flex flex-col items-center transition-all duration-200 border"
                  style={{
                    background: active ? 'rgba(0,212,255,0.15)' : 'var(--muted)',
                    borderColor: active ? 'var(--poker-suited)' : 'transparent',
                  }}
                >
                  <span className="text-[10px] font-bold" style={{
                    color: active ? 'var(--poker-suited)' : 'var(--muted-foreground)',
                    fontFamily: "'Orbitron', sans-serif",
                  }}>
                    {opt.label}
                  </span>
                  <span className="text-[9px]" style={{
                    color: active ? 'var(--poker-suited)' : 'var(--muted-foreground)',
                    fontFamily: "'JetBrains Mono', monospace",
                    opacity: 0.7,
                  }}>
                    {opt.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Situation */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--muted-foreground)', fontFamily: "'Orbitron', sans-serif" }}>
            Situação
          </p>
          <div className="flex flex-col gap-1">
            {SITUATION_OPTIONS.map(opt => {
              const active = value.situation === opt.id;
              const color = opt.id === 'bubble' ? '#ff3366' : opt.id === 'final' ? '#ffaa00' : 'var(--poker-pair)';
              return (
                <button
                  key={opt.id}
                  onClick={() => set('situation', opt.id)}
                  className="rounded-lg py-1.5 flex items-center justify-center gap-1.5 transition-all duration-200 border"
                  style={{
                    background: active ? `${color}22` : 'var(--muted)',
                    borderColor: active ? color : 'transparent',
                  }}
                >
                  <span className="text-[11px]">{opt.emoji}</span>
                  <span className="text-[10px] font-bold" style={{
                    color: active ? color : 'var(--muted-foreground)',
                    fontFamily: "'Orbitron', sans-serif",
                  }}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current state summary */}
      <div
        className="rounded-lg px-3 py-1.5 flex items-center gap-2"
        style={{ background: `${activeStack.color}11`, border: `1px solid ${activeStack.color}33` }}
      >
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: activeStack.color }} />
        <span className="text-[10px]" style={{
          color: activeStack.color,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {activeStack.label} · {BOUNTY_OPTIONS.find(o => o.id === value.bounty)?.label} bounty · {SITUATION_OPTIONS.find(o => o.id === value.situation)?.label}
        </span>
      </div>
    </div>
  );
}
