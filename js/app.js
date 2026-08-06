/* HealthPass clickable prototype — single-page app, hash-routed, fully client-side.
   Every screen is rendered from js/data.js. There is no server and no network call. */

/* iOS Safari only honors :active on <a>/<div> if *something* in the document
   is listening for touch events — otherwise it skips straight past it, no
   flash at all. This listener does nothing; its only job is to turn :active
   on. (Buttons don't need this — :active already works on form controls.) */
document.addEventListener('touchstart', function () {}, { passive: true });

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

/* Per-kind document icons (Figma "Icon=<kind>, Background=Light" export set).
   Falls back to the generic document icon for any kind not in this list. */
const DOCUMENT_ICONS = {
  'Visit summary': 'svg/hp-doc-visit-summary.svg',
  'Lab report':     'svg/hp-doc-lab-results.svg',
  'Prescription':   'svg/hp-doc-prescription.svg',
  'Referral':        'svg/hp-doc-referral.svg',
  'Sick note':       'svg/hp-doc-sicknote.svg',
};
function docIcon(kind) {
  return DOCUMENT_ICONS[kind] || 'svg/hp-doc-generic.svg';
}

/* Recents activity cards use their own icon/wave art + colors, distinct from the
   Your Health row icons above — matches the Figma "Activity" component variants. */
const ACTIVITY_META = {
  visit:        { surface: 'var(--lavender-light)', accent: 'var(--lavender-darkest)', icon: 'svg/hp-visits-dark.svg',       wave: 'svg/figma-wave-visit.svg' },
  prescription: { surface: 'var(--yellow-light)',    accent: 'var(--yellow-darkest)',   icon: 'svg/hp-medications-dark.svg',  wave: 'svg/figma-wave-prescription.svg' },
  allergy:      { surface: 'var(--green-light)',     accent: 'var(--green-darkest)',    icon: 'svg/hp-allergies-dark.svg',    wave: 'svg/figma-wave-allergy.svg' },
  labresult:    { surface: 'var(--blue-light)',      accent: 'var(--blue-darkest)',     icon: 'svg/hp-lab-results-dark.svg',  wave: 'svg/figma-wave-labresult.svg' },
  sicknote:     { surface: 'var(--pink-light)',       accent: 'var(--pink-darkest)',    icon: 'svg/hp-doc-sicknote.svg',      wave: 'svg/figma-wave-sicknote.svg' },
};

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Native 64x64 export — the clip-path already insets the glyph 16px on every
   side, so placing this flush at left:0/top:0 reproduces Figma's spacing
   with no extra offset math needed. */
