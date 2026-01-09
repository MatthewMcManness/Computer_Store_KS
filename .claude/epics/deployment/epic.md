---
name: deployment
status: completed
created: 2025-11-27T13:35:27Z
progress: 100%
prd: .claude/prds/deployment.md
github: https://github.com/MatthewMcManness/Computer_Store_KS/issues/4
---

# Epic: deployment

## Overview

Deploy the existing Computer Store Kansas Next.js 14 application to Render. The application is **already fully built** - this epic focuses purely on resolving Render build errors and configuring the production environment. No new features or code changes are required beyond deployment fixes.

## Architecture Decisions

### Decision 1: Use Render's Native Node.js Runtime
- **Choice**: Use Render's managed Node.js environment (not Docker)
- **Rationale**: Simpler configuration, automatic Sharp binary support, lower maintenance

### Decision 2: Standalone Build Output
- **Choice**: Keep `output: 'standalone'` in next.config.mjs
- **Rationale**: Already configured, produces minimal deployment artifact, future-ready for containerization

### Decision 3: File-Based Data Persistence
- **Choice**: Gallery data in `src/data/gallery.json` with optional GitHub sync
- **Rationale**: Zero infrastructure cost, adequate for low-volume business, data versioned in git

### Decision 4: In-Memory Rate Limiting
- **Choice**: Accept in-memory rate limit store (resets on deploy)
- **Rationale**: Single instance, low traffic, acceptable tradeoff for simplicity

## Technical Approach

### No Frontend Changes Required
- All UI components already built and working locally
- Gallery management UI functional at `/admin/gallery`
- Contact form functional at `/contact`

### No Backend Changes Required
- All API endpoints implemented and tested locally
- Authentication, CRUD, image upload, email - all working
- Build succeeds locally with `npm run build`

### Infrastructure Focus (This Epic)
1. **Diagnose Render Build Failures** - Analyze build logs to identify root cause
2. **Fix Build Configuration** - Adjust next.config.mjs, render.yaml, or package.json as needed
3. **Configure Environment Variables** - Set required secrets in Render dashboard
4. **Verify Production Functionality** - Test all features on live URL

## Implementation Strategy

### Approach: Minimal Changes
Since the application works locally, we will:
1. Get exact error from Render build logs
2. Make targeted fix (likely webpack/module resolution)
3. Test build locally with production flags
4. Deploy and verify

### Testing Approach
- Local: `npm run build && npm start`
- Production: Manual testing of all user flows post-deploy

## Task Breakdown Preview

High-level tasks (limited to essential work only):

- [ ] **Task 1: Diagnose Build Error** - Get Render build logs, identify exact failure point
- [ ] **Task 2: Fix Build Configuration** - Apply targeted fix based on error analysis
- [ ] **Task 3: Configure Render Environment** - Set RESEND_API_KEY, ADMIN_PASSWORD in dashboard
- [ ] **Task 4: Deploy and Verify** - Push fix, monitor build, test gallery + contact form

## Dependencies

### External Services (Already Configured)
| Service | Status | Action Required |
|---------|--------|-----------------|
| Render | Account exists | Set env vars in dashboard |
| Resend | API key exists | Copy key to Render |
| GitHub | Repo connected | Auto-deploy enabled |

### Blockers
- None - all prerequisites met

## Success Criteria (Technical)

| Criteria | Verification Method |
|----------|-------------------|
| Build completes | Render build logs show success |
| App accessible | HTTP 200 from Render URL |
| Admin login works | Login at `/admin/login`, access `/admin/gallery` |
| Gallery CRUD works | Add computer, see on `/gallery` |
| Contact form works | Submit form, check email delivery |

## Estimated Effort

- **Total Tasks**: 4
- **Complexity**: Low (configuration fixes, no new code)
- **Critical Path**: Task 1 (diagnosis) → Task 2 (fix) → Task 3 (env vars) → Task 4 (verify)

## Notes

This is a **deployment-only epic**. The application code is complete and tested. We are not:
- Adding features
- Refactoring code
- Changing architecture
- Setting up CI/CD pipelines

The goal is simply: **get the existing, working app live on Render**.

## Tasks Created
- [ ] #5 - Diagnose Render Build Error (parallel: false)
- [ ] #6 - Fix Build Configuration (parallel: false, depends on: #5)
- [ ] #7 - Configure Render Environment Variables (parallel: true)
- [ ] #8 - Deploy and Verify Production (parallel: false, depends on: #6, #7)

Total tasks: 4
Parallel tasks: 1 (Task #7 can run alongside Tasks #5-#6)
Sequential tasks: 3
Estimated total effort: 3-4 hours
