const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { put, get, del } = require('@vercel/blob');

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

// JSON parsing - Vercel için büyük dosyalar için limit artırıldı
app.use(express.json({ limit: '10mb' }));

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

// Blob Storage'da veri dosyalarını yönet
const DATA_FILES = {
  tours: 'data/tours.json',
  customers: 'data/customers.json'
};

// Veri dosyasını oku
async function readDataFile(filename) {
  try {
    const blob = await get(filename);
    const text = await blob.text();
    return JSON.parse(text);
  } catch (error) {
    console.log(`Data file ${filename} not found, returning empty array`);
    return [];
  }
}

// Veri dosyasını yaz
async function writeDataFile(filename, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = await put(filename, jsonString, {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    });
    console.log(`Data file ${filename} updated successfully`);
    return blob;
  } catch (error) {
    console.error(`Error writing data file ${filename}:`, error);
    throw error;
  }
}

// Dosya yükleme endpoint'i - Vercel Blob Storage ile
app.post('/api/upload', async (req, res) => {
  try {
    console.log('Upload endpoint called');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body keys:', Object.keys(req.body));
    
    // Base64 verisini al
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'Resim verisi gerekli' });
    }
    
    // Base64 verisini kontrol et
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Geçersiz resim formatı' });
    }
    
    // Dosya boyutu kontrolü (Vercel Blob Storage için 5MB limit)
    const base64Size = imageData.length;
    const maxSize = 5 * 1024 * 1024; // 5MB (Vercel Blob Storage limiti)
    
    console.log('Dosya boyutu kontrolü:');
    console.log('Base64 size:', base64Size, 'bytes');
    console.log('Max size:', maxSize, 'bytes');
    console.log('Size in KB:', Math.round(base64Size / 1024), 'KB');
    console.log('Size in MB:', Math.round(base64Size / 1024 / 1024 * 100) / 100, 'MB');
    
    if (base64Size > maxSize) {
      return res.status(413).json({ 
        error: `Dosya boyutu çok büyük. Maksimum 5MB resim yükleyebilirsiniz. (Mevcut: ${Math.round(base64Size / 1024)}KB)` 
      });
    }
    
    // Base64'ü buffer'a çevir
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Dosya adını oluştur
    const timestamp = Date.now();
    const filename = `tour_${timestamp}.jpg`;
    
    // Vercel Blob Storage'a yükle
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/jpeg'
    });
    
    console.log('Blob uploaded successfully:', blob.url);
    
    res.json({
      success: true,
      imageUrl: blob.url,
      filename: filename,
      originalName: filename,
      size: buffer.length
    });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({ error: 'Dosya yüklenirken hata oluştu: ' + error.message });
  }
});

// Tur yönetimi endpoint'leri
app.get('/api/tours', async (req, res) => {
  try {
    const tours = await readDataFile(DATA_FILES.tours);
    res.json(tours);
  } catch (error) {
    console.error('Tur listesi getirme hatası:', error);
    res.status(500).json({ error: 'Tur listesi getirilirken hata oluştu' });
  }
});

app.post('/api/tours', async (req, res) => {
  try {
    const { title, description, price, duration, image, date } = req.body;
    
    // Mevcut turları oku
    const tours = await readDataFile(DATA_FILES.tours);
    
    // Yeni tur oluştur
    const newTour = {
      id: Date.now().toString(),
      title,
      description,
      price: parseFloat(price),
      duration,
      image,
      date,
      createdAt: new Date().toISOString()
    };
    
    // Turları güncelle
    tours.push(newTour);
    await writeDataFile(DATA_FILES.tours, tours);
    
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

app.put('/api/tours/:id', async (req, res) => {
  try {
    const tourId = req.params.id;
    const { title, description, price, duration, image, date } = req.body;
    
    // Mevcut turları oku
    const tours = await readDataFile(DATA_FILES.tours);
    
    // Turu bul ve güncelle
    const tourIndex = tours.findIndex(tour => tour.id === tourId);
    
    if (tourIndex === -1) {
      return res.status(404).json({ error: 'Tur bulunamadı' });
    }
    
    tours[tourIndex] = {
      ...tours[tourIndex],
      title,
      description,
      price: parseFloat(price),
      duration,
      image,
      date,
      updatedAt: new Date().toISOString()
    };
    
    // Güncellenmiş turları kaydet
    await writeDataFile(DATA_FILES.tours, tours);
    
    res.json({
      success: true,
      message: 'Tur başarıyla güncellendi!',
      tour: tours[tourIndex]
    });
  } catch (error) {
    console.error('Tur güncelleme hatası:', error);
    res.status(500).json({ error: 'Tur güncellenirken hata oluştu' });
  }
});

app.delete('/api/tours/:id', async (req, res) => {
  try {
    const tourId = req.params.id;
    
    // Mevcut turları oku
    const tours = await readDataFile(DATA_FILES.tours);
    
    // Turu bul ve sil
    const tourIndex = tours.findIndex(tour => tour.id === tourId);
    
    if (tourIndex === -1) {
      return res.status(404).json({ error: 'Tur bulunamadı' });
    }
    
    tours.splice(tourIndex, 1);
    await writeDataFile(DATA_FILES.tours, tours);
    
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
app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, tourId, message } = req.body;
    
    // Mevcut müşterileri oku
    const customers = await readDataFile(DATA_FILES.customers);
    
    // Yeni müşteri oluştur
    const customerData = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      tourId,
      message,
      createdAt: new Date().toISOString()
    };
    
    // Müşterileri güncelle
    customers.push(customerData);
    await writeDataFile(DATA_FILES.customers, customers);

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
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await readDataFile(DATA_FILES.customers);
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
  
  // Vercel'de build dosyası yolu - vercel-build script ile build edildiği için
  const indexPath = path.join(process.cwd(), 'build', 'index.html');
  
  console.log('Looking for index.html at:', indexPath);
  console.log('__dirname:', __dirname);
  console.log('process.cwd():', process.cwd());
  console.log('Files in process.cwd():', require('fs').readdirSync(process.cwd()));
  
  if (!require('fs').existsSync(indexPath)) {
    console.error('index.html not found at:', indexPath);
    console.log('Available files in build directory:');
    const buildDir = path.join(process.cwd(), 'build');
    if (require('fs').existsSync(buildDir)) {
      console.log(require('fs').readdirSync(buildDir));
    } else {
      console.log('Build directory does not exist');
    }
    return res.status(500).send('Build files not found');
  }
  
  console.log('Found index.html at:', indexPath);
  
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