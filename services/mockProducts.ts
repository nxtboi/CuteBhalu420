
import { Product, ProductCategory } from '../types';

export const mockProducts: Product[] = [
  {
    "id": "s001",
    "name": "Hybrid Paddy Seeds (1kg)",
    "category": ProductCategory.Seeds,
    "price": 350,
    "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
    "keywords": ["rice", "paddy", "dhaan", "chawal", "seeds", "beej"]
  },
  {
    "id": "s002",
    "name": "High-Yield Wheat Seeds (1kg)",
    "category": ProductCategory.Seeds,
    "price": 150,
    "image": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600",
    "keywords": ["wheat", "gehu", "seeds", "beej"]
  },
  {
    "id": "s003",
    "name": "Organic Vegetable Seeds Pack",
    "category": ProductCategory.Seeds,
    "price": 500,
    "image": "https://images.unsplash.com/photo-1591986475730-e37349d9709a?auto=format&fit=crop&q=80&w=600",
    "keywords": ["vegetable", "sabji", "tomato", "brinjal", "seeds", "beej", "organic"]
  },
   {
    "id": "s004",
    "name": "Maize/Corn Seeds (500g)",
    "category": ProductCategory.Seeds,
    "price": 220,
    "image": "https://images.unsplash.com/photo-1629822459737-29e017834515?auto=format&fit=crop&q=80&w=600",
    "keywords": ["maize", "corn", "makka", "bhutta", "seeds", "beej"]
  },
  {
    "id": "f001",
    "name": "Urea Fertilizer (45kg Bag)",
    "category": ProductCategory.Fertilizers,
    "price": 266,
    "image": "https://plus.unsplash.com/premium_photo-1661962692059-55d5a4319814?auto=format&fit=crop&q=80&w=600",
    "keywords": ["urea", "fertilizer", "khaad", "nitrogen"]
  },
  {
    "id": "f002",
    "name": "DAP Fertilizer (50kg Bag)",
    "category": ProductCategory.Fertilizers,
    "price": 1350,
    "image": "https://images.unsplash.com/photo-1615485925694-a69ea5bd3073?auto=format&fit=crop&q=80&w=600",
    "keywords": ["dap", "fertilizer", "khaad", "phosphate"]
  },
  {
    "id": "f003",
    "name": "Neem Oil Organic Pesticide (1L)",
    "category": ProductCategory.Fertilizers,
    "price": 800,
    "image": "https://images.unsplash.com/photo-1626202377307-e83c44519962?auto=format&fit=crop&q=80&w=600",
    "keywords": ["neem oil", "pesticide", "organic", "insecticide", "kitnashak"]
  },
  {
    "id": "f004",
    "name": "Potash Fertilizer (25kg)",
    "category": ProductCategory.Fertilizers,
    "price": 950,
    "image": "https://images.unsplash.com/photo-1611565022807-68b35639147e?auto=format&fit=crop&q=80&w=600",
    "keywords": ["potash", "fertilizer", "khaad", "mop"]
  },
  {
    "id": "t001",
    "name": "Manual Hand Plough",
    "category": ProductCategory.Tools,
    "price": 2500,
    "image": "https://images.unsplash.com/photo-1595133346597-29bd747a16b9?auto=format&fit=crop&q=80&w=600",
    "keywords": ["plough", "hal", "tool", "auzaar", "manual"]
  },
  {
    "id": "t002",
    "name": "Spade with Wooden Handle",
    "category": ProductCategory.Tools,
    "price": 450,
    "image": "https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&q=80&w=600",
    "keywords": ["spade", "fawda", "shovel", "tool", "auzaar"]
  },
  {
    "id": "t003",
    "name": "Battery Powered Knapsack Sprayer (16L)",
    "category": ProductCategory.Tools,
    "price": 3000,
    "image": "https://images.unsplash.com/photo-1632128711449-74404780516b?auto=format&fit=crop&q=80&w=600",
    "keywords": ["sprayer", "pump", "tool", "auzaar", "battery"]
  },
  {
    "id": "t004",
    "name": "Sickle for Harvesting",
    "category": ProductCategory.Tools,
    "price": 200,
    "image": "https://images.unsplash.com/photo-1589139366663-8a9d12975949?auto=format&fit=crop&q=80&w=600",
    "keywords": ["sickle", "darat", "hasuli", "tool", "auzaar", "harvesting"]
  },
  {
    "id": "i001",
    "name": "Drip Irrigation Kit (for 1 acre)",
    "category": ProductCategory.Irrigation,
    "price": 15000,
    "image": "https://images.unsplash.com/photo-1633519391054-08031d234674?auto=format&fit=crop&q=80&w=600",
    "keywords": ["drip", "irrigation", "sichai", "system", "pipe"]
  },
  {
    "id": "i002",
    "name": "Sprinkler System (Set of 5)",
    "category": ProductCategory.Irrigation,
    "price": 5000,
    "image": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=600",
    "keywords": ["sprinkler", "irrigation", "sichai", "system", "fawara"]
  },
  {
    "id": "i003",
    "name": "HDPE Lay Flat Pipe (100m)",
    "category": ProductCategory.Irrigation,
    "price": 4000,
    "image": "https://images.unsplash.com/photo-1520113825102-18eb2c161984?auto=format&fit=crop&q=80&w=600",
    "keywords": ["pipe", "irrigation", "sichai", "flat"]
  },
  {
    "id": "i004",
    "name": "1 HP Water Pump",
    "category": ProductCategory.Irrigation,
    "price": 6500,
    "image": "https://images.unsplash.com/photo-1574689049597-7e6df3e2b034?auto=format&fit=crop&q=80&w=600",
    "keywords": ["water pump", "motor", "irrigation", "sichai"]
  }
];

export const getProducts = async (term?: string, category?: ProductCategory | null): Promise<Product[]> => {
    return new Promise((resolve) => {
        setTimeout(() => { // Simulate network delay
            let results = mockProducts;
            if (category) {
                results = results.filter(p => p.category === category);
            }
            if (term) {
                const lowerTerm = term.toLowerCase();
                results = results.filter(
                    p => p.name.toLowerCase().includes(lowerTerm) || 
                         p.keywords.some(kw => kw.toLowerCase().includes(lowerTerm))
                );
            }
            resolve(results);
        }, 300);
    });
};
