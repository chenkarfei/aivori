'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { motion } from 'motion/react';
import { ShoppingCart, Search, ShieldCheck, Weight, Filter, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import HeroCarousel from '@/components/HeroCarousel';
import TrustSection from '@/components/home/TrustSection';
import BrandSpotlight from '@/components/home/BrandSpotlight';

interface Product {
  id: string;
  price: number;
  image: string;
  weight: string;
  isHalal: boolean;
  stockStatus: 'in_stock' | 'out_of_stock';
  name: { en: string; zh: string; ms: string };
  description: { en: string; zh: string; ms: string };
  ingredients: { en: string; zh: string; ms: string };
}

const translations = {
  en: { 
    add: 'Add to Cart', 
    outOfStock: 'Out of Stock', 
    halal: 'Halal', 
    viewDetails: 'View Details', 
    inStock: 'In Stock',
    searchPlaceholder: 'Search for yummy snacks...',
    suggestTitle: 'Suggestions',
    allProducts: 'All Collections',
    filterBy: 'Filter By',
    noResults: 'No snacks found matching your search.'
  },
  zh: { 
    add: '加入购物车', 
    outOfStock: '缺货', 
    halal: '清真', 
    viewDetails: '查看详情', 
    inStock: '有现货',
    searchPlaceholder: '搜索美味零食...',
    suggestTitle: '建议',
    allProducts: '所有系列',
    filterBy: '筛选',
    noResults: '未找到符合您搜索的零食。'
  },
  ms: { 
    add: 'Tambah ke Troli', 
    outOfStock: 'Kehabisan Stok', 
    halal: 'Halal', 
    viewDetails: 'Lihat Butiran', 
    inStock: 'Stok Tersedia',
    searchPlaceholder: 'Cari snek sedap...',
    suggestTitle: 'Cadangan',
    allProducts: 'Semua Koleksi',
    filterBy: 'Tapis Mengikut',
    noResults: 'Tiada snek dijumpai sepadan dengan carian anda.'
  }
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'halal' | 'in_stock'>('all');
  
  const { language, addToCart, setIsCartOpen } = useStore();
  const t = translations[language];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const prods: Product[] = [];
        querySnapshot.forEach((doc) => {
          prods.push(doc.data() as Product);
        });
        setProducts(prods);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name[language]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.name['en']?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' ? true :
                         activeFilter === 'halal' ? product.isHalal :
                         activeFilter === 'in_stock' ? product.stockStatus === 'in_stock' : true;
    
    return matchesSearch && matchesFilter;
  });

  const suggestions = searchTerm.length > 1 
    ? products
        .filter(p => (p.name[language] || p.name['en']).toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5)
    : [];

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
    setIsCartOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--color-theme-orange)] border-t-transparent rounded-full animate-spin"></div>
        <div className="font-bold text-xl text-[var(--color-theme-orange)]">
          {language === 'en' ? 'Loading Yummy Snacks...' : language === 'zh' ? '正在加载美味零食...' : 'Memuatkan Snek Sedap...'}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Hero Carousel Section - Full Bleed */}
      <HeroCarousel />

      {/* Trust Section */}
      <TrustSection />

      {/* Brand Spotlight */}
      <BrandSpotlight />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-theme-brown)] mb-4">
            {t.allProducts}
          </h2>
          <div className="w-20 h-1.5 bg-[var(--color-theme-orange)] mx-auto rounded-full mb-12" />

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within:text-[var(--color-theme-orange)] transition-colors">
                <Search size={22} className="opacity-40" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-white/60 backdrop-blur-xl border-2 border-transparent focus:border-[var(--color-theme-orange)]/30 focus:bg-white rounded-3xl py-5 pl-14 pr-14 text-lg font-medium outline-none transition-all shadow-xl shadow-[var(--color-theme-brown)]/5"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-5 flex items-center text-[var(--color-theme-brown)] opacity-40 hover:opacity-100 transition-opacity"
                >
                  <X size={22} />
                </button>
              )}

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 right-0 top-full mt-3 bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-[var(--color-theme-brown)]/5 p-4 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-[var(--color-theme-brown)]/5 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{t.suggestTitle}</span>
                      </div>
                      <div className="space-y-1">
                        {suggestions.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSearchTerm(p.name[language] || p.name['en']);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-2xl flex items-center gap-4 hover:bg-[var(--color-theme-orange)]/5 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0">
                              <Image src={p.image} alt="" fill className="object-cover" />
                            </div>
                            <div className="flex-grow">
                              <p className="font-bold text-[var(--color-theme-brown)] group-hover:text-[var(--color-theme-orange)] transition-colors">
                                {p.name[language] || p.name['en']}
                              </p>
                              <p className="text-xs font-bold text-[var(--color-theme-brown)] opacity-40">RM {p.price.toFixed(2)}</p>
                            </div>
                            <Search size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setActiveFilter('all')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all border-2 ${
                  activeFilter === 'all'
                    ? 'bg-[var(--color-theme-brown)] border-[var(--color-theme-brown)] text-white'
                    : 'bg-white/40 border-transparent hover:border-[var(--color-theme-brown)]/10 text-[var(--color-theme-brown)]'
                }`}
              >
                <Filter size={14} />
                {language === 'en' ? 'All' : language === 'zh' ? '全部' : 'Semua'}
              </button>
              <button
                onClick={() => setActiveFilter('halal')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all border-2 ${
                  activeFilter === 'halal'
                    ? 'bg-[var(--color-theme-green)] border-[var(--color-theme-green)] text-white'
                    : 'bg-white/40 border-transparent hover:border-[var(--color-theme-green)]/30 text-[var(--color-theme-brown)]'
                }`}
              >
                <ShieldCheck size={14} />
                {t.halal}
              </button>
              <button
                onClick={() => setActiveFilter('in_stock')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all border-2 ${
                  activeFilter === 'in_stock'
                    ? 'bg-[var(--color-theme-orange)] border-[var(--color-theme-orange)] text-white'
                    : 'bg-white/40 border-transparent hover:border-[var(--color-theme-orange)]/30 text-[var(--color-theme-brown)]'
                }`}
              >
                <Weight size={14} />
                {t.inStock}
              </button>
            </div>
          </div>
        </div>
        
        {/* Product Grid - Compact Layout */}
        <div id="product-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, idx) => (
              <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col h-full group"
            >
              <div 
                className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden mb-4 cursor-pointer bg-white shadow-lg shadow-[var(--color-theme-brown)]/5"
              >
                {product.image ? (
                  <Image 
                    src={product.image} 
                    alt={product.name[language]} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif italic text-xs">Aivori Selection</div>
                )}

                {/* Hover Overlay with Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-row items-center justify-center gap-4 p-4">
                  <Link 
                    href={`/product/${product.id}`}
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[var(--color-theme-brown)] hover:bg-[var(--color-theme-orange)] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg"
                    title={t.viewDetails}
                  >
                    <Search size={20} />
                  </Link>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={product.stockStatus === 'out_of_stock'}
                    className="w-12 h-12 bg-[var(--color-theme-orange)] rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t.add}
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
                
                {/* Refined Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                  {product.isHalal && (
                    <div className="bg-[var(--color-theme-green)] text-white foodie-badge shadow-sm text-[10px] py-1 px-2">
                      {t.halal}
                    </div>
                  )}
                  <div className="bg-white/90 backdrop-blur-md text-[var(--color-theme-brown)] foodie-badge shadow-sm text-[10px] py-1 px-2">
                    {product.weight}
                  </div>
                </div>
              </div>
              
              <div className="flex-grow flex flex-col px-1">
                <Link href={`/product/${product.id}`}>
                  <h2 className="text-lg font-bold mb-1.5 cursor-pointer hover:text-[var(--color-theme-orange)] transition-colors leading-tight">
                    {product.name[language] || product.name['en']}
                  </h2>
                </Link>
                
                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className="text-xl font-bold text-[var(--color-theme-brown)]">RM {product.price.toFixed(2)}</span>
                  <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                    product.stockStatus === 'in_stock' 
                      ? 'text-[var(--color-theme-green)] bg-[var(--color-theme-green)]/10 border border-[var(--color-theme-green)]/20' 
                      : 'text-red-600 bg-red-50 border border-red-100'
                  }`}>
                    {product.stockStatus === 'in_stock' ? t.inStock : t.outOfStock}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[var(--color-theme-brown)]/5">
              <Search size={40} className="text-[var(--color-theme-brown)] opacity-10" />
            </div>
            <p className="text-xl font-bold text-[var(--color-theme-brown)] opacity-60">
              {t.noResults}
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
