// Frontend Supabase Client Configuration
// This uses the anon key which is safe to expose in frontend

const SUPABASE_URL = 'https://femdtxdwjopbixjtwpsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbWR0eGR3am9wYml4anR3cHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODAxNzYsImV4cCI6MjA4NTQ1NjE3Nn0.yRDoRxWV_9v5e59rdfEDe0V0k7rzsB_uqjXa57dts54';

// Check if Supabase library loaded
const supabaseLib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
if (!supabaseLib || !supabaseLib.createClient) {
    console.error('Supabase library not loaded! Check your internet connection or browser settings.');
    alert('Error: Supabase library could not be loaded. Please disable tracking prevention in your browser settings or try a different browser (Chrome/Firefox).');
}

// Create Supabase client for frontend
let supabase;
try {
    supabase = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
} catch (error) {
    console.error('Failed to create Supabase client:', error);
    alert('Failed to initialize Supabase. Please check browser console for details.');
}
