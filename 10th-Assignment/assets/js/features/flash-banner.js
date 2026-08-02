// Extracted from index.html to keep executable JavaScript out of HTML.
(function () {
        var el = document.getElementById('deals');
        if (!el) return;
        // Hide/show
        if (FLASH_SHOW === "no") {
          el.classList.add('flash-hidden');
        }
        // Text
        var l = document.getElementById('flash-text-left');
        var r = document.getElementById('flash-text-right');
        if (l && FLASH_TEXT_LEFT) l.textContent = FLASH_TEXT_LEFT;
        if (r && FLASH_TEXT_RIGHT) r.textContent = FLASH_TEXT_RIGHT;
      })();
