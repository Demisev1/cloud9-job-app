/* router.js */
(function(){
  const appEl = ()=> document.getElementById('app');
  function setActive(){
    const h = location.hash || '#/';
    ['home','apply','locations','dash'].forEach(id=>{
      const a = document.getElementById('nav-'+id); if (!a) return;
      const wants = (id==='home' && (h==='#/' || h==='#')) ||
                    (id==='apply' && h.startsWith('#/apply')) ||
                    (id==='locations' && h.startsWith('#/locations')) ||
                    (id==='dash' && (h.startsWith('#/dashboard')));
      a.classList.toggle('active', !!wants);
    });
  }
  async function render(){
    const el = appEl(); if (!el) return;
    const h = location.hash || '#/';
    setActive();
    try{
      if (h.startsWith('#/locations')) return await window.viewLocations(el);
      if (h.startsWith('#/apply')) return await window.viewApply(el);
      if (h.startsWith('#/login')) return await window.viewLogin(el);
      if (h.startsWith('#/dashboard')) return await window.viewDashboard(el);
      if (h.startsWith('#/admin')) return await window.viewAdmin(el);
      return await window.viewHome(el);
    }catch(e){
      el.textContent = 'Render error: ' + (e.message||String(e));
      console.error(e);
    }
  }
  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', render);
  setTimeout(render, 0);
})();