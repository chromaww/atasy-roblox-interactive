import { WebcastPushConnection } from 'tiktok-live-connector';

let tiktok = new WebcastPushConnection("kopis_cau");

tiktok.connect()
  .then(state => {
    console.log("✅ Connected to room:", state.roomId);
  })
  .catch(err => {
    console.error("❌ Failed to connect:", err);
  });

// Listener gift
tiktok.on('gift', data => {
  const giftName = data.giftName || "Unknown Gift";
  const sender = data.uniqueId || "Unknown User";

  console.log(`🎁 ${sender} sent ${giftName}`);

  // Cek gambar gift (opsional)
  if (data.giftImage && data.giftImage.url_list && data.giftImage.url_list.length > 0) {
    console.log("Gift image:", data.giftImage.url_list[0]);
  }
});
