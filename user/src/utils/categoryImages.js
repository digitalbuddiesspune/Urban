export const CAT_FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80'

export const CATEGORY_IMAGES = {
  'Home Services': '/categories/home-services.webp',
  'Appliance Repair': '/categories/appliance-repair.webp',
  'Cleaning Services': '/categories/cleaning-services.webp',
  'Pest Control': '/categories/pest-control.webp',
  "Women's Salon": '/categories/womens-salon.webp',
  "Men's Salon": '/categories/mens-salon.webp',
  'Home Improvement': '/categories/home-improvement.webp',
  'Vehicle Related': '/categories/vehicle-related.webp',
  'Instant Help': '/categories/instant-help.webp',
  // Legacy fallbacks
  'AC Repair': '/categories/appliance-repair.webp',
  Electrician: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
  Plumbing: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80',
  'Home Cleaning': '/categories/cleaning-services.webp',
  'Salon at Home': '/categories/womens-salon.webp',
}

export const getCategoryImage = (cat) => CATEGORY_IMAGES[cat?.name] || cat?.image || CAT_FALLBACK
