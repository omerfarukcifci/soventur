import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { scrollToSection } from '../utils/smoothScroll';

const Tours = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentSlide, setCurrentSlide] = useState({});
  const [tourCategories, setTourCategories] = useState([]);

  // API'den turları yükle
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch('/api/tours');
        if (response.ok) {
          const toursData = await response.json();
          
          // Turları kategorilere göre grupla
          const categories = {
            umre: { id: 'umre', title: 'Umre Turları', tours: [] },
            hac: { id: 'hac', title: 'Hac Turları', tours: [] },
            yurtici: { id: 'yurtici', title: 'Yurtiçi Turlar', tours: [] },
            yurtdisi: { id: 'yurtdisi', title: 'Yurtdışı Turlar', tours: [] }
          };

          toursData.forEach(tour => {
            // Veritabanından gelen category alanını kullan
            const category = tour.category || 'umre'; // varsayılan

            if (categories[category]) {
              categories[category].tours.push({
                name: tour.title,
                date: tour.date || 'Tarih belirtilmemiş',
                startDate: tour.date, // Tarih filtresi için
                price: tour.price ? `₺${tour.price.toLocaleString()}` : 'Fiyat belirtilmemiş',
                image: tour.image,
                description: tour.description,
                duration: tour.duration || 'Süre belirtilmemiş'
              });
            }
          });

          setTourCategories(Object.values(categories).filter(cat => cat.tours.length > 0));
        } else {
          // Fallback: Varsayılan turlar
          const defaultCategories = [
            {
              id: 'umre',
              title: 'Umre Turları',
              tours: [
                { 
                  name: '7 Günlük Umre Turu', 
                  date: '15.03.2024 - 22.03.2024', 
                  price: '₺8,500',
                  image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                  description: 'Mekke ve Medine ziyareti, konaklama dahil'
                }
              ]
            }
          ];
          setTourCategories(defaultCategories);
        }
      } catch (error) {
        console.error('Tur verileri yüklenemedi:', error);
        // Fallback: Varsayılan turlar
        const defaultCategories = [
          {
            id: 'umre',
            title: 'Umre Turları',
            tours: [
              { 
                name: '7 Günlük Umre Turu', 
                date: '15.03.2024 - 22.03.2024', 
                price: '₺8,500',
                image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                description: 'Mekke ve Medine ziyareti, konaklama dahil'
              }
            ]
          }
        ];
        setTourCategories(defaultCategories);
      }
    };

    fetchTours();
  }, []);

  // Artık localStorage dinlemiyoruz, API'den veri alıyoruz

  const filters = [
    { id: 'all', label: 'Tümü' },
    { id: 'umre', label: 'Umre' },
    { id: 'hac', label: 'Hac' },
    { id: 'yurtici', label: 'Yurtiçi' },
    { id: 'yurtdisi', label: 'Yurtdışı' }
  ];

  const dateFilters = [
    { id: 'all', label: 'Tüm Tarihler' },
    { id: 'thisMonth', label: 'Bu Ay' },
    { id: 'nextMonth', label: 'Gelecek Ay' },
    { id: 'next3Months', label: 'Gelecek 3 Ay' },
    { id: 'next6Months', label: 'Gelecek 6 Ay' },
    { id: 'nextYear', label: 'Gelecek Yıl' }
  ];

  // Tarih filtresi fonksiyonu
  const isDateInRange = (tourDate, filter) => {
    if (filter === 'all') return true;
    if (!tourDate) return false; // Tarih yoksa false döndür
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün başlangıcı
    
    const tourDateObj = new Date(tourDate);
    tourDateObj.setHours(0, 0, 0, 0); // Tur tarihinin başlangıcı
    
    switch (filter) {
      case 'thisMonth':
        return tourDateObj.getMonth() === today.getMonth() && 
               tourDateObj.getFullYear() === today.getFullYear();
      case 'nextMonth':
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        return tourDateObj >= nextMonth && tourDateObj <= nextMonthEnd;
      case 'next3Months':
        const threeMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, 31);
        return tourDateObj > today && tourDateObj <= threeMonthsFromNow;
      case 'next6Months':
        const sixMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 6, 31);
        return tourDateObj > today && tourDateObj <= sixMonthsFromNow;
      case 'nextYear':
        const nextYearStart = new Date(today.getFullYear() + 1, 0, 1);
        const nextYearEnd = new Date(today.getFullYear() + 1, 11, 31);
        return tourDateObj >= nextYearStart && tourDateObj <= nextYearEnd;
      default:
        return true;
    }
  };

  // Filtrelenmiş kategorileri hesapla
  const filteredCategories = tourCategories
    .filter(category => selectedFilter === 'all' || category.id === selectedFilter)
    .map(category => ({
      ...category,
      tours: category.tours.filter(tour => {
        // Tarih filtresi kontrolü
        if (dateFilter !== 'all' && tour.startDate) {
          const isInRange = isDateInRange(tour.startDate, dateFilter);
          console.log(`Tour: ${tour.name}, Date: ${tour.startDate}, Filter: ${dateFilter}, InRange: ${isInRange}`);
          return isInRange;
        }
        return true;
      })
    }))
    .filter(category => category.tours.length > 0); // Boş kategorileri kaldır

  const nextSlide = (categoryId) => {
    const category = tourCategories.find(cat => cat.id === categoryId);
    if (category) {
      const maxSlides = Math.ceil(category.tours.length / 3) - 1;
      setCurrentSlide(prev => ({
        ...prev,
        [categoryId]: Math.min((prev[categoryId] || 0) + 1, maxSlides)
      }));
    }
  };

  const prevSlide = (categoryId) => {
    setCurrentSlide(prev => ({
      ...prev,
      [categoryId]: Math.max((prev[categoryId] || 0) - 1, 0)
    }));
  };

  const handleRegister = (tourName) => {
    // Tur seçimini localStorage'a kaydet
    localStorage.setItem('selectedTour', tourName);
    
    // Kayıt bölümüne smooth scroll yap
    setTimeout(() => {
      scrollToSection('registration');
    }, 100);
  };

  return (
    <Box id="tours" sx={{ pt: 4, pb: 10, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">

        {/* Filter Section - Minimalist */}
        <Box sx={{ 
          mb: 4,
          p: 3,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems="center" 
            justifyContent="space-between"
          >
            {/* Sol taraf - Tur Türü */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {filters.map((filter) => (
                <Chip
                  key={filter.id}
                  label={filter.label}
                  onClick={() => setSelectedFilter(filter.id)}
                  variant={selectedFilter === filter.id ? 'filled' : 'outlined'}
                  color={selectedFilter === filter.id ? 'primary' : 'default'}
                  size="small"
                  sx={{
                    fontWeight: selectedFilter === filter.id ? 'bold' : 'medium',
                    '&:hover': {
                      bgcolor: selectedFilter === filter.id ? 'primary.main' : 'primary.100',
                    },
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Stack>

            {/* Sağ taraf - Tarih Filtresi */}
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel size="small">Tarih</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Tarih"
                size="small"
                sx={{ 
                  bgcolor: 'white',
                }}
              >
                {dateFilters.map((filter) => (
                  <MenuItem key={filter.id} value={filter.id}>
                    {filter.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Tour Categories */}
        <Stack spacing={6}>
          {filteredCategories.map((category, index) => {
            const currentSlideIndex = currentSlide[category.id] || 0;
            const toursPerSlide = 3;
            const startIndex = currentSlideIndex * toursPerSlide;
            const endIndex = startIndex + toursPerSlide;
            const visibleTours = category.tours.slice(startIndex, endIndex);
            const maxSlides = Math.ceil(category.tours.length / toursPerSlide);

            return (
              <Card key={index} sx={{ overflow: 'hidden' }}>
                {/* Category Header */}
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #2D5016 0%, #57b557 100%)',
                    color: 'white',
                    py: 3,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h4" component="h3" sx={{ fontWeight: 'bold' }}>
                    {category.title}
                  </Typography>
                </Box>

                {/* Tour Cards with Carousel */}
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  {/* Navigation Arrows */}
                  {maxSlides > 1 && (
                    <>
                      <Button
                        onClick={() => prevSlide(category.id)}
                        disabled={currentSlideIndex === 0}
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 2,
                          minWidth: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(45, 80, 22, 0.1)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                          color: 'primary.main',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            transform: 'translateY(-50%) scale(1.05)',
                            boxShadow: '0 12px 40px rgba(45, 80, 22, 0.3)',
                          },
                          '&:active': {
                            transform: 'translateY(-50%) scale(0.95)',
                          },
                          '&:disabled': {
                            opacity: 0.4,
                            cursor: 'not-allowed',
                            bgcolor: 'rgba(255, 255, 255, 0.6)',
                            color: 'text.disabled',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.6)',
                              color: 'text.disabled',
                              transform: 'translateY(-50%) scale(1)',
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            },
                          },
                          display: { xs: 'none', sm: 'flex' },
                        }}
                      >
                        <ChevronLeftIcon sx={{ fontSize: '1.5rem' }} />
                      </Button>
                      <Button
                        onClick={() => nextSlide(category.id)}
                        disabled={currentSlideIndex >= maxSlides - 1}
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 2,
                          minWidth: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(45, 80, 22, 0.1)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                          color: 'primary.main',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            transform: 'translateY(-50%) scale(1.05)',
                            boxShadow: '0 12px 40px rgba(45, 80, 22, 0.3)',
                          },
                          '&:active': {
                            transform: 'translateY(-50%) scale(0.95)',
                          },
                          '&:disabled': {
                            opacity: 0.4,
                            cursor: 'not-allowed',
                            bgcolor: 'rgba(255, 255, 255, 0.6)',
                            color: 'text.disabled',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.6)',
                              color: 'text.disabled',
                              transform: 'translateY(-50%) scale(1)',
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                            },
                          },
                          display: { xs: 'none', sm: 'flex' },
                        }}
                      >
                        <ChevronRightIcon sx={{ fontSize: '1.5rem' }} />
                      </Button>
                    </>
                  )}

                  {/* Tour Cards Grid */}
                  <Grid 
                    container 
                    spacing={3} 
                    sx={{ 
                      px: { xs: 0, sm: maxSlides > 1 ? 6 : 0 },
                      justifyContent: 'center'
                    }}
                  >
                    {visibleTours.map((tour, tourIndex) => (
                      <Grid 
                        item 
                        xs={12} 
                        sm={6} 
                        md={4} 
                        key={tourIndex}
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          maxWidth: { xs: '100%', sm: '350px', md: '300px' }
                        }}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            width: '100%',
                            maxWidth: { xs: '100%', sm: '350px', md: '300px' },
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 3,
                            },
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height="200"
                              image={tour.image}
                              alt={tour.name}
                              sx={{ objectFit: 'cover' }}
                            />
                            <Chip
                              label={tour.price}
                              color="primary"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                fontWeight: 'bold',
                              }}
                            />
                          </Box>
                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" component="h4" sx={{ mb: 1, fontWeight: 'semibold' }}>
                              {tour.name}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                              <CalendarIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {tour.date}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
                              {tour.duration}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                              {tour.description}
                            </Typography>
                            <Button
                              variant="contained"
                              fullWidth
                              sx={{ mt: 'auto' }}
                              startIcon={<PersonAddIcon />}
                              onClick={() => handleRegister(tour.name)}
                            >
                              Kaydol
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Slide Indicators */}
                  {maxSlides > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
                      {Array.from({ length: maxSlides }).map((_, slideIndex) => (
                        <Button
                          key={slideIndex}
                          onClick={() => setCurrentSlide(prev => ({ ...prev, [category.id]: slideIndex }))}
                          sx={{
                            minWidth: 12,
                            height: 12,
                            borderRadius: '50%',
                            p: 0,
                            bgcolor: slideIndex === currentSlideIndex ? 'primary.main' : 'grey.300',
                            '&:hover': {
                              bgcolor: slideIndex === currentSlideIndex ? 'primary.dark' : 'grey.400',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
};

export default Tours;
