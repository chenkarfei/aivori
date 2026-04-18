'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Leaf, PackageCheck, Thermometer } from 'lucide-react';
import { useStore } from '@/store/useStore';

const trustItems = {
  en: [
    { 
      icon: ShieldCheck, 
      title: 'Halal Certified', 
      desc: 'Strictly compliant with Halal standards', 
      color: 'bg-green-50', 
      iconColor: 'text-green-600', 
      hover: 'group-hover:bg-green-50/30 group-hover:border-green-200 group-hover:shadow-[0_20px_50px_rgba(34,197,94,0.1)]',
      iconBox: 'group-hover:bg-green-600'
    },
    { 
      icon: Leaf, 
      title: '100% Natural', 
      desc: 'No artificial preservatives or coloring', 
      color: 'bg-emerald-50', 
      iconColor: 'text-emerald-600', 
      hover: 'group-hover:bg-emerald-50/30 group-hover:border-emerald-200 group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)]',
      iconBox: 'group-hover:bg-emerald-600'
    },
    { 
      icon: PackageCheck, 
      title: 'Freshly Packed', 
      desc: 'Ensuring maximum crunch and flavor', 
      color: 'bg-orange-50', 
      iconColor: 'text-orange-600', 
      hover: 'group-hover:bg-orange-50/30 group-hover:border-orange-200 group-hover:shadow-[0_20px_50px_rgba(249,115,22,0.1)]',
      iconBox: 'group-hover:bg-orange-600'
    },
    { 
      icon: Thermometer, 
      title: 'Vacuum Technique', 
      desc: 'Crispy perfection via low-heat pressure', 
      color: 'bg-blue-50', 
      iconColor: 'text-blue-600', 
      hover: 'group-hover:bg-blue-50/30 group-hover:border-blue-200 group-hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)]',
      iconBox: 'group-hover:bg-blue-600'
    },
  ],
  zh: [
    { 
      icon: ShieldCheck, 
      title: '清真认证', 
      desc: '严格遵守清真标准', 
      color: 'bg-green-50', 
      iconColor: 'text-green-600', 
      hover: 'group-hover:bg-green-50/30 group-hover:border-green-200 group-hover:shadow-[0_20px_50px_rgba(34,197,94,0.1)]',
      iconBox: 'group-hover:bg-green-600'
    },
    { 
      icon: Leaf, 
      title: '100% 天然', 
      desc: '无人工防腐剂或色素', 
      color: 'bg-emerald-50', 
      iconColor: 'text-emerald-600', 
      hover: 'group-hover:bg-emerald-50/30 group-hover:border-emerald-200 group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)]',
      iconBox: 'group-hover:bg-emerald-600'
    },
    { 
      icon: PackageCheck, 
      title: '新鲜包装', 
      desc: '确保最佳的松脆度和风味', 
      color: 'bg-orange-50', 
      iconColor: 'text-orange-600', 
      hover: 'group-hover:bg-orange-50/30 group-hover:border-orange-200 group-hover:shadow-[0_20px_50px_rgba(249,115,22,0.1)]',
      iconBox: 'group-hover:bg-orange-600'
    },
    { 
      icon: Thermometer, 
      title: '真空技术', 
      desc: '低温压力，实现完美酥脆', 
      color: 'bg-blue-50', 
      iconColor: 'text-blue-600', 
      hover: 'group-hover:bg-blue-50/30 group-hover:border-blue-200 group-hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)]',
      iconBox: 'group-hover:bg-blue-600'
    },
  ],
  ms: [
    { 
      icon: ShieldCheck, 
      title: 'Disahkan Halal', 
      desc: 'Mematuhi piawaian Halal dengan ketat', 
      color: 'bg-green-50', 
      iconColor: 'text-green-600', 
      hover: 'group-hover:bg-green-50/30 group-hover:border-green-200 group-hover:shadow-[0_20px_50px_rgba(34,197,94,0.1)]',
      iconBox: 'group-hover:bg-green-600'
    },
    { 
      icon: Leaf, 
      title: '100% Semulajadi', 
      desc: 'Tiada pengawet atau pewarna tiruan', 
      color: 'bg-emerald-50', 
      iconColor: 'text-emerald-600', 
      hover: 'group-hover:bg-emerald-50/30 group-hover:border-emerald-200 group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)]',
      iconBox: 'group-hover:bg-emerald-600'
    },
    { 
      icon: PackageCheck, 
      title: 'Dibungkus Segar', 
      desc: 'Memastikan kerangupan dan rasa maksimum', 
      color: 'bg-orange-50', 
      iconColor: 'text-orange-600', 
      hover: 'group-hover:bg-orange-50/30 group-hover:border-orange-200 group-hover:shadow-[0_20px_50px_rgba(249,115,22,0.1)]',
      iconBox: 'group-hover:bg-orange-600'
    },
    { 
      icon: Thermometer, 
      title: 'Teknik Vakum', 
      desc: 'Kergangan sempurna melalui tekanan rendah', 
      color: 'bg-blue-50', 
      iconColor: 'text-blue-600', 
      hover: 'group-hover:bg-blue-50/30 group-hover:border-blue-200 group-hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)]',
      iconBox: 'group-hover:bg-blue-600'
    },
  ]
};

export default function TrustSection() {
  const { language } = useStore();
  const items = trustItems[language];

  return (
    <section className="py-16 bg-[#FAF9F6] relative overflow-hidden border-y border-[var(--color-theme-brown)]/5">
      {/* Organic Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--color-theme-orange)]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-theme-green)]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ 
                duration: 0.8, 
                delay: idx * 0.1,
                ease: "easeOut"
              }}
              className={`flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-white shadow-[0_10px_40px_rgba(93,64,55,0.03)] border border-[var(--color-theme-brown)]/5 transition-all duration-500 group ${item.hover}`}
            >
              {/* Artisanal Icon Container */}
              <motion.div 
                className="relative mb-6"
              >
                <div className={`absolute inset-0 ${item.color} rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500 ease-out opacity-60`} />
                <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-black/[0.03] flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-500 ease-out ${item.iconBox}`}>
                  <item.icon size={30} className={`${item.iconColor} group-hover:text-white transition-colors duration-500`} />
                </div>
              </motion.div>

              <h3 className="text-base sm:text-lg font-bold text-[var(--color-theme-brown)] mb-2 tracking-tight">
                {item.title}
              </h3>
              
              <p className="text-xs sm:text-sm text-[var(--color-theme-brown)]/60 max-w-[200px] leading-snug">
                {item.desc}
              </p>
              
              {/* Subtle decorative dot */}
              <div className="mt-4 w-1.5 h-1.5 bg-[var(--color-theme-orange)]/30 rounded-full group-hover:bg-[var(--color-theme-orange)] group-hover:scale-150 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
