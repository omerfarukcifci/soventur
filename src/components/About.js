import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Stack,
} from '@mui/material';
const About = () => {

  return (
    <Box id="about" sx={{ py: 10, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          {/* Content */}
          <Grid item xs={12}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 'bold',
                mb: 3,
                color: 'text.primary',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Hakkımızda
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                color: 'text.secondary',
                lineHeight: 1.6,
                fontSize: '1.1rem'
              }}
            >
              Şoven Turizm olarak maddi ve manevi olarak en iyi Umre ve Hac hizmeti almanız için 
              uzun yıllardır büyük bir özenle çalışmaktadır.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: 'text.secondary',
                lineHeight: 1.6,
                fontSize: '1.1rem'
              }}
            >
              Otellerden, rehberlere, havayolundan, hocalara en iyileriyle her zaman yanınızdayız.
            </Typography>
            
            {/* Mission & Vision */}
            <Stack spacing={3}>
              <Card sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'semibold',
                    color: 'primary.main',
                    mb: 2
                  }}
                >
                  Misyonumuz
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dini turizm alanında en kaliteli hizmeti sunarak, müşterilerimizin kutsal 
                  topraklara güvenli ve huzurlu bir şekilde ulaşmalarını sağlamak.
                </Typography>
              </Card>
              <Card sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'semibold',
                    color: 'primary.main',
                    mb: 2
                  }}
                >
                  Vizyonumuz
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Türkiye'nin en güvenilir dini turizm firması olmak ve bu alanda 
                  standartları belirleyen öncü kuruluş haline gelmek.
                </Typography>
              </Card>
            </Stack>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

export default About;
