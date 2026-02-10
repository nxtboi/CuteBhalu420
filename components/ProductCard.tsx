import React from 'react';
import { Product, LanguageCode } from '../types';
import translations from '../services/translations';
import { AmazonIcon, FlipkartIcon, IndiaMartIcon } from './icons/Icons';

interface ProductCardProps {
  product: Product;
  language: LanguageCode;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, language }) => {
    const t = (translations.shopPage as any)[language];
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(product.price);
    
    const handleSearchPlatform = (platform: 'indiamart' | 'amazon' | 'flipkart') => {
        const query = encodeURIComponent(product.name);
        let url = '';
        switch(platform) {
            case 'indiamart':
                url = `https://dir.indiamart.com/search.mp?ss=${query}`;
                break;
            case 'amazon':
                url = `https://www.amazon.in/s?k=${query}`;
                break;
            case 'flipkart':
                url = `https://www.flipkart.com/search?q=${query}`;
                break;
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="w-full h-48 bg-gray-100">
                <img 
                    src={product.image}
                    alt={product.name} 
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 flex-grow mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-green-700 font-bold text-xl">{formattedPrice}</p>
                 <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 mb-3 text-center font-medium uppercase tracking-wider">{t.shopOnlineTitle}</p>
                    <div className="flex items-center justify-around space-x-3">
                         <button 
                            onClick={() => handleSearchPlatform('amazon')}
                            className="flex-1 flex items-center justify-center py-2 px-2 border border-gray-200 rounded-md hover:bg-orange-50 hover:border-orange-200 transition-colors group"
                            aria-label="Search on Amazon"
                         >
                            <AmazonIcon className="h-6 w-auto opacity-80 group-hover:opacity-100" />
                         </button>
                          <button 
                            onClick={() => handleSearchPlatform('flipkart')}
                            className="flex-1 flex items-center justify-center py-2 px-2 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                            aria-label="Search on Flipkart"
                         >
                            <FlipkartIcon className="h-6 w-auto opacity-80 group-hover:opacity-100" />
                         </button>
                          <button 
                            onClick={() => handleSearchPlatform('indiamart')}
                            className="flex-1 flex items-center justify-center py-2 px-2 border border-gray-200 rounded-md hover:bg-green-50 hover:border-green-200 transition-colors group"
                            aria-label="Search on IndiaMART"
                         >
                            <IndiaMartIcon className="h-6 w-auto opacity-80 group-hover:opacity-100" />
                         </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductCard;