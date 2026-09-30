(() => {
  const DURATION_OUT = 160;
  // Start navigation a bit before fade finishes so the next page can begin loading sooner
  const NAVIGATE_AT = 100;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const navigate = (url, replace) => {
    if (replace) window.location.replace(url);
    else window.location.href = url;
  };

  const prefetch = (url) => {
    try {
      const exists = Array.from(document.querySelectorAll('link[rel="prefetch"]')).some(
        (el) => el.getAttribute('href') === url
      );
      if (exists) return;
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    } catch {
      /* ignore */
    }
  };

  const go = (url, { replace = false } = {}) => {
    if (reduceMotion) {
      navigate(url, replace);
      return;
    }
    prefetch(url);
    const root = document.documentElement;
    root.style.transition = `opacity ${DURATION_OUT}ms ease`;
    root.style.opacity = '0';
    window.setTimeout(() => navigate(url, replace), NAVIGATE_AT);
  };

  document.addEventListener(
    'click',
    (event) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (!link || link.target === '_blank') return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

      if (link.classList.contains('case-card')) {
        event.preventDefault();
        go(link.href);
        return;
      }

      if (
        link.classList.contains('back-link') &&
        href.includes('design-intelligence-mockup')
      ) {
        event.preventDefault();
        // replace so browser Back from chapter closes overlay (same as Esc)
        go(link.href, { replace: true });
      }
    },
    true
  );

  // Soft fade-in after navigation (+ 1s fallback if rAF never fires)
  const markReady = () => document.documentElement.classList.add('di-page-ready');
  const readyFallback = window.setTimeout(markReady, 1000);
  const markReadyNow = () => {
    window.clearTimeout(readyFallback);
    markReady();
  };
  if (reduceMotion) {
    markReadyNow();
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(markReadyNow);
    });
  }

  // Esc: one level up only (detail → chapter → portfolio)
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();

    // Case detail → chapter (replace history entry)
    if (document.body?.hasAttribute('data-accent')) {
      go(
        new URL('./design-intelligence-mockup.html#chapter', window.location.href).href,
        { replace: true }
      );
      return;
    }

    // Chapter / DI home → close overlay back to portfolio
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        { type: 'close-design-intelligence' },
        window.location.origin
      );
    }
  });
})();
