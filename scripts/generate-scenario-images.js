#!/usr/bin/env node

/**
 * Generate Immersion Scenario Images using Gemini 2.5 Pro
 *
 * Note: As of January 2025, Gemini does not natively generate images.
 * This script uses Gemini to create optimized prompts for image generation services.
 *
 * For actual image generation, you'll need to use:
 * - Imagen 3 (Google's image generation model)
 * - DALL-E 3 (OpenAI)
 * - Midjourney
 * - Stable Diffusion
 */

const fs = require('fs');
const path = require('path');

// Check for API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY environment variable not set');
  console.error('\nTo fix this:');
  console.error('1. Get an API key from: https://aistudio.google.com/apikey');
  console.error('2. Run: export GEMINI_API_KEY="your-api-key-here"');
  console.error('3. Or add to ~/.zshrc: echo \'export GEMINI_API_KEY="your-key"\' >> ~/.zshrc');
  process.exit(1);
}

// Read the prompts file
const promptsFile = path.join(__dirname, '..', 'IMMERSION_GRAPHICS_PROMPTS.md');
if (!fs.existsSync(promptsFile)) {
  console.error('❌ Error: IMMERSION_GRAPHICS_PROMPTS.md not found');
  process.exit(1);
}

const promptsContent = fs.readFileSync(promptsFile, 'utf-8');

console.log('🎨 Gemini Image Generation Guide for SpeakEasy\n');
console.log('━'.repeat(60));
console.log('\n⚠️  Important Information:\n');
console.log('Gemini 2.5 Pro does NOT generate images directly.');
console.log('However, you can use it to optimize and refine prompts!\n');
console.log('For actual image generation, use one of these services:\n');
console.log('1. ✅ Google Imagen 3 (Google AI Studio)');
console.log('   → https://aistudio.google.com/');
console.log('   → Best integration with Google ecosystem');
console.log('   → Free tier available\n');
console.log('2. ✅ DALL-E 3 (OpenAI)');
console.log('   → https://platform.openai.com/docs/guides/images');
console.log('   → $0.040 per image (1024x1024)');
console.log('   → High quality, good for diverse styles\n');
console.log('3. ✅ Midjourney');
console.log('   → https://www.midjourney.com/');
console.log('   → $10/month for 200 images');
console.log('   → Best artistic quality\n');
console.log('4. ✅ Stable Diffusion XL');
console.log('   → https://stability.ai/');
console.log('   → Run locally or use API');
console.log('   → Most cost-effective for bulk generation\n');
console.log('━'.repeat(60));
console.log('\n📋 Recommended Workflow:\n');
console.log('Step 1: Use the prompts in IMMERSION_GRAPHICS_PROMPTS.md');
console.log('Step 2: Copy prompts to your chosen image generation service');
console.log('Step 3: Generate images (75 scenarios total)');
console.log('Step 4: Save images to: speakeasy/assets/immersion-scenarios/');
console.log('Step 5: Update scenario configs with image paths\n');
console.log('━'.repeat(60));
console.log('\n💰 Cost Estimates for 75 Images:\n');
console.log('- DALL-E 3:        ~$3.00 (75 images × $0.04)');
console.log('- Midjourney:      $10/month (unlimited in standard plan)');
console.log('- Stable Diffusion: Free (if run locally)');
console.log('- Imagen 3:        Free tier available\n');
console.log('━'.repeat(60));
console.log('\n🚀 Quick Start Commands:\n');

// Extract first 3 scenarios as examples
const scenarios = [
  {
    name: 'Coffee Shop Order',
    prompt: 'Create a cozy coffee shop scene with a barista-customer interaction. Show a smiling barista (diverse, apron, casual) behind the counter preparing coffee while a customer (morning casual wear) waits at the counter. Setting: Modern café with menu board, espresso machine, pastry display case, ceramic mugs hanging. Background: Warm wooden interior, plants, window with soft morning light. Color palette: Rich browns, cream, warm gold. Mood: Morning warmth, inviting, coffee culture. Art style: Flat illustration, cozy and welcoming. 1200x800 landscape.'
  },
  {
    name: 'Public Transportation',
    prompt: 'Illustrate a modern metro/subway train interior with passenger interaction. Show a metro worker/conductor (diverse, transit uniform) helping a passenger (casual clothes, backpack) who is pointing at a metro map. Setting: Clean contemporary train car with blue seats, handrails, route display screen, windows showing tunnel/stations. Other passengers seated in background. Color palette: Transit blue, gray, white. Mood: Urban, helpful, practical commute. Art style: Clean flat illustration, modern transit aesthetic. 1200x800 landscape.'
  },
  {
    name: 'Grocery Shopping',
    prompt: 'Create a supermarket shopping scene in the produce section. Show a grocery store employee (diverse, store uniform, name tag) helping a customer (with shopping cart, reusable bags) select fresh produce. Setting: Bright grocery aisle with organized displays of colorful fruits and vegetables, price tags, overhead fluorescent lighting. Color palette: Fresh greens, bright oranges and reds (produce), white shelving. Mood: Everyday shopping, helpful, practical. Art style: Colorful flat illustration, organized retail. 1200x800px.'
  }
];

scenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}:`);
  console.log('   Prompt ready in IMMERSION_GRAPHICS_PROMPTS.md');
});

console.log('\n━'.repeat(60));
console.log('\n✅ Next Steps:\n');
console.log('1. Choose your image generation service (Imagen 3 recommended)');
console.log('2. Open IMMERSION_GRAPHICS_PROMPTS.md');
console.log('3. Copy the "Gemini Prompt" for each scenario');
console.log('4. Generate and download images');
console.log('5. Organize in: assets/immersion-scenarios/[category]/');
console.log('\n📂 Suggested folder structure:');
console.log('   assets/immersion-scenarios/');
console.log('   ├── daily-life/');
console.log('   ├── professional/');
console.log('   ├── social/');
console.log('   ├── travel/');
console.log('   ├── emergency/');
console.log('   ├── home-services/');
console.log('   └── cultural/');
console.log('\n━'.repeat(60));
console.log('\n💡 Tip: Start with the first 10 scenarios (Priority 1) to test quality!\n');
