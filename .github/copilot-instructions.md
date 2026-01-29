# Copilot Instructions — Magic Chess: Go Go Enemy Tracker

**Last Updated:** 2026-01-29

Single-page **frontend-only** Angular 21 app to track match opponents in an 8‑player *Magic Chess: Go Go* lobby and predict upcoming opponents.

## Goal

During the first 7 matches, the player faces each of the other 7 opponents once. After match 7, the opponent order repeats from the start.

- Store the opponent list in the order faced in matches **1 → 7**.
- For match **N > 7**, predicted opponent is `opponents[(N - 1) % 7]`.
- Skip dead opponents when predicting: advance to the next alive opponent in sequence.
- Keep the prediction logic as a small, pure function.

## Quick Start

```bash
cd frontend
npm install
npm start                # ng serve → http://localhost:4200
npm run build            # production build → dist/
npm test                 # Vitest unit tests (watch mode)
npm run watch            # build in watch mode
```

### npm Scripts (frontend/package.json)

- `npm start` - Start dev server (auto-reload on changes)
- `npm run build` - Production build with optimization
- `npm test` - Run Vitest tests in watch mode
- `npm run watch` - Build in watch mode for development
- `ng generate component <name>` - Scaffold new component (standalone by default)

---

## Architecture Patterns

### Signal-Based State (Angular 21 Signals)

All state management uses Angular signals — **no Zone.js, no RxJS for local state** (exception: Angular Material Dialog returns Observables for `afterClosed()` events, which is acceptable).

- **StorageService**: Single signal-based source of truth (`signal<LobbyState>`)
- **Components**: Use `computed()` for derived state, `inject()` for DI
- **Change detection**: All components use `ChangeDetectionStrategy.OnPush`
- **App config**: Zoneless mode via `provideZonelessChangeDetection()`

Example from [tracker.component.ts](frontend/src/app/features/tracker/tracker.component.ts):
```ts
protected readonly lobby = this.storageService.getLobbySignal();
protected readonly opponents = computed(() => this.lobby().currentLobby?.opponents ?? []);
protected readonly predictedOpponent = computed(() => {
  const matchNum = this.currentMatchNumber();
  const opps = this.opponents();
  return matchNum > 7 ? predictOpponent(matchNum, opps) : null;
});
```

### Data Flow

1. **StorageService** (`core/services/storage.service.ts`): 
   - Manages `LobbyState` signal
   - Persists to `localStorage` on every mutation
   - Exposes `getLobbySignal()` for reactive access
   
2. **Pure utilities** (`core/utils/prediction.util.ts`):
   - `predictOpponent()`: Core prediction logic with dead opponent skipping
   - `validateUniqueOpponents()`: Validation for first 7 matches
   
3. **Feature components**: 
   - Import `StorageService` signal
   - Use `computed()` for derived state
   - Call service methods for mutations

### LocalStorage Persistence

State survives page refresh via `localStorage`.

**Naming convention**: Use kebab-case with project prefix: `<project>-<feature>-state`
- Current key: `mgc-gogo-lobby-state` ✅
- Bad example: `lobbyState`, `MGC_GOGO_STATE`

```ts
private saveState(): void {
  localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state()));
}

private loadState(): LobbyState {
  const stored = localStorage.getItem(this.STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Restore Date objects
    if (parsed.currentLobby) {
      parsed.currentLobby.createdAt = new Date(parsed.currentLobby.createdAt);
    }
    return parsed;
  }
  return { currentLobby: null, opponentNameHistory: [] };
}
```

---

## Domain Rules

Don't "invent" game behavior — follow these established rules:

- Lobby size: **8 players total** (including the user).
- Opponents in matches **1–7** are **7 unique** players (no repeats).
- From match **8 onward**, the app predicts based on the recorded order from matches **1–7**.
- **Dead opponent handling**: When predicting, skip dead opponents by advancing to the next alive opponent in the cycle.

### Data Model

- **Lobby** (`core/models/lobby.model.ts`): Contains `id`, `createdAt`, `opponents[]`, `currentMatch`, `isComplete`
- **Opponent** (`core/models/opponent.model.ts`): `id`, `name`, `isDead` flag
- **LobbyState**: `currentLobby`, `opponentNameHistory[]` for autocomplete

### Validation Rules (enforced in computed signals)

- Match number must be `>= 1`
- Matches 1–7 require exactly 7 unique opponents (case-insensitive names)
- Cannot add opponent if lobby already has 7
- Cannot advance match until all 7 opponents recorded

---

## Project Structure

```
frontend/src/app/
  core/
    models/               # Lobby, Opponent interfaces
    services/             # StorageService, AutocompleteService
    utils/                # prediction.util.ts (pure functions)
  features/
    tracker/              # Main UI for recording/predicting matches
  shared/
    components/
      confirm-dialog/     # Reusable Material dialog
  styles/
    _variables.scss       # Tokens, breakpoints
    _mixins.scss          # Mobile-first media queries
  app.ts / app.config.ts  # Root component, app-level providers
```

---

## Angular 21 Conventions

**This project uses Angular 21 modern patterns. See `.github/instructions/angular-frontend-best-practices.instructions.md` for comprehensive rules.**

Key patterns in this codebase:

- **Standalone components** (`standalone: true`) everywhere
- **Signal APIs**: `signal()`, `computed()`, `inject()`, `model()`, `input()`, `output()`
- **Zoneless change detection** (`provideZonelessChangeDetection()`)
- **OnPush change detection** for all components (best practice even in zoneless mode)
- **New template syntax**: `@if`, `@for`, `@switch` (not `*ngIf`/`*ngFor`)
- **Angular Material 21** for UI components

### Component API Examples

```ts
// Input signals
name = input<string>();                    // Optional
userId = input.required<string>();         // Required
count = input(0);                          // With default
disabled = input(false, { transform: booleanAttribute }); // With transform

// Output signals
itemSelected = output<string>();
saveClicked = output({ alias: 'save' });

// Model signals (two-way binding)
checked = model(false);                    // Works with [(ngModel)]
value = model<string>('');

// Usage
itemSelected.emit('value');
```

Example component structure ([tracker.component.ts](frontend/src/app/features/tracker/tracker.component.ts)):
```ts
@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, /* ... */],
  templateUrl: './tracker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackerComponent {
  private readonly storageService = inject(StorageService);
  protected readonly lobby = this.storageService.getLobbySignal();
  protected readonly canAddOpponent = computed(() => /* ... */);
}
```

---

## Development Workflow

1. **Start dev server**: `cd frontend && npm start`
2. **Make changes**: Files auto-reload via Angular CLI
3. **Run tests**: `npm test` (keep in watch mode during development)
4. **Check types**: TypeScript compiler runs automatically with build
5. **Build for production**: `npm run build` → outputs to `dist/frontend/browser/`

### Common Tasks

- **Generate component**: `ng generate component features/my-feature --standalone`
- **Generate service**: `ng generate service core/services/my-service`
- **Add Angular Material component**: Check [Material docs](https://material.angular.io/) for import path

---

## Testing

- Unit tests use **Vitest** (not Karma)
- Test standalone components with `TestBed`
- Mock `StorageService` for component tests
- Test pure functions (`prediction.util.ts`) in isolation

---

## What to Deliver When Generating Code

- Include file paths in responses when touching multiple files.
- Call out assumptions if any game-rule detail is uncertain.
- **When creating new files**, check if they should be ignored (e.g., build outputs, dependencies, IDE files). If yes, add them to `.gitignore`.
- Follow `.github/instructions/angular-frontend-best-practices.instructions.md` for all Angular code.

````
