
document.addEventListener("DOMContentLoaded", () => {
  let s = null;
  try{ s = TM.requireLogin(); }catch(_){ return; }

  document.getElementById("acctUser").textContent = s.username;
  document.getElementById("acctRole").textContent = s.role;

  const orders = TM.getOrders().filter(o => o.user === s.username);
  const holder = document.getElementById("orders");
  if (orders.length === 0){
    holder.innerHTML = `<div class="notice">No orders yet. Checkout from your cart to generate orders.</div>`;
    return;
  }
  holder.innerHTML = orders.map(o => `
    <div class="card" style="padding:14px; margin-bottom:12px">
      <div class="row" style="justify-content:space-between">
        <div class="badge ok">${TM.escapeHtml(o.id)}</div>
        <div class="pill">${new Date(o.createdAt).toLocaleString()}</div>
      </div>
      <div class="small" style="margin-top:8px">Status: <span class="mono">${TM.escapeHtml(o.status)}</span></div>
      <div class="hr"></div>
      <div class="grid cols-3">
        <div class="kpi"><div class="label">Subtotal</div><div class="value mono">${TM.fmtMoney(o.totals.subtotal)}</div></div>
        <div class="kpi"><div class="label">Discount</div><div class="value mono">-${TM.fmtMoney(o.totals.discount)}</div></div>
        <div class="kpi"><div class="label">Total</div><div class="value mono">${TM.fmtMoney(o.totals.total)}</div></div>
      </div>
      <div class="small" style="margin-top:10px">Teaching note: this is all stored client-side in localStorage.</div>
    </div>
  `).join("");
});
