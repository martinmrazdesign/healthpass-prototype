/* HealthPass clickable prototype — single-page app, hash-routed, fully client-side.
   Every screen is rendered from js/data.js. There is no server and no network call. */

/* iOS Safari only honors :active on <a>/<div> if *something* in the document
   is listening for touch events — otherwise it skips straight past it, no
   flash at all. This listener does nothing; its only job is to turn :active
   on. (Buttons don't need this — :active already works on form controls.) */
document.addEventListener('touchstart', function () {}, { passive: true });

/* Explicit touch-driven tap state for .hp-tap-color icon buttons (back
   arrow, share, QR) — :active alone proved unreliable for touch on non-form
   elements across mobile browsers, so this drives the same CSS class
   directly off touchstart/touchend instead of trusting the pseudo-class. */
document.addEventListener('touchstart', (e) => {
  const el = e.target.closest && e.target.closest('.hp-tap-color');
  if (el) el.classList.add('hp-tap-active');
}, { passive: true });
function hpClearTapActive() {
  document.querySelectorAll('.hp-tap-color.hp-tap-active').forEach((el) => el.classList.remove('hp-tap-active'));
}
document.addEventListener('touchend', hpClearTapActive);
document.addEventListener('touchcancel', hpClearTapActive);

const APP_NAME = 'healthpass';
const LOGO = 'svg/logo-healthpass.svg';

const CATEGORIES = {
  vitals:        { label: 'Vitals',        accent: 'var(--vitals-accent)',        surface: 'var(--vitals-surface)',        lightest: 'var(--vitals-base)',        icon: 'svg/hp-vitals-light.svg',        iconDark: 'svg/hp-vitals-dark.svg' },
  prescription:  { label: 'Medications',   accent: 'var(--medications-accent)',   surface: 'var(--medications-surface)',   lightest: 'var(--medications-base)',   icon: 'svg/hp-medications-light.svg',   iconDark: 'svg/hp-medications-dark.svg' },
  labresults:    { label: 'Test Results',  accent: 'var(--test-results-accent)',  surface: 'var(--test-results-surface)',  lightest: 'var(--test-results-base)',  icon: 'svg/hp-lab-results-light.svg',   iconDark: 'svg/hp-lab-results-dark.svg' },
  visits:        { label: 'Visits',        accent: 'var(--visits-accent)',        surface: 'var(--visits-surface)',        lightest: 'var(--visits-base)',        icon: 'svg/hp-visits-light.svg',        iconDark: 'svg/hp-visits-dark.svg' },
  allergies:     { label: 'Allergies',     accent: 'var(--allergies-accent)',     surface: 'var(--allergies-surface)',     lightest: 'var(--allergies-base)',     icon: 'svg/hp-allergies-light.svg',     iconDark: 'svg/hp-allergies-dark.svg' },
  immunizations: { label: 'Vaccinations',  accent: 'var(--vaccinations-accent)',  surface: 'var(--vaccinations-surface)',  lightest: 'var(--vaccinations-base)',  icon: 'svg/hp-vaccinations-light.svg',  iconDark: 'svg/hp-vaccinations-dark.svg' },
  documents:     { label: 'Documents',     accent: 'var(--gray-darkest)',         surface: 'var(--gray-light)',            lightest: 'var(--gray-lightest)',      icon: 'svg/hp-documents-light.svg',     iconDark: 'svg/hp-documents-dark.svg' },
  about:         { label: 'About me',      accent: 'var(--green-dark)',          surface: 'var(--white)',                 lightest: 'var(--about-base)',         icon: 'svg/hp-about-light.svg',         iconDark: 'svg/hp-about-dark.svg' },
};
/* "Prescriptions" (the document list, route #/prescriptions) reuses the same
   yellow scheme as "Medications" (category key "prescription") — alias it so
   route()'s body-tint lookup (keyed by the URL section) finds it too. */
CATEGORIES.prescriptions = CATEGORIES.prescription;

/* Per-kind document icons (Figma "Icon=<kind>, Background=Light" export set).
   Falls back to the generic document icon for any kind not in this list. */
const DOCUMENT_ICONS = {
  'Prescription': 'svg/hp-doc-prescription.svg',
  'Referral':     'svg/hp-doc-referral.svg',
  'Sick note':    'svg/hp-doc-sicknote.svg',
};
function docIcon(kind) {
  return DOCUMENT_ICONS[kind] || 'svg/hp-doc-generic.svg';
}

/* Recents activity cards use their own icon/wave art + colors, distinct from the
   Your Health row icons above — matches the Figma "Activity" component variants. */
const ACTIVITY_META = {
  visit:        { surface: 'var(--lavender-light)', accent: 'var(--lavender-darkest)', icon: 'svg/hp-visits-dark.svg',       wave: 'svg/figma-wave-visit.svg' },
  prescription: { surface: 'var(--yellow-light)',    accent: 'var(--yellow-darkest)',   icon: 'svg/hp-doc-prescription.svg',  wave: 'svg/figma-wave-prescription.svg' },
  allergy:      { surface: 'var(--green-light)',     accent: 'var(--green-darkest)',    icon: 'svg/hp-allergies-dark.svg',    wave: 'svg/figma-wave-allergy.svg' },
  labresult:    { surface: 'var(--blue-light)',      accent: 'var(--blue-darkest)',     icon: 'svg/hp-lab-results-dark.svg',  wave: 'svg/figma-wave-labresult.svg' },
  sicknote:     { surface: 'var(--gray-light)',       accent: 'var(--gray-darkest)',    icon: 'svg/hp-doc-sicknote.svg',      wave: 'svg/figma-wave-sicknote-gray.svg' },
};

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Native 64x64 export — the clip-path already insets the glyph 16px on every
   side, so placing this flush at left:0/top:0 reproduces Figma's spacing
   with no extra offset math needed. */
function backArrow(color) {
  return `<svg width="66" height="66" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#hp-back-arrow-clip)">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M32.943 21.7238C33.4637 22.2445 33.4637 23.0888 32.943 23.6095L25.8858 30.6666H41.3335C42.0699 30.6666 42.6668 31.2636 42.6668 32C42.6668 32.7364 42.0699 33.3333 41.3335 33.3333H25.8858L32.943 40.3905C33.4637 40.9112 33.4637 41.7554 32.943 42.2761C32.4223 42.7968 31.5781 42.7968 31.0574 42.2761L21.724 32.9428C21.2033 32.4221 21.2033 31.5779 21.724 31.0572L31.0574 21.7238C31.5781 21.2031 32.4223 21.2031 32.943 21.7238Z" fill="${color}"/>
    </g>
    <defs>
      <clipPath id="hp-back-arrow-clip">
        <rect width="32" height="32" fill="white" transform="translate(16 16)"/>
      </clipPath>
    </defs>
  </svg>`;
}

