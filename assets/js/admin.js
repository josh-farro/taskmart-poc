
document.addEventListener("DOMContentLoaded", () => {
  // client-side auth only (teaching point)
  let s = null;
  try{ s = TM.requireRole("admin"); }catch(_){ return; }

  const sess = TM.getSession();
  const panel = document.getElementById("debugPanel");
  const orders = TM.getOrders();
  const tickets = TM.getTickets();
  const forum = TM.getForum();
  const reviews = TM.getReviews();

  // information disclosure simulation: "debug-like" state
  panel.textContent = JSON.stringify({
    session: sess,
    trainingMode: TM.isTrainingMode(),
    totals: {
      orders: orders.length,
      tickets: tickets.length,
      threads: forum.length,
      reviewsProducts: Object.keys(reviews).length
    }
  }, null, 2);

  // basic tables
  document.getElementById("ordersCount").textContent = String(orders.length);
  document.getElementById("ticketsCount").textContent = String(tickets.length);
  document.getElementById("threadsCount").textContent = String(forum.length);

  document.getElementById("resetBtn").addEventListener("click", ()=>{
    TM.resetLab(true);
    window.location.reload();
  });

  const tbl = document.getElementById("ordersTable");
  if (orders.length === 0){
    tbl.innerHTML = `<div class="notice">No orders yet.</div>`;
  } else {
    tbl.innerHTML = `
      <table class="table">
        <thead><tr><th>ID</th><th>User</th><th>Total</th><th>Created</th></tr></thead>
        <tbody>
          ${orders.slice(0,12).map(o=>`
            <tr>
              <td class="mono">${TM.escapeHtml(o.id)}</td>
              <td>${TM.escapeHtml(o.user)}</td>
              <td class="mono">${TM.fmtMoney(o.totals.total)}</td>
              <td>${new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="small" style="margin-top:8px">Showing up to 12 orders (localStorage).</div>
    `;
  }
});
