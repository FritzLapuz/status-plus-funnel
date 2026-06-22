document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ===== NAV ===== */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const navMobile = document.getElementById('navMobile');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    navMobile.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    navMobile.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* ===== HERO VIDEO FALLBACK ===== */
  const heroVideo = document.querySelector('.hero-video');
  const heroFallback = document.querySelector('.hero-video-fallback');
  if (heroVideo) {
    heroVideo.addEventListener('error', () => { heroFallback.style.opacity = '1'; });
    heroVideo.addEventListener('loadeddata', () => { heroFallback.style.opacity = '0'; });
    // If no source resolves, show fallback by default
    setTimeout(() => {
      if (heroVideo.readyState === 0) heroFallback.style.opacity = '1';
    }, 800);
  }

  /* ===== GSAP SETUP ===== */
  const hasGSAP = window.gsap && window.ScrollTrigger;
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ===== HERO HEADLINE WORD REVEAL ===== */
  const heroWords = document.querySelectorAll('#heroHeadline .reveal-word');
  if (hasGSAP && !prefersReducedMotion) {
    gsap.to(heroWords, {
      y: '0%',
      opacity: 1,
      duration: 1,
      ease: 'power4.out',
      stagger: 0.06,
      delay: 0.3,
    });
  } else {
    heroWords.forEach(w => { w.style.opacity = 1; w.style.transform = 'none'; });
  }

  /* ===== GENERIC REVEAL-ON-SCROLL ===== */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (hasGSAP && !prefersReducedMotion) {
    revealEls.forEach(el => {
      const delay = parseFloat(el.dataset.delay || '0');
      const fromLeft = el.classList.contains('reveal-left');
      gsap.fromTo(el,
        { opacity: 0, y: fromLeft ? 0 : 36, x: fromLeft ? -40 : 0 },
        {
          opacity: 1, y: 0, x: 0,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
  } else {
    revealEls.forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  }

  /* ===== WANT SECTION: strike-through + reveal triggers ===== */
  const wantSay = document.getElementById('wantSay');
  const wantReal = document.getElementById('wantReal').closest('.want-col');
  if ('IntersectionObserver' in window) {
    const wantObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.4 });
    if (wantSay) wantObserver.observe(wantSay);
    if (wantReal) wantObserver.observe(wantReal);
  } else {
    wantSay && wantSay.classList.add('in-view');
    wantReal && wantReal.classList.add('in-view');
  }

  /* ===== DECLARATION SEQUENCE ===== */
  const declSection = document.querySelector('.declaration-section');
  const declLines = document.querySelectorAll('.decl-line');
  const declFinal = document.getElementById('declarationFinal');

  if (hasGSAP && !prefersReducedMotion) {
    const declTl = gsap.timeline({
      scrollTrigger: {
        trigger: declSection,
        start: 'top 60%',
        toggleActions: 'play none none none',
      },
    });
    declTl
      .to(declLines, { opacity: 1, y: 0, duration: 0.6, stagger: 0.35, ease: 'power2.out' })
      .to(declFinal, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '+=0.3');
  } else {
    declLines.forEach(l => { l.style.opacity = 1; l.style.transform = 'none'; });
    if (declFinal) declFinal.style.opacity = 1;
  }
  if (declFinal) declFinal.style.transform = 'translateY(20px)';
  if (hasGSAP && !prefersReducedMotion) {
    gsap.set(declFinal, { y: 20 });
  }

  /* ===== TESTIMONIAL CAROUSEL ===== */
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');
  const prevBtn = document.getElementById('testimonialPrev');
  const nextBtn = document.getElementById('testimonialNext');
  const cards = track ? Array.from(track.children) : [];

  if (track && cards.length) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => scrollToCard(i));
      dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.children);

    function scrollToCard(i) {
      const card = cards[i];
      track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    }

    function currentIndex() {
      const trackLeft = track.scrollLeft;
      let closest = 0, closestDist = Infinity;
      cards.forEach((c, i) => {
        const dist = Math.abs(c.offsetLeft - track.offsetLeft - trackLeft);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      return closest;
    }

    function updateDots() {
      const idx = currentIndex();
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }

    prevBtn.addEventListener('click', () => scrollToCard(Math.max(0, currentIndex() - 1)));
    nextBtn.addEventListener('click', () => scrollToCard(Math.min(cards.length - 1, currentIndex() + 1)));

    let scrollTimeout;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateDots, 100);
    }, { passive: true });
  }

  /* ===== PARALLAX ON HERO ===== */
  if (hasGSAP && !prefersReducedMotion) {
    gsap.to('.hero-media', {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }
});
