'use client';

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useObscura } from '@/hooks/useObscura';
import { useMedia, useVisualViewport } from '@/hooks/useViewport';
import { stageIndexFor } from '@/lib/scoring';
import { Backdrop } from './Backdrop';
import { WorldContext } from './WorldContext';
import { HomeScreen } from './HomeScreen';
import { GameScreen } from './GameScreen';
import { ResultScreen } from './ResultScreen';
import { StatsModal } from './StatsModal';
import { HelpModal } from './HelpModal';
import { Emblem } from './Emblem';
import { IconChart, IconHelp, IconGear, IconBack } from './Icons';

// The flag is written out literally at each use (not via a shared const) so bundlers
// (Next/SWC, esbuild) fold it and dead-code-eliminate the admin tools from production builds.
const AdminPanel = (process.env.NEXT_PUBLIC_OBSCURA_ADMIN === '1' || process.env.NODE_ENV === 'development') ? lazy(() => import('./AdminPanel')) : null;
// Three.js is the heaviest part of the app, so it loads after the first paint.
const WorldCanvas = lazy(() => import('./WorldCanvas'));

type ViewKind = 'home' | 'play' | 'result';

/** Where the hero sits on screen for each screen, so it is never behind the text. */
function focusFor(view: ViewKind, wide: boolean, squeezed: boolean) {
  if (wide) return view === 'home' ? { x: 0.71, y: 0.46 } : view === 'result' ? { x: 0.26, y: 0.4 } : { x: 0.5, y: 0.37 };
  if (view === 'home') return { x: 0.5, y: 0.4 };
  if (view === 'result') return { x: 0.5, y: 0.24 };
  return { x: 0.5, y: squeezed ? 0.34 : 0.33 };
}

export function GameApp() {
  const api = useObscura();
  const [modal, setModal] = useState<null | 'stats' | 'help' | 'admin'>(null);
  // After the last round, keep its reveal on screen until the player chooses to see the results.
  const [hold, setHold] = useState(false);
  const onFinished = () => setHold(true);
  const onContinue = () => setHold(false);
  const [override, setOverride] = useState<number | null>(null);
  // 'pending' until we know (so the server render and the first client render agree), then the 3D world,
  // or the plain backdrop when WebGL is unavailable or the page was opened with ?lite (for slow devices).
  const [mode, setMode] = useState<'pending' | '3d' | 'lite'>('pending');
  useEffect(() => setMode(/[?&]lite(=|&|$)/.test(window.location.search) ? 'lite' : '3d'), []);
  const failGL = useCallback(() => setMode('lite'), []);
  const wide = useMedia('(min-width: 1024px)');
  const vp = useVisualViewport();

  // First visit: show the how-to-play sheet once.
  useEffect(() => {
    if (api.ready && !api.profile.seenHelp) setModal('help');
  }, [api.ready, api.profile.seenHelp]);

  // Secret admin toggle (dev / admin builds only): Ctrl/Cmd + Shift + A
  useEffect(() => {
    if (!(process.env.NEXT_PUBLIC_OBSCURA_ADMIN === '1' || process.env.NODE_ENV === 'development')) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setModal((m) => (m === 'admin' ? null : 'admin'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const ready = api.ready && !!api.daily && !!api.game;
  const dayPoints = api.game?.points ?? 0;
  const points = override ?? dayPoints;
  const closeHelp = () => {
    setModal(null);
    if (!api.profile.seenHelp) api.dismissHelp();
  };

  const showGame = ready && api.view === 'play' && (api.game!.status === 'playing' || hold);
  const showResult = ready && api.view === 'play' && !showGame;
  const view: ViewKind = !ready || api.view === 'home' ? 'home' : showGame ? 'play' : 'result';
  const focus = useMemo(() => focusFor(view, wide, !!vp?.squeezed), [view, wide, vp?.squeezed]);
  const world = useMemo(() => ({ override, setOverride }), [override]);

  return (
    <WorldContext.Provider value={world}>
      {/* A fixed stage the size of the visible screen: the world fills it, the screens scroll inside it. */}
      <div className="fixed inset-x-0 overflow-hidden bg-abyss-950" style={vp ? { top: vp.top, height: vp.height } : { top: 0, bottom: 0 }} data-testid="stage">
        {mode === 'lite' ? (
          <Backdrop stage={stageIndexFor(points)} />
        ) : mode === '3d' ? (
          <Suspense fallback={<div className="backdrop" aria-hidden />}>
            <WorldCanvas points={points} focus={focus} onFail={failGL} />
          </Suspense>
        ) : (
          <div className="backdrop" aria-hidden />
        )}
        <div className="world-shade pointer-events-none absolute inset-0" data-view={view} aria-hidden />

        <div className="relative z-10 flex h-full flex-col overflow-y-auto overflow-x-hidden" data-testid="scroller" data-view={view}>
          <header className="relative z-20 mx-auto flex w-full max-w-5xl shrink-0 items-center justify-between px-4 pb-1 safe-pt sm:px-5">
            {api.view === 'play' ? (
              <button className="icon-btn" aria-label="Back to home" onClick={() => api.setView('home')} data-testid="back-btn">
                <IconBack size={18} />
              </button>
            ) : (
              <span className="w-10" />
            )}
            {api.view === 'play' ? (
              <span className="flex items-center gap-2 text-soft-shadow">
                <Emblem size={22} />
                <span className="logo text-sm text-white">Obscura</span>
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              {(process.env.NEXT_PUBLIC_OBSCURA_ADMIN === '1' || process.env.NODE_ENV === 'development') && (
                <button className="icon-btn !text-amber-glow" aria-label="Admin tools" onClick={() => setModal('admin')} data-testid="admin-btn">
                  <IconGear size={17} />
                </button>
              )}
              <button className="icon-btn" aria-label="Statistics" onClick={() => setModal('stats')} data-testid="stats-btn">
                <IconChart size={17} />
              </button>
              <button className="icon-btn" aria-label="How to play" onClick={() => setModal('help')} data-testid="help-btn">
                <IconHelp size={17} />
              </button>
            </div>
          </header>

          {!ready ? (
            <div className="grid flex-1 place-items-center" aria-busy>
              <div className="flex flex-col items-center gap-4">
                <Emblem size={84} className="animate-float" />
                <span className="logo animate-pulse text-xl text-white">Obscura</span>
              </div>
            </div>
          ) : api.view === 'home' ? (
            <HomeScreen api={api} />
          ) : showGame ? (
            <GameScreen api={api} holding={hold} onFinished={onFinished} onContinue={onContinue} compact={!!vp?.squeezed} />
          ) : showResult ? (
            <ResultScreen api={api} onOpenStats={() => setModal('stats')} />
          ) : null}
        </div>
      </div>

      {modal === 'stats' && api.ready && <StatsModal api={api} onClose={() => setModal(null)} />}
      {modal === 'help' && <HelpModal onClose={closeHelp} />}
      {modal === 'admin' && AdminPanel && (
        <Suspense fallback={null}>
          <AdminPanel api={api} onClose={() => setModal(null)} />
        </Suspense>
      )}
    </WorldContext.Provider>
  );
}
