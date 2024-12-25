const express = require('express');
const app = express();
const path = require('path');

// Мидлвар для парсинга данных формы
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница с формой
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка формы (для примера, но мы не используем ее в данном случае)
app.post('/generate', (req, res) => {
  const { model, article, color, items } = req.body;

  // Логика генерации страницы для печати (это делаем на клиенте)
  const printPage = `
    <html>
      <head><title>Страница для печати</title></head>
      <body>
        <h1>Информация о товаре</h1>
        <p>Модель: ${model}</p>
        <p>Артикул: ${article}</p>
        <p>Цвет: ${color}</p>
        <p>Количество: ${items ? items : 'N/A'}</p>
      </body>
    </html>
  `;
  res.send(printPage);
});

// Запуск сервера
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
