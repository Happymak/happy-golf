# Happy Golf ⛳

2026 Golf Season — personal practice & improvement tracker.

---

## 🚀 Deploy on Vercel (15 minutes)

You don't need to know how to code. Just follow these steps.

### Step 1: Create a GitHub account (if you don't have one)

1. Go to https://github.com → **Sign up**
2. Use your email, pick a username, create a password
3. Verify your email

### Step 2: Upload the project to GitHub

1. Once logged in, click the **"+"** button (top right) → **New repository**
2. Repository name: `happy-golf`
3. Set it to **Public**
4. **Do NOT** check "Add README"
5. Click **Create repository**
6. On the next page, click the link **"uploading an existing file"**
7. **Drag the entire `happy-golf` folder contents** (all files and subfolders, NOT the outer folder) into the upload area
8. Wait for all files to upload
9. Scroll down → commit message: `Initial commit` → **Commit changes**

### Step 3: Deploy on Vercel

1. Go to https://vercel.com → **Sign Up with GitHub** (you already have an account)
2. Vercel dashboard → **Add New...** → **Project**
3. Find `happy-golf` → **Import**
4. Don't change any setting (Vercel auto-detects Vite)
5. Click **Deploy**
6. Wait ~30-60 seconds

✅ Done. Vercel gives you a URL like `https://happy-golf.vercel.app`

### Step 4: Add to iPhone home screen

1. Open the Vercel URL in **Safari** on your iPhone (must be Safari)
2. Tap the **Share button** (square with arrow up)
3. Scroll down → **Add to Home Screen**
4. Tap **Add**

App now lives on home screen as **Happy Golf**, opens fullscreen, no browser bar.

---

## 🔄 Future updates

When new code is ready:
1. Replace files in GitHub repo (drag & drop overwrite)
2. Vercel auto-deploys in ~30 seconds
3. Your iPhone app updates automatically next time you open it

---

## 📁 What's inside

```
happy-golf/
├── public/                      ← Static assets (icons, manifest)
├── src/
│   ├── GolfApp.jsx              ← The app
│   ├── main.jsx                 ← Entry
│   └── index.css                ← Styles
├── index.html                   ← HTML shell
├── package.json                 ← Dependencies
├── vite.config.js               ← Build config
└── .gitignore
```

---

## ✨ Features

- **My Mantra** — personal reflection + rotating golf quotes + Spotify deep link to Liked Songs
- **Course Management** — DECADE system + Tiger Five (5 round-killing mistakes to avoid)
- **Areas of Improvement** — 6 personal focus areas for Q2 2026
- **Practice Sessions** — Indoor (120 min) + Outdoor (90 min) structured by Jim Waldron's framework
- **Live Session Timer** — Start/Pause/Skip/Reset with sound + vibration alerts between blocks
- **Practice Log** — track every session with notes and next focus
- **Latest Golf Round** — placeholder for round data
- All data **auto-saves locally** in your browser
