# ⚡ Quick Start - Soul Codex

## 🎨 Play with Colors!

**All colors are in:** `frontend/src/styles/themes/`

### Change Colors Instantly:
1. Open any theme file (e.g., `mystical-cyan.css`)
2. Change `--accent-primary` to your favorite color
3. Save and refresh - instant transformation!

### Switch Themes:
- Use the ThemeSwitcher component in the header
- Or edit `App.tsx` to import a different theme CSS file

### Available Themes:
- 🌊 **Mystical Cyan** (default) - `#06b6d4`
- 💜 **Cosmic Purple** - `#8b5cf6`
- 🌟 **Solar Gold** - `#f59e0b`
- 🌿 **Emerald Mystic** - `#10b981`
- 🌹 **Rose Mystic** - `#ec4899`

---

## 🚀 Run the App

### Backend
```bash
cd soul-codex/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd soul-codex/frontend
npm install
npm run dev
```

Visit: http://localhost:5173

---

## ✨ What's Included

### ✅ Fixed Issues
- **Unique Generation** - "Who I Am" is never duplicated
- **Render's Layout** - Clean soul archetype page structure
- **Replit's Polish** - Legendary design details

### ✅ Features
- 5 customizable color themes
- Theme switcher component
- Soul archetype page with all sections
- Landing page with pricing
- Unique content generation system

### ✅ Components
- Soul Frequency
- Who I Am (unique per user)
- Core Strengths
- Shadow Aspects
- Purpose
- Soul Architecture

---

## 🎨 Customize Colors

### Quick Method:
1. Open `frontend/src/styles/themes/mystical-cyan.css`
2. Find `--accent-primary: #06b6d4;`
3. Change to your color (e.g., `#ff6b9d`)
4. Save and see instant changes!

### Create New Theme:
1. Copy any theme file
2. Rename it (e.g., `my-custom-theme.css`)
3. Change all the color values
4. Import in `App.tsx`

---

## 📝 Next Steps

1. **Customize colors** - Play with the theme files!
2. **Add your AI client** - Update `archetype_generator.py`
3. **Connect backend** - Add your API keys
4. **Deploy** - Use the deployment guides from Sonic Codex

---

**Have fun customizing!** 🎨✨
