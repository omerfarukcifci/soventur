import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import {
  KeyboardArrowDown as ArrowDownIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { scrollToSection } from '../utils/smoothScroll';

const Hero = () => {
  return (
    <Box
      id="home"
      sx={{
        position: 'relative',
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url('/kabe.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(2px)',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        },
      }}
    >
      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            color: 'white',
            mb: 3,
            fontSize: { xs: '2.5rem', md: '4rem' },
            fontWeight: 'bold',
            lineHeight: 1.2,
          }}
        >
          Hac ve Umre Organizasyonları
        </Typography>
        
        <Typography
          variant="h5"
          component="p"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            mb: 4,
            fontSize: { xs: '1.25rem', md: '1.5rem' },
          }}
        >
          Kutsal topraklara güvenli ve konforlu yolculuk
        </Typography>

        {/* CTA Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 6 }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => scrollToSection('tours')}
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              transform: 'scale(1)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            Turlarımızı İncele
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => scrollToSection('contact')}
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderColor: 'secondary.main',
              color: 'secondary.main',
              transform: 'scale(1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'secondary.main',
                color: 'white',
                transform: 'scale(1.05)',
              },
            }}
          >
            Hemen İletişime Geç
          </Button>
        </Stack>

        {/* Trust Indicators */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Chip
            icon={<StarIcon sx={{ color: 'secondary.main' }} />}
            label="Güvenilir Hizmet"
            sx={{ color: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' }}
          />
          <Chip
            icon={<StarIcon sx={{ color: 'secondary.main' }} />}
            label="Deneyimli Kadro"
            sx={{ color: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' }}
          />
          <Chip
            icon={<StarIcon sx={{ color: 'secondary.main' }} />}
            label="7/24 Destek"
            sx={{ color: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' }}
          />
        </Stack>
      </Container>

      {/* Scroll Indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          animation: 'bounce 1s infinite',
          '@keyframes bounce': {
            '0%, 20%, 53%, 80%, 100%': {
              transform: 'translateX(-50%) translate3d(0,0,0)',
            },
            '40%, 43%': {
              transform: 'translateX(-50%) translate3d(0,-30px,0)',
            },
            '70%': {
              transform: 'translateX(-50%) translate3d(0,-15px,0)',
            },
            '90%': {
              transform: 'translateX(-50%) translate3d(0,-4px,0)',
            },
          },
        }}
      >
        <ArrowDownIcon sx={{ fontSize: '2rem' }} />
      </Box>
    </Box>
  );
};

export default Hero;
