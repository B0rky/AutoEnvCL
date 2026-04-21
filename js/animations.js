/**
 * AutoEnvCL — Scroll & UI Animations
 * Custom Intersection Observer (no GSAP dependency)
 * Lightweight, smooth, performant
 */

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScrollProgress();
  initNavScroll();
  initRevealObserver();
  initCounters();
  initServiceCards();
  initPricingHover();
  initChatWidget();
  initGlitchEffect();
  initHamburger();
  initContactModal();
});

// ── CUSTOM CURSOR ────────────────────────────────────────────
function initCursor() {
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(cursor);
  document.body.appendChild(ring);

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  const updateCursor = () => {
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(updateCursor);
  };
  updateCursor();

  // Expand on hoverable elements
  document.querySelectorAll('button, a, .service-card, .pricing-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
      cursor.style.opacity = '0.5';
      ring.style.width = '48px';
      ring.style.height = '48px';
      ring.style.borderColor = 'rgba(0,229,255,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.opacity = '1';
      ring.style.width = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'rgba(0,229,255,0.5)';
    });
  });
}

// ── SCROLL PROGRESS BAR ──────────────────────────────────────
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (window.scrollY / max) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
}

// ── NAV SCROLL STATE ─────────────────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ── REVEAL ON SCROLL ─────────────────────────────────────────
function initRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── ANIMATED COUNTERS ────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      const duration = 2000;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        const val = target * eased;
        el.textContent = decimals > 0 ? val.toFixed(decimals) + suffix : Math.round(val) + suffix;
        if (elapsed < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// ── SERVICE CARDS STAGGER ────────────────────────────────────
function initServiceCards() {
  const cards = document.querySelectorAll('.service-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = [...cards].indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    card.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), border-color 0.4s, box-shadow 0.4s';
    observer.observe(card);
  });
}

// ── PRICING CARDS ────────────────────────────────────────────
function initPricingHover() {
  const cards = document.querySelectorAll('.pricing-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
      card.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 2}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ── CHAT WIDGET ───────────────────────────────────────────────
function initChatWidget() {
  // Los botones de contacto son <a href> directos a WhatsApp — no requieren JS.
}

// ── HAMBURGER MOBILE MENU ────────────────────────────────────
function initHamburger() {
  const btn      = document.getElementById('nav-hamburger');
  const menu     = document.getElementById('mobile-menu');
  const overlay  = document.getElementById('mobile-overlay');
  const links    = document.querySelectorAll('.mobile-nav-links a');
  const mobileCta = document.getElementById('mobile-chat-cta');

  if (!btn || !menu || !overlay) return;

  const openMenu = () => {
    btn.classList.add('active');
    menu.classList.add('open');
    overlay.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    btn.classList.remove('active');
    menu.classList.remove('open');
    overlay.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () => {
    btn.classList.contains('active') ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  links.forEach(link => link.addEventListener('click', closeMenu));

  if (mobileCta) {
    mobileCta.addEventListener('click', closeMenu);
  }

  // Cerrar menú al redimensionar a escritorio
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && btn.classList.contains('active')) {
      closeMenu();
    }
  });

  // Tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.classList.contains('active')) closeMenu();
  });
}

// ── MODAL DE CONTACTO ────────────────────────────────────────
function initContactModal() {
  const modal    = document.getElementById('contact-modal');
  const overlay  = document.getElementById('contact-modal-overlay');
  const closeBtn = document.getElementById('contact-modal-close');
  const copyBtn  = document.getElementById('contact-copy-btn');
  const gmailLink = document.getElementById('contact-gmail-link');
  const waLink   = document.getElementById('contact-wa-link');
  const subEl    = document.getElementById('contact-modal-sub');

  const EMAIL = 'contacto@autoenv.cl';
  const WA_BASE = 'https://wa.me/56990632995?text=';

  window.openContactModal = (plan) => {
    const subject = plan
      ? `Interesado en ${plan} — AutoEnvCL`
      : 'Consulta — AutoEnvCL';
    const body = plan
      ? `Hola, me interesa el ${plan} de AutoEnvCL. Quedo atento a su respuesta.`
      : 'Hola, me interesa conocer más sobre AutoEnvCL.';
    const waText = plan
      ? `Hola, me interesa el ${plan} de AutoEnvCL. ¿Podemos hablar?`
      : 'Hola, me interesa conocer más sobre AutoEnvCL. ¿Podemos hablar?';

    subEl.textContent = plan ? `Interesado en el ${plan}` : 'Elige cómo prefieres escribirnos';
    gmailLink.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    waLink.href    = WA_BASE + encodeURIComponent(waText);

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    copyBtn.textContent = 'Copiar';
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(EMAIL).then(() => {
      copyBtn.textContent = '¡Copiado!';
      setTimeout(() => { copyBtn.textContent = 'Copiar'; }, 2000);
    }).catch(() => {
      // Fallback para navegadores sin clipboard API
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyBtn.textContent = '¡Copiado!';
      setTimeout(() => { copyBtn.textContent = 'Copiar'; }, 2000);
    });
  });
}

// ── GLITCH EFFECT ────────────────────────────────────────────
function initGlitchEffect() {
  document.querySelectorAll('.glitch').forEach(el => {
    el.setAttribute('data-text', el.textContent);
  });
}

// ── MAGNETIC BUTTONS ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cta-primary, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.2;
      const dy = (e.clientY - cy) * 0.2;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
});
