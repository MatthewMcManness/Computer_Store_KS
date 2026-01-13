# Code Status Report

**Generated:** 2026-01-13T01:43:41Z
**Project:** Computer Store KS
**Analyzer:** Code Review Agent

## Executive Summary

| Category | Files | Lines (est.) | Recommendation |
|----------|-------|--------------|----------------|
| PRODUCTION | 150+ | ~54,500 | Active codebase - maintain |
| LEGACY | 5 | ~7,700 | Keep as reference/fallback |
| OBSOLETE | 50+ | ~17,000 | Safe to remove |
| UNUSED | 15+ | ~2,100 | Review and remove |

**Total Removable Code:** ~19,100 lines (25% of non-production code)

---

## 1. PRODUCTION - Currently Active

### Next.js Application (`src/`)
The primary production codebase using Next.js 14 App Router.

| Directory | Purpose | Lines (est.) | Status |
|-----------|---------|--------------|--------|
| `src/app/(public)/` | Customer-facing pages | ~3,500 | PRODUCTION |
| `src/app/(auth)/` | Authentication pages | ~1,200 | PRODUCTION |
| `src/app/admin/` | Employee portal | ~12,000 | PRODUCTION |
| `src/app/api/` | API routes | ~8,000 | PRODUCTION |
| `src/components/` | React components | ~6,500 | PRODUCTION |
| `src/lib/` | Utilities and services | ~18,000 | PRODUCTION |
| `src/hooks/` | Custom React hooks | ~500 | PRODUCTION |
| `src/types/` | TypeScript definitions | ~800 | PRODUCTION |

### Configuration Files
| File | Purpose | Status |
|------|---------|--------|
| `render.yaml` | Render deployment config | PRODUCTION |
| `next.config.mjs` | Next.js configuration | PRODUCTION |
| `tailwind.config.js` | Tailwind CSS config | PRODUCTION |
| `tsconfig.json` | TypeScript config | PRODUCTION |
| `package.json` | Dependencies | PRODUCTION |

### Public Assets
| Directory | Purpose | Status |
|-----------|---------|--------|
| `public/assets/` | Images and static files | PRODUCTION |

---

## 2. LEGACY - Obsolete but Used as Backup

These files are outdated but may be needed as fallback or reference.

| File/Directory | Purpose | Lines | Reason to Keep |
|----------------|---------|-------|----------------|
| `api/gallery-api.js` | Express.js backend | 575 | Fallback for gallery management if Next.js API fails |
| `gallery.html` | Static gallery page | 727 | Contains computer data used by extraction script |
| `index.html` | Static homepage | 389 | Reference for original design |
| `style.css` | Static site styles | 3,298 | Reference for public site styling |
| `src/lib/auth.ts` | RepairShopr auth | 751 | Legacy auth during Supabase migration |

### Deprecated Functions (Keep During Migration)

| File | Function | Reason | Migration Target |
|------|----------|--------|------------------|
| `src/lib/auth.ts` | `authenticateWithRepairShopr()` | Legacy employee auth | `authenticateWithSupabase()` |
| `src/lib/middleware.ts` | `getLegacyRequiredRoles()` | Legacy role checking | `canAccessRoute()` |
| `src/lib/middleware.ts` | `hasLegacyRequiredRole()` | Legacy permission check | Role helpers |
| `src/lib/supabase.ts` | `setCustomerSilverPlan()` | Old naming | `setCustomerProtectionPlan()` |
| `src/lib/supabase.ts` | `isCustomerSilverPlan()` | Old naming | `getCustomerPlanTier()` |
| `src/lib/supabase-auth.ts` | `LegacyUserRole` type | Migration compatibility | `UserRole` from roles.ts |
| `src/lib/role-helpers.ts` | `toLegacyRole()` | Backward compatibility | Remove after migration |
| `src/lib/role-helpers.ts` | `fromLegacyRole()` | Backward compatibility | Remove after migration |

---

## 3. OBSOLETE - Safe to Remove

### `_archive/` Directory (16,477 lines total)

| Subdirectory | Contents | Lines (est.) | Recommendation |
|--------------|----------|--------------|----------------|
| `_archive/docs-legacy/` | Old documentation | ~8,000 | REMOVE - info is outdated |
| `_archive/docs-legacy/Documentation/` | Duplicate docs | ~4,000 | REMOVE - duplicates |
| `_archive/docs-legacy/Security_Document/` | Old security audit | ~500 | ARCHIVE externally, remove from repo |
| `_archive/scripts/` | Old deployment scripts | ~1,500 | REMOVE - replaced by render.yaml |
| `_archive/python-tools/` | Python utilities | ~800 | REMOVE - not used |
| `_archive/misc/` | Windows installers | N/A | REMOVE - binary files |

