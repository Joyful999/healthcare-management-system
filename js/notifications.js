/* MEDICORE — notifications.js
   Toast messages + the notification drawer (bell icon). Demo state only. */

const Notify = (() => {

  const ICONS = {
    good: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
    critical: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v5m0 4h.01"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-5m0-3h.01"/></svg>',
  };

  function stack(){
    let el = document.querySelector('.toast-stack');
    if (!el){
      el = document.createElement('div');
      el.className = 'toast-stack';
      el.setAttribute('aria-live','polite');
      document.body.appendChild(el);
    }
    return el;
  }

  function toast(message, type = 'info', duration = 4200){
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `${ICONS[type] || ICONS.info}<span>${Utils.escapeHtml(message)}</span><button class="toast-close" aria-label="Dismiss notification">&times;</button>`;
    stack().appendChild(el);
    const remove = () => { el.style.opacity = '0'; setTimeout(() => el.remove(), 200); };
    el.querySelector('.toast-close').addEventListener('click', remove);
    setTimeout(remove, duration);
  }

  const CATEGORY_ICON = {
    appointments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    health: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
    messages: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/></svg>',
    system: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/></svg>',
  };

  function unreadCount(){
    return AppState.notifications().filter(n => !n.read).length;
  }

  function renderDrawerList(){
    const body = document.querySelector('#notifDrawerBody');
    if (!body) return;
    const items = AppState.notifications().slice().sort((a,b) => new Date(b.time) - new Date(a.time));
    if (!items.length){
      body.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg><h4>You're all caught up</h4><p>No notifications right now.</p></div>`;
      return;
    }
    body.innerHTML = items.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}" tabindex="0" role="button">
        <div class="notif-icon">${CATEGORY_ICON[n.category] || CATEGORY_ICON.system}</div>
        <div class="notif-text">
          <span class="notif-title">${Utils.escapeHtml(n.title)}</span>
          <span>${Utils.escapeHtml(n.body)}</span>
          <div class="notif-time">${Utils.timeAgo(n.time)}</div>
        </div>
      </div>
    `).join('');
    body.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', () => markRead(el.dataset.id));
    });
    updateBellDot();
  }

  function markRead(id){
    const all = AppState.notifications().map(n => n.id === id ? { ...n, read:true } : n);
    Storage.set('notifications', all);
    renderDrawerList();
  }

  function markAllRead(){
    const all = AppState.notifications().map(n => ({ ...n, read:true }));
    Storage.set('notifications', all);
    renderDrawerList();
    toast('All notifications marked as read.', 'good');
  }

  function updateBellDot(){
    const dot = document.querySelector('#notifBellDot');
    if (dot) dot.style.display = unreadCount() > 0 ? 'block' : 'none';
  }

  return { toast, renderDrawerList, markRead, markAllRead, updateBellDot, unreadCount };
})();
