import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://facqdjyrssrrnrmirfdk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WQwVjkjYNVTcgidORbd0pQ_F8VIc5eZ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
