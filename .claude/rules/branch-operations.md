# Git Workflow

This project uses a direct-to-production workflow. There is no staging environment.

## Production Branch

All work happens in the `Production` branch. Render auto-deploys when you push.

```bash
git checkout Production
npm run dev                    # Test at http://localhost:3000
# Share localhost link with user, get approval
npm run build                  # Verify build passes
git add <files>
git commit -m "feat: description"
git push origin Production     # Goes live immediately
```

A pre-push hook runs `npm run build` automatically — push will be rejected if the build fails.

## Commit Messages

Use conventional commits:

```
feat: add new feature
fix: fix a bug
refactor: restructure code without changing behavior
docs: update documentation
chore: dependency updates, config changes
test: add or update tests
```

## Rules

- **Always test locally** before pushing — `npm run dev` at http://localhost:3000
- **Always get user approval** before pushing — there is no undo once it's live
- **Never force push** to Production
- **Commit frequently** with small, focused commits
- If something breaks in production: `git revert HEAD && git push origin Production`
