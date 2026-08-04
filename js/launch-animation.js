/* Launch animation — a standalone splash/loading screen shown before the PIN
   screen. Recovered from an abandoned branch in the real HealthPass app
   (git commit fced2205d3 in engage) and adapted to run as its own screen
   here (the original morphed it into a compact header sitting above the PIN
   form — we keep it simpler: play once, then hand off to the PIN screen).
   Restarts cleanly every time (e.g. after "Log out") since it re-injects the
   animated markup, which forces the CSS keyframe animations to replay. */

(function () {
  var savedHTML = null;

  window.playLaunchAnimation = function (onDone) {
    var inner = document.getElementById('hp-splash-inner');
    var bar = document.getElementById('hp-loading-bar');
    if (!inner) { if (onDone) onDone(); return; }

    if (savedHTML === null) savedHTML = inner.innerHTML;
    // Re-parsing the children restarts their CSS animations from frame 0.
    inner.innerHTML = savedHTML;

    var lowEnd = typeof navigator.deviceMemory !== 'undefined' && navigator.deviceMemory <= 2;
    var duration = lowEnd ? 400 : 3400;

    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      // Force reflow so the transition below starts from 0% instead of jumping.
      void bar.offsetWidth;
      bar.style.transition = 'width ' + duration + 'ms linear';
      bar.style.width = '100%';
    }

    setTimeout(function () {
      if (onDone) onDone();
    }, duration);
  };
})();
