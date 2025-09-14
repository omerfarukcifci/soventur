import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { scrollToSection } from '../utils/smoothScroll';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (href) => {
    if (href.startsWith('#')) {
      const elementId = href.substring(1);
      scrollToSection(elementId);
      if (isMobile) {
        setIsMenuOpen(false);
      }
    }
  };

  const menuItems = [
    { label: 'Ana Sayfa', href: '#home' },
    { label: 'Hizmetler', href: '#services' },
    { label: 'Turlar', href: '#tours' },
    { label: 'Hakkımızda', href: '#about' },
    { label: 'İletişim', href: '#contact' },
  ];

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'text.primary' }}>
      <Container maxWidth="lg">
        <Toolbar>
          {/* Logo */}
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
            Şoven Turizm
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, mr: 4 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  color="inherit"
                  sx={{ 
                    textTransform: 'none',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Contact Buttons */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<PhoneIcon />}
                href="tel:+902164506486"
                color="inherit"
                sx={{ textTransform: 'none' }}
              >
                Ara
              </Button>
              <Button
                onClick={() => handleNavClick('#registration')}
                variant="contained"
                sx={{ 
                  textTransform: 'none'
                }}
              >
                Umre Kayıt
              </Button>
            </Box>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="end"
              color="inherit"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={isMenuOpen}
        onClose={toggleMenu}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem 
                key={item.label} 
                component="button" 
                onClick={() => handleNavClick(item.href)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            <ListItem>
              <Button
                fullWidth
                startIcon={<PhoneIcon />}
                href="tel:+902164506486"
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Ara
              </Button>
            </ListItem>
            <ListItem>
              <Button
                fullWidth
                onClick={() => handleNavClick('#registration')}
                variant="contained"
                sx={{ 
                  textTransform: 'none'
                }}
              >
                Umre Kayıt
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header;
