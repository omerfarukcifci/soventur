import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Input,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Tour as TourIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { validateImageFile, formatFileSize } from '../utils/fileUpload';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [tours, setTours] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    id: null,
    category: '',
    title: '',
    image: '',
    startDate: '',
    endDate: '',
    price: '',
    description: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const tourCategories = [
    { id: 'umre', name: 'Umre Turları' },
    { id: 'hac', name: 'Hac Turları' },
    { id: 'yurtici', name: 'Yurtiçi Turlar' },
    { id: 'yurtdisi', name: 'Yurtdışı Turlar' }
  ];

  // Admin giriş bilgileri
  const adminCredentials = {
    username: 'admin',
    password: 'soventur2025'
  };

  // Giriş kontrolü
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Giriş fonksiyonu
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    if (loginData.username === adminCredentials.username && 
        loginData.password === adminCredentials.password) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
    } else {
      setLoginError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  // Çıkış fonksiyonu
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    setLoginData({ username: '', password: '' });
  };

  // Giriş formu değişiklikleri
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  // Tur verilerini yükle
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch('/api/tours');
        if (response.ok) {
          const data = await response.json();
          setTours(data);
        } else {
          // Fallback: localStorage'dan yükle
          const savedTours = localStorage.getItem('adminTours');
          if (savedTours) {
            setTours(JSON.parse(savedTours));
          }
        }
      } catch (error) {
        console.error('Tur verileri yüklenemedi:', error);
        // Fallback: localStorage'dan yükle
        const savedTours = localStorage.getItem('adminTours');
        if (savedTours) {
          setTours(JSON.parse(savedTours));
        }
      }
    };

    fetchTours();
  }, []);

  // Müşteri verilerini yükle
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        }
      } catch (error) {
        console.error('Müşteri verileri yüklenemedi:', error);
      }
    };

    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya validasyonu
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    setImageFile(file);
    
    // Gerçek dosya yükleme - Vercel için base64 ile
    setUploading(true);
    
    // Dosyayı base64'e çevir ve yükle
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imageData = e.target.result;
        
        // Önizleme oluştur
        setImagePreview(imageData);
        
        console.log('Dosya yükleniyor:', file.name);
        console.log('Orijinal dosya boyutu:', file.size, 'bytes');
        console.log('Base64 boyutu:', imageData.length, 'bytes');
        console.log('Base64 boyutu (KB):', Math.round(imageData.length / 1024), 'KB');
        console.log('Base64 boyutu (MB):', Math.round(imageData.length / 1024 / 1024 * 100) / 100, 'MB');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageData })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`Dosya yükleme başarısız: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Upload result:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'Dosya yükleme başarısız');
        }
        
        setFormData(prev => ({
          ...prev,
          image: result.imageUrl
        }));
        
        console.log('Görsel başarıyla yüklendi:', result.imageUrl);
        alert('Görsel başarıyla yüklendi!');
        
      } catch (error) {
        console.error('Görsel yükleme hatası:', error);
        
        // Hata türüne göre farklı mesajlar
        let errorMessage = 'Görsel yüklenirken bir hata oluştu.';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          errorMessage = 'Server bağlantı hatası. Lütfen server\'ın çalıştığından emin olun.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Dosya formatı desteklenmiyor veya dosya bozuk.';
        } else if (error.message.includes('413')) {
          errorMessage = 'Dosya boyutu çok büyük (max 5MB).';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server hatası. Lütfen tekrar deneyin.';
        }
        
        alert(`${errorMessage}\n\nHata detayı: ${error.message}\n\nLütfen görsel URL'sini manuel olarak girin.`);
      } finally {
        setUploading(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditMode) {
        // Düzenleme
        const response = await fetch(`/api/tours/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const result = await response.json();
          setTours(tours.map(tour => 
            tour.id === formData.id ? result.tour : tour
          ));
          setSuccessMessage('Tur başarıyla güncellendi!');
        } else {
          throw new Error('Tur güncellenemedi');
        }
      } else {
        // Yeni ekleme
        const response = await fetch('/api/tours', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const result = await response.json();
          setTours([...tours, result.tour]);
          setSuccessMessage('Tur başarıyla eklendi!');
        } else {
          throw new Error('Tur eklenemedi');
        }
      }

      // Formu sıfırla
      setFormData({
        id: null,
        category: '',
        title: '',
        image: '',
        startDate: '',
        endDate: '',
        price: '',
        description: ''
      });
      setImageFile(null);
      setImagePreview('');
      setIsEditMode(false);
      setOpenDialog(false);

      // Success mesajını 3 saniye sonra kaldır
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Tur işlemi hatası:', error);
      setError('Tur işlemi sırasında hata oluştu');
    }
  };

  const handleEdit = (tour) => {
    setFormData(tour);
    setImagePreview(tour.image);
    setImageFile(null);
    setIsEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = async (tourId) => {
    if (window.confirm('Bu turu silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/tours/${tourId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setTours(tours.filter(tour => tour.id !== tourId));
          setSuccessMessage('Tur başarıyla silindi!');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          throw new Error('Tur silinemedi');
        }
      } catch (error) {
        console.error('Tur silme hatası:', error);
        setError('Tur silinirken hata oluştu');
      }
    }
  };

  const handleAddNew = () => {
    setFormData({
      id: null,
      category: '',
      title: '',
      image: '',
      startDate: '',
      endDate: '',
      price: '',
      description: ''
    });
    setImageFile(null);
    setImagePreview('');
    setIsEditMode(false);
    setOpenDialog(true);
  };

  const getCategoryName = (categoryId) => {
    const category = tourCategories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerDialogOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Giriş formu
  if (!isAuthenticated) {
    return (
      <Box sx={{ 
        py: 4, 
        bgcolor: 'grey.50', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="sm">
          <Card sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Admin Girişi
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Lütfen giriş bilgilerinizi girin
              </Typography>
            </Box>

            <form onSubmit={handleLogin}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Kullanıcı Adı"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Şifre"
                  name="password"
                  type="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />

                {loginError && (
                  <Alert severity="error">
                    {loginError}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Giriş Yap
                </Button>
              </Stack>
            </form>

          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Admin Panel
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Turları ve müşteri kayıtlarını yönetin
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            sx={{ px: 3 }}
          >
            Çıkış Yap
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Tur Yönetimi" />
            <Tab label="Müşteri Kayıtları" />
          </Tabs>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tur Yönetimi Tab */}
        {activeTab === 0 && (
          <>
            <Box sx={{ mb: 3, textAlign: 'right' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                size="large"
              >
                Yeni Tur Ekle
              </Button>
            </Box>
          </>
        )}

        {/* Müşteri Kayıtları Tab */}
        {activeTab === 1 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Müşteri Kayıtları ({customers.length})
            </Typography>
          </Box>
        )}

        {/* Tur Listesi */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {tours.map((tour) => (
              <Grid item xs={12} sm={6} md={4} key={tour.id}>
                <Card sx={{ height: '100%' }}>
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={tour.image}
                      alt={tour.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover'
                      }}
                    />
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <Chip
                        label={getCategoryName(tour.category)}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                  <CardContent>
                    <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                      {tour.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {tour.startDate && tour.endDate 
                        ? `${new Date(tour.startDate).toLocaleDateString('tr-TR')} - ${new Date(tour.endDate).toLocaleDateString('tr-TR')}`
                        : tour.startDate || 'Tarih belirtilmemiş'
                      }
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                      {tour.price}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {tour.description}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(tour)}
                      >
                        Düzenle
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(tour.id)}
                      >
                        Sil
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Müşteri Tablosu */}
        {activeTab === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ad Soyad</TableCell>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Telefon</TableCell>
                  <TableCell>Tur Türü</TableCell>
                  <TableCell>Kayıt Tarihi</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {customer.fullName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {customer.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {customer.phone}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TourIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {customer.tourType}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatDate(customer.registrationDate)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleViewCustomer(customer)}
                        color="primary"
                        title="Detayları Görüntüle"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Henüz müşteri kaydı bulunmuyor.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Form Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {isEditMode ? 'Tur Düzenle' : 'Yeni Tur Ekle'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <FormControl fullWidth required>
                  <InputLabel>Tur Kategorisi</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Tur Kategorisi"
                  >
                    {tourCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Tur Başlığı"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Görsel Ekleme
                  </Typography>
                  
                  {/* Önizleme için dosya seçici */}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    sx={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<ImageIcon />}
                      disabled={uploading}
                      sx={{ mb: 2 }}
                    >
                      {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
                    </Button>
                  </label>

                  {/* Manuel URL girişi */}
                  <TextField
                    fullWidth
                    label="Veya Görsel URL'sini Manuel Olarak Girin"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    helperText="Görsel yükleme başarısız olursa buraya URL girebilirsiniz"
                    sx={{ mb: 2 }}
                  />
                  
                  {/* Görsel önizleme */}
                  {(imagePreview || formData.image) && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Görsel Önizleme:
                      </Typography>
                      <img
                        src={imagePreview || formData.image}
                        alt="Önizleme"
                        style={{
                          width: '100%',
                          maxWidth: '300px',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #ddd'
                        }}
                        onError={(e) => {
                          console.error('Görsel yüklenemedi:', e.target.src);
                          e.target.style.display = 'none';
                        }}
                      />
                    </Box>
                  )}
                  
                  <FormHelperText>
                    <strong>Dosya Yükleme:</strong> Görsel seçerek otomatik yükleyebilir veya URL ile manuel giriş yapabilirsiniz.
                    <br />
                    <strong>Desteklenen formatlar:</strong> JPEG, PNG, GIF, WebP (Max: 5MB)
                    {imageFile && (
                      <span style={{ display: 'block', marginTop: '4px' }}>
                        Seçilen dosya boyutu: {formatFileSize(imageFile.size)}
                      </span>
                    )}
                  </FormHelperText>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Başlangıç Tarihi"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                      helperText="Tur başlangıç tarihini seçin"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Bitiş Tarihi"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                      helperText="Tur bitiş tarihini seçin"
                      inputProps={{
                        min: formData.startDate // Bitiş tarihi başlangıç tarihinden önce olamaz
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Fiyat"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      placeholder="Örnek: ₺8,500"
                      helperText="Tur fiyatını girin (₺ sembolü ile)"
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Açıklama"
                  name="description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>
                İptal
              </Button>
              <Button type="submit" variant="contained">
                {isEditMode ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Müşteri Detay Dialog */}
        <Dialog open={customerDialogOpen} onClose={() => setCustomerDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Müşteri Detayları
          </DialogTitle>
          <DialogContent>
            {selectedCustomer && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Kişisel Bilgiler
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Ad Soyad"
                        value={selectedCustomer.fullName}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="E-posta"
                        value={selectedCustomer.email}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Telefon"
                        value={selectedCustomer.phone}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Tur Türü"
                        value={selectedCustomer.tourType}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Kayıt Tarihi"
                        value={formatDate(selectedCustomer.registrationDate)}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {selectedCustomer.message && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Ek Mesaj
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={selectedCustomer.message}
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomerDialogOpen(false)}>
              Kapat
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminPanel;
