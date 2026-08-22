/* MEDICORE — prescriptions.js */
const Prescriptions = (() => {
  let statusFilter = '';

  function init(){
    render();
    document.getElementById('rxStatusFilter')?.addEventListener('change', (e) => { statusFilter = e.target.value; render(); });
    document.getElementById('addRxBtn')?.addEventListener('click', () => document.getElementById('addRxModal').classList.add('open'));
    document.getElementById('addRxForm')?.addEventListener('submit', onAdd);
  }

  function statusClass(s){ return { Active:'badge-good', Completed:'badge-neutral', Expired:'badge-critical' }[s] || 'badge-neutral'; }

  function render(){
    const el = document.getElementById('rxList');
    if (!el) return;
    let list = AppState.prescriptions().slice();
    if (statusFilter) list = list.filter(r => r.status === statusFilter);
    if (!list.length){ el.innerHTML = `<div class="empty-state"><h4>No prescriptions</h4><p>No health data available for this selection.</p></div>`; return; }
    el.innerHTML = `<div class="grid grid-2">` + list.map(r => `
      <div class="rx-card">
        <div class="rx-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="9.5" width="17" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M8 8l8 8"/></svg></div>
        <div class="rx-body">
          <div class="flex-between"><h4>${Utils.escapeHtml(r.medication)}</h4><span class="badge ${statusClass(r.status)}">${r.status}</span></div>
          <div class="rx-dose">${r.dosage} · ${r.frequency} · ${r.duration}</div>
          <div style="font-size:.78rem;color:var(--text-muted);margin-top:4px;">Prescribed by ${Utils.escapeHtml(r.doctor)}</div>
          <div style="font-size:.78rem;color:var(--text-muted);">${Utils.formatDate(r.start)} — ${Utils.formatDate(r.end)}</div>
          <div class="rx-progress"><div class="bar-track"><div class="bar-fill" style="width:${Math.round(r.progress*100)}%;"></div></div></div>
        </div>
      </div>
    `).join('') + `</div>`;
  }

  function onAdd(e){
    e.preventDefault();
    const all = AppState.prescriptions();
    all.unshift({
      id: Utils.uid('rx'),
      medication: document.getElementById('rxMed').value || 'Demo Medication',
      dosage: document.getElementById('rxDose').value || '—',
      frequency: document.getElementById('rxFreq').value || '—',
      duration: document.getElementById('rxDuration').value || '—',
      doctor: Auth.currentUser().role === 'doctor' ? Auth.currentUser().name : 'Dr. Amara Chen',
      start: new Date().toISOString().slice(0,10),
      end: new Date(Date.now()+7*86400000).toISOString().slice(0,10),
      status: 'Active',
      progress: 0.05,
    });
    Storage.set('prescriptions', all);
    document.getElementById('addRxModal').classList.remove('open');
    e.target.reset();
    render();
    Notify.toast('Demo prescription created. Not a medically valid prescription.', 'info');
  }

  return { init };
})();
