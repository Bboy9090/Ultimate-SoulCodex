# 🎨 Soul Codex - Customizable Color System

## Color Themes - Easy to Customize!

All colors are defined in one place. Change these values to instantly transform the entire app's look and feel.

---

## 🌈 Default Theme: Mystical Cyan

```css
/* soul-codex/frontend/src/styles/themes/mystical-cyan.css */

:root {
  /* Background Colors - Render's Clean Dark */
  --bg-primary: #0a0a0b;
  --bg-secondary: #1a1a1b;
  --bg-tertiary: #2a2a2b;
  --bg-card: #1a1a1b;
  --bg-hover: #2a2a2b;
  
  /* Text Colors - Render's Clean */
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-muted: #6b6b6b;
  --text-accent: #06b6d4;
  
  /* Accent Colors - Replit's Mystical */
  --accent-primary: #06b6d4;      /* Cyan - Main accent */
  --accent-secondary: #8b5cf6;    /* Purple - Secondary */
  --accent-tertiary: #ec4899;     /* Pink - Highlights */
  --accent-glow: rgba(6, 182, 212, 0.3);
  
  /* Borders & Shadows - Replit's Polish */
  --border-color: rgba(6, 182, 212, 0.1);
  --border-hover: rgba(6, 182, 212, 0.3);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(6, 182, 212, 0.2);
  --shadow-glow: 0 0 40px rgba(6, 182, 212, 0.3);
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #1a1a1b 0%, rgba(6, 182, 212, 0.1) 100%);
  --gradient-accent: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
  --gradient-mystical: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
}
```

---

## 🎨 Alternative Themes (Copy & Paste to Switch)

### Theme 2: Cosmic Purple
```css
:root {
  --bg-primary: #0a0a0b;
  --bg-secondary: #1a0f1f;
  --accent-primary: #8b5cf6;      /* Purple */
  --accent-secondary: #ec4899;    /* Pink */
  --accent-tertiary: #f59e0b;     /* Amber */
  --accent-glow: rgba(139, 92, 246, 0.3);
  --border-color: rgba(139, 92, 246, 0.1);
  --shadow-glow: 0 0 40px rgba(139, 92, 246, 0.3);
  --gradient-primary: linear-gradient(135deg, #1a0f1f 0%, rgba(139, 92, 246, 0.1) 100%);
}
```

### Theme 3: Solar Gold
```css
:root {
  --bg-primary: #0a0a0b;
  --bg-secondary: #1f1a0f;
  --accent-primary: #f59e0b;      /* Gold */
  --accent-secondary: #ef4444;     /* Red */
  --accent-tertiary: #f97316;     /* Orange */
  --accent-glow: rgba(245, 158, 11, 0.3);
  --border-color: rgba(245, 158, 11, 0.1);
  --shadow-glow: 0 0 40px rgba(245, 158, 11, 0.3);
  --gradient-primary: linear-gradient(135deg, #1f1a0f 0%, rgba(245, 158, 11, 0.1) 100%);
}
```

### Theme 4: Emerald Mystic
```css
:root {
  --bg-primary: #0a0a0b;
  --bg-secondary: #0f1a0f;
  --accent-primary: #10b981;      /* Emerald */
  --accent-secondary: #06b6d4;    /* Cyan */
  --accent-tertiary: #8b5cf6;     /* Purple */
  --accent-glow: rgba(16, 185, 129, 0.3);
  --border-color: rgba(16, 185, 129, 0.1);
  --shadow-glow: 0 0 40px rgba(16, 185, 129, 0.3);
  --gradient-primary: linear-gradient(135deg, #0f1a0f 0%, rgba(16, 185, 129, 0.1) 100%);
}
```

### Theme 5: Rose Mystic
```css
:root {
  --bg-primary: #0a0a0b;
  --bg-secondary: #1a0f14;
  --accent-primary: #ec4899;      /* Pink */
  --accent-secondary: #8b5cf6;     /* Purple */
  --accent-tertiary: #f59e0b;      /* Amber */
  --accent-glow: rgba(236, 72, 153, 0.3);
  --border-color: rgba(236, 72, 153, 0.1);
  --shadow-glow: 0 0 40px rgba(236, 72, 153, 0.3);
  --gradient-primary: linear-gradient(135deg, #1a0f14 0%, rgba(236, 72, 153, 0.1) 100%);
}
```

---

## 🎛️ How to Change Colors

### Option 1: Quick Theme Switch
1. Open `frontend/src/styles/themes/mystical-cyan.css`
2. Replace with any theme above
3. Save and refresh!

### Option 2: Custom Colors
1. Open `frontend/src/styles/themes/mystical-cyan.css`
2. Change the `--accent-primary` value to your color
3. Adjust other colors to match
4. Save and see instant changes!

### Option 3: Color Picker Tool
Use the built-in theme switcher in the app (coming soon!)

---

## 🎨 Color Psychology Guide

- **Cyan (#06b6d4)**: Mystical, spiritual, clarity
- **Purple (#8b5cf6)**: Wisdom, transformation, mysticism
- **Pink (#ec4899)**: Love, compassion, intuition
- **Gold (#f59e0b)**: Power, enlightenment, abundance
- **Emerald (#10b981)**: Growth, healing, nature
- **Rose (#ec4899)**: Heart, emotion, connection

---

## 💡 Pro Tips

1. **Keep contrast**: Ensure text is readable on backgrounds
2. **Test in dark mode**: All themes are dark-optimized
3. **Accent consistency**: Use 2-3 accent colors max
4. **Glow effects**: Adjust `--accent-glow` opacity for subtlety
5. **Gradients**: Match gradient colors to your accent palette

---

**Have fun experimenting!** 🎨✨
