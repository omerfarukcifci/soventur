# 🚀 Şoven Turizm Deploy Rehberi

## 📋 Gereksinimler
- **Hosting:** güzel.net.tr
- **DNS:** ihs.com.tr
- **Domain:** soventur.com

## 🔧 1. Proje Hazırlığı

### Yerel Hazırlık
```bash
# 1. Deploy scriptini çalıştır
./deploy.sh

# 2. Production dependencies yükle
npm install --production

# 3. Test et
node server.js
```

## 📤 2. Güzel.net.tr'ye Dosya Yükleme

### FTP/cPanel ile Yükleme
1. **FTP Bilgileri:** güzel.net.tr'den alacağınız FTP bilgileri
2. **Yüklenecek Dosyalar:**
   ```
   ├── build/                 # React build dosyaları
   ├── public/               # Statik dosyalar
   ├── data/                 # Müşteri verileri (otomatik oluşur)
   ├── server.js             # Ana server dosyası
   ├── package.json          # Dependencies
   ├── ecosystem.config.js   # PM2 konfigürasyonu
   ├── .htaccess            # Apache konfigürasyonu
   └── deploy.sh            # Deploy scripti
   ```

### Önemli Notlar:
- ✅ `node_modules` klasörünü yüklemeyin (sunucuda `npm install` yapılacak)
- ✅ `.env` dosyalarını yüklemeyin
- ✅ `src/` klasörünü yüklemeyin (sadece `build/` yeterli)

## 🖥️ 3. Sunucu Kurulumu

### SSH ile Sunucuya Bağlan
```bash
ssh kullanici_adi@sunucu_ip
```

### Node.js Kurulumu (Eğer yoksa)
```bash
# Node.js 18+ kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kurulumu
sudo npm install -g pm2
```

### Proje Kurulumu
```bash
# Proje klasörüne git
cd /path/to/your/project

# Dependencies yükle
npm install --production

# PM2 ile başlat
pm2 start ecosystem.config.js --env production

# PM2'yi sistem başlangıcında çalıştır
pm2 startup
pm2 save
```

## 🌐 4. DNS Ayarları (ihs.com.tr)

### A Kaydı
```
Type: A
Name: @
Value: güzel.net.tr sunucu IP adresi
TTL: 3600
```

### CNAME Kaydı
```
Type: CNAME
Name: www
Value: soventur.com
TTL: 3600
```

## 🔧 5. Güzel.net.tr Konfigürasyonu

### Apache Virtual Host
```apache
<VirtualHost *:80>
    ServerName soventur.com
    ServerAlias www.soventur.com
    DocumentRoot /path/to/your/project
    
    # Node.js uygulaması için proxy
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:5001/api/
    ProxyPassReverse /api/ http://localhost:5001/api/
    
    # Statik dosyalar için
    <Directory /path/to/your/project>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### .htaccess (Otomatik oluşturuldu)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]
```

## 🚀 6. Uygulamayı Başlatma

### PM2 ile Başlatma
```bash
# Uygulamayı başlat
pm2 start ecosystem.config.js --env production

# Durumu kontrol et
pm2 status

# Logları görüntüle
pm2 logs soventurizm

# Yeniden başlat
pm2 restart soventurizm
```

### Manuel Başlatma
```bash
# Production modunda başlat
NODE_ENV=production node server.js
```

## 🔍 7. Test ve Kontrol

### URL Testleri
- ✅ https://soventur.com
- ✅ https://www.soventur.com
- ✅ https://soventur.com/api/customers
- ✅ Admin panel: https://soventur.com/admin

### Kontrol Listesi
- [ ] Ana sayfa açılıyor
- [ ] Turlar listeleniyor
- [ ] Kayıt formu çalışıyor
- [ ] Admin panel girişi çalışıyor
- [ ] Admin panel erişilebiliyor
- [ ] Resim yükleme çalışıyor
- [ ] Müşteri kayıtları görüntüleniyor

### Admin Panel Giriş Bilgileri
```
Kullanıcı Adı: admin
Şifre: soventur2025
```

## 🛠️ 8. Sorun Giderme

### PM2 Komutları
```bash
# Tüm uygulamaları listele
pm2 list

# Belirli uygulamayı durdur
pm2 stop soventurizm

# Belirli uygulamayı sil
pm2 delete soventurizm

# Logları temizle
pm2 flush
```

### Port Kontrolü
```bash
# Port 5001'in kullanımda olup olmadığını kontrol et
netstat -tulpn | grep :5001

# Port'u kullanan process'i öldür
sudo kill -9 PID_NUMARASI
```

### Log Kontrolü
```bash
# PM2 logları
pm2 logs soventurizm

# Sistem logları
sudo tail -f /var/log/apache2/error.log
```

## 📞 9. Destek

Herhangi bir sorun yaşarsanız:
1. PM2 loglarını kontrol edin: `pm2 logs soventurizm`
2. Apache loglarını kontrol edin
3. DNS propagasyonunu bekleyin (24-48 saat)
4. SSL sertifikası kurulumu için güzel.net.tr desteğine başvurun

## 🎉 Başarılı Deploy!

Uygulamanız artık canlıda! 🚀

**Önemli URL'ler:**
- Ana Site: https://soventur.com
- Admin Panel: https://soventur.com/admin
- API: https://soventur.com/api/
