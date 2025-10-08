/* router.js (idempotent) */
(function(){
  if (window.__APP_ROUTER__) { console.log('[router] already initialized'); return; }
  const appEl = () => document.getElementById('app');
  async function render(){
    const el = appEl(); if (!el) return;
    const hash = (location.hash || '#/');
    try{
      if (hash.startsWith('#/locations'))      return await window.viewLocations(el);
      if (hash.startsWith('#/apply'))          return await window.viewApply(el);
      if (hash.startsWith('#/login'))          return await window.viewLogin(el);
      if (hash.startsWith('#/admin'))          return await window.viewAdmin(el);
      if (hash.startsWith('#/dashboard'))      return await window.viewDashboard(el);
      return await window.viewHome(el);
    }catch(e){
      el.textContent = 'Render error: ' + (e.message||String(e));
      console.error(e);
    }
  }
  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', render);
  window.__APP_ROUTER__ = { render };
  console.log('[router] initialized');
  setTimeout(render, 0);
})();
