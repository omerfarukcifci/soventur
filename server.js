const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;


// CORS ayarları
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://soventur.com', 'https://www.soventur.com'] 
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON parsing
app.use(express.json());

// Static dosyaları serve et
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// React build dosyalarını serve et
app.use(express.static(path.join(__dirname, 'build')));

// Multer konfigürasyonu - dosya yükleme
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    // Dosya adını oluştur: timestamp_originalname
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, 'tour_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Sadece resim dosyalarını kabul et
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir!'), false);
    }
  }
});

// Dosya yükleme endpoint'i
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    // Yüklenen dosyanın URL'ini döndür
    const imageUrl = `/images/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({ error: 'Dosya yüklenirken hata oluştu' });
  }
});


// Müşteri kayıtlarını saklama endpoint'i
app.post('/api/customers', (req, res) => {
  try {
    const customerData = {
      id: Date.now().toString(),
      ...req.body,
      registrationDate: new Date().toISOString()
    };

    // Müşteri kayıtlarını dosyaya yaz
    const customersFile = path.join(__dirname, 'data', 'customers.json');
    
    // data klasörünü oluştur
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
      fs.mkdirSync(path.join(__dirname, 'data'));
    }

    let customers = [];
    if (fs.existsSync(customersFile)) {
      const data = fs.readFileSync(customersFile, 'utf8');
      customers = JSON.parse(data);
    }

    customers.push(customerData);
    fs.writeFileSync(customersFile, JSON.stringify(customers, null, 2));

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
    const customersFile = path.join(__dirname, 'data', 'customers.json');
    
    if (!fs.existsSync(customersFile)) {
      return res.json([]);
    }

    const data = fs.readFileSync(customersFile, 'utf8');
    const customers = JSON.parse(data);
    
    // Tarihe göre sırala (en yeni önce)
    customers.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));

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
  // API route'larını atla
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint bulunamadı' });
  }
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Vercel için export
module.exports = app;

// Sadece local'de server'ı başlat
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} adresinde çalışıyor`);
    console.log(`Dosya yükleme endpoint: http://localhost:${PORT}/api/upload`);
  });
}
