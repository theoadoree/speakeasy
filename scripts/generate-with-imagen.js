#!/usr/bin/env node

/**
 * Generate Immersion Scenario Images using Google Imagen 3
 *
 * Setup:
 * 1. Get API key: https://aistudio.google.com/apikey
 * 2. Set environment variable: export GEMINI_API_KEY="your-key"
 * 3. Run: node scripts/generate-with-imagen.js
 *
 * Note: Imagen 3 is available through Google AI Studio
 */

const fs = require('fs').promises;
const path = require('path');

const API_KEY = process.env.GEMINI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'immersion-scenarios');

// Priority scenarios to generate first (Top 10)
const PRIORITY_SCENARIOS = [
  {
    id: 'coffee-shop',
    category: 'daily-life',
    name: 'Coffee Shop Order',
    prompt: 'Create a cozy coffee shop scene with a barista-customer interaction. Show a smiling barista (diverse, apron, casual) behind the counter preparing coffee while a customer (morning casual wear) waits at the counter. Setting: Modern café with menu board, espresso machine, pastry display case, ceramic mugs hanging. Background: Warm wooden interior, plants, window with soft morning light. Color palette: Rich browns, cream, warm gold. Mood: Morning warmth, inviting, coffee culture. Art style: Flat illustration, cozy and welcoming. High quality, 1200x800 landscape orientation.'
  },
  {
    id: 'public-transport',
    category: 'daily-life',
    name: 'Public Transportation',
    prompt: 'Illustrate a modern metro/subway train interior with passenger interaction. Show a metro worker/conductor (diverse, transit uniform) helping a passenger (casual clothes, backpack) who is pointing at a metro map. Setting: Clean contemporary train car with blue seats, handrails, route display screen, windows showing tunnel/stations. Other passengers seated in background. Color palette: Transit blue, gray, white. Mood: Urban, helpful, practical commute. Art style: Clean flat illustration, modern transit aesthetic. High quality, 1200x800 landscape.'
  },
  {
    id: 'grocery-shopping',
    category: 'daily-life',
    name: 'Grocery Shopping',
    prompt: 'Create a supermarket shopping scene in the produce section. Show a grocery store employee (diverse, store uniform, name tag) helping a customer (with shopping cart, reusable bags) select fresh produce. Setting: Bright grocery aisle with organized displays of colorful fruits and vegetables, price tags, overhead fluorescent lighting. Color palette: Fresh greens, bright oranges and reds (produce), white shelving. Mood: Everyday shopping, helpful, practical. Art style: Colorful flat illustration, organized retail. High quality, 1200x800 landscape.'
  },
  {
    id: 'restaurant',
    category: 'daily-life',
    name: 'Restaurant Ordering',
    prompt: 'Illustrate a warm restaurant scene with a waiter and customer interaction. Show a smiling waiter (diverse, restaurant uniform) standing beside a table taking an order from a seated customer (casual attire) who is looking at a menu. Setting: Cozy restaurant interior with soft lighting, wine glasses, bread basket, table setting. Color palette: Warm ambers, terracotta, cream. Background: Blurred restaurant ambiance with other diners. Art style: Modern flat illustration, friendly and inviting. High quality, 1200x800 landscape.'
  },
  {
    id: 'pharmacy',
    category: 'daily-life',
    name: 'Pharmacy Visit',
    prompt: 'Illustrate a pharmacy counter consultation scene. Show a pharmacist (diverse, white coat, professional) behind the counter explaining medication to a customer (casual clothes) who is receiving a prescription bag. Setting: Clean pharmacy with organized medicine shelves in background, computer, pill bottles visible. Color palette: Clinical white, calming teal, light blue accents. Mood: Professional, trustworthy, healthcare focused. Art style: Clean flat illustration, medical retail. High quality, 1200x800 landscape.'
  },
  {
    id: 'job-interview',
    category: 'professional',
    name: 'Job Interview',
    prompt: 'Create a modern flat illustration of a job interview in progress. Show two people - an interviewer (mid-30s, professional attire) behind a desk and a candidate (diverse, business casual) sitting across from them. Setting: Contemporary office with minimal furniture, a laptop on desk, large window showing city skyline. Color palette: Navy blue, warm gray, white accents. Mood: Professional but welcoming. Art style: Clean lines, flat design, minimal shadows. High quality, 1200x800 landscape.'
  },
  {
    id: 'airport-checkin',
    category: 'travel',
    name: 'Airport Check-in',
    prompt: 'Illustrate an airport check-in counter scene. Show an airline agent (diverse, airline uniform) behind counter checking a traveler\'s (casual travel clothes, rolling suitcase) passport and printing boarding pass. Setting: Modern airport terminal with check-in counters, departure board in background, other travelers visible, luggage scale. Color palette: Aviation blue, white, international travel colors. Mood: Travel excitement, procedural, departure energy. Art style: Clean flat illustration, airport aesthetic. High quality, 1200x800 landscape.'
  },
  {
    id: 'doctor-visit',
    category: 'emergency',
    name: 'Doctor Visit',
    prompt: 'Illustrate a doctor\'s examination room with a medical consultation in progress. Show a friendly doctor (diverse, white coat, stethoscope) sitting on a stool talking to a patient (casual clothes) who sits on an examination table. Setting: Clean modern clinic room with medical chart on wall, simple examination table, small counter. Color palette: Calming teal, white, light gray. Mood: Professional but reassuring and warm. Art style: Flat illustration, clean and minimal. High quality, 1200x800 landscape.'
  },
  {
    id: 'hotel-checkin',
    category: 'travel',
    name: 'Hotel Check-in',
    prompt: 'Illustrate an upscale hotel check-in scene at the reception desk. Show a professional concierge (diverse, hotel uniform) behind an elegant marble desk handing a key card to a guest (business casual, rolling suitcase beside them). Setting: Sophisticated hotel lobby with chandelier, fresh flowers in vase, comfortable seating visible in background. Color palette: Burgundy, gold accents, cream marble. Mood: Welcoming, professional, hospitality excellence. Art style: Elegant flat illustration. High quality, 1200x800 landscape.'
  },
  {
    id: 'taxi-ride',
    category: 'travel',
    name: 'Taxi/Rideshare',
    prompt: 'Illustrate a taxi/rideshare ride from interior perspective. Show driver (diverse, casual) in front seat and passenger (casual travel clothes, phone in hand) in back seat having conversation, city view visible through windows. Setting: Car interior with dashboard, meter or phone mount with ride app, rearview mirror, urban streets outside windows. Color palette: Taxi yellow or neutral gray, city colors. Mood: Transit, urban conversation, destination-focused. Art style: Urban flat illustration, ride service aesthetic. High quality, 1200x800 landscape.'
  }
];

