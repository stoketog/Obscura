import { PUZZLES } from '@/data/puzzles';
import { resolvePuzzle } from '@/lib/puzzles';
import { findEntity } from '@/lib/lexicon';
import { evaluateGuess } from '@/lib/similarity';
import { solveGrowth } from '@/lib/growth';
const names = process.argv.slice(3);
const pz = PUZZLES.find((p) => p.id === process.argv[2])!;
const r = resolvePuzzle(pz, '2026-10-18');
console.log(r.id, 'obscurity', r.obscurity, 'reward', r.growthReward.toFixed(1), 'solve@4 first day', solveGrowth({obscurity: r.obscurity, guessesUsed: 4, totalBefore: 0}));
for (const n of names) {
  const e = findEntity(n);
  if (!e) { console.log(n, '-> NOT FOUND'); continue; }
  const g = evaluateGuess({ guess: e, target: r.answer, index: 0, totalBefore: 0, targetObscurity: r.obscurity });
  console.log(n.padEnd(18), String(g.similarity).padStart(3), g.warmthLabel.padEnd(14), 'obsc', String(g.obscurity).padStart(3), g.obscurityLabel.padEnd(12), '+' + g.provisionalGrowth);
}
