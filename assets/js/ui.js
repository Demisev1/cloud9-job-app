/* ui.js */
(function(){
  window.h = function(tag, props, children){
    const el = document.createElement(tag); props = props||{};
    for(const k in props){
      const v = props[k];
      if (k==='class') el.className=v;
      else if (k==='style' && v && typeof v==='object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v==='function') el[k.toLowerCase()] = v;
      else if (v!==undefined && v!==null) el.setAttribute(k, v);
    }
    if (children!==undefined && children!==null){
      if (!Array.isArray(children)) children=[children];
      for (const c of children){ if (c===null||c===undefined||c===false) continue;
        el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
      }
    }
    return el;
  };
  window.brandLogo = function(brand){
    const b = String(brand||'').toLowerCase();
    return b.includes('kratom') ? 'assets/img/logo-kratomdepot.png' : 'assets/img/logo-cloud9.png';
  };
  window.spinner = function(){ return h('div',{class:'text-sm text-slate-500'},'Loading...'); };
  window.showToast = function(msg,type){
    const box = document.getElementById('__toastbox') || (function(){const d=document.createElement('div');d.id='__toastbox';d.style.position='fixed';d.style.top='12px';d.style.right='12px';d.style.zIndex='9999';d.style.display='flex';d.style.flexDirection='column';d.style.gap='8px';document.body.appendChild(d);return d})();    
    const t = h('div',{class:'card',style:{padding:'10px 12px',borderRadius:'10px',color:(type==='error'?'#7f1d1d':'#065f46'),background:(type==='error'?'#fee2e2':'#d1fae5')}} ,msg);
    box.appendChild(t); setTimeout(()=>t.remove(),4000);
  };
})();