async function generateImages() {
  console.log('🎨 SpeakEasy Immersion Graphics Generator\n');
  console.log('━'.repeat(60));

  if (!API_KEY) {
    console.error('\n❌ Error: GEMINI_API_KEY not set\n');
    console.log('Setup Instructions:');
    console.log('1. Visit: https://aistudio.google.com/apikey');
    console.log('2. Create or copy your API key');
    console.log('3. Run: export GEMINI_API_KEY="your-api-key-here"\n');
    console.log('Or add to ~/.zshrc:');
    console.log('   echo \'export GEMINI_API_KEY="your-key"\' >> ~/.zshrc');
    console.log('   source ~/.zshrc\n');
    process.exit(1);
  }

  console.log('\n✅ API Key found!');
  console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

  // Create output directories
  const categories = ['daily-life', 'professional', 'travel', 'emergency', 'social', 'home-services', 'cultural'];

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    for (const category of categories) {
      await fs.mkdir(path.join(OUTPUT_DIR, category), { recursive: true });
    }
    console.log('✅ Created output directories\n');
  } catch (error) {
    console.error('❌ Error creating directories:', error.message);
    process.exit(1);
  }

  console.log('━'.repeat(60));
  console.log('\n📋 Image Generation Options:\n');
  console.log('Unfortunately, the Gemini API does not support image generation yet.');
  console.log('However, you have several excellent options:\n');

  console.log('🌟 RECOMMENDED: Google Imagen 3 (via AI Studio Web)');
  console.log('   → Visit: https://aistudio.google.com/');
  console.log('   → Click "Create new" → Select Imagen 3');
  console.log('   → Copy prompts from this script');
  console.log('   → Free tier available!\n');

  console.log('💡 Alternative: DALL-E 3 API (OpenAI)');
  console.log('   → Cost: $0.04 per 1024x1024 image');
  console.log('   → Script available: scripts/generate-with-dalle.js\n');

  console.log('━'.repeat(60));
  console.log('\n📝 Priority Scenarios (Generate These First):\n');

  // Save prompts to a file for easy copy-paste
  let promptsText = '# SpeakEasy Immersion Graphics - Priority Prompts\n\n';
  promptsText += 'Copy these prompts into Google AI Studio (Imagen 3) or your preferred image generator.\n\n';
  promptsText += '━'.repeat(80) + '\n\n';

  PRIORITY_SCENARIOS.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name} (${scenario.category})`);
    console.log(`   File: ${scenario.category}/${scenario.id}.png\n`);

    promptsText += `## ${index + 1}. ${scenario.name}\n`;
    promptsText += `**Category:** ${scenario.category}\n`;
    promptsText += `**Filename:** ${scenario.id}.png\n\n`;
    promptsText += `**Prompt:**\n${scenario.prompt}\n\n`;
    promptsText += '━'.repeat(80) + '\n\n';
  });

  // Save prompts file
  const promptsFile = path.join(__dirname, '..', 'PRIORITY_IMAGE_PROMPTS.txt');
  await fs.writeFile(promptsFile, promptsText);

  console.log('━'.repeat(60));
  console.log(`\n✅ Prompts saved to: PRIORITY_IMAGE_PROMPTS.txt`);
  console.log('\n🚀 Next Steps:\n');
  console.log('1. Open the prompts file: cat PRIORITY_IMAGE_PROMPTS.txt');
  console.log('2. Visit Google AI Studio: https://aistudio.google.com/');
  console.log('3. Select Imagen 3 model');
  console.log('4. Copy each prompt and generate images');
  console.log('5. Download and save to: assets/immersion-scenarios/[category]/');
  console.log('6. Run: npm run update-scenario-images (to update configs)\n');

  console.log('━'.repeat(60));
  console.log('\n💰 Cost Estimate (if using DALL-E 3 API):');
  console.log(`   10 images × $0.04 = $0.40 total\n`);
}

generateImages().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
