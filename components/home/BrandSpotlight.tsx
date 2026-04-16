'use client';

import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useStore } from '@/store/useStore';

const content = {
  en: {
    title: 'From Nature to Your Home',
    subtitle: 'Our Story',
    description: 'At Aivori, we believe that snacking should be both delicious and wholesome. We source the finest fruits and vegetables, using artisanal techniques to preserve their natural goodness and crunch. Every pack is a promise of quality and flavor.',
    cta: 'Learn More'
  },
  zh: {
    title: '从大自然到您的家',
    subtitle: '我们的故事',
    description: '在 Aivori，我们相信零食应该是美味且健康的。我们采购最优质的蔬菜和水果，采用传统工艺保留其天然营养和松脆感。每一包都是对品质和风味的承诺。',
    cta: '了解更多'
  },
  ms: {
    title: 'Dari Alam ke Rumah Anda',
    subtitle: 'Kisah Kami',
    description: 'Di Aivori, kami percaya bahawa snek haruslah lazat dan sihat. Kami mendapatkan buah-buahan dan sayur-sayuran terbaik, menggunakan teknik artisanal untuk mengekalkan kebaikan semulajadi dan kerangupannya. Setiap pek adalah janji kualiti dan rasa.',
    cta: 'Ketahui Lebih Lanjut'
  }
};

export default function BrandSpotlight() {
  const { language } = useStore();
  const t = content[language];

  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 relative w-full aspect-[4/3] lg:aspect-square rounded-[3rem] overflow-hidden shadow-2xl"
          >
            <Image
              src="https://i.imghippo.com/files/Nde6046PY.jpg" // Reusing a high quality banner image for now
              alt="Aivori Brand Story"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>

          {/* Text Side */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-8"
          >
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-theme-orange)]/10 text-[var(--color-theme-orange)] text-xs font-bold uppercase tracking-widest">
                {t.subtitle}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-theme-brown)] leading-tight">
                {t.title}
              </h2>
            </div>
            
            <p className="text-lg text-[var(--color-theme-brown)]/70 leading-relaxed font-medium">
              {t.description}
            </p>

            <div className="pt-4">
              <button className="foodie-button px-10 py-4 text-sm uppercase tracking-widest">
                {t.cta}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
