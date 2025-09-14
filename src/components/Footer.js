import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  Stack,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
} from '@mui/icons-material';
import { scrollToSection } from '../utils/smoothScroll';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (href) => {
    if (href.startsWith('#')) {
      const elementId = href.substring(1);
      scrollToSection(elementId);
    }
  };

  const quickLinks = [
    { name: 'Ana Sayfa', href: '#home' },
    { name: 'Hizmetler', href: '#services' },
    { name: 'Turlar', href: '#tours' },
    { name: 'Hakkımızda', href: '#about' },
    { name: 'İletişim', href: '#contact' }
  ];

  const tourTypes = [
    { name: 'Umre Turları', href: '#tours' },
    { name: 'Hac Turları', href: '#tours' },
    { name: 'Yurtiçi Turlar', href: '#tours' },
    { name: 'Yurtdışı Turlar', href: '#tours' }
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, href: 'https://facebook.com/soventurizm', label: 'Facebook' },
    { icon: <InstagramIcon />, href: 'https://instagram.com/soventurizm', label: 'Instagram' },
    { icon: <TwitterIcon />, href: 'https://twitter.com/soventurizm', label: 'Twitter' },
    { icon: <YouTubeIcon />, href: 'https://youtube.com/soventurizm', label: 'YouTube' }
  ];

  return (
    <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white' }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={6} lg={3}>
            <Typography
              variant="h4"
              component="h3"
              sx={{
                fontWeight: 'bold',
                color: 'secondary.main',
                mb: 2,
                fontSize: '1.5rem'
              }}
            >
              Şoven Turizm
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'grey.300',
                mb: 3,
                lineHeight: 1.6
              }}
            >
              Dini turizm alanında uzun süredir hizmet verdiğimiz deneyimimizle, kutsal topraklara 
              güvenli ve konforlu yolculuklar düzenliyoruz.
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    color: 'grey.400',
                    '&:hover': {
                      color: 'secondary.main',
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'semibold',
                mb: 2,
                fontSize: '1.1rem'
              }}
            >
              Hızlı Linkler
            </Typography>
            <Stack spacing={1}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  onClick={() => handleLinkClick(link.href)}
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'secondary.main',
                    },
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Tour Types */}
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'semibold',
                mb: 2,
                fontSize: '1.1rem'
              }}
            >
              Tur Türleri
            </Typography>
            <Stack spacing={1}>
              {tourTypes.map((tour, index) => (
                <Link
                  key={index}
                  onClick={() => handleLinkClick(tour.href)}
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'secondary.main',
                    },
                  }}
                >
                  {tour.name}
                </Link>
              ))}
            </Stack>
          </Grid>

        </Grid>

        {/* Bottom Bar */}
        <Divider sx={{ borderColor: 'grey.800', my: 4 }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'grey.400',
              fontSize: '0.875rem'
            }}
          >
            © {currentYear} Şoven Turizm. Tüm hakları saklıdır.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link
              component="button"
              sx={{
                color: 'grey.400',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'secondary.main',
                },
              }}
            >
              Gizlilik Politikası
            </Link>
            <Link
              component="button"
              sx={{
                color: 'grey.400',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'secondary.main',
                },
              }}
            >
              Kullanım Şartları
            </Link>
            <Link
              component="button"
              sx={{
                color: 'grey.400',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'secondary.main',
                },
              }}
            >
              Çerez Politikası
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
