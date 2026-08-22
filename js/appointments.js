/* MEDICORE — appointments.js
   Appointment list, calendar (month view) and the booking flow. */

const Appointments = (() => {
  let calMonth = new Date().getMonth();
  let calYear = new Date().getFullYear();
  let currentFilter = 'all';
  let bookingState = { specialty:null, doctor:null, date:null, time:null, type:'In-person', reason:'' };

  function init(){
    renderList();
    renderCalendar();
    wireToolbar();
    wireTabs();
    wireBookingModal();
  }

  function statusBadgeClass(status){
    return { upcoming:'badge-info', completed:'badge-good', cancelled:'badge-critical', pending:'badge-warn' }[status] || 'badge-neutral';
  }

  function renderList(filter = currentFilter){
    const el = document.getElementById('apptListBody');
    if (!el) return;
    let list = AppState.appointments().slice().sort((a,b) => new Date(b.date)-new Date(a.date));
    if (filter !== 'all') list = list.filter(a => a.status === filter);
    if (!list.length){
      el.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg><h4>No appointments</h4><p>No health data available for this selection.</p></div>`;
      return;
    }
    el.innerHTML = list.map(a => `
      <div class="list-row" data-id="${a.id}">
        <div class="avatar-photo" style="width:44px;height:44px;font-size:.85rem;">${Utils.initials(a.doctorName)}</div>
        <div class="lr-meta">
          <div class="lr-title">${Utils.escapeHtml(a.doctorName)} <span class="badge ${statusBadgeClass(a.status)}" style="margin-left:6px;">${a.status}</span></div>
          <div class="lr-sub">${a.specialty} · ${a.type} · ${Utils.escapeHtml(a.reason)}</div>
        </div>
        <div style="text-align:right;">
          <time style="display:block;">${Utils.formatDate(a.date)}</time>
          <span style="font-size:.76rem;color:var(--text-muted);">${Utils.formatTime(a.date.slice(11,16))}</span>
        </div>
        <div class="flex gap-8" style="margin-left:14px;">
          <button class="btn btn-ghost btn-sm" data-action="view">Details</button>
          ${a.status === 'upcoming' ? `<button class="btn btn-ghost btn-sm" data-action="cancel">Cancel</button>` : ''}
        </div>
      </div>
    `).join('');
    el.querySelectorAll('[data-action="cancel"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.list-row').dataset.id;
        updateStatus(id, 'cancelled');
      });
    });
    el.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.list-row').dataset.id;
        openDetails(id);
      });
    });
  }

  function updateStatus(id, status){
    const all = AppState.appointments().map(a => a.id === id ? { ...a, status } : a);
    Storage.set('appointments', all);
    renderList(); renderCalendar();
    Notify.toast(`Appointment ${status}.`, status === 'cancelled' ? 'warn' : 'good');
  }

  function openDetails(id){
    const appt = AppState.appointments().find(a => a.id === id);
    if (!appt) return;
    const overlay = document.getElementById('apptDetailsModal');
    const body = document.getElementById('apptDetailsBody');
    body.innerHTML = `
      <div class="flex gap-16" style="align-items:center;margin-bottom:16px;">
        <div class="avatar-photo">${Utils.initials(appt.doctorName)}</div>
        <div><strong style="font-size:1.05rem;">${Utils.escapeHtml(appt.doctorName)}</strong><div style="color:var(--text-muted);font-size:.85rem;">${appt.specialty}</div></div>
        <span class="badge ${statusBadgeClass(appt.status)}" style="margin-left:auto;">${appt.status}</span>
      </div>
      <div class="grid grid-2" style="gap:14px;">
        <div><div class="kpi-footnote">Date & time</div><strong>${Utils.formatDateLong(appt.date)}, ${Utils.formatTime(appt.date.slice(11,16))}</strong></div>
        <div><div class="kpi-footnote">Type</div><strong>${appt.type}</strong></div>
        <div style="grid-column:1/-1;"><div class="kpi-footnote">Reason for visit</div><strong>${Utils.escapeHtml(appt.reason)}</strong></div>
      </div>`;
    overlay.classList.add('open');
  }

  function wireToolbar(){
    const bookBtn = document.getElementById('openBookingBtn');
    if (bookBtn) bookBtn.addEventListener('click', () => openBooking());
  }

  function wireTabs(){
    document.querySelectorAll('#apptFilterTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#apptFilterTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderList(currentFilter);
      });
    });
  }

  /* ---------------- Calendar ---------------- */
  function renderCalendar(){
    const grid = document.getElementById('calGrid');
    const title = document.getElementById('calTitle');
    if (!grid || !title) return;
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    title.textContent = `${monthNames[calMonth]} ${calYear}`;

    const firstDay = new Date(calYear, calMonth, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
    const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

    const appts = AppState.appointments();
    const byDate = {};
    appts.forEach(a => {
      const key = a.date.slice(0,10);
      (byDate[key] = byDate[key] || []).push(a);
    });

    let cells = '';
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => cells += `<div class="cal-dow">${d}</div>`);

    for (let i = startOffset - 1; i >= 0; i--){
      cells += `<div class="cal-day other-month"><span class="day-num">${daysInPrevMonth - i}</span></div>`;
    }
    const todayKey = new Date().toISOString().slice(0,10);
    for (let d = 1; d <= daysInMonth; d++){
      const key = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isToday = key === todayKey;
      const dayAppts = byDate[key] || [];
      cells += `<div class="cal-day ${isToday ? 'today':''}"><span class="day-num">${d}</span>
        ${dayAppts.slice(0,2).map(a => `<div class="cal-event ${a.status}" data-id="${a.id}">${Utils.formatTime(a.date.slice(11,16))} ${Utils.escapeHtml(a.doctorName.split(' ').slice(-1)[0])}</div>`).join('')}
        ${dayAppts.length > 2 ? `<div style="font-size:.66rem;color:var(--text-muted);">+${dayAppts.length-2} more</div>` : ''}
      </div>`;
    }
    const totalCells = startOffset + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let d = 1; d <= trailing; d++){
      cells += `<div class="cal-day other-month"><span class="day-num">${d}</span></div>`;
    }
    grid.innerHTML = cells;
    grid.querySelectorAll('.cal-event').forEach(ev => ev.addEventListener('click', () => openDetails(ev.dataset.id)));
  }

  function changeMonth(delta){
    calMonth += delta;
    if (calMonth < 0){ calMonth = 11; calYear--; }
    if (calMonth > 11){ calMonth = 0; calYear++; }
    renderCalendar();
  }

  /* ---------------- Booking flow ---------------- */
  function openBooking(){
    bookingState = { specialty:null, doctor:null, date:null, time:null, type:'In-person', reason:'' };
    goToStep(1);
    renderSpecialtyStep();
    document.getElementById('bookingModal').classList.add('open');
  }

  function goToStep(step){
    document.querySelectorAll('.book-step').forEach((el,i) => el.classList.toggle('done', i < step));
    document.querySelectorAll('.book-panel').forEach(el => el.style.display = 'none');
    const panel = document.getElementById(`bookStep${step}`);
    if (panel) panel.style.display = 'block';
  }

  function renderSpecialtyStep(){
    const el = document.getElementById('bookStep1');
    const specialties = [...new Set(AppState.doctors().map(d => d.specialty))];
    el.innerHTML = `<h4 style="margin-bottom:12px;">Choose a specialty</h4><div class="grid grid-2" style="gap:8px;">
      ${specialties.map(s => `<button class="btn btn-secondary" style="justify-content:flex-start;" data-specialty="${s}">${s}</button>`).join('')}
    </div>`;
    el.querySelectorAll('[data-specialty]').forEach(btn => {
      btn.addEventListener('click', () => { bookingState.specialty = btn.dataset.specialty; renderDoctorStep(); goToStep(2); });
    });
  }

  function renderDoctorStep(){
    const el = document.getElementById('bookStep2');
    const doctors = AppState.doctors().filter(d => d.specialty === bookingState.specialty);
    el.innerHTML = `<h4 style="margin-bottom:12px;">Choose a doctor — ${bookingState.specialty}</h4>
      <div style="display:flex;flex-direction:column;gap:10px;max-height:280px;overflow-y:auto;">
      ${doctors.map(d => `
        <button class="dropdown-item" data-doc="${d.id}" style="border:1px solid var(--border-subtle);padding:12px;border-radius:var(--r-md);">
          <span class="avatar-photo" style="width:38px;height:38px;font-size:.75rem;">${Utils.initials(d.name)}</span>
          <span><strong style="display:block;">${d.name}</strong><span style="font-size:.76rem;color:var(--text-muted);">${d.experience} yrs · ★ ${d.rating} · ${d.location}</span></span>
        </button>`).join('')}
      </div>
      <button class="btn btn-ghost btn-sm" style="margin-top:10px;" data-back="1">Back</button>`;
    el.querySelectorAll('[data-doc]').forEach(btn => {
      btn.addEventListener('click', () => { bookingState.doctor = doctors.find(d => d.id === btn.dataset.doc); renderDateTimeStep(); goToStep(3); });
    });
    el.querySelector('[data-back]')?.addEventListener('click', () => goToStep(1));
  }

  function renderDateTimeStep(){
    const el = document.getElementById('bookStep3');
    const slots = ['09:00','09:30','10:00','10:30','11:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00'];
    const dates = Array.from({length:6}, (_,i) => { const d = new Date(); d.setDate(d.getDate()+i+1); return d; });
    el.innerHTML = `<h4 style="margin-bottom:12px;">Pick a date & time</h4>
      <div class="segmented" id="dateSegmented" style="margin-bottom:14px;flex-wrap:wrap;">
        ${dates.map((d,i) => `<button data-date="${d.toISOString().slice(0,10)}" class="${i===0?'active':''}">${d.toLocaleDateString('en-US',{weekday:'short',day:'numeric'})}</button>`).join('')}
      </div>
      <div class="slot-grid" id="slotGrid">
        ${slots.map(s => `<button class="slot-btn" data-time="${s}">${Utils.formatTime(s)}</button>`).join('')}
      </div>
      <div class="field" style="margin-top:16px;">
        <label>Appointment type</label>
        <div class="appt-type-grid">
          ${(bookingState.doctor.type || ['In-person']).map(t => `
            <div class="appt-type-card ${t==='In-person'?'selected':''}" data-type="${t}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${t==='Video' ? '<path d="M15 10l5-3v10l-5-3M3 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/>' : '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>'}</svg>
              <span>${t}</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="field"><label for="apptReason">Reason for visit</label><textarea id="apptReason" class="input" rows="2" placeholder="Briefly describe your reason for this visit"></textarea></div>
      <div class="flex gap-8"><button class="btn btn-ghost btn-sm" data-back="2">Back</button><button class="btn btn-primary" id="confirmBookingBtn" disabled>Confirm booking</button></div>`;

    bookingState.type = bookingState.doctor.type?.[0] || 'In-person';
    let selectedDate = dates[0].toISOString().slice(0,10);
    let selectedTime = null;

    el.querySelectorAll('#dateSegmented button').forEach(btn => btn.addEventListener('click', () => {
      el.querySelectorAll('#dateSegmented button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active'); selectedDate = btn.dataset.date;
    }));
    el.querySelectorAll('.slot-btn').forEach(btn => btn.addEventListener('click', () => {
      el.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected'); selectedTime = btn.dataset.time;
      confirmBtn.disabled = false;
    }));
    el.querySelectorAll('.appt-type-card').forEach(card => card.addEventListener('click', () => {
      el.querySelectorAll('.appt-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected'); bookingState.type = card.dataset.type;
    }));
    el.querySelector('[data-back]')?.addEventListener('click', () => goToStep(2));
    const confirmBtn = el.querySelector('#confirmBookingBtn');
    confirmBtn.addEventListener('click', () => {
      bookingState.date = selectedDate; bookingState.time = selectedTime;
      bookingState.reason = el.querySelector('#apptReason').value || 'General consultation';
      confirmBooking();
    });
  }

  function confirmBooking(){
    const all = AppState.appointments();
    all.push({
      id: Utils.uid('appt'),
      doctorId: bookingState.doctor.id,
      doctorName: bookingState.doctor.name,
      specialty: bookingState.doctor.specialty,
      patientName: Auth.currentUser().name,
      date: `${bookingState.date}T${bookingState.time}:00`,
      type: bookingState.type,
      reason: bookingState.reason,
      status: 'upcoming',
    });
    Storage.set('appointments', all);
    document.getElementById('bookingModal').classList.remove('open');
    renderList(); renderCalendar();
    Notify.toast('Appointment booked successfully.', 'good');
  }

  function wireBookingModal(){
    document.getElementById('calPrev')?.addEventListener('click', () => changeMonth(-1));
    document.getElementById('calNext')?.addEventListener('click', () => changeMonth(1));
  }

  return { init };
})();
