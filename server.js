const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

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

// Multer konfigürasyonu - Vercel için memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir!'), false);
    }
  }
});

// React build dosyalarını serve et
app.use(express.static(path.join(__dirname, 'build')));

// Global veriler (Vercel için)
if (!global.customers) {
  global.customers = [];
}

if (!global.tours) {
  global.tours = [];
}

// Dosya yükleme endpoint'i
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    // Vercel'de base64 olarak döndür
    const base64 = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: req.file.originalname,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({ error: 'Dosya yüklenirken hata oluştu' });
  }
});

// Tur yönetimi endpoint'leri
app.get('/api/tours', (req, res) => {
  try {
    res.json(global.tours);
  } catch (error) {
    console.error('Tur listesi getirme hatası:', error);
    res.status(500).json({ error: 'Tur listesi getirilirken hata oluştu' });
  }
});

app.post('/api/tours', (req, res) => {
  try {
    const newTour = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    global.tours.push(newTour);
    
    res.json({
      success: true,
      message: 'Tur başarıyla eklendi!',
      tour: newTour
    });
  } catch (error) {
    console.error('Tur ekleme hatası:', error);
    res.status(500).json({ error: 'Tur eklenirken hata oluştu' });
  }
});

app.put('/api/tours/:id', (req, res) => {
  try {
    const tourId = req.params.id;
    const tourIndex = global.tours.findIndex(tour => tour.id === tourId);
    
    if (tourIndex === -1) {
      return res.status(404).json({ error: 'Tur bulunamadı' });
    }
    
    global.tours[tourIndex] = {
      ...global.tours[tourIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Tur başarıyla güncellendi!',
      tour: global.tours[tourIndex]
    });
  } catch (error) {
    console.error('Tur güncelleme hatası:', error);
    res.status(500).json({ error: 'Tur güncellenirken hata oluştu' });
  }
});

app.delete('/api/tours/:id', (req, res) => {
  try {
    const tourId = req.params.id;
    const tourIndex = global.tours.findIndex(tour => tour.id === tourId);
    
    if (tourIndex === -1) {
      return res.status(404).json({ error: 'Tur bulunamadı' });
    }
    
    global.tours.splice(tourIndex, 1);
    
    res.json({
      success: true,
      message: 'Tur başarıyla silindi!'
    });
  } catch (error) {
    console.error('Tur silme hatası:', error);
    res.status(500).json({ error: 'Tur silinirken hata oluştu' });
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

// React uygulamasını serve et (SPA routing için) - API route'larından sonra
app.use((req, res) => {
  console.log('Request path:', req.path);
  console.log('Request method:', req.method);
  
  // API route'larını atla
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint bulunamadı' });
  }
  
  // Build dosyasının varlığını kontrol et
  const indexPath = path.join(__dirname, 'build', 'index.html');
  console.log('Looking for index.html at:', indexPath);
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Vercel için export
module.exports = app;

// Sadece local'de server'ı başlat
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} adresinde çalışıyor`);
  });
}