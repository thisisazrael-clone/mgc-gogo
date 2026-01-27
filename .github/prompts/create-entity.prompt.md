# Create Database Entity

Create a new Entity Framework Core entity following project conventions.

## Requirements

- Include required audit fields:
  - `CreatedBy` (string, required)
  - `CreatedAt` (DateTime, required)
  - `UpdatedBy` (string?, optional)
  - `UpdatedAt` (DateTime?, optional)
- Use appropriate data annotations
- Configure relationships properly

## Files to Create/Update

1. **Entity class** - In `Models/` or `Entities/` folder
2. **DbContext** - Add `DbSet<Entity>`
3. **Migration** - Run `dotnet ef migrations add <MigrationName>`
4. **DbSeeder.cs** - Add sample seed data
5. **docs/ERD.md** - Update entity relationship diagram

## Example Usage

```
#create-entity
Create a GuestResponse entity to track RSVP responses with dietary preferences
```
