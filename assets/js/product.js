
document.addEventListener("DOMContentLoaded", () => {
  const id = TM.getQueryParam("id") || "p100";
  const p = TM.CATALOG.find(x=>x.id===id) || TM.CATALOG[0];

  document.getElementById("pName").textContent = p.name;
  document.getElementById("pPrice").textContent = TM.fmtMoney(p.price);
  document.getElementById("pCat").textContent = p.category;
  document.getElementById("pDesc").textContent = p.desc;

  const addBtn = document.getElementById("addBtn");
  addBtn.addEventListener("click", ()=>{
    TM.addToCart(p.id, 1);
    addBtn.textContent = "Added";
    setTimeout(()=>addBtn.textContent="Add to Cart", 650);
  });

  // Reviews (stored XSS simulation point):
  // - Safe mode: renderText uses textContent
  // - Training mode: renderText uses innerHTML (unsafe sink)
  const list = document.getElementById("reviewList");
  const form = document.getElementById("reviewForm");
  const msg = document.getElementById("reviewMsg");

  function renderReviews(){
    const reviews = TM.getReviews()[p.id] || [];
    if (reviews.length === 0){
      list.innerHTML = `<div class="notice">No reviews yet. Add one for the lab.</div>`;
      return;
    }
    list.innerHTML = reviews.map(r => `
      <div class="kpi">
        <div class="row" style="justify-content:space-between">
          <div class="badge">${TM.escapeHtml(r.user)}</div>
          <div class="pill">${new Date(r.createdAt).toLocaleString()}</div>
        </div>
        <div class="small" style="margin-top:8px">Rating: <span class="mono">${r.rating}/5</span></div>
        <div class="hr"></div>
        <div class="small" data-review-body="${TM.escapeHtml(r.id)}"></div>
      </div>
    `).join("");

    reviews.forEach(r => {
      const el = list.querySelector(`[data-review-body="${CSS.escape(r.id)}"]`);
      if (el) TM.renderText(el, r.body); // toggled sink
    });
  }

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    msg.textContent = "";
    try{
      TM.requireLogin();
    }catch(_){
      window.location.href = `login.html?next=${encodeURIComponent('product.html?id='+p.id)}`;
      return;
    }
    const rating = document.getElementById("rating").value;
    const body = document.getElementById("body").value;
    TM.addReview(p.id, rating, body);
    document.getElementById("body").value = "";
    msg.textContent = "Review saved to localStorage.";
    msg.className = "badge ok";
    renderReviews();
  });

  renderReviews();
});
