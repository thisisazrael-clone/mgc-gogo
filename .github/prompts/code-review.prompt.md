# Code Review

Review the selected code for quality, security, and best practices.

## Review Checklist

### General
- [ ] Clear naming conventions
- [ ] No magic numbers/strings
- [ ] Proper error handling
- [ ] No unnecessary complexity

### Angular (Frontend)
- [ ] Using signals instead of BehaviorSubjects
- [ ] OnPush change detection
- [ ] Standalone components
- [ ] Mobile-first responsive design
- [ ] Proper unsubscription (if using observables)

### .NET (Backend)
- [ ] No credentials in code
- [ ] Audit fields included
- [ ] Proper async/await usage
- [ ] Input validation
- [ ] Appropriate HTTP status codes

### Security
- [ ] No sensitive data exposure
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention

## Example Usage

```
#code-review
Review this authentication service for security issues
```
