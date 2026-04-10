
import type { Product, Category } from '@/types';

/**
 * PRODUCT ENRICHMENT DATA
 * This file maps Stripe Product IDs to ounce-based weights and marketing features.
 * Stripe Metadata is the source of truth for stock; this file handles the shipping math.
 */
const products: Omit<Product, 'price' | 'stock'>[] = [
  {
    id: 'prod_RntFrszv6v06UK', // Verify if this is Adult Tee
    name: "Adult Tee's",
    description: 'Signature heavy-weight cotton t-shirt built for comfort and style.',
    weight: 8,
    sizeWeights: { 'S': 7.2, 'M': 8, 'L': 8.8, 'XL': 9.5, '2XL': 10.2, '3XL': 11 },
    category: 'tops',
    style: 'tops',
    features: ['100% Pre-shrunk Cotton', 'Double-needle stitching', 'Reactive dyed'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_TlMHAxdwfVs5Td', // Verify if this is Adult Hoodie
    name: "Adult Hoodie's",
    description: 'Premium fleece hoodie featuring our signature logo.',
    weight: 26,
    sizeWeights: { 'S': 22, 'M': 24, 'L': 26, 'XL': 28, '2XL': 30 },
    category: 'tops',
    style: 'hoodies',
    features: ['Heavyweight fleece', 'Kangaroo pocket', 'Ribbed cuffs'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_TlO33CirJ52rIb', // Verify if this is Adult Jogger
    name: "Adult Jogger's",
    description: 'Matching joggers for the perfect set or individual wear.',
    weight: 18,
    sizeWeights: { 'S': 16, 'M': 18, 'L': 20, 'XL': 22, '2XL': 24 },
    category: 'bottoms',
    style: 'pants',
    features: ['Premium cotton blend', 'Elastic waistband', 'Deep pockets'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_UIdJEjUUbpBMdS',
    name: "Men's Tank",
    description: 'Built for confidence and intentional living.',
    weight: 6.6,
    sizeWeights: { 'S': 4.2, 'M': 4.7, 'L': 5.4, 'XL': 5.6, '2XL': 6.3, '3XL': 6.6 },
    category: 'tops',
    style: 'tops',
    features: ['Relaxed fit', 'Breathable cotton blend'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_REPLACE_ME_women_racerback', 
    name: "Women's Racer Backs",
    description: 'Flattering athletic fit racerback for daily inspiration.',
    weight: 5,
    sizeWeights: { 'XS': 4, 'S': 4.5, 'M': 5, 'L': 5.5, 'XL': 6 },
    category: 'tops',
    style: 'tops',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_TlOJWnyFyQMC55',
    name: 'Zip-Up Hoodie',
    description: 'Classic heavy-duty zip hoodie for easy layering.',
    weight: 28,
    sizeWeights: { 'S': 24, 'M': 26, 'L': 28, 'XL': 30, '2XL': 32 },
    category: 'tops',
    style: 'hoodies',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_Tm0HnmbMNAV5Ab',
    name: 'Trucker Hat',
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
    name: 'Beanie',
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
    weight: 3,
    sizeWeights: { '0-3M': 2.5, '3-6M': 3, '6-12M': 3.5 },
    category: 'kids',
    style: 'onesies',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_REPLACE_ME_child_tee',
    name: "Children's Tee's",
    description: 'Durable and soft tees for the youth.',
    weight: 5,
    sizeWeights: { '2T': 4, '3T': 4.5, '4T': 5, '5T': 5.5, '6T': 6 },
    category: 'kids',
    style: 'tops',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_REPLACE_ME_child_hoodie',
    name: "Children's Hoodies",
    description: 'Warm and cozy hoodies for kids.',
    weight: 14,
    sizeWeights: { '2T': 10, '3T': 12, '4T': 14, '5T': 16, '6T': 18 },
    category: 'kids',
    style: 'hoodies',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_REPLACE_ME_child_jogger',
    name: "Children's Joggers",
    description: 'Comfortable joggers built for play.',
    weight: 10,
    sizeWeights: { '2T': 8, '3T': 9, '4T': 10, '5T': 11, '6T': 12 },
    category: 'kids',
    style: 'pants',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_REPLACE_ME_woven_patch_orig',
    name: 'Woven Patch Original',
    description: 'Signature original logo woven patch.',
    weight: 0.5,
    sizeWeights: { 'One Size': 0.5 },
    category: 'accessories',
    style: 'patches',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_REPLACE_ME_woven_patch_bw',
    name: 'Woven Patch Black & White',
    description: 'Signature black and white logo woven patch.',
    weight: 0.5,
    sizeWeights: { 'One Size': 0.5 },
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
