import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wrdraptvwohzccyklrxc.supabase.co';
const supabaseKey = 'sb_publishable_5dUSF8z8sy3Xj8TcXi40ww_cb1a3w_7';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  console.log('Testing Supabase Signup...');
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    options: {
      data: {
        full_name: 'Test User',
        phone_number: '1234567890',
        gender: 'Male',
        address: '123 Test St',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '0987654321',
      }
    }
  });

  if (error) {
    console.error('Signup Error:', error);
    console.log('Error Message:', error.message);
    console.log('Error stringified:', JSON.stringify(error));
  } else {
    console.log('Signup Success:', data);
  }
}

testSignup();
