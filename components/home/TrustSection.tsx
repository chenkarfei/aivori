'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Leaf, PackageCheck } from 'lucide-react';
import { useStore } from '@/store/useStore';

const trustItems = {
  en: [
    { icon: ShieldCheck, title: 'Halal Certified', desc: 'Strictly compliant with Halal standards' },
    { icon: Leaf, title: '100% Natural', desc: 'No artificial preservatives or coloring' },
    { icon: PackageCheck, title: 'Freshly Packed', desc: 'Ensuring maximum crunch and flavor' },
  ],
  zh: [
    { icon: ShieldCheck, title: '清真认证', desc: '严格遵守清真标准' },
    { icon: Leaf, title: '100% 天然', desc: '无人工防腐剂或色素' },
    { icon: PackageCheck, title: '新鲜包装', desc: '确保最佳的松脆度和风味' },
  ],
  ms: [
    { icon: ShieldCheck, title: 'Disahkan Halal', desc: 'Mematuhi piawaian Halal dengan ketat' },
    { icon: Leaf, title: '100% Semulajadi', desc: 'Tiada pengawet atau pewarna tiruan' },
    { icon: PackageCheck, title: 'Dibungkus Segar', desc: 'Memastikan kerangupan dan rasa maksimum' },
  ]
};

export default function TrustSection() {
  const { language } = useStore();
  const items = trustItems[language];

  return (
    <section className="py-24 bg-[#FAF9F6] relative overflow-hidden border-y border-[var(--color-theme-brown)]/5">
      {/* Organic Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-theme-orange)]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-theme-green)]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 1.2, 
                delay: idx * 0.15,
                ease: [0.16, 1, 0.3, 1] // Custom smooth quintic ease
              }}
              className="flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/50 transition-all duration-700 group"
            >
              {/* Artisanal Icon Container */}
              <motion.div 
                initial={{ scale: 0.8, rotate: -10 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15, 
                  delay: (idx * 0.15) + 0.2 
                }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 bg-[var(--color-theme-beige)] rounded-[2rem] rotate-6 group-hover:rotate-12 transition-transform duration-700 ease-out" />
                <div className="relative w-20 h-20 rounded-[1.8rem] bg-white flex items-center justify-center shadow-sm group-hover:bg-[var(--color-theme-orange)] group-hover:text-white transition-all duration-700 transform group-hover:-rotate-3 ease-out">
                  <item.icon size={36} className="text-[var(--color-theme-green)] group-hover:text-white transition-colors duration-700" />
                </div>
              </motion.div>

              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx * 0.15) + 0.3, duration: 0.8 }}
                className="text-xl font-bold text-[var(--color-theme-brown)] mb-3 tracking-tight font-serif"
              >
                {item.title}
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx * 0.15) + 0.4, duration: 0.8 }}
                className="text-base text-[var(--color-theme-brown)]/70 max-w-[240px] leading-relaxed"
              >
                {item.desc}
              </motion.p>
              
              {/* Subtle decorative line */}
              <motion.div 
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: (idx * 0.15) + 0.5, duration: 0.8 }}
                className="mt-6 w-8 h-1 bg-[var(--color-theme-orange)]/20 rounded-full group-hover:w-16 group-hover:bg-[var(--color-theme-orange)] transition-all duration-700 ease-out origin-center" 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
