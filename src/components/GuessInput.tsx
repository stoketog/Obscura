import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Entity } from '@/lib/types';
import { suggest } from '@/lib/lexicon';
import { IconArrow, IconSearch } from './Icons';

interface Props {
  disabled?: boolean;
  onSubmit: (text: string) => { ok: boolean; message?: string; suggestions?: Entity[] };
}

export function GuessInput({ disabled, onSubmit }: Props) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [msg, setMsg] = useState<{ text: string; suggestions?: Entity[] } | null>(null);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const options = useMemo(() => (open ? suggest(text, 5) : []), [text, open]);

  useEffect(() => setActive(-1), [text]);

  const submit = (value: string) => {
    const res = onSubmit(value);
    if (res.ok) {
      setText('');
      setMsg(null);
      setOpen(false);
    } else {
      setMsg({ text: res.message ?? 'Try again.', suggestions: res.suggestions });
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled) return;
        const pick = active >= 0 ? options[active]?.name : undefined;
        submit(pick ?? text);
      }}
      data-testid="guess-form"
    >
      <div className={`relative ${shake ? 'shake' : ''}`}>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mist-500">
          <IconSearch size={18} />
        </span>
        <input
          ref={inputRef}
          className="input-field"
          type="text"
          inputMode="text"
          enterKeyHint="go"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Enter your guess..."
          aria-label="Your guess"
          role="combobox"
          aria-expanded={options.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          value={text}
          disabled={disabled}
          maxLength={60}
          data-testid="guess-input"
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setMsg(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && options.length) {
              e.preventDefault();
              setActive((a) => (a + 1) % options.length);
            } else if (e.key === 'ArrowUp' && options.length) {
              e.preventDefault();
              setActive((a) => (a <= 0 ? options.length - 1 : a - 1));
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
        />
        <button type="submit" disabled={disabled || !text.trim()} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl bg-bio-500 text-[#02211d] transition enabled:hover:bg-bio-400 disabled:bg-white/10 disabled:text-mist-700" aria-label="Submit guess" data-testid="guess-submit">
          <IconArrow size={18} />
        </button>
      </div>

      {options.length > 0 && (
        <ul id={listId} role="listbox" className="glass absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl !bg-[#081a2c]/95 py-1" data-testid="suggestions">
          {options.map((o, i) => (
            <li
              key={o.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`flex cursor-pointer items-center justify-between px-4 py-3 text-sm ${i === active ? 'bg-white/10' : 'hover:bg-white/6'}`}
              onMouseDown={(e) => {
                e.preventDefault();
                submit(o.name);
              }}
              data-testid="suggestion"
            >
              <span className="font-medium text-white">{o.name}</span>
              <span className="text-xs capitalize text-mist-500">{o.group.replace(/-/g, ' ')}</span>
            </li>
          ))}
        </ul>
      )}

      {msg && (
        <div className="mt-3 rounded-xl border border-coral-glow/30 bg-coral-glow/10 px-4 py-3 text-sm text-[#ffc3cb]" role="alert" data-testid="guess-error">
          <p>{msg.text}</p>
          {msg.suggestions && msg.suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {msg.suggestions.map((s) => (
                <button key={s.id} type="button" className="chip !text-white" onClick={() => submit(s.name)} data-testid="did-you-mean">
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
