/* ECO MARKET — Store v5 (Supabase edition) */

// ⚠️ REMPLACEZ CES 2 VALEURS PAR LES VÔTRES
// Supabase Dashboard → Settings (⚙️) → API → "Project URL" et "anon public" key
const SUPABASE_URL = 'https://obljzhlgjqmjykdunzax.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j2C_0Xr_Ltwt1nCoLRBexw_Nrir7-aY';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Store = (() => {
  let db = {
    password: '1234',
    categories: [],
    products: [],
    orders: [],
    promos: [],
    settings: { shopName: 'Eco Market', whatsapp: '0600000000', promosBanner: true, notifEmail: '' },
    visitors: [],
    ready: false,
  };

  // ── mapping JS (camelCase) <-> Supabase (snake_case) ──
  const catFromDb = r => ({ id: r.id, name: r.name, nameAr: r.name_ar || '', nameEn: r.name_en || '', emoji: r.emoji, desc: r.description || '', grad: r.grad, active: r.active, sortOrder: r.sort_order || 0 });
  const catToDb = c => ({ id: c.id, name: c.name, name_ar: c.nameAr || '', name_en: c.nameEn || '', emoji: c.emoji || '📦', description: c.desc || '', grad: c.grad || 'linear-gradient(135deg,#6366f1,#4338ca)', active: c.active !== false, sort_order: c.sortOrder || 0 });

  const prodFromDb = r => ({ id: r.id, name: r.name, nameAr: r.name_ar || '', nameEn: r.name_en || '', cat: r.cat, price: +r.price, oldPrice: r.old_price != null ? +r.old_price : null, stock: r.stock, emoji: r.emoji, image: r.image || '', images: r.images || [], featured: r.featured, isNew: r.is_new, active: r.active, reviews: r.reviews || [] });
  const prodToDb = p => ({ id: p.id, name: p.name, name_ar: p.nameAr || '', name_en: p.nameEn || '', cat: p.cat, price: p.price || 0, old_price: p.oldPrice || null, stock: p.stock || 0, emoji: p.emoji || '📦', image: p.image || '', images: p.images || [], featured: !!p.featured, is_new: p.isNew !== false, active: p.active !== false, reviews: p.reviews || [] });

  const orderFromDb = r => ({ id: r.id, client: r.client, phone: r.phone || '', city: r.city || '', address: r.address || '', items: r.items || [], total: +r.total, status: r.status, read: r.read, date: r.date });
  const orderToDb = o => ({ id: o.id, client: o.client, phone: o.phone || '', city: o.city || '', address: o.address || '', items: o.items || [], total: o.total || 0, status: o.status || 'pending', read: !!o.read, date: o.date || new Date().toISOString().slice(0, 10) });

  const promoFromDb = r => ({ id: r.id, code: r.code, label: r.label, discount: +r.discount, type: r.type, cat: r.cat, active: r.active, uses: r.uses, showOnSite: r.show_on_site });
  const promoToDb = p => ({ id: p.id, code: p.code, label: p.label || p.code, discount: p.discount || 0, type: p.type || '%', cat: p.cat || 'all', active: p.active !== false, uses: p.uses || 0, show_on_site: p.showOnSite !== false });

  const settingsFromDb = r => ({ shopName: r.shop_name, whatsapp: r.whatsapp, promosBanner: r.promos_banner, notifEmail: r.notif_email || '' });
  const settingsToDb = s => ({ id: 1, shop_name: s.shopName || 'Eco Market', whatsapp: s.whatsapp || '', promos_banner: s.promosBanner !== false, notif_email: s.notifEmail || '' });

  const visitorToDb = v => ({ country: v.country || '', country_code: v.countryCode || '', city: v.city || '', region: v.region || '', date: v.date, time: v.time });
  const visitorFromDb = r => ({ country: r.country, countryCode: r.country_code, city: r.city, region: r.region, date: r.date, time: r.time });

  // fire-and-forget background sync to Supabase (UI stays instant/synchronous)
  function bg(promise) {
    Promise.resolve(promise).then(res => {
      if (res && res.error) console.error('Supabase sync error:', res.error);
    }).catch(e => console.error('Supabase sync error:', e));
  }

  async function init() {
    try {
      const [c, p, o, pr, s, vs] = await Promise.all([
        sb.from('categories').select('*').order('sort_order'),
        sb.from('products').select('*').order('created_at', { ascending: false }),
        sb.from('orders').select('*').order('created_at', { ascending: false }),
        sb.from('promos').select('*'),
        sb.from('settings').select('*').eq('id', 1).single(),
        sb.from('visitors').select('*').order('created_at', { ascending: false }).limit(500),
      ]);
      db.categories = (c.data || []).map(catFromDb);
      db.products = (p.data || []).map(prodFromDb);
      db.orders = (o.data || []).map(orderFromDb);
      db.promos = (pr.data || []).map(promoFromDb);
      db.settings = s.data ? settingsFromDb(s.data) : db.settings;
      db.password = (s.data && s.data.password) || '1234';
      db.visitors = (vs.data || []).map(visitorFromDb);
      db.ready = true;
    } catch (e) {
      console.error('Erreur de connexion à Supabase — vérifiez SUPABASE_URL et SUPABASE_ANON_KEY dans store.js', e);
    }
    return db;
  }

  return {
    get db() { return db; },
    init,
    reload() { return db; }, // cache déjà à jour localement, pas de refetch
    checkPassword(pwd) { return db.password === pwd; },
    changePassword(old, nw) {
      if (db.password !== old) return false;
      db.password = nw;
      bg(sb.from('settings').update({ password: nw }).eq('id', 1));
      return true;
    },
    forceResetPassword() {
      db.password = '1234';
      bg(sb.from('settings').update({ password: '1234' }).eq('id', 1));
    },

    // Categories
    getCategories(activeOnly) { return activeOnly ? db.categories.filter(c => c.active) : db.categories; },
    addCategory(cat) {
      const id = 'cat_' + Date.now();
      const full = { id, active: true, grad: 'linear-gradient(135deg,#6366f1,#4338ca)', nameAr: '', nameEn: '', ...cat };
      db.categories.push(full);
      bg(sb.from('categories').insert(catToDb(full)));
      return id;
    },
    updateCategory(id, patch) {
      const c = db.categories.find(x => x.id === id); if (!c) return;
      Object.assign(c, patch);
      bg(sb.from('categories').update(catToDb(c)).eq('id', id));
    },
    deleteCategory(id) {
      db.categories = db.categories.filter(c => c.id !== id);
      db.products = db.products.filter(p => p.cat !== id);
      bg(sb.from('categories').delete().eq('id', id));
    },

    // Products
    getProducts({ cat = 'all', activeOnly = false, featured = false } = {}) {
      let l = db.products;
      if (activeOnly) l = l.filter(p => p.active);
      if (cat !== 'all') l = l.filter(p => p.cat === cat);
      if (featured) l = l.filter(p => p.featured);
      return l;
    },
    getProduct(id) { return db.products.find(p => p.id === id); },
    addProduct(p) {
      const id = Date.now();
      const full = { id, stock: 0, oldPrice: null, featured: false, isNew: true, active: true, emoji: '📦', image: '', images: [], nameAr: '', nameEn: '', reviews: [], ...p };
      db.products.push(full);
      bg(sb.from('products').insert(prodToDb(full)));
      return id;
    },
    updateProduct(id, patch) {
      const p = db.products.find(x => x.id === id); if (!p) return;
      Object.assign(p, patch);
      bg(sb.from('products').update(prodToDb(p)).eq('id', id));
    },
    deleteProduct(id) {
      db.products = db.products.filter(p => p.id !== id);
      bg(sb.from('products').delete().eq('id', id));
    },

    // Reviews
    addReview(productId, review) {
      const p = db.products.find(x => x.id === productId); if (!p) return;
      if (!p.reviews) p.reviews = [];
      p.reviews.push({ ...review, date: new Date().toISOString().slice(0, 10), id: Date.now() });
      bg(sb.from('products').update({ reviews: p.reviews }).eq('id', productId));
    },
    deleteReview(productId, reviewId) {
      const p = db.products.find(x => x.id === productId); if (!p || !p.reviews) return;
      p.reviews = p.reviews.filter(r => r.id !== reviewId);
      bg(sb.from('products').update({ reviews: p.reviews }).eq('id', productId));
    },

    // Orders
    getOrders(status = 'all') { return status === 'all' ? db.orders : db.orders.filter(o => o.status === status); },
    addOrder(order) {
      const id = 'CMD-' + Date.now();
      const full = { id, status: 'pending', read: false, date: new Date().toISOString().slice(0, 10), ...order };
      db.orders.unshift(full);
      bg(sb.from('orders').insert(orderToDb(full)));
      return id;
    },
    updateOrder(id, patch) {
      const o = db.orders.find(x => x.id === id); if (!o) return;
      Object.assign(o, patch);
      bg(sb.from('orders').update(orderToDb(o)).eq('id', id));
    },
    deleteOrder(id) {
      db.orders = db.orders.filter(o => o.id !== id);
      bg(sb.from('orders').delete().eq('id', id));
    },
    unreadOrders() { return db.orders.filter(o => !o.read).length; },
    markAllRead() {
      const ids = db.orders.filter(o => !o.read).map(o => o.id);
      db.orders.forEach(o => o.read = true);
      if (ids.length) bg(sb.from('orders').update({ read: true }).in('id', ids));
    },

    // Promos
    getPromos() { return db.promos; },
    getSitePromos() { return db.promos.filter(p => p.active && p.showOnSite); },
    findPromo(code) { return db.promos.find(p => p.code === code.toUpperCase() && p.active); },
    addPromo(p) {
      const full = { id: Date.now(), active: true, uses: 0, showOnSite: true, ...p };
      db.promos.push(full);
      bg(sb.from('promos').insert(promoToDb(full)));
    },
    updatePromo(id, patch) {
      const p = db.promos.find(x => x.id === id); if (!p) return;
      Object.assign(p, patch);
      bg(sb.from('promos').update(promoToDb(p)).eq('id', id));
    },
    deletePromo(id) {
      db.promos = db.promos.filter(p => p.id !== id);
      bg(sb.from('promos').delete().eq('id', id));
    },

    // Settings
    getSettings() { return db.settings || { shopName: 'Eco Market', whatsapp: '0600000000', promosBanner: true }; },
    updateSettings(patch) {
      db.settings = db.settings || {};
      Object.assign(db.settings, patch);
      bg(sb.from('settings').update(settingsToDb(db.settings)).eq('id', 1));
    },

    // Visitors
    addVisitor(v) {
      const full = { ...v, date: new Date().toISOString().slice(0, 10), time: new Date().toLocaleTimeString() };
      db.visitors.unshift(full);
      if (db.visitors.length > 500) db.visitors = db.visitors.slice(0, 500);
      bg(sb.from('visitors').insert(visitorToDb(full)));
    },
    getVisitors() { return db.visitors || []; },
    clearVisitors() {
      db.visitors = [];
      bg(sb.from('visitors').delete().not('id', 'is', null));
    },

    // Danger zone — wipe everything (catalogue reste vide, à recréer)
    async reset() {
      await Promise.all([
        sb.from('products').delete().not('id', 'is', null),
        sb.from('orders').delete().not('id', 'is', null),
        sb.from('promos').delete().not('id', 'is', null),
        sb.from('categories').delete().not('id', 'is', null),
        sb.from('visitors').delete().not('id', 'is', null),
        sb.from('settings').update({ password: '1234' }).eq('id', 1),
      ]);
      await init();
      return db;
    },
  };
})();
