/* MEDICORE — api.js
   Centralizes every external network call. This app uses the World Bank
   Open Data API (https://data.worldbank.org), a real, free, public
   dataset of country-level health indicators. No API key is required.

   All data returned here is REAL PUBLIC STATISTICAL data — population
   figures, life expectancy, health spend, mortality — never real
   individual patient information. Every consumer of this module must
   surface the "Source: World Bank Open Data" attribution alongside it.

   If the network is unavailable, functions fall back to a small labeled
   demo dataset so the UI never breaks for a portfolio viewer offline. */

const HealthAPI = (() => {

  const BASE = 'https://api.worldbank.org/v2';
  const SOURCE_LABEL = 'World Bank Open Data';

  const INDICATORS = {
    population:        'SP.POP.TOTL',
    lifeExpectancy:     'SP.DYN.LE00.IN',
    healthExpenditure:  'SH.XPD.CHEX.GD.ZS',
    under5Mortality:    'SH.DYN.MORT',
    maternalMortality:  'SH.STA.MMRT',
    birthRate:          'SP.DYN.CBRT.IN',
  };

  const COUNTRIES = [
    { code:'NGA', name:'Nigeria' },
    { code:'USA', name:'United States' },
    { code:'GBR', name:'United Kingdom' },
    { code:'IND', name:'India' },
    { code:'ZAF', name:'South Africa' },
    { code:'DEU', name:'Germany' },
    { code:'BRA', name:'Brazil' },
    { code:'JPN', name:'Japan' },
    { code:'KEN', name:'Kenya' },
    { code:'CAN', name:'Canada' },
  ];

  const FALLBACK = {
    NGA:{ population:223800000, lifeExpectancy:53.9, healthExpenditure:3.2, under5Mortality:110.6, note:'offline demo fallback figures' },
    USA:{ population:334900000, lifeExpectancy:77.4, healthExpenditure:17.4, under5Mortality:6.1, note:'offline demo fallback figures' },
  };

  async function fetchIndicator(countryCode, indicatorCode, { years = 15 } = {}){
    const url = `${BASE}/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=${years}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`World Bank API error ${res.status}`);
    const json = await res.json();
    const rows = (json && json[1]) ? json[1] : [];
    return rows
      .filter(r => r.value !== null)
      .map(r => ({ year:+r.date, value:+r.value }))
      .sort((a,b) => a.year - b.year);
  }

  /** Snapshot of key indicators for a country (latest available value each). */
  async function getCountryHealthData(countryCode){
    try{
      const keys = Object.keys(INDICATORS);
      const results = await Promise.all(
        keys.map(k => fetchIndicator(countryCode, INDICATORS[k], { years:5 }).catch(() => []))
      );
      const snapshot = { source:SOURCE_LABEL, countryCode, fetchedAt:new Date().toISOString() };
      keys.forEach((k, i) => {
        const series = results[i];
        snapshot[k] = series.length ? series[series.length - 1].value : null;
        snapshot[k + 'Year'] = series.length ? series[series.length - 1].year : null;
      });
      return snapshot;
    }catch(err){
      console.warn('getCountryHealthData falling back:', err);
      const fb = FALLBACK[countryCode] || FALLBACK.NGA;
      return { source:SOURCE_LABEL + ' (offline fallback)', countryCode, ...fb };
    }
  }

  /** Historical trend for one indicator, for charting. */
  async function getPublicHealthTrends(countryCode, indicatorKey = 'lifeExpectancy', years = 15){
    try{
      const series = await fetchIndicator(countryCode, INDICATORS[indicatorKey], { years });
      return { source:SOURCE_LABEL, indicator:indicatorKey, countryCode, series };
    }catch(err){
      console.warn('getPublicHealthTrends falling back:', err);
      return { source:SOURCE_LABEL + ' (unavailable)', indicator:indicatorKey, countryCode, series:[] };
    }
  }

  /** Convenience: disease/mortality style stats bundle for the analytics dashboard. */
  async function getHealthStatistics(countryCode = 'NGA'){
    return getCountryHealthData(countryCode);
  }

  function getCountries(){ return COUNTRIES; }
  function getIndicatorKeys(){ return Object.keys(INDICATORS); }

  return { getCountryHealthData, getPublicHealthTrends, getHealthStatistics, getCountries, getIndicatorKeys, SOURCE_LABEL };
})();
