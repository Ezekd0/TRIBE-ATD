import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = 'https://wrdraptvwohzccyklrxc.supabase.co';
const supabaseKey = 'sb_publishable_5dUSF8z8sy3Xj8TcXi40ww_cb1a3w_7';

// Pass ws to avoid WebSocket constructors error in Node.js
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function test() {
  console.log('Running native signup test...');
  const { data, error } = await supabase.auth.signUp({
    email: 'frankjoe' + Date.now() + '@gmail.com',
    password: 'password123',
    options: {
      data: {
        full_name: 'Frank Joe Test',
        phone_number: '1234567890',
        gender: 'Male',
        address: '123 Test Street',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '0987654321'
      }
    }
  });

  if (error) {
    console.log('--- ERROR FOUND ---');
    console.log('Error Object:', error);
    console.log('Error Message:', error.message);
    console.log('Error Status:', error.status);
    console.log('Error Keys:', Object.keys(error));
  } else {
    console.log('--- SUCCESS ---');
    console.log('User Data:', data.user);
  }
}

test();
