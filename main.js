/* ════════════════════════════════════════════════════════
   PORTFOLIO — main.js
   ════════════════════════════════════════════════════════ */

/* ════════════════════════════════
   1. CURSEUR PERSONNALISÉ
   ════════════════════════════════ */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');

  if (!cursor || !ring) return;

  // Position courante de la souris
  let mx = 0, my = 0;
  // Position interpolée de l'anneau (lag effect)
  let rx = 0, ry = 0;

  // Suivre la souris
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  // Cacher le curseur quand il quitte la fenêtre
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    ring.style.opacity   = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    ring.style.opacity   = '0.45';
  });

  // Anneau avec interpolation fluide (requestAnimationFrame)
  function animateRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Agrandir sur les éléments interactifs
  const interactives = 'a, button, .chip, .skill-card, .proj-card, .contact-link, .nav-cta, .btn';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor--hover');
      ring.classList.add('cursor-ring--hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor--hover');
      ring.classList.remove('cursor-ring--hover');
    });
  });

  // Effet clic
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(.7)';
  });
  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
  });
})();


/* ════════════════════════════════
   2. NAVBAR — scroll & menu mobile
   ════════════════════════════════ */
(function initNavbar() {
  const navbar    = document.querySelector('.navbar');
  const toggle    = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  if (!navbar) return;

  // Ajouter classe scrolled quand on descend
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Menu burger (mobile)
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Fermer le menu quand on clique sur un lien
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Fermer si clic en dehors
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();


/* ════════════════════════════════
   3. LIEN ACTIF AU SCROLL
   ════════════════════════════════ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');

  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + id
          );
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0
  });

  sections.forEach(s => observer.observe(s));
})();


/* ════════════════════════════════
   4. SCROLL REVEAL
   ════════════════════════════════ */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // On désobserve après l'apparition (une seule fois)
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();


/* ════════════════════════════════
   5. COMPTEURS ANIMÉS (hero stats)
   ════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing : easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  // Déclencher quand la section hero est visible
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Délai léger pour laisser les animations CSS se terminer
        setTimeout(() => {
          counters.forEach(animateCounter);
        }, 600);
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const hero = document.getElementById('hero');
  if (hero) observer.observe(hero);
})();


/* ════════════════════════════════
   6. TYPEWRITER (hero title name)
   ════════════════════════════════ */
(function initTypewriter() {
  const el = document.querySelector('.hero-name');
  if (!el) return;

  const text    = el.textContent.trim();
  const delay   = 900; // délai avant de commencer (ms)
  const speed   = 65;  // ms par caractère

  el.textContent = '';
  el.style.borderRight = '2px solid var(--accent)';

  let i = 0;
  setTimeout(() => {
    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        // Faire clignoter le curseur quelques secondes puis le retirer
        setTimeout(() => {
          el.style.borderRight = 'none';
        }, 2000);
      }
    }, speed);
  }, delay);
})();


/* ════════════════════════════════
   7. FORMULAIRE DE CONTACT
   ════════════════════════════════ */
(function initForm() {
  const form     = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const btn      = document.getElementById('form-btn');

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = form.querySelector('#form-name').value.trim();
    const email   = form.querySelector('#form-email').value.trim();
    const message = form.querySelector('#form-message').value.trim();

    // Validation simple
    if (!name || !email || !message) {
      showFeedback('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showFeedback('Adresse email invalide.', 'error');
      return;
    }

    // Simuler l'envoi (à remplacer par fetch vers votre backend Django)
    btn.textContent = '⏳ Envoi en cours…';
    btn.disabled = true;

    try {
      /*
       * ── INTÉGRATION DJANGO ──
       * Décommentez et adaptez ce bloc pour envoyer vers votre API :
       *
       * const res = await fetch('/api/contact/', {
       *   method: 'POST',
       *   headers: {
       *     'Content-Type': 'application/json',
       *     'X-CSRFToken': getCookie('csrftoken'),
       *   },
       *   body: JSON.stringify({ name, email, message }),
       * });
       * if (!res.ok) throw new Error('Erreur serveur');
       */

      // Simulation d'un délai réseau
      await sleep(1200);

      showFeedback('✓ Message envoyé ! Je vous répondrai rapidement.', 'success');
      form.reset();
    } catch (err) {
      showFeedback('Erreur lors de l\'envoi. Réessayez ou contactez-moi par email.', 'error');
    } finally {
      btn.textContent = '→ Envoyer le message';
      btn.disabled = false;
    }
  });

  function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className   = 'form-feedback form-feedback--' + type;
    // Effacer après 5 secondes
    setTimeout(() => {
      feedback.textContent = '';
      feedback.className   = 'form-feedback';
    }, 5000);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Récupérer le token CSRF (Django)
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
  }
})();


