/* views.js guard: ensure route() exists before any usage */
(function(){
  if (typeof window.route !== 'function') {
    window.route = function(path){
      if (path) { if (path[0] !== '#') path = '#' + path; location.hash = path; }
      return location.hash || '#/';
    };
    console.log('[guard] route() defined by views.js');
  }
})();


/** VIEWS */
route('#/', async () => {
  const wrap = h('div', {class:'grid md:grid-cols-2 gap-6 items-start'});
  const hero = h('div', {class:'card p-6'}, [
    h('h2', {class:'text-2xl font-semibold mb-2'}, 'Join Cloud 9 Vapes / The Hemp and Kratom Depot'),
    h('p', {class:'text-slate-600 mb-4'}, 'Apply in minutes, then track your application status by logging into your dashboard.'),
    h('div', {class:'flex gap-3'}, [
      h('a', {href:'#/apply', class:'btn btn-primary'}, 'Apply Now'),
      h('a', {href:'#/dashboard', class:'btn btn-outline'}, 'My Dashboard')
    ]),
    h('div', {class:'mt-6 grid sm:grid-cols-2 gap-4'}, [
      h('div', {class:'p-4 rounded-xl bg-brand-50 border border-brand-100'}, [
        h('h3', {class:'font-semibold mb-1'}, 'Fast application'),
        h('p', {class:'text-sm text-slate-600'}, 'Just your basic info and preferred store location.')
      ]),
      h('div', {class:'p-4 rounded-xl bg-brand-50 border border-brand-100'}, [
        h('h3', {class:'font-semibold mb-1'}, 'Track your status'),
        h('p', {class:'text-sm text-slate-600'}, 'Log in anytime to see updates: Pending, Review, Interview, etc.')
      ]),
    ])
  ]);

  const locationsCard = h('div', {class:'card p-6'}, [
    h('div', {class:'flex items-center justify-between mb-4'}, [
      h('h2', {class:'text-xl font-semibold'}, 'Current Locations'),
      h('a', {href:'#/locations', class:'text-brand-700 hover:underline'}, 'View all')
    ]),
    h('div', {id:'homeLocations', class:'grid grid-cols-1 sm:grid-cols-2 gap-4'} , spinner())
  ]);

  // fetch a few locations
  (async () => {
    const { data, error } = await window.supabaseClient.from('locations').select('*').limit(4);
    const c = locationsCard.querySelector('#homeLocations');
    c.innerHTML = '';
    if (error) { c.appendChild(h('p', {class:'text-rose-600'}, 'Error loading locations.')); return; }
    if (!data || data.length===0) { c.appendChild(h('p', {class:'text-slate-600'}, 'No locations yet.')); return; }
    data.forEach(loc => {
      c.appendChild(h('div', {class:'p-4 rounded-xl border border-slate-200 flex items-start gap-3'}, [
        h('img', {src: brandLogo(loc.brand), alt: loc.brand||'Brand', class:'w-10 h-10 rounded-full object-cover mt-1'}),
        h('div', {}, [
          h('h4', {class:'font-semibold'}, loc.store_name || 'Store'),
          h('p', {class:'text-sm text-slate-600'}, loc.address || ''),
          h('p', {class:'text-sm text-slate-600'}, loc.hours || ''),
          loc.phone ? h('a', {href:`tel:${loc.phone}`, class:'text-sm text-brand-700 mt-1 underline inline-block'}, loc.phone) : ''
        ])
      ]));
    });
  })();

  wrap.appendChild(hero);
  wrap.appendChild(locationsCard);
  return wrap;
});

route('#/login', async () => {
  const form = h('form', {class:'card max-w-md mx-auto p-6 space-y-4'} , [
    h('h2', {class:'text-xl font-semibold'}, 'Login'),
    h('input', {class:'input', type:'email', placeholder:'Email', required:true}),
    h('input', {class:'input', type:'password', placeholder:'Password', required:true}),
    h('button', {class:'btn btn-primary w-full', type:'submit'}, 'Log In'),
    h('p', {class:'text-sm text-center text-slate-600'}, [
      'No account? ', h('a', {href:'#/signup', class:'text-brand-700 underline'}, 'Create one')
    ])
  ]);
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const [emailEl, passEl] = form.querySelectorAll('input');
    const { error } = await window.supabaseClient.auth.signInWithPassword({ email: emailEl.value, password: passEl.value });
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Logged in', 'success');
    location.hash = '#/dashboard';
  });
  return form;
});

