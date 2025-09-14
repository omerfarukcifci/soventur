import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Schedule as ClockIcon,
} from '@mui/icons-material';

const Contact = () => {

  const contactInfo = [
    {
      icon: <PhoneIcon sx={{ fontSize: '1.5rem' }} />,
      title: 'Telefon',
      details: ['0216 450 64 86', '0216 450 64 87 (Faks)'],
      action: 'tel:+902164506486'
    },
    {
      icon: <WhatsAppIcon sx={{ fontSize: '1.5rem' }} />,
      title: 'WhatsApp',
      details: ['+90 532 723 71 76'],
      action: 'https://wa.me/905327237176'
    },
    {
      icon: <EmailIcon sx={{ fontSize: '1.5rem' }} />,
      title: 'E-posta',
      details: ['bilgi@soventur.com'],
      action: 'mailto:bilgi@soventur.com'
    },
    {
      icon: <LocationIcon sx={{ fontSize: '1.5rem' }} />,
      title: 'Adres',
      details: ['Söğütlüçeşme Cad. Halilbey İş Hanı No:111/1', 'Kadıköy / İSTANBUL'],
      action: null
    },
    {
      icon: <ClockIcon sx={{ fontSize: '1.5rem' }} />,
      title: 'Çalışma Saatleri',
      details: ['Pazartesi - Cuma: 09:00 - 18:00', 'Cumartesi: 09:00 - 16:00'],
      action: null
    }
  ];

  return (
    <Box id="contact" sx={{ py: 10, bgcolor: 'white' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
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
            İletişim
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
            Sorularınız için bizimle iletişime geçin. Size en kısa sürede dönüş yapacağız.
          </Typography>
        </Box>

        {/* Contact Information - 5 Column Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 2,
            width: '100%',
          }}
        >
          {contactInfo.map((info, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                textAlign: 'center',
                p: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    color: 'primary.main',
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {info.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'semibold',
                    mb: 2,
                    color: 'text.primary',
                    fontSize: '0.9rem'
                  }}
                >
                  {info.title}
                </Typography>
                {info.details.map((detail, detailIndex) => (
                  <Box key={detailIndex} sx={{ mb: 0.5 }}>
                    {info.action ? (
                      <Typography
                        component="a"
                        href={info.action}
                        sx={{
                          color: 'text.secondary',
                          textDecoration: 'none',
                          fontSize: '0.75rem',
                          display: 'block',
                          '&:hover': {
                            color: 'primary.main',
                          },
                        }}
                      >
                        {detail}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          margin: 0
                        }}
                      >
                        {detail}
                      </Typography>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Contact;
