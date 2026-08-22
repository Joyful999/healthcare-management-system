/* MEDICORE — app.js
   Renders the shared sidebar + topbar shell into every inner page and
   wires up global interactions: role switching, theme, search (Ctrl+K),
   notification drawer, mobile nav. Runs on every page via layout-init. */

const ICONS = {
  dashboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  doctor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><path d="M6 4H4M18 4h2M12 16v3a3 3 0 1 0 3-3h-3Z"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  pill:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="9.5" width="17" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M8 8l8 8"/></svg>',
  folder:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
  message:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c.2.6.7 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  building:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
  report:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 13h6M9 17h6M9 9h1"/></svg>',
  activity:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>',
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
  chevronDown:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
};

const NAV = {
  patient:[
    { label:'Dashboard', href:'patient-dashboard.html', icon:'dashboard' },
    { label:'Appointments', href:'appointments.html', icon:'calendar' },
    { label:'Doctors', href:'doctors.html', icon:'doctor' },
    { label:'Health Overview', href:'health.html', icon:'heart' },
    { label:'Prescriptions', href:'prescriptions.html', icon:'pill' },
    { label:'Medical Documents', href:'medical-records.html', icon:'folder' },
    { label:'Messages', href:'messages.html', icon:'message' },
    { label:'Profile', href:'profile.html', icon:'user' },
    { label:'Settings', href:'settings.html', icon:'settings' },
  ],
  doctor:[
    { label:'Dashboard', href:'doctor-dashboard.html', icon:'dashboard' },
    { label:'Patients', href:'patients.html', icon:'users' },
    { label:'Appointments', href:'appointments.html', icon:'calendar' },
    { label:'Medical Records', href:'medical-records.html', icon:'folder' },
    { label:'Prescriptions', href:'prescriptions.html', icon:'pill' },
    { label:'Schedule', href:'appointments.html?view=schedule', icon:'calendar' },
    { label:'Reports', href:'reports.html', icon:'report' },
    { label:'Messages', href:'messages.html', icon:'message' },
    { label:'Profile', href:'profile.html', icon:'user' },
  ],
  admin:[
    { label:'Overview', href:'admin-dashboard.html', icon:'dashboard' },
    { label:'Patients', href:'patients.html', icon:'users' },
    { label:'Doctors', href:'doctors.html', icon:'doctor' },
    { label:'Appointments', href:'appointments.html', icon:'calendar' },
    { label:'Departments', href:'admin-dashboard.html#departments', icon:'building' },
    { label:'Analytics', href:'analytics.html', icon:'chart' },
    { label:'Reports', href:'reports.html', icon:'report' },
    { label:'System Activity', href:'admin-dashboard.html#activity', icon:'activity' },
    { label:'Settings', href:'settings.html', icon:'settings' },
  ],
};

