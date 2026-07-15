/**
 * Home-page catalogue: top-level categories + leaf services (UrbanEase).
 * Seeded as Category + Service documents (no nested subcategory model).
 */
export const CATALOGUE = [
  {
    name: 'Home Services',
    description: 'Electrician, plumber, carpenter and home installation experts',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    services: [
      { title: 'Electrician', price: 149, discountPrice: 0, rating: 4.82, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80' },
      { title: 'Plumber', price: 149, discountPrice: 0, rating: 4.79, image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&q=80' },
      { title: 'Carpenter', price: 199, discountPrice: 0, rating: 4.76, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80' },
      { title: 'Furniture Assembly', price: 299, discountPrice: 0, rating: 4.81, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
      { title: 'Door Lock Installation', price: 349, discountPrice: 0, rating: 4.74, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
      { title: 'CCTV Installation', price: 499, discountPrice: 0, rating: 4.77, image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80' },
      { title: 'Smart Lock Installation', price: 599, discountPrice: 0, rating: 4.8, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80' },
    ],
  },
  {
    name: 'Appliance Repair',
    description: 'AC, fridge, washing machine and appliance repair at home',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
    services: [
      { title: 'AC Service & Repair', price: 499, discountPrice: 399, rating: 4.75, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80' },
      { title: 'Refrigerator Repair', price: 349, discountPrice: 0, rating: 4.72, image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&q=80' },
      { title: 'Washing Machine Repair', price: 349, discountPrice: 0, rating: 4.7, image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80' },
      { title: 'Microwave Repair', price: 299, discountPrice: 0, rating: 4.68, image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80' },
      { title: 'Chimney Repair', price: 399, discountPrice: 0, rating: 4.71, image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80' },
      { title: 'Water Purifier (RO) Service', price: 299, discountPrice: 0, rating: 4.73, image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80' },
      { title: 'Geyser Repair', price: 299, discountPrice: 0, rating: 4.69, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80' },
      { title: 'TV Repair', price: 399, discountPrice: 0, rating: 4.66, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80' },
    ],
  },
  {
    name: 'Cleaning Services',
    description: 'Full home, kitchen, bathroom and deep cleaning essentials',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    services: [
      { title: 'Full Home Cleaning', price: 1999, discountPrice: 1699, rating: 4.84, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80' },
      { title: 'Kitchen Cleaning', price: 699, discountPrice: 0, rating: 4.81, image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80' },
      { title: 'Bathroom Cleaning', price: 499, discountPrice: 399, rating: 4.8, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80' },
      { title: 'Sofa Cleaning', price: 599, discountPrice: 0, rating: 4.78, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80' },
      { title: 'Carpet Cleaning', price: 549, discountPrice: 0, rating: 4.76, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
      { title: 'Mattress Cleaning', price: 499, discountPrice: 0, rating: 4.77, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80' },
      { title: 'Water Tank Cleaning', price: 899, discountPrice: 0, rating: 4.74, image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80' },
    ],
  },
  {
    name: 'Pest Control',
    description: 'Cockroach, termite, bed bug and mosquito control',
    image: 'https://images.unsplash.com/photo-1632921342277-971fc876bb6c?w=800&q=80',
    services: [
      { title: 'Cockroach Control', price: 999, discountPrice: 0, rating: 4.79, image: 'https://images.unsplash.com/photo-1632921342277-971fc876bb6c?w=600&q=80' },
      { title: 'Termite Treatment', price: 2499, discountPrice: 0, rating: 4.75, image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80' },
      { title: 'Bed Bug Treatment', price: 1499, discountPrice: 0, rating: 4.77, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80' },
      { title: 'Mosquito Control', price: 799, discountPrice: 0, rating: 4.72, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80' },
      { title: 'Rodent Control', price: 899, discountPrice: 0, rating: 4.73, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    ],
  },
  {
    name: "Women's Salon",
    description: 'Haircut, spa, facial, waxing and salon at home',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    services: [
      { title: 'Haircut', price: 399, discountPrice: 0, rating: 4.85, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80' },
      { title: 'Hair Spa', price: 699, discountPrice: 0, rating: 4.86, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80' },
      { title: 'Facial', price: 799, discountPrice: 699, rating: 4.84, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80' },
      { title: 'Waxing', price: 599, discountPrice: 0, rating: 4.83, image: 'https://images.unsplash.com/photo-1516975080664-ed2fc67c3ddf?w=600&q=80' },
      { title: 'Makeup', price: 1499, discountPrice: 0, rating: 4.88, image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80' },
      { title: 'Manicure & Pedicure', price: 699, discountPrice: 0, rating: 4.82, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80' },
      { title: 'Massage & Spa', price: 999, discountPrice: 0, rating: 4.87, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80' },
    ],
  },
  {
    name: "Men's Salon",
    description: 'Haircut, spa, facial and grooming for men at home',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    services: [
      { title: 'Haircut', price: 249, discountPrice: 0, rating: 4.81, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80' },
      { title: 'Hair Spa', price: 449, discountPrice: 0, rating: 4.8, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80' },
      { title: 'Facial', price: 499, discountPrice: 0, rating: 4.78, image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80' },
      { title: 'Waxing', price: 399, discountPrice: 0, rating: 4.76, image: 'https://images.unsplash.com/photo-1516975080664-ed2fc67c3ddf?w=600&q=80' },
      { title: 'Manicure & Pedicure', price: 449, discountPrice: 0, rating: 4.75, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80' },
      { title: 'Body Massage', price: 799, discountPrice: 0, rating: 4.84, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80' },
      { title: 'Head & Neck Massage', price: 399, discountPrice: 0, rating: 4.82, image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80' },
      { title: 'Leg & Foot Massage', price: 449, discountPrice: 0, rating: 4.79, image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80' },
    ],
  },
  {
    name: 'Home Improvement',
    description: 'Painting, waterproofing, wall panels and wallpaper',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7449abec4?w=800&q=80',
    services: [
      { title: 'Interior & Exterior Painting', price: 2999, discountPrice: 0, rating: 4.78, image: 'https://images.unsplash.com/photo-1562259949-e8e7449abec4?w=600&q=80' },
      { title: 'Waterproofing', price: 1999, discountPrice: 0, rating: 4.74, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
      { title: 'Wall Panels', price: 3499, discountPrice: 0, rating: 4.76, image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80' },
      { title: 'Wallpaper Installation', price: 1499, discountPrice: 0, rating: 4.77, image: 'https://images.unsplash.com/photo-1615874959471-d45abc383c1d?w=600&q=80' },
    ],
  },
  {
    name: 'Vehicle Related',
    description: 'Car cleaning, bike cleaning and vehicle detailing',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea47?w=800&q=80',
    services: [
      { title: 'Car Cleaning', price: 599, discountPrice: 499, rating: 4.8, image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea47?w=600&q=80' },
      { title: 'Bike Cleaning', price: 299, discountPrice: 0, rating: 4.77, image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80' },
      { title: 'Vehicle Detailing', price: 1499, discountPrice: 0, rating: 4.82, image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&q=80' },
    ],
  },
  {
    name: 'Instant Help',
    description: 'Emergency electrician, plumber and quick home assistance',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
    services: [
      { title: 'Quick Home Assistance', price: 199, discountPrice: 0, rating: 4.7, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80' },
      { title: 'Emergency Electrician', price: 249, discountPrice: 0, rating: 4.73, image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80' },
      { title: 'Emergency Plumber', price: 249, discountPrice: 0, rating: 4.71, image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&q=80' },
      { title: 'Emergency Cleaning', price: 399, discountPrice: 0, rating: 4.69, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80' },
    ],
  },
]

export const OLD_CATEGORY_NAMES = [
  'AC Repair',
  'Electrician',
  'Plumbing',
  'Home Cleaning',
  'Salon at Home',
]
