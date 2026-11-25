/* ახალი ერა — მონაცემების ფენა (Firebase ან დემო რეჟიმი) */
(function () {
  'use strict';

  const DEFAULTS = {
    content: {
      siteName: 'ახალი ერა',
      heroLine: 'ბანაკი 15–25 წლის ახალგაზრდებისთვის',
      heroText: 'ზამთარში მთაში, ზაფხულში ტყეში. რამდენიმე დღე ტელეფონის გარეშე, ახალ ხალხთან და იმ საუბრებით, რომლებიც სახლში არ გამოგდის.',
      announceOn: true,
      announce: 'ზამთრის ბანაკზე რეგისტრაცია დაწყებულია',
      manifesto: 'ახალი ერა იწყება მაშინ, როცა ჩვეულ რიტმს რამდენიმე დღით ტოვებ. ბანაკში არავინ გელოდება ისეთს, როგორიც უკვე ხარ — აქ შეგიძლია სცადო, როგორი გინდა იყო.',
      values: [
        { title: 'ბუნებაში', text: 'მთა, სუფთა ჰაერი და დრო ეკრანების გარეშე.' },
        { title: 'ერთად', text: 'ბანაკი იწყება უცნობებით და მთავრდება მეგობრებით.' },
        { title: 'ზრდა', text: 'აქტივობები და საუბრები, რომლებიც გეხმარება უკეთ გაიცნო საკუთარი თავი.' }
      ],
      aboutTitle: 'ვინ ვართ',
      aboutText: 'ახალი ერა ახალგაზრდებს აერთიანებს ბუნებაში, მეგობრობასა და ახალ გამოცდილებაში.\n\nყოველ წელს ვაწყობთ ორ ბანაკს — ზამთარში და ზაფხულში. ჩვენი გუნდი ზრუნავს, რომ ყველა მონაწილე თავს უსაფრთხოდ და კომფორტულად გრძნობდეს, პირველი დღიდან ბოლომდე.\n\n(ეს ტექსტი ადმინ პანელიდან იცვლება.)',
      phone: '+995 555 00 00 00',
      email: 'info@akhaliera.ge',
      instagram: '',
      facebook: '',
      contactNote: 'კითხვა გაქვს? მოგვწერე ან დაგვირეკე.',
      bookingIntro: 'შეავსე ფორმა. ჯავშნის დასადასტურებლად და გადახდის დეტალებისთვის დაგიკავშირდებით.',
      bookingSuccess: 'ჯავშანი მიღებულია. ჩვენი გუნდი მალე დაგიკავშირდება დასადასტურებლად.',
      paymentInfo: ''
    },
    camps: [
      {
        id: 'winter-2027', season: 'winter', title: 'ზამთრის ბანაკი', location: 'ბაკურიანი',
        start: '2027-03-01', end: '2027-03-05', datesText: '', ageMin: 15, ageMax: 25, price: 260,
        status: 'open', featured: true, order: 1,
        summary: 'ხუთი დღე ბაკურიანის თოვლში.',
        description: 'ხუთი დღე ბაკურიანის თოვლიან მთებში. აქტივობები ღია ცის ქვეშ, საღამოები ერთად, თამაშები და საუბრები.\n\n(დეტალური აღწერა იცვლება ადმინ პანელიდან.)',
        includes: 'განთავსება\nკვება\nაქტივობები და თამაშები\nლიდერების გუნდი მთელი ბანაკის განმავლობაში',
        program: 'ჩასვლა და გაცნობა\nაქტივობები თოვლში\nლაშქრობა\nთამაშები და საღამოს პროგრამა\nდამშვიდობება'
      },
      {
        id: 'summer-2027', season: 'summer', title: 'ზაფხულის ბანაკი', location: '',
        start: '', end: '', datesText: 'თარიღები მალე გამოცხადდება', ageMin: 15, ageMax: 25, price: null,
        status: 'soon', featured: false, order: 2,
        summary: 'ტყე, კარვები და გრძელი საღამოები.',
        description: 'ზაფხულის ბანაკის დეტალები მალე გამოქვეყნდება.',
        includes: '', program: ''
      }
    ],
    faq: [
      { id: 'f1', order: 1, q: 'ვის შეუძლია მონაწილეობა?', a: 'ბანაკი 15–25 წლის ახალგაზრდებისთვისაა. 18 წლამდე მონაწილისთვის საჭიროა მშობლის ან მეურვის კონტაქტი.' },
      { id: 'f2', order: 2, q: 'როგორ დავჯავშნო ადგილი?', a: 'შეავსე ჯავშნის ფორმა საიტზე. ჯავშნის დასადასტურებლად ტელეფონით დაგიკავშირდებით.' },
      { id: 'f3', order: 3, q: 'როგორ ხდება გადახდა?', a: 'ჯავშნის მიღების შემდეგ დაგიკავშირდებით და გადახდის დეტალებს პირადად გეტყვით.' },
      { id: 'f4', order: 4, q: 'რა წამოვიღო?', a: 'ნივთების სიას ბანაკამდე რამდენიმე დღით ადრე გამოგიგზავნით.' }
    ]
  };

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const byOrder = (a, b) => (a.order ?? 99) - (b.order ?? 99);
  const fail = (code, message) => Object.assign(new Error(message || code), { code });
  const bookingId = (campId, email) => campId + '__' + String(email).toLowerCase();

  /* ------------------------------------------------------------ demo (localStorage) */
  const KEY = 'akhali-era-demo-v1';
  function demoDb() {
    let db = null;
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* ignore */ }
    if (!db) {
      db = { content: clone(DEFAULTS.content), camps: clone(DEFAULTS.camps), faq: clone(DEFAULTS.faq), gallery: [], bookings: [] };
      demoSave(db);
    }
    return db;
  }
  function demoSave(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { throw new Error('ბრაუზერის მეხსიერება გაივსო. დემო რეჟიმში ბევრი ფოტოს შენახვა ვერ ხერხდება.'); }
  }

  const demo = {
    mode: 'demo',
    async content() { return Object.assign(clone(DEFAULTS.content), demoDb().content); },
    async saveContent(c) { const db = demoDb(); db.content = c; demoSave(db); },
    async camps() { return demoDb().camps.slice().sort(byOrder); },
    async saveCamp(c) { const db = demoDb(); if (!c.id) c.id = uid(); const i = db.camps.findIndex(x => x.id === c.id); if (i > -1) db.camps[i] = c; else db.camps.push(c); if (c.featured) db.camps.forEach(x => { if (x.id !== c.id) x.featured = false; }); demoSave(db); return c.id; },
    async deleteCamp(id) { const db = demoDb(); db.camps = db.camps.filter(x => x.id !== id); demoSave(db); },
    async faq() { return demoDb().faq.slice().sort(byOrder); },
    async saveFaq(f) { const db = demoDb(); if (!f.id) f.id = uid(); const i = db.faq.findIndex(x => x.id === f.id); if (i > -1) db.faq[i] = f; else db.faq.push(f); demoSave(db); },
    async deleteFaq(id) { const db = demoDb(); db.faq = db.faq.filter(x => x.id !== id); demoSave(db); },
    async gallery() { return demoDb().gallery.slice().sort((a, b) => b.created - a.created); },
    async addPhoto(p) { const db = demoDb(); db.gallery.push(Object.assign({ id: uid(), created: Date.now() }, p)); demoSave(db); },
    async updatePhoto(id, patch) { const db = demoDb(); const p = db.gallery.find(x => x.id === id); if (p) Object.assign(p, patch); demoSave(db); },
    async deletePhoto(id) { const db = demoDb(); db.gallery = db.gallery.filter(x => x.id !== id); demoSave(db); },
    async createBooking(b) {
      const db = demoDb(); const id = bookingId(b.campId, b.email);
      if (db.bookings.some(x => x.id === id)) throw fail('duplicate');
      db.bookings.push(Object.assign({ id, status: 'new', adminNote: '', createdAt: Date.now() }, b)); demoSave(db); return id;
    },
    async bookings() { return demoDb().bookings.slice().sort((a, b) => b.createdAt - a.createdAt); },
    async updateBooking(id, patch) { const db = demoDb(); const b = db.bookings.find(x => x.id === id); if (b) Object.assign(b, patch); demoSave(db); },
    async deleteBooking(id) { const db = demoDb(); db.bookings = db.bookings.filter(x => x.id !== id); demoSave(db); },
    async login(email, pw) { if (pw !== 'demo') throw new Error('პაროლი არასწორია. დემო რეჟიმში პაროლია: demo'); sessionStorage.setItem('ae-demo-admin', '1'); },
    async logout() { sessionStorage.removeItem('ae-demo-admin'); },
    onAuth(cb) { cb(sessionStorage.getItem('ae-demo-admin') ? { email: 'demo' } : null); },
    async seed() {},
    verify: {
      async google() {
        const e = prompt('დემო რეჟიმი: აქ Google-ის ფანჯარა გაიხსნებოდა. ჩაწერე ნებისმიერი Gmail მისამართი:', '');
        if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())) throw fail('cancelled');
        const v = { email: e.trim().toLowerCase(), via: 'google' }; sessionStorage.setItem('ae-demo-v', JSON.stringify(v)); return v;
      },
      async redirectResult() { return null; },
      async emailStart(email) { sessionStorage.setItem('ae-demo-pending', email.toLowerCase()); sessionStorage.removeItem('ae-demo-v'); },
      async emailResend() {},
      async emailCheck() { const v = sessionStorage.getItem('ae-demo-v'); return v ? JSON.parse(v) : null; },
      demoConfirm() { sessionStorage.setItem('ae-demo-v', JSON.stringify({ email: sessionStorage.getItem('ae-demo-pending'), via: 'email' })); },
      async current() { const v = sessionStorage.getItem('ae-demo-v'); return v ? JSON.parse(v) : null; },
      async done() { sessionStorage.removeItem('ae-demo-v'); sessionStorage.removeItem('ae-demo-pending'); }
    }
  };

  /* ------------------------------------------------------------ Firebase */
  const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Firebase ვერ ჩაიტვირთა')); document.head.appendChild(s); });
  }
  let fbReady = null;
  function fb() {
    if (!fbReady) {
      fbReady = loadScript(SDK + 'firebase-app-compat.js')
        .then(() => Promise.all([loadScript(SDK + 'firebase-firestore-compat.js'), loadScript(SDK + 'firebase-auth-compat.js')]))
        .then(() => { firebase.initializeApp(window.FIREBASE_CONFIG); return { db: firebase.firestore(), auth: firebase.auth() }; });
    }
    return fbReady;
  }
  const docs = (snap) => snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
  /* public pages never go blank: if the database can't be read, show the built-in texts */
  const warn = (e) => console.warn('ახალი ერა: ბაზიდან წაკითხვა ვერ მოხერხდა, ნაჩვენებია საწყისი ტექსტები.', e && (e.code || e.message));
  const ts = (v) => (v && v.toMillis ? v.toMillis() : v || 0);

  const fire = {
    mode: 'firebase',
    async content() { try { const { db } = await fb(); const d = await db.doc('site/content').get(); return Object.assign(clone(DEFAULTS.content), d.exists ? d.data() : {}); } catch (e) { warn(e); return clone(DEFAULTS.content); } },
    async saveContent(c) { const { db } = await fb(); await db.doc('site/content').set(c); },
    async camps() { try { const { db } = await fb(); const list = docs(await db.collection('camps').get()); return (list.length ? list : clone(DEFAULTS.camps)).sort(byOrder); } catch (e) { warn(e); return clone(DEFAULTS.camps).sort(byOrder); } },
    async saveCamp(c) {
      const { db } = await fb(); const id = c.id || uid(); const data = Object.assign({}, c); delete data.id;
      const batch = db.batch(); batch.set(db.collection('camps').doc(id), data);
      if (c.featured) (await db.collection('camps').where('featured', '==', true).get()).docs.forEach(d => { if (d.id !== id) batch.update(d.ref, { featured: false }); });
      await batch.commit(); return id;
    },
    async deleteCamp(id) { const { db } = await fb(); await db.collection('camps').doc(id).delete(); },
    async faq() { try { const { db } = await fb(); const list = docs(await db.collection('faq').get()); return (list.length ? list : clone(DEFAULTS.faq)).sort(byOrder); } catch (e) { warn(e); return clone(DEFAULTS.faq).sort(byOrder); } },
    async saveFaq(f) { const { db } = await fb(); const id = f.id || uid(); const data = Object.assign({}, f); delete data.id; await db.collection('faq').doc(id).set(data); },
    async deleteFaq(id) { const { db } = await fb(); await db.collection('faq').doc(id).delete(); },
    async gallery() { try { const { db } = await fb(); return docs(await db.collection('gallery').get()).sort((a, b) => ts(b.created) - ts(a.created)); } catch (e) { warn(e); return []; } },
    async addPhoto(p) { const { db } = await fb(); await db.collection('gallery').add(Object.assign({ created: Date.now() }, p)); },
    async updatePhoto(id, patch) { const { db } = await fb(); await db.collection('gallery').doc(id).update(patch); },
    async deletePhoto(id) { const { db } = await fb(); await db.collection('gallery').doc(id).delete(); },
    async createBooking(b) {
      const { db } = await fb(); const id = bookingId(b.campId, b.email);
      try { await db.collection('bookings').doc(id).set(Object.assign({}, b, { status: 'new', adminNote: '', createdAt: firebase.firestore.FieldValue.serverTimestamp() })); }
      catch (e) { if (e.code === 'permission-denied') throw fail('duplicate'); throw e; }
      return id;
    },
    async bookings() { const { db } = await fb(); return docs(await db.collection('bookings').orderBy('createdAt', 'desc').get()).map(b => Object.assign(b, { createdAt: ts(b.createdAt) })); },
    async updateBooking(id, patch) { const { db } = await fb(); await db.collection('bookings').doc(id).update(patch); },
    async deleteBooking(id) { const { db } = await fb(); await db.collection('bookings').doc(id).delete(); },
    async login(email, pw) {
      const { auth } = await fb();
      try { await auth.signInWithEmailAndPassword(email, pw); }
      catch (e) { throw new Error(e.code === 'auth/too-many-requests' ? 'ძალიან ბევრი მცდელობა. სცადე მოგვიანებით.' : 'ელ-ფოსტა ან პაროლი არასწორია.'); }
    },
    async logout() { const { auth } = await fb(); await auth.signOut(); },
    onAuth(cb) { fb().then(({ auth }) => auth.onAuthStateChanged(u => cb(u ? { email: u.email } : null))).catch(() => cb(null)); },
    /* first admin login on an empty project: copy starter content into Firestore */
    async seed() {
      const { db } = await fb();
      if ((await db.collection('camps').limit(1).get()).empty) for (const c of DEFAULTS.camps) { const d = Object.assign({}, c); delete d.id; await db.collection('camps').doc(c.id).set(d); }
      if ((await db.collection('faq').limit(1).get()).empty) for (const f of DEFAULTS.faq) { const d = Object.assign({}, f); delete d.id; await db.collection('faq').doc(f.id).set(d); }
      if (!(await db.doc('site/content').get()).exists) await db.doc('site/content').set(DEFAULTS.content);
    },
    /* participant verification: Google (one tap) or a confirmation link by email */
    verify: {
      async google() {
        const { auth } = await fb();
        const p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
        let r;
        try { r = await auth.signInWithPopup(p); }
        catch (e) {
          if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported'].includes(e.code)) { await auth.signInWithRedirect(p); return null; }
          if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'].includes(e.code)) throw fail('cancelled');
          throw e;
        }
        return fire.verify._after(r);
      },
      async redirectResult() { const { auth } = await fb(); try { const r = await auth.getRedirectResult(); return r && r.user ? fire.verify._after(r) : null; } catch (e) { return null; } },
      async _after(r) {
        if (r.additionalUserInfo && r.additionalUserInfo.isNewUser) localStorage.setItem('ae-flow-uid', r.user.uid);
        await r.user.getIdToken(true);
        return { email: r.user.email.toLowerCase(), via: 'google' };
      },
      async emailStart(email, url) {
        const { auth } = await fb(); email = email.toLowerCase();
        let keys = {}; try { keys = JSON.parse(localStorage.getItem('ae-ev') || '{}'); } catch (e) { /* */ }
        if (auth.currentUser && auth.currentUser.email !== email) await auth.signOut();
        if (!auth.currentUser) {
          try {
            if (keys[email]) await auth.signInWithEmailAndPassword(email, keys[email]);
            else {
              const pw = Array.from(crypto.getRandomValues(new Uint8Array(18)), x => x.toString(16).padStart(2, '0')).join('');
              const r = await auth.createUserWithEmailAndPassword(email, pw);
              keys[email] = pw; localStorage.setItem('ae-ev', JSON.stringify(keys)); localStorage.setItem('ae-flow-uid', r.user.uid);
            }
          } catch (e) {
            if (e.code === 'auth/email-already-in-use' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential' || e.code === 'auth/invalid-login-credentials') throw fail('email-in-use');
            if (e.code === 'auth/invalid-email') throw fail('bad-email');
            if (e.code === 'auth/too-many-requests') throw fail('too-many');
            throw e;
          }
        }
        if (!auth.currentUser.emailVerified) await auth.currentUser.sendEmailVerification({ url });
      },
      async emailResend(url) { const { auth } = await fb(); if (auth.currentUser) await auth.currentUser.sendEmailVerification({ url }); },
      async emailCheck() {
        const { auth } = await fb(); const u = auth.currentUser; if (!u) return null;
        await u.reload();
        if (!auth.currentUser.emailVerified) return null;
        await auth.currentUser.getIdToken(true);
        return { email: auth.currentUser.email.toLowerCase(), via: 'email' };
      },
      async current() {
        const { auth } = await fb();
        await new Promise(res => { const off = auth.onAuthStateChanged(() => { off(); res(); }); });
        const u = auth.currentUser;
        if (!u || !u.emailVerified || !u.email) return null;
        return { email: u.email.toLowerCase(), via: u.providerData.some(p => p.providerId === 'google.com') ? 'google' : 'email' };
      },
      /* sign out after booking; remove the throwaway account this flow created */
      async done() {
        const { auth } = await fb(); const u = auth.currentUser;
        if (u && localStorage.getItem('ae-flow-uid') === u.uid) { try { await u.delete(); } catch (e) { /* */ } }
        localStorage.removeItem('ae-flow-uid');
        if (u) { try { const k = JSON.parse(localStorage.getItem('ae-ev') || '{}'); delete k[u.email]; localStorage.setItem('ae-ev', JSON.stringify(k)); } catch (e) { /* */ } }
        await auth.signOut().catch(() => {});
      }
    }
  };

  window.Store = window.FIREBASE_CONFIG ? fire : demo;
  window.Store.uid = uid;
})();
