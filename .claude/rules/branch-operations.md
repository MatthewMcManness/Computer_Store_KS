# Git Workflow

This project uses a direct-to-production workflow. There is no staging environment.

## Branches and Remotes

- Working branch: `migrate-dokploy-selfhost` (current, since the 2026-06-30 self-host migration). It merges into `Production` at cutover.
- `Production` remains the convention for the live branch, but **pushing to GitHub does NOT deploy anything.** Pushes are backup/sync only:
  - `origin` = store-owned `github.com/MatthewMcManness/Computer_Store_KS`
  - `mirror` = RWS mirror `github.com/m318m972/computer-store-ks-mirror`

## How Deploys Actually Work (Dokploy)

The site runs on the local Dokploy server (app `csks-app`, Dockerfile build, with the `csks-postgres` service) behind the RWS Cloudflare tunnel. Render is gone; there is no push-triggered auto-deploy.

Deploying a change:

1. Push the commit to `origin` (Dokploy builds from the GitHub repo).
2. Trigger a deploy of the `csks-app` application in Dokploy (panel or API `application.deploy`); it pulls the configured branch and rebuilds from the Dockerfile.
3. Verify `/api/health` on the live site.

Which branch the Dokploy app currently builds from (`migrate-dokploy-selfhost` pre-cutover vs `Production` post-merge): verify with Matthew before deploying.

```bash
git checkout migrate-dokploy-selfhost
npm run dev                    # Test at http://localhost:3000
# Share localhost link with user, get approval
npm run build                  # Verify build passes
git add <files>
git commit -m "feat: description"
git push origin migrate-dokploy-selfhost   # Backup only — does NOT deploy
git push mirror migrate-dokploy-selfhost   # Keep the RWS mirror in sync
# Then trigger the Dokploy deploy (step 2 above)
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
- **Always get user approval** before triggering a Dokploy deploy — there is no undo once it's live
- **Never force push** to Production
- **Commit frequently** with small, focused commits
- If something breaks in production: `git revert HEAD`, push, and redeploy `csks-app` in Dokploy
