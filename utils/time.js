function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 10) return "Selamat pagi";
  if (hour >= 10 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function getTodayLabel() {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date());
}

module.exports = { getGreeting, getTodayLabel };
