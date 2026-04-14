import type { GameContextValue } from './GameContext';
import type { ParsedStrategy } from '../utils/strategyParser';

interface ContextTipProps {
  context: GameContextValue;
  strategy: ParsedStrategy | null;
  position: string;
}

interface Tip {
  text: string;
  color: string;
  label: string;
}

function getTips(ctx: GameContextValue, strategy: ParsedStrategy | null, position: string): Tip[] {
  const tips: Tip[] = [];

  // --- Stack tips ---
  if (ctx.stack === 'pushfold') {
    tips.push({
      label: 'Push/Fold',
      color: '#ff3366',
      text: 'Stack crítico — nunca abra sem intenção de ir all-in. Empurre antes de ser empurrado.',
    });
    if (strategy) {
      const pfEntry = strategy.pko.push_fold.find(e => e.stack?.includes('8'));
      if (pfEntry?.range_push) {
        tips.push({
          label: 'Range push',
          color: '#ff3366',
          text: `≤8BB push: ${Array.isArray(pfEntry.range_push) ? pfEntry.range_push.join(', ') : pfEntry.range_push}`,
        });
      }
    }
  } else if (ctx.stack === 'shortstack') {
    tips.push({
      label: 'Semi P/F',
      color: '#ff6b35',
      text: 'Modo semi push/fold — evite call ou raise sem estar disposto a ir all-in. Planeje antes de entrar.',
    });
    if (strategy) {
      const pfEntry = strategy.pko.push_fold.find(e => e.stack?.includes('12'));
      if (pfEntry?.range_push) {
        tips.push({
          label: 'Range push',
          color: '#ff6b35',
          text: `≤12BB BTN/SB push: ${Array.isArray(pfEntry.range_push) ? pfEntry.range_push.join(', ') : pfEntry.range_push}`,
        });
      }
    }
  } else if (ctx.stack === 'midstack') {
    if (strategy?.estrategia_por_stack?.mid_25_50bb) {
      const s = strategy.estrategia_por_stack.mid_25_50bb;
      tips.push({
        label: 'Mid Stack',
        color: '#ffaa00',
        text: `${s.descricao} Open: ${s.tamanho_open}`,
      });
    } else {
      tips.push({
        label: 'Mid Stack',
        color: '#ffaa00',
        text: 'Jogue mais direto. 3-bets ficam mais comprometidas — planeje antes de entrar no pote.',
      });
    }
  } else if (ctx.stack === 'deepstack') {
    if (strategy?.estrategia_por_stack?.deep_50bb_mais) {
      const s = strategy.estrategia_por_stack.deep_50bb_mais;
      tips.push({
        label: 'Deep Stack',
        color: '#00ffaa',
        text: `${s.descricao}${s.c_bet_flop ? ` C-bet: ${s.c_bet_flop}` : ''}`,
      });
    }
  }

  // --- Bounty tips ---
  if (ctx.bounty !== 'none' && strategy) {
    const bountyMap: Record<string, number> = { small: 0, medium: 1, large: 2 };
    const ruleIdx = bountyMap[ctx.bounty];
    const rule = strategy.pko.regras[ruleIdx];
    if (rule) {
      tips.push({
        label: 'PKO Bounty',
        color: 'var(--poker-suited)',
        text: `${rule.situacao} → ${rule.acao}`,
      });
    }

    // Short stack opponent: isolate with bounty
    if (ctx.stack === 'pushfold' || ctx.stack === 'shortstack') {
      const isolateRule = strategy.pko.regras.find(r => r.situacao.includes('menor que 15'));
      if (isolateRule) {
        tips.push({
          label: 'PKO',
          color: 'var(--poker-suited)',
          text: isolateRule.acao,
        });
      }
    }
  } else if (ctx.bounty !== 'none') {
    const genericBountyTips: Record<string, string> = {
      small: 'Bounty inicial — chame um pouco mais amplo para caçar.',
      medium: 'Bounty acumulada — chame claramente mais amplo.',
      large: 'Bounty grande — chame quase qualquer mão razoável.',
    };
    tips.push({
      label: 'PKO Bounty',
      color: 'var(--poker-suited)',
      text: genericBountyTips[ctx.bounty],
    });
  }

  // --- Bubble / ICM tips ---
  if (ctx.situation === 'bubble') {
    if (strategy?.bolha_icm?.alertas?.length) {
      tips.push({
        label: 'ICM Bolha',
        color: '#ff3366',
        text: strategy.bolha_icm.alertas[0].acao,
      });
    } else {
      tips.push({
        label: 'ICM Bolha',
        color: '#ff3366',
        text: 'ICM > Bounty na bolha. Preserve fichas — não arrisque sem necessidade.',
      });
    }
  } else if (ctx.situation === 'final') {
    tips.push({
      label: 'Final Table',
      color: '#ffaa00',
      text: 'Ajuste cada decisão pelos saltos de pagamento. ICM pressiona — plays marginais viram erros caros.',
    });
  }

  // --- Position-specific note from strategy ---
  if (strategy?.positionNotes?.[position]) {
    tips.push({
      label: position,
      color: 'var(--poker-pair)',
      text: strategy.positionNotes[position],
    });
  }

  return tips;
}

export function ContextTip({ context, strategy, position }: ContextTipProps) {
  const tips = getTips(context, strategy, position);
  if (tips.length === 0) return null;

  return (
    <div className="space-y-2">
      {tips.map((tip, i) => (
        <div
          key={i}
          className="rounded-lg px-3 py-2.5 flex items-start gap-2.5"
          style={{
            background: `color-mix(in srgb, ${tip.color} 8%, var(--card))`,
            border: `1px solid color-mix(in srgb, ${tip.color} 25%, transparent)`,
          }}
        >
          <span
            className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex-shrink-0 mt-0.5"
            style={{
              background: `color-mix(in srgb, ${tip.color} 20%, transparent)`,
              color: tip.color,
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            {tip.label}
          </span>
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: 'var(--foreground)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            {tip.text}
          </p>
        </div>
      ))}
    </div>
  );
}
