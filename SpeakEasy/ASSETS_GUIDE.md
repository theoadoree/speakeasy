# SpeakEasy Assets Guide

## Asset Structure Created

I've set up the asset catalog structure for the SpeakEasy iOS app. The following image sets are ready for your image files:

### 📁 Asset Catalog Location
`SpeakEasy/Assets.xcassets/`

## Image Assets Configured

### 1. **App Logo**
**Location**: `Assets.xcassets/Logo.imageset/`

Add these files:
- `logo.png` - 1x resolution (base size, e.g., 120x120)
- `logo@2x.png` - 2x resolution (240x240)
- `logo@3x.png` - 3x resolution (360x360)

**Usage in SwiftUI**:
```swift
Image("Logo")
    .resizable()
    .scaledToFit()
    .frame(width: 120, height: 120)
```

**Recommended Design**:
- Colorful message/chat bubble icon
- Blue/purple gradient (matching app theme)
- Simple, modern, recognizable
- Works well at small sizes

---

### 2. **Teacher Avatar**
**Location**: `Assets.xcassets/TeacherAvatar.imageset/`

Add these files:
- `teacher-avatar.png` - 1x (e.g., 80x80)
- `teacher-avatar@2x.png` - 2x (160x160)
- `teacher-avatar@3x.png` - 3x (240x240)

**Usage in SwiftUI**:
```swift
Image("TeacherAvatar")
    .resizable()
    .scaledToFit()
    .frame(width: 60, height: 60)
    .clipShape(Circle())
```

**Recommended Design**:
- Friendly teacher/tutor character
- Diverse and welcoming
- Can be illustrated or realistic
- Works as circular avatar
- Use for AI assistant in conversations

---

### 3. **Conversation Bubble**
**Location**: `Assets.xcassets/ConversationBubble.imageset/`

Add these files:
- `conversation-bubble.png` - 1x (e.g., 100x100)
- `conversation-bubble@2x.png` - 2x (200x200)
- `conversation-bubble@3x.png` - 3x (300x300)

**Usage in SwiftUI**:
```swift
Image("ConversationBubble")
    .resizable()
    .scaledToFit()
    .frame(width: 80, height: 80)
```

**Recommended Design**:
- Animated chat bubbles
- Multiple speech bubbles overlapping
- Colorful and engaging
- Transparent background (PNG)
- Use in empty states and onboarding

---

### 4. **App Icon** (Important!)
**Location**: `Assets.xcassets/AppIcon.appiconset/`

**Required Size**: 1024x1024 PNG (no alpha channel)

Add the file named exactly as:
- `AppIcon.png` - Must be 1024x1024

Xcode will automatically generate all required sizes from this master icon.

**Design Requirements**:
- 1024x1024 pixels
- PNG format
- RGB color space (no alpha/transparency)
- Simple, recognizable design
- Looks good at small sizes (20x20)
- No text (icons should be visual only)

**Recommended Design**:
- SpeakEasy branding
- Message bubble or globe icon
- Blue/purple gradient
- Modern, clean design

---

## How to Add Images

### Method 1: Drag and Drop in Xcode
1. Open `SpeakEasy.xcodeproj` in Xcode
2. In Project Navigator, expand `Assets.xcassets`
3. Click on the image set (e.g., "Logo")
4. Drag your image files into the appropriate slots (1x, 2x, 3x)

### Method 2: File System (Command Line)
Simply copy your PNG files into the respective directories:

```bash
# Logo
cp your-logo.png "SpeakEasy/Assets.xcassets/Logo.imageset/logo.png"
cp your-logo@2x.png "SpeakEasy/Assets.xcassets/Logo.imageset/logo@2x.png"
cp your-logo@3x.png "SpeakEasy/Assets.xcassets/Logo.imageset/logo@3x.png"

# Teacher Avatar
cp teacher.png "SpeakEasy/Assets.xcassets/TeacherAvatar.imageset/teacher-avatar.png"
cp teacher@2x.png "SpeakEasy/Assets.xcassets/TeacherAvatar.imageset/teacher-avatar@2x.png"
cp teacher@3x.png "SpeakEasy/Assets.xcassets/TeacherAvatar.imageset/teacher-avatar@3x.png"

# Conversation Bubble
cp bubble.png "SpeakEasy/Assets.xcassets/ConversationBubble.imageset/conversation-bubble.png"
cp bubble@2x.png "SpeakEasy/Assets.xcassets/ConversationBubble.imageset/conversation-bubble@2x.png"
cp bubble@3x.png "SpeakEasy/Assets.xcassets/ConversationBubble.imageset/conversation-bubble@3x.png"

# App Icon
cp icon-1024.png "SpeakEasy/Assets.xcassets/AppIcon.appiconset/AppIcon.png"
```

