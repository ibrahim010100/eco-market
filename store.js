/* ECO MARKET — Store v4 */
const Store = (() => {
  const KEY = 'eco_market_v3';
  const DEFAULT = {
    password: '1234',
    categories: [
      { id: 'cosmetique', name: 'Cosmétique', nameAr: 'مستحضرات', nameEn: 'Cosmetics', emoji: '💄', desc: 'Soins, parfums & beauté', grad: 'linear-gradient(135deg,#ec4899,#9d174d)', active: true },
      { id: 'enfants', name: 'Articles Enfants', nameAr: 'مستلزمات الأطفال', nameEn: 'Kids Items', emoji: '🧸', desc: 'Vêtements & jouets pour petits', grad: 'linear-gradient(135deg,#f59e0b,#b45309)', active: true },
    ],
    products: [
      { id:1,  name:'Crème Hydratante Premium', nameAr:'كريم مرطب فاخر', nameEn:'Premium Moisturizer', cat:'cosmetique', price:220, oldPrice:300, stock:42, emoji:'💆', image:'', images:[], featured:true,  isNew:false, active:true, reviews:[] },
      { id:2,  name:'Sérum Vitamine C',         nameAr:'سيروم فيتامين سي', nameEn:'Vitamin C Serum',  cat:'cosmetique', price:199, oldPrice:260, stock:28, emoji:'✨',  image:'', images:[], featured:true,  isNew:true,  active:true, reviews:[] },
      { id:3,  name:'Parfum Rose Nuit',          nameAr:'عطر وردة الليل',  nameEn:'Night Rose Perfume',cat:'cosmetique', price:380, oldPrice:480, stock:15, emoji:'🌸',  image:'', images:[], featured:false, isNew:false, active:true, reviews:[] },
      { id:4,  name:'Palette Yeux Smoky',        nameAr:'لوحة ألوان عيون', nameEn:'Smoky Eye Palette', cat:'cosmetique', price:149, oldPrice:200, stock:55, emoji:'👁️', image:'', images:[], featured:false, isNew:true,  active:true, reviews:[] },
      { id:5,  name:'Baume Lèvres Fruité',       nameAr:'بلسم شفاه بالفواكه',nameEn:'Fruity Lip Balm', cat:'cosmetique', price:45,  oldPrice:null,stock:100,emoji:'💋',  image:'', images:[], featured:false, isNew:false, active:true, reviews:[] },
      { id:6,  name:'Pyjama Enfant Coton',       nameAr:'بيجامة أطفال قطنية',nameEn:'Kids Cotton Pyjama',cat:'enfants',  price:120, oldPrice:160, stock:30, emoji:'👕',  image:'', images:[], featured:true,  isNew:false, active:true, reviews:[] },
      { id:7,  name:'Peluche Ours Géant',        nameAr:'دب كبير محشو',    nameEn:'Giant Teddy Bear',  cat:'enfants',   price:180, oldPrice:240, stock:18, emoji:'🧸',  image:'', images:[], featured:true,  isNew:false, active:true, reviews:[] },
      { id:8,  name:'Baskets Enfant Lumineuses', nameAr:'حذاء أطفال مضيء',  nameEn:'Kids Light-Up Sneakers',cat:'enfants',price:150,oldPrice:200,stock:25, emoji:'👟',  image:'', images:[], featured:false, isNew:true,  active:true, reviews:[] },
      { id:9,  name:'Jeu de Construction',       nameAr:'لعبة بناء',       nameEn:'Building Game',     cat:'enfants',   price:99,  oldPrice:130, stock:40, emoji:'🧩',  image:'', images:[], featured:false, isNew:false, active:true, reviews:[] },
      { id:10, name:'Casquette Enfant',          nameAr:'قبعة أطفال',      nameEn:'Kids Cap',          cat:'enfants',   price:55,  oldPrice:null,stock:70, emoji:'🧢',  image:'', images:[], featured:false, isNew:false, active:true, reviews:[] },
    ],
    orders: [
      { id:'CMD-1001', client:'Fatima Zahra', phone:'0661234567', city:'Casablanca', address:'Hay Mohammadi', items:[{name:'Crème Hydratante Premium',qty:1,price:220}], total:220, status:'pending',   date:'2026-06-25', read:false },
      { id:'CMD-1002', client:'Kenza Alami',  phone:'0662111222', city:'Rabat',      address:'Agdal',         items:[{name:'Parfum Rose Nuit',qty:1,price:380}],          total:380, status:'shipped',    date:'2026-06-24', read:true  },
      { id:'CMD-1003', client:'Sara Tazi',    phone:'0663333444', city:'Marrakech',  address:'Gueliz',        items:[{name:'Peluche Ours Géant',qty:1,price:180}],        total:180, status:'delivered',  date:'2026-06-23', read:true  },
    ],
    promos: [
      { id:1, code:'BEAUTY20', label:'Cosmétique -20%', discount:20, type:'%', cat:'cosmetique', active:true, uses:14, showOnSite:true },
      { id:2, code:'KIDS15',   label:'Enfants -15%',    discount:15, type:'%', cat:'enfants',    active:true, uses:6,  showOnSite:true },
    ],
    settings: { shopName:'Eco Market', whatsapp:'0600000000', promosBanner:true, notifEmail:'', emailjsService:'', emailjsTemplate:'', emailjsKey:'' },
    visitors: [],   // {country, city, date, page}
    counter: 1004,
  };

  function load() {
    try {
      const r = localStorage.getItem(KEY);
      if (!r) { localStorage.setItem(KEY, JSON.stringify(DEFAULT)); return JSON.parse(JSON.stringify(DEFAULT)); }
      const db = JSON.parse(r);
      if (!db.password) db.password = '1234';
      if (!db.settings) db.settings = DEFAULT.settings;
      if (!db.visitors) db.visitors = [];
      db.products = db.products.map(p => ({image:'',images:[],nameAr:'',nameEn:'',reviews:[],...p}));
      return db;
    } catch(e) { return JSON.parse(JSON.stringify(DEFAULT)); }
  }
  function save(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch(e){} }
  let db = load();

  return {
    get db() { return db; },
    reload() { db = load(); return db; },
    checkPassword(pwd) { db=load(); return db.password===pwd; },
    changePassword(old,nw) { db=load(); if(db.password!==old)return false; db.password=nw; save(db); return true; },
    // Categories
    getCategories(activeOnly) { db=load(); return activeOnly?db.categories.filter(c=>c.active):db.categories; },
    addCategory(cat) { db=load(); const id='cat_'+Date.now(); db.categories.push({id,active:true,grad:'linear-gradient(135deg,#6366f1,#4338ca)',nameAr:'',nameEn:'',...cat}); save(db); return id; },
    updateCategory(id,patch) { db=load(); const c=db.categories.find(x=>x.id===id); if(c)Object.assign(c,patch); save(db); },
    deleteCategory(id) { db=load(); db.categories=db.categories.filter(c=>c.id!==id); db.products=db.products.filter(p=>p.cat!==id); save(db); },
    // Products
    getProducts({cat='all',activeOnly=false,featured=false}={}) { db=load(); let l=db.products; if(activeOnly)l=l.filter(p=>p.active); if(cat!=='all')l=l.filter(p=>p.cat===cat); if(featured)l=l.filter(p=>p.featured); return l; },
    getProduct(id) { db=load(); return db.products.find(p=>p.id===id); },
    addProduct(p) { db=load(); const id=Date.now(); db.products.push({id,stock:0,oldPrice:null,featured:false,isNew:true,active:true,emoji:'📦',image:'',images:[],nameAr:'',nameEn:'',reviews:[],...p}); save(db); return id; },
    updateProduct(id,patch) { db=load(); const p=db.products.find(x=>x.id===id); if(p)Object.assign(p,patch); save(db); },
    deleteProduct(id) { db=load(); db.products=db.products.filter(p=>p.id!==id); save(db); },
    // Reviews
    addReview(productId, review) { db=load(); const p=db.products.find(x=>x.id===productId); if(!p)return; if(!p.reviews)p.reviews=[]; p.reviews.push({...review,date:new Date().toISOString().slice(0,10),id:Date.now()}); save(db); },
    deleteReview(productId, reviewId) { db=load(); const p=db.products.find(x=>x.id===productId); if(p&&p.reviews)p.reviews=p.reviews.filter(r=>r.id!==reviewId); save(db); },
    // Orders
    getOrders(status='all') { db=load(); return status==='all'?db.orders:db.orders.filter(o=>o.status===status); },
    addOrder(order) { db=load(); const id='CMD-'+(db.counter++); db.orders.unshift({id,status:'pending',read:false,date:new Date().toISOString().slice(0,10),...order}); save(db); return id; },
    updateOrder(id,patch) { db=load(); const o=db.orders.find(x=>x.id===id); if(o)Object.assign(o,patch); save(db); },
    deleteOrder(id) { db=load(); db.orders=db.orders.filter(o=>o.id!==id); save(db); },
    unreadOrders() { db=load(); return db.orders.filter(o=>!o.read).length; },
    markAllRead() { db=load(); db.orders.forEach(o=>o.read=true); save(db); },
    // Promos
    getPromos() { db=load(); return db.promos; },
    getSitePromos() { db=load(); return db.promos.filter(p=>p.active&&p.showOnSite); },
    findPromo(code) { db=load(); return db.promos.find(p=>p.code===code.toUpperCase()&&p.active); },
    addPromo(p) { db=load(); db.promos.push({id:Date.now(),active:true,uses:0,showOnSite:true,...p}); save(db); },
    updatePromo(id,patch) { db=load(); const p=db.promos.find(x=>x.id===id); if(p)Object.assign(p,patch); save(db); },
    deletePromo(id) { db=load(); db.promos=db.promos.filter(p=>p.id!==id); save(db); },
    // Settings
    getSettings() { db=load(); return db.settings||{shopName:'Eco Market',whatsapp:'0600000000',promosBanner:true}; },
    updateSettings(patch) { db=load(); db.settings=db.settings||{}; Object.assign(db.settings,patch); save(db); },
    // Visitors
    addVisitor(v) { db=load(); if(!db.visitors)db.visitors=[]; db.visitors.unshift({...v,date:new Date().toISOString().slice(0,10),time:new Date().toLocaleTimeString()}); if(db.visitors.length>500)db.visitors=db.visitors.slice(0,500); save(db); },
    getVisitors() { db=load(); return db.visitors||[]; },
    reset() { localStorage.removeItem(KEY); db=load(); }
  };
})();
