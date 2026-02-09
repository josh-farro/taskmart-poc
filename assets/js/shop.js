
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("productGrid");
  const search = document.getElementById("search");
  const searchEcho = document.getElementById("searchEcho");
  const cat = document.getElementById("category");
  const cartBadge = document.getElementById("cartCount");

  function render(){
    const q = (search.value || "").trim().toLowerCase();
    const c = cat.value;
    const items = TM.CATALOG.filter(p => {
      const matchQ = !q || (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
      const matchC = (c === "All") || (p.category === c);
      return matchQ && matchC;
    });

    // Reflected XSS simulation point:
    // - Safe mode: TM.renderText uses textContent
    // - Training mode: TM.renderText uses innerHTML (unsafe sink)
    if (searchEcho) TM.renderText(searchEcho, q ? `Results for: ${q}` : "Browse products");

    grid.innerHTML = items.map(p => `
      <div class="product">
        <div class="top">
          <div>
            <div class="name">${TM.escapeHtml(p.name)}</div>
            <div class="small">${TM.escapeHtml(p.category)} · Stock ${p.stock}</div>
          </div>
          <div class="price">${TM.fmtMoney(p.price)}</div>
        </div>
        <div class="desc">${TM.escapeHtml(p.desc)}</div>
        <div class="meta">
          <a class="btn secondary" href="product.html?id=${encodeURIComponent(p.id)}">View</a>
          <button class="btn" data-add="${TM.escapeHtml(p.id)}" type="button">Add to Cart</button>
        </div>
      </div>
    `).join("");

    grid.querySelectorAll("button[data-add]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.getAttribute("data-add");
        TM.addToCart(id, 1);
        syncCartCount();
        btn.textContent = "Added";
        setTimeout(()=>btn.textContent="Add to Cart", 650);
      });
    });
  }

  function syncCartCount(){
    const cart = TM.getCart();
    const count = cart.items.reduce((a,b)=>a+b.qty,0);
    if (cartBadge) cartBadge.textContent = String(count);
  }

  // category options
  const cats = Array.from(new Set(TM.CATALOG.map(p=>p.category))).sort();
  cat.innerHTML = ["All", ...cats].map(x=>`<option>${TM.escapeHtml(x)}</option>`).join("");

  search.addEventListener("input", render);
  cat.addEventListener("change", render);

  render();
  syncCartCount();
});
