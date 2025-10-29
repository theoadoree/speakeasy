#!/usr/bin/env node

/**
 * Quick test script for LLM setup
 * Tests both Qwen2.5-72B and Llama 3.1-8B models
 */

const axios = require('axios');

const OLLAMA_BASE_URL = 'http://localhost:11434';

async function testModel(modelName) {
  console.log(`\n🧪 Testing ${modelName}...`);

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: modelName,
      prompt: 'Say hello in 5 words or less.',
      stream: false,
    }, {
      timeout: 30000,
    });

    if (response.data && response.data.response) {
      console.log(`✅ ${modelName}: ${response.data.response.trim()}`);
      return true;
    } else {
      console.log(`❌ ${modelName}: No response received`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`❌ ${modelName}: Ollama server not running`);
    } else if (error.response && error.response.status === 404) {
      console.log(`❌ ${modelName}: Model not found (still downloading?)`);
    } else {
      console.log(`❌ ${modelName}: ${error.message}`);
    }
    return false;
  }
}

async function listModels() {
  console.log('\n📋 Available models:');

  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);

    if (response.data && response.data.models) {
      response.data.models.forEach(model => {
        const size = (model.size / 1024 / 1024 / 1024).toFixed(2);
        console.log(`  - ${model.name} (${size} GB)`);
      });
      return true;
    } else {
      console.log('  No models found');
      return false;
    }
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 SpeakEasy LLM Test\n');
  console.log('Testing Ollama server at:', OLLAMA_BASE_URL);

  // List available models
  await listModels();

  // Test Qwen2.5-72B
  const qwenOk = await testModel('qwen2.5:72b');

  // Test Llama 3.1-8B
  const llamaOk = await testModel('llama3.1:8b');

  console.log('\n' + '='.repeat(50));
  if (qwenOk && llamaOk) {
    console.log('✅ All models are ready!');
    console.log('\n🎉 You can now start the app: npm start');
  } else {
    console.log('⚠️  Some models are not ready yet');
    console.log('\nWait for models to finish downloading, then run:');
    console.log('  node test-llm.js');
  }
  console.log('='.repeat(50) + '\n');
}

main().catch(console.error);
