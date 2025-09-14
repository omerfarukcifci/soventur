import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Tour as TourIcon,
} from '@mui/icons-material';

const Registration = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    tourType: '7 Günlük Umre Turu',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // URL parametresinden veya localStorage'dan tur bilgisini al
  useEffect(() => {
    const tourFromUrl = searchParams.get('tour');
    const tourFromStorage = localStorage.getItem('selectedTour');
    
    if (tourFromUrl) {
      setFormData(prev => ({
        ...prev,
        tourType: decodeURIComponent(tourFromUrl)
      }));
    } else if (tourFromStorage) {
      setFormData(prev => ({
        ...prev,
        tourType: tourFromStorage
      }));
      // localStorage'dan temizle
      localStorage.removeItem('selectedTour');
    }
  }, [searchParams]);

  const [tourTypes, setTourTypes] = useState([
    '7 Günlük Umre Turu',
    '10 Günlük Umre Turu', 
    '15 Günlük Umre Turu',
    'Ramazan Umre Turu',
    'Hac Turu 2024',
    'VIP Hac Turu',
    'Aile Hac Turu',
    'İstanbul Dini Turu',
    'Bursa Yeşil Turu',
    'Konya Mevlana Turu',
    'Kudüs Turu',
    'Endülüs Turu',
    'Bosna Hersek Turu'
  ]);

  // Admin panelinden eklenen turları yükle
  useEffect(() => {
    const savedTours = localStorage.getItem('adminTours');
    if (savedTours) {
      const toursData = JSON.parse(savedTours);
      const adminTourNames = toursData.map(tour => tour.title);
      
      // Admin turlarını mevcut listeye ekle (duplicate'leri önle)
      setTourTypes(prev => {
        const combined = [...prev, ...adminTourNames];
        return [...new Set(combined)]; // Duplicate'leri kaldır
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError('');
    
    try {
      const response = await fetch('http://localhost:5001/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        console.log('Müşteri kaydı başarıyla eklendi:', result.message);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            tourType: '7 Günlük Umre Turu',
            message: ''
          });
        }, 3000);
      } else {
        throw new Error(result.message || 'Kayıt işlemi başarısız');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setSubmitError(error.message || 'Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box id="registration" sx={{ py: 10, bgcolor: 'white' }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 'bold',
              mb: 2,
              color: 'text.primary',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Umre Kayıt Formu
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
              fontSize: '1.1rem'
            }}
          >
            Kutsal topraklara yolculuğunuz için kayıt olun. Size en kısa sürede dönüş yapacağız.
          </Typography>
        </Box>

        {isSubmitted ? (
          <Alert severity="success" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Kayıt formunuz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
          </Alert>
        ) : null}

        {submitError ? (
          <Alert severity="error" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            {submitError}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit}>
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <Stack spacing={3}>
              {/* Ad Soyad */}
              <TextField
                fullWidth
                label="Ad Soyad"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                }}
              />

              {/* E-posta */}
              <TextField
                fullWidth
                label="E-posta"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                }}
              />

              {/* Telefon */}
              <TextField
                fullWidth
                label="Telefon"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                }}
              />

              {/* Tur Seçimi */}
              <FormControl fullWidth required>
                <InputLabel>Tur Seçimi</InputLabel>
                <Select
                  name="tourType"
                  value={formData.tourType}
                  onChange={handleChange}
                  label="Tur Seçimi"
                  startAdornment={<TourIcon sx={{ mr: 1, color: 'primary.main' }} />}
                >
                  {tourTypes.map((tour) => (
                    <MenuItem key={tour} value={tour}>
                      {tour}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Mesaj */}
              <TextField
                fullWidth
                label="Ek Mesajınız (İsteğe bağlı)"
                name="message"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Özel isteklerinizi veya sorularınızı buraya yazabilirsiniz..."
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </Button>
            </Stack>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default Registration;
