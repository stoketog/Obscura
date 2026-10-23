import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Obscura FAQ | How the Daily Guessing Game Works',
  description: 'Answers to common questions about Obscura, the daily photograph guessing game, including scoring, prompts, streaks and the daily reset.',
};

const faqs = [
  {
    question: 'What is Obscura?',
    answer: 'Obscura is a daily photograph guessing game. You answer seven prompts to develop a hidden photograph, and can guess what it shows at any time by tapping it.',
  },
  {
    question: 'How do I play Obscura?',
    answer: 'Start the daily game, work through the prompts and use the information you uncover to decide what the photograph shows. Tap the photograph whenever you think you know it.',
  },
  {
    question: 'How often is there a new Obscura?',
    answer: 'A new daily photograph is released each day. Once you finish the current game, the next photograph becomes available when the daily cycle resets.',
  },
  {
    question: 'How does the photograph reveal itself?',
    answer: 'The game develops the photograph as you progress through its prompts. Rarer answers reveal more of the image, giving you more information for your final guess.',
  },
  {
    question: 'How does scoring work?',
    answer: 'Your score is based on how successfully you navigate the prompts and identify the photograph. A right guess at the photograph is worth 100 points, less 20 for every wrong guess before it.',
  },
  {
    question: 'What is a streak?',
    answer: 'Your streak tracks consecutive days on which you complete Obscura. Keep playing each day to build your streak.',
  },
  {
    question: 'Can I play previous Obscura games?',
    answer: 'Yes. The Archive contains previous daily games so you can revisit photographs and see how you performed on earlier days.',
  },
  {
    question: 'Is Obscura free to play?',
    answer: 'Obscura is designed as a free-to-play daily game. You can visit the site and play the daily challenge without buying a game or subscription.',
  },
  {
    question: 'Can I play on my phone?',
    answer: 'Yes. Obscura is designed to work on desktop and mobile screens, so you can play the daily challenge wherever you are.',
  },
  {
    question: 'Why is it called Obscura?',
    answer: 'The name refers to the camera obscura and the idea of revealing an image from darkness. In the game, you start with an obscured photograph and gradually bring it into view.',
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#0d0b09] px-5 py-12 text-mist-100 sm:px-8">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-mist-400 transition-colors hover:text-bio-400">← Back to Obscura</Link>

        <header className="mt-10 border-b border-white/10 pb-8">
          <p className="eyebrow">Help</p>
          <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Frequently asked questions</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-mist-300">
            Everything you need to know about the Obscura daily photograph guessing game.
          </p>
        </header>

        <div className="mt-8 divide-y divide-white/10">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-6">
              <summary className="cursor-pointer list-none pr-8 font-display text-2xl text-mist-100 marker:hidden transition-colors group-hover:text-bio-300">
                {faq.question}
                <span className="float-right font-sans text-lg text-mist-500 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-[0.96rem] leading-7 text-mist-300">{faq.answer}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-mist-500">
          <Link href="/about" className="hover:text-bio-400">About Obscura →</Link>
        </div>
      </article>
    </main>
  );
}
