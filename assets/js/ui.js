/* ახალი ერა — საერთო დამხმარეები, ჰედერი, ფუტერი */
(function () {
  'use strict';

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lines = (t) => String(t || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const paras = (t) => String(t || '').trim().split(/\n\s*\n/).filter(Boolean).map(p => '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>').join('');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const MONTHS = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];
  const parse = (d) => { if (!d) return null; const [y, m, day] = d.split('-').map(Number); return new Date(y, m - 1, day); };

  function campDates(c, withYear = true) {
    const s = parse(c.start), e = parse(c.end);
    if (!s) return c.datesText || 'თარიღი მალე';
    const y = withYear ? ', ' + (e || s).getFullYear() : '';
    if (!e || +e === +s) return s.getDate() + ' ' + MONTHS[s.getMonth()] + y;
    if (s.getMonth() === e.getMonth()) return s.getDate() + '–' + e.getDate() + ' ' + MONTHS[e.getMonth()] + y;
    return s.getDate() + ' ' + MONTHS[s.getMonth()] + ' – ' + e.getDate() + ' ' + MONTHS[e.getMonth()] + y;
  }
  const campDays = (c) => { const s = parse(c.start), e = parse(c.end); return s && e ? Math.round((e - s) / 864e5) + 1 : 0; };
  const daysUntil = (c) => { const s = parse(c.start); return s ? Math.ceil((s - new Date()) / 864e5) : null; };
  function campState(c) {
    if (c.status === 'open') {
      const e = parse(c.end); if (e && e.getTime() + 864e5 < Date.now()) return 'closed';
      if (Number(c.capacity) > 0 && Number(c.taken || 0) >= Number(c.capacity)) return 'full';
    }
    return c.status || 'soon';
  }
  const seatsLeft = (c) => Number(c.capacity) > 0 ? Math.max(0, Number(c.capacity) - Number(c.taken || 0)) : null;
  /* attach booked-seat counts to camps */
  async function withSeats(camps) { const s = await Store.seats().catch(() => ({})); camps.forEach(c => c.taken = s[c.id] || 0); return camps; }
  const STATE = { open: 'რეგისტრაცია ღიაა', soon: 'მალე', closed: 'რეგისტრაცია დასრულდა', full: 'ადგილები შევსებულია' };
  const SEASON = { winter: 'ზამთარი', summer: 'ზაფხული' };
  const price = (c) => (c.price || c.price === 0) && c.price !== '' ? Number(c.price).toLocaleString('en').replace(/,/g, ' ') + ' ₾' : '—';
  const ages = (c) => c.ageMin && c.ageMax ? c.ageMin + '–' + c.ageMax + ' წელი' : (c.ageMin ? c.ageMin + '+ წელი' : '');
  const tel = (p) => String(p || '').replace(/[^\d+]/g, '');
  const plural = (n) => n; // ქართულში მრავლობითი არ იცვლება რიცხვთან

  function logo(cls = '') {
    return `<svg class="mark ${cls}" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <g class="mark-rays"><path d="M100 18V36M47 47l18 18M153 47l-18 18M77 45l4 11M123 45l-4 11M23 101h27M150 101h27M44 78l10 4M156 78l-10 4M44 123l10-5M156 123l-10-5"/></g>
      <path d="M64 124.5A43 43 0 1 1 136 124.5"/>
      <path d="M100 47V80M100 82 50 141h100z"/><path d="M82 103q18 10 36 0M100 108v33M93 108q-7 14-9 33"/></svg>`;
  }

  const NAV = [
    ['camps', 'ბანაკები', 'camps.html'],
    ['about', 'ჩვენ შესახებ', 'about.html'],
    ['gallery', 'გალერეა', 'gallery.html'],
    ['faq', 'კითხვები', 'faq.html'],
  ];

  function renderChrome(content) {
    const page = document.body.dataset.page;
    const onDark = document.body.classList.contains('dark-top');
    const head = $('#site-header');
    if (head) {
      head.className = 'site-header' + (onDark ? ' on-dark' : '');
      head.innerHTML = `
        ${content.announceOn && content.announce ? `<a class="announce" href="book.html"><span class="pulse"></span>${esc(content.announce)}</a>` : ''}
        <div class="bar">
          <a class="brand" href="index.html" aria-label="${esc(content.siteName)} — მთავარი">${logo()}<span>${esc(content.siteName)}</span></a>
          <nav class="nav" aria-label="მენიუ">${NAV.map(([k, l, h]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
          <a class="btn btn-sun btn-sm head-cta" href="book.html">დაჯავშნა</a>
          <button class="burger" aria-label="მენიუს გახსნა" aria-expanded="false"><span></span><span></span></button>
        </div>
        <div class="drawer" hidden>
          <nav>${[['home', 'მთავარი', 'index.html'], ...NAV].map(([k, l, h], i) => `<a href="${h}" style="--i:${i}"${k === page ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
          <div class="drawer-foot">
            <a class="btn btn-sun btn-block" href="book.html">ადგილის დაჯავშნა</a>
            ${content.phone ? `<a class="drawer-tel" href="tel:${tel(content.phone)}">${esc(content.phone)}</a>` : ''}
          </div>
        </div>`;
      const burger = $('.burger', head), drawer = $('.drawer', head);
      const set = (open) => {
        document.documentElement.classList.toggle('menu-open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'მენიუს დახურვა' : 'მენიუს გახსნა');
        if (open) drawer.hidden = false;
      };
      burger.addEventListener('click', () => set(!document.documentElement.classList.contains('menu-open')));
      document.addEventListener('keydown', e => e.key === 'Escape' && set(false));
      const onScroll = () => head.classList.toggle('scrolled', scrollY > 10);
      addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }

    const foot = $('#site-footer');
    if (foot) {
      foot.className = 'site-footer';
      foot.innerHTML = `
        <div class="wrap foot-top">
          <p class="foot-call">შემდეგი ბანაკი<br>შენ გელოდება.</p>
          <a class="btn btn-sun btn-lg" href="book.html">დაჯავშნა</a>
        </div>
        <div class="wrap foot-grid">
          <a class="brand" href="index.html">${logo()}<span>${esc(content.siteName)}</span></a>
          <nav>${NAV.map(([, l, h]) => `<a href="${h}">${l}</a>`).join('')}</nav>
          <div class="foot-contact">
            ${content.phone ? `<a href="tel:${tel(content.phone)}">${esc(content.phone)}</a>` : ''}
            ${content.email ? `<a href="mailto:${esc(content.email)}">${esc(content.email)}</a>` : ''}
            <span class="socials">
              ${content.instagram ? `<a href="${esc(content.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ''}
              ${content.facebook ? `<a href="${esc(content.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ''}
            </span>
          </div>
        </div>
        <div class="wrap foot-legal"><span>© ${new Date().getFullYear()} ${esc(content.siteName)}</span><a href="admin.html">ადმინი</a></div>`;
    }

    if (Store.mode === 'demo' && !sessionStorage.getItem('ae-demo-hide')) {
      const n = document.createElement('div');
      n.className = 'demo-note';
      n.title = 'მონაცემები ინახება მხოლოდ ამ ბრაუზერში. რეალური გაშვებისთვის იხ. README.md';
      n.innerHTML = 'დემო რეჟიმი <button aria-label="დახურვა">×</button>';
      n.querySelector('button').onclick = () => { sessionStorage.setItem('ae-demo-hide', '1'); n.remove(); };
      document.body.appendChild(n);
    }
  }

  /* privacy-friendly page-view counter: page, source, device. Once per page per browser session. */
  function trackVisit() {
    try {
      const page = document.body.dataset.page || 'other';
      const key = 'ae-seen-' + page;
      if (sessionStorage.getItem(key) || /^(localhost|127\.)/.test(location.hostname)) return;
      sessionStorage.setItem(key, '1');
      const q = new URLSearchParams(location.search);
      let src = (q.get('utm_source') || q.get('src') || '').toLowerCase();
      if (!src) {
        const r = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '';
        if (!r || r === location.hostname) src = sessionStorage.getItem('ae-src') || 'direct';
        else if (/instagram/.test(r)) src = 'instagram';
        else if (/facebook|fb\.com|messenger/.test(r)) src = 'facebook';
        else if (/google\./.test(r)) src = 'google';
        else if (/tiktok/.test(r)) src = 'tiktok';
        else if (/t\.co$|twitter|x\.com/.test(r)) src = 'x';
        else src = r.slice(0, 30);
      }
      sessionStorage.setItem('ae-src', src);
      const d = new Date(), day = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      Store.track({ d: day, p: page.slice(0, 20), s: src.slice(0, 30), m: matchMedia('(max-width: 760px)').matches ? 1 : 0 });
    } catch (e) { /* ignore */ }
  }

  async function boot(render) {
    document.documentElement.classList.add('js');
    let content;
    try { content = await Store.content(); }
    catch (e) { content = null; console.error(e); }
    if (!content) { document.body.insertAdjacentHTML('afterbegin', '<p class="load-error">საიტი ვერ ჩაიტვირთა. შეამოწმე ინტერნეტი და განაახლე გვერდი.</p>'); return; }
    renderChrome(content);
    trackVisit();
    try { await render(content); }
    catch (e) { console.error(e); }
    document.documentElement.classList.add('ready');
  }

  window.UI = { esc, lines, paras, $, $$, campDates, campDays, daysUntil, campState, seatsLeft, withSeats, STATE, SEASON, price, ages, tel, logo, boot, plural };
})();
