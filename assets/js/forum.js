
document.addEventListener("DOMContentLoaded", () => {
  const threadsEl = document.getElementById("threads");
  const threadViewEl = document.getElementById("threadView");
  const threadId = TM.getQueryParam("thread");

  function renderThreadList(){
    const forum = TM.getForum();
    threadsEl.innerHTML = forum.map(th => `
      <a class="chip" href="forum.html?thread=${encodeURIComponent(th.id)}">
        ${TM.escapeHtml(th.title)} <span class="pill">${th.posts.length} posts</span>
      </a>
    `).join("");
  }

  function renderThread(){
    const forum = TM.getForum();
    const th = forum.find(x=>x.id===threadId);
    if (!th){
      threadViewEl.innerHTML = `<div class="notice">Select a thread to view.</div>`;
      return;
    }

    const postsHtml = th.posts.map(p => `
      <div class="kpi" style="margin-bottom:12px">
        <div class="row" style="justify-content:space-between">
          <div class="badge">${TM.escapeHtml(p.user)}</div>
          <div class="pill">${new Date(p.createdAt).toLocaleString()}</div>
        </div>
        <div class="hr"></div>
        <div class="small" data-post-body="${TM.escapeHtml(p.id)}"></div>
      </div>
    `).join("");

    threadViewEl.innerHTML = `
      <div class="card">
        <div class="row" style="justify-content:space-between">
          <h2 style="margin:0">${TM.escapeHtml(th.title)}</h2>
          <a class="btn ghost" href="forum.html">Back</a>
        </div>
        <div class="small" style="margin-top:8px">Stored XSS simulation: post bodies are rendered via a toggled sink.</div>
        <div class="hr"></div>
        ${postsHtml}
        <div class="hr"></div>
        <form id="postForm">
          <div class="row" style="align-items:flex-start">
            <textarea id="postBody" class="textarea" placeholder="Reply (stored to localStorage)"></textarea>
          </div>
          <div class="row" style="margin-top:10px">
            <button class="btn" type="submit">Add Reply</button>
            <span id="postMsg" class="small"></span>
          </div>
        </form>
      </div>
    `;

    th.posts.forEach(p=>{
      const el = threadViewEl.querySelector(`[data-post-body="${CSS.escape(p.id)}"]`);
      if (el) TM.renderText(el, p.body); // toggled sink
    });

    const postForm = document.getElementById("postForm");
    const postMsg = document.getElementById("postMsg");
    postForm.addEventListener("submit", (e)=>{
      e.preventDefault();
      postMsg.textContent = "";
      try{ TM.requireLogin(); }catch(_){
        window.location.href = `login.html?next=${encodeURIComponent("forum.html?thread="+threadId)}`;
        return;
      }
      const body = document.getElementById("postBody").value;
      const r = TM.addPost(threadId, body);
      if (!r.ok){
        postMsg.textContent = r.error;
        postMsg.className = "badge danger";
        return;
      }
      document.getElementById("postBody").value = "";
      postMsg.textContent = "Reply saved.";
      postMsg.className = "badge ok";
      renderThread();
      renderThreadList();
    });
  }

  // new thread form
  document.getElementById("threadForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const msg = document.getElementById("threadMsg");
    msg.textContent = "";
    try{ TM.requireLogin(); }catch(_){
      window.location.href = `login.html?next=${encodeURIComponent("forum.html")}`;
      return;
    }
    const title = document.getElementById("threadTitle").value;
    const body = document.getElementById("threadBody").value;
    const th = TM.createThread(title, body);
    document.getElementById("threadTitle").value = "";
    document.getElementById("threadBody").value = "";
    msg.textContent = "Thread created.";
    msg.className = "badge ok";
    window.location.href = `forum.html?thread=${encodeURIComponent(th.id)}`;
  });

  renderThreadList();
  if (threadId) renderThread();
  else threadViewEl.innerHTML = `<div class="notice">Select a thread to view. Create a new thread to practice stored XSS (Training Mode only).</div>`;
});
