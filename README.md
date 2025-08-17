# Atasy Roblox Interactive 🎮 + 🎥

A desktop app that lets TikTok Live viewers control your Roblox gameplay by sending gifts.  
Example:  
- 🌹 Rose → character turns left  
- 🎁 Gift → character jumps  
- 🤠 Cowboy Hat → respawn  

Built with **Electron + Node.js** and uses [TikTok-Live-Connector](https://github.com/zerodytrash/TikTok-Live-Connector).

---

## 🚀 Features
1. Connects to TikTok Live and listens for gifts
2. Maps TikTok gifts to keyboard actions in Roblox
3. GUI for managing gift → action mappings
4. Supports **nut.js** for robust keyboard/mouse simulation
5. Buildable into `.exe` for distribution

---

## 📦 Installation

1. Clone this repo or download the release zip  
   ```sh
   git clone https://github.com/yourname/atasy-roblox-interactive.git
   cd atasy-roblox-interactive
   ```

2. Install dependencies  
   ```sh
   npm install
   ```

3. Start in development  
   ```sh
   npm start
   ```

---

## 🏗️ Build to EXE

```sh
npm run build
```

The output will be inside the `dist/` folder.  
You can send the `.exe` or zip it for others to download.

---

## ⚙️ Usage

1. Open the app
2. Enter your TikTok username
3. Add gift mappings (e.g., Rose = press A, Cowboy Hat = respawn)
4. Click **Start**
5. Run Roblox and watch your viewers control the game 🎉

---

## 📂 Project Structure

```
atasy-roblox-interactive/
├── package.json
├── main.js
├── preload.js
├── test.js
├── index.html
├── /src
│   ├── renderer.html
│   ├── renderer.js
│   └── styles.css
└── /dist   # output build
```

---

## 🛠️ Tech Stack
- [Electron](https://www.electronjs.org/)
- [TikTok-Live-Connector](https://github.com/zerodytrash/TikTok-Live-Connector)
- [nut.js](https://nutjs.dev/) (keyboard simulation)

---

## 🙌 Credits
- TikTok-Live-Connector by [zerodytrash](https://github.com/zerodytrash)
- nut.js team
- All Roblox + TikTok creators who inspired this idea

---

## 📜 License
MIT License © 2025