function backArrow(color) {
  return `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.7587 4.31291e-07L8 9.08128e-07C8.55229 9.08128e-07 9 0.447716 9 1C9 1.55229 8.55229 2 8 2H5.8C4.94342 2 4.36113 2.00078 3.91104 2.03755C3.47262 2.07337 3.24842 2.1383 3.09202 2.21799C2.7157 2.40973 2.40973 2.7157 2.21799 3.09202C2.1383 3.24842 2.07337 3.47262 2.03755 3.91104C2.00078 4.36113 2 4.94342 2 5.8V14.2C2 15.0566 2.00078 15.6389 2.03755 16.089C2.07337 16.5274 2.1383 16.7516 2.21799 16.908C2.40973 17.2843 2.7157 17.5903 3.09202 17.782C3.24842 17.8617 3.47262 17.9266 3.91104 17.9624C4.36113 17.9992 4.94342 18 5.8 18H14.2C15.0566 18 15.6389 17.9992 16.089 17.9624C16.5274 17.9266 16.7516 17.8617 16.908 17.782C17.2843 17.5903 17.5903 17.2843 17.782 16.908C17.8617 16.7516 17.9266 16.5274 17.9624 16.089C17.9992 15.6389 18 15.0566 18 14.2V12C18 11.4477 18.4477 11 19 11C19.5523 11 20 11.4477 20 12V14.2413C20 15.0463 20 15.7106 19.9558 16.2518C19.9099 16.8139 19.8113 17.3306 19.564 17.816C19.1805 18.5686 18.5686 19.1805 17.816 19.564C17.3306 19.8113 16.8139 19.9099 16.2518 19.9558C15.7106 20 15.0463 20 14.2413 20H5.75868C4.95372 20 4.28936 20 3.74817 19.9558C3.18608 19.9099 2.66937 19.8113 2.18404 19.564C1.43139 19.1805 0.819468 18.5686 0.435975 17.816C0.188684 17.3306 0.0901197 16.8139 0.0441945 16.2518C-2.28137e-05 15.7106 -1.23241e-05 15.0463 4.31291e-07 14.2413V5.7587C-1.23241e-05 4.95373 -2.28137e-05 4.28937 0.0441945 3.74817C0.0901197 3.18608 0.188684 2.66937 0.435975 2.18404C0.819468 1.43139 1.43139 0.819468 2.18404 0.435975C2.66937 0.188684 3.18608 0.0901197 3.74817 0.0441945C4.28937 -2.28137e-05 4.95373 -1.23241e-05 5.7587 4.31291e-07ZM15.2929 0.292894C15.6834 -0.0976302 16.3166 -0.0976302 16.7071 0.292894L19.7071 3.29289C20.0976 3.68342 20.0976 4.31658 19.7071 4.70711L16.7071 7.70711C16.3166 8.09763 15.6834 8.09763 15.2929 7.70711C14.9024 7.31658 14.9024 6.68342 15.2929 6.29289L16.5858 5H15.8C14.9434 5 14.3611 5.00078 13.911 5.03755C13.4726 5.07337 13.2484 5.1383 13.092 5.21799C12.7157 5.40973 12.4097 5.7157 12.218 6.09202C12.1383 6.24842 12.0734 6.47262 12.0376 6.91104C12.0008 7.36113 12 7.94342 12 8.8V10C12 10.5523 11.5523 11 11 11C10.4477 11 10 10.5523 10 10V8.75873C9.99999 7.95374 9.99998 7.28938 10.0442 6.74818C10.0901 6.18608 10.1887 5.66937 10.436 5.18404C10.8195 4.43139 11.4314 3.81947 12.184 3.43597C12.6694 3.18868 13.1861 3.09012 13.7482 3.04419C14.2894 2.99998 14.9537 2.99999 15.7587 3L16.5858 3L15.2929 1.70711C14.9024 1.31658 14.9024 0.683418 15.2929 0.292894Z" fill="${color}"/>
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

function iconButton({ size = 'M', style = 'Secondary', iconHtml, onclick = '', extra = '' }) {
  const px = BUTTON_ICON_SIZE[size];
  const bg = style === 'Primary' ? 'var(--green-light)' : style === 'Secondary' ? 'var(--app-surface)' : 'transparent';
  return `<button ${onclick ? `onclick="${onclick}"` : ''} style="width:${px}px;height:${px}px;border-radius:999px;background:${bg};border:none;cursor:pointer;padding:4px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex-shrink:0;${extra}">
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

function statusBadge(kind) {
  const s = STATUS_LABELS[kind] || STATUS_LABELS.done;
  return `<div style="background:${s.bg};display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:8px;flex-shrink:0;">
    <img src="${s.icon}" style="height:16px;width:auto;display:block;" alt="">
    <span class="text bold" style="color:${s.color};">${esc(s.text)}</span>
  </div>`;
}

/* icon + [title / subtitle? / date?] + trailing? — the shape shared by the
   Prescription / Sick Note / Allergy / Vitals card variants. */
function cardRow({ icon, iconSize = 48, title, titleColor = 'var(--app-text)', subtitle, date, trailing }) {
  return `<div style="display:flex;align-items:center;gap:12px;">
    ${icon ? `<img src="${icon}" width="${iconSize}" height="${iconSize}" alt="" style="flex-shrink:0;">` : ''}
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">
      <div class="title" style="color:${titleColor};">${esc(title)}</div>
      ${subtitle ? `<div class="text bold" style="color:var(--gray-darkest);">${esc(subtitle)}</div>` : ''}
      ${date ? `<div class="text regular" style="color:var(--gray-dark);">${esc(date)}</div>` : ''}
    </div>
    ${trailing || ''}
  </div>`;
}

/* ---------------------------------------------------------------------- */
/* Page shells                                                             */
/* ---------------------------------------------------------------------- */

function listPage({ category, title, rows }) {
  const c = CATEGORIES[category];

  return `
    <div style="min-height:100vh;padding-bottom:40px;">
      <div class="hp-section-content">
        <div style="position:relative;">
          <a href="#/home" onclick="goBack();return false;" style="position:absolute;left:0;top:0;z-index:10;width:64px;height:64px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;text-decoration:none;">
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
      </div>
    </div>`;
}

function detailPage({ category, title, badgeHtml, subtitleLeft, subtitleRight, chartHtml, cards, extraSections = [] }) {
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
          <a href="#/home" onclick="goBack();return false;" style="position:absolute;left:0;top:0;z-index:10;width:64px;height:64px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;text-decoration:none;">
            ${backArrow(c.accent)}
          </a>
          <button onclick="openQrModal('${esc(title)}', '${esc(shareUrl)}', '${c.icon}')" style="position:absolute;right:16px;top:16px;z-index:10;width:40px;height:40px;border-radius:32px;background:${c.lightest};border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;">
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
    <a href="#/home" onclick="closeFamilyPanel();return false;" style="display:flex;align-items:center;justify-content:space-between;background:var(--app-surface);height:100px;padding:24px;border-radius:${i === arr.length - 1 ? '4px 4px 24px 24px' : '4px'};text-decoration:none;overflow:hidden;">
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
              <a href="#/home" onclick="closeFamilyPanel();return false;" style="display:flex;align-items:center;justify-content:space-between;background:var(--app-surface);height:100px;padding:24px;border-radius:24px 24px 4px 4px;text-decoration:none;overflow:hidden;">
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
        ${iconButton({ size: 'L', style: 'Primary', onclick: 'openQrModal()', iconHtml: '<img src="svg/figma-icon-qr.svg" width="24" height="24" alt="">' })}
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
      image: icon || 'svg/logo-healthpass.svg?v=21',
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
    <a href="#/vitals/${v.id}" style="text-decoration:none;color:inherit;display:block;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;">
          <div class="text regular" style="color:var(--gray-darkest);">${esc(v.name)}</div>
          <div class="header" style="font-size:24px;line-height:1;color:var(--app-text);">${esc(v.value)}</div>
          <div class="text regular" style="color:var(--gray-dark);">${esc(v.date)}</div>
        </div>
      </div>
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
  const rows = MEDICATIONS.map((m) => `
    <a href="#/prescription/${m.id}" style="text-decoration:none;color:inherit;display:block;">
      ${cardRow({
        title: m.name,
        subtitle: m.dosage,
        date: m.authoredDate,
        trailing: chevronButton(),
      })}
    </a>`);
  return listPage({ category: 'prescription', title: 'Medications', rows });
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
    return `
    <a href="#/labresults/${r.id}" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:12px;">
      <div style="flex:1;min-width:0;">
        <div class="title" style="color:var(--app-text);">${esc(r.name)}</div>
      </div>
      ${inProgress ? statusBadge('inProgress') : chevronButton()}
    </a>`;
  });
  return listPage({ category: 'labresults', title: 'Test Results', rows });
}

