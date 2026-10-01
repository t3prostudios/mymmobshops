import type { Product, Category } from '@/types';

/**
 * THE MEDIA SOURCE OF TRUTH
 * Use this file to organize all product photos and hover videos.
 * 
 * 1. Find the Stripe Product ID (e.g., 'prod_Tm2Q07mRacfdps') or use the EXACT Product Name.
 * 2. Add/Update 'images' array for static photos. 
 *    - Starting with /images/ for local files.
 * 3. Add/Update 'hoverVideo' for the on-hover effect.
 */
const products: Omit<Product, 'price' | 'stock'>[] = [
  {
    id: 'prod_Tm2Q07mRacfdps',
    name: "Original Logo Tee - Adults",
    description: 'Signature heavy-weight cotton t-shirt built for comfort and style.',
    weight: 8.8,
    sizeWeights: { 'S': 5.8, 'M': 6.6, 'L': 7.1, 'XL': 7.5, '2XL': 8.6, '3XL': 9.6, '4XL': 11.8 },
    category: 'tops',
    style: 'tops',
    features: ['100% Pre-shrunk Cotton', 'Double-needle stitching', 'Reactive dyed'],
    images: [
      { id: 'img-1', url: '/images/product-2-front1.jpg', description: 'Front View', hint: 't-shirt front' }
    ],
    hoverVideo: '/images/product-2-vid.mp4',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_TlMHAxdwfVs5Td',
    name: "Original Logo Hoodie - Adults",
    description: 'Premium fleece hoodie featuring our signature logo.',
    weight: 20.4,
    sizeWeights: { 'S': 17.8, 'M': 18.3, 'L': 20.4, 'XL': 22.1, '2XL': 23, '3XL': 25.3, '4XL': 26.2 },
    category: 'tops',
    style: 'hoodies',
    features: ['Heavyweight fleece', 'Kangaroo pocket', 'Ribbed cuffs'],
    images: [], // Empty to force auto-play video display
    hoverVideo: '/images/product-5-vid.mp4',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_TlO33CirJ52rIb',
    name: "Original Logo Joggers - Adults",
    description: 'Matching joggers for the perfect set or individual wear.',
    weight: 15.5,
    sizeWeights: { 'S': 14.1, 'M': 14.7, 'L': 15.5, 'XL': 15.9, '2XL': 16.4, '3XL': 16.7 },
    category: 'bottoms',
    style: 'pants',
    features: ['Premium cotton blend', 'Elastic waistband', 'Deep pockets'],
    images: [], // Empty to force auto-play video display
    hoverVideo: '/images/product-4-vid.mp4',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_UIdJEjUUbpBMdS',
    name: "Original Logo Tank - Men",
    description: 'Built for confidence and intentional living.',
    weight: 5.4,
    sizeWeights: { 'S': 4.2, 'M': 4.7, 'L': 5.4, 'XL': 5.6, '2XL': 6.3, '3XL': 6.6 },
    category: 'tops',
    style: 'tops',
    images: [
      { id: 'img-1', url: '/images/crew-neck-01.jpeg', description: 'Tank Top', hint: 'tank top' }
    ],
    hoverVideo: '/images/crew-neck-vid.mp4',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_Tm0QG8bzkkDlr4',
    name: "Original Logo Racerback - Women",
    description: 'Flattering athletic fit racerback for daily inspiration.',
    weight: 3.5,
    sizeWeights: { 'S': 2.8, 'M': 3, 'L': 3.5, 'XL': 3.8, '2XL': 4 },
    category: 'tops',
    style: 'tops',
    images: [
      { id: 'img-1', url: '/images/wom-racer-pic.jpg', description: 'Racerback', hint: 'racerback' }
    ],
    hoverVideo: '/images/wom-racer-vid.mp4',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_TlOJWnyFyQMC55',
    name: 'Original Logo Zip-Up Hoodie',
    description: 'Classic heavy-duty zip hoodie for easy layering.',
    weight: 21.6,
    sizeWeights: { 'S': 18.7, 'M': 19, 'L': 21.6, 'XL': 22.2, '2XL': 24.8, '3XL': 25 },
    category: 'tops',
    style: 'hoodies',
    images: [
      { id: 'img-1', url: '/images/product-5-front.jpg', description: 'Zip Up Hoodie', hint: 'zip up' }
    ],
    hoverVideo: '/images/product-5-vid.mp4',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_Tm0HnmbMNAV5Ab',
    name: 'Trucker Hats',
    description: 'Classic mesh-back trucker hat.',
    weight: 2.3,
    sizeWeights: { 'One Size': 2.3 },
    category: 'hats',
    style: 'hats',
    features: ['Adjustable snapback', 'Breathable mesh'],
    images: [
      { id: 'img-1', url: '/Create-Ur-look-Trans/1040.png', description: 'Hat View', hint: 'hat' }
    ],
    hoverVideo: '',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_Tldd3U12TBS9Dj',
    name: 'Beanies',
    description: 'Cozy knit beanie with embroidered logo.',
    weight: 3,
    sizeWeights: { 'One Size': 3 },
    category: 'hats',
    style: 'hats',
    images: [
      { id: 'img-1', url: '/images/beanie.jpg', description: 'Beanie', hint: 'beanie' }
    ],
    hoverVideo: '',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_Tm0iUPGxLFC7yE',
    name: 'Infant Onesie',
    description: 'Softest organic cotton onesie.',
    weight: 2,
    sizeWeights: { '0-3M': 1.6, '3-6M': 1.7, '6-9M': 1.8, '12M': 1.9, '18M': 2, '24M': 2.2 },
    category: 'kids',
    style: 'onesies',
    images: [
      { id: 'img-1', url: '/images/infant-onesie1.jpg', description: 'Onesie', hint: 'onesie' },
      { id: 'img-2', url: '/images/infant-onesie2.jpg', description: 'Onesie Back', hint: 'onesie back' }
    ],
    hoverVideo: '',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_RntFrszv6v06UK',
    name: "Original Logo Tee - Kids",
    description: 'Durable and soft tees for the youth.',
    weight: 5,
    sizeWeights: { '2T': 4, '3T': 4.5, '4T': 5, '5T': 5.5, '6T': 6 },
    category: 'kids',
    style: 'tops',
    images: [
      { id: 'img-1', url: '/images/ts01.png', description: 'Kids Tee', hint: 'kids tee' }
    ],
    hoverVideo: '',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_RnvFrszv6v06UK',
    name: "Original Logo Hoodie - Kids",
    description: 'Warm and cozy hoodies for kids.',
    weight: 14,
    sizeWeights: { '2T': 10, '3T': 12, '4T': 14, '5T': 16, '6T': 18 },
    category: 'kids',
    style: 'hoodies',
    images: [
      { id: 'img-1', url: '/images/ss01.jpeg', description: 'Kids Hoodie', hint: 'kids hoodie' }
    ],
    hoverVideo: '',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_UGpzlrKJM0NjEY',
    name: "Original Logo Joggers - Kids",
    description: 'Comfortable joggers built for play.',
    weight: 10,
    sizeWeights: { '2T': 8, '3T': 9, '4T': 10, '5T': 11, '6T': 12 },
    category: 'kids',
    style: 'pants',
    images: [
      { id: 'img-1', url: '/images/male-jogger.jpeg', description: 'Kids Joggers', hint: 'kids joggers' }
    ],
    hoverVideo: '/images/male-jogger-vid.mp4',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_Tm1e4OM8JZEghX',
    name: "Original Logo Jogger Set - Kids",
    description: 'Matching hoodie and jogger set for kids.',
    weight: 24,
    sizeWeights: { '2T': 18, '3T': 21, '4T': 24, '5T': 27, '6T': 30 },
    category: 'kids',
    style: 'bundles',
    images: [
      { id: 'img-1', url: '/images/2pc-uni-ss.png', description: 'Kids Set', hint: 'kids set' },
      { id: 'img-2', url: '/images/2pc-uni-ss2.png', description: 'Kids Set Detail', hint: 'kids set detail' }
    ],
    hoverVideo: '',
    sizes: [],
    colors: []
  },
  {
    id: 'prod_RnwFrszv6v06UK',
    name: 'MMOB Premium Woven Patch Hoodie',
    description: 'Signature original logo woven patch.',
    weight: 0.5,
    category: 'accessories',
    style: 'patches',
    images: [
      { id: 'img-1', url: '/images/chanel-pat.png', description: 'Patch', hint: 'patch' }
    ],
    hoverVideo: '/images/chanel-pat-vid.mp4',
    sizes: [],
    colors: []
  }
];

export { products as localProductMedia };

export function getCategories(): Category[] {
  return [
    { id: 'tops', name: 'Tops' },
    { id: 'bottoms', name: 'Bottoms' },
    { id: 'hats', name: 'Hats' },
    { id: 'kids', name: 'Kids' },
    { id: 'accessories', name: 'Accessories' },
  ];
}