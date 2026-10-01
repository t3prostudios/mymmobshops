import type { Product, Category } from '@/types';

/**
 * PRODUCT ENRICHMENT DATA
 * Mapping Stripe Product IDs to ounce-based weights and marketing features.
 * Stripe Metadata is the source of truth for stock; this file handles shipping math.
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
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_UGmJAsWNuw1VOa',
    name: "Original Logo Hoodie - Adults",
    description: 'Premium fleece hoodie featuring our signature logo.',
    weight: 20.4,
    sizeWeights: { 'S': 17.8, 'M': 18.3, 'L': 20.4, 'XL': 22.1, '2XL': 23, '3X': 25.3, '4X': 26.2 },
    category: 'tops',
    style: 'hoodies',
    features: ['Heavyweight fleece', 'Kangaroo pocket', 'Ribbed cuffs'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_TlO33CirJ52rIb',
    name: "Original Logo Joggers - Adults",
    description: 'Matching joggers for the perfect set or individual wear.',
    weight: 15.5,
    sizeWeights: { 'S': 14.1, 'M': 14.7, 'L': 15.5, 'XL': 15.9, '2XL': 16.4, '3X': 16.7 },
    category: 'bottoms',
    style: 'pants',
    features: ['Premium cotton blend', 'Elastic waistband', 'Deep pockets'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_UIdJEjUUbpBMdS',
    name: "Original Logo Tank - Men",
    description: 'Built for confidence and intentional living.',
    weight: 5.4,
    sizeWeights: { 'S': 4.2, 'M': 4.7, 'L': 5.4, 'XL': 5.6, '2XL': 6.3, '3XL': 6.6 },
    category: 'tops',
    style: 'tops',
    features: ['Relaxed fit', 'Breathable cotton blend'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_Tm0QG8bzkkDlr4', 
    name: "Original Logo Racerback - Women",
    description: 'Flattering athletic fit racerback for daily inspiration.',
    weight: 3.5,
    sizeWeights: { 'S': 2.8, 'M': 3, 'L': 3.5, 'XL': 3.8, '2X': 4 },
    category: 'tops',
    style: 'tops',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_TlOJWnyFyQMC55',
    name: 'Original Logo Zip-Up Hoodie',
    description: 'Classic heavy-duty zip hoodie for easy layering.',
    weight: 21.6,
    sizeWeights: { 'S': 18.7, 'M': 19, 'L': 21.6, 'XL': 22.2, '2XL': 24.8, '3XL': 25 },
    category: 'tops',
    style: 'hoodies',
    colors: [], sizes: [], images: []
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
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_Tldd3U12TBS9Dj',
    name: 'Beanies',
    description: 'Cozy knit beanie with embroidered logo.',
    weight: 3,
    sizeWeights: { 'One Size': 3 },
    category: 'hats',
    style: 'hats',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_Tm0iUPGxLFC7yE',
    name: 'Infant Onesie',
    description: 'Softest organic cotton onesie.',
    weight: 2,
    sizeWeights: { '0-3M': 1.6, '3-6M': 1.7, '6-9M': 1.8, '12M': 1.9, '18M': 2, '24M': 2.2 },
    category: 'kids',
    style: 'onesies',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_RntFrszv6v06UK',
    name: "Original Logo Tee - Kids",
    description: 'Durable and soft tees for the youth.',
    weight: 5,
    sizeWeights: { '2T': 4, '3T': 4.5, '4T': 5, '5T': 5.5, '6T': 6 },
    category: 'kids',
    style: 'tops',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_RnvFrszv6v06UK',
    name: "Original Logo Hoodie - Kids",
    description: 'Warm and cozy hoodies for kids.',
    weight: 14,
    sizeWeights: { '2T': 10, '3T': 12, '4T': 14, '5T': 16, '6T': 18 },
    category: 'kids',
    style: 'hoodies',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_UGpzlrKJM0NjEY',
    name: "Original Logo Joggers - Kids",
    description: 'Comfortable joggers built for play.',
    weight: 10,
    sizeWeights: { '2T': 8, '3T': 9, '4T': 10, '5T': 11, '6T': 12 },
    category: 'kids',
    style: 'pants',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_Tm1e4OM8JZEghX',
    name: "Original Logo Jogger Set - Kids",
    description: 'Matching hoodie and jogger set for kids.',
    weight: 24,
    sizeWeights: { '2T': 18, '3T': 21, '4T': 24, '5T': 27, '6T': 30 },
    category: 'kids',
    style: 'bundles',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_RnwFrszv6v06UK',
    name: 'Woven Patch Original',
    description: 'Signature original logo woven patch.',
    weight: 0.5,
    category: 'accessories',
    style: 'patches',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_RnxFrszv6v06UK',
    name: 'Woven Patch Black & White',
    description: 'Signature black and white logo woven patch.',
    weight: 0.5,
    category: 'accessories',
    style: 'patches',
    colors: [], sizes: [], images: []
  },
];

export { products as allProducts };

export function getCategories(): Category[] {
  return [
    { id: 'tops', name: 'Tops' },
    { id: 'bottoms', name: 'Bottoms' },
    { id: 'hats', name: 'Hats' },
    { id: 'kids', name: 'Kids' },
    { id: 'accessories', name: 'Accessories' },
  ];
}
