const express = require('express');
const printer = require('printer');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

let lastPrinterIp = null; // Для хранения последнего IP-адреса принтера

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Функция для создания PDF
function generatePdf(model, article, color, items, outputPath) {
  return new Promise((resolve, reject) => {
    const pdfDoc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
    });

    const writeStream = fs.createWriteStream(outputPath);
    pdfDoc.pipe(writeStream);

    // Наполнение PDF
    pdfDoc.font('Helvetica-Bold').fontSize(74).text(model, { align: 'center' });
    pdfDoc.moveDown();
    pdfDoc.fontSize(280).text(article, { align: 'center' });
    pdfDoc.moveDown();
    pdfDoc.fontSize(54).text(color, { align: 'center' });

    if (items) {
      pdfDoc.moveDown();
      pdfDoc.fontSize(54).text(items, { align: 'center' });
    }

    pdfDoc.end();

    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', (err) => reject(err));
  });
}

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка печати
app.post('/print', async (req, res) => {
  const { model, article, color, items, printerIp } = req.body;

  if (!printerIp) {
    return res.status(400).send('Printer IP is required');
  }

  // Обновляем последний IP-адрес
  lastPrinterIp = printerIp;

  const pdfPath = path.join(__dirname, 'output.pdf');

  try {
    // Генерация PDF
    await generatePdf(model, article, color, items, pdfPath);

    // Отправка PDF на принтер через RAW
    const fileData = fs.readFileSync(pdfPath);

    printer.printDirect({
      data: fileData,
      type: 'PDF', // Формат отправляемого файла (если принтер поддерживает PDF)
      printer: `socket://${printerIp}:9100`, // Используем RAW-протокол (JetDirect)
      success: (jobID) => {
        console.log('Document sent to printer with job ID:', jobID);
        res.send('Document sent to printer');
      },
      error: (err) => {
        console.error('Error during printing:', err);
        res.status(500).send('Failed to print');
      },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing print job');
  }
});

// Маршрут для получения последнего IP
app.get('/last-printer-ip', (req, res) => {
  res.json({ printerIp: lastPrinterIp });
});

// Маршрут для обновления IP-адреса
app.post('/last-printer-ip', (req, res) => {
  const { printerIp } = req.body;

  if (!printerIp) {
    return res.status(400).send('Printer IP is required');
  }

  lastPrinterIp = printerIp;
  res.send('Printer IP updated');
});

// Запуск сервера
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
