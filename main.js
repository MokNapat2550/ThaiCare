/* =============================================
   THAICARE — main.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Cursor glow ── */
  const glow = document.getElementById('cursor-glow');
  if (glow) {
    document.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }

  /* ── Helper ── */
  function rand(min, max) { return (Math.random() * (max - min) + min).toFixed(1); }

  /* ── Particle dots generator ── */
  function createParticles(containerId, count = 28) {
    const container = document.getElementById(containerId);
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 4 + 2;
      const driftX1 = rand(-25, 25);
      const driftY1 = rand(-25, 25);
      const driftX2 = rand(-20, 20);
      const driftY2 = rand(-15, 15);
      
      const animName = `drift-${containerId}-${i}`;
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        @keyframes ${animName} {
          0%, 100% { transform: translate(0,0); }
          33% { transform: translate(${driftX1}px, ${driftY1}px); }
          66% { transform: translate(${driftX2}px, ${driftY2}px); }
        }
      `;
      document.head.appendChild(styleEl);

      p.style.cssText = [
        'position:absolute',
        `width:${size}px`,
        `height:${size}px`,
        'border-radius:50%',
        `background:rgba(87,116,96,${(Math.random() * 0.3 + 0.1).toFixed(2)})`,
        `top:${(Math.random() * 100).toFixed(1)}%`,
        `left:${(Math.random() * 100).toFixed(1)}%`,
        `animation:${animName} ${(10 + Math.random() * 14).toFixed(1)}s ease-in-out infinite`,
        `animation-delay:-${(Math.random() * 12).toFixed(1)}s`,
      ].join(';');
      container.appendChild(p);
    }
  }

  createParticles('particles');        // Hero
  createParticles('particles-howto', 45); // How-to (longer section, more dots)

  /* ── Navbar scroll effect ── */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = ['home', 'features', 'howto', 'team'];

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else                     navbar.classList.remove('scrolled');
    let current = 'home';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) current = id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  });

  /* ── Smooth scroll nav ── */
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('nav-links').classList.remove('open');
      document.getElementById('nav-hamburger').classList.remove('open');
    });
  });

  /* ── Mobile hamburger ── */
  const hamburger = document.getElementById('nav-hamburger');
  const navLinksEl = document.getElementById('nav-links');
  if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinksEl.classList.toggle('open');
    });
  }

  /* ── GSAP: register plugin first ── */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero left slide in
    gsap.to('#hero-left', {
      opacity: 1,
      x: 0,
      duration: 1.1,
      ease: 'power3.out',
      delay: 0.3,
    });
    // Hero right slide in
    gsap.to('#hero-right', {
      opacity: 1,
      x: 0,
      duration: 1.1,
      ease: 'power3.out',
      delay: 0.6,
    });

    /* ── Feature cards ── */
    if (document.querySelector('.feature-card')) {
      gsap.to('.feature-card', {
        scrollTrigger: { trigger: '#features', start: 'top 80%' },
        opacity: 1, y: 0, duration: 0.8, stagger: 0.18, ease: 'power3.out',
      });
    }

    /* ── How-to steps: alternating slide directions ── */
    // odd steps (1,3): phone slides from LEFT, text slides from RIGHT
    // even steps (2,4): phone slides from RIGHT, text slides from LEFT
    const howtoData = [
      { phone: '#hs1-phone', content: '#hs1-content', phoneX: -120, contentX: 120 },
      { phone: '#hs2-phone', content: '#hs2-content', phoneX:  120, contentX: -120 },
      { phone: '#hs3-phone', content: '#hs3-content', phoneX: -120, contentX: 120 },
      { phone: '#hs4-phone', content: '#hs4-content', phoneX:  120, contentX: -120 },
    ];
    howtoData.forEach(({ phone, content, phoneX, contentX }, i) => {
      const step = document.getElementById(`howto-step-${i + 1}`);
      if (!step) return;
      const trigger = { trigger: step, start: 'top 72%' };
      gsap.fromTo(phone,
        { opacity: 0, x: phoneX },
        { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: trigger }
      );
      gsap.fromTo(content,
        { opacity: 0, x: contentX },
        { opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.18, scrollTrigger: trigger }
      );
    });

    /* ── Team section: fade in wrapper ── */
    const teamWrapper = document.querySelector('.team-carousel-wrapper');
    if (teamWrapper) {
      teamWrapper.style.opacity = '0';
      gsap.to(teamWrapper, {
        scrollTrigger: { trigger: '#team', start: 'top 80%' },
        opacity: 1, duration: 1, ease: 'power2.out',
      });
    }

  } else {
    /* Fallback: reveal everything immediately with IntersectionObserver */
    const makeVisible = el => {
      el.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)';
      el.style.opacity = '1';
      el.style.transform = 'none';
    };
    const observe = selector => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { makeVisible(e.target); obs.unobserve(e.target); } });
      }, { threshold: 0.1 });
      document.querySelectorAll(selector).forEach(el => obs.observe(el));
    };
    // Animate hero immediately
    setTimeout(() => {
      makeVisible(document.getElementById('hero-left') || { style: {} });
      makeVisible(document.getElementById('hero-right') || { style: {} });
    }, 300);
    observe('.feature-card');
    // team wrapper fade-in fallback
    const tw = document.querySelector('.team-carousel-wrapper');
    if (tw) { tw.style.opacity = '0'; tw.style.transition = 'opacity 1s ease'; const to = new IntersectionObserver(e => { if(e[0].isIntersecting){ tw.style.opacity='1'; to.disconnect(); } }, {threshold:0.1}); to.observe(tw); }

    // how-to: set initial translateX then animate to 0
    const howtoFallback = [
      { phone: 'hs1-phone', content: 'hs1-content', phoneX: '-120px', contentX: '120px' },
      { phone: 'hs2-phone', content: 'hs2-content', phoneX: '120px',  contentX: '-120px' },
      { phone: 'hs3-phone', content: 'hs3-content', phoneX: '-120px', contentX: '120px' },
      { phone: 'hs4-phone', content: 'hs4-content', phoneX: '120px',  contentX: '-120px' },
    ];
    howtoFallback.forEach(({ phone, content, phoneX, contentX }) => {
      [{ id: phone, tx: phoneX }, { id: content, tx: contentX }].forEach(({ id, tx }) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.transform = `translateX(${tx})`;
        const obs = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            el.style.transition = 'opacity 0.9s ease, transform 0.9s cubic-bezier(0.22,1,0.36,1)';
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
            obs.disconnect();
          }
        }, { threshold: 0.15 });
        obs.observe(el);
      });
    });
  }


  /* ── Scroll-reveal for howto header ── */
  const howtoHeader = document.getElementById('howto-header');
  if (howtoHeader) {
    howtoHeader.style.opacity = '0';
    howtoHeader.style.transform = 'translateY(30px)';
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        howtoHeader.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)';
        howtoHeader.style.opacity    = '1';
        howtoHeader.style.transform  = 'none';
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(howtoHeader);
  }
  const featHeader = document.getElementById('features-header');
  if (featHeader) {
    featHeader.style.opacity = '0';
    featHeader.style.transform = 'translateY(30px)';
    const obs2 = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        featHeader.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)';
        featHeader.style.opacity    = '1';
        featHeader.style.transform  = 'none';
        obs2.disconnect();
      }
    }, { threshold: 0.3 });
    obs2.observe(featHeader);
  }
  const teamHeader = document.getElementById('team-header');
  if (teamHeader) {
    teamHeader.style.opacity = '0';
    teamHeader.style.transform = 'translateY(30px)';
    const obs3 = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        teamHeader.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)';
        teamHeader.style.opacity    = '1';
        teamHeader.style.transform  = 'none';
        obs3.disconnect();
      }
    }, { threshold: 0.3 });
    obs3.observe(teamHeader);
  }

  // Modals logic
  const btnAndroid = document.getElementById('btn-android');
  const btnIos = document.getElementById('btn-ios');
  const modalAndroid = document.getElementById('android-modal');
  const modalIos = document.getElementById('ios-modal');
  const closeAndroid = document.getElementById('android-close');
  const closeIos = document.getElementById('ios-close');

  function openModal(modal) {
    if(modal) modal.classList.add('active');
  }
  function closeModal(modal) {
    if(modal) modal.classList.remove('active');
  }

  if(btnAndroid) {
    btnAndroid.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalAndroid);
    });
  }
  if(btnIos) {
    btnIos.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modalIos);
    });
  }
  if(closeAndroid) {
    closeAndroid.addEventListener('click', () => closeModal(modalAndroid));
  }
  if(closeIos) {
    closeIos.addEventListener('click', () => closeModal(modalIos));
  }

  window.addEventListener('click', (e) => {
    if(e.target === modalAndroid) closeModal(modalAndroid);
    if(e.target === modalIos) closeModal(modalIos);
  });

  /* ── Team carousel: clone cards for mobile marquee ── */
  const carousel = document.getElementById('team-carousel');
  if (carousel) {
    const originals = Array.from(carousel.children).filter(
      el => el.nodeType === 1 && !el.hasAttribute('aria-hidden')
    );
    originals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('id');
      clone.classList.add('mobile-clone');
      carousel.appendChild(clone);
    });

    const wrapper = document.querySelector('.team-carousel-wrapper');
    if (wrapper) {
      let isDown = false;
      let autoScrollInterval;
      
      function startAutoScroll() {
        if(window.innerWidth > 900) return;
        clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(() => {
          if (!isDown) {
            wrapper.scrollLeft += 1;
            const firstClone = carousel.querySelector('.mobile-clone');
            if (firstClone) {
              const snapPoint = firstClone.offsetLeft - carousel.offsetLeft;
              if (wrapper.scrollLeft >= snapPoint) {
                wrapper.scrollLeft -= snapPoint;
              }
            }
          }
        }, 20);
      }
      
      wrapper.addEventListener('touchstart', () => isDown = true, {passive: true});
      wrapper.addEventListener('touchend', () => isDown = false, {passive: true});
      wrapper.addEventListener('mousedown', () => isDown = true);
      wrapper.addEventListener('mouseup', () => isDown = false);
      wrapper.addEventListener('mouseleave', () => isDown = false);
      
      startAutoScroll();
      window.addEventListener('resize', () => {
        clearInterval(autoScrollInterval);
        startAutoScroll();
      });
    }
  }

  /* ── Visitor Counter Logic ── */
  const visitorCountEl = document.getElementById('visitor-count');
  if (visitorCountEl) {
    let count = parseInt(localStorage.getItem('thaicare_visitors')) || 0;
    if (!sessionStorage.getItem('thaicare_counted')) {
      count++;
      localStorage.setItem('thaicare_visitors', count);
      sessionStorage.setItem('thaicare_counted', 'true');
    }
    visitorCountEl.textContent = `ผู้เข้าชม: ${count.toLocaleString()} คน`;
  }

});
