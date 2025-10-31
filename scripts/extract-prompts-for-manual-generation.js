#!/usr/bin/env node

/**
 * Extract Image Prompts for Manual Generation
 *
 * This script extracts all prompts from IMMERSION_GRAPHICS_PROMPTS.md
 * and creates organized files for easy copy-paste into image generation tools.
 *
 * No API key required!
 */

const fs = require('fs').promises;
const path = require('path');

const PROMPTS_FILE = path.join(__dirname, '..', 'IMMERSION_GRAPHICS_PROMPTS.md');
const OUTPUT_DIR = path.join(__dirname, '..', 'image-prompts');

// Priority scenarios for Phase 1
const PRIORITY_SCENARIOS = [
  { num: 7, name: 'Coffee Shop Order', category: 'daily-life' },
  { num: 8, name: 'Public Transportation', category: 'daily-life' },
  { num: 9, name: 'Grocery Shopping', category: 'daily-life' },
  { num: 2, name: 'Ordering Food (Restaurant)', category: 'daily-life' },
  { num: 10, name: 'Pharmacy/Drugstore', category: 'daily-life' },
  { num: 1, name: 'Job Interview', category: 'professional' },
  { num: 40, name: 'Airport Check-in', category: 'travel' },
  { num: 4, name: 'Doctor Visit', category: 'emergency' },
  { num: 6, name: 'Hotel Check-in', category: 'travel' },
  { num: 42, name: 'Taxi/Rideshare', category: 'travel' },
];

