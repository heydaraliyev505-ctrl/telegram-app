const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 8080;

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('BOT_TOKEN не задан в .env');
  process.exit(1);
}

// Middleware для парсинга JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Простая проверка initData (Telegram Web App)
function verifyTelegramInitData(initData) {
  if (!initData) return null;

  const dataCheckString = Object.keys(initData)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${initData[key]}`)
    .join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();

  const hash = crypto.createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');

  if (hash === initData.hash) {
    try {
      const user = JSON.parse(initData.user);
      return {
        id: user.id,
        first_name: user.first_name,
        username: user.username || null,
        photo_url: user.photo_url || null
      };
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Защищённый API пример
app.post('/api/user', (req, res) => {
  const initData = req.body.initDataUnsafe || {};
  const user = verifyTelegramInitData(initData);

  if (!user) {
    return res.status(403).json({ error: 'Неверная авторизация Telegram' });
  }

  // Здесь потом будет логика с базой
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.first_name,
      username: user.username,
      balance: 1434,          // заглушка
      referrals: 0,           // заглушка
      regDate: '11 февраля 2026'
    }
  });
});

// Главная страница Mini App
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(`Сервер запущен → http://localhost:${port}`);
  console.log(`Mini App будет доступен по ссылке бота после настройки в @BotFather`);
});