import { useState } from 'react';
import { Trophy, Zap, Layers, TrendingUp, Shield } from 'lucide-react';
import type { ParsedStrategy } from '../utils/strategyParser';

interface StrategyInfoProps {
  strategy: ParsedStrategy;
}

const TABS = [
  { id: 'torneio', label: 'Torneio', icon: Trophy },
  { id: 'pko',     label: 'PKO',     icon: Zap    },
  { id: 'stack',   label: 'Stack',   icon: Layers },
  { id: 'raises',  label: 'Raises',  icon: TrendingUp },
  { id: 'icm',     label: 'ICM',     icon: Shield },
];

export function StrategyInfo({ strategy }: StrategyInfoProps) {
  const [activeTab, setActiveTab] = useState('torneio');

  return (
    <div
      className="rounded-xl border border-[var(--poker-pair)]/20 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--card) 0%, var(--muted) 100%)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-[var(--border)]"
        style={{ background: 'linear-gradient(135deg, var(--poker-felt) 0%, #0a2318 100%)' }}
      >
        <h3
          className="text-xs font-bold tracking-wide"
          style={{ color: 'var(--poker-pair)', fontFamily: "'Orbitron', sans-serif" }}
        >
          {strategy.torneio.nome}
        </h3>
        <p
          className="text-[10px] mt-0.5"
          style={{ color: 'var(--muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}
        >
          {strategy.torneio.formato} · {strategy.torneio.max_jogadores_mesa}-max
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1 px-3 py-2 text-[10px] font-semibold whitespace-nowrap transition-colors"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                color: isActive ? 'var(--poker-pair)' : 'var(--muted-foreground)',
                borderBottom: isActive ? '2px solid var(--poker-pair)' : '2px solid transparent',
              }}
            >
              <Icon size={11} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-3 max-h-72 overflow-y-auto space-y-2">

        {activeTab === 'torneio' && (
          <div
            className="space-y-0"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <InfoRow label="Buy-in"       value={`$${strategy.torneio.buy_in}`} />
            <InfoRow label="Garantido"    value={`$${strategy.torneio.garantido}`} />
            <InfoRow label="Fichas"       value={strategy.torneio.fichas_iniciais?.toLocaleString('pt-BR')} />
            <InfoRow label="Reentradas"   value={strategy.torneio.reentradas ?? '—'} />
            <InfoRow label="Reg. tardio"  value={strategy.torneio.registro_tardio_min != null ? `${strategy.torneio.registro_tardio_min} min` : '—'} />
          </div>
        )}

        {activeTab === 'pko' && (
          <>
            <p
              className="text-[10px] mb-2"
              style={{ color: 'var(--muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              Bounty inicial:{' '}
              <span style={{ color: 'var(--poker-pair)' }}>${strategy.pko.bounty_inicial}</span>
            </p>
            {strategy.pko.regras.map((rule, i) => (
              <RuleCard
                key={i}
                situacao={rule.situacao}
                acao={rule.acao}
                acaoColor="var(--poker-suited)"
              />
            ))}

            {strategy.pko.push_fold.length > 0 && (
              <>
                <p
                  className="text-[9px] font-bold uppercase mt-3 mb-1"
                  style={{ color: 'var(--poker-pair)', fontFamily: "'Orbitron', sans-serif" }}
                >
                  Push / Fold (short stack)
                </p>
                {strategy.pko.push_fold.map((entry, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-2.5 border border-[var(--border)]"
                    style={{ background: 'var(--muted)' }}
                  >
                    <p
                      className="text-[10px] font-semibold"
                      style={{ color: 'var(--poker-pair)', fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {entry.stack ?? entry.situacao}
                    </p>
                    {entry.range_push && (
                      <p
                        className="text-[10px] mt-1"
                        style={{ color: 'var(--foreground)', fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        Push: <span style={{ color: 'var(--poker-suited)' }}>
                          {Array.isArray(entry.range_push)
                            ? entry.range_push.join(', ')
                            : entry.range_push}
                        </span>
                      </p>
                    )}
                    {entry.range_call && (
                      <p
                        className="text-[10px] mt-1"
                        style={{ color: 'var(--foreground)', fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        Call: <span style={{ color: 'var(--poker-suited)' }}>{entry.range_call}</span>
                      </p>
                    )}
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {activeTab === 'stack' && (
          <>
            {Object.entries(strategy.estrategia_por_stack).map(([key, strat]) => (
              <div
                key={key}
                className="rounded-lg p-2.5 border border-[var(--border)]"
                style={{ background: 'var(--muted)' }}
              >
                <p
                  className="text-[9px] font-bold uppercase mb-1"
                  style={{ color: 'var(--poker-pair)', fontFamily: "'Orbitron', sans-serif" }}
                >
                  {key.replace(/_/g, ' ')}
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: 'var(--muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {strat.descricao}
                </p>
                <p
                  className="text-[10px] mt-1"
                  style={{ color: 'var(--poker-suited)', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Open: {strat.tamanho_open}
                  {strat.c_bet_flop && ` · C-bet: ${strat.c_bet_flop}`}
                </p>
                {strat.notas && (
                  <p
                    className="text-[9px] mt-1 italic"
                    style={{ color: 'var(--muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {strat.notas}
                  </p>
                )}
              </div>
            ))}
          </>
        )}

        {activeTab === 'raises' && (
          <>
            {strategy.tamanhos_raise.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <span
                  className="text-[10px]"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {row.fase}
                </span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: 'var(--poker-pair)' }}
                >
                  {row.tamanho}
                </span>
              </div>
            ))}
          </>
        )}

        {activeTab === 'icm' && (
          <>
            {strategy.bolha_icm.alertas.map((alert, i) => (
              <RuleCard
                key={i}
                situacao={alert.situacao}
                acao={alert.acao}
                acaoColor="var(--poker-3bet)"
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="flex justify-between items-center py-1.5 border-b border-[var(--border)] last:border-0"
    >
      <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </span>
      <span className="text-[10px] font-semibold" style={{ color: 'var(--foreground)' }}>
        {value}
      </span>
    </div>
  );
}

function RuleCard({
  situacao,
  acao,
  acaoColor,
}: {
  situacao: string;
  acao: string;
  acaoColor: string;
}) {
  return (
    <div
      className="rounded-lg p-2.5 border border-[var(--border)]"
      style={{ background: 'var(--muted)' }}
    >
      <p
        className="text-[10px]"
        style={{ color: 'var(--muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}
      >
        {situacao}
      </p>
      <p
        className="text-[10px] font-semibold mt-1"
        style={{ color: acaoColor, fontFamily: "'JetBrains Mono', monospace" }}
      >
        → {acao}
      </p>
    </div>
  );
}
