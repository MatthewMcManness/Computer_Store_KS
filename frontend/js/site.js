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
const CONTACT_API_URL = "https://tcs-contact-api.onrender.com/api/health"
const statusEl = document.getElementById('formStatus');
async function submitForm(e){
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  statusEl.textContent = 'Sending...';
  try{
    const res = await fetch(CONTACT_API_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const payload = await res.json().catch(()=>({}));
    if(res.ok){
      statusEl.textContent = 'Thanks! We’ll be in touch soon.';
      form.reset();
    } else {
      statusEl.textContent = payload.error || 'Something went wrong. Please try again.';
    }
  } catch(err){
    statusEl.textContent = 'Network error. Please try again.';
  }
}
if (form) form.addEventListener('submit', submitForm);
