/* ===========================================
   AutoEnvCL — news.js
   Newsletter & Extra Resources Logic
=========================================== */

const SUPABASE_URL = 'https://zsgdnsvvjtakgcyaqpao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZ2Ruc3Z2anRha2djeWFxcGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NDY4MDUsImV4cCI6MjA5MDQyMjgwNX0.X8VTKonW2mCB9SiO7QzFKS_TEcCJBKtHWXbGkkvPfOg';

let supabaseClient = null;

async function initNewsPortal() {
  if (!window.supabase) {
    console.error('[Newsletter] Supabase library not found.');
    window.location.replace('index.html');
    return;
  }

  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Comprobar sesión
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  
  if (error || !session) {
    // Si no hay sesión válida, expulsar al index.
    window.location.replace('index.html');
    return;
  }

  // Hay sesión. Mostrar contenido.
  displayUser(session.user);
  runLoader();
  initCursor();
  initIntersectionObserver();
  initMetricSimulation();

  // Suscribirse a cambios de estado 
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      window.location.replace('index.html');
    }
  });
}

function displayUser(user) {
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

  // Toggle dropdown
  const userBtn = document.getElementById('userBtn');
  const dropdown = document.getElementById('userDropdown');
  if (userBtn && dropdown) {
    userBtn.addEventListener('click', () => {
      dropdown.classList.toggle('open');
      userBtn.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      const userMenu = document.getElementById('userMenu');
      if (userMenu && !userMenu.contains(e.target)) {
        dropdown.classList.remove('open');
        userBtn.classList.remove('open');
      }
    });
  }

  // Logout function
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      window.location.replace('index.html');
    });
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

  document.querySelectorAll('a, button, .news-card, .course-card, .metric-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// Pantallazo de carga inicial
function runLoader() {
  const bar = document.getElementById('loadingBar');
  const screen = document.getElementById('loadingScreen');
  const body = document.getElementById('newsBody');
  
  let progress = 0;
  
  const interval = setInterval(() => {
    progress += Math.random() * 25 + 10;
    if (progress > 100) progress = 100;
    if (bar) bar.style.width = progress + '%';
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        if (screen) screen.classList.add('hidden');
        if (body) body.style.opacity = '1';
        
        // Revelar hero
        document.querySelectorAll('.hero .reveal').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), i * 120);
        });
      }, 400);
    }
  }, 200);
}

// Reveal Scroll (igual que en app.js)
function initIntersectionObserver() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

// Simulación de Métricas de Mercado
function initMetricSimulation() {
  // Solo aplicable si existen los ids
  const metrics = [
    { id: 'amznVal', base: 215.8, volatility: 0.12 },
    { id: 'msftVal', base: 435.2, volatility: 0.18 },
    { id: 'googVal', base: 182.4, volatility: 0.08 },
    { id: 'oaiVal', base: 96.5, volatility: 0.02, isBillion: true } // Mantenemos el B manual en el HTML o lo consideramos visual
  ];

  setInterval(() => {
    metrics.forEach(m => {
      const el = document.getElementById(m.id);
      if (el) {
        // Fluctuación random entre -volatility y +volatility
        const change = (Math.random() * (m.volatility * 2)) - m.volatility;
        let newValue = parseFloat(el.textContent) + change;
        
        // Prevent huge divergence from base
        if (Math.abs(newValue - m.base) > (m.base * 0.02)) {
           newValue = m.base;
        }

        el.textContent = newValue.toFixed(1);
        
        // Destello para mostrar que se actualizó (breve color primary)
        el.style.color = '#a855f7';
        setTimeout(() => {
          el.style.color = '#fff';
        }, 300);
      }
    });
  }, 3500);
}

// Init everything
document.addEventListener('DOMContentLoaded', initNewsPortal);
