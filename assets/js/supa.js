/* supa.js */
(function(){
  // Prefer explicit config on page; otherwise reuse existing.
  if (!window.APP_CONFIG || !window.APP_CONFIG.SUPABASE_URL) {
    console.error('[supa] Missing APP_CONFIG'); return;
  }
  if (!window.APP_CONFIG.SUPABASE_ANON_KEY || window.APP_CONFIG.SUPABASE_ANON_KEY.includes('{{')) {
    // If config.js exists from previous build, read its globals
    if (window.APP_CONFIG_FROM_FILE && window.APP_CONFIG_FROM_FILE.SUPABASE_ANON_KEY) {
      window.APP_CONFIG.SUPABASE_ANON_KEY = window.APP_CONFIG_FROM_FILE.SUPABASE_ANON_KEY;
    } else {
      console.warn('[supa] anon key not set in inline config; expecting config.js to set APP_CONFIG_FROM_FILE');
    }
  }
  if (window.supabaseClient) { console.log('[supa] reuse existing client'); return; }
  window.supabaseClient = window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);
  console.log('[supa] createClient OK');
})();