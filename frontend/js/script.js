console.log('[site.js] loaded');

// Mobile nav drawer
const toggle = document.getElementById('navToggle');
const nav = document.getElementById('siteNav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    nav.setAttribute('aria-hidden', String(!open));
  });
}

// Footer year
const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

// Contact form handling
const CONTACT_API_URL = "https://tcs-contact-api.onrender.com/api/contact";

console.log('[site.js] loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[site.js] DOM ready');

  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');

  if (!form) {
    console.warn('[site.js] contactForm not found');
    return;
  }
  if (!statusEl) {
    console.warn('[site.js] formStatus not found');
    return;
  }

  async function submitForm(e) {
    e.preventDefault();
    console.log('[site.js] submit fired');

    const data = Object.fromEntries(new FormData(form).entries());
    statusEl.textContent = 'Sending...';

    try {
      const res = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // Read raw text first to surface non-JSON errors
      const text = await res.text();
      let payload; try { payload = JSON.parse(text); } catch { payload = { errorText: text }; }

      if (res.ok) {
        statusEl.textContent = 'Thanks! We’ll be in touch soon.';
        form.reset();
      } else {
        statusEl.textContent = payload?.error || payload?.errorText || 'Something went wrong. Please try again.';
      }
    } catch (err) {
      console.error('[site.js] fetch error', err);
      statusEl.textContent = 'Network error. Please try again.';
    }

    return false; // extra guard against navigation
  }

  form.addEventListener('submit', submitForm);
});