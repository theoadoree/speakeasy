# SpeakEasy Immersion Graphics Generation Guide

## 📁 Files in This Directory

- `01-PRIORITY-PROMPTS.md` - Start here! Top 10 scenarios for Phase 1
- `02-DAILY-LIFE.md` - Daily life scenarios (15 prompts)
- `03-PROFESSIONAL.md` - Professional scenarios (8 prompts)
- `04-SOCIAL.md` - Social scenarios (10 prompts)
- `05-TRAVEL.md` - Travel scenarios (12 prompts)
- `06-EMERGENCY.md` - Emergency scenarios (6 prompts)
- `07-HOME-SERVICES.md` - Home & services scenarios (8 prompts)
- `08-CULTURAL.md` - Cultural scenarios (10 prompts)
- `scenario-index.csv` - Complete scenario index for tracking

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

1. Open `01-PRIORITY-PROMPTS.md`
2. Copy the first prompt
3. Paste into your chosen image generator
4. Generate and download the image
5. Save as: `assets/immersion-scenarios/[category]/[id].png`
6. Repeat for all 10 priority scenarios

### Step 3: Organize Files

Create this folder structure:
```
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
```

### Step 4: Update Scenario Configs

After generating images, run:
```bash
npm run update-scenario-images
```

This will update your app's scenario configurations with the image paths.

## 💰 Cost Estimates

- **DALL-E 3**: 10 images × $0.04 = $0.40
- **Midjourney**: $10/month (unlimited)
- **Imagen 3**: Free tier available
- **Stable Diffusion**: Free (local) or $0.002/image

## 📊 Progress Tracking

Use `scenario-index.csv` to track which images have been generated.

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

- Check main documentation: `IMMERSION_GRAPHICS_PROMPTS.md`
- View generated examples: `assets/immersion-scenarios/examples/`
- Contact: your-email@example.com

---

**Total Scenarios: 75**
**Estimated Time: 2-4 hours** (depending on tool and method)
**Phase 1 Priority: 10 scenarios**
