/* ახალი ერა — საიტის გვერდები */
(function () {
  'use strict';
  const { esc, lines, paras, $, $$, campDates, campDays, daysUntil, campState, seatsLeft, withSeats, STATE, SEASON, price, ages, tel, logo, boot } = UI;
  const page = document.body.dataset.page;
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- line-art scenes, same stroke language as the logo ---------- */
  function seasonArt(season) {
    if (season === 'summer') return `
<svg class="season-art art" viewBox="0 0 600 320" preserveAspectRatio="xMidYMax slice" fill="none" stroke="#12392b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="430" cy="120" r="46" fill="#f4bc3f" stroke="none"/>
  <path d="M430 46v-18M430 214v-10M356 120h-18M522 120h-18M378 68l-12-12M482 68l12-12M378 172l-12 12M482 172l12 12" stroke="#c48b0e"/>
  <path d="M0 250c80-40 150-44 230-18s170 20 250-14 100-20 120-12" />
  <path d="M0 290c110-30 210-26 300-6s200 8 300-18" />
  <path d="M70 248l18-56 18 56zM96 252l14-42 14 42zM500 240l18-60 18 60zM530 246l12-38 12 38z"/>
  <path d="M260 282l38-58 38 58zM298 224v58M290 244q-8 18-10 38"/>
</svg>`;
    return `
<svg class="season-art art" viewBox="0 0 600 320" preserveAspectRatio="xMidYMax slice" fill="none" stroke="#12392b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="470" cy="70" r="26" fill="#fff" stroke="none"/>
  <path d="M-10 250 110 110l60 70 100-130 120 150 50-50 180 110" />
  <path d="M110 110l20 24-14-4-10 10-10-12-12 2M270 50l26 34-16-6-12 14-12-14-14 4" />
  <path d="M-10 290c120-26 230-30 330-12s200 12 290-10" />
  <path d="M60 282l16-50 16 50zM84 286l12-36 12 36zM500 276l16-52 16 52zM524 280l11-34 11 34z"/>
  <path d="M262 300l36-56 36 56zM298 244v56M290 262q-8 18-10 38"/>
  <g fill="#fff" stroke="none"><circle cx="60" cy="50" r="3"/><circle cx="150" cy="30" r="2.4"/><circle cx="210" cy="80" r="3"/><circle cx="360" cy="40" r="2.4"/><circle cx="560" cy="130" r="3"/><circle cx="30" cy="150" r="2.4"/><circle cx="400" cy="120" r="2"/></g>
</svg>`;
  }

  function rays(cx, cy, r, w, h, { from = -200, to = 20, step = 7.5 } = {}) {
    const far = Math.hypot(w, h) * 1.2;
    let out = '', i = 0;
    for (let a = from; a <= to + .01; a += step, i++) {
      const rad = a * Math.PI / 180, long = i % 2 === 0;
      const r0 = r * (long ? 1.32 : 1.38), r1 = long ? far : r * (1.75 + (i % 4 === 1 ? .25 : 0));
      const x1 = cx + Math.cos(rad) * r0, y1 = cy + Math.sin(rad) * r0, x2 = cx + Math.cos(rad) * r1, y2 = cy + Math.sin(rad) * r1;
      const len = Math.round(r1 - r0);
      const d = (Math.abs(a + 90) / 110 * .5).toFixed(2);
      out += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="${long ? 1.4 : 2.4}" stroke-opacity="${long ? .2 : .7}" style="--len:${len};--d:${d}s"/>`;
    }
    return out;
  }

  function heroSky(el) {
    const draw = () => {
      const w = el.clientWidth, h = el.clientHeight, narrow = w < 760;
      const grid = el.parentElement.querySelector('.hero-grid');
      const top = grid ? grid.offsetTop : h * .4;
      const cx = narrow ? w * .5 : w * .6;
      const cy = narrow ? top * .58 : h * .34;
      const r = narrow ? Math.min(top * .2, w * .19) : Math.max(70, Math.min(w, h) * .15);
      const s = r / 43, tx = cx - 100 * s, ty = cy - 101 * s;
      el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
        <g class="rays">${rays(cx, cy, r, w, h)}</g>
        <g transform="translate(${tx} ${ty}) scale(${s})" stroke-width="${(2.4 / s).toFixed(3)}">
          <path class="sun-ring" d="M64 124.5A43 43 0 1 1 136 124.5"/>
          <g class="tent"><path d="M100 47V80"/><path d="M100 82 50 141h100z"/><path d="M82 103q18 10 36 0M100 108v33M93 108q-7 14-9 33"/></g>
        </g></svg>`;
    };
    draw();
    let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (Math.abs(el.dataset.w - el.clientWidth) > 40) { el.dataset.w = el.clientWidth; draw(); } }, 150); });
    el.dataset.w = el.clientWidth;
  }

  function headRays(el) {
    el.innerHTML = `<svg viewBox="0 0 400 400" aria-hidden="true">${rays(200, 200, 70, 400, 400, { from: 0, to: 352.5, step: 7.5 }).replace(/style="[^"]*"/g, '')}<circle cx="200" cy="200" r="70" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
  }

  /* ---------- the ski-pass card ---------- */
  function pass(c, { cord = false, cta = true, note = true } = {}) {
    if (!c) return '';
    const st = campState(c), d = daysUntil(c), s = parse(c.start), e = parse(c.end);
    const bigDate = s ? (e && s.getMonth() === e.getMonth() ? `${s.getDate()}–${e.getDate()} ${MONTHS[e.getMonth()]}` : campDates(c, false)) : (c.datesText ? 'მალე' : '—');
    return `<article class="pass" aria-label="${esc(c.title)}">
      ${cord ? '<span class="pass-cord" aria-hidden="true"></span>' : ''}
      <div class="pass-head"><span class="pass-season ${esc(c.season)}">${SEASON[c.season] || ''} ${s ? s.getFullYear() : ''}</span><span class="pass-state s-${st}">${STATE[st]}</span></div>
      <p class="pass-date">${esc(bigDate)}</p>
      <p class="pass-title">${esc(c.title)}${!s && c.datesText ? ' — ' + esc(c.datesText) : ''}</p>
      <dl class="pass-rows">
        <div><dt>ადგილი</dt><dd>${esc(c.location || 'მალე')}</dd></div>
        <div><dt>ასაკი</dt><dd>${esc(ages(c) || '—')}</dd></div>
        ${campDays(c) ? `<div><dt>ხანგრძლივობა</dt><dd>${campDays(c)} დღე</dd></div>` : ''}
        <div><dt>ფასი</dt><dd>${esc(price(c))}</dd></div>
        ${seatsLeft(c) !== null && (st === 'open' || st === 'full') ? `<div><dt>თავისუფალი ადგილი</dt><dd class="${seatsLeft(c) <= 5 ? 'few' : ''}">${seatsLeft(c)} / ${esc(c.capacity)}</dd></div>` : ''}
      </dl>
      ${cta && st === 'open' ? `<a class="btn btn-forest" href="book.html?camp=${encodeURIComponent(c.id)}">ადგილის დაჯავშნა</a>` : ''}
      ${cta && st === 'full' ? `<a class="btn btn-line" href="book.html?camp=${encodeURIComponent(c.id)}">მოლოდინის სიაში ჩაწერა</a>` : ''}
      ${note && (st === 'open' || st === 'full') && d > 0 ? `<p class="pass-note">${st === 'full' ? 'ადგილი გათავისუფლდება — დაგიკავშირდებით რიგის მიხედვით' : 'დაწყებამდე ' + d + ' დღე'}</p>` : ''}
      ${st === 'soon' && note ? '<p class="pass-note">რეგისტრაცია მალე დაიწყება</p>' : ''}
      <div class="pass-foot"><span class="barcode" aria-hidden="true"></span><span>AE-${esc(String(c.id).slice(0, 14).toUpperCase())}</span></div>
    </article>`;
  }
  const MONTHS = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];
  const parse = (d) => { if (!d) return null; const [y, m, day] = d.split('-').map(Number); return new Date(y, m - 1, day); };
  /* age on the first day of the camp (or today, if the date isn't set) */
  function ageAt(birth, c) {
    const b = parse(birth); if (!b || isNaN(b)) return null;
    const at = parse(c && c.start) || new Date();
    let a = at.getFullYear() - b.getFullYear();
    if (at.getMonth() < b.getMonth() || (at.getMonth() === b.getMonth() && at.getDate() < b.getDate())) a--;
    return a;
  }
  const geDate = (d) => { const x = parse(d); return x ? x.getDate() + ' ' + MONTHS[x.getMonth()] + ', ' + x.getFullYear() : ''; };
  /* plain text → headings, bullet lists and paragraphs (admin writes plain text) */
  function richText(t) {
    return String(t || '').trim().split(/\n\s*\n/).map(block => {
      const ls = block.split('\n').map(x => x.trim()).filter(Boolean);
      let head = '';
      if (ls.length > 1 && /:$/.test(ls[0])) head = `<h3>${esc(ls.shift().replace(/:$/, ''))}</h3>`;
      if (ls.length && ls.every(x => /^[-•·*]\s*/.test(x))) return head + '<ul>' + ls.map(x => `<li>${esc(x.replace(/^[-•·*]\s*/, ''))}</li>`).join('') + '</ul>';
      return head + ls.map(x => { const m = x.match(/^([^:]{2,24}):\s+(.+)$/); return m ? `<p><b>${esc(m[1])}:</b> ${esc(m[2])}</p>` : `<p>${esc(x)}</p>`; }).join('');
    }).join('');
  }

  function seasonCard(c, tag = 'h3') {
    const st = campState(c);
    return `<a class="season ${esc(c.season)}" href="camp.html?id=${encodeURIComponent(c.id)}">
      <div>
        <div class="season-top"><span>${SEASON[c.season] || ''}</span><span class="chip s-${st}">${STATE[st]}</span></div>
        <${tag}>${esc(c.title)}</${tag}>
        <p class="season-meta">${esc(campDates(c))}${c.location ? ', ' + esc(c.location) : ''}</p>
        ${c.summary ? `<p class="muted" style="margin:6px 0 0;max-width:24em">${esc(c.summary)}</p>` : ''}
      </div>
      ${seasonArt(c.season)}
      <span class="season-go" aria-hidden="true">${arrow}</span>
    </a>`;
  }

  function faqList(items, openFirst) {
    return `<div class="faq">${items.map((f, i) => `<details${openFirst && i === 0 ? ' open' : ''}><summary>${esc(f.q)}<i aria-hidden="true"></i></summary><div class="answer">${paras(f.a)}</div></details>`).join('')}</div>`;
  }

  function programList(c, vertical) {
    const items = lines(c.program);
    if (!items.length) return '';
    return `<ol class="program${vertical ? ' vertical' : ''}" style="--n:${Math.min(items.length, 6)}">${items.map((p, i) => {
      const m = p.match(/^(.+?)\s+[—–-]\s+(.+)$/);
      return `<li><small>დღე ${i + 1}</small><b>${esc(m ? m[2] : p)}</b></li>`;
    }).join('')}</ol>`;
  }

  /* ---------- pages ---------- */
  const pages = {
    async home(content) {
      const [camps, faq, photos, reviews] = await Promise.all([Store.camps().then(withSeats), Store.faq(), Store.gallery().catch(() => []), Store.list('reviews')]);
      const featured = camps.find(c => c.featured) || camps.find(c => campState(c) === 'open') || camps[0];
      const words = content.siteName.trim().split(/\s+/);
      $('#hero-title').innerHTML = words.map(w => `<span>${esc(w)}</span>`).join('');
      $('#hero-line').textContent = content.heroLine;
      $('#hero-text').textContent = content.heroText;
      $('#hero-pass').innerHTML = pass(featured, { cord: true });
      heroSky($('#hero-sky'));

      $('#manifesto').textContent = content.manifesto;
      $('#values').innerHTML = (content.values || []).map(v => `<div class="value"><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></div>`).join('');
      $('#seasons').innerHTML = camps.slice(0, 2).map(c => seasonCard(c)).join('');

      const prog = featured && programList(featured);
      if (prog) {
        $("#program-title").textContent = "დღე დღეზე";
        $('#program').innerHTML = prog;
        $('#program-link').href = 'camp.html?id=' + encodeURIComponent(featured.id);
      } else $('#program-sec').remove();

      if (photos.length >= 3) {
        $('#strip').innerHTML = photos.slice(0, 5).map(p => `<a href="gallery.html"><img src="${p.src}" alt="${esc(p.caption || 'ფოტო ბანაკიდან')}" loading="lazy"></a>`).join('');
      } else $('#photos-sec').remove();

      $('#faq').innerHTML = faqList(faq.slice(0, 5));

      if (reviews.length) {
        $('#reviews').innerHTML = reviews.map(r => `<figure class="review-card"><blockquote>${esc(r.quote)}</blockquote><figcaption><b>${esc(r.name)}</b>${r.detail ? `<span>${esc(r.detail)}</span>` : ''}</figcaption></figure>`).join('');
      } else $('#reviews-sec').remove();

      /* structured data: lets Google show the camps as events */
      const base = location.href.replace(/[^/]*$/, '');
      const events = camps.filter(c => c.start && ['open', 'full', 'soon'].includes(campState(c))).map(c => ({
        '@type': 'Event', name: c.title + ' — ' + content.siteName, startDate: c.start, endDate: c.end || c.start,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', eventStatus: 'https://schema.org/EventScheduled',
        location: { '@type': 'Place', name: c.location || 'საქართველო', address: { '@type': 'PostalAddress', addressLocality: c.location || '', addressCountry: 'GE' } },
        description: c.summary || content.heroText, image: [base + 'assets/img/og.png'], url: base + 'camp.html?id=' + encodeURIComponent(c.id),
        organizer: { '@type': 'Organization', name: content.siteName, url: base },
        offers: c.price ? { '@type': 'Offer', price: String(c.price), priceCurrency: 'GEL', url: base + 'book.html?camp=' + encodeURIComponent(c.id), availability: campState(c) === 'full' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' } : undefined,
      }));
      const ld = document.createElement('script'); ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization', name: content.siteName, url: base, logo: base + 'assets/img/icon-512.png', email: content.email || undefined, telephone: content.phone || undefined, sameAs: [content.instagram, content.facebook].filter(Boolean) }, ...events] });
      document.head.appendChild(ld);
    },

    async camps() {
      const camps = await withSeats(await Store.camps());
      headRays($('.head-rays'));
      $('#camp-list').innerHTML = camps.map(c => seasonCard(c, 'h2')).join('');
    },

    async camp() {
      const id = new URLSearchParams(location.search).get('id');
      const camps = await withSeats(await Store.camps());
      const c = camps.find(x => x.id === id) || camps.find(x => x.featured) || camps[0];
      if (!c) return;
      document.title = c.title + ' — ' + document.title.split(' — ').pop();
      const st = campState(c);
      $('#camp-hero').className = 'camp-hero ' + c.season;
      $('#camp-hero').innerHTML = `<div class="wrap"><a class="back" href="camps.html">← ყველა ბანაკი</a><h1 class="h1">${esc(c.title)}</h1><p class="lead" style="margin:18px 0 0">${esc(campDates(c))}${c.location ? ', ' + esc(c.location) : ''}</p></div>${seasonArt(c.season)}`;
      const inc = lines(c.includes);
      $('#camp-body').innerHTML = `
        <div>
          <div class="prose">${paras(c.description)}</div>
          ${inc.length ? `<div class="block"><h2 class="h3">ფასში შედის</h2><ul class="ticks">${inc.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>` : ''}
          ${lines(c.program).length ? `<div class="block"><h2 class="h3">პროგრამა</h2>${programList(c, true)}</div>` : ''}
          ${c.info ? `<div class="block"><h2 class="h3">რა უნდა იცოდე</h2><div class="rich">${richText(c.info)}</div></div>` : ''}
          ${st !== 'open' ? `<div class="block"><p class="muted">${st === 'soon' ? 'რეგისტრაცია ჯერ არ დაწყებულა. ' : ''}კითხვებისთვის <a class="link" href="faq.html#contact">დაგვიკავშირდი</a>.</p></div>` : ''}
        </div>
        ${pass(c)}`;
    },

    async about(content) {
      headRays($('.head-rays'));
      $('#about-title').textContent = content.aboutTitle;
      $('#about-lead').textContent = content.manifesto;
      $('#about-mark').innerHTML = logo();
      $('#about-text').innerHTML = paras(content.aboutText);
      $('#values').innerHTML = (content.values || []).map(v => `<div class="value"><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></div>`).join('');
      const [people, reviews] = await Promise.all([Store.list('people'), Store.list('reviews')]);
      if (people.length) $('#leaders').innerHTML = people.map(p => `<figure class="leader">${p.photo ? `<img src="${p.photo}" alt="${esc(p.name)}" loading="lazy">` : `<span class="leader-ph">${logo()}</span>`}<figcaption><b>${esc(p.name)}</b>${p.role ? `<span>${esc(p.role)}</span>` : ''}${p.bio ? `<p>${esc(p.bio)}</p>` : ''}</figcaption></figure>`).join('');
      else $('#leaders-sec').remove();
      if (reviews.length) $('#reviews').innerHTML = reviews.map(r => `<figure class="review-card"><blockquote>${esc(r.quote)}</blockquote><figcaption><b>${esc(r.name)}</b>${r.detail ? `<span>${esc(r.detail)}</span>` : ''}</figcaption></figure>`).join('');
      else $('#reviews-sec').remove();
    },

    async gallery() {
      headRays($('.head-rays'));
      const photos = await Store.gallery();
      const box = $('#gallery');
      if (!photos.length) {
        box.innerHTML = `<div class="empty">${logo()}<h3>ფოტოები მალე დაემატება</h3><p class="muted">ბანაკის შემდეგ აქ საუკეთესო კადრები გამოჩნდება.</p></div>`;
        return;
      }
      box.innerHTML = `<div class="masonry">${photos.map((p, i) => `<button data-i="${i}" aria-label="ფოტოს გადიდება"><img src="${p.src}" alt="${esc(p.caption || 'ფოტო ბანაკიდან')}" loading="lazy">${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ''}</button>`).join('')}</div>`;
      const lb = $('#lightbox'), img = $('img', lb), cap = $('p', lb);
      let idx = 0;
      const show = (i) => { idx = (i + photos.length) % photos.length; img.src = photos[idx].src; img.alt = photos[idx].caption || ''; cap.textContent = photos[idx].caption || ''; };
      const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
      $$('.masonry button').forEach(b => b.onclick = () => { show(+b.dataset.i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); });
      $('.lb-close', lb).onclick = close;
      $('.lb-prev', lb).onclick = () => show(idx - 1);
      $('.lb-next', lb).onclick = () => show(idx + 1);
      lb.onclick = (e) => { if (e.target === lb) close(); };
      document.addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
      let sx = 0;
      lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
      lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
    },

    async faq(content) {
      headRays($('.head-rays'));
      $('#faq').innerHTML = faqList(await Store.faq(), true);
      $('#contact-note').textContent = content.contactNote;
      $('#contact-list').innerHTML = [
        content.phone && `<a href="tel:${tel(content.phone)}"><small>ტელეფონი</small><b>${esc(content.phone)}</b></a>`,
        content.email && `<a href="mailto:${esc(content.email)}"><small>ელ-ფოსტა</small><b>${esc(content.email)}</b></a>`,
        content.instagram && `<a href="${esc(content.instagram)}" target="_blank" rel="noopener"><small>Instagram</small><b>მოგვწერე</b></a>`,
        content.facebook && `<a href="${esc(content.facebook)}" target="_blank" rel="noopener"><small>Facebook</small><b>მოგვწერე</b></a>`,
      ].filter(Boolean).join('');
    },

    async book(content) {
      const camps = (await withSeats(await Store.camps())).filter(c => ['open', 'full'].includes(campState(c)));
      const root = $('#book');
      $('#book-intro').textContent = content.bookingIntro;
      if (!camps.length) {
        root.innerHTML = `<div class="empty">${logo()}<h3>ახლა რეგისტრაცია დახურულია</h3><p class="muted">ახალი ბანაკის გამოცხადებისთანავე აქ შეძლებ დაჯავშნას.</p><a class="btn btn-forest" href="faq.html#contact">დაგვიკავშირდი</a></div>`;
        return;
      }

      /* ---- draft: survives reloads and the email-link tab ---- */
      const DKEY = 'ae-booking-draft';
      const load = () => { try { return JSON.parse(localStorage.getItem(DKEY)) || null; } catch (e) { return null; } };
      const save = (d) => localStorage.setItem(DKEY, JSON.stringify(d));
      const clear = () => localStorage.removeItem(DKEY);
      let draft = load();
      const want = new URLSearchParams(location.search).get('camp');
      if (draft && !camps.some(c => c.id === draft.campId)) draft = null;
      if (!draft) draft = { campId: (camps.find(c => c.id === want) || camps[0]).id, step: 'form', startedAt: Date.now() };
      else if (want && camps.some(c => c.id === want) && draft.step === 'form') draft.campId = want;
      const camp = () => camps.find(c => c.id === draft.campId) || camps[0];

      /* ---- helpers ---- */
      const digits = (s) => String(s || '').replace(/\D/g, '');
      const geFmt = (n) => '+995 ' + n.slice(0, 3) + ' ' + n.slice(3, 5) + ' ' + n.slice(5, 7) + ' ' + n.slice(7);
      function normPhone(raw) {
        const s = String(raw || '').trim(); let d = digits(s);
        if (d.startsWith('995') && d.length === 12) d = d.slice(3);
        if (/^5\d{8}$/.test(d)) return geFmt(d);
        if (s.startsWith('+') && !s.startsWith('+995') && d.length >= 8 && d.length <= 15) return '+' + d;
        return null;
      }
      const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'mail.ru', 'live.com', 'yandex.ru'];
      function lev(a, b) { const m = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) m[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return m[a.length][b.length]; }
      function suggest(email) {
        const [u, d] = String(email).toLowerCase().split('@'); if (!u || !d || DOMAINS.includes(d)) return null;
        const best = DOMAINS.map(x => [x, lev(d, x)]).sort((a, b) => a[1] - b[1])[0];
        return best[1] > 0 && best[1] <= 2 ? u + '@' + best[0] : null;
      }
      const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e);
      const continueUrl = () => location.protocol.startsWith('http') ? location.origin + location.pathname + '?verified=1' : undefined;
      const errMsg = (e) => ({
        'email-in-use': 'ამ ელ-ფოსტით დადასტურება სხვა მოწყობილობაზე უკვე დაიწყო. გამოიყენე Google ან სხვა ელ-ფოსტა.',
        'bad-email': 'ელ-ფოსტა არასწორია.',
        'too-many': 'ძალიან ბევრი მცდელობა. სცადე რამდენიმე წუთში.',
        'auth/unauthorized-domain': 'ეს საიტი Firebase-ში ჯერ არ არის დაშვებული (Authentication → Settings → Authorized domains).',
        'auth/unauthorized-continue-uri': 'ეს საიტი Firebase-ში ჯერ არ არის დაშვებული (Authentication → Settings → Authorized domains).',
        'auth/operation-not-allowed': 'ეს შესვლის მეთოდი Firebase-ში გამორთულია (Authentication → Sign-in method).',
        'auth/network-request-failed': 'ინტერნეტთან კავშირი ვერ დამყარდა. სცადე თავიდან.',
      }[e.code] || 'ვერ მოხერხდა. სცადე თავიდან.' + (e.code ? ' (' + e.code + ')' : ''));

      /* ---------------- step 1: details ---------------- */
      function renderForm() {
        draft.step = 'form'; save(draft);
        const c = camp();
        draft.answers = draft.answers || {};
        const qs = (x) => (x.questions || []).filter(q => q && q.label);
        const questionsHtml = (x) => qs(x).map(q => `
                  <label class="field full"><span>${esc(q.label)}${q.required ? '' : ' <em>(არასავალდებულო)</em>'}</span>
                    ${q.type === 'long'
                      ? `<textarea name="q_${esc(q.id)}" maxlength="2000" rows="3">${esc(draft.answers[q.id] || '')}</textarea>`
                      : `<input name="q_${esc(q.id)}" maxlength="300" value="${esc(draft.answers[q.id] || '')}">`}
                    <small class="err"></small></label>`).join('');
        const infoHtml = (x) => x.info ? `
              <details class="camp-info"${draft.infoOpen ? ' open' : ''}><summary>ბანაკის ინფორმაცია და წესები <span>წაიკითხე რეგისტრაციამდე</span></summary><div class="rich">${richText(x.info)}</div></details>` : '';
        const today = new Date().toISOString().slice(0, 10);
        root.innerHTML = `
          <div class="book-grid">
            <div id="book-pass">${pass(c, { cta: false })}</div>
            <form class="form" id="form" novalidate>
              <ol class="steps" aria-label="ნაბიჯები"><li aria-current="step">მონაცემები</li><li>დადასტურება</li></ol>
              <fieldset><legend>ბანაკი</legend>
                <div class="picks">${camps.map(x => `<label class="pick"><input type="radio" name="camp" value="${esc(x.id)}"${x.id === c.id ? ' checked' : ''}><span><b>${esc(x.title)}</b><em>${esc(price(x))}</em><small>${esc(campDates(x))}${x.location ? ', ' + esc(x.location) : ''}${campState(x) === 'full' ? ' · <b class="wl">ადგილები შევსებულია — მოლოდინის სია</b>' : ''}</small></span></label>`).join('')}</div>
                <div id="info-slot">${infoHtml(c)}</div>
              </fieldset>
              <fieldset><legend>მონაწილე</legend>
                <div class="fields">
                  <label class="field full"><span>სახელი და გვარი</span><input name="name" autocomplete="name" maxlength="120" value="${esc(draft.name)}"><small class="err"></small></label>
                  <label class="field"><span>დაბადების თარიღი</span><input name="birthDate" type="date" min="1940-01-01" max="${today}" value="${esc(draft.birthDate)}"><small class="err"></small></label>
                  <label class="field"><span>მობილური</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="555 12 34 56" value="${esc(draft.phone)}"><small class="err"></small></label>
                </div>
              </fieldset>
              <fieldset id="guardian" hidden><legend>მშობელი ან მეურვე</legend>
                <p class="hint">18 წლამდე მონაწილისთვის საჭიროა მშობლის ან მეურვის კონტაქტი.</p>
                <div class="fields">
                  <label class="field"><span>სახელი და გვარი</span><input name="parentName" maxlength="120" value="${esc(draft.parentName)}"><small class="err"></small></label>
                  <label class="field"><span>მობილური</span><input name="parentPhone" type="tel" inputmode="tel" placeholder="555 12 34 56" value="${esc(draft.parentPhone)}"><small class="err"></small></label>
                </div>
              </fieldset>
              <fieldset id="questions"${qs(c).length ? '' : ' hidden'}><legend>რამდენიმე კითხვა</legend>
                <div class="fields" id="q-slot">${questionsHtml(c)}</div>
              </fieldset>
              <fieldset><legend>დამატებით</legend>
                <label class="field"><span>სხვა კომენტარი <em>(არასავალდებულო)</em></span><textarea name="notes" maxlength="1500">${esc(draft.notes)}</textarea><small class="err"></small></label>
                <label class="hp" aria-hidden="true">ვებსაიტი <input name="website" tabindex="-1" autocomplete="off"></label>
              </fieldset>
              <div class="consents">
                <label class="consent" id="rules-consent"${c.info ? '' : ' hidden'}><input type="checkbox" name="rules"${draft.rules ? ' checked' : ''}><span>გავეცანი ბანაკის ინფორმაციას და წესებს და ვეთანხმები მათ.</span></label>
                <label class="consent"><input type="checkbox" name="consent"${draft.consent ? ' checked' : ''}><span>ვეთანხმები, რომ ჩემს მონაცემებს გამოიყენებენ მხოლოდ ბანაკთან დაკავშირებით დასაკავშირებლად.</span></label>
                <small class="err" id="consent-err"></small>
              </div>
              <button class="btn btn-sun btn-lg btn-block" type="submit">გაგრძელება</button>
            </form>
          </div>`;
        const form = $('#form'), f = (n) => form.elements[n];
        const ageNow = () => ageAt(f('birthDate').value, camp());
        const syncGuardian = () => { const a = ageNow(); $('#guardian').hidden = !(a !== null && a < 18); };
        syncGuardian();
        const keep = () => {
          ['name', 'birthDate', 'phone', 'parentName', 'parentPhone', 'notes'].forEach(n => draft[n] = f(n).value);
          qs(camp()).forEach(q => { const el = f('q_' + q.id); if (el) draft.answers[q.id] = el.value; });
          draft.consent = f('consent').checked; draft.rules = f('rules').checked; draft.campId = form.elements.camp.value;
          const d = $('.camp-info', form); draft.infoOpen = d ? d.open : false;
          save(draft);
        };
        form.addEventListener('input', () => { syncGuardian(); keep(); });
        form.addEventListener('change', e => {
          keep();
          if (e.target.name === 'camp') {
            const x = camp();
            $('#book-pass').innerHTML = pass(x, { cta: false });
            $('#info-slot').innerHTML = infoHtml(x);
            $('#q-slot').innerHTML = questionsHtml(x);
            $('#questions').hidden = !qs(x).length;
            $('#rules-consent').hidden = !x.info;
            syncGuardian();
          }
        });
        form.addEventListener('toggle', keep, true);
        ['phone', 'parentPhone'].forEach(n => f(n).addEventListener('blur', () => { const p = normPhone(f(n).value); if (p) { f(n).value = p; keep(); } }));
        const setErr = (n, msg) => { const el = f(n) && f(n).closest('.field'); if (!el) return; el.classList.toggle('bad', !!msg); el.querySelector('.err').textContent = msg || ''; };

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (f('website').value) { root.innerHTML = '<p class="lead">მადლობა!</p>'; return; }
          keep();
          const c = camp(), v = (n) => f(n).value.trim(), age = ageNow(), errs = {};
          if (v('name').length < 3 || !/\s/.test(v('name'))) errs.name = 'ჩაწერე სახელიც და გვარიც';
          if (age === null || age < 5 || age > 99) errs.birthDate = 'აირჩიე დაბადების თარიღი';
          else if ((c.ageMin && age < c.ageMin) || (c.ageMax && age > c.ageMax)) errs.birthDate = `ბანაკის დროს იქნები ${age} წლის. ამ ბანაკის ასაკია ${ages(c)}`;
          const phone = normPhone(v('phone'));
          if (!phone) errs.phone = 'ჩაწერე მობილური, მაგ. 555 12 34 56';
          let pPhone = '';
          if (age !== null && age < 18) {
            if (v('parentName').length < 3) errs.parentName = 'ჩაწერე სახელი და გვარი';
            pPhone = normPhone(v('parentPhone'));
            if (!pPhone) errs.parentPhone = 'ჩაწერე მობილური, მაგ. 555 12 34 56';
            else if (pPhone === phone) errs.parentPhone = 'მშობლის ნომერი მონაწილის ნომრისგან უნდა განსხვავდებოდეს';
          }
          qs(c).forEach(q => { if (q.required && !(draft.answers[q.id] || '').trim()) errs['q_' + q.id] = 'ეს კითხვა სავალდებულოა'; });
          ['name', 'birthDate', 'phone', 'parentName', 'parentPhone', 'notes', ...qs(c).map(q => 'q_' + q.id)].forEach(n => setErr(n, errs[n]));
          const needRules = !!c.info && !f('rules').checked;
          $('#consent-err').textContent = needRules ? 'გასაგრძელებლად მონიშნე, რომ გაეცანი ბანაკის წესებს' : (f('consent').checked ? '' : 'გასაგრძელებლად მონიშნე თანხმობა');
          if (Object.keys(errs).length || needRules || !f('consent').checked) { (form.querySelector('.bad input, .bad textarea') || (needRules ? f('rules') : f('consent'))).focus(); return; }
          Object.assign(draft, { name: v('name').replace(/\s+/g, ' '), age, phone, parentName: age < 18 ? v('parentName') : '', parentPhone: age < 18 ? pPhone : '', notes: v('notes') });
          renderVerify();
          window.scrollTo({ top: $('#book').offsetTop - 100, behavior: 'smooth' });
        });
      }

      /* ---------------- step 2: review + verify ---------------- */
      let poll = null;
      function renderVerify(note = '') {
        draft.step = 'verify'; save(draft);
        const c = camp();
        const google = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6a5.1 5.1 0 0 1-2.2 3.4v2.8h3.6c2-1.9 3.2-4.7 3.2-8.2z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 10z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"/></svg>`;
        root.innerHTML = `
          <div class="book-grid is-verify">
            <div id="book-pass">${pass(c, { cta: false })}</div>
            <div class="form">
              <ol class="steps" aria-label="ნაბიჯები"><li class="done-step">მონაცემები</li><li aria-current="step">დადასტურება</li></ol>
              <section>
                <div class="review-head"><h2 class="legend">შეამოწმე მონაცემები</h2><button class="link-btn" id="edit">შეცვლა</button></div>
                <dl class="review">
                  <div><dt>ბანაკი</dt><dd>${esc(c.title)}, ${esc(campDates(c))}</dd></div>
                  <div><dt>მონაწილე</dt><dd>${esc(draft.name)}, ${esc(geDate(draft.birthDate))} (${esc(draft.age)} წლის)</dd></div>
                  <div><dt>მობილური</dt><dd>${esc(draft.phone)}</dd></div>
                  ${draft.parentName ? `<div><dt>მშობელი</dt><dd>${esc(draft.parentName)}, ${esc(draft.parentPhone)}</dd></div>` : ''}
                  ${(c.questions || []).filter(q => q && q.label && (draft.answers || {})[q.id]).map(q => `<div><dt>${esc(q.label.length > 60 ? q.label.slice(0, 57) + '…' : q.label)}</dt><dd>${esc(draft.answers[q.id])}</dd></div>`).join('')}
                  ${draft.notes ? `<div><dt>კომენტარი</dt><dd>${esc(draft.notes)}</dd></div>` : ''}
                </dl>
              </section>
              <section class="verify" id="verify">
                <h2 class="legend">დაადასტურე ელ-ფოსტა</h2>
                <p class="muted">ერთი ელ-ფოსტით ერთ ბანაკზე ერთი ჯავშანი კეთდება. ასე ყველა ჯავშანი ნამდვილია და ამ მისამართზეც დაგიკავშირდებით.</p>
                <p class="form-error" id="v-error" role="alert">${esc(note)}</p>
                <button class="btn btn-google btn-lg btn-block" id="g">${google}<span>Google-ით დადასტურება</span></button>
                <p class="or"><span>ან ელ-ფოსტაზე ბმულით</span></p>
                <form id="ef" class="email-row" novalidate>
                  <label class="field"><span class="sr">ელ-ფოსტა</span><input name="email" type="email" inputmode="email" autocomplete="email" placeholder="შენი ელ-ფოსტა" value="${esc(draft.email || '')}"></label>
                  <button class="btn btn-forest" type="submit">ბმულის გაგზავნა</button>
                </form>
                <p class="suggest" id="suggest" hidden></p>
              </section>
            </div>
          </div>`;
        $('#edit').onclick = () => { stopPoll(); renderForm(); };
        const err = (m) => { $('#v-error').textContent = m || ''; };
        $('#g').onclick = async () => {
          err(''); const b = $('#g'); b.disabled = true;
          try { const v = await Store.verify.google(); if (v) await submit(v); }
          catch (e) { if (e.code !== 'cancelled') { console.error(e); err('Google-ით დადასტურება ვერ მოხერხდა. ' + errMsg(e)); } }
          finally { if ($('#g')) $('#g').disabled = false; }
        };
        const ef = $('#ef'), ei = ef.elements.email, sg = $('#suggest');
        ei.addEventListener('input', () => { draft.email = ei.value.trim(); save(draft); sg.hidden = true; });
        ei.addEventListener('blur', () => {
          const s = suggest(ei.value.trim());
          sg.hidden = !s;
          if (s) { sg.innerHTML = `ხომ არ გულისხმობდი <button type="button" class="link-btn">${esc(s)}</button>?`; sg.querySelector('button').onclick = () => { ei.value = s; draft.email = s; save(draft); sg.hidden = true; }; }
        });
        ef.onsubmit = async (e) => {
          e.preventDefault(); err('');
          const email = ei.value.trim().toLowerCase();
          if (!validEmail(email)) { err('ჩაწერე სწორი ელ-ფოსტა'); ei.focus(); return; }
          const btn = ef.querySelector('button'); btn.disabled = true; btn.textContent = 'იგზავნება…';
          try { await Store.verify.emailStart(email, continueUrl()); draft.email = email; draft.sentAt = Date.now(); save(draft); renderWaiting(); }
          catch (er) { console.error(er); err(errMsg(er)); btn.disabled = false; btn.textContent = 'ბმულის გაგზავნა'; }
        };
      }

      function renderWaiting() {
        const box = $('#verify');
        box.innerHTML = `
          <h2 class="legend">შეამოწმე ფოსტა</h2>
          <div class="waiting">
            <span class="spinner" aria-hidden="true"></span>
            <p>ბმული გავუგზავნეთ მისამართზე <b>${esc(draft.email)}</b>. გახსენი წერილი და დააჭირე ბმულს. ეს გვერდი თავისით გააგრძელებს.</p>
          </div>
          <p class="muted small">წერილი ვერ იპოვე? შეამოწმე „სპამი“ ან „Promotions“.</p>
          <p class="form-error" id="v-error" role="alert"></p>
          <div class="wait-actions">
            <button class="btn btn-line btn-sm" id="resend" disabled>ხელახლა გაგზავნა</button>
            <button class="link-btn" id="other">სხვა ელ-ფოსტა ან Google</button>
            ${Store.mode === 'demo' ? '<button class="btn btn-sun btn-sm" id="demo-ok">დემო: ბმულზე დაჭერა</button>' : ''}
          </div>`;
        const rs = $('#resend');
        let left = 30; const tick = setInterval(() => { left--; rs.textContent = left > 0 ? `ხელახლა გაგზავნა (${left})` : 'ხელახლა გაგზავნა'; if (left <= 0) { rs.disabled = false; clearInterval(tick); } }, 1000);
        rs.onclick = async () => { rs.disabled = true; try { await Store.verify.emailResend(continueUrl()); rs.textContent = 'გაიგზავნა'; } catch (e) { $('#v-error').textContent = errMsg(e); rs.disabled = false; } };
        $('#other').onclick = async () => { clearInterval(tick); stopPoll(); await Store.verify.done(); renderVerify(); };
        const d = $('#demo-ok'); if (d) d.onclick = () => { Store.verify.demoConfirm(); check(); };
        startPoll();
      }

      async function check() {
        const fresh = load();
        if (!fresh || fresh.step !== 'verify') { stopPoll(); return renderDone(null, true); }
        try { const v = await Store.verify.emailCheck(); if (v) { stopPoll(); await submit(v); } } catch (e) { /* offline: retry on next tick */ }
      }
      function startPoll() { stopPoll(); poll = setInterval(check, 3500); addEventListener('focus', check); }
      function stopPoll() { clearInterval(poll); removeEventListener('focus', check); }

      /* ---------------- send ---------------- */
      let sending = false;
      async function submit(v) {
        if (sending) return;
        const fresh = load();
        if (!fresh || fresh.step !== 'verify') { await Store.verify.done(); return renderDone(null, true); }   // another tab already sent it
        const lock = Number(localStorage.getItem('ae-booking-lock') || 0);
        if (Date.now() - lock < 15000) return;
        localStorage.setItem('ae-booking-lock', String(Date.now()));
        sending = true;
        const c = camp();
        const box = $('#verify'); if (box) box.innerHTML = '<div class="waiting"><span class="spinner" aria-hidden="true"></span><p>იგზავნება…</p></div>';
        try {
          const res = await Store.createBooking({
            campId: c.id, campTitle: c.title + ', ' + campDates(c), name: draft.name, age: Number(draft.age), birthDate: draft.birthDate,
            answers: (c.questions || []).filter(q => q && q.label).map(q => ({ q: q.label, a: String((draft.answers || {})[q.id] || '').trim().slice(0, 2000) })),
            phone: draft.phone, email: v.email, verifiedVia: v.via, parentName: draft.parentName || '', parentPhone: draft.parentPhone || '', notes: draft.notes || ''
          });
          await Store.verify.done();
          const done = { name: draft.name, camp: c.title + ', ' + campDates(c), email: v.email, waitlist: res && res.status === 'waitlist' };
          clear(); renderDone(done);
        } catch (e) {
          console.error(e);
          await Store.verify.done();
          sending = false; localStorage.removeItem('ae-booking-lock');
          renderVerify(e.code === 'duplicate'
            ? `ელ-ფოსტით ${v.email} ამ ბანაკზე უკვე გაქვს ჯავშანი. ცვლილებისთვის დაგვიკავშირდი${content.phone ? ': ' + content.phone : ''}.`
            : 'ჯავშანი ვერ გაიგზავნა. შეამოწმე ინტერნეტი და სცადე თავიდან.');
        } finally { localStorage.removeItem('ae-booking-lock'); }
      }

      function renderDone(d, elsewhere) {
        const head = $('#book-head'); if (head) head.remove();
        window.scrollTo({ top: 0 });
        root.innerHTML = `<div class="done">
          <div class="done-mark">${logo()}</div>
          <h1 class="h1">${d ? 'მადლობა, ' + esc(d.name.split(' ')[0]) + '!' : 'ჯავშანი გაგზავნილია'}</h1>
          <p class="lead" style="margin:0 auto">${elsewhere ? 'ჯავშანი მეორე ჩანართიდან უკვე გაიგზავნა. ეს გვერდი შეგიძლია დახურო.' : d && d.waitlist ? 'ადგილები უკვე შევსებულია, ამიტომ <b>მოლოდინის სიაში</b> ჩაგწერეთ. თუ ადგილი გათავისუფლდება, რიგის მიხედვით დაგიკავშირდებით.' : esc(content.bookingSuccess)}</p>
          ${d ? `<dl class="ticket"><dt>ბანაკი</dt><dd>${esc(d.camp)}</dd><dt>დადასტურებული ელ-ფოსტა</dt><dd>${esc(d.email)}</dd></dl>` : ''}
          ${d && content.paymentInfo ? `<div class="prose" style="margin:0 auto 30px;text-align:left">${paras(content.paymentInfo)}</div>` : ''}
          <div><a class="btn btn-line" href="index.html">მთავარ გვერდზე დაბრუნება</a></div>
        </div>`;
      }

      /* ---------------- start ---------------- */
      if (draft.step === 'verify' && draft.name) {
        renderVerify();
        const v = (await Store.verify.redirectResult()) || (await Store.verify.current());
        if (v) await submit(v);
        else if (draft.sentAt && draft.email && Date.now() - draft.sentAt < 3 * 3600e3) renderWaiting();
      } else {
        if (new URLSearchParams(location.search).get('verified')) { renderDone(null, true); return; }
        renderForm();
      }
    }
  };

  boot((content) => pages[page] ? pages[page](content) : null);
})();
