import React, { useState, useMemo } from 'react';
import { LanguageCode, ProductCategory, Product } from '../types';
import translations from '../services/translations';
import { searchProducts } from '../services/mockProducts';
import ProductCard from './ProductCard';

interface ShopPageProps {
  language: LanguageCode;
}

const ShopPage: React.FC<ShopPageProps> = ({ language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  
  const t = (translations.shopPage as any)[language];
  const t_categories = t.categories;
  
  const categories = Object.keys(t_categories) as ProductCategory[];

  const filteredProducts = useMemo(() => {
    return searchProducts(searchTerm, selectedCategory);
  }, [searchTerm, selectedCategory]);
  
  const handleCategoryClick = (category: ProductCategory) => {
    setSelectedCategory(prev => prev === category ? null : category);
    setSearchTerm(''); // Clear search when category changes
  };

  return (
    <div className="p-4 md:p-8 bg-inherit h-full">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedCategory(null); // Clear category filter when searching
            }}
            placeholder={t.searchPlaceholder}
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-lime-500 focus:border-lime-500 shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className={`p-4 rounded-lg text-center font-semibold transition-all shadow-md ${
                        selectedCategory === category
                            ? 'bg-lime-700 text-white ring-2 ring-lime-800'
                            : 'bg-white text-gray-800 hover:bg-lime-100 hover:-translate-y-1'
                        }`}
                    >
                        {t_categories[category]}
                    </button>
                ))}
            </div>
        </div>

        {/* Product Grid */}
        <div>
            {filteredProducts.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} language={language} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">{t.noResults}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;