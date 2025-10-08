/* build: ui-clean */
(function(){
  console.log('[ui-clean] loaded');
  // tiny helper to create elements
  window.h = function(tag, props, children){
    var el = document.createElement(tag);
    props = props || {};
    for (var k in props){
      var v = props[k];
      if (k === 'class') el.className = v;
      else if (k === 'style' && v && typeof v === 'object') { for (var s in v) el.style[s] = v[s]; }
      else if (k.slice(0,2) === 'on' && typeof v === 'function') el[k.toLowerCase()] = v;
      else if (v !== undefined && v !== null) el.setAttribute(k, v);
    }
    if (children !== undefined && children !== null){
      if (!Array.isArray(children)) children = [children];
      for (var i=0; i<children.length; i++){
        var c = children[i];
        if (c === null || c === undefined || c === false) continue;
        if (c instanceof Node) el.appendChild(c);
        else el.appendChild(document.createTextNode(String(c)));
      }
    }
    return el;
  };

  window.brandLogo = function(brand){
    if(!brand) return './assets/img/logo-cloud9.png';
    var b = String(brand).toLowerCase();
    if (b.indexOf('kratom') !== -1) return './assets/img/logo-kratomdepot.png';
    return './assets/img/logo-cloud9.png';
  };

  window.spinner = function(){
    var s = document.createElement('div');
    s.setAttribute('role','status');
    s.className = 'text-slate-500 text-sm';
    s.textContent = 'Loading...';
    return s;
  };

  var toastBox = document.createElement('div');
  toastBox.style.position='fixed';
  toastBox.style.top='12px';
  toastBox.style.right='12px';
  toastBox.style.zIndex='9999';
  toastBox.style.display='flex';
  toastBox.style.flexDirection='column';
  toastBox.style.gap='8px';
  document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(toastBox); });

  window.showToast = function(msg, type){
    var d = document.createElement('div');
    d.textContent = msg;
    d.style.padding='10px 12px';
    d.style.borderRadius='10px';
    d.style.boxShadow='0 8px 20px rgba(0,0,0,.12)';
    d.style.fontSize='13px';
    d.style.color = (type === 'error') ? '#7f1d1d' : '#065f46';
    d.style.background = (type === 'error') ? '#fee2e2' : '#d1fae5';
    toastBox.appendChild(d);
    setTimeout(function(){ d.remove(); }, 4000);
  };

  window.isAdminEmail = function(email){
    var list = (window.APP_CONFIG && Array.isArray(window.APP_CONFIG.ADMIN_EMAILS)) ? window.APP_CONFIG.ADMIN_EMAILS : [];
    var low = String(email||'').toLowerCase();
    for (var i=0;i<list.length;i++){ if (String(list[i]).toLowerCase() === low) return true; }
    return false;
  };
})();