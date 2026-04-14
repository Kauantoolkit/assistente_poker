interface PositionSelectorProps {
  selected: string;
  onSelect: (position: string) => void;
}

const POSITIONS = [
  { name: 'UTG', description: 'Under the Gun' },
  { name: 'MP', description: 'Middle Position' },
  { name: 'CO', description: 'Cutoff' },
  { name: 'BTN', description: 'Button' },
  { name: 'SB', description: 'Small Blind' },
  { name: 'BB', description: 'Big Blind' },
];

export function PositionSelector({ selected, onSelect }: PositionSelectorProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {POSITIONS.map((position) => {
        const isSelected = selected === position.name;
        return (
          <button
            key={position.name}
            onClick={() => onSelect(position.name)}
            className={`
              relative px-3 py-3 rounded-lg font-bold text-sm
              transition-all duration-300 overflow-hidden group
              border-2
              ${isSelected
                ? 'border-[var(--poker-pair)] text-[var(--primary-foreground)] scale-105'
                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--poker-suited)]'
              }
            `}
            style={{
              background: isSelected
                ? 'linear-gradient(135deg, var(--poker-pair) 0%, var(--poker-suited) 100%)'
                : 'var(--card)',
              boxShadow: isSelected
                ? '0 0 25px rgba(0, 255, 170, 0.4)'
                : 'none'
            }}
            title={position.description}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="font-['Orbitron'] tracking-wider">{position.name}</div>
              <div className="text-[9px] font-['JetBrains_Mono'] opacity-70 mt-0.5 hidden sm:block">
                {position.description.split(' ').map(w => w[0]).join('')}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
