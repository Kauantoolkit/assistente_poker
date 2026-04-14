import { useState, useEffect } from 'react';
import { RangeGrid } from './components/RangeGrid';
import { PositionSelector } from './components/PositionSelector';
import { ActionSelector } from './components/ActionSelector';
import { SavedRanges } from './components/SavedRanges';
import { ImportStrategy } from './components/ImportStrategy';
import { GameContext } from './components/GameContext';
import { ContextTip } from './components/ContextTip';
import { PushFoldPanel } from './components/PushFoldPanel';
import { Save } from 'lucide-react';
import type { ParsedStrategy } from './utils/strategyParser';
import type { GameContextValue } from './components/GameContext';

const DEFAULT_GAME_CONTEXT: GameContextValue = {
  stack: 'deepstack',
  bounty: 'none',
  situation: 'normal',
};

export default function App() {
  const [selectedPosition, setSelectedPosition] = useState('BTN');
  const [selectedAction, setSelectedAction] = useState('Open Raise');
  const [rangeData, setRangeData] = useState<Record<string, string>>({});
  const [savedRanges, setSavedRanges] = useState<any[]>([]);
  const [importedStrategy, setImportedStrategy] = useState<ParsedStrategy | null>(null);
  const [importNotice, setImportNotice] = useState('');
  const [gameContext, setGameContext] = useState<GameContextValue>(DEFAULT_GAME_CONTEXT);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('poker-ranges');
    if (saved) setSavedRanges(JSON.parse(saved));

    const strat = localStorage.getItem('poker-strategy');
    if (strat) setImportedStrategy(JSON.parse(strat));

    const ctx = localStorage.getItem('poker-game-context');
    if (ctx) setGameContext(JSON.parse(ctx));
  }, []);

  const updateGameContext = (v: GameContextValue) => {
    setGameContext(v);
    localStorage.setItem('poker-game-context', JSON.stringify(v));
  };

  const saveCurrentRange = () => {
    const newRange = {
      id: Date.now(),
      position: selectedPosition,
      action: selectedAction,
      data: rangeData,
      timestamp: new Date().toISOString(),
    };
    const updated = [...savedRanges, newRange];
    setSavedRanges(updated);
    localStorage.setItem('poker-ranges', JSON.stringify(updated));
  };

  const loadRange = (range: any) => {
    setSelectedPosition(range.position);
    setSelectedAction(range.action);
    setRangeData(range.data);
    setShowSidebar(false);
  };

  const deleteRange = (id: number) => {
    const updated = savedRanges.filter(r => r.id !== id);
    setSavedRanges(updated);
    localStorage.setItem('poker-ranges', JSON.stringify(updated));
  };

  const handleImport = (strategy: ParsedStrategy) => {
    const existingIds = new Set(savedRanges.map((r: any) => r.id));
    const newRanges = strategy.ranges.filter(r => !existingIds.has(r.id));
    const updated = [...savedRanges, ...newRanges];

    setSavedRanges(updated);
    localStorage.setItem('poker-ranges', JSON.stringify(updated));

    setImportedStrategy(strategy);
    localStorage.setItem('poker-strategy', JSON.stringify(strategy));

    const count = newRanges.length;
    setImportNotice(`✓ ${count} range${count !== 1 ? 's' : ''} importado${count !== 1 ? 's' : ''}`);
    setTimeout(() => setImportNotice(''), 4000);
  };

  const isPushFoldMode = gameContext.stack === 'pushfold' || gameContext.stack === 'shortstack';
  const stackColor =
    gameContext.stack === 'pushfold'   ? '#ff3366' :
    gameContext.stack === 'shortstack' ? '#ff6b35' :
    gameContext.stack === 'midstack'   ? '#ffaa00' : '#00ffaa';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        fontFamily: "'Orbitron', sans-serif",
        background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1520 50%, #0a1015 100%)',
      }}
    >
      {/* Header */}
      <header className="relative border-b border-[var(--poker-felt)] overflow-hidden sticky top-0 z-20"
        style={{ background: '#0a0e1aee', backdropFilter: 'blur(12px)' }}>
        <div className="relative max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Stack indicator pill */}
            <div
              className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold"
              style={{
                background: `${stackColor}22`,
                color: stackColor,
                border: `1px solid ${stackColor}44`,
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              {gameContext.stack === 'pushfold'   ? 'PUSH/FOLD' :
               gameContext.stack === 'shortstack' ? 'SHORT' :
               gameContext.stack === 'midstack'   ? 'MID' : 'DEEP'}
            </div>

            <div className="min-w-0">
              <h1
                className="text-lg md:text-2xl font-black tracking-tight bg-clip-text text-transparent truncate"
                style={{
                  backgroundImage: 'linear-gradient(to right, var(--poker-pair), var(--poker-suited))',
                }}
              >
                POKER RANGE
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {importNotice && (
              <span
                className="hidden sm:block text-[10px] px-2.5 py-1 rounded-lg font-semibold"
                style={{
                  background: 'rgba(0,255,170,0.15)',
                  color: 'var(--poker-pair)',
                  border: '1px solid rgba(0,255,170,0.3)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {importNotice}
              </span>
            )}
            <ImportStrategy onImport={handleImport} />

            {/* Sidebar toggle (mobile) */}
            <button
              onClick={() => setShowSidebar(s => !s)}
              className="lg:hidden px-3 py-2 rounded-lg text-sm font-semibold border border-[var(--border)] text-[var(--muted-foreground)]"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {showSidebar ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 md:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          {/* LEFT — Game context + grid */}
          <div className="space-y-4">

            {/* Game context bar */}
            <GameContext value={gameContext} onChange={updateGameContext} />

            {/* Context tips */}
            <ContextTip
              context={gameContext}
              strategy={importedStrategy}
              position={selectedPosition}
            />

            {/* Position + Action selectors (always visible) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-[9px] font-semibold mb-1.5 uppercase tracking-widest"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Posição
                </label>
                <PositionSelector selected={selectedPosition} onSelect={setSelectedPosition} />
              </div>
              <div>
                <label
                  className="block text-[9px] font-semibold mb-1.5 uppercase tracking-widest"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Ação
                </label>
                <ActionSelector selected={selectedAction} onSelect={setSelectedAction} />
              </div>
            </div>

            {/* Push/fold mode OR range grid */}
            {isPushFoldMode ? (
              <PushFoldPanel
                stack={gameContext.stack}
                position={selectedPosition}
                strategy={importedStrategy}
              />
            ) : (
              <div
                className="relative rounded-2xl border border-[var(--poker-felt)] p-4 md:p-6 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, var(--poker-felt) 0%, #0a2318 100%)',
                  boxShadow: '0 0 40px rgba(0, 255, 170, 0.08), inset 0 0 60px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`,
                  }}
                />
                <RangeGrid
                  position={selectedPosition}
                  action={selectedAction}
                  data={rangeData}
                  onChange={setRangeData}
                />
              </div>
            )}

            {/* Save button (only in deep/mid mode) */}
            {!isPushFoldMode && (
              <button
                onClick={saveCurrentRange}
                className="w-full relative group px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm overflow-hidden transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, var(--poker-pair) 0%, var(--poker-suited) 100%)',
                  color: 'var(--primary-foreground)',
                  boxShadow: '0 0 20px rgba(0, 255, 170, 0.25)',
                }}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                <div className="relative flex items-center justify-center gap-2">
                  <Save size={16} />
                  Salvar Range Atual
                </div>
              </button>
            )}
          </div>

          {/* RIGHT — Sidebar (desktop always visible, mobile toggleable) */}
          <div className={`space-y-4 ${showSidebar ? 'block' : 'hidden lg:block'}`}>

            <div className="flex items-center gap-2">
              <span
                className="w-1 h-5 rounded-full"
                style={{ background: 'linear-gradient(to bottom, var(--poker-pair), var(--poker-suited))' }}
              />
              <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                Ranges Salvos
              </h2>
            </div>
            <SavedRanges
              ranges={savedRanges}
              onLoad={loadRange}
              onDelete={deleteRange}
            />

          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
