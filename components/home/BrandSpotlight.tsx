'use client';

import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useStore } from '@/store/useStore';

const content = {
  en: {
    title: 'From Nature to Your Home',
    subtitle: 'Our Story',
    description: 'At Aivori, we believe that snacking should be both delicious and wholesome. We source the finest fruits and vegetables, using carefully controlled preservation techniques to retain their natural goodness and crunch. Every pack is a promise of quality and flavor.',
    cta: 'Learn More'
  },
  zh: {
    title: '从大自然到您的家',
    subtitle: '我们的故事',
    description: '在 Aivori，我们相信零食既应该美味，也应该健康。我们精选最优质的水果和蔬菜，采用严格把控的保鲜技术，保留其天然的美味与酥脆口感。每一包都是我们对品质与风味的承诺。',
    cta: '了解更多'
  },
  ms: {
    title: 'Dari Alam ke Rumah Anda',
    subtitle: 'Kisah Kami',
    description: 'Di Aivori, kami percaya bahawa snek seharusnya lazat sekaligus menyihatkan. Kami memilih buah-buahan dan sayur-sayuran terbaik, menggunakan teknik pemeliharaan yang teliti dan terkawal untuk mengekalkan kebaikan semula jadi serta kerenyahannya. Setiap bungkusan adalah janji kami terhadap kualiti dan kelazatan.',
    cta: 'Ketahui Lebih Lanjut'
  }
};

export default function BrandSpotlight() {
  const { language } = useStore();
  const t = content[language];

  return (
    <section className="py-32 overflow-hidden relative bg-white">
      {/* Decorative Background Element */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[var(--color-theme-beige)]/30 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="flex-1 relative w-full aspect-[4/5] lg:aspect-[4/5] rounded-3xl lg:rounded-[3rem] overflow-hidden shadow-2xl group"
          >
            <Image
              src="https://i.imghippo.com/files/Nde6046PY.jpg"
              alt="Aivori Brand Story"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-theme-brown)]/40 to-transparent opacity-60" />
            
            {/* Floating Badge */}
            <div className="absolute bottom-12 left-12 right-12 p-8 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 text-white">
              <p className="text-[13px] font-serif italic opacity-90 leading-relaxed">
                &ldquo;{language === 'en' ? 'Crafting moments of joy through nature\'s finest snacks.' : language === 'zh' ? '通过大自然最优质的零食创造快乐时刻。' : 'Mencipta detik kegembiraan melalui snek terbaik alam semula jadi.'}&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 space-y-10"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-[1px] bg-[var(--color-theme-orange)]" />
                <span className="text-[var(--color-theme-orange)] text-sm font-bold uppercase tracking-[0.2em]">
                  {t.subtitle}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-theme-brown)] leading-[1.1] font-serif tracking-tight">
                {t.title}
              </h2>
            </div>
            
            <p className="text-lg text-[var(--color-theme-brown)]/70 leading-relaxed font-medium max-w-xl">
              {t.description}
            </p>

            <div className="pt-6 flex items-center gap-8">
              <button className="foodie-button px-12 py-5 text-sm uppercase tracking-[0.2em] shadow-xl shadow-[var(--color-theme-orange)]/20">
                {t.cta}
              </button>
              
              <div className="hidden sm:flex flex-col">
                <span className="text-2xl font-bold text-[var(--color-theme-brown)] font-serif">100%</span>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-theme-brown)]/50 font-bold">Natural Ingredients</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
