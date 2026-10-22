'use client';

import { lazy, Suspense, useEffect, useState } from 'react';
import { useObscura } from '@/hooks/useObscura';
import { useVisualViewport } from '@/hooks/useViewport';
import { developedFor } from '@/lib/scoring';
import { HomeScreen } from './HomeScreen';
import { GameScreen } from './GameScreen';
import { ResultScreen } from './ResultScreen';
import { StatsModal } from './StatsModal';
import { HelpModal } from './HelpModal';
import { Emblem } from './Emblem';
import { Wordmark } from './Wordmark';
import { IconChart, IconHelp, IconGear, IconBack, IconMenu } from './Icons';
import { SettingsModal } from './SettingsModal';
import { Sidebar } from './Sidebar';
import { ArchiveModal } from './ArchiveModal';
import { DarkroomModal } from './DarkroomModal';
import { ENGINEERLE_URL } from '@/lib/sites';
import { loadSettings, withSettings } from '@/lib/settings';
import { SettingsProvider } from '@/hooks/useSettings';

// The flag is written out literally at each use (not via a shared const) so bundlers
// (Next/SWC, esbuild) fold it and dead-code-eliminate the admin tools from production builds.
const AdminPanel = (process.env.NEXT_PUBLIC_OBSCURA_ADMIN === '1' || process.env.NODE_ENV === 'development') ? lazy(() => import('./AdminPanel')) : null;

export function GameApp() {
  return (
    <SettingsProvider>
      <GameAppInner />
    </SettingsProvider>
  );
}

