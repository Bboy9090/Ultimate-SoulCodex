# GitHub Authentication Setup Guide

## ✅ Already Configured

- **Credential Helper**: Windows Credential Manager (manager-core)
- **User Name**: bboy9090
- **User Email**: kidbuggz@yahoo.com
- **Default Branch**: main

## 🔑 Authentication Options

GitHub no longer accepts passwords for HTTPS. You have two options:

### Option 1: Personal Access Token (PAT) - EASIEST ⭐

**Step 1: Create a PAT**
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `SoulCodex-Engine`
4. Select expiration: `90 days` (or `No expiration` for convenience)
5. **Select scopes:**
   - ✅ `repo` (all) - Full control of private repositories
   - ✅ `workflow` - Update GitHub Action workflows
6. Click **"Generate token"**
7. **COPY THE TOKEN** (you won't see it again!)

**Step 2: Use the Token**
- Username: `bboy9090`
- Password: `YOUR_PERSONAL_ACCESS_TOKEN` (paste the token you copied)

The Windows Credential Manager will save it automatically.

**Step 3: Test Push**
```bash
git push
```

If prompted:
- Username: `bboy9090`
- Password: `your_token_here` (the PAT you created)

---

### Option 2: SSH Keys - MORE SECURE 🔐

**Step 1: Generate SSH Key**
```powershell
ssh-keygen -t ed25519 -C "kidbuggz@yahoo.com"
```
- Press Enter to accept default location
- Optionally set a passphrase (more secure)

**Step 2: Add SSH Key to GitHub**
1. Copy your public key:
   ```powershell
   Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard
   ```
2. Go to: https://github.com/settings/ssh/new
3. Paste the key
4. Give it a title: `SoulCodex-Engine`
5. Click **"Add SSH key"**

**Step 3: Switch Remote to SSH**
```powershell
git remote set-url origin git@github.com:Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now.git
```

**Step 4: Test Connection**
```powershell
ssh -T git@github.com
```

You should see: `Hi Bboy9090! You've successfully authenticated...`

**Step 5: Test Push**
```bash
git push
```

---

## 🚨 Troubleshooting

### "Authentication failed" or "Permission denied"

**For HTTPS:**
- Make sure you're using a Personal Access Token, not your password
- Check that the token has `repo` scope
- Clear cached credentials:
  ```powershell
  git credential-manager delete https://github.com
  ```
- Try pushing again and enter the token

**For SSH:**
- Verify SSH key is added to GitHub
- Test connection: `ssh -T git@github.com`
- Check SSH agent:
  ```powershell
  ssh-add -l
  ```

### "Remote: Invalid username or password"

- GitHub no longer accepts passwords
- You MUST use a Personal Access Token (PAT)
- Create one at: https://github.com/settings/tokens

### "fatal: could not read Username"

- Windows Credential Manager may need to be refreshed
- Try pushing again - it should prompt for credentials
- Enter your PAT as the password

---

## 📝 Quick Reference

**Current Remote (HTTPS):**
```
https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now.git
```

**To Switch to SSH:**
```powershell
git remote set-url origin git@github.com:Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now.git
```

**To Switch Back to HTTPS:**
```powershell
git remote set-url origin https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now.git
```

---

## ✅ Recommended: PAT (Personal Access Token)

For now, **Option 1 (PAT) is the easiest**:
1. Takes 2 minutes to set up
2. No SSH key management
3. Works immediately
4. Stored securely by Windows Credential Manager

**Just create the token and use it as your password when pushing!**