**Files to Remove:**
```
_archive/docs-legacy/CHECK_SETUP.md
_archive/docs-legacy/CONTACT_FORM_MIGRATION.md
_archive/docs-legacy/DEPLOY_TO_LIVE_SITE.md
_archive/docs-legacy/DEPLOYMENT_STEPS.md
_archive/docs-legacy/DEPLOYMENT_SECURITY_CHECKLIST.md
_archive/docs-legacy/Documentation/* (entire directory)
_archive/docs-legacy/IMMEDIATE_ACTIONS.md
_archive/docs-legacy/GALLERY_FIXES.md
_archive/docs-legacy/README_WEB_GALLERY.md
_archive/docs-legacy/QUICK_START.md
_archive/docs-legacy/FIXES_APPLIED.md
_archive/docs-legacy/TROUBLESHOOTING_MODAL_ISSUE.md
_archive/docs-legacy/WEB_GALLERY_MANAGER_SETUP.md
_archive/docs-legacy/SETUP_COMPLETE.md
_archive/docs-legacy/SELF-HOSTING.md
_archive/docs-legacy/RepairShopr-Integration-Proposal.* (keep PDF externally)
_archive/scripts/deploy.sh
_archive/scripts/setup.sh
_archive/scripts/setup-ssl.sh
_archive/scripts/start-both-servers.bat
_archive/scripts/ecosystem.config.js
_archive/scripts/test-server.js
_archive/scripts/spec-migration.js
_archive/scripts/nginx/* (entire directory)
_archive/python-tools/convert_to_pdf.py
_archive/python-tools/gallery_manager.py
_archive/misc/FlyerGenerator_Setup.exe
```

### `backups/` Directory (~18 files, ~700KB)

| Contents | Recommendation |
|----------|----------------|
| `index_backup_*.html` (17 files) | REMOVE - git history preserves versions |
| `index_backup_20251201_multipage.html` | REMOVE - large file, git history exists |

### Root Level Static Files

| File | Lines | Purpose | Recommendation |
|------|-------|---------|----------------|
| `index.html.backup` | 1,453 | Old homepage backup | REMOVE |
| `MODAL_DEBUG.html` | 200 | Debug file | REMOVE |
| `facebook-black-friday-post.html` | 286 | One-time promo | REMOVE |
| `black-friday.html` | 200 | Seasonal page | REMOVE (or move to Next.js) |
| `about.html` | 200 | Static about page | REMOVE (replaced by Next.js) |
| `contact.html` | 250 | Static contact page | REMOVE (replaced by Next.js) |
| `services.html` | 200 | Static services page | REMOVE (replaced by Next.js) |
| `silver-plan.html` | 200 | Static plan page | REMOVE (replaced by Next.js) |
| `add-computer.html` | 500 | Old admin form | REMOVE (replaced by Next.js admin) |
| `edit-computer.html` | 650 | Old admin form | REMOVE (replaced by Next.js admin) |
| `computer-form.html` | 650 | Old admin form | REMOVE (replaced by Next.js admin) |
| `admin-login.html` | 250 | Old login page | REMOVE (replaced by Next.js) |
| `admin-gallery.html` | 450 | Old admin page | REMOVE (replaced by Next.js admin) |

### Root Level JavaScript/CSS

| File | Lines | Purpose | Recommendation |
|------|-------|---------|----------------|
| `script.js` | 901 | Static site JS | REMOVE (Next.js has equivalent) |
| `config.js` | 327 | API configuration | REMOVE (replaced by env vars) |
| `admin-gallery.js` | 1,468 | Old admin JS | REMOVE (replaced by Next.js admin) |

### Other Obsolete Files

| File | Purpose | Recommendation |
|------|---------|----------------|
| `build-output.log` | Build log | REMOVE |
| `INTEGRATION_EXAMPLE.md` | Example doc | REMOVE |
| `NEXT_STEPS.md` | Planning doc | REVIEW - may be outdated |
| `docker-compose.yml` | Docker config | REMOVE (using Render) |
| `Dockerfile` | Docker config | REMOVE (using Render) |
| `.dockerignore` | Docker config | REMOVE (using Render) |
| `bun.lock` | Bun lockfile | REMOVE (using npm per Bast standards) |
| `.node-version` | Node version | KEEP but verify version |

---

## 4. UNUSED - Functions Never Called

### API Directory (`api/`)

