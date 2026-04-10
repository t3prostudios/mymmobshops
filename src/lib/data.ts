
import type { Product, Category } from '@/types';

/**
 * PRODUCT ENRICHMENT DATA
 * This file maps Stripe Product IDs to ounce-based weights and marketing features.
 * Stripe Metadata is the source of truth for stock; this file handles the shipping math.
 */
const products: Omit<Product, 'price' | 'stock'>[] = [
  {
    id: 'prod_RntFrszv6v06UK',
    name: 'Crew Neck T-shirt',
    description: 'Our signature heavy-weight cotton t-shirt.',
    weight: 8,
    sizeWeights: { 'S': 7.2, 'M': 8, 'L': 8.8, 'XL': 9.5, '2XL': 10.2, '3XL': 11 },
    category: 'tops',
    style: 'tops',
    features: ['100% Pre-shrunk Cotton', 'Double-needle stitching', 'Reactive dyed'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_UIdJEjUUbpBMdS',
    name: 'Original Logo Tank- Men',
    description: 'Built for comfort, style, and everyday wear. Featuring the signature MMOB logo, this tank represents confidence and intentional living.',
    weight: 6.6,
    sizeWeights: { 'S': 4.2, 'M': 4.7, 'L': 5.4, 'XL': 5.6, '2XL': 6.3, '3XL': 6.6 },
    category: 'tops',
    style: 'tops',
    features: ['Relaxed fit', 'Breathable cotton blend'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_TlO9hSyBakBOFx',
    name: 'Kids Jogger Set',
    description: 'Matching hoodie and joggers for the youth.',
    weight: 24,
    sizeWeights: { '2T': 18, '3T': 20, '4T': 22, '5T': 24, '6T': 26 },
    category: 'kids',
    style: 'sets',
    features: ['Soft fleece lining', 'Elastic waistband', 'Reinforced knees'],
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
    id: 'prod_TlO6VP6AOEeNLG',
    name: 'Graphic T-Shirt',
    description: 'Original MMOB graphic design.',
    weight: 7,
    sizeWeights: { 'S': 6, 'M': 7, 'L': 8, 'XL': 9, '2XL': 10 },
    category: 'tops',
    style: 'tops',
    features: ['Premium screen print', 'Soft-touch fabric'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_TlODI3lTFhwfQ6',
    name: 'Polo Shirt',
    description: 'Embroidered signature polo.',
    weight: 10,
    sizeWeights: { 'S': 9, 'M': 10, 'L': 11, 'XL': 12, '2XL': 13 },
    category: 'tops',
    style: 'shirts',
    features: ['Pique knit cotton', 'Classic fit'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_TlOIBgsfsOT6Ac',
    name: 'Chanel Patch Hoodie',
    description: 'Limited edition patch hoodie.',
    weight: 28,
    sizeWeights: { 'S': 24, 'M': 26, 'L': 28, 'XL': 30, '2XL': 32 },
    category: 'tops',
    style: 'hoodies',
    features: ['Hand-sewn patches', 'Heavyweight fleece'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_QJkM5qQWqY6LgS',
    name: 'Varsity Jacket',
    description: 'Premium wool and leather jacket.',
    weight: 45,
    sizeWeights: { 'S': 40, 'M': 45, 'L': 50, 'XL': 55, '2XL': 60 },
    category: 'tops',
    style: 'jackets',
    features: ['Wool body', 'Quilted lining'],
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_Tm0QG8bzkkDlr4',
    name: 'Womens V-Neck',
    description: 'Flattering contoured fit V-neck.',
    weight: 6,
    sizeWeights: { 'XS': 5, 'S': 5.5, 'M': 6, 'L': 6.5, 'XL': 7 },
    category: 'tops',
    style: 'tops',
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
    id: 'prod_TlO33CirJ52rIb',
    name: 'Adult joggers',
    description: 'Premium heavyweight joggers.',
    weight: 18,
    sizeWeights: { 'S': 16, 'M': 18, 'L': 20, 'XL': 22, '2XL': 24 },
    category: 'bottoms',
    style: 'pants',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_TlMHAxdwfVs5Td',
    name: 'Graphic hoodie',
    description: 'Original MMOB design on a soft fleece hoodie.',
    weight: 26,
    sizeWeights: { 'S': 22, 'M': 24, 'L': 26, 'XL': 28, '2XL': 30 },
    category: 'tops',
    style: 'hoodies',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_Tm0oaOc4TsZFrM',
    name: 'kids signature combo',
    description: 'The ultimate set for the youth.',
    weight: 20,
    sizeWeights: { '2T': 16, '3T': 18, '4T': 20, '5T': 22 },
    category: 'kids',
    style: 'sets',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_Tldd3U12TBS9Dj',
    name: 'beanie',
    description: 'Cozy knit beanie with embroidered logo.',
    weight: 3,
    sizeWeights: { 'One Size': 3 },
    category: 'hats',
    style: 'hats',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_TlOJWnyFyQMC55',
    name: 'zip up hoodie',
    description: 'Classic heavy-duty zip hoodie.',
    weight: 28,
    sizeWeights: { 'S': 24, 'M': 26, 'L': 28, 'XL': 30, '2XL': 32 },
    category: 'tops',
    style: 'hoodies',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_TlOIBgsfsOT6Ac_set',
    name: 'jogger set',
    description: 'Matching hoodie and jogger bundle.',
    weight: 48,
    sizeWeights: { 'S': 42, 'M': 45, 'L': 48, 'XL': 52, '2XL': 56 },
    category: 'bundles',
    style: 'sets',
    colors: [], sizes: [], images: []
  },
  {
    id: 'prod_TlOGmzr8l5CY3c',
    name: 'mmob belt',
    description: 'Signature designer belt.',
    weight: 6,
    sizeWeights: { 'One Size': 6 },
    category: 'accessories',
    style: 'belts',
    colors: [], sizes: [], images: []
  },
];

export { products as allProducts };

export function getCategories(): Category[] {
  return [
    { id: 'tops', name: 'Tops' },
    { id: 'bottoms', name: 'Bottoms' },
    { id: 'hats', name: 'Hats' },
    { id: 'bundles', name: 'Bundles' },
    { id: 'kids', name: 'Kids' },
    { id: 'accessories', name: 'Accessories' },
  ];
}
