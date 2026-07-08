import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://wrdraptvwohzccyklrxc.supabase.co';
const supabaseKey = 'sb_publishable_5dUSF8z8sy3Xj8TcXi40ww_cb1a3w_7';
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: ws
  }
});

async function checkUsers() {
  console.log('Querying public.users...');
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Users count:', data?.length);
    console.log('Users list:', JSON.stringify(data, null, 2));
  }
}

checkUsers();