route('#/signup', async () => {
  const form = h('form', {class:'card max-w-md mx-auto p-6 space-y-4'} , [
    h('h2', {class:'text-xl font-semibold'}, 'Create Account'),
    h('input', {class:'input', type:'email', placeholder:'Email', required:true}),
    h('input', {class:'input', type:'password', placeholder:'Password (min 6 chars)', required:true, minLength:6}),
    h('button', {class:'btn btn-primary w-full', type:'submit'}, 'Create Account'),
    h('p', {class:'text-sm text-center text-slate-600'}, [
      'Already have an account? ', h('a', {href:'#/login', class:'text-brand-700 underline'}, 'Log in')
    ])
  ]);
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const [emailEl, passEl] = form.querySelectorAll('input');
    const { error } = await window.supabaseClient.auth.signUp({ email: emailEl.value, password: passEl.value });
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Account created. You can log in now.', 'success');
    location.hash = '#/login';
  });
  return form;
});

route('#/apply', async () => {
  // fetch locations for dropdown
  const wrap = h('div', {class:'card max-w-2xl mx-auto p-6'});
  const user = await getUser();
  if (!user) {
    wrap.appendChild(h('div', {class:'mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800'}, 
      'Please log in to submit an application.'));
  }
  const { data:locs } = await window.supabaseClient.from('locations').select('*').order('store_name', {ascending:true});
  const form = h('form', {class:'space-y-4'}, [
    h('h2', {class:'text-xl font-semibold'}, 'Application Form'),
    h('input', {class:'input', name:'full_name', placeholder:'Full name', required:true}),
    h('div', {class:'grid sm:grid-cols-2 gap-3'}, [
      h('input', {class:'input', name:'phone', placeholder:'Phone', required:true}),
      h('input', {class:'input', name:'email', type:'email', placeholder:'Email', required:true}),
    ]),
    h('div', {class:'grid sm:grid-cols-2 gap-3'}, [
      (()=>{
        const sel = h('select', {name:'position', class:'input', required:true}, [
          h('option', {value:''}, 'Desired position'),
          h('option', {value:'Sales Associate'}, 'Sales Associate'),
          h('option', {value:'Shift Lead'}, 'Shift Lead'),
          h('option', {value:'Manager'}, 'Manager'),
        ]);
        return sel;
      })(),
      (()=>{
        const sel = h('select', {name:'location_id', class:'input', required:true}, [
          h('option', {value:''}, 'Preferred location'),
        ]);
        (locs||[]).forEach(l => sel.appendChild(h('option', {value:l.id}, l.store_name)));
        return sel;
      })()
    ]),
    h('button', {class:'btn btn-primary w-full', type:'submit', disabled:!user}, user?'Submit Application':'Log in to Apply')
  ]);
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const user = await getUser();
    if (!user) { showToast('Please log in first.', 'error'); return; }
    payload.user_id = user.id;
    payload.status = 'Pending';
    const { error } = await window.supabaseClient.from('applications').insert(payload);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Application submitted!', 'success');
    location.hash = '#/dashboard';
  });
  wrap.appendChild(form);
  return wrap;
});

