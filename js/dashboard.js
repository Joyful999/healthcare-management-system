/* MEDICORE — dashboard.js
   Rendering logic for the three role dashboards. Reads demo data from
   AppState (localStorage) and paints KPI cards, lists and charts. */

const PatientDashboard = (() => {
  function init(){
    const user = Auth.currentUser();
    document.getElementById('greetName').textContent = user.name.split(' ')[0];
    document.getElementById('greetDate').textContent = Utils.formatDateLong(new Date());

    const appts = AppState.appointments();
    const upcoming = appts.filter(a => a.status === 'upcoming').sort((a,b) => new Date(a.date)-new Date(b.date));
    const next = upcoming[0];
    document.getElementById('kpiNextAppt').innerHTML = next
      ? `${Utils.formatDate(next.date)}<small> · ${Utils.formatTime(next.date.slice(11,16))}</small>`
      : `<small>None scheduled</small>`;
    document.getElementById('kpiNextApptSub').textContent = next ? `${next.doctorName} · ${next.specialty}` : 'Book your next visit';

    const rx = AppState.prescriptions().filter(r => r.status === 'Active');
    document.getElementById('kpiRxCount').textContent = rx.length;
    const records = AppState.records();
    document.getElementById('kpiRecordsCount').textContent = records.length;

    renderNextApptCard(next);
    renderUpcomingList(upcoming.slice(0,4));
    renderReminders();
    renderHealthMiniChart();
    Notify.renderDrawerList?.();
  }

  function renderNextApptCard(appt){
    const el = document.getElementById('nextApptCard');
    if (!el) return;
    if (!appt){
      el.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg><h4>No upcoming visits</h4><p>Book an appointment to see it here.</p><a class="btn btn-primary btn-sm" href="appointments.html">Book appointment</a></div>`;
      return;
    }
    el.innerHTML = `
      <div class="flex gap-16" style="align-items:center;">
        <div class="avatar-photo">${Utils.initials(appt.doctorName)}</div>
        <div style="flex:1;">
          <strong style="font-size:1rem;">${Utils.escapeHtml(appt.doctorName)}</strong>
          <div class="doc-meta-row" style="margin-top:4px;">${appt.specialty} · ${appt.type}</div>
          <div class="doc-meta-row">${Utils.formatDateLong(appt.date)} · ${Utils.formatTime(appt.date.slice(11,16))}</div>
        </div>
        <span class="badge badge-info">Upcoming</span>
      </div>
      <div class="flex gap-8" style="margin-top:16px;">
        <a class="btn btn-secondary btn-sm" href="appointments.html">Reschedule</a>
        <a class="btn btn-ghost btn-sm" href="messages.html">Message doctor</a>
      </div>`;
  }

  function renderUpcomingList(list){
    const el = document.getElementById('upcomingList');
    if (!el) return;
    if (!list.length){ el.innerHTML = `<p style="color:var(--text-muted);font-size:.84rem;">No health data available for this selection.</p>`; return; }
    el.innerHTML = list.map(a => `
      <div class="list-row">
        <div class="avatar-photo" style="width:40px;height:40px;font-size:.8rem;">${Utils.initials(a.doctorName)}</div>
        <div class="lr-meta">
          <div class="lr-title">${Utils.escapeHtml(a.doctorName)}</div>
          <div class="lr-sub">${a.specialty} · ${a.type}</div>
        </div>
        <time>${Utils.formatDate(a.date)}</time>
      </div>
    `).join('');
  }

  function renderReminders(){
    const el = document.getElementById('reminderList');
    if (!el) return;
    const reminders = AppState.reminders();
    if (!reminders.length){ el.innerHTML = `<p style="color:var(--text-muted);font-size:.84rem;">No reminders set.</p>`; return; }
    el.innerHTML = reminders.map(r => `
      <div class="reminder-item ${r.state === 'taken' ? 'done' : ''}" data-id="${r.id}">
        <span class="rem-time">${r.time}</span>
        <div class="rem-body"><strong>${Utils.escapeHtml(r.med)}</strong><span>${r.dose} · Take medication</span></div>
        <div class="reminder-actions">
          <button class="btn btn-primary btn-sm" data-action="taken" ${r.state==='taken'?'disabled':''}>Taken</button>
          <button class="btn btn-ghost btn-sm" data-action="snooze">Snooze</button>
          <button class="btn btn-ghost btn-sm" data-action="skip">Skip</button>
        </div>
      </div>
    `).join('');
    el.querySelectorAll('.reminder-item').forEach(row => {
      row.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          const all = AppState.reminders();
          const idx = all.findIndex(r => r.id === row.dataset.id);
          if (idx === -1) return;
          if (action === 'taken'){ all[idx].state = 'taken'; Notify.toast(`Marked ${all[idx].med} as taken.`, 'good'); }
          if (action === 'skip'){ all[idx].state = 'skipped'; Notify.toast(`Skipped ${all[idx].med}.`, 'warn'); }
          if (action === 'snooze'){ Notify.toast(`Snoozed ${all[idx].med} for 15 minutes.`, 'info'); }
          Storage.set('reminders', all);
          renderReminders();
        });
      });
    });
  }

  function renderHealthMiniChart(){
    const el = document.getElementById('miniHealthChart');
    if (!el) return;
    const hr = AppState.healthMetrics().heartRate;
    el.innerHTML = Charts.lineChart({ series: hr.map(p => ({ date:p.date, value:p.value })), width:520, height:180, formatY:(v)=>`${v} bpm` });
  }

  return { init };
})();

const DoctorDashboard = (() => {
  function init(){
    const user = Auth.currentUser();
    document.getElementById('greetName').textContent = user.name;
    document.getElementById('greetDate').textContent = Utils.formatDateLong(new Date());

    const appts = AppState.appointments();
    const today = appts.filter(a => a.status !== 'cancelled').slice(0,5);
    const patients = AppState.patients();

    document.getElementById('kpiTotalPatients').textContent = patients.length;
    document.getElementById('kpiNewPatients').textContent = patients.filter(p => p.status === 'Pending').length;
    document.getElementById('kpiFollowups').textContent = appts.filter(a => a.status === 'upcoming').length;
    document.getElementById('kpiPending').textContent = appts.filter(a => a.status === 'pending').length;

    renderTodaySchedule(today);
    renderAlerts();
  }

  function statusBadge(status){
    const map = { upcoming:'badge-info', completed:'badge-good', cancelled:'badge-critical', pending:'badge-warn' };
    return `<span class="badge ${map[status] || 'badge-neutral'}">${status[0].toUpperCase()+status.slice(1)}</span>`;
  }

  function renderTodaySchedule(list){
    const el = document.getElementById('todayScheduleList');
    if (!el) return;
    if (!list.length){ el.innerHTML = `<div class="empty-state"><h4>No appointments</h4><p>Nothing scheduled right now.</p></div>`; return; }
    el.innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>Patient</th><th>Time</th><th>Type</th><th>Status</th></tr></thead><tbody>
      ${list.map(a => `<tr><td><div class="row-avatar"><span class="avatar-sm">${Utils.initials(a.patientName)}</span>${Utils.escapeHtml(a.patientName)}</div></td><td>${Utils.formatTime(a.date.slice(11,16))}</td><td>${a.type}</td><td>${statusBadge(a.status)}</td></tr>`).join('')}
    </tbody></table></div>`;
  }

  function renderAlerts(){
    const el = document.getElementById('doctorAlertsList');
    if (!el) return;
    const notifs = AppState.notifications().slice(0,4);
    el.innerHTML = notifs.map(n => `<div class="alert alert-info" style="margin-bottom:10px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-5m0-3h.01"/></svg><div><strong>${Utils.escapeHtml(n.title)}</strong><div style="font-size:.78rem;">${Utils.escapeHtml(n.body)}</div></div></div>`).join('');
  }

  return { init };
})();

const AdminDashboard = (() => {
  function init(){
    const patients = AppState.patients();
    const doctors = AppState.doctors();
    const appts = AppState.appointments();

    document.getElementById('kpiTotalPatients').textContent = patients.length * 24; // demo scale factor
    document.getElementById('kpiActiveDoctors').textContent = doctors.length;
    document.getElementById('kpiApptsToday').textContent = appts.filter(a=>a.status==='upcoming').length + 6;
    document.getElementById('kpiDepartments').textContent = AppState.DEPARTMENTS.length;
    document.getElementById('kpiPendingRequests').textContent = patients.filter(p=>p.status==='Pending').length + 3;

    renderPatientGrowth();
    renderApptStatusDonut();
    renderDepartmentTable();
    renderActivityFeed();
  }

  function renderPatientGrowth(){
    const el = document.getElementById('patientGrowthChart');
    if (!el) return;
    const months = ['Mar','Apr','May','Jun','Jul','Aug'];
    const series = months.map((m,i) => ({ label:m, value: 120 + i*34 + Math.round(Math.random()*20) }));
    el.innerHTML = Charts.lineChart({ series: series.map(s=>({date:s.label,value:s.value})), width:560, height:200, color:'#0C8C82' });
  }

  function renderApptStatusDonut(){
    const el = document.getElementById('apptStatusDonut');
    if (!el) return;
    const appts = AppState.appointments();
    const groups = ['upcoming','completed','pending','cancelled'].map(s => ({ label:s[0].toUpperCase()+s.slice(1), value: appts.filter(a=>a.status===s).length || 1 }));
    el.innerHTML = Charts.donutChart({ data: groups });
    const legend = document.getElementById('apptStatusLegend');
    if (legend){
      const colors = ['#12A79B','#0E1E36','#B7791F','#C23B3B'];
      legend.innerHTML = groups.map((g,i) => `<span class="legend-item"><span class="legend-dot" style="background:${colors[i]}"></span>${g.label}</span>`).join('');
    }
  }

  function renderDepartmentTable(){
    const el = document.getElementById('departmentTable');
    if (!el) return;
    el.innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>Department</th><th>Doctors</th><th>Patients</th><th>Appointments</th><th>Status</th></tr></thead><tbody>
      ${AppState.DEPARTMENTS.map(d => `<tr><td><strong>${d.name}</strong></td><td>${d.doctors}</td><td>${d.patients}</td><td>${d.appointments}</td><td><span class="badge ${d.status==='High demand'?'badge-warn':'badge-good'}">${d.status}</span></td></tr>`).join('')}
    </tbody></table></div>`;
  }

  function renderActivityFeed(){
    const el = document.getElementById('activityFeed');
    if (!el) return;
    const items = [
      { text:'Dr. Sarah Bello updated a patient record', time:'12m ago' },
      { text:'New patient registration: Linda Okon', time:'40m ago' },
      { text:'Appointment cancelled — Neurology', time:'1h ago' },
      { text:'System backup completed (demo)', time:'3h ago' },
      { text:'Dr. James Falana issued a new prescription', time:'5h ago' },
    ];
    el.innerHTML = items.map(i => `<div class="list-row"><div class="lr-meta"><div class="lr-title" style="font-weight:600;">${i.text}</div></div><time>${i.time}</time></div>`).join('');
  }

  return { init };
})();
