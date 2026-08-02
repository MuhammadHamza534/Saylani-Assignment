// ===== HERO SLIDER =====
window.addEventListener('load', function () {

  const heroSlider = document.querySelector('.hero-slider');
  const heroTrack  = document.querySelector('.hero-track');
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots   = document.querySelectorAll('.hero-dot');
  const heroPrev   = document.querySelector('.hero-prev-btn');
  const heroNext   = document.querySelector('.hero-next-btn');
  let heroIndex = 0;

  function getWidth() {
    // fallback to window width if slider width is 0
    return heroSlider.offsetWidth || window.innerWidth;
  }

  function setSlideWidths() {
    var w = getWidth();
    heroSlides.forEach(function(slide) {
      slide.style.width = w + 'px';
    });
    // Also set track total width so all slides sit side by side
    heroTrack.style.width = (w * heroSlides.length) + 'px';
  }

  function goToSlide(n) {
    heroIndex = (n + heroSlides.length) % heroSlides.length;
    heroTrack.style.transform = 'translateX(-' + (heroIndex * getWidth()) + 'px)';
    heroDots.forEach(function(d) { d.classList.remove('active'); });
    if (heroDots[heroIndex]) heroDots[heroIndex].classList.add('active');
  }

  // Arrow buttons
  heroPrev.addEventListener('click', function () { goToSlide(heroIndex - 1); });
  heroNext.addEventListener('click', function () { goToSlide(heroIndex + 1); });

  // Dot buttons
  heroDots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { goToSlide(i); });
  });

  // Initialize
  setSlideWidths();
  goToSlide(0);

  // Resize pe recalculate
  window.addEventListener('resize', function() {
    setSlideWidths();
    goToSlide(heroIndex);
  });

});