#!/bin/sh
# Gate before any push: types, engine tests (must be all green), answer report.
set -e
npx tsc --noEmit
out=$(npm test 2>&1 | tail -1); echo "$out"; echo "$out" | grep -q "with failures" && exit 1
npx tsx --tsconfig tsconfig.json scripts/answer-stats.ts | tail -1
