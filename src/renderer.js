// Penyimpanan mapping lokal (UI). Default sama seperti di main.js:
let mappings = [
    { giftName: 'Rose', key: 'a', holdMs: 20 },
    { giftName: 'Fairy Wings', key: 'd', holdMs: 20 },
    { giftName: 'Friendship Necklace', key: 'space', holdMs: 20 },
    { giftName: 'Hat and Mustache', key: 'esc+r+enter', holdMs: 20 }
  ];
  
  const el = (id) => document.getElementById(id);
  const logEl = el('log');
  const mapBody = el('map-body');
  
  function renderMappings() {
    mapBody.innerHTML = '';
    mappings.forEach((m, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${m.giftName}</td>
        <td>${m.key}</td>
        <td>${m.holdMs}</td>
        <td><button data-idx="${idx}" class="danger btn-del">Hapus</button></td>
      `;
      mapBody.appendChild(tr);
    });
  
    // bind delete
    document.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = Number(e.target.getAttribute('data-idx'));
        mappings.splice(i, 1);
        renderMappings();
      });
    });
  }
  
  function pushLog({ type, message, ts }) {
    const d = document.createElement('div');
    d.className = `log-line ${type || 'info'}`;
    d.textContent = `[${new Date(ts || Date.now()).toLocaleTimeString()}] ${message}`;
    logEl.prepend(d);
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    renderMappings();
  
    document.getElementById('btn-add').addEventListener('click', () => {
      const name = el('giftName').value.trim();
      const key = el('giftKey').value.trim();
      const hold = Number(el('giftHold').value || '0');
  
      if (!name || !key) return alert('Gift name dan key wajib diisi.');
      mappings.push({ giftName: name, key, holdMs: hold || 100 });
      renderMappings();
  
      el('giftName').value = '';
      el('giftKey').value = '';
      el('giftHold').value = '';
    });
  
    document.getElementById('btn-save').addEventListener('click', () => {
      window.botAPI.updateMappings(mappings);
      pushLog({ type: 'info', message: `Mapping dikirim ke bot (${mappings.length} item).` });
    });
  
    document.getElementById('btn-connect').addEventListener('click', async () => {
      const username = el('username').value.trim();
      if (!username) return alert('Isi username TikTok dulu ya.');
  
      // kirim mapping dulu agar sinkron
      window.botAPI.updateMappings(mappings);
  
      const r = await window.botAPI.connect(username);
      if (!r?.ok) {
        pushLog({ type: 'error', message: `Gagal connect: ${r?.error || 'Unknown'}` });
      } else {
        pushLog({ type: 'success', message: `Connecting ke @${username}...` });
      }
    });
  
    document.getElementById('btn-disconnect').addEventListener('click', async () => {
      const r = await window.botAPI.disconnect();
      if (!r?.ok) {
        pushLog({ type: 'error', message: `Gagal disconnect: ${r?.error || 'Unknown'}` });
      } else {
        pushLog({ type: 'info', message: `Disconnected.` });
      }
    });
  
    window.botAPI.onLog((data) => pushLog(data));
  });
  