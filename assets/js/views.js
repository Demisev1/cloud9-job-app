/* views.js — definitive build: attaches view functions to window */
(function(){
  // ensure route helper exists
  if (typeof window.route !== 'function') {
    window.route = function(path){
      if (path) { if (path[0] !== '#') path = '#'+path; location.hash = path; }
      return location.hash || '#/';
    };
    console.log('[views] route() installed');
  }

  // helpers
  function clear(el){ while(el.firstChild) el.removeChild(el.firstChild); }
  function title(text){ return h('h2', {class:'text-2xl font-semibold mb-3'}, text); }
  function p(text, cls){ return h('p', {class: (cls||'text-slate-600')}, text); }
  function card(children){ return h('div', {class:'card p-4 mb-3'}, children); }
  async function getClient(){
    if (window.supabaseClient) return window.supabaseClient;
    if (window.supabase && window.APP_CONFIG) {
      window.supabaseClient = window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);
      return window.supabaseClient;
    }
    throw new Error('Supabase not available');
  }

  // HOME
  async function viewHome(el){
    clear(el);
    el.appendChild(title('Join Cloud 9 Vapes / The Hemp and Kratom Depot'));
    el.appendChild(p('Apply in minutes, then track your application status by logging in.'));
    const actions = h('div', {class:'flex gap-4 mb-6'}, [
      h('a', {href:'#/apply', class:'btn btn-primary'}, 'Apply Now'),
      h('a', {href:'#/login', class:'btn btn-outline'}, 'My Dashboard')
    ]);
    el.appendChild(actions);

    const wrapper = card([
      h('div', {class:'flex items-center justify-between mb-2'}, [
        h('h3', {class:'font-semibold'}, 'Current Locations'),
        h('a', {href:'#/locations', class:'text-brand-700 underline'}, 'View all')
      ]),
      h('div', {id:'home_locs'}, 'Loading...')
    ]);
    el.appendChild(wrapper);

    try{
      const sb = await getClient();
      const { data, error } = await sb.from('locations').select('*').order('store_name');
      const list = wrapper.querySelector('#home_locs');
      if (error) { list.textContent = error.message; return; }
      clear(list);
      data.forEach(loc => {
        const logo = brandLogo(loc.brand);
        list.appendChild(card(
          h('div', {class:'flex items-start gap-3'}, [
            h('img', {src:logo, alt:'brand', class:'w-10 h-10 rounded-full object-cover mt-1'}),
            h('div', {}, [
              h('div', {class:'font-medium'}, loc.store_name||'Store'),
              h('div', {class:'text-sm text-slate-600'}, loc.address||''),
              loc.hours ? h('div', {class:'text-sm text-slate-600'}, loc.hours) : null
            ])
          ])
        ));
      });
    }catch(e){
      console.error(e);
    }
  }

  // LOCATIONS
  async function viewLocations(el){
    clear(el);
    el.appendChild(title('Store Locations'));
    const list = h('div', {class:'mt-4'}, 'Loading...');
    el.appendChild(list);
    try{
      const sb = await getClient();
      const { data, error } = await sb.from('locations').select('*').order('store_name');
      if (error) { list.textContent = error.message; return; }
      clear(list);
      data.forEach(loc => {
        const logo = brandLogo(loc.brand);
        list.appendChild(card(
          h('div', {class:'flex items-start gap-3'}, [
            h('img', {src:logo, alt:'brand', class:'w-10 h-10 rounded-full object-cover mt-1'}),
            h('div', {}, [
              h('div', {class:'font-medium'}, loc.store_name||'Store'),
              h('div', {class:'text-sm text-slate-600'}, loc.address||''),
              loc.hours ? h('div', {class:'text-sm text-slate-600'}, loc.hours) : null
            ])
          ])
        ));
      });
    }catch(e){ list.textContent = e.message||String(e); }
  }

  // APPLY
  async function viewApply(el){
    clear(el);
    el.appendChild(title('Apply'));
    el.appendChild(p('Enter your information and submit your application.'));
    const form = h('form', {class:'space-y-3 mt-4'}, [
      h('input', {class:'input', name:'full_name', placeholder:'Full name', required:true}),
      h('input', {class:'input', type:'email', name:'email', placeholder:'Email', required:true}),
      h('input', {class:'input', name:'phone', placeholder:'Phone', required:true}),
      h('input', {class:'input', name:'position', placeholder:'Position', required:true}),
      h('button', {class:'btn btn-primary', type:'submit'}, 'Submit application')
    ]);
    el.appendChild(form);
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      try{
        const sb = await getClient();
        const { data: userData } = await sb.auth.getUser();
        const payload = {
          user_id: userData && userData.user ? userData.user.id : null,
          full_name: form.full_name.value,
          email: form.email.value,
          phone: form.phone.value,
          position: form.position.value
        };
        const { error } = await sb.from('applications').insert(payload);
        if (error) throw error;
        showToast('Application submitted!', 'success');
        route('/#/dashboard');
      }catch(err){ showToast(err.message||String(err), 'error'); }
    });
  }

  // LOGIN
  async function viewLogin(el){
    clear(el);
    el.appendChild(title('Login'));
    const form = h('form', {class:'space-y-3 mt-4'}, [
      h('input', {class:'input', type:'email', name:'email', placeholder:'Email', required:true}),
      h('input', {class:'input', type:'password', name:'password', placeholder:'Password', required:true}),
      h('button', {class:'btn btn-primary', type:'submit'}, 'Login')
    ]);
    el.appendChild(form);
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      try{
        const sb = await getClient();
        const { error } = await sb.auth.signInWithPassword({ email: form.email.value, password: form.password.value });
        if (error) throw error;
        route('/#/dashboard');
      }catch(err){ showToast(err.message||String(err), 'error'); }
    });
  }

  // DASHBOARD (simple placeholder)
  async function viewDashboard(el){
    clear(el);
    el.appendChild(title('My Applications'));
    el.appendChild(p('Your submitted applications will appear here once you submit.'));
  }

  // ADMIN (simple placeholder)
  async function viewAdmin(el){
    clear(el);
    el.appendChild(title('Admin'));
    el.appendChild(p('Admin panel will load here after authentication.'));
  }

  // expose on window
  window.viewHome = viewHome;
  window.viewLocations = viewLocations;
  window.viewApply = viewApply;
  window.viewLogin = viewLogin;
  window.viewDashboard = viewDashboard;
  window.viewAdmin = viewAdmin;
  console.log('[views] functions installed');
})();