The entire `api/` directory (Express.js backend) is technically **UNUSED** by the Next.js app but kept as **LEGACY** fallback.

| File | Purpose | Used By | Recommendation |
|------|---------|---------|----------------|
| `api/gallery-api.js` | Express backend | Legacy admin HTML | LEGACY - keep as fallback |
| `api/package.json` | Express dependencies | api/ | LEGACY |
| `api/render.yaml` | Express deployment | Not deployed | REMOVE |
| `api/.env.example` | Express env example | Reference | REMOVE |
| `api/start-api.bat` | Windows script | Not used | REMOVE |
| `api/INSTALL_FIX.md` | Install docs | Not used | REMOVE |

### Session Store (`src/lib/session-store.ts`)

This file appears to be **UNUSED** - session management now uses `session-cookie.ts`.

| Function | Used By | Recommendation |
|----------|---------|----------------|
| `createSession()` | Not imported anywhere | REMOVE entire file |
| `getSession()` | Not imported anywhere | REMOVE |
| `deleteSession()` | Not imported anywhere | REMOVE |
| `cleanExpiredSessions()` | Not imported anywhere | REMOVE |
| `getSessionSafe()` | Not imported anywhere | REMOVE |

**Note:** Verify no dynamic imports before removing.

### Scripts Directory (`scripts/`)

Migration scripts are **ONE-TIME USE** and should be archived or removed.

| File | Purpose | Recommendation |
|------|---------|----------------|
| `scripts/extract-computers.js` | Data extraction | REMOVE - one-time migration |
| `scripts/migrate-gallery-to-supabase.ts` | Gallery migration | REMOVE - one-time migration |
| `scripts/migrate-users.ts` | User migration | KEEP until migration complete |
| `scripts/migrate-users-rollback.ts` | Migration rollback | KEEP until migration verified |
| `scripts/run-plan-tier-migration.ts` | Plan migration | REMOVE - one-time migration |
| `scripts/seed-blog-posts.ts` | Blog seeding | REMOVE - one-time seeding |
| `scripts/send-password-resets.ts` | Password resets | KEEP - may be needed again |

### Potentially Unused Exports

These functions are exported but may not be imported anywhere:

| File | Function | Recommendation |
|------|----------|----------------|
| `src/lib/google-business.ts` | `clearCache()` | VERIFY usage |
| `src/lib/google-business.ts` | `clearCacheType()` | VERIFY usage |
| `src/lib/google-business.ts` | `getAllCachedData()` | VERIFY usage |
| `src/lib/repairshopr-sync.ts` | Most sync functions | VERIFY - may be for future use |
| `src/lib/audit.ts` | Most audit functions | VERIFY - may be underutilized |

---

## 5. Deprecated Code Patterns

### Functions Marked @deprecated

| File | Function | Replacement |
|------|----------|-------------|
| `src/lib/auth.ts` | Entire file | `supabase-auth.ts` |
| `src/lib/auth.ts` | `authenticateWithRepairShopr()` | `authenticateWithSupabase()` |
| `src/lib/middleware.ts` | `getLegacyRequiredRoles()` | `canAccessRoute()` |
| `src/lib/middleware.ts` | `hasLegacyRequiredRole()` | Role helpers |
| `src/lib/middleware.ts` | `getRoleRedirectUrl()` (single role) | Multi-role version |
| `src/lib/supabase.ts` | `setCustomerSilverPlan()` | `setCustomerProtectionPlan()` |
| `src/lib/supabase.ts` | `isCustomerSilverPlan()` | `getCustomerPlanTier()` |
| `src/lib/supabase-auth.ts` | `LegacyUserRole` type | `UserRole` type |
| `src/lib/supabase-auth.ts` | `isEmployeeRole()` | `isEmployee()` from role-helpers |
| `src/lib/repairshopr.ts` | `isSilverPlanCustomer()` | `getProtectionPlanTier()` |
| `src/lib/role-helpers.ts` | `toLegacyRole()` | Direct role array usage |
| `src/lib/role-helpers.ts` | `fromLegacyRole()` | Direct role array usage |
| `src/lib/session-cookie.ts` | `apiToken` field | Shared API key |

### TODO Items Found

| File | Line | TODO |
|------|------|------|
| `src/app/admin/businesses/page.tsx` | 277 | Implement delete functionality |
| `src/app/admin/businesses/page.tsx` | 316 | Implement delete functionality |

---

## 6. Cleanup Recommendations

### Phase 1: Safe Immediate Removal (Low Risk)
Total: ~15,000 lines

1. **Remove `_archive/` directory entirely**
   - Archive `RepairShopr-Integration-Proposal.pdf` externally first
   - Archive security audit docs externally

