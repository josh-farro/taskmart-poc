
document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("cartTable");
  const totals = document.getElementById("cartTotals");
  const coupon = document.getElementById("coupon");
  const couponMsg = document.getElementById("couponMsg");

  function render(){
    const cart = TM.getCart();
    const t = TM.calcTotals(cart);

    if (t.items.length === 0){
      table.innerHTML = `<div class="notice">Cart is empty. Go to <a class="chip" href="shop.html">Shop</a>.</div>`;
      totals.innerHTML = "";
      return;
    }

    table.innerHTML = `
      <table class="table">
        <thead><tr><th>Item</th><th>Unit</th><th>Qty</th><th>Line</th><th></th></tr></thead>
        <tbody>
          ${t.items.map(i => `
            <tr>
              <td>${TM.escapeHtml(i.name)}</td>
              <td class="mono">${TM.fmtMoney(i.unit)}</td>
              <td><input class="input" style="max-width:90px" type="number" min="0" value="${i.qty}" data-qty="${TM.escapeHtml(i.productId)}" /></td>
              <td class="mono">${TM.fmtMoney(i.line)}</td>
              <td><button class="btn danger" type="button" data-del="${TM.escapeHtml(i.productId)}">Remove</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    table.querySelectorAll("input[data-qty]").forEach(inp=>{
      inp.addEventListener("change", ()=>{
        const pid = inp.getAttribute("data-qty");
        TM.updateCartQty(pid, inp.value);
        render();
      });
    });
    table.querySelectorAll("button[data-del]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        TM.updateCartQty(btn.getAttribute("data-del"), 0);
        render();
      });
    });

    totals.innerHTML = `
      <div class="grid cols-2">
        <div class="kpi"><div class="label">Subtotal</div><div class="value mono">${TM.fmtMoney(t.subtotal)}</div></div>
        <div class="kpi"><div class="label">Discount</div><div class="value mono">-${TM.fmtMoney(t.discount)}</div></div>
        <div class="kpi"><div class="label">Shipping</div><div class="value mono">${TM.fmtMoney(t.shipping)}</div></div>
        <div class="kpi"><div class="label">Tax</div><div class="value mono">${TM.fmtMoney(t.tax)}</div></div>
        <div class="kpi" style="grid-column:1/-1">
          <div class="label">Total (client-side computed)</div>
          <div class="value mono">${TM.fmtMoney(t.total)}</div>
        </div>
      </div>
      <div class="row" style="margin-top:14px">
        <a class="btn secondary" href="checkout.html">Proceed to Checkout</a>
        <button class="btn ghost" id="clearCartBtn" type="button">Clear Cart</button>
      </div>
      <div class="small" style="margin-top:10px">Teaching note: totals, coupons, shipping rules, and taxes are calculated in the browser.</div>
    `;

    document.getElementById("clearCartBtn").addEventListener("click", ()=>{
      TM.clearCart();
      render();
    });

    coupon.value = cart.coupon ? cart.coupon.code : "";
  }

  document.getElementById("couponForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    couponMsg.textContent = "";
    const r = TM.applyCoupon(coupon.value);
    couponMsg.textContent = r.ok ? `Applied ${r.coupon.code}` : "Invalid coupon (simulation).";
    couponMsg.className = r.ok ? "badge ok" : "badge danger";
    render();
  });

  render();
});
