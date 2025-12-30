---
name: repo-organization-and-documentation
status: completed
created: 2025-11-28T19:12:56Z
completed: 2025-11-28
progress: 100%
prd: .claude/prds/repo-organization-and-documentation.md
github: https://github.com/MatthewMcManness/Computer_Store_KS/issues/24
---

# Epic: Repository Organization and Documentation

## Overview

Clean up the repository by archiving ~40 deprecated files into `_archive/`, creating a structured `docs/` folder with comprehensive documentation, and updating CLAUDE.md and README.md. This is primarily file organization work using `git mv` to preserve history.

## Architecture Decisions

### 1. Archive Structure: Categorized Subdirectories
**Decision**: Organize `_archive/` into logical subdirectories (`static-site/`, `python-tools/`, `scripts/`, `docs-legacy/`).

**Rationale**:
- Easier to find archived files if needed later
- Clear separation by file type/purpose
- Self-documenting structure

### 2. Documentation Location: Dedicated `docs/` Folder
**Decision**: Create `docs/` at root level for all documentation.

**Rationale**:
- Standard convention (GitHub renders docs/ nicely)
- Keeps root directory clean
- Easy to find and navigate

### 3. File Movement: Git MV for History Preservation
**Decision**: Use `git mv` for all file movements.

**Rationale**:
- Preserves git history/blame
- Allows recovery if needed
- Standard git best practice

### 4. Verification: Test Before Commit
**Decision**: Run build and dev server after moves, before committing.

**Rationale**:
- Catch any broken references immediately
- Zero-risk approach

## Technical Approach

This epic involves no code changes - only file organization and documentation writing.

### Phase 1: Archive Setup & File Moves
```bash
# Create archive structure
mkdir -p _archive/{static-site,python-tools,scripts,docs-legacy}

# Move files with git mv
git mv index.html _archive/static-site/
git mv admin-gallery.html _archive/static-site/
# ... etc for all deprecated files
```

### Phase 2: Documentation Creation
```
docs/
├── README.md          # Index with links to all docs
├── ARCHITECTURE.md    # System components, data flow, tech stack
├── DEVELOPMENT.md     # Setup, running, testing, conventions
├── DEPLOYMENT.md      # Production deploy, env vars, Docker
├── API.md             # Gallery API endpoints, auth
└── FEATURES.md        # What the app does
```

### Phase 3: Root File Updates
- **README.md**: Rewrite with project overview, quick start, tech stack
- **CLAUDE.md**: Update with accurate architecture, file locations, patterns

### Files to Move (Summary)

| Category | Count | Destination |
|----------|-------|-------------|
| HTML/JS/CSS (old site) | ~15 | `_archive/static-site/` |
| Python scripts | 2 | `_archive/python-tools/` |
| Shell/batch scripts | ~6 | `_archive/scripts/` |
| Legacy docs | ~15 | `_archive/docs-legacy/` |
| Misc (exe, robot.txt, etc.) | ~5 | `_archive/misc/` |

## Implementation Strategy

### Simplification: Batch Operations
Instead of individual file moves, use batch scripts to move files by category. This reduces errors and speeds up execution.

### Risk Mitigation
1. Create archive structure first
2. Move files in batches by type
3. Run `bun run build` after each batch
4. Commit only after verification passes

### Testing Approach
- Run `bun run dev` after all moves
- Verify Next.js app loads correctly
- Test admin login and gallery pages
- Check that no 404s for assets

## Task Breakdown Preview

- [ ] **Task 1**: Create archive directory structure and move deprecated HTML/JS/CSS files
- [ ] **Task 2**: Move Python scripts, shell scripts, and miscellaneous files to archive
- [ ] **Task 3**: Move legacy documentation to archive
- [ ] **Task 4**: Create docs/ folder with ARCHITECTURE.md and DEVELOPMENT.md
- [ ] **Task 5**: Create DEPLOYMENT.md, API.md, and FEATURES.md
- [ ] **Task 6**: Update README.md with project overview
- [ ] **Task 7**: Update CLAUDE.md with accurate project context
- [ ] **Task 8**: Final verification and cleanup

## Dependencies

### External
- None

### Internal
- Tasks are sequential (must archive before documenting new structure)

### Prerequisites
- None - this is standalone organizational work

## Success Criteria (Technical)

### File Organization
- [ ] Root directory has < 20 items (currently ~70)
- [ ] All deprecated files in `_archive/`
- [ ] Archive has clear subdirectory structure
- [ ] Git history preserved for all moved files

### Documentation
- [ ] 5 documentation files in `docs/`
- [ ] Each doc is complete (no TODOs or placeholders)
- [ ] README.md provides clear project overview
- [ ] CLAUDE.md accurately reflects current state

### Functionality
- [ ] `bun run dev` works after reorganization
- [ ] `bun run build` completes without errors
- [ ] Admin login and gallery pages work
- [ ] No broken asset references

## Estimated Effort

| Task | Complexity | Estimate |
|------|------------|----------|
| Archive structure + HTML/JS | Low | Small |
| Archive scripts + misc | Low | Small |
| Archive legacy docs | Low | Small |
| Create ARCHITECTURE + DEVELOPMENT | Medium | Medium |
| Create DEPLOYMENT + API + FEATURES | Medium | Medium |
| Update README | Low | Small |
| Update CLAUDE.md | Low | Small |
| Verification | Low | Small |

**Total**: 8 straightforward tasks, low-medium complexity

**Critical Path**: Tasks 1-3 (archiving) must complete before Tasks 4-7 (documentation). Task 8 is final verification.

## Tasks Created

- [x] [#25](https://github.com/MatthewMcManness/Computer_Store_KS/issues/25) - Create Archive Structure and Move HTML/JS/CSS Files (parallel: false)
- [x] [#26](https://github.com/MatthewMcManness/Computer_Store_KS/issues/26) - Move Python Scripts, Shell Scripts, and Misc Files (parallel: false, depends: #25)
- [x] [#27](https://github.com/MatthewMcManness/Computer_Store_KS/issues/27) - Move Legacy Documentation to Archive (parallel: true, depends: #25)
- [x] [#28](https://github.com/MatthewMcManness/Computer_Store_KS/issues/28) - Create ARCHITECTURE.md and DEVELOPMENT.md (parallel: false, depends: #25, #26, #27)
- [x] [#29](https://github.com/MatthewMcManness/Computer_Store_KS/issues/29) - Create DEPLOYMENT.md, API.md, and FEATURES.md (parallel: true, depends: #28)
- [x] [#30](https://github.com/MatthewMcManness/Computer_Store_KS/issues/30) - Update README.md with Project Overview (parallel: true, depends: #28)
- [x] [#31](https://github.com/MatthewMcManness/Computer_Store_KS/issues/31) - Update CLAUDE.md with Accurate Project Context (parallel: true, depends: #28)
- [x] [#32](https://github.com/MatthewMcManness/Computer_Store_KS/issues/32) - Final Verification and Cleanup (parallel: false, depends: all)

**Total tasks**: 8
**Parallel tasks**: 4 (#27, #29, #30, #31)
**Sequential tasks**: 4 (#25, #26, #28, #32)
**Estimated total effort**: 10-14 hours
