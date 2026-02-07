# Profile Feature Setup Guide

## ✅ What's Been Created:

### 1. **Folder Structure**
```
assets/avatars/
├── README.md (instructions for adding images)
├── avatar-1.png (add your image here)
├── avatar-2.png (add your image here)
├── avatar-3.png (add your image here)
├── avatar-4.png (add your image here)
├── avatar-5.png (add your image here)
├── avatar-6.png (add your image here)
└── avatar-7.png (add your image here)
```

### 2. **Profile Features**
- ✅ Username (unique, min 3 characters)
- ✅ Bio (max 200 characters with live counter)
- ✅ Profile picture selection (7 predefined avatars)
- ✅ Year selection (1st-4th year)
- ✅ Branch selection
- ✅ Email (locked/non-editable)

### 3. **Files Created**
- `profile.js` - Profile management logic
- `backend/update-profile-schema.sql` - Database schema updates
- `assets/avatars/` - Folder for avatar images

---

## 🚀 Setup Steps:

### Step 1: Update Database Schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **"SQL Editor"**
4. Click **"New query"**
5. Open the file: `backend/update-profile-schema.sql`
6. **Copy ALL contents** and paste into SQL Editor
7. Click **"Run"** (or press Ctrl+Enter)

You should see: ✅ "Success. No rows returned"

---

### Step 2: Add Avatar Images

**Option A: Use Your Own Images**
1. Create 7 square images (200x200px or 400x400px)
2. Name them: `avatar-1.png` through `avatar-7.png`
3. Put them in `assets/avatars/` folder
4. They will replace the emoji avatars

**Option B: Use Emoji Avatars (Already Working)**
- The system uses emoji avatars by default
- No action needed - it works out of the box

**Option C: Download Free Avatar Packs**
- Visit: https://www.flaticon.com/packs/avatars
- Or use: https://avatars.dicebear.com/
- Download 7 avatars, rename them properly
- Place in `assets/avatars/` folder

---

### Step 3: Test the Profile Page

1. **Go to:** http://localhost:3000/profile.html
2. **Login** if prompted
3. **Fill out your profile:**
   - Full Name
   - Username (unique)
   - Year
   - Branch
   - Bio (max 200 characters)
4. **Click on an avatar** to select it
5. **Click "Save Profile"**

---

## 🎨 Avatar System Explained:

### How It Works:
1. 7 predefined avatars stored locally in `/assets/avatars/`
2. User clicks to select their favorite
3. Only the avatar ID (e.g., "avatar-3") is saved to database
4. **No file uploads** - saves bandwidth and storage
5. **No Supabase buckets needed** - everything is local

### Current Avatar IDs:
- `avatar-1` - 😎 Cool
- `avatar-2` - 🤓 Nerdy
- `avatar-3` - 😊 Happy
- `avatar-4` - 🚀 Ambitious
- `avatar-5` - 🎯 Focused
- `avatar-6` - 🌟 Star
- `avatar-7` - 🔥 Fire

When you add images, they'll replace these emojis automatically!

---

## 📊 Database Schema:

The `users` table now has these new columns:
- `username` (TEXT, unique)
- `bio` (TEXT)
- `avatar` (TEXT, default: 'avatar-1')
- `branch` (TEXT)
- `year` (TEXT)

---

## ✨ Features:

### Profile Picture Selection
- Visual avatar grid
- Click to select
- Highlights selected avatar
- Updates preview instantly

### Bio Counter
- Live character count
- Maximum 200 characters
- Shows "150/200" as you type

### Username Validation
- Minimum 3 characters
- Must be unique across all users
- Shows error if already taken

### Form Validation
- Required fields marked
- Email field locked (can't be changed)
- Branch selection required
- Clear error messages

---

## 🔧 Customization:

### Change Number of Avatars
Edit `profile.js` line 3-11:
```javascript
const avatars = [
    { id: 'avatar-1', emoji: '😎', alt: 'Cool' },
    { id: 'avatar-2', emoji: '🤓', alt: 'Nerdy' },
    // Add more avatars here
];
```

### Change Bio Max Length
Edit `profile.html` line 87:
```html
<textarea id="bio" maxlength="200"></textarea>
```

---

## 🎯 Next Steps:

1. Run the SQL script to update your database
2. Add your 7 avatar images to `assets/avatars/`
3. Test the profile page
4. Customize avatar emojis/descriptions if needed

---

## ❓ FAQ:

**Q: Do I need Supabase Storage buckets?**
A: No! Images are stored locally in your frontend.

**Q: Can users upload their own images?**
A: Not currently. They choose from your 7 predefined avatars. This keeps it simple and fast.

**Q: What if I want more than 7 avatars?**
A: Add more items to the `avatars` array in `profile.js` and add the corresponding images.

**Q: Can I use GIFs?**
A: Yes! Just name them `avatar-1.gif` etc. and update the code to use `.gif` extension.

---

**All set! Your profile feature is ready to use!** 🎉
