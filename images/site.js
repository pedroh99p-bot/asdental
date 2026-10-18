(() => {
  'use strict';

  const config = window.ASDentalConfig || {};
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preview = resolvePreviewMode();

  function resolvePreviewMode() {
    const settings = config.preview || {};
    if (settings.enabled !== true) return false;
    const host = window.location.hostname;
    const localHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
    const queryName = settings.queryParam || 'preview';
    return localHost || new URLSearchParams(window.location.search).get(queryName) === '1';
  }

  function trackEvent(name, details = {}) {
    const allowedEvents = new Set([
      'booking_click', 'whatsapp_click', 'service_interest',
      'directions_click', 'reviews_click', 'assistant_open', 'faq_open'
    ]);
    if (!allowedEvents.has(name)) return;

    const params = {
      page: pageName,
      section: String(details.section || '').slice(0, 80)
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
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  }

  function showNotice(message) {
    let notice = document.querySelector('[data-site-notice]');
    if (!notice) {
      notice = createElement('div', 'site-notice');
      notice.dataset.siteNotice = '';
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      document.body.append(notice);
    }
    notice.textContent = message;
    notice.hidden = false;
    window.clearTimeout(showNotice.timer);
    showNotice.timer = window.setTimeout(() => { notice.hidden = true; }, 5200);
  }

  function setupPreviewMode() {
    document.body.classList.toggle('is-preview', preview);
    if (!preview) return;
    const banner = createElement('div', 'preview-banner');
    banner.setAttribute('role', 'status');
    banner.innerHTML = '<span class="preview-banner-mark" aria-hidden="true">i</span><span><strong>Modo prévia</strong> · perfis, depoimentos e estrelas são composições ilustrativas, não representam pacientes ou avaliação Google real.</span>';
    document.querySelector('.site-header')?.before(banner);
    document.querySelectorAll('[data-preview-only]').forEach((item) => { item.hidden = false; });
  }

  function setupConversionButtons() {
    document.querySelectorAll('[data-booking]').forEach((button) => {
      const url = safeHttpUrl(config.bookingUrl);
      button.disabled = !url && !preview;
      button.setAttribute('aria-disabled', String(button.disabled));
      button.textContent = 'Agendar avaliação';
      button.addEventListener('click', () => {
        trackEvent('booking_click', { section: button.closest('section')?.id || 'navigation' });
        if (!url) {
          showNotice('O agendamento online depende da ativação do link oficial do Simples Dental.');
          return;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });

    document.querySelectorAll('[data-whatsapp]').forEach((button) => {
      const activeNumber = getConfirmedWhatsAppNumber();
      button.disabled = !activeNumber && !preview;
      button.setAttribute('aria-disabled', String(button.disabled));
      button.textContent = button.dataset.whatsappLabel || 'Falar com a equipe';
      button.addEventListener('click', () => {
        if (!activeNumber) {
          trackEvent('whatsapp_click', { section: button.closest('section')?.id || 'navigation' });
          showNotice('O número exibido na prévia ainda precisa ser confirmado pela clínica; nenhum WhatsApp foi aberto.');
          return;
        }
        openWhatsApp('', button.closest('section')?.id || 'navigation');
      });
    });

    document.querySelectorAll('[data-google-reviews-link]').forEach((link) => {
      const profileUrl = config.google?.verified === true ? safeHttpUrl(config.google.profileUrl) : '';
      link.hidden = !profileUrl;
      if (profileUrl) {
        link.href = profileUrl;
        link.addEventListener('click', () => trackEvent('reviews_click', { section: 'avaliacoes' }));
      } else {
        link.removeAttribute('href');
      }
    });
  }

  function getConfirmedWhatsAppNumber() {
    const number = String(config.whatsappNumber || '').replace(/\D/g, '');
    return config.whatsappConfirmed === true && number.length >= 12 && number.length <= 15 ? number : '';
  }

  function openWhatsApp(service = '', section = '') {
    const number = getConfirmedWhatsAppNumber();
    if (!number) return false;
    const message = service
      ? `Olá! Gostaria de tirar algumas dúvidas sobre ${service} na AS Dental.`
      : (config.whatsappMessage || 'Olá! Gostaria de tirar algumas dúvidas sobre os tratamentos da AS Dental.');
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    trackEvent('whatsapp_click', { section });
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }

  function setupServiceInterest() {
    document.querySelectorAll('[data-track="service_interest"]').forEach((link) => {
      link.addEventListener('click', () => {
        trackEvent('service_interest', { section: link.closest('section')?.id || 'tratamentos' });
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
      container.hidden = !container.childElementCount;
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

  function setBadgeWordmark(container) {
    const word = createElement('span', 'google-wordmark');
    word.setAttribute('aria-label', 'Google');
    [...'Google'].forEach((letter, index) => {
      const character = createElement('span', `google-letter google-letter-${index + 1}`, letter);
      character.setAttribute('aria-hidden', 'true');
      word.append(character);
    });
    container.append(word);
  }

  function setStars(container, rating, label) {
    const stars = createElement('span', 'rating-stars', '★★★★★');
    stars.setAttribute('aria-label', label);
    if (Number.isFinite(rating)) stars.style.setProperty('--rating-percent', `${Math.max(0, Math.min(100, rating / 5 * 100))}%`);
    container.append(stars);
  }

  function renderGoogleBadges() {
    const verified = config.google?.verified === true;
    const profileUrl = verified ? safeHttpUrl(config.google.profileUrl) : '';
    const rating = Number(config.google?.rating);
    const hasRating = verified && profileUrl && Number.isFinite(rating) && rating >= 1 && rating <= 5;
    const count = Number(config.google?.ratingCount);

    document.querySelectorAll('[data-google-badge]').forEach((slot) => {
      slot.replaceChildren();
      if (preview) {
        const badge = createElement('div', `google-badge google-badge-${slot.dataset.googleBadge} is-demonstration`);
        setBadgeWordmark(badge);
        setStars(badge, 5, 'Cinco estrelas ilustrativas; não representam uma nota real');
        badge.append(createElement('span', 'google-badge-note', 'Prévia visual • avaliações a confirmar'));
        slot.append(badge);
        slot.hidden = false;
        return;
      }
      if (!profileUrl) { slot.hidden = true; return; }

      const badge = document.createElement('a');
      badge.className = `google-badge google-badge-${slot.dataset.googleBadge}`;
      badge.href = profileUrl;
      badge.target = '_blank';
      badge.rel = 'noopener noreferrer';
      setBadgeWordmark(badge);
      if (hasRating) {
        const label = `Nota ${rating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} de 5`;
        setStars(badge, rating, label);
        badge.append(createElement('strong', 'google-rating-value', rating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })));
        if (Number.isFinite(count) && count > 0) badge.append(createElement('span', 'google-rating-count', `${count} avaliações`));
      } else {
        badge.append(createElement('span', 'google-badge-note', 'Consultar ficha no Google'));
      }
      slot.append(badge);
      slot.hidden = false;
    });
  }

  const demonstrationTeam = [
    {
      name: 'Dr. Nome Sobrenome',
      role: 'Cirurgião-dentista • Exemplo de perfil',
      description: 'Composição demonstrativa para visualizar a apresentação de um profissional.',
      photo: 'images/asdental-v2/photography/equipe-ilustrativa.webp',
      photoAlt: 'Retrato masculino ilustrativo gerado por IA; não representa integrante da AS Dental',
      photoPosition: '16% center'
    },
    {
      name: 'Dra. Nome Sobrenome',
      role: 'Cirurgiã-dentista • Exemplo de perfil',
      description: 'Composição demonstrativa para visualizar a apresentação de uma profissional.',
      photo: 'images/asdental-v2/photography/equipe-ilustrativa.webp',
      photoAlt: 'Retrato feminino ilustrativo gerado por IA; não representa integrante da AS Dental',
      photoPosition: '84% center'
    }
  ];

  const demonstrationReviews = [1, 2, 3].map((number) => ({
    author: `Paciente exemplo 0${number}`,
    rating: 5,
    text: 'Este espaço demonstra como um relato autorizado poderá ser apresentado no site.',
    source: 'Composição ilustrativa • sem vínculo com o Google'
  }));

  function renderTeam() {
    const track = document.querySelector('[data-team-track]');
    if (!track) return;
    const approved = config.content?.teamApproved === true;
    const members = approved && Array.isArray(config.content.team) ? config.content.team : [];
    const entries = preview ? demonstrationTeam : members;
    if (!entries.length) return;

    track.replaceChildren();
    entries.forEach((member, index) => {
      const card = createElement('article', `profile-card reveal${preview ? ' is-demonstration' : ''}`);
      if (member.photo) {
        const photo = document.createElement('img');
        photo.src = member.photo;
        photo.alt = member.photoAlt || `Foto de ${member.name || 'profissional da AS Dental'}`;
        photo.loading = 'lazy';
        photo.decoding = 'async';
        photo.width = 640;
        photo.height = 800;
        if (member.photoPosition) photo.style.objectPosition = member.photoPosition;
        card.append(photo);
      }
      const body = createElement('div', 'profile-card-copy');
      body.append(createElement('span', 'profile-mark', '✦'));
      if (preview) body.append(createElement('span', 'demo-label', 'Perfil ilustrativo'));
      body.append(createElement('h3', '', member.name || ''));
      if (member.role) body.append(createElement('p', 'profile-role', member.role));
      if (member.description) body.append(createElement('p', 'profile-description', member.description));
      if (!preview && member.specialty) body.append(createElement('small', '', member.specialty));
      if (!preview && member.cro) body.append(createElement('small', '', `CRO: ${member.cro}`));
      card.append(body);
      track.append(card);
      card.style.setProperty('--card-index', String(index));
    });
    initializeCarousel(track);
  }

  function renderReviews() {
    const track = document.querySelector('[data-review-track]');
    if (!track) return;
    const approved = config.content?.testimonialsApproved === true;
    const reviews = approved && Array.isArray(config.content.testimonials) ? config.content.testimonials : [];
    const entries = preview ? demonstrationReviews : reviews;
    if (!entries.length) return;

    track.replaceChildren();
    entries.forEach((review, index) => {
      const card = createElement('article', `review-card reveal${preview ? ' is-demonstration' : ''}`);
      if (preview) card.append(createElement('span', 'demo-label', 'Depoimento ilustrativo'));
      const head = createElement('div', 'review-author');
      if (review.avatarUrl && !preview && safeHttpUrl(review.avatarUrl)) {
        const avatar = document.createElement('img');
        avatar.src = review.avatarUrl;
        avatar.alt = '';
        avatar.loading = 'lazy';
        avatar.width = 44;
        avatar.height = 44;
        head.append(avatar);
      } else {
        const initial = createElement('span', 'review-avatar', (review.author || 'A').trim().charAt(0).toUpperCase());
        initial.setAttribute('aria-hidden', 'true');
        head.append(initial);
      }
      const authorBlock = createElement('div', 'review-author-copy');
      authorBlock.append(createElement('strong', '', review.author || 'Paciente'));
      authorBlock.append(createElement('span', 'review-date', preview ? 'Exemplo visual · sem data de publicação' : (review.date || '')));
      head.append(authorBlock);
      card.append(head);

      const rating = Number(review.rating);
      if (Number.isFinite(rating) && rating >= 1 && rating <= 5) {
        const stars = createElement('p', 'review-stars', `${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}`);
        stars.setAttribute('aria-label', `Nota ${rating} de 5`);
        card.append(stars);
      }
      card.append(createElement('blockquote', '', review.text || ''));
      const footer = createElement('footer', 'review-source');
      footer.append(createElement('span', '', preview ? 'Demonstração visual, sem relação com paciente real.' : (review.source || 'Relato autorizado')));
      if (!preview && review.sourceUrl && safeHttpUrl(review.sourceUrl)) {
        const source = document.createElement('a');
        source.href = safeHttpUrl(review.sourceUrl);
        source.target = '_blank';
        source.rel = 'noopener noreferrer';
        source.textContent = 'Ver origem';
        footer.append(source);
      }
      card.append(footer);
      track.append(card);
      card.style.setProperty('--card-index', String(index));
    });
    initializeCarousel(track);
  }

  function initializeCarousel(track) {
    const shell = track.closest('[data-carousel]');
    if (!shell) return;
    const cards = [...track.children].filter((child) => child.matches('.profile-card, .review-card'));
    if (!track.id) track.id = `carousel-${shell.dataset.carousel}`;
    const previous = shell.querySelector('[data-carousel-prev]');
    const next = shell.querySelector('[data-carousel-next]');
    const dots = document.querySelector(`[data-carousel-dots="${shell.dataset.carousel}"]`);
    previous?.setAttribute('aria-controls', track.id);
    next?.setAttribute('aria-controls', track.id);
    const hasOverflow = () => track.scrollWidth > track.clientWidth + 2;
    if (previous) previous.disabled = !hasOverflow();
    if (next) next.disabled = !hasOverflow();

    if (dots) {
      dots.replaceChildren();
      cards.forEach((card, index) => {
        const dot = createElement('button', 'carousel-dot');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Ir para o item ${index + 1}`);
        dot.addEventListener('click', () => card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'start' }));
        dots.append(dot);
      });
      dots.hidden = cards.length < 2 || !hasOverflow();
    }

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
      const canScroll = hasOverflow();
      if (previous) previous.disabled = !canScroll || track.scrollLeft <= 1;
      if (next) next.disabled = !canScroll || track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
      if (dots) dots.hidden = cards.length < 2 || !canScroll;
      if (!canScroll) return;
      const end = track.scrollWidth - track.clientWidth - 2;
      if (dots) {
        const active = Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / (cards[0].getBoundingClientRect().width + (Number.parseFloat(getComputedStyle(track).columnGap) || 16)))));
        [...dots.children].forEach((dot, index) => {
          dot.classList.toggle('is-active', index === active);
          if (index === active) dot.setAttribute('aria-current', 'true');
          else dot.removeAttribute('aria-current');
        });
      }
    };
    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons, { passive: true });
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
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      const label = toggle.querySelector('.menu-toggle-label');
      if (label) label.textContent = open ? 'Fechar' : 'Menu';
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
    const loadButton = document.querySelector('[data-open-map]');
    loadButton?.addEventListener('click', () => {
      if (!dialog || !frame || !query) return;
      if (!frame.src) {
        frame.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
        loadButton.setAttribute('aria-busy', 'true');
        loadButton.querySelector('[data-map-button-label]')?.replaceChildren('Carregando mapa…');
        const loadingTimer = window.setTimeout(() => {
          if (!loadButton.hasAttribute('aria-busy')) return;
          loadButton.removeAttribute('aria-busy');
          loadButton.querySelector('[data-map-button-label]')?.replaceChildren('Mapa indisponível · use a rota abaixo');
        }, 12000);
        frame.addEventListener('load', () => {
          window.clearTimeout(loadingTimer);
          loadButton.removeAttribute('aria-busy');
          loadButton.querySelector('[data-map-button-label]')?.replaceChildren('Mapa carregado');
        }, { once: true });
      }
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

    const bookingButton = panel.querySelector('[data-assistant-booking]');
    const whatsappButton = panel.querySelector('[data-assistant-whatsapp]');
    const bookingUrl = safeHttpUrl(config.bookingUrl);
    const activeNumber = getConfirmedWhatsAppNumber();
    if (bookingButton) bookingButton.disabled = !bookingUrl && !preview;
    if (whatsappButton) whatsappButton.disabled = !activeNumber && !preview;

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
    bookingButton?.addEventListener('click', () => {
      if (bookingUrl) {
        trackEvent('booking_click', { section: 'assistente' });
        window.open(bookingUrl, '_blank', 'noopener,noreferrer');
        if (response) response.textContent = 'Abrindo o agendamento oficial.';
      } else if (preview && response) {
        trackEvent('booking_click', { section: 'assistente' });
        response.textContent = 'O agendamento online depende da ativação do link oficial do Simples Dental.';
      }
    });
    whatsappButton?.addEventListener('click', () => {
      const opened = openWhatsApp('', 'assistente');
      if (!opened) trackEvent('whatsapp_click', { section: 'assistente' });
      if (response) response.textContent = opened
        ? 'Abrindo o WhatsApp da clínica.'
        : (preview ? 'O número candidato ainda precisa ser confirmado. Nenhuma conversa foi aberta.' : '');
    });
    panel.querySelectorAll('[data-assistant-link]').forEach((link) => link.addEventListener('click', () => shut(false)));
    panel.querySelectorAll('[data-assistant-answer]').forEach((button) => button.addEventListener('click', () => {
      const answers = {
        location: `A referência é ${config.location?.shoppingCenter || 'Shopping Nova América'}, ${config.location?.address || ''}, ${config.location?.district || ''}, ${config.location?.city || 'Rio de Janeiro'}. Piso e sala aguardam confirmação.`.replace(/\s+,/g, ',').replace(/,\s*,/g, ','),
        treatments: 'A página apresenta implantes dentários, tratamento de canal, extrações e clareamento. A indicação depende de avaliação profissional.',
        assessment: 'A avaliação profissional orienta as opções de cuidado adequadas para cada caso.'
      };
      if (response) response.textContent = answers[button.dataset.assistantAnswer] || 'Consulte a seção de dúvidas frequentes para mais informações.';
    }));
    document.querySelectorAll('[data-assistant-trigger]').forEach((button) => button.addEventListener('click', () => {
      if (panel.hidden) open();
      else panel.querySelector('[data-assistant-answer]')?.focus();
    }));
  }

  function init() {
    const year = document.querySelector('[data-current-year]');
    if (year) year.textContent = String(new Date().getFullYear());
    setupPreviewMode();
    setupConversionButtons();
    setupFooter();
    setupServiceInterest();
    renderGoogleBadges();
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
