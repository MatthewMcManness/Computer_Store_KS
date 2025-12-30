---
issue: 20
title: Update Login UI with Email Field
analyzed: 2025-11-29T00:15:00Z
estimated_hours: 2
parallelization_factor: 1.0
---

# Parallel Work Analysis: Issue #20

## Overview
Update the admin login page to include an email field for RepairShopr authentication. The form should work seamlessly with both authentication modes, sending `{ email, password }` to the login API and displaying user-friendly error messages.

## Parallel Streams

### Stream A: Login Page UI Update
**Scope**: Update login form with email field and improved UX
**Files**:
- `src/app/admin/login/page.tsx`
**Agent Type**: react-expert
**Can Start**: immediately
**Estimated Hours**: 2
**Dependencies**: none (uses login API from Issue #18)

**Work Items**:
1. Add email state variable
2. Add email input field above password field
3. Update form submission to send { email, password }
4. Map API error codes to user-friendly messages:
   - INVALID_CREDENTIALS → "Invalid email or password"
   - RATE_LIMITED → "Too many attempts. Please wait a moment."
   - SERVICE_UNAVAILABLE → "Authentication service unavailable. Please try again."
5. Display user name on successful login (brief message before redirect)
6. Maintain existing visual design and styling
7. Support keyboard navigation (email → password → submit)
8. Add basic email format validation

## Coordination Points

### Shared Files
None - single file update

### Sequential Requirements
None - standalone UI update

## Conflict Risk Assessment
- **Low Risk**: Single file update, no dependencies on other streams

## Parallelization Strategy

**Recommended Approach**: sequential

This is a small, focused UI task. No parallelization needed.

```
Timeline:
├─ Stream A (Login UI): ████████████████ (2h)
```

## Expected Timeline

- Wall time: 2 hours
- Total work: 2 hours

## Notes

- **Backward Compatibility**: Form should still work in legacy mode (email can be empty/ignored)
- **Visual Design**: Must match existing purple/indigo gradient styling
- **Accessibility**: Email field should have proper label and autoFocus on first field
- **Mobile**: Form should remain responsive on mobile viewports
- **Success Feedback**: Show user's name briefly before redirecting to /admin
