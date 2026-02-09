
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ticketForm");
  const msg = document.getElementById("ticketMsg");
  const list = document.getElementById("ticketList");

  function renderTickets(){
    const s = TM.getSession();
    const all = TM.getTickets();
    const tickets = s ? all.filter(t => t.user === s.username) : [];
    if (!s){
      list.innerHTML = `<div class="notice">Login to create and view your tickets.</div>`;
      return;
    }
    if (tickets.length === 0){
      list.innerHTML = `<div class="notice">No tickets yet.</div>`;
      return;
    }
    list.innerHTML = `
      <table class="table">
        <thead><tr><th>ID</th><th>Subject</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          ${tickets.map(t=>`
            <tr>
              <td class="mono">${TM.escapeHtml(t.id)}</td>
              <td>${TM.escapeHtml(t.subject)}</td>
              <td>${TM.escapeHtml(t.status)}</td>
              <td>${new Date(t.createdAt).toLocaleString()}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    msg.textContent = "";
    try{ TM.requireLogin(); }catch(_){
      window.location.href = `login.html?next=${encodeURIComponent("support.html")}`;
      return;
    }
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;
    TM.createTicket(subject, message);
    document.getElementById("subject").value = "";
    document.getElementById("message").value = "";
    msg.textContent = "Ticket saved to localStorage.";
    msg.className = "badge ok";
    renderTickets();
  });

  renderTickets();
});
