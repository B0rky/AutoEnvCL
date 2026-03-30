/* ===========================================
   AutoEnvCL — app.js
   Supabase Auth + UI Interactions
=========================================== */

// =============================================
// SUPABASE CONFIG
// Replace these with your actual Supabase values
// from https://supabase.com/dashboard -> Settings -> API
// =============================================
const SUPABASE_URL = 'https://zsgdnsvvjtakgcyaqpao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZ2Ruc3Z2anRha2djeWFxcGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NDY4MDUsImV4cCI6MjA5MDQyMjgwNX0.X8VTKonW2mCB9SiO7QzFKS_TEcCJBKtHWXbGkkvPfOg';

let supabaseClient = null;

function initSupabase() {
  try {
    if (window.supabase && SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co') {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('[AutoEnvCL] Supabase connected ✓');
      checkActiveSession();
    } else {
      console.warn('[AutoEnvCL] Supabase not configured. Auth will run in demo mode.');
    }
  } catch (e) {
    console.warn('[AutoEnvCL] Supabase init error:', e);
  }
}

// =============================================
// LOADING SCREEN
// =============================================
const loadingTexts = [
  'Iniciando sistema...',
  'Cargando componentes...',
  'Configurando interfaz...',
  'Casi listo...'
];

function runLoader() {
  const bar = document.getElementById('loadingBar');
  const txt = document.getElementById('loadingText');
  const screen = document.getElementById('loadingScreen');
  let progress = 0;
  let idx = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 18 + 8;
    if (progress > 100) progress = 100;
    if (bar) bar.style.width = progress + '%';
    if (txt && idx < loadingTexts.length) {
      txt.textContent = loadingTexts[Math.min(idx, loadingTexts.length - 1)];
    }
    idx++;
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        if (screen) screen.classList.add('hidden');
        animateHeroOnLoad();
      }, 350);
    }
  }, 320);
}

function animateHeroOnLoad() {
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120);
  });
}