---

## Image Requirements

### Resolution Guidelines
- **1x**: Base resolution (for older/smaller devices)
- **2x**: Retina resolution (most iPhones)
- **3x**: Super Retina resolution (iPhone 12+, Pro models)

### File Format
- **PNG** recommended (supports transparency)
- **JPEG** for photos (but PNG preferred)
- **PDF** for vector graphics (single file, scales automatically)

### Naming Convention
- Base: `name.png`
- Retina: `name@2x.png`
- Super Retina: `name@3x.png`

### Color Space
- **sRGB** color space
- App Icon: RGB only (no alpha channel)
- Other images: RGBA supported

---

## Where These Assets Are Used

### Logo
- Login screen (large)
- Loading screen
- Settings header
- About section
- Splash screen

### Teacher Avatar
- Practice conversation screen (AI assistant)
- Empty state for conversations
- Onboarding screens
- Tutorial/help sections

### Conversation Bubble
- Empty state in Practice tab
- Onboarding welcome screen
- Feature highlights
- Tutorial animations

### App Icon
- Home screen
- App Store listing
- Settings app
- Notifications
- Spotlight search

---

## Updating Views to Use Custom Assets

Once you add the images, you can update the views to use them:

### LoginView.swift
```swift
// Replace SF Symbol with custom logo
Image("Logo")  // instead of Image(systemName: "message.fill")
    .resizable()
    .scaledToFit()
    .frame(width: 80, height: 80)
```

### PracticeView.swift
```swift
// Add teacher avatar in empty state
Image("TeacherAvatar")
    .resizable()
    .scaledToFit()
    .frame(width: 100, height: 100)
    .clipShape(Circle())
```

### OnboardingView.swift
```swift
// Use conversation bubble for welcome
Image("ConversationBubble")
    .resizable()
    .scaledToFit()
    .frame(width: 120, height: 120)
```

---

## Placeholder Images

Until you add custom images, the app uses SF Symbols:
- `message.fill` - Placeholder for logo
- `person.circle.fill` - Placeholder for avatar
- `bubble.left.and.bubble.right` - Placeholder for conversation

These work perfectly and the app is fully functional without custom assets!

---

## Design Tools Recommendations

### Free Tools
- **Figma** (web-based design)
- **GIMP** (open-source Photoshop alternative)
- **Canva** (templates and easy design)
- **Inkscape** (vector graphics)

### Icon Generators
- **App Icon Generator** - appicon.co
- **Icon Kitchen** - icon.kitchen
- **MakeAppIcon** - makeappicon.com

### Asset Libraries
- **SF Symbols** (Apple's built-in icons) - already using these!
- **The Noun Project** (icon library)
- **Unsplash** (free photos)
- **Flaticon** (free icon sets)

---

## Testing Your Assets

After adding images:

1. **Build and run** in Xcode (Cmd+R)
2. **Check all screens**:
   - Login screen shows logo
   - Onboarding shows conversation bubble
   - Practice tab shows teacher avatar
   - App icon appears on home screen

3. **Test on multiple devices**:
   - Simulator: iPhone 15 (3x)
   - Simulator: iPhone SE (2x)
   - Real device if available

4. **Check dark mode**:
   - Images should look good in both light and dark themes
   - Consider adding dark mode variants if needed

---

## Current Status

✅ Asset catalog structure created
✅ Configuration files added (Contents.json)
⏳ **Waiting for image files** - Add your PNG files to the directories

The app currently uses SF Symbols as placeholders and is fully functional. Custom images will enhance the branding and visual appeal!

---

## Need Help?

If you need help creating images:
1. I can provide detailed design specifications
2. Recommend specific tools/templates
3. Suggest where to find free assets
4. Help with image sizing and optimization

Just let me know what you need!
