# Create API Endpoint

Create a new .NET 9 API endpoint following project conventions.

## Requirements

- Follow RESTful naming conventions
- Include proper HTTP status codes
- Add XML documentation comments
- Implement validation using Data Annotations or FluentValidation
- Include audit fields where applicable

## Files to Create/Update

1. **Controller** - Add endpoint method
2. **DTOs** - Request/Response models in `DTOs/` folder
3. **Service** - Business logic (if complex)
4. **Repository** - Data access (if needed)

## Sync Checklist

After creating the endpoint:
- [ ] Update `docs/ERD.md` if schema changes
- [ ] Add seed data to `DbSeeder.cs` if new entities
- [ ] Test with Postman/API client

## Example Usage

```
#create-api-endpoint
Create a POST endpoint to add a new guest to an invitation
```
