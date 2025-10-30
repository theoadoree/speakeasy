/**
 * Test script to verify backend API connection
 * Run with: node scripts/test-backend-connection.js
 */

const axios = require('axios');

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://speakeasy-backend-823510409781.us-central1.run.app';

console.log('🔍 Testing SpeakEasy Backend Connection...\n');
console.log(`Backend URL: ${BACKEND_URL}\n`);

async function testHealthCheck() {
  try {
    console.log('1️⃣ Testing health endpoint...');
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    console.log('✅ Health check passed!');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Provider: ${response.data.provider}`);
    console.log(`   Model: ${response.data.model}`);
    console.log(`   API Key Configured: ${response.data.apiKeyConfigured}`);
    console.log(`   Secrets Loaded: ${response.data.secretsLoaded}\n`);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testGenerate() {
  try {
    console.log('2️⃣ Testing generation endpoint...');
    const response = await axios.post(
      `${BACKEND_URL}/api/generate`,
      {
        prompt: 'Say "Hello from SpeakEasy!" in Spanish.',
        temperature: 0.7,
        maxTokens: 50
      },
      { timeout: 30000 }
    );
    console.log('✅ Generation test passed!');
    console.log(`   Response: ${response.data.response}`);
    console.log(`   Model: ${response.data.model}\n`);
    return true;
  } catch (error) {
    console.error('❌ Generation test failed:', error.message);
    return false;
  }
}

async function testPracticeMessage() {
  try {
    console.log('3️⃣ Testing practice conversation endpoint...');
    const response = await axios.post(
      `${BACKEND_URL}/api/practice/message`,
      {
        message: 'Hola, ¿cómo estás?',
        targetLanguage: 'Spanish',
        userLevel: 'beginner'
      },
      { timeout: 30000 }
    );
    console.log('✅ Practice conversation test passed!');
    console.log(`   Response: ${response.data.response}`);
    console.log(`   Model: ${response.data.model}\n`);
    return true;
  } catch (error) {
    console.error('❌ Practice conversation test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════\n');

  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Backend is not reachable. Tests aborted.\n');
    process.exit(1);
  }

  const generateOk = await testGenerate();
  const practiceOk = await testPracticeMessage();

  console.log('═══════════════════════════════════════════════════════\n');

  if (healthOk && generateOk && practiceOk) {
    console.log('✅ All tests passed! Backend is working correctly.\n');
    console.log('Your mobile app should now work without Ollama!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Check the errors above.\n');
    process.exit(1);
  }
}

runAllTests();
