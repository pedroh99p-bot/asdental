(() => {
  'use strict';

  const config = window.ASDentalConfig || {};
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Public, non-sensitive conversion context. No patient data is collected here.
  function trackEvent(name, details = {}) {
    const allowedEvents = new Set([
      'booking_click', 'whatsapp_click', 'service_interest',
      'directions_click', 'assistant_open', 'faq_open'
    ]);
    if (!allowedEvents.has(name)) return;

    const params = {
      page: pageName,
      section: String(details.section || '').slice(0, 80),
      service: String(details.service || '').slice(0, 80)
    };
    const query = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach((key) => {
      const value = query.get(key);
      if (value) params[key] = value.slice(0, 100);
    });

    window.dispatchEvent(new CustomEvent('asdental:conversion', {
      detail: { event: name, params }
    }));

    if (config.analytics?.provider === 'ga4' && config.analytics.measurementId && typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    } else if (config.analytics?.provider === 'gtm' && config.analytics.measurementId && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...params });
    }
  }

  window.ASDentalTrack = trackEvent;

  function safeHttpUrl(value) {
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  }

  function setupConversionButtons() {
    document.querySelectorAll('[data-booking]').forEach((button) => {
      const url = safeHttpUrl(config.bookingUrl);
      button.disabled = !url;
      button.setAttribute('aria-disabled', String(!url));
      if (url) {
        button.textContent = 'Agendar avaliação';
        button.addEventListener('click', () => {
          trackEvent('booking_click', { section: button.closest('section')?.id || 'navigation' });
          window.open(url, '_blank', 'noopener,noreferrer');
        });
      }
    });

    document.querySelectorAll('[data-whatsapp]').forEach((button) => {
      const number = String(config.whatsappNumber || '').replace(/\D/g, '');
      const hasNumber = number.length >= 12 && number.length <= 15;
      button.disabled = !hasNumber;
      button.setAttribute('aria-disabled', String(!hasNumber));
      if (hasNumber) {
        button.textContent = 'Falar com a AS Dental';
        button.addEventListener('click', () => openWhatsApp('', button.closest('section')?.id || 'navigation'));
      }
    });
  }

  function openWhatsApp(service = '', section = '') {
    const number = String(config.whatsappNumber || '').replace(/\D/g, '');
    if (number.length < 12 || number.length > 15) return false;
    const base = config.whatsappMessage || 'Olá! Gostaria de informações sobre a AS Dental.';
    const message = service ? `Olá! Gostaria de informações sobre ${service} na AS Dental.` : base;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    trackEvent('whatsapp_click', { service, section });
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }

  function setupServiceInterest() {
    document.querySelectorAll('[data-track="service_interest"]').forEach((link) => {
      link.addEventListener('click', () => {
        trackEvent('service_interest', {
          service: link.dataset.service,
          section: link.closest('section')?.id || 'tratamentos'
        });
      });
    });
  }

  function setupFooter() {
    const professional = config.professional || {};
    document.querySelectorAll('[data-professional-info]').forEach((container) => {
      const details = [professional.legalName, professional.responsibleName, professional.cro && `CRO: ${professional.cro}`].filter(Boolean);
      if (details.length) {
        container.textContent = details.join(' · ');
        container.hidden = false;
      }
    });

    document.querySelectorAll('[data-footer-contact]').forEach((container) => {
      container.replaceChildren();
      if (config.phone) {
        const phone = document.createElement('a');
        phone.href = `tel:${String(config.phone).replace(/[^+\d]/g, '')}`;
        phone.textContent = config.phone;
        container.append(phone);
      }
      if (config.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
        const email = document.createElement('a');
        email.href = `mailto:${config.email}`;
        email.textContent = config.email;
        container.append(email);
      }
      if (config.hours) container.append(createElement('span', '', config.hours));
      if (!container.childElementCount) container.append(createElement('span', '', 'Contatos oficiais aguardam confirmação.'));
    });

    document.querySelectorAll('[data-footer-social]').forEach((container) => {
      const links = Array.isArray(config.social) ? config.social : [];
      links.forEach((item) => {
        const url = safeHttpUrl(item.url);
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.label || 'Rede social';
        container.append(link);
      });
      container.hidden = !container.childElementCount;
    });
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderTeam() {
    const track = document.querySelector('[data-team-track]');
    const approved = config.content?.teamApproved === true;
    const members = approved && Array.isArray(config.content.team) ? config.content.team : [];
    if (!track || !members.length) return;

    track.replaceChildren();
    members.forEach((member) => {
      const card = createElement('article', 'profile-card');
      if (member.photo) {
        const photo = document.createElement('img');
        photo.src = member.photo;
        photo.alt = member.photoAlt || `Foto de ${member.name || 'profissional da AS Dental'}`;
        photo.loading = 'lazy';
        photo.width = 640;
        photo.height = 480;
        card.append(photo);
      }
      const body = createElement('div', 'profile-card-copy');
      body.append(createElement('h3', '', member.name || ''));
      if (member.role) body.append(createElement('p', '', member.role));
      if (member.specialty) body.append(createElement('small', '', member.specialty));
      if (member.cro) body.append(createElement('small', '', `CRO: ${member.cro}`));
      card.append(body);
      track.append(card);
    });
    initializeCarousel(track);
  }

  function renderReviews() {
    const track = document.querySelector('[data-review-track]');
    const approved = config.content?.testimonialsApproved === true;
    const reviews = approved && Array.isArray(config.content.testimonials) ? config.content.testimonials : [];
    if (!track || !reviews.length) return;

    track.replaceChildren();
    reviews.forEach((review) => {
      const card = createElement('article', 'review-card');
      if (Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5) {
        const stars = createElement('p', 'review-stars', `${'★'.repeat(Math.round(review.rating))} (${review.rating}/5)`);
        stars.setAttribute('aria-label', `Nota ${review.rating} de 5`);
        card.append(stars);
      }
      card.append(createElement('blockquote', '', review.text || ''));
      const footer = createElement('footer');
      footer.append(createElement('strong', '', review.author || 'Paciente'));
      if (review.sourceUrl && safeHttpUrl(review.sourceUrl)) {
        const source = document.createElement('a');
        source.href = safeHttpUrl(review.sourceUrl);
        source.target = '_blank';
        source.rel = 'noopener noreferrer';
        source.textContent = 'Ver origem';
        footer.append(source);
      } else if (review.source) {
        footer.append(createElement('span', '', review.source));
      }
      card.append(footer);
      track.append(card);
    });
    initializeCarousel(track);
  }

  function initializeCarousel(track) {
    const shell = track.closest('[data-carousel]');
    if (!shell) return;
    const cards = [...track.children].filter((child) => child.matches('.profile-card, .review-card'));
    const previous = shell.querySelector('[data-carousel-prev]');
    const next = shell.querySelector('[data-carousel-next]');
    const canScroll = cards.length > 1;
    if (previous) previous.disabled = !canScroll;
    if (next) next.disabled = !canScroll;

    const move = (direction) => {
      const card = track.querySelector('.profile-card, .review-card');
      if (!card) return;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 16;
      track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    previous?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    });
    const updateButtons = () => {
      if (!canScroll) return;
      const end = track.scrollWidth - track.clientWidth - 2;
      if (previous) previous.disabled = track.scrollLeft <= 1;
      if (next) next.disabled = track.scrollLeft >= end;
    };
    track.addEventListener('scroll', updateButtons, { passive: true });
    updateButtons();
  }

  function setupReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;
    try {
      const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
      document.documentElement.classList.add('js-motion');
      targets.forEach((target) => observer.observe(target));
    } catch {
      document.documentElement.classList.remove('js-motion');
    }
  }

  function setupNavigation() {
    const header = document.querySelector('.site-header');
    const menu = document.querySelector('#menu-principal');
    const toggle = document.querySelector('.menu-toggle');
    const backdrop = document.querySelector('[data-menu-backdrop]');
    if (!menu || !toggle || !backdrop) return;
    const mobile = window.matchMedia('(max-width: 760px)');

    const setOpen = (open, restoreFocus = false) => {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      toggle.querySelector('.menu-toggle-label').textContent = open ? 'Fechar' : 'Menu';
      backdrop.hidden = !open;
      document.body.classList.toggle('drawer-open', open && mobile.matches);
      if (mobile.matches) {
        menu.setAttribute('role', open ? 'dialog' : 'navigation');
        menu.setAttribute('aria-modal', String(open));
        if (open) menu.querySelector('a, button:not(:disabled)')?.focus();
        else if (restoreFocus) toggle.focus();
      }
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true', true));
    backdrop.addEventListener('click', () => setOpen(false, true));
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (event) => {
      if (toggle.getAttribute('aria-expanded') !== 'true' || !mobile.matches) return;
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); return; }
      if (event.key !== 'Tab') return;
      const focusable = [...menu.querySelectorAll('a, button:not(:disabled)')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    mobile.addEventListener('change', () => setOpen(false));
    const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  function setupFaqTracking() {
    document.querySelectorAll('.faq-item').forEach((item) => {
      item.addEventListener('toggle', () => {
        if (item.open) trackEvent('faq_open', { section: 'faq' });
      });
    });
  }

  function setupMap() {
    const dialog = document.querySelector('[data-map-dialog]');
    const frame = document.querySelector('[data-map-frame]');
    const query = config.location?.mapSearchQuery;
    document.querySelector('[data-open-map]')?.addEventListener('click', () => {
      if (!dialog || !frame || !query) return;
      if (!frame.src) frame.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
      if (!dialog.open) dialog.showModal();
      trackEvent('directions_click', { section: 'localizacao' });
    });
    document.querySelector('[data-close-map]')?.addEventListener('click', () => dialog?.close());
    dialog?.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    document.querySelectorAll('[data-directions]').forEach((link) => link.addEventListener('click', () => {
      trackEvent('directions_click', { section: 'localizacao' });
    }));
  }

  function setupAssistant() {
    const panel = document.querySelector('#assistant-panel');
    const launcher = document.querySelector('[data-assistant-open]');
    const close = document.querySelector('[data-assistant-close]');
    const response = document.querySelector('[data-assistant-response]');
    if (!panel || !launcher) return;
    let previousFocus = null;

    const open = () => {
      previousFocus = document.activeElement;
      panel.hidden = false;
      launcher.setAttribute('aria-expanded', 'true');
      panel.querySelector('button:not(:disabled), a')?.focus();
      trackEvent('assistant_open', { section: 'assistente' });
    };
    const shut = (restoreFocus = true) => {
      panel.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      if (restoreFocus) (previousFocus instanceof HTMLElement ? previousFocus : launcher).focus();
    };

    launcher.addEventListener('click', () => panel.hidden ? open() : shut(false));
    close?.addEventListener('click', () => shut());
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); shut(); }
    });
    document.addEventListener('click', (event) => {
      if (!panel.hidden && !event.target.closest('.assistant-widget')) shut(false);
    });
    panel.querySelector('[data-assistant-booking]')?.addEventListener('click', () => {
      const bookingUrl = safeHttpUrl(config.bookingUrl);
      response.textContent = bookingUrl ? 'Abrindo o agendamento oficial.' : 'O link oficial de agendamento ainda não foi configurado.';
      if (bookingUrl) {
        trackEvent('booking_click', { section: 'assistente' });
        window.open(bookingUrl, '_blank', 'noopener,noreferrer');
      }
    });
    panel.querySelector('[data-assistant-whatsapp]')?.addEventListener('click', () => {
      const opened = openWhatsApp('', 'assistente');
      response.textContent = opened ? 'Abrindo o WhatsApp da clínica.' : 'O número oficial do WhatsApp ainda não foi configurado.';
    });
    panel.querySelectorAll('[data-assistant-link]').forEach((link) => link.addEventListener('click', () => shut(false)));
    panel.querySelectorAll('[data-assistant-answer]').forEach((button) => button.addEventListener('click', () => {
      const answers = {
        location: `A referência é ${config.location?.shoppingCenter || 'Shopping Nova América'}, ${config.location?.address || ''}, ${config.location?.district || ''}, ${config.location?.city || 'Rio de Janeiro'}. Piso e sala aguardam confirmação.`.replace(/\s+,/g, ',').replace(/,\s*,/g, ','),
        treatments: 'A página destaca implantes dentários, tratamento de canal, extrações e clareamento. A disponibilidade e a indicação precisam ser confirmadas com a clínica.',
        assessment: 'O atendimento começa com uma avaliação profissional, que orienta as opções adequadas para cada caso.'
      };
      response.textContent = answers[button.dataset.assistantAnswer] || 'Consulte a seção de dúvidas frequentes para mais informações.';
    }));
  }

  function init() {
    const year = document.querySelector('[data-current-year]');
    if (year) year.textContent = String(new Date().getFullYear());
    setupConversionButtons();
    setupFooter();
    setupServiceInterest();
    renderTeam();
    renderReviews();
    setupReveal();
    setupNavigation();
    setupFaqTracking();
    setupMap();
    setupAssistant();
  }

  init();
})();