function shareIcon(color) {
  return `<svg width="22" height="22" viewBox="12 12 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.7587 14L22 14C22.5523 14 23 14.4477 23 15C23 15.5523 22.5523 16 22 16H19.8C18.9434 16 18.3611 16.0008 17.911 16.0376C17.4726 16.0734 17.2484 16.1383 17.092 16.218C16.7157 16.4097 16.4097 16.7157 16.218 17.092C16.1383 17.2484 16.0734 17.4726 16.0376 17.911C16.0008 18.3611 16 18.9434 16 19.8V28.2C16 29.0566 16.0008 29.6389 16.0376 30.089C16.0734 30.5274 16.1383 30.7516 16.218 30.908C16.4097 31.2843 16.7157 31.5903 17.092 31.782C17.2484 31.8617 17.4726 31.9266 17.911 31.9624C18.3611 31.9992 18.9434 32 19.8 32H28.2C29.0566 32 29.6389 31.9992 30.089 31.9624C30.5274 31.9266 30.7516 31.8617 30.908 31.782C31.2843 31.5903 31.5903 31.2843 31.782 30.908C31.8617 30.7516 31.9266 30.5274 31.9624 30.089C31.9992 29.6389 32 29.0566 32 28.2V26C32 25.4477 32.4477 25 33 25C33.5523 25 34 25.4477 34 26V28.2413C34 29.0463 34 29.7106 33.9558 30.2518C33.9099 30.8139 33.8113 31.3306 33.564 31.816C33.1805 32.5686 32.5686 33.1805 31.816 33.564C31.3306 33.8113 30.8139 33.9099 30.2518 33.9558C29.7106 34 29.0463 34 28.2413 34H19.7587C18.9537 34 18.2894 34 17.7482 33.9558C17.1861 33.9099 16.6694 33.8113 16.184 33.564C15.4314 33.1805 14.8195 32.5686 14.436 31.816C14.1887 31.3306 14.0901 30.8139 14.0442 30.2518C14 29.7106 14 29.0463 14 28.2413V19.7587C14 18.9537 14 18.2894 14.0442 17.7482C14.0901 17.1861 14.1887 16.6694 14.436 16.184C14.8195 15.4314 15.4314 14.8195 16.184 14.436C16.6694 14.1887 17.1861 14.0901 17.7482 14.0442C18.2894 14 18.9537 14 19.7587 14ZM29.2929 14.2929C29.6834 13.9024 30.3166 13.9024 30.7071 14.2929L33.7071 17.2929C34.0976 17.6834 34.0976 18.3166 33.7071 18.7071L30.7071 21.7071C30.3166 22.0976 29.6834 22.0976 29.2929 21.7071C28.9024 21.3166 28.9024 20.6834 29.2929 20.2929L30.5858 19H29.8C28.9434 19 28.3611 19.0008 27.911 19.0376C27.4726 19.0734 27.2484 19.1383 27.092 19.218C26.7157 19.4097 26.4097 19.7157 26.218 20.092C26.1383 20.2484 26.0734 20.4726 26.0376 20.911C26.0008 21.3611 26 21.9434 26 22.8V24C26 24.5523 25.5523 25 25 25C24.4477 25 24 24.5523 24 24V22.7587C24 21.9537 24 21.2894 24.0442 20.7482C24.0901 20.1861 24.1887 19.6694 24.436 19.184C24.8195 18.4314 25.4314 17.8195 26.184 17.436C26.6694 17.1887 27.1861 17.0901 27.7482 17.0442C28.2894 17 28.9537 17 29.7587 17L30.5858 17L29.2929 15.7071C28.9024 15.3166 28.9024 14.6834 29.2929 14.2929Z" fill="${color}"/>
  </svg>`;
}

function eyeIcon(color) {
  return `<svg width="22" height="22" viewBox="12 12 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.3587 20.2429C16.8524 21.5001 15.7983 22.9774 15.2656 23.8208C15.2303 23.8768 15.2056 23.916 15.1849 23.95C15.1713 23.9724 15.1623 23.988 15.1563 23.9988C15.1563 23.9992 15.1562 23.9996 15.1562 24C15.1562 24.0004 15.1563 24.0008 15.1563 24.0012C15.1623 24.012 15.1713 24.0276 15.1849 24.05C15.2056 24.084 15.2303 24.1232 15.2656 24.1792C15.7983 25.0226 16.8524 26.4999 18.3587 27.7571C19.8626 29.0123 21.7571 30 24.0004 30C26.2437 30 28.1382 29.0123 29.6421 27.7571C31.1484 26.4999 32.2025 25.0226 32.7352 24.1792C32.7705 24.1232 32.7952 24.084 32.8159 24.05C32.8295 24.0276 32.8385 24.012 32.8446 24.0012C32.8446 24.0008 32.8446 24.0004 32.8446 24C32.8446 23.9996 32.8446 23.9992 32.8446 23.9988C32.8385 23.988 32.8295 23.9724 32.8159 23.95C32.7952 23.916 32.7705 23.8768 32.7352 23.8208C32.2025 22.9774 31.1484 21.5001 29.6421 20.2429C28.1382 18.9877 26.2437 18 24.0004 18C21.7571 18 19.8626 18.9877 18.3587 20.2429ZM17.0772 18.7074C18.8057 17.2647 21.1387 16 24.0004 16C26.8621 16 29.1951 17.2647 30.9237 18.7074C32.6499 20.1482 33.8334 21.8143 34.4262 22.7528C34.434 22.7653 34.4421 22.7779 34.4503 22.7908C34.5679 22.976 34.7206 23.2164 34.7978 23.5532C34.8601 23.8251 34.8601 24.1749 34.7978 24.4468C34.7206 24.7836 34.5679 25.024 34.4503 25.2092C34.4421 25.2221 34.434 25.2347 34.4262 25.2472C33.8334 26.1857 32.6499 27.8518 30.9237 29.2926C29.1951 30.7353 26.8621 32 24.0004 32C21.1387 32 18.8057 30.7353 17.0772 29.2926C15.3509 27.8518 14.1674 26.1857 13.5746 25.2472C13.5668 25.2348 13.5587 25.2221 13.5505 25.2092C13.4329 25.024 13.2802 24.7836 13.203 24.4468C13.1407 24.1749 13.1407 23.8251 13.203 23.5532C13.2802 23.2164 13.4329 22.976 13.5505 22.7908C13.5587 22.7779 13.5668 22.7652 13.5746 22.7528C14.1674 21.8143 15.3509 20.1482 17.0772 18.7074ZM24.0004 22C22.8958 22 22.0004 22.8954 22.0004 24C22.0004 25.1046 22.8958 26 24.0004 26C25.105 26 26.0004 25.1046 26.0004 24C26.0004 22.8954 25.105 22 24.0004 22ZM20.0004 24C20.0004 21.7909 21.7913 20 24.0004 20C26.2095 20 28.0004 21.7909 28.0004 24C28.0004 26.2091 26.2095 28 24.0004 28C21.7913 28 20.0004 26.2091 20.0004 24Z" fill="${color}"/>
  </svg>`;
}

