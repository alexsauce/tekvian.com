// ============================================================
// Tekvian Solutions — main.js
// ============================================================

// ------------------------------------
// Dark / Light Mode
// ------------------------------------
const root = document.documentElement;

function applyTheme(dark) {
  dark ? root.classList.add('dark') : root.classList.remove('dark');
  document.getElementById('icon-sun').classList.toggle('hidden', !dark);
  document.getElementById('icon-moon').classList.toggle('hidden', dark);
}

function toggleTheme() {
  const dark = !root.classList.contains('dark');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  applyTheme(dark);
}

// Init theme — default dark unless user has explicitly chosen light
(function initTheme() {
  const stored = localStorage.getItem('theme');
  applyTheme(stored ? stored === 'dark' : true);
})();

// ------------------------------------
// Language Toggle (EN / ES)
// ------------------------------------
let currentLang = localStorage.getItem('lang') || 'en';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute('data-' + lang);
    if (text) el.innerHTML = text;
  });

  // Toggle button active state
  document.querySelectorAll('[id^="lang-"]').forEach(btn => btn.classList.remove('lang-active'));
  const activeBtn = document.getElementById('lang-' + lang);
  if (activeBtn) activeBtn.classList.add('lang-active');

  document.documentElement.lang = lang;
}

// Init language
(function initLang() {
  setLang(currentLang);
})();

// ------------------------------------
// Mobile Menu
// ------------------------------------
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const btn = document.getElementById('mobile-menu-btn');
  const open = document.getElementById('menu-icon-open');
  const close = document.getElementById('menu-icon-close');
  const isOpen = menu.style.maxHeight && menu.style.maxHeight !== '0px';

  if (isOpen) {
    menu.style.maxHeight = '0px';
    menu.style.opacity = '0';
    open.classList.remove('hidden');
    close.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    menu.style.maxHeight = menu.scrollHeight + 'px';
    menu.style.opacity = '1';
    open.classList.add('hidden');
    close.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'true');
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const open = document.getElementById('menu-icon-open');
  const close = document.getElementById('menu-icon-close');
  menu.style.maxHeight = '0px';
  menu.style.opacity = '0';
  open.classList.remove('hidden');
  close.classList.add('hidden');
  document.getElementById('mobile-menu-btn').setAttribute('aria-expanded', 'false');
}

// Close menu on outside click
document.addEventListener('click', (e) => {
  const menu = document.getElementById('mobile-menu');
  const btn = document.getElementById('mobile-menu-btn');
  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    closeMobileMenu();
  }
});

// ------------------------------------
// Navbar scroll behavior
// ------------------------------------
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 20) {
    navbar.classList.add('shadow-md');
  } else {
    navbar.classList.remove('shadow-md');
  }

  // Scroll-to-top button
  const scrollBtn = document.getElementById('scroll-top');
  if (window.scrollY > 400) {
    scrollBtn.style.opacity = '1';
    scrollBtn.style.pointerEvents = 'auto';
  } else {
    scrollBtn.style.opacity = '0';
    scrollBtn.style.pointerEvents = 'none';
  }
}, { passive: true });

// ------------------------------------
// Intersection Observer — scroll animations
// ------------------------------------
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings in the same parent grid
      const siblings = entry.target.parentElement.querySelectorAll('.animate-on-scroll');
      let delay = 0;
      siblings.forEach((sib, idx) => {
        if (sib === entry.target) delay = idx * 80;
      });
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// ------------------------------------
// Contact Form — validation + submission
// ------------------------------------
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  let valid = true;

  // Clear previous errors
  ['name', 'email', 'message'].forEach(id => {
    document.getElementById(id + '-error').classList.add('hidden');
    document.getElementById(id).classList.remove('border-red-500');
  });

  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const message = document.getElementById('message');

  if (!name.value.trim()) {
    document.getElementById('name-error').classList.remove('hidden');
    name.classList.add('border-red-500');
    valid = false;
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim() || !emailRe.test(email.value)) {
    document.getElementById('email-error').classList.remove('hidden');
    email.classList.add('border-red-500');
    valid = false;
  }

  if (!message.value.trim()) {
    document.getElementById('message-error').classList.remove('hidden');
    message.classList.add('border-red-500');
    valid = false;
  }

  if (!valid) return;

  const btn = document.getElementById('submit-btn');
  const successEl = document.getElementById('form-success');
  const errorEl = document.getElementById('form-error');
  btn.disabled = true;
  btn.innerHTML = '<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Sending...';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    if (res.ok) {
      form.reset();
      successEl.classList.remove('hidden');
      errorEl.classList.add('hidden');
      if (currentLang === 'es') {
        successEl.textContent = successEl.getAttribute('data-es');
      }
    } else {
      throw new Error('Server error');
    }
  } catch {
    errorEl.classList.remove('hidden');
    successEl.classList.add('hidden');
    if (currentLang === 'es') {
      errorEl.textContent = errorEl.getAttribute('data-es');
    }
  } finally {
    btn.disabled = false;
    const label = currentLang === 'es' ? 'Enviar Mensaje' : 'Send Message';
    btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg> ${label}`;
  }
});

// ------------------------------------
// Footer year
// ------------------------------------
document.getElementById('year').textContent = new Date().getFullYear();

// ------------------------------------
// Smooth scroll polyfill for older Safari
// ------------------------------------
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
