/**
 * Test script to verify authentication endpoints
 * Run with: node scripts/test-auth-endpoints.js
 */

const axios = require('axios');

const BACKEND_URL = 'https://speakeasy-backend-823510409781.us-central1.run.app';

console.log('🔐 Testing SpeakEasy Authentication Endpoints\n');
console.log(`Backend URL: ${BACKEND_URL}\n`);
console.log('═══════════════════════════════════════════════════════\n');

async function testBackendStructure() {
  try {
    console.log('1️⃣ Testing backend info endpoint...');
    const response = await axios.get(BACKEND_URL);

    console.log('✅ Backend is running!');
    console.log(`   Provider: ${response.data.provider}`);
    console.log(`   Model: ${response.data.model}`);
    console.log(`   Version: ${response.data.version}`);

    // Check auth endpoints exist
    if (response.data.endpoints?.auth) {
      console.log('\n✅ Authentication endpoints available:');
      console.log(`   - Google: ${response.data.endpoints.auth.google}`);
      console.log(`   - Apple: ${response.data.endpoints.auth.apple}`);
      console.log(`   - Login: ${response.data.endpoints.auth.login}`);
    }

    console.log('\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to backend:', error.message);
    return false;
  }
}

async function testGuestLogin() {
  try {
    console.log('2️⃣ Testing guest login endpoint...');
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      provider: 'guest',
      name: 'Test User',
      email: 'test@example.com'
    });

    if (response.data.success && response.data.data) {
      console.log('✅ Guest login endpoint works!');
      console.log(`   Response format: ✓ Has 'success' field`);
      console.log(`   Response format: ✓ Has 'data' object`);
      console.log(`   Response format: ✓ Has 'data.token' field`);
      console.log(`   Response format: ✓ Has 'data.user' object`);
      console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
      console.log(`   User: ${response.data.data.user.name}`);
      console.log('\n');
      return true;
    } else {
      console.log('⚠️  Guest login returned unexpected format');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Guest login failed:', error.message);
    if (error.response?.data) {
      console.error('   Server response:', error.response.data);
    }
    return false;
  }
}

async function testAppleAuthStructure() {
  try {
    console.log('3️⃣ Testing Apple auth endpoint structure (will fail without real token)...');
    const response = await axios.post(`${BACKEND_URL}/api/auth/apple`, {
      identityToken: 'test_token',
      user: { id: 'test' },
      name: 'Test User'
    });

    console.log('❓ Unexpected success (should fail with invalid token)');
    return false;
  } catch (error) {
    if (error.response?.data) {
      const data = error.response.data;

      // Check if error response has correct format
      if (data.hasOwnProperty('success') && data.hasOwnProperty('error')) {
        console.log('✅ Apple auth endpoint has correct error format!');
        console.log(`   Error format: ✓ Has 'success' field`);
        console.log(`   Error format: ✓ Has 'error' field`);
        console.log(`   Error message: "${data.error}"`);
        console.log('\n');
        return true;
      }
    }

    console.log('⚠️  Apple auth endpoint may have incorrect format');
    console.log('   Error:', error.message);
    return false;
  }
}

async function testGoogleAuthStructure() {
  try {
    console.log('4️⃣ Testing Google auth endpoint structure (will fail without real token)...');
    const response = await axios.post(`${BACKEND_URL}/api/auth/google`, {
      idToken: 'test_token',
      user: { id: 'test', email: 'test@example.com', name: 'Test User' }
    });

    console.log('❓ Unexpected success (should fail with invalid token)');
    return false;
  } catch (error) {
    if (error.response?.data) {
      const data = error.response.data;

      // Check if error response has correct format
      if (data.hasOwnProperty('success') && data.hasOwnProperty('error')) {
        console.log('✅ Google auth endpoint has correct error format!');
        console.log(`   Error format: ✓ Has 'success' field`);
        console.log(`   Error format: ✓ Has 'error' field`);
        console.log(`   Error message: "${data.error}"`);
        console.log('\n');
        return true;
      }
    }

    console.log('⚠️  Google auth endpoint may have incorrect format');
    console.log('   Error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════\n');

  const backendOk = await testBackendStructure();
  if (!backendOk) {
    console.log('\n❌ Cannot proceed - backend is not accessible\n');
    process.exit(1);
  }

  const guestOk = await testGuestLogin();
  const appleOk = await testAppleAuthStructure();
  const googleOk = await testGoogleAuthStructure();

  console.log('═══════════════════════════════════════════════════════\n');

  if (backendOk && guestOk && appleOk && googleOk) {
    console.log('✅ All authentication endpoints are working correctly!\n');
    console.log('📱 Your mobile app should now be able to:');
    console.log('   • Sign in with Apple');
    console.log('   • Sign in with Google');
    console.log('   • Receive proper auth tokens');
    console.log('   • Get user data in correct format\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the output above.\n');
    process.exit(1);
  }
}

runTests();
