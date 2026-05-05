# Shivam AI

A powerful AI chat app built with React Native (Expo) powered by Groq API.

## Features
- 🧠 **DeepSeek R1** — Reasoning model with thinking visibility
- ⚡ **LLaMA 3.3 70B** — Unlimited speed, no token limit constraints
- 💾 **Persistent chat history** — Saved until APK is uninstalled
- 🎨 **Gemini-inspired UI** — Dark theme, sidebar chat history
- 📱 **Native Android APK** — Built via GitHub Actions

---

## Setup & Deployment

### Step 1 — Fork / Push to GitHub
Push this entire folder to a new GitHub repository.

### Step 2 — Create Expo Account
1. Go to [expo.dev](https://expo.dev) and create a free account
2. Go to **Settings → Access Tokens** → Create a new token
3. Copy the token (this is your `EXPO_TOKEN`)

### Step 3 — Add GitHub Secrets
In your GitHub repo → **Settings → Secrets → Actions**, add:

| Secret Name | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com) |
| `EXPO_TOKEN` | Your Expo access token |

### Step 4 — Configure EAS Project
Update `app.json` and set a unique `projectId` in the `extra.eas` section, OR run `eas init` locally once.

### Step 5 — Trigger Build
- Push to `main` branch → APK builds automatically
- OR go to **Actions tab** → **Build Android APK** → **Run workflow**

### Step 6 — Download APK
- APK download link appears in the **EAS dashboard** at expo.dev
- Or check the GitHub Actions logs for the direct link

---

## Models

| Model | ID | Best For |
|---|---|---|
| 🧠 DeepSeek R1 | `deepseek-r1-distill-llama-70b` | Complex reasoning, math, coding |
| ⚡ LLaMA 3.3 | `llama-3.3-70b-versatile` | Fast responses, general chat |

---

## Local Development (Optional)
```bash
npm install
cp .env.example .env
# Add your GROQ_API_KEY to .env
npx expo start
```

---

## Tech Stack
- React Native + Expo SDK 51
- Expo Router (file-based navigation)
- AsyncStorage (persistent chat history)
- Groq API (LLM backend)
- EAS Build (APK generation)
- GitHub Actions (CI/CD)
