/* views.js */
(function(){
  if (typeof window.route !== 'function'){
    window.route = function(path){
      if (path){ if (path[0] !== '#') path = '#'+path; location.hash = path; }
      return location.hash || '#/';
    };
  }
  function clear(el){ while(el.firstChild) el.removeChild(el.firstChild); }
  function title(t){ return h('h2',{class:'text-2xl font-semibold mb-3'},t); }
  function p(t){ return h('p',{class:'text-slate-600'},t); }
  function card(ch){ return h('div',{class:'card p-4 mb-3'},ch); }
  async function client(){ return window.supabaseClient; }

  window.viewHome = async function(el){
    clear(el);
    el.appendChild(title('Join Cloud 9 Vapes / The Hemp and Kratom Depot'));
    el.appendChild(p('Apply in minutes, then track your application status by logging in.'));
    el.appendChild(h('div',{class:'flex gap-4 mb-6'},[
      h('a',{href:'#/apply',class:'btn btn-primary'},'Apply Now'),
      h('a',{href:'#/login',class:'btn btn-outline'},'My Dashboard')
    ]));
    const wrap = card([
      h('div',{class:'flex items-center justify-between mb-2'},[
        h('h3',{class:'font-semibold'},'Current Locations'),
        h('a',{href:'#/locations',class:'text-brand-700 underline'},'View all')
      ]),
      h('div',{id:'home_locs'},'Loading...')
    ]);
    el.appendChild(wrap);
    try{
      const { data, error } = await (await client()).from('locations').select('*').order('store_name');
      const list = wrap.querySelector('#home_locs');
      if (error){ list.textContent = error.message; return; }
      list.textContent='';
      data.forEach(loc=>{
        list.appendChild(card(h('div',{class:'flex items-start gap-3'},[
          h('img',{src:brandLogo(loc.brand),class:'w-10 h-10 rounded-full mt-1'}),
          h('div',{},[
            h('div',{class:'font-medium'},loc.store_name||'Store'),
            h('div',{class:'text-sm text-slate-600'},loc.address||''),
            loc.hours? h('div',{class:'text-sm text-slate-600'}, loc.hours): null
          ])
        ])));
      });
    }catch(e){ console.error(e); }
  };

  window.viewLocations = async function(el){
    clear(el); el.appendChild(title('Store Locations'));
    const list = h('div',{class:'mt-4'},'Loading...'); el.appendChild(list);
    const { data, error } = await (await client()).from('locations').select('*').order('store_name');
    if (error){ list.textContent = error.message; return; }
    list.textContent='';
    data.forEach(loc=>{
      list.appendChild(card(h('div',{class:'flex items-start gap-3'},[
        h('img',{src:brandLogo(loc.brand),class:'w-10 h-10 rounded-full mt-1'}),
        h('div',{},[
          h('div',{class:'font-medium'},loc.store_name),
          h('div',{class:'text-sm text-slate-600'},loc.address||''),
          loc.hours? h('div',{class:'text-sm text-slate-600'}, loc.hours): null
        ])
      ])));
    });
  };

  window.viewApply = async function(el){
    clear(el); el.appendChild(title('Apply'));
    const sb = await client();
    const { data: locs } = await sb.from('locations').select('id,store_name').order('store_name');
    const select = h('select',{name:'location_id',required:true,class:'input'},[h('option',{value:''},'Select location...')]);
    (locs||[]).forEach(l=> select.appendChild(h('option',{value:l.id}, l.store_name)));
    const form = h('form',{class:'space-y-3 mt-4'},[
      h('input',{class:'input',name:'full_name',placeholder:'Full name',required:true}),
      h('input',{class:'input',type:'email',name:'email',placeholder:'Email',required:true}),
      h('input',{class:'input',name:'phone',placeholder:'Phone',required:true}),
      h('input',{class:'input',name:'position',placeholder:'Position',required:true}),
      select,
      h('button',{class:'btn btn-primary',type:'submit'},'Submit application')
    ]);
    el.appendChild(form);
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      try{
        const { data: u } = await sb.auth.getUser();
        const payload = {
          user_id: u && u.user ? u.user.id : null,
          full_name: form.full_name.value,
          email: form.email.value,
          phone: form.phone.value,
          position: form.position.value,
          location_id: form.location_id.value
        };
        const { error } = await sb.from('applications').insert(payload);
        if (error) throw error;
        showToast('Application submitted!', 'success');
        location.hash = '#/dashboard';
      }catch(err){ showToast(err.message||String(err),'error'); }
    });
  };

  window.viewLogin = async function(el){
    clear(el); el.appendChild(title('Login'));
    const form = h('form',{class:'space-y-3 mt-4'},[
      h('input',{class:'input',type:'email',name:'email',placeholder:'Email',required:true}),
      h('input',{class:'input',type:'password',name:'password',placeholder:'Password',required:true}),
      h('button',{class:'btn btn-primary',type:'submit'},'Login')
    ]);
    el.appendChild(form);
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      try{
        const { error } = await (await client()).auth.signInWithPassword({ email: form.email.value, password: form.password.value });
        if (error) throw error;
        location.hash = '#/dashboard';
      }catch(err){ showToast(err.message||String(err),'error'); }
    });
  };

  window.viewDashboard = async function(el){
    clear(el); el.appendChild(title('My Applications'));
    const sb = await client();
    const { data: u } = await sb.auth.getUser();
    if (!u || !u.user){ el.appendChild(p('Please log in.')); return; }
    const { data, error } = await sb.from('applications').select('created_at,status,position').eq('user_id', u.user.id).order('created_at',{ascending:false});
    if (error){ el.appendChild(p(error.message)); return; }
    if (!data || !data.length){ el.appendChild(p('No applications yet.')); return; }
    data.forEach(a=>{
      el.appendChild(card([
        h('div',{class:'font-medium'}, a.position),
        h('div',{class:'text-sm text-slate-600'}, 'Status: '+a.status),
        h('div',{class:'text-xs text-slate-500'}, new Date(a.created_at).toLocaleString())
      ]));
    });
  };

  window.viewAdmin = async function(el){
    clear(el); el.appendChild(title('Admin'));
    const sb = await client();
    const { data: u } = await sb.auth.getUser();
    if (!u || !u.user){ el.appendChild(p('Please log in.')); return; }
    const { data: prof } = await sb.from('profiles').select('role').eq('user_id', u.user.id).maybeSingle();
    if (!prof || prof.role !== 'admin'){ el.appendChild(p('Admin access required.')); return; }
    el.appendChild(p('Welcome, admin. Use Supabase to update locations for now. (UI panel can be extended)'));
  };

})();