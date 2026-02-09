
/*
  TaskMart PoC Training Lab (Static Simulation)
  - Static only, no backend
  - localStorage persistence
  - Training Mode toggles unsafe rendering sinks
  - This is for authorized classroom use only.
*/

const TM = (() => {
  const LS = {
    session: "tm.session",
    training: "tm.trainingMode",
    cart: "tm.cart",
    orders: "tm.orders",
    tickets: "tm.tickets",
    forum: "tm.forum",
    reviews: "tm.reviews",
    coupons: "tm.coupons"
  };

  const HARD_USERS = (() => {
    const users = [];
    for (let i=1;i<=15;i++){
      const u = `student${String(i).padStart(2,"0")}`;
      users.push({ username: u, password: u, role:"student" });
    }
    users.push({ username:"admin", password:"admin", role:"admin" });
    return users;
  })();

  const CATALOG = [
    { id:"p100", name:"Nimbus Sneakers", price:59.99, category:"Footwear", stock:18,
      desc:"Lightweight trainers built for all-day wear. Breathable mesh upper." },
    { id:"p110", name:"Aurora Hoodie", price:44.50, category:"Apparel", stock:25,
      desc:"Soft fleece hoodie with clean stitching and a relaxed fit." },
    { id:"p120", name:"Kestrel Backpack", price:72.00, category:"Bags", stock:12,
      desc:"Structured backpack with padded laptop sleeve and weather-resistant shell." },
    { id:"p130", name:"Orbit Water Bottle", price:16.25, category:"Accessories", stock:40,
      desc:"Stainless bottle with vacuum insulation. Keeps drinks cold for hours." },
    { id:"p140", name:"Pulse Earbuds", price:89.00, category:"Electronics", stock:9,
      desc:"Compact wireless earbuds with low-latency mode and charging case." },
    { id:"p150", name:"Cedar Desk Lamp", price:28.75, category:"Home", stock:22,
      desc:"Minimal lamp with adjustable arm and warm LED glow." },
    { id:"p160", name:"Sable Keyboard", price:64.95, category:"Electronics", stock:15,
      desc:"Compact mechanical keyboard. Hot-swappable switches and quiet stabilizers." },
    { id:"p170", name:"Drift Coffee Mug", price:12.50, category:"Home", stock:33,
      desc:"Ceramic mug with matte finish and comfortable handle." },
    { id:"p180", name:"Atlas Notebook", price:9.95, category:"Stationery", stock:60,
      desc:"Hardcover notebook with dotted pages. Perfect for planning and sketches." }
  ];

  // ---- storage helpers ----
  function lsGet(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    }catch(e){
      return fallback;
    }
  }
  function lsSet(key, val){
    localStorage.setItem(key, JSON.stringify(val));
  }
  function lsDel(key){
    localStorage.removeItem(key);
  }

  // ---- training mode ----
  function isTrainingMode(){
    return !!lsGet(LS.training, false);
  }
  function setTrainingMode(on){
    lsSet(LS.training, !!on);
  }

  // ---- session/auth ----
  function getSession(){
    return lsGet(LS.session, null);
  }
  function setSession(sess){
    lsSet(LS.session, sess);
  }
  function clearSession(){
    lsDel(LS.session);
  }
  function login(username, password){
    const u = HARD_USERS.find(x => x.username === username && x.password === password);
    if (!u) return { ok:false, error:"Invalid credentials (simulation)." };
    const sess = { username: u.username, role: u.role, loggedInAt: new Date().toISOString() };
    setSession(sess);
    return { ok:true, session:sess };
  }
  function logout(){
    clearSession();
    // keep other data for realism
  }
  function requireLogin(){
    const s = getSession();
    if (!s) window.location.href = "login.html";
    return s;
  }
  function requireRole(role){
    const s = requireLogin();
    if (!s || s.role !== role) window.location.href = "index.html";
    return s;
  }

  // ---- safe rendering ----
  function escapeHtml(str){
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll("\"","&quot;")
      .replaceAll("'","&#039;");
  }

  /*
    renderText
    - Safe Mode: sets textContent
    - Training Mode: sets innerHTML (intentionally unsafe sink)
    This is the primary teaching toggle for XSS simulation.
  */
  function renderText(el, value){
    if (!el) return;
    if (isTrainingMode()){
      el.innerHTML = String(value); // intentionally unsafe in Training Mode
    } else {
      el.textContent = String(value);
    }
  }

  // ---- cart + business logic ----
  function getCart(){
    return lsGet(LS.cart, { items: [], coupon: null });
  }
  function setCart(cart){
    lsSet(LS.cart, cart);
  }
  function addToCart(productId, qty){
    const cart = getCart();
    const n = Math.max(1, Number(qty || 1));
    const idx = cart.items.findIndex(i => i.productId === productId);
    if (idx >= 0) cart.items[idx].qty += n;
    else cart.items.push({ productId, qty:n });
    setCart(cart);
    return cart;
  }
  function updateCartQty(productId, qty){
    const cart = getCart();
    const n = Math.max(0, Number(qty || 0));
    cart.items = cart.items.map(i => i.productId === productId ? ({...i, qty:n}) : i)
                           .filter(i => i.qty > 0);
    setCart(cart);
    return cart;
  }
  function clearCart(){
    setCart({ items: [], coupon: null });
  }

  function getCoupons(){
    // coupons are stored client-side (teaching: tampering)
    const base = [
      { code:"WELCOME10", type:"percent", value:10 },
      { code:"FREESHIP", type:"flat", value:5 },
      { code:"STUDENT20", type:"percent", value:20 }
    ];
    const stored = lsGet(LS.coupons, null);
    if (!stored) { lsSet(LS.coupons, base); return base; }
    return stored;
  }
  function applyCoupon(code){
    const cart = getCart();
    const coupons = getCoupons();
    const c = coupons.find(x => x.code.toUpperCase() === String(code||"").trim().toUpperCase());
    cart.coupon = c ? c : null;
    setCart(cart);
    return { ok: !!c, coupon: cart.coupon };
  }

  function calcTotals(cart){
    const items = cart.items.map(i => {
      const p = CATALOG.find(x => x.id === i.productId);
      const unit = p ? p.price : 0;
      return { ...i, unit, line: unit * i.qty, name: p ? p.name : "Unknown" };
    });
    const subtotal = items.reduce((a,b)=>a+b.line,0);
    let discount = 0;
    if (cart.coupon){
      if (cart.coupon.type === "percent") discount = subtotal * (cart.coupon.value/100);
      if (cart.coupon.type === "flat") discount = cart.coupon.value;
    }
    // Teaching: all computed on client side
    const shipping = (subtotal - discount) >= 60 ? 0 : 6;
    const tax = Math.max(0, (subtotal - discount) * 0.06);
    const total = Math.max(0, subtotal - discount + shipping + tax);
    return {
      items,
      subtotal: round2(subtotal),
      discount: round2(discount),
      shipping: round2(shipping),
      tax: round2(tax),
      total: round2(total)
    };
  }
  function round2(n){ return Math.round((Number(n)||0)*100)/100; }

  // ---- orders ----
  function getOrders(){
    return lsGet(LS.orders, []);
  }
  function placeOrder(shippingInfo){
    const cart = getCart();
    const totals = calcTotals(cart);
    if (totals.items.length === 0) return { ok:false, error:"Cart is empty." };

    const sess = requireLogin();
    const orders = getOrders();

    const order = {
      id: `TM-${Math.random().toString(36).slice(2,7).toUpperCase()}-${Date.now()}`,
      user: sess.username,
      createdAt: new Date().toISOString(),
      totals,
      coupon: cart.coupon,
      shippingInfo: shippingInfo || {},
      status: "Processing"
    };
    orders.unshift(order);
    lsSet(LS.orders, orders);
    clearCart();
    return { ok:true, order };
  }

  // ---- support tickets ----
  function getTickets(){ return lsGet(LS.tickets, []); }
  function createTicket(subject, message){
    const sess = requireLogin();
    const t = getTickets();
    const ticket = {
      id:`TCK-${Math.random().toString(36).slice(2,7).toUpperCase()}-${Date.now()}`,
      user:sess.username,
      createdAt:new Date().toISOString(),
      subject:String(subject||"").slice(0,120),
      message:String(message||"").slice(0,4000),
      status:"Open"
    };
    t.unshift(ticket);
    lsSet(LS.tickets, t);
    return ticket;
  }

  // ---- forum (stored XSS simulation uses renderText per post body) ----
  function getForum(){
    const seed = [
      { id:"th-1", title:"Welcome to TaskMart Forum", createdAt:new Date(Date.now()-86400000).toISOString(),
        posts:[
          { id:"p-1", user:"admin", createdAt:new Date(Date.now()-86400000).toISOString(),
            body:"Classroom-only forum. Keep posts professional." }
        ]
      }
    ];
    const stored = lsGet(LS.forum, null);
    if (!stored){ lsSet(LS.forum, seed); return seed; }
    return stored;
  }
  function createThread(title, body){
    const sess = requireLogin();
    const forum = getForum();
    const th = {
      id:`th-${Math.random().toString(36).slice(2,7)}`,
      title:String(title||"").slice(0,120),
      createdAt:new Date().toISOString(),
      posts:[
        { id:`p-${Math.random().toString(36).slice(2,7)}`, user:sess.username, createdAt:new Date().toISOString(),
          body:String(body||"").slice(0,4000) }
      ]
    };
    forum.unshift(th);
    lsSet(LS.forum, forum);
    return th;
  }
  function addPost(threadId, body){
    const sess = requireLogin();
    const forum = getForum();
    const th = forum.find(x=>x.id===threadId);
    if (!th) return { ok:false, error:"Thread not found." };
    th.posts.push({ id:`p-${Math.random().toString(36).slice(2,7)}`, user:sess.username, createdAt:new Date().toISOString(),
      body:String(body||"").slice(0,4000) });
    lsSet(LS.forum, forum);
    return { ok:true };
  }

  // ---- reviews ----
  function getReviews(){ return lsGet(LS.reviews, {}); }
  function addReview(productId, rating, body){
    const sess = requireLogin();
    const reviews = getReviews();
    if (!reviews[productId]) reviews[productId] = [];
    reviews[productId].unshift({
      id:`rv-${Math.random().toString(36).slice(2,7)}`,
      user:sess.username,
      createdAt:new Date().toISOString(),
      rating: Math.max(1, Math.min(5, Number(rating||5))),
      body: String(body||"").slice(0,2000)
    });
    lsSet(LS.reviews, reviews);
    return reviews[productId];
  }

  // ---- reset ----
  function resetLab(preserveTraining=true){
    lsDel(LS.cart);
    lsDel(LS.orders);
    lsDel(LS.tickets);
    lsDel(LS.forum);
    lsDel(LS.reviews);
    lsDel(LS.coupons);
    if (!preserveTraining) lsDel(LS.training);
  }

  // ---- ui helpers ----
  function fmtMoney(n){
    const x = Number(n||0);
    return `$${x.toFixed(2)}`;
  }
  function setActiveNav(){
    const path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("[data-nav]").forEach(a=>{
      const href = (a.getAttribute("href")||"").toLowerCase();
      if (href === path) a.classList.add("active");
    });
  }
  function mountHeader(){
    const holder = document.getElementById("tmHeader");
    if (!holder) return;
    const s = getSession();
    const training = isTrainingMode();
    holder.innerHTML = `
      <div class="nav">
        <div class="container nav-inner">
          <a class="brand" href="index.html" aria-label="TaskMart Home">
            <span class="brand-badge" aria-hidden="true"></span>
            <span>TaskMart</span>
            <span class="pill">PoC Lab</span>
          </a>
          <div class="nav-links">
            <a class="chip" data-nav href="shop.html">Shop</a>
            <a class="chip" data-nav href="cart.html">Cart</a>
            <a class="chip" data-nav href="account.html">Account</a>
            <a class="chip" data-nav href="support.html">Support</a>
            <a class="chip" data-nav href="forum.html">Forum</a>
            <a class="chip" data-nav href="admin.html">Admin</a>
            <a class="chip" data-nav href="teacher.html">Teacher</a>
            ${s ? `<span class="badge ok">User: <span class="mono">${escapeHtml(s.username)}</span></span>` : `<a class="chip" data-nav href="login.html">Login</a>`}
            ${s ? `<button class="btn ghost" id="tmLogoutBtn" type="button">Logout</button>` : ``}
          </div>
        </div>
      </div>
      <div class="container" style="padding-top:12px">
        ${training ? `
          <div class="banner danger" role="alert">
            <div>
              <strong>Training Mode ON</strong>
              <div class="small">Selected components use intentionally unsafe rendering sinks for classroom simulation. Use only in authorized lab contexts.</div>
            </div>
            <a class="btn danger" href="teacher.html" style="white-space:nowrap">Teacher Controls</a>
          </div>
        ` : ``}
      </div>
    `;
    const btn = document.getElementById("tmLogoutBtn");
    if (btn){
      btn.addEventListener("click", ()=>{
        logout();
        window.location.href = "index.html";
      });
    }
    setActiveNav();
  }

  function mountFooter(){
    const holder = document.getElementById("tmFooter");
    if (!holder) return;
    holder.innerHTML = `
      <div class="container footer">
        <div class="hr"></div>
        <div class="row">
          <span class="badge">Static Simulation</span>
          <span class="badge warn">No Backend</span>
          <span class="badge">localStorage Persistence</span>
          <span class="badge danger">Training Mode Optional</span>
        </div>
        <div style="margin-top:10px">
          TaskMart is a classroom-only PoC training environment. Do not reuse credentials. Do not deploy Training Mode publicly.
        </div>
      </div>
    `;
  }

  function getQueryParam(name){
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  return {
    LS,
    CATALOG,
    HARD_USERS,
    lsGet, lsSet, lsDel,
    isTrainingMode, setTrainingMode,
    getSession, login, logout, requireLogin, requireRole,
    escapeHtml, renderText,
    getCart, setCart, addToCart, updateCartQty, clearCart,
    getCoupons, applyCoupon, calcTotals, fmtMoney,
    getOrders, placeOrder,
    getTickets, createTicket,
    getForum, createThread, addPost,
    getReviews, addReview,
    resetLab,
    mountHeader, mountFooter,
    getQueryParam
  };
})();
