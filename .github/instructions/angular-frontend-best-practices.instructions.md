---
description: 'Angular v20 Frontend Development Best Practices'
applyTo: '**/*.ts, **/*.html, **/*.scss'
---

## Naming Conventions

- Use PascalCase for component, directive, pipe, and service class names
- Use kebab-case for file names (e.g., `user-profile.component.ts`)
- Use camelCase for properties, methods, and variables
- Suffix files appropriately: `.component.ts`, `.service.ts`, `.directive.ts`, `.pipe.ts`
- Use descriptive names that reflect purpose (e.g., `UserAuthenticationService`)

## Project Structure

- Organize by feature modules, not by type
- Use standalone components as the default (Angular 20 standard)
- Keep shared components, directives, and pipes in a `shared/` folder
- Place core services and guards in a `core/` folder
- Use lazy loading for feature routes

## Components

- Prefer standalone components over NgModule-based components
- **Every component must be `standalone: true`**
- **Use `ChangeDetectionStrategy.OnPush` for all components**
- Keep components small and focused on a single responsibility
- Use `input()` and `output()` signal-based APIs instead of `@Input()` and `@Output()` decorators
- Avoid logic in templates; move complex expressions to component methods or computed signals

### Cleanup Pattern

Use `DestroyRef` for cleanup instead of `ngOnDestroy`:

```ts
readonly items = signal<string[]>([]);
private readonly destroyRef = inject(DestroyRef);

constructor() {
  **Use `@if`, `@for`, `@switch` control flow syntax** (never use `*ngIf`, `*ngFor`, `*ngSwitch`)
- Always provide `track` expression in `@for` loops for performance
- Use `@defer` for lazy loading heavy components
- Avoid complex expressions in templates; use computed signals
- Use `ng-container` to group elements without adding DOM nodes

### Control Flow Examples
**Use signals (`signal()`, `computed()`, `effect()`) for reactive state**
- **Prefer zoneless change detection** (no Zone.js) and signal-driven
```html
@for (item of items(); track item; let i = $index) {
  <div>{{ i }}: {{ item }}</div>
}

@if (condition()) {
  <p>Condition is true</p>
}

@switch (mode()) {
  @case ('edit') { <app-editor /> }
  @case ('view') { <app-viewer /> }
  @default { <p>Unknown mode</p> }
}
```
## Signals and State Management

- Use signals (`signal()`, `computed()`, `effect()`) for reactive state
- Prefer `computed()` for derived state instead of manual calculations
- Use `effect()` sparingly; prefer declarative patterns
- Consider NgRx Signal Store for complex state management
- Avoid mixing signals with BehaviorSubjects in the same component

## Templates

- Use `@if`, `@for`, `@switch` control flow syntax (not `*ngIf`, `*ngFor`)
- Always provide `track` expression in `@for` loops for performance
- Use `@defer` for lazy loading heavy components
- Avoid complex expressions in templates; use computed signals
- Use `ng-container` to group elements without adding DOM nodes

## Services and Dependency Injection

- Use `providedIn: 'root'` for singleton services
- Use `inject()` function instead of constructor injection
- Create feature-specific services scoped to their modules when needed
- Use `HttpClient` with typed responses and error handling
- Implement retry logic and caching strategies for API calls

## Reactive Programming

- Use RxJS operators for complex async operations
- Always unsubscribe or use `takeUntilDestroyed()` to prevent memory leaks
- Prefer `async` pipe in templates over manual subscriptions
- Use `toSignal()` and `toObservable()` to bridge signals and observables
- Avoid nested subscriptions; use `switchMap`, `mergeMap`, or `concatMap`

## Forms

- Use Reactive Forms for complex forms with validation
- Use typed forms (`FormGroup<T>`) for type safety
- Create reusable form controls and validators
- Display validation errors consistently across the application
- Use `updateOn: 'blur'` or `'submit'` for performance when appropriate

## Routing

- Use lazy loading with `loadComponent` for standalone components
- Implement route guards for authentication and authorization
- Use resolvers for pre-fetching data
- Define routes in dedicated routing files
- Use `withComponentInputBinding()` to bind route params to inputs

## HTTP and API Communication

- Create dedicated API services for each domain
- Use interceptors for authentication, logging, and error handling
- Implement proper error handling with user-friendly messages
- Use `HttpContext` for request-specific configurations
- Cache GET requests when appropriate

## Performance

- Use `OnPush` change detection strategy
- Implement virtual scrolling for large lists (`@angular/cdk/scrolling`)
- Use `@defer` blocks with appropriate triggers (`on viewport`, `on idle`)
- Optimize bundle size with tree-shaking and lazy loading
- Use `trackBy` (or `track` in new syntax) in loops
- Profile with Angular DevTools and Chrome DevTools

## Testing

- Write unit tests for components, services, and pipes
- Use `TestBed` with standalone component testing utilities
- Mock HTTP calls with `HttpTestingController`
- Use `ComponentFixture` for component interaction tests
- Write e2e tests with Playwright or Cypress for critical user flows

## Styling

### SCSS Organization

- Use component-scoped styles (default encapsulation)
- Follow BEM naming convention for CSS classes
- Use CSS custom properties for theming
- Avoid `::ng-deep`; refactor component structure instead
- Use Angular CDK for accessible UI patterns

### SCSS Imports

Import tokens and mixins in components that need them:

```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;
```

### Mobile-First Breakpoints

Define styles mobile-first, then enhance for larger screens:

```scss
.element {
  font-size: $font-size-base;
  @include md { font-size: $font-size-lg; }
  @include lg { font-size: $font-size-xl; }
}
```

**Breakpoints:**
- `xs`: 320px (extra small phones)
- `sm`: 480px (phones)
- `md`: 768px (tablets)
- `lg`: 1024px (desktops)
- `xl`: 1440px (large desktops)

### CSS Conventions

- Use BEM naming methodology for clarity
- Keep animations subtle and optional
- Avoid heavy effects that distract from core functionality
- Prefer performance-optimized animations (`transform`, `opacity`)
- Ensure animations respect `prefers-reduced-motion`

## Accessibility

- Use semantic HTML elements (e.g., `<button>`, `<nav>`, `<main>`)
- If using `<section>`, include `aria-label` for screen readers
- Decorative images/icons: use `aria-hidden="true"` and `alt=""`
- Provide descriptive `aria-*` attributes where needed
- Ensure keyboard navigation works correctly (tab order, focus management)
- Test with screen readers (VoiceOver, NVDA, JAWS) and accessibility tools
- Use Angular CDK a11y utilities (`FocusTrap`, `LiveAnnouncer`, `A11yModule`)
- Ensure sufficient color contrast ratios (WCAG AA minimum)
- Support `prefers-reduced-motion` for animations

## Security

- Avoid using `bypassSecurityTrust*` methods unless absolutely necessary
- Sanitize user input to prevent XSS attacks
- Use HttpOnly cookies for authentication tokens when possible
- Implement Content Security Policy headers
- Keep Angular and dependencies updated

## Documentation

- Use JSDoc comments for public APIs and complex logic
- Document component inputs and outputs
- Maintain a component library with Storybook if applicable
- Keep README files updated with setup instructions
- Document architectural decisions in ADRs
