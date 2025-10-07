async function api(path, opts = {}){
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch((window.API_BASE || '') + path, { ...opts, headers });
  if (!res.ok) {
    let msg;
    try { msg = await res.text(); } catch(e){ msg = res.statusText; }
    throw new Error(msg || 'Request failed');
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

function fmtErr(e) {
  try { const o = JSON.parse(e.message); return o.error || e.message; } catch(_) { return e.message; }
}
