import { Product, ProductCategory } from '../types';

const mockProducts: Product[] = [
  // Seeds & Saplings
  {
    id: 's001',
    name: 'Hybrid Paddy Seeds (1kg)',
    category: ProductCategory.Seeds,
    price: 350,
    image: 'https://m.media-amazon.com/images/I/81Voy6TeZtL.jpg',
    keywords: ['rice', 'paddy', 'dhaan', 'chawal', 'seeds', 'beej'],
  },
  {
    id: 's002',
    name: 'High-Yield Wheat Seeds (1kg)',
    category: ProductCategory.Seeds,
    price: 150,
    image: 'https://m.media-amazon.com/images/I/714xCG6CxKL._AC_UF1000,1000_QL80_.jpg',
    keywords: ['wheat', 'gehu', 'seeds', 'beej'],
  },
  {
    id: 's003',
    name: 'Organic Vegetable Seeds Pack',
    category: ProductCategory.Seeds,
    price: 500,
    image: 'https://organicbazar.net/cdn/shop/files/45_vegetable_seed_kit_vegetables_seeds_organic_bazar_all_season_vegetable_seeds_seeds_kit_all_vegetable_seeds_kit.jpg?v=1755175866&width=1946',
    keywords: ['vegetable', 'sabji', 'tomato', 'brinjal', 'seeds', 'beej', 'organic'],
  },
   {
    id: 's004',
    name: 'Maize/Corn Seeds (500g)',
    category: ProductCategory.Seeds,
    price: 220,
    image: 'https://m.media-amazon.com/images/I/51+2yLB57CL._AC_UF1000,1000_QL80_.jpg',
    keywords: ['maize', 'corn', 'makka', 'bhutta', 'seeds', 'beej'],
  },

  // Fertilizers & Pesticides
  {
    id: 'f001',
    name: 'Urea Fertilizer (45kg Bag)',
    category: ProductCategory.Fertilizers,
    price: 266,
    image: 'https://www.chinatiftonfertilizer.com/uploads/e7ee1dab.jpg',
    keywords: ['urea', 'fertilizer', 'khaad', 'nitrogen'],
  },
  {
    id: 'f002',
    name: 'DAP Fertilizer (50kg Bag)',
    category: ProductCategory.Fertilizers,
    price: 1350,
    image: 'https://m.media-amazon.com/images/I/71xBf6iUG9L.jpg',
    keywords: ['dap', 'fertilizer', 'khaad', 'phosphate'],
  },
  {
    id: 'f003',
    name: 'Neem Oil Organic Pesticide (1L)',
    category: ProductCategory.Fertilizers,
    price: 800,
    image: 'https://m.media-amazon.com/images/I/71qSKV9deLL._AC_UF1000,1000_QL80_.jpg',
    keywords: ['neem oil', 'pesticide', 'organic', 'insecticide', 'kitnashak'],
  },
  {
    id: 'f004',
    name: 'Potash Fertilizer (25kg)',
    category: ProductCategory.Fertilizers,
    price: 950,
    image: 'https://m.media-amazon.com/images/I/51BFHgilwNL._AC_UF1000,1000_QL80_.jpg',
    keywords: ['potash', 'fertilizer', 'khaad', 'mop'],
  },

  // Farming Tools
  {
    id: 't001',
    name: 'Manual Hand Plough',
    category: ProductCategory.Tools,
    price: 2500,
    image: 'https://images.meesho.com/images/products/350938631/aezgf_512.webp?width=512',
    keywords: ['plough', 'hal', 'tool', 'auzaar', 'manual'],
  },
  {
    id: 't002',
    name: 'Spade with Wooden Handle',
    category: ProductCategory.Tools,
    price: 450,
    image: 'https://m.media-amazon.com/images/I/31iqrdQqF6L._AC_UF1000,1000_QL80_.jpg', 
    keywords: ['spade', 'fawda', 'shovel', 'tool', 'auzaar'],
  },
  {
    id: 't003',
    name: 'Battery Powered Knapsack Sprayer (16L)',
    category: ProductCategory.Tools,
    price: 3000,
    image: 'https://cdn.moglix.com/p/ub735gDIfXYX7-xxlarge.jpeg',
    keywords: ['sprayer', 'pump', 'tool', 'auzaar', 'battery'],
  },
  {
    id: 't004',
    name: 'Sickle for Harvesting',
    category: ProductCategory.Tools,
    price: 200,
    image: 'https://tiimg.tistatic.com/fp/1/008/297/500-grams-8-inches-mild-steel-wood-handle-agriculture-sickle-use-garden-broom-562.jpg',
    keywords: ['sickle', 'darat', 'hasuli', 'tool', 'auzaar', 'harvesting'],
  },

  // Irrigation Systems
  {
    id: 'i001',
    name: 'Drip Irrigation Kit (for 1 acre)',
    category: ProductCategory.Irrigation,
    price: 15000,
    image: 'https://m.media-amazon.com/images/I/81qS+0iTxTL._AC_UF1000,1000_QL80_.jpg',
    keywords: ['drip', 'irrigation', 'sichai', 'system', 'pipe'],
  },
  {
    id: 'i002',
    name: 'Sprinkler System (Set of 5)',
    category: ProductCategory.Irrigation,
    price: 5000,
    image: 'https://agri-route.com/cdn/shop/articles/wepik-2022513-9459.jpg?v=1687588095',
    keywords: ['sprinkler', 'irrigation', 'sichai', 'system', 'fawara'],
  },
  {
    id: 'i003',
    name: 'HDPE Lay Flat Pipe (100m)',
    category: ProductCategory.Irrigation,
    price: 4000,
    image: 'https://tiimg.tistatic.com/fp/1/007/377/40mm-hdpe-lay-flat-sprinkler-hose-water-pipes-60-mtr-lapeta--580.jpg',
    keywords: ['pipe', 'irrigation', 'sichai', 'flat'],
  },
  {
    id: 'i004',
    name: '1 HP Water Pump',
    category: ProductCategory.Irrigation,
    price: 6500,
    image: 'https://www.europumps.in/cdn/shop/files/04-Web_8498bb90-dd20-44d3-8a3e-6feee47deb24.jpg?v=1703350081',
    keywords: ['water pump', 'motor', 'irrigation', 'sichai'],
  },
];

export const searchProducts = (term: string, category: ProductCategory | null): Product[] => {
  const lowercasedTerm = term.toLowerCase();
  
  if (!lowercasedTerm && !category) {
    return mockProducts;
  }
  
  return mockProducts.filter(product => {
    const matchesCategory = category ? product.category === category : true;
    
    if (!matchesCategory) {
      return false;
    }

    if (lowercasedTerm) {
        return product.name.toLowerCase().includes(lowercasedTerm) ||
               product.keywords.some(kw => kw.toLowerCase().includes(lowercasedTerm));
    }

    return true; // Only category was selected
  });
};