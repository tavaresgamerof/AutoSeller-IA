
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://upiwxunobfkmxysqswkq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ST-pq_Up102x23YYh5Lp3A_IVZBfsqG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
