# Computer Store Kansas — Multi-Page Brochure (Render-Ready)

This guide is modelled directly after your previous brochure design, with separate pages for Home, About, Services and Contact. The visual style and layout from your original site are preserved, while adding a modern contact form that sends data to a backend API.

## Structure
- `frontend/` – All static pages (HTML, CSS) and images. The navigation uses your existing multi-page layout.
- `api/` – An Express.js backend (`server.js`) that handles contact form submissions via Nodemailer. Environment variables are defined in `.env.example` and should be set in Render.
- `render.yaml` – Render blueprint that deploys both the frontend and API.

## Local Development
1. Serve the `frontend/` directory locally using any static server (e.g. VS Code Live Server). You can navigate to `brochure_home.html`, `brochure_about.html`, etc.
2. To test the contact form locally, copy `api/.env.example` to `api/.env` and set your SMTP credentials. Then run:
   ```bash
   cd api
   npm install
   node server.js
   ```
   Update `CONTACT_API_URL` in `frontend/brochure_contact.html` to `http://localhost:3000/api/contact` for local testing.

## Render Deployment
1. Push the entire `tcs-brochure-guide` directory to your Git repository.
2. In Render, choose **New → Blueprint** and select your repo. The blueprint will create two services:
   - **tcs-contact-api** (Web Service) from `api/`.
   - **tcs-frontend** (Static Site) from `frontend/`.
3. Set environment variables for the API in Render (`SMTP_HOST`, `SMTP_PORT`, etc.).
4. After deploying the API, set `CONTACT_API_URL` in `frontend/brochure_contact.html` to your live backend endpoint (including `/api/contact`), commit, and redeploy the static site.
5. Add your custom domains as needed.