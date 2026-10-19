import { useEffect, useRef } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { ENGINEERLE_URL } from '@/lib/sites';
import { withSettings } from '@/lib/settings';
import { IconChart, IconClose, IconGear, IconHelp, IconWrench, IconGlobe } from './Icons';
import { Emblem } from './Emblem';
import { Wordmark } from './Wordmark';

interface Props {
  /** Close the menu and go to Obscura's home screen. */
  onHome: () => void;
  onStats: () => void;
  onHelp: () => void;
  onSettings: () => void;
  onClose: () => void;
}

/** The side menu: switch between games, and reach stats, help and settings. */
export function Sidebar({ onHome, onStats, onHelp, onSettings, onClose }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { settings } = useSettings();
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
          <button className="side-item" data-on="true" onClick={go(onHome)} data-testid="side-obscura" aria-current="page">
            <span className="side-ico"><IconGlobe size={18} /></span>
            <span className="min-w-0 text-left">
              <b className="block text-sm text-white">Obscura</b>
              <span className="block text-xs text-mist-500">Seven daily prompts. Be obscure.</span>
            </span>
          </button>
          <a className="side-item" href={withSettings(ENGINEERLE_URL, settings)} data-testid="side-engineerle" data-silent>
            <span className="side-ico"><IconWrench size={18} /></span>
            <span className="min-w-0 text-left">
              <b className="block text-sm text-white">
                Engineerle <span aria-hidden>↗</span>
              </b>
              <span className="block text-xs text-mist-500">Five daily engineering puzzles.</span>
            </span>
          </a>
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
