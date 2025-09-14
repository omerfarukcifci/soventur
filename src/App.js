import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Tours from './components/Tours';
import Registration from './components/Registration';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/*" element={
            <div className="App">
              <Header />
              <Hero />
              <Services />
              <Tours />
              <Registration />
              <About />
              <Contact />
              <Footer />
            </div>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
