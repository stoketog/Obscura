'use client';

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useObscura } from '@/hooks/useObscura';
import { stageIndexFor } from '@/lib/growth';
import { Backdrop } from './Backdrop';
import { stageHue } from './Creature';
import { HomeScreen } from './HomeScreen';
import { GameScreen } from './GameScreen';
import { ResultScreen } from './ResultScreen';
import { StatsModal } from './StatsModal';
import { HelpModal } from './HelpModal';
import { IconChart, IconHelp, IconGear, IconBack } from './Icons';

// The flag is written out literally at each use (not via a shared const) so bundlers
// (Next/SWC, esbuild) fold it and dead-code-eliminate the admin tools from production builds.
const AdminPanel = (process.env.NEXT_PUBLIC_OBSCURA_ADMIN === '1' || process.env.NODE_ENV === 'development') ? lazy(() => import('./AdminPanel')) : null;

export function GameApp() {
  const api = useObscura();
  const [modal, setModal] = useState<null | 'stats' | 'help' | 'admin'>(null);
  // After the final guess, linger on the game screen so the last feedback lands before the reveal.
  const [hold, setHold] = useState(false);
  const holdTimer = useRef<number | undefined>(undefined);
  const onFinished = () => {
    setHold(true);
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setHold(false), 1700);
  };
  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

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

  const stage = stageIndexFor(api.profile.totalGrowth);
  const closeHelp = () => {
    setModal(null);
    if (!api.profile.seenHelp) api.dismissHelp();
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <Backdrop hue={stageHue(stage)} />
      <header className="relative z-20 mx-auto flex w-full max-w-5xl items-center justify-between px-5 pb-1 pt-[max(1rem,env(safe-area-inset-top))]">
        {api.view === 'play' ? (
          <button className="icon-btn" aria-label="Back to home" onClick={() => api.setView('home')} data-testid="back-btn">
            <IconBack size={18} />
          </button>
        ) : (
          <span className="w-10" />
        )}
        {api.view === 'play' ? <span className="logo text-sm text-mist-300">Obscura</span> : <span />}
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

      {!api.ready || !api.puzzle || !api.game ? (
        <div className="relative z-10 grid flex-1 place-items-center text-mist-500" aria-busy>
          <span className="logo animate-pulse text-xl">Obscura</span>
        </div>
      ) : api.view === 'home' ? (
        <HomeScreen api={api} />
      ) : api.game.status === 'playing' || hold ? (
        <GameScreen api={api} onFinished={onFinished} />
      ) : (
        <ResultScreen api={api} onOpenStats={() => setModal('stats')} />
      )}

      {modal === 'stats' && <StatsModal api={api} onClose={() => setModal(null)} />}
      {modal === 'help' && <HelpModal onClose={closeHelp} />}
      {modal === 'admin' && AdminPanel && (
        <Suspense fallback={null}>
          <AdminPanel api={api} onClose={() => setModal(null)} />
        </Suspense>
      )}
    </div>
  );
}
