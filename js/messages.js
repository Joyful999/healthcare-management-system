/* MEDICORE — messages.js */
const Messages = (() => {
  let activeId = null;

  function init(){
    const convs = AppState.conversations();
    activeId = convs[0]?.id || null;
    renderConvList();
    renderChat();
    wireComposer();
    wireSearch();
  }

  function renderConvList(filterQ = ''){
    const el = document.getElementById('convList');
    if (!el) return;
    let convs = AppState.conversations();
    if (filterQ) convs = convs.filter(c => c.withName.toLowerCase().includes(filterQ.toLowerCase()));
    el.innerHTML = convs.map(c => {
      const last = c.messages[c.messages.length-1];
      return `<div class="conv-item ${c.id===activeId?'active':''}" data-id="${c.id}">
        <span class="avatar-sm" style="width:38px;height:38px;">${Utils.initials(c.withName)}</span>
        <div class="conv-meta">
          <div class="conv-name">${Utils.escapeHtml(c.withName)} ${c.unread ? '<span class="conv-unread"></span>' : ''}</div>
          <div class="conv-preview">${Utils.escapeHtml(last?.text || '')}</div>
        </div>
      </div>`;
    }).join('');
    el.querySelectorAll('.conv-item').forEach(item => item.addEventListener('click', () => {
      activeId = item.dataset.id;
      markConvRead(activeId);
      renderConvList(filterQ);
      renderChat();
    }));
  }

  function markConvRead(id){
    const all = AppState.conversations().map(c => c.id === id ? { ...c, unread:0 } : c);
    Storage.set('conversations', all);
  }

  function renderChat(){
    const conv = AppState.conversations().find(c => c.id === activeId);
    const head = document.getElementById('chatHead');
    const body = document.getElementById('chatBody');
    if (!conv){ if(head) head.innerHTML=''; if(body) body.innerHTML = `<div class="empty-state"><h4>No conversation selected</h4></div>`; return; }
    if (head) head.innerHTML = `<span class="avatar-sm" style="width:36px;height:36px;">${Utils.initials(conv.withName)}</span><div><strong style="display:block;font-size:.9rem;">${conv.withName}</strong><span style="font-size:.76rem;color:var(--text-muted);">${conv.withRole}</span></div>`;
    if (body){
      body.innerHTML = conv.messages.map(m => `<div class="bubble ${m.from==='me'?'out':'in'}">${Utils.escapeHtml(m.text)}<time>${Utils.timeAgo(m.time)}</time></div>`).join('');
      body.scrollTop = body.scrollHeight;
    }
  }

  function wireComposer(){
    const form = document.getElementById('composeForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('composeInput');
      const text = input.value.trim();
      if (!text || !activeId) return;
      const all = AppState.conversations();
      const idx = all.findIndex(c => c.id === activeId);
      if (idx === -1) return;
      all[idx].messages.push({ from:'me', text, time:new Date().toISOString() });
      Storage.set('conversations', all);
      input.value = '';
      renderChat();
      renderConvList();
      Notify.toast('Demo message sent.', 'good');
    });
  }

  function wireSearch(){
    document.getElementById('convSearch')?.addEventListener('input', Utils.debounce((e) => renderConvList(e.target.value), 150));
  }

  return { init };
})();
