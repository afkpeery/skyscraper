/* Mount each real portfolio section inside its matching 3D storefront interior. */
(() => {
  let mounted = null;
  let observer = null;

  function restore() {
    if (!mounted) return;
    const { facade, parent, next } = mounted;
    if (next && next.parentNode === parent) parent.insertBefore(facade, next);
    else parent.appendChild(facade);
    facade.style.removeProperty('visibility');
    facade.style.removeProperty('opacity');
    facade.style.removeProperty('pointer-events');
    mounted = null;
  }

  function mount() {
    const ui = document.getElementById('interior-ui');
    if (!ui || !ui.classList.contains('visible')) return;
    const title = document.getElementById('interior-title')?.textContent.trim();
    const floor = [...document.querySelectorAll('#tower .floor')].find(el => el.dataset.store === title);
    const facade = floor?.querySelector('.facade');
    const content = ui.querySelector('.interior-content');
    if (!facade || !content || mounted?.facade === facade) return;
    restore();
    const parent = facade.parentNode;
    const next = facade.nextSibling;
    content.replaceChildren(facade);
    mounted = { facade, parent, next };
    facade.style.visibility = 'visible';
    facade.style.opacity = '1';
    facade.style.pointerEvents = 'auto';
  }

  function watch() {
    const ui = document.getElementById('interior-ui');
    if (!ui || observer) return;
    observer = new MutationObserver(() => {
      if (ui.classList.contains('visible')) mount();
      else restore();
    });
    observer.observe(ui, { attributes: true, attributeFilter: ['class'] });
  }

  const wait = new MutationObserver(() => {
    const ui = document.getElementById('interior-ui');
    if (!ui) return;
    wait.disconnect();
    const card = ui.querySelector('.interior-card');
    const content = document.createElement('div');
    content.className = 'interior-content';
    const links = card.querySelector('#interior-links');
    card.insertBefore(content, links || card.firstChild);
    watch();
    if (ui.classList.contains('visible')) mount();
  });
  wait.observe(document.body, { childList: true, subtree: true });

  // Capture before the main site navigation so the camera exits the room first.
  document.addEventListener('click', event => {
    const link = event.target.closest('#interior-ui .interior-content a[data-floor]');
    if (!link) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const destination = link.dataset.floor;
    document.getElementById('interior-exit')?.click();
    setTimeout(() => {
      document.querySelector('#nav a[data-floor="' + destination + '"]')?.click();
    }, 1450);
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setTimeout(restore, 1400);
  });
})();
