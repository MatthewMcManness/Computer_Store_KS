---
name: repo-organization-and-documentation
description: Organize repository structure, archive deprecated code, and create comprehensive documentation
status: backlog
created: 2025-11-28T19:08:51Z
---

# PRD: Repository Organization and Documentation

## Executive Summary

Clean up the Computer Store KS repository by archiving deprecated code, organizing the file structure, and creating comprehensive documentation. This will make the codebase easier to understand, maintain, and work with for both humans and AI assistants.

**Value Proposition:**
- Clear separation between active and deprecated code
- Comprehensive documentation for development, architecture, and features
- Faster onboarding for anyone working on the project
- Better AI assistance through improved context

## Problem Statement

### Current State

The repository has accumulated multiple generations of code:

**Active Code (Next.js v3.0.0):**
- `src/` - Modern Next.js 14 application with TypeScript
- `api/` - Express.js backend for gallery operations
- `.claude/` - AI development workflow configuration

**Likely Deprecated Code (Old static site):**
- `index.html` (385KB) - Massive static HTML file
- `admin-gallery.html`, `admin-gallery.js` - Old admin interface
- `add-computer.html`, `edit-computer.html`, `computer-form.html` - Old forms
- `script.js`, `style.css`, `config.js` - Old frontend assets
- `gallery_manager.py`, `convert_to_pdf.py` - Python utilities
- Various `.bat` and `.sh` scripts

**Documentation Sprawl (17+ markdown files at root):**
- Many appear migration/setup related and may be outdated
- No clear architecture documentation
- No single source of truth for development workflow

### Why This Matters
- Confusing for developers (which files are active?)
- AI assistants may reference deprecated code
- Root directory is cluttered with 70+ files
- No clear documentation structure

## User Stories

### US-1: Developer Onboarding
> As a developer, I want clear documentation so I can understand the project structure and start contributing quickly.

Acceptance Criteria:
- [ ] README.md provides clear project overview
- [ ] Architecture diagram shows system components
- [ ] Development setup guide works on first try
- [ ] Feature documentation explains what exists

### US-2: Clean Repository Structure
> As a developer, I want deprecated code archived so I only see active code in the main directories.

Acceptance Criteria:
- [ ] Root directory contains only essential files
- [ ] Deprecated code moved to `_archive/` directory
- [ ] Clear `.gitignore` entries for generated files
- [ ] Directory structure is self-explanatory

### US-3: AI Assistant Efficiency
> As an AI assistant, I need accurate context about the codebase so I can provide relevant suggestions.

Acceptance Criteria:
- [ ] CLAUDE.md accurately describes the project
- [ ] Architecture documentation is current
- [ ] Deprecated code is clearly marked/archived
- [ ] Key patterns and conventions are documented

## Requirements

### Functional Requirements

#### FR-1: Archive Deprecated Code
Create `_archive/` directory and move deprecated files:

**Files to Archive (Old Static Site):**
```
index.html (old static version)
index.html.backup
admin-gallery.html
admin-gallery.js
admin-login.html
add-computer.html
edit-computer.html
computer-form.html
facebook-black-friday-post.html
MODAL_DEBUG.html
script.js
style.css
config.js
gallery_manager.py
convert_to_pdf.py
spec-migration.js
test-server.js
start-both-servers.bat
start-api.bat (in api/)
deploy.sh
setup.sh
setup-ssl.sh
```

**Files to Archive (Outdated Docs):**
```
CHECK_SETUP.md
CONTACT_FORM_MIGRATION.md
DEPLOYMENT_SECURITY_CHECKLIST.md
DEPLOYMENT_STEPS.md
DEPLOY_TO_LIVE_SITE.md
FIXES_APPLIED.md
GALLERY_FIXES.md
IMMEDIATE_ACTIONS.md
QUICK_START.md
QUICK_START.txt
README_WEB_GALLERY.md
SELF-HOSTING.md
SETUP_COMPLETE.md
TROUBLESHOOTING_MODAL_ISSUE.md
WEB_GALLERY_MANAGER_SETUP.md
```

**Files to Keep (Possibly Update):**
```
README.md (rewrite)
CLAUDE.md (update)
RepairShopr-Integration-Proposal.md (reference)
```

