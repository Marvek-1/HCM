/**
 * Product Images Mapper - Maps commodity IDs and names to product images
 * All images hosted on Vercel Blob Storage
 */

export const PRODUCT_IMAGES = {
  // Cold Chain Equipment
  'cold-chain-freezer': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cold-chain-freezer-hhhTuhtap0P2Wg4EVe6YQikMWdsdxU.png',
  'cold-chain-arktek': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cold-chain-arktek-fMUQFVAluYyFa0u7lMBDl5DW0ObIN3.webp',
  'vaccine-carrier': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cold-chain-freezer-hhhTuhtap0P2Wg4EVe6YQikMWdsdxU.png',
  
  // Biomedical Equipment
  'oxygen-concentrator': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/oxygen-concentrator-MVEkjljhSlvt3KA9FgmlAL0QRK4j0p.png',
  'patient-monitor': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/patient-monitor-vOmjuBXTwsnKaVodqQ6VOqsdRR8tCt.webp',
  'portable-ultrasound': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/patient-monitor-vOmjuBXTwsnKaVodqQ6VOqsdRR8tCt.webp',
  
  // Pharmaceuticals & IV
  'lactated-ringers': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lactated-ringers-U05gGAzmsZ5nUmKhI369hKpC5voNII.jpeg',
  'iv-ringer': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lactated-ringers-U05gGAzmsZ5nUmKhI369hKpC5voNII.jpeg',
  'doxycycline': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lactated-ringers-U05gGAzmsZ5nUmKhI369hKpC5voNII.jpeg',
  
  // Diagnostics & Tests
  'diagnostic-test-kit': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/diagnostic-test-kit-djVWb3cIZbRhHOoSuuZCsnzyl3JP2U.webp',
  'cholera-rapid-test': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/diagnostic-test-kit-djVWb3cIZbRhHOoSuuZCsnzyl3JP2U.webp',
  'malaria-rdt': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/diagnostic-test-kit-djVWb3cIZbRhHOoSuuZCsnzyl3JP2U.webp',
  
  // Emergency Kits
  'emergency-health-kits': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/emergency-health-kits-JXKBFxWrhv0HO3L3zuaPzLEQunoYT1.png',
  'iehk-kit': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/emergency-health-kits-JXKBFxWrhv0HO3L3zuaPzLEQunoYT1.png',
  'trauma-first-aid': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trauma-first-aid-kit.png-yOJF2gaGUwPR02s062g4JBU7yGH2KN.webp',
  
  // Water Testing & WASH
  'aquapro-water-testing': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aquapro-water-testing-kit-cXLwIYErfzONk04rhlHhLjR0jPYhIY.png',
  'water-testing-kit': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/aquapro-water-testing-kit-cXLwIYErfzONk04rhlHhLjR0jPYhIY.png',
  
  // Equipment & Monitoring
  'medical-dial': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medical-dial-xQMqW39YvzFTbYCWV02PlOjzAC9BUs.png',
  'temperature-dial': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/medical-dial-xQMqW39YvzFTbYCWV02PlOjzAC9BUs.png',
};

/**
 * Get image URL for a commodity
 * Maps by ID, name, or category
 */
export function getProductImage(commodity) {
  if (!commodity) return null;

  // Try direct ID mapping
  if (PRODUCT_IMAGES[commodity.id]) {
    return PRODUCT_IMAGES[commodity.id];
  }

  // Try name-based mapping (convert to kebab-case)
  const nameLower = commodity.name?.toLowerCase() || '';
  const categoryLower = commodity.category?.toLowerCase() || '';

  // Check for partial matches
  for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
    if (
      nameLower.includes(key) ||
      key.includes(nameLower.split(' ')[0]) ||
      categoryLower.includes(key)
    ) {
      return url;
    }
  }

  // Category-based mapping
  if (categoryLower.includes('cold chain')) {
    return PRODUCT_IMAGES['cold-chain-freezer'];
  }
  if (categoryLower.includes('biomedical') || categoryLower.includes('equipment')) {
    return PRODUCT_IMAGES['oxygen-concentrator'];
  }
  if (categoryLower.includes('diagnostic') || categoryLower.includes('lab')) {
    return PRODUCT_IMAGES['diagnostic-test-kit'];
  }
  if (categoryLower.includes('emergency') || categoryLower.includes('kit')) {
    return PRODUCT_IMAGES['emergency-health-kits'];
  }
  if (categoryLower.includes('water') || categoryLower.includes('wash')) {
    return PRODUCT_IMAGES['aquapro-water-testing'];
  }
  if (categoryLower.includes('pharma') || categoryLower.includes('medicine')) {
    return PRODUCT_IMAGES['lactated-ringers'];
  }

  // Default fallback
  return PRODUCT_IMAGES['oxygen-concentrator'];
}

/**
 * Get all product image URLs
 */
export function getAllProductImages() {
  return Object.values(PRODUCT_IMAGES);
}

/**
 * Preload all images for better UX
 */
export function preloadProductImages() {
  Object.values(PRODUCT_IMAGES).forEach((url) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}
