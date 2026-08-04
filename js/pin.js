/* Client-side PIN keypad — same dot/keypad UX as the real app, but the
   check happens locally against DEMO_PIN instead of an HTTP round trip. */

(function () {
  let pin = [];
  const MAX = 4;
  let scanTimer = null;
  let scanIndex = 0;
  const HEADING_DEFAULT = 'Unlock healthpass with your PIN';
  const HEADING_ERROR = 'Invalid PIN. Please, try again.';

  function updateDots() {
    document.querySelectorAll('.hp-pin-dot').forEach((dot, i) => {
      dot.classList.toggle('hp-pin-dot--filled', i < pin.length);
    });
  }

  function startScanning(onDone) {
    scanIndex = 0;
    tick();
    scanTimer = setInterval(tick, 160);
    function tick() {
      document.querySelectorAll('.hp-pin-dot').forEach((dot, i) => {
        dot.classList.remove('hp-pin-dot--scan-gray', 'hp-pin-dot--scan-black');
        if (i < scanIndex) dot.classList.add('hp-pin-dot--scan-black');
        else if (i === scanIndex) dot.classList.add('hp-pin-dot--scan-gray');
      });
      scanIndex++;
      if (scanIndex > MAX) {
        clearInterval(scanTimer);
        onDone();
      }
    }
  }

  function showError() {
    const container = document.querySelector('.hp-pin-container');
    const row = document.querySelector('.hp-pin-dots');
    const heading = document.getElementById('hp-pin-heading');
    if (container) container.setAttribute('data-error', 'true');
    if (row) {
      row.classList.remove('hp-pin-dots--shake');
      void row.offsetWidth;
      row.classList.add('hp-pin-dots--shake');
    }
    if (heading) heading.textContent = HEADING_ERROR;
    setTimeout(() => {
      pin = [];
      if (container) container.removeAttribute('data-error');
      if (heading) heading.textContent = HEADING_DEFAULT;
      updateDots();
    }, 1200);
  }

  function trySubmit() {
    updateDots();
    setTimeout(() => {
      startScanning(() => {
        if (pin.join('') === DEMO_PIN) {
          window.hpUnlock();
        } else {
          pin = [];
          showError();
        }
      });
    }, 200);
  }

  function handleDigit(d) {
    if (pin.length < MAX) {
      pin.push(d);
      updateDots();
      if (pin.length === MAX) trySubmit();
    }
  }

  function handleBackspace() {
    if (pin.length > 0) {
      pin.pop();
      updateDots();
    }
  }

  function attach() {
    document.querySelectorAll('.hp-key[data-digit]').forEach((btn) => {
      if (btn.dataset.hpBound) return;
      btn.dataset.hpBound = '1';
      btn.addEventListener('click', () => handleDigit(btn.getAttribute('data-digit')));
    });
    const back = document.querySelector('.hp-key[data-action="backspace"]');
    if (back && !back.dataset.hpBound) {
      back.dataset.hpBound = '1';
      back.addEventListener('click', handleBackspace);
    }
  }

  window.initPinKeypad = function () {
    pin = [];
    document.querySelectorAll('.hp-pin-dot').forEach((dot) => {
      dot.classList.remove('hp-pin-dot--scan-gray', 'hp-pin-dot--scan-black', 'hp-pin-dot--filled');
    });
    const container = document.querySelector('.hp-pin-container');
    if (container) container.removeAttribute('data-error');
    const heading = document.getElementById('hp-pin-heading');
    if (heading) heading.textContent = HEADING_DEFAULT;
    updateDots();
    attach();
  };
})();
