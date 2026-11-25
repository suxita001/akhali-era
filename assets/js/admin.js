/* ახალი ერა — ადმინ პანელი */
(function () {
  'use strict';
  const { esc, $, $$, campDates, campState, STATE, SEASON, price, tel, logo } = UI;
  const app = $('#app');

  const STATUS = { new: 'ახალი', confirmed: 'დადასტურებული', paid: 'გადახდილი', cancelled: 'გაუქმებული' };
  const VIEWS = {
    bookings: ['ჯავშნები', '<path d="M3.5 13.5 6 5h12l2.5 8.5V19a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/><path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5"/>'],
    camps: ['ბანაკები', '<path d="M12 4 3 20h18z"/><path d="M12 11v9M12 11l-3 9"/>'],
    content: ['ტექსტები', '<path d="M5 6h14M5 11h14M5 16h9"/>'],
    faq: ['კითხვები', '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>'],
    gallery: ['გალერეა', '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-5 4 4 2.5-2.5L20 19"/>'],
  };
  const icon = (p, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I = {
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
          <a class="back" href="index.html">საიტზე დაბრუნება</a>
        </form>
      </main>`;
    const f = $('#login');
    f.querySelector('input').focus();
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
          <a href="index.html" target="_blank">${icon(I.ext)}<span>საიტის ნახვა</span></a>
          <button id="logout">${icon(I.out)}<span>გასვლა</span></button>
        </div>
      </aside>
      <div class="main">
        <header class="top"><h1 id="title"></h1><div class="top-actions" id="top-actions"></div></header>
        ${Store.mode === 'demo' ? '<p class="demo">დემო რეჟიმი — მონაცემები ინახება მხოლოდ ამ ბრაუზერში. რეალური გაშვებისთვის იხილე README.md.</p>' : ''}
        <section class="view" id="view"></section>
      </div>
      <nav class="tabbar">${Object.entries(VIEWS).map(([k, [l, p]]) => `<a href="#${k}" data-v="${k}">${icon(p)}<span>${l}</span><b class="badge" data-badge="${k}"></b></a>`).join('')}</nav>
      <div class="sheet-wrap" id="sheet" hidden><div class="sheet-bg" data-close></div><div class="sheet" role="dialog" aria-modal="true"><button class="sheet-x" data-close aria-label="დახურვა">${icon(I.x)}</button><div id="sheet-body"></div></div></div>`;
    $('#logout').onclick = async () => { await Store.logout(); if (Store.mode === 'demo') loginView(); };
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
        const st = campState(c), n = state.bookings.filter(b => b.campId === c.id && b.status !== 'cancelled').length;
        return `<button class="camp-card ${esc(c.season)}" data-id="${esc(c.id)}">
          <span class="cc-top"><span class="pill st-${st}">${STATE[st]}</span>${c.featured ? '<span class="pill feat">მთავარზე</span>' : ''}</span>
          <b>${esc(c.title)}</b>
          <span class="muted">${esc(campDates(c))}${c.location ? ', ' + esc(c.location) : ''}</span>
          <span class="cc-foot"><span>${esc(price(c))}</span><span>${n} ჯავშანი</span></span>
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

  /* resize to fit one Firestore document (< 1 MB) */
  function shrink(file) {
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let max = 1600, q = .82, out;
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
        <button class="stat ${status === '' ? 'on' : ''}" data-s=""><b>${all.filter(b => b.status !== 'cancelled').length}</b><span>სულ აქტიური</span></button>
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
        <div><dt>ასაკი</dt><dd>${esc(b.age)}</dd></div>
        <div><dt>ტელეფონი</dt><dd>${esc(b.phone)}</dd></div>
        <div><dt>ელ-ფოსტა</dt><dd>${b.email ? `<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>` : '—'}${b.verifiedVia ? `<span class="ver">✓ დადასტურებულია ${b.verifiedVia === 'google' ? 'Google-ით' : 'ბმულით'}</span>` : ''}</dd></div>
        <div><dt>გაგზავნილია</dt><dd>${esc(fmt(b.createdAt))}</dd></div>
        ${b.parentName ? `<div><dt>მშობელი / მეურვე</dt><dd>${esc(b.parentName)}</dd></div><div><dt>მშობლის ტელეფონი</dt><dd>${esc(b.parentPhone)}</dd></div>` : ''}
        <div class="wide"><dt>მონაწილის კომენტარი</dt><dd>${b.notes ? esc(b.notes).replace(/\n/g, '<br>') : '—'}</dd></div>
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
    };
    $('#bk-del').onclick = async () => {
      if (!confirm(`წავშალო ${b.name}-ის ჯავშანი სამუდამოდ? აღდგენა შეუძლებელია.`)) return;
      await guard(() => Store.deleteBooking(b.id), 'ჯავშანი წაიშალა');
      state.bookings = state.bookings.filter(x => x.id !== b.id); closeSheet(); renderBookings();
    };
  }

  function exportCsv() {
    const head = ['ბანაკი', 'სახელი და გვარი', 'ასაკი', 'ტელეფონი', 'ელ-ფოსტა', 'დადასტურება', 'მშობელი', 'მშობლის ტელ.', 'კომენტარი', 'სტატუსი', 'შენიშვნა', 'თარიღი'];
    const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const rows = state.bookings.map(b => [b.campTitle, b.name, b.age, b.phone, b.email, b.verifiedVia === 'google' ? 'Google' : (b.verifiedVia ? 'ბმული' : ''), b.parentName, b.parentPhone, b.notes, STATUS[b.status], b.adminNote, fmt(b.createdAt)].map(q).join(','));
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
        <div class="row2">
          <label class="f"><span>რიგითობა</span><input type="number" name="order" value="${v('order')}"></label>
          <label class="switch" style="align-self:end;margin-bottom:12px"><input type="checkbox" name="featured"${c.featured ? ' checked' : ''}><span>მთავარ გვერდზე</span></label>
        </div>
        <div class="row-end">${isNew ? '' : `<button type="button" class="b b-danger" id="cf-del">${icon(I.trash)}<span>წაშლა</span></button>`}<button class="b b-dark" type="submit">შენახვა</button></div>
      </form>`);
    const f = $('#cf');
    f.onsubmit = async (e) => {
      e.preventDefault();
      const g = (n) => f.elements[n].value.trim(), num = (n) => g(n) === '' ? null : Number(g(n));
      if (!g('title')) { f.title.focus(); return; }
      const data = {
        id: c.id || (g('season') === 'summer' ? 'summer-' : 'winter-') + (g('start').slice(0, 4) || new Date().getFullYear()) + '-' + Store.uid().slice(-4),
        title: g('title'), season: g('season'), location: g('location'), status: f.status.value,
        start: g('start'), end: g('end'), datesText: g('datesText'), ageMin: num('ageMin'), ageMax: num('ageMax'), price: num('price'),
        summary: g('summary'), description: f.description.value.trim(), includes: f.includes.value.trim(), program: f.program.value.trim(),
        order: num('order') ?? 9, featured: f.featured.checked
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
    try { await Store.seed(); } catch (e) { console.warn('seed', e); }
    shell();
  }
  Store.onAuth(user => { if (user) start(); else { started = false; loginView(); } });
})();
