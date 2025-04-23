const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const startScheduler = require('./scheduler');
const { handleCommand } = require('./handlers/commands');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true },
})

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('📲 Scan QR untuk login...');
})

client.on('ready', () => {
  console.log('✅ WhatsApp Web siap!');
  startScheduler(client);
})

client.on('message', async (message) => {
  if (message.body.startsWith('/reminder')) {
    handleCommand(message, client);
  }
});

client.initialize();