function downloadIcon(color) {
  return `<svg width="22" height="22" viewBox="12 12 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M24 14C24.5523 14 25 14.4477 25 15V24.5858L28.2929 21.2929C28.6834 20.9024 29.3166 20.9024 29.7071 21.2929C30.0976 21.6834 30.0976 22.3166 29.7071 22.7071L24.7071 27.7071C24.3166 28.0976 23.6834 28.0976 23.2929 27.7071L18.2929 22.7071C17.9024 22.3166 17.9024 21.6834 18.2929 21.2929C18.6834 20.9024 19.3166 20.9024 19.7071 21.2929L23 24.5858V15C23 14.4477 23.4477 14 24 14ZM15 26C15.5523 26 16 26.4477 16 27V28.2C16 29.0566 16.0008 29.6389 16.0376 30.089C16.0734 30.5274 16.1383 30.7516 16.218 30.908C16.4097 31.2843 16.7157 31.5903 17.092 31.782C17.2484 31.8617 17.4726 31.9266 17.911 31.9624C18.3611 31.9992 18.9434 32 19.8 32H28.2C29.0566 32 29.6389 31.9992 30.089 31.9624C30.5274 31.9266 30.7516 31.8617 30.908 31.782C31.2843 31.5903 31.5903 31.2843 31.782 30.908C31.8617 30.7516 31.9266 30.5274 31.9624 30.089C31.9992 29.6389 32 29.0566 32 28.2V27C32 26.4477 32.4477 26 33 26C33.5523 26 34 26.4477 34 27V28.2413C34 29.0463 34 29.7106 33.9558 30.2518C33.9099 30.8139 33.8113 31.3306 33.564 31.816C33.1805 32.5686 32.5686 33.1805 31.816 33.564C31.3306 33.8113 30.8139 33.9099 30.2518 33.9558C29.7106 34 29.0463 34 28.2413 34H19.7587C18.9537 34 18.2894 34 17.7482 33.9558C17.1861 33.9099 16.6694 33.8113 16.184 33.564C15.4314 33.1805 14.8195 32.5686 14.436 31.816C14.1887 31.3306 14.0901 30.8139 14.0442 30.2518C14 29.7106 14 29.0463 14 28.2413L14 27C14 26.4477 14.4477 26 15 26Z" fill="${color}"/>
  </svg>`;
}

function waveTop(headerColor) {
  return `<svg width="100%" height="84" viewBox="0 0 380 84" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
    <path d="M355.996 0C369.251 0 379.996 10.7452 379.996 24V84H0C0 73.5066 8.50659 65 19 65H45.2256C56.2531 64.9998 65.8618 57.4849 68.5186 46.7822L75.6084 18.2178C78.2652 7.515 87.8737 8.31862e-05 98.9014 0H355.996Z" fill="${headerColor}"/>
  </svg>`;
}

/* ---------------------------------------------------------------------- */
/* Section + Card components (matches Figma "Section" node 6:5728 and       */
/* "Section Cards" variants node 138:6288) — a single continuous white      */
/* rounded box with 1px gray-light dividers between rows, not separate      */
/* floating cards.                                                          */
/* ---------------------------------------------------------------------- */

/* Rows are normally a plain HTML string (20px padding all round, divider
   after). Pass { content, padding, noDivider } instead to override either —
   e.g. the visit AI-insight card sits closer to the box edges and has no
   divider under it. */
function sectionBox(rows) {
  const rowsHtml = rows.length
    ? rows.map((r, i) => {
        const isCustom = typeof r === 'object' && r !== null;
        const content = isCustom ? r.content : r;
        const padding = isCustom && r.padding ? r.padding : '20px';
        const wantsDivider = i < rows.length - 1 && !(isCustom && r.noDivider);
        return `<div style="padding:${padding};">${content}</div>${wantsDivider ? '<div class="hp-divider"></div>' : ''}`;
      }).join('')
    : `<div style="padding:20px;color:var(--gray-dark);text-align:center;">Nothing here yet.</div>`;
  return `<div style="background:var(--app-surface);border-radius:24px;overflow:hidden;">
    <div style="display:flex;flex-direction:column;">${rowsHtml}</div>
  </div>`;
}

function chevronButton() {
  return `<div style="width:48px;height:48px;padding:4px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
    <img src="svg/hp-chevron-right.svg" width="24" height="24" alt="">
  </div>`;
}

