import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Obscura | Daily Photography Guessing Game',
  description: 'Learn about Obscura, a daily guessing game built around photographs, obscure answers and the challenge of seeing how much you can uncover.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0d0b09] px-5 py-12 text-mist-100 sm:px-8">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-mist-400 transition-colors hover:text-bio-400">← Back to Obscura</Link>

        <header className="mt-10 border-b border-white/10 pb-8">
          <p className="eyebrow">About</p>
          <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Obscura</h1>
          <p className="mt-5 max-w-2xl font-display text-2xl italic leading-tight text-mist-200 sm:text-3xl">
            One photograph. Seven prompts. Can you name it?
          </p>
        </header>

        <div className="mt-10 space-y-8 text-[0.98rem] leading-8 text-mist-300">
          <section>
            <h2 className="font-display text-3xl text-mist-100">A different kind of daily game</h2>
            <p className="mt-3">
              Obscura is a daily guessing game built around a single photograph. Each day, you work through a series of prompts and try to uncover enough of the image to make your final guess.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-mist-100">How it works</h2>
            <p className="mt-3">
              The photograph begins hidden. Your answers help develop the image, revealing more of what is in front of you. The aim is not simply to guess quickly — it is to recognise what you can from as little information as possible.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>A new photograph is presented each day.</li>
              <li>You answer seven prompts.</li>
              <li>The photograph becomes more visible as you progress.</li>
              <li>You make one final guess about what you are seeing.</li>
              <li>Your score and streak give you a reason to come back tomorrow.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-3xl text-mist-100">Why the name Obscura?</h2>
            <p className="mt-3">
              The name comes from the idea of a dark room gradually filling with light. The game follows the same principle: start with very little information, then reveal enough to make sense of the image.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-mist-100">Built for curiosity</h2>
            <p className="mt-3">
              Obscura is designed to be a short daily ritual rather than an endless feed. Play today, compare your result, explore previous days in the archive, and come back when tomorrow&apos;s photograph arrives.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-mist-500">
          <Link href="/faq" className="hover:text-bio-400">Frequently asked questions →</Link>
        </div>
      </article>
    </main>
  );
}
