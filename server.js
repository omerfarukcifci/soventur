const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS ayarları
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://soventur.com', 'https://www.soventur.com', 'https://soventur.vercel.app'] 
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON parsing
app.use(express.json());

// React build dosyalarını serve et
app.use(express.static(path.join(__dirname, 'build')));

// Global müşteri verisi (Vercel için)
if (!global.customers) {
  global.customers = [];
}

// Müşteri kayıtlarını saklama endpoint'i
app.post('/api/customers', (req, res) => {
  try {
    const customerData = {
      id: Date.now().toString(),
      ...req.body,
      registrationDate: new Date().toISOString()
    };

    global.customers.push(customerData);

    res.json({
      success: true,
      message: 'Müşteri kaydı başarıyla eklendi!',
      customerId: customerData.id
    });

  } catch (error) {
    console.error('Müşteri kayıt hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Müşteri kaydı sırasında hata oluştu',
      error: error.message
    });
  }
});

// Müşteri kayıtlarını getirme endpoint'i
app.get('/api/customers', (req, res) => {
  try {
    const customers = global.customers.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    res.json(customers);
  } catch (error) {
    console.error('Müşteri kayıtları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Müşteri kayıtları getirilirken hata oluştu',
      error: error.message
    });
  }
});

// React uygulamasını serve et (SPA routing için)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Vercel için export
module.exports = app;

// Sadece local'de server'ı başlat
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} adresinde çalışıyor`);
  });
}