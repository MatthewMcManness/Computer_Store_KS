# Computer Store Kansas — Merged Brochure (Modern Style + Your Content)

This project combines your original multi‑page brochure content with a modern, clean theme (blue/silver palette, glassy cards, mobile drawer). It’s Render‑ready with a small Express API for the contact form.

## Structure
- `frontend/`
  - `brochure_home.html`, `brochure_about.html`, `brochure_services.html`, `brochure_contact.html`
  - `css/` (`reset.css`, `theme.css`, `brochure.css`), `js/site.js`, `assets/`
- `api/` (Express + Nodemailer)
- `render.yaml` (Blueprint for deploying both services)

## Local Dev
- Serve `frontend/` (any static server).
- In `api/`: `npm install && node server.js` (copy `.env.example` to `.env` for local SMTP testing).
- Set `CONTACT_API_URL` in `frontend/js/site.js` to `http://localhost:3000/api/contact` for local testing.

## Render Deploy
1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Render: **New → Blueprint → Select repo → Apply**.
3. In the **web service** (API), add env vars: `SMTP_*`, `MAIL_FROM`, `MAIL_TO`, `CORS_ORIGINS`.
4. Deploy the API, copy its URL, then set `CONTACT_API_URL` in `frontend/js/site.js` to `https://<your-api>.onrender.com/api/contact`, commit/push to redeploy the static site.
5. Add custom domain(s) to the static site and (optionally) `api.` subdomain for the backend.
