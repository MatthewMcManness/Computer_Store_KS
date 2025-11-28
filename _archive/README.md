# Archive Directory

This directory contains deprecated code and documentation that is no longer actively used but has been preserved for historical reference.

## Contents

### `python-tools/`
Python scripts for local operations:
- `gallery_manager.py` - Local gallery management script
- `convert_to_pdf.py` - PDF conversion utility

### `scripts/`
Shell, batch, and config scripts:
- `deploy.sh`, `setup.sh`, `setup-ssl.sh` - Deployment scripts
- `start-both-servers.bat` - Windows batch file
- `ecosystem.config.js`, `test-server.js`, `spec-migration.js` - Node scripts
- `nginx/` - Nginx configuration files

### `docs-legacy/`
Outdated documentation from previous development phases:
- `Documentation/` - Original docs folder with deployment guides
- `Security_Document/` - Security audit reports
- Various markdown files (QUICK_START, DEPLOYMENT_STEPS, etc.)
- `RepairShopr-Integration-Proposal.md/.pdf` - Original integration proposal

### `misc/`
Other deprecated files:
- `FlyerGenerator_Setup.exe` - Windows installer

## Why Archived?

These files are no longer needed for day-to-day operations but are preserved to:
- Maintain git history for reference
- Allow recovery if needed
- Document the evolution of the project

## Date Archived

November 28, 2025

## Note

**Do not reference files in this directory for current development.** The active codebase is:
- Root HTML/JS/CSS files - Static frontend site
- `api/` - Express.js backend API for gallery management
- `src/` - Next.js application (work-in-progress replacement)
