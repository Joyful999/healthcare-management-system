/* MEDICORE — analytics.js */
const Analytics = (() => {

  function init(){
    populateCountrySelect();
    loadCountryData('NGA');
    document.getElementById('countrySelect')?.addEventListener('change', (e) => loadCountryData(e.target.value));
    renderInternalCharts();
  }

  function populateCountrySelect(){
    const sel = document.getElementById('countrySelect');
    if (!sel) return;
    sel.innerHTML = HealthAPI.getCountries().map(c => `<option value="${c.code}">${c.name}</option>`).join('');
  }

  async function loadCountryData(code){
    const stripEl = document.getElementById('countryStatStrip');
    const chartEl = document.getElementById('countryTrendChart');
    const sourceEl = document.getElementById('countrySourceTag');
    if (stripEl) stripEl.innerHTML = skeletonStats();
    if (chartEl) chartEl.innerHTML = `<div class="skeleton sk-card"></div>`;

    try{
      const data = await HealthAPI.getCountryHealthData(code);
      if (stripEl){
        stripEl.innerHTML = `
          <div class="stat-box"><div class="stat-val">${fmt(data.population, 'M')}</div><div class="stat-lbl">Population${data.populationYear ? ' · '+data.populationYear : ''}</div></div>
          <div class="stat-box"><div class="stat-val">${fmt(data.lifeExpectancy,'yrs',1)}</div><div class="stat-lbl">Life expectancy</div></div>
          <div class="stat-box"><div class="stat-val">${fmt(data.healthExpenditure,'%',1)}</div><div class="stat-lbl">Health expenditure (% GDP)</div></div>
          <div class="stat-box"><div class="stat-val">${fmt(data.under5Mortality,'',1)}</div><div class="stat-lbl">Under-5 mortality /1,000</div></div>
        `;
      }
      if (sourceEl) sourceEl.innerHTML = `<span class="source-tag">Source: ${data.source}</span>`;

      const trend = await HealthAPI.getPublicHealthTrends(code, 'lifeExpectancy', 20);
      if (chartEl){
        chartEl.innerHTML = trend.series.length
          ? Charts.lineChart({ series: trend.series.map(p => ({ date:String(p.year), value:p.value })), color:'#0C8C82', width:640, height:220, formatY:(v)=>`${v.toFixed(1)} yrs` })
          : `<div class="empty-state"><h4>No health data available for this selection.</h4></div>`;
      }
    }catch(err){
      console.warn(err);
      if (stripEl) stripEl.innerHTML = `<div class="alert alert-critical" style="grid-column:1/-1;">Unable to retrieve health information. Please try again.</div>`;
      if (chartEl) chartEl.innerHTML = '';
    }
  }

  function fmt(v, suffix='', decimals=0){
    if (v === null || v === undefined) return '—';
    if (suffix === 'M') return (v/1e6).toFixed(1) + 'M';
    return v.toFixed(decimals) + (suffix ? ' '+suffix : '');
  }

  function skeletonStats(){
    return Array.from({length:4}).map(() => `<div class="stat-box"><div class="skeleton sk-line" style="width:70%;height:22px;"></div><div class="skeleton sk-line" style="width:50%;"></div></div>`).join('');
  }

  function renderInternalCharts(){
    const apptsByMonth = ['Mar','Apr','May','Jun','Jul','Aug'].map((m,i) => ({ label:m, value: 80 + i*22 + Math.round(Math.random()*10) }));
    document.getElementById('apptVolumeChart')?.insertAdjacentHTML('beforeend', Charts.barChart({ data: apptsByMonth, color:'#0C8C82', width:560, height:200 }));

    const deptData = AppState.DEPARTMENTS.map(d => ({ label:d.name.slice(0,4), value:d.appointments }));
    document.getElementById('deptActivityChart')?.insertAdjacentHTML('beforeend', Charts.barChart({ data: deptData, color:'#0E1E36', width:560, height:200 }));

    const growth = ['Mar','Apr','May','Jun','Jul','Aug'].map((m,i) => ({ date:m, value: 300 + i*45 }));
    document.getElementById('patientGrowthChart2')?.insertAdjacentHTML('beforeend', Charts.lineChart({ series: growth, color:'#12A79B', width:560, height:200 }));
  }

  return { init };
})();
