# Archive Directory

This directory contains deprecated code that is no longer actively used but has been preserved for historical reference.

## Contents

### `static-site/`
The original static HTML website before migration to Next.js:
- `index.html` - Original homepage (385KB single-file site)
- `admin-gallery.html`, `admin-login.html` - Original admin interfaces
- `add-computer.html`, `edit-computer.html`, `computer-form.html` - Computer management forms
- `admin-gallery.js`, `script.js`, `config.js` - JavaScript files
- `style.css` - Original stylesheet
- `facebook-black-friday-post.html`, `MODAL_DEBUG.html` - Utilities
- `backups/` - Old index.html backup files
- `assets/` - Original static assets (large images, logos)
- `checklists/` - Receptionist checklist templates
- `Sales Cards/` - Sales flyer HTML templates

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
- `robot.txt`, `sitemap.xml` - SEO files
- `render.yaml` - Render deployment config

## Why Archived?

The project has migrated from a static HTML site to a modern Next.js application located in `src/`. The archived files are preserved to:
- Maintain git history for reference
- Allow recovery if needed
- Document the evolution of the project

## Date Archived

November 28, 2025

## Note

**Do not reference files in this directory for current development.** The active codebase is in:
- `src/` - Next.js frontend application
- `api/` - Express.js backend API
- `public/` - Static assets for Next.js
