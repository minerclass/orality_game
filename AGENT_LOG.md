# Agent Log

Append-only record of automated and agent-assisted changes to this repository.
Newest entry first. No participant data, committee or faculty names, credentials,
or tokens.

---

## 2026-09-01 - Adopt the shared ink, and fix a pre-existing credit-line failure

**Token adoption improved accessibility here on its own.** Before this change the landing
screen had five contrast failures; adopting the shared muted ink dropped that to three, and
the credit-line repair below took it to zero. Dim text moved from 6.28 to **8.67**.

**The ground is deliberately not adopted.** `body` carries a 1.6s background transition and
the ground shifts as the player moves between sensorium stages. That shifting ground is the
game's core signal, so it stays local.

**Contrast repair.** `.credit` used a hardcoded `#6f6a61`, measuring **2.40** against the
ground. It now uses `--dim` at 8.67.

**Note for the next agent: `style.css` in this repo is dead.** `index.html` does not link
it; the live styles are the inline `<style>` block.

**Verified.** Zero failures, down from five; tightest pair 5.73.

**Measurement limitation, stated plainly.** This is an interactive piece: most of its
content appears only after play begins, so the contrast probe covered the landing screen
(14 text-bearing elements) and not deeper game states. Those are unmeasured, not verified
clean.
