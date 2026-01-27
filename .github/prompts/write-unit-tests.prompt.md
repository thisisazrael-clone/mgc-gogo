# Write Unit Tests

Generate comprehensive unit tests for the specified code.

## Frontend Tests (Angular)

- Use Jasmine/Karma or Jest
- Test signal state changes
- Mock services with `jasmine.createSpyObj`
- Test component inputs/outputs
- Cover edge cases and error states

## Backend Tests (.NET)

- Use xUnit or NUnit
- Mock dependencies with Moq
- Test happy path and error scenarios
- Include integration tests for repositories
- Test validation logic

## Test Structure

```
Arrange → Act → Assert
```

## Coverage Goals

- Aim for 80%+ code coverage
- Focus on business logic
- Don't test framework code

## Example Usage

```
#write-unit-tests
Write tests for the GuestService class covering CRUD operations
```
