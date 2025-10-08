/* supa.js (idempotent) */
(function(){
  if (window.supabaseClient) { console.log('[supa] reuse existing client'); return; }
  if (!window.APP_CONFIG) { console.error('[supa] Missing APP_CONFIG'); return; }
  if (!window.supabase || !window.supabase.createClient) { console.error('[supa] supabase lib missing'); return; }
  window.supabaseClient = window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);
  console.log('[supa] createClient OK');
})();
