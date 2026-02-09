
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const msg = document.getElementById("loginMsg");
  const next = TM.getQueryParam("next");
  if (form){
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      msg.textContent = "";
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;
      const r = TM.login(username, password);
      if (!r.ok){
        msg.textContent = r.error;
        msg.className = "badge danger";
        return;
      }
      const target = next ? next : (r.session.role === "admin" ? "admin.html" : "account.html");
      window.location.href = target;
    });
  }
  const list = document.getElementById("accountList");
  if (list){
    const sample = TM.HARD_USERS.map(u => `${u.username} / ${u.password} (${u.role})`).join("\n");
    list.textContent = sample;
  }
});
