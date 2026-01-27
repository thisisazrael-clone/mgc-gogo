# Create Angular Component

Create a new Angular standalone component following project conventions:

## Requirements

- **Standalone**: `standalone: true`
- **Change Detection**: `ChangeDetectionStrategy.OnPush`
- **State Management**: Use signals (`signal()`, `computed()`)
- **Styling**: SCSS with mobile-first approach (320px → 1440px)
- **UI Library**: Angular Material components where applicable

## Component Structure

Generate:
1. `{{name}}.component.ts` - Component class with signals
2. `{{name}}.component.html` - Template with Angular Material
3. `{{name}}.component.scss` - Mobile-first responsive styles
4. `{{name}}.component.spec.ts` - Unit tests

## Example Usage

```
#create-angular-component
Create a guest-card component that displays invitation guest details
```