2. **Remove `backups/` directory entirely**
   - Git history preserves all versions

3. **Remove debug/temp files:**
   - `MODAL_DEBUG.html`
   - `build-output.log`
   - `INTEGRATION_EXAMPLE.md`
   - `index.html.backup`

4. **Remove Docker files (not using Docker):**
   - `docker-compose.yml`
   - `Dockerfile`
   - `.dockerignore`

5. **Remove `bun.lock`** (using npm per Bast standards)

### Phase 2: Static Site Removal (Medium Risk)
Total: ~7,000 lines

After verifying Next.js equivalents work:

1. **Remove static HTML pages:**
   - `about.html` (replaced by `/about`)
   - `contact.html` (replaced by `/contact`)
   - `services.html` (replaced by `/services`)
   - `silver-plan.html` (replaced by `/silver-plan`)
   - `black-friday.html` (consider Next.js version)
   - `facebook-black-friday-post.html`

2. **Remove old admin files:**
   - `add-computer.html`
   - `edit-computer.html`
   - `computer-form.html`
   - `admin-login.html`
   - `admin-gallery.html`
   - `admin-gallery.js`

3. **Remove static site JS/CSS:**
   - `script.js`
   - `config.js`

### Phase 3: Legacy Code Deprecation (High Risk)
Total: ~2,100 lines

After Supabase auth migration is complete:

1. **Remove `src/lib/session-store.ts`** (verify no usage first)

2. **Remove legacy auth functions from `src/lib/auth.ts`:**
   - `authenticateWithRepairShopr()`
   - Keep `authenticateWithSupabase()` and session functions

3. **Remove deprecated middleware functions**

4. **Remove one-time migration scripts:**
   - `scripts/extract-computers.js`
   - `scripts/migrate-gallery-to-supabase.ts`
   - `scripts/run-plan-tier-migration.ts`
   - `scripts/seed-blog-posts.ts`

### Phase 4: API Directory Decision
Total: ~575 lines

Decide on `api/` directory:

**Option A: Remove entirely**
- If Next.js API routes fully replace functionality
- Remove `api/gallery-api.js` and all files

**Option B: Keep as emergency fallback**
- Keep `api/gallery-api.js` only
- Remove other api/ files (`render.yaml`, `INSTALL_FIX.md`, etc.)

---

## 7. Code Quality Metrics

### Line Count Summary

| Category | Lines |
|----------|-------|
| Production (`src/`) | 54,573 |
| Legacy (keep) | 7,740 |
| Obsolete (remove) | ~17,000 |
| Unused (remove) | ~2,100 |
| **Total Codebase** | ~81,400 |
| **After Cleanup** | ~62,300 |
| **Reduction** | ~23% |

### Technical Debt Items

1. **Migration incomplete:** RepairShopr to Supabase auth
2. **Deprecated functions:** 15+ marked @deprecated
3. **TODO items:** 2 unimplemented features
4. **Dual systems:** Both legacy and new auth running

### Recommended Priority

1. **High:** Complete Supabase auth migration, then clean legacy auth
2. **Medium:** Remove obsolete static files and `_archive/`
3. **Low:** Implement missing TODO items
4. **Low:** Remove unused sync/audit functions after verification

---

## 8. Verification Commands

Before removing any code, run these checks:

```bash
# Check for imports of a function
rg "import.*functionName" src/

# Check for dynamic imports
rg "import\(" src/ | rg "functionName"

# Check git log for recent changes to file
git log --oneline -10 -- path/to/file

# Find all references to a file
rg "filename" --type ts --type tsx
```

---

## Appendix: Files by Category

### A. Keep (Production)
- `src/**/*` (excluding deprecated functions)
- `public/**/*`
- `render.yaml`
- `next.config.mjs`
- `tailwind.config.js`
- `tsconfig.json`
- `package.json`
- `package-lock.json`
- `CLAUDE.md`
- `README.md`
- `.env.example`
- `.gitignore`
- `postcss.config.js`
- `robots.txt`
- `sitemap.xml`
- `documentation/business_info.md`

### B. Keep (Legacy/Fallback)
- `api/gallery-api.js` (optional)
- `gallery.html` (data source)
- `index.html` (reference)
- `style.css` (reference)
- `src/data/gallery.json`

### C. Remove (Obsolete)
- `_archive/**/*`
- `backups/**/*`
- Docker files
- Debug files
- One-time migration scripts

### D. Verify Then Remove (Unused)
- `src/lib/session-store.ts`
- `api/` directory (most files)
- Deprecated sync functions
