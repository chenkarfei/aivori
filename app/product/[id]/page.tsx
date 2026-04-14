'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/components/AuthProvider';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ShoppingCart, ShieldCheck, Weight, Info, Cookie, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { updateDoc } from 'firebase/firestore';

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
  en: { add: 'Add to Cart', outOfStock: 'Out of Stock', halal: 'Halal Certified', ingredients: 'Ingredients', description: 'Description', back: 'Back to Shop', available: 'Available in Stock', unavailable: 'Currently Unavailable' },
  zh: { add: '加入购物车', outOfStock: '缺货', halal: '清真认证', ingredients: '成分', description: '描述', back: '返回商店', available: '有现货', unavailable: '目前缺货' },
  ms: { add: 'Tambah ke Troli', outOfStock: 'Kehabisan Stok', halal: 'Disahkan Halal', ingredients: 'Bahan-bahan', description: 'Penerangan', back: 'Kembali ke Kedai', available: 'Stok Tersedia', unavailable: 'Tiada Stok' }
};

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateSuccess, setTranslateSuccess] = useState(false);
  const { language, addToCart, setIsCartOpen } = useStore();
  const { role } = useAuth();
  const t = translations[language];

  const handleInstantTranslate = async () => {
    if (!product || !id) return;
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      const prompt = `
        Translate the following product information from English to ${language === 'zh' ? 'Chinese (Simplified)' : 'Malay'}.
        Return the result as a JSON object with this structure:
        {
          "name": "...",
          "description": "...",
          "ingredients": "..."
        }

        Product Info:
        Name: ${product.name.en}
        Description: ${product.description.en}
        Ingredients: ${product.ingredients.en}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredients: { type: Type.STRING }
            }
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      const updatedProduct = {
        ...product,
        name: { ...product.name, [language]: result.name },
        description: { ...product.description, [language]: result.description },
        ingredients: { ...product.ingredients, [language]: result.ingredients }
      };

      await updateDoc(doc(db, 'products', id as string), updatedProduct);
      setProduct(updatedProduct);
      setTranslateSuccess(true);
      setTimeout(() => setTranslateSuccess(false), 3000);
    } catch (error) {
      console.error("Instant translation failed:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct(docSnap.data() as Product);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  const handleAddToCart = () => {
    if (!product) return;
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
          {language === 'en' ? 'Loading Snack Details...' : language === 'zh' ? '正在加载零食详情...' : 'Memuatkan Butiran Snek...'}
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[var(--color-theme-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--color-theme-brown)] hover:text-[var(--color-theme-orange)] transition-colors font-bold mb-12 group"
        >
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          {t.back}
        </button>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          {/* Product Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-5/12"
          >
            <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-[var(--color-theme-brown)]/10 border border-[var(--color-theme-brown)]/5 max-w-md mx-auto lg:max-w-none">
              {product.image ? (
                <Image 
                  src={product.image} 
                  alt={product.name[language]} 
                  fill 
                  className="object-cover" 
                  referrerPolicy="no-referrer"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 italic">No Image Available</div>
              )}
            </div>
          </motion.div>

          {/* Product Info Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-7/12 flex flex-col"
          >
            <div className="flex flex-wrap gap-3 mb-8 items-center">
              {product.isHalal && (
                <div className="flex items-center gap-2 bg-[var(--color-theme-green)] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
                  <ShieldCheck size={14} className="text-white" /> {t.halal}
                </div>
              )}
              <div className="flex items-center gap-2 bg-white text-[var(--color-theme-brown)] px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-[var(--color-theme-brown)]/5">
                <Weight size={14} className="text-[var(--color-theme-green)]" /> {product.weight}
              </div>

              {/* Admin Instant Translate Tool */}
              {role === 'admin' && language !== 'en' && !product.description[language] && (
                <button
                  onClick={handleInstantTranslate}
                  disabled={isTranslating}
                  className="flex items-center gap-2 bg-[var(--color-theme-orange)] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 animate-pulse"
                >
                  {isTranslating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : translateSuccess ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  {translateSuccess ? 'Translated!' : `AI Translate to ${language.toUpperCase()}`}
                </button>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-theme-brown)] mb-6 leading-tight">
              {product.name[language] || product.name['en']}
            </h1>
            
            <p className="text-2xl md:text-3xl font-bold text-[var(--color-theme-orange)] mb-10">
              RM {product.price.toFixed(2)}
            </p>

            <div className="space-y-10 mb-12">
              <section>
                <div className="flex items-center gap-2 text-[var(--color-theme-brown)]/40 mb-4">
                  <Info size={16} className="text-[var(--color-theme-green)]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">{t.description}</h3>
                </div>
                <p className="text-base font-medium leading-relaxed text-[var(--color-theme-brown)]/80">
                  {product.description[language] || product.description['en']}
                  {role === 'admin' && !product.description[language] && (
                    <span className="ml-2 inline-block px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase tracking-wider">
                      Admin: Missing {language.toUpperCase()} Translation
                    </span>
                  )}
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 text-[var(--color-theme-brown)]/40 mb-4">
                  <Cookie size={16} className="text-[var(--color-theme-green)]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest">{t.ingredients}</h3>
                </div>
                <p className="text-sm font-medium leading-relaxed text-[var(--color-theme-brown)]/60">
                  {product.ingredients[language] || product.ingredients['en']}
                  {role === 'admin' && !product.ingredients[language] && (
                    <span className="ml-2 inline-block px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase tracking-wider">
                      Admin: Missing {language.toUpperCase()} Translation
                    </span>
                  )}
                </p>
              </section>
            </div>

            <div className="mt-auto pt-8 border-t border-[var(--color-theme-brown)]/5">
              <button
                onClick={handleAddToCart}
                disabled={product.stockStatus === 'out_of_stock'}
                className="w-full foodie-button py-6 text-lg flex items-center justify-center gap-3 disabled:opacity-50 group"
              >
                <ShoppingCart className="group-hover:scale-110 transition-transform" />
                {product.stockStatus === 'in_stock' ? t.add : t.outOfStock}
              </button>
              
              <p className={`text-center mt-4 text-sm font-bold uppercase tracking-widest ${
                product.stockStatus === 'in_stock' ? 'text-[var(--color-theme-green)]' : 'text-[var(--color-theme-brown)]/30'
              }`}>
                {product.stockStatus === 'in_stock' ? t.available : t.unavailable}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
