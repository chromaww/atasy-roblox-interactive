import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';
import { keyboard, Key } from "@nut-tree-fork/nut-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let connection = null;

// mapping gift -> key, diupdate dari renderer
let giftMappings = [
  { giftName: 'Rose', key: 'a', holdMs: 20 },
  { giftName: 'Fairy Wings', key: 'd', holdMs: 20 },
  { giftName: 'Friendship Necklace', key: 'space', holdMs: 20 },
  { giftName: 'Hat and Mustache', key: 'esc+r+enter', holdMs: 10 }
];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 720,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      sandbox: false
    },
    autoHideMenuBar: true
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'renderer.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- Helper: kirim log ke UI ---
function uiLog(type, message, payload = null) {
  if (!mainWindow) return;
  mainWindow.webContents.send('log', { type, message, payload, ts: new Date().toISOString() });
}

// --- Helper: simulasi key ---
async function pressKey(keys, holdMs = 100) {
  function toNutKey(k) {
    if (!k) return null;
    const lower = k.toLowerCase();
  
    switch (lower) {
      case "space": return Key.Space;
      case "enter": return Key.Enter;
      case "esc": return Key.Escape;
      case "escape": return Key.Escape;
      case "up": return Key.Up;
      case "down": return Key.Down;
      case "left": return Key.Left;
      case "right": return Key.Right;
      case "w": return Key.W;
      case "a": return Key.A;r
      case "d": return Key.D;
      case "r": return Key.R;
      case "l": return Key.L;
      default:
        console.warn("Key belum dimapping:", k);
        return null;
    }
  }

  // Bisa string "esc+r+enter" atau array ["esc","r","enter"]
  let keyList = [];
  if (typeof keys === 'string') {
    keyList = keys.split('+').map(toNutKey);
  } else if (Array.isArray(keys)) {
    keyList = keys.map(toNutKey);
  } else {
    keyList = [toNutKey(keys)];
  }

  if (!keyList.length) return;

  console.log(keyList);

  try {
    for (const k of keyList) {
      await keyboard.pressKey(k); // ⬇️ Key Down
      await new Promise((res) => setTimeout(res, holdMs));
      await keyboard.releaseKey(k); // ⬆️ Key Up
    }
  } catch (e) {
    uiLog('error', `Gagal menekan key kombinasi: ${keys}`, String(e));
  }
}

// --- IPC: update mapping dari UI ---
ipcMain.on('update-mappings', (event, mappings) => {
  if (Array.isArray(mappings)) {
    giftMappings = mappings;
    uiLog('info', `Gift mappings diupdate (${mappings.length} item).`);
  }
});

// --- IPC: start koneksi TikTok ---
ipcMain.handle('connect-tiktok', async (event, { username }) => {
  try {
    if (connection) {
      await connection.disconnect?.().catch(() => {});
      connection = null;
    }

    if (!username || !username.trim()) {
      throw new Error('Username TikTok tidak boleh kosong');
    }

    // Buat koneksi
    connection = new TikTokLiveConnection(username.trim());
    console.log("Start bot pressed, username:", username);
    uiLog('info', `Menghubungkan ke @${username} ...`);

    // Event-once ketika connect
    connection.connect().then((state) => {
      uiLog('success', `Terhubung ke roomId: ${state.roomId}`);
    }).catch((err) => {
      uiLog('error', 'Gagal connect', String(err));
      console.error("Failed to connect:", err);
    });

    // Gift
    connection.on(WebcastEvent.GIFT, async (data) => {
      // Struktur data mungkin berbeda2. Ambil nama gift jika tersedia:
      const giftName =
        data?.giftDetails?.giftName ||
        'UnknownGift';

      const username = data?.uniqueId || data?.user?.uniqueId || data?.user?.nickname || 'unknown';
      const repeatCount = data?.repeatCount || data?.gift?.repeatCount || 1;

      uiLog('gift', `Gift: ${giftName} x${repeatCount} dari ${username}`, data);

      // Cari mapping berdasarkan giftName (case-insensitive, substring allowed)
      const lower = String(giftName).toLowerCase();
      const matched = giftMappings.find(m => lower.includes(String(m.giftName).toLowerCase()));

      if (matched) {
        // Tekan tombol; kalau repeatCount>1 bisa ditekan beberapa kali
        const times = Math.max(1, Number(repeatCount) || 1);
        for (let i = 0; i < times; i++) {
          await pressKey(matched.key, Number(matched.holdMs) || 100);
        }
        uiLog('action', `Aksi: tekan "${matched.key}" x${times} (map dari gift "${matched.giftName}")`);
      }
    });

    // Chat (opsional, buat debugging)
    connection.on(WebcastEvent.CHAT, (data) => {
      const txt = data?.comment || data?.text || '';
      const from = data?.user?.uniqueId || data?.uniqueId || 'unknown';
      uiLog('chat', `${from}: ${txt}`, data);
    });

    connection.on(WebcastEvent.ROOM_USER, (data) => {
      uiLog('info', `Viewers: ${data?.viewerCount ?? 'n/a'}`);
    });

    connection.on(WebcastEvent.LIKE, (data) => {
      uiLog('info', `Likes +${data?.likeCount ?? 0} (total ${data?.totalLikeCount ?? 0})`);
    });

    connection.on('disconnected', () => {
      uiLog('warn', `Terputus dari live.`);
    });

    return { ok: true };
  } catch (e) {
    uiLog('error', 'connect-tiktok error', String(e));
    return { ok: false, error: String(e) };
  }
});

// --- IPC: disconnect ---
ipcMain.handle('disconnect-tiktok', async () => {
  try {
    if (connection) {
      await connection.disconnect?.();
      connection = null;
      uiLog('info', 'Disconnected.');
    }
    return { ok: true };
  } catch (e) {
    uiLog('error', 'disconnect error', String(e));
    return { ok: false, error: String(e) };
  }
});
