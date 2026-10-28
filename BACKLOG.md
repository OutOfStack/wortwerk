# Backlog

Larger changes that move Wortwerk toward evidence-based learning-app practice. Each would need its own design and migration plan.

## Learning engine

- **Answer log.** Add an append-only `review_events` table (client UUID as primary key, `ON CONFLICT DO NOTHING`, batched once per round). Progress is currently a single JSON snapshot, so past answers can't be replayed. The log is what makes the next two items possible.
- **FSRS scheduling.** Replace the fixed 3/7/21/60-day checks with FSRS (`ts-fsrs`, default weights, desired retention 0.85–0.90). Rebuild word state from the answer log.
- **Grammar reviews.** Passed grammar topics never come back. Mix a few items from passed topics into later sessions on the same schedule as words.
- **Missing umlauts in grammar answers.** Typed grammar answers accept a plain vowel for ä/ö/ü, so *Apfel* passes for the plural *Äpfel*, *großer* for *größer*, and *konnen* for *können* (186 typed grammar answers). The vocabulary tests treat this as intended, so decide whether grammar should accept only ae/oe/ue.

## Content

- **Finish the Goethe word-list alignment.** Done (see `reports/Goethe word list check.md`): genders checked, 164 levels corrected, 389 missing words added. Still open: whether B1-level words such as *Lebenslauf* and *obwohl* stay at A2.
- **CEFR can-do units.** Group words and grammar into units built around can-do statements ("order food", "describe your flat"), each ending in a review.
- **Graded reading.** Short texts generated from words the learner already knows (at least 95% known, target 98%), checked before they're shown.

## Habit and metrics

- **Server-side activity table** (`activity_days`, learner-local day). The client keeps only 60 days. This enables retention measures (CURR, D1/D7/D30) and a learning metric: first-attempt accuracy on checks 7+ days after the last exposure.
- **One-time streak repair** after a lost streak, plus an optional weekend or rest mode.
- **Daily reminder**, at most one a day at the learner's usual time. Needs PWA push or a native shell.

## Platform

- **Account data export and deletion** (GDPR).
- **Pre-rendered audio** per word and sentence instead of the device's speech voice, with the browser voice kept as a fallback.
- **Speaking practice** with browser speech recognition, using the same normaliser as typed answers, plus a speaking-off setting.