route('#/dashboard', async () => {
  const wrap = h('div', {class:'grid gap-6'});
  const user = await getUser();
  if (!user) {
    return h('div', {class:'card p-6 max-w-md mx-auto'}, [
      h('h2', {class:'text-xl font-semibold mb-2'}, 'Sign in required'),
      h('p', {class:'text-slate-600 mb-4'}, 'Log in to view your application status.'),
      h('div', {class:'flex gap-2'}, [
        h('a', {href:'#/login', class:'btn btn-primary'}, 'Log in'),
        h('a', {href:'#/signup', class:'btn btn-outline'}, 'Create account')
      ])
    ]);
  }
  const top = h('div', {class:'flex items-center justify-between'}, [
    h('h2', {class:'text-xl font-semibold'}, 'My Applications'),
    h('div', {class:'text-sm text-slate-600'}, user.email)
  ]);
  const card = h('div', {class:'card p-6'}, spinner());
  wrap.appendChild(top);
  wrap.appendChild(card);

  const { data, error } = await window.supabaseClient
    .from('applications')
    .select('*, locations(store_name)')
    .eq('user_id', user.id)
    .order('created_at', {ascending:false});
  card.innerHTML = '';
  if (error) { card.appendChild(h('p', {class:'text-rose-600'}, 'Error loading applications.')); return wrap; }
  if (!data || data.length===0) {
    card.appendChild(h('p', {class:'text-slate-600'}, 'No applications yet. Head to Apply to submit your first application.'));
    return wrap;
  }
  data.forEach(a => {
    card.appendChild(h('div', {class:'border border-slate-200 rounded-xl p-4 mb-3'}, [
      h('div', {class:'flex items-center justify-between mb-1'}, [
        h('div', {class:'font-semibold'}, a.locations?.store_name || 'Location'),
        badge(a.status)
      ]),
      h('p', {class:'text-sm text-slate-600'}, `${a.position || 'Position'} — ${a.full_name}`),
      h('p', {class:'text-xs text-slate-500 mt-1'}, new Date(a.created_at).toLocaleString())
    ]));
  });
  return wrap;
});

route('#/admin', async () => {
  const user = await getUser();
  if (!user) {
    return h('div', {class:'card p-6 max-w-md mx-auto'}, [
      h('h2', {class:'text-xl font-semibold mb-2'}, 'Admin sign in required'),
      h('p', {class:'text-slate-600 mb-4'}, 'Log in with your admin email to access the dashboard.'),
      h('a', {href:'#/login', class:'btn btn-primary'}, 'Log in')
    ]);
  }
  if (!isAdminEmail(user.email)) {
    return h('div', {class:'card p-6 max-w-md mx-auto'}, [
      h('h2', {class:'text-xl font-semibold mb-2'}, 'Access denied'),
      h('p', {class:'text-slate-600'}, 'Your account does not have admin privileges.')
    ]);
  }
  const page = h('div', {class:'grid md:grid-cols-2 gap-6'});

  // Applications panel
  const apps = h('div', {class:'card p-6'}, [
    h('div', {class:'flex items-center justify-between mb-3'}, [
      h('h3', {class:'text-lg font-semibold'}, 'Applications'),
      h('button', {class:'btn btn-outline', onclick:()=>render()}, 'Refresh')
    ]),
    h('div', {id:'appsList'}, spinner())
  ]);

  // Locations panel
  const locs = h('div', {class:'card p-6'}, [
    h('div', {class:'flex items-center justify-between mb-3'}, [
      h('h3', {class:'text-lg font-semibold'}, 'Locations'),
      h('a', {href:'#/locations', class:'text-brand-700 underline'}, 'Manage')
    ]),
    h('div', {id:'locsList'}, spinner())
  ]);

  page.appendChild(apps);
  page.appendChild(locs);

  // load data
  (async()=>{
    const { data:appsData, error:aErr } = await window.supabaseClient
      .from('applications').select('*, locations(store_name)').order('created_at', {ascending:false}).limit(50);
    const c = apps.querySelector('#appsList'); c.innerHTML='';
    if (aErr) { c.appendChild(h('p', {class:'text-rose-600'}, 'Failed to load applications.')); return; }
    if (!appsData?.length) { c.appendChild(h('p', {class:'text-slate-600'}, 'No applications yet.')); return; }
    appsData.forEach(a => {
      const sel = h('select', {class:'input sm:w-44'}, [
        ...['Pending','Under Review','Interview','Hired','Rejected'].map(s => {
          const opt = h('option', {value:s}, s); if (s===a.status) opt.selected = true; return opt;
        })
      ]);
      const row = h('div', {class:'border border-slate-200 rounded-xl p-3 mb-3 flex items-center justify-between gap-3'}, [
        h('div', {}, [
          h('div', {class:'font-medium'}, `${a.full_name} — ${a.position}`),
          h('div', {class:'text-sm text-slate-600'}, a.locations?.store_name || 'Location'),
          h('div', {class:'text-xs text-slate-500'}, a.email || '')
        ]),
        h('div', {class:'flex items-center gap-2'}, [
          sel,
          h('button', {class:'btn btn-primary', onclick: async ()=>{
            const { error } = await window.supabaseClient.from('applications').update({status: sel.value}).eq('id', a.id);
            if (error) { showToast(error.message, 'error'); return; }
            showToast('Status updated', 'success');
            render();
          }}, 'Save')
        ])
      ]);
      c.appendChild(row);
    });
  })();

  (async()=>{
    const { data:locData, error:lErr } = await window.supabaseClient.from('locations').select('*').order('store_name');
    const c = locs.querySelector('#locsList'); c.innerHTML='';
    if (lErr) { c.appendChild(h('p', {class:'text-rose-600'}, 'Failed to load locations.')); return; }
    if (!locData?.length) { c.appendChild(h('p', {class:'text-slate-600'}, 'No locations yet.')); return; }
    locData.forEach(l => {
      c.appendChild(h('div', {class:'border border-slate-200 rounded-xl p-3 mb-2'}, [
        h('div', {class:'font-medium'}, l.store_name),
        h('div', {class:'text-sm text-slate-600'}, l.address || ''),
        h('div', {class:'text-sm text-slate-600'}, l.hours || ''),
        l.phone ? h('a', {href:`tel:${l.phone}`, class:'text-xs text-brand-700 underline'}, l.phone) : ''
      ]));
    });
  })();

  return page;
});

