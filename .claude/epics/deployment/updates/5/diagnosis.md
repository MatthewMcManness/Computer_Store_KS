---
issue: 5
completed: 2025-11-27T13:52:00Z
status: completed
---

# Diagnosis: Render Build Error

## Error Message
```
It looks like you're trying to use TypeScript but do not have the required package(s) installed.
Please install typescript by running:
    npm install --save-dev typescript
```

## Root Cause
`typescript` was in `devDependencies`, but Render runs `npm install --production` by default, which skips devDependencies.

## Fix Applied
Moved `typescript` from `devDependencies` to `dependencies` in `package.json`.

## Verification
- Local build passes: `bun run build` ✓
- Ready for deployment