/* ════════════════════════════════
   8. SMOOTH SCROLL (ancres)
   ════════════════════════════════ */
(function initSmoothScroll() {
  const NAV_H = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '70',
    10
  );

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id     = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_H;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ════════════════════════════════
   9. PARALLAXE LÉGÈRE (hero glows)
   ════════════════════════════════ */
(function initParallax() {
  const glowRight = document.querySelector('.hero-glow--right');
  const glowLeft  = document.querySelector('.hero-glow--left');

  if (!glowRight || !glowLeft) return;

  // Uniquement sur desktop (éviter perf mobile)
  if (window.matchMedia('(max-width: 768px)').matches) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    glowRight.style.transform = `translateY(${y * 0.12}px)`;
    glowLeft.style.transform  = `translateY(${y * 0.08}px)`;
  }, { passive: true });
})();


/* ════════════════════════════════
   10. INDICATEUR DE PROGRESSION
       (barre en haut de page)
   ════════════════════════════════ */
(function initProgressBar() {
  // Créer la barre dynamiquement
  const bar = document.createElement('div');
  bar.id = 'progress-bar';
  bar.setAttribute('aria-hidden', 'true');
  Object.assign(bar.style, {
    position:   'fixed',
    top:        '0',
    left:       '0',
    height:     '2px',
    width:      '0%',
    background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
    zIndex:     '9999',
    transition: 'width .1s linear',
    pointerEvents: 'none',
  });
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width    = progress + '%';
  }, { passive: true });
})();


/* ════════════════════════════════
   11. CARDS TILT (effet 3D léger)
   ════════════════════════════════ */
(function initTilt() {
  // Uniquement sur desktop
  if (window.matchMedia('(max-width: 1024px)').matches) return;

  const cards = document.querySelectorAll('.skill-card, .proj-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const cx     = rect.width  / 2;
      const cy     = rect.height / 2;
      const rotX   = ((y - cy) / cy) * -6;  // max ±6deg
      const rotY   = ((x - cx) / cx) *  6;

      card.style.transform = `
        translateY(-5px)
        perspective(600px)
        rotateX(${rotX}deg)
        rotateY(${rotY}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .4s ease';
      setTimeout(() => card.style.transition = '', 400);
    });
  });
})();


/* ════════════════════════════════
   12. THEME TOGGLE (bonus)
       Ajoute un bouton light/dark
   ════════════════════════════════ */
(function initThemeToggle() {
  // Créer le bouton
  const btn = document.createElement('button');
  btn.id = 'theme-toggle';
  btn.setAttribute('aria-label', 'Basculer le thème');
  btn.textContent = '☀';
  Object.assign(btn.style, {
    position:   'fixed',
    bottom:     '2rem',
    right:      '2rem',
    width:      '42px',
    height:     '42px',
    borderRadius: '50%',
    border:     '1px solid var(--border)',
    background: 'var(--card)',
    color:      'var(--text)',
    fontSize:   '1.1rem',
    cursor:     'none',
    zIndex:     '200',
    display:    'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color .2s, transform .2s',
    boxShadow:  '0 4px 20px rgba(0,0,0,.4)',
  });

  btn.addEventListener('mouseenter', () => {
    btn.style.borderColor = 'var(--accent)';
    btn.style.transform   = 'scale(1.1)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.borderColor = '';
    btn.style.transform   = '';
  });

  let isLight = false;

  btn.addEventListener('click', () => {
    isLight = !isLight;
    btn.textContent = isLight ? '🌙' : '☀';

    const root = document.documentElement;
    if (isLight) {
      root.style.setProperty('--bg',     '#f8f9fa');
      root.style.setProperty('--bg2',    '#f1f3f5');
      root.style.setProperty('--bg3',    '#e9ecef');
      root.style.setProperty('--card',   '#ffffff');
      root.style.setProperty('--border', '#dee2e6');
      root.style.setProperty('--text',   '#212529');
      root.style.setProperty('--muted',  '#868e96');
    } else {
      root.style.setProperty('--bg',     '#080b10');
      root.style.setProperty('--bg2',    '#0d1117');
      root.style.setProperty('--bg3',    '#131920');
      root.style.setProperty('--card',   '#111820');
      root.style.setProperty('--border', '#1e2d3d');
      root.style.setProperty('--text',   '#e2e8f0');
      root.style.setProperty('--muted',  '#64748b');
    }
  });

  document.body.appendChild(btn);
})();
