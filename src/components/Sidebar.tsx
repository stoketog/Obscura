import { useEffect, useRef } from 'react';
import { IconChart, IconClose, IconGear, IconHelp, IconWrench, IconGlobe } from './Icons';
import { Emblem } from './Emblem';
import { Wordmark } from './Wordmark';

export type Mode = 'obscura' | 'engineerle';

interface Props {
  mode: Mode;
  onMode: (m: Mode) => void;
  onStats: () => void;
  onHelp: () => void;
  onSettings: () => void;
  onClose: () => void;
  /** Show the Engineerle entry. */
  engineerle?: boolean;
}

/** The side menu: switch between games, and reach stats, help and settings. */
export function Sidebar({ mode, onMode, onStats, onHelp, onSettings, onClose, engineerle = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const go = (fn: () => void) => () => {
    onClose();
    fn();
  };
  return (
    <>
      <div className="scrim" onClick={onClose} data-testid="sidebar-scrim" />
      <aside ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Menu" className="drawer glass-dock outline-none" data-testid="sidebar">
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <span className="flex items-center gap-2.5">
            <Emblem size={26} />
            <Wordmark className="text-[0.74rem]" />
          </span>
          <button className="icon-btn" onClick={onClose} aria-label="Close menu" data-testid="sidebar-close">
            <IconClose size={16} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Games and tools">
          <p className="eyebrow px-2 !text-[0.6rem]">Games</p>
          <button className="side-item" data-on={mode === 'obscura'} onClick={go(() => onMode('obscura'))} data-testid="side-obscura" aria-current={mode === 'obscura' ? 'page' : undefined}>
            <span className="side-ico"><IconGlobe size={18} /></span>
            <span className="min-w-0 text-left">
              <b className="block text-sm text-white">Obscura</b>
              <span className="block text-xs text-mist-500">Seven daily prompts. Be obscure.</span>
            </span>
          </button>
          {engineerle && (
            <button className="side-item" data-on={mode === 'engineerle'} onClick={go(() => onMode('engineerle'))} data-testid="side-engineerle" aria-current={mode === 'engineerle' ? 'page' : undefined}>
              <span className="side-ico"><IconWrench size={18} /></span>
              <span className="min-w-0 text-left">
                <b className="block text-sm text-white">
                  Engineerle <span className="ml-1 rounded-full border border-amber-glow/40 bg-amber-glow/10 px-1.5 py-0.5 align-middle text-[0.58rem] font-semibold text-amber-glow">New</span>
                </b>
                <span className="block text-xs text-mist-500">Five daily engineering puzzles.</span>
              </span>
            </button>
          )}
          <p className="eyebrow mt-5 px-2 !text-[0.6rem]">You</p>
          <button className="side-item" onClick={go(onStats)} data-testid="side-stats">
            <span className="side-ico"><IconChart size={18} /></span>
            <b className="text-sm text-white">Statistics</b>
          </button>
          <button className="side-item" onClick={go(onHelp)} data-testid="side-help">
            <span className="side-ico"><IconHelp size={18} /></span>
            <b className="text-sm text-white">How to play</b>
          </button>
          <button className="side-item" onClick={go(onSettings)} data-testid="side-settings">
            <span className="side-ico"><IconGear size={18} /></span>
            <b className="text-sm text-white">Settings</b>
          </button>
        </nav>
        <p className="px-5 pb-5 text-xs text-mist-500 safe-pb">Everything is saved on this device.</p>
      </aside>
    </>
  );
}
