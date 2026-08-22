/* MEDICORE — health.js
   Patient health overview panel, manual health tracker entries, and the
   BMI calculator. All measurements are demo/simulated — never a
   diagnosis. Trend language stays neutral per product guidelines. */

const Health = (() => {

  function init(){
    renderMetricTiles();
    renderCharts();
    wireTrackerForm();
    wireBmiCalculator();
    renderTrackerHistory();
  }

  function latest(seriesArr){ return seriesArr[seriesArr.length - 1]; }
  function trendFor(seriesArr, key = 'value'){
    if (seriesArr.length < 2) return 'stable';
    const a = seriesArr[seriesArr.length-2][key], b = seriesArr[seriesArr.length-1][key];
    const delta = ((b - a) / a) * 100;
    if (Math.abs(delta) < 1.5) return 'stable';
    return delta > 0 ? 'up' : 'down';
  }

  function renderMetricTiles(){
    const m = AppState.healthMetrics();
    const el = document.getElementById('metricTiles');
    if (!el) return;
    const hr = latest(m.heartRate), bp = latest(m.bp), temp = latest(m.temperature), w = latest(m.weight), spo2 = latest(m.spo2);
    const bmi = (w.value / Math.pow(1.75, 2)).toFixed(1);
    const tiles = [
      { icon:'heart', label:'Heart rate', val:`${hr.value} bpm`, trend: inRange(hr.value,60,100)?'stable':'warn' },
      { icon:'activity', label:'Blood pressure', val:`${bp.sys}/${bp.dia} mmHg`, trend: inRange(bp.sys,90,130)&&inRange(bp.dia,60,85)?'stable':'warn' },
      { icon:'thermo', label:'Temperature', val:`${temp.value}°C`, trend: inRange(temp.value,36.1,37.5)?'stable':'warn' },
      { icon:'weight', label:'Weight', val:`${w.value} kg`, trend:'stable' },
      { icon:'bmi', label:'BMI', val:bmi, trend: inRange(+bmi,18.5,24.9)?'good':'warn' },
      { icon:'spo2', label:'Blood oxygen', val:`${spo2.value}%`, trend: spo2.value >= 95 ? 'good':'warn' },
    ];
    el.innerHTML = tiles.map(t => `
      <div class="metric-tile">
        <div class="m-icon">${metricIcon(t.icon)}</div>
        <div><div class="m-val">${t.val}</div><div class="m-lbl">${t.label}</div></div>
        <span class="m-trend ${t.trend === 'warn' ? 'warn' : t.trend === 'good' ? 'good' : 'stable'}">${t.trend === 'warn' ? 'Needs attention' : t.trend === 'good' ? 'Improving' : 'Stable'}</span>
      </div>
    `).join('');
  }

  function inRange(v, min, max){ return v >= min && v <= max; }

  function metricIcon(key){
    const icons = {
      heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
      activity:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
      thermo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4a2 2 0 0 0-4 0v10.5a4 4 0 1 0 4 0Z"/></svg>',
      weight:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9 12h6"/></svg>',
      bmi:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 21V9m4 12V6m4 15v-9"/></svg>',
      spo2:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8 7 5 10.5 5 14a7 7 0 0 0 14 0c0-3.5-3-7-7-12Z"/></svg>',
    };
    return icons[key] || icons.heart;
  }

  function renderCharts(){
    const m = AppState.healthMetrics();
    const hrEl = document.getElementById('chartHeartRate');
    const bpEl = document.getElementById('chartBP');
    const tempEl = document.getElementById('chartTemp');
    const wEl = document.getElementById('chartWeight');
    if (hrEl) hrEl.innerHTML = Charts.lineChart({ series: m.heartRate, color:'#C23B3B', width:500, height:180, formatY:v=>`${v} bpm` });
    if (bpEl) bpEl.innerHTML = Charts.multiLineChart({ seriesA: m.bp.map(p=>({date:p.date,value:p.sys})), seriesB: m.bp.map(p=>({date:p.date,value:p.dia})), width:500, height:180, colorA:'#0C8C82', colorB:'#B7791F' });
    if (tempEl) tempEl.innerHTML = Charts.lineChart({ series: m.temperature, color:'#0E1E36', width:500, height:180, formatY:v=>`${v}°C` });
    if (wEl) wEl.innerHTML = Charts.lineChart({ series: m.weight, color:'#12A79B', width:500, height:180, formatY:v=>`${v} kg` });
  }

  function wireTrackerForm(){
    const form = document.getElementById('trackerForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const m = AppState.healthMetrics();
      const today = new Date().toISOString().slice(0,10);
      const val = (id) => +document.getElementById(id).value || null;

      const weight = val('trkWeight'), hr = val('trkHR'), sys = val('trkSys'), dia = val('trkDia'), temp = val('trkTemp'), spo2 = val('trkSpo2');
      if (weight) m.weight.push({ date:today, value:weight });
      if (hr) m.heartRate.push({ date:today, value:hr });
      if (sys && dia) m.bp.push({ date:today, sys, dia });
      if (temp) m.temperature.push({ date:today, value:temp });
      if (spo2) m.spo2.push({ date:today, value:spo2 });

      Storage.set('healthMetrics', m);
      renderMetricTiles(); renderCharts(); renderTrackerHistory();
      form.reset();
      Notify.toast('Health entry saved to your demo tracker.', 'good');
    });
  }

  function renderTrackerHistory(){
    const el = document.getElementById('trackerHistory');
    if (!el) return;
    const m = AppState.healthMetrics();
    const rows = m.weight.slice(-6).reverse();
    el.innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Weight</th><th>Reference range</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td>${Utils.formatDate(r.date)}</td><td>${r.value} kg</td><td>${r.value > 90 ? 'This measurement is outside the configured demonstration reference range.' : 'Within demonstration reference range'}</td></tr>`).join('')}
    </tbody></table></div>`;
  }

  function wireBmiCalculator(){
    const btn = document.getElementById('bmiCalcBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const heightCm = +document.getElementById('bmiHeight').value;
      const weightKg = +document.getElementById('bmiWeight').value;
      const resultEl = document.getElementById('bmiResult');
      if (!heightCm || !weightKg){ resultEl.innerHTML = `<p style="color:var(--status-critical);">Please enter both height and weight.</p>`; return; }
      const m = heightCm / 100;
      const bmi = weightKg / (m*m);
      let category, cls;
      if (bmi < 18.5){ category = 'Underweight'; cls='badge-warn'; }
      else if (bmi < 25){ category = 'Normal range'; cls='badge-good'; }
      else if (bmi < 30){ category = 'Overweight'; cls='badge-warn'; }
      else { category = 'Obesity'; cls='badge-critical'; }
      resultEl.innerHTML = `
        <div class="kpi-value" style="margin-bottom:6px;">${bmi.toFixed(1)}</div>
        <span class="badge ${cls}">${category}</span>
        <p style="margin-top:12px;font-size:.8rem;color:var(--text-muted);">This calculator is for educational purposes and is not medical advice.</p>`;
    });
  }

  return { init };
})();
