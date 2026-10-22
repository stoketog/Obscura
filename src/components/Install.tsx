import { useEffect, useState } from 'react';
import { IconDownload } from './Icons';
import { logEvent } from '@/lib/online';

/**
 * "Install Obscura": adds the game to the home screen as an app. Chrome, Edge and Android offer a real install
 * prompt; on iPhone and iPad it has to be done from Safari's share menu, so we explain how instead.
 */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener('appinstalled', () => {
    logEvent('installed');
    deferred = null;
    listeners.forEach((l) => l());
  });
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function useInstall() {
  const [, bump] = useState(0);
  useEffect(() => {
    const l = () => bump((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  const installed = isStandalone();
  return {
    installed,
    /** A one-tap install is available (Chrome, Edge, Android). */
    canPrompt: !installed && !!deferred,
    /** iPhone/iPad: install through Safari's share menu. */
    ios: !installed && isIos(),
    prompt: async () => {
      if (!deferred) return false;
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      listeners.forEach((l) => l());
      return outcome === 'accepted';
    },
  };
}

/** The side-menu entry. Hidden once installed, or where the browser can't install it. */
export function InstallItem() {
  const install = useInstall();
  const [help, setHelp] = useState(false);
  if (install.installed || (!install.canPrompt && !install.ios)) return null;
  return (
    <>
      <button className="side-item" onClick={() => (install.canPrompt ? install.prompt() : setHelp((h) => !h))} data-testid="side-install">
        <span className="side-ico">
          <IconDownload size={18} />
        </span>
        <span className="min-w-0 text-left">
          <b className="block text-sm text-white">Install Obscura</b>
          <span className="block text-xs text-mist-500">Open it from your home screen</span>
        </span>
      </button>
      {help && (
        <p className="mx-2 mb-2 rounded-md bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-mist-300" data-testid="install-ios-help">
          In Safari, tap the Share button, then <b className="text-mist-100">Add to Home Screen</b>.
        </p>
      )}
    </>
  );
}
