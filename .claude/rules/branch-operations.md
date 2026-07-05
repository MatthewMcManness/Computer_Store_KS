# Git Workflow

This project uses a direct-to-production workflow. There is no staging environment.

**Live on Dokploy since the 2026-07-05 cutover from Render.** computerstoreks.com serves from the managed Dokploy application `csks-app` (appName `csks-prod-whpiwp`, applicationId `4Vo5XO4DlcFTu25HpFjxb`) with `csks-postgres`, behind the `csks-prod` named Cloudflare tunnel. Admin is gated by Cloudflare Access.

## Branches and Remotes

- Live branch: `migrate-dokploy-selfhost`. Dokploy builds from this branch on the **mirror**. (Aligning it to a `Production` branch is optional future cleanup; do not repoint the Dokploy app's branch without redeploying + verifying.)
- **Pushing to GitHub does NOT auto-deploy.** You must trigger the Dokploy deploy after pushing.
  - `origin` = store-owned `github.com/MatthewMcManness/Computer_Store_KS`
  - `mirror` = RWS mirror `github.com/m318m972/computer-store-ks-mirror` (Dokploy is connected to the m318m972 account, so it builds from HERE)

## How Deploys Actually Work (Dokploy)

The site runs on the local Dokploy server (managed app `csks-app` / `csks-prod-whpiwp`, Dockerfile build, with `csks-postgres`) behind the `csks-prod` Cloudflare tunnel. Render is gone; there is no push-triggered auto-deploy.

Deploying a change:

1. Push the commit to `mirror` (Dokploy builds from the mirror repo). A pre-push hook runs `npm run build` and rejects the push if it fails.
2. Trigger a deploy of `csks-app` in Dokploy: `POST http://localhost:3000/api/application.deploy {"applicationId":"4Vo5XO4DlcFTu25HpFjxb"}` with header `x-api-key: $DOKPLOY_API_TOKEN` (or the panel). It rebuilds from the Dockerfile.
3. Verify `/api/health` on the live site.

```bash
git checkout migrate-dokploy-selfhost
npm run dev                    # Test at http://localhost:3000
# Get approval before deploying (there is no undo once live)
git add <files>
git commit -m "feat: description"
git push origin migrate-dokploy-selfhost   # Backup/sync (store repo)
git push mirror migrate-dokploy-selfhost   # This is what Dokploy builds from
# Then trigger the Dokploy deploy (step 2 above)
```

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
- **Always get user approval** before triggering a Dokploy deploy — there is no undo once it's live
- **Never force push** to Production
- **Commit frequently** with small, focused commits
- If something breaks in production: `git revert HEAD`, push, and redeploy `csks-app` in Dokploy