function renderLabResultsDetail(id) {
  const r = LAB_RESULTS.find((x) => x.id === id);
  if (!r) return renderLabResultsList();
  const obsRows = r.observations.map((o) => `
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
      <span class="text regular" style="color:var(--app-text);">${esc(o.name)}</span>
      <div style="text-align:right;">
        <div class="text bold" style="color:var(--app-text);">${esc(o.value)}</div>
        <div class="text small" style="color:var(--gray-dark);">ref: ${esc(o.range)}</div>
      </div>
    </div>`).join('');
  const cards = [
    `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
      <img src="svg/ai-gradient.svg" width="20" height="20" alt="">
      <span class="text bold" style="color:var(--app-text);">AI Summary</span>
    </div>
    <div class="text regular" style="color:var(--gray-dark);">${esc(r.aiSummary)}</div>`,
    obsRows,
  ];
  return detailPage({
    category: 'labresults', title: r.name, badgeHtml: statusBadge(r.status === 'Final' ? 'done' : 'inProgress'),
    subtitleLeft: r.category, subtitleRight: r.reportDate, chartHtml: '',
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
    <a href="#/visits/${v.id}" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:12px;">
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
      ${cardRow({ icon: docIcon(d.kind), title: d.kind, trailing: chevronButton() })}
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
  const rows = DOCUMENTS.map((d) => cardRow({
    icon: CATEGORIES.documents.icon,
    title: d.name,
    subtitle: d.kind,
    date: d.date,
    trailing: chevronButton(),
  }));
  return listPage({ category: 'documents', title: 'Documents', rows });
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
    case 'labresults':     html = id ? renderLabResultsDetail(id) : renderLabResultsList(); break;
    case 'allergies':      html = renderAllergiesList(); break;
    case 'immunizations':  html = renderImmunizationsList(); break;
    case 'visits':         html = id ? renderVisitsDetail(id) : renderVisitsList(); break;
    case 'about':          html = renderAbout(); break;
    case 'documents':      html = renderDocuments(); break;
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
