(() => {
  const body = document.body;
  const drawer = document.querySelector('.cart-drawer');
  const backdrop = document.querySelector('.cart-backdrop');
  const triggers = document.querySelectorAll('.cart-trigger');
  const closers = document.querySelectorAll('[data-cart-close]');

  if (!drawer || !backdrop) return;

  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-visible', open);
    drawer.setAttribute('aria-hidden', String(!open));
    backdrop.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('cart-open', open);
    triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', String(open)));
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => setDrawer(true));
  });

  closers.forEach((closer) => {
    closer.addEventListener('click', () => setDrawer(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
      setDrawer(false);
    }
  });

  document.querySelectorAll('.cart-item-remove').forEach((button) => {
    button.addEventListener('click', () => {
      button.closest('.cart-drawer-item')?.remove();
    });
  });
})();
