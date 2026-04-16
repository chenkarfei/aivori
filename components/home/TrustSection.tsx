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
    <section className="py-16 bg-white border-y border-[var(--color-theme-brown)]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-theme-beige)] flex items-center justify-center mb-6 group-hover:bg-[var(--color-theme-orange)] group-hover:text-white transition-all duration-500 transform group-hover:rotate-6 shadow-sm">
                <item.icon size={32} className="text-[var(--color-theme-green)] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-theme-brown)] mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--color-theme-brown)]/60 max-w-[200px] leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
