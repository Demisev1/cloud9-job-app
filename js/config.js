// --- Supabase Client Config ---
// Fill these in with your Supabase project's URL and anon key.
export const SUPABASE_URL = localStorage.getItem("SUPABASE_URL") || "https://YOUR-PROJECT.supabase.co";
export const SUPABASE_ANON = localStorage.getItem("SUPABASE_ANON") || "YOUR-ANON-KEY";
// Tip: you can set them quickly from the browser console:
// localStorage.setItem("SUPABASE_URL", "https://xxx.supabase.co");
// localStorage.setItem("SUPABASE_ANON", "ey....");