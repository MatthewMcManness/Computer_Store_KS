# Web Gallery Manager - Quick Start

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
cd api
bun install
```

### 2. Create GitHub Token
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Enable `repo` scope
4. Copy token

### 3. Configure
```bash
copy .env.example .env
notepad .env
```

Edit `.env`:
```env
GITHUB_TOKEN=your_token_here
ADMIN_PASSWORD=your_password_here
```

### 4. Start API
```bash
bun start
```

### 5. Access Gallery Manager
1. Go to https://computerstoreks.com
2. Click "Administrator Login" in footer
3. Enter password from `.env`
4. Start managing!

---

## 📝 Common Tasks

### Add Computer
1. Click **"+ Add Computer"**
2. Fill form & upload image
3. Click **"Save Computer"**
4. Click **"Publish Changes"**

### Edit Computer
1. Double-click computer card
2. Make changes
3. Click **"Save Computer"**
4. Click **"Publish Changes"**

### Delete Computer
1. Click computer card to select
2. Press **Delete** key
3. Confirm deletion
4. Click **"Publish Changes"**

---

## 🔧 Keyboard Shortcuts

- **Escape** - Close modal
- **Ctrl+S** - Save (when modal open)
- **Delete** - Delete selected computer
- **Double-click** - Edit computer

---

## ⚠️ Important Notes

- Changes aren't live until you click **"Publish Changes"**
- Website updates 2-3 minutes after publishing
- Session expires after 8 hours
- Maximum image size: 5MB
- Supported formats: JPG, PNG

---

## 🆘 Troubleshooting

**Can't login?**
- Check API is running (`bun start`)
- Verify password in `.env`

**Changes not publishing?**
- Check GitHub token is valid
- Verify token has `repo` permissions
- Check API console for errors

**Need detailed help?**
- See `WEB_GALLERY_MANAGER_SETUP.md`

---

## 📞 Quick Reference

- **API Port**: 3001
- **Session Duration**: 8 hours
- **Image Formats**: JPG, PNG
- **Max Image Size**: 5MB
- **Optimized Size**: 1200x900px
- **Branch**: Computer-Store-KS