// =============================================
// LOADING PARTICLES (decorative)
// =============================================
function initLoadingParticles() {
  const container = document.getElementById('loadingParticles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:${Math.random() * 3 + 1}px;
      height:${Math.random() * 3 + 1}px;
      border-radius:50%;
      background:rgba(${Math.random() > .5 ? '99,102,241' : '168,85,247'},${Math.random() * .4 + .1});
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation: float${Math.floor(Math.random() * 3)} ${Math.random() * 4 + 3}s ease-in-out infinite;
      animation-delay:${Math.random() * 3}s;
    `;
    container.appendChild(p);
  }
}

// =============================================
// CUSTOM CURSOR
// =============================================
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  const ml = document.getElementById('mouseLight');
  if (!cursor || !follower) return;

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
    if (ml) { ml.style.left = mx + 'px'; ml.style.top = my + 'px'; }
  });

  (function animateFl() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animateFl);
  })();

  document.querySelectorAll('a, button, .srv-card, .plan-card, .contact-card, .tech-logo-item').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// =============================================
// PARTICLE CANVAS
// =============================================
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 1.8 + 0.4;
      this.opacity = Math.random() * 0.45 + 0.08;
      this.color = Math.random() > 0.5 ? '99,102,241' : '168,85,247';
    }
    update() {
      // Subtle mouse attraction
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        this.vx += dx / dist * 0.012;
        this.vy += dy / dist * 0.012;
      }
      // Speed limit
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 1.2) { this.vx *= 0.95; this.vy *= 0.95; }

      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${0.1 * (1 - d / 130)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  const count = Math.min(90, Math.floor(window.innerWidth / 14));
  for (let i = 0; i < count; i++) particles.push(new Particle());

  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    requestAnimationFrame(animate);
  })();
}

// =============================================
// NAVBAR SCROLL
// =============================================
function initNavbar() {
  const nav = document.getElementById('navbar');
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  }
}

// =============================================
// SMOOTH SCROLL
// =============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// =============================================
// SCROLL REVEAL
// =============================================
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// =============================================
// STAT COUNTERS
// =============================================
function initCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach((el, i) => {
          const target = parseInt(el.dataset.target);
          const suffix = el.dataset.suffix || '';
          let current = 0;
          const duration = 1800;
          const step = target / (duration / 16);
          setTimeout(() => {
            const t = setInterval(() => {
              current = Math.min(current + step, target);
              el.textContent = Math.round(current) + suffix;
              if (current >= target) clearInterval(t);
            }, 16);
          }, i * 100);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsRow = document.querySelector('.stats-row');
  if (statsRow) obs.observe(statsRow);
}

// =============================================
// SERVICE CARDS EXPAND
// =============================================
function initServiceCards() {
  document.querySelectorAll('.srv-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.srv-card');
      const expand = card.querySelector('.srv-expand');
      const isOpen = btn.classList.contains('open');

      // Close all others
      document.querySelectorAll('.srv-card').forEach(c => {
        c.querySelector('.srv-toggle').classList.remove('open');
        const ex = c.querySelector('.srv-expand');
        if (ex) {
          ex.style.maxHeight = null;
          setTimeout(() => { ex.style.display = 'none'; }, 300);
        }
        c.querySelector('.srv-toggle').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        if (expand) {
          expand.style.display = 'block';
          expand.style.maxHeight = null;
          const h = expand.scrollHeight;
          expand.style.maxHeight = '0px';
          expand.style.overflow = 'hidden';
          expand.style.transition = 'max-height 0.4s cubic-bezier(.4,0,.2,1)';
          requestAnimationFrame(() => { expand.style.maxHeight = h + 'px'; });
          setTimeout(() => { expand.style.overflow = 'visible'; expand.style.maxHeight = 'none'; }, 420);
        }
      }
    });
  });
}

// =============================================
// CARD 3D TILT
// =============================================
function initTilt() {
  document.querySelectorAll('.plan-card, .proceso-step').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// =============================================
// HERO PARALLAX
// =============================================
function initParallax() {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const hero = document.querySelector('.hero-content');
    if (hero && scrolled < window.innerHeight) {
      hero.style.transform = `translateY(${scrolled * 0.12}px)`;
      hero.style.opacity = 1 - scrolled / (window.innerHeight * 0.85);
    }
  });
}

// =============================================
// TOAST NOTIFICATIONS
// =============================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
    <span class="toast-text">${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// =============================================
// AUTH MODAL
// =============================================
function initAuthModal() {
  const modal = document.getElementById('authModal');
  const loginPanel = document.getElementById('loginPanel');
  const registerPanel = document.getElementById('registerPanel');
  const successPanel = document.getElementById('successPanel');

  function openModal(panel = 'login') {
    modal.classList.add('open');
    loginPanel.style.display = panel === 'login' ? 'block' : 'none';
    registerPanel.style.display = panel === 'register' ? 'block' : 'none';
    if (successPanel) successPanel.style.display = 'none';
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Open triggers
  ['loginBtn', 'loginBtnMobile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => openModal('login'));
  });
  ['registerBtn', 'registerBtnMobile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => openModal('register'));
  });

  // Close
  const closeBtn = document.getElementById('authClose');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Switch panels
  const switchToReg = document.getElementById('switchToRegister');
  const switchToLog = document.getElementById('switchToLogin');
  if (switchToReg) switchToReg.addEventListener('click', () => openModal('register'));
  if (switchToLog) switchToLog.addEventListener('click', () => openModal('login'));
  const goToLogin = document.getElementById('goToLogin');
  if (goToLogin) goToLogin.addEventListener('click', () => openModal('login'));

  // Eye toggle
  document.querySelectorAll('.btn-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = document.getElementById(btn.dataset.target);
      if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
    });
  });

  // ---- LOGIN FORM ----
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errEl = document.getElementById('loginError');
      const btn = document.getElementById('loginSubmit');
      setBtnLoading(btn, true);
      errEl.style.display = 'none';

      if (!supabaseClient) {
        // Demo mode
        setBtnLoading(btn, false);
        closeModal();
        showToast('Modo demo: Supabase no configurado aún', 'error');
        return;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      setBtnLoading(btn, false);
      if (error) {
        errEl.textContent = translateError(error.message);
        errEl.style.display = 'block';
      } else {
        closeModal();
        displayUser(data.user);
        showToast('¡Bienvenido de vuelta! 👋');
      }
    });
  }

  // ---- REGISTER FORM ----
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const errEl = document.getElementById('registerError');
      const sucEl = document.getElementById('registerSuccess');
      const btn = document.getElementById('registerSubmit');
      setBtnLoading(btn, true);
      errEl.style.display = 'none';
      sucEl.style.display = 'none';

      if (password.length < 8) {
        errEl.textContent = 'La contraseña debe tener mínimo 8 caracteres.';
        errEl.style.display = 'block';
        setBtnLoading(btn, false);
        return;
      }

      if (!supabaseClient) {
        setBtnLoading(btn, false);
        // Show success panel in demo mode
        loginPanel.style.display = 'none';
        registerPanel.style.display = 'none';
        if (successPanel) successPanel.style.display = 'block';
        return;
      }

      const { data, error } = await supabaseClient.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      });
      setBtnLoading(btn, false);

      if (error) {
        errEl.textContent = translateError(error.message);
        errEl.style.display = 'block';
      } else {
        loginPanel.style.display = 'none';
        registerPanel.style.display = 'none';
        if (successPanel) successPanel.style.display = 'block';
      }
    });
  }
}

function setBtnLoading(btn, loading) {
  if (!btn) return;
  const span = btn.querySelector('span');
  const loader = btn.querySelector('.btn-loader');
  if (loading) {
    btn.disabled = true;
    if (span) span.style.display = 'none';
    if (loader) loader.style.display = 'inline-block';
  } else {
    btn.disabled = false;
    if (span) span.style.display = 'inline';
    if (loader) loader.style.display = 'none';
  }
}

function translateError(msg) {
  const map = {
    'Invalid login credentials': 'Email o contraseña incorrectos.',
    'Email not confirmed': 'Debes confirmar tu email antes de ingresar.',
    'User already registered': 'Este email ya está registrado.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  };
  return map[msg] || msg;
}

// =============================================
// USER SESSION DISPLAY
// =============================================
function displayUser(user) {
  if (!user) return;
  const navActions = document.querySelector('.nav-actions');
  if (navActions) navActions.style.display = 'none';

  const userMenu = document.getElementById('userMenu');
  if (userMenu) userMenu.style.display = 'flex';

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
  const display = document.getElementById('userNameDisplay');
  const avatar = document.getElementById('userAvatar');
  const infoBox = document.getElementById('userInfoBox');

  if (display) display.textContent = name;
  if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
  if (infoBox) infoBox.innerHTML = `
    <div style="font-weight:600;font-size:.875rem;color:#f1f5f9">${name}</div>
    <div style="font-size:.75rem;color:#64748b;margin-top:2px">${user.email}</div>
  `;

  // Show Newsletter navbar links to logged-in users
  const navBtn = document.getElementById('navNewsletterBtn');
  const navBtnMobile = document.getElementById('navNewsletterBtnMobile');
  if (navBtn) navBtn.style.display = 'inline-block';
  if (navBtnMobile) navBtnMobile.style.display = 'block';

  // User dropdown toggle
  const userBtn = document.getElementById('userBtn');
  const dropdown = document.getElementById('userDropdown');
  if (userBtn && dropdown) {
    userBtn.addEventListener('click', () => {
      dropdown.classList.toggle('open');
      userBtn.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target)) {
        dropdown.classList.remove('open');
        userBtn.classList.remove('open');
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (supabaseClient) await supabaseClient.auth.signOut();
      window.location.reload();
    });
  }
}

async function checkActiveSession() {
  if (!supabaseClient) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session?.user) displayUser(session.user);

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) displayUser(session.user);
    if (event === 'SIGNED_OUT') window.location.reload();
  });
}

// =============================================
// CONTACT FORM (Supabase or Email fallback)
// =============================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contactSubmit');
    const errEl = document.getElementById('contactError');
    const sucEl = document.getElementById('contactSuccess');
    errEl.style.display = 'none';
    sucEl.style.display = 'none';
    setBtnLoading(btn, true);

    const payload = {
      name: document.getElementById('cName').value.trim(),
      email: document.getElementById('cEmail').value.trim(),
      service: document.getElementById('cService').value,
      message: document.getElementById('cMessage').value.trim(),
      created_at: new Date().toISOString()
    };

    let success = false;

    if (supabaseClient) {
      const { error } = await supabaseClient.from('contact_messages').insert([payload]);
      success = !error;
      if (error) console.error('[Contact]', error);
    } else {
      // Fallback: open email client
      const subject = encodeURIComponent(`[AutoEnvCL] Consulta de ${payload.name} — ${payload.service}`);
      const body = encodeURIComponent(
        `Nombre: ${payload.name}\nEmail: ${payload.email}\nServicio: ${payload.service}\n\n${payload.message}`
      );
      window.open(`mailto:edufeli.bug@gmail.com?subject=${subject}&body=${body}`);
      success = true;
    }

    setBtnLoading(btn, false);
    if (success) {
      sucEl.textContent = '✅ ¡Mensaje enviado! Te respondemos en menos de 24 horas.';
      sucEl.style.display = 'block';
      form.reset();
      showToast('¡Mensaje enviado correctamente! 🚀');
    } else {
      errEl.textContent = 'Hubo un error. Por favor contáctanos por WhatsApp.';
      errEl.style.display = 'block';
    }
  });
}

// =============================================
// PLAN BUTTONS — redirect to contact
// =============================================
function initPlanButtons() {
  ['planStarterBtn', 'planProBtn', 'planEnterpriseBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const contactEl = document.getElementById('contacto');
      if (contactEl) {
        const top = contactEl.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
        showToast('¡Contáctanos para coordinar el pago! 💳', 'success');
      }
    });
  });
}

// =============================================
// TECH SCROLL — pause on hover (already via CSS)
// =============================================
function initTechScroll() {
  // Additional: touch support for mobile scroll
  const track = document.getElementById('techTrack');
  if (!track) return;
  let startX = 0, scrollLeft = 0;
  track.parentElement.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX;
    scrollLeft = track.parentElement.scrollLeft;
  });
  track.parentElement.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX;
    track.parentElement.scrollLeft = scrollLeft - (x - startX);
  });
}

// =============================================
// PRIVACY / TERMS MODALS (simple)
// =============================================
function initLegalLinks() {
  const privacy = document.getElementById('privacyLink');
  const terms = document.getElementById('termsLink');
  if (privacy) privacy.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Política de privacidad disponible próximamente.', 'success');
  });
  if (terms) terms.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Términos de servicio disponibles próximamente.', 'success');
  });
}

// =============================================
// INIT ALL
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  initLoadingParticles();
  runLoader();
  initSupabase();
  initCursor();
  initParticles();
  initNavbar();
  initSmoothScroll();
  initReveal();
  initCounters();
  initServiceCards();
  initTilt();
  initParallax();
  initAuthModal();
  initContactForm();
  initPlanButtons();
  initTechScroll();
  initLegalLinks();
});
