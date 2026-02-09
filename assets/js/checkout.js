
document.addEventListener("DOMContentLoaded", () => {
  // require login for checkout
  let s = null;
  try{ s = TM.requireLogin(); }catch(_){ return; }

  const cart = TM.getCart();
  const t = TM.calcTotals(cart);

  const summary = document.getElementById("summary");
  if (t.items.length === 0){
    summary.innerHTML = `<div class="notice">Cart is empty. Return to <a class="chip" href="shop.html">Shop</a>.</div>`;
    document.getElementById("checkoutForm").style.display="none";
    return;
  }

  summary.innerHTML = `
    <table class="table">
      <thead><tr><th>Item</th><th>Qty</th><th>Line</th></tr></thead>
      <tbody>
        ${t.items.map(i=>`<tr><td>${TM.escapeHtml(i.name)}</td><td class="mono">${i.qty}</td><td class="mono">${TM.fmtMoney(i.line)}</td></tr>`).join("")}
      </tbody>
    </table>
    <div class="hr"></div>
    <div class="row" style="justify-content:space-between">
      <div class="badge">Coupon: <span class="mono">${cart.coupon ? TM.escapeHtml(cart.coupon.code) : "None"}</span></div>
      <div class="badge ok">Total: <span class="mono">${TM.fmtMoney(t.total)}</span></div>
    </div>
  `;

  const msg = document.getElementById("checkoutMsg");
  document.getElementById("checkoutForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    msg.textContent = "";
    const info = {
      fullName: document.getElementById("fullName").value.slice(0,120),
      address: document.getElementById("address").value.slice(0,250),
      notes: document.getElementById("notes").value.slice(0,400)
    };
    const r = TM.placeOrder(info);
    if (!r.ok){
      msg.textContent = r.error;
      msg.className = "badge danger";
      return;
    }
    msg.textContent = `Order placed: ${r.order.id}`;
    msg.className = "badge ok";
    setTimeout(()=> window.location.href = "account.html", 700);
  });
});
