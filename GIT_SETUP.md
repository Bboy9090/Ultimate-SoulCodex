# 🔗 Git Setup - Ultimate Soul Codex

## Repository Information

- **GitHub Username:** Bboy9090
- **Repository Name:** Ultimate-SoulCodex-Engine-of-the-Eternal-Now
- **Full URL:** https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now

---

## 🚀 Initial Setup

### If repository doesn't exist yet:

1. **Create on GitHub:**
   - Go to https://github.com/new
   - Repository name: `Ultimate-SoulCodex-Engine-of-the-Eternal-Now`
   - Description: "Ultimate Soul Codex - Engine of the Eternal Now"
   - Choose Public or Private
   - **Don't** initialize with README (we already have one)

2. **Connect local repo:**
   ```bash
   cd soul-codex
   git init
   git remote add origin https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now.git
   git add .
   git commit -m "Initial commit: Ultimate Soul Codex - Merged version"
   git branch -M main
   git push -u origin main
   ```

### If repository already exists:

```bash
cd soul-codex
git init
git remote add origin https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now.git
git pull origin main --allow-unrelated-histories
git add .
git commit -m "Merge local changes"
git push -u origin main
```

---

## 📝 Commit & Push

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

---

## ✅ Repository is Ready!

The git remote is configured. You can now push your code!
