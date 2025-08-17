import { contextBridge, ipcRenderer } from 'electron';

console.log("Preloaded!");

contextBridge.exposeInMainWorld('botAPI', {
  connect: (username) => ipcRenderer.invoke('connect-tiktok', { username }),
  disconnect: () => ipcRenderer.invoke('disconnect-tiktok'),
  updateMappings: (mappings) => ipcRenderer.send('update-mappings', mappings),
  onLog: (cb) => ipcRenderer.on('log', (_evt, data) => cb(data))
});