function closeIcon(color, size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="${color}"/>
  </svg>`;
}

/* Matches Figma's "Button" component (node 122:14927) — Icon variant only
   (we have no "Combined" text+icon buttons in this prototype). Three sizes
   (S:32 / M:40 / L:48, all with 4px padding around the icon) and three
   styles (Primary: green-light bg, Secondary: white bg, Ghost: transparent). */
const BUTTON_ICON_SIZE = { S: 32, M: 40, L: 48 };

function iconButton({ size = 'M', style = 'Secondary', iconHtml, onclick = '', extra = '', activeBg = '' }) {
  const px = BUTTON_ICON_SIZE[size];
  const bg = style === 'Primary' ? 'var(--green-light)' : style === 'Secondary' ? 'var(--app-surface)' : 'transparent';
  const tapClass = activeBg ? ' hp-tap-color' : '';
  const tapVar = activeBg ? `--tap-bg:${activeBg};` : '';
  return `<button ${onclick ? `onclick="${onclick}"` : ''} class="${tapClass}" style="${tapVar}width:${px}px;height:${px}px;border-radius:999px;background:${bg};border:none;cursor:pointer;padding:4px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex-shrink:0;${extra}">
    ${iconHtml}
  </button>`;
}

/* Matches Figma's "Labels" component (node 244:6244) exactly — 10 fixed
   states across Progress/Range/Risk types, each with its own icon/bg/text
   color. Use the state's own key, don't invent new ones. */
const STATUS_LABELS = {
  done:       { text: 'Done',               bg: 'var(--green-lightest)',  color: 'var(--green-dark)',  icon: 'svg/hp-status-done.svg' },
  inProgress: { text: 'In progress',        bg: 'var(--yellow-lightest)', color: 'var(--yellow-dark)', icon: 'svg/hp-status-progress.svg' },
  cancelled:  { text: 'Cancelled',          bg: 'var(--red-lightest)',    color: 'var(--red-dark)',    icon: 'svg/hp-status-cancelled.svg' },
  within:     { text: 'Within range',       bg: 'var(--green-lightest)',  color: 'var(--green-dark)',  icon: 'svg/hp-status-within.svg' },
  below:      { text: 'Below range',        bg: 'var(--red-lightest)',    color: 'var(--red-dark)',    icon: 'svg/hp-status-below.svg' },
  above:      { text: 'Above range',        bg: 'var(--red-lightest)',    color: 'var(--red-dark)',    icon: 'svg/hp-status-above.svg' },
  aBitBelow:  { text: 'A bit below range',  bg: 'var(--yellow-lightest)', color: 'var(--yellow-dark)', icon: 'svg/hp-status-abitbelow.svg' },
  aBitAbove:  { text: 'A bit above range',  bg: 'var(--yellow-lightest)', color: 'var(--yellow-dark)', icon: 'svg/hp-status-abitabove.svg' },
  highRisk:   { text: 'High risk',          bg: 'var(--red-lightest)',    color: 'var(--red-dark)',    icon: 'svg/hp-status-risk-high.svg' },
  mediumRisk: { text: 'Medium risk',        bg: 'var(--yellow-lightest)', color: 'var(--yellow-dark)', icon: 'svg/hp-status-risk-medium.svg' },
};

/* Maps a lab observation's plain-English flag to a STATUS_LABELS key. */
const LAB_FLAG_KIND = {
  Normal: 'within',
  Low: 'below',
  High: 'above',
  'Slightly Low': 'aBitBelow',
  'Slightly High': 'aBitAbove',
};

function statusBadge(kind) {
  const s = STATUS_LABELS[kind] || STATUS_LABELS.done;
  return `<div style="background:${s.bg};display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:8px;flex-shrink:0;">
    <img src="${s.icon}" width="16" height="16" style="display:block;" alt="">
    <span class="text bold" style="color:${s.color};">${esc(s.text)}</span>
  </div>`;
}

/* icon + [title / subtitle? / date?] + trailing? — the shape shared by the
   Prescription / Sick Note / Allergy / Vitals card variants. */
function cardRow({ icon, iconSize = 48, iconFramed = false, title, titleColor = 'var(--app-text)', subtitle, subtitleColor = 'var(--gray-darkest)', subtitleBold = true, date, trailing }) {
  const iconHtml = !icon ? '' : iconFramed
    ? `<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><img src="${icon}" width="24" height="24" alt=""></div>`
    : `<img src="${icon}" width="${iconSize}" height="${iconSize}" alt="" style="flex-shrink:0;">`;
  return `<div style="display:flex;align-items:center;gap:12px;">
    ${iconHtml}
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">
      <div class="title" style="color:${titleColor};">${esc(title)}</div>
      ${subtitle ? `<div class="text ${subtitleBold ? 'bold' : 'regular'}" style="color:${subtitleColor};">${esc(subtitle)}</div>` : ''}
      ${date ? `<div class="text regular" style="color:var(--gray-dark);">${esc(date)}</div>` : ''}
    </div>
    ${trailing || ''}
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* Page shells                                                             */
/* ---------------------------------------------------------------------- */

function listPage({ category, title, rows, extraSections = [] }) {
  const c = CATEGORIES[category];

  return `
    <div style="min-height:100vh;padding-bottom:40px;">
      <div class="hp-section-content">
        <div style="position:relative;">
          <a href="#/home" onclick="goBack();return false;" class="hp-tap-color" style="--tap-bg:${c.lightest};position:absolute;left:0;top:0;z-index:10;width:64px;height:64px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;text-decoration:none;">
            ${backArrow(c.accent)}
          </a>
          <img src="${c.iconDark}" width="80" height="80" alt="" style="position:absolute;right:16px;top:16px;z-index:10;">
          ${waveTop(c.surface)}
          <div style="background:${c.surface};border-radius:0 0 20px 20px;height:146px;box-sizing:border-box;padding:24px;display:flex;flex-direction:column;justify-content:flex-end;margin-top:-1px;">
            <div class="header" style="color:${c.accent};">${esc(title)}</div>
          </div>
        </div>
        <div>
          ${sectionBox(rows)}
        </div>
        ${extraSections.filter((s) => s.length).map((s) => `<div style="margin-top:1px;">${sectionBox(s)}</div>`).join('')}
      </div>
    </div>`;
}

function detailPage({ category, title, badgeHtml, subtitleLeft, subtitleRight, chartHtml, cards, extraSections = [], qrIcon }) {
  const c = CATEGORIES[category];
  const extraRows = [];
  if (badgeHtml) extraRows.push(badgeHtml);
  if (chartHtml) extraRows.push(chartHtml);
  const allCards = [...extraRows, ...cards];

  /* location.hash is already the current detail route at render time (route()
     sets it before calling this), so this is a real deep link back to this
     exact record — scanning it lands here, not just on the app in general. */
  const shareUrl = `${location.origin}${location.pathname}?skip=1${location.hash}`;

  return `
    <div style="min-height:100vh;padding-bottom:40px;">
      <div class="hp-section-content">
        <div style="position:relative;">
          <a href="#/home" onclick="goBack();return false;" class="hp-tap-color" style="--tap-bg:${c.lightest};position:absolute;left:0;top:0;z-index:10;width:64px;height:64px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;text-decoration:none;">
            ${backArrow(c.accent)}
          </a>
          <button onclick="openQrModal('${esc(title)}', '${esc(shareUrl)}', '${qrIcon || c.icon}')" class="hp-tap-color" style="--tap-bg:${c.surface};position:absolute;right:16px;top:16px;z-index:10;width:40px;height:40px;border-radius:32px;background:${c.lightest};border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;">
            ${shareIcon(c.accent)}
          </button>
          ${waveTop(c.surface)}
          <div style="background:${c.surface};border-radius:0 0 20px 20px;height:146px;box-sizing:border-box;padding:24px;display:flex;flex-direction:column;justify-content:flex-end;gap:8px;margin-top:-1px;">
            <div class="header" style="color:${c.accent};">${esc(title)}</div>
            ${subtitleLeft ? `<div class="text bold" style="color:${c.accent};">${esc(subtitleLeft)}</div>` : ''}
            ${subtitleRight ? `<div class="text bold" style="color:${c.accent};">${esc(subtitleRight)}</div>` : ''}
          </div>
        </div>
        ${sectionBox(allCards)}
        ${extraSections.filter((rows) => rows.length).map((rows) => `<div style="margin-top:1px;">${sectionBox(rows)}</div>`).join('')}
      </div>
    </div>`;
}

/* Matches Figma's "What's going on?" AI-insight card on the Visit detail
   page — a gradient-tinted nested card (distinct from the plainer "AI
   Summary" block used on Lab Results) with an "AI generated" pill. The
   gradient drifts slowly via .hp-ai-card-bg's `transform` (see proto.css) —
   transform-only animation stays on the compositor thread, so it doesn't
   trigger layout/paint on every frame the way animating background-position
   directly would. */
function aiInsightCard(bodyText) {
  return `<div style="position:relative;overflow:hidden;border-radius:16px;background:#f3f1fa;">
    <div class="hp-ai-card-bg"></div>
    <div style="position:relative;z-index:1;padding:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">
        <span class="title" style="color:var(--lavender-darkest);">What's going on?</span>
        <img src="svg/hp-ai-label.svg" width="125" height="26" alt="AI generated" style="flex-shrink:0;">
      </div>
      <div class="text regular" style="color:var(--app-text);line-height:1.5;margin-bottom:10px;">${esc(bodyText)}</div>
      <div class="text small" style="color:var(--gray-dark);">AI can make mistakes. Check with your doctor.</div>
    </div>
  </div>`;
}

function soapRow(label, value) {
  return `<div>
    <div class="title" style="color:var(--app-text);margin-bottom:6px;">${esc(label)}</div>
    <div class="text regular" style="color:var(--gray-dark);line-height:1.5;">${esc(value)}</div>
  </div>`;
}

function infoRow(label, value) {
  return `<div style="display:flex;justify-content:space-between;gap:16px;padding:6px 0;">
    <span class="text regular" style="color:var(--gray-dark);">${esc(label)}</span>
    <span class="text bold" style="color:var(--app-text);text-align:right;">${esc(value)}</span>
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* Home                                                                    */
/* ---------------------------------------------------------------------- */

function renderHome() {
  const hasFamily = FAMILY_MEMBERS.length > 1;
  const familyItems = FAMILY_MEMBERS.filter((m) => !m.isMain).map((m, i, arr) => `
    <a href="#/home" onclick="closeFamilyPanel();return false;" style="display:flex;align-items:center;justify-content:space-between;background:var(--app-surface);padding:16px 24px;border-radius:${i === arr.length - 1 ? '4px 4px 24px 24px' : '4px'};text-decoration:none;overflow:hidden;">
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div class="title" style="color:var(--app-text);">${esc(m.name)}</div>
        <div style="display:flex;gap:4px;">
          <div style="background:var(--visits-base);height:28px;display:flex;align-items:center;padding:4px 12px;border-radius:24px;">
            <span class="text regular" style="color:var(--visits-accent);">born ${esc(m.birthYear)}</span>
          </div>
        </div>
      </div>
    </a>`).join('');

  const activityCard = (item) => {
    const m = ACTIVITY_META[item.category];
    return `
    <a href="${item.detailUrl}" style="text-decoration:none;display:block;width:min(58vw,200px);flex-shrink:0;border-radius:24px;overflow:hidden;">
      <div style="background:var(--app-surface);border-radius:24px;overflow:hidden;width:100%;height:172px;position:relative;">
        <div style="background:${m.surface};height:41px;position:relative;border-radius:16px 16px 0 0;display:flex;align-items:center;">
          <span class="text bold" style="padding-left:14px;color:${m.accent};">${esc(item.label)}</span>
          <img src="${m.icon}" width="40" height="40" alt="" style="position:absolute;right:8px;top:8px;z-index:2;">
        </div>
        <img src="${m.wave}" alt="" style="position:absolute;left:0;top:41px;width:100%;height:45px;display:block;">
        <div style="position:absolute;left:0;top:41px;right:0;bottom:0;padding:16px;box-sizing:border-box;display:flex;flex-direction:column;align-items:flex-start;">
          <div style="flex:1 1 0;min-height:0;width:100%;display:flex;flex-direction:column;justify-content:center;">
            <div class="title" style="color:var(--app-text);">${esc(item.title)}</div>
          </div>
          <div class="text regular" style="color:var(--gray-dark);flex-shrink:0;">${esc(item.date)}</div>
        </div>
      </div>
    </a>`;
  };

  const healthRow = (route, icon, label, count, size, isLast) => `
    <a href="${route}" class="hp-row" style="justify-content:space-between;gap:0;">
      <div style="display:flex;align-items:center;gap:16px;min-width:0;">
        <img src="${icon}" width="${size || 48}" height="${size || 48}" alt="" style="flex-shrink:0;">
        <span class="title" style="color:var(--app-text);">${esc(label)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
        ${count ? `<div class="text small hp-badge">${count}</div>` : ''}
        <img src="svg/hp-chevron-right.svg" width="24" height="24" alt="">
      </div>
    </a>
    ${isLast ? '' : '<div class="hp-divider"></div>'}`;

  return `
    <div style="min-height:100vh;padding-bottom:32px;">

      <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 16px 0 16px;">
        <div style="position:relative;">
          <div style="display:flex;align-items:center;gap:7px;">
            <span class="header" style="color:var(--app-text);">${esc(PATIENT.name)}</span>
            ${hasFamily ? iconButton({ size: 'M', style: 'Secondary', onclick: 'toggleFamilyDropdown()', iconHtml: '<img src="svg/hp-chevron-down.svg" width="24" height="24" alt="">' }) : ''}
          </div>
          <div id="family-panel-backdrop" onclick="closeFamilyPanel()" style="display:none;position:fixed;inset:0;background:rgba(10,57,34,0.08);backdrop-filter:blur(4px);z-index:100;opacity:0;"></div>
          <div id="family-panel" style="display:none;position:fixed;bottom:0;left:0;right:0;background:var(--app-base);border-radius:24px 24px 0 0;z-index:101;padding:32px;max-height:85vh;overflow-y:auto;box-sizing:border-box;transform:translateY(100%);transition:transform 0.3s ease;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
              <div class="header" style="color:var(--app-text);">Select profile</div>
              ${iconButton({ size: 'M', style: 'Secondary', onclick: 'closeFamilyPanel()', iconHtml: closeIcon('var(--app-text)') })}
            </div>
            <div style="display:flex;flex-direction:column;gap:2px;">
              <a href="#/home" onclick="closeFamilyPanel();return false;" style="display:flex;align-items:center;justify-content:space-between;background:var(--app-surface);padding:16px 24px;border-radius:24px 24px 4px 4px;text-decoration:none;overflow:hidden;">
                <div style="display:flex;flex-direction:column;gap:6px;">
                  <div class="title" style="color:var(--app-text);">${esc(FAMILY_MEMBERS[0].name)}</div>
                  <div style="display:flex;gap:4px;">
                    <div style="background:var(--visits-base);height:28px;display:flex;align-items:center;padding:4px 12px;border-radius:24px;">
                      <span class="text regular" style="color:var(--visits-accent);">born ${esc(FAMILY_MEMBERS[0].birthYear)}</span>
                    </div>
                  </div>
                </div>
                <img src="svg/icon-checkmark.svg" width="24" height="24" alt="">
              </a>
              ${familyItems}
            </div>
          </div>
        </div>
        ${iconButton({ size: 'L', style: 'Primary', onclick: 'openQrModal()', iconHtml: '<img src="svg/figma-icon-qr.svg" width="26" height="26" alt="">', activeBg: 'var(--green-base)' })}
      </div>

      <div style="display:flex;align-items:center;gap:8px;padding:32px 16px 12px;">
        <span class="title" style="color:var(--app-text);">Recents</span>
        <div class="text small hp-badge">8</div>
      </div>
      <div style="overflow-x:auto;padding:4px 0 0 16px;">
        <div style="display:flex;gap:11px;width:max-content;">
          ${RECENTS.map(activityCard).join('')}
          <div style="width:16px;flex-shrink:0;"></div>
        </div>
      </div>

      <div style="padding:0 16px;">
        <div class="title" style="color:var(--app-text);margin-bottom:12px;margin-top:32px;">Your Health</div>
        <div style="background:var(--app-surface);border-radius:24px;overflow:hidden;padding:8px 0;">
          ${healthRow('#/labresults', CATEGORIES.labresults.icon, 'Test Results', 8)}
          ${healthRow('#/vitals', CATEGORIES.vitals.icon, 'Vitals', 0)}
          ${healthRow('#/prescription', CATEGORIES.prescription.icon, 'Medications', 0)}
          ${healthRow('#/prescriptions', 'svg/hp-doc-prescription.svg', 'Prescriptions', 0)}
          ${healthRow('#/immunizations', CATEGORIES.immunizations.icon, 'Vaccinations', 0)}
          ${healthRow('#/visits', CATEGORIES.visits.icon, 'Visits', 2)}
          ${healthRow('#/documents', CATEGORIES.documents.icon, 'Documents', 8)}
          ${healthRow('#/allergies', CATEGORIES.allergies.icon, 'Allergies', 0)}
          ${healthRow('#/about', CATEGORIES.about.icon, 'About me', 0, 40, true)}
        </div>
      </div>

      <div style="text-align:center;margin-top:24px;padding-bottom:24px;">
        <a href="#/logout" class="text bold" style="color:var(--gray-base);text-decoration:none;">Log out</a>
      </div>
    </div>`;
}

/* Lets a bottom-sheet element (qr-modal / family-panel) be dragged down to
   dismiss, matching native mobile sheet behavior. Only engages once the
   touch has moved >8px downward (so ordinary taps/clicks on rows inside the
   sheet are untouched), and only when the sheet's own scroll is already at
   the top (so it doesn't hijack scrolling a long list). Idempotent per
   element instance — safe to call every time the sheet is opened, since the
   markup is re-created on each home-page render. */
function initSheetDrag(sheetId, closeFn) {
  const sheet = document.getElementById(sheetId);
  if (!sheet || sheet.dataset.dragBound) return;
  sheet.dataset.dragBound = '1';

  let startY = 0, active = false, dragging = false;

  sheet.addEventListener('touchstart', (e) => {
    if (sheet.scrollTop > 0) { active = false; return; }
    active = true;
    dragging = false;
    startY = e.touches[0].clientY;
  }, { passive: true });

  sheet.addEventListener('touchmove', (e) => {
    if (!active) return;
    const delta = e.touches[0].clientY - startY;
    if (!dragging) {
      if (delta > 8) { dragging = true; sheet.style.transition = 'none'; }
      else if (delta < 0) { active = false; return; }
      else return;
    }
    e.preventDefault();
    sheet.style.transform = `translateY(${delta}px)`;
  }, { passive: false });

  function finish(e) {
    if (!active) return;
    active = false;
    if (!dragging) return;
    dragging = false;
    sheet.style.transition = 'transform 0.3s ease';
    const lastY = (e.changedTouches && e.changedTouches[0].clientY) || startY;
    const delta = Math.max(0, lastY - startY);
    if (delta > 100) closeFn();
    else sheet.style.transform = 'translateY(0)';
  }
  sheet.addEventListener('touchend', finish);
  sheet.addEventListener('touchcancel', finish);
}

/* Backdrops fade in/out in step with their sheet's slide, instead of
   snapping visible/hidden — same 300ms as the sheet transform below. */
function showBackdrop(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'block';
  el.style.transition = 'none';
  el.style.opacity = '0';
  void el.offsetWidth; // force reflow so the transition below animates
  el.style.transition = 'opacity 0.3s ease';
  el.style.opacity = '1';
}
function hideBackdrop(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.transition = 'opacity 0.3s ease';
  el.style.opacity = '0';
  setTimeout(() => { el.style.display = 'none'; }, 300);
}

window.toggleFamilyDropdown = function () {
  const panel = document.getElementById('family-panel');
  if (!panel) return;
  const isOpen = panel.style.display === 'block';
  if (isOpen) { window.closeFamilyPanel(); return; }
  initSheetDrag('family-panel', window.closeFamilyPanel);
  showBackdrop('family-panel-backdrop');
  panel.style.display = 'block';
  void panel.offsetWidth; // force reflow so the transform transition below animates
  panel.style.transform = 'translateY(0)';
};
window.closeFamilyPanel = function () {
  const panel = document.getElementById('family-panel');
  if (!panel) return;
  panel.style.transition = 'transform 0.3s ease';
  panel.style.transform = 'translateY(100%)';
  hideBackdrop('family-panel-backdrop');
  setTimeout(() => { panel.style.display = 'none'; }, 300);
};
/* Shared QR share sheet, reused across the home page ("share my whole record")
   and every detail page ("share this record"). Content is filled in fresh on
   each open since it differs per page — title, the link the QR encodes, and
   the icon shown in its center (category icon instead of the app logo). */
window.openQrModal = function (title, data, icon) {
  const modal = document.getElementById('qr-modal');
  initSheetDrag('qr-modal', window.closeQrModal);
  showBackdrop('qr-backdrop');
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  void modal.offsetWidth; // force reflow so the transform transition below animates
  modal.style.transform = 'translateY(0)';

  const titleEl = document.getElementById('qr-modal-title');
  if (titleEl) titleEl.textContent = title || PATIENT.name;

  const pinEl = document.getElementById('qr-modal-pin');
  if (pinEl) pinEl.innerHTML = '3225'.split('').map((d) => `<span class="header" style="background:var(--app-surface);color:var(--app-text);width:44px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;">${d}</span>`).join('');

  const container = document.getElementById('qrcode-modal');
  container.innerHTML = '';
  try {
    // Size to the card's actual available width instead of a fixed px value —
    // on narrower phones (e.g. 390px-wide screens) a hardcoded 316px QR was
    // wider than the card's content box, so it overflowed unevenly on one side.
    const qrSize = container.clientWidth || 316;
    new QRCodeStyling({
      width: qrSize, height: qrSize, type: 'svg',
      data: data || 'https://wa.me/15550100000?text=healthpass-demo-share-3225',
      dotsOptions: { color: '#000000', type: 'rounded' },
      cornersSquareOptions: { color: '#000000', type: 'extra-rounded' },
      cornersDotOptions: { color: '#000000', type: 'dot' },
      backgroundOptions: { color: '#ffffff' },
      image: icon || 'svg/logo-healthpass.svg?v=35',
      imageOptions: { crossOrigin: 'anonymous', margin: 6, imageSize: 0.4, hideBackgroundDots: true },
    }).append(container);
  } catch (e) {
    container.innerHTML = '<span style="color:var(--gray-base);">QR preview unavailable</span>';
  }
};

window.closeQrModal = function () {
  const modal = document.getElementById('qr-modal');
  modal.style.transition = 'transform 0.3s ease';
  modal.style.transform = 'translateY(100%)';
  document.body.style.overflow = '';
  hideBackdrop('qr-backdrop');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
};

/* ---------------------------------------------------------------------- */
/* Section renderers                                                      */
/* ---------------------------------------------------------------------- */

function renderVitalsList() {
  const rows = VITALS.map((v) => `
    <a href="#/vitals/${v.id}" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:12px;">
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">
        <div class="text regular" style="color:var(--gray-darkest);">${esc(v.name)}</div>
        <div class="header" style="font-size:24px;line-height:1;color:var(--app-text);">${esc(v.value)}</div>
        <div class="text regular" style="color:var(--gray-dark);">${esc(v.date)}</div>
      </div>
      ${chevronButton()}
    </a>`);
  return listPage({ category: 'vitals', title: 'Vitals', rows });
}

function renderVitalsDetail(id) {
  const v = VITALS.find((x) => x.id === id);
  if (!v) return renderVitalsList();
  const max = Math.max(...v.history.map(([, val]) => parseFloat(val)));
  const chart = `<div class="hp-bar-chart">
    ${v.history.map(([label, val]) => {
      const h = Math.max(12, Math.round((parseFloat(val) / max) * 80));
      return `<div class="hp-bar-col"><div class="hp-bar" style="height:${h}px;background:var(--vitals-accent);"></div><div class="hp-bar-label">${esc(label)}</div></div>`;
    }).join('')}
  </div>`;
  const cards = [`
    ${infoRow('Latest value', v.value)}
    ${infoRow('Status', v.status)}
    ${infoRow('Recorded', v.date)}
  `];
  return detailPage({
    category: 'vitals', title: v.name, badgeHtml: statusBadge(v.status === 'Normal' ? 'within' : 'done'),
    subtitleLeft: 'Trend (last 4 readings)', subtitleRight: '', chartHtml: chart,
    cards,
  });
}

function renderPrescriptionList() {
  /* Surfaces the 2 most recent prescription documents at the top (same row
     style as the Documents/Prescriptions lists), with the ongoing-regimen
     Medications list as its own section below — mirrors the Visit detail
     page's two-section layout (visit info + its documents). */
  const rxRows = DOCUMENTS.filter((d) => d.kind === 'Prescription').slice(0, 2).map((d) => `
    <a href="#/documents/${d.id}" style="text-decoration:none;color:inherit;display:block;">
      ${cardRow({ icon: docIcon(d.kind), title: d.provider, subtitle: d.relatedVisit, date: d.date, trailing: chevronButton() })}
    </a>`);
  const medRows = MEDICATIONS.map((m) => `
    <a href="#/prescription/${m.id}" style="text-decoration:none;color:inherit;display:block;">
      ${cardRow({
        title: m.name,
        subtitle: m.dosage,
        subtitleColor: 'var(--gray-dark)',
        subtitleBold: false,
        trailing: chevronButton(),
      })}
    </a>`);
  return listPage({ category: 'prescription', title: 'Medications', rows: rxRows, extraSections: [medRows] });
}

function renderPrescriptionDetail(id) {
  const m = MEDICATIONS.find((x) => x.id === id);
  if (!m) return renderPrescriptionList();
  const cards = [`
    ${infoRow('Form', m.form)}
    ${infoRow('Quantity', m.quantity)}
    ${infoRow('Refills remaining', m.refills)}
    ${infoRow('Prescriber', `${m.prescriber} at Turn Clinic`)}
  `, `
    <div class="text small" style="color:var(--gray-dark);text-transform:uppercase;margin-bottom:6px;">Instructions</div>
    <div class="text regular" style="color:var(--app-text);">${esc(m.dosage)}</div>
  `];
  return detailPage({
    category: 'prescription', title: m.name, badgeHtml: statusBadge(m.status === 'Active' ? 'inProgress' : 'done'),
    subtitleLeft: 'Prescribed', subtitleRight: m.authoredDate, chartHtml: '',
    cards,
  });
}

function renderLabResultsList() {
  const rows = LAB_RESULTS.map((r) => {
    const inProgress = r.status !== 'Final';
    const row = cardRow({
      title: r.name,
      date: r.reportDate,
      trailing: inProgress ? statusBadge('inProgress') : chevronButton(),
    });
    /* In-progress results have no detail worth showing (no observations
       yet) — render as a plain row instead of a link so it's not clickable. */
    return inProgress
      ? `<div style="color:inherit;">${row}</div>`
      : `<a href="#/labresults/${r.id}" style="text-decoration:none;color:inherit;display:block;">${row}</a>`;
  });
  return listPage({ category: 'labresults', title: 'Test Results', rows });
}

function renderLabResultsDetail(id) {
  const r = LAB_RESULTS.find((x) => x.id === id);
  if (!r) return renderLabResultsList();
  const obsRows = r.observations.map((o, i) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:20px;${i < r.observations.length - 1 ? 'border-bottom:1px solid rgba(0,0,0,0.06);' : ''}">
      <div>
        <div class="text regular" style="color:var(--gray-dark);">${esc(o.name)}</div>
        <div class="title" style="color:var(--app-text);">${esc(o.value)}</div>
      </div>
      ${statusBadge(LAB_FLAG_KIND[o.flag] || 'within')}
    </div>`).join('');
  const cards = [{ content: obsRows, padding: '0' }];
  return detailPage({
    category: 'labresults', title: r.name, badgeHtml: '',
    subtitleLeft: '', subtitleRight: r.reportDate, chartHtml: '',
    cards,
  });
}

function renderAllergiesList() {
  const rows = ALLERGIES.map((a) => cardRow({
    title: a.substance,
    subtitle: a.type,
    trailing: statusBadge(a.criticality === 'High' ? 'highRisk' : 'mediumRisk'),
  }));
  return listPage({ category: 'allergies', title: 'Allergies', rows });
}

function renderImmunizationsList() {
  const rows = IMMUNIZATIONS.map((v) => `
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">
        <div class="title" style="color:var(--app-text);">${esc(v.vaccine)}</div>
        <div class="text regular" style="color:var(--gray-dark);">${esc(v.date)}</div>
      </div>
    </div>`);
  return listPage({ category: 'immunizations', title: 'Vaccinations', rows });
}

function dateBadgeParts(dateStr) {
  const m = dateStr.match(/^([A-Za-z]+)\s+(\d+)/);
  return m ? { month: m[1], day: m[2] } : { month: '', day: dateStr };
}

function renderVisitsList() {
  const rows = VISITS.map((v) => {
    const { month, day } = dateBadgeParts(v.date);
    const dateBadge = `<div style="background:var(--lavender-lightest);border-radius:8px;width:48px;height:48px;position:relative;overflow:hidden;flex-shrink:0;">
      <div style="background:var(--lavender-darkest);height:18px;display:flex;align-items:center;justify-content:center;">
        <span style="color:var(--white);font-size:12px;font-weight:500;line-height:16px;">${esc(month)}</span>
      </div>
      <div style="height:30px;display:flex;align-items:center;justify-content:center;">
        <span style="color:var(--lavender-darkest);font-size:20px;line-height:24px;">${esc(day)}</span>
      </div>
    </div>`;
    return `
    <a href="#/visits/${v.id}" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:16px;">
      ${dateBadge}
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">
        <div class="title" style="color:var(--app-text);">${esc(v.title)}</div>
        <div class="text regular" style="color:var(--gray-darkest);">${esc(v.provider)} at Turn Clinic</div>
      </div>
      ${chevronButton()}
    </a>`;
  });
  return listPage({ category: 'visits', title: 'Visits', rows });
}

function renderVisitsDetail(id) {
  const v = VISITS.find((x) => x.id === id);
  if (!v) return renderVisitsList();
  const cards = [
    { content: aiInsightCard(v.aiSummary), padding: '8px 8px 12px', noDivider: true },
    soapRow('What you reported', v.soap.reported),
    soapRow('Examination', v.soap.examination),
    soapRow('Diagnosis', v.soap.diagnosis),
    soapRow('Recommendation', v.soap.recommendation),
  ];
  const documentRows = v.documents.map((d) => `
    <a href="#/documents" style="text-decoration:none;color:inherit;display:block;">
      ${cardRow({ icon: docIcon(d.kind), title: d.kind, date: d.date, trailing: chevronButton() })}
    </a>`);
  return detailPage({
    category: 'visits', title: v.title, badgeHtml: '', subtitleLeft: `${v.provider} at Turn Clinic`, subtitleRight: v.date,
    chartHtml: '', cards, extraSections: [documentRows],
  });
}

function renderAbout() {
  const cards = [`
    ${infoRow('Date of birth', `${PATIENT.birthDate} (${PATIENT.age})`)}
    ${infoRow('Gender', PATIENT.gender)}
    ${infoRow('Address', PATIENT.address)}
    ${infoRow('Mobile', PATIENT.mobile)}
    ${infoRow('Patient ID', PATIENT.patientId)}
  `];
  return detailPage({
    category: 'about', title: PATIENT.name, badgeHtml: '', subtitleLeft: 'Patient profile', subtitleRight: '',
    chartHtml: '', cards,
  });
}

function renderDocuments() {
  const rows = DOCUMENTS.map((d) => `
    <a href="#/documents/${d.id}" style="text-decoration:none;color:inherit;display:block;">
      ${cardRow({ icon: docIcon(d.kind), title: d.kind, subtitle: d.relatedVisit, date: d.date, trailing: chevronButton() })}
    </a>`);
  return listPage({ category: 'documents', title: 'Documents', rows });
}

/* Actual prescription slips (documents), distinct from the ongoing-regimen
   entries under Medications — reuses the Documents detail page/route since
   these ARE Document records, just pre-filtered to kind === 'Prescription'. */
function renderPrescriptionDocsList() {
  const rows = DOCUMENTS.filter((d) => d.kind === 'Prescription').map((d) => `
    <a href="#/documents/${d.id}" style="text-decoration:none;color:inherit;display:block;">
      ${cardRow({ icon: docIcon(d.kind), title: d.provider, subtitle: d.relatedVisit, date: d.date, trailing: chevronButton() })}
    </a>`);
  return listPage({ category: 'prescription', title: 'Prescriptions', rows });
}

/* Prescription documents use the yellow "prescription" category scheme since
   prescriptions are also real in-app navigation (Medications); every other
   document kind uses the plain gray "documents" scheme. */
function renderDocumentDetail(id) {
  const d = DOCUMENTS.find((x) => x.id === id);
  if (!d) return renderDocuments();
  const category = d.kind === 'Prescription' ? 'prescription' : 'documents';
  const actionRow = (label, iconHtml) => `<div style="display:flex;align-items:center;justify-content:space-between;">
    <span class="title" style="color:var(--app-text);">${esc(label)}</span>
    ${iconHtml}
  </div>`;
  const kindLower = d.kind.toLowerCase();
  const cards = [
    `<div class="text regular" style="color:var(--app-text);line-height:1.5;">${esc(d.message)}</div>`,
    actionRow(`View ${kindLower}`, eyeIcon('var(--gray-dark)')),
    actionRow(`Download ${kindLower}`, downloadIcon('var(--gray-dark)')),
    actionRow(`Share ${kindLower}`, shareIcon('var(--gray-dark)')),
  ];
  return detailPage({
    category, title: d.kind, badgeHtml: '', subtitleLeft: d.provider, subtitleRight: d.date,
    chartHtml: '', cards, qrIcon: docIcon(d.kind),
  });
}

/* ---------------------------------------------------------------------- */
/* Router                                                                  */
/* ---------------------------------------------------------------------- */

/* Real "go to whatever screen I actually came from" back navigation — a
   plain array of the hashes visited this session (not the depth guess
   navDirection() uses for slide-transition direction). A deep link (QR
   scan) or a Recents card that jumps straight from home to a detail page
   leaves nothing "under" the current page, so goBack() falls back to home
   instead of guessing a category list the user never actually visited. */
let hpNavStack = [];
let hpSuppressPush = false;

function trackNavStack(hash) {
  if (hpSuppressPush) { hpSuppressPush = false; return; }
  if (hpNavStack[hpNavStack.length - 1] !== hash) hpNavStack.push(hash);
}

window.goBack = function () {
  if (hpNavStack.length > 1) {
    hpNavStack.pop();
    hpSuppressPush = true;
    location.hash = '#/' + hpNavStack[hpNavStack.length - 1];
  } else {
    hpSuppressPush = true;
    hpNavStack = ['home'];
    location.hash = '#/home';
  }
};

function route() {
  const hash = (location.hash || '#/home').replace(/^#\/?/, '');
  const [section, id] = hash.split('/');

  if (section === 'logout') {
    hpNavStack = [];
    sessionStorage.removeItem('hp_unlocked');
    window.showPinScreen();
    return;
  }

  trackNavStack(hash);

  let html;
  switch (section) {
    case 'vitals':        html = id ? renderVitalsDetail(id) : renderVitalsList(); break;
    case 'prescription':  html = id ? renderPrescriptionDetail(id) : renderPrescriptionList(); break;
    case 'prescriptions':  html = renderPrescriptionDocsList(); break;
    case 'labresults':     html = id ? renderLabResultsDetail(id) : renderLabResultsList(); break;
    case 'allergies':      html = renderAllergiesList(); break;
    case 'immunizations':  html = renderImmunizationsList(); break;
    case 'visits':         html = id ? renderVisitsDetail(id) : renderVisitsList(); break;
    case 'about':          html = renderAbout(); break;
    case 'documents':      html = id ? renderDocumentDetail(id) : renderDocuments(); break;
    case 'home':
    default:               html = renderHome();
  }

  const depth = section === 'home' ? 0 : (id ? 2 : 1);
  swapPage(html, navDirection(depth));
  window.scrollTo(0, 0);

  /* Section pages tint the whole body (not just #hp-app) so mobile
     overscroll/bounce reveals the category's lightest color instead of a
     flat cream — body is a single global element, so this has to be set
     imperatively per route rather than in the page's own markup. */
  const cat = CATEGORIES[section];
  document.body.style.background = cat ? cat.lightest : 'var(--app-base)';
}

/* Depth-based back/forward detection: home=0, list=1, detail=2. Every list
   page is only reachable from home, so comparing depth (no full history
   stack needed) is enough to tell a drill-down from a back-arrow tap. */
let hpNavDepth = -1;
function navDirection(depth) {
  const direction = hpNavDepth === -1 ? 'none' : depth > hpNavDepth ? 'forward' : depth < hpNavDepth ? 'back' : 'none';
  hpNavDepth = depth;
  return direction;
}

/* Slides the outgoing page out and the incoming page in, iOS-nav-style:
   forward = new page enters from the right, old page exits to the left;
   back = new page enters from the left, old page exits to the right. */
function swapPage(html, direction) {
  const app = document.getElementById('hp-app');
  const oldPage = app.firstElementChild;
  const newPage = document.createElement('div');
  newPage.className = 'hp-page';
  newPage.innerHTML = html;

  if (!oldPage || direction === 'none') {
    app.innerHTML = '';
    newPage.classList.add('hp-proto-fade');
    app.appendChild(newPage);
    return;
  }

  const oldH = oldPage.offsetHeight;
  app.style.position = 'relative';
  app.style.overflow = 'hidden';
  oldPage.style.position = 'absolute';
  oldPage.style.top = '0';
  oldPage.style.left = '0';
  oldPage.style.width = '100%';
  newPage.style.position = 'absolute';
  newPage.style.top = '0';
  newPage.style.left = '0';
  newPage.style.width = '100%';
  newPage.style.transform = `translateX(${direction === 'forward' ? '100%' : '-100%'})`;
  app.appendChild(newPage);

  const newH = newPage.scrollHeight;
  app.style.height = oldH + 'px';
  void newPage.offsetHeight; // force reflow so the transition below animates from these start values

  requestAnimationFrame(() => {
    app.style.transition = 'height 0.28s ease';
    app.style.height = Math.max(oldH, newH) + 'px';
    oldPage.style.transition = 'transform 0.28s ease';
    newPage.style.transition = 'transform 0.28s ease';
    oldPage.style.transform = `translateX(${direction === 'forward' ? '-100%' : '100%'})`;
    newPage.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    oldPage.remove();
    app.style.position = '';
    app.style.overflow = '';
    app.style.height = '';
    app.style.transition = '';
    newPage.style.position = '';
    newPage.style.top = '';
    newPage.style.left = '';
    newPage.style.width = '';
    newPage.style.transform = '';
    newPage.style.transition = '';
  }, 300);
}

window.addEventListener('hashchange', route);

window.hpBootApp = function () {
  if (!location.hash) location.hash = '#/home';
  route();
};
