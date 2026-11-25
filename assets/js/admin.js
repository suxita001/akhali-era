/* ახალი ერა — ადმინ პანელი */
(function () {
  'use strict';
  const { esc, $, $$, campDates, campState, STATE, SEASON, price, tel, logo } = UI;
  const app = $('#app');

  const STATUS = { new: 'ახალი', confirmed: 'დადასტურებული', paid: 'გადახდილი', waitlist: 'მოლოდინის სია', cancelled: 'გაუქმებული' };
  const ACTIVE = ['new', 'confirmed', 'paid'];
  const VIEWS = {
    bookings: ['ჯავშნები', '<path d="M3.5 13.5 6 5h12l2.5 8.5V19a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/><path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5"/>'],
    stats: ['სტატისტიკა', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'],
    camps: ['ბანაკები', '<path d="M12 4 3 20h18z"/><path d="M12 11v9M12 11l-3 9"/>'],
    content: ['ტექსტები', '<path d="M5 6h14M5 11h14M5 16h9"/>'],
    people: ['ლიდერები და შეფასებები', '<path d="M7 7h10M7 11h7"/><path d="M4 4h16v12H9l-5 4z"/>'],
    faq: ['კითხვები', '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>'],
    gallery: ['გალერეა', '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-5 4 4 2.5-2.5L20 19"/>'],
    team: ['ადმინები', '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>'],
  };
  const TABBAR = ['bookings', 'camps', 'stats', 'content'];
  const SHORT = { people: 'ხალხი' };

  const icon = (p, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I = {
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    app: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    phone: '<path d="M5 3.5h3.5l2 5-2.5 1.5a11 11 0 0 0 6 6l1.5-2.5 5 2V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
    out: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
    down: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
  };

  let state = { view: 'bookings', bookings: [], camps: [], filter: { status: '', camp: '', q: '' } };

  function toast(msg, bad) {
    const t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (bad ? ' bad' : '');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.className = 'toast', 3200);
  }
  async function guard(fn, okMsg) {
    try { const r = await fn(); if (okMsg) toast(okMsg); return r; }
    catch (e) { console.error(e); toast(e.message && /[ა-ჰ]/.test(e.message) ? e.message : 'ვერ შეინახა. შეამოწმე ინტერნეტი ან წვდომა.', true); throw e; }
  }
  const GM = ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'];
  const fmt = (ms) => { if (!ms) return ''; const d = new Date(ms); return d.getDate() + ' ' + GM[d.getMonth()] + ', ' + d.toTimeString().slice(0, 5); };

  /* ------------------------------------------------------------ login */
  function loginView(err = '') {
    const demo = Store.mode === 'demo';
    app.innerHTML = `
      <main class="login">
        <form class="login-card" id="login">
          <div class="login-mark">${logo()}</div>
          <h1>ადმინ პანელი</h1>
          <p class="sub">ახალი ერა</p>
          ${demo ? '<p class="note">დემო რეჟიმი: პაროლია <b>demo</b></p>' : ''}
          <p class="err" id="login-err">${esc(err)}</p>
          ${demo ? '' : '<label class="f"><span>ელ-ფოსტა</span><input name="email" type="email" autocomplete="username" required></label>'}
          <label class="f"><span>პაროლი</span><input name="password" type="password" autocomplete="current-password" required></label>
          <button class="b b-dark b-block" type="submit">შესვლა</button>
          ${demo ? '' : `<p class="or-line"><span>ან</span></p><button class="b b-line b-block" type="button" id="g-login"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6a5.1 5.1 0 0 1-2.2 3.4v2.8h3.6c2-1.9 3.2-4.7 3.2-8.2z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 10z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"/></svg><span>Google-ით შესვლა</span></button><p class="tiny">გუნდის წევრები შედიან Google-ით, იმ ელ-ფოსტით, რომელიც ადმინმა დაამატა.</p>`}
          <a class="back" href="index.html">საიტზე დაბრუნება</a>
        </form>
      </main>`;
    const f = $('#login');
    f.querySelector('input').focus();
    const g = $('#g-login');
    if (g) g.onclick = async () => { $('#login-err').textContent = ''; try { await Store.loginGoogle(); } catch (er) { if (er.code !== 'cancelled') $('#login-err').textContent = er.message; } };
    f.onsubmit = async (e) => {
      e.preventDefault();
      const btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'მოწმდება…';
      try { await Store.login(f.email ? f.email.value.trim() : '', f.password.value); if (demo) start(); }
      catch (er) { $('#login-err').textContent = er.message; btn.disabled = false; btn.textContent = 'შესვლა'; }
    };
  }

  /* ------------------------------------------------------------ shell */
  function shell() {
    app.innerHTML = `
      <aside class="side">
        <a class="side-brand" href="#bookings">${logo()}<span>ახალი ერა<small>ადმინ პანელი</small></span></a>
        <nav class="side-nav">${Object.entries(VIEWS).map(([k, [l, p]]) => `<a href="#${k}" data-v="${k}">${icon(p)}<span>${l}</span><b class="badge" data-badge="${k}"></b></a>`).join('')}</nav>
        <div class="side-foot">
          <button class="install-btn" data-install hidden>${icon(I.app)}<span>ტელეფონზე დაყენება</span></button>
          <a href="index.html" target="_blank">${icon(I.ext)}<span>საიტის ნახვა</span></a>
          <button id="logout">${icon(I.out)}<span>გასვლა</span></button>
        </div>
      </aside>
      <div class="main">
        <header class="top"><h1 id="title"></h1><div class="top-actions" id="top-actions"></div></header>
        ${Store.mode === 'demo' ? '<p class="demo">დემო რეჟიმი — მონაცემები ინახება მხოლოდ ამ ბრაუზერში. რეალური გაშვებისთვის იხილე README.md.</p>' : ''}
        <section class="view" id="view"></section>
      </div>
      <nav class="tabbar">${TABBAR.map(k => `<a href="#${k}" data-v="${k}">${icon(VIEWS[k][1])}<span>${SHORT[k] || VIEWS[k][0]}</span><b class="badge" data-badge="${k}"></b></a>`).join('')}<button id="more-btn">${icon(I.more)}<span>მეტი</span></button></nav>
      <div class="sheet-wrap" id="sheet" hidden><div class="sheet-bg" data-close></div><div class="sheet" role="dialog" aria-modal="true"><button class="sheet-x" data-close aria-label="დახურვა">${icon(I.x)}</button><div id="sheet-body"></div></div></div>`;
    $('#logout').onclick = async () => { await Store.logout(); if (Store.mode === 'demo') loginView(); };
    $('#more-btn').onclick = () => {
      openSheet(`<h2>მეტი</h2><nav class="more-list">${Object.keys(VIEWS).filter(k => !TABBAR.includes(k)).map(k => `<a href="#${k}">${icon(VIEWS[k][1])}<span>${VIEWS[k][0]}</span></a>`).join('')}
        <button data-install>${icon(I.app)}<span>ტელეფონზე დაყენება</span></button>
        <a href="index.html" target="_blank">${icon(I.ext)}<span>საიტის ნახვა</span></a>
        <button id="logout2">${icon(I.out)}<span>გასვლა</span></button></nav>`);
      $$('.more-list a[href^="#"]').forEach(a => a.onclick = closeSheet);
      $('#logout2').onclick = () => $('#logout').click();
      bindInstall();
    };
    bindInstall();
    $$('[data-close]').forEach(el => el.onclick = closeSheet);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
    addEventListener('hashchange', route);
    route();
  }

  function openSheet(html) { $('#sheet-body').innerHTML = html; $('#sheet').hidden = false; document.documentElement.classList.add('sheet-open'); requestAnimationFrame(() => $('#sheet').classList.add('open')); }
  function closeSheet() { const s = $('#sheet'); if (!s || s.hidden) return; s.classList.remove('open'); document.documentElement.classList.remove('sheet-open'); setTimeout(() => s.hidden = true, 250); }

  function route() {
    const v = (location.hash.slice(1) || 'bookings');
    state.view = VIEWS[v] ? v : 'bookings';
    $$('[data-v]').forEach(a => a.classList.toggle('on', a.dataset.v === state.view));
    const mb = $('#more-btn'); if (mb) mb.classList.toggle('on', !TABBAR.includes(state.view));
    $('#title').textContent = VIEWS[state.view][0];
    $('#top-actions').innerHTML = '';
    $('#view').innerHTML = '<div class="loading">იტვირთება…</div>';
    closeSheet();
    views[state.view]().catch(e => { console.error(e); $('#view').innerHTML = '<p class="empty">მონაცემები ვერ ჩაიტვირთა. შეამოწმე ინტერნეტი და Firebase-ის წესები (README.md).</p>'; });
  }

  function badge(n) { $$('[data-badge="bookings"]').forEach(b => { b.textContent = n || ''; b.hidden = !n; }); }

  /* ------------------------------------------------------------ views */
  const views = {
    async bookings() {
      [state.bookings, state.camps] = await Promise.all([Store.bookings(), Store.camps()]);
      badge(state.bookings.filter(b => b.status === 'new').length);
      Store.syncSeats(state.bookings, state.camps).catch(e => console.warn('seats', e));
      $('#top-actions').innerHTML = `<button class="b b-line" id="csv">${icon(I.down)}<span>Excel</span></button>`;
      $('#csv').onclick = exportCsv;
      renderBookings();
    },
    async camps() {
      state.camps = await Store.camps();
      if (!state.bookings.length) state.bookings = await Store.bookings().catch(() => []);
      $('#top-actions').innerHTML = `<button class="b b-dark" id="new-camp">${icon(I.plus)}<span>ახალი ბანაკი</span></button>`;
      $('#new-camp').onclick = () => campForm({ season: 'summer', status: 'soon', ageMin: 15, ageMax: 25, order: state.camps.length + 1 });
      $('#view').innerHTML = `<div class="camp-grid">${state.camps.map(c => {
        const n = state.bookings.filter(b => b.campId === c.id && ACTIVE.includes(b.status)).length, wl = state.bookings.filter(b => b.campId === c.id && b.status === 'waitlist').length;
        c.taken = n; const st = campState(c);
        return `<button class="camp-card ${esc(c.season)}" data-id="${esc(c.id)}">
          <span class="cc-top"><span class="pill st-${st}">${STATE[st]}</span>${c.featured ? '<span class="pill feat">მთავარზე</span>' : ''}</span>
          <b>${esc(c.title)}</b>
          <span class="muted">${esc(campDates(c))}${c.location ? ', ' + esc(c.location) : ''}</span>
          <span class="cc-foot"><span>${esc(price(c))}</span><span>${n}${Number(c.capacity) > 0 ? ' / ' + esc(c.capacity) : ''} ადგილი${wl ? ` · ${wl} მოლოდინში` : ''}</span></span>
          ${Number(c.capacity) > 0 ? `<span class="cap-bar"><i style="width:${Math.min(100, Math.round(n / c.capacity * 100))}%"></i></span>` : ''}
        </button>`;
      }).join('')}</div>`;
      $$('.camp-card').forEach(b => b.onclick = () => campForm(state.camps.find(c => c.id === b.dataset.id)));
    },
    async content() {
      const c = await Store.content();
      const vals = c.values || [];
      const grp = (title, fields) => `<fieldset class="card"><legend>${title}</legend>${fields}</fieldset>`;
      const inp = (k, label, v = c[k]) => `<label class="f"><span>${label}</span><input name="${k}" value="${esc(v)}"></label>`;
      const area = (k, label, rows = 3) => `<label class="f"><span>${label}</span><textarea name="${k}" rows="${rows}">${esc(c[k])}</textarea></label>`;
      $('#view').innerHTML = `<form id="content-form" class="stack">
        ${grp('ზოგადი', `${inp('siteName', 'საიტის სახელი')}<label class="switch"><input type="checkbox" name="announceOn" ${c.announceOn ? 'checked' : ''}><span>ზედა ზოლის ჩვენება</span></label>${inp('announce', 'ზედა ზოლის ტექსტი')}`)}
        ${grp('მთავარი გვერდი', `${inp('heroLine', 'ხაზი სახელის ქვეშ')}${area('heroText', 'შესავალი ტექსტი')}${area('manifesto', 'დიდი ტექსტი (მთავარზე და „ჩვენ შესახებ“)', 4)}`)}
        ${grp('სამი ღირებულება', [0, 1, 2].map(i => `<div class="row2">${inp('v' + i + 't', 'სათაური ' + (i + 1), (vals[i] || {}).title)}${inp('v' + i + 'x', 'ტექსტი ' + (i + 1), (vals[i] || {}).text)}</div>`).join(''))}
        ${grp('ჩვენ შესახებ', `${inp('aboutTitle', 'სათაური')}${area('aboutText', 'ტექსტი (აბზაცები — ცარიელი ხაზით)', 8)}`)}
        ${grp('კონტაქტი', `<div class="row2">${inp('phone', 'ტელეფონი')}${inp('email', 'ელ-ფოსტა')}</div><div class="row2">${inp('instagram', 'Instagram-ის ბმული')}${inp('facebook', 'Facebook-ის ბმული')}</div>${area('contactNote', 'ტექსტი კონტაქტის ნაწილში', 2)}`)}
        ${grp('ჯავშანი', `${area('bookingIntro', 'ტექსტი ფორმის თავში', 2)}${area('bookingSuccess', 'მადლობის ტექსტი', 2)}${area('paymentInfo', 'გადახდის ინფორმაცია მადლობის გვერდზე (არასავალდებულო)', 3)}`)}
        <div class="savebar"><span>ცვლილებები საიტზე მაშინვე გამოჩნდება.</span><button class="b b-dark" type="submit">ცვლილებების შენახვა</button></div>
      </form>`;
      $('#content-form').onsubmit = async (e) => {
        e.preventDefault();
        const f = e.target, v = (n) => f.elements[n].value.trim();
        const url = (s) => s && !/^https?:\/\//i.test(s) ? 'https://' + s : s;
        const next = Object.assign({}, c, {
          siteName: v('siteName') || 'ახალი ერა', announceOn: f.elements.announceOn.checked, announce: v('announce'),
          heroLine: v('heroLine'), heroText: v('heroText'), manifesto: v('manifesto'),
          values: [0, 1, 2].map(i => ({ title: v('v' + i + 't'), text: v('v' + i + 'x') })).filter(x => x.title),
          aboutTitle: v('aboutTitle'), aboutText: v('aboutText'), phone: v('phone'), email: v('email'),
          instagram: url(v('instagram')), facebook: url(v('facebook')), contactNote: v('contactNote'),
          bookingIntro: v('bookingIntro'), bookingSuccess: v('bookingSuccess'), paymentInfo: v('paymentInfo'),
        });
        await guard(() => Store.saveContent(next), 'ტექსტები შენახულია');
      };
    },
    async faq() {
      const list = await Store.faq();
      $('#top-actions').innerHTML = `<button class="b b-dark" id="new-q">${icon(I.plus)}<span>ახალი კითხვა</span></button>`;
      const form = (f) => `<form class="faq-form stack" data-id="${esc(f.id || '')}">
          <label class="f"><span>კითხვა</span><input name="q" value="${esc(f.q)}" required></label>
          <label class="f"><span>პასუხი</span><textarea name="a" rows="4" required>${esc(f.a)}</textarea></label>
          <div class="row-end"><label class="f f-sm"><span>რიგი</span><input name="order" type="number" value="${f.order ?? list.length + 1}"></label>
          ${f.id ? `<button type="button" class="b b-danger" data-del>${icon(I.trash)}<span>წაშლა</span></button>` : ''}<button class="b b-dark" type="submit">შენახვა</button></div>
        </form>`;
      $('#view').innerHTML = list.length ? `<div class="faq-list">${list.map(f => `<details class="card faq-item"><summary><span class="num">${esc(f.order ?? '')}</span><b>${esc(f.q)}</b></summary>${form(f)}</details>`).join('')}</div>` : '<p class="empty">კითხვები ჯერ არ არის.</p>';
      $('#new-q').onclick = () => { openSheet(`<h2>ახალი კითხვა</h2>${form({ q: '', a: '' })}`); bindFaq($('#sheet-body')); };
      bindFaq($('#view'));
      function bindFaq(root) {
        $$('.faq-form', root).forEach(f => {
          f.onsubmit = async (e) => { e.preventDefault(); await guard(() => Store.saveFaq({ id: f.dataset.id || undefined, q: f.q.value.trim(), a: f.a.value.trim(), order: Number(f.order.value) || 0 }), 'შენახულია'); views.faq(); closeSheet(); };
          const d = f.querySelector('[data-del]'); if (d) d.onclick = async () => { if (!confirm('წავშალო ეს კითხვა?')) return; await guard(() => Store.deleteFaq(f.dataset.id), 'კითხვა წაიშალა'); views.faq(); };
        });
      }
    },
    async gallery() {
      const photos = await Store.gallery();
      $('#view').innerHTML = `
        <label class="drop" id="drop"><input type="file" accept="image/*" multiple id="files">${icon(VIEWS.gallery[1], 'i big')}<b>აირჩიე ან ჩააგდე ფოტოები</b><span class="muted">შეგიძლია რამდენიმე ერთად. ფოტოები ავტომატურად შემცირდება.</span><span class="prog" id="prog"></span></label>
        ${photos.length ? `<div class="photos">${photos.map(p => `<figure class="photo" data-id="${esc(p.id)}"><img src="${p.src}" alt="" loading="lazy"><figcaption><input value="${esc(p.caption || '')}" placeholder="წარწერა" aria-label="წარწერა"><button class="icon-b" data-del aria-label="წაშლა">${icon(I.trash)}</button></figcaption></figure>`).join('')}</div>` : '<p class="empty">გალერეა ცარიელია. ატვირთული ფოტოები მაშინვე გამოჩნდება საიტზე.</p>'}`;
      const input = $('#files'), drop = $('#drop');
      ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
      ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', e => upload([...e.dataTransfer.files]));
      input.onchange = () => upload([...input.files]);
      $$('.photo').forEach(fig => {
        const inp = $('input', fig);
        inp.onchange = () => guard(() => Store.updatePhoto(fig.dataset.id, { caption: inp.value.trim() }), 'წარწერა შენახულია');
        $('[data-del]', fig).onclick = async () => { if (!confirm('წავშალო ეს ფოტო?')) return; await guard(() => Store.deletePhoto(fig.dataset.id), 'ფოტო წაიშალა'); views.gallery(); };
      });
      async function upload(files) {
        files = files.filter(f => f.type.startsWith('image/'));
        if (!files.length) return;
        let ok = 0;
        for (const [i, f] of files.entries()) {
          $('#prog').textContent = `იტვირთება ${i + 1} / ${files.length}…`;
          try { await Store.addPhoto({ src: await shrink(f), caption: '' }); ok++; }
          catch (e) { console.error(e); toast(e.message && /[ა-ჰ]/.test(e.message) ? e.message : 'ფოტო ვერ აიტვირთა', true); break; }
        }
        if (ok) toast(`აიტვირთა ${ok} ფოტო`);
        views.gallery();
      }
    }
  };

  views.team = async function () {
    const list = await Store.admins();
    const owner = state.me && state.me.owner;
    $('#view').innerHTML = `
      <div class="card team-intro">
        <p>გუნდის წევრებს აქვთ ადმინ პანელის სრული წვდომა: ჯავშნები, ბანაკები, ტექსტები, გალერეა. შედიან <b>Google-ით</b>, იმ ელ-ფოსტით, რომელსაც აქ დაამატებ (Gmail ან Google-ზე მიბმული სამსახურის ელ-ფოსტა).</p>
        <p class="muted" style="margin:0">მთავარი ადმინი: ${esc(state.me && state.me.owner ? state.me.email : 'firestore.rules ფაილში მითითებული ელ-ფოსტა')}</p>
      </div>
      ${owner ? `<form class="team-add" id="team-add"><input type="email" name="email" placeholder="მაგ. giorgi@gmail.com" required inputmode="email"><button class="b b-dark" type="submit">${icon(I.plus)}<span>დამატება</span></button></form>`
        : '<p class="demo">გუნდის შეცვლა მხოლოდ მთავარ ადმინს შეუძლია.</p>'}
      ${list.length ? `<ul class="team">${list.map(a => `<li><span class="av">${esc(a.email[0].toUpperCase())}</span><span class="r-main"><b>${esc(a.email)}</b><small>${a.added ? 'დაემატა ' + esc(fmt(a.added)) : ''}</small></span>${owner ? `<button class="icon-b" data-rm="${esc(a.email)}" aria-label="წაშლა">${icon(I.trash)}</button>` : ''}</li>`).join('')}</ul>`
        : '<p class="empty">ჯერ არავინ დაგიმატებია.</p>'}`;
    const form = $('#team-add');
    if (form) form.onsubmit = async (e) => {
      e.preventDefault();
      const email = form.email.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { toast('ელ-ფოსტა არასწორია', true); return; }
      await guard(() => Store.addAdmin(email), email + ' დაემატა გუნდში');
      views.team();
    };
    $$('[data-rm]').forEach(b => b.onclick = async () => {
      if (!confirm(`${b.dataset.rm}-ს ადმინ პანელზე წვდომა მოეხსნას?`)) return;
      await guard(() => Store.removeAdmin(b.dataset.rm), 'წვდომა მოეხსნა');
      views.team();
    });
  };

  /* ------------------------------------------------------------ leaders + reviews */
  views.people = async function () {
    const [people, reviews] = await Promise.all([Store.list('people'), Store.list('reviews')]);
    $('#view').innerHTML = `
      <section class="block-a">
        <div class="block-head"><div><h2>ლიდერები</h2><p class="muted">ჩანს „ჩვენ შესახებ“ გვერდზე.</p></div><button class="b b-dark" id="add-person">${icon(I.plus)}<span>დამატება</span></button></div>
        ${people.length ? `<div class="people">${people.map(p => `<button class="person-card" data-id="${esc(p.id)}">${p.photo ? `<img src="${p.photo}" alt="">` : `<span class="ph">${logo()}</span>`}<b>${esc(p.name)}</b><span class="muted">${esc(p.role || '')}</span></button>`).join('')}</div>` : '<p class="empty">ლიდერები ჯერ არ დაგიმატებია. სექცია საიტზე მაშინ გამოჩნდება, როცა პირველს დაამატებ.</p>'}
      </section>
      <section class="block-a">
        <div class="block-head"><div><h2>შეფასებები</h2><p class="muted">წინა მონაწილეების სიტყვები. ჩანს მთავარ გვერდზე და „ჩვენ შესახებ“-ზე.</p></div><button class="b b-dark" id="add-review">${icon(I.plus)}<span>დამატება</span></button></div>
        ${reviews.length ? `<div class="faq-list">${reviews.map(r => `<button class="card review-row" data-id="${esc(r.id)}"><span>„${esc(r.quote)}“</span><b>${esc(r.name)}${r.detail ? ' · ' + esc(r.detail) : ''}</b></button>`).join('')}</div>` : '<p class="empty">შეფასებები ჯერ არ არის.</p>'}
      </section>`;
    $('#add-person').onclick = () => personForm({ order: people.length + 1 });
    $('#add-review').onclick = () => reviewForm({ order: reviews.length + 1 });
    $$('.person-card').forEach(b => b.onclick = () => personForm(people.find(p => p.id === b.dataset.id)));
    $$('.review-row').forEach(b => b.onclick = () => reviewForm(reviews.find(r => r.id === b.dataset.id)));
  };

  function personForm(p) {
    let photo = p.photo || '';
    openSheet(`<h2>${p.id ? 'ლიდერის რედაქტირება' : 'ახალი ლიდერი'}</h2>
      <form id="pf" class="stack">
        <div class="photo-pick"><span class="pp-img" id="pp">${photo ? `<img src="${photo}" alt="">` : logo()}</span>
          <label class="b b-line">ფოტოს არჩევა<input type="file" accept="image/*" id="pp-file" hidden></label>${photo ? '<button type="button" class="b b-danger" id="pp-rm">ფოტოს წაშლა</button>' : ''}</div>
        <label class="f"><span>სახელი და გვარი</span><input name="name" value="${esc(p.name || '')}" required></label>
        <label class="f"><span>როლი</span><input name="role" value="${esc(p.role || '')}" placeholder="მაგ. ბანაკის ხელმძღვანელი"></label>
        <label class="f"><span>მოკლედ (არასავალდებულო)</span><textarea name="bio" rows="3">${esc(p.bio || '')}</textarea></label>
        <label class="f f-sm"><span>რიგი</span><input name="order" type="number" value="${esc(p.order ?? 1)}"></label>
        <div class="row-end">${p.id ? `<button type="button" class="b b-danger" id="pf-del">${icon(I.trash)}<span>წაშლა</span></button>` : ''}<button class="b b-dark" type="submit">შენახვა</button></div>
      </form>`);
    $('#pp-file').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; photo = await shrink(f, 800); $('#pp').innerHTML = `<img src="${photo}" alt="">`; };
    const rm = $('#pp-rm'); if (rm) rm.onclick = () => { photo = ''; $('#pp').innerHTML = logo(); rm.remove(); };
    const f = $('#pf');
    f.onsubmit = async (e) => {
      e.preventDefault();
      if (!f.name.value.trim()) return f.name.focus();
      await guard(() => Store.saveItem('people', { id: p.id, name: f.name.value.trim(), role: f.role.value.trim(), bio: f.bio.value.trim(), order: Number(f.order.value) || 0, photo }), 'შენახულია');
      closeSheet(); views.people();
    };
    const d = $('#pf-del'); if (d) d.onclick = async () => { if (!confirm(`წავშალო ${p.name}?`)) return; await guard(() => Store.removeItem('people', p.id), 'წაიშალა'); closeSheet(); views.people(); };
  }

  function reviewForm(r) {
    openSheet(`<h2>${r.id ? 'შეფასების რედაქტირება' : 'ახალი შეფასება'}</h2>
      <form id="rf" class="stack">
        <label class="f"><span>რა თქვა</span><textarea name="quote" rows="4" required>${esc(r.quote || '')}</textarea></label>
        <label class="f"><span>ვინ (სახელი)</span><input name="name" value="${esc(r.name || '')}" required placeholder="მაგ. ანა, 17"></label>
        <label class="f"><span>დამატებით (არასავალდებულო)</span><input name="detail" value="${esc(r.detail || '')}" placeholder="მაგ. ზაფხულის ბანაკი 2026"></label>
        <label class="f f-sm"><span>რიგი</span><input name="order" type="number" value="${esc(r.order ?? 1)}"></label>
        <div class="row-end">${r.id ? `<button type="button" class="b b-danger" id="rf-del">${icon(I.trash)}<span>წაშლა</span></button>` : ''}<button class="b b-dark" type="submit">შენახვა</button></div>
      </form>`);
    const f = $('#rf');
    f.onsubmit = async (e) => {
      e.preventDefault();
      if (!f.quote.value.trim() || !f.name.value.trim()) return;
      await guard(() => Store.saveItem('reviews', { id: r.id, quote: f.quote.value.trim(), name: f.name.value.trim(), detail: f.detail.value.trim(), order: Number(f.order.value) || 0 }), 'შენახულია');
      closeSheet(); views.people();
    };
    const d = $('#rf-del'); if (d) d.onclick = async () => { if (!confirm('წავშალო ეს შეფასება?')) return; await guard(() => Store.removeItem('reviews', r.id), 'წაიშალა'); closeSheet(); views.people(); };
  }

  /* ------------------------------------------------------------ visitor stats */
  const SRC = { direct: 'პირდაპირ / ბმულით', instagram: 'Instagram', facebook: 'Facebook / Messenger', google: 'Google', tiktok: 'TikTok', x: 'X (Twitter)' };
  const PAGES = { home: 'მთავარი', camps: 'ბანაკები', camp: 'ბანაკის გვერდი', book: 'დაჯავშნა', about: 'ჩვენ შესახებ', gallery: 'გალერეა', faq: 'კითხვები' };
  const dayKey = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  views.stats = async function () {
    const range = state.statsRange || 30;
    const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - (range - 1));
    const [visits, bookings] = await Promise.all([Store.visits(dayKey(from)), state.bookings.length ? state.bookings : Store.bookings()]);
    state.bookings = bookings;
    const days = []; for (let i = 0; i < range; i++) { const d = new Date(from); d.setDate(from.getDate() + i); days.push(dayKey(d)); }
    const perDay = Object.fromEntries(days.map(d => [d, 0])); visits.forEach(v => { if (v.d in perDay) perDay[v.d]++; });
    const inRange = bookings.filter(b => b.createdAt && dayKey(new Date(b.createdAt)) >= days[0]);
    const count = (key, map) => { const m = {}; visits.forEach(v => { const k = v[key]; m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, n]) => [map ? (map[k] || k) : k, n]); };
    const sources = count('s', SRC), pages = count('p', PAGES);
    const mobile = visits.filter(v => v.m === 1).length;
    const bookViews = visits.filter(v => v.p === 'book').length;
    const max = Math.max(1, ...Object.values(perDay));
    const bars = (rows) => { const top = Math.max(1, ...rows.map(r => r[1])); return `<ul class="hbars">${rows.slice(0, 8).map(([k, n]) => `<li><span class="hb-l">${esc(k)}</span><span class="hb-t"><i style="width:${n ? Math.max(2, n / top * 100) : 0}%"></i></span><b>${n}</b></li>`).join('')}</ul>`; };
    const shortDay = (d) => { const [, m, x] = d.split('-'); return Number(x) + '.' + m; };
    $('#top-actions').innerHTML = `<div class="seg-mini">${[7, 30, 90].map(n => `<button data-r="${n}" class="${n === range ? 'on' : ''}">${n} დღე</button>`).join('')}</div>`;
    $$('[data-r]').forEach(b => b.onclick = () => { state.statsRange = Number(b.dataset.r); views.stats(); });
    $('#view').innerHTML = `
      <div class="stats stats-static">
        <div class="stat"><b>${visits.length}</b><span>გვერდის ნახვა</span></div>
        <div class="stat"><b>${bookViews}</b><span>დაჯავშნის გვერდზე შესვლა</span></div>
        <div class="stat"><b>${inRange.length}</b><span>ჯავშანი</span></div>
        <div class="stat"><b>${bookViews ? Math.min(100, Math.round(inRange.length / bookViews * 100)) + '%' : '—'}</b><span>ვინც ჯავშნის გვერდზე შევიდა, დაჯავშნა</span></div>
      </div>
      <section class="card chart-card">
        <h2>ნახვები დღეების მიხედვით</h2>
        ${visits.length ? `<div class="vchart" role="img" aria-label="ნახვები დღეების მიხედვით, ბოლო ${range} დღე">
          <div class="vc-grid"><span>${max}</span><span>${Math.round(max / 2)}</span><span>0</span></div>
          <div class="vc-bars" style="--n:${range}">${days.map((d, i) => `<button class="vc-bar" tabindex="0" data-tip="${shortDay(d)}: ${perDay[d]} ნახვა"><i style="height:${perDay[d] / max * 100}%"></i>${(range <= 7 || i % Math.ceil(range / 6) === 0) ? `<em>${shortDay(d)}</em>` : ''}</button>`).join('')}</div>
          <div class="vc-tip" id="vc-tip" hidden></div>
        </div>
        <details class="table-view"><summary>ცხრილის სახით</summary><table><tr><th>დღე</th><th>ნახვა</th></tr>${days.slice().reverse().map(d => `<tr><td>${shortDay(d)}</td><td>${perDay[d]}</td></tr>`).join('')}</table></details>` : '<p class="empty">ამ პერიოდში ნახვები ჯერ არ დაფიქსირებულა. ნახვები ითვლება საიტის ატვირთვის შემდეგ.</p>'}
      </section>
      <div class="grid2">
        <section class="card"><h2>საიდან მოდიან</h2>${sources.length ? bars(sources) : '<p class="muted">—</p>'}</section>
        <section class="card"><h2>რომელ გვერდებს ნახულობენ</h2>${pages.length ? bars(pages) : '<p class="muted">—</p>'}</section>
      </div>
      <section class="card"><h2>მოწყობილობა</h2>${visits.length ? bars([['ტელეფონი', mobile], ['კომპიუტერი', visits.length - mobile]]) : '<p class="muted">—</p>'}
        <p class="muted small-note">რეკლამის ბმულს თუ ბოლოში მიუწერ <b>?src=სახელი</b> (მაგ. <code>…/akhali-era/?src=reklama1</code>), აქ ცალკე გამოჩნდება, რამდენი შემოვიდა იმ რეკლამიდან.</p></section>`;
    const tip = $('#vc-tip');
    $$('.vc-bar').forEach(b => {
      const show = () => { tip.textContent = b.dataset.tip; tip.hidden = false; const r = b.getBoundingClientRect(), p = b.parentElement.getBoundingClientRect(); tip.style.left = Math.min(p.width - 120, Math.max(0, r.left - p.left + r.width / 2 - 60)) + 'px'; };
      b.addEventListener('pointerenter', show); b.addEventListener('focus', show);
      b.addEventListener('pointerleave', () => tip.hidden = true); b.addEventListener('blur', () => tip.hidden = true);
    });
  };

  /* ------------------------------------------------------------ install as phone app */
  let installEvt = null;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; bindInstall(); });
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  function bindInstall() {
    $$('[data-install]').forEach(b => {
      b.hidden = standalone();
      b.onclick = async () => {
        if (installEvt) { installEvt.prompt(); await installEvt.userChoice.catch(() => {}); installEvt = null; return; }
        const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
        openSheet(`<h2>ტელეფონზე დაყენება</h2>${ios
          ? '<ol class="steps-list"><li>გახსენი ეს გვერდი <b>Safari</b>-ში</li><li>დააჭირე ქვემოთ <b>Share</b> ღილაკს (კვადრატი ისრით)</li><li>აირჩიე <b>Add to Home Screen</b></li><li>დააჭირე <b>Add</b></li></ol>'
          : '<ol class="steps-list"><li>გახსენი ეს გვერდი <b>Chrome</b>-ში</li><li>დააჭირე ზემოთ <b>⋮</b> მენიუს</li><li>აირჩიე <b>Add to Home screen</b> ან <b>Install app</b></li><li>დაადასტურე</li></ol>'}
          <p class="muted">ეკრანზე გამოჩნდება „ახალი ერა“-ს ხატულა. ადმინ პანელი აპლიკაციასავით გაიხსნება.</p>`);
      };
    });
  }

  /* resize to fit one Firestore document (< 1 MB) */
  function shrink(file, start = 1600) {
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let max = start, q = .82, out;
        for (let n = 0; n < 6; n++) {
          const s = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          out = c.toDataURL('image/jpeg', q);
          if (out.length < 700000) return res(out);
          max *= .82; q = Math.max(.6, q - .06);
        }
        res(out);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('ფაილი ვერ წავიკითხე')); };
      img.src = url;
    });
  }

  /* ------------------------------------------------------------ bookings */
  function renderBookings() {
    const { status, camp, q } = state.filter;
    const all = state.bookings;
    const count = (s) => all.filter(b => b.status === s).length;
    const rows = all.filter(b => (!status || b.status === status) && (!camp || b.campId === camp) &&
      (!q || [b.name, b.phone, b.email, b.parentName].join(' ').toLowerCase().includes(q.toLowerCase())));
    const camps = [...new Map(all.map(b => [b.campId, b.campTitle])).entries()];
    $('#view').innerHTML = `
      <div class="stats">
        <button class="stat ${status === 'new' ? 'on' : ''}" data-s="new"><b>${count('new')}</b><span>ახალი</span></button>
        <button class="stat ${status === 'confirmed' ? 'on' : ''}" data-s="confirmed"><b>${count('confirmed')}</b><span>დადასტურებული</span></button>
        <button class="stat ${status === 'paid' ? 'on' : ''}" data-s="paid"><b>${count('paid')}</b><span>გადახდილი</span></button>
        ${count('waitlist') ? `<button class="stat ${status === 'waitlist' ? 'on' : ''}" data-s="waitlist"><b>${count('waitlist')}</b><span>მოლოდინის სია</span></button>` : ''}
        <button class="stat ${status === '' ? 'on' : ''}" data-s=""><b>${all.filter(b => ACTIVE.includes(b.status)).length}</b><span>სულ ადგილი</span></button>
      </div>
      <div class="filters">
        <label class="search">${icon(I.search)}<input id="q" value="${esc(q)}" placeholder="სახელი, ტელეფონი…" type="search"></label>
        <select id="camp-filter"><option value="">ყველა ბანაკი</option>${camps.map(([id, t]) => `<option value="${esc(id)}"${id === camp ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>
        ${status ? `<button class="chip-x" id="clear-s">${STATUS[status]} ${icon(I.x)}</button>` : ''}
      </div>
      ${rows.length ? `<ul class="rows">${rows.map(b => `
        <li><button class="row" data-id="${esc(b.id)}">
          <span class="av">${esc((b.name || '?').trim()[0])}</span>
          <span class="r-main"><b>${esc(b.name)}</b><small>${esc(b.age)} წ. · ${esc(b.email || '')}${b.notes ? ' · კომენტარი' : ''}</small></span>
          <span class="r-camp">${esc(b.campTitle)}</span>
          <span class="r-phone">${esc(b.phone)}</span>
          <span class="r-date">${esc(fmt(b.createdAt))}</span>
          <span class="pill bs-${esc(b.status)}">${STATUS[b.status] || b.status}</span>
        </button></li>`).join('')}</ul>`
        : `<p class="empty">${all.length ? 'ამ ფილტრით ჯავშანი ვერ მოიძებნა.' : 'ჯავშნები ჯერ არ არის. როცა ვინმე საიტზე ფორმას შეავსებს, აქ გამოჩნდება.'}</p>`}`;
    $$('.stat').forEach(s => s.onclick = () => { state.filter.status = s.dataset.s; renderBookings(); });
    const qi = $('#q'); qi.oninput = () => { state.filter.q = qi.value; const pos = qi.selectionStart; renderBookings(); const n = $('#q'); n.focus(); n.setSelectionRange(pos, pos); };
    $('#camp-filter').onchange = (e) => { state.filter.camp = e.target.value; renderBookings(); };
    const cs = $('#clear-s'); if (cs) cs.onclick = () => { state.filter.status = ''; renderBookings(); };
    $$('.row').forEach(r => r.onclick = () => bookingSheet(state.bookings.find(b => b.id === r.dataset.id)));
  }

  function bookingSheet(b) {
    openSheet(`
      <div class="person"><span class="av lg">${esc((b.name || '?')[0])}</span><div><h2>${esc(b.name)}</h2><p class="muted">${esc(b.campTitle)}</p></div></div>
      <div class="call">
        <a class="b b-dark" href="tel:${tel(b.phone)}">${icon(I.phone)}<span>დარეკვა</span></a>
        ${b.parentPhone ? `<a class="b b-line" href="tel:${tel(b.parentPhone)}">${icon(I.phone)}<span>მშობელთან</span></a>` : ''}
      </div>
      <dl class="kv">
        <div><dt>ასაკი</dt><dd>${esc(b.age)}${b.birthDate ? ` <span class="muted">(${esc(b.birthDate.split('-').reverse().join('.'))})</span>` : ''}</dd></div>
        <div><dt>ტელეფონი</dt><dd>${esc(b.phone)}</dd></div>
        <div><dt>ელ-ფოსტა</dt><dd>${b.email ? `<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>` : '—'}${b.verifiedVia ? `<span class="ver">✓ დადასტურებულია ${b.verifiedVia === 'google' ? 'Google-ით' : 'ბმულით'}</span>` : ''}</dd></div>
        <div><dt>გაგზავნილია</dt><dd>${esc(fmt(b.createdAt))}</dd></div>
        ${b.parentName ? `<div><dt>მშობელი / მეურვე</dt><dd>${esc(b.parentName)}</dd></div><div><dt>მშობლის ტელეფონი</dt><dd>${esc(b.parentPhone)}</dd></div>` : ''}
        ${(b.answers || []).map(x => `<div class="wide"><dt>${esc(x.q)}</dt><dd>${x.a ? esc(x.a).replace(/\n/g, '<br>') : '—'}</dd></div>`).join('')}
        <div class="wide"><dt>სხვა კომენტარი</dt><dd>${b.notes ? esc(b.notes).replace(/\n/g, '<br>') : '—'}</dd></div>
      </dl>
      <form id="bk" class="stack">
        <div class="f"><span>სტატუსი</span><div class="seg">${Object.entries(STATUS).map(([k, l]) => `<label><input type="radio" name="status" value="${k}"${b.status === k ? ' checked' : ''}><span class="bs-${k}">${l}</span></label>`).join('')}</div></div>
        <label class="f"><span>შიდა შენიშვნა (ჩანს მხოლოდ ადმინში)</span><textarea name="note" rows="3" placeholder="მაგ.: ავანსი 100 ₾ გადაიხადა">${esc(b.adminNote || '')}</textarea></label>
        <div class="row-end"><button type="button" class="b b-danger" id="bk-del">${icon(I.trash)}<span>წაშლა</span></button><button class="b b-dark" type="submit">შენახვა</button></div>
      </form>`);
    const f = $('#bk');
    f.onsubmit = async (e) => {
      e.preventDefault();
      const patch = { status: f.status.value, adminNote: f.note.value.trim() };
      await guard(() => Store.updateBooking(b.id, patch), 'შენახულია');
      Object.assign(b, patch); closeSheet(); renderBookings(); badge(state.bookings.filter(x => x.status === 'new').length);
      Store.syncSeats(state.bookings, state.camps).catch(() => {});
    };
    $('#bk-del').onclick = async () => {
      if (!confirm(`წავშალო ${b.name}-ის ჯავშანი სამუდამოდ? აღდგენა შეუძლებელია.`)) return;
      await guard(() => Store.deleteBooking(b.id), 'ჯავშანი წაიშალა');
      state.bookings = state.bookings.filter(x => x.id !== b.id); closeSheet(); renderBookings();
      Store.syncSeats(state.bookings, state.camps).catch(() => {});
    };
  }

  function exportCsv() {
    const qs = [...new Set(state.bookings.flatMap(b => (b.answers || []).map(x => x.q)))];
    const head = ['ბანაკი', 'სახელი და გვარი', 'დაბადების თარიღი', 'ასაკი', 'ტელეფონი', 'ელ-ფოსტა', 'დადასტურება', 'მშობელი', 'მშობლის ტელ.', ...qs, 'კომენტარი', 'სტატუსი', 'შენიშვნა', 'თარიღი'];
    const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const rows = state.bookings.map(b => { const ans = Object.fromEntries((b.answers || []).map(x => [x.q, x.a])); return [b.campTitle, b.name, b.birthDate || '', b.age, b.phone, b.email, b.verifiedVia === 'google' ? 'Google' : (b.verifiedVia ? 'ბმული' : ''), b.parentName, b.parentPhone, ...qs.map(k => ans[k] || ''), b.notes, STATUS[b.status], b.adminNote, fmt(b.createdAt)].map(q).join(','); });
    const blob = new Blob(['﻿' + [head.map(q).join(','), ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'javshnebi-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ------------------------------------------------------------ camp form */
  function campForm(c) {
    const isNew = !c.id;
    const v = (k) => esc(c[k] ?? '');
    openSheet(`
      <h2>${isNew ? 'ახალი ბანაკი' : 'ბანაკის რედაქტირება'}</h2>
      <form id="cf" class="stack">
        <label class="f"><span>სახელი</span><input name="title" value="${v('title')}" required placeholder="ზაფხულის ბანაკი"></label>
        <div class="row2">
          <label class="f"><span>სეზონი</span><select name="season"><option value="winter"${c.season === 'winter' ? ' selected' : ''}>ზამთარი</option><option value="summer"${c.season === 'summer' ? ' selected' : ''}>ზაფხული</option></select></label>
          <label class="f"><span>ადგილი</span><input name="location" value="${v('location')}" placeholder="ბაკურიანი"></label>
        </div>
        <div class="f"><span>რეგისტრაცია</span><div class="seg seg4">${Object.entries(STATE).map(([k, l]) => `<label><input type="radio" name="status" value="${k}"${(c.status || 'soon') === k ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
        <div class="row2">
          <label class="f"><span>დაწყება</span><input type="date" name="start" value="${v('start')}"></label>
          <label class="f"><span>დასრულება</span><input type="date" name="end" value="${v('end')}"></label>
        </div>
        <label class="f"><span>თარიღის ტექსტი, თუ ზუსტი თარიღი ჯერ უცნობია</span><input name="datesText" value="${v('datesText')}" placeholder="თარიღები მალე გამოცხადდება"></label>
        <div class="row3">
          <label class="f"><span>ასაკი, დან</span><input type="number" name="ageMin" value="${v('ageMin')}"></label>
          <label class="f"><span>ასაკი, მდე</span><input type="number" name="ageMax" value="${v('ageMax')}"></label>
          <label class="f"><span>ფასი, ₾</span><input type="number" name="price" value="${v('price')}"></label>
        </div>
        <label class="f"><span>მოკლე აღწერა (ბარათზე)</span><input name="summary" value="${v('summary')}"></label>
        <label class="f"><span>სრული აღწერა</span><textarea name="description" rows="5">${v('description')}</textarea></label>
        <label class="f"><span>ფასში შედის (თითო ხაზზე ერთი)</span><textarea name="includes" rows="4">${v('includes')}</textarea></label>
        <label class="f"><span>პროგრამა (თითო ხაზზე ერთი დღე)</span><textarea name="program" rows="5">${v('program')}</textarea></label>
        <label class="f"><span>ინფორმაცია და წესები (რა წამოიღონ, რა იკრძალება, გასვლის დრო...). სათაური „:“-ით მთავრდება, სია „- “-ით იწყება</span><textarea name="info" rows="12">${v('info')}</textarea></label>
        <div class="f"><span>რეგისტრაციის კითხვები</span>
          <div class="qed" id="qed"></div>
          <button type="button" class="b b-line" id="q-add">${icon(I.plus)}<span>კითხვის დამატება</span></button>
        </div>
        <div class="row2">
          <label class="f"><span>რიგითობა</span><input type="number" name="order" value="${v('order')}"></label>
        </div>
        <div class="row2">
          <label class="f"><span>ადგილების რაოდენობა (0 = შეუზღუდავი). როცა შეივსება, ახალი ჯავშნები მოლოდინის სიაში ჩაიწერება</span><input type="number" min="0" name="capacity" value="${esc(c.capacity ?? 0)}"></label>
          <label class="switch" style="align-self:end;margin-bottom:12px"><input type="checkbox" name="featured"${c.featured ? ' checked' : ''}><span>მთავარ გვერდზე</span></label>
        </div>
        <div class="row-end">${isNew ? '' : `<button type="button" class="b b-danger" id="cf-del">${icon(I.trash)}<span>წაშლა</span></button>`}<button class="b b-dark" type="submit">შენახვა</button></div>
      </form>`);
    const f = $('#cf');
    let questions = (c.questions || []).map(q => Object.assign({}, q));
    const drawQ = () => {
      $('#qed').innerHTML = questions.length ? questions.map((q, i) => `
        <div class="qrow" data-i="${i}">
          <textarea rows="2" data-k="label" placeholder="კითხვის ტექსტი">${esc(q.label)}</textarea>
          <div class="qopts">
            <select data-k="type"><option value="short"${q.type === 'short' ? ' selected' : ''}>მოკლე პასუხი</option><option value="long"${q.type !== 'short' ? ' selected' : ''}>გრძელი პასუხი</option></select>
            <label class="switch sm"><input type="checkbox" data-k="required"${q.required ? ' checked' : ''}><span>სავალდებულო</span></label>
            <span class="qmove"><button type="button" class="icon-b" data-up aria-label="ზემოთ"${i === 0 ? ' disabled' : ''}>↑</button><button type="button" class="icon-b" data-down aria-label="ქვემოთ"${i === questions.length - 1 ? ' disabled' : ''}>↓</button><button type="button" class="icon-b" data-rm aria-label="წაშლა">${icon(I.trash)}</button></span>
          </div>
        </div>`).join('') : '<p class="muted" style="margin:0">კითხვები არ არის. ფორმაში იქნება მხოლოდ სახელი, დაბადების თარიღი და ტელეფონი.</p>';
      $$('.qrow', $('#qed')).forEach(row => {
        const q = questions[+row.dataset.i];
        $$('[data-k]', row).forEach(el => el.oninput = el.onchange = () => { q[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.value; });
        const mv = (d) => { const i = +row.dataset.i, j = i + d; [questions[i], questions[j]] = [questions[j], questions[i]]; drawQ(); };
        $('[data-up]', row).onclick = () => mv(-1);
        $('[data-down]', row).onclick = () => mv(1);
        $('[data-rm]', row).onclick = () => { if (!q.label || confirm('წავშალო ეს კითხვა?')) { questions.splice(+row.dataset.i, 1); drawQ(); } };
      });
    };
    drawQ();
    $('#q-add').onclick = () => { questions.push({ id: 'q' + Store.uid().slice(-6), label: '', type: 'long', required: true }); drawQ(); const t = $$('.qrow textarea', $('#qed')).pop(); t && t.focus(); };
    f.onsubmit = async (e) => {
      e.preventDefault();
      const g = (n) => f.elements[n].value.trim(), num = (n) => g(n) === '' ? null : Number(g(n));
      if (!g('title')) { f.title.focus(); return; }
      const data = {
        id: c.id || (g('season') === 'summer' ? 'summer-' : 'winter-') + (g('start').slice(0, 4) || new Date().getFullYear()) + '-' + Store.uid().slice(-4),
        title: g('title'), season: g('season'), location: g('location'), status: f.status.value,
        start: g('start'), end: g('end'), datesText: g('datesText'), ageMin: num('ageMin'), ageMax: num('ageMax'), price: num('price'),
        summary: g('summary'), description: f.description.value.trim(), includes: f.includes.value.trim(), program: f.program.value.trim(),
        order: num('order') ?? 9, featured: f.featured.checked,
        capacity: Math.max(0, num('capacity') || 0),
        info: f.info.value.trim(), questions: questions.map(q => ({ id: q.id, label: String(q.label || '').trim(), type: q.type === 'short' ? 'short' : 'long', required: !!q.required })).filter(q => q.label)
      };
      await guard(() => Store.saveCamp(data), 'ბანაკი შენახულია');
      views.camps(); closeSheet();
    };
    const d = $('#cf-del');
    if (d) d.onclick = async () => {
      if (!confirm(`წავშალო „${c.title}“? მისი ჯავშნები სიაში დარჩება.`)) return;
      await guard(() => Store.deleteCamp(c.id), 'ბანაკი წაიშალა'); views.camps(); closeSheet();
    };
  }

  /* ------------------------------------------------------------ start */
  let started = false;
  async function start() {
    if (started) return; started = true;
    const me = await Store.whoami().catch(() => null);
    if (!me || me.denied) {
      started = false;
      await Store.logout().catch(() => {});
      loginView(`${me && me.email ? me.email + ' — ' : ''}ამ ანგარიშს ადმინ პანელზე წვდომა არ აქვს. სთხოვე ადმინს, „გუნდში“ დაგამატოს.`);
      return;
    }
    state.me = me;
    try { await Store.seed(); } catch (e) { console.warn('seed', e); }
    shell();
  }
  Store.onAuth(user => { if (user) start(); else { started = false; loginView(); } });
})();
