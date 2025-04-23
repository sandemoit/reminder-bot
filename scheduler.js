const { getAllActiveReminders } = require('./handlers/commands');
const { getGreeting, getTodayLabel } = require('./utils/time');
const fs = require('fs');
const path = './user-config.json';

function saveUserConfig(data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Failed to save config:', err);
  }
}

function startScheduler(client) {
  setInterval(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    const today = getTodayLabel();

    // Format tanggal DD/MM/YYYY untuk one-time reminder
    const currentDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const users = getAllActiveReminders();
    let configChanged = false;

    Object.entries(users).forEach(([user, data]) => {
      if (!data.active) return;
      const reminders = data.reminders || [];

      // Membuat array untuk menyimpan indeks reminder yang perlu dihapus
      const toRemove = [];

      reminders.forEach((reminder, index) => {
        if (reminder.oneTime) {
          // Cek reminder satu kali
          if (reminder.date === currentDate && reminder.time === currentTime) {
            const greeting = getGreeting();
            const msg = `${greeting}, tuan! [Reminder Satu Kali] ${reminder.message}`;
            client.sendMessage(user, msg);
            console.log(`✅ Reminder satu kali dikirim ke ${user} - ${reminder.date} ${reminder.time}`);

            // Tandai untuk dihapus nanti
            toRemove.push(index);
            configChanged = true;
          }
        } else {
          // Cek reminder reguler
          if (reminder.time === currentTime && reminder.days.includes(today)) {
            const greeting = getGreeting();
            const msg = `${greeting}, tuan! ${reminder.message}`;
            client.sendMessage(user, msg);
            console.log(`✅ Reminder dikirim ke ${user} - ${reminder.time}`);
          }
        }
      });

      // Hapus reminder satu kali yang sudah dieksekusi (dari belakang agar tidak mempengaruhi indeks)
      if (toRemove.length > 0) {
        for (let i = toRemove.length - 1; i >= 0; i--) {
          users[user].reminders.splice(toRemove[i], 1);
        }
      }
    });

    // Simpan konfigurasi jika ada perubahan
    if (configChanged) {
      saveUserConfig(users);
    }
  }, 60 * 1000); // cek tiap 1 menit
}

// Untuk kompatibilitas dengan index.js yang mungkin menggunakan salah satu nama fungsi
module.exports = startScheduler;
module.exports.startScheduler = startScheduler;
