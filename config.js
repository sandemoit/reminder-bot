module.exports = {
  cooldownSeconds: 10,            // ⏳ Delay antar command (anti-spam)
  defaultReminderMessage: 'Ini reminder default kamu, bisa diubah pakai /reminder message [isi pesan]', // Pesan default
  defaultDays: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"], // 📆 Default: aktif setiap hari
  timezoneOffset: 7               // Kalau mau handle offset waktu (+7 atau +8), bisa diatur di sini
};
