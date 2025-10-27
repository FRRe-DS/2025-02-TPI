// archivo: config/supabaseClient.js (o dbConfig.js)

import { createClient } from '@supabase/supabase-js'; // <-- ES Module

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; // <-- ES Module