
// Minimal UI helper toolkit (clean JS, no smart quotes)
(function(){
  // hyperscript-like element builder
  window.h = function(tag, props, children){
    const el = document.createElement(tag);
    props = props || {};
    for (const key in props){
      const val = props[key];
      if (key === 'class') el.className = val;
      else if (key === 'style' && typeof val === 'object') Object.assign(el.style, val);
      else if (key.startsWith('on') && typeof val === 'function') el[key.toLowerCase()] = val;
      else if (val !== undefined && val !== null) el.setAttribute(key, val);
    }
    if (children !== undefined && children !== null){
      if (!Array.isArray(children)) children = [children];
      for (const child of children){
        if (child === null || child === undefined || child === false) continue;
        if (child instanceof Node) el.appendChild(child);
        else el.appendChild(document.createTextNode(String(child)));
      }
    }
    return el;
  };

  // Brand logo resolver
  window.brandLogo = function(brand){
    if(!brand) return './assets/img/logo-cloud9.png';
    const b = String(brand).toLowerCase();
    if (b.includes('kratom')) return './assets/img/logo-kratomdepot.png';
    return './assets/img/logo-cloud9.png';
  };

  // Spinner
  window.spinner = function(){
    const s = document.createElement('div');
    s.setAttribute('role', 'status');
    s.className = 'text-slate-500 text-sm';
    s.textContent = 'Loading...';
    return s;
  };

  // Toasts
  const toastBox = document.createElement('div');
  toastBox.style.position = 'fixed';
  toastBox.style.top = '12px';
  toastBox.style.right = '12px';
  toastBox.style.zIndex = '9999';
  toastBox.style.display = 'flex';
  toastBox.style.flexDirection = 'column';
  toastBox.style.gap = '8px';
  document.addEventListener('DOMContentLoaded', ()=>document.body.appendChild(toastBox));

  window.showToast = function(msg, type){
    const d = document.createElement('div');
    d.textContent = msg;
    d.style.padding = '10px 12px';
    d.style.borderRadius = '10px';
    d.style.boxShadow = '0 8px 20px rgba(0,0,0,.12)';
    d.style.fontSize = '13px';
    d.style.color = type === 'error' ? '#7f1d1d' : '#065f46';
    d.style.background = type === 'error' ? '#fee2e2' : '#d1fae5';
    toastBox.appendChild(d);
    setTimeout(()=>{ d.remove(); }, 4000);
  };

  // Admin helper
  window.isAdminEmail = function(email){
    const list = (window.APP_CONFIG && Array.isArray(window.APP_CONFIG.ADMIN_EMAILS)) ? window.APP_CONFIG.ADMIN_EMAILS : [];
    return !!(email && list.map(String).map(s=>s.toLowerCase()).includes(String(email).toLowerCase()));
  };
})();
