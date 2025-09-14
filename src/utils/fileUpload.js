// Basit dosya yükleme utility'si
export const uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      // Base64 formatında dosyayı oku
      const base64 = e.target.result;
      
      // Dosya adını oluştur
      const fileName = `tour_${Date.now()}_${file.name}`;
      
      // Base64'ü blob'a çevir
      const byteCharacters = atob(base64.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });
      
      // Dosyayı indir (gerçek uygulamada bu backend'e gönderilir)
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // URL'i temizle
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      // Public klasörüne kaydetmek için URL döndür
      resolve(`/images/${fileName}`);
    };
    
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsDataURL(file);
  });
};

// Dosya boyutunu formatla
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Dosya tipini kontrol et
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 3.5 * 1024 * 1024; // 3.5MB (Vercel serverless function limiti)
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: 'Sadece JPEG, PNG, GIF ve WebP formatları desteklenir.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, message: 'Dosya boyutu 3.5MB\'dan küçük olmalıdır. (Vercel serverless function limiti)' };
  }
  
  return { valid: true, message: 'Dosya geçerli.' };
};
