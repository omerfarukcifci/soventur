#!/bin/bash

echo "🚀 Şoven Turizm Deploy Script"
echo "=============================="

# Build React uygulaması
echo "📦 React uygulaması build ediliyor..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build hatası! Deploy iptal edildi."
    exit 1
fi

echo "✅ Build başarılı!"

# Production dependencies yükle
echo "📥 Production dependencies yükleniyor..."
npm install --production

echo "🎉 Deploy hazır! Şimdi dosyaları sunucuya yükleyebilirsiniz."
echo ""
echo "📋 Yapılacaklar:"
echo "1. Bu klasördeki tüm dosyaları güzel.net.tr'ye yükleyin"
echo "2. Node.js uygulamasını başlatın: node server.js"
echo "3. PM2 ile sürekli çalıştırın: pm2 start ecosystem.config.js --env production"
echo "4. DNS ayarlarını ihs.com.tr'de yapın"
