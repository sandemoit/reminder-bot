const fs = require('fs');
const path = './user-config.json';
const appConfig = require('../config');

const cooldown = {};
const COOLDOWN_SECONDS = 10;

function loadUserConfig() {
  try {
    if (fs.existsSync(path)) {
      return JSON.parse(fs.readFileSync(path));
    }
  } catch (err) {
    console.error('❌ Failed to load config:', err);
  }
  return {};
}

function saveUserConfig(data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Failed to save config:', err);
  }
}

let config = loadUserConfig();

function validateDate(dateStr) {
  // Format tanggal: DD/MM/YYYY
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateStr.match(regex);

  if (!match) return false;

  const day = parseInt(match[1]);
  const month = parseInt(match[2]) - 1;
  const year = parseInt(match[3]);

  const date = new Date(year, month, day);

  return date.getDate() === day &&
    date.getMonth() === month &&
    date.getFullYear() === year;
}

function handleCommand(message, client) {
  const sender = message.from;
  const now = Date.now();

  if (cooldown[sender] && now - cooldown[sender] < COOLDOWN_SECONDS * 1000) {
    client.sendMessage(sender, '⏳ Tunggu beberapa detik dulu ya bro...');
    return;
  }
  cooldown[sender] = now;

  // Pastikan objek config untuk pengguna ini sudah terdefinisi dengan benar
  if (!config[sender]) {
    config[sender] = { active: true, reminders: [] };
  } else if (!config[sender].reminders) {
    config[sender].reminders = [];
  }

  const text = message.body.trim();
  const parts = text.split(" ");
  const cmd = parts[0].toLowerCase();

  switch (cmd) {
    case '/reminder':
      const sub = parts[1]?.toLowerCase();

      if (sub === 'on') {
        config[sender].active = true;
        client.sendMessage(sender, '✅ Reminder diaktifkan.');
      } else if (sub === 'off') {
        config[sender].active = false;
        client.sendMessage(sender, '🔕 Reminder dimatikan.');
      } else if (sub === 'set') {
        const time = parts[2];
        if (!/^\d{2}:\d{2}$/.test(time)) return client.sendMessage(sender, '❌ Format jam salah. Contoh: /reminder set 08:00');

        config[sender].reminders.push({
          time,
          days: appConfig.defaultDays,
          message: appConfig.defaultReminderMessage
        });
        client.sendMessage(sender, `🕰️ Reminder ditambahkan untuk jam ${time}.`);
      } else if (sub === 'days') {
        // Fitur baru: pengaturan hari spesifik
        if (config[sender].reminders.length === 0) {
          return client.sendMessage(sender, '❌ Belum ada reminder. Tambahkan dulu pakai /reminder set HH:MM');
        }

        const daysInput = parts[2];
        if (!daysInput) {
          return client.sendMessage(sender, '❌ Format salah. Contoh: /reminder days Senin,Rabu,Jumat');
        }

        const validDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
        const selectedDays = daysInput.split(',').map(day => {
          // Capitalize first letter
          return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
        });

        // Validate days
        const invalidDays = selectedDays.filter(day => !validDays.includes(day));
        if (invalidDays.length > 0) {
          return client.sendMessage(sender, `❌ Hari tidak valid: ${invalidDays.join(', ')}.\nHari valid: ${validDays.join(', ')}`);
        }

        // Apply to the most recent reminder
        const lastReminder = config[sender].reminders[config[sender].reminders.length - 1];
        lastReminder.days = selectedDays;

        client.sendMessage(sender, `📅 Hari reminder diubah menjadi: ${selectedDays.join(', ')}`);
      } else if (sub === 'once') {
        // Fitur baru: reminder satu kali
        if (parts.length < 5) {
          return client.sendMessage(sender, '❌ Format salah. Contoh: /reminder once 23/05/2025 08:00 Jangan lupa meeting!');
        }

        const dateStr = parts[2];
        const timeStr = parts[3];
        const reminderMsg = parts.slice(4).join(" ");

        // Validasi format tanggal (DD/MM/YYYY)
        if (!validateDate(dateStr)) {
          return client.sendMessage(sender, '❌ Format tanggal salah. Gunakan format DD/MM/YYYY (contoh: 23/05/2025)');
        }

        // Validasi format waktu (HH:MM)
        if (!/^\d{2}:\d{2}$/.test(timeStr)) {
          return client.sendMessage(sender, '❌ Format waktu salah. Gunakan format HH:MM (contoh: 08:00)');
        }

        // Tambahkan reminder satu kali
        config[sender].reminders.push({
          time: timeStr,
          date: dateStr, // Tambahkan tanggal spesifik
          oneTime: true, // Tanda bahwa ini reminder satu kali
          message: reminderMsg || appConfig.defaultReminderMessage
        });

        client.sendMessage(sender, `📌 Reminder satu kali ditambahkan untuk tanggal ${dateStr} jam ${timeStr}.`);
      } else if (sub === 'message') {
        const newMsg = parts.slice(2).join(" ");
        const last = config[sender].reminders[config[sender].reminders.length - 1];
        if (last) {
          last.message = newMsg;
          client.sendMessage(sender, '✏️ Pesan reminder terakhir diupdate.');
        } else {
          client.sendMessage(sender, '❌ Belum ada reminder. Tambahkan dulu pakai /reminder set HH:MM');
        }
      } else if (sub === 'list') {
        const list = config[sender].reminders;
        if (list.length === 0) return client.sendMessage(sender, '📭 Belum ada reminder.');

        const text = list.map((r, i) => {
          if (r.oneTime) {
            return `${i + 1}. [SEKALI] ${r.date} ${r.time}\n   "${r.message}"`;
          } else {
            return `${i + 1}. ${r.time} (${r.days.join(", ")})\n   "${r.message}"`;
          }
        }).join("\n\n");

        client.sendMessage(sender, `📋 Daftar Reminder:\n\n${text}`);
      } else if (sub === 'delete') {
        const index = parseInt(parts[2]) - 1;
        if (isNaN(index) || index < 0 || index >= config[sender].reminders.length) {
          client.sendMessage(sender, '❌ Index tidak valid. Lihat list pakai /reminder list');
        } else {
          config[sender].reminders.splice(index, 1);
          client.sendMessage(sender, '🗑️ Reminder dihapus.');
        }
      } else if (sub === 'help' || !sub) {
        client.sendMessage(sender, `📚 Perintah yang tersedia:
- /reminder on | off
- /reminder set HH:MM
- /reminder days Hari1,Hari2,Hari3
- /reminder once DD/MM/YYYY HH:MM Pesan
- /reminder message [isi pesan]
- /reminder list
- /reminder delete [nomor]
- /reminder help`);
      }
      break;
  }

  saveUserConfig(config);
}

function getAllActiveReminders() {
  return config;
}

module.exports = { handleCommand, getAllActiveReminders };
