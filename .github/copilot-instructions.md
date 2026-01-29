# Copilot Instructions — Magic Chess: Go Go Enemy Tracker

Single-page **frontend-only** Angular 21 app to track match opponents in an 8-player *Magic Chess: Go Go* lobby and predict upcoming opponents.

## Quick Start

```bash
cd frontend
npm install
npm start       # http://localhost:4200
npm test        # Vitest in watch mode
npm run build   # production → dist/frontend/browser/
```

## Domain Rules (Do Not Change)

- **8-player lobby**: User + 7 unique opponents
- **Matches 1–7**: Face each opponent once (record in order faced)
- **Match 8+**: Cycle repeats → predict with `opponents[(N-1) % 7]`
- **Dead opponents**: Skip to next alive in sequence when predicting

See [prediction.util.ts](frontend/src/app/core/utils/prediction.util.ts) for the pure `predictOpponent()` function.

## Architecture

```
frontend/src/app/
├── core/
│   ├── models/      # Lobby, Opponent interfaces
│   ├── services/    # StorageService (signal-based state)
│   └── utils/       # prediction.util.ts (pure functions)
├── features/
│   ├── tracker/     # Main opponent recording UI
│   └── predictor/   # Visual wheel prediction display
├── shared/components/
│   ├── confirm-dialog/        # Reusable confirmation
│   └── fight-animation-dialog/# Match outcome recording
└── styles/          # _variables.scss, _mixins.scss
```

### State Management Pattern

**All state via Angular signals — no Zone.js, no RxJS for local state.**

```ts
// StorageService is the single source of truth
private readonly state = signal<LobbyState>(this.loadState());
getLobbySignal() { return this.state; }  // Exposes read-only signal

// Components derive state with computed()
protected readonly lobby = this.storageService.getLobbySignal();
protected readonly opponents = computed(() => this.lobby().currentLobby?.opponents ?? []);
```

- **Mutations**: Call `StorageService` methods (e.g., `addOpponent()`, `advanceMatch()`)
- **Persistence**: `localStorage` key `mgc-gogo-lobby-state` — auto-saves on every mutation
- **Dialogs**: `MatDialog.afterClosed()` is the one acceptable RxJS observable usage

### Data Models

- **Lobby**: `id`, `playerName`, `opponents[]`, `currentMatch`, `isComplete`, `matchHistory[]`
- **Opponent**: `id`, `name`, `isDead`, `icon`, `color`, `matchResults[]`, `killCount`, `killedBy`, `eliminatedAtMatch`

## Angular 21 Patterns (MUST Follow)

**Detailed rules in [angular-frontend-best-practices.instructions.md](.github/instructions/angular-frontend-best-practices.instructions.md)**

| Pattern | Example |
|---------|---------|
| Standalone components | `standalone: true` on every `@Component` |
| Zoneless | `provideZonelessChangeDetection()` in [app.config.ts](frontend/src/app/app.config.ts) |
| OnPush | `changeDetection: ChangeDetectionStrategy.OnPush` always |
| Signal APIs | `signal()`, `computed()`, `inject()`, `model()`, `input()`, `output()` |
| Template syntax | `@if`, `@for`, `@switch` (not `*ngIf`/`*ngFor`) |
| DI | `inject()` function, not constructor injection |
| Cleanup | `takeUntilDestroyed(this.destroyRef)` for any subscriptions |

### Component Template

```ts
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [/* Material modules, FormsModule, etc. */],
  templateUrl: './example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {
  private readonly storageService = inject(StorageService);
  protected readonly data = computed(() => /* derive from signals */);
}
```

## Testing

- **Framework**: Vitest (not Karma/Jasmine)
- **Pure functions**: Test `prediction.util.ts` in isolation
- **Components**: Use `TestBed`, mock `StorageService`

## Common Tasks

```bash
ng generate component features/my-feature --standalone
ng generate service core/services/my-service
```

## Code Generation Checklist

1. Follow `.github/instructions/angular-frontend-best-practices.instructions.md`
2. Use signals for all component state
3. Add new files to correct folder (`core/`, `features/`, `shared/`)
4. Call out any game-rule assumptions if uncertain
