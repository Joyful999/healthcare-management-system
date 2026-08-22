/* MEDICORE — utils.js
   Small, dependency-free helper functions shared across pages. */

const Utils = (() => {

  function uid(prefix = 'id'){
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  }

  function escapeHtml(str = ''){
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function initials(name = ''){
    return name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
  }

  function formatDate(dateStr, opts = {}){
    const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', ...opts });
  }

  function formatDateLong(dateStr){
    const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  }

  function formatTime(timeStr){
    // accepts "HH:MM" 24h -> 12h display
    if (!timeStr) return '—';
    const [h,m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h % 12) || 12);
    return `${h12}:${String(m).padStart(2,'0')} ${period}`;
  }

  function timeAgo(dateStr){
    const d = new Date(dateStr);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 86400*7) return `${Math.floor(diff/86400)}d ago`;
    return formatDate(d);
  }

  function debounce(fn, wait = 250){
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }

  function qs(sel, ctx = document){ return ctx.querySelector(sel); }
  function qsa(sel, ctx = document){ return Array.from(ctx.querySelectorAll(sel)); }

  function trapFocus(container){
    const focusables = qsa('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', container);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    });
  }

  function calcAge(dob){
    const d = new Date(dob);
    const diff = Date.now() - d.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  }

  return { uid, escapeHtml, initials, formatDate, formatDateLong, formatTime, timeAgo, debounce, clamp, qs, qsa, trapFocus, calcAge };
})();

/* ---------------------------------------------------------------------
   Charts — dependency-free inline SVG chart builders used across the
   health tracker, dashboards and analytics pages.
   --------------------------------------------------------------------- */
const Charts = (() => {

  function lineChart({ series, width = 560, height = 220, color = '#12A79B', pad = 30, formatY = (v)=>v, showArea = true }){
    if (!series || !series.length) return emptySvg(width, height);
    const vals = series.map(p => p.value);
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = (max - min) || 1;
    const stepX = (width - pad*2) / (series.length - 1 || 1);
    const pts = series.map((p, i) => {
      const x = pad + i*stepX;
      const y = height - pad - ((p.value - min) / range) * (height - pad*2);
      return [x, y];
    });
    const line = pts.map((p,i) => (i===0?'M':'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const area = `${line} L${pts[pts.length-1][0].toFixed(1)},${height-pad} L${pts[0][0].toFixed(1)},${height-pad} Z`;
    const gridLines = [0,1,2,3].map(i => {
      const y = pad + i*((height-pad*2)/3);
      return `<line class="grid-line" x1="${pad}" x2="${width-pad}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    }).join('');
    const dots = pts.map((p,i) => `<circle class="tooltip-dot" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="${color}"><title>${Utils.escapeHtml(series[i].date || series[i].label || '')}: ${formatY(series[i].value)}</title></circle>`).join('');
    const labelStep = Math.max(1, Math.floor(series.length/6));
    const labels = series.map((p,i) => i % labelStep === 0 ? `<text class="axis-label" x="${pts[i][0].toFixed(1)}" y="${height-8}" text-anchor="middle">${Utils.escapeHtml((p.date||p.label||'').slice(5))}</text>` : '').join('');
    return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Line chart">
      ${gridLines}
      ${showArea ? `<path d="${area}" fill="${color}22" stroke="none"/>` : ''}
      <path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}${labels}
    </svg>`;
  }

  function multiLineChart({ seriesA, seriesB, width = 560, height = 220, colorA = '#12A79B', colorB = '#0E1E36', pad = 30 }){
    if (!seriesA || !seriesA.length) return emptySvg(width, height);
    const allVals = [...seriesA.map(p=>p.value), ...(seriesB||[]).map(p=>p.value)];
    const min = Math.min(...allVals), max = Math.max(...allVals);
    const range = (max - min) || 1;
    const stepX = (width - pad*2) / (seriesA.length - 1 || 1);
    const toPath = (series) => series.map((p,i) => {
      const x = pad + i*stepX;
      const y = height - pad - ((p.value - min) / range) * (height - pad*2);
      return (i===0?'M':'L') + x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    const gridLines = [0,1,2,3].map(i => {
      const y = pad + i*((height-pad*2)/3);
      return `<line class="grid-line" x1="${pad}" x2="${width-pad}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    }).join('');
    return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Comparison line chart">
      ${gridLines}
      <path d="${toPath(seriesA)}" fill="none" stroke="${colorA}" stroke-width="2.5" stroke-linecap="round"/>
      ${seriesB ? `<path d="${toPath(seriesB)}" fill="none" stroke="${colorB}" stroke-width="2.5" stroke-dasharray="5,4" stroke-linecap="round"/>` : ''}
    </svg>`;
  }

  function barChart({ data, width = 560, height = 220, color = '#12A79B', pad = 30 }){
    if (!data || !data.length) return emptySvg(width, height);
    const max = Math.max(...data.map(d => d.value)) || 1;
    const bw = (width - pad*2) / data.length * 0.6;
    const gap = (width - pad*2) / data.length;
    const bars = data.map((d,i) => {
      const h = (d.value / max) * (height - pad*2);
      const x = pad + i*gap + (gap - bw)/2;
      const y = height - pad - h;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${color}"><title>${Utils.escapeHtml(d.label)}: ${d.value}</title></rect>`;
    }).join('');
    const labels = data.map((d,i) => {
      const x = pad + i*gap + gap/2;
      return `<text class="axis-label" x="${x.toFixed(1)}" y="${height-8}" text-anchor="middle">${Utils.escapeHtml(d.label)}</text>`;
    }).join('');
    return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Bar chart">${bars}${labels}</svg>`;
  }

  function donutChart({ data, width = 220, height = 220, colors = ['#12A79B','#0E1E36','#B7791F','#C23B3B','#9FADB9'] }){
    const total = data.reduce((s,d) => s + d.value, 0) || 1;
    const cx = width/2, cy = height/2, r = Math.min(width,height)/2 - 16, ir = r*0.62;
    let angle = -Math.PI/2;
    const paths = data.map((d,i) => {
      const slice = (d.value/total) * Math.PI*2;
      const x1 = cx + r*Math.cos(angle), y1 = cy + r*Math.sin(angle);
      const x2 = cx + r*Math.cos(angle+slice), y2 = cy + r*Math.sin(angle+slice);
      const ix1 = cx + ir*Math.cos(angle), iy1 = cy + ir*Math.sin(angle);
      const ix2 = cx + ir*Math.cos(angle+slice), iy2 = cy + ir*Math.sin(angle+slice);
      const large = slice > Math.PI ? 1 : 0;
      const path = `M${ix1.toFixed(2)},${iy1.toFixed(2)} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix2.toFixed(2)},${iy2.toFixed(2)} A${ir},${ir} 0 ${large} 0 ${ix1.toFixed(2)},${iy1.toFixed(2)} Z`;
      angle += slice;
      return `<path d="${path}" fill="${colors[i % colors.length]}"><title>${Utils.escapeHtml(d.label)}: ${d.value}</title></path>`;
    }).join('');
    return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Donut chart">${paths}</svg>`;
  }

  function emptySvg(width, height){
    return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}"><text x="50%" y="50%" text-anchor="middle" class="axis-label">No data available for this selection.</text></svg>`;
  }

  return { lineChart, multiLineChart, barChart, donutChart };
})();
