
/** Initialize Supabase */
const { createClient } = window.supabase;
if (!window.APP_CONFIG) {
  alert("Missing config.js. Copy assets/js/config.example.js to assets/js/config.js and add your Supabase URL and ANON key.");
}
window.supabaseClient = createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);

/** Auth helpers */
async function getSession() {
  const { data } = await window.supabaseClient.auth.getSession();
  return data.session || null;
}
async function getUser() {
  const { data } = await window.supabaseClient.auth.getUser();
  return data.user || null;
}
function isAdminEmail(email) {
  return (window.APP_CONFIG.ADMIN_EMAILS || []).map(e => e.toLowerCase()).includes((email||"").toLowerCase());
}
