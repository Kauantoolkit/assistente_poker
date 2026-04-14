import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

const EXAMPLE_JSON = `{
  "torneio": {
    "nome": "Nome do Torneio",
    "buy_in": 10,
    "garantido": 1000,
    "formato": "PKO Progressivo",
    "max_jogadores_mesa": 6,
    "fichas_iniciais": 10000,
    "reentradas": 2,
    "registro_tardio_min": 60
  },
  "posicoes": {
    "UTG": {
      "tamanho_open": "2.5x",
      "notas": "Jogue apenas mãos fortes.",
      "raise_rfi": ["AA","KK","QQ","JJ","TT","99","AKs","AQs","AJs","AK","AQ"],
      "3bet_vs_raise": ["AA","KK","QQ","AKs","AK"],
      "fold_vs_3bet": ["99","TT","AQs"]
    },
    "CO": {
      "tamanho_open": "2.2x",
      "notas": "Pode abrir mais amplo que UTG.",
      "raise_rfi": ["AA","KK","QQ","JJ","TT","99","88","77","66","AKs","AQs","AJs","ATs","A9s","AK","AQ","AJ","KQs","KJs","QJs","JTs","T9s"],
      "3bet_vs_utg": ["AA","KK","QQ","AKs","AK","A5s","A4s"],
      "call_vs_utg": ["TT","99","88","AQs","AJs","KQs","QJs","JTs"]
    },
    "BTN": {
      "tamanho_open": "2x",
      "notas": "Melhor posição. Abra amplo.",
      "raise_rfi": ["AA","KK","QQ","JJ","TT","99","88","77","66","55","44","33","22","AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s","AK","AQ","AJ","KQs","KJs","KTs","QJs","QTs","JTs","T9s","98s","87s","76s","65s","54s"],
      "3bet_vs_steal": ["AA","KK","QQ","JJ","AKs","AK","A5s","A4s","KQs"],
      "call_vs_raise": ["JJ","TT","99","88","AQs","AJs","KQs","QJs","JTs"]
    },
    "SB": {
      "tamanho_open": "2.5x",
      "notas": "Prefira raise ou fold. Limp apenas especulativo.",
      "raise_rfi": ["AA","KK","QQ","JJ","TT","99","88","77","66","55","AKs","AQs","AJs","ATs","A9s","AK","AQ","AJ","KQs","KJs","QJs","JTs"],
      "limp_especulativo": ["33","22","A5o","A4o","76s","65s","54s"],
      "3bet_vs_open": ["AA","KK","QQ","AKs","AK","A4s","A3s"]
    },
    "BB": {
      "notas": "Defenda bastante vs BTN/SB. Mais cuidado vs UTG.",
      "defend_vs_btn": ["55","44","33","22","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s","KTs","K9s","K8s","QTs","Q9s","J9s","J8s","T8s","T7s","98s","87s","76s","65s"],
      "defend_vs_utg": ["88","77","66","55","AQs","AJs","ATs","KQs","KJs","QJs","JTs","AQ","AJ"],
      "3bet_vs_btn_sb": ["AA","KK","QQ","JJ","AKs","AQs","AK","A5s","A4s","76s","65s"]
    }
  },
  "pko_especial": {
    "bounty_inicial": 5,
    "regras": [
      {"situacao": "Adversário tem bounty pequeno", "acao": "Chame um pouco mais amplo"},
      {"situacao": "Adversário tem bounty médio ($1–$2x buy-in)", "acao": "Chame claramente mais amplo"},
      {"situacao": "Adversário tem bounty grande ($3x+ buy-in)", "acao": "Chame quase qualquer mão razoável"},
      {"situacao": "Você é short stack menor que 15 BB", "acao": "Empurre antes de ser empurrado"},
      {"situacao": "Perto do dinheiro / bolha", "acao": "ICM maior que bounty. Preserve fichas"}
    ],
    "push_fold_pko": [
      {"stack": "<=8 BB qualquer posição", "range_push": ["AA-22","Ax","KQo","KTs+","QJs"]},
      {"stack": "<=12 BB BTN/SB", "range_push": ["pares","Ax","KQs","JTs+"]},
      {"situacao": "Call all-in vs short stack com bounty", "range_call": "Qualquer par, Ax, KQ+"}
    ]
  },
  "estrategia_por_stack": {
    "deep_50bb_mais": {
      "descricao": "Jogue pot-control. Suited connectors valem para setagem.",
      "tamanho_open": "2.5x-3x",
      "c_bet_flop": "33%-50% do pote"
    },
    "mid_25_50bb": {
      "descricao": "Jogue mais direto. Planeje antes de entrar no pote.",
      "tamanho_open": "2.2x",
      "c_bet_flop": "33%-50% do pote"
    },
    "short_15_25bb": {
      "descricao": "Modo semi push/fold. Evite entrar sem estar disposto a ir all-in.",
      "tamanho_open": "push ou fold"
    },
    "push_fold_menos_15bb": {
      "descricao": "Nunca abra sem intenção de ir all-in.",
      "tamanho_open": "all-in",
      "notas": "Empurre mais amplo no BTN e SB."
    }
  },
  "tamanhos_raise_por_nivel": [
    {"fase": "Deep (níveis iniciais)", "tamanho": "2.5x-3x BB"},
    {"fase": "Mid (níveis intermediários)", "tamanho": "2.2x-2.5x BB"},
    {"fase": "Late (níveis finais)", "tamanho": "2x BB ou push"},
    {"fase": "vs limp na mesa", "tamanho": "4x + 1x por limper"},
    {"fase": "C-bet no flop", "tamanho": "33%-50% do pote"}
  ],
  "bolha_icm": {
    "alertas": [
      {"situacao": "7-8 jogadores restantes", "acao": "Atenção ICM — não arrisque sem necessidade"},
      {"situacao": "Chip leader na bolha", "acao": "Pressione todos os médios e short stacks"},
      {"situacao": "Short stack na bolha", "acao": "Push amplo — qualquer chance de dobrar"}
    ]
  }
}`;