const Layout = (() => {

  function currentPage(){
    return document.body.dataset.page || location.pathname.split('/').pop();
  }

  function buildSidebar(role){
    const items = NAV[role] || NAV.patient;
    const page = currentPage();
    const links = items.map(item => {
      const itemPage = item.href.split(/[?#]/)[0];
      const active = itemPage === page;
      return `<a class="nav-link ${active ? 'active' : ''}" href="${item.href}">${ICONS[item.icon]}<span>${item.label}</span></a>`;
    }).join('');

    return `
      <a href="index.html" class="brand"><span class="brand-mark">${pulseMarkSvg()}</span><span class="brand-name">MEDI<b>CORE</b></span></a>
      <div class="nav-group-label">Menu</div>
      ${links}
      <div class="sidebar-foot">
        <div class="role-pill" id="roleSwitchTrigger" role="button" tabindex="0" aria-haspopup="true">
          <span class="avatar" id="sbAvatar">--</span>
          <div style="min-width:0;">
            <strong id="sbName">—</strong>
            <span id="sbRole">—</span>
          </div>
          ${ICONS.chevronDown}
        </div>
      </div>
    `;
  }

  function pulseMarkSvg(){
    return `<svg viewBox="0 0 24 24" fill="none"><path d="M3 12h4l2-6 3 12 2-9 2 3h5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function buildTopbar(){
    return `
      <button class="icon-btn menu-toggle" id="mobileMenuToggle" aria-label="Open navigation menu">${ICONS.menu}</button>
      <div class="search-trigger" id="searchTrigger" role="button" tabindex="0" aria-haspopup="dialog">
        ${ICONS.search}<span>Search patients, doctors, records…</span><kbd>Ctrl K</kbd>
      </div>
      <div class="topbar-actions">
        <button class="icon-btn" id="themeToggle" aria-label="Toggle dark mode">${ICONS.sun}</button>
        <button class="icon-btn" id="notifBell" aria-label="Notifications">
          ${ICONS.bell}<span class="dot" id="notifBellDot" style="display:none;"></span>
        </button>
        <div class="dropdown">
          <div class="topbar-user" id="userMenuTrigger" role="button" tabindex="0" aria-haspopup="true">
            <span class="avatar" id="tbAvatar">--</span>
            <span class="user-meta"><strong id="tbName">—</strong><span id="tbRole">—</span></span>
          </div>
          <div class="dropdown-menu" id="userMenu">
            <a class="dropdown-item" href="profile.html">${ICONS.user}Profile</a>
            <a class="dropdown-item" href="settings.html">${ICONS.settings}Settings</a>
            <div class="dropdown-sep"></div>
            <button class="dropdown-item" id="logoutBtn">${ICONS.logout}Sign out (demo)</button>
          </div>
        </div>
      </div>
    `;
  }

  function roleLabel(role){
    return { patient:'Patient', doctor:'Doctor', admin:'Administrator' }[role] || 'Patient';
  }

  function paintUser(){
    const user = Auth.currentUser();
    const initials = Utils.initials(user.name);
    ['sbAvatar','tbAvatar'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = initials; });
    const sbName = document.getElementById('sbName'); if (sbName) sbName.textContent = user.name;
    const sbRole = document.getElementById('sbRole'); if (sbRole) sbRole.textContent = roleLabel(user.role);
    const tbName = document.getElementById('tbName'); if (tbName) tbName.textContent = user.name;
    const tbRole = document.getElementById('tbRole'); if (tbRole) tbRole.textContent = roleLabel(user.role);
    return user;
  }

  function init(){
    AppState.ensureSeeded();
    Auth.ensureUsers();
    const theme = Storage.get('theme', 'light');
    document.documentElement.setAttribute('data-theme', theme);

    const user = Auth.currentUser();
    const sidebarSlot = document.getElementById('sidebarSlot');
    const topbarSlot = document.getElementById('topbarSlot');
    if (sidebarSlot) sidebarSlot.innerHTML = buildSidebar(user.role);
    if (topbarSlot) topbarSlot.innerHTML = buildTopbar();
    paintUser();
    Notify.updateBellDot();

    wireMobileNav();
    wireTheme();
    wireUserMenu();
    wireRoleSwitcher();
    wireNotifDrawer();
    wireSearch();
    wireLogout();
    wireModals();
    wireRoleButtons();
  }

  function wireModals(){
    Utils.qsa('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
      Utils.qsa('.modal-close, [data-close-modal]', overlay).forEach(btn => {
        btn.addEventListener('click', () => overlay.classList.remove('open'));
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') Utils.qsa('.modal-overlay.open').forEach(o => o.classList.remove('open'));
    });
  }

  function wireRoleButtons(){
    Utils.qsa('#roleSwitchModal [data-role]').forEach(btn => {
      btn.addEventListener('click', () => {
        Auth.switchRole(btn.dataset.role);
        const overlay = document.getElementById('roleSwitchModal');
        if (overlay) overlay.classList.remove('open');
        const targetPage = { patient:'patient-dashboard.html', doctor:'doctor-dashboard.html', admin:'admin-dashboard.html' }[btn.dataset.role];
        location.href = targetPage;
      });
    });
  }

  function wireMobileNav(){
    const toggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebarSlot');
    if (!toggle || !sidebar) return;
    let scrim = document.querySelector('.sidebar-scrim');
    if (!scrim){ scrim = document.createElement('div'); scrim.className = 'sidebar-scrim'; document.body.appendChild(scrim); }
    const close = () => { sidebar.classList.remove('open'); scrim.classList.remove('show'); };
    toggle.addEventListener('click', () => { sidebar.classList.add('open'); scrim.classList.add('show'); });
    scrim.addEventListener('click', close);
    sidebar.addEventListener('click', (e) => { if (e.target.closest('a.nav-link')) close(); });
  }

  function wireTheme(){
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const paint = () => {
      const t = document.documentElement.getAttribute('data-theme');
      btn.innerHTML = t === 'dark' ? ICONS.moon : ICONS.sun;
    };
    paint();
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      Storage.set('theme', next);
      paint();
    });
  }

  function wireUserMenu(){
    const trigger = document.getElementById('userMenuTrigger');
    const menu = document.getElementById('userMenu');
    if (!trigger || !menu) return;
    const toggle = (open) => menu.classList.toggle('open', open);
    trigger.addEventListener('click', (e) => { e.stopPropagation(); toggle(!menu.classList.contains('open')); });
    trigger.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(!menu.classList.contains('open')); }});
    document.addEventListener('click', () => toggle(false));
  }

  function wireRoleSwitcher(){
    const trigger = document.getElementById('roleSwitchTrigger');
    if (!trigger) return;
    const openModal = () => {
      const overlay = document.getElementById('roleSwitchModal');
      if (overlay) overlay.classList.add('open');
    };
    trigger.addEventListener('click', openModal);
    trigger.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openModal(); }});
  }

  function wireNotifDrawer(){
    const bell = document.getElementById('notifBell');
    const overlay = document.getElementById('notifDrawerOverlay');
    const drawer = document.getElementById('notifDrawer');
    if (!bell || !overlay || !drawer) return;
    const open = () => { overlay.classList.add('open'); drawer.classList.add('open'); Notify.renderDrawerList(); };
    const close = () => { overlay.classList.remove('open'); drawer.classList.remove('open'); };
    bell.addEventListener('click', open);
    overlay.addEventListener('click', close);
    document.getElementById('notifDrawerClose')?.addEventListener('click', close);
    document.getElementById('notifMarkAllRead')?.addEventListener('click', () => Notify.markAllRead());
  }

  function wireLogout(){
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      Auth.logout();
      Notify.toast('Signed out of demo session.', 'info');
      setTimeout(() => location.href = 'login.html', 500);
    });
  }

  function wireSearch(){
    const trigger = document.getElementById('searchTrigger');
    const overlay = document.getElementById('globalSearchOverlay');
    if (!trigger || !overlay) return;
    const input = overlay.querySelector('#globalSearchInput');
    const resultsEl = overlay.querySelector('#globalSearchResults');

    const open = () => {
      overlay.classList.add('open');
      setTimeout(() => input?.focus(), 30);
      runSearch('');
    };
    const close = () => overlay.classList.remove('open');

    trigger.addEventListener('click', open);
    trigger.addEventListener('keydown', (e) => { if (e.key === 'Enter'){ open(); }});
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); open(); }
      if (e.key === 'Escape') close();
    });

    function runSearch(q){
      if (!resultsEl) return;
      const query = q.trim().toLowerCase();
      const groups = [];

      const doctors = AppState.doctors().filter(d => !query || d.name.toLowerCase().includes(query) || d.specialty.toLowerCase().includes(query));
      const patients = AppState.patients().filter(p => !query || p.name.toLowerCase().includes(query));
      const appts = AppState.appointments().filter(a => !query || a.doctorName.toLowerCase().includes(query) || a.specialty.toLowerCase().includes(query));
      const rx = AppState.prescriptions().filter(r => !query || r.medication.toLowerCase().includes(query));

      if (doctors.length) groups.push({ label:'Doctors', items: doctors.slice(0,4).map(d => ({ title:d.name, sub:d.specialty, href:'doctors.html' })) });
      if (patients.length) groups.push({ label:'Patients', items: patients.slice(0,4).map(p => ({ title:p.name, sub:`Age ${p.age} · ${p.status}`, href:'patients.html' })) });
      if (appts.length) groups.push({ label:'Appointments', items: appts.slice(0,4).map(a => ({ title:`${a.doctorName} — ${a.specialty}`, sub:Utils.formatDate(a.date), href:'appointments.html' })) });
      if (rx.length) groups.push({ label:'Prescriptions', items: rx.slice(0,4).map(r => ({ title:r.medication, sub:`${r.dosage} · ${r.status}`, href:'prescriptions.html' })) });

      if (!groups.length){
        resultsEl.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><h4>No results</h4><p>Try a different name, specialty, or medication.</p></div>`;
        return;
      }
      resultsEl.innerHTML = groups.map(g => `
        <div class="nav-group-label" style="padding-left:2px;color:var(--text-muted);">${g.label}</div>
        ${g.items.map(it => `<a class="dropdown-item" style="padding:10px 8px;" href="${it.href}"><span><strong style="display:block;">${Utils.escapeHtml(it.title)}</strong><span style="color:var(--text-muted);font-size:.78rem;">${Utils.escapeHtml(it.sub)}</span></span></a>`).join('')}
      `).join('');
    }

    input?.addEventListener('input', Utils.debounce((e) => runSearch(e.target.value), 150));
  }

  return { init, roleLabel };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.layout !== 'none') Layout.init();
});