#### FR-2: Organize Root Directory
After archiving, root should contain only:
```
/
├── .claude/           # AI development configuration
├── .git/
├── .next/             # Build output (gitignored)
├── _archive/          # Deprecated code
├── api/               # Express backend
├── docs/              # NEW: Documentation
├── node_modules/      # (gitignored)
├── public/            # Static assets
├── src/               # Next.js application
├── .env               # (gitignored)
├── .env.example
├── .gitignore
├── CLAUDE.md          # AI context file
├── docker-compose.yml
├── Dockerfile
├── next.config.mjs
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

#### FR-3: Create Documentation Structure
```
docs/
├── README.md              # Documentation index
├── ARCHITECTURE.md        # System architecture
├── DEVELOPMENT.md         # Development guide
├── DEPLOYMENT.md          # Deployment instructions
├── API.md                 # API reference
└── FEATURES.md            # Feature documentation
```

#### FR-4: Update CLAUDE.md
Enhance AI context file with:
- Accurate project description
- Current architecture overview
- Key file locations
- Development workflow
- Important patterns/conventions

#### FR-5: Update README.md
Create comprehensive README with:
- Project description
- Quick start guide
- Links to detailed documentation
- Technology stack
- Contributing guidelines

### Non-Functional Requirements

#### NFR-1: No Breaking Changes
- All active functionality must continue working
- Git history preserved (move, don't delete)
- Environment configuration unchanged

#### NFR-2: Clear Organization
- Directory names are self-explanatory
- File organization follows conventions
- Documentation is discoverable

## Technical Design

### Archive Directory Structure
```
_archive/
├── README.md              # What's here and why
├── static-site/           # Old HTML/CSS/JS site
│   ├── index.html
│   ├── admin-gallery.html
│   └── ...
├── python-tools/          # Python utilities
│   ├── gallery_manager.py
│   └── convert_to_pdf.py
├── scripts/               # Shell/batch scripts
│   ├── deploy.sh
│   └── setup.sh
└── docs-legacy/           # Old documentation
    ├── DEPLOYMENT_STEPS.md
    └── ...
```

### Documentation Contents

**ARCHITECTURE.md:**
- System overview diagram
- Component descriptions (Next.js app, Express API, GitHub integration)
- Data flow
- Technology stack details

**DEVELOPMENT.md:**
- Prerequisites
- Environment setup
- Running locally
- Testing
- Code style/conventions

**DEPLOYMENT.md:**
- Production deployment steps
- Environment variables
- Docker setup
- Monitoring

**API.md:**
- Gallery API endpoints
- Authentication
- Request/response formats

**FEATURES.md:**
- Public website features
- Admin gallery manager
- Flyer generator
- Contact form

## Success Criteria

- [ ] Root directory has < 20 files/folders
- [ ] All deprecated code in `_archive/`
- [ ] Documentation covers architecture, development, deployment, API, features
- [ ] README.md provides clear project overview
- [ ] CLAUDE.md accurately describes current state
- [ ] Application still works after reorganization
- [ ] Git history preserved for archived files

## Constraints & Assumptions

### Constraints
- Must preserve git history (use `git mv`, not delete/create)
- Cannot break production deployment
- Must maintain backward compatibility for any referenced paths

### Assumptions
- Files identified as "deprecated" are not in active use
- Next.js app (`src/`) is the current production site
- Express API (`api/`) is actively used for gallery operations

## Out of Scope

- Refactoring active code
- Updating deprecated code (just archive it)
- Changing deployment configuration
- Database migrations

## Dependencies

- None - this is organizational work only

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Archive something still in use | High | Verify each file before moving |
| Break build/deployment | High | Test locally before committing |
| Lose git history | Medium | Use `git mv` for all moves |

## Implementation Order

1. **Create archive structure** - Set up `_archive/` directories
2. **Move deprecated code** - Archive old files with `git mv`
3. **Create documentation** - Write new docs
4. **Update CLAUDE.md** - Enhance AI context
5. **Update README.md** - Rewrite project overview
6. **Clean up root** - Remove any remaining clutter
7. **Verify functionality** - Test the application works
