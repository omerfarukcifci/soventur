// Smooth scroll utility fonksiyonu
export const smoothScrollTo = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

// URL hash'inden scroll yapma
export const scrollToHash = (hash, offset = 0) => {
  if (hash && hash.startsWith('#')) {
    const elementId = hash.substring(1);
    smoothScrollTo(elementId, offset);
  }
};

// Header yüksekliğini hesaplayarak scroll yapma
export const scrollToSection = (elementId) => {
  const headerHeight = 80; // Header yüksekliği (px)
  smoothScrollTo(elementId, headerHeight);
};
