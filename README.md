# 🌌 Galaxy Relay — Omnitrix Themed Realtime Chat

> A futuristic Omnitrix-inspired global realtime chat application powered by Supabase Realtime.

![License](https://img.shields.io/badge/License-MIT-00ff41?style=for-the-badge)
![Realtime](https://img.shields.io/badge/Realtime-Supabase-00ddff?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-ffcc00?style=for-the-badge)

---

## 🚀 Overview

**Galaxy Relay** is a global realtime group chat application with a futuristic Omnitrix-themed UI.  
Users can instantly join with a callsign, chat in realtime, send images, emojis, stickers, and react to messages — all synchronized across devices and browsers.

Built using pure **HTML, CSS, and JavaScript** with **Supabase Realtime** for WebSocket-based communication.

---

## 🌍 Live Demo
https://galaxy-relay-themed-online-chat.vercel.app/

---

## ✨ Features

### 💬 Realtime Chat
- Global broadcast-based group chat
- Instant message delivery
- Works across browsers and devices

### 👥 Live Presence
- Online users list
- Join/leave notifications
- Live user count

### ⌨ Typing Indicators
- Shows who is currently typing
- Automatically stops when idle

### 🖼 Image Sharing
- Drag & drop upload
- File preview
- Optional caption
- Size limit protection (~200KB)

### 😀 Emojis & Stickers
- Built-in emoji picker
- Animated sticker support

### ❤️ Message Reactions
- React with emojis
- Toggle reactions
- Live update for all users

### 🛡 Security & Protection
- Input sanitization (XSS protection)
- Image validation
- Profanity filter (toggleable)
- Rate limiting (anti-spam)
- Duplicate message prevention

### 📱 Mobile Friendly
- iOS keyboard-safe layout (`100dvh`)
- Responsive design
- Sidebar toggle for small screens

---

## 🧠 Tech Stack

| Technology | Purpose |
|------------|----------|
| HTML5 | Structure |
| CSS3 | UI & animations |
| JavaScript (ES6) | Application logic |
| Supabase Realtime | WebSocket communication |
| Vercel / Netlify | Deployment |

---

## 📦 Project Structure

```
Galaxy_relay-themed_online_chat/
│
├── index.html
├── README.md
└── (assets embedded inside index.html)
```

This project is a **single-page static application** — no backend server required.

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Manikanta-04/Galaxy_relay-themed_online_chat.git
cd Galaxy_relay-themed_online_chat
```

---

### 2️⃣ Create Supabase Project

1. Go to https://app.supabase.com  
2. Create a new project  
3. Navigate to **Settings → API**  
4. Copy:

   - Project URL  
   - Anon Public Key  

---

### 3️⃣ Configure Supabase Credentials

Inside `index.html`, replace:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual values.

---

### 4️⃣ Run Locally

Use a local server (recommended):

```bash
# VS Code Live Server
# OR
npx serve .
```

Then open:

```
http://127.0.0.1:5500
```

---

## 🚀 Deployment Guide

### Deploy on Vercel

1. Import GitHub repository
2. Framework Preset → **Other**
3. Root Directory → `./`
4. Leave Build & Output fields empty
5. Click Deploy

---

### Deploy on Netlify

1. Drag & drop the project folder  
OR  
2. Connect GitHub repository  

No build command required.

---

## 🔐 Security Design

Galaxy Relay includes:

- Input sanitization
- Controlled avatar colors
- Strict image data URL validation
- Rate limiting (5 messages / 6 seconds)
- Cooldown system
- Safe broadcast wrapper
- No eval usage
- DOM-safe rendering

⚠ Note: Messages are realtime only (not stored in database).

---

## 📌 Limitations

- No permanent message storage
- No authentication (open channel)
- Public broadcast only
- Chat history resets when everyone leaves

---

## 🛠 Future Improvements

- Supabase Auth integration
- Database message storage
- Private chat rooms
- Admin moderation tools
- Message history persistence
- End-to-end encryption
- Push notifications

---


## 🤝 Contributing

Contributions are welcome!

1. Fork the repository  
2. Create a feature branch  
3. Commit changes  
4. Open a Pull Request  

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍🚀 Author

**Manikanta Naripeddi**

GitHub: https://github.com/Manikanta-04  

---

## ⭐ If You Like This Project

Give it a ⭐ on GitHub and share it!

---
