/* MEDICORE — records.js */
const Records = (() => {
  let typeFilter = '';

  function init(){
    render();
    document.getElementById('recordTypeFilter')?.addEventListener('change', (e) => { typeFilter = e.target.value; render(); });
    document.getElementById('addRecordBtn')?.addEventListener('click', () => document.getElementById('addRecordModal').classList.add('open'));
    document.getElementById('addRecordForm')?.addEventListener('submit', onAdd);
  }

  const typeIcon = {
    Consultation:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/></svg>',
    Laboratory:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2v6L4 20a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 8V2"/></svg>',
    Imaging:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>',
    Prescription:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3.5" y="9.5" width="17" height="7" rx="3.5" transform="rotate(-45 12 12)"/></svg>',
    'Follow-up':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  };

  function render(){
    const el = document.getElementById('recordsList');
    if (!el) return;
    let list = AppState.records().slice().sort((a,b) => new Date(b.date)-new Date(a.date));
    if (typeFilter) list = list.filter(r => r.type === typeFilter);
    if (!list.length){ el.innerHTML = `<div class="empty-state"><h4>No records available</h4><p>No health data available for this selection.</p></div>`; return; }
    el.innerHTML = list.map(r => `
      <div class="record-item">
        <div class="record-icon">${typeIcon[r.type] || typeIcon.Consultation}</div>
        <div style="flex:1;">
          <div class="flex-between"><strong>${Utils.escapeHtml(r.diagnosis)}</strong><span class="badge badge-info">${r.type}</span></div>
          <div style="font-size:.8rem;color:var(--text-muted);margin:4px 0;">${Utils.escapeHtml(r.doctor)} · ${Utils.formatDate(r.date)}</div>
          <p style="font-size:.85rem;margin:0;">${Utils.escapeHtml(r.notes)}</p>
          <div style="margin-top:8px;font-size:.76rem;color:var(--text-muted);">${r.attachments} attachment${r.attachments===1?'':'s'} · <span class="demo-tag">Demo record</span></div>
        </div>
      </div>
    `).join('');
  }

  function onAdd(e){
    e.preventDefault();
    const all = AppState.records();
    all.unshift({
      id: Utils.uid('rec'),
      date: new Date().toISOString().slice(0,10),
      type: document.getElementById('recType').value,
      doctor: document.getElementById('recDoctor').value || 'Dr. Amara Chen',
      diagnosis: document.getElementById('recDiagnosis').value || 'Demo diagnosis entry',
      notes: document.getElementById('recNotes').value || '',
      attachments: 0,
    });
    Storage.set('records', all);
    document.getElementById('addRecordModal').classList.remove('open');
    e.target.reset();
    render();
    Notify.toast('Demo record added.', 'good');
  }

  return { init };
})();
