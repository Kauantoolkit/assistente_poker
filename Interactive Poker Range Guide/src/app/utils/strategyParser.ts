const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

function getAllHands(): string[] {
  const hands: string[] = [];
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      const r1 = RANKS[i];
      const r2 = RANKS[j];
      if (i === j) hands.push(`${r1}${r2}`);
      else if (i < j) hands.push(`${r1}${r2}s`);
      else hands.push(`${r2}${r1}`);
    }
  }
  return hands;
}

const ALL_HANDS = getAllHands();

// JSON uses AKo; app grid uses AK (no 'o' suffix)
function normalizeHand(hand: string): string {
  if (hand.length === 3 && hand.endsWith('o')) {
    return hand.slice(0, 2);
  }
  return hand;
}

// Expand "AA–22" or "AA-22" into individual pair notations
function expandHandNotation(notation: string): string[] {
  const sep = notation.includes('–') ? '–' : notation.includes('-') ? '-' : null;
  if (sep && notation.length > 3) {
    const [rawStart, rawEnd] = notation.split(sep).map(s => s.trim());
    const pairPattern = /^([AKQJT98765432])\1$/;
    if (pairPattern.test(rawStart) && pairPattern.test(rawEnd)) {
      const startIdx = RANKS.indexOf(rawStart[0]);
      const endIdx = RANKS.indexOf(rawEnd[0]);
      if (startIdx !== -1 && endIdx !== -1) {
        const result: string[] = [];
        for (let i = startIdx; i <= endIdx; i++) {
          result.push(`${RANKS[i]}${RANKS[i]}`);
        }
        return result;
      }
    }
  }
  return [normalizeHand(notation)];
}

function expandHands(hands: string[]): string[] {
  return hands
    .flatMap(h => expandHandNotation(h))
    .filter(h => ALL_HANDS.includes(h));
}

export interface RangeEntry {
  id: number;
  position: string;
  action: string;
  data: Record<string, string>;
  timestamp: string;
  source: 'import';
  sourceLabel: string;
}

export interface PkoRule {
  situacao: string;
  acao: string;
}

export interface PushFoldEntry {
  stack?: string;
  situacao?: string;
  range_push?: string[];
  range_call?: string;
}

export interface StackInfo {
  descricao: string;
  tamanho_open: string;
  c_bet_flop?: string;
  notas?: string;
}

export interface ParsedStrategy {
  torneio: {
    nome: string;
    buy_in: number;
    garantido: number;
    formato: string;
    max_jogadores_mesa: number;
    fichas_iniciais: number;
    reentradas?: number;
    registro_tardio_min?: number;
  };
  ranges: RangeEntry[];
  positionNotes: Record<string, string>;
  positionOpenSizes: Record<string, string>;
  pko: {
    bounty_inicial: number;
    regras: PkoRule[];
    push_fold: PushFoldEntry[];
  };
  estrategia_por_stack: Record<string, StackInfo>;
  tamanhos_raise: Array<{ fase: string; tamanho: string }>;
  bolha_icm: { alertas: Array<{ situacao: string; acao: string }> };
}

// Maps JSON position action keys → app action name + cell value
const ACTION_MAPPINGS: Array<{
  key: string;
  appAction: string;
  handValue: string;
}> = [
  { key: 'raise_rfi',       appAction: 'Open Raise', handValue: 'Raise'  },
  { key: '3bet_vs_raise',   appAction: '3-Bet',      handValue: '3-Bet'  },
  { key: '3bet_vs_utg',     appAction: '3-Bet',      handValue: '3-Bet'  },
  { key: '3bet_vs_steal',   appAction: '3-Bet',      handValue: '3-Bet'  },
  { key: '3bet_vs_open',    appAction: '3-Bet',      handValue: '3-Bet'  },
  { key: '3bet_vs_btn_sb',  appAction: '3-Bet',      handValue: '3-Bet'  },
  { key: 'call_vs_utg',     appAction: 'Cold Call',  handValue: 'Call'   },
  { key: 'call_vs_raise',   appAction: 'Call',       handValue: 'Call'   },
  { key: 'defend_vs_btn',   appAction: 'Defend BB',  handValue: 'Call'   },
  { key: 'defend_vs_utg',   appAction: 'Cold Call',  handValue: 'Call'   },
  { key: 'limp_especulativo', appAction: 'Call',     handValue: 'Call'   },
];

export function parseStrategyJson(json: unknown): ParsedStrategy {
  const j = json as Record<string, unknown>;
  const now = new Date().toISOString();
  const ranges: RangeEntry[] = [];
  const positionNotes: Record<string, string> = {};
  const positionOpenSizes: Record<string, string> = {};
  const torneio = (j.torneio as Record<string, unknown>) ?? {};
  const tournamentName = (torneio.nome as string) || 'JSON Importado';

  let idBase = Date.now();

  const posicoes = (j.posicoes as Record<string, Record<string, unknown>>) ?? {};

  for (const [posKey, posData] of Object.entries(posicoes)) {
    positionNotes[posKey] = (posData.notas as string) || '';
    positionOpenSizes[posKey] = (posData.tamanho_open as string) || '';

    // Accumulate hands per appAction
    const groups: Record<string, Record<string, string>> = {};

    for (const mapping of ACTION_MAPPINGS) {
      const hands = posData[mapping.key];
      if (!Array.isArray(hands) || hands.length === 0) continue;

      if (!groups[mapping.appAction]) {
        const data: Record<string, string> = {};
        ALL_HANDS.forEach(h => { data[h] = 'Fold'; });
        groups[mapping.appAction] = data;
      }

      expandHands(hands as string[]).forEach(hand => {
        groups[mapping.appAction][hand] = mapping.handValue;
      });
    }

    for (const [appAction, data] of Object.entries(groups)) {
      ranges.push({
        id: idBase++,
        position: posKey,
        action: appAction,
        data,
        timestamp: now,
        source: 'import',
        sourceLabel: tournamentName,
      });
    }
  }

  const pkoRaw = (j.pko_especial as Record<string, unknown>) ?? {};
  const stackRaw = (j.estrategia_por_stack as Record<string, unknown>) ?? {};
  const bolhaRaw = (j.bolha_icm as Record<string, unknown>) ?? {};

  return {
    torneio: {
      nome: (torneio.nome as string) || '',
      buy_in: (torneio.buy_in as number) || 0,
      garantido: (torneio.garantido as number) || 0,
      formato: (torneio.formato as string) || '',
      max_jogadores_mesa: (torneio.max_jogadores_mesa as number) || 0,
      fichas_iniciais: (torneio.fichas_iniciais as number) || 0,
      reentradas: torneio.reentradas as number | undefined,
      registro_tardio_min: torneio.registro_tardio_min as number | undefined,
    },
    ranges,
    positionNotes,
    positionOpenSizes,
    pko: {
      bounty_inicial: (pkoRaw.bounty_inicial as number) || 0,
      regras: (pkoRaw.regras as PkoRule[]) || [],
      push_fold: (pkoRaw.push_fold_pko as PushFoldEntry[]) || [],
    },
    estrategia_por_stack: stackRaw as Record<string, StackInfo>,
    tamanhos_raise: (j.tamanhos_raise_por_nivel as Array<{ fase: string; tamanho: string }>) || [],
    bolha_icm: {
      alertas: ((bolhaRaw.alertas as Array<{ situacao: string; acao: string }>) || []),
    },
  };
}
