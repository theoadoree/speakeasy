# 🎨 SpeakEasy Immersion Graphics Generation Guide

## 📋 What You Have

I've created a complete system for generating 75 unique immersion scenario graphics for SpeakEasy:

### ✅ Files Created:

1. **`IMMERSION_GRAPHICS_PROMPTS.md`** - Master document with all 75 prompts
2. **`image-prompts/`** directory with organized prompt files:
   - `01-PRIORITY-PROMPTS.md` - Start here! Top 10 scenarios
   - `02-DAILY-LIFE.md` - 15 daily life scenarios
   - `03-PROFESSIONAL.md` - 8 professional scenarios
   - `04-SOCIAL.md` - 10 social scenarios
   - `05-TRAVEL.md` - 12 travel scenarios
   - `06-EMERGENCY.md` - 6 emergency scenarios
   - `07-HOME-SERVICES.md` - 8 home & services scenarios
   - `08-CULTURAL.md` - 10 cultural scenarios
   - `scenario-index.csv` - Tracking spreadsheet
   - `README.md` - Detailed instructions

3. **Scripts:**
   - `scripts/generate-with-imagen.js` - Imagen API helper
   - `scripts/extract-prompts-for-manual-generation.js` - Prompt extractor
   - `scripts/generate-scenario-images.js` - General guide

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get Your API Key (Optional)

If you want to use the automated scripts:

```bash
# Visit Google AI Studio
open https://aistudio.google.com/apikey

# Copy your API key and set it:
export GEMINI_API_KEY="your-api-key-here"

# Or add to ~/.zshrc for persistence:
echo 'export GEMINI_API_KEY="your-key"' >> ~/.zshrc
source ~/.zshrc
```

### Step 2: View the Priority Prompts

```bash
# View the top 10 priority prompts
npm run view:prompts

# Or open the file directly
open image-prompts/01-PRIORITY-PROMPTS.md
```

### Step 3: Generate Images

You have two options:

#### Option A: Manual Generation (No API key needed) ⭐ RECOMMENDED

1. Open: https://aistudio.google.com/
2. Select "Imagen 3" model
3. Copy prompts from `image-prompts/01-PRIORITY-PROMPTS.md`
4. Paste and generate one by one
5. Download images
6. Save to: `assets/immersion-scenarios/[category]/[filename].png`

#### Option B: Use Scripts (Requires API key)

```bash
# Run the image generation helper
npm run generate:images

# Re-extract prompts if needed
npm run generate:prompts
```

---

## 📊 Scenarios Overview

### Phase 1: Priority Scenarios (Generate First) 🌟

| # | Scenario | Category | Filename |
|---|----------|----------|----------|
| 1 | Coffee Shop Order | daily-life | coffee-shop-order.png |
| 2 | Public Transportation | daily-life | public-transportation.png |
| 3 | Grocery Shopping | daily-life | grocery-shopping.png |
| 4 | Restaurant Ordering | daily-life | restaurant-ordering.png |
| 5 | Pharmacy Visit | daily-life | pharmacy-visit.png |
| 6 | Job Interview | professional | job-interview.png |
| 7 | Airport Check-in | travel | airport-checkin.png |
| 8 | Doctor Visit | emergency | doctor-visit.png |
| 9 | Hotel Check-in | travel | hotel-checkin.png |
| 10 | Taxi/Rideshare | travel | taxi-rideshare.png |

### All 75 Scenarios by Category

- **Daily Life:** 15 scenarios (Coffee shop, transit, grocery, etc.)
- **Professional:** 8 scenarios (Interview, meeting, networking, etc.)
- **Social:** 10 scenarios (Parties, dates, events, etc.)
- **Travel:** 12 scenarios (Airport, hotel, taxi, museum, etc.)
- **Emergency:** 6 scenarios (Doctor, police, ER, dentist, etc.)
- **Home & Services:** 8 scenarios (Plumber, moving, internet setup, etc.)
- **Cultural:** 10 scenarios (Festival, religious service, cooking class, etc.)

**Total: 75 unique scenarios**

---

## 🎨 Image Generation Services

### 🌟 Recommended: Google Imagen 3 (via AI Studio)

**Pros:**
- Free tier available
- Excellent for flat illustrations
- Best integration with Google ecosystem
- High quality, consistent style

**How to use:**
1. Visit: https://aistudio.google.com/
2. Click "Create new" → "Imagen 3"
3. Copy prompt from `image-prompts/01-PRIORITY-PROMPTS.md`
4. Click "Generate"
5. Download and save with exact filename

---

### Alternative: DALL-E 3 (OpenAI)

**Pros:**
- High quality
- Good style consistency
- Fast generation

**Cons:**
- $0.04 per 1024x1024 image
- Requires OpenAI API key

**Cost for 75 images:** $3.00

**How to use:**
1. Visit: https://platform.openai.com/playground
2. Select DALL-E 3
3. Copy prompts
4. Generate (use 1792x1024 for landscape)

---

### Alternative: Midjourney

**Pros:**
- Best artistic quality
- Unlimited with standard plan
- Consistent style

**Cons:**
- $10/month subscription
- Discord-based (not API)
- Manual workflow

**How to use:**
1. Join Midjourney Discord
2. Use command: `/imagine prompt: [paste prompt] --ar 3:2 --style raw --v 6`
3. Upscale and download

---

### Alternative: Stable Diffusion XL

**Pros:**
- Free if run locally
- Full control
- Open source

**Cons:**
- Requires technical setup
- Need GPU for speed
- More complex

---

