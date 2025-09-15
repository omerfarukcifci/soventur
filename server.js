const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { put, get, del } = require('@vercel/blob');

const app = express();

// Blob Storage token kontrolü
console.log('BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
console.log('BLOB_READ_WRITE_TOKEN length:', process.env.BLOB_READ_WRITE_TOKEN ? process.env.BLOB_READ_WRITE_TOKEN.length : 0);
console.log('BLOB_READ_WRITE_TOKEN starts with:', process.env.BLOB_READ_WRITE_TOKEN ? process.env.BLOB_READ_WRITE_TOKEN.substring(0, 10) + '...' : 'undefined');
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

// Veri dosyasını oku (Cache-aware)
async function readDataFile(filename) {
  try {
    console.log(`[READ] Attempting to read ${filename}...`);
    const blob = await get(filename);
    
    if (!blob) {
      console.log(`[READ] Blob not found for ${filename}`);
      return [];
    }
    
    const text = await blob.text();
    if (!text || text.trim() === '') {
      console.log(`[READ] Empty blob content for ${filename}`);
      return [];
    }
    
    const data = JSON.parse(text);
    console.log(`[READ] SUCCESS: ${filename} loaded with ${data.length} items`);
    return data;
  } catch (error) {
    console.log(`[READ] ERROR reading ${filename}:`, error.message);
    console.log(`[READ] Returning empty array for ${filename}`);
    return [];
  }
}

// Veri dosyasını yaz
async function writeDataFile(filename, data) {
  try {
    console.log(`[WRITE] Attempting to write ${filename} with ${data.length} items`);
    console.log(`[WRITE] Sample data:`, data[0] ? JSON.stringify(data[0], null, 2) : 'No data');
    
    const jsonString = JSON.stringify(data, null, 2);
    console.log(`[WRITE] JSON string length: ${jsonString.length} characters`);
    
    console.log(`[WRITE] Calling put() with filename: ${filename}`);
    const blob = await put(filename, jsonString, {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    });
    
    console.log(`[WRITE] SUCCESS: ${filename} written to ${blob.url}`);
    console.log(`[WRITE] Blob URL: ${blob.url}`);
    
    // Verification kaldırıldı - get fonksiyonu sorunu
    console.log(`[WRITE] Write operation completed successfully`);
    
    return blob;
  } catch (error) {
    console.error(`[WRITE] ERROR writing ${filename}:`, error);
    console.error(`[WRITE] Error name:`, error.name);
    console.error(`[WRITE] Error message:`, error.message);
    console.error(`[WRITE] Error code:`, error.code);
    console.error(`[WRITE] Error stack:`, error.stack);
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
    console.log('[GET /api/tours] Starting tour fetch...');
    
    // Retry mekanizması - 3 deneme
    let tours = [];
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts && tours.length === 0) {
      attempts++;
      console.log(`[GET /api/tours] Attempt ${attempts}/${maxAttempts}`);
      
      tours = await readDataFile(DATA_FILES.tours);
      
      if (tours.length === 0 && attempts < maxAttempts) {
        console.log(`[GET /api/tours] No data found, waiting 1 second before retry...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`[GET /api/tours] Final result: ${tours.length} tours found`);
    res.json(tours);
  } catch (error) {
    console.error('[GET /api/tours] ERROR:', error);
    res.status(500).json({ error: 'Tur listesi getirilirken hata oluştu: ' + error.message });
  }
});

app.post('/api/tours', async (req, res) => {
  try {
    console.log('[POST /api/tours] Starting tour creation...');
    console.log('[POST /api/tours] Full request body:', req.body);
    console.log('[POST /api/tours] Request body keys:', Object.keys(req.body));
    console.log('[POST /api/tours] Request body values:', Object.values(req.body));
    
    const { title, description, price, image, startDate, endDate, category } = req.body;
    console.log('[POST /api/tours] Destructured data:', { title, price, startDate, endDate, category });
    
    // Mevcut turları oku
    console.log('[POST /api/tours] Reading existing tours...');
    const tours = await readDataFile(DATA_FILES.tours);
    console.log('[POST /api/tours] Current tours count:', tours.length);
    
    // Yeni tur oluştur
    const newTour = {
      id: Date.now().toString(),
      title,
      description,
      price: parseFloat(price),
      image,
      startDate,
      endDate,
      category,
      createdAt: new Date().toISOString()
    };
    console.log('[POST /api/tours] New tour created:', newTour.id, newTour.title);
    
    // Turları güncelle
    tours.push(newTour);
    console.log('[POST /api/tours] Tours array after push:', tours.length);
    
    console.log('[POST /api/tours] Calling writeDataFile...');
    await writeDataFile(DATA_FILES.tours, tours);
    console.log('[POST /api/tours] writeDataFile completed successfully');
    
    res.json({
      success: true,
      message: 'Tur başarıyla eklendi!',
      tour: newTour
    });
  } catch (error) {
    console.error('[POST /api/tours] ERROR:', error);
    console.error('[POST /api/tours] Error name:', error.name);
    console.error('[POST /api/tours] Error message:', error.message);
    console.error('[POST /api/tours] Error stack:', error.stack);
    res.status(500).json({ error: 'Tur eklenirken hata oluştu: ' + error.message });
  }
});

app.put('/api/tours/:id', async (req, res) => {
  try {
    const tourId = req.params.id;
    const { title, description, price, image, startDate, endDate, category } = req.body;
    
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
      image,
      startDate,
      endDate,
      category,
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