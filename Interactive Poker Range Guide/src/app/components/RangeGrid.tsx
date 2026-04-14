import { useState } from 'react';

interface RangeGridProps {
  position: string;
  action: string;
  data: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

const ACTION_COLORS = {
  'Raise': 'bg-[var(--poker-raise)] text-[var(--primary-foreground)]',
  'Call': 'bg-[var(--poker-suited)] text-[var(--primary-foreground)]',
  'Fold': 'bg-[var(--poker-fold)] text-[var(--muted-foreground)]',
  '3-Bet': 'bg-[var(--poker-3bet)] text-white',
  '4-Bet': 'bg-[#ff6b35] text-white',
};

// GTO default ranges for all positions and actions
const getDefaultRange = (position: string, action: string): Record<string, string> => {
  const ranges: Record<string, string> = {};
  const add = (hands: string[], value: string) => hands.forEach(h => { ranges[h] = value; });

  if (action === 'Open Raise') {
    if (position === 'UTG') {
      add(['AA','KK','QQ','JJ','TT','99','88'], 'Raise');
      add(['AKs','AQs','AJs','ATs','A9s'], 'Raise');
      add(['KQs','KJs','KTs'], 'Raise');
      add(['QJs','JTs'], 'Raise');
      add(['AK','AQ','AJ'], 'Raise');
    } else if (position === 'MP') {
      add(['AA','KK','QQ','JJ','TT','99','88','77'], 'Raise');
      add(['AKs','AQs','AJs','ATs','A9s','A8s'], 'Raise');
      add(['KQs','KJs','KTs','K9s'], 'Raise');
      add(['QJs','QTs','JTs'], 'Raise');
      add(['AK','AQ','AJ','AT'], 'Raise');
      add(['KQ'], 'Raise');
    } else if (position === 'CO') {
      add(['AA','KK','QQ','JJ','TT','99','88','77','66','55'], 'Raise');
      add(['AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s'], 'Raise');
      add(['KQs','KJs','KTs','K9s','K8s'], 'Raise');
      add(['QJs','QTs','Q9s','JTs','J9s','T9s'], 'Raise');
      add(['AK','AQ','AJ','AT','A9'], 'Raise');
      add(['KQ','KJ','KT'], 'Raise');
      add(['QJ'], 'Raise');
    } else if (position === 'BTN') {
      add(['AA','KK','QQ','JJ','TT','99','88','77','66','55','44','33','22'], 'Raise');
      add(['AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s'], 'Raise');
      add(['KQs','KJs','KTs','K9s','K8s','K7s'], 'Raise');
      add(['QJs','QTs','Q9s','Q8s','JTs','J9s','J8s','T9s','T8s','98s','97s','87s','86s','76s','65s','54s'], 'Raise');
      add(['AK','AQ','AJ','AT','A9','A8'], 'Raise');
      add(['KQ','KJ','KT'], 'Raise');
      add(['QJ','QT','JT'], 'Raise');
    } else if (position === 'SB') {
      add(['AA','KK','QQ','JJ','TT','99','88','77','66','55','44'], 'Raise');
      add(['AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s'], 'Raise');
      add(['KQs','KJs','KTs','K9s'], 'Raise');
      add(['QJs','QTs','JTs','J9s','T9s','98s','87s'], 'Raise');
      add(['AK','AQ','AJ','AT'], 'Raise');
      add(['KQ','KJ'], 'Raise');
    }
    // BB não abre — range vazio intencional

  } else if (action === '3-Bet') {
    if (position === 'UTG') {
      add(['AA','KK','QQ','JJ'], '3-Bet');
      add(['AKs','AK'], '3-Bet');
      add(['A5s','A4s'], '3-Bet');
    } else if (position === 'MP') {
      add(['AA','KK','QQ','JJ'], '3-Bet');
      add(['AKs','AK'], '3-Bet');
      add(['A5s','A4s'], '3-Bet');
    } else if (position === 'CO') {
      add(['AA','KK','QQ','JJ','TT'], '3-Bet');
      add(['AKs','AQs','AK'], '3-Bet');
      add(['A5s','A4s','A3s'], '3-Bet');
      add(['KQs'], '3-Bet');
    } else if (position === 'BTN') {
      add(['AA','KK','QQ','JJ','TT'], '3-Bet');
      add(['AKs','AQs','AK'], '3-Bet');
      add(['A5s','A4s','A3s','A2s'], '3-Bet');
      add(['KQs','QJs'], '3-Bet');
      add(['76s','65s','54s'], '3-Bet');
    } else if (position === 'SB') {
      add(['AA','KK','QQ','JJ','TT'], '3-Bet');
      add(['AKs','AQs','AK'], '3-Bet');
      add(['A5s','A4s','A3s'], '3-Bet');
      add(['KQs'], '3-Bet');
    } else if (position === 'BB') {
      add(['AA','KK','QQ','JJ','TT'], '3-Bet');
      add(['AKs','AQs','AK'], '3-Bet');
      add(['A5s','A4s','A3s'], '3-Bet');
      add(['76s','65s'], '3-Bet');
    }

  } else if (action === '4-Bet') {
    add(['AA','KK'], '4-Bet');
    add(['AKs'], '4-Bet');
    if (position === 'BTN' || position === 'CO' || position === 'SB') {
      add(['QQ','AK'], '4-Bet');
      add(['A5s'], '4-Bet');
    }

  } else if (action === 'Call') {
    if (position === 'MP') {
      add(['TT','99','88'], 'Call');
      add(['AQs','AJs','KQs','QJs','JTs'], 'Call');
    } else if (position === 'CO') {
      add(['TT','99','88'], 'Call');
      add(['AQs','AJs','ATs','KQs','KJs','QJs','JTs','T9s'], 'Call');
      add(['AQ'], 'Call');
    } else if (position === 'BTN') {
      add(['JJ','TT','99','88'], 'Call');
      add(['AQs','AJs','ATs','KQs','KJs','QJs','JTs','T9s','98s'], 'Call');
      add(['AQ','AJ'], 'Call');
    } else if (position === 'SB') {
      add(['TT','99','88','77'], 'Call');
      add(['AQs','AJs','ATs','KQs','KJs','QJs','JTs','T9s'], 'Call');
      add(['AQ'], 'Call');
    } else if (position === 'BB') {
      // BB call vs UTG (mais fechado)
      add(['88','77','66','55'], 'Call');
      add(['ATs','A9s','KQs','KJs','KTs','QJs','QTs','JTs','T9s'], 'Call');
      add(['AQ','AJ','AT'], 'Call');
    }

  } else if (action === 'Defend BB') {
    // BB defend vs BTN/SB steal — range bem mais amplo
    add(['55','44','33','22'], 'Call');
    add(['A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s'], 'Call');
    add(['A9','A8','A7','A6','A5'], 'Call');
    add(['KTs','K9s','K8s','K7s','K6s'], 'Call');
    add(['KJ','KT','K9'], 'Call');
    add(['QTs','Q9s','Q8s','Q7s','QJ'], 'Call');
    add(['J9s','J8s','J7s'], 'Call');
    add(['T8s','T7s','T6s'], 'Call');
    add(['98s','97s','96s','87s','86s','85s','76s','75s','65s','54s','53s'], 'Call');

  } else if (action === 'Cold Call') {
    // Entrar frio num pote já aberto — range seletivo
    add(['TT','99','88','77'], 'Call');
    add(['ATs','A9s','A8s'], 'Call');
    add(['KQs','KJs','KTs'], 'Call');
    add(['QJs','QTs','JTs','T9s','98s'], 'Call');
    add(['AQ','AJ'], 'Call');
  }

  return ranges;
};

export function RangeGrid({ position, action, data, onChange }: RangeGridProps) {
  const [hoveredHand, setHoveredHand] = useState<string | null>(null);

  const getHandNotation = (row: number, col: number): string => {
    const rank1 = RANKS[row];
    const rank2 = RANKS[col];

    if (row === col) {
      return `${rank1}${rank2}`; // Pair
    } else if (row < col) {
      return `${rank1}${rank2}s`; // Suited
    } else {
      return `${rank2}${rank1}`; // Offsuit
    }
  };

  const getHandType = (row: number, col: number): string => {
    if (row === col) return 'pair';
    if (row < col) return 'suited';
    return 'offsuit';
  };

  const getHandAction = (hand: string): string => {
    if (data[hand]) return data[hand];
    const defaults = getDefaultRange(position, action);
    return defaults[hand] || 'Fold';
  };

  const cycleAction = (hand: string) => {
    const actions = ['Fold', 'Call', 'Raise', '3-Bet', '4-Bet'];
    const currentAction = getHandAction(hand);
    const currentIndex = actions.indexOf(currentAction);
    const nextAction = actions[(currentIndex + 1) % actions.length];
    onChange({ ...data, [hand]: nextAction });
  };

  const getActionColor = (handAction: string): string => {
    return ACTION_COLORS[handAction as keyof typeof ACTION_COLORS] || ACTION_COLORS['Fold'];
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-13 gap-1 sm:gap-1.5">
        {RANKS.map((rank1, row) => (
          RANKS.map((rank2, col) => {
            const hand = getHandNotation(row, col);
            const handType = getHandType(row, col);
            const handAction = getHandAction(hand);
            const isHovered = hoveredHand === hand;

            return (
              <button
                key={`${row}-${col}`}
                onClick={() => cycleAction(hand)}
                onMouseEnter={() => setHoveredHand(hand)}
                onMouseLeave={() => setHoveredHand(null)}
                className={`
                  aspect-square rounded-md relative overflow-hidden
                  transition-all duration-200 group
                  border-2
                  ${getActionColor(handAction)}
                  ${isHovered ? 'scale-110 z-10 border-white' : 'border-transparent'}
                `}
                style={{
                  boxShadow: isHovered ? '0 0 30px rgba(0, 255, 170, 0.6)' : 'none',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative h-full flex flex-col items-center justify-center px-0.5 py-1">
                  <span className="text-[10px] sm:text-xs font-bold font-['JetBrains_Mono'] leading-none">
                    {hand}
                  </span>
                  {handType === 'pair' && (
                    <div className="w-1 h-1 rounded-full bg-current opacity-50 mt-0.5"></div>
                  )}
                </div>

                {/* Glow effect on hover */}
                {isHovered && (
                  <div className="absolute inset-0 animate-pulse" style={{
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)'
                  }}></div>
                )}
              </button>
            );
          })
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-[var(--border)] flex flex-wrap gap-3 text-xs">
        {Object.entries(ACTION_COLORS).map(([actionName, colorClass]) => (
          <div key={actionName} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${colorClass}`}></div>
            <span className="font-['JetBrains_Mono'] text-[var(--muted-foreground)]">
              {actionName}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--foreground)] opacity-50"></div>
          <span className="font-['JetBrains_Mono'] text-[var(--muted-foreground)] text-[10px]">
            = Pocket Pair
          </span>
        </div>
      </div>
    </div>
  );
}
