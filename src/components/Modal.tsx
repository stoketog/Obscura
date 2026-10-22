import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from './Icons';
import { useVisualViewport } from '@/hooks/useViewport';

export function Modal({ title, onClose, children, testId, peek = false }: { title: string; onClose: () => void; children: ReactNode; testId?: string; peek?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  // With the on-screen keyboard up, sit the sheet on top of the keyboard instead of behind it.
  const vp = useVisualViewport();
  const lift = vp?.squeezed && typeof window !== 'undefined' ? Math.max(0, window.innerHeight - (vp.top + vp.height)) : 0;
  // The latest onClose, without re-running the effect below: a parent that re-renders (a timer, a count-up) must
  // never pull focus back to the sheet while the player is typing in it.
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus the sheet itself only if nothing inside it (an input, say) has already taken focus.
    if (!ref.current?.contains(document.activeElement)) ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, []);
  // Rendered straight into <body>: a sheet opened from inside an animated card would otherwise be trapped in that
  // card's box (a transform makes "fixed" mean "fixed to the card"), and could end up covering its own input.
  const sheet = (
    <>
      <div className={`scrim ${peek ? 'peek' : ''}`} onClick={() => close.current()} />
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} data-testid={testId} className={`sheet outline-none ${peek ? 'peek' : ''}`} style={lift ? { bottom: lift, top: 'auto', transform: 'translateX(-50%)', maxHeight: vp!.height - 8 } : undefined}>
        <div className="sheet-head sticky top-0 z-10 flex items-center justify-between px-5 py-4 backdrop-blur">
          <h2 className="eyebrow !text-mist-300">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={16} />
          </button>
        </div>
        <div className="px-5 pb-6">{children}</div>
      </div>
    </>
  );
  return typeof document === 'undefined' ? sheet : createPortal(sheet, document.body);
}
