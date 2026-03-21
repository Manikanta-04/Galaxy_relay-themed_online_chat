<div align="center">

<img src="https://img.shields.io/badge/Galaxy%20Relay-Omnitrix%20Chat-00ff41?style=for-the-badge&logo=planet-scale&logoColor=white" alt="Galaxy Relay Banner"/>

# 🌌 Galaxy Relay — Omnitrix Themed Realtime Chat

### *Futuristic Global Realtime Chat — Powered by Supabase WebSockets*

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20Now-00ff41?style=for-the-badge)](https://galaxy-relay-themed-online-chat.vercel.app/)

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-00ff41?style=flat-square)](LICENSE)
[![Realtime](https://img.shields.io/badge/Realtime-Supabase-00ddff?style=flat-square)](https://supabase.com)
[![Status](https://img.shields.io/badge/Status-Active-ffcc00?style=flat-square)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![No Backend](https://img.shields.io/badge/Backend-None%20Required-blueviolet?style=flat-square)]()

</div>

---

## 🚀 Live Demo

| Service | URL |
|---|---|
| 🌌 **Galaxy Relay Chat** | [galaxy-relay-themed-online-chat.vercel.app](https://galaxy-relay-themed-online-chat.vercel.app/) |

> 💡 No login required — just enter a callsign and start chatting instantly across any device or browser.

---
## 🎥 Demo Video

[![Watch Demo](https://img.shields.io/badge/▶%20Watch%20Demo-YouTube-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=5DgUMIZn6W0)

---
## 🧠 Problem Statement

Most real-time chat apps are either:

- 🔐 Too heavy — require accounts, backends, and databases just to send a message
- 😐 Too plain — generic UIs with no personality or theme
- 📵 Not truly cross-device — messages don't sync instantly across all browsers
- 🐌 Slow to join — sign-up flows kill spontaneous group conversations

There's no frictionless, visually immersive, **just-open-and-chat** experience for instant group communication.

---

## 💡 Solution

**Galaxy Relay** is a zero-backend, Omnitrix-themed global group chat that anyone can join instantly with a callsign. Built entirely in pure HTML/CSS/JS with Supabase Realtime WebSockets — no servers, no accounts, no friction.

> *"Tune in to the frequency. The galaxy is talking."*

---

## 🖼️ Screenshots

| Chat Interface | Emoji & Sticker Panel |
|---|---|
| ![Chat](screenshots/chat.png) | ![Emoji](screenshots/emoji.png) |

| Live Presence & Typing | Image Sharing |
|---|---|
| ![Presence](screenshots/presence.png) | ![Image](screenshots/image-share.png) |

> 📌 *(Replace with actual screenshots from your deployed app)*

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                         │
│         Pure HTML + CSS + Vanilla JavaScript              │
│    Single-Page App — No Framework, No Build Step          │
│              Hosted on Vercel / Netlify                   │
└───────────────────────────┬──────────────────────────────┘
                            │  WebSocket (Supabase Realtime)
                            ▼
┌──────────────────────────────────────────────────────────┐
│               SUPABASE REALTIME LAYER                     │
│         Global Broadcast Channel (no DB write)            │
│   Messages | Reactions | Presence | Typing Indicators     │
│              Supabase Cloud (managed)                     │
└──────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│                  ALL CONNECTED CLIENTS                    │
│   Browser A | Browser B | Mobile | Tablet | etc.          │
│       All receive events simultaneously in < 100ms        │
└──────────────────────────────────────────────────────────┘
```

> ⚡ No backend server. No database writes. Pure WebSocket broadcast.

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Structure** | HTML5 | Single-page app markup |
| **Styling** | CSS3 | Omnitrix-themed UI + animations |
| **Logic** | JavaScript ES6+ | All app logic, events, DOM |
| **Realtime** | Supabase Realtime | WebSocket broadcast channel |
| **Presence** | Supabase Presence | Live user list + join/leave |
| **Deployment** | Vercel / Netlify | Static hosting, zero config |

---

## ✨ Features

### 💬 Global Realtime Chat
- WebSocket-based group chat via Supabase Realtime broadcast
- Instant message delivery across all browsers and devices
- No account or login required — join with a callsign

### 👥 Live Presence System
- Online users list updated in real time
- Join and leave notifications broadcast to all members
- Live user count display

### ⌨️ Typing Indicators
- Shows who is currently typing with animated indicator
- Auto-resets when user goes idle

### 🖼️ Image Sharing
- Drag & drop image upload with live preview
- Optional caption support
- File size protection (~200KB limit)
- Strict image data URL validation

### 😀 Emojis & Animated Stickers
- Built-in emoji picker panel
- Animated sticker support for expressive messaging

### ❤️ Message Reactions
- React to any message with emojis
- Toggle reactions on/off
- Live reaction sync for all connected users

### 🛡️ Security & Anti-Abuse
- Input sanitization — XSS attack prevention
- Rate limiting: 5 messages per 6 seconds per user
- Cooldown system to prevent spam bursts
- Duplicate message prevention
- Profanity filter (toggleable)
- No `eval()` usage anywhere
- DOM-safe rendering throughout

### 📱 Mobile-First Responsive Design
- iOS keyboard-safe layout using `100dvh`
- Sidebar toggle optimized for small screens
- Works on all modern browsers and devices

---

## 📊 System Design

```
Message Flow (Send → Receive):

[User types message]
         │
         ▼
[Input sanitized + rate limit checked]
         │
         ▼
[Supabase Realtime broadcast()]
         │
    ─────┴───────────────────────────────
    │                                   │
    ▼                                   ▼
[All connected clients]         [Sender's own UI]
[receive broadcast event]       [message rendered]
[render message in DOM]
```

```
Presence Flow:

[User joins with callsign]
         │
         ▼
[Supabase Presence track()]
         │
         ▼
[All users receive presenceSync event]
         │
         ▼
[Online users list + count updated]
```

**Supabase Realtime Events Used:**

```
broadcast    → chat messages, reactions, stickers, images
presence     → online users, join/leave notifications
typing       → real-time typing indicator per user
```

---

## 🔄 Workflow

```
1. User opens app                →  Omnitrix UI loads instantly (no login)
2. User enters callsign          →  Unique color avatar assigned
3. Supabase Presence tracked     →  All users see new member join
4. User types message            →  Typing indicator broadcasts to room
5. User sends message            →  Sanitized → Rate checked → Broadcast
6. All clients receive event     →  DOM updated in < 100ms
7. User reacts to message        →  Reaction broadcast + toggled for all
8. User uploads image            →  Validated → Encoded → Broadcast as data URL
9. User leaves / closes tab      →  Presence untrack → Leave notification sent
```

---

## 📈 Performance & Metrics

| Metric | Value |
|---|---|
| Message delivery latency | < 100ms (WebSocket) |
| Rate limit | 5 messages / 6 seconds |
| Max image size | ~200KB |
| Bundle size | Single HTML file (no build) |
| Backend servers | 0 |
| Time to first chat | < 5 seconds |
| Browser support | All modern browsers |

---

## 🧪 Testing

```bash
# Open in browser
open https://galaxy-relay-themed-online-chat.vercel.app/

# Test realtime sync
# → Open the same URL in two different browser tabs
# → Enter different callsigns in each
# → Send a message from Tab 1 → should appear in Tab 2 instantly

# Test typing indicator
# → Start typing in Tab 1 → Tab 2 should show typing notification

# Test presence
# → Close Tab 1 → Tab 2 should show user left notification

# Test rate limiting
# → Send 6+ messages rapidly → should trigger cooldown message
```

---

## 📁 Project Structure

```
Galaxy_relay-themed_online_chat/
│
├── index.html                  # Complete single-page application
│   ├── <head>                  # CSS variables, Omnitrix theme, animations
│   ├── <body>                  # Chat UI, sidebar, emoji panel, image preview
│   └── <script>
│       ├── Supabase init       # SUPABASE_URL + SUPABASE_ANON_KEY config
│       ├── Presence system     # Online users, join/leave tracking
│       ├── Broadcast system    # Message send/receive via WebSocket
│       ├── Typing indicators   # Real-time typing state
│       ├── Reaction system     # Emoji reactions per message
│       ├── Image handler       # Drag & drop, validation, encoding
│       ├── Sanitization        # XSS prevention, DOM-safe rendering
│       ├── Rate limiter        # Anti-spam cooldown logic
│       └── Profanity filter    # Toggleable word filter
│
└── README.md
```

---

## 🔐 Security Design

| Concern | Protection |
|---|---|
| XSS Attacks | Full input sanitization before DOM insertion |
| Spam / Flooding | Rate limit: 5 msg / 6s + cooldown system |
| Duplicate Messages | Message deduplication check |
| Malicious Images | Strict data URL format validation + size cap |
| Code Injection | Zero `eval()` usage, DOM-safe rendering only |
| Avatar Hijacking | Controlled color assignment per callsign |
| Profanity | Toggleable profanity filter |

> ⚠️ Messages are **broadcast-only** (not stored in database). Chat history is session-based and resets when all users leave.

---

## ⚙️ Local Development Setup

### Prerequisites

- Any modern browser
- [Supabase](https://app.supabase.com) account (free tier works)
- VS Code with Live Server extension *(recommended)*

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Manikanta-04/Galaxy_relay-themed_online_chat.git
cd Galaxy_relay-themed_online_chat
```

### 2️⃣ Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Navigate to **Settings → API**
4. Copy your **Project URL** and **Anon Public Key**

### 3️⃣ Configure Credentials

Inside `index.html`, replace:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual Supabase values.

### 4️⃣ Run Locally

```bash
# Option 1: VS Code Live Server (recommended)
# Right-click index.html → Open with Live Server

# Option 2: npx serve
npx serve .
```

Then open: `http://127.0.0.1:5500`

---

## 🔑 Environment Variables

This is a static app — credentials are configured **directly inside `index.html`**:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-public-key';
```

> ✅ The Supabase **anon key** is safe to expose in frontend code — it's designed for public client use. Supabase Row Level Security (RLS) controls access at the database level.

---

## 🚀 Deployment

### Deploy on Vercel

| Setting | Value |
|---|---|
| Framework Preset | Other |
| Root Directory | `./` |
| Build Command | *(leave empty)* |
| Output Directory | *(leave empty)* |

Click **Deploy** — done.

### Deploy on Netlify

- Drag & drop the project folder into Netlify dashboard, **OR**
- Connect your GitHub repository — no build command needed

---

## 📌 Known Limitations

| Limitation | Reason |
|---|---|
| No message history | Broadcast-only — messages not stored in DB |
| No authentication | Open channel — anyone with callsign can join |
| Public broadcast only | No private DMs or rooms |
| Chat resets on empty | History lost when all users disconnect |

---

## 🔮 Future Improvements

- [ ] 🔐 Supabase Auth integration for persistent identities
- [ ] 🗄️ Database message storage for chat history
- [ ] 🏠 Private chat rooms and invite links
- [ ] 🔒 End-to-end encryption for messages
- [ ] 🛑 Admin moderation and ban system
- [ ] 🔔 Push notifications for new messages
- [ ] 🎨 Multiple theme options beyond Omnitrix
- [ ] 📊 User analytics — message count, session time

---

## 🤝 Contributing

Contributions are welcome and appreciated!

```bash
# 1. Fork this repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit with conventional commits
git commit -m "feat: describe your change"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

Please follow [Conventional Commits](https://www.conventionalcommits.org/) and test across at least two browser tabs before submitting.

---

## 👨‍💻 Author

**Manikanta Naripeddi** — Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-Manikanta--04-181717?style=flat-square&logo=github)](https://github.com/Manikanta-04)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Manikanta%20Naripeddi-0077b5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/manikanta-naripeddi-4326232a5/)

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgements

- [Supabase](https://supabase.com/) — Realtime WebSocket infrastructure
- [Vercel](https://vercel.com/) — Static site hosting
- [Netlify](https://netlify.com/) — Alternative deployment platform

---

<div align="center">

**Built with ❤️ for instant, frictionless global communication**

⭐ **Star this repo** if Galaxy Relay impressed you!

[![GitHub Stars](https://img.shields.io/github/stars/Manikanta-04/Galaxy_relay-themed_online_chat?style=social)](https://github.com/Manikanta-04/Galaxy_relay-themed_online_chat)

---

*🌌 Tune in to the frequency. The galaxy is talking. 🛸*

</div>