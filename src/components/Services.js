import React from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import {
  Hotel as BedIcon,
  Headset as HeadsetIcon,
  Restaurant as UtensilsIcon,
  Favorite as HeartIcon,
} from '@mui/icons-material';

const Services = () => {
  const services = [
    {
      icon: <BedIcon sx={{ fontSize: '2rem' }} />,
      title: "Konaklama",
      description: "Mekke ve Medine'de konforlu otellerde konaklama imkanı"
    },
    {
      icon: <HeadsetIcon sx={{ fontSize: '2rem' }} />,
      title: "Her Zaman Destek",
      description: "7/24 Türkçe rehberlik ve destek hizmeti"
    },
    {
      icon: <UtensilsIcon sx={{ fontSize: '2rem' }} />,
      title: "Türk Yemekleri",
      description: "Türk mutfağından lezzetli yemekler ve özel menüler"
    },
    {
      icon: <HeartIcon sx={{ fontSize: '2rem' }} />,
      title: "Müşteri Memnuniyeti",
      description: "%100 müşteri memnuniyeti garantisi"
    }
  ];

  return (
    <Box id="services" sx={{ pt: 10, pb: 2, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            width: '100%',
          }}
        >
          {services.map((service, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box
                  sx={{
                    color: 'primary.main',
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {service.icon}
                </Box>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 'semibold',
                    mb: 2,
                    color: 'text.primary',
                  }}
                >
                  {service.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {service.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Services;
