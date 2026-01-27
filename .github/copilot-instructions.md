# Copilot Instructions — Magic Chess: Go Go Enemy Tracker

Single-page **frontend-only** Angular app to help track match opponents in an 8‑player *Magic Chess: Go Go* lobby and predict upcoming opponents.

## Goal

During the first 7 matches, the player faces each of the other 7 opponents once. After match 7, the opponent order repeats from the start.

- Store the opponent list in the order faced in matches **1 → 7**.
- For match **N > 7**, predicted opponent is `opponents[(N - 1) % 7]`.
- Keep the prediction logic as a small, pure function.

## Quick Start

```bash
cd frontend
npm install
npm start                # http://localhost:4200
npm run build            # production build
```

---

## Domain Rules

Don't "invent" game behavior — follow these established rules:

- Lobby size: **8 players total** (including the user).
- Opponents in matches **1–7** are **7 unique** players (no repeats).
- From match **8 onward**, the app predicts based on the recorded order from matches **1–7**.

### Data Model Guidance

- Prefer stable identifiers (e.g., `playerId`), but allow a display name.
- Persist locally (e.g., `localStorage`) so the list survives refresh.
- Validate inputs:
  - match number must be `>= 1`
  - matches 1–7 require an opponent
  - matches 1–7 opponents must be unique

---

## Project Structure

Keep code grouped by feature:

```
frontend/src/app/
  core/                   # shared utilities, storage, pure logic
  features/
    tracker/              # record matches 1–7
    predictor/            # show predicted opponent for any match N
    history/              # optional: past lobbies
  shared/                 # reusable UI components
  app.ts / app.config.ts
```

When implementing business logic, prefer `core/` with pure functions.

---

## What to Deliver When Generating Code

- Include file paths in responses when touching multiple files.
- Call out assumptions if any game-rule detail is uncertain.
- **When creating new files**, check if they should be ignored (e.g., build outputs, dependencies, IDE files). If yes, add them to `.gitignore`.
