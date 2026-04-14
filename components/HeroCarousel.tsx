'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const banners = [
  {
    id: 1,
    src: 'https://i.imghippo.com/files/Fbln6514euk.png',
    alt: 'Main Banner',
    showButton: false,
    link: null
  },
  {
    id: 2,
    src: 'https://i.imghippo.com/files/xVZ1774Ug.png',
    alt: 'Dragon Fruit Snacks',
    showButton: true,
    productName: 'Dragon Fruit',
    link: '/product/dragon-fruit' // Placeholder, will be updated by fetch
  },
  {
    id: 3,
    src: 'https://i.imghippo.com/files/NGxJ9968KCg.png',
    alt: 'Mixed Vegetable Snacks',
    showButton: true,
    productName: 'Mix Vege',
    link: '/product/mix-vege' // Placeholder, will be updated by fetch
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [productLinks, setProductLinks] = useState<Record<string, string>>({});
  const { language } = useStore();
  const router = useRouter();

  useEffect(() => {
    const fetchProductIds = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const links: Record<string, string> = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const nameEn = data.name?.en?.toLowerCase() || '';
          if (nameEn.includes('dragon fruit')) {
            links['Dragon Fruit'] = `/product/${doc.id}`;
          } else if (nameEn.includes('mix vege') || nameEn.includes('mixed vegetable')) {
            links['Mix Vege'] = `/product/${doc.id}`;
          }
        });
        setProductLinks(links);
      } catch (error) {
        console.error("Error fetching product IDs for carousel:", error);
      }
    };
    fetchProductIds();
  }, []);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + banners.length) % banners.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleShopNow = (banner: typeof banners[0]) => {
    if (banner.productName && productLinks[banner.productName]) {
      router.push(productLinks[banner.productName]);
    } else {
      const grid = document.getElementById('product-grid');
      grid?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden shadow-2xl group bg-[var(--color-theme-beige)]">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.8 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={banners[current].src}
            alt={banners[current].alt}
            fill
            className="object-cover blur-2xl scale-110 opacity-50"
            priority
            referrerPolicy="no-referrer"
          />
          <Image
            src={banners[current].src}
            alt={banners[current].alt}
            fill
            className="object-contain relative z-10"
            priority
            referrerPolicy="no-referrer"
          />
          
          {/* Subtle Side Blurs for smooth transition */}
          <div className="absolute inset-y-0 left-0 w-20 md:w-40 bg-gradient-to-r from-[var(--color-theme-beige)] via-transparent to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 md:w-40 bg-gradient-to-l from-[var(--color-theme-beige)] via-transparent to-transparent z-20 pointer-events-none" />
          
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 z-20 pointer-events-none" />
          
          {/* Interactive Shop Now Overlay */}
          {banners[current].showButton && (
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 md:left-auto md:right-[15%] md:translate-x-0 z-30">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,140,0,0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShopNow(banners[current])}
                className="flex items-center gap-3 px-8 py-3 md:px-10 md:py-4 bg-[var(--color-theme-orange)] text-white rounded-full font-bold text-sm md:text-lg shadow-2xl transition-all uppercase tracking-widest"
              >
                <ShoppingCart size={22} />
                {language === 'en' ? 'Shop Now' : language === 'zh' ? '立即购买' : 'Beli Sekarang'}
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={() => paginate(-1)}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={() => paginate(1)}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const newDir = i > current ? 1 : -1;
              setDirection(newDir);
              setCurrent(i);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              current === i ? 'bg-white w-8' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
