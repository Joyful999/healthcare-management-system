/* MEDICORE — storage.js
   Thin, safe wrapper around localStorage. Everything MEDICORE persists
   (demo accounts, appointments, records, settings, notifications) lives
   under the "medicore:" namespace so this demo never touches other
   sites' storage.

   IMPORTANT: This is a frontend portfolio project. Nothing written here
   is a real medical record and nothing is transmitted anywhere. */

const Storage = (() => {
  const NS = 'medicore:';

  function get(key, fallback = null){
    try{
      const raw = localStorage.getItem(NS + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    }catch(e){
      console.warn('Storage.get failed for', key, e);
      return fallback;
    }
  }

  function set(key, value){
    try{
      localStorage.setItem(NS + key, JSON.stringify(value));
      return true;
    }catch(e){
      console.warn('Storage.set failed for', key, e);
      return false;
    }
  }

  function remove(key){
    try{ localStorage.removeItem(NS + key); }catch(e){ /* ignore */ }
  }

  function has(key){
    return localStorage.getItem(NS + key) !== null;
  }

  function clearAll(){
    Object.keys(localStorage)
      .filter(k => k.startsWith(NS))
      .forEach(k => localStorage.removeItem(k));
  }

  return { get, set, remove, has, clearAll };
})();
