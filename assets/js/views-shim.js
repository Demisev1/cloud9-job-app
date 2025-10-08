/* views-shim.js: ensures required view functions exist */
(function(){
  function ensure(name, fn){
    if (typeof window[name] !== 'function') { window[name] = fn; console.log('[shim] installed ' + name); }
  }
  function mount(el, title, body){
    el.innerHTML = '';
    var h2 = document.createElement('h2'); h2.className='text-2xl font-semibold mb-3'; h2.textContent=title; el.appendChild(h2);
    var p = document.createElement('p'); p.className='text-slate-600'; p.textContent=body; el.appendChild(p);
  }
  ensure('viewHome', async function(el){ mount(el, 'Welcome', 'Home view'); });
  ensure('viewLocations', async function(el){
    mount(el, 'Store Locations', 'Loading locations...');
    try{
      var sb = window.supabaseClient || (window.supabase && window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY));
      if (!sb){ el.lastChild.textContent = 'Supabase not ready'; return; }
      const { data, error } = await sb.from('locations').select('*').order('store_name');
      if (error){ el.lastChild.textContent = error.message; return; }
      var list = document.createElement('div'); list.className='mt-4'; el.appendChild(list);
      data.forEach(function(loc){
        var logo = (loc.brand||'').toLowerCase().includes('kratom') ? './assets/img/logo-kratomdepot.png' : './assets/img/logo-cloud9.png';
        var row = document.createElement('div'); row.className='card p-3 mb-2';
        row.innerHTML = '<div class="flex items-start gap-3">'
          + '<img src="'+logo+'" class="w-10 h-10 rounded-full mt-1"/>'
          + '<div><div class="font-medium">'+(loc.store_name||'Store')+'</div>'
          + '<div class="text-sm text-slate-600">'+(loc.address||'')+'</div>'
          + (loc.hours?('<div class="text-sm text-slate-600">'+loc.hours+'</div>'):'')
          + '</div></div>';
        list.appendChild(row);
      });
      el.removeChild(el.querySelector('p'));
    }catch(e){ el.lastChild.textContent = e.message||String(e); }
  });
  ensure('viewApply', async function(el){
    mount(el, 'Apply', 'Application form initializing...');
    var form = document.createElement('form'); form.className='space-y-3 mt-4';
    form.innerHTML = '<input class="input" name="full_name" placeholder="Full name" required>'
      + '<input class="input" name="email" type="email" placeholder="Email" required>'
      + '<input class="input" name="phone" placeholder="Phone" required>'
      + '<input class="input" name="position" placeholder="Position" required>'
      + '<button class="btn btn-primary" type="submit">Submit application</button>';
    el.appendChild(form);
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      try{
        var sb = window.supabaseClient || (window.supabase && window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY));
        if (!sb){ alert('Supabase not ready'); return; }
        var user = (await sb.auth.getUser()).data.user;
        var payload = {
          user_id: user ? user.id : null,
          full_name: form.full_name.value,
          email: form.email.value,
          phone: form.phone.value,
          position: form.position.value
        };
        const { error } = await sb.from('applications').insert(payload);
        if (error) throw error;
        alert('Application submitted!');
        location.hash = '#/dashboard';
      }catch(err){ alert(err.message||String(err)); }
    });
  });
  ensure('viewLogin', async function(el){
    mount(el, 'Login', 'Enter your email and password.');
    var form = document.createElement('form'); form.className='space-y-3 mt-4';
    form.innerHTML = '<input class="input" name="email" type="email" placeholder="Email" required>'
      + '<input class="input" name="password" type="password" placeholder="Password" required>'
      + '<button class="btn btn-primary" type="submit">Login</button>';
    el.appendChild(form);
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      try{
        var sb = window.supabaseClient || (window.supabase && window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY));
        const { error } = await sb.auth.signInWithPassword({ email: form.email.value, password: form.password.value });
        if (error) throw error;
        location.hash = '#/dashboard';
      }catch(err){ alert(err.message||String(err)); }
    });
  });
  ensure('viewDashboard', async function(el){ mount(el, 'My Applications', 'Your application history will appear here after you submit.'); });
  ensure('viewAdmin', async function(el){ mount(el, 'Admin', 'Admin panel will initialize after login.'); });
})();
