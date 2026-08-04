(() => {
  'use strict';

  const STORAGE = {
    cart: 'furniro_cart_v2',
    wishlist: 'furniro_wishlist_v1',
    compare: 'furniro_compare_v1',
    user: 'furniro_user_v1',
  };

  const CATALOG = [
    { id: 'asgaard-sofa', name: 'Asgaard sofa', description: 'Premium sectional sofa', price: 250000, image: 'assets/images/asgaard-main.jpg', page: 'single-product.html' },
    { id: 'syltherine', name: 'Syltherine', description: 'Stylish cafe chair', price: 2500000, image: 'assets/images/product-1.jpg', page: 'shop.html' },
    { id: 'leviosa', name: 'Leviosa', description: 'Stylish cafe chair', price: 2500000, image: 'assets/images/product-2.jpg', page: 'shop.html' },
    { id: 'lolito', name: 'Lolito', description: 'Luxury big sofa', price: 7000000, image: 'assets/images/product-3.jpg', page: 'shop.html' },
    { id: 'respira', name: 'Respira', description: 'Outdoor bar table and stool', price: 500000, image: 'assets/images/product-4.jpg', page: 'shop.html' },
    { id: 'grifo', name: 'Grifo', description: 'Night lamp', price: 1500000, image: 'assets/images/product-5.jpg', page: 'shop.html' },
    { id: 'muggo', name: 'Muggo', description: 'Small mug', price: 150000, image: 'assets/images/product-6.jpg', page: 'shop.html' },
    { id: 'pingky', name: 'Pingky', description: 'Cute bed set', price: 7000000, image: 'assets/images/product-7.jpg', page: 'shop.html' },
    { id: 'potty', name: 'Potty', description: 'Minimalist flower pot', price: 500000, image: 'assets/images/product-8.jpg', page: 'shop.html' },
    { id: 'outdoor-sofa-set', name: 'Outdoor Sofa Set', description: 'Three seater outdoor set', price: 224000, image: 'assets/images/comparison-outdoor-sofa.jpg', page: 'comparison.html' },
    { id: 'casaliving-wood', name: 'Casaliving Wood', description: 'Comfort sofa', price: 270000, image: 'assets/images/cart-casaliving.jpg', page: 'shop.html' },
  ];

  const DEFAULT_CART = [
    { ...CATALOG[0], quantity: 1, size: 'L', color: 'Purple' },
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const escapeHTML = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const slugify = (value = '') => String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const parsePrice = (value = '') => {
    const digits = String(value).replace(/[^0-9]/g, '');
    return Number(digits || 0);
  };

  const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString('en-US')}.00`;

  const readJSON = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const writeJSON = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
    }
  };

  const state = {
    cart: readJSON(STORAGE.cart, DEFAULT_CART),
    wishlist: readJSON(STORAGE.wishlist, []),
    compare: readJSON(STORAGE.compare, []),
  };

  const saveState = () => {
    writeJSON(STORAGE.cart, state.cart);
    writeJSON(STORAGE.wishlist, state.wishlist);
    writeJSON(STORAGE.compare, state.compare);
  };

  function createToastHost() {
    if ($('.furniro-toast-host')) return;
    const host = document.createElement('div');
    host.className = 'furniro-toast-host';
    host.setAttribute('aria-live', 'polite');
    document.body.append(host);
  }

  function toast(message, type = 'success') {
    createToastHost();
    const item = document.createElement('div');
    item.className = `furniro-toast furniro-toast-${type}`;
    item.textContent = message;
    $('.furniro-toast-host').append(item);
    requestAnimationFrame(() => item.classList.add('is-visible'));
    window.setTimeout(() => {
      item.classList.remove('is-visible');
      window.setTimeout(() => item.remove(), 250);
    }, 2600);
  }

  function openModal({ title, content, className = '', onOpen } = {}) {
    closeModal();
    const shell = document.createElement('div');
    shell.className = `furniro-modal-shell ${className}`.trim();
    shell.innerHTML = `
      <div class="furniro-modal-backdrop" data-modal-close></div>
      <section class="furniro-modal" role="dialog" aria-modal="true" aria-labelledby="furniro-modal-title">
        <div class="furniro-modal-header">
          <h2 id="furniro-modal-title">${escapeHTML(title || '')}</h2>
          <button type="button" class="furniro-modal-close" data-modal-close aria-label="Close">×</button>
        </div>
        <div class="furniro-modal-body">${content || ''}</div>
      </section>`;
    document.body.append(shell);
    document.body.classList.add('modal-open');
    $$('[data-modal-close]', shell).forEach((button) => button.addEventListener('click', closeModal));
    requestAnimationFrame(() => shell.classList.add('is-open'));
    onOpen?.(shell);
    const focusable = $('input, button, select, textarea, a[href]', shell);
    focusable?.focus();
  }

  function closeModal() {
    const shell = $('.furniro-modal-shell');
    if (!shell) return;
    shell.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    window.setTimeout(() => shell.remove(), 180);
  }

  function productFromCatalog(name) {
    const key = slugify(name);
    return CATALOG.find((item) => item.id === key || item.name.toLowerCase() === String(name).toLowerCase());
  }

  function productFromCard(card) {
    if (!card) return null;
    const name = $('h1, h2, h3', card)?.textContent?.trim() || 'Product';
    const priceText = $('.product-price, .comparison-price, .price-row strong, .shop-product-info strong, .product-info strong', card)?.textContent || '';
    const image = $('img', card)?.getAttribute('src') || 'assets/images/product-1.jpg';
    const description = $('.shop-product-info p, .product-info p, .product-short-description', card)?.textContent?.trim() || 'Furniro product';
    const catalog = productFromCatalog(name);
    return {
      id: catalog?.id || slugify(name),
      name,
      description,
      price: parsePrice(priceText) || catalog?.price || 0,
      image,
      page: catalog?.page || card.dataset.productLink || 'shop.html',
    };
  }

  function productFromButton(button) {
    const card = button.closest('.product-card, .shop-product-card, .comparison-product-card');
    if (card) return productFromCard(card);
    if (button.closest('.product-summary')) {
      const summary = button.closest('.product-summary');
      const name = $('#product-title')?.textContent?.trim() || 'Asgaard sofa';
      const product = productFromCatalog(name) || CATALOG[0];
      const mainImage = $('.product-main-image img')?.getAttribute('src') || product.image;
      const size = $('.size-options .selected')?.textContent?.trim() || '';
      const color = $('.color-options .selected')?.getAttribute('aria-label') || '';
      return { ...product, image: mainImage, size, color };
    }
    return null;
  }

  function cartTotal() {
    return state.cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  }

  function addToCart(product, quantity = 1, openAfter = true) {
    if (!product) return;
    const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);
    const existing = state.cart.find((item) => item.id === product.id && (item.size || '') === (product.size || '') && (item.color || '') === (product.color || ''));
    if (existing) existing.quantity += qty;
    else state.cart.push({ ...product, quantity: qty });
    saveState();
    renderAllCartUI();
    toast(`${product.name} cart mein add ho gaya.`);
    if (openAfter) setDrawer(true);
  }

  function removeFromCart(index) {
    const removed = state.cart[index];
    if (!removed) return;
    state.cart.splice(index, 1);
    saveState();
    renderAllCartUI();
    toast(`${removed.name} cart se remove ho gaya.`, 'info');
  }

  function updateCartQuantity(index, quantity) {
    const item = state.cart[index];
    if (!item) return;
    item.quantity = Math.max(1, Math.min(99, Number.parseInt(quantity, 10) || 1));
    saveState();
    renderCartDrawer();
    renderCartBadge();
    renderCheckout();

    const row = $(`.cart-table-row[data-cart-index="${index}"]`);
    const input = $('[data-cart-quantity]', row || document);
    if (row) {
      if (input) input.value = String(item.quantity);
      const lineTotal = $('.cart-line-total', row);
      if (lineTotal) lineTotal.textContent = formatMoney(item.price * item.quantity);
      $$('.cart-totals dd').forEach((value) => { value.textContent = formatMoney(cartTotal()); });
    } else {
      renderCartPage();
    }
  }

  function ensureCartDrawer() {
    let backdrop = $('.cart-backdrop');
    let drawer = $('.cart-drawer');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'cart-backdrop';
      backdrop.dataset.cartClose = '';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.append(backdrop);
    }
    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.className = 'cart-drawer';
      drawer.id = 'cart-drawer';
      drawer.setAttribute('aria-labelledby', 'cart-drawer-title');
      drawer.setAttribute('aria-hidden', 'true');
      drawer.innerHTML = `
        <div class="cart-drawer-header">
          <h2 id="cart-drawer-title">Shopping Cart</h2>
          <button class="cart-drawer-close" type="button" data-cart-close aria-label="Close shopping cart"><img src="assets/icons/cart-close-bag.svg" alt="" /></button>
          <span class="cart-drawer-rule" aria-hidden="true"></span>
        </div>
        <div class="cart-drawer-items"></div>
        <div class="cart-drawer-summary">
          <div class="cart-subtotal"><span>Subtotal</span><strong>${formatMoney(0)}</strong></div>
          <div class="cart-drawer-actions">
            <a class="cart-pill cart-pill-cart" href="cart.html">Cart</a>
            <a class="cart-pill cart-pill-checkout" href="checkout.html">Checkout</a>
            <a class="cart-pill cart-pill-comparison" href="comparison.html">Comparison</a>
          </div>
        </div>`;
      document.body.append(drawer);
    }

    $$('.icon-button[aria-label*="Cart" i], .icon-button[aria-label*="shopping cart" i]').forEach((button) => {
      button.classList.add('cart-trigger');
      button.setAttribute('aria-controls', 'cart-drawer');
      button.setAttribute('aria-expanded', 'false');
    });

    return { backdrop, drawer };
  }

  function setDrawer(open) {
    const { backdrop, drawer } = ensureCartDrawer();
    drawer.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-visible', open);
    drawer.setAttribute('aria-hidden', String(!open));
    backdrop.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('cart-open', open);
    $$('.cart-trigger').forEach((trigger) => trigger.setAttribute('aria-expanded', String(open)));
  }

  function renderCartBadge() {
    const quantity = state.cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
    $$('.cart-trigger').forEach((trigger) => {
      let badge = $('.cart-count-badge', trigger);
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-count-badge';
        trigger.append(badge);
      }
      badge.textContent = String(quantity);
      badge.hidden = quantity === 0;
    });
  }

  function renderCartDrawer() {
    const { drawer } = ensureCartDrawer();
    const container = $('.cart-drawer-items', drawer);
    if (!container) return;
    container.innerHTML = state.cart.length ? state.cart.map((item, index) => `
      <article class="cart-drawer-item" data-cart-index="${index}">
        <div class="cart-item-image"><img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" /></div>
        <div class="cart-item-copy">
          <h3>${escapeHTML(item.name)}</h3>
          <p><span>${Number(item.quantity || 1)}</span><span class="cart-times">×</span><strong>${formatMoney(item.price)}</strong></p>
        </div>
        <button class="cart-item-remove" type="button" aria-label="Remove ${escapeHTML(item.name)}" data-cart-remove="${index}">×</button>
      </article>`).join('') : '<p class="cart-empty-message">Your cart is empty.</p>';
    const subtotal = $('.cart-subtotal strong', drawer);
    if (subtotal) subtotal.textContent = formatMoney(cartTotal());
  }

  function renderCartPage() {
    const panel = $('.cart-table-panel');
    if (!panel) return;
    $$('.cart-table-row', panel).forEach((row) => row.remove());
    const head = $('.cart-table-head', panel);
    if (!state.cart.length) {
      const empty = document.createElement('div');
      empty.className = 'cart-page-empty';
      empty.innerHTML = '<h2>Your cart is empty</h2><a href="shop.html">Continue shopping</a>';
      head?.after(empty);
    } else {
      $('.cart-page-empty', panel)?.remove();
      state.cart.forEach((item, index) => {
        const row = document.createElement('article');
        row.className = 'cart-table-row';
        row.dataset.cartIndex = String(index);
        row.innerHTML = `
          <div class="cart-product-cell">
            <div class="cart-product-image"><img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" /></div>
            <h2>${escapeHTML(item.name)}</h2>
          </div>
          <p class="cart-price">${formatMoney(item.price)}</p>
          <label class="cart-quantity"><span class="sr-only">Quantity</span><input type="number" min="1" max="99" value="${Number(item.quantity || 1)}" aria-label="${escapeHTML(item.name)} quantity" data-cart-quantity="${index}" /></label>
          <p class="cart-line-total">${formatMoney(item.price * item.quantity)}</p>
          <button class="cart-trash" type="button" aria-label="Remove ${escapeHTML(item.name)}" data-cart-remove="${index}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></svg>
          </button>`;
        panel.append(row);
      });
    }
    $$('.cart-totals dd').forEach((value) => { value.textContent = formatMoney(cartTotal()); });
    const checkout = $('.cart-checkout-button');
    checkout?.classList.toggle('is-disabled', state.cart.length === 0);
    checkout?.setAttribute('aria-disabled', String(state.cart.length === 0));
  }

  function renderCheckout() {
    const order = $('.checkout-order');
    if (!order) return;
    $$('.checkout-product-row', order).forEach((row) => row.remove());
    const head = $('.checkout-order-head', order);
    state.cart.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'checkout-order-row checkout-product-row';
      row.innerHTML = `<p><span>${escapeHTML(item.name)}</span><strong>×&nbsp; ${Number(item.quantity || 1)}</strong></p><p>${formatMoney(item.price * item.quantity)}</p>`;
      head?.after(row);
    });
    if (!state.cart.length) {
      const row = document.createElement('div');
      row.className = 'checkout-order-row checkout-product-row checkout-empty-row';
      row.innerHTML = '<p><span>No products in cart</span></p><p>Rs. 0.00</p>';
      head?.after(row);
    }
    const rows = $$('.checkout-order-row:not(.checkout-product-row)', order);
    rows.forEach((row) => {
      const price = $('p:last-child', row);
      if (price) price.textContent = formatMoney(cartTotal());
    });
    const button = $('.place-order-button');
    if (button) button.disabled = state.cart.length === 0;
  }

  function renderAllCartUI() {
    renderCartDrawer();
    renderCartBadge();
    renderCartPage();
    renderCheckout();
  }

  function setupCartEvents() {
    ensureCartDrawer();
    setDrawer(false);

    document.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      if (target.closest('.cart-trigger')) {
        event.preventDefault();
        setDrawer(true);
        return;
      }
      if (target.closest('[data-cart-close]')) {
        event.preventDefault();
        setDrawer(false);
        return;
      }
      const remove = target.closest('[data-cart-remove]');
      if (remove) {
        event.preventDefault();
        removeFromCart(Number(remove.getAttribute('data-cart-remove')));
        return;
      }
      const addButton = target.closest('.add-cart, .product-action-button:not(.compare-button), .comparison-cart-row button');
      if (addButton) {
        event.preventDefault();
        let product = productFromButton(addButton);
        if (addButton.closest('.comparison-cart-row')) {
          const cell = addButton.closest('.comparison-cell');
          const index = Array.from(cell?.parentElement?.children || []).indexOf(cell) - 1;
          product = productFromCard($$('.comparison-product-card')[index]);
        }
        const quantity = addButton.closest('.product-summary') ? $('.quantity-control input')?.value : 1;
        addToCart(product, quantity, true);
      }
    });

    document.addEventListener('change', (event) => {
      const input = event.target instanceof HTMLInputElement ? event.target : null;
      if (!input?.matches('[data-cart-quantity]')) return;
      updateCartQuantity(Number(input.dataset.cartQuantity), input.value);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setDrawer(false);
        closeModal();
      }
    });
  }

  function setupSingleProduct() {
    const mainImage = $('.product-main-image img');
    $$('.product-thumbnail').forEach((thumbnail) => {
      thumbnail.addEventListener('click', () => {
        const image = $('img', thumbnail);
        if (!image || !mainImage) return;
        mainImage.src = image.src;
        mainImage.alt = image.alt;
        $$('.product-thumbnail').forEach((item) => item.classList.toggle('active', item === thumbnail));
      });
    });

    $$('.size-options .option-box').forEach((button) => button.addEventListener('click', () => {
      $$('.size-options .option-box').forEach((item) => item.classList.toggle('selected', item === button));
    }));

    $$('.color-options .color-swatch').forEach((button) => button.addEventListener('click', () => {
      $$('.color-options .color-swatch').forEach((item) => item.classList.toggle('selected', item === button));
    }));

    const quantity = $('.quantity-control input');
    const quantityButtons = $$('.quantity-control button');
    quantityButtons[0]?.addEventListener('click', () => { if (quantity) quantity.value = String(Math.max(1, (Number.parseInt(quantity.value, 10) || 1) - 1)); });
    quantityButtons[1]?.addEventListener('click', () => { if (quantity) quantity.value = String(Math.min(99, (Number.parseInt(quantity.value, 10) || 1) + 1)); });
    quantity?.addEventListener('input', () => { quantity.value = quantity.value.replace(/[^0-9]/g, '').slice(0, 2); });
    quantity?.addEventListener('blur', () => { quantity.value = String(Math.max(1, Number.parseInt(quantity.value, 10) || 1)); });

    const tabs = $$('.product-tabs button');
    const descriptionCopy = $('.description-copy');
    const descriptionImages = $('.description-images');
    if (tabs.length && descriptionCopy && descriptionImages) {
      const original = { copy: descriptionCopy.innerHTML, images: descriptionImages.innerHTML };
      tabs.forEach((tab, index) => tab.addEventListener('click', () => {
        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
        if (index === 0) {
          descriptionCopy.innerHTML = original.copy;
          descriptionImages.innerHTML = original.images;
          descriptionImages.hidden = false;
        } else if (index === 1) {
          descriptionCopy.innerHTML = '<div class="product-info-panel"><dl><div><dt>Material</dt><dd>Solid wood, fabric and cotton</dd></div><div><dt>Dimensions</dt><dd>265.32 × 167.76 × 76 cm</dd></div><div><dt>Weight</dt><dd>45 KG</dd></div><div><dt>Warranty</dt><dd>1 year manufacturing warranty</dd></div></dl></div>';
          descriptionImages.hidden = true;
        } else {
          descriptionCopy.innerHTML = '<div class="product-review-panel"><article><strong>Hamza</strong><span>★★★★★</span><p>Comfortable sofa and excellent build quality.</p></article><article><strong>Ali</strong><span>★★★★☆</span><p>Looks exactly like the pictures and feels premium.</p></article><form class="review-form"><label>Your review<textarea required placeholder="Write your review"></textarea></label><button type="submit">Submit Review</button></form></div>';
          descriptionImages.hidden = true;
          $('.review-form')?.addEventListener('submit', (event) => {
            event.preventDefault();
            toast('Review submit ho gaya.');
            event.currentTarget.reset();
          });
        }
      }));
    }
  }

  function setupWishlistAndShare() {
    function syncLikeButtons() {
      $$('.overlay-links a').forEach((link) => {
        if (!/like/i.test(link.textContent || '')) return;
        const product = productFromCard(link.closest('.product-card, .shop-product-card'));
        const active = product && state.wishlist.some((item) => item.id === product.id);
        link.classList.toggle('is-liked', Boolean(active));
        link.textContent = active ? '♥ Liked' : '♡ Like';
      });
    }

    document.addEventListener('click', async (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const overlayLink = target.closest('.overlay-links a');
      if (overlayLink && /like/i.test(overlayLink.textContent || '')) {
        event.preventDefault();
        const product = productFromCard(overlayLink.closest('.product-card, .shop-product-card'));
        if (!product) return;
        const index = state.wishlist.findIndex((item) => item.id === product.id);
        if (index >= 0) {
          state.wishlist.splice(index, 1);
          toast(`${product.name} wishlist se remove ho gaya.`, 'info');
        } else {
          state.wishlist.push(product);
          toast(`${product.name} wishlist mein save ho gaya.`);
        }
        saveState();
        syncLikeButtons();
        renderWishlistBadge();
        return;
      }
      if (overlayLink && /compare/i.test(overlayLink.textContent || '')) {
        event.preventDefault();
        const product = productFromCard(overlayLink.closest('.product-card, .shop-product-card'));
        if (!product) return;
        state.compare = [...state.compare.filter((item) => item.id !== product.id), product].slice(-3);
        saveState();
        toast(`${product.name} comparison list mein add ho gaya.`);
        window.setTimeout(() => { window.location.href = 'comparison.html'; }, 180);
        return;
      }
      if (overlayLink && /share/i.test(overlayLink.textContent || '')) {
        event.preventDefault();
        const product = productFromCard(overlayLink.closest('.product-card, .shop-product-card'));
        const shareData = { title: product?.name || 'Furniro', text: `Check out ${product?.name || 'this product'} on Furniro`, url: window.location.href };
        try {
          if (navigator.share) await navigator.share(shareData);
          else if (navigator.clipboard) {
            await navigator.clipboard.writeText(window.location.href);
            toast('Page link clipboard par copy ho gaya.');
          } else {
            toast('Share link: ' + window.location.href, 'info');
          }
        } catch {
        }
      }
    });

    const wishlistButton = $$('.icon-button').find((button) => /wishlist/i.test(button.getAttribute('aria-label') || ''));
    wishlistButton?.addEventListener('click', () => openWishlist());
    syncLikeButtons();
    renderWishlistBadge();
  }

  function renderWishlistBadge() {
    $$('.icon-button').filter((button) => /wishlist/i.test(button.getAttribute('aria-label') || '')).forEach((button) => {
      let badge = $('.wishlist-count-badge', button);
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'wishlist-count-badge';
        button.append(badge);
      }
      badge.textContent = String(state.wishlist.length);
      badge.hidden = state.wishlist.length === 0;
    });
  }

  function openWishlist() {
    const content = state.wishlist.length ? `<div class="wishlist-list">${state.wishlist.map((item, index) => `
      <article class="wishlist-item">
        <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" />
        <div><h3>${escapeHTML(item.name)}</h3><p>${formatMoney(item.price)}</p></div>
        <button type="button" data-wishlist-cart="${index}">Add to cart</button>
        <button type="button" class="wishlist-remove" data-wishlist-remove="${index}" aria-label="Remove ${escapeHTML(item.name)}">×</button>
      </article>`).join('')}</div>` : '<p class="modal-empty">Wishlist is empty.</p>';
    openModal({
      title: 'Wishlist',
      content,
      className: 'wishlist-modal-shell',
      onOpen: (shell) => {
        $$('[data-wishlist-cart]', shell).forEach((button) => button.addEventListener('click', () => {
          const item = state.wishlist[Number(button.dataset.wishlistCart)];
          addToCart(item, 1, false);
        }));
        $$('[data-wishlist-remove]', shell).forEach((button) => button.addEventListener('click', () => {
          state.wishlist.splice(Number(button.dataset.wishlistRemove), 1);
          saveState();
          renderWishlistBadge();
          closeModal();
          openWishlist();
        }));
      },
    });
  }

  function setupHeaderTools() {
    const searchButtons = $$('.icon-button').filter((button) => /search/i.test(button.getAttribute('aria-label') || ''));
    searchButtons.forEach((button) => button.addEventListener('click', openSearch));

    const accountButtons = $$('.icon-button').filter((button) => /account/i.test(button.getAttribute('aria-label') || ''));
    accountButtons.forEach((button) => button.addEventListener('click', openAccount));

    const nav = $('.main-nav');
    const headerActions = $('.header-actions');
    if (nav && headerActions && !$('.mobile-nav-toggle')) {
      const toggle = document.createElement('button');
      toggle.className = 'mobile-nav-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Toggle navigation');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span></span><span></span><span></span>';
      headerActions.before(toggle);
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      });
      $$('a', nav).forEach((link) => link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }));
    }
  }

  function openSearch() {
    const content = `
      <form class="site-search-form" role="search">
        <label for="site-search-input">Search furniture</label>
        <div><input id="site-search-input" type="search" placeholder="Try sofa, chair, lamp..." autocomplete="off" /><button type="submit">Search</button></div>
      </form>
      <div class="site-search-results"></div>`;
    openModal({
      title: 'Search',
      content,
      className: 'search-modal-shell',
      onOpen: (shell) => {
        const form = $('.site-search-form', shell);
        const input = $('#site-search-input', shell);
        const results = $('.site-search-results', shell);
        const render = () => {
          const query = input.value.trim().toLowerCase();
          const items = query ? CATALOG.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query)) : CATALOG.slice(0, 5);
          results.innerHTML = items.length ? items.map((item) => `
            <article class="site-search-result">
              <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" />
              <a href="${escapeHTML(item.page)}"><strong>${escapeHTML(item.name)}</strong><span>${escapeHTML(item.description)}</span></a>
              <button type="button" data-search-cart="${escapeHTML(item.id)}">Add</button>
            </article>`).join('') : '<p class="modal-empty">No products found.</p>';
          $$('[data-search-cart]', results).forEach((button) => button.addEventListener('click', () => {
            addToCart(CATALOG.find((item) => item.id === button.dataset.searchCart), 1, false);
          }));
        };
        form.addEventListener('submit', (event) => { event.preventDefault(); render(); });
        input.addEventListener('input', render);
        render();
      },
    });
  }

  function openAccount() {
    const user = readJSON(STORAGE.user, null);
    if (user) {
      openModal({
        title: 'My Account',
        content: `<div class="account-summary"><div class="account-avatar">${escapeHTML(user.name.charAt(0).toUpperCase())}</div><h3>${escapeHTML(user.name)}</h3><p>${escapeHTML(user.email)}</p><button type="button" class="account-logout">Log out</button></div>`,
        onOpen: (shell) => $('.account-logout', shell)?.addEventListener('click', () => {
          localStorage.removeItem(STORAGE.user);
          closeModal();
          toast('You are logged out.', 'info');
        }),
      });
      return;
    }
    openModal({
      title: 'Sign in',
      content: `<form class="account-form"><label>Name<input type="text" name="name" required /></label><label>Email<input type="email" name="email" required /></label><button type="submit">Continue</button></form>`,
      onOpen: (shell) => $('.account-form', shell)?.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) return;
        const data = new FormData(form);
        writeJSON(STORAGE.user, { name: data.get('name'), email: data.get('email') });
        closeModal();
        toast('Account sign in successful.');
      }),
    });
  }

  function setupNewsletter() {
    $$('.newsletter form').forEach((form) => form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = $('input[type="email"]', form);
      if (!input || !input.value.trim() || !input.checkValidity()) {
        input?.focus();
        toast('Valid email address enter karein.', 'error');
        return;
      }
      toast('Newsletter subscription successful.');
      form.reset();
    }));
  }

  function setupContactForm() {
    const form = $('.contact-form');
    if (!form) return;
    $$('input, textarea', form).forEach((field) => {
      if (field.name !== 'subject') field.required = true;
    });
    $('.contact-submit', form)?.addEventListener('click', () => {
      if (!form.reportValidity()) {
        toast('Required fields complete karein.', 'error');
        return;
      }
      toast('Your message has been sent.');
      form.reset();
    });
  }

  function setupCheckout() {
    const form = $('.billing-form');
    const button = $('.place-order-button');
    if (!form || !button) return;
    ['first-name', 'last-name', 'street', 'city', 'zip', 'phone', 'email'].forEach((name) => {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLElement) field.setAttribute('required', '');
    });

    $$('.payment-option input').forEach((radio) => radio.addEventListener('change', () => {
      $$('.payment-option').forEach((label) => {
        const active = $('input', label)?.checked;
        label.classList.toggle('is-active', Boolean(active));
        label.classList.toggle('payment-muted', !active);
      });
    }));

    button.addEventListener('click', () => {
      if (!state.cart.length) {
        toast('Cart empty hai.', 'error');
        return;
      }
      if (!form.reportValidity()) {
        toast('Billing details complete karein.', 'error');
        return;
      }
      const orderNumber = `FN-${Date.now().toString().slice(-6)}`;
      const amount = cartTotal();
      state.cart = [];
      saveState();
      renderAllCartUI();
      openModal({
        title: 'Order placed',
        content: `<div class="order-success"><div class="order-success-icon">✓</div><h3>Thank you for your order!</h3><p>Order number: <strong>${orderNumber}</strong></p><p>Total: <strong>${formatMoney(amount)}</strong></p><a href="index.html">Back to Home</a></div>`,
      });
      form.reset();
    });
  }

  function setupShop() {
    const grid = $('.shop-product-grid');
    if (!grid) return;
    const cards = $$('.shop-product-card', grid);
    const originalOrder = cards.slice();
    const showInput = $('.show-field input');
    const sortInput = $('.sort-field input');
    const pagination = $('.pagination');
    let currentPage = 1;
    let pageSize = Math.max(1, Number.parseInt(showInput?.value || '16', 10) || 16);
    let filteredCards = cards.slice();

    const cardData = (card) => productFromCard(card) || { name: '', price: 0, description: '' };

    const renderPagination = () => {
      if (!pagination) return;
      const pages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
      currentPage = Math.min(currentPage, pages);
      pagination.innerHTML = '';
      for (let page = 1; page <= pages; page += 1) {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = String(page);
        link.classList.toggle('active', page === currentPage);
        if (page === currentPage) link.setAttribute('aria-current', 'page');
        link.addEventListener('click', (event) => { event.preventDefault(); currentPage = page; render(); grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
        pagination.append(link);
      }
      if (currentPage < pages) {
        const next = document.createElement('a');
        next.href = '#';
        next.className = 'next';
        next.textContent = 'Next';
        next.addEventListener('click', (event) => { event.preventDefault(); currentPage += 1; render(); grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
        pagination.append(next);
      }
    };

    const render = () => {
      cards.forEach((card) => { card.hidden = true; });
      const start = (currentPage - 1) * pageSize;
      filteredCards.slice(start, start + pageSize).forEach((card) => { card.hidden = false; });
      const resultText = $('.shop-result-text');
      if (resultText) {
        const end = Math.min(start + pageSize, filteredCards.length);
        resultText.textContent = filteredCards.length ? `Showing ${start + 1}–${end} of ${filteredCards.length} results` : 'No products found';
      }
      renderPagination();
    };

    const applySort = () => {
      const query = (sortInput?.value || '').trim().toLowerCase();
      if (/low|ascending|cheap/.test(query)) filteredCards.sort((a, b) => cardData(a).price - cardData(b).price);
      else if (/high|descending|expensive/.test(query)) filteredCards.sort((a, b) => cardData(b).price - cardData(a).price);
      else if (/name|a-z|alphabet/.test(query)) filteredCards.sort((a, b) => cardData(a).name.localeCompare(cardData(b).name));
      else filteredCards.sort((a, b) => originalOrder.indexOf(a) - originalOrder.indexOf(b));
      filteredCards.forEach((card) => grid.append(card));
      currentPage = 1;
      render();
    };

    showInput?.addEventListener('change', () => {
      pageSize = Math.max(1, Math.min(50, Number.parseInt(showInput.value, 10) || 16));
      showInput.value = String(pageSize);
      currentPage = 1;
      render();
    });
    showInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); showInput.blur(); } });
    sortInput?.addEventListener('change', applySort);
    sortInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); applySort(); sortInput.blur(); } });

    const viewButtons = $$('.view-button');
    viewButtons[0]?.addEventListener('click', () => grid.classList.remove('is-list-view'));
    viewButtons[1]?.addEventListener('click', () => grid.classList.add('is-list-view'));

    const filterButton = $('.toolbar-button');
    filterButton?.addEventListener('click', () => {
      let panel = $('.shop-filter-panel');
      if (!panel) {
        panel = document.createElement('form');
        panel.className = 'shop-filter-panel';
        panel.innerHTML = `<label>Product name<input type="search" name="query" placeholder="Search products" /></label><label>Maximum price<input type="number" min="0" name="max" placeholder="Any price" /></label><button type="submit">Apply</button><button type="button" data-filter-clear>Clear</button>`;
        $('.shop-toolbar')?.after(panel);
        panel.addEventListener('submit', (event) => {
          event.preventDefault();
          const data = new FormData(panel);
          const query = String(data.get('query') || '').trim().toLowerCase();
          const max = Number(data.get('max') || 0);
          filteredCards = cards.filter((card) => {
            const item = cardData(card);
            return (!query || `${item.name} ${item.description}`.toLowerCase().includes(query)) && (!max || item.price <= max);
          });
          currentPage = 1;
          render();
        });
        $('[data-filter-clear]', panel)?.addEventListener('click', () => {
          panel.reset();
          filteredCards = cards.slice();
          currentPage = 1;
          applySort();
        });
      }
      panel.classList.toggle('is-open');
    });

    cards.forEach((card) => card.addEventListener('click', (event) => {
      if (event.target.closest('button, a')) return;
      window.location.href = card.dataset.productLink || 'single-product.html';
    }));

    render();
  }

  function setupComparison() {
    const select = $('#comparison-product-select');
    if (!select) return;
    select.innerHTML = '<option value="">Choose a Product</option>' + CATALOG
      .filter((item) => !['asgaard-sofa', 'outdoor-sofa-set'].includes(item.id))
      .map((item) => `<option value="${escapeHTML(item.id)}">${escapeHTML(item.name)}</option>`).join('');

    const stored = state.compare.at(-1);
    if (stored && Array.from(select.options).some((option) => option.value === stored.id)) select.value = stored.id;

    const genericSpecs = ['1 product', 'FN-' + Math.floor(Math.random() * 9000 + 1000), 'Solid Wood', 'Standard', 'Fabric + Cotton', 'Natural', 'Foam', 'Matte', 'No', '250 KG', 'Pakistan', '200 cm', '80 cm', '100 cm', '40 KG', '42 cm', '6 cm', '1 Year Warranty', 'Contact support@furniro.com', 'Manufacturing defect', 'Physical damage is not covered', '1 Year'];

    const applySelection = () => {
      const item = CATALOG.find((product) => product.id === select.value);
      const addColumnCells = $$('.comparison-row .comparison-cell:nth-child(4)');
      if (!item) {
        addColumnCells.forEach((cell) => { cell.innerHTML = ''; });
        $('.comparison-selected-preview')?.remove();
        return;
      }
      state.compare = [...state.compare.filter((product) => product.id !== item.id), item].slice(-3);
      saveState();
      let preview = $('.comparison-selected-preview');
      if (!preview) {
        preview = document.createElement('article');
        preview.className = 'comparison-selected-preview';
        $('.comparison-add-product')?.append(preview);
      }
      preview.innerHTML = `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" /><h3>${escapeHTML(item.name)}</h3><p>${formatMoney(item.price)}</p>`;
      let specIndex = 0;
      addColumnCells.forEach((cell) => {
        const row = cell.closest('.comparison-row');
        if (row?.classList.contains('comparison-section-title')) return;
        if (row?.classList.contains('comparison-cart-row')) {
          cell.innerHTML = '<button type="button" class="comparison-dynamic-cart">Add To Cart</button>';
          $('.comparison-dynamic-cart', cell)?.addEventListener('click', () => addToCart(item, 1, true));
        } else {
          cell.textContent = genericSpecs[specIndex] || '—';
          specIndex += 1;
        }
      });
      toast(`${item.name} comparison mein add ho gaya.`);
    };
    select.addEventListener('change', applySelection);
    if (select.value) applySelection();

    $$('.overlay-links a').filter((link) => /compare/i.test(link.textContent || '')).forEach((link) => link.addEventListener('click', () => {
      const item = productFromCard(link.closest('.product-card, .shop-product-card'));
      if (item) {
        state.compare = [...state.compare.filter((product) => product.id !== item.id), item].slice(-3);
        saveState();
      }
    }));
  }

  function setupBlog() {
    const posts = $$('.blog-post');
    if (!posts.length) return;
    posts.forEach((post) => {
      const paragraph = $('p', post);
      const readMore = $('.blog-read-more', post);
      paragraph?.classList.add('is-collapsed');
      readMore?.addEventListener('click', (event) => {
        event.preventDefault();
        const expanded = paragraph.classList.toggle('is-expanded');
        paragraph.classList.toggle('is-collapsed', !expanded);
        readMore.textContent = expanded ? 'Read less' : 'Read more';
      });
    });

    const applyFilter = (query) => {
      const value = String(query || '').trim().toLowerCase();
      let visible = 0;
      posts.forEach((post) => {
        const show = !value || post.textContent.toLowerCase().includes(value);
        post.hidden = !show;
        if (show) visible += 1;
      });
      toast(visible ? `${visible} blog post found.` : 'No blog posts found.', visible ? 'info' : 'error');
    };

    const searchForm = $('.blog-search');
    const searchInput = $('#blog-search-input');
    searchForm?.addEventListener('submit', (event) => { event.preventDefault(); applyFilter(searchInput?.value); });
    $('.blog-search button')?.addEventListener('click', () => applyFilter(searchInput?.value));
    searchInput?.addEventListener('search', () => applyFilter(searchInput.value));

    $$('.blog-categories a').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      if (searchInput) searchInput.value = link.textContent.trim();
      applyFilter(link.textContent);
      $('.blog-posts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));

    $$('.recent-post').forEach((link, index) => link.addEventListener('click', (event) => {
      event.preventDefault();
      const post = posts[Math.min(index, posts.length - 1)];
      posts.forEach((item) => { item.hidden = false; });
      post?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));

    $$('.blog-pagination a').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      const currentActive = $('.blog-pagination .active');
      let page = Number.parseInt(link.textContent, 10);
      if (link.classList.contains('next')) page = Math.min(posts.length, (Number.parseInt(currentActive?.textContent || '1', 10) || 1) + 1);
      if (!page) return;
      $$('.blog-pagination a').forEach((item) => item.classList.toggle('active', item.textContent.trim() === String(page)));
      posts.forEach((post, index) => { post.hidden = page === 1 ? false : index !== page - 1; });
      $('.blog-posts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  function setupHomeExtras() {
    const showMore = $('.center-action .button-outline');
    if (showMore && showMore.getAttribute('href') === '#') showMore.href = 'shop.html';
    const explore = $('.inspiration-copy .button');
    explore?.addEventListener('click', (event) => {
      if (explore.getAttribute('href') === '#') {
        event.preventDefault();
        $('.gallery-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    });

    const secondaryImage = $('.secondary-room > img');
    const next = $('.secondary-room .round-arrow');
    const dots = $$('.secondary-room .dots span');
    const slides = ['assets/images/inspiration-2.jpg', 'assets/images/inspiration-1.jpg', 'assets/images/gallery-bedroom.jpg', 'assets/images/gallery-dining.jpg'];
    let slide = 0;
    next?.addEventListener('click', () => {
      slide = (slide + 1) % slides.length;
      if (secondaryImage) secondaryImage.src = slides[slide];
      dots.forEach((dot, index) => dot.classList.toggle('active', index === slide));
    });

    $$('.gallery-photo img').forEach((image) => image.addEventListener('click', () => {
      openModal({ title: image.alt || 'Furniture gallery', content: `<img class="gallery-lightbox-image" src="${escapeHTML(image.src)}" alt="${escapeHTML(image.alt)}" />`, className: 'gallery-lightbox-shell' });
    }));
  }


  function setupMotionEffects() {
    const targets = $$('main > section, .site-footer, .comparison-row, .blog-post');
    targets.forEach((element, index) => {
      element.classList.add('motion-reveal');
      element.style.setProperty('--motion-order', String(index % 5));
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -45px 0px',
    });

    targets.forEach((element) => observer.observe(element));
  }

  function setupCheckoutLinkGuard() {
    $$('.cart-checkout-button, .cart-pill-checkout').forEach((link) => link.addEventListener('click', (event) => {
      if (!state.cart.length) {
        event.preventDefault();
        toast('Checkout se pehle cart mein product add karein.', 'error');
      }
    }));
  }

  function initialize() {
    setupCartEvents();
    renderAllCartUI();
    setupHeaderTools();
    setupSingleProduct();
    setupWishlistAndShare();
    setupNewsletter();
    setupContactForm();
    setupCheckout();
    setupShop();
    setupComparison();
    setupBlog();
    setupHomeExtras();
    setupMotionEffects();
    setupCheckoutLinkGuard();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
