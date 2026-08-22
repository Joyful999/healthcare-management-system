/* MEDICORE — patients.js */
const Patients = (() => {
  let state = { q:'', status:'', sortKey:'name', sortDir:1, page:1, pageSize:6 };

  function init(){
    render();
    wireControls();
  }

  function getFiltered(){
    let list = AppState.patients().filter(p => {
      if (state.q && !p.name.toLowerCase().includes(state.q.toLowerCase())) return false;
      if (state.status && p.status !== state.status) return false;
      return true;
    });
    list.sort((a,b) => {
      const av = a[state.sortKey], bv = b[state.sortKey];
      if (typeof av === 'number') return (av - bv) * state.sortDir;
      return String(av).localeCompare(String(bv)) * state.sortDir;
    });
    return list;
  }

  function statusBadge(status){
    return { Active:'badge-good', Inactive:'badge-neutral', Pending:'badge-warn' }[status] || 'badge-neutral';
  }

  function render(){
    const all = getFiltered();
    const totalPages = Math.max(1, Math.ceil(all.length / state.pageSize));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * state.pageSize;
    const pageItems = all.slice(start, start + state.pageSize);

    const tbody = document.getElementById('patientsTbody');
    if (!tbody) return;
    if (!pageItems.length){
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><h4>No patients found</h4><p>Try a different search or filter.</p></div></td></tr>`;
    } else {
      tbody.innerHTML = pageItems.map(p => `
        <tr data-id="${p.id}">
          <td class="mono">${p.id.replace('pat_','PT-')}</td>
          <td><div class="row-avatar"><span class="avatar-sm">${Utils.initials(p.name)}</span>${p.name}</div></td>
          <td>${p.age}</td>
          <td>${p.gender}</td>
          <td>${Utils.formatDate(p.lastVisit)}</td>
          <td>${p.nextAppt === '—' ? '—' : Utils.formatDate(p.nextAppt)}</td>
          <td><span class="badge ${statusBadge(p.status)}">${p.status}</span></td>
          <td><button class="btn btn-ghost btn-sm" data-view="${p.id}">View</button></td>
        </tr>
      `).join('');
    }
    tbody.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => openProfile(btn.dataset.view)));

    const pag = document.getElementById('patientsPagination');
    if (pag){
      pag.innerHTML = `
        <span>Showing ${all.length ? start+1 : 0}–${Math.min(start+state.pageSize, all.length)} of ${all.length}</span>
        <div class="pager-btns">
          <button class="pager-btn" id="pagPrev" ${state.page===1?'disabled':''}>&larr;</button>
          <span class="pager-btn active">${state.page}</span>
          <button class="pager-btn" id="pagNext" ${state.page===totalPages?'disabled':''}>&rarr;</button>
        </div>`;
      pag.querySelector('#pagPrev')?.addEventListener('click', () => { state.page--; render(); });
      pag.querySelector('#pagNext')?.addEventListener('click', () => { state.page++; render(); });
    }
  }

  function openProfile(id){
    const p = AppState.patients().find(x => x.id === id);
    if (!p) return;
    const rx = AppState.prescriptions().slice(0,2);
    const records = AppState.records().slice(0,3);
    const appts = AppState.appointments().slice(0,2);
    document.getElementById('patientProfileBody').innerHTML = `
      <div class="banner-demo" style="margin-bottom:14px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>DEMO PATIENT DATA — NOT REAL MEDICAL RECORDS</div>
      <div class="flex gap-16" style="align-items:center;margin-bottom:16px;">
        <div class="avatar-photo" style="width:60px;height:60px;">${Utils.initials(p.name)}</div>
        <div><strong style="font-size:1.1rem;">${p.name}</strong><div style="color:var(--text-muted);font-size:.85rem;">${p.age} yrs · ${p.gender} · <span class="badge ${statusBadge(p.status)}">${p.status}</span></div></div>
      </div>
      <div class="tabs" id="patProfileTabs">
        <button class="tab-btn active" data-tab="overview">Overview</button>
        <button class="tab-btn" data-tab="history">Medical history</button>
        <button class="tab-btn" data-tab="rx">Prescriptions</button>
        <button class="tab-btn" data-tab="appts">Appointments</button>
      </div>
      <div class="tab-panel active" data-panel="overview">
        <div class="grid grid-2" style="gap:12px;">
          <div><div class="kpi-footnote">Phone</div><strong>${p.phone}</strong></div>
          <div><div class="kpi-footnote">Emergency contact</div><strong>${p.emergency}</strong></div>
          <div><div class="kpi-footnote">Last visit</div><strong>${Utils.formatDate(p.lastVisit)}</strong></div>
          <div><div class="kpi-footnote">Next appointment</div><strong>${p.nextAppt==='—'?'—':Utils.formatDate(p.nextAppt)}</strong></div>
        </div>
      </div>
      <div class="tab-panel" data-panel="history">
        ${records.map(r => `<div class="record-item" style="margin-bottom:10px;"><div class="record-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg></div><div><strong>${r.diagnosis}</strong><div style="font-size:.78rem;color:var(--text-muted);">${r.type} · ${Utils.formatDate(r.date)}</div></div></div>`).join('')}
      </div>
      <div class="tab-panel" data-panel="rx">
        ${rx.map(r => `<div class="rx-card" style="margin-bottom:10px;"><div class="rx-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="9.5" width="17" height="7" rx="3.5" transform="rotate(-45 12 12)"/></svg></div><div class="rx-body"><h4>${r.medication}</h4><div class="rx-dose">${r.dosage} · ${r.frequency}</div></div></div>`).join('')}
      </div>
      <div class="tab-panel" data-panel="appts">
        ${appts.map(a => `<div class="list-row"><div class="lr-meta"><div class="lr-title">${a.doctorName}</div><div class="lr-sub">${a.specialty}</div></div><time>${Utils.formatDate(a.date)}</time></div>`).join('')}
      </div>
      <div style="margin-top:14px;"><span class="kpi-footnote">Documents:</span> <span class="demo-tag">3 demo documents</span></div>
    `;
    document.querySelectorAll('#patProfileTabs .tab-btn').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('#patProfileTabs .tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('[data-panel]').forEach(p2 => p2.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.add('active');
    }));
    document.getElementById('patientProfileModal').classList.add('open');
  }

  function wireControls(){
    document.getElementById('patSearch')?.addEventListener('input', Utils.debounce((e) => { state.q = e.target.value; state.page = 1; render(); }, 200));
    document.getElementById('patStatusFilter')?.addEventListener('change', (e) => { state.status = e.target.value; state.page = 1; render(); });
    document.querySelectorAll('[data-sort]').forEach(btn => btn.addEventListener('click', () => {
      const key = btn.dataset.sort;
      state.sortDir = state.sortKey === key ? -state.sortDir : 1;
      state.sortKey = key;
      render();
    }));
  }

  return { init };
})();
