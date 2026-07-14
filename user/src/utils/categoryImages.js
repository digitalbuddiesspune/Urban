export const CAT_FALLBACK = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80'

export const CATEGORY_IMAGES = {
  'AC Repair': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
  Electrician: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
  Plumbing: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80',
  'Home Cleaning': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  'Salon at Home': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  'Appliance Repair': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
}

export const getCategoryImage = (cat) => CATEGORY_IMAGES[cat?.name] || cat?.image || CAT_FALLBACK
