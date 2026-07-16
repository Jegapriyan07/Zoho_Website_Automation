/**
 * Writer session connect — plain script, loads before app.js module.
 */
(function () {
  function showBanner(msg) {
    if (!msg) {
      document.getElementById('login-prompt-banner')?.remove();
      return;
    }
    let el = document.getElementById('login-prompt-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'login-prompt-banner';
      el.className = 'login-prompt-banner';
      document.body.prepend(el);
    }
    el.innerHTML = '<span class="ws-dot warn" aria-hidden="true"></span><span></span>';
    el.querySelector('span:last-child').textContent = msg;
  }

  function setBtnState(btn, text, loading) {
    if (!btn) return;
    btn.textContent = text;
    btn.classList.toggle('is-loading', Boolean(loading));
    btn.disabled = Boolean(loading);
  }

  function pollStatus(btn) {
    if (btn._pollId) clearInterval(btn._pollId);
    btn._pollId = setInterval(() => {
      fetch('/auth/writer-session/status', { credentials: 'same-origin' })
        .then((r) => r.json())
        .then((st) => {
          if (st.writer_ready || st.browser_ready || st.api_ready) {
            clearInterval(btn._pollId);
            btn._pollId = null;
            setBtnState(btn, 'Connected', false);
            showBanner('');
            document.dispatchEvent(new CustomEvent('writer-session-ready', { detail: st }));
          } else if (st.warmup?.status === 'waiting_signin') {
            setBtnState(btn, 'Waiting for sign-in…', true);
            showBanner(st.warmup.message || 'Chrome opened — sign in to Zoho in that window.');
          } else if (st.warmup?.status === 'failed') {
            clearInterval(btn._pollId);
            btn._pollId = null;
            setBtnState(btn, 'Try again', false);
            showBanner('');
            alert(st.warmup.error || st.warmup.message || 'Chrome failed to open');
          }
        })
        .catch(() => { /* ignore */ });
    }, 2000);
    setTimeout(() => {
      if (btn._pollId) clearInterval(btn._pollId);
      setBtnState(btn, 'Connect Writer session', false);
    }, 300000);
  }

  function connectWriterSession(btn) {
    if (!btn) return;

    setBtnState(btn, 'Opening Chrome…', true);
    showBanner('Opening Chrome — sign in to Zoho when the window appears.');

    fetch('/auth/writer-session/warm-up?force=1', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.message || data.error || 'Request failed (' + r.status + ')');

        if (data.writer_ready || data.already_ready || data.browser_ready || data.api_ready) {
          setBtnState(btn, 'Connected', false);
          showBanner('');
          document.dispatchEvent(new CustomEvent('writer-session-ready', { detail: data }));
          return;
        }

        setBtnState(btn, 'Waiting for sign-in…', true);
        if (data.message) showBanner(data.message);
        pollStatus(btn);
      })
      .catch((e) => {
        setBtnState(btn, 'Connect Writer session', false);
        showBanner('');
        alert(e.message || 'Could not open Chrome. Restart the web tool (npm start) and try again.');
      });
  }

  window.connectWriterSession = connectWriterSession;

  // pointerdown fires reliably; capture phase beats other handlers
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('[data-writer-connect], .ws-setup-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    connectWriterSession(btn);
  }, true);

  document.addEventListener('writer-session-ready', () => {
    if (typeof window.refreshWriterSessionBanner === 'function') {
      window.refreshWriterSessionBanner();
    }
  });
})();
