# 📅 WhatsApp Reminder Bot

Bot WhatsApp otomatis kirim pesan reminder harian ke nomor kamu lewat WhatsApp! Dibuat pakai `Node.js` dan `whatsapp-web.js`.

## 🚀 Fitur Utama

- 🔔 Kirim pesan reminder otomatis sesuai jam yang kamu set
- 💬 Pesan reminder bisa custom per jam
- ✅ Aktif/nonaktifkan reminder via chat WA
- ⏱️ Anti-spam cooldown
- 💾 Simpan konfigurasi per-user di file `user-config.json`

## ⚙️ Cara Menjalankan

```bash
git clone https://github.com/sandemoit/reminder-bot.git
cd reminder-bot
npm install
node index.js
```

## 💡 Command WhatsApp

📚 Perintah yang tersedia:
- /reminder on | off
- /reminder set HH:MM
- /reminder days Hari1,Hari2,Hari3
- /reminder once DD/MM/YYYY HH:MM Pesan
- /reminder message [isi_pesan]
- /reminder list
- /reminder delete [nomor]

## 🛡️ Catatan

- Jangan spam command — bot punya sistem cooldown per user
- Session WhatsApp disimpan di session.json, jadi gak perlu scan ulang
- Semua reminder disimpan di user-config.json dan tetap aktif walau bot di-restart

## 📦 Dependensi Utama

- [node-schedule](https://www.npmjs.com/package/node-schedule)
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- fs (File System bawaan Node.js)

## 🧑‍💻 Dibuat oleh

Sandi
Fullstack Web Developer — Sandemo Indo Teknologi
Palembang, Indonesia 🇮🇩

## 🧠 Lisensi
MIT License
