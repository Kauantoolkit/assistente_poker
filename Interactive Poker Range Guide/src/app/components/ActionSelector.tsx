interface ActionSelectorProps {
  selected: string;
  onSelect: (action: string) => void;
}

const ACTIONS = [
  { name: 'Open Raise', icon: '↗', color: 'var(--poker-raise)' },
  { name: '3-Bet', icon: '↗↗', color: 'var(--poker-3bet)' },
  { name: '4-Bet', icon: '↗↗↗', color: '#ff6b35' },
  { name: 'Call', icon: '→', color: 'var(--poker-suited)' },
  { name: 'Defend BB', icon: '🛡', color: 'var(--poker-call)' },
  { name: 'Cold Call', icon: '❄', color: '#4cc9f0' },
];

export function ActionSelector({ selected, onSelect }: ActionSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {ACTIONS.map((action) => {
        const isSelected = selected === action.name;
        return (
          <button
            key={action.name}
            onClick={() => onSelect(action.name)}
            className={`
              relative px-3 py-3 rounded-lg font-semibold text-xs
              transition-all duration-300 overflow-hidden group
              border-2 text-left
              ${isSelected
                ? 'border-white/50 text-white scale-105'
                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--poker-suited)]'
              }
            `}
            style={{
              background: isSelected
                ? action.color
                : 'var(--card)',
              boxShadow: isSelected
                ? `0 0 25px ${action.color}66`
                : 'none'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2">
              <span className="text-lg">{action.icon}</span>
              <span className="font-['Orbitron'] tracking-wide">{action.name}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
