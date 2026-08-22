/* MEDICORE — reports.js */
const Reports = (() => {
  const REPORTS = [
    { id:'appt', title:'Appointment report', desc:'Volume, status breakdown and completion rates for scheduled appointments.', icon:'calendar' },
    { id:'patient', title:'Patient activity report', desc:'Registrations, visit frequency and engagement across the patient base.', icon:'users' },
    { id:'dept', title:'Department report', desc:'Doctor allocation, patient load and status by department.', icon:'building' },
    { id:'public', title:'Public health report', desc:'Country-level indicators sourced from World Bank Open Data.', icon:'chart' },
    { id:'doctor', title:'Doctor performance (demo)', desc:'Rating, patient volume and appointment completion by doctor.', icon:'doctor' },
  ];

  function init(){
    render();
  }

  function render(){
    const el = document.getElementById('reportsList');
    if (!el) return;
    el.innerHTML = REPORTS.map(r => `
      <div class="list-row">
        <div class="report-icon">${iconFor(r.icon)}</div>
        <div class="lr-meta"><div class="lr-title">${r.title}</div><div class="lr-sub">${r.desc}</div></div>
        <div class="flex gap-8">
          <button class="btn btn-secondary btn-sm" data-generate="${r.id}">Generate</button>
          <button class="btn btn-ghost btn-sm" data-print="${r.id}">Print</button>
        </div>
      </div>
    `).join('');
    el.querySelectorAll('[data-generate]').forEach(btn => btn.addEventListener('click', () => openReport(btn.dataset.generate)));
    el.querySelectorAll('[data-print]').forEach(btn => btn.addEventListener('click', () => { openReport(btn.dataset.print, true); }));
  }

  function iconFor(key){
    const icons = {
      calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
      users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
      building:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="1"/></svg>',
      chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
      doctor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v6a6 6 0 0 0 12 0V4"/></svg>',
    };
    return icons[key] || icons.chart;
  }

  function buildReportBody(id){
    const appts = AppState.appointments();
    const patients = AppState.patients();
    const doctors = AppState.doctors();
    switch(id){
      case 'appt': {
        const byStatus = ['upcoming','completed','pending','cancelled'].map(s => ({ label:s, count: appts.filter(a=>a.status===s).length }));
        return `<h3>Appointment report</h3><p class="page-sub">Generated ${Utils.formatDateLong(new Date())} · Demo data</p>
          <table class="data-table" style="width:100%;margin-top:14px;"><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>
          ${byStatus.map(s => `<tr><td style="text-transform:capitalize;">${s.label}</td><td>${s.count}</td></tr>`).join('')}
          </tbody></table>`;
      }
      case 'patient':
        return `<h3>Patient activity report</h3><p class="page-sub">Generated ${Utils.formatDateLong(new Date())} · Demo data</p>
          <table class="data-table" style="width:100%;margin-top:14px;"><thead><tr><th>Name</th><th>Status</th><th>Last visit</th></tr></thead><tbody>
          ${patients.map(p => `<tr><td>${p.name}</td><td>${p.status}</td><td>${Utils.formatDate(p.lastVisit)}</td></tr>`).join('')}
          </tbody></table>`;
      case 'dept':
        return `<h3>Department report</h3><p class="page-sub">Generated ${Utils.formatDateLong(new Date())} · Demo data</p>
          <table class="data-table" style="width:100%;margin-top:14px;"><thead><tr><th>Department</th><th>Doctors</th><th>Patients</th><th>Status</th></tr></thead><tbody>
          ${AppState.DEPARTMENTS.map(d => `<tr><td>${d.name}</td><td>${d.doctors}</td><td>${d.patients}</td><td>${d.status}</td></tr>`).join('')}
          </tbody></table>`;
      case 'public':
        return `<h3>Public health report</h3><p class="page-sub">Source: World Bank Open Data · see Analytics page for live figures</p>
          <p>This report references real, publicly available country health indicators — population, life expectancy, and health expenditure. See the Analytics page for the live, interactive version of this data.</p>`;
      case 'doctor':
        return `<h3>Doctor performance (demo)</h3><p class="page-sub">Generated ${Utils.formatDateLong(new Date())} · Demo data</p>
          <table class="data-table" style="width:100%;margin-top:14px;"><thead><tr><th>Doctor</th><th>Specialty</th><th>Rating</th><th>Reviews</th></tr></thead><tbody>
          ${doctors.map(d => `<tr><td>${d.name}</td><td>${d.specialty}</td><td>${d.rating}</td><td>${d.reviews}</td></tr>`).join('')}
          </tbody></table>`;
      default: return '<p>Report not found.</p>';
    }
  }

  function openReport(id, printImmediately = false){
    const overlay = document.getElementById('reportModal');
    document.getElementById('reportModalBody').innerHTML = buildReportBody(id);
    overlay.classList.add('open');
    if (printImmediately) setTimeout(() => window.print(), 300);
  }

  return { init };
})();