function GameAppInner() {
  const api = useObscura();
  const [menu, setMenu] = useState(false);
  // Engineerle used to live here (#engineerle). It has its own site now, so old links and bookmarks are sent on,
  // with the player's settings.
  useEffect(() => {
    if (window.location.hash === '#engineerle') window.location.replace(withSettings(ENGINEERLE_URL, loadSettings()));
  }, []);
  const [modal, setModal] = useState<null | 'stats' | 'help' | 'admin' | 'settings' | 'archive' | 'darkroom' | 'badges'>(null);
  // After the last round, keep its reveal on screen until the player chooses to make their guess.
  const [hold, setHold] = useState(false);
  const onFinished = () => setHold(true);
  const onContinue = () => setHold(false);
  const vp = useVisualViewport();

  // Offline support and installability. Production only, so development always runs the latest code.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

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

  const ready = api.ready && !!api.plan && !!api.game;
  // Play and result screens need the day's answers; until they arrive (or if they can't), show a holding screen.
  const answersReady = !!api.daily;
  const closeHelp = () => {
    setModal(null);
    if (!api.profile.seenHelp) api.dismissHelp();
  };

  const showGame = ready && api.view === 'play' && (api.game!.status === 'playing' || hold);
  const showResult = ready && api.view === 'play' && !showGame;
  const view = !ready || api.view === 'home' ? 'home' : showGame ? 'play' : 'result';
  const revealed = showResult && answersReady && !!api.game?.guess;
  // The room warms a little as light gets in.
  const light = ready && view !== 'home' ? developedFor(api.game!.points) / 100 : 0;

  return (
    <>
      {/* A fixed stage the size of the visible screen; the screens scroll inside it. */}
      <div className="fixed inset-x-0 overflow-hidden bg-abyss-950" style={vp ? { top: vp.top, height: vp.height } : { top: 0, bottom: 0 }} data-testid="stage">
        <div className="chamber-room grain" style={{ ['--light' as string]: light }} aria-hidden />
        {revealed && (
          <>
            <div className="after-glow" style={{ backgroundImage: `url(${api.daily!.image.src})` }} aria-hidden data-testid="after-glow" />
            <div className="after-shade" aria-hidden />
          </>
        )}

        <div className="relative z-10 flex h-full flex-col overflow-y-auto overflow-x-hidden" data-testid="scroller" data-view={view}>
          <header className="relative z-20 mx-auto flex w-full max-w-5xl shrink-0 items-center justify-between px-2 pb-1 safe-pt sm:px-3">
            {api.view === 'play' ? (
              <button className="icon-btn" aria-label="Back to home" onClick={() => api.setView('home')} data-testid="back-btn">
                <IconBack size={18} />
              </button>
            ) : (
              <button className="icon-btn" aria-label="Menu" onClick={() => setMenu(true)} data-testid="menu-btn">
                <IconMenu size={19} />
              </button>
            )}
            {api.view === 'play' ? (
              <span className="flex items-center gap-2">
                <Emblem size={22} />
                <Wordmark className="text-[1.6rem]" />
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center">
              {(process.env.NEXT_PUBLIC_OBSCURA_ADMIN === '1' || process.env.NODE_ENV === 'development') && (
                <button className="icon-btn !text-bio-400" aria-label="Admin tools" onClick={() => setModal('admin')} data-testid="admin-btn">
                  <IconGear size={17} />
                </button>
              )}
              {api.view === 'play' && (
                <button className="icon-btn" aria-label="Menu" onClick={() => setMenu(true)} data-testid="menu-btn-play">
                  <IconMenu size={19} />
                </button>
              )}
              <button className="icon-btn" aria-label="Statistics" onClick={() => setModal('stats')} data-testid="stats-btn">
                <IconChart size={17} />
              </button>
              <button className="icon-btn" aria-label="How to play" onClick={() => setModal('help')} data-testid="help-btn">
                <IconHelp size={18} />
              </button>
            </div>
          </header>

          {!ready ? (
            <div className="grid flex-1 place-items-center" aria-busy>
              <div className="flex flex-col items-center gap-4">
                <Emblem size={72} />
                <Wordmark className="animate-pulse text-4xl" />
              </div>
            </div>
          ) : api.view === 'home' ? (
            <HomeScreen api={api} onArchive={() => setModal('archive')} onDarkroom={() => setModal('darkroom')} />
          ) : !answersReady ? (
            <div className="grid flex-1 place-items-center px-6 text-center" data-testid="answers-loading">
              {api.loadError ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-mist-300">Couldn’t load today’s prompts. Check your connection.</p>
                  <button className="btn-primary" onClick={api.retryLoad} data-testid="answers-retry">
                    Try again
                  </button>
                </div>
              ) : (
                <Emblem size={56} />
              )}
            </div>
          ) : showGame ? (
            <GameScreen api={api} holding={hold} onFinished={onFinished} onContinue={onContinue} compact={!!vp?.squeezed} />
          ) : showResult ? (
            <ResultScreen api={api} onOpenStats={() => setModal('stats')} onOpenDarkroom={(tab) => setModal(tab === 'badges' ? 'badges' : 'darkroom')} />
          ) : null}
        </div>
      </div>

      {menu && (
        <Sidebar
          onHome={() => api.setView('home')}
          onStats={() => setModal('stats')}
          onHelp={() => setModal('help')}
          onSettings={() => setModal('settings')}
          onArchive={() => setModal('archive')}
          onDarkroom={() => setModal('darkroom')}
          onClose={() => setMenu(false)}
        />
      )}
      {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} />}
      {modal === 'stats' && api.ready && <StatsModal api={api} onClose={() => setModal(null)} />}
      {modal === 'help' && <HelpModal onClose={closeHelp} />}
      {modal === 'archive' && api.ready && <ArchiveModal api={api} onClose={() => setModal(null)} />}
      {(modal === 'darkroom' || modal === 'badges') && api.ready && <DarkroomModal api={api} start={modal === 'badges' ? 'badges' : 'prints'} onClose={() => setModal(null)} />}
      {modal === 'admin' && AdminPanel && (
        <Suspense fallback={null}>
          <AdminPanel api={api} onClose={() => setModal(null)} />
        </Suspense>
      )}
    </>
  );
}