async function extractPrompts() {
  console.log('🎨 SpeakEasy Image Prompt Extractor\n');
  console.log('━'.repeat(60));

  try {
    // Read the prompts markdown file
    const content = await fs.readFile(PROMPTS_FILE, 'utf-8');

    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    console.log('✅ Reading prompts from IMMERSION_GRAPHICS_PROMPTS.md\n');

    // Extract Gemini prompts (they're the detailed ones)
    const geminiPromptPattern = /\*\*Gemini Prompt:\*\*\n```\n([\s\S]*?)```/g;
    const scenarioTitlePattern = /###\s+\*\*(\d+)\.\s+([^*]+)\*\*/g;

    const prompts = [];
    const titles = [];

    // Extract all scenario titles
    let titleMatch;
    while ((titleMatch = scenarioTitlePattern.exec(content)) !== null) {
      titles.push({
        num: parseInt(titleMatch[1]),
        name: titleMatch[2].trim()
      });
    }

    // Extract all Gemini prompts
    let promptMatch;
    while ((promptMatch = geminiPromptPattern.exec(content)) !== null) {
      prompts.push(promptMatch[1].trim());
    }

    console.log(`📝 Found ${titles.length} scenarios`);
    console.log(`📝 Found ${prompts.length} Gemini prompts\n`);

    // Combine titles and prompts
    const scenarios = titles.map((title, index) => ({
      ...title,
      prompt: prompts[index] || 'No prompt found',
      id: title.name.toLowerCase().replace(/[\/\s]+/g, '-').replace(/[()]/g, '')
    }));

    // Create priority prompts file
    let priorityContent = '# SpeakEasy - Priority Immersion Graphics Prompts\n\n';
    priorityContent += '**Phase 1: Top 10 Scenarios to Generate First**\n\n';
    priorityContent += 'Copy these prompts into Google AI Studio (Imagen 3), DALL-E, or Midjourney.\n\n';
    priorityContent += '━'.repeat(80) + '\n\n';

    PRIORITY_SCENARIOS.forEach((priority, index) => {
      const scenario = scenarios.find(s => s.num === priority.num);
      if (scenario) {
        priorityContent += `## ${index + 1}. ${scenario.name}\n`;
        priorityContent += `**Scenario #${scenario.num}** | Category: ${priority.category}\n`;
        priorityContent += `**Save as:** \`assets/immersion-scenarios/${priority.category}/${scenario.id}.png\`\n\n`;
        priorityContent += '**Prompt for Gemini/DALL-E:**\n```\n';
        priorityContent += scenario.prompt;
        priorityContent += '\n```\n\n';
        priorityContent += '━'.repeat(80) + '\n\n';
      }
    });

    await fs.writeFile(
      path.join(OUTPUT_DIR, '01-PRIORITY-PROMPTS.md'),
      priorityContent
    );

    console.log('✅ Created: image-prompts/01-PRIORITY-PROMPTS.md');

    // Create category-based prompt files
    const categories = {
      'daily-life': scenarios.filter(s => s.num >= 7 && s.num <= 21),
      'professional': scenarios.filter(s => s.num >= 22 && s.num <= 29),
      'social': scenarios.filter(s => s.num >= 30 && s.num <= 39),
      'travel': scenarios.filter(s => s.num >= 40 && s.num <= 51),
      'emergency': scenarios.filter(s => s.num >= 52 && s.num <= 57),
      'home-services': scenarios.filter(s => s.num >= 58 && s.num <= 65),
      'cultural': scenarios.filter(s => s.num >= 66 && s.num <= 75)
    };

    let fileNum = 2;
    for (const [category, categoryScenarios] of Object.entries(categories)) {
      if (categoryScenarios.length === 0) continue;

      let categoryContent = `# ${category.toUpperCase().replace('-', ' ')} Scenarios\n\n`;
      categoryContent += `${categoryScenarios.length} prompts for ${category} immersion scenarios\n\n`;
      categoryContent += '━'.repeat(80) + '\n\n';

      categoryScenarios.forEach((scenario, index) => {
        categoryContent += `## ${index + 1}. ${scenario.name}\n`;
        categoryContent += `**Scenario #${scenario.num}**\n`;
        categoryContent += `**Save as:** \`assets/immersion-scenarios/${category}/${scenario.id}.png\`\n\n`;
        categoryContent += '**Prompt:**\n```\n';
        categoryContent += scenario.prompt;
        categoryContent += '\n```\n\n';
        categoryContent += '━'.repeat(80) + '\n\n';
      });

      const filename = `${fileNum.toString().padStart(2, '0')}-${category.toUpperCase()}.md`;
      await fs.writeFile(
        path.join(OUTPUT_DIR, filename),
        categoryContent
      );
      console.log(`✅ Created: image-prompts/${filename}`);
      fileNum++;
    }

    // Create a quick reference CSV for bulk generation
    let csvContent = 'Scenario #,Name,Category,ID,Filename\n';
    scenarios.forEach(scenario => {
      const cat = Object.keys(categories).find(c =>
        categories[c].some(s => s.num === scenario.num)
      ) || 'misc';
      csvContent += `${scenario.num},"${scenario.name}",${cat},${scenario.id},${scenario.id}.png\n`;
    });

    await fs.writeFile(
      path.join(OUTPUT_DIR, 'scenario-index.csv'),
      csvContent
    );
    console.log('✅ Created: image-prompts/scenario-index.csv');

    // Create README with instructions
    const readme = `# SpeakEasy Immersion Graphics Generation Guide

## 📁 Files in This Directory

- \`01-PRIORITY-PROMPTS.md\` - Start here! Top 10 scenarios for Phase 1
- \`02-DAILY-LIFE.md\` - Daily life scenarios (15 prompts)
- \`03-PROFESSIONAL.md\` - Professional scenarios (8 prompts)
- \`04-SOCIAL.md\` - Social scenarios (10 prompts)
- \`05-TRAVEL.md\` - Travel scenarios (12 prompts)
- \`06-EMERGENCY.md\` - Emergency scenarios (6 prompts)
- \`07-HOME-SERVICES.md\` - Home & services scenarios (8 prompts)
- \`08-CULTURAL.md\` - Cultural scenarios (10 prompts)
- \`scenario-index.csv\` - Complete scenario index for tracking

## 🚀 Quick Start

### Step 1: Choose Your Tool

**🌟 Recommended: Google AI Studio (Imagen 3)**
- Free tier available
- Best for flat illustrations
- Visit: https://aistudio.google.com/

**Alternative Options:**
- DALL-E 3: https://platform.openai.com/playground ($0.04/image)
- Midjourney: https://midjourney.com ($10/month)
- Stable Diffusion: https://stablediffusionweb.com (free)

### Step 2: Generate Images

1. Open \`01-PRIORITY-PROMPTS.md\`
2. Copy the first prompt
3. Paste into your chosen image generator
4. Generate and download the image
5. Save as: \`assets/immersion-scenarios/[category]/[id].png\`
6. Repeat for all 10 priority scenarios

### Step 3: Organize Files

Create this folder structure:
\`\`\`
speakeasy/assets/immersion-scenarios/
├── daily-life/
│   ├── coffee-shop-order.png
│   ├── public-transportation.png
│   └── ...
├── professional/
│   ├── job-interview.png
│   └── ...
├── social/
├── travel/
├── emergency/
├── home-services/
└── cultural/
\`\`\`

### Step 4: Update Scenario Configs

After generating images, run:
\`\`\`bash
npm run update-scenario-images
\`\`\`

This will update your app's scenario configurations with the image paths.

## 💰 Cost Estimates

- **DALL-E 3**: 10 images × $0.04 = $0.40
- **Midjourney**: $10/month (unlimited)
- **Imagen 3**: Free tier available
- **Stable Diffusion**: Free (local) or $0.002/image

## 📊 Progress Tracking

Use \`scenario-index.csv\` to track which images have been generated.

## 🎨 Image Specifications

- **Format**: PNG (preferred) or JPG
- **Size**: 1200x800px (landscape)
- **Style**: Flat illustration, modern, minimal
- **Color**: Vibrant but not oversaturated
- **Characters**: Diverse, simple, friendly

## ⚡ Batch Generation Tips

1. **Start with Priority**: Generate the 10 priority scenarios first
2. **Test Quality**: Ensure style consistency before bulk generation
3. **Use Templates**: Some tools let you save prompt templates
4. **Batch Download**: Generate multiple, then download all at once
5. **Name Consistently**: Use the exact filenames from the prompts

## 🆘 Need Help?

- Check main documentation: \`IMMERSION_GRAPHICS_PROMPTS.md\`
- View generated examples: \`assets/immersion-scenarios/examples/\`
- Contact: your-email@example.com

---

**Total Scenarios: 75**
**Estimated Time: 2-4 hours** (depending on tool and method)
**Phase 1 Priority: 10 scenarios**
`;

    await fs.writeFile(
      path.join(OUTPUT_DIR, 'README.md'),
      readme
    );
    console.log('✅ Created: image-prompts/README.md');

    console.log('\n━'.repeat(60));
    console.log('\n✅ Success! All prompt files created\n');
    console.log('📂 Location: image-prompts/\n');
    console.log('🚀 Next Steps:\n');
    console.log('1. Read: image-prompts/README.md');
    console.log('2. Start with: image-prompts/01-PRIORITY-PROMPTS.md');
    console.log('3. Visit: https://aistudio.google.com/');
    console.log('4. Generate and download images');
    console.log('5. Save to: assets/immersion-scenarios/[category]/\n');
    console.log('━'.repeat(60));
    console.log('\n💡 Tip: Generate the 10 priority scenarios first to test quality!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

extractPrompts();