## 📂 File Organization

Create this structure for your generated images:

```
speakeasy/
└── assets/
    └── immersion-scenarios/
        ├── daily-life/
        │   ├── coffee-shop-order.png
        │   ├── public-transportation.png
        │   ├── grocery-shopping.png
        │   ├── restaurant-ordering.png
        │   └── pharmacy-visit.png
        ├── professional/
        │   └── job-interview.png
        ├── social/
        ├── travel/
        │   ├── airport-checkin.png
        │   ├── hotel-checkin.png
        │   └── taxi-rideshare.png
        ├── emergency/
        │   └── doctor-visit.png
        ├── home-services/
        └── cultural/
```

---

## 💰 Cost Estimates

| Service | Cost for 10 Images | Cost for 75 Images | Notes |
|---------|-------------------|-------------------|-------|
| **Imagen 3** | Free | Free | Free tier (check limits) |
| **DALL-E 3** | $0.40 | $3.00 | Most cost-effective paid option |
| **Midjourney** | $10/month | $10/month | Unlimited in standard plan |
| **Stable Diffusion** | Free | Free | If run locally (requires GPU) |

**Recommendation:** Start with Imagen 3 free tier for the 10 priority scenarios. If you hit limits or want faster bulk generation, switch to DALL-E 3 ($3 total).

---

## ✅ Generation Checklist

### Phase 1: Priority (Week 1)
- [ ] 1. Coffee Shop Order
- [ ] 2. Public Transportation
- [ ] 3. Grocery Shopping
- [ ] 4. Restaurant Ordering
- [ ] 5. Pharmacy Visit
- [ ] 6. Job Interview
- [ ] 7. Airport Check-in
- [ ] 8. Doctor Visit
- [ ] 9. Hotel Check-in
- [ ] 10. Taxi/Rideshare

### Phase 2: Daily Life Complete (Week 2)
- [ ] Generate remaining 10 daily life scenarios
- [ ] Test quality and consistency
- [ ] Adjust prompts if needed

### Phase 3: Professional & Social (Week 3)
- [ ] Generate 8 professional scenarios
- [ ] Generate 10 social scenarios

### Phase 4: Travel & Emergency (Week 4)
- [ ] Generate 12 travel scenarios
- [ ] Generate 6 emergency scenarios

### Phase 5: Final Categories (Week 5)
- [ ] Generate 8 home & services scenarios
- [ ] Generate 10 cultural scenarios
- [ ] Quality check all images

---

## 🛠️ NPM Scripts Available

```bash
# View priority prompts
npm run view:prompts

# Re-generate prompt files
npm run generate:prompts

# Run image generation helper (requires GEMINI_API_KEY)
npm run generate:images
```

---

## 📝 Image Specifications

All generated images should meet these specs:

- **Format:** PNG (preferred) or JPG
- **Dimensions:** 1200x800px (3:2 aspect ratio, landscape)
- **Art Style:** Flat illustration, modern, minimal
- **Color:** Vibrant but not oversaturated, category-specific palettes
- **Characters:** Diverse, simple facial features, friendly
- **Composition:** Clear focal point, uncluttered background
- **File Size:** Aim for < 500KB per image (optimize after generation)

---

## 🔄 Workflow Tips

### For Fastest Generation:

1. **Batch by category** - Generate all daily-life scenarios together
2. **Use consistent prompts** - Don't modify prompts unless quality is poor
3. **Download immediately** - Some services delete after 24 hours
4. **Name files correctly** - Use exact filenames from prompts
5. **Check quality** - Review first 3 images before bulk generation

### For Best Quality:

1. **Test with 3 scenarios first** - Verify style before committing
2. **Use Imagen 3 or Midjourney** - Best for flat illustration style
3. **Regenerate if needed** - It's okay to generate 2-3 versions
4. **Keep consistent colors** - Review category color palettes
5. **Check diversity** - Ensure characters represent diverse users

---

## 🆘 Troubleshooting

### "Imagen 3 not available"
- Check if you're using the correct Google AI Studio link
- Ensure you have API access enabled
- Try DALL-E 3 as alternative

### "Images don't match style"
- Review the prompt carefully
- Add "flat illustration" emphasis
- Try adding "modern minimalist design" to prompt

### "Characters look wrong"
- Emphasize "diverse" in prompt
- Try "simple facial features" addition
- Reference successful examples

### "File sizes too large"
- Use PNG compression tools (TinyPNG, ImageOptim)
- Target < 500KB per image
- Consider JPG for complex images

---

## 📚 Additional Resources

- **Google AI Studio:** https://aistudio.google.com/
- **DALL-E Playground:** https://platform.openai.com/playground
- **Midjourney:** https://www.midjourney.com/
- **Stable Diffusion:** https://stablediffusionweb.com/

---

## ✨ Next Steps After Generation

Once you've generated the images:

1. **Optimize images** for mobile (compress to < 500KB)
2. **Update scenario configs** with image paths
3. **Test in app** to ensure graphics load correctly
4. **Gather feedback** on visual quality
5. **Iterate** on any scenarios that need improvement

---

## 🎉 Summary

You now have:
- ✅ 75 detailed prompts ready for generation
- ✅ Organized prompt files by category
- ✅ NPM scripts for easy access
- ✅ Clear folder structure for assets
- ✅ Cost estimates and service recommendations
- ✅ Complete workflow guide

**Start with the 10 priority scenarios** in `image-prompts/01-PRIORITY-PROMPTS.md` and you'll have your core immersion graphics ready!

Good luck! 🚀
