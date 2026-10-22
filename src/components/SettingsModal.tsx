import { useSettings } from '@/hooks/useSettings';
import type { ThemePref } from '@/lib/settings';
import { Modal } from './Modal';
import { useState } from 'react';
import { IconMute, IconSound, IconBell, IconDownload } from './Icons';
import { downloadReminder } from '@/lib/reminder';
import { useInstall } from './Install';

function Switch({ checked, onChange, label, testId }: { checked: boolean; onChange: (v: boolean) => void; label: string; testId: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" data-on={checked} onClick={() => onChange(!checked)} data-testid={testId} data-silent>
      <span className="switch-knob" />
    </button>
  );
}

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        {hint && <p className="mt-0.5 text-xs leading-snug text-mist-500">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const THEMES: Array<{ id: ThemePref; label: string }> = [
  { id: 'auto', label: 'Auto' },
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
];

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { settings, set, play } = useSettings();
  return (
    <Modal title="Settings" onClose={onClose} testId="settings-modal">
      <section aria-label="Sound">
        <p className="eyebrow !text-[0.62rem]">Sound</p>
        <Row title="Sound effects" hint="Chimes for answers, ticks for the clock.">
          <Switch checked={!settings.muted} onChange={(v) => { set({ muted: !v }); if (v) window.setTimeout(() => play('hit', 2), 40); }} label="Sound effects" testId="set-sound" />
        </Row>
        <div className={`flex items-center gap-3 pb-3 ${settings.muted ? 'opacity-45' : ''}`}>
          <IconMute size={18} className="shrink-0 text-mist-500" />
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={settings.volume}
            disabled={settings.muted}
            className="range flex-1"
            aria-label="Sound effects volume"
            data-testid="set-volume"
            data-silent
            style={{ ['--fill' as string]: `${settings.volume}%` }}
            onChange={(e) => set({ volume: Number(e.target.value) })}
            onPointerUp={() => play('hit', 2)}
            onKeyUp={() => play('hit', 1)}
          />
          <IconSound size={18} className="shrink-0 text-mist-300" />
          <span className="w-9 shrink-0 text-right font-mono text-xs text-mist-300" data-testid="set-volume-label">
            {settings.volume}%
          </span>
        </div>
      </section>

      <section aria-label="Appearance" className="hairline-t border-t border-white/10 pt-3">
        <p className="eyebrow !text-[0.62rem]">Appearance</p>
        <Row title="Theme" hint="Panels and menus. The dark room behind them stays dark.">
          <div className="seg" role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={settings.theme === t.id} data-on={settings.theme === t.id} onClick={() => set({ theme: t.id })} data-testid={`set-theme-${t.id}`}>
                {t.label}
              </button>
            ))}
          </div>
        </Row>
        <Row title="Reduce motion" hint="Turns off fades, slides and the burst of light as the photograph develops.">
          <Switch checked={settings.reduceMotion} onChange={(v) => set({ reduceMotion: v })} label="Reduce motion" testId="set-motion" />
        </Row>
      </section>

      <Reminders />

      <p className="mt-2 text-center text-xs text-mist-500">Settings are saved on this device.</p>
      <button className="btn-primary mt-4 w-full" onClick={onClose} data-testid="settings-close">
        Done
      </button>
    </Modal>
  );
}

const TIMES = ['07:00', '08:00', '09:00', '12:00', '13:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

/** A daily reminder through the player's own calendar, and the app install, for players who want to come back. */
function Reminders() {
  const [time, setTime] = useState('09:00');
  const [done, setDone] = useState(false);
  const install = useInstall();
  return (
    <section aria-label="Reminders" className="border-t border-white/10 pt-3" data-testid="reminders">
      <p className="eyebrow !text-[0.62rem]">Daily reminder</p>
      <p className="mt-2 text-xs leading-snug text-mist-500">Adds a daily event to your calendar (Apple, Google or Outlook), so your phone reminds you when the new photograph is in.</p>
      <div className="mt-3 flex items-center gap-2">
        <IconBell size={18} className="shrink-0 text-mist-300" />
        <select className="input-field !h-11 !min-h-0 !w-auto !py-0 !pr-8 text-sm" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Reminder time" data-testid="reminder-time">
          {TIMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          className="btn-ghost !min-h-11 flex-1 text-sm"
          onClick={() => {
            downloadReminder(time);
            setDone(true);
          }}
          data-testid="reminder-add"
        >
          <IconDownload size={16} />
          Add to calendar
        </button>
      </div>
      {done && (
        <p className="mt-2 text-xs text-bio-300" role="status" data-testid="reminder-done">
          Open the downloaded file to add it. You can delete the event any time to stop.
        </p>
      )}
      {(install.canPrompt || install.ios) && (
        <Row title="Install Obscura" hint={install.ios ? 'In Safari, tap Share, then Add to Home Screen.' : 'Open it from your home screen like an app.'}>
          {install.canPrompt ? (
            <button className="btn-ghost !min-h-10 text-sm" onClick={() => install.prompt()} data-testid="install-btn">
              Install
            </button>
          ) : (
            <span />
          )}
        </Row>
      )}
    </section>
  );
}