const PROMPT_SUGESTAO = `Gere um JSON de estratégia de poker para o seguinte torneio:
- Formato: [PKO / Normal / Bounty]
- Max jogadores por mesa: [5 / 6 / 9]
- Buy-in: [valor]

O JSON deve seguir exatamente esta estrutura:
- "torneio": dados do torneio
- "posicoes": UTG, CO, BTN, SB, BB — cada um com os arrays de mãos usando notação padrão (AKs para suited, AK para offsuit sem o "o", AA para pares)
- Chaves aceitas por posição: raise_rfi, 3bet_vs_raise, 3bet_vs_utg, 3bet_vs_steal, 3bet_vs_open, 3bet_vs_btn_sb, call_vs_utg, call_vs_raise, defend_vs_btn, defend_vs_utg, limp_especulativo
- "pko_especial": regras de bounty e push/fold
- "estrategia_por_stack": deep_50bb_mais, mid_25_50bb, short_15_25bb, push_fold_menos_15bb
- "tamanhos_raise_por_nivel": array de {fase, tamanho}
- "bolha_icm": alertas de ICM`;

export function JsonGuide() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'exemplo' | 'prompt'>('exemplo');
  const [copied, setCopied] = useState(false);

  const content = tab === 'exemplo' ? EXAMPLE_JSON : PROMPT_SUGESTAO;

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 border border-[var(--border)] hover:border-[var(--poker-suited)]"
        style={{ color: 'var(--muted-foreground)', fontFamily: "'Orbitron', sans-serif" }}
        title="Ver formato do JSON"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col"
            style={{ background: 'var(--card)', maxHeight: '85vh' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]"
              style={{ background: 'linear-gradient(135deg, var(--poker-felt) 0%, #0a2318 100%)' }}
            >
              <div>
                <h2
                  className="text-sm font-bold"
                  style={{ color: 'var(--poker-pair)', fontFamily: "'Orbitron', sans-serif" }}
                >
                  Formato do JSON
                </h2>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: 'var(--muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Use como referência ao gerar com IA
                </p>
              </div>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--muted-foreground)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border)]">
              {(['exemplo', 'prompt'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setCopied(false); }}
                  className="flex-1 py-2.5 text-xs font-semibold transition-colors"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    color: tab === t ? 'var(--poker-pair)' : 'var(--muted-foreground)',
                    borderBottom: tab === t ? '2px solid var(--poker-pair)' : '2px solid transparent',
                    background: 'var(--card)',
                  }}
                >
                  {t === 'exemplo' ? 'Exemplo de JSON' : 'Prompt para IA'}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="relative flex-1 overflow-hidden">
              <button
                onClick={copy}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                style={{
                  background: copied ? 'rgba(0,255,170,0.2)' : 'var(--muted)',
                  color: copied ? 'var(--poker-pair)' : 'var(--muted-foreground)',
                  border: `1px solid ${copied ? 'var(--poker-pair)' : 'var(--border)'}`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>

              <pre
                className="overflow-auto h-full p-4 text-[10px] leading-relaxed"
                style={{
                  color: 'var(--foreground)',
                  fontFamily: "'JetBrains Mono', monospace",
                  maxHeight: 'calc(85vh - 140px)',
                  whiteSpace: tab === 'prompt' ? 'pre-wrap' : 'pre',
                }}
              >
                {content}
              </pre>
            </div>

            {/* Footer note */}
            <div
              className="px-5 py-3 border-t border-[var(--border)] text-[10px]"
              style={{ color: 'var(--muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              Notação: <span style={{ color: 'var(--poker-pair)' }}>AKs</span> = suited ·{' '}
              <span style={{ color: 'var(--poker-pair)' }}>AK</span> = offsuit (sem "o") ·{' '}
              <span style={{ color: 'var(--poker-pair)' }}>AA</span> = par
            </div>
          </div>
        </div>
      )}
    </>
  );
}
