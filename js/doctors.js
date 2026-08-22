/* MEDICORE — doctors.js */
const Doctors = (() => {
  let filters = { q:'', specialty:'', location:'', type:'', rating:0 };

  function init(){
    populateFilterOptions();
    render();
    wireFilters();
  }

  function populateFilterOptions(){
    const doctors = AppState.doctors();
    const specSel = document.getElementById('filterSpecialty');
    const locSel = document.getElementById('filterLocation');
    if (specSel){
      const specs = [...new Set(doctors.map(d => d.specialty))].sort();
      specSel.innerHTML = `<option value="">All specialties</option>` + specs.map(s => `<option value="${s}">${s}</option>`).join('');
    }
    if (locSel){
      const locs = [...new Set(doctors.map(d => d.location))].sort();
      locSel.innerHTML = `<option value="">All locations</option>` + locs.map(l => `<option value="${l}">${l}</option>`).join('');
    }
  }

  function matches(d){
    const q = filters.q.toLowerCase();
    if (q && !(d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q))) return false;
    if (filters.specialty && d.specialty !== filters.specialty) return false;
    if (filters.location && d.location !== filters.location) return false;
    if (filters.type && !d.type.includes(filters.type)) return false;
    if (filters.rating && d.rating < filters.rating) return false;
    return true;
  }

  function render(){
    const el = document.getElementById('doctorGrid');
    const countEl = document.getElementById('doctorResultCount');
    if (!el) return;
    const results = AppState.doctors().filter(matches);
    if (countEl) countEl.textContent = `${results.length} doctor${results.length !== 1 ? 's' : ''} found`;
    if (!results.length){
      el.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg><h4>No doctors match your filters</h4><p>Try adjusting specialty, location or rating.</p></div>`;
      return;
    }
    el.innerHTML = results.map(d => `
      <div class="doc-card">
        <div class="doc-head">
          <div class="avatar-photo">${Utils.initials(d.name)}</div>
          <div>
            <div class="doc-name">${d.name}</div>
            <div class="doc-spec">${d.specialty}</div>
          </div>
        </div>
        <div class="doc-meta-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${d.location}</div>
        <div class="doc-meta-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>${d.availability}</div>
        <div class="flex-between">
          <div class="doc-rating"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg>${d.rating} <span style="color:var(--text-muted);font-weight:500;">(${d.reviews})</span></div>
          <span class="demo-tag">Demo profile</span>
        </div>
        <button class="btn btn-primary btn-block btn-sm" data-doc="${d.id}">View profile</button>
      </div>
    `).join('');
    el.querySelectorAll('[data-doc]').forEach(btn => btn.addEventListener('click', () => openProfile(btn.dataset.doc)));
  }

  function openProfile(id){
    const d = AppState.doctors().find(x => x.id === id);
    if (!d) return;
    const overlay = document.getElementById('doctorProfileModal');
    document.getElementById('doctorProfileBody').innerHTML = `
      <div class="flex gap-16" style="align-items:center;margin-bottom:16px;">
        <div class="avatar-photo" style="width:64px;height:64px;font-size:1.3rem;">${Utils.initials(d.name)}</div>
        <div><strong style="font-size:1.15rem;">${d.name}</strong><div style="color:var(--brand);font-weight:600;font-size:.88rem;">${d.specialty}</div></div>
      </div>
      <p>${d.bio}</p>
      <div class="grid grid-2" style="gap:12px;margin:16px 0;">
        <div class="metric-tile"><div class="m-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div><div><div class="m-val">${d.experience} yrs</div><div class="m-lbl">Experience</div></div></div>
        <div class="metric-tile"><div class="m-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2Z"/></svg></div><div><div class="m-val">${d.rating} / 5</div><div class="m-lbl">${d.reviews} reviews (demo)</div></div></div>
      </div>
      <a class="btn btn-primary btn-block" href="appointments.html">Book with ${d.name.split(' ').slice(-1)[0]}</a>`;
    overlay.classList.add('open');
  }

  function wireFilters(){
    const q = document.getElementById('filterSearch');
    q?.addEventListener('input', Utils.debounce((e) => { filters.q = e.target.value; render(); }, 200));
    document.getElementById('filterSpecialty')?.addEventListener('change', (e) => { filters.specialty = e.target.value; render(); });
    document.getElementById('filterLocation')?.addEventListener('change', (e) => { filters.location = e.target.value; render(); });
    document.getElementById('filterType')?.addEventListener('change', (e) => { filters.type = e.target.value; render(); });
    document.getElementById('filterRating')?.addEventListener('change', (e) => { filters.rating = +e.target.value; render(); });
  }

  return { init };
})();
