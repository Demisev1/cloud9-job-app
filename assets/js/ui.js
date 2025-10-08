
function h(tag, attrs={}, children=[]) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (typeof c === 'string') el.appendChild(document.createTextNode(c));
    else if (c) el.appendChild(c);
  });
  return el;
}

function showToast(msg, type='info') {
  const bg = type==='error'?'bg-red-600':type==='success'?'bg-green-600':'bg-slate-800';
  const wrap = h('div', {class:`fixed bottom-4 left-1/2 -translate-x-1/2 text-white ${bg} px-4 py-2 rounded-xl shadow-lg z-50`}, msg);
  document.body.appendChild(wrap);
  setTimeout(()=>wrap.remove(), 2600);
}

function spinner() {
  return h('div', {class:'flex items-center gap-2 text-slate-500'}, [
    h('span', {class:'w-4 h-4 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin'}),
    'Loading...'
  ]);
}

function badge(status) {
  const map = {
    'Pending':'bg-slate-100 text-slate-700',
    'Under Review':'bg-amber-100 text-amber-800',
    'Interview':'bg-blue-100 text-blue-800',
    'Hired':'bg-green-100 text-green-800',
    'Rejected':'bg-rose-100 text-rose-800'
  };
  return h('span', {class:`badge ${map[status] || 'bg-slate-100 text-slate-700'}`}, status || 'Pending');
}
\n
function brandLogo(brand){
  if(!brand) return './assets/img/logo-cloud9.png';
  const b = brand.toLowerCase();
  if (b.includes('kratom')) return './assets/img/logo-kratomdepot.png';
  return './assets/img/logo-cloud9.png';
}
\n