route('#/locations', async () => {
  const user = await getUser();
  const wrap = h('div', {class:'grid md:grid-cols-3 gap-6'});

  // list
  let brandFilter = 'all';
  const list = h('div', {class:'card p-6 md:col-span-2'}, [
    h('div', {class:'flex items-center justify-between mb-3'}, [
      h('h3', {class:'text-lg font-semibold'}, 'Store Locations'),
      h('a', {href:'#/', class:'text-brand-700 underline'}, 'Back to Home')
    ]),
    h('div', {class:'flex items-center gap-2 mb-4'}, [
      h('button', {class:'btn btn-outline', onclick:()=>{brandFilter='all'; render();}}, 'All'),
      h('button', {class:'btn btn-outline', onclick:()=>{brandFilter='Cloud 9 Vapes'; render();}}, 'Cloud 9 Vapes'),
      h('button', {class:'btn btn-outline', onclick:()=>{brandFilter='The Hemp and Kratom Depot'; render();}}, 'The Hemp & Kratom Depot')
    ]),
    h('div', {id:'locList'}, spinner())
  ]);

  // add/edit (admins only)
  const formCard = h('div', {class:'card p-6'}, [
    h('h3', {class:'text-lg font-semibold mb-2'}, 'Add / Edit Location'),
    h('p', {class:'text-sm text-slate-600 mb-4'}, 'Admins can add or update location info.'),
  ]);

  const form = h('form', {class:'space-y-3'}, [
    h('input', {class:'input', name:'store_name', placeholder:'Store name', required:true}),
    h('input', {class:'input', name:'address', placeholder:'Address'}),
    h('input', {class:'input', name:'hours', placeholder:'Hours (e.g., Mon–Sat: 9–8, Sun: 10–6)'}),
    h('input', {class:'input', name:'phone', placeholder:'Phone (optional)'}),
    (function(){
      const sel = h('select', {name:'brand', class:'input', required:true}, [
        h('option', {value:''}, 'Brand'),
        h('option', {value:'Cloud 9 Vapes'}, 'Cloud 9 Vapes'),
        h('option', {value:'The Hemp and Kratom Depot'}, 'The Hemp and Kratom Depot')
      ]);
      return sel;
    })(),
    h('div', {class:'flex gap-2'}, [
      h('button', {class:'btn btn-primary', type:'submit'}, 'Save'),
      h('button', {class:'btn btn-outline', type:'button', onclick:()=>{ form.reset(); selId=null; }}, 'Clear')
    ])
  ]);

  let selId = null;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const isAdmin = user && isAdminEmail(user.email);
    if (!isAdmin) { showToast('Admin only', 'error'); return; }
    const frm = new FormData(form);
    const payload = Object.fromEntries(frm.entries());
    if (!selId) {
      const { error } = await window.supabaseClient.from('locations').insert(payload);
      if (error) { showToast(error.message, 'error'); return; }
    } else {
      const { error } = await window.supabaseClient.from('locations').update(payload).eq('id', selId);
      if (error) { showToast(error.message, 'error'); return; }
    }
    showToast('Saved', 'success'); form.reset(); selId=null; render();
  });

  formCard.appendChild(form);

  // populate list with edit/delete buttons if admin
  (async()=>{
    let query = window.supabaseClient.from('locations').select('*').order('store_name');
    if (brandFilter !== 'all') query = query.eq('brand', brandFilter);
    const { data, error } = await query;
    const c = list.querySelector('#locList'); c.innerHTML='';
    if (error) { c.appendChild(h('p', {class:'text-rose-600'}, 'Failed to load locations.')); return; }
    if (!data?.length) { c.appendChild(h('p', {class:'text-slate-600'}, 'No locations yet.')); return; }
    data.forEach(l => {
      const row = h('div', {class:'border border-slate-200 rounded-xl p-3 mb-2'}, [
        h('div', {class:'flex items-start justify-between gap-3'}, [
          h('div', {class:'flex items-start gap-3'}, [
            h('img', {src: brandLogo(l.brand), alt: l.brand||'Brand', class:'w-10 h-10 rounded-full object-cover mt-1'}),
            h('div', {}, [
              h('div', {class:'font-medium'}, l.store_name),
              h('div', {class:'text-sm text-slate-600'}, l.address || ''),
              h('div', {class:'text-sm text-slate-600'}, l.hours || ''),
              l.brand ? h('div', {class:'text-xs text-slate-500 mt-1'}, l.brand) : ''
            ])
          ]),
          (user && isAdminEmail(user.email)) ? h('div', {class:'flex items-center gap-2'}, [
            h('button', {class:'btn btn-outline', onclick:()=>{
              selId = l.id;
              form.store_name.value = l.store_name||'';
              form.address.value = l.address||'';
              form.hours.value = l.hours||'';
              form.phone.value = l.phone||'';
              form.brand.value = l.brand||'';
            }}, 'Edit'),
            h('button', {class:'btn btn-outline', onclick: async()=>{
              if (!confirm('Delete this location?')) return;
              const { error } = await window.supabaseClient.from('locations').delete().eq('id', l.id);
              if (error) { showToast(error.message, 'error'); return; }
              showToast('Deleted', 'success'); render();
            }}, 'Delete')
          ]) : ''
        ])
      ]);
      c.appendChild(row);
    });
  })();

  wrap.appendChild(list);
  wrap.appendChild(formCard);
  return wrap;
});

route('#/privacy', async () => {
  return h('div', {class:'card p-6 max-w-3xl mx-auto'}, [
    h('h2', {class:'text-xl font-semibold mb-2'}, 'Privacy Policy'),
    h('p', {class:'text-slate-600'}, 'We only use your information to process your application and contact you.')
  ]);
});
route('#/terms', async () => {
  return h('div', {class:'card p-6 max-w-3xl mx-auto'}, [
    h('h2', {class:'text-xl font-semibold mb-2'}, 'Terms of Use'),
    h('p', {class:'text-slate-600'}, 'Use of this site is subject to our terms and conditions.')
  ]);
});
route('#/404', async () => h('div', {class:'p-6'}, 'Not Found'